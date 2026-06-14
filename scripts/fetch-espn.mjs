import fs from "node:fs/promises";
import path from "node:path";

const OUT = "data/espn-scoreboard.json";
const START = new Date("2026-06-11T00:00:00Z");
const END = new Date("2026-07-20T00:00:00Z");

function ymd(d) {
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

function clampDates() {
  const now = new Date();
  const upper = now < END ? addDays(now, 1) : END;
  const dates = [];

  for (let d = new Date(START); d <= upper; d = addDays(d, 1)) {
    dates.push(ymd(d));
  }

  return dates;
}

async function getJson(url) {
  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "Copa2026-GitHubPages-Auto"
    }
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${url}`);
  }

  return await res.json();
}

const events = [];
const summaries = {};
const dates = clampDates();

for (const date of dates) {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${date}&limit=200`;
    const data = await getJson(url);

    if (Array.isArray(data.events)) {
      for (const ev of data.events) {
        if (!events.find(e => String(e.id) === String(ev.id))) {
          events.push(ev);
        }
      }
    }
  } catch (e) {
    console.warn("scoreboard failed", date, e.message);
  }
}

const active = events
  .filter(e => {
    const state = e?.status?.type?.state || "";
    return state !== "pre";
  })
  .slice(-40);

for (const ev of active) {
  try {
    const summary = await getJson(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${ev.id}`
    );

    summaries[String(ev.id)] = summary;
  } catch (e) {
    console.warn("summary failed", ev.id, e.message);
  }
}

await fs.mkdir(path.dirname(OUT), { recursive: true });

await fs.writeFile(
  OUT,
  JSON.stringify(
    {
      updatedAt: new Date().toISOString(),
      source: "ESPN public scoreboard via GitHub Actions",
      dates,
      eventCount: events.length,
      summaryCount: Object.keys(summaries).length,
      events,
      summaries
    },
    null,
    2
  ) + "\n"
);

console.log(
  `Wrote ${OUT}: ${events.length} events, ${Object.keys(summaries).length} summaries`
);
