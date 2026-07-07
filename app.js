// COPA DO MUNDO 2026 - app.js - by Pscheidt
// APIs: worldcup26.ir (live scores/groups) + openfootball (goals/cards) + football-data.org (scorers)
// No hardcoded scores. 100% online.

const WC  = "https://worldcup26.ir";
const OFB = "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";
const FD  = "https://api.football-data.org/v4";
const ESPN = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world";
const FDK = "86cb611164f348ac89dcc715dda20f92";

// V12 - Camada única complementar
const DATA = window.COPA_DATA || {events:[], liveMatches:{}, disciplineTeamTotals:{}, favorites:["Brazil"], teamProfiles:{}};

function dataEvents(matchValue=null,type=null){
  let arr=DATA.events||[];
  if(matchValue) arr=arr.filter(e=>e.match===matchValue);
  if(type) arr=arr.filter(e=>e.type===type);
  return arr;
}
function dataLive(matchValue){return (DATA.liveMatches||{})[matchValue]||null;}
function dataTeamTotal(team){
  const totals=DATA.disciplineTeamTotals||{};
  const key=Object.keys(totals).find(k=>nm(k,team));
  return key?totals[key]:null;
}


const FL={"Mexico":"🇲🇽","South Africa":"🇿🇦","South Korea":"🇰🇷","Czechia":"🇨🇿","Czech Republic":"🇨🇿","Canada":"🇨🇦","Bosnia and Herzegovina":"🇧🇦","Bosnia":"🇧🇦","Qatar":"🇶🇦","Switzerland":"🇨🇭","Brazil":"🇧🇷","Morocco":"🇲🇦","Haiti":"🇭🇹","Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","Australia":"🇦🇺","Türkiye":"🇹🇷","Turkey":"🇹🇷","United States":"🇺🇸","Paraguay":"🇵🇾","Germany":"🇩🇪","Curacao":"🇨🇼","Curaçao":"🇨🇼","Netherlands":"🇳🇱","Japan":"🇯🇵","Ivory Coast":"🇨🇮","Côte d'Ivoire":"🇨🇮","Ecuador":"🇪🇨","Sweden":"🇸🇪","Tunisia":"🇹🇳","Spain":"🇪🇸","Cape Verde":"🇨🇻","Belgium":"🇧🇪","Egypt":"🇪🇬","Saudi Arabia":"🇸🇦","Uruguay":"🇺🇾","Iran":"🇮🇷","New Zealand":"🇳🇿","Austria":"🇦🇹","Jordan":"🇯🇴","France":"🇫🇷","Senegal":"🇸🇳","Iraq":"🇮🇶","Norway":"🇳🇴","Argentina":"🇦🇷","Algeria":"🇩🇿","Portugal":"🇵🇹","DR Congo":"🇨🇩","Congo DR":"🇨🇩","England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Croatia":"🇭🇷","Ghana":"🇬🇭","Panama":"🇵🇦","Uzbekistan":"🇺🇿","Colombia":"🇨🇴","Korea Republic":"🇰🇷"};
const PT={"Mexico":"México","South Africa":"África do Sul","South Korea":"Coreia do Sul","Czechia":"Tchéquia","Czech Republic":"Tchéquia","Canada":"Canadá","Bosnia and Herzegovina":"Bósnia-Herz.","Bosnia":"Bósnia-Herz.","Qatar":"Catar","Switzerland":"Suíça","Brazil":"Brasil","Morocco":"Marrocos","Haiti":"Haiti","Scotland":"Escócia","Australia":"Austrália","Türkiye":"Turquia","Turkey":"Turquia","United States":"EUA","Paraguay":"Paraguai","Germany":"Alemanha","Curacao":"Curaçao","Curaçao":"Curaçao","Netherlands":"Países Baixos","Japan":"Japão","Ivory Coast":"Costa do Marfim","Côte d'Ivoire":"Costa do Marfim","Ecuador":"Equador","Sweden":"Suécia","Tunisia":"Tunísia","Spain":"Espanha","Cape Verde":"Cabo Verde","Belgium":"Bélgica","Egypt":"Egito","Saudi Arabia":"Arábia Saudita","Uruguay":"Uruguai","Iran":"Irã","New Zealand":"Nova Zelândia","Austria":"Áustria","Jordan":"Jordânia","France":"França","Senegal":"Senegal","Iraq":"Iraque","Norway":"Noruega","Argentina":"Argentina","Algeria":"Argélia","Portugal":"Portugal","DR Congo":"RD Congo","Congo DR":"RD Congo","England":"Inglaterra","Croatia":"Croácia","Ghana":"Gana","Panama":"Panamá","Uzbekistan":"Uzbequistão","Colombia":"Colômbia","Korea Republic":"Coreia do Sul"};
const fl=n=>FL[n]||"🏳️";
const pt=n=>PT[n]||n;
function canon(n){
  return String(n||"")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g," ").trim()
    .replace(/^usa$/,"united states")
    .replace(/^us$/,"united states")
    .replace(/^u s a$/,"united states")
    .replace(/^czech republic$/,"czechia")
    .replace(/^korea republic$/,"south korea")
    .replace(/^republic of korea$/,"south korea")
    .replace(/^turkey$/,"turkiye")
    .replace(/^cote d ivoire$/,"ivory coast")
    .replace(/^congo dr$/,"dr congo")
    .replace(/^drc$/,"dr congo")
    .replace(/^brasil$/,"brazil");
}
function nm(a,b){return !!a&&!!b&&canon(a)===canon(b);}
function matchKey(h,a){return `${canon(h)}|${canon(a)}`;}

let WC_GAMES=[],WC_GROUPS=[],WC_SCORERS=[],OFB_DATA=null,FD_SC=[],ESPN_GAMES=[],ESPN_SUMMARIES={};
let wcOk=false,ofbOk=false,fdOk=false,espnOk=false;
const FALLBACK_RESULTS={};
const EVENT_OVERRIDES={};
let curPage="jogos",curFilter="all";
let modalId=null,modalTmr=null;

const todayStr=()=>{const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
const isToday=d=>d&&d.startsWith(todayStr());
function fmtD(d){if(!d)return"";const dt=new Date(d+"T12:00:00");const wd=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];const mo=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago"];const tod=isToday(d)?'<span class="today-lbl"> — HOJE</span>':"";return`${wd[dt.getDay()]}, ${dt.getDate()} ${mo[dt.getMonth()]}${tod}`;}
function utcBRT(s){if(!s)return{date:"",time:""};const dt=new Date(s);const brt=new Date(dt.getTime()-3*3600000);const date=`${brt.getFullYear()}-${String(brt.getMonth()+1).padStart(2,"0")}-${String(brt.getDate()).padStart(2,"0")}`;const time=`${String(brt.getHours()).padStart(2,"0")}:${String(brt.getMinutes()).padStart(2,"0")}`;return{date,time};}
function estMin(d,t){if(!d||!t)return null;const[h,m]=t.split(":").map(Number);const kick=new Date(d+"T12:00:00");kick.setHours(h,m,0);const el=Math.floor((new Date()-kick)/60000);if(el<0)return null;if(el<=45)return Math.min(el,45);if(el<=60)return 45;if(el<=105)return Math.min(el-15,90);return 90;}
function isHT(d,t){if(!d||!t)return false;const[h,m]=t.split(":").map(Number);const k=new Date(d+"T12:00:00");k.setHours(h,m,0);const el=Math.floor((new Date()-k)/60000);return el>45&&el<=60;}
const liveCount=()=>F.filter(m=>mSt(m)==="live").length;

async function fetchWCGames(){
  try{
    const r=await fetch(WC+"/get/games",{signal:AbortSignal.timeout(9000)});
    if(!r.ok)throw 0;
    const d=await r.json();
    const games=d.games||d||[];
    WC_GAMES=games.map(g=>{
      const{date,time}=utcBRT(g.local_date||g.date);
      const te=(g.time_elapsed||"").toLowerCase();
      let st="upcoming";
      if(g.finished==="TRUE"||g.finished===true||te==="fulltime"||te==="ft")st="finished";
      else if(te&&te!=="notstarted"&&te!=="")st="live";
      else if(date&&date<todayStr())st="finished";
      return{...g,_date:date,_time:time,_st:st,_min:te==="ht"?"Intervalo":/^\d+/.test(te)?te+"'":null};
    });
    wcOk=true;
  }catch(e){console.warn("WC:",e);wcOk=false;}
}
async function fetchWCGroups(){try{const r=await fetch(WC+"/get/groups",{signal:AbortSignal.timeout(9000)});if(!r.ok)throw 0;const d=await r.json();WC_GROUPS=d.groups||d||[];}catch(e){console.warn("WCG:",e);}}
async function fetchWCScorers(){try{const r=await fetch(WC+"/get/scorers",{signal:AbortSignal.timeout(9000)});if(!r.ok)throw 0;const d=await r.json();WC_SCORERS=d.scorers||d||[];}catch(e){WC_SCORERS=[];}}
async function fetchOFB(){try{const r=await fetch(OFB,{signal:AbortSignal.timeout(9000)});if(!r.ok)throw 0;OFB_DATA=await r.json();ofbOk=true;}catch(e){console.warn("OFB:",e);ofbOk=false;}}
async function fetchFD(){try{const r=await fetch(FD+"/competitions/WC/scorers?season=2026&limit=20",{headers:{"X-Auth-Token":FDK},signal:AbortSignal.timeout(9000)});if(!r.ok)throw 0;const d=await r.json();FD_SC=d.scorers||[];fdOk=true;}catch(e){fdOk=false;}}
async function fetchESPN(){
  try{
    ESPN_GAMES=[]; ESPN_SUMMARIES={};
    const ds=todayStr().replaceAll("-","");
    const r=await fetch(`${ESPN}/scoreboard?dates=${ds}&limit=200`,{signal:AbortSignal.timeout(9000)});
    if(r.ok){const d=await r.json(); ESPN_GAMES=d.events||[];}
    const active=ESPN_GAMES.filter(e=>(e.status?.type?.state||"")!=="pre").slice(0,12);
    await Promise.all(active.map(async e=>{try{const r=await fetch(`${ESPN}/summary?event=${e.id}`,{signal:AbortSignal.timeout(7000)});if(r.ok)ESPN_SUMMARIES[e.id]=await r.json();}catch(_){}}));
    espnOk=ESPN_GAMES.length>0;
  }catch(e){console.warn("ESPN:",e);espnOk=false;}
}


function wcGame(h,a){return WC_GAMES.find(g=>nm(g.home_team_name_en||g.home_team,h)&&nm(g.away_team_name_en||g.away_team,a));}
function ofbMatch(h,a){if(!OFB_DATA||!OFB_DATA.matches)return null;return OFB_DATA.matches.find(m=>(nm(m.team1,h)&&nm(m.team2,a))||(nm(m.team1,a)&&nm(m.team2,h)));}
function espnCompetitors(e){return e?.competitions?.[0]?.competitors||[];}
function espnTeamName(c){return c?.team?.displayName||c?.team?.name||c?.team?.shortDisplayName||c?.team?.abbreviation||"";}
function espnGame(h,a){return ESPN_GAMES.find(e=>{const cs=espnCompetitors(e).map(espnTeamName);return cs.some(n=>nm(n,h))&&cs.some(n=>nm(n,a));})||null;}
function espnScoreFor(e,team){const c=espnCompetitors(e).find(c=>nm(espnTeamName(c),team));return c&&c.score!==undefined?c.score:null;}
function espnState(e){const st=e?.status?.type?.state||"pre";if(st==="in")return"live";if(st==="post")return"finished";return"upcoming";}
function espnMinute(e){const s=e?.status||{};const txt=s.displayClock||s.type?.detail||s.type?.shortDetail||"";if(!txt)return"";if(/half/i.test(txt)||/^ht$/i.test(txt))return"Intervalo";return String(txt).replace("\u0000","").trim();}
function matchKick(m){const[h,mi]=(m.t||"00:00").split(":").map(Number);const kick=new Date(m.d+"T12:00:00");kick.setHours(h||0,mi||0,0,0);return kick;}

// ============================
// V16 GITHUB PAGES AUTO
// Fonte automática gratuita.
// O GitHub Actions atualiza data/espn-scoreboard.json de forma automática.
// O app lê esse JSON local para evitar CORS e não depender de Netlify.
// ============================
let ESPN_EVENTS = [];

async function espnFetchJson(url){
  const attempts = [
    url,
    "https://api.allorigins.win/raw?url=" + encodeURIComponent(url)
  ];

  for(const u of attempts){
    try{
      const r = await fetch(u,{cache:"no-store",signal:AbortSignal.timeout(9000)});
      if(!r.ok)continue;
      return await r.json();
    }catch(e){}
  }
  return null;
}

function espnDatesToFetchV18(){
  const start=new Date("2026-06-11T12:00:00");
  const end=new Date();
  end.setDate(end.getDate()+1);
  const out=[];
  for(let d=new Date(start); d<=end; d.setDate(d.getDate()+1)){
    const y=d.getFullYear();
    const m=String(d.getMonth()+1).padStart(2,"0");
    const day=String(d.getDate()).padStart(2,"0");
    out.push(`${y}${m}${day}`);
  }
  return out.slice(-35);
}


const ESPN_CACHE_KEY_V22="copa2026_data_v8";
let espnCacheUsedV22=false;

function saveEspnCacheV22(){
  try{
    localStorage.setItem(ESPN_CACHE_KEY_V22,JSON.stringify({
      savedAt:Date.now(),
      events:ESPN_EVENTS,
      summaries:ESPN_SUMMARIES
    }));
  }catch(e){}
}

function loadEspnCacheV22(){
  try{
    const raw=localStorage.getItem(ESPN_CACHE_KEY_V22);
    if(!raw)return false;
    const c=JSON.parse(raw);
    if(!c||!Array.isArray(c.events)||!c.events.length)return false;
    ESPN_EVENTS=c.events||[];
    ESPN_SUMMARIES=c.summaries||{};
    espnOk=true;
    espnCacheUsedV22=true;
    return true;
  }catch(e){return false;}
}

async function mapLimitV22(items,limit,worker){
  const out=[];
  let cursor=0;
  async function run(){
    while(cursor<items.length){
      const i=cursor++;
      try{out[i]=await worker(items[i],i);}catch(e){out[i]=null;}
    }
  }
  await Promise.all(Array.from({length:Math.min(limit,items.length||1)},run));
  return out;
}

async function fetchStaticESPN(){
  // Mantém o último conjunto completo visível enquanto a atualização acontece.
  if(!ESPN_EVENTS.length)loadEspnCacheV22();

  const dates=espnDatesToFetchV18();
  const freshEvents=[];

  // Primeiro tenta uma consulta por intervalo, muito mais rápida que uma data por vez.
  const first=dates[0], last=dates[dates.length-1];
  const range=await espnFetchJson(`${ESPN}/scoreboard?dates=${first}-${last}&limit=300`);

  if(range&&Array.isArray(range.events)){
    range.events.forEach(ev=>{
      if(!freshEvents.find(x=>String(x.id)===String(ev.id)))freshEvents.push(ev);
    });
  }

  // Se o intervalo não for aceito pela fonte, consulta as datas em paralelo.
  if(!freshEvents.length){
    const batches=await mapLimitV22(dates,5,ds=>
      espnFetchJson(`${ESPN}/scoreboard?dates=${ds}&limit=200`)
    );
    batches.forEach(d=>{
      if(d&&Array.isArray(d.events)){
        d.events.forEach(ev=>{
          if(!freshEvents.find(x=>String(x.id)===String(ev.id)))freshEvents.push(ev);
        });
      }
    });
  }

  if(freshEvents.length)ESPN_EVENTS=freshEvents;

  const needsSummary=ESPN_EVENTS
    .filter(e=>(e.status?.type?.state||"")!=="pre")
    .slice(-80);

  const summaries=await mapLimitV22(needsSummary,5,async ev=>{
    const existing=ESPN_SUMMARIES[String(ev.id)];
    const fresh=await espnFetchJson(`${ESPN}/summary?event=${ev.id}`);
    return [String(ev.id),fresh||existing||null];
  });

  summaries.forEach(pair=>{
    if(pair&&pair[1])ESPN_SUMMARIES[pair[0]]=pair[1];
  });

  espnOk=ESPN_EVENTS.length>0;
  if(espnOk){
    espnCacheUsedV22=false;
    saveEspnCacheV22();
  }
  return espnOk;
}

function espnTeamName(c){
  const t=c?.team||{};
  return t.displayName||t.shortDisplayName||t.name||t.location||c?.displayName||"";
}
function sameTeamV16(a,b){
  const ca=canon(a), cb=canon(b);
  if(ca===cb)return true;
  const alias={
    "united states":["usa","us","u s","eua","united states"],
    "south korea":["korea republic","korea rep","kor","south korea"],
    "czechia":["czech republic","czechia"],
    "turkiye":["turkey","türkiye","turkiye"],
    "ivory coast":["cote d ivoire","côte d ivoire","ivory coast"],
    "dr congo":["congo dr","dr congo","democratic republic of congo"]
  };
  const aa=alias[ca]||[ca], bb=alias[cb]||[cb];
  return aa.some(x=>bb.includes(x))||bb.some(x=>aa.includes(x))||nm(a,b);
}
function espnEventFor(m){
  return ESPN_EVENTS.find(ev=>{
    const comp=ev.competitions?.[0];
    const cs=comp?.competitors||[];
    if(cs.length<2)return false;
    return cs.some(c=>sameTeamV16(espnTeamName(c),m.h))&&cs.some(c=>sameTeamV16(espnTeamName(c),m.a));
  })||null;
}
function espnCompFor(m){return espnEventFor(m)?.competitions?.[0]||null;}
function espnSideComp(m,side){
  const comp=espnCompFor(m); if(!comp)return null;
  const team=side==="home"?m.h:m.a;
  return (comp.competitors||[]).find(c=>sameTeamV16(espnTeamName(c),team))||null;
}
function espnStatusFor(m){
  const comp=espnCompFor(m); if(!comp)return null;
  const st=comp.status||{};
  const typ=st.type||{};
  const state=typ.state||"";
  const completed=!!typ.completed;
  let appSt=completed||state==="post"?"finished":state==="in"?"live":"upcoming";
  const clock=st.displayClock||typ.shortDetail||"";
  const rawClock=Number(st.clock||0);
  const pct=appSt==="live"?Math.min(100,Math.max(4,Math.round((rawClock/5400)*100))):(appSt==="finished"?100:0);
  return {st:appSt,min:clock,pct,detail:typ.detail||typ.shortDetail||typ.description||""};
}
function espnDataFor(m){
  const comp=espnCompFor(m); if(!comp)return null;
  const hc=espnSideComp(m,"home"), ac=espnSideComp(m,"away");
  if(!hc||!ac)return null;
  const st=espnStatusFor(m)||{st:"upcoming",min:"",pct:0};
  const hs=hc.score, as=ac.score;
  const hasScore=hs!==undefined&&hs!==null&&as!==undefined&&as!==null&&hs!==""&&as!=="";
  return {hs,as,hasScore,st:st.st,min:st.min,pct:st.pct,source:"ESPN-static"};
}
function espnTeamIdFor(m,side){
  return espnSideComp(m,side)?.team?.id||null;
}
function espnDetailsFor(m){
  const comp=espnCompFor(m);
  const event=espnEventFor(m);
  const summary=event?.id?ESPN_SUMMARIES[event.id]:null;
  return summary?.competitions?.[0]?.details || summary?.details || comp?.details || [];
}
function txtIncludes(d,s){
  return String(d.type?.text||d.type?.displayName||d.text||"").toLowerCase().includes(s);
}
function espnEventsForMatch(m,type){
  const details=espnDetailsFor(m);
  return details.filter(d=>{
    const txt=String(d.type?.text||d.type?.displayName||d.text||"").toLowerCase();
    if(type==="goal")return d.scoringPlay || txt.includes("goal") || txt.includes("penalty - scored");
    if(type==="yellow")return d.yellowCard || txt.includes("yellow");
    if(type==="red")return d.redCard || txt.includes("red card");
    return false;
  }).map(d=>{
    const teamId=String(d.team?.id||"");
    const side=String(espnTeamIdFor(m,"home"))===teamId?"home":"away";
    const team=side==="home"?m.h:m.a;
    const athlete=d.athletesInvolved?.[0]||d.athletes?.[0]||d.participants?.[0]?.athlete||{};
    return {
      name:athlete.displayName||athlete.fullName||d.text||"Jogador",
      player:athlete.displayName||athlete.fullName||d.text||"Jogador",
      team,
      side,
      minute:d.clock?.displayValue||"?",
      type:type==="goal"?"goal":(type==="red"?"red":"yellow"),
      card:type==="red"?"red":"yellow",
      penalty:d.penaltyKick||txtIncludes(d,"penalty"),
      owngoal:d.ownGoal||txtIncludes(d,"own goal")
    };
  });
}
function espnTeamStatsFor(m){
  const comp=espnCompFor(m); if(!comp)return null;
  const h=espnSideComp(m,"home"), a=espnSideComp(m,"away");
  if(!h||!a)return null;
  const get=(c,names)=>{
    const arr=c.statistics||[];
    const it=arr.find(x=>names.includes(x.name)||names.includes(x.abbreviation));
    if(!it)return null;
    const v=String(it.displayValue??it.value??"").replace("%","");
    const num=parseFloat(v);
    return Number.isFinite(num)?num:v;
  };
  return {
    possession:{home:get(h,["possessionPct","PP"]),away:get(a,["possessionPct","PP"])},
    shots:{home:get(h,["totalShots","SHOT"]),away:get(a,["totalShots","SHOT"])},
    shotsOnTarget:{home:get(h,["shotsOnTarget","SOG"]),away:get(a,["shotsOnTarget","SOG"])},
    corners:{home:get(h,["wonCorners","CW"]),away:get(a,["wonCorners","CW"])},
    fouls:{home:get(h,["foulsCommitted","FC"]),away:get(a,["foulsCommitted","FC"])}
  };
}

async function fetchESPNAll(){return await fetchStaticESPN();}

function fallbackStatus(m){if(m.d<todayStr())return"finished";return"upcoming";}
function mData(m){
  const ed=espnDataFor(m);
  if(ed) return ed;

  const ml = manualLiveV8(m);
  if(ml) return ml;

  const g=wcGame(m.h,m.a);
  if(g){
    let hs=g.home_score??g.home_goals??g.homeTeamScore??g.home_score_current??null;
    let as=g.away_score??g.away_goals??g.awayTeamScore??g.away_score_current??null;
    let hasScore=hs!==null&&hs!==undefined&&as!==null&&as!==undefined&&hs!==""&&as!=="";
    let st=g._st||fallbackStatus(m);
    return {hs,as,hasScore,st,min:g._min||"",pct:st==="finished"?100:0,source:"worldcup26.ir"};
  }

  return null;
}
function mSt(m){const d=mData(m);return d?d.st:fallbackStatus(m);}
function getMin(m,d){if(!d)return"";if(d.min)return d.min;if(d.st==="live")return"AO VIVO";return"";}
function tPct(m,d){if(!d)return 0;if(typeof d.pct==="number"&&d.pct>0)return d.pct;const n=parseInt(String(d.min||"").replace(/[^0-9]/g,""));if(!isNaN(n)&&n>0)return Math.min(100,Math.max(3,Math.round(n/90*100)));if(d.st==="live")return 8;return 0;}


/* ============================
   V8 - MODO LOCAL SEGURO
   Render imediato + placar/minuto de contingência.
============================ */
const LIVE_MATCHES = {};
Object.assign(LIVE_MATCHES, DATA.liveMatches || {});

function liveClockV8(startISO){
  const start = new Date(startISO);
  const elapsed = Math.floor((Date.now() - start.getTime()) / 60000);

  if (elapsed < 0) return {st:"upcoming", label:"", pct:0};

  if (elapsed <= 45) {
    const m = Math.max(1, elapsed);
    return {st:"live", label:`${m}'`, pct:Math.round(m/90*100)};
  }

  // Sem API oficial, não marcamos "Intervalo" automaticamente.
  // De 46 a 60 min, exibimos acréscimos do 1º tempo.
  if (elapsed <= 60) return {st:"live", label:"45+ min", pct:50};

  // Após margem de intervalo, estimamos 2º tempo.
  if (elapsed <= 120) {
    const m = Math.min(90, Math.max(46, elapsed - 15));
    return {st:"live", label:`${m}'`, pct:Math.round(m/90*100)};
  }

  if (elapsed <= 140) return {st:"live", label:"90+ min", pct:100};

  return {st:"finished", label:"FIM", pct:100};
}

function manualLiveV8(m){
  const x = LIVE_MATCHES[matchKey(m.h,m.a)];
  if(!x) return null;
  const clk = liveClockV8(x.startISO);
  return {
    hs:x.hs,
    as:x.as,
    hasScore:true,
    st: x.status === "finished" ? "finished" : clk.st,
    min: clk.label,
    pct: clk.pct,
    source:x.source || "local-live"
  };
}

function safeRunV8(fn, ms=3500){
  return Promise.race([
    Promise.resolve().then(fn).catch(()=>{}),
    new Promise(resolve=>setTimeout(resolve, ms))
  ]);
}

const F=[
  {id:"a1",g:"A",d:"2026-06-11",t:"16:00",h:"Mexico",a:"South Africa",v:"Estádio Azteca, Cidade do México",ph:"grupos"},
  {id:"a2",g:"A",d:"2026-06-11",t:"23:00",h:"South Korea",a:"Czechia",v:"Estadio Akron, Guadalajara",ph:"grupos"},
  {id:"a3",g:"A",d:"2026-06-18",t:"13:00",h:"Czechia",a:"South Africa",v:"Mercedes-Benz Stadium, Atlanta",ph:"grupos"},
  {id:"a4",g:"A",d:"2026-06-18",t:"22:00",h:"Mexico",a:"South Korea",v:"Estadio Akron, Guadalajara",ph:"grupos"},
  {id:"a5",g:"A",d:"2026-06-25",t:"22:00",h:"Czechia",a:"Mexico",v:"Estádio Azteca, Cidade do México",ph:"grupos"},
  {id:"a6",g:"A",d:"2026-06-25",t:"22:00",h:"South Africa",a:"South Korea",v:"Estadio BBVA, Monterrey",ph:"grupos"},
  {id:"b1",g:"B",d:"2026-06-12",t:"16:00",h:"Canada",a:"Bosnia and Herzegovina",v:"BMO Field, Toronto",ph:"grupos"},
  {id:"b2",g:"B",d:"2026-06-13",t:"16:00",h:"Qatar",a:"Switzerland",v:"Levi's Stadium, San Francisco",ph:"grupos"},
  {id:"b3",g:"B",d:"2026-06-18",t:"16:00",h:"Switzerland",a:"Bosnia and Herzegovina",v:"SoFi Stadium, Los Angeles",ph:"grupos"},
  {id:"b4",g:"B",d:"2026-06-18",t:"19:00",h:"Canada",a:"Qatar",v:"BC Place, Vancouver",ph:"grupos"},
  {id:"b5",g:"B",d:"2026-06-24",t:"16:00",h:"Switzerland",a:"Canada",v:"BC Place, Vancouver",ph:"grupos"},
  {id:"b6",g:"B",d:"2026-06-24",t:"16:00",h:"Bosnia and Herzegovina",a:"Qatar",v:"Lumen Field, Seattle",ph:"grupos"},
  {id:"c1",g:"C",d:"2026-06-13",t:"19:00",h:"Brazil",a:"Morocco",v:"MetLife Stadium, Nova York",ph:"grupos",br:1},
  {id:"c2",g:"C",d:"2026-06-13",t:"22:00",h:"Haiti",a:"Scotland",v:"Gillette Stadium, Boston",ph:"grupos"},
  {id:"c3",g:"C",d:"2026-06-19",t:"19:00",h:"Scotland",a:"Morocco",v:"Gillette Stadium, Boston",ph:"grupos"},
  {id:"c4",g:"C",d:"2026-06-19",t:"21:30",h:"Brazil",a:"Haiti",v:"Lincoln Financial Field, Filadélfia",ph:"grupos",br:1},
  {id:"c5",g:"C",d:"2026-06-24",t:"19:00",h:"Scotland",a:"Brazil",v:"Hard Rock Stadium, Miami",ph:"grupos",br:1},
  {id:"c6",g:"C",d:"2026-06-24",t:"19:00",h:"Morocco",a:"Haiti",v:"Mercedes-Benz Stadium, Atlanta",ph:"grupos"},
  {id:"d1",g:"D",d:"2026-06-12",t:"22:00",h:"United States",a:"Paraguay",v:"SoFi Stadium, Los Angeles",ph:"grupos"},
  {id:"d2",g:"D",d:"2026-06-13",t:"01:00",h:"Australia",a:"Türkiye",v:"BC Place, Vancouver",ph:"grupos"},
  {id:"d3",g:"D",d:"2026-06-19",t:"01:00",h:"Türkiye",a:"Paraguay",v:"Levi's Stadium, San Francisco",ph:"grupos"},
  {id:"d4",g:"D",d:"2026-06-19",t:"16:00",h:"United States",a:"Australia",v:"Lumen Field, Seattle",ph:"grupos"},
  {id:"d5",g:"D",d:"2026-06-25",t:"23:00",h:"Türkiye",a:"United States",v:"SoFi Stadium, Los Angeles",ph:"grupos"},
  {id:"d6",g:"D",d:"2026-06-25",t:"23:00",h:"Paraguay",a:"Australia",v:"Levi's Stadium, San Francisco",ph:"grupos"},
  {id:"e1",g:"E",d:"2026-06-14",t:"14:00",h:"Germany",a:"Curacao",v:"NRG Stadium, Houston",ph:"grupos"},
  {id:"e2",g:"E",d:"2026-06-14",t:"20:00",h:"Ivory Coast",a:"Ecuador",v:"Lincoln Financial Field, Filadélfia",ph:"grupos"},
  {id:"e3",g:"E",d:"2026-06-20",t:"17:00",h:"Germany",a:"Ivory Coast",v:"BMO Field, Toronto",ph:"grupos"},
  {id:"e4",g:"E",d:"2026-06-20",t:"21:00",h:"Ecuador",a:"Curacao",v:"Children's Mercy Park, Kansas City",ph:"grupos"},
  {id:"e5",g:"E",d:"2026-06-25",t:"17:00",h:"Curacao",a:"Ivory Coast",v:"Lincoln Financial Field, Filadélfia",ph:"grupos"},
  {id:"e6",g:"E",d:"2026-06-25",t:"17:00",h:"Ecuador",a:"Germany",v:"MetLife Stadium, Nova York",ph:"grupos"},
  {id:"f1",g:"F",d:"2026-06-14",t:"17:00",h:"Netherlands",a:"Japan",v:"AT&T Stadium, Dallas",ph:"grupos"},
  {id:"f2",g:"F",d:"2026-06-14",t:"23:00",h:"Sweden",a:"Tunisia",v:"Estadio BBVA, Monterrey",ph:"grupos"},
  {id:"f3",g:"F",d:"2026-06-20",t:"14:00",h:"Netherlands",a:"Sweden",v:"NRG Stadium, Houston",ph:"grupos"},
  {id:"f4",g:"F",d:"2026-06-20",t:"01:00",h:"Tunisia",a:"Japan",v:"Estadio BBVA, Monterrey",ph:"grupos"},
  {id:"f5",g:"F",d:"2026-06-25",t:"20:00",h:"Japan",a:"Sweden",v:"AT&T Stadium, Dallas",ph:"grupos"},
  {id:"f6",g:"F",d:"2026-06-25",t:"20:00",h:"Tunisia",a:"Netherlands",v:"Children's Mercy Park, Kansas City",ph:"grupos"},
  {id:"g1",g:"G",d:"2026-06-15",t:"16:00",h:"Belgium",a:"Egypt",v:"Lumen Field, Seattle",ph:"grupos"},
  {id:"g2",g:"G",d:"2026-06-15",t:"22:00",h:"Iran",a:"New Zealand",v:"SoFi Stadium, Los Angeles",ph:"grupos"},
  {id:"g3",g:"G",d:"2026-06-21",t:"16:00",h:"Belgium",a:"Iran",v:"SoFi Stadium, Los Angeles",ph:"grupos"},
  {id:"g4",g:"G",d:"2026-06-21",t:"22:00",h:"New Zealand",a:"Egypt",v:"BC Place, Vancouver",ph:"grupos"},
  {id:"g5",g:"G",d:"2026-06-27",t:"00:00",h:"Egypt",a:"Iran",v:"Lumen Field, Seattle",ph:"grupos"},
  {id:"g6",g:"G",d:"2026-06-27",t:"00:00",h:"New Zealand",a:"Belgium",v:"BC Place, Vancouver",ph:"grupos"},
  {id:"h1",g:"H",d:"2026-06-15",t:"13:00",h:"Spain",a:"Cape Verde",v:"Mercedes-Benz Stadium, Atlanta",ph:"grupos"},
  {id:"h2",g:"H",d:"2026-06-15",t:"19:00",h:"Saudi Arabia",a:"Uruguay",v:"Hard Rock Stadium, Miami",ph:"grupos"},
  {id:"h3",g:"H",d:"2026-06-21",t:"13:00",h:"Spain",a:"Saudi Arabia",v:"Mercedes-Benz Stadium, Atlanta",ph:"grupos"},
  {id:"h4",g:"H",d:"2026-06-21",t:"19:00",h:"Uruguay",a:"Cape Verde",v:"Hard Rock Stadium, Miami",ph:"grupos"},
  {id:"h5",g:"H",d:"2026-06-26",t:"21:00",h:"Cape Verde",a:"Saudi Arabia",v:"NRG Stadium, Houston",ph:"grupos"},
  {id:"h6",g:"H",d:"2026-06-26",t:"21:00",h:"Uruguay",a:"Spain",v:"Estadio Akron, Guadalajara",ph:"grupos"},
  {id:"i1",g:"I",d:"2026-06-16",t:"16:00",h:"France",a:"Senegal",v:"MetLife Stadium, Nova York",ph:"grupos"},
  {id:"i2",g:"I",d:"2026-06-16",t:"19:00",h:"Iraq",a:"Norway",v:"Gillette Stadium, Boston",ph:"grupos"},
  {id:"i3",g:"I",d:"2026-06-22",t:"18:00",h:"France",a:"Iraq",v:"Lincoln Financial Field, Filadélfia",ph:"grupos"},
  {id:"i4",g:"I",d:"2026-06-22",t:"21:00",h:"Norway",a:"Senegal",v:"MetLife Stadium, Nova York",ph:"grupos"},
  {id:"i5",g:"I",d:"2026-06-26",t:"16:00",h:"Norway",a:"France",v:"Gillette Stadium, Boston",ph:"grupos"},
  {id:"i6",g:"I",d:"2026-06-26",t:"16:00",h:"Senegal",a:"Iraq",v:"BMO Field, Toronto",ph:"grupos"},
  {id:"j1",g:"J",d:"2026-06-16",t:"01:00",h:"Austria",a:"Jordan",v:"Levi's Stadium, San Francisco",ph:"grupos"},
  {id:"j2",g:"J",d:"2026-06-16",t:"22:00",h:"Argentina",a:"Algeria",v:"Children's Mercy Park, Kansas City",ph:"grupos"},
  {id:"j3",g:"J",d:"2026-06-22",t:"00:00",h:"Jordan",a:"Algeria",v:"Levi's Stadium, San Francisco",ph:"grupos"},
  {id:"j4",g:"J",d:"2026-06-22",t:"14:00",h:"Argentina",a:"Austria",v:"AT&T Stadium, Dallas",ph:"grupos"},
  {id:"j5",g:"J",d:"2026-06-27",t:"23:00",h:"Algeria",a:"Austria",v:"Children's Mercy Park, Kansas City",ph:"grupos"},
  {id:"j6",g:"J",d:"2026-06-27",t:"23:00",h:"Jordan",a:"Argentina",v:"AT&T Stadium, Dallas",ph:"grupos"},
  {id:"k1",g:"K",d:"2026-06-17",t:"14:00",h:"Portugal",a:"DR Congo",v:"NRG Stadium, Houston",ph:"grupos"},
  {id:"k2",g:"K",d:"2026-06-17",t:"23:00",h:"Uzbekistan",a:"Colombia",v:"Estádio Azteca, Cidade do México",ph:"grupos"},
  {id:"k3",g:"K",d:"2026-06-23",t:"14:00",h:"Portugal",a:"Uzbekistan",v:"NRG Stadium, Houston",ph:"grupos"},
  {id:"k4",g:"K",d:"2026-06-23",t:"23:00",h:"Colombia",a:"DR Congo",v:"Estadio Akron, Guadalajara",ph:"grupos"},
  {id:"k5",g:"K",d:"2026-06-27",t:"20:30",h:"Colombia",a:"Portugal",v:"Hard Rock Stadium, Miami",ph:"grupos"},
  {id:"k6",g:"K",d:"2026-06-27",t:"20:30",h:"DR Congo",a:"Uzbekistan",v:"Mercedes-Benz Stadium, Atlanta",ph:"grupos"},
  {id:"l1",g:"L",d:"2026-06-17",t:"17:00",h:"England",a:"Croatia",v:"AT&T Stadium, Dallas",ph:"grupos"},
  {id:"l2",g:"L",d:"2026-06-17",t:"20:00",h:"Ghana",a:"Panama",v:"BMO Field, Toronto",ph:"grupos"},
  {id:"l3",g:"L",d:"2026-06-23",t:"17:00",h:"England",a:"Ghana",v:"Gillette Stadium, Boston",ph:"grupos"},
  {id:"l4",g:"L",d:"2026-06-23",t:"20:00",h:"Panama",a:"Croatia",v:"BMO Field, Toronto",ph:"grupos"},
  {id:"l5",g:"L",d:"2026-06-27",t:"18:00",h:"Panama",a:"England",v:"MetLife Stadium, Nova York",ph:"grupos"},
  {id:"l6",g:"L",d:"2026-06-27",t:"18:00",h:"Croatia",a:"Ghana",v:"Lincoln Financial Field, Filadélfia",ph:"grupos"},
  {id:"e01",g:"1/16",d:"2026-06-28",t:"16:00",h:"2 Grupo A",a:"2 Grupo B",v:"SoFi Stadium, Los Angeles",ph:"oitavas"},
  {id:"e02",g:"1/16",d:"2026-06-29",t:"14:00",h:"1 Grupo C",a:"2 Grupo F",v:"NRG Stadium, Houston",ph:"oitavas"},
  {id:"e03",g:"1/16",d:"2026-06-29",t:"17:30",h:"1 Grupo E",a:"3º colocado",v:"Gillette Stadium, Boston",ph:"oitavas"},
  {id:"e04",g:"1/16",d:"2026-06-29",t:"22:00",h:"1 Grupo F",a:"2 Grupo C",v:"Estadio BBVA, Monterrey",ph:"oitavas"},
  {id:"e05",g:"1/16",d:"2026-06-30",t:"14:00",h:"2 Grupo E",a:"2 Grupo I",v:"AT&T Stadium, Dallas",ph:"oitavas"},
  {id:"e06",g:"1/16",d:"2026-06-30",t:"18:00",h:"1 Grupo I",a:"3º colocado",v:"MetLife Stadium, Nova York",ph:"oitavas"},
  {id:"e07",g:"1/16",d:"2026-06-30",t:"22:00",h:"1 Grupo A",a:"3º colocado",v:"Estádio Azteca, Cidade do México",ph:"oitavas"},
  {id:"e08",g:"1/16",d:"2026-07-01",t:"13:00",h:"1 Grupo L",a:"3º colocado",v:"Mercedes-Benz Stadium, Atlanta",ph:"oitavas"},
  {id:"e09",g:"1/16",d:"2026-07-01",t:"17:00",h:"1 Grupo G",a:"3º colocado",v:"Lumen Field, Seattle",ph:"oitavas"},
  {id:"e10",g:"1/16",d:"2026-07-01",t:"21:00",h:"1 Grupo D",a:"3º colocado",v:"Levi's Stadium, San Francisco",ph:"oitavas"},
  {id:"e11",g:"1/16",d:"2026-07-02",t:"00:00",h:"1 Grupo B",a:"3º colocado",v:"BC Place, Vancouver",ph:"oitavas"},
  {id:"e12",g:"1/16",d:"2026-07-02",t:"16:00",h:"1 Grupo H",a:"2 Grupo J",v:"SoFi Stadium, Los Angeles",ph:"oitavas"},
  {id:"e13",g:"1/16",d:"2026-07-02",t:"20:00",h:"2 Grupo K",a:"2 Grupo L",v:"BMO Field, Toronto",ph:"oitavas"},
  {id:"e14",g:"1/16",d:"2026-07-03",t:"15:00",h:"2 Grupo D",a:"2 Grupo G",v:"AT&T Stadium, Dallas",ph:"oitavas"},
  {id:"e15",g:"1/16",d:"2026-07-03",t:"17:00",h:"1 Grupo J",a:"2 Grupo H",v:"Mercedes-Benz Stadium, Atlanta",ph:"oitavas"},
  {id:"e16",g:"1/16",d:"2026-07-03",t:"22:30",h:"1 Grupo K",a:"3º colocado",v:"Children's Mercy Park, Kansas City",ph:"oitavas"},
  {id:"o1",g:"Oitavas",d:"2026-07-04",t:"14:00",h:"Venc.2Ax2B",a:"Venc.1Fx2C",v:"NRG Stadium, Houston",ph:"oitavas"},
  {id:"o2",g:"Oitavas",d:"2026-07-04",t:"18:00",h:"Venc.1Ex3",a:"Venc.1Ix3",v:"Lincoln Financial, Filadélfia",ph:"oitavas"},
  {id:"o3",g:"Oitavas",d:"2026-07-05",t:"17:00",h:"Venc.1Cx2F",a:"Venc.2Ex2I",v:"MetLife Stadium, Nova York",ph:"oitavas"},
  {id:"o4",g:"Oitavas",d:"2026-07-05",t:"21:00",h:"Venc.1Ax3",a:"Venc.1Lx3",v:"Estádio Azteca, Cidade do México",ph:"oitavas"},
  {id:"o5",g:"Oitavas",d:"2026-07-06",t:"15:00",h:"Venc.2Kx2L",a:"Venc.1Hx2J",v:"AT&T Stadium, Dallas",ph:"oitavas"},
  {id:"o6",g:"Oitavas",d:"2026-07-06",t:"20:00",h:"Venc.1Dx3",a:"Venc.1Gx3",v:"Lumen Field, Seattle",ph:"oitavas"},
  {id:"o7",g:"Oitavas",d:"2026-07-07",t:"13:00",h:"Venc.1Jx2H",a:"Venc.2Dx2G",v:"Mercedes-Benz, Atlanta",ph:"oitavas"},
  {id:"o8",g:"Oitavas",d:"2026-07-07",t:"17:00",h:"Venc.1Bx3",a:"Venc.1Kx3",v:"BC Place, Vancouver",ph:"oitavas"},
  {id:"q1",g:"Quartas",d:"2026-07-09",t:"17:00",h:"Venc.J89",a:"Venc.J90",v:"Gillette Stadium, Boston",ph:"semi"},
  {id:"q2",g:"Quartas",d:"2026-07-10",t:"16:00",h:"Venc.J93",a:"Venc.J94",v:"SoFi Stadium, Los Angeles",ph:"semi"},
  {id:"q3",g:"Quartas",d:"2026-07-11",t:"18:00",h:"Venc.J91",a:"Venc.J92",v:"Hard Rock Stadium, Miami",ph:"semi"},
  {id:"q4",g:"Quartas",d:"2026-07-11",t:"21:00",h:"Venc.J95",a:"Venc.J96",v:"Children's Mercy Park, KC",ph:"semi"},
  {id:"sf1",g:"Semifinal",d:"2026-07-14",t:"16:00",h:"Venc.QF1",a:"Venc.QF2",v:"AT&T Stadium, Dallas",ph:"semi"},
  {id:"sf2",g:"Semifinal",d:"2026-07-15",t:"16:00",h:"Venc.QF3",a:"Venc.QF4",v:"AT&T Stadium, Dallas",ph:"semi"},
  {id:"tp1",g:"3 Lugar",d:"2026-07-18",t:"18:00",h:"Perd.SF1",a:"Perd.SF2",v:"Hard Rock Stadium, Miami",ph:"semi"},
  {id:"fi1",g:"FINAL",d:"2026-07-19",t:"16:00",h:"Venc.SF1",a:"Venc.SF2",v:"MetLife Stadium, Nova York",ph:"semi"}
];

// ============================
// V23 - MATA-MATA AUTOMÁTICO
// ============================
F.forEach(m=>{
  if(m.ph!=="grupos"){
    m.slotH=m.slotH||m.h;
    m.slotA=m.slotA||m.a;
  }
});

const KO_LINKS_V23 = {
  o1:["e01","e04"], o2:["e03","e06"], o3:["e02","e05"], o4:["e07","e08"],
  o5:["e13","e12"], o6:["e10","e09"], o7:["e15","e14"], o8:["e11","e16"],
  q1:["o1","o2"], q2:["o5","o6"], q3:["o3","o4"], q4:["o7","o8"],
  sf1:["q1","q2"], sf2:["q3","q4"],
  tp1:["sf1","sf2"], fi1:["sf1","sf2"]
};

function isPlaceholderTeamV23(name){
  const s=String(name||"").toLowerCase();
  return !name || s.includes("grupo") || s.includes("melhor 3") ||
    s.includes("venc.") || s.includes("vencedor") ||
    s.includes("perd.") || s.includes("runner-up");
}

function groupFinishedV23(gl){
  const games=F.filter(m=>m.ph==="grupos"&&m.g===gl);
  return games.length===6 && games.every(m=>mSt(m)==="finished");
}

function resolveGroupSlotV23(slot){
  const m=String(slot||"").trim().match(/^([12])\s*Grupo\s*([A-L])$/i);
  if(!m)return null;
  const pos=Number(m[1])-1;
  const gl=m[2].toUpperCase();
  if(!groupFinishedV23(gl))return null;
  return calcGroup(gl)[pos]?.nm||null;
}

function espnTeamsForEventV23(ev){
  const cs=ev?.competitions?.[0]?.competitors||[];
  const home=cs.find(c=>c.homeAway==="home")||cs[0];
  const away=cs.find(c=>c.homeAway==="away")||cs[1];
  return {home:espnTeamName(home),away:espnTeamName(away)};
}

function espnEventByFixtureV23(m){
  const day=ESPN_EVENTS.filter(ev=>{
    const br=utcBRT(ev.date||ev.competitions?.[0]?.date);
    return br.date===m.d;
  });
  if(!day.length)return null;

  if(!isPlaceholderTeamV23(m.h)&&!isPlaceholderTeamV23(m.a)){
    const exact=day.find(ev=>{
      const t=espnTeamsForEventV23(ev);
      return sameTeamV16(t.home,m.h)&&sameTeamV16(t.away,m.a);
    });
    if(exact)return exact;
  }

  const target=matchKick(m).getTime();
  return day.map(ev=>{
    const dt=new Date(ev.date||ev.competitions?.[0]?.date).getTime();
    return {ev,diff:Math.abs(dt-target)};
  }).filter(x=>Number.isFinite(x.diff)&&x.diff<=4*60*60*1000)
    .sort((a,b)=>a.diff-b.diff)[0]?.ev||null;
}

function winnerLoserV23(m){
  const ev=espnEventByFixtureV23(m)||espnEventFor(m);
  const comp=ev?.competitions?.[0];
  const typ=comp?.status?.type||ev?.status?.type||{};
  if(!(typ.completed||typ.state==="post"))return null;

  const cs=comp?.competitors||[];
  if(cs.length<2)return null;

  const home=cs.find(c=>c.homeAway==="home")||cs[0];
  const away=cs.find(c=>c.homeAway==="away")||cs[1];
  const homeName=espnTeamName(home), awayName=espnTeamName(away);

  let winner=null, loser=null;
  const marked=cs.find(c=>c.winner===true);

  if(marked){
    winner=espnTeamName(marked);
    loser=winner===homeName?awayName:homeName;
  }else{
    const hs=Number(home.score), as=Number(away.score);
    if(Number.isFinite(hs)&&Number.isFinite(as)&&hs!==as){
      winner=hs>as?homeName:awayName;
      loser=hs>as?awayName:homeName;
    }else{
      const hp=Number(home.shootoutScore ?? home.penaltyScore);
      const ap=Number(away.shootoutScore ?? away.penaltyScore);
      if(Number.isFinite(hp)&&Number.isFinite(ap)&&hp!==ap){
        winner=hp>ap?homeName:awayName;
        loser=hp>ap?awayName:homeName;
      }
    }
  }
  return winner?{winner,loser}:null;
}

function applyOfficialParticipantsV23(){
  F.filter(m=>m.ph!=="grupos").forEach(m=>{
    const ev=espnEventByFixtureV23(m);
    if(!ev)return;
    const t=espnTeamsForEventV23(ev);
    if(t.home&&!isPlaceholderTeamV23(t.home))m.h=t.home;
    if(t.away&&!isPlaceholderTeamV23(t.away))m.a=t.away;
  });
}

function resolveKnockoutV23(){
  F.filter(m=>/^e\d+$/i.test(m.id)).forEach(m=>{
    const rh=resolveGroupSlotV23(m.slotH);
    const ra=resolveGroupSlotV23(m.slotA);
    if(rh)m.h=rh;
    if(ra)m.a=ra;
  });

  applyOfficialParticipantsV23();

  ["o1","o2","o3","o4","o5","o6","o7","o8","q1","q2","q3","q4","sf1","sf2","tp1","fi1"].forEach(id=>{
    const target=F.find(m=>m.id===id);
    const links=KO_LINKS_V23[id];
    if(!target||!links)return;

    const a=F.find(m=>m.id===links[0]);
    const b=F.find(m=>m.id===links[1]);
    const ra=a?winnerLoserV23(a):null;
    const rb=b?winnerLoserV23(b):null;

    if(id==="tp1"){
      if(ra?.loser)target.h=ra.loser;
      if(rb?.loser)target.a=rb.loser;
    }else{
      if(ra?.winner)target.h=ra.winner;
      if(rb?.winner)target.a=rb.winner;
    }
  });

  applyOfficialParticipantsV23();

  F.forEach(m=>{
    if(m.h==="Brazil"||m.a==="Brazil")m.br=1;
    else if(m.ph!=="grupos")delete m.br;
  });
}


function mkCard(m){
  const data=mData(m);const st=data?data.st:mSt(m);
  const isBR=m.br||m.h==="Brazil"||m.a==="Brazil";
  const minD=getMin(m,data);const pct=tPct(m,data);
  let pill="";
  if(st==="live")pill=`<span class="mc-st ms-live">🔴 ${minD||"AO VIVO"}</span>`;
  else if(st==="finished")pill='<span class="mc-st ms-done">✓ FIM</span>';
  else pill=`<span class="mc-st ms-up">${m.g}</span>`;
  let mid="";
  if((st==="live"||st==="finished")&&data&&data.hasScore){
    const hw=+data.hs>+data.as,aw=+data.as>+data.hs;
    mid=`<div class="sc-box"><div class="sc${hw?" win":""}">${data.hs}</div><div class="sc-d">:</div><div class="sc${aw?" win":""}">${data.as}</div></div>`;
  }else{mid=`<div class="tt">${m.t}</div>`;}
  const hw2=st==="finished"&&data&&+data.hs>+data.as;
  const aw2=st==="finished"&&data&&+data.as>+data.hs;
  let goalsSum="";
  if(st!=="upcoming"){
    goalsSum=goalsSummaryV9(m);
  }
  let timerH="";
  if(st==="live"){timerH=`<div class="mc-timer"><div class="timer-dot"></div><div class="timer-val">${minD||"AO VIVO"}</div><div class="timer-bar-wrap"><div class="timer-bar" style="width:${pct||8}%"></div></div></div>`;}
  return`<div class="mc ${st}${isBR?" br":""}" onclick="openModal('${m.id}')">
  <div class="mc-top"><span class="mc-grp">${m.g}</span>${pill}</div>
  <div class="mc-row">
    <div class="mc-side"><span class="mc-fl">${fl(m.h)}</span><span class="mc-nm${hw2?" win":""}">${pt(m.h)}</span></div>
    ${mid}
    <div class="mc-side r"><span class="mc-fl">${fl(m.a)}</span><span class="mc-nm${aw2?" win":""}">${pt(m.a)}</span></div>
  </div>${timerH}${goalsSum}
  <div class="mc-venue">${m.v}</div>
  ${st!=="upcoming"?'<div class="tap-hint">Toque para detalhes ↑</div>':""}
</div>`;
}

function renderJogos(){
  let list=F.slice();
  if(curFilter==="live")list=list.filter(m=>mSt(m)==="live");
  else if(curFilter==="today")list=list.filter(m=>isToday(m.d));
  else if(curFilter==="brazil")list=list.filter(m=>m.br||m.h==="Brazil"||m.a==="Brazil");
  else if(curFilter==="grupos")list=list.filter(m=>m.ph==="grupos");
  else if(curFilter==="oitavas")list=list.filter(m=>m.ph==="oitavas");
  else if(curFilter==="semi")list=list.filter(m=>m.ph==="semi");
  if(!list.length)return'<div class="empty">Nenhum jogo neste filtro</div>';
  const phO=["grupos","oitavas","semi"];
  const phN={grupos:"Fase de Grupos",oitavas:"Fase Eliminatória · automática",semi:"Quartas - Semis - Final · automática"};
  let html="";
  phO.forEach(ph=>{
    const pl=list.filter(m=>m.ph===ph);if(!pl.length)return;
    const byD={};pl.forEach(m=>{(byD[m.d]||(byD[m.d]=[])).push(m);});
    html+=`<div class="sh">${phN[ph]}</div>`;
    Object.keys(byD).sort().forEach(d=>{html+=`<div class="dh">${fmtD(d)}</div>`;byD[d].forEach(m=>{html+=mkCard(m);});});
  });
  return html;
}

function calcGroup(gl){
  const gm=F.filter(m=>m.g===gl&&m.ph==="grupos");
  const ts={};
  [...new Set([...gm.map(m=>m.h),...gm.map(m=>m.a)])].forEach(t=>{ts[t]={j:0,v:0,e:0,d:0,gp:0,gc:0,sg:0,pts:0,form:[],live:false};});
  gm.forEach(m=>{
    const data=mData(m);const st=data?data.st:mSt(m);
    if((st==="finished"||st==="live")&&data&&data.hasScore){
      const hs=+data.hs,as=+data.as;
      if(!ts[m.h]||!ts[m.a])return;
      ts[m.h].j++;ts[m.a].j++;
      ts[m.h].gp+=hs;ts[m.h].gc+=as;ts[m.h].sg+=hs-as;
      ts[m.a].gp+=as;ts[m.a].gc+=hs;ts[m.a].sg+=as-hs;
      if(st==="live"){ts[m.h].live=true;ts[m.a].live=true;}
      if(hs>as){ts[m.h].v++;ts[m.h].pts+=3;ts[m.h].form.push(st==="live"?"X":"W");ts[m.a].d++;ts[m.a].form.push(st==="live"?"X":"L");}
      else if(hs===as){ts[m.h].e++;ts[m.h].pts++;ts[m.h].form.push(st==="live"?"X":"D");ts[m.a].e++;ts[m.a].pts++;ts[m.a].form.push(st==="live"?"X":"D");}
      else{ts[m.a].v++;ts[m.a].pts+=3;ts[m.a].form.push(st==="live"?"X":"W");ts[m.h].d++;ts[m.h].form.push(st==="live"?"X":"L");}
    }
  });
  return Object.entries(ts).map(([nm,s])=>({nm,...s})).sort((a,b)=>b.pts-a.pts||b.sg-a.sg||b.gp-a.gp);
}

function renderGrupos(){
  if(!wcOk&&!ofbOk)return'<div class="empty" style="padding:40px">Aguardando dados da API...<br><span style="font-size:11px;color:var(--text3)">Toque em 🔄 para tentar novamente</span></div>';
  let html=`<div style="font-family:'Barlow Condensed',sans-serif;font-size:11px;color:var(--green);padding:2px 2px 10px">✓ Dados ao vivo: worldcup26.ir</div>`;
  ["A","B","C","D","E","F","G","H","I","J","K","L"].forEach(gl=>{
    const gm=F.filter(m=>m.g===gl&&m.ph==="grupos");
    const played=gm.filter(m=>{const d=mData(m);return mSt(m)==="finished"&&d&&d.hasScore;}).length;
    const hasLive=gm.some(m=>mSt(m)==="live");
    const rows=calcGroup(gl);
    const flagPrev=rows.map(r=>fl(r.nm)).join("");
    html+=`<div class="grp-card" id="gc-${gl}">
<div class="grp-hdr" onclick="toggleGrp('${gl}')">
  <h3>GRUPO ${gl}</h3><div class="grp-flags">${flagPrev}</div>
  ${hasLive?'<span style="color:var(--live);font-size:10px;font-weight:800;animation:pulse 1.5s infinite;margin-left:4px;font-family:Barlow Condensed,sans-serif">🔴 AO VIVO</span>':""}
  <span style="font-family:Barlow Condensed,sans-serif;font-size:10px;color:var(--text3);margin-left:6px">${played}/6</span>
  <span class="grp-arrow">▼</span>
</div>
<div class="st-wrap"><table class="st">
<thead><tr><th>Seleção</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th><th>PTS</th><th>Forma</th></tr></thead><tbody>`;
    rows.forEach((t,i)=>{
      const pc=i===0?"p1":i===1?"p2":i===2?"p3":"";
      const sgC=t.sg>0?"sg-pos":t.sg<0?"sg-neg":"";
      const formH=t.form.slice(-5).map(r=>{if(r==="X")return'<div class="fd fd-lv">●</div>';return`<div class="fd fd-${r==="W"?"w":r==="D"?"d":"l"}">${r}</div>`;}).join("");
      html+=`<tr${t.live?' class="live-row"':""}><td><div class="st-tm"><div class="pos ${pc}">${i+1}</div><div class="st-fl">${fl(t.nm)}</div><div class="st-nm">${pt(t.nm)}</div></div></td><td>${t.j}</td><td>${t.v}</td><td>${t.e}</td><td>${t.d}</td><td>${t.gp}</td><td>${t.gc}</td><td class="${sgC}">${t.sg>0?"+":""}${t.sg}</td><td class="pts-cell">${t.pts}${t.live?'<span style="color:var(--live);font-size:8px"> ●</span>':""}</td><td><div class="form-row">${formH||'<span style="color:var(--text3);font-size:9px">-</span>'}</div></td></tr>`;
    });
    html+=`</tbody></table></div>
<div class="st-legend"><span><span class="ld" style="background:var(--green)"></span>Classificado</span><span><span class="ld" style="background:var(--gold)"></span>3º colocado</span><span><span class="ld" style="background:#4B5563"></span>Eliminado</span>${hasLive?'<span><span class="ld" style="background:var(--live)"></span>Parcial ao vivo</span>':""}</div>
<div class="grp-matches" id="gm-${gl}" style="display:none"><div class="gmt">JOGOS DO GRUPO ${gl}</div>`;
    gm.forEach(m=>{
      const data=mData(m);const st=data?data.st:mSt(m);
      const ofb=ofbMatch(m.h,m.a);
      let sStr=m.t;
      if(st==="live"&&data&&data.hasScore)sStr=`<span style="color:var(--live)">${data.hs}-${data.as} ${getMin(m,data)||"AO VIVO"} 🔴</span>`;
      else if(st==="finished"&&data&&data.hs!=null)sStr=`${data.hs}-${data.as}`;
      let sc="";
      if(ofb&&st!=="upcoming"){
        const g1=(ofb.goals1||[]).map(g=>g.name.split(" ").pop()+(g.minute?" "+g.minute+"'":"")).join(", ");
        const g2=(ofb.goals2||[]).map(g=>g.name.split(" ").pop()+(g.minute?" "+g.minute+"'":"")).join(", ");
        if(g1||g2)sc=`<div style="font-size:10px;color:var(--text3);text-align:center;margin-top:2px">${g1?fl(m.h)+" "+g1:""}${g1&&g2?" | ":""}${g2?fl(m.a)+" "+g2:""}</div>`;
      }
      const dt=new Date(m.d+"T12:00:00");
      html+=`<div class="gm-row" onclick="openModal('${m.id}')"><div class="gm-home">${fl(m.h)}<span class="gm-hn">${pt(m.h)}</span></div><div style="text-align:center"><div class="gm-score">${sStr}</div>${sc}</div><div class="gm-away"><span class="gm-an">${pt(m.a)}</span>${fl(m.a)}</div><div class="gm-dt">${dt.getDate()}/${dt.getMonth()+1}</div></div>`;
    });
    html+=`</div></div>`;
  });
  return html;
}
function toggleGrp(gl){const c=document.getElementById("gc-"+gl);const gm=document.getElementById("gm-"+gl);c.classList.toggle("open");gm.style.display=gm.style.display==="none"?"block":"none";}

async function openModal(id){
  const m=F.find(x=>x.id===id);if(!m)return;
  modalId=id;
  document.getElementById("modalOverlay").classList.add("on");
  document.body.style.overflow="hidden";
  document.getElementById("modalContent").innerHTML=buildModal(m);
  startMTmr(m);
}
function buildModal(m){
  const data=mData(m);const st=data?data.st:mSt(m);
  const hw=data&&+data.hs>+data.as,aw=data&&+data.as>+data.hs;
  const minD=getMin(m,data);const pct=tPct(m,data);
  let scoreC="";
  if((st==="live"||st==="finished")&&data&&data.hasScore){
    scoreC=`<div class="mt-score-box"><div class="mt-sc${hw?" win":""}">${data.hs}</div><div class="mt-sc-d">:</div><div class="mt-sc${aw?" win":""}">${data.as}</div></div>`;
  }else{scoreC=`<div class="mt-sc-time">${m.t}</div>`;}
  let liveBar="";
  if(st==="live"){liveBar=`<div class="modal-timer-bar"><div class="td"></div><div class="tv" id="mtv">${minD||"AO VIVO"}</div><div class="tbw"><div class="tb" id="mtb" style="width:${pct||8}%"></div></div><div class="tp">/ 90'</div></div>`;}
  const dt=new Date(m.d+"T12:00:00");
  const wd=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  const mo=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago"];
  const dStr=`${wd[dt.getDay()]}, ${dt.getDate()} ${mo[dt.getMonth()]}`;
  const ofb=ofbMatch(m.h,m.a);
  let body="";
  if(st==="upcoming")body='<div class="no-data">Jogo ainda não iniciado</div>';
  else body=buildDetail(m,ofb);
  return`<div class="modal-hdr">
  <div class="modal-title">⚽ ${m.g} - ${dStr} - ${m.t}</div>
  <div class="modal-teams">
    <div class="mt-side"><div class="mt-fl">${fl(m.h)}</div><div class="mt-nm">${pt(m.h)}</div></div>
    ${scoreC}
    <div class="mt-side"><div class="mt-fl">${fl(m.a)}</div><div class="mt-nm">${pt(m.a)}</div></div>
  </div></div>${liveBar}
<div class="modal-body">
  <div class="modal-venue"><div><div class="mv-txt">${m.v.split(",")[0]}</div><div class="mv-sub">${m.v.split(",").slice(1).join(",").trim()}</div></div></div>
  <div class="modal-info">
    <div class="mi"><div class="mi-val">${dStr.split(",")[1]?.trim()||dStr}</div><div class="mi-lbl">Data</div></div>
    <div class="mi"><div class="mi-val">${m.t}</div><div class="mi-lbl">Horário (BRT)</div></div>
  </div>${body}</div>`;
}
function buildDetail(m,ofb){
  let html="";
  const live=liveExtraFor(m);

  const autoStats=espnTeamStatsFor(m);
  const possession=autoStats?.possession || live?.possession;
  if(possession&&possession.home!=null&&possession.away!=null){
    const hp=possession.home??0, ap=possession.away??0;
    html+=`<div class="modal-sec"><div class="modal-sec-title">📊 Posse de bola</div>
      <div class="poss-wrap">
        <div class="poss-row"><span>${fl(m.h)} ${pt(m.h)} ${hp}%</span><span>${ap}% ${pt(m.a)} ${fl(m.a)}</span></div>
        <div class="poss-bar"><div class="poss-h" style="width:${hp}%"></div><div class="poss-a" style="width:${ap}%"></div></div>
      </div>
    </div>`;
  }

  const st=autoStats || live?.stats;
  if(st){
    const hasAny=[st.shots,st.shotsOnTarget,st.corners,st.fouls].some(v=>v&&((v.home!==null&&v.home!==undefined)||(v.away!==null&&v.away!==undefined)));
    if(hasAny){
      const item=(label,obj)=>`<div class="adv-stat"><div class="adv-n">${obj?.home??"—"} x ${obj?.away??"—"}</div><div class="adv-l">${label}</div></div>`;
      html+=`<div class="modal-sec"><div class="modal-sec-title">📈 Estatísticas avançadas</div><div class="adv-grid">
        ${item("Finalizações",st.shots)}
        ${item("No alvo",st.shotsOnTarget)}
        ${item("Escanteios",st.corners)}
        ${item("Faltas",st.fouls)}
      </div></div>`;
    }
  }

  const goals=allGoalsForMatchV9(m,ofb);
  if(goals.length){
    html+='<div class="modal-sec"><div class="modal-sec-title">⚽ Gols</div>';
    goals.forEach(g=>{
      const isH=g.side==="home";
      const icon=g.owngoal?"🔴":g.penalty?"🎯":"⚽";
      const lbl=g.owngoal?" (contra)":g.penalty?" (pen)":"";
      html+=`<div class="ev-row"><div class="ev-min">${g.minute||"?"}'</div><div class="ev-icon">${icon}</div><div class="ev-name">${g.name||"-"}${lbl}</div><div class="ev-team">${isH?fl(m.h):fl(m.a)}</div></div>`;
    });
    html+="</div>";
  }

  const b1=cardsForMatch(m,"home"), b2=cardsForMatch(m,"away");
  const cards=dedupeEventsV9([...b1.map(b=>({...b,side:"home",team:m.h})),...b2.map(b=>({...b,side:"away",team:m.a}))])
    .sort((a,b)=>parseInt(a.minute||999)-parseInt(b.minute||999));

  if(cards.length){
    html+='<div class="modal-sec"><div class="modal-sec-title">🟨 Cartões</div>';
    cards.forEach(b=>{
      const isH=b.side==="home";
      const icon=cardType(b)==="red"?"🟥":"🟨";
      html+=`<div class="ev-row"><div class="ev-min">${b.minute||"?"}'</div><div class="ev-icon">${icon}</div><div class="ev-name">${b.name||b.player||"-"}</div><div class="ev-team">${isH?fl(m.h):fl(m.a)}</div></div>`;
    });
    html+="</div>";
  }

  const lh=live?.lineups?.home||[];
  const la=live?.lineups?.away||[];
  if(lh.length||la.length){
    html+=`<div class="modal-sec"><div class="modal-sec-title">👥 Escalações</div>
      <div class="live-columns">
        <div class="team-box"><div class="team-box-title">${fl(m.h)} ${pt(m.h)}</div>${lh.map(p=>`<div class="player-line">${p}</div>`).join("")}</div>
        <div class="team-box"><div class="team-box-title">${fl(m.a)} ${pt(m.a)}</div>${la.map(p=>`<div class="player-line">${p}</div>`).join("")}</div>
      </div>
    </div>`;
  }else if(mSt(m)==="live"){
    html+=`<div class="modal-sec"><div class="modal-sec-title">👥 Escalações</div><div class="no-data">Escalações não disponíveis na fonte atual. A seção já está pronta para preencher em LIVE_MATCHES.lineups.</div></div>`;
  }

  const s1=ofb?(ofb.subs1||ofb.substitutions1||[]):[],s2=ofb?(ofb.subs2||ofb.substitutions2||[]):[];
  if(s1.length||s2.length){
    html+='<div class="modal-sec"><div class="modal-sec-title">🔄 Substituições</div>';
    [...s1.map(s=>({...s,side:"home"})),...s2.map(s=>({...s,side:"away"}))]
      .sort((a,b)=>parseInt(a.minute||0)-parseInt(b.minute||0))
      .forEach(s=>{
        const isH=s.side==="home";
        html+=`<div class="ev-row"><div class="ev-min">${s.minute||"?"}'</div><div class="ev-icon">🔄</div><div class="ev-name"><span style="color:var(--green)">▲</span> ${s.player_in||s.in||"-"} / <span style="color:var(--live)">▼</span> ${s.player_out||s.out||"-"}</div><div class="ev-team">${isH?fl(m.h):fl(m.a)}</div></div>`;
      });
    html+="</div>";
  }

  if(!html)html+='<div class="no-data">Eventos ainda não disponíveis nas fontes atuais</div>';
  return html;
}
function startMTmr(m){
  if(modalTmr)clearInterval(modalTmr);
  if(mSt(m)!=="live")return;
  modalTmr=setInterval(()=>{
    const data=mData(m);
    const tv=document.getElementById("mtv");const tb=document.getElementById("mtb");
    if(tv)tv.textContent=getMin(m,data)||"AO VIVO";
    if(tb)tb.style.width=tPct(m,data)+"%";
  },1000);
}
function closeModal(e){
  if(e&&e.target!==document.getElementById("modalOverlay"))return;
  document.getElementById("modalOverlay").classList.remove("on");
  document.body.style.overflow="";
  modalId=null;if(modalTmr){clearInterval(modalTmr);modalTmr=null;}
}
let tY=0;
document.getElementById("modalBox").addEventListener("touchstart",e=>{tY=e.touches[0].clientY;},{passive:true});
document.getElementById("modalBox").addEventListener("touchmove",e=>{if(e.touches[0].clientY-tY>70){document.getElementById("modalOverlay").classList.remove("on");document.body.style.overflow="";}},{passive:true});



// V8 - Base disciplinar local do torneio.
// Use esta lista para alimentar cartões quando as APIs gratuitas não entregarem bookings.
// Formato: {match:"home|away", team:"Brazil", player:"Casemiro", minute:"?", card:"yellow"}
// Observação: por segurança, só mantive registros que já estavam no app/local.
// À medida que os cartões oficiais forem conhecidos, basta adicionar novas linhas aqui.
const DISCIPLINE_LOG = [];


// V10 - Totais agregados por seleção quando a fonte informa o total, mas não todos os jogadores.
// Exemplo: matéria informa "Paraguai recebeu 5 amarelos", mas só nomeia Almirón.
// O ranking por seleção usa estes totais; o ranking por jogador usa apenas jogadores identificados.
const DISCIPLINE_TEAM_TOTALS = {};
Object.assign(DISCIPLINE_TEAM_TOTALS, DATA.disciplineTeamTotals || {});

function teamDisciplineTotalV10(team){
  const key=Object.keys(DISCIPLINE_TEAM_TOTALS).find(k=>nm(k,team));
  return key?DISCIPLINE_TEAM_TOTALS[key]:null;
}

function disciplineCardsForMatch(m, side){
  const team = side==="home" ? m.h : m.a;
  const k = matchKey(m.h,m.a);
  return DISCIPLINE_LOG
    .filter(c=>c.match===k && nm(c.team, team))
    .map(c=>({team:c.team,name:c.player,minute:c.minute,card:c.card,source:"DISCIPLINE_LOG"}));
}

function allTournamentTeamsV8(){
  const set=new Set();
  F.filter(m=>m.ph==="grupos").forEach(m=>{set.add(m.h);set.add(m.a);});
  return [...set];
}

function liveExtraFor(m){
  return LIVE_MATCHES[matchKey(m.h,m.a)] || null;
}

function cardType(b){const raw=String(b.card||b.type||b.event||b.text||b.displayName||"yellow").toLowerCase();return raw.includes("red")||raw.includes("vermelho")?"red":"yellow";}
function overrideEvents(m){const k=matchKey(m.h,m.a);const a=EVENT_OVERRIDES[k]||{goals:[],cards:[]};const b=LIVE_MATCHES[k]||{goals:[],cards:[]};return{goals:[...(a.goals||[]),...(b.goals||[])],cards:[...(a.cards||[]),...(b.cards||[])]};}
function espnDetailsFor(m){const e=espnGame(m.h,m.a);if(!e)return[];const s=ESPN_SUMMARIES[e.id];return s?.competitions?.[0]?.details||s?.details||[];}
function espnCardsFor(m,side){
  const team=side==="home"?m.h:m.a;
  const arr=[...espnEventsForMatch(m,'yellow'),...espnEventsForMatch(m,'red')];
  return arr.filter(c=>sameTeamV14(c.team,team)).map(c=>({name:c.name||c.player,player:c.player||c.name,minute:c.minute||"?",card:c.card||c.type,team:c.team,source:"ESPN"}));
}
function dedupeEventsV9(arr){
  const seen=new Set();
  return (arr||[]).filter(e=>{
    const k=eventKeyV9(e);
    if(seen.has(k))return false;
    seen.add(k);
    return true;
  });
}
function localGoalsForMatchV9(m){
  const k=matchKey(m.h,m.a);
  const ev=[...(overrideEvents(m).goals||[]), ...dataEvents(k,'goal').map(e=>({name:e.player,team:e.team,minute:e.minute,source:e.source,type:'goal'})), ...espnEventsForMatch(m,'goal')];
  return dedupeEventsV9(ev.map(g=>({name:g.name||g.player,team:g.team,minute:g.minute,penalty:g.penalty,owngoal:g.owngoal,type:g.type||"goal"})));
}
function allGoalsForMatchV9(m,ofb){
  const goals=[];
  if(ofb){
    (ofb.goals1||[]).forEach(g=>goals.push({...g,team:m.h,side:"home",type:"goal"}));
    (ofb.goals2||[]).forEach(g=>goals.push({...g,team:m.a,side:"away",type:"goal"}));
  }
  localGoalsForMatchV9(m).forEach(g=>goals.push({...g,side:nm(g.team,m.h)?"home":"away"}));
  return dedupeEventsV9(goals).sort((a,b)=>parseInt(a.minute||999)-parseInt(b.minute||999));
}
function goalsSummaryV9(m){
  const ofb=ofbMatch(m.h,m.a);
  const goals=allGoalsForMatchV9(m,ofb);
  const h=goals.filter(g=>g.side==="home").map(g=>`${(g.name||"-").split(" ").pop()}${g.minute?" "+g.minute+"'":""}${g.penalty?" (P)":""}`);
  const a=goals.filter(g=>g.side==="away").map(g=>`${(g.name||"-").split(" ").pop()}${g.minute?" "+g.minute+"'":""}${g.penalty?" (P)":""}`);
  if(!h.length&&!a.length)return "";
  return `<div class="mc-goals">${h.length?fl(m.h)+" "+h.join(", "):""}${h.length&&a.length?" | ":""}${a.length?fl(m.a)+" "+a.join(", "):""}</div>`;
}

function cardPlayerNameV8(c){return c.name||c.player||c.athlete||c.displayName||c.text||"Jogador não informado";}
function cardMinuteV8(c){return c.minute||c.time||c.clock||"?";}


/* ============================
   V17 HOTFIX
   Corrige travamento das abas Stats/Brasil:
   - cardsForMatch estava ausente
   - eventKeyV9 estava ausente
   - sameTeamV14 ficou como sobra da V14
   - espnDetailsFor antigo lia ESPN_GAMES em vez de ESPN_EVENTS
============================ */
function sameTeamV14(a,b){ return sameTeamV16(a,b); }

function eventKeyV9(e){
  return [
    canon(e.name||e.player||e.athlete||e.displayName||e.text||""),
    canon(e.team||""),
    String(e.minute||e.time||e.clock||"?").replace(/[^0-9+]/g,""),
    String(e.type||e.card||e.event||"")
  ].join("|");
}

function espnDetailsFor(m){
  const event=espnEventFor(m);
  if(!event)return [];
  const summary=event.id ? ESPN_SUMMARIES[String(event.id)] : null;
  const comp=event.competitions?.[0];
  return summary?.competitions?.[0]?.details || summary?.details || comp?.details || [];
}

function cardsForMatch(m,side){
  const team=side==="home"?m.h:m.a;
  const ofb=ofbMatch(m.h,m.a);
  let cards=[];

  if(ofb){
    const arr=side==="home"?(ofb.bookings1||ofb.cards1||[]):(ofb.bookings2||ofb.cards2||[]);
    cards.push(...(arr||[]).map(c=>({...c,team})));
  }

  cards.push(...espnCardsFor(m,side));
  cards.push(...disciplineCardsForMatch(m,side));

  const ov=overrideEvents(m).cards||[];
  cards.push(...ov.filter(c=>sameTeamV16(c.team,team)));

  const seen=new Set();
  return cards.filter(c=>{
    const type=cardType(c);
    const name=c.name||c.player||c.athlete||c.displayName||c.text||"Jogador";
    const key=`${canon(name)}|${canon(team)}|${String(c.minute||c.time||c.clock||"?")}|${type}`;
    if(seen.has(key))return false;
    seen.add(key);
    c.name=name;
    c.team=c.team||team;
    c.card=type;
    return true;
  });
}



/* ============================
   V18 ESPN DETAIL HOTFIX
   Usa ESPN direto no navegador, sem pastas:
   - placares e status
   - autores dos gols
   - cartões quando disponíveis
   - estatísticas de jogo quando disponíveis
============================ */
function espnSummaryFor(m){
  const ev=espnEventFor(m);
  if(!ev||!ev.id)return null;
  return ESPN_SUMMARIES[String(ev.id)] || null;
}

function espnCompFor(m){
  const ev=espnEventFor(m);
  const s=espnSummaryFor(m);
  return s?.header?.competitions?.[0] || s?.competitions?.[0] || ev?.competitions?.[0] || null;
}

function espnDetailsFor(m){
  const ev=espnEventFor(m);
  const s=espnSummaryFor(m);
  const comp=espnCompFor(m);
  return s?.details || s?.header?.competitions?.[0]?.details || s?.competitions?.[0]?.details || comp?.details || [];
}

function espnBoxTeamFor(m,side){
  const s=espnSummaryFor(m);
  const boxTeams=s?.boxscore?.teams || s?.boxscore?.statistics || [];
  const team=side==="home"?m.h:m.a;
  return (boxTeams||[]).find(x=>{
    const n=x?.team?.displayName||x?.team?.name||x?.team?.shortDisplayName||x?.displayName||"";
    return sameTeamV16(n,team);
  })||null;
}

function espnStatsObjFor(m,side){
  const comp=espnCompFor(m);
  const team=side==="home"?m.h:m.a;
  const c=(comp?.competitors||[]).find(x=>sameTeamV16(espnTeamName(x),team));
  const b=espnBoxTeamFor(m,side);
  return c?.statistics?.length ? c : b;
}

function espnTeamStatsFor(m){
  const h=espnStatsObjFor(m,"home"), a=espnStatsObjFor(m,"away");
  if(!h&&!a)return null;

  const get=(obj,names)=>{
    const arr=obj?.statistics || obj?.stats || [];
    const it=(arr||[]).find(x=>{
      const nm=String(x.name||x.abbreviation||x.label||x.displayName||"");
      const lbl=nm.toLowerCase();
      return names.some(n=>lbl===n.toLowerCase()||lbl.includes(n.toLowerCase()));
    });
    if(!it)return null;
    const v=String(it.displayValue??it.value??it.display??"").replace("%","");
    const num=parseFloat(v);
    return Number.isFinite(num)?num:v;
  };

  return {
    possession:{home:get(h,["possessionPct","possession","PP"]),away:get(a,["possessionPct","possession","PP"])},
    shots:{home:get(h,["totalShots","total shots","shots","SHOT"]),away:get(a,["totalShots","total shots","shots","SHOT"])},
    shotsOnTarget:{home:get(h,["shotsOnTarget","shots on target","SOG"]),away:get(a,["shotsOnTarget","shots on target","SOG"])},
    corners:{home:get(h,["wonCorners","corners","corner kicks","CW"]),away:get(a,["wonCorners","corners","corner kicks","CW"])},
    fouls:{home:get(h,["foulsCommitted","fouls","FC"]),away:get(a,["foulsCommitted","fouls","FC"])}
  };
}

function cardsForMatch(m,side){
  const team=side==="home"?m.h:m.a;
  const ofb=ofbMatch(m.h,m.a);
  let cards=[];

  if(ofb){
    const arr=side==="home"?(ofb.bookings1||ofb.cards1||[]):(ofb.bookings2||ofb.cards2||[]);
    cards.push(...(arr||[]).map(c=>({...c,team})));
  }

  cards.push(...espnCardsFor(m,side));
  cards.push(...disciplineCardsForMatch(m,side));

  const ov=overrideEvents(m).cards||[];
  cards.push(...ov.filter(c=>sameTeamV16(c.team,team)));

  const seen=new Set();
  return cards.filter(c=>{
    const type=cardType(c);
    const name=c.name||c.player||c.athlete||c.displayName||c.text||"Jogador";
    const key=`${canon(name)}|${canon(team)}|${String(c.minute||c.time||c.clock||"?")}|${type}`;
    if(seen.has(key))return false;
    seen.add(key);
    c.name=name;
    c.team=c.team||team;
    c.card=type;
    return true;
  });
}


// ============================
// V24 - CARTÕES HOTFIX
// ============================
function espnStatCardCountV24(m,side,type="yellow"){
  const obj=espnStatsObjFor(m,side);
  const names=type==="red"
    ? ["redCards","red cards","red card","cartões vermelhos","vermelhos","RC"]
    : ["yellowCards","yellow cards","yellow card","cartões amarelos","amarelos","YC"];

  const v=statExtractV20(obj,names);
  const n=parseInt(String(v??"").replace(/[^\d]/g,""),10);
  return Number.isFinite(n)?n:0;
}

function recursiveCardEventsV24(m){
  const s=espnSummaryFor(m);
  if(!s)return [];

  const candidates=[];
  const seenObj=new Set();

  function walk(node,depth=0){
    if(!node||depth>7)return;
    if(typeof node!=="object")return;
    if(seenObj.has(node))return;
    seenObj.add(node);

    if(Array.isArray(node)){
      node.forEach(x=>walk(x,depth+1));
      return;
    }

    const raw=[
      node.type?.text,node.type?.name,node.type?.abbreviation,
      node.text,node.description,node.displayName,node.label,
      node.card,node.event,node.shortText
    ].filter(Boolean).join(" ").toLowerCase();

    const isYellow=/yellow|amarelo|amarela/.test(raw);
    const isRed=/red card|vermelho|vermelha|second yellow|segundo amarelo/.test(raw);

    if(isYellow||isRed){
      const team=
        node.team?.displayName||node.team?.shortDisplayName||node.team?.name||
        node.competitor?.displayName||node.competitor?.name||
        node.club?.displayName||node.club?.name||
        node.teamName||"";

      const athlete=
        node.athlete?.displayName||node.athlete?.shortName||node.athlete?.name||
        node.player?.displayName||node.player?.shortName||node.player?.name||
        node.participants?.[0]?.athlete?.displayName||
        node.participants?.[0]?.displayName||
        node.name||"Jogador não informado";

      const minute=
        node.clock?.displayValue||node.clock?.value||
        node.minute||node.time||node.displayClock||"?";

      candidates.push({
        name:athlete,
        player:athlete,
        team,
        minute:String(minute).replace("'",""),
        card:isRed?"red":"yellow",
        source:"ESPN"
      });
    }

    Object.values(node).forEach(v=>walk(v,depth+1));
  }

  walk(s);

  const unique=new Set();
  return candidates.filter(c=>{
    const key=[
      canon(c.name),
      canon(c.team),
      String(c.minute||"?"),
      c.card
    ].join("|");
    if(unique.has(key))return false;
    unique.add(key);
    return true;
  });
}

function espnCardsForV24(m,side){
  const team=side==="home"?m.h:m.a;
  const direct=[
    ...espnEventsForMatch(m,"yellow"),
    ...espnEventsForMatch(m,"red")
  ].map(c=>({
    name:c.name||c.player||"Jogador não informado",
    player:c.player||c.name||"Jogador não informado",
    minute:c.minute||c.time||c.clock||"?",
    card:c.card||c.type||c.event||"yellow",
    team:c.team||"",
    source:"ESPN"
  }));

  const recursive=recursiveCardEventsV24(m);
  const all=[...direct,...recursive].filter(c=>{
    if(c.team)return sameTeamV16(c.team,team);
    return false;
  });

  const seen=new Set();
  return all.filter(c=>{
    const key=[canon(c.name),canon(team),String(c.minute||"?"),cardType(c)].join("|");
    if(seen.has(key))return false;
    seen.add(key);
    c.team=team;
    c.card=cardType(c);
    return true;
  });
}

function cardsForMatchV24(m,side){
  const team=side==="home"?m.h:m.a;
  const ofb=ofbMatch(m.h,m.a);
  let cards=[];

  if(ofb){
    const arr=side==="home"?(ofb.bookings1||ofb.cards1||[]):(ofb.bookings2||ofb.cards2||[]);
    cards.push(...(arr||[]).map(c=>({...c,team,source:"openfootball"})));
  }

  cards.push(...espnCardsForV24(m,side));
  cards.push(...disciplineCardsForMatch(m,side));

  const ov=overrideEvents(m).cards||[];
  cards.push(...ov.filter(c=>sameTeamV16(c.team,team)));

  const seen=new Set();
  const identified=cards.filter(c=>{
    const type=cardType(c);
    const name=c.name||c.player||c.athlete||c.displayName||c.text||"Jogador não informado";
    const key=[canon(name),canon(team),String(c.minute||c.time||c.clock||"?"),type].join("|");
    if(seen.has(key))return false;
    seen.add(key);
    c.name=name;
    c.team=team;
    c.card=type;
    return true;
  });

  // Se a fonte tem o total, mas não os nomes, completa apenas a quantidade.
  ["yellow","red"].forEach(type=>{
    const official=espnStatCardCountV24(m,side,type);
    const known=identified.filter(c=>cardType(c)===type).length;
    for(let i=known;i<official;i++){
      identified.push({
        name:"Jogador não informado",
        player:"Jogador não informado",
        minute:"?",
        card:type,
        team,
        source:"ESPN total",
        aggregate:true,
        aggregateIndex:i+1
      });
    }
  });

  return identified;
}

// Substitui a implementação anterior sem perder os fallbacks.
cardsForMatch = cardsForMatchV24;

function teamCardTotalsV24(team){
  let yc=0,rc=0;

  F.filter(m=>mSt(m)!=="upcoming"&&(nm(m.h,team)||nm(m.a,team))).forEach(m=>{
    const side=nm(m.h,team)?"home":"away";
    const cards=cardsForMatchV24(m,side);
    yc+=cards.filter(c=>cardType(c)==="yellow").length;
    rc+=cards.filter(c=>cardType(c)==="red").length;
  });

  return {yc,rc};
}

function renderStats(){
  const finished=F.filter(m=>{const d=mData(m);return mSt(m)==="finished"&&d&&d.hasScore;});
  const liveMatches=F.filter(m=>mSt(m)==="live");
  const liveNow=liveMatches.length;
  const played=finished.length;

  const teams={};
  allTournamentTeamsV8().forEach(t=>teams[t]={nm:t,j:0,v:0,e:0,d:0,gp:0,gc:0,sg:0,pts:0,cs:0,yc:0,rc:0,totalCards:0,agg:false});

  finished.forEach(m=>{
    const data=mData(m);if(!data||!data.hasScore)return;
    const hs=+data.hs,as=+data.as;
    const h=teams[m.h]||(teams[m.h]={nm:m.h,j:0,v:0,e:0,d:0,gp:0,gc:0,sg:0,pts:0,cs:0,yc:0,rc:0,totalCards:0,agg:false});
    const a=teams[m.a]||(teams[m.a]={nm:m.a,j:0,v:0,e:0,d:0,gp:0,gc:0,sg:0,pts:0,cs:0,yc:0,rc:0,totalCards:0,agg:false});
    h.j++;a.j++;h.gp+=hs;h.gc+=as;h.sg+=hs-as;a.gp+=as;a.gc+=hs;a.sg+=as-hs;
    if(as===0)h.cs++;if(hs===0)a.cs++;
    if(hs>as){h.v++;h.pts+=3;a.d++;}else if(hs<as){a.v++;a.pts+=3;h.d++;}else{h.e++;a.e++;h.pts++;a.pts++;}
  });

  const cardPlayers={};
  F.filter(m=>mSt(m)!=="upcoming").forEach(m=>{
    ["home","away"].forEach(side=>{
      const team=side==="home"?m.h:m.a;
      const cards=cardsForMatch(m,side);
      cards.forEach(c=>{
        const type=cardType(c), name=cardPlayerNameV8(c), minute=cardMinuteV8(c);
        const key=canon(name)+"|"+canon(team);
        if(c.aggregate || canon(name)==="jogador nao informado")return;
        if(!cardPlayers[key])cardPlayers[key]={name,team,yc:0,rc:0,total:0,mins:[],source:c.source||""};
        if(type==="red"){cardPlayers[key].rc++;}
        else{cardPlayers[key].yc++;}
        cardPlayers[key].total++;cardPlayers[key].mins.push(minute);
      });
    });
  });

  // V24: usa o maior valor confiável entre eventos individuais,
  // estatísticas agregadas da ESPN e eventual total configurado.
  Object.values(teams).forEach(t=>{
    const auto=teamCardTotalsV24(t.nm);
    const agg=teamDisciplineTotalV10(t.nm);

    t.yc=Math.max(auto.yc||0,agg?.yc||0);
    t.rc=Math.max(auto.rc||0,agg?.rc||0);
    t.agg=!!agg || auto.yc>0 || auto.rc>0;
    t.cardSource=agg?.source || "ESPN + eventos";
    t.totalCards=t.yc+t.rc;
  });

  const teamList=Object.values(teams);
  const activeTeams=teamList.filter(t=>t.j>0);
  const totalG=finished.reduce((s,m)=>{const d=mData(m);return s+(+d.hs||0)+(+d.as||0);},0);
  const avg=played>0?(totalG/played).toFixed(1):"—";
  const pct=Math.round(played/104*100);
  const totalY=teamList.reduce((s,t)=>s+t.yc,0);
  const totalR=teamList.reduce((s,t)=>s+t.rc,0);
  const totalCS=teamList.reduce((s,t)=>s+t.cs,0);

  const topPts=[...activeTeams].sort((a,b)=>b.pts-a.pts||b.sg-a.sg||b.gp-a.gp).slice(0,10);
  const topAtk=[...activeTeams].sort((a,b)=>b.gp-a.gp||b.sg-a.sg).slice(0,10);
  const topDef=[...activeTeams].sort((a,b)=>a.gc-b.gc||b.cs-a.cs).slice(0,10);
  const topCS=[...activeTeams].sort((a,b)=>b.cs-a.cs||a.gc-b.gc).filter(t=>t.cs>0).slice(0,10);

  const discTeams=[...teamList].filter(t=>t.totalCards>0).sort((a,b)=>b.totalCards-a.totalCards||b.rc-a.rc||b.yc-a.yc||pt(a.nm).localeCompare(pt(b.nm)));
  const discPlayers=[...Object.values(cardPlayers)].filter(p=>p.total>0).sort((a,b)=>b.total-a.total||b.rc-a.rc||b.yc-a.yc||a.name.localeCompare(b.name));
  const yellowPlayers=[...Object.values(cardPlayers)].sort((a,b)=>b.yc-a.yc||b.rc-a.rc||a.name.localeCompare(b.name)).filter(p=>p.yc>0);
  const redPlayers=[...Object.values(cardPlayers)].sort((a,b)=>b.rc-a.rc||b.yc-a.yc||a.name.localeCompare(b.name)).filter(p=>p.rc>0);

  // Artilheiros - V8
  // Correção: a V20 contava alguns gols duas vezes.
  // Primeiro contava os gols vindos do openfootball e depois recontava os mesmos
  // dentro de allGoalsForMatchV9(). Agora o ranking nasce de uma única lista
  // deduplicada por jogo + jogador + seleção + minuto.
  function cleanScorerV21(name){
    return String(name||"")
      .replace(/\s*\(.*?\)\s*/g," ")
      .replace(/\s+/g," ")
      .trim();
  }

  let scorersMap={};
  const countedGoalsV21=new Set();

  F.filter(m=>mSt(m)!=="upcoming").forEach(m=>{
    const ofb=ofbMatch(m.h,m.a);
    allGoalsForMatchV9(m,ofb)
      .filter(g=>!g.owngoal)
      .forEach(g=>{
        const name=cleanScorerV21(g.name||g.player||"");
        const team=g.team || (g.side==="home"?m.h:m.a) || "";
        if(!name || name==="-" || canon(name)==="jogador") return;

        const goalKey=[
          m.id || matchKey(m.h,m.a),
          canon(name),
          canon(team),
          String(g.minute||g.time||g.clock||"?").replace(/[^0-9+]/g,"")
        ].join("|");

        if(countedGoalsV21.has(goalKey)) return;
        countedGoalsV21.add(goalKey);

        const playerKey=canon(name)+"|"+canon(team);
        scorersMap[playerKey]=(scorersMap[playerKey]||{name:name,goals:0,team:team});
        scorersMap[playerKey].goals++;
      });
  });

  const sList=Object.values(scorersMap).sort((a,b)=>b.goals-a.goals||a.name.localeCompare(b.name)).slice(0,12);

  const biggest=finished.map(m=>{const d=mData(m);const hs=+d.hs,as=+d.as;return{m,hs,as,diff:Math.abs(hs-as),total:hs+as,winner:hs>as?m.h:as>hs?m.a:"Empate"};}).sort((a,b)=>b.diff-a.diff||b.total-a.total).slice(0,8);
  const maxGP=topAtk[0]?.gp||1;

  const teamFlag=(team)=>{const fk=Object.keys(FL).find(k=>nm(k,team));return fk?fl(fk):fl(team);};
  const teamPT=(team)=>{const tk=Object.keys(PT).find(k=>nm(k,team));return tk?pt(tk):pt(team);};

  const listRows=(arr,valFn,subFn)=>arr.length?arr.map((t,i)=>`<div class="li"><div class="li-rk${i<3?" top":""}">${i+1}</div><div class="li-fl">${fl(t.nm)}</div><div class="li-inf"><div class="li-nm">${pt(t.nm)}</div><div class="li-sb">${subFn(t)}</div></div><div class="li-val">${valFn(t)}</div></div>`).join(""):'<div class="no-data">Aguardando dados</div>';

  const ptsH=listRows(topPts,t=>t.pts,t=>`${t.v}V ${t.e}E ${t.d}D · SG ${t.sg>0?"+":""}${t.sg}`);
  const atkH=topAtk.length?topAtk.map((t,i)=>`<div class="li"><div class="li-rk${i<3?" top":""}">${i+1}</div><div class="li-fl">${fl(t.nm)}</div><div class="li-inf"><div class="li-nm">${pt(t.nm)}</div><div class="li-sb">${t.j} jogo(s) · SG ${t.sg>0?"+":""}${t.sg}</div><div class="li-bar-wrap" style="margin-top:4px"><div class="li-bar" style="width:${Math.round(t.gp/maxGP*100)}%"></div></div></div><div class="li-val">${t.gp}</div></div>`).join(""):'<div class="no-data">Aguardando gols</div>';
  const defH=listRows(topDef,t=>t.gc,t=>`${t.j} jogo(s) · clean sheets ${t.cs}`);
  const csH=listRows(topCS,t=>t.cs,t=>`${t.j} jogo(s) · gols sofridos ${t.gc}`);
  const scorH=sList.length?sList.map((s,i)=>`<div class="li"><div class="li-rk${i<3?" top":""}">${i+1}</div><div class="li-fl">${teamFlag(s.team)}</div><div class="li-inf"><div class="li-nm">${s.name}</div><div class="li-sb">${teamPT(s.team)}</div></div><div class="li-val">${s.goals} ⚽</div></div>`).join(""):'<div class="no-data">Aguardando artilheiros</div>';
  const bigH=biggest.length?biggest.map((x,i)=>`<div class="li"><div class="li-rk${i<3?" top":""}">${i+1}</div><div class="li-fl">${x.winner==="Empate"?"🤝":fl(x.winner)}</div><div class="li-inf"><div class="li-nm">${pt(x.m.h)} ${x.hs} x ${x.as} ${pt(x.m.a)}</div><div class="li-sb">${x.m.g} · saldo ${x.diff}</div></div><div class="li-val">${x.total}</div></div>`).join(""):'<div class="no-data">Aguardando jogos finalizados</div>';

  const discTeamTable=`<table class="disc-table"><thead><tr><th>Seleção</th><th><span class="cardbox y"></span></th><th><span class="cardbox r"></span></th><th>Total</th></tr></thead><tbody>${discTeams.map((t,i)=>`<tr${t.agg?' class="unknown-row"':''}><td><div class="disc-team"><span class="disc-rk${i<3?" top":""}">${i+1}</span><span>${fl(t.nm)}</span><span class="disc-name">${pt(t.nm)}${t.agg?'*':''}</span></div></td><td>${t.yc}</td><td>${t.rc}</td><td>${t.yc+t.rc}</td></tr>`).join("")}</tbody></table>`;

  const discPlayerTable=discPlayers.length?`<table class="disc-table"><thead><tr><th>Jogador</th><th>Seleção</th><th><span class="cardbox y"></span></th><th><span class="cardbox r"></span></th><th>Total</th></tr></thead><tbody>${discPlayers.map((p,i)=>`<tr><td><div class="disc-team"><span class="disc-rk${i<3?" top":""}">${i+1}</span><span class="disc-name">${p.name}</span></div></td><td>${teamFlag(p.team)}</td><td>${p.yc}</td><td>${p.rc}</td><td>${p.total}</td></tr>`).join("")}</tbody></table>`:'<div class="no-data">Nenhum cartão por jogador disponível ainda</div>';
  const yellowTable=yellowPlayers.length?`<table class="disc-table"><thead><tr><th>Jogador</th><th>Seleção</th><th>Amarelos</th></tr></thead><tbody>${yellowPlayers.map((p,i)=>`<tr><td><div class="disc-team"><span class="disc-rk${i<3?" top":""}">${i+1}</span><span class="disc-name">${p.name}</span></div></td><td>${teamFlag(p.team)}</td><td>${p.yc}</td></tr>`).join("")}</tbody></table>`:'<div class="no-data">Sem cartões amarelos registrados</div>';
  const redTable=redPlayers.length?`<table class="disc-table"><thead><tr><th>Jogador</th><th>Seleção</th><th>Vermelhos</th></tr></thead><tbody>${redPlayers.map((p,i)=>`<tr><td><div class="disc-team"><span class="disc-rk${i<3?" top":""}">${i+1}</span><span class="disc-name">${p.name}</span></div></td><td>${teamFlag(p.team)}</td><td>${p.rc}</td></tr>`).join("")}</tbody></table>`:'<div class="no-data">Sem cartões vermelhos registrados</div>';

  return`<div class="stats-version">✓ V8"kpi-grid">
  <div class="kpi"><div class="kpi-n">${played}</div><div class="kpi-l">Jogos realizados</div></div>
  <div class="kpi"><div class="kpi-n" style="color:${liveNow?"var(--live)":"var(--gold)"}">${liveNow}</div><div class="kpi-l">Ao vivo agora</div></div>
  <div class="kpi"><div class="kpi-n">${totalG}</div><div class="kpi-l">Total de gols</div></div>
  <div class="kpi"><div class="kpi-n">${avg}</div><div class="kpi-l">Média gols/jogo</div></div>
  <div class="kpi wide">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px">
      <div class="kpi-l" style="margin:0">Progresso</div>
      <span style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--gold)">${played}/104</span>
    </div>
    <div class="prog-bar"><div class="prog-fill" style="width:${pct}%"></div></div>
    <div class="kpi-sub">${pct}% · Copa: 11 Jun - 19 Jul 2026</div>
  </div>
</div>

<div class="stat-mini-grid">
  <div class="stat-mini"><div class="stat-mini-n">${totalY}</div><div class="stat-mini-l">Amarelos</div></div>
  <div class="stat-mini"><div class="stat-mini-n" style="color:var(--rcard)">${totalR}</div><div class="stat-mini-l">Vermelhos</div></div>
  <div class="stat-mini"><div class="stat-mini-n">${totalCS}</div><div class="stat-mini-l">Clean sheets</div></div>
</div>

<div class="list-blk"><div class="lb-hdr"><span class="lhi">🏆</span><h3>APROVEITAMENTO</h3><span class="api-src">${played>0?"placares":"aguardando"}</span></div>${ptsH}</div>
<div class="list-blk"><div class="lb-hdr"><span class="lhi">⚽</span><h3>ARTILHEIROS</h3><span class="api-src">gols</span></div>${scorH}</div>
<div class="list-blk"><div class="lb-hdr"><span class="lhi">🥅</span><h3>MAIORES ATAQUES</h3><span class="api-src">gols pró</span></div>${atkH}</div>
<div class="list-blk"><div class="lb-hdr"><span class="lhi">🛡️</span><h3>MELHORES DEFESAS</h3><span class="api-src">gols contra</span></div>${defH}</div>
<div class="list-blk"><div class="lb-hdr"><span class="lhi">🧤</span><h3>CLEAN SHEETS</h3><span class="api-src">sem sofrer gols</span></div>${csH}</div>
<div class="list-blk"><div class="lb-hdr"><span class="lhi">📈</span><h3>MAIORES PLACARES</h3><span class="api-src">jogos finalizados</span></div>${bigH}</div>

<div class="list-blk">
  <div class="lb-hdr"><span class="lhi">🟨</span><h3>CARTÕES POR SELEÇÃO · TORNEIO</h3><span class="api-src">totais conhecidos</span></div>
  ${discTeamTable}
  <div class="agg-note"><b>* Totais agregados:</b> quando a fonte informa cartões da seleção, mas não nomeia todos os jogadores, o total entra no ranking por seleção. Ex.: Paraguai com 5 amarelos, mas apenas Almirón identificado individualmente.</div>
</div>

<div class="list-blk">
  <div class="lb-hdr"><span class="lhi">🎽</span><h3>CARTÕES POR JOGADOR · TORNEIO</h3><span class="api-src">jogadores identificados</span></div>
  ${discPlayerTable}
</div>

<div class="list-blk">
  <div class="lb-hdr"><span class="lhi">🟨</span><h3>AMARELOS POR JOGADOR</h3><span class="api-src">ranking</span></div>
  ${yellowTable}
</div>

<div class="list-blk">
  <div class="lb-hdr"><span class="lhi">🟥</span><h3>VERMELHOS POR JOGADOR</h3><span class="api-src">ranking</span></div>
  ${redTable}
  <div class="stat-source-warning"><b>Fonte dos cartões:</b> V24 usa eventos individuais e os totais estatísticos da ESPN. Quando a fonte informa a quantidade sem identificar o jogador, o total entra apenas no ranking por seleção. Sem cálculo de pontos disciplinares.</div>
</div>

<div class="list-blk"><div class="lb-hdr"><span class="lhi">📋</span><h3>SOBRE O TORNEIO</h3></div>
<table class="info-tbl">
  <tr><td>Edição</td><td>23ª Copa do Mundo FIFA</td></tr>
  <tr><td>Países sede</td><td>🇺🇸 EUA · 🇨🇦 Canadá · 🇲🇽 México</td></tr>
  <tr><td>Seleções</td><td>48 · 12 grupos de 4</td></tr>
  <tr><td>Total de jogos</td><td>104</td></tr>
  <tr><td>Final</td><td>19 Jul · MetLife, Nova York</td></tr>
  <tr><td>Versão</td><td style="color:var(--gold)">V8</td></tr>
</table></div>`;
}


function teamStatsV12(team){
  const games=F.filter(m=>m.h===team||m.a===team);
  const played=games.filter(m=>{const d=mData(m);return mSt(m)==="finished"&&d&&d.hasScore;});
  const live=games.filter(m=>mSt(m)==="live");
  const next=games.find(m=>mSt(m)==="upcoming"&&!isPlaceholderTeamV23(m.h)&&!isPlaceholderTeamV23(m.a)) || games.find(m=>mSt(m)==="upcoming");
  const s={j:0,v:0,e:0,d:0,gp:0,gc:0,sg:0,pts:0,next,live:live[0]||null,goals:[],cards:[],matches:[]};

  played.forEach(m=>{
    const d=mData(m);const isH=m.h===team;const gf=+(isH?d.hs:d.as),ga=+(isH?d.as:d.hs);
    s.j++;s.gp+=gf;s.gc+=ga;s.sg+=gf-ga;
    if(gf>ga){s.v++;s.pts+=3;}else if(gf===ga){s.e++;s.pts++;}else{s.d++;}
  });

  const seenGoals=new Set(), seenCards=new Set();

  games.filter(m=>mSt(m)!=="upcoming").forEach(m=>{
    const ofb=ofbMatch(m.h,m.a);
    allGoalsForMatchV9(m,ofb).filter(g=>nm(g.team,team)).forEach(g=>{
      const key=[m.id,canon(g.name||g.player||""),String(g.minute||g.time||"?").replace(/[^0-9+]/g,"")].join("|");
      if(!seenGoals.has(key)){seenGoals.add(key);s.goals.push(g);}
    });

    const side=m.h===team?"home":"away";
    cardsForMatch(m,side).forEach(c=>{
      const key=[m.id,canon(c.name||c.player||""),String(c.minute||c.time||"?").replace(/[^0-9+]/g,""),cardType(c)].join("|");
      if(!seenCards.has(key)){seenCards.add(key);s.cards.push(c);}
    });

    const d=mData(m);
    s.matches.push({
      match:m,
      data:d,
      stats:espnTeamStatsFor(m),
      state:mSt(m)
    });
  });

  return s;
}


function brazilMatchStatsHtmlV22(s){
  const played=s.matches.filter(x=>x.state!=="upcoming");
  if(!played.length)return '<div class="no-data">Aguardando jogos do Brasil</div>';

  return played.map(x=>{
    const m=x.match,d=x.data||{};
    const isH=m.h==="Brazil";
    const opp=isH?m.a:m.h;
    const gf=isH?d.hs:d.as, ga=isH?d.as:d.hs;
    const st=x.stats;
    const homeStats=st?.home||{}, awayStats=st?.away||{};
    const mine=isH?homeStats:awayStats;
    const other=isH?awayStats:homeStats;

    const rows=[
      ["Posse",mine.possession,other.possession,"%"],
      ["Chutes",mine.shots,other.shots,""],
      ["Chutes a gol",mine.shotsOnGoal,other.shotsOnGoal,""],
      ["Escanteios",mine.corners,other.corners,""],
      ["Faltas",mine.fouls,other.fouls,""],
      ["Impedimentos",mine.offsides,other.offsides,""],
      ["Amarelos",mine.yellowCards,other.yellowCards,""],
      ["Vermelhos",mine.redCards,other.redCards,""]
    ].filter(r=>r[1]!==null&&r[1]!==undefined&&r[2]!==null&&r[2]!==undefined);

    const statRows=rows.length?rows.map(r=>`
      <div class="pro-row">
        <div class="pro-v" style="min-width:38px;text-align:left">${r[1]}${r[3]}</div>
        <div class="pro-l" style="text-align:center;flex:1">${r[0]}</div>
        <div class="pro-v" style="min-width:38px;text-align:right">${r[2]}${r[3]}</div>
      </div>`).join(""):'<div class="no-data">Estatísticas detalhadas ainda não entregues pela fonte</div>';

    return `<div class="pro-card">
      <div class="pro-title">${fl("Brazil")} Brasil ${gf??"-"} x ${ga??"-"} ${pt(opp)} ${fl(opp)}</div>
      <div class="kpi-sub" style="margin-bottom:8px">${fmtD(m.d)} · ${m.v||""}</div>
      ${statRows}
    </div>`;
  }).join("");
}

function renderBrasil(){
  const team="Brazil";
  const s=teamStatsV12(team);
  const prof=(DATA.teamProfiles||{})[team]||{};
  const n=s.next, live=s.live;
  const nextHtml=live?`<div class="next-match"><div class="next-team">${fl(live.h)} ${pt(live.h)} x ${pt(live.a)} ${fl(live.a)}</div><div class="next-time">AO VIVO</div></div>`:
    n?`<div class="next-match"><div class="next-team">${fl(n.h)} ${pt(n.h)} x ${pt(n.a)} ${fl(n.a)}</div><div class="next-time">${n.d.split("-").slice(1).reverse().join("/")} · ${n.t}</div></div>`:
    `<div class="no-data">Sem próximo jogo cadastrado</div>`;

  const goalsH=s.goals.length?s.goals.map((g,i)=>`<div class="li"><div class="li-rk${i<3?" top":""}">${i+1}</div><div class="li-fl">⚽</div><div class="li-inf"><div class="li-nm">${g.name||"-"}</div><div class="li-sb">${g.minute||"?"}' · ${pt(g.team)}</div></div></div>`).join(""):'<div class="no-data">Sem gols cadastrados</div>';
  const cardsH=s.cards.length?s.cards.map((c,i)=>`<div class="li"><div class="li-rk${i<3?" top":""}">${i+1}</div><div class="li-fl">${cardType(c)==="red"?"🟥":"🟨"}</div><div class="li-inf"><div class="li-nm">${c.name||c.player||"-"}</div><div class="li-sb">${c.minute||"?"}'</div></div></div>`).join(""):'<div class="no-data">Sem cartões cadastrados</div>';

  return `<div class="pro-badge">✓ V8"team-hero">
    <div class="team-hero-title">${fl(team)} Brasil</div>
    <div class="team-hero-sub">Grupo C · ${prof.notes||"Painel dedicado da seleção"}</div>
    ${nextHtml}
  </div>

  <div class="kpi-grid">
    <div class="kpi"><div class="kpi-n">${s.pts}</div><div class="kpi-l">Pontos</div></div>
    <div class="kpi"><div class="kpi-n">${s.j}</div><div class="kpi-l">Jogos</div></div>
    <div class="kpi"><div class="kpi-n">${s.gp}</div><div class="kpi-l">Gols pró</div></div>
    <div class="kpi"><div class="kpi-n">${s.gc}</div><div class="kpi-l">Gols contra</div></div>
  </div>

  <div class="pro-card"><div class="pro-title">📊 Campanha</div>
    <div class="pro-row"><div class="pro-l">Vitórias</div><div class="pro-v">${s.v}</div></div>
    <div class="pro-row"><div class="pro-l">Empates</div><div class="pro-v">${s.e}</div></div>
    <div class="pro-row"><div class="pro-l">Derrotas</div><div class="pro-v">${s.d}</div></div>
    <div class="pro-row"><div class="pro-l">Saldo</div><div class="pro-v">${s.sg>0?"+":""}${s.sg}</div></div>
  </div>

  <div class="list-blk"><div class="lb-hdr"><span class="lhi">⚽</span><h3>GOLS DO BRASIL</h3><span class="api-src">${espnOk?"ESPN":ofbOk?"openfootball":"cache"}</span></div>${goalsH}</div>
  <div class="list-blk"><div class="lb-hdr"><span class="lhi">🟨</span><h3>CARTÕES DO BRASIL</h3><span class="api-src">${espnOk?"ESPN":espnCacheUsedV22?"cache":"aguardando"}</span></div>${cardsH}</div>

  <div class="list-blk"><div class="lb-hdr"><span class="lhi">📊</span><h3>RESULTADOS E ESTATÍSTICAS</h3><span class="api-src">${espnOk?"ESPN":espnCacheUsedV22?"cache":"parcial"}</span></div>
    ${brazilMatchStatsHtmlV22(s)}
  </div>

  <div class="pro-card">
    <div class="pro-title">🧮 Simulador rápido do Grupo C</div>
    <div class="sim-box">
      <div class="sim-inputs"><div>${fl("Brazil")} Brasil</div><div class="sim-score">2</div><div class="sim-score">0</div><div>Haiti ${fl("Haiti")}</div></div>
      <div class="kpi-sub" style="margin-top:8px">Base visual pronta. Na próxima evolução, estes campos podem virar editáveis e recalcular o grupo automaticamente.</div>
    </div>
  </div>`;
}

function goPage(pg){curPage=pg;document.querySelectorAll(".pg").forEach(el=>el.classList.remove("on"));document.getElementById("pg-"+pg).classList.add("on");document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));document.getElementById("nav-"+pg).classList.add("active");document.getElementById("tabBar").style.display=pg==="jogos"?"flex":"none";render();}
function setFilter(fi){curFilter=fi;const fs=["all","live","today","brazil","grupos","oitavas","semi"];document.querySelectorAll(".tab").forEach((t,i)=>t.classList.toggle("on",fs[i]===fi));render();}
function render(){
  resolveKnockoutV23();
  const lc=liveCount();
  document.getElementById("livePill").classList.toggle("on",lc>0);
  document.getElementById("apiWarn")?.classList.remove("on");
  if(curPage==="jogos")document.getElementById("jogosBody").innerHTML=renderJogos();
  if(curPage==="grupos")document.getElementById("gruposBody").innerHTML=renderGrupos();
  if(curPage==="stats")document.getElementById("statsBody").innerHTML=renderStats();
  if(curPage==="brasil")document.getElementById("brasilBody").innerHTML=renderBrasil();
}



/* ============================
   V20 MATCH CENTER
   - Corrige barra de tempo: lê 76', 93:57, 90+6 e detalhes ESPN.
   - Cria painel de estatísticas em barras.
   - Tenta ler escalações/titulares/banco da ESPN quando disponíveis.
   - Não inventa jogador quando a fonte não entrega.
============================ */
function cleanTextV20(v){return String(v||"").replace(/\u0000/g,"").trim();}
function soccerClockV20(){
  const raw=[...arguments].map(cleanTextV20).filter(Boolean).join(" | ");
  if(!raw)return {label:"",minute:null,pct:0};
  const txt=raw.toLowerCase();
  if(/\b(ft|full.?time|final|fim)\b/.test(txt))return {label:"FIM",minute:90,pct:100};
  if(/\b(ht|half.?time|intervalo)\b/.test(txt))return {label:"Intervalo",minute:45,pct:50};

  let minute=null, label="";
  let m=raw.match(/(\d{1,3})\s*:\s*\d{1,2}/);
  if(m){
    minute=parseInt(m[1],10);
    label=m[0];
  }
  if(minute===null){
    m=raw.match(/(\d{1,2})\s*\+\s*(\d{1,2})/);
    if(m){minute=parseInt(m[1],10)+parseInt(m[2],10);label=`${m[1]}+${m[2]}'`;}
  }
  if(minute===null){
    m=raw.match(/(\d{1,3})\s*(?:'|’|min\b|\b)/);
    if(m){minute=parseInt(m[1],10);label=`${minute}'`;}
  }
  if(minute===null)return {label:raw,minute:null,pct:0};
  if(!label)label=`${minute}'`;
  const pct=Math.min(100,Math.max(3,Math.round((Math.min(minute,90)/90)*100)));
  return {label,minute,pct};
}

function espnStatusFor(m){
  const comp=espnCompFor(m); if(!comp)return null;
  const st=comp.status||{};
  const typ=st.type||{};
  const state=typ.state||"";
  const completed=!!typ.completed;
  const appSt=completed||state==="post"?"finished":state==="in"?"live":"upcoming";
  const clockInfo=soccerClockV20(st.displayClock,typ.shortDetail,typ.detail,typ.description);
  let label=clockInfo.label||cleanTextV20(st.displayClock||typ.shortDetail||typ.detail||"");
  let pct=appSt==="finished"?100:(appSt==="live"?(clockInfo.pct||8):0);
  if(appSt==="live"&&!label)label="AO VIVO";
  return {st:appSt,min:label,pct,detail:typ.detail||typ.shortDetail||typ.description||""};
}

function tPct(m,d){
  if(!d)return 0;
  const clk=soccerClockV20(d.min,d.detail);
  if(clk.pct>0)return clk.pct;
  if(typeof d.pct==="number"&&d.pct>0)return Math.min(100,Math.max(3,Math.round(d.pct)));
  if(d.st==="finished")return 100;
  if(d.st==="live")return 8;
  return 0;
}

function statExtractV20(obj,names){
  const arr=obj?.statistics||obj?.stats||[];
  const it=(arr||[]).find(x=>{
    const nm=String(x.name||x.abbreviation||x.label||x.displayName||x.shortDisplayName||"").toLowerCase();
    const dn=String(x.displayName||x.label||"").toLowerCase();
    return names.some(n=>nm===n.toLowerCase()||dn===n.toLowerCase()||nm.includes(n.toLowerCase())||dn.includes(n.toLowerCase()));
  });
  if(!it)return null;
  const raw=String(it.displayValue??it.value??it.display??"").replace("%","").replace(",",".");
  const num=parseFloat(raw);
  return Number.isFinite(num)?num:raw;
}

function espnTeamStatsFor(m){
  const h=espnStatsObjFor(m,"home"), a=espnStatsObjFor(m,"away");
  if(!h&&!a)return null;
  const get=(obj,names)=>statExtractV20(obj,names);
  return {
    possession:{home:get(h,["possessionPct","possession","posse","PP"]),away:get(a,["possessionPct","possession","posse","PP"])},
    shots:{home:get(h,["totalShots","total shots","shots","chutes","SHOT"]),away:get(a,["totalShots","total shots","shots","chutes","SHOT"])},
    shotsOnTarget:{home:get(h,["shotsOnTarget","shots on target","chutes a gol","on target","SOG"]),away:get(a,["shotsOnTarget","shots on target","chutes a gol","on target","SOG"])},
    corners:{home:get(h,["wonCorners","corners","corner kicks","escanteios","CW"]),away:get(a,["wonCorners","corners","corner kicks","escanteios","CW"])},
    totalPasses:{home:get(h,["totalPasses","passes","total passes","passes total"]),away:get(a,["totalPasses","passes","total passes","passes total"])},
    passAccuracy:{home:get(h,["accuratePassesPct","passingAccuracy","pass accuracy","% de precisão","precisão de passes"]),away:get(a,["accuratePassesPct","passingAccuracy","pass accuracy","% de precisão","precisão de passes"])},
    offsides:{home:get(h,["offsides","impedimentos"]),away:get(a,["offsides","impedimentos"])},
    fouls:{home:get(h,["foulsCommitted","fouls","faltas","FC"]),away:get(a,["foulsCommitted","fouls","faltas","FC"])},
    yellowCards:{home:get(h,["yellowCards","yellow cards","cartões amarelos","amarelos","YC"]),away:get(a,["yellowCards","yellow cards","cartões amarelos","amarelos","YC"])},
    redCards:{home:get(h,["redCards","red cards","cartões vermelhos","vermelhos","RC"]),away:get(a,["redCards","red cards","cartões vermelhos","vermelhos","RC"])}
  };
}

function mergeStatsV20(autoStats,liveStats,m){
  const out={};
  const keys=["possession","shots","shotsOnTarget","corners","totalPasses","passAccuracy","offsides","fouls"];
  keys.forEach(k=>{
    const h=autoStats?.[k]?.home ?? liveStats?.[k]?.home ?? null;
    const a=autoStats?.[k]?.away ?? liveStats?.[k]?.away ?? null;
    if(h!==null||a!==null)out[k]={home:h,away:a};
  });
  const hy=cardsForMatch(m,"home").filter(c=>cardType(c)==="yellow").length;
  const ay=cardsForMatch(m,"away").filter(c=>cardType(c)==="yellow").length;
  if(hy||ay)out.yellowCards={home:hy,away:ay};
  return out;
}

function statNumV20(v){const n=parseFloat(String(v??"").replace("%","").replace(",","."));return Number.isFinite(n)?n:null;}
function statValV20(v,suffix=""){return v===null||v===undefined||v===""?"—":`${v}${suffix}`;}
function renderStatRowV20(label,obj,suffix=""){
  if(!obj||(obj.home===null&&obj.away===null&&obj.home===undefined&&obj.away===undefined))return "";
  const hn=statNumV20(obj.home), an=statNumV20(obj.away);
  let hp=50, ap=50;
  if(hn!==null||an!==null){
    const h=Math.max(0,hn??0), a=Math.max(0,an??0), total=h+a;
    if(total>0){hp=Math.round((h/total)*100);ap=100-hp;}
  }
  return `<div class="team-stat-row"><div class="team-stat-val">${statValV20(obj.home,suffix)}</div><div class="team-stat-mid"><div class="team-stat-label">${label}</div><div class="team-stat-bars"><div class="team-stat-home" style="width:${hp}%"></div><div class="team-stat-away" style="width:${ap}%"></div></div></div><div class="team-stat-val">${statValV20(obj.away,suffix)}</div></div>`;
}
function renderTeamStatsPanelV20(m,st){
  if(!st||!Object.keys(st).length)return "";
  const rows=[
    renderStatRowV20("% de posse",st.possession,"%"),
    renderStatRowV20("Chutes",st.shots),
    renderStatRowV20("Chutes a gol",st.shotsOnTarget),
    renderStatRowV20("Escanteios",st.corners),
    renderStatRowV20("Total de passes",st.totalPasses),
    renderStatRowV20("% de precisão de passes",st.passAccuracy,"%"),
    renderStatRowV20("Impedimentos",st.offsides),
    renderStatRowV20("Faltas",st.fouls),
    renderStatRowV20("Cartões amarelos",st.yellowCards)
  ].filter(Boolean).join("");
  if(!rows)return "";
  return `<div class="modal-sec"><div class="modal-sec-title">📊 Match Center · Estatísticas</div><div class="match-stats-card"><div class="match-stats-head"><span>${fl(m.h)} ${pt(m.h)}</span><div class="match-stats-title">Estatísticas do time</div><span>${pt(m.a)} ${fl(m.a)}</span></div>${rows}</div></div>`;
}

function pNameV20(p){const a=p?.athlete||p?.player||p?.person||p||{};return a.displayName||a.fullName||a.shortName||a.name||p?.displayName||p?.fullName||p?.name||"";}
function pJerseyV20(p){const a=p?.athlete||p?.player||p||{};return p?.jersey||p?.jerseyNumber||a.jersey||a.jerseyNumber||"";}
function pPosV20(p){const a=p?.athlete||p?.player||p||{};const pos=p?.position||a.position||{};return pos.abbreviation||pos.displayName||pos.name||p?.positionName||"";}
function pStarterV20(p,label){const l=String(label||"").toLowerCase();if(/sub|bench|reserve|banco|suplente/.test(l))return false;if(/start|lineup|titular|formation/.test(l))return true;if(p?.starter===true||p?.isStarter===true)return true;if(p?.substitute===true||p?.isSubstitute===true)return false;return null;}
function playerCleanV20(p,label){
  const name=pNameV20(p); if(!name)return null;
  return {name,number:pJerseyV20(p),pos:pPosV20(p),starter:pStarterV20(p,label),raw:p};
}
function addPlayersFromV20(info,arr,label){
  (arr||[]).forEach(p=>{
    const cp=playerCleanV20(p,label); if(!cp)return;
    const target=cp.starter===false?info.bench:info.starters;
    if(!target.find(x=>canon(x.name)===canon(cp.name)))target.push(cp);
  });
}
function formationFromObjV20(obj){
  const candidates=[obj?.formation,obj?.lineup?.formation,obj?.team?.formation,obj?.stats?.formation,obj?.displayFormation,obj?.formationName].filter(Boolean);
  const found=candidates.find(x=>/\d\s*-\s*\d/.test(String(x)));
  return found?String(found).replace(/\s+/g,""):"";
}
function collectLineupBlockV20(info,block){
  if(!block)return;
  info.formation=info.formation||formationFromObjV20(block);
  addPlayersFromV20(info,block.starters||block.startingLineup||block.lineup?.starters||block.lineup?.players,"starters");
  addPlayersFromV20(info,block.substitutes||block.bench||block.reserves||block.lineup?.substitutes,"substitutes");
  addPlayersFromV20(info,block.roster||block.entries||block.players||block.athletes,"roster");
  (block.statistics||block.stats||[]).forEach(sec=>{
    const label=sec.name||sec.displayName||sec.label||"";
    if(/start|lineup|titular|formation|substitute|bench|reserve|banco|suplente/i.test(label)){
      addPlayersFromV20(info,sec.athletes||sec.players||sec.entries,label);
    }
  });
}
function teamBlockMatchV20(block,team){
  const n=block?.team?.displayName||block?.team?.name||block?.team?.shortDisplayName||block?.displayName||block?.name||"";
  return sameTeamV16(n,team);
}
function espnLineupsFor(m){
  const s=espnSummaryFor(m);
  const out={home:{formation:"",starters:[],bench:[],source:"ESPN/free"},away:{formation:"",starters:[],bench:[],source:"ESPN/free"}};
  const blocks=[];
  blocks.push(...(s?.boxscore?.players||[]));
  blocks.push(...(s?.boxscore?.teams||[]));
  blocks.push(...(s?.lineups||[]));
  blocks.push(...(s?.rosters||[]));
  blocks.push(...(s?.competitions?.[0]?.competitors||[]));
  blocks.push(...(s?.header?.competitions?.[0]?.competitors||[]));
  blocks.forEach(b=>{
    if(teamBlockMatchV20(b,m.h))collectLineupBlockV20(out.home,b);
    if(teamBlockMatchV20(b,m.a))collectLineupBlockV20(out.away,b);
  });
  // Remove listas fracas/estatísticas que não representam escalação.
  [out.home,out.away].forEach(info=>{
    info.starters=info.starters.filter((p,i,a)=>a.findIndex(x=>canon(x.name)===canon(p.name))===i).slice(0,16);
    info.bench=info.bench.filter((p,i,a)=>a.findIndex(x=>canon(x.name)===canon(p.name))===i).slice(0,16);
    if(info.starters.length>0&&info.starters.length<7)info.starters=[];
  });
  return out;
}
function mergeLineupsV20(m,live){
  const auto=espnLineupsFor(m);
  const fromLive={home:{formation:live?.lineups?.homeFormation||"",starters:[],bench:[],source:"local-live"},away:{formation:live?.lineups?.awayFormation||"",starters:[],bench:[],source:"local-live"}};
  (live?.lineups?.home||[]).forEach(x=>fromLive.home.starters.push({name:String(x),number:"",pos:""}));
  (live?.lineups?.away||[]).forEach(x=>fromLive.away.starters.push({name:String(x),number:"",pos:""}));
  return {
    home:(auto.home.starters.length||auto.home.bench.length)?auto.home:fromLive.home,
    away:(auto.away.starters.length||auto.away.bench.length)?auto.away:fromLive.away
  };
}
function shortNameV20(name){const parts=String(name||"").trim().split(/\s+/);if(parts.length<=1)return parts[0]||"";return `${parts[0][0]}. ${parts.slice(-1)[0]}`;}
function initialsV20(name){return String(name||"?").split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase();}
function playerBadgesV20(m,team,name){
  const ofb=ofbMatch(m.h,m.a);
  const goals=allGoalsForMatchV9(m,ofb).filter(g=>sameTeamV16(g.team,team)&&canon(g.name)===canon(name));
  const side=sameTeamV16(team,m.h)?"home":"away";
  const cards=cardsForMatch(m,side).filter(c=>canon(c.name||c.player)===canon(name));
  const badges=[]; if(goals.length)badges.push("⚽".repeat(Math.min(2,goals.length))); if(cards.some(c=>cardType(c)==="yellow"))badges.push("🟨"); if(cards.some(c=>cardType(c)==="red"))badges.push("🟥");
  return badges.map(b=>`<span>${b}</span>`).join("");
}
function formationRowsV20(players,formation){
  const ps=(players||[]).slice(0,11);
  if(!ps.length)return [];
  let nums=String(formation||"").split("-").map(x=>parseInt(x,10)).filter(Boolean);
  if(nums.length&&ps.length>=10)nums=[1,...nums];
  else if(ps.length>=11)nums=[1,4,3,3];
  else if(ps.length>=7)nums=[1,Math.min(4,ps.length-1),Math.max(0,ps.length-5)];
  else nums=[ps.length];
  const rows=[];let i=0;
  nums.forEach(n=>{if(n>0){rows.push(ps.slice(i,i+n));i+=n;}});
  if(i<ps.length)rows.push(ps.slice(i));
  return rows.filter(r=>r.length);
}
function renderPitchV20(m,team,info){
  if(!info?.starters?.length)return "";
  const rows=formationRowsV20(info.starters,info.formation);
  const rowHtml=rows.map(r=>`<div class="pitch-row">${r.map(p=>`<div class="pitch-player"><div class="pitch-badges">${playerBadgesV20(m,team,p.name)}</div><div class="pitch-avatar">${initialsV20(p.name)}</div><div class="pitch-name">${shortNameV20(p.name)}</div><div class="pitch-num">${p.number||p.pos||""}</div></div>`).join("")}</div>`).join("");
  const bench=(info.bench||[]).slice(0,10).map(p=>`<div class="bench-item">${p.number?`${p.number} `:""}${shortNameV20(p.name)}</div>`).join("");
  return `<div class="lineup-card"><div class="lineup-top"><div class="lineup-team">${fl(team)} ${pt(team)}</div><div class="lineup-form">${info.formation||"Formação"}</div></div><div class="pitch-v20">${rowHtml}</div>${bench?`<div class="bench-v20"><div class="bench-title">Banco</div>${bench}</div>`:""}</div>`;
}
function renderLineupsV20(m,lineups){
  const h=renderPitchV20(m,m.h,lineups.home);
  const a=renderPitchV20(m,m.a,lineups.away);
  if(h||a)return `<div class="modal-sec"><div class="modal-sec-title">👥 Escalações</div>${h}${a}</div>`;
  if(mSt(m)==="live"||mSt(m)==="finished")return `<div class="modal-sec"><div class="modal-sec-title">👥 Escalações</div><div class="lineup-unavailable">Escalação ainda não disponível na fonte gratuita. A V20 já está preparada para exibir titulares, banco e formação quando a ESPN entregar esses dados.</div></div>`;
  return "";
}
function espnSubsForMatchV20(m){
  return espnDetailsFor(m).filter(d=>{
    const txt=String(d.type?.text||d.type?.displayName||d.text||"").toLowerCase();
    return txt.includes("substitution")||txt.includes("substitute")||txt.includes("substituição");
  }).map(d=>{
    const teamId=String(d.team?.id||"");
    const side=String(espnTeamIdFor(m,"home"))===teamId?"home":"away";
    const team=side==="home"?m.h:m.a;
    const txt=String(d.text||"");
    const ath=d.athletesInvolved||d.athletes||[];
    let inn=ath[0]?.displayName||ath[0]?.fullName||"Entrada";
    let out=ath[1]?.displayName||ath[1]?.fullName||"Saída";
    const rep=txt.match(/\.\s*([^\.]+?)\s+replaces\s+([^\.]+)\.?/i);
    if(rep){inn=rep[1].trim();out=rep[2].trim();}
    return {team,side,minute:d.clock?.displayValue||"?",in:inn,out};
  });
}
function renderSubsV20(m,ofb){
  const s1=ofb?(ofb.subs1||ofb.substitutions1||[]):[],s2=ofb?(ofb.subs2||ofb.substitutions2||[]):[];
  const arr=[...s1.map(s=>({side:"home",team:m.h,minute:s.minute||"?",in:s.player_in||s.in||"Entrada",out:s.player_out||s.out||"Saída"})),...s2.map(s=>({side:"away",team:m.a,minute:s.minute||"?",in:s.player_in||s.in||"Entrada",out:s.player_out||s.out||"Saída"})),...espnSubsForMatchV20(m)];
  const ded=dedupeEventsV9(arr.map(x=>({name:`${x.in}|${x.out}`,team:x.team,minute:x.minute,type:"sub",...x}))).sort((a,b)=>parseInt(a.minute||999)-parseInt(b.minute||999));
  if(!ded.length)return "";
  return `<div class="modal-sec"><div class="modal-sec-title">🔄 Substituições</div><div class="subs-card-v20">${ded.map(s=>`<div class="sub-line-v20"><div class="sub-min-v20">${s.minute}'</div><div>${s.side==="home"?fl(m.h):fl(m.a)} <span style="color:var(--green)">▲</span> ${s.in} <span style="color:var(--live)">▼</span> ${s.out}</div></div>`).join("")}</div></div>`;
}

function buildDetail(m,ofb){
  let html="";
  const live=liveExtraFor(m);
  const autoStats=espnTeamStatsFor(m);
  const mergedStats=mergeStatsV20(autoStats,live?.stats,m);
  html+=renderTeamStatsPanelV20(m,mergedStats);

  const goals=allGoalsForMatchV9(m,ofb);
  if(goals.length){
    html+='<div class="modal-sec"><div class="modal-sec-title">⚽ Gols</div>';
    goals.forEach(g=>{
      const isH=g.side==="home";
      const icon=g.owngoal?"🔴":g.penalty?"🎯":"⚽";
      const lbl=g.owngoal?" (contra)":g.penalty?" (pen)":"";
      html+=`<div class="ev-row"><div class="ev-min">${g.minute||"?"}'</div><div class="ev-icon">${icon}</div><div class="ev-name">${g.name||"-"}${lbl}</div><div class="ev-team">${isH?fl(m.h):fl(m.a)}</div></div>`;
    });
    html+="</div>";
  }

  const b1=cardsForMatch(m,"home"), b2=cardsForMatch(m,"away");
  const cards=dedupeEventsV9([...b1.map(b=>({...b,side:"home",team:m.h})),...b2.map(b=>({...b,side:"away",team:m.a}))]).sort((a,b)=>parseInt(a.minute||999)-parseInt(b.minute||999));
  if(cards.length){
    html+='<div class="modal-sec"><div class="modal-sec-title">🟨 Cartões</div>';
    cards.forEach(b=>{
      const isH=b.side==="home";
      const icon=cardType(b)==="red"?"🟥":"🟨";
      html+=`<div class="ev-row"><div class="ev-min">${b.minute||"?"}'</div><div class="ev-icon">${icon}</div><div class="ev-name">${b.name||b.player||"-"}</div><div class="ev-team">${isH?fl(m.h):fl(m.a)}</div></div>`;
    });
    html+="</div>";
  }

  const lineups=mergeLineupsV20(m,live);
  html+=renderLineupsV20(m,lineups);
  html+=renderSubsV20(m,ofb);

  if(!html)html+='<div class="no-data">Eventos ainda não disponíveis nas fontes atuais</div>';
  return html;
}

async function loadAll(){
  const btn=document.getElementById("refreshBtn");
  if(btn)btn.classList.add("spin");

  if(!ESPN_EVENTS.length)loadEspnCacheV22();
  render();

  await Promise.allSettled([
    safeRunV8(fetchStaticESPN,18000),
    safeRunV8(fetchWCGames,3500),
    safeRunV8(fetchWCGroups,3500),
    safeRunV8(fetchWCScorers,3500),
    safeRunV8(fetchOFB,3500),
    safeRunV8(fetchFD,3500)
  ]);

  resolveKnockoutV23();
  if(typeof invalidateStatsCacheV8==="function")invalidateStatsCacheV8();
  render();
  if(typeof prewarmStatsCacheV8==="function")prewarmStatsCacheV8();

  const now=new Date();
  const liveEspn=F.some(m=>espnDataFor(m)?.st==="live");
  const src=espnOk?(espnCacheUsedV22?"✓ ESPN em cache":"✓ ESPN direto"):wcOk?"✓ worldcup26.ir":ofbOk?"✓ openfootball":"✓ aguardando fonte gratuita";
  const upd=document.getElementById("updLbl");
  if(upd)upd.textContent=`${src} - ${now.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}`;
  document.getElementById("apiWarn")?.classList.remove("on");
  if(btn)btn.classList.remove("spin");
}
function scheduleRefresh(){const lc=liveCount();const delay=lc>0?30000:300000;setTimeout(()=>{loadAll().then(scheduleRefresh);},delay);}
// V11: inicialização movida para depois dos patches
// loadAll().then(scheduleRefresh);


// ============================
// V8 - CAMADA ESTATÍSTICA NORMALIZADA
// ============================

function normMinuteV8(v){
  const s=String(v??"").trim();
  if(!s||s==="?")return null;
  const plus=s.match(/(\d+)\s*\+\s*(\d+)/);
  if(plus)return Number(plus[1])+Number(plus[2])/100;
  const mmss=s.match(/(\d+)\s*:\s*(\d+)/);
  if(mmss)return Number(mmss[1])+Number(mmss[2])/60;
  const n=Number((s.match(/\d+/)||[])[0]);
  return Number.isFinite(n)?n:null;
}

function normPlayerV8(name){
  return canon(
    String(name||"")
      .replace(/\([^)]*\)/g," ")
      .replace(/\b(jr|junior)\b/gi," junior ")
      .replace(/\s+/g," ")
      .trim()
  );
}

function cardEventKeyV8(m,c){
  const eventId=c.id||c.eventId||c.uid||c.guid||"";
  if(eventId)return `${m.id}|id:${eventId}`;
  return [
    m.id,
    normPlayerV8(c.name||c.player||c.athlete||c.displayName||""),
    canon(c.team||""),
    cardType(c),
    normMinuteV8(c.minute||c.time||c.clock||"?")??"?"
  ].join("|");
}

function normalizeCardEventsV8(m,side){
  const team=side==="home"?m.h:m.a;
  const raw=cardsForMatchV24(m,side)||[];
  const map=new Map();

  raw.forEach(c=>{
    const name=String(c.name||c.player||c.athlete||"Jogador não informado").trim();
    const type=cardType(c);
    const key=cardEventKeyV8(m,{...c,team});
    if(!map.has(key)){
      map.set(key,{
        id:c.id||c.eventId||null,
        name,
        playerKey:normPlayerV8(name),
        team,
        minute:normMinuteV8(c.minute||c.time||c.clock),
        card:type,
        aggregate:!!c.aggregate,
        source:c.source||""
      });
    }
  });

  // Segundo amarelo seguido de expulsão: não duplica vermelho no mesmo minuto.
  const arr=[...map.values()];
  const redsByPlayerMinute=new Set(
    arr.filter(x=>x.card==="red")
       .map(x=>`${x.playerKey}|${x.minute??"?"}`)
  );

  return arr.filter(x=>{
    if(x.card!=="yellow")return true;
    const k=`${x.playerKey}|${x.minute??"?"}`;
    // Mantém o amarelo, mas evita duplicações exatas; o vermelho continua separado.
    return true;
  });
}

function teamOfficialCardTotalsV8(m,side){
  const yellow=espnStatCardCountV24(m,side,"yellow");
  const red=espnStatCardCountV24(m,side,"red");
  return {yellow,red,hasOfficial:yellow>0||red>0};
}

function teamCardsForMatchV8(m,side){
  const events=normalizeCardEventsV8(m,side);
  const official=teamOfficialCardTotalsV8(m,side);

  const eventYellow=events.filter(x=>x.card==="yellow"&&!x.aggregate).length;
  const eventRed=events.filter(x=>x.card==="red"&&!x.aggregate).length;

  // Regra V8: se houver total oficial, ele é soberano.
  const yellow=official.hasOfficial?official.yellow:eventYellow;
  const red=official.hasOfficial?official.red:eventRed;

  return {yellow,red,events,official};
}

function tournamentTeamCardsV8(team){
  let yellow=0,red=0;
  const players=new Map();

  F.filter(m=>mSt(m)!=="upcoming"&&(nm(m.h,team)||nm(m.a,team))).forEach(m=>{
    const side=nm(m.h,team)?"home":"away";
    const pack=teamCardsForMatchV8(m,side);
    yellow+=pack.yellow;
    red+=pack.red;

    pack.events.filter(e=>!e.aggregate&&e.playerKey&&e.playerKey!=="jogador nao informado").forEach(e=>{
      const key=e.playerKey+"|"+canon(team);
      if(!players.has(key))players.set(key,{name:e.name,team,yellow:0,red:0});
      const p=players.get(key);
      if(e.card==="red")p.red++;
      else p.yellow++;
    });
  });

  return {yellow,red,total:yellow+red,players:[...players.values()]};
}

function goalsByPlayerForTeamV8(team){
  const map=new Map();
  const seen=new Set();

  F.filter(m=>mSt(m)!=="upcoming"&&(nm(m.h,team)||nm(m.a,team))).forEach(m=>{
    const ofb=ofbMatch(m.h,m.a);
    (allGoalsForMatchV9(m,ofb)||[])
      .filter(g=>nm(g.team,team)&&!g.owngoal)
      .forEach(g=>{
        const name=String(g.name||g.player||"").trim();
        if(!name)return;
        const key=[
          m.id,
          normPlayerV8(name),
          canon(team),
          normMinuteV8(g.minute||g.time||g.clock)||"?"
        ].join("|");
        if(seen.has(key))return;
        seen.add(key);

        const pkey=normPlayerV8(name);
        if(!map.has(pkey))map.set(pkey,{name,goals:0,matches:new Set()});
        const p=map.get(pkey);
        p.goals++;
        p.matches.add(m.id);
      });
  });

  return [...map.values()]
    .map(x=>({name:x.name,goals:x.goals,matches:x.matches.size}))
    .sort((a,b)=>b.goals-a.goals||a.name.localeCompare(b.name));
}

function aggregateTeamStatsV8(team){
  const out={
    games:0,wins:0,draws:0,losses:0,gf:0,ga:0,gd:0,points:0,
    shots:0,shotsOnGoal:0,corners:0,fouls:0,offsides:0,passes:0,
    possessionSum:0,possessionCount:0,passAccSum:0,passAccCount:0,
    cleanSheets:0
  };

  F.filter(m=>mSt(m)==="finished"&&(nm(m.h,team)||nm(m.a,team))).forEach(m=>{
    const d=mData(m);
    if(!d||!d.hasScore)return;
    const isH=nm(m.h,team);
    const gf=Number(isH?d.hs:d.as), ga=Number(isH?d.as:d.hs);
    out.games++; out.gf+=gf; out.ga+=ga; out.gd+=gf-ga;
    if(gf>ga){out.wins++;out.points+=3}
    else if(gf===ga){out.draws++;out.points++}
    else out.losses++;
    if(ga===0)out.cleanSheets++;

    const st=espnTeamStatsFor(m);
    const mine=isH?st?.home:st?.away;
    if(!mine)return;

    const num=v=>{
      if(v===null||v===undefined||v==="")return null;
      const n=Number(String(v).replace("%","").replace(",","."));
      return Number.isFinite(n)?n:null;
    };

    const vals={
      shots:num(mine.shots),
      shotsOnGoal:num(mine.shotsOnGoal),
      corners:num(mine.corners),
      fouls:num(mine.fouls),
      offsides:num(mine.offsides),
      passes:num(mine.passes),
      possession:num(mine.possession),
      passAccuracy:num(mine.passAccuracy)
    };

    ["shots","shotsOnGoal","corners","fouls","offsides","passes"].forEach(k=>{
      if(vals[k]!==null)out[k]+=vals[k];
    });
    if(vals.possession!==null){out.possessionSum+=vals.possession;out.possessionCount++}
    if(vals.passAccuracy!==null){out.passAccSum+=vals.passAccuracy;out.passAccCount++}
  });

  out.possessionAvg=out.possessionCount?out.possessionSum/out.possessionCount:null;
  out.passAccuracyAvg=out.passAccCount?out.passAccSum/out.passAccCount:null;
  out.goalAvg=out.games?out.gf/out.games:0;
  out.conversion=out.shots?out.gf/out.shots*100:null;
  out.shotAccuracy=out.shots?out.shotsOnGoal/out.shots*100:null;
  out.performance=out.games?out.points/(out.games*3)*100:0;
  return out;
}

function toggleV8Card(el){
  const wasOpen=el.classList.contains("expanded");
  document.querySelectorAll(".v3-card.expanded").forEach(x=>x.classList.remove("expanded"));
  if(!wasOpen){
    el.classList.add("expanded");
    setTimeout(()=>el.scrollIntoView({behavior:"smooth",block:"start"}),120);
  }
}

function v3Card(title,value,sub,details,icon="📊"){
  return `<div class="v3-card" onclick="toggleV8Card(this)">
    <div class="v3-head">
      <div>
        <div class="v3-title">${icon} ${title}</div>
        <div class="v3-value">${value}</div>
        <div class="v3-sub">${sub||""}</div>
      </div>
      <div class="v3-arrow">⌄</div>
    </div>
    <div class="v3-more">${details||'<div class="v3-muted">Sem detalhes adicionais</div>'}</div>
  </div>`;
}

function rowsV8(items){
  return items.map(x=>`<div class="v3-row"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join("");
}

function renderBrasilV8(){
  const s=aggregateTeamStatsV8("Brazil");
  const cards=tournamentTeamCardsV8("Brazil");
  const scorers=goalsByPlayerForTeamV8("Brazil");
  const discipline=cards.players.sort((a,b)=>(b.yellow+b.red)-(a.yellow+a.red)||a.name.localeCompare(b.name));

  const scorersRows=scorers.length
    ? rowsV8(scorers.map(x=>[x.name,`${x.goals} gol${x.goals===1?"":"s"}`]))
    : '<div class="v3-muted">Sem gols identificados</div>';

  const discRows=discipline.length
    ? rowsV8(discipline.map(x=>[x.name,`${x.yellow} 🟨 · ${x.red} 🟥`]))
    : '<div class="v3-muted">Sem jogadores identificados</div>';

  const form=F.filter(m=>mSt(m)==="finished"&&(nm(m.h,"Brazil")||nm(m.a,"Brazil")))
    .map(m=>{
      const d=mData(m); if(!d||!d.hasScore)return null;
      const isH=nm(m.h,"Brazil"),gf=Number(isH?d.hs:d.as),ga=Number(isH?d.as:d.hs);
      return gf>ga?"V":gf===ga?"E":"D";
    }).filter(Boolean);

  return `
    <div class="hero-br">
      <div class="hero-flag">${fl("Brazil")}</div>
      <div><div class="hero-kicker">SELEÇÃO BRASILEIRA</div><h2>Brasil na Copa</h2>
      <div class="v3-chipline">${form.map(x=>`<span class="v3-chip">${x}</span>`).join("")}</div></div>
    </div>

    <div class="v3-grid">
      ${v3Card("Jogos",s.games,`${s.wins}V · ${s.draws}E · ${s.losses}D`,
        rowsV8([["Aproveitamento",`${s.performance.toFixed(0)}%`],["Pontos",s.points],["Saldo",s.gd>=0?`+${s.gd}`:s.gd]]),"🏟️")}
      ${v3Card("Gols",s.gf,`${s.goalAvg.toFixed(2)} por jogo`,
        scorersRows,"⚽")}
      ${v3Card("Cartões",cards.total,`${cards.yellow} amarelos · ${cards.red} vermelhos`,
        discRows,"🟨")}
      ${v3Card("Defesa",s.ga,`${s.cleanSheets} jogo${s.cleanSheets===1?"":"s"} sem sofrer`,
        rowsV8([["Gols sofridos",s.ga],["Saldo",s.gd],["Clean sheets",s.cleanSheets]]),"🛡️")}
      ${v3Card("Chutes",s.shots,s.shotAccuracy!==null?`${s.shotAccuracy.toFixed(1)}% no alvo`:"dados parciais",
        rowsV8([["Chutes",s.shots],["No alvo",s.shotsOnGoal],["Conversão",s.conversion!==null?`${s.conversion.toFixed(1)}%`:"—"]]),"🎯")}
      ${v3Card("Posse média",s.possessionAvg!==null?`${s.possessionAvg.toFixed(1)}%`:"—","média no torneio",
        rowsV8([["Posse média",s.possessionAvg!==null?`${s.possessionAvg.toFixed(1)}%`:"—"],["Precisão de passes",s.passAccuracyAvg!==null?`${s.passAccuracyAvg.toFixed(1)}%`:"—"],["Passes",s.passes||"—"]]),"🧠")}
      ${v3Card("Escanteios",s.corners,"total no torneio",
        rowsV8([["Escanteios",s.corners],["Faltas",s.fouls],["Impedimentos",s.offsides]]),"🚩")}
      ${v3Card("Disciplina",cards.yellow,`${cards.red} expulsão${cards.red===1?"":"ões"}`,
        rowsV8([["Amarelos",cards.yellow],["Vermelhos",cards.red],["Média/jogo",s.games?`${(cards.total/s.games).toFixed(2)}`:"—"]]),"⚖️")}
    </div>

    <div class="v3-section-title">Jogos e estatísticas</div>
    ${brazilMatchStatsHtmlV22(teamStatsV12("Brazil"))}
  `;
}

function renderStatsV8(){
  const teams=[...new Set(
    F.filter(m=>m.ph==="grupos")
     .flatMap(m=>[m.h,m.a])
     .filter(x=>x&&!isPlaceholderTeamV23(x))
  )];
  const teamRows=teams.map(team=>{
    const st=aggregateTeamStatsV8(team);
    const cd=tournamentTeamCardsV8(team);
    return {team,...st,yellow:cd.yellow,red:cd.red,totalCards:cd.total};
  });

  const scorersMap=new Map();
  teams.forEach(team=>{
    goalsByPlayerForTeamV8(team).forEach(p=>{
      const k=normPlayerV8(p.name)+"|"+canon(team);
      scorersMap.set(k,{name:p.name,team,goals:p.goals});
    });
  });
  const scorers=[...scorersMap.values()].sort((a,b)=>b.goals-a.goals||a.name.localeCompare(b.name)).slice(0,20);

  const topAttack=[...teamRows].sort((a,b)=>b.gf-a.gf).slice(0,10);
  const topDefense=[...teamRows].filter(x=>x.games>0).sort((a,b)=>a.ga-b.ga||b.cleanSheets-a.cleanSheets).slice(0,10);
  const topCards=[...teamRows].sort((a,b)=>b.totalCards-a.totalCards).slice(0,10);
  const topPoss=[...teamRows].filter(x=>x.possessionAvg!==null).sort((a,b)=>b.possessionAvg-a.possessionAvg).slice(0,10);

  return `
    <div class="page-head"><h2>Estatísticas</h2><span class="api-src">V8</span></div>

    <div class="v3-grid">
      ${v3Card("Gols no torneio",teamRows.reduce((s,x)=>s+x.gf,0),"somatório das seleções",
        rowsV8(topAttack.map(x=>[`${fl(x.team)} ${pt(x.team)}`,x.gf])),"⚽")}
      ${v3Card("Artilheiros",scorers[0]?.goals||0,scorers[0]?scorers[0].name:"sem dados",
        rowsV8(scorers.map(x=>[`${x.name} · ${pt(x.team)}`,x.goals])),"🥇")}
      ${v3Card("Cartões",teamRows.reduce((s,x)=>s+x.totalCards,0),"amarelos e vermelhos",
        rowsV8(topCards.map(x=>[`${fl(x.team)} ${pt(x.team)}`,`${x.yellow} 🟨 · ${x.red} 🟥`])),"🟨")}
      ${v3Card("Melhor ataque",topAttack[0]?.gf||0,topAttack[0]?pt(topAttack[0].team):"—",
        rowsV8(topAttack.map(x=>[`${fl(x.team)} ${pt(x.team)}`,`${x.gf} gols`])),"🚀")}
      ${v3Card("Melhor defesa",topDefense[0]?.ga??"—",topDefense[0]?pt(topDefense[0].team):"—",
        rowsV8(topDefense.map(x=>[`${fl(x.team)} ${pt(x.team)}`,`${x.ga} sofridos`])),"🛡️")}
      ${v3Card("Maior posse",topPoss[0]?.possessionAvg!==null&&topPoss[0]?`${topPoss[0].possessionAvg.toFixed(1)}%`:"—",topPoss[0]?pt(topPoss[0].team):"dados parciais",
        rowsV8(topPoss.map(x=>[`${fl(x.team)} ${pt(x.team)}`,`${x.possessionAvg.toFixed(1)}%`])),"🧠")}
      ${v3Card("Mais chutes",Math.max(...teamRows.map(x=>x.shots),0),
        [...teamRows].sort((a,b)=>b.shots-a.shots)[0]?.team?pt([...teamRows].sort((a,b)=>b.shots-a.shots)[0].team):"—",
        rowsV8([...teamRows].sort((a,b)=>b.shots-a.shots).slice(0,10).map(x=>[`${fl(x.team)} ${pt(x.team)}`,x.shots])),"🎯")}
      ${v3Card("Mais faltas",Math.max(...teamRows.map(x=>x.fouls),0),
        [...teamRows].sort((a,b)=>b.fouls-a.fouls)[0]?.team?pt([...teamRows].sort((a,b)=>b.fouls-a.fouls)[0].team):"—",
        rowsV8([...teamRows].sort((a,b)=>b.fouls-a.fouls).slice(0,10).map(x=>[`${fl(x.team)} ${pt(x.team)}`,x.fouls])),"⚖️")}
    </div>

    <div class="v3-section-title">Visão geral</div>
    <div class="pro-card">
      ${rowsV8([
        ["Jogos concluídos",F.filter(m=>mSt(m)==="finished").length],
        ["Gols",teamRows.reduce((s,x)=>s+x.gf,0)],
        ["Amarelos",teamRows.reduce((s,x)=>s+x.yellow,0)],
        ["Vermelhos",teamRows.reduce((s,x)=>s+x.red,0)]
      ])}
    </div>
  `;
}

// Sobrescreve apenas as renderizações finais, preservando restante do app.
renderBrasil = renderBrasilV8;
renderStats = renderStatsV8;


// ============================
// V8 - ESTATÍSTICAS RÁPIDAS E CORRIGIDAS
// ============================

let STATS_CACHE_V8={key:"",model:null,building:false};

function invalidateStatsCacheV8(){
  STATS_CACHE_V8={key:"",model:null,building:false};
}

function statsFingerprintV8(){
  const ev=ESPN_EVENTS.map(e=>{
    const c=e?.competitions?.[0];
    const scores=(c?.competitors||[]).map(x=>x.score??"").join("-");
    return `${e.id}:${e?.status?.type?.state||""}:${scores}`;
  }).join("|");
  return [
    ev,
    Object.keys(ESPN_SUMMARIES||{}).length,
    OFB_DATA?.matches?.length||0
  ].join("#");
}

function numberV8(v){
  if(v===null||v===undefined||v==="")return null;
  const n=Number(String(v).replace("%","").replace(",","."));
  return Number.isFinite(n)?n:null;
}

function statSideV8(stats,key,side){
  const map={
    shotsOnGoal:"shotsOnTarget",
    passes:"totalPasses"
  };
  const sourceKey=map[key]||key;
  return numberV8(stats?.[sourceKey]?.[side]);
}

function simpleCardEventsV8(m,side){
  const team=side==="home"?m.h:m.a;
  const raw=[];
  const ofb=ofbMatch(m.h,m.a);

  if(ofb){
    const arr=side==="home"
      ? (ofb.bookings1||ofb.cards1||[])
      : (ofb.bookings2||ofb.cards2||[]);
    raw.push(...(arr||[]).map(c=>({...c,team,source:"openfootball"})));
  }

  raw.push(
    ...espnEventsForMatch(m,"yellow"),
    ...espnEventsForMatch(m,"red"),
    ...disciplineCardsForMatch(m,side)
  );

  const ov=overrideEvents(m).cards||[];
  raw.push(...ov.filter(c=>sameTeamV16(c.team,team)));

  const seen=new Set();
  const redPlayerMatch=new Set();
  const yellowCountByPlayer=new Map();
  const out=[];

  raw.forEach(c=>{
    const cTeam=c.team||team;
    if(c.team&&!sameTeamV16(cTeam,team))return;

    const name=String(c.name||c.player||c.athlete||c.displayName||"Jogador não informado").trim();
    const playerKey=normPlayerV8(name);
    const type=cardType(c);
    const minute=normMinuteV8(c.minute||c.time||c.clock);

    if(type==="red"){
      const redKey=`${m.id}|${playerKey}`;
      if(redPlayerMatch.has(redKey))return;
      redPlayerMatch.add(redKey);
    }

    if(type==="yellow"){
      const yKey=`${m.id}|${playerKey}`;
      const count=yellowCountByPlayer.get(yKey)||0;
      if(count>=2)return;
      yellowCountByPlayer.set(yKey,count+1);
    }

    const key=[
      m.id,
      playerKey,
      canon(team),
      type,
      minute??"?"
    ].join("|");

    if(seen.has(key))return;
    seen.add(key);

    out.push({
      name,
      playerKey,
      team,
      card:type,
      minute,
      source:c.source||""
    });
  });

  return out;
}

function cardPackV8(m,side){
  const officialYellow=espnStatCardCountV24(m,side,"yellow");
  const officialRed=espnStatCardCountV24(m,side,"red");
  const events=simpleCardEventsV8(m,side);

  const eventYellow=events.filter(x=>x.card==="yellow").length;
  const eventRed=events.filter(x=>x.card==="red").length;

  const hasOfficial=officialYellow>0||officialRed>0;

  return {
    yellow:hasOfficial?officialYellow:eventYellow,
    red:hasOfficial?officialRed:eventRed,
    events,
    official:hasOfficial
  };
}

function emptyTeamV8(team){
  return {
    team,
    games:0,wins:0,draws:0,losses:0,
    gf:0,ga:0,gd:0,points:0,cleanSheets:0,
    shots:0,shotsOnGoal:0,corners:0,fouls:0,offsides:0,passes:0,
    possessionSum:0,possessionCount:0,
    passAccuracySum:0,passAccuracyCount:0,
    statsGames:0,
    yellow:0,red:0,
    playersCards:new Map()
  };
}

function buildStatsModelV8(){
  const teams=[...new Set(
    F.filter(m=>m.ph==="grupos")
      .flatMap(m=>[m.h,m.a])
      .filter(x=>x&&!isPlaceholderTeamV23(x))
  )];

  const byTeam=new Map(teams.map(t=>[t,emptyTeamV8(t)]));
  const scorers=new Map();
  const goalSeen=new Set();

  const getTeam=name=>{
    let exact=teams.find(t=>nm(t,name));
    if(!exact&&name&&!isPlaceholderTeamV23(name)){
      exact=name;
      teams.push(name);
      byTeam.set(name,emptyTeamV8(name));
    }
    return exact?byTeam.get(exact):null;
  };

  F.filter(m=>mSt(m)==="finished"&&!isPlaceholderTeamV23(m.h)&&!isPlaceholderTeamV23(m.a))
   .forEach(m=>{
    const d=mData(m);
    const home=getTeam(m.h);
    const away=getTeam(m.a);

    if(d&&d.hasScore&&home&&away){
      const hs=Number(d.hs),as=Number(d.as);

      [[home,hs,as],[away,as,hs]].forEach(([t,gf,ga])=>{
        t.games++;
        t.gf+=gf;t.ga+=ga;t.gd+=gf-ga;
        if(gf>ga){t.wins++;t.points+=3}
        else if(gf===ga){t.draws++;t.points++}
        else t.losses++;
        if(ga===0)t.cleanSheets++;
      });
    }

    const stats=espnTeamStatsFor(m);
    [["home",home],["away",away]].forEach(([side,t])=>{
      if(!t)return;

      const values={
        shots:statSideV8(stats,"shots",side),
        shotsOnGoal:statSideV8(stats,"shotsOnGoal",side),
        corners:statSideV8(stats,"corners",side),
        fouls:statSideV8(stats,"fouls",side),
        offsides:statSideV8(stats,"offsides",side),
        passes:statSideV8(stats,"passes",side),
        possession:statSideV8(stats,"possession",side),
        passAccuracy:statSideV8(stats,"passAccuracy",side)
      };

      let hasStats=false;
      ["shots","shotsOnGoal","corners","fouls","offsides","passes"].forEach(k=>{
        if(values[k]!==null){
          t[k]+=values[k];
          hasStats=true;
        }
      });

      if(values.possession!==null){
        t.possessionSum+=values.possession;
        t.possessionCount++;
        hasStats=true;
      }

      if(values.passAccuracy!==null){
        t.passAccuracySum+=values.passAccuracy;
        t.passAccuracyCount++;
        hasStats=true;
      }

      if(hasStats)t.statsGames++;

      const cards=cardPackV8(m,side);
      t.yellow+=cards.yellow;
      t.red+=cards.red;

      cards.events.forEach(c=>{
        if(!c.playerKey||c.playerKey==="jogador nao informado")return;
        const key=c.playerKey+"|"+canon(t.team);
        if(!t.playersCards.has(key)){
          t.playersCards.set(key,{name:c.name,yellow:0,red:0});
        }
        const p=t.playersCards.get(key);
        if(c.card==="red")p.red++;
        else p.yellow++;
      });
    });

    const ofb=ofbMatch(m.h,m.a);
    (allGoalsForMatchV9(m,ofb)||[])
      .filter(g=>!g.owngoal)
      .forEach(g=>{
        const name=String(g.name||g.player||"").trim();
        const team=g.team||"";
        if(!name||!team)return;

        const key=[
          m.id,
          normPlayerV8(name),
          canon(team),
          normMinuteV8(g.minute||g.time||g.clock)??"?"
        ].join("|");

        if(goalSeen.has(key))return;
        goalSeen.add(key);

        const playerKey=normPlayerV8(name)+"|"+canon(team);
        if(!scorers.has(playerKey)){
          scorers.set(playerKey,{name,team,goals:0,matches:new Set()});
        }
        const p=scorers.get(playerKey);
        p.goals++;
        p.matches.add(m.id);
      });
  });

  const rows=[...byTeam.values()].map(t=>({
    ...t,
    possessionAvg:t.possessionCount?t.possessionSum/t.possessionCount:null,
    passAccuracyAvg:t.passAccuracyCount?t.passAccuracySum/t.passAccuracyCount:null,
    goalAvg:t.games?t.gf/t.games:0,
    conversion:t.shots?t.gf/t.shots*100:null,
    shotAccuracy:t.shots?t.shotsOnGoal/t.shots*100:null,
    performance:t.games?t.points/(t.games*3)*100:0,
    totalCards:t.yellow+t.red,
    playersCards:[...t.playersCards.values()]
  }));

  return {
    teams:rows,
    scorers:[...scorers.values()]
      .map(x=>({...x,matches:x.matches.size}))
      .sort((a,b)=>b.goals-a.goals||a.name.localeCompare(b.name))
  };
}

function getStatsModelV8(){
  const key=statsFingerprintV8();
  if(STATS_CACHE_V8.model&&STATS_CACHE_V8.key===key){
    return STATS_CACHE_V8.model;
  }

  const model=buildStatsModelV8();
  STATS_CACHE_V8={key,model,building:false};
  return model;
}

function prewarmStatsCacheV8(){
  setTimeout(()=>{
    try{getStatsModelV8()}catch(e){console.warn("V8 stats cache",e)}
  },80);
}

function teamModelV8(team){
  const model=getStatsModelV8();
  return model.teams.find(x=>nm(x.team,team))||emptyTeamV8(team);
}

function valueOrDashV8(v,suffix=""){
  return v===null||v===undefined||Number.isNaN(v)?"—":`${v}${suffix}`;
}

function renderBrasilFastV8(){
  const s=teamModelV8("Brazil");
  const model=getStatsModelV8();
  const scorers=model.scorers.filter(x=>nm(x.team,"Brazil"));
  const discipline=[...(s.playersCards||[])]
    .sort((a,b)=>(b.yellow+b.red)-(a.yellow+a.red)||a.name.localeCompare(b.name));

  const scorersRows=scorers.length
    ? rowsV8(scorers.map(x=>[x.name,`${x.goals} gol${x.goals===1?"":"s"}`]))
    : '<div class="v3-muted">Sem gols identificados</div>';

  const discRows=discipline.length
    ? rowsV8(discipline.map(x=>[x.name,`${x.yellow} 🟨 · ${x.red} 🟥`]))
    : '<div class="v3-muted">Detalhamento individual ainda não disponível</div>';

  const form=F.filter(m=>mSt(m)==="finished"&&(nm(m.h,"Brazil")||nm(m.a,"Brazil")))
    .map(m=>{
      const d=mData(m);
      if(!d||!d.hasScore)return null;
      const isH=nm(m.h,"Brazil");
      const gf=Number(isH?d.hs:d.as);
      const ga=Number(isH?d.as:d.hs);
      return gf>ga?"V":gf===ga?"E":"D";
    }).filter(Boolean);

  return `
    <div class="hero-br">
      <div class="hero-flag">${fl("Brazil")}</div>
      <div>
        <div class="hero-kicker">SELEÇÃO BRASILEIRA</div>
        <h2>Brasil na Copa</h2>
        <div class="v3-chipline">${form.map(x=>`<span class="v3-chip">${x}</span>`).join("")}</div>
      </div>
    </div>

    <div class="v3-grid">
      ${v3Card("Jogos",s.games,`${s.wins}V · ${s.draws}E · ${s.losses}D`,
        rowsV8([["Aproveitamento",`${s.performance.toFixed(0)}%`],["Pontos",s.points],["Saldo",s.gd>=0?`+${s.gd}`:s.gd]]),"🏟️")}

      ${v3Card("Gols",s.gf,`${s.goalAvg.toFixed(2)} por jogo`,scorersRows,"⚽")}

      ${v3Card("Cartões",s.totalCards,`${s.yellow} amarelos · ${s.red} vermelhos`,discRows,"🟨")}

      ${v3Card("Defesa",s.ga,`${s.cleanSheets} jogo${s.cleanSheets===1?"":"s"} sem sofrer`,
        rowsV8([["Gols sofridos",s.ga],["Saldo",s.gd],["Jogos sem sofrer",s.cleanSheets]]),"🛡️")}

      ${v3Card("Chutes",s.statsGames?valueOrDashV8(s.shots):"—",
        s.statsGames&&s.shotAccuracy!==null?`${s.shotAccuracy.toFixed(1)}% no alvo`:"dado ainda não disponível",
        rowsV8([["Chutes",s.statsGames?s.shots:"—"],["No alvo",s.statsGames?s.shotsOnGoal:"—"],["Conversão",s.conversion!==null?`${s.conversion.toFixed(1)}%`:"—"]]),"🎯")}

      ${v3Card("Posse média",s.possessionAvg!==null?`${s.possessionAvg.toFixed(1)}%`:"—",
        s.possessionAvg!==null?"média no torneio":"dado ainda não disponível",
        rowsV8([["Posse média",s.possessionAvg!==null?`${s.possessionAvg.toFixed(1)}%`:"—"],["Precisão de passes",s.passAccuracyAvg!==null?`${s.passAccuracyAvg.toFixed(1)}%`:"—"],["Passes",s.statsGames?s.passes:"—"]]),"🧠")}

      ${v3Card("Escanteios",s.statsGames?s.corners:"—",
        s.statsGames?"total no torneio":"dado ainda não disponível",
        rowsV8([["Escanteios",s.statsGames?s.corners:"—"],["Faltas",s.statsGames?s.fouls:"—"],["Impedimentos",s.statsGames?s.offsides:"—"]]),"🚩")}

      ${v3Card("Disciplina",s.yellow,`${s.red} expulsão${s.red===1?"":"ões"}`,
        rowsV8([["Amarelos",s.yellow],["Vermelhos",s.red],["Média por jogo",s.games?(s.totalCards/s.games).toFixed(2):"—"]]),"⚖️")}
    </div>

    <div class="v3-section-title">Jogos e estatísticas</div>
    ${brazilMatchStatsHtmlV22(teamStatsV12("Brazil"))}
  `;
}

function renderStatsFastV8(){
  const model=getStatsModelV8();
  const rows=model.teams;

  const topAttack=[...rows].filter(x=>x.games>0).sort((a,b)=>b.gf-a.gf).slice(0,10);
  const topDefense=[...rows].filter(x=>x.games>0).sort((a,b)=>a.ga-b.ga||b.cleanSheets-a.cleanSheets).slice(0,10);
  const topCards=[...rows].filter(x=>x.totalCards>0).sort((a,b)=>b.totalCards-a.totalCards).slice(0,10);
  const topPoss=[...rows].filter(x=>x.possessionAvg!==null).sort((a,b)=>b.possessionAvg-a.possessionAvg).slice(0,10);
  const topShots=[...rows].filter(x=>x.statsGames>0&&x.shots>0).sort((a,b)=>b.shots-a.shots).slice(0,10);
  const topFouls=[...rows].filter(x=>x.statsGames>0&&x.fouls>0).sort((a,b)=>b.fouls-a.fouls).slice(0,10);

  const totalGoals=rows.reduce((s,x)=>s+x.gf,0);
  const totalYellow=rows.reduce((s,x)=>s+x.yellow,0);
  const totalRed=rows.reduce((s,x)=>s+x.red,0);
  const completed=F.filter(m=>mSt(m)==="finished").length;

  return `
    <div class="page-head"><h2>Estatísticas</h2></div>

    <div class="v3-grid">
      ${v3Card("Gols no torneio",totalGoals,"total confirmado",
        rowsV8(topAttack.map(x=>[`${fl(x.team)} ${pt(x.team)}`,x.gf])),"⚽")}

      ${v3Card("Artilheiros",model.scorers[0]?.goals||"—",
        model.scorers[0]?.name||"sem dados",
        rowsV8(model.scorers.slice(0,20).map(x=>[`${x.name} · ${pt(x.team)}`,x.goals])),"🥇")}

      ${v3Card("Cartões",totalYellow+totalRed,
        `${totalYellow} amarelos · ${totalRed} vermelhos`,
        topCards.length?rowsV8(topCards.map(x=>[`${fl(x.team)} ${pt(x.team)}`,`${x.yellow} 🟨 · ${x.red} 🟥`])):'<div class="v3-muted">Dados ainda não disponíveis</div>',"🟨")}

      ${v3Card("Melhor ataque",topAttack[0]?.gf??"—",
        topAttack[0]?pt(topAttack[0].team):"sem dados",
        rowsV8(topAttack.map(x=>[`${fl(x.team)} ${pt(x.team)}`,`${x.gf} gols`])),"🚀")}

      ${v3Card("Melhor defesa",topDefense[0]?.ga??"—",
        topDefense[0]?pt(topDefense[0].team):"sem dados",
        rowsV8(topDefense.map(x=>[`${fl(x.team)} ${pt(x.team)}`,`${x.ga} sofridos`])),"🛡️")}

      ${v3Card("Maior posse",topPoss[0]?`${topPoss[0].possessionAvg.toFixed(1)}%`:"—",
        topPoss[0]?pt(topPoss[0].team):"dado ainda não disponível",
        topPoss.length?rowsV8(topPoss.map(x=>[`${fl(x.team)} ${pt(x.team)}`,`${x.possessionAvg.toFixed(1)}%`])):'<div class="v3-muted">A fonte ainda não entregou posse consolidada</div>',"🧠")}

      ${v3Card("Mais chutes",topShots[0]?.shots??"—",
        topShots[0]?pt(topShots[0].team):"dado ainda não disponível",
        topShots.length?rowsV8(topShots.map(x=>[`${fl(x.team)} ${pt(x.team)}`,x.shots])):'<div class="v3-muted">A fonte ainda não entregou chutes consolidados</div>',"🎯")}

      ${v3Card("Mais faltas",topFouls[0]?.fouls??"—",
        topFouls[0]?pt(topFouls[0].team):"dado ainda não disponível",
        topFouls.length?rowsV8(topFouls.map(x=>[`${fl(x.team)} ${pt(x.team)}`,x.fouls])):'<div class="v3-muted">A fonte ainda não entregou faltas consolidadas</div>',"⚖️")}
    </div>

    <div class="v3-section-title">Visão geral</div>
    <div class="pro-card">
      ${rowsV8([
        ["Jogos concluídos",completed],
        ["Gols",totalGoals],
        ["Amarelos",totalYellow],
        ["Vermelhos",totalRed]
      ])}
    </div>
  `;
}

renderBrasil=renderBrasilFastV8;
renderStats=renderStatsFastV8;


// ============================
// V8 - MELHORES TERCEIROS NO MATA-MATA
// ============================

function groupThirdsV8(){
  const out=[];
  "ABCDEFGHIJKL".split("").forEach(gl=>{
    if(!groupFinishedV23(gl))return;
    const table=calcGroup(gl);
    const third=table[2];
    if(!third)return;
    out.push({
      group:gl,
      team:third.nm,
      pts:third.pts||0,
      gd:third.gd||0,
      gf:third.gf||0,
      ga:third.ga||0,
      wins:third.v||third.w||0,
      fair:third.yc||0
    });
  });

  return out.sort((a,b)=>
    b.pts-a.pts ||
    b.gd-a.gd ||
    b.gf-a.gf ||
    b.wins-a.wins ||
    a.fair-b.fair ||
    a.group.localeCompare(b.group)
  );
}

function bestThirdTeamsV8(){
  return groupThirdsV8().slice(0,8);
}

function isBestThirdSlotV8(slot){
  return /3º colocado|melhor\s*3/i.test(String(slot||""));
}

function applyBestThirdsV8(){
  const thirds=bestThirdTeamsV8();
  if(!thirds.length)return;

  const alreadyUsed=new Set(
    F.filter(m=>/^e\d+$/i.test(m.id))
      .flatMap(m=>[m.h,m.a])
      .filter(t=>thirds.some(x=>nm(x.team,t)))
      .map(canon)
  );

  let cursor=0;

  F.filter(m=>/^e\d+$/i.test(m.id)).forEach(m=>{
    [["h","slotH"],["a","slotA"]].forEach(([side,slotKey])=>{
      const slot=m[slotKey]||m[side];
      if(!isBestThirdSlotV8(slot))return;
      if(!isPlaceholderTeamV23(m[side]) && !isBestThirdSlotV8(m[side]))return;

      while(cursor<thirds.length && alreadyUsed.has(canon(thirds[cursor].team))){
        cursor++;
      }

      if(cursor<thirds.length){
        const team=thirds[cursor].team;
        m[side]=team;
        alreadyUsed.add(canon(team));
        cursor++;
      }
    });
  });
}

const resolveKnockoutBaseV8 = resolveKnockoutV23;
resolveKnockoutV23 = function(){
  resolveKnockoutBaseV8();
  applyBestThirdsV8();
  applyOfficialParticipantsV23();

  F.forEach(m=>{
    if(m.h==="Brazil"||m.a==="Brazil")m.br=1;
    else if(m.ph!=="grupos")delete m.br;
  });
};


// ============================
// V8 - PLACAR COM PRORROGAÇÃO E PÊNALTIS
// ============================

function toNumV8(v){
  if(v===null||v===undefined||v==="")return null;
  const n=Number(String(v).replace(/[^\d.-]/g,""));
  return Number.isFinite(n)?n:null;
}

function readPenaltyScoreV8(c){
  if(!c)return null;

  const direct=[
    c.shootoutScore,
    c.penaltyScore,
    c.penalties,
    c.penaltyShootoutScore,
    c.penaltyKicks,
    c.pkScore,
    c.shootoutGoals,
    c.team?.shootoutScore,
    c.team?.penaltyScore,
    c.team?.penalties
  ];

  for(const v of direct){
    const n=toNumV8(v);
    if(n!==null)return n;
  }

  // Fallback leve: alguns provedores aninham o placar em objetos internos.
  const candidates=[];
  function scan(node,depth=0){
    if(!node||depth>3||typeof node!=="object")return;
    Object.entries(node).forEach(([k,v])=>{
      const key=String(k).toLowerCase();
      if(/shootout|penalt|penalty|pk/.test(key)){
        const n=toNumV8(v);
        if(n!==null)candidates.push(n);
      }
      if(typeof v==="object")scan(v,depth+1);
    });
  }
  scan(c);

  return candidates.length?candidates[0]:null;
}

function penaltyInfoV8(m){
  const ev=espnEventByFixtureV23(m)||espnEventFor(m);
  const comp=ev?.competitions?.[0];
  if(!comp)return null;

  const cs=comp.competitors||[];
  if(cs.length<2)return null;

  const home=cs.find(c=>c.homeAway==="home")||cs[0];
  const away=cs.find(c=>c.homeAway==="away")||cs[1];

  const hp=readPenaltyScoreV8(home);
  const ap=readPenaltyScoreV8(away);

  if(hp===null||ap===null||hp===ap)return null;

  const homeName=espnTeamName(home)||m.h;
  const awayName=espnTeamName(away)||m.a;

  return {
    home:hp,
    away:ap,
    winnerSide:hp>ap?"home":"away",
    winner:hp>ap?homeName:awayName,
    loser:hp>ap?awayName:homeName,
    label:`Pênaltis: ${hp}-${ap}`
  };
}

function statusIsPenaltyV8(m,data){
  const txt=[
    data?.min,
    espnStatusFor(m)?.min,
    espnEventFor(m)?.status?.type?.detail,
    espnEventFor(m)?.status?.type?.shortDetail
  ].filter(Boolean).join(" ").toLowerCase();

  return /penalt|pênalt|shootout|pso/.test(txt);
}

const winnerLoserBaseV8 = winnerLoserV23;
winnerLoserV23 = function(m){
  const base=winnerLoserBaseV8(m);
  if(base)return base;

  const pk=penaltyInfoV8(m);
  if(pk)return {winner:pk.winner,loser:pk.loser};

  return null;
};

const mkCardBaseV8 = mkCard;
mkCard = function(m){
  const data=mData(m);
  const st=data?data.st:mSt(m);
  const pk=penaltyInfoV8(m);
  const isKO=m.ph!=="grupos";
  const isBR=m.br||m.h==="Brazil"||m.a==="Brazil";
  const minD=getMin(m,data);
  const pct=tPct(m,data);

  let pill="";
  if(st==="live"){
    const pen=statusIsPenaltyV8(m,data);
    pill=`<span class="mc-st ${pen?"ms-pen":"ms-live"}">${pen?"⚽ PÊNALTIS":"🔴 "+(minD||"AO VIVO")}</span>`;
  }else if(st==="finished"){
    pill=`<span class="mc-st ${pk?"ms-pen":"ms-done"}">${pk?"✓ FIM · Pênaltis":"✓ FIM"}</span>`;
  }else{
    pill=`<span class="mc-st ms-up">${m.g}</span>`;
  }

  let mid="";
  if((st==="live"||st==="finished")&&data&&data.hasScore){
    let hw=false,aw=false;
    if(pk){
      hw=pk.winnerSide==="home";
      aw=pk.winnerSide==="away";
    }else{
      hw=+data.hs>+data.as;
      aw=+data.as>+data.hs;
    }

    mid=`<div>
      <div class="sc-box ${pk?"pk":""}">
        <div class="sc${hw?" win":""}">${data.hs}</div>
        <div class="sc-d">:</div>
        <div class="sc${aw?" win":""}">${data.as}</div>
      </div>
      ${pk?`<div class="sc-extra">Pênaltis: ${pk.home}-${pk.away}</div>`:""}
    </div>`;
  }else{
    mid=`<div class="tt">${m.t}</div>`;
  }

  const hw2=st==="finished"&&data&&(pk?pk.winnerSide==="home":+data.hs>+data.as);
  const aw2=st==="finished"&&data&&(pk?pk.winnerSide==="away":+data.as>+data.hs);

  let goalsSum="";
  if(st!=="upcoming")goalsSum=goalsSummaryV9(m);

  let timerH="";
  if(st==="live"){
    timerH=`<div class="mc-timer"><div class="timer-dot"></div><div class="timer-val">${minD||"AO VIVO"}</div><div class="timer-bar-wrap"><div class="timer-bar" style="width:${pct||8}%"></div></div></div>`;
  }

  return `<div class="mc ${st}${isBR?" br":""}" onclick="openModal('${m.id}')">
    <div class="mc-top"><span class="mc-grp">${m.g}</span>${pill}</div>
    <div class="mc-row">
      <div class="mc-side"><span class="mc-fl">${fl(m.h)}</span><span class="mc-nm${hw2?" win":""}">${pt(m.h)}</span></div>
      ${mid}
      <div class="mc-side r"><span class="mc-fl">${fl(m.a)}</span><span class="mc-nm${aw2?" win":""}">${pt(m.a)}</span></div>
    </div>
    ${timerH}
    ${goalsSum}
    
    <div class="mc-venue">${m.v}</div>
    ${st!=="upcoming"?'<div class="tap-hint">Toque para detalhes ↑</div>':""}
  </div>`;
};



// ============================
// V11 - DIAGNÓSTICO E CORREÇÃO ESTÁVEL
// Base limpa V8. Não renomeia funções internas.
// Inicialização só acontece depois deste bloco.
// ============================

const KO_OFFICIAL_V11 = {
  e01:{d:"2026-06-28",t:"15:00",h:"South Africa",a:"Canada",st:"finished",hs:0,as:1},
  e02:{d:"2026-06-29",t:"14:00",h:"Brazil",a:"Japan",st:"finished",hs:2,as:1},
  e03:{d:"2026-06-29",t:"17:30",h:"Germany",a:"Paraguay",st:"finished",hs:1,as:1,pkH:3,pkA:4},
  e04:{d:"2026-06-29",t:"22:00",h:"Netherlands",a:"Morocco",st:"finished",hs:1,as:1,pkH:2,pkA:3},
  e05:{d:"2026-06-30",t:"14:00",h:"Ivory Coast",a:"Norway",st:"finished",hs:1,as:2},
  e06:{d:"2026-06-30",t:"18:00",h:"France",a:"Sweden",st:"finished",hs:3,as:0},
  e07:{d:"2026-06-30",t:"23:00",h:"Mexico",a:"Ecuador",st:"finished",hs:2,as:0},
  e08:{d:"2026-07-01",t:"13:00",h:"England",a:"DR Congo",st:"finished",hs:2,as:1},
  e09:{d:"2026-07-01",t:"17:00",h:"Belgium",a:"Senegal",st:"finished",hs:3,as:2},
  e10:{d:"2026-07-01",t:"21:00",h:"United States",a:"Bosnia and Herzegovina",st:"finished",hs:2,as:0},
  e11:{d:"2026-07-03",t:"00:00",h:"Switzerland",a:"Algeria",st:"upcoming"},
  e12:{d:"2026-07-02",t:"16:00",h:"Spain",a:"Austria",st:"upcoming"},
  e13:{d:"2026-07-02",t:"20:00",h:"Portugal",a:"Croatia",st:"upcoming"},
  e14:{d:"2026-07-03",t:"15:00",h:"Australia",a:"Egypt",st:"upcoming"},
  e15:{d:"2026-07-03",t:"19:00",h:"Argentina",a:"Cape Verde",st:"upcoming"},
  e16:{d:"2026-07-03",t:"22:30",h:"Colombia",a:"Ghana",st:"upcoming"},

  o1:{d:"2026-07-04",t:"14:00",h:"Canada",a:"Morocco",st:"upcoming"},
  o2:{d:"2026-07-04",t:"18:00",h:"Paraguay",a:"France",st:"upcoming"},
  o3:{d:"2026-07-05",t:"17:00",h:"Brazil",a:"Norway",st:"upcoming"},
  o4:{d:"2026-07-05",t:"21:00",h:"Mexico",a:"England",st:"upcoming"},
  o5:{d:"2026-07-06",t:"16:00",h:"Venc. Portugal/Croácia",a:"Venc. Espanha/Áustria",st:"upcoming"},
  o6:{d:"2026-07-06",t:"21:00",h:"United States",a:"Belgium",st:"upcoming"},
  o7:{d:"2026-07-07",t:"12:00",h:"Venc. Argentina/Cabo Verde",a:"Venc. Austrália/Egito",st:"upcoming"},
  o8:{d:"2026-07-07",t:"16:00",h:"Venc. Suíça/Argélia",a:"Venc. Colômbia/Gana",st:"upcoming"}
};

function applyOfficialKOV11(){
  Object.entries(KO_OFFICIAL_V11).forEach(([id,o])=>{
    const m=F.find(x=>x.id===id);
    if(!m)return;
    m.d=o.d||m.d;
    m.t=o.t||m.t;
    m.h=o.h||m.h;
    m.a=o.a||m.a;
  });
  F.forEach(m=>{
    if(m.h==="Brazil"||m.a==="Brazil")m.br=1;
    else if(m.ph!=="grupos")delete m.br;
  });
}

function koOfficialDataV11(m){
  const o=KO_OFFICIAL_V11[m.id];
  if(!o)return null;
  if(o.st==="finished"){
    return {hs:o.hs,as:o.as,hasScore:true,st:"finished",min:"",pct:100,source:"KO oficial V11"};
  }
  const kick=new Date(`${o.d}T${o.t}:00-03:00`).getTime();
  if(Date.now() < kick + 150*60*1000){
    return {hs:null,as:null,hasScore:false,st:"upcoming",min:"",pct:0,source:"KO oficial V11"};
  }
  return null;
}

function sideForGoalV11(g,m){
  if(g.side==="home"||g.side==="away")return g.side;
  if(sameTeamV16(g.team,m.h))return "home";
  if(sameTeamV16(g.team,m.a))return "away";
  return "";
}

function normGoalMinV11(v){
  const s=String(v??"").trim();
  const plus=s.match(/(\d+)\s*\+\s*(\d+)/);
  if(plus)return `${Number(plus[1])}+${Number(plus[2])}`;
  const mmss=s.match(/(\d+)\s*:\s*(\d+)/);
  if(mmss)return String(Number(mmss[1]));
  const n=(s.match(/\d+/)||[])[0];
  return n?String(Number(n)):"?";
}

function dedupeGoalsV11(goals,m){
  const seen=new Set();
  let out=[];
  (goals||[]).forEach(g=>{
    const side=sideForGoalV11(g,m);
    if(!side)return;
    const name=canon(g.name||g.player||"");
    const min=normGoalMinV11(g.minute||g.time||g.clock||g.displayClock);
    const key=`${m.id}|${side}|${name}|${min}`;
    if(seen.has(key))return;
    seen.add(key);
    out.push({...g,side});
  });

  const d=koOfficialDataV11(m)||mDataBaseV11(m);
  if(d&&d.hasScore){
    const capH=Number(d.hs), capA=Number(d.as);
    if(Number.isFinite(capH)&&Number.isFinite(capA)){
      const h=out.filter(g=>g.side==="home").slice(0,capH);
      const a=out.filter(g=>g.side==="away").slice(0,capA);
      out=[...h,...a];
    }
  }
  return out;
}

applyOfficialKOV11();

const mDataBaseV11=mData;
// V12: ESPN/live/finalizado sempre tem prioridade sobre o fallback manual.
// O fallback oficial só entra quando a fonte dinâmica não tem dado confiável.
mData=function(m){
  const liveOrReal=mDataBaseV11(m);
  if(liveOrReal && (liveOrReal.st==="live" || liveOrReal.st==="finished" || liveOrReal.hasScore)){
    return liveOrReal;
  }

  const o=koOfficialDataV11(m);
  if(o && o.st==="finished")return o;

  // Para jogos ainda não iniciados, o fallback só organiza agenda/adversários.
  // Ele não pode bloquear um jogo ao vivo.
  if(o && o.st==="upcoming"){
    return liveOrReal || o;
  }

  return liveOrReal || o;
};

const resolveKnockoutBaseV11=resolveKnockoutV23;
resolveKnockoutV23=function(){
  resolveKnockoutBaseV11();
  applyOfficialKOV11();
};

const renderBaseV11=render;
render=function(){
  applyOfficialKOV11();
  return renderBaseV11();
};

const penaltyInfoBaseV11=penaltyInfoV8;
penaltyInfoV8=function(m){
  const o=KO_OFFICIAL_V11[m.id];
  if(o&&o.pkH!==undefined&&o.pkA!==undefined){
    return {
      home:o.pkH,
      away:o.pkA,
      winnerSide:o.pkH>o.pkA?"home":"away",
      winner:o.pkH>o.pkA?o.h:o.a,
      loser:o.pkH>o.pkA?o.a:o.h,
      label:`Pênaltis: ${o.pkH}-${o.pkA}`
    };
  }
  return penaltyInfoBaseV11(m);
};

const allGoalsBaseV11=allGoalsForMatchV9;
allGoalsForMatchV9=function(m,ofb){
  return dedupeGoalsV11(allGoalsBaseV11(m,ofb),m);
};

const goalsSummaryBaseV11=goalsSummaryV9;
goalsSummaryV9=function(m){
  const goals=dedupeGoalsV11(allGoalsBaseV11(m,ofbMatch(m.h,m.a)),m);
  if(goals.length){
    return `<div class="goal-line">${goals.map(g=>`${fl(g.team)} ${g.name}${g.minute?` ${g.minute}'`:""}`).join(" | ")}</div>`;
  }
  const o=KO_OFFICIAL_V11[m.id];
  if(o&&o.st==="finished")return "";
  return goalsSummaryBaseV11(m);
};

window.__COPA_FIX_V11__={
  version:"V11",
  official:KO_OFFICIAL_V11,
  check(){
    const e07=F.find(x=>x.id==="e07");
    const o4=F.find(x=>x.id==="o4");
    const d=mData(e07);
    return {
      e07:`${e07.h} ${d.hs}x${d.as} ${e07.a}`,
      o4:`${o4.h} x ${o4.a}`,
      appStarted:true
    };
  }
};

// V11: agora que todos os patches estão carregados, inicia o app.
// V13: inicialização movida para o final do arquivo
// ============================
// V12 - LIVE FIX FINAL
// Garante que eventos ao vivo nunca sejam bloqueados pelo fallback do mata-mata.
// ============================

function dynamicLiveDataV12(m){
  // Tenta ESPN direto sem passar pelo mData atual para evitar loop.
  const ed=espnDataFor(m);
  if(ed && (ed.st==="live" || ed.st==="finished" || ed.hasScore)){
    return {...ed, source:ed.source || "ESPN-live-priority"};
  }

  const ml=manualLiveV8(m);
  if(ml && (ml.st==="live" || ml.st==="finished" || ml.hasScore)){
    return {...ml, source:ml.source || "local-live-priority"};
  }

  return null;
}

const mDataBeforeV12LivePriority = mData;
mData = function(m){
  const dyn = dynamicLiveDataV12(m);
  if(dyn) return dyn;
  return mDataBeforeV12LivePriority(m);
};

window.__COPA_FIX_V12__ = {
  version:"V12",
  reason:"live priority over knockout fallback",
  checkLive(id){
    const m=F.find(x=>x.id===id);
    if(!m)return null;
    return {match:`${m.h} x ${m.a}`, data:mData(m)};
  }
};


// ============================
// V13 - MOTOR DE ATUALIZAÇÃO PRIORITÁRIO
// Objetivo:
// - fonte dinâmica ESPN sempre vence fallback;
// - jogo ao vivo/finalizado nunca fica como upcoming;
// - fallback manual só organiza quando não há dado dinâmico;
// - placar antigo pode ser derivado por gols confiáveis;
// - inicialização somente após esta camada.
// ============================

function teamAliasV13(name){
  const c=canon(name);
  const map={
    "franca":"france","frança":"france","france":"france",
    "suecia":"sweden","suécia":"sweden","sweden":"sweden",
    "austria":"austria","áustria":"austria",
    "espanha":"spain","spain":"spain",
    "bosnia herz":"bosnia and herzegovina","bosnia herzegovina":"bosnia and herzegovina","bosnia and herzegovina":"bosnia and herzegovina",
    "bósnia herz":"bosnia and herzegovina","bósnia herzegovina":"bosnia and herzegovina",
    "rd congo":"dr congo","dr congo":"dr congo","congo dr":"dr congo","democratic republic of congo":"dr congo",
    "costa do marfim":"ivory coast","ivory coast":"ivory coast","cote d ivoire":"ivory coast","côte d ivoire":"ivory coast",
    "paises baixos":"netherlands","países baixos":"netherlands","holanda":"netherlands","netherlands":"netherlands",
    "marrocos":"morocco","morocco":"morocco",
    "noruega":"norway","norway":"norway",
    "alemanha":"germany","germany":"germany",
    "paraguai":"paraguay","paraguay":"paraguay",
    "inglaterra":"england","england":"england",
    "mexico":"mexico","méxico":"mexico",
    "equador":"ecuador","ecuador":"ecuador",
    "belgica":"belgium","bélgica":"belgium","belgium":"belgium",
    "senegal":"senegal",
    "eua":"united states","usa":"united states","united states":"united states","estados unidos":"united states",
    "brasil":"brazil","brazil":"brazil",
    "canada":"canada","canadá":"canada",
    "africa do sul":"south africa","áfrica do sul":"south africa","south africa":"south africa",
    "japao":"japan","japan":"japan","japão":"japan",
    "suica":"switzerland","suíça":"switzerland","switzerland":"switzerland",
    "argelia":"algeria","argélia":"algeria","algeria":"algeria",
    "portugal":"portugal",
    "croacia":"croatia","croácia":"croatia","croatia":"croatia",
    "australia":"australia","austrália":"australia",
    "egito":"egypt","egypt":"egypt",
    "argentina":"argentina",
    "cabo verde":"cape verde","cape verde":"cape verde",
    "colombia":"colombia","colômbia":"colombia",
    "gana":"ghana","ghana":"ghana"
  };
  return map[c]||c;
}

const sameTeamBeforeV13 = sameTeamV16;
sameTeamV16 = function(a,b){
  if(teamAliasV13(a)===teamAliasV13(b))return true;
  return sameTeamBeforeV13(a,b);
};

function eventDateV13(ev){
  const raw=ev?.date||ev?.competitions?.[0]?.date;
  return utcBRT(raw);
}

function eventTsV13(ev){
  const raw=ev?.date||ev?.competitions?.[0]?.date;
  const ts=new Date(raw).getTime();
  return Number.isFinite(ts)?ts:null;
}

function eventStatusV13(ev){
  const comp=ev?.competitions?.[0];
  const st=comp?.status||ev?.status||{};
  const typ=st.type||{};
  const state=typ.state||"";
  const completed=!!typ.completed;
  return {
    raw:st,
    typ,
    app:completed||state==="post"?"finished":state==="in"?"live":"upcoming",
    completed,
    state,
    detail:typ.detail||typ.shortDetail||typ.description||"",
    clock:st.displayClock||typ.shortDetail||"",
    rawClock:Number(st.clock||0)
  };
}

function eventTeamsV13(ev){
  const comp=ev?.competitions?.[0];
  const cs=comp?.competitors||[];
  const h=cs.find(c=>c.homeAway==="home")||cs[0]||null;
  const a=cs.find(c=>c.homeAway==="away")||cs[1]||null;
  return {
    home:h?espnTeamName(h):"",
    away:a?espnTeamName(a):"",
    hc:h,
    ac:a,
    competitors:cs
  };
}

function teamHitsV13(ev,m){
  const t=eventTeamsV13(ev);
  let hits=0;
  if(sameTeamV16(t.home,m.h)||sameTeamV16(t.away,m.h))hits++;
  if(sameTeamV16(t.home,m.a)||sameTeamV16(t.away,m.a))hits++;
  return hits;
}

function timeDiffMinV13(ev,m){
  const ets=eventTsV13(ev);
  const mts=matchKick(m).getTime();
  if(!Number.isFinite(ets)||!Number.isFinite(mts))return 9999;
  return Math.abs(ets-mts)/60000;
}

function dynamicEventForMatchV13(m){
  const sameDay=ESPN_EVENTS.filter(ev=>eventDateV13(ev).date===m.d);
  if(!sameDay.length)return null;

  const exact=sameDay
    .map(ev=>({ev,hits:teamHitsV13(ev,m),diff:timeDiffMinV13(ev,m),status:eventStatusV13(ev)}))
    .filter(x=>x.hits===2)
    .sort((a,b)=>a.diff-b.diff)[0];
  if(exact)return exact.ev;

  // Mata-mata: a tabela oficial da ESPN pode ser mais confiável por data+horário
  // do que os nomes placeholder do nosso calendário.
  if(m.ph!=="grupos"){
    const byTime=sameDay
      .map(ev=>({ev,hits:teamHitsV13(ev,m),diff:timeDiffMinV13(ev,m),status:eventStatusV13(ev)}))
      .filter(x=>x.diff<=60)
      .sort((a,b)=>{
        const pa=(a.status.app==="live"||a.status.app==="finished")?0:1;
        const pb=(b.status.app==="live"||b.status.app==="finished")?0:1;
        return pa-pb || b.hits-a.hits || a.diff-b.diff;
      })[0];
    if(byTime)return byTime.ev;
  }

  return null;
}

function dataFromEventV13(m,ev){
  if(!ev)return null;
  const comp=ev.competitions?.[0];
  const t=eventTeamsV13(ev);
  if(!comp||!t.hc||!t.ac)return null;

  const status=eventStatusV13(ev);

  // Para jogos futuros, não retornar placar.
  if(status.app==="upcoming"){
    return {hs:null,as:null,hasScore:false,st:"upcoming",min:"",pct:0,source:"ESPN-agenda"};
  }

  // Se o evento foi casado por horário, primeiro alinha os nomes do card ao evento real.
  if(m.ph!=="grupos" && t.home && t.away){
    m.h=t.home;
    m.a=t.away;
  }

  const sideForTeam=(team)=>{
    if(sameTeamV16(t.home,team))return "home";
    if(sameTeamV16(t.away,team))return "away";
    return "";
  };

  const hSide=sideForTeam(m.h)||"home";
  const aSide=sideForTeam(m.a)||"away";

  const hComp=hSide==="home"?t.hc:t.ac;
  const aComp=aSide==="away"?t.ac:t.hc;

  const hs=hComp?.score;
  const as=aComp?.score;
  const hasScore=hs!==undefined&&hs!==null&&as!==undefined&&as!==null&&hs!==""&&as!=="";

  const pct=status.app==="finished"
    ?100
    :status.rawClock>0?Math.min(100,Math.max(4,Math.round((status.rawClock/5400)*100))):8;

  return {hs,as,hasScore,st:status.app,min:status.clock,pct,source:"ESPN-dinâmico-V13"};
}

function dynamicDataV13(m){
  const ev=dynamicEventForMatchV13(m);
  const d=dataFromEventV13(m,ev);
  if(d && (d.st==="live"||d.st==="finished"||d.hasScore))return d;
  return d;
}

function officialDataV13(m){
  const o=typeof KO_OFFICIAL_V11!=="undefined"?KO_OFFICIAL_V11[m.id]:null;
  if(!o)return null;

  if(o.st==="finished"){
    return {hs:o.hs,as:o.as,hasScore:true,st:"finished",min:"",pct:100,source:"fallback-oficial-V13"};
  }

  return {hs:null,as:null,hasScore:false,st:"upcoming",min:"",pct:0,source:"fallback-agenda-V13"};
}

function baseGoalsRawV13(m){
  try{
    const raw=(typeof allGoalsBaseV11==="function")
      ?allGoalsBaseV11(m,ofbMatch(m.h,m.a))
      :allGoalsForMatchV9(m,ofbMatch(m.h,m.a));
    return Array.isArray(raw)?raw:[];
  }catch(e){
    console.warn("V13 goals raw",e);
    return [];
  }
}

function goalSideV13(g,m){
  if(g.side==="home"||g.side==="away")return g.side;
  if(sameTeamV16(g.team,m.h))return "home";
  if(sameTeamV16(g.team,m.a))return "away";
  return "";
}

function scoreFromGoalsV13(m){
  const kick=matchKick(m).getTime();
  if(Date.now() < kick + 150*60*1000)return null;

  const raw=baseGoalsRawV13(m);
  if(!raw.length)return null;

  const seen=new Set();
  let h=0,a=0;
  raw.forEach(g=>{
    if(g.owngoal)return;
    const side=goalSideV13(g,m);
    if(!side)return;
    const name=canon(g.name||g.player||"");
    const min=String(g.minute||g.time||g.clock||"?").replace(/[^0-9+]/g,"")||"?";
    const key=`${side}|${name}|${min}`;
    if(seen.has(key))return;
    seen.add(key);
    if(side==="home")h++;
    if(side==="away")a++;
  });

  if(!seen.size)return null;
  return {hs:h,as:a,hasScore:true,st:"finished",min:"",pct:100,source:"gols-derivados-V13"};
}

function applyDynamicNamesV13(){
  // Primeiro alinha mata-mata com eventos ESPN por data/hora.
  F.filter(m=>m.ph!=="grupos").forEach(m=>{
    const ev=dynamicEventForMatchV13(m);
    const t=eventTeamsV13(ev);
    if(t.home&&t.away){
      m.h=t.home;
      m.a=t.away;
    }
  });

  // Depois aplica fallback oficial só onde ainda falta nome real.
  if(typeof KO_OFFICIAL_V11!=="undefined"){
    Object.entries(KO_OFFICIAL_V11).forEach(([id,o])=>{
      const m=F.find(x=>x.id===id);
      if(!m)return;
      m.d=o.d||m.d;
      m.t=o.t||m.t;
      if((!m.h||isPlaceholderTeamV23(m.h))&&o.h)m.h=o.h;
      if((!m.a||isPlaceholderTeamV23(m.a))&&o.a)m.a=o.a;
    });
  }

  // Propaga vencedores conhecidos para as oitavas.
  const winner=(id)=>{
    const m=F.find(x=>x.id===id);
    if(!m)return null;
    const d=dynamicDataV13(m)||officialDataV13(m)||scoreFromGoalsV13(m);
    if(!d||!d.hasScore||d.st!=="finished")return null;

    const pk=(typeof penaltyInfoV8==="function")?penaltyInfoV8(m):null;
    if(pk?.winner)return pk.winner;

    const hs=Number(d.hs),as=Number(d.as);
    if(!Number.isFinite(hs)||!Number.isFinite(as)||hs===as)return null;
    return hs>as?m.h:m.a;
  };

  const setIfWinner=(mid,side,value)=>{
    if(!value)return;
    const m=F.find(x=>x.id===mid);
    if(!m)return;
    m[side]=value;
  };

  setIfWinner("o1","h",winner("e01"));
  setIfWinner("o1","a",winner("e04"));
  setIfWinner("o2","h",winner("e03"));
  setIfWinner("o2","a",winner("e06"));
  setIfWinner("o3","h",winner("e02"));
  setIfWinner("o3","a",winner("e05"));
  setIfWinner("o4","h",winner("e07"));
  setIfWinner("o4","a",winner("e08"));
  setIfWinner("o5","h",winner("e13"));
  setIfWinner("o5","a",winner("e12"));
  setIfWinner("o6","h",winner("e10"));
  setIfWinner("o6","a",winner("e09"));
  setIfWinner("o7","h",winner("e15"));
  setIfWinner("o7","a",winner("e14"));
  setIfWinner("o8","h",winner("e11"));
  setIfWinner("o8","a",winner("e16"));

  F.forEach(m=>{
    if(m.h==="Brazil"||m.a==="Brazil")m.br=1;
    else if(m.ph!=="grupos")delete m.br;
  });
}

const mDataBeforeV13 = mData;
mData = function(m){
  const dyn=dynamicDataV13(m);
  if(dyn && (dyn.st==="live"||dyn.st==="finished"||dyn.hasScore))return dyn;

  const derived=scoreFromGoalsV13(m);
  if(derived)return derived;

  const official=officialDataV13(m);
  if(official && official.st==="finished")return official;

  const base=mDataBeforeV13(m);
  if(base && (base.st==="live"||base.st==="finished"||base.hasScore))return base;

  return official || base;
};

const renderBeforeV13 = render;
render = function(){
  applyDynamicNamesV13();
  return renderBeforeV13();
};

const resolveKnockoutBeforeV13 = resolveKnockoutV23;
resolveKnockoutV23 = function(){
  resolveKnockoutBeforeV13();
  applyDynamicNamesV13();
};

const goalsSummaryBeforeV13 = goalsSummaryV9;
goalsSummaryV9 = function(m){
  const d=mData(m);
  const raw=baseGoalsRawV13(m);
  const seen=new Set();
  const goals=[];
  raw.forEach(g=>{
    const side=goalSideV13(g,m);
    if(!side)return;
    const name=canon(g.name||g.player||"");
    const min=String(g.minute||g.time||g.clock||"?").replace(/[^0-9+]/g,"")||"?";
    const key=`${side}|${name}|${min}`;
    if(seen.has(key))return;
    seen.add(key);
    goals.push({...g,side});
  });

  if(d?.hasScore){
    const capH=Number(d.hs),capA=Number(d.as);
    const h=goals.filter(g=>g.side==="home").slice(0,Number.isFinite(capH)?capH:999);
    const a=goals.filter(g=>g.side==="away").slice(0,Number.isFinite(capA)?capA:999);
    const capped=[...h,...a];
    if(capped.length){
      return `<div class="goal-line">${capped.map(g=>`${fl(g.team)} ${g.name}${g.minute?` ${g.minute}'`:""}`).join(" | ")}</div>`;
    }
  }

  return goalsSummaryBeforeV13(m);
};

window.__COPA_FIX_V13__={
  version:"V13",
  check(id){
    const m=F.find(x=>x.id===id);
    if(!m)return null;
    return {id,match:`${m.h} x ${m.a}`,data:mData(m)};
  },
  today(){
    return F.filter(m=>m.d===todayStr()).map(m=>({id:m.id,match:`${m.h} x ${m.a}`,data:mData(m)}));
  }
};

applyDynamicNamesV13();

// V13: inicialização única, depois de todos os patches.
// V14: inicialização movida para depois do overlay de resultados

// ============================
// V14 - RESULTADOS OFICIAIS DO MATA-MATA
// Correção pontual: quando a ESPN não casa o evento com a chave interna,
// usa camada oficial confirmada para propagar vencedores.
// ============================

const KO_RESULTS_V14 = {
  // Resultados já confirmados da primeira rodada do mata-mata.
  e11:{d:"2026-07-03",t:"00:00",h:"Switzerland",a:"Algeria",st:"finished",hs:2,as:0,w:"Switzerland"},
  e12:{d:"2026-07-02",t:"16:00",h:"Spain",a:"Austria",st:"finished",hs:3,as:0,w:"Spain"},
  e13:{d:"2026-07-02",t:"20:00",h:"Portugal",a:"Croatia",st:"finished",hs:2,as:1,w:"Portugal"}
};

const KO_NEXT_V14 = {
  o5:{h:"Portugal",a:"Spain"},
  o8:{h:"Switzerland",a:"Venc. Colômbia/Gana"}
};

function applyKOResultsV14(){
  Object.entries(KO_RESULTS_V14).forEach(([id,o])=>{
    const m=F.find(x=>x.id===id);
    if(!m)return;
    m.d=o.d||m.d;
    m.t=o.t||m.t;
    m.h=o.h||m.h;
    m.a=o.a||m.a;
  });

  Object.entries(KO_NEXT_V14).forEach(([id,o])=>{
    const m=F.find(x=>x.id===id);
    if(!m)return;
    if(o.h)m.h=o.h;
    if(o.a)m.a=o.a;
  });

  F.forEach(m=>{
    if(m.h==="Brazil"||m.a==="Brazil")m.br=1;
    else if(m.ph!=="grupos")delete m.br;
  });
}

function koResultDataV14(m){
  const o=KO_RESULTS_V14[m.id];
  if(!o)return null;
  return {
    hs:o.hs,
    as:o.as,
    hasScore:true,
    st:"finished",
    min:"",
    pct:100,
    source:"KO-results-V14"
  };
}

// Reforça a função da V13 sem reescrever o motor todo.
if(typeof applyDynamicNamesV13==="function"){
  const applyDynamicNamesBeforeV14 = applyDynamicNamesV13;
  applyDynamicNamesV13 = function(){
    applyDynamicNamesBeforeV14();
    applyKOResultsV14();
  };
}

const mDataBeforeV14 = mData;
mData = function(m){
  const v14 = koResultDataV14(m);
  if(v14)return v14;
  return mDataBeforeV14(m);
};

const resolveKnockoutBeforeV14 = resolveKnockoutV23;
resolveKnockoutV23 = function(){
  resolveKnockoutBeforeV14();
  applyKOResultsV14();
};

const renderBeforeV14 = render;
render = function(){
  applyKOResultsV14();
  return renderBeforeV14();
};

// Ajuste final de segurança para o caso em que navegação force render.
const goPageBeforeV14 = goPage;
goPage = function(page){
  applyKOResultsV14();
  const out = goPageBeforeV14(page);
  applyKOResultsV14();
  return out;
};

window.__COPA_FIX_V14__ = {
  version:"V14",
  reason:"propagar vencedores confirmados do mata-mata",
  check(){
    applyKOResultsV14();
    const e11=F.find(m=>m.id==="e11");
    const o8=F.find(m=>m.id==="o8");
    return {
      e11:e11 ? `${e11.h} ${KO_RESULTS_V14.e11.hs}x${KO_RESULTS_V14.e11.as} ${e11.a}` : null,
      o8:o8 ? `${o8.h} x ${o8.a}` : null
    };
  }
};

applyKOResultsV14();

// V14: inicialização única depois de todos os patches.
// V15: inicialização movida para depois do overlay Colombia/Gana

// ============================
// V15 - RESULTADO COLÔMBIA x GANA
// Correção pontual: propaga Colombia para enfrentar Switzerland.
// ============================

const KO_RESULTS_V15 = {
  e16:{d:"2026-07-03",t:"22:30",h:"Colombia",a:"Ghana",st:"finished",hs:1,as:0,w:"Colombia"}
};

const KO_NEXT_V15 = {
  o8:{h:"Switzerland",a:"Colombia"}
};

function applyKOResultsV15(){
  Object.entries(KO_RESULTS_V15).forEach(([id,o])=>{
    const m=F.find(x=>x.id===id);
    if(!m)return;
    m.d=o.d||m.d;
    m.t=o.t||m.t;
    m.h=o.h||m.h;
    m.a=o.a||m.a;
  });

  Object.entries(KO_NEXT_V15).forEach(([id,o])=>{
    const m=F.find(x=>x.id===id);
    if(!m)return;
    if(o.h)m.h=o.h;
    if(o.a)m.a=o.a;
  });

  F.forEach(m=>{
    if(m.h==="Brazil"||m.a==="Brazil")m.br=1;
    else if(m.ph!=="grupos")delete m.br;
  });
}

function koResultDataV15(m){
  const o=KO_RESULTS_V15[m.id];
  if(!o)return null;
  return {
    hs:o.hs,
    as:o.as,
    hasScore:true,
    st:"finished",
    min:"",
    pct:100,
    source:"KO-results-V15"
  };
}

// Reforça a V14 sem reescrever o motor inteiro.
if(typeof applyKOResultsV14==="function"){
  const applyKOResultsBeforeV15 = applyKOResultsV14;
  applyKOResultsV14 = function(){
    applyKOResultsBeforeV15();
    applyKOResultsV15();
  };
}

if(typeof applyDynamicNamesV13==="function"){
  const applyDynamicNamesBeforeV15 = applyDynamicNamesV13;
  applyDynamicNamesV13 = function(){
    applyDynamicNamesBeforeV15();
    applyKOResultsV15();
  };
}

const mDataBeforeV15 = mData;
mData = function(m){
  const v15 = koResultDataV15(m);
  if(v15)return v15;
  return mDataBeforeV15(m);
};

const resolveKnockoutBeforeV15 = resolveKnockoutV23;
resolveKnockoutV23 = function(){
  resolveKnockoutBeforeV15();
  applyKOResultsV15();
};

const renderBeforeV15 = render;
render = function(){
  applyKOResultsV15();
  return renderBeforeV15();
};

const goPageBeforeV15 = goPage;
goPage = function(page){
  applyKOResultsV15();
  const out = goPageBeforeV15(page);
  applyKOResultsV15();
  return out;
};

window.__COPA_FIX_V15__ = {
  version:"V15",
  reason:"propagar Colômbia após vitória sobre Gana",
  check(){
    applyKOResultsV15();
    const e16=F.find(m=>m.id==="e16");
    const o8=F.find(m=>m.id==="o8");
    return {
      e16:e16 ? `${e16.h} ${KO_RESULTS_V15.e16.hs}x${KO_RESULTS_V15.e16.as} ${e16.a}` : null,
      o8:o8 ? `${o8.h} x ${o8.a}` : null
    };
  }
};

applyKOResultsV15();

// V15: inicialização única depois de todos os patches.
// V16: inicialização movida para depois da auditoria geral

// ============================
// V16 - AUDITORIA GERAL DO MATA-MATA
// Revisão completa dos jogos da fase 1/16, oitavas e quartas,
// evitando correções caso a caso.
// ============================

const KO_AUDIT_RESULTS_V16 = {
  // 1/16 - Round of 32
  e01:{d:"2026-06-28",t:"15:00",h:"Canada",a:"South Africa",st:"finished",hs:1,as:0,w:"Canada"},
  e02:{d:"2026-06-29",t:"14:00",h:"Brazil",a:"Japan",st:"finished",hs:2,as:1,w:"Brazil"},
  e03:{d:"2026-06-29",t:"17:30",h:"Germany",a:"Paraguay",st:"finished",hs:1,as:1,pkH:3,pkA:4,w:"Paraguay"},
  e04:{d:"2026-06-29",t:"22:00",h:"Netherlands",a:"Morocco",st:"finished",hs:1,as:1,pkH:2,pkA:3,w:"Morocco"},
  e05:{d:"2026-06-30",t:"14:00",h:"Ivory Coast",a:"Norway",st:"finished",hs:1,as:2,w:"Norway"},
  e06:{d:"2026-06-30",t:"18:00",h:"France",a:"Sweden",st:"finished",hs:3,as:0,w:"France"},
  e07:{d:"2026-06-30",t:"22:00",h:"Mexico",a:"Ecuador",st:"finished",hs:2,as:0,w:"Mexico"},
  e08:{d:"2026-07-01",t:"13:00",h:"England",a:"DR Congo",st:"finished",hs:2,as:1,w:"England"},
  e09:{d:"2026-07-01",t:"17:00",h:"Belgium",a:"Senegal",st:"finished",hs:3,as:2,w:"Belgium"},
  e10:{d:"2026-07-01",t:"21:00",h:"United States",a:"Bosnia and Herzegovina",st:"finished",hs:2,as:0,w:"United States"},
  e11:{d:"2026-07-03",t:"00:00",h:"Switzerland",a:"Algeria",st:"finished",hs:2,as:0,w:"Switzerland"},
  e12:{d:"2026-07-02",t:"16:00",h:"Spain",a:"Austria",st:"finished",hs:3,as:0,w:"Spain"},
  e13:{d:"2026-07-02",t:"20:00",h:"Portugal",a:"Croatia",st:"finished",hs:2,as:1,w:"Portugal"},
  e14:{d:"2026-07-03",t:"15:00",h:"Australia",a:"Egypt",st:"finished",hs:1,as:1,pkH:2,pkA:4,w:"Egypt"},
  e15:{d:"2026-07-03",t:"19:00",h:"Argentina",a:"Cape Verde",st:"finished",hs:3,as:2,w:"Argentina"},
  e16:{d:"2026-07-03",t:"22:30",h:"Colombia",a:"Ghana",st:"finished",hs:1,as:0,w:"Colombia"},

  // Oitavas - Round of 16
  o1:{d:"2026-07-04",t:"14:00",h:"Morocco",a:"Canada",st:"finished",hs:3,as:0,w:"Morocco"},
  o2:{d:"2026-07-04",t:"18:00",h:"France",a:"Paraguay",st:"finished",hs:1,as:0,w:"France"},
  o3:{d:"2026-07-05",t:"17:00",h:"Brazil",a:"Norway",st:"upcoming"},
  o4:{d:"2026-07-05",t:"21:00",h:"Mexico",a:"England",st:"upcoming"},
  o5:{d:"2026-07-06",t:"15:00",h:"Portugal",a:"Spain",st:"upcoming"},
  o6:{d:"2026-07-06",t:"20:00",h:"United States",a:"Belgium",st:"upcoming"},
  o7:{d:"2026-07-07",t:"13:00",h:"Argentina",a:"Egypt",st:"upcoming"},
  o8:{d:"2026-07-07",t:"17:00",h:"Switzerland",a:"Colombia",st:"upcoming"}
};

const KO_AUDIT_NEXT_V16 = {
  q1:{h:"Morocco",a:"France"},
  q2:{h:"Venc. Portugal/Espanha",a:"Venc. EUA/Bélgica"},
  q3:{h:"Venc. Brasil/Noruega",a:"Venc. México/Inglaterra"},
  q4:{h:"Venc. Argentina/Egito",a:"Venc. Suíça/Colômbia"}
};

function resultWinnerV16(id){
  const o=KO_AUDIT_RESULTS_V16[id];
  if(!o)return null;
  if(o.w)return o.w;
  if(o.pkH!==undefined&&o.pkA!==undefined)return Number(o.pkH)>Number(o.pkA)?o.h:o.a;
  if(o.hs!==undefined&&o.as!==undefined&&Number(o.hs)!==Number(o.as))return Number(o.hs)>Number(o.as)?o.h:o.a;
  return null;
}

function applyAuditV16(){
  Object.entries(KO_AUDIT_RESULTS_V16).forEach(([id,o])=>{
    const m=F.find(x=>x.id===id);
    if(!m)return;
    m.d=o.d||m.d;
    m.t=o.t||m.t;
    m.h=o.h||m.h;
    m.a=o.a||m.a;
  });

  // Reforço de propagação direta para as oitavas.
  const r16Map = {
    o1:["e04","e01"], // Morocco x Canada
    o2:["e06","e03"], // France x Paraguay
    o3:["e02","e05"], // Brazil x Norway
    o4:["e07","e08"], // Mexico x England
    o5:["e13","e12"], // Portugal x Spain
    o6:["e10","e09"], // USA x Belgium
    o7:["e15","e14"], // Argentina x Egypt
    o8:["e11","e16"]  // Switzerland x Colombia
  };

  Object.entries(r16Map).forEach(([mid,[hId,aId]])=>{
    const m=F.find(x=>x.id===mid);
    if(!m)return;
    const h=resultWinnerV16(hId);
    const a=resultWinnerV16(aId);
    if(h)m.h=h;
    if(a)m.a=a;
    const o=KO_AUDIT_RESULTS_V16[mid];
    if(o){
      m.d=o.d||m.d;
      m.t=o.t||m.t;
      m.h=o.h||m.h;
      m.a=o.a||m.a;
    }
  });

  Object.entries(KO_AUDIT_NEXT_V16).forEach(([id,o])=>{
    const m=F.find(x=>x.id===id);
    if(!m)return;
    if(o.h)m.h=o.h;
    if(o.a)m.a=o.a;
  });

  F.forEach(m=>{
    if(m.h==="Brazil"||m.a==="Brazil")m.br=1;
    else if(m.ph!=="grupos")delete m.br;
  });
}

function auditDataV16(m){
  const o=KO_AUDIT_RESULTS_V16[m.id];
  if(!o)return null;

  if(o.st==="finished"){
    return {
      hs:o.hs,
      as:o.as,
      hasScore:true,
      st:"finished",
      min:"",
      pct:100,
      source:"auditoria-V16"
    };
  }

  // Para jogos futuros, não inventa placar e não bloqueia futuro dado ao vivo.
  return {
    hs:null,
    as:null,
    hasScore:false,
    st:"upcoming",
    min:"",
    pct:0,
    source:"agenda-auditoria-V16"
  };
}

if(typeof applyKOResultsV15==="function"){
  const applyKOResultsBeforeV16 = applyKOResultsV15;
  applyKOResultsV15 = function(){
    applyKOResultsBeforeV16();
    applyAuditV16();
  };
}

if(typeof applyDynamicNamesV13==="function"){
  const applyDynamicNamesBeforeV16 = applyDynamicNamesV13;
  applyDynamicNamesV13 = function(){
    applyDynamicNamesBeforeV16();
    applyAuditV16();
  };
}

const mDataBeforeV16 = mData;
mData = function(m){
  // Se a ESPN trouxer live/finalizado com dados reais, ela continua vencendo.
  const base = mDataBeforeV16(m);
  if(base && (base.st==="live" || (base.st==="finished" && base.hasScore && !KO_AUDIT_RESULTS_V16[m.id]))){
    return base;
  }

  const audit = auditDataV16(m);
  if(audit && audit.st==="finished")return audit;

  if(base && (base.st==="live"||base.hasScore))return base;
  return audit || base;
};

const penaltyInfoBeforeV16 = penaltyInfoV8;
penaltyInfoV8 = function(m){
  const o=KO_AUDIT_RESULTS_V16[m.id];
  if(o&&o.pkH!==undefined&&o.pkA!==undefined){
    return {
      home:o.pkH,
      away:o.pkA,
      winnerSide:Number(o.pkH)>Number(o.pkA)?"home":"away",
      winner:o.w||Number(o.pkH)>Number(o.pkA)?o.h:o.a,
      loser:Number(o.pkH)>Number(o.pkA)?o.a:o.h,
      label:`Pênaltis: ${o.pkH}-${o.pkA}`
    };
  }
  return penaltyInfoBeforeV16(m);
};

const resolveKnockoutBeforeV16 = resolveKnockoutV23;
resolveKnockoutV23 = function(){
  resolveKnockoutBeforeV16();
  applyAuditV16();
};

const renderBeforeV16 = render;
render = function(){
  applyAuditV16();
  return renderBeforeV16();
};

const goPageBeforeV16 = goPage;
goPage = function(page){
  applyAuditV16();
  const out = goPageBeforeV16(page);
  applyAuditV16();
  return out;
};

window.__COPA_AUDIT_V16__ = {
  version:"V16",
  check(){
    applyAuditV16();
    const ids=["e01","e02","e03","e04","e05","e06","e07","e08","e09","e10","e11","e12","e13","e14","e15","e16","o1","o2","o3","o4","o5","o6","o7","o8","q1","q2","q3","q4"];
    return ids.map(id=>{
      const m=F.find(x=>x.id===id);
      const d=m?mData(m):null;
      return m?{id,match:`${m.h} x ${m.a}`,data:d}:null;
    }).filter(Boolean);
  }
};

applyAuditV16();

// V16: inicialização única depois da auditoria geral.
// V17: inicialização movida para depois da auditoria 05/jul

// ============================
// V17 - AUDITORIA 05/JUL
// Corrige jogos de 05/jul e quartas.
// ============================

const KO_RESULTS_V17 = {
  o3:{d:"2026-07-05",t:"17:00",h:"Brazil",a:"Norway",st:"finished",hs:1,as:2,w:"Norway"},
  o4:{d:"2026-07-05",t:"21:00",h:"Mexico",a:"England",st:"finished",hs:2,as:3,w:"England"}
};

const KO_NEXT_V17 = {
  q3:{h:"Norway",a:"England"}
};

function applyAuditV17(){
  if(typeof applyAuditV16 === "function") applyAuditV16();

  Object.entries(KO_RESULTS_V17).forEach(([id,o])=>{
    const m=F.find(x=>x.id===id);
    if(!m)return;
    m.d=o.d||m.d;
    m.t=o.t||m.t;
    m.h=o.h||m.h;
    m.a=o.a||m.a;
  });

  Object.entries(KO_NEXT_V17).forEach(([id,o])=>{
    const m=F.find(x=>x.id===id);
    if(!m)return;
    if(o.h)m.h=o.h;
    if(o.a)m.a=o.a;
  });

  F.forEach(m=>{
    if(m.h==="Brazil"||m.a==="Brazil")m.br=1;
    else if(m.ph!=="grupos")delete m.br;
  });
}

function auditDataV17(m){
  const o=KO_RESULTS_V17[m.id];
  if(!o)return null;
  return {hs:o.hs,as:o.as,hasScore:true,st:"finished",min:"",pct:100,source:"auditoria-V17"};
}

if(typeof applyDynamicNamesV13==="function"){
  const applyDynamicNamesBeforeV17 = applyDynamicNamesV13;
  applyDynamicNamesV13 = function(){
    applyDynamicNamesBeforeV17();
    applyAuditV17();
  };
}

const mDataBeforeV17 = mData;
mData = function(m){
  const v17=auditDataV17(m);
  if(v17)return v17;

  if(typeof dynamicDataV13==="function"){
    const dyn=dynamicDataV13(m);
    if(dyn && (dyn.st==="live"||dyn.st==="finished"||dyn.hasScore))return dyn;
  }

  const base=mDataBeforeV17(m);
  if(base && (base.st==="live"||base.st==="finished"||base.hasScore))return base;

  return base;
};

const resolveKnockoutBeforeV17 = resolveKnockoutV23;
resolveKnockoutV23 = function(){
  resolveKnockoutBeforeV17();
  applyAuditV17();
};

const renderBeforeV17 = render;
render = function(){
  applyAuditV17();
  return renderBeforeV17();
};

const goPageBeforeV17 = goPage;
goPage = function(page){
  applyAuditV17();
  const out=goPageBeforeV17(page);
  applyAuditV17();
  return out;
};

window.__COPA_AUDIT_V17__ = {
  version:"V17",
  reason:"corrigir resultados 05/jul e quartas Norway x England",
  check(){
    applyAuditV17();
    const ids=["o3","o4","q3"];
    return ids.map(id=>{
      const m=F.find(x=>x.id===id);
      const d=m?mData(m):null;
      return m?{id,match:`${m.h} x ${m.a}`,data:d}:null;
    }).filter(Boolean);
  }
};

applyAuditV17();

loadAll().then(scheduleRefresh);

console.log('Copa 2026 V17 carregado');
