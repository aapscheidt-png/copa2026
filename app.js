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

async function fetchStaticESPN(){
  ESPN_EVENTS=[];
  ESPN_SUMMARIES={};

  const dates=espnDatesToFetchV18();

  for(const ds of dates){
    const url=`${ESPN}/scoreboard?dates=${ds}&limit=200`;
    const d=await espnFetchJson(url);
    if(d&&Array.isArray(d.events)){
      d.events.forEach(ev=>{
        if(!ESPN_EVENTS.find(x=>String(x.id)===String(ev.id)))ESPN_EVENTS.push(ev);
      });
    }
  }

  const needsSummary=ESPN_EVENTS
    .filter(e=>(e.status?.type?.state||"")!=="pre")
    .slice(-60);

  for(const ev of needsSummary){
    const s=await espnFetchJson(`${ESPN}/summary?event=${ev.id}`);
    if(s)ESPN_SUMMARIES[String(ev.id)]=s;
  }

  espnOk=ESPN_EVENTS.length>0;
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

  const ml = manualLiveV6(m);
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
   V6 - MODO LOCAL SEGURO
   Render imediato + placar/minuto de contingência.
============================ */
const LIVE_MATCHES = {};
Object.assign(LIVE_MATCHES, DATA.liveMatches || {});

function liveClockV6(startISO){
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

function manualLiveV6(m){
  const x = LIVE_MATCHES[matchKey(m.h,m.a)];
  if(!x) return null;
  const clk = liveClockV6(x.startISO);
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

function safeRunV6(fn, ms=3500){
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
  {id:"e03",g:"1/16",d:"2026-06-29",t:"17:30",h:"1 Grupo E",a:"Melhor 3",v:"Gillette Stadium, Boston",ph:"oitavas"},
  {id:"e04",g:"1/16",d:"2026-06-29",t:"22:00",h:"1 Grupo F",a:"2 Grupo C",v:"Estadio BBVA, Monterrey",ph:"oitavas"},
  {id:"e05",g:"1/16",d:"2026-06-30",t:"14:00",h:"2 Grupo E",a:"2 Grupo I",v:"AT&T Stadium, Dallas",ph:"oitavas"},
  {id:"e06",g:"1/16",d:"2026-06-30",t:"18:00",h:"1 Grupo I",a:"Melhor 3",v:"MetLife Stadium, Nova York",ph:"oitavas"},
  {id:"e07",g:"1/16",d:"2026-06-30",t:"22:00",h:"1 Grupo A",a:"Melhor 3",v:"Estádio Azteca, Cidade do México",ph:"oitavas"},
  {id:"e08",g:"1/16",d:"2026-07-01",t:"13:00",h:"1 Grupo L",a:"Melhor 3",v:"Mercedes-Benz Stadium, Atlanta",ph:"oitavas"},
  {id:"e09",g:"1/16",d:"2026-07-01",t:"17:00",h:"1 Grupo G",a:"Melhor 3",v:"Lumen Field, Seattle",ph:"oitavas"},
  {id:"e10",g:"1/16",d:"2026-07-01",t:"21:00",h:"1 Grupo D",a:"Melhor 3",v:"Levi's Stadium, San Francisco",ph:"oitavas"},
  {id:"e11",g:"1/16",d:"2026-07-02",t:"00:00",h:"1 Grupo B",a:"Melhor 3",v:"BC Place, Vancouver",ph:"oitavas"},
  {id:"e12",g:"1/16",d:"2026-07-02",t:"16:00",h:"1 Grupo H",a:"2 Grupo J",v:"SoFi Stadium, Los Angeles",ph:"oitavas"},
  {id:"e13",g:"1/16",d:"2026-07-02",t:"20:00",h:"2 Grupo K",a:"2 Grupo L",v:"BMO Field, Toronto",ph:"oitavas"},
  {id:"e14",g:"1/16",d:"2026-07-03",t:"15:00",h:"2 Grupo D",a:"2 Grupo G",v:"AT&T Stadium, Dallas",ph:"oitavas"},
  {id:"e15",g:"1/16",d:"2026-07-03",t:"17:00",h:"1 Grupo J",a:"2 Grupo H",v:"Mercedes-Benz Stadium, Atlanta",ph:"oitavas"},
  {id:"e16",g:"1/16",d:"2026-07-03",t:"22:30",h:"1 Grupo K",a:"Melhor 3",v:"Children's Mercy Park, Kansas City",ph:"oitavas"},
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
  const phN={grupos:"Fase de Grupos",oitavas:"Fase Eliminatória",semi:"Quartas - Semis - Final"};
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
<div class="st-legend"><span><span class="ld" style="background:var(--green)"></span>Classificado</span><span><span class="ld" style="background:var(--gold)"></span>Melhor 3</span><span><span class="ld" style="background:#4B5563"></span>Eliminado</span>${hasLive?'<span><span class="ld" style="background:var(--live)"></span>Parcial ao vivo</span>':""}</div>
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

function cardPlayerNameV7(c){return c.name||c.player||c.athlete||c.displayName||c.text||"Jogador não informado";}
function cardMinuteV7(c){return c.minute||c.time||c.clock||"?";}


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
        const type=cardType(c), name=cardPlayerNameV7(c), minute=cardMinuteV7(c);
        const key=canon(name)+"|"+canon(team);
        if(!cardPlayers[key])cardPlayers[key]={name,team,yc:0,rc:0,total:0,mins:[],source:c.source||""};
        if(type==="red"){cardPlayers[key].rc++;}
        else{cardPlayers[key].yc++;}
        cardPlayers[key].total++;cardPlayers[key].mins.push(minute);
      });
    });
  });

  // Zera e aplica totais por seleção com prioridade para fonte agregada.
  Object.values(teams).forEach(t=>{
    const agg=teamDisciplineTotalV10(t.nm);
    if(agg){
      t.yc=agg.yc||0;
      t.rc=agg.rc||0;
      t.agg=true;
      t.cardSource=agg.source||"agregado";
    }else{
      const players=Object.values(cardPlayers).filter(p=>nm(p.team,t.nm));
      t.yc=players.reduce((s,p)=>s+p.yc,0);
      t.rc=players.reduce((s,p)=>s+p.rc,0);
    }
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

  // Artilheiros
  let scorersMap={};
  if(ofbOk&&OFB_DATA&&OFB_DATA.matches){
    OFB_DATA.matches.forEach(m=>{
      (m.goals1||[]).forEach(g=>{if(!g.owngoal){const k=g.name+"|"+m.team1;scorersMap[k]=(scorersMap[k]||{name:g.name,goals:0,team:m.team1});scorersMap[k].goals++;}});
      (m.goals2||[]).forEach(g=>{if(!g.owngoal){const k=g.name+"|"+m.team2;scorersMap[k]=(scorersMap[k]||{name:g.name,goals:0,team:m.team2});scorersMap[k].goals++;}});
    });
  }
  F.filter(m=>mSt(m)!=="upcoming").forEach(m=>{
    const ofb=ofbMatch(m.h,m.a);
    allGoalsForMatchV9(m,ofb).forEach(g=>{
      const k=(g.name||"-")+"|"+(g.team||"");
      scorersMap[k]=(scorersMap[k]||{name:g.name||"-",goals:0,team:g.team||""});
      if(!scorersMap[k]._countedV10){scorersMap[k].goals++;scorersMap[k]._countedV10=true;}
    });
  });
  const sList=Object.values(scorersMap).sort((a,b)=>b.goals-a.goals).slice(0,12);

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

  return`<div class="stats-version">✓ V20 Match Center · ESPN automático · cartões sem pontos</div>
<div class="kpi-grid">
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
  <div class="stat-source-warning"><b>Fonte dos cartões:</b> V20 usa ESPN direto + fontes gratuitas para jogadores identificados e DISCIPLINE_TEAM_TOTALS para totais por seleção quando a matéria não lista todos os nomes. Sem cálculo de pontos disciplinares.</div>
</div>

<div class="list-blk"><div class="lb-hdr"><span class="lhi">📋</span><h3>SOBRE O TORNEIO</h3></div>
<table class="info-tbl">
  <tr><td>Edição</td><td>23ª Copa do Mundo FIFA</td></tr>
  <tr><td>Países sede</td><td>🇺🇸 EUA · 🇨🇦 Canadá · 🇲🇽 México</td></tr>
  <tr><td>Seleções</td><td>48 · 12 grupos de 4</td></tr>
  <tr><td>Total de jogos</td><td>104</td></tr>
  <tr><td>Final</td><td>19 Jul · MetLife, Nova York</td></tr>
  <tr><td>Versão</td><td style="color:var(--gold)">V20 Match Center</td></tr>
</table></div>`;
}


function teamStatsV12(team){
  const games=F.filter(m=>m.h===team||m.a===team);
  const played=games.filter(m=>{const d=mData(m);return mSt(m)==="finished"&&d&&d.hasScore;});
  const live=games.filter(m=>mSt(m)==="live");
  const next=games.find(m=>mSt(m)==="upcoming");
  const s={j:0,v:0,e:0,d:0,gp:0,gc:0,sg:0,pts:0,next,live:live[0]||null,goals:[],cards:[]};
  played.forEach(m=>{
    const d=mData(m);const isH=m.h===team;const gf=+(isH?d.hs:d.as),ga=+(isH?d.as:d.hs);
    s.j++;s.gp+=gf;s.gc+=ga;s.sg+=gf-ga;
    if(gf>ga){s.v++;s.pts+=3;}else if(gf===ga){s.e++;s.pts++;}else{s.d++;}
  });
  games.filter(m=>mSt(m)!=="upcoming").forEach(m=>{
    const ofb=ofbMatch(m.h,m.a);
    allGoalsForMatchV9(m,ofb).filter(g=>nm(g.team,team)).forEach(g=>s.goals.push(g));
    const side=m.h===team?"home":"away";
    cardsForMatch(m,side).forEach(c=>s.cards.push(c));
  });
  return s;
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

  return `<div class="pro-badge">✓ V20 Match Center · base única carregada</div>
  <div class="team-hero">
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

  <div class="list-blk"><div class="lb-hdr"><span class="lhi">⚽</span><h3>GOLS DO BRASIL</h3><span class="api-src">ESPN/free</span></div>${goalsH}</div>
  <div class="list-blk"><div class="lb-hdr"><span class="lhi">🟨</span><h3>CARTÕES DO BRASIL</h3><span class="api-src">ESPN/free</span></div>${cardsH}</div>

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
    fouls:{home:get(h,["foulsCommitted","fouls","faltas","FC"]),away:get(a,["foulsCommitted","fouls","faltas","FC"])}
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

  render();

  await Promise.allSettled([
    safeRunV6(fetchStaticESPN,3500),
    safeRunV6(fetchWCGames,3500),
    safeRunV6(fetchWCGroups,3500),
    safeRunV6(fetchWCScorers,3500),
    safeRunV6(fetchOFB,3500),
    safeRunV6(fetchFD,3500)
  ]);

  render();

  const now=new Date();
  const liveEspn=F.some(m=>espnDataFor(m)?.st==="live");
  const src=espnOk?"✓ ESPN direto":wcOk?"✓ worldcup26.ir":"✓ aguardando fonte gratuita";
  const upd=document.getElementById("updLbl");
  if(upd)upd.textContent=`${src} - ${now.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}`;
  document.getElementById("apiWarn")?.classList.remove("on");
  if(btn)btn.classList.remove("spin");
}
function scheduleRefresh(){const lc=liveCount();const delay=lc>0?30000:300000;setTimeout(()=>{loadAll().then(scheduleRefresh);},delay);}
loadAll().then(scheduleRefresh);

console.log('Copa 2026 V20 Match Center carregado');
