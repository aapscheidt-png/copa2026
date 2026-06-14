exports.handler = async function(event) {
  const dates = event.queryStringParameters && event.queryStringParameters.dates
    ? String(event.queryStringParameters.dates).replace(/[^0-9]/g, "")
    : "";
  const url = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard" + (dates ? `?dates=${dates}` : "");

  try {
    const response = await fetch(url, {
      headers: {
        "accept": "application/json",
        "user-agent": "Mozilla/5.0 Copa2026-App"
      }
    });

    const text = await response.text();

    return {
      statusCode: response.status,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, max-age=20",
        "access-control-allow-origin": "*"
      },
      body: text
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "access-control-allow-origin": "*"
      },
      body: JSON.stringify({ error: "ESPN proxy failed", message: error.message })
    };
  }
};
