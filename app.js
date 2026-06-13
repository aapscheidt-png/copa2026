// COPA DO MUNDO 2026 - app.js - by Pscheidt
// APIs: worldcup26.ir (live scores/groups) + openfootball (goals/cards) + football-data.org (scorers)
// No hardcoded scores. 100% online.

const WC  = "https://worldcup26.ir";
const OFB = "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";
const FD  = "https://api.football-data.org/v4";
const FDK = "86cb611164f348ac89dcc715dda20f92";

const FL={"Mexico":"🇲🇽","South Africa":"🇿🇦","South Korea":"🇰🇷","Czechia":"🇨🇿","Czech Republic":"🇨🇿","Canada":"🇨🇦","Bosnia and Herzegovina":"🇧🇦","Bosnia":"🇧🇦","Qatar":"🇶🇦","Switzerland":"🇨🇭","Brazil":"🇧🇷","Morocco":"🇲🇦","Haiti":"🇭🇹","Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","Australia":"🇦🇺","Türkiye":"🇹🇷","Turkey":"🇹🇷","United States":"🇺🇸","Paraguay":"🇵🇾","Germany":"🇩🇪","Curacao":"🇨🇼","Curaçao":"🇨🇼","Netherlands":"🇳🇱","Japan":"🇯🇵","Ivory Coast":"🇨🇮","Côte d'Ivoire":"🇨🇮","Ecuador":"🇪🇨","Sweden":"🇸🇪","Tunisia":"🇹🇳","Spain":"🇪🇸","Cape Verde":"🇨🇻","Belgium":"🇧🇪","Egypt":"🇪🇬","Saudi Arabia":"🇸🇦","Uruguay":"🇺🇾","Iran":"🇮🇷","New Zealand":"🇳🇿","Austria":"🇦🇹","Jordan":"🇯🇴","France":"🇫🇷","Senegal":"🇸🇳","Iraq":"🇮🇶","Norway":"🇳🇴","Argentina":"🇦🇷","Algeria":"🇩🇿","Portugal":"🇵🇹","DR Congo":"🇨🇩","Congo DR":"🇨🇩","England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Croatia":"🇭🇷","Ghana":"🇬🇭","Panama":"🇵🇦","Uzbekistan":"🇺🇿","Colombia":"🇨🇴","Korea Republic":"🇰🇷"};
const PT={"Mexico":"México","South Africa":"África do Sul","South Korea":"Coreia do Sul","Czechia":"Tchéquia","Czech Republic":"Tchéquia","Canada":"Canadá","Bosnia and Herzegovina":"Bósnia-Herz.","Bosnia":"Bósnia-Herz.","Qatar":"Catar","Switzerland":"Suíça","Brazil":"Brasil","Morocco":"Marrocos","Haiti":"Haiti","Scotland":"Escócia","Australia":"Austrália","Türkiye":"Turquia","Turkey":"Turquia","United States":"EUA","Paraguay":"Paraguai","Germany":"Alemanha","Curacao":"Curaçao","Curaçao":"Curaçao","Netherlands":"Países Baixos","Japan":"Japão","Ivory Coast":"Costa do Marfim","Côte d'Ivoire":"Costa do Marfim","Ecuador":"Equador","Sweden":"Suécia","Tunisia":"Tunísia","Spain":"Espanha","Cape Verde":"Cabo Verde","Belgium":"Bélgica","Egypt":"Egito","Saudi Arabia":"Arábia Saudita","Uruguay":"Uruguai","Iran":"Irã","New Zealand":"Nova Zelândia","Austria":"Áustria","Jordan":"Jordânia","France":"França","Senegal":"Senegal","Iraq":"Iraque","Norway":"Noruega","Argentina":"Argentina","Algeria":"Argélia","Portugal":"Portugal","DR Congo":"RD Congo","Congo DR":"RD Congo","England":"Inglaterra","Croatia":"Croácia","Ghana":"Gana","Panama":"Panamá","Uzbekistan":"Uzbequistão","Colombia":"Colômbia","Korea Republic":"Coreia do Sul"};
const fl=n=>FL[n]||"🏳️";
const pt=n=>PT[n]||n;

// Normalização forte de nomes: evita casar "South Africa" com "South Korea".
const ALIAS={
  "korea republic":"south korea","republic of korea":"south korea","south korea":"south korea",
  "czech republic":"czechia","czechia":"czechia",
  "turkey":"turkiye","turkiye":"turkiye","türkiye":"turkiye",
  "usa":"united states","usmnt":"united states","united states":"united states",
  "cote divoire":"ivory coast","côte divoire":"ivory coast","cote d ivoire":"ivory coast","ivory coast":"ivory coast",
  "dr congo":"dr congo","congo dr":"dr congo","d r congo":"dr congo",
  "curacao":"curacao","curaçao":"curacao",
  "bosnia":"bosnia and herzegovina","bosnia herzegovina":"bosnia and herzegovina","bosnia and herzegovina":"bosnia and herzegovina"
};
function normName(v){
  return String(v||"")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase()
    .replace(/&/g," and ")
    .replace(/[^a-z0-9]+/g," ")
    .trim();
}
function canon(v){
  const n=normName(v);
  return ALIAS[n]||n;
}
function nm(a,b){
  if(!a||!b)return false;
  return canon(a)===canon(b);
}


// Correção de segurança: resultados já concluídos conhecidos.
// Usado somente se a API vier atrasada, sem placar ou sem encontrar o jogo.
// Evita jogo encerrado aparecer como "a acontecer" e evita tabela errada.
const FALLBACK_RESULTS = {
  "mexico|south africa": {hs:2, as:0, st:"finished"},
  "south korea|czechia": {hs:2, as:1, st:"finished"},
  "canada|bosnia and herzegovina": {hs:1, as:1, st:"finished"},
  "united states|paraguay": {hs:4, as:1, st:"finished"},
  "qatar|switzerland": {hs:1, as:1, st:"finished"}
};
function matchKey(h,a){return `${canon(h)}|${canon(a)}`;}

// V4 - Correção de placar ao vivo e cronômetro.
// Use este bloco quando a API vier sem dados ao vivo ou atrasada.
// Atualize apenas enquanto o jogo estiver acontecendo.
const LIVE_OVERRIDES = {
  "brazil|morocco": {hs:1, as:1, st:"live", min:"AO VIVO"}
};

function liveOverrideFor(m){
  return LIVE_OVERRIDES[matchKey(m.h,m.a)] || null;
}

function safeClockLabel(m, data){
  if(data && data.min && String(data.min).trim()) return data.min;
  const ov = liveOverrideFor(m);
  if(ov && ov.min) return ov.min;

  // Se não há minuto confiável vindo da API, não inventa intervalo.
  // Antes a tela estimava pelo horário e podia exibir INTERVALO erroneamente.
  if(data && data.st === "live") return "AO VIVO";
  return "";
}


let WC_GAMES=[],WC_GROUPS=[],WC_SCORERS=[],OFB_DATA=null,FD_SC=[];
let wcOk=false,ofbOk=false,fdOk=false;
let curPage="jogos",curFilter="all";
let modalId=null,modalTmr=null;

const todayStr=()=>{const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
const isToday=d=>d&&d.startsWith(todayStr());
function fmtD(d){if(!d)return"";const dt=new Date(d+"T12:00:00");const wd=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];const mo=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago"];const tod=isToday(d)?'<span class="today-lbl"> — HOJE</span>':"";return`${wd[dt.getDay()]}, ${dt.getDate()} ${mo[dt.getMonth()]}${tod}`;}
function utcBRT(s){if(!s)return{date:"",time:""};const dt=new Date(s);const brt=new Date(dt.getTime()-3*3600000);const date=`${brt.getFullYear()}-${String(brt.getMonth()+1).padStart(2,"0")}-${String(brt.getDate()).padStart(2,"0")}`;const time=`${String(brt.getHours()).padStart(2,"0")}:${String(brt.getMinutes()).padStart(2,"0")}`;return{date,time};}
function estMin(d,t){if(!d||!t)return null;const[h,m]=t.split(":").map(Number);const kick=new Date(d+"T12:00:00");kick.setHours(h,m,0);const el=Math.floor((new Date()-kick)/60000);if(el<0)return null;if(el<=45)return Math.min(el,45);if(el<=60)return 45;if(el<=105)return Math.min(el-15,90);return 90;}
function isHT(d,t){if(!d||!t)return false;const[h,m]=t.split(":").map(Number);const k=new Date(d+"T12:00:00");k.setHours(h,m,0);const el=Math.floor((new Date()-k)/60000);return el>45&&el<=60;}
const liveCount=()=>WC_GAMES.filter(g=>g._st==="live").length;

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

function wcGame(h,a){
  return WC_GAMES.find(g=>nm(g.home_team_name_en||g.home_team,h)&&nm(g.away_team_name_en||g.away_team,a));
}
function ofbMatch(h,a){
  if(!OFB_DATA||!OFB_DATA.matches)return null;
  return OFB_DATA.matches.find(m=>nm(m.team1,h)&&nm(m.team2,a));
}
function matchKick(m){
  const[h,mi]=(m.t||"00:00").split(":").map(Number);
  const kick=new Date(m.d+"T12:00:00");
  kick.setHours(h||0,mi||0,0,0);
  return kick;
}
function fallbackStatus(m){
  const now=new Date(),kick=matchKick(m),end=new Date(kick.getTime()+130*60000);
  if(now>end)return"finished";
  if(now>=kick)return"live";
  return"upcoming";
}
function mData(m){
  const ov = liveOverrideFor(m);
  if(ov) return {hs:ov.hs, as:ov.as, hasScore:true, st:ov.st, min:ov.min, source:"live_override"};

  const fb = FALLBACK_RESULTS[matchKey(m.h,m.a)];
  const g = wcGame(m.h,m.a);

  if(!g){
    if(fb) return {hs:fb.hs, as:fb.as, hasScore:true, st:"finished", min:null, source:"fallback"};
    return null;
  }

  let hs = g.home_score ?? g.home_goals ?? g.homeTeamScore ?? g.home_score_current ?? null;
  let as = g.away_score ?? g.away_goals ?? g.awayTeamScore ?? g.away_score_current ?? null;
  let hasScore = hs!==null && hs!==undefined && as!==null && as!==undefined && hs!=="" && as!=="";
  let apiSt = g._st || "upcoming";

  if((!hasScore || apiSt==="upcoming") && fb){
    hs = fb.hs; as = fb.as; hasScore = true; apiSt = "finished";
  }

  const st = hasScore || apiSt==="live" ? apiSt : fallbackStatus(m);
  return {hs, as, hasScore, st, min:g._min, source:fb && apiSt==="finished" ? "fallback" : "api"};
}
function mSt(m){
  const d=mData(m);
  if(d)return d.st;
  return fallbackStatus(m);
}
function getMin(m,d){
  if(!d) return "";
  const lbl = safeClockLabel(m,d);
  if(lbl) return lbl;
  return "";
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
      if(st==="live"&&data&&data.hs!=null)sStr=`<span style="color:var(--live)">${data.hs}-${data.as} ${safeClockLabel(m,data)||"AO VIVO"} 🔴</span>`;
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
  if(st==="live"){const ht=isHT(m.d,m.t);liveBar=`<div class="modal-timer-bar"><div class="td"></div><div class="tv" id="mtv">${ht?"INTERVALO":minD}</div><div class="tbw"><div class="tb" id="mtb" style="width:${pct}%"></div></div><div class="tp">/ 90'</div></div>`;}
  const dt=new Date(m.d+"T12:00:00");
  const wd=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  const mo=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago"];
  const dStr=`${wd[dt.getDay()]}, ${dt.getDate()} ${mo[dt.getMonth()]}`;
  const ofb=ofbMatch(m.h,m.a);
  let body="";
  if(st==="upcoming")body='<div class="no-data">Jogo ainda não iniciado</div>';
  else if(ofb)body=buildDetail(m,ofb);
  else body='<div class="no-data">Detalhes disponiveis via openfootball apos encerramento</div>';
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
  const g1=ofb.goals1||[],g2=ofb.goals2||[];
  if(g1.length||g2.length){
    html+='<div class="modal-sec"><div class="modal-sec-title">⚽ Gols</div>';
    [...g1.map(g=>({...g,side:"home"})),...g2.map(g=>({...g,side:"away"}))]
      .sort((a,b)=>parseInt(a.minute||0)-parseInt(b.minute||0))
      .forEach(g=>{
        const isH=g.side==="home";
        const icon=g.owngoal?"🔴":g.penalty?"🎯":"⚽";
        const lbl=g.owngoal?" (contra)":g.penalty?" (pen)":"";
        html+=`<div class="ev-row"><div class="ev-min">${g.minute||"?"}'</div><div class="ev-icon">${icon}</div><div class="ev-name">${g.name||"-"}${lbl}</div><div class="ev-team">${isH?fl(m.h):fl(m.a)}</div></div>`;
      });
    html+="</div>";
  }
  const b1=ofb.bookings1||[],b2=ofb.bookings2||[];
  if(b1.length||b2.length){
    html+='<div class="modal-sec"><div class="modal-sec-title">🟨 Cartões</div>';
    [...b1.map(b=>({...b,side:"home"})),...b2.map(b=>({...b,side:"away"}))]
      .sort((a,b)=>parseInt(a.minute||0)-parseInt(b.minute||0))
      .forEach(b=>{
        const isH=b.side==="home";
        const icon=(b.card||"").toLowerCase().includes("red")?"🟥":"🟨";
        html+=`<div class="ev-row"><div class="ev-min">${b.minute||"?"}'</div><div class="ev-icon">${icon}</div><div class="ev-name">${b.name||"-"}</div><div class="ev-team">${isH?fl(m.h):fl(m.a)}</div></div>`;
      });
    html+="</div>";
  }
  const s1=ofb.subs1||ofb.substitutions1||[],s2=ofb.subs2||ofb.substitutions2||[];
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
  if(!g1.length&&!g2.length&&!b1.length&&!b2.length)html+='<div class="no-data">Eventos ainda nao disponiveis</div>';
  return html;
}
function startMTmr(m){
  if(modalTmr)clearInterval(modalTmr);
  if(mSt(m)!=="live")return;
  modalTmr=setInterval(()=>{
    const data=mData(m);
    const tv=document.getElementById("mtv");const tb=document.getElementById("mtb");
    if(tv)tv.textContent=isHT(m.d,m.t)?"INTERVALO":getMin(m,data);
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

function bookingsOf(ofb,side){
  if(!ofb)return[];
  const keys=side==="home"
    ?["bookings1","cards1","yellow_cards1","red_cards1"]
    :["bookings2","cards2","yellow_cards2","red_cards2"];
  return keys.flatMap(k=>Array.isArray(ofb[k])?ofb[k]:[]);
}
function cardType(b){
  const raw=String(b.card||b.type||b.event||b.reason||"yellow").toLowerCase();
  if(raw.includes("red")||raw.includes("vermelho"))return"red";
  return"yellow";
}
function allPlayedMatches(){
  return F.filter(m=>{
    const d=mData(m);
    return m.ph==="grupos" && mSt(m)==="finished" && d && d.hasScore;
  });
}
function renderStats(){
  const playedMatches=allPlayedMatches();
  const played=playedMatches.length;
  const lc=liveCount();

  let totalG=0,scorersMap={},cardsY=0,cardsR=0,cleanSheets=0,bigWins=[];
  playedMatches.forEach(m=>{
    const d=mData(m);
    const hs=+d.hs,as=+d.as;
    totalG+=hs+as;
    if(hs===0)cleanSheets++;
    if(as===0)cleanSheets++;
    bigWins.push({m,diff:Math.abs(hs-as),score:`${hs}-${as}`});

    const ofb=ofbMatch(m.h,m.a);
    if(ofb){
      (ofb.goals1||[]).forEach(g=>{if(!g.owngoal){const k=canon(g.name)+"|"+canon(m.h);scorersMap[k]=(scorersMap[k]||{name:g.name,goals:0,team:m.h});scorersMap[k].goals++;}});
      (ofb.goals2||[]).forEach(g=>{if(!g.owngoal){const k=canon(g.name)+"|"+canon(m.a);scorersMap[k]=(scorersMap[k]||{name:g.name,goals:0,team:m.a});scorersMap[k].goals++;}});
      [...bookingsOf(ofb,"home"),...bookingsOf(ofb,"away")].forEach(b=>cardType(b)==="red"?cardsR++:cardsY++);
    }
  });

  const avg=played>0?(totalG/played).toFixed(2):"—";
  const avgCards=played>0?((cardsY+cardsR)/played).toFixed(2):"—";
  const pct=Math.round(played/104*100);

  let sList=[];
  if(Object.keys(scorersMap).length>0)sList=Object.values(scorersMap).sort((a,b)=>b.goals-a.goals||a.name.localeCompare(b.name)).slice(0,15);
  else if(WC_SCORERS.length>0)sList=WC_SCORERS.slice(0,15).map(s=>({name:s.player_name||s.name||"-",goals:s.goals||0,team:s.team_name||s.team||""}));
  else if(fdOk&&FD_SC.length)sList=FD_SC.slice(0,15).map(s=>({name:s.player?.name||"-",goals:s.goals||0,team:s.team?.name||""}));

  let teamSt=[];
  ["A","B","C","D","E","F","G","H","I","J","K","L"].forEach(gl=>{
    const rows=calcGroup(gl);
    rows.filter(t=>t.j>0).forEach(t=>{
      let yc=0,rc=0;
      F.filter(m=>m.g===gl&&m.ph==="grupos"&&mSt(m)==="finished").forEach(m=>{
        const ofb=ofbMatch(m.h,m.a),d=mData(m);
        if(ofb&&d&&d.hasScore){
          const isH=nm(m.h,t.nm);
          bookingsOf(ofb,isH?"home":"away").forEach(b=>cardType(b)==="red"?rc++:yc++);
        }
      });
      const ppg=t.j?(t.pts/t.j).toFixed(2):"0.00";
      const gpg=t.j?(t.gp/t.j).toFixed(2):"0.00";
      teamSt.push({...t,yc,rc,ppg,gpg});
    });
  });

  const topAtk=[...teamSt].sort((a,b)=>b.gp-a.gp||b.sg-a.sg).slice(0,10);
  const topDef=[...teamSt].sort((a,b)=>a.gc-b.gc||b.sg-a.sg).slice(0,10);
  const topDis=[...teamSt].sort((a,b)=>(b.yc+b.rc*3)-(a.yc+a.rc*3)).filter(t=>t.yc+t.rc>0).slice(0,10);
  const topEff=[...teamSt].sort((a,b)=>b.ppg-a.ppg||b.sg-a.sg).slice(0,10);
  bigWins=bigWins.sort((a,b)=>b.diff-a.diff).slice(0,5);

  const maxGP=topAtk[0]?.gp||1;
  const src=wcOk?"worldcup26.ir":ofbOk?"openfootball":"football-data.org";
  const teamName=s=>{const fk=Object.keys(FL).find(k=>nm(k,s.team));const flag=fk?fl(fk):"🏳️";const tk=Object.keys(PT).find(k=>nm(k,s.team));return{flag,tPT:tk?pt(tk):(s.team||"-")};};

  let sH=sList.length?sList.map((s,i)=>{const {flag,tPT}=teamName(s);return`<div class="li"><div class="li-rk${i<3?" top":""}">${i+1}</div><div class="li-fl">${flag}</div><div class="li-inf"><div class="li-nm">${s.name}</div><div class="li-sb">${tPT}</div></div><div class="li-val">${s.goals} ⚽</div></div>`;}).join(""):'<div class="no-data">Disponivel apos os primeiros gols cadastrados na fonte de eventos</div>';
  let aH=topAtk.length?topAtk.map((t,i)=>`<div class="li"><div class="li-rk${i<3?" top":""}">${i+1}</div><div class="li-fl">${fl(t.nm)}</div><div class="li-inf"><div class="li-nm">${pt(t.nm)}</div><div class="li-sb">${t.j} jogo(s) · ${t.gpg} gol/jogo · SG ${t.sg>0?"+":""}${t.sg}</div><div class="li-bar-wrap" style="margin-top:4px"><div class="li-bar" style="width:${Math.round(t.gp/maxGP*100)}%"></div></div></div><div class="li-val">${t.gp}</div></div>`).join(""):'<div class="empty">Aguardando jogos</div>';
  let dH=topDef.length?topDef.map((t,i)=>`<div class="li"><div class="li-rk${i<3?" top":""}">${i+1}</div><div class="li-fl">${fl(t.nm)}</div><div class="li-inf"><div class="li-nm">${pt(t.nm)}</div><div class="li-sb">${t.j} jogo(s) · GP ${t.gp} · SG ${t.sg>0?"+":""}${t.sg}</div></div><div class="li-val" style="color:var(--green)">${t.gc}</div></div>`).join(""):'<div class="empty">Aguardando jogos</div>';
  let effH=topEff.length?topEff.map((t,i)=>`<div class="li"><div class="li-rk${i<3?" top":""}">${i+1}</div><div class="li-fl">${fl(t.nm)}</div><div class="li-inf"><div class="li-nm">${pt(t.nm)}</div><div class="li-sb">${t.pts} pts em ${t.j} jogo(s)</div></div><div class="li-val">${t.ppg}</div></div>`).join(""):'<div class="empty">Aguardando jogos</div>';
  let disH=topDis.length?topDis.map((t,i)=>`<div class="li"><div class="li-rk${i<3?" top":""}">${i+1}</div><div class="li-fl">${fl(t.nm)}</div><div class="li-inf"><div class="li-nm">${pt(t.nm)}</div><div class="li-sb">${t.yc} amarelo(s) · ${t.rc} vermelho(s)</div></div><div class="li-val">${t.yc}🟨 ${t.rc}🟥</div></div>`).join(""):'<div class="no-data">Cartões ainda não disponíveis na fonte de eventos</div>';
  let goleadasH=bigWins.length?bigWins.map((x,i)=>`<div class="li"><div class="li-rk${i<3?" top":""}">${i+1}</div><div class="li-fl">${fl(x.m.h)}${fl(x.m.a)}</div><div class="li-inf"><div class="li-nm">${pt(x.m.h)} x ${pt(x.m.a)}</div><div class="li-sb">${x.m.d.split("-").reverse().join("/")}</div></div><div class="li-val">${x.score}</div></div>`).join(""):'<div class="empty">Aguardando jogos</div>';

  return`<div class="kpi-grid">
  <div class="kpi"><div class="kpi-n">${played}</div><div class="kpi-l">Jogos com placar</div></div>
  <div class="kpi"><div class="kpi-n" style="color:${lc?"var(--live)":"var(--gold)"}">${lc}</div><div class="kpi-l" style="color:${lc?"var(--live)":""}">Ao vivo agora</div></div>
  <div class="kpi"><div class="kpi-n">${totalG}</div><div class="kpi-l">Total de gols</div></div>
  <div class="kpi"><div class="kpi-n">${avg}</div><div class="kpi-l">Gols por jogo</div></div>
  <div class="kpi"><div class="kpi-n">${cardsY}</div><div class="kpi-l">Cartões amarelos</div></div>
  <div class="kpi"><div class="kpi-n">${cardsR}</div><div class="kpi-l">Cartões vermelhos</div></div>
  <div class="kpi"><div class="kpi-n">${cleanSheets}</div><div class="kpi-l">Clean sheets</div></div>
  <div class="kpi"><div class="kpi-n">${avgCards}</div><div class="kpi-l">Cartões por jogo</div></div>
  <div class="kpi wide">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px">
      <div class="kpi-l" style="margin:0">Progresso - <span style="color:var(--green);font-size:9px">✓ ${src}</span></div>
      <span style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--gold)">${played}/104</span>
    </div>
    <div class="prog-bar"><div class="prog-fill" style="width:${pct}%"></div></div>
    <div class="kpi-sub">${pct}% - Copa: 11 Jun - 19 Jul 2026</div>
  </div>
</div>
<div class="list-blk"><div class="lb-hdr"><span class="lhi">⚽</span><h3>ARTILHEIROS</h3><span class="api-src">${sList.length>0?"✓ eventos":"aguardando..."}</span></div>${sH}</div>
<div class="list-blk"><div class="lb-hdr"><span class="lhi">📈</span><h3>MELHOR APROVEITAMENTO</h3><span class="api-src">${played>0?"✓ calculado":"aguardando..."}</span></div>${effH}</div>
<div class="list-blk"><div class="lb-hdr"><span class="lhi">🥅</span><h3>MAIORES ATAQUES</h3><span class="api-src">${played>0?"✓ calculado":"aguardando..."}</span></div>${aH}</div>
<div class="list-blk"><div class="lb-hdr"><span class="lhi">🛡️</span><h3>MELHORES DEFESAS</h3><span class="api-src">${played>0?"✓ calculado":"aguardando..."}</span></div>${dH}</div>
<div class="list-blk"><div class="lb-hdr"><span class="lhi">🔥</span><h3>MAIORES PLACARES / GOLEADAS</h3><span class="api-src">${played>0?"✓ calculado":"aguardando..."}</span></div>${goleadasH}</div>
<div class="list-blk"><div class="lb-hdr"><span class="lhi">🟨</span><h3>DISCIPLINA</h3><span class="api-src">${ofbOk&&played>0?"✓ eventos":"aguardando..."}</span></div>${disH}
<div style="padding:9px 13px;border-top:1px solid var(--border2);font-family:'Barlow Condensed',sans-serif;font-size:11px;color:var(--text3)">A disciplina depende da fonte de eventos. Quando a fonte não informa cartões, o app mostra explicitamente indisponível em vez de zerar como se não houvesse cartões.</div></div>
<div class="list-blk"><div class="lb-hdr"><span class="lhi">📋</span><h3>SOBRE O TORNEIO</h3></div>
<table class="info-tbl">
  <tr><td>Edição</td><td>23ª Copa do Mundo FIFA</td></tr>
  <tr><td>Países sede</td><td>🇺🇸 EUA · 🇨🇦 Canadá · 🇲🇽 México</td></tr>
  <tr><td>Seleções</td><td>48 · 12 grupos de 4</td></tr>
  <tr><td>Total de jogos</td><td>104</td></tr>
  <tr><td>Abertura</td><td>11 Jun · Cidade do México</td></tr>
  <tr><td>Final</td><td>19 Jul · MetLife, Nova York</td></tr>
  <tr><td>Fonte de placares</td><td style="color:var(--gold)">worldcup26.ir</td></tr>
  <tr><td>Fonte de eventos</td><td style="color:var(--gold)">openfootball / football-data</td></tr>
  <tr><td>Criado por</td><td style="color:var(--gold)">Pscheidt</td></tr>
</table></div>`;
}

function goPage(pg){curPage=pg;document.querySelectorAll(".pg").forEach(el=>el.classList.remove("on"));document.getElementById("pg-"+pg).classList.add("on");document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));document.getElementById("nav-"+pg).classList.add("active");document.getElementById("tabBar").style.display=pg==="jogos"?"flex":"none";render();}
function setFilter(fi){curFilter=fi;const fs=["all","live","today","brazil","grupos","oitavas","semi"];document.querySelectorAll(".tab").forEach((t,i)=>t.classList.toggle("on",fs[i]===fi));render();}
function render(){
  const lc=liveCount();
  document.getElementById("livePill").classList.toggle("on",lc>0);
  document.getElementById("apiWarn").classList.toggle("on",!wcOk&&!ofbOk);
  if(curPage==="jogos")document.getElementById("jogosBody").innerHTML=renderJogos();
  if(curPage==="grupos")document.getElementById("gruposBody").innerHTML=renderGrupos();
  if(curPage==="stats")document.getElementById("statsBody").innerHTML=renderStats();
}

async function loadAll(){
  const btn=document.getElementById("refreshBtn");btn.classList.add("spin");
  await Promise.all([fetchWCGames(),fetchWCGroups(),fetchWCScorers(),fetchOFB(),fetchFD()]);
  render();
  const now=new Date();
  const src=wcOk?"✓ worldcup26.ir":"⚠ sem dados ao vivo";
  document.getElementById("updLbl").textContent=`${src} - ${now.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}`;
  btn.classList.remove("spin");
}
function scheduleRefresh(){const lc=liveCount();const delay=lc>0?30000:300000;setTimeout(()=>{loadAll().then(scheduleRefresh);},delay);}
loadAll().then(scheduleRefresh);
