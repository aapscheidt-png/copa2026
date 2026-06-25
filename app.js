// COPA DO MUNDO 2026 · app.js · by Pscheidt
// openfootball = resultados + gols confirmados
// worldcup26.ir  = ao vivo + placares pendentes + fases eliminatórias com labels
// football-data.org = artilheiros detalhados

const OFB_URL = "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";
const WC_URL  = "https://worldcup26.ir/get/games";
const FD_URL  = "https://api.football-data.org/v4";
const FD_KEY  = "86cb611164f348ac89dcc715dda20f92";

// ── ALIASES: qualquer variação → nome canônico ──
const A={
  "Mexico":"Mexico","México":"Mexico",
  "South Africa":"South Africa","África do Sul":"South Africa",
  "South Korea":"South Korea","Korea Republic":"South Korea","Republic of Korea":"South Korea",
  "Czechia":"Czechia","Czech Republic":"Czechia","Tchéquia":"Czechia",
  "Canada":"Canada","Canadá":"Canada",
  "Bosnia and Herzegovina":"Bosnia and Herzegovina","Bosnia":"Bosnia and Herzegovina","Bosnia & Herzegovina":"Bosnia and Herzegovina",
  "Qatar":"Qatar","Catar":"Qatar",
  "Switzerland":"Switzerland","Suíça":"Switzerland",
  "Brazil":"Brazil","Brasil":"Brazil",
  "Morocco":"Morocco","Marrocos":"Morocco",
  "Haiti":"Haiti","Scotland":"Scotland","Escócia":"Scotland",
  "Australia":"Australia","Austrália":"Australia",
  "Türkiye":"Türkiye","Turkey":"Türkiye","Turquia":"Türkiye",
  "United States":"United States","USA":"United States","EUA":"United States",
  "Paraguay":"Paraguay","Paraguai":"Paraguay",
  "Germany":"Germany","Alemanha":"Germany",
  "Curacao":"Curacao","Curaçao":"Curacao",
  "Ivory Coast":"Ivory Coast","Côte d'Ivoire":"Ivory Coast","Costa do Marfim":"Ivory Coast",
  "Ecuador":"Ecuador","Equador":"Ecuador",
  "Netherlands":"Netherlands","Países Baixos":"Netherlands",
  "Japan":"Japan","Japão":"Japan",
  "Sweden":"Sweden","Suécia":"Sweden",
  "Tunisia":"Tunisia","Tunísia":"Tunisia",
  "Belgium":"Belgium","Bélgica":"Belgium",
  "Egypt":"Egypt","Egito":"Egypt",
  "Iran":"Iran","Irã":"Iran",
  "New Zealand":"New Zealand","Nova Zelândia":"New Zealand",
  "Spain":"Spain","Espanha":"Spain",
  "Cape Verde":"Cape Verde","Cabo Verde":"Cape Verde",
  "Saudi Arabia":"Saudi Arabia","Arábia Saudita":"Saudi Arabia",
  "Uruguay":"Uruguay","Uruguai":"Uruguay",
  "France":"France","França":"France",
  "Senegal":"Senegal","Iraq":"Iraq","Iraque":"Iraq",
  "Norway":"Norway","Noruega":"Norway",
  "Austria":"Austria","Áustria":"Austria",
  "Jordan":"Jordan","Jordânia":"Jordan",
  "Argentina":"Argentina","Algeria":"Algeria","Argélia":"Algeria",
  "Portugal":"Portugal",
  "DR Congo":"DR Congo","Congo DR":"DR Congo","Democratic Republic of Congo":"DR Congo","RD Congo":"DR Congo",
  "Uzbekistan":"Uzbekistan","Uzbequistão":"Uzbekistan",
  "Colombia":"Colombia","Colômbia":"Colombia",
  "England":"England","Inglaterra":"England",
  "Croatia":"Croatia","Croácia":"Croatia",
  "Ghana":"Ghana","Gana":"Ghana",
  "Panama":"Panama","Panamá":"Panama"
};
const FL={
  "Mexico":"🇲🇽","South Africa":"🇿🇦","South Korea":"🇰🇷","Czechia":"🇨🇿",
  "Canada":"🇨🇦","Bosnia and Herzegovina":"🇧🇦","Qatar":"🇶🇦","Switzerland":"🇨🇭",
  "Brazil":"🇧🇷","Morocco":"🇲🇦","Haiti":"🇭🇹","Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","Australia":"🇦🇺",
  "Türkiye":"🇹🇷","United States":"🇺🇸","Paraguay":"🇵🇾","Germany":"🇩🇪",
  "Curacao":"🇨🇼","Netherlands":"🇳🇱","Japan":"🇯🇵","Ivory Coast":"🇨🇮","Ecuador":"🇪🇨",
  "Sweden":"🇸🇪","Tunisia":"🇹🇳","Spain":"🇪🇸","Cape Verde":"🇨🇻","Belgium":"🇧🇪",
  "Egypt":"🇪🇬","Saudi Arabia":"🇸🇦","Uruguay":"🇺🇾","Iran":"🇮🇷","New Zealand":"🇳🇿",
  "Austria":"🇦🇹","Jordan":"🇯🇴","France":"🇫🇷","Senegal":"🇸🇳","Iraq":"🇮🇶",
  "Norway":"🇳🇴","Argentina":"🇦🇷","Algeria":"🇩🇿","Portugal":"🇵🇹","DR Congo":"🇨🇩",
  "England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Croatia":"🇭🇷","Ghana":"🇬🇭","Panama":"🇵🇦",
  "Uzbekistan":"🇺🇿","Colombia":"🇨🇴"
};
const PT={
  "Mexico":"México","South Africa":"África do Sul","South Korea":"Coreia do Sul","Czechia":"Tchéquia",
  "Canada":"Canadá","Bosnia and Herzegovina":"Bósnia-Herz.","Qatar":"Catar","Switzerland":"Suíça",
  "Brazil":"Brasil","Morocco":"Marrocos","Haiti":"Haiti","Scotland":"Escócia","Australia":"Austrália",
  "Türkiye":"Turquia","United States":"EUA","Paraguay":"Paraguai","Germany":"Alemanha",
  "Curacao":"Curaçao","Netherlands":"Países Baixos","Japan":"Japão","Ivory Coast":"Costa do Marfim",
  "Ecuador":"Equador","Sweden":"Suécia","Tunisia":"Tunísia","Spain":"Espanha","Cape Verde":"Cabo Verde",
  "Belgium":"Bélgica","Egypt":"Egito","Saudi Arabia":"Arábia Saudita","Uruguay":"Uruguai",
  "Iran":"Irã","New Zealand":"Nova Zelândia","Austria":"Áustria","Jordan":"Jordânia",
  "France":"França","Senegal":"Senegal","Iraq":"Iraque","Norway":"Noruega","Argentina":"Argentina",
  "Algeria":"Argélia","Portugal":"Portugal","DR Congo":"RD Congo","England":"Inglaterra",
  "Croatia":"Croácia","Ghana":"Gana","Panama":"Panamá","Uzbekistan":"Uzbequistão","Colombia":"Colômbia"
};
const fl=n=>FL[n]||"🏳️";
const pt=n=>PT[n]||n;
function canon(name){
  if(!name)return"";
  if(A[name])return A[name];
  const lo=name.toLowerCase();
  for(const[k,v]of Object.entries(A)){if(k.toLowerCase()===lo)return v;}
  for(const[k,v]of Object.entries(A)){
    const kl=k.toLowerCase();
    if(kl.length>=4&&(lo.startsWith(kl.slice(0,5))||kl.startsWith(lo.slice(0,5))))return v;
  }
  return name;
}

// ── STATE ──
let OFB_MATCHES=[];
let WC_GAMES=[];       // todos os 104 jogos da worldcup26.ir
let FD_SC=[];
let ofbOk=false,wcOk=false,fdOk=false;
let curPage="jogos",curFilter="all";
let modalId=null,modalTmr=null;

// ── HELPERS ──
const todayStr=()=>{const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
const isToday=d=>d&&d.startsWith(todayStr());
function fmtD(d){
  if(!d)return"";
  const dt=new Date(d+"T12:00:00");
  const wd=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  const mo=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const tod=isToday(d)?'<span class="today-lbl"> — HOJE</span>':"";
  return`${wd[dt.getDay()]}, ${dt.getDate()} ${mo[dt.getMonth()]}${tod}`;
}
function isPastKickoff(d,t){
  const[h,m]=(t||"00:00").split(":").map(Number);
  const k=new Date(d+"T12:00:00");k.setHours(h,m,0,0);
  return new Date()>k;
}
function isPastEnd(d,t){
  const[h,m]=(t||"00:00").split(":").map(Number);
  const k=new Date(d+"T12:00:00");k.setHours(h,m+110,0,0);
  return new Date()>k;
}
function estMin(d,t){
  const[h,m]=(t||"00:00").split(":").map(Number);
  const k=new Date(d+"T12:00:00");k.setHours(h,m,0,0);
  const el=Math.floor((new Date()-k)/60000);
  if(el<0)return null;
  if(el<=45)return Math.min(el,45);
  if(el<=60)return 45;
  if(el<=105)return Math.min(el-15,90);
  return 90;
}
function isHT(d,t){
  const[h,m]=(t||"00:00").split(":").map(Number);
  const k=new Date(d+"T12:00:00");k.setHours(h,m,0,0);
  const el=Math.floor((new Date()-k)/60000);
  return el>45&&el<=60;
}
function utcBRT(s){
  if(!s)return{date:"",time:""};
  const dt=new Date(s);
  if(isNaN(dt))return{date:"",time:""};
  const brt=new Date(dt.getTime()-3*3600000);
  return{
    date:`${brt.getFullYear()}-${String(brt.getMonth()+1).padStart(2,"0")}-${String(brt.getDate()).padStart(2,"0")}`,
    time:`${String(brt.getHours()).padStart(2,"0")}:${String(brt.getMinutes()).padStart(2,"0")}`
  };
}
const liveCount=()=>WC_GAMES.filter(g=>g._st==="live").length;

// ── APIs ──
async function fetchOFB(){
  try{
    const r=await fetch(OFB_URL,{signal:AbortSignal.timeout(10000)});
    if(!r.ok)throw 0;
    const d=await r.json();
    OFB_MATCHES=(d.matches||[]).map(m=>({
      ...m,_h:canon(m.team1),_a:canon(m.team2)
    }));
    ofbOk=true;
  }catch(e){console.warn("OFB:",e);ofbOk=false;}
}

async function fetchWC(){
  try{
    const r=await fetch(WC_URL,{signal:AbortSignal.timeout(9000)});
    if(!r.ok)throw 0;
    const d=await r.json();
    const games=d.games||d||[];
    WC_GAMES=games.map(g=>{
      const{date,time}=utcBRT(g.local_date||g.date);
      const te=(g.time_elapsed||"").toLowerCase();
      let st="upcoming";
      if(g.finished==="TRUE"||g.finished===true||te==="fulltime"||te==="ft")st="finished";
      else if(te&&te!=="notstarted"&&te!==""&&te!=="undefined")st="live";
      // Labels para fases eliminatórias
      const hLabel=g.home_team_label||"";
      const aLabel=g.away_team_label||"";
      const hName=canon(g.home_team_name_en||g.home_team||"");
      const aName=canon(g.away_team_name_en||g.away_team||"");
      return{
        ...g,_date:date,_time:time,_st:st,
        _min:te==="ht"?"Intervalo":/^\d+/.test(te)?te+"'":null,
        _h:hName||hLabel,_a:aName||aLabel,
        _hLabel:hLabel,_aLabel:aLabel,
        _hs:g.home_score!=null?+g.home_score:null,
        _as:g.away_score!=null?+g.away_score:null,
        _type:g.type||""
      };
    });
    wcOk=true;
  }catch(e){console.warn("WC:",e);wcOk=false;}
}

async function fetchFD(){
  try{
    const r=await fetch(`${FD_URL}/competitions/WC/scorers?season=2026&limit=20`,
      {headers:{"X-Auth-Token":FD_KEY},signal:AbortSignal.timeout(9000)});
    if(!r.ok)throw 0;
    const d=await r.json();
    FD_SC=d.scorers||[];
    fdOk=true;
  }catch(e){fdOk=false;}
}

// ── MATCH FINDERS ──
function ofbMatch(h,a){
  return OFB_MATCHES.find(m=>m._h===h&&m._a===a)||null;
}
function wcGame(h,a){
  return WC_GAMES.find(g=>g._h===h&&g._a===a)||null;
}

// ── MATCH DATA (OFB=verdade, WC=ao vivo/fallback) ──
function getMatchData(m){
  // Jogo do grupo: h e a são nomes canônicos
  const wc=wcGame(m.h,m.a);
  const ofb=ofbMatch(m.h,m.a);

  // Se está ao vivo na WC API
  if(wc&&wc._st==="live"){
    return{hs:wc._hs,as:wc._as,st:"live",min:wc._min,hasScore:wc._hs!=null};
  }
  // Se OFB tem resultado confirmado
  if(ofb&&ofb.score&&ofb.score.ft){
    return{hs:ofb.score.ft[0],as:ofb.score.ft[1],st:"finished",min:null,hasScore:true};
  }
  // WC diz encerrado e tem placar
  if(wc&&wc._st==="finished"&&wc._hs!=null){
    return{hs:wc._hs,as:wc._as,st:"finished",min:null,hasScore:true};
  }
  // Passou do horário esperado de encerramento
  if(isPastEnd(m.d,m.t)){
    if(wc&&wc._hs!=null)return{hs:wc._hs,as:wc._as,st:"finished",min:null,hasScore:true};
    return{hs:null,as:null,st:"finished",min:null,hasScore:false};
  }
  // Passou do kickoff mas ainda dentro do tempo
  if(isPastKickoff(m.d,m.t)){
    if(wc&&wc._hs!=null)return{hs:wc._hs,as:wc._as,st:"live",min:wc._min,hasScore:true};
    return{hs:null,as:null,st:"live",min:null,hasScore:false};
  }
  return null; // upcoming
}

// Para jogos eliminatórios: usa a WC game diretamente pelo tipo/id
function getElimData(m){
  // Tenta achar na WC pelo id do fixture ou por labels
  const wc=WC_GAMES.find(g=>g.id===m.wcId);
  if(!wc)return null;
  let st="upcoming";
  if(wc._st==="finished")st="finished";
  else if(wc._st==="live")st="live";
  else if(isPastEnd(m.d,m.t))st="finished";
  else if(isPastKickoff(m.d,m.t))st="live";
  return{
    hs:wc._hs,as:wc._as,st,min:wc._min,
    hName:canon(wc.home_team_name_en||wc.home_team||"")||wc._hLabel,
    aName:canon(wc.away_team_name_en||wc.away_team||"")||wc._aLabel,
    hLabel:wc._hLabel,aLabel:wc._aLabel,
    hasScore:wc._hs!=null
  };
}

function mStatus(m){
  if(m.ph==="grupos"){
    const d=getMatchData(m);
    return d?d.st:"upcoming";
  }else{
    const d=getElimData(m);
    return d?d.st:"upcoming";
  }
}
function getMin(m,data){
  if(!data)return"";
  if(data.min)return data.min;
  const e=estMin(m.d,m.t);
  if(e===null)return"";
  if(isHT(m.d,m.t))return"Intervalo";
  return e+"'";
}
function tPct(m,data){
  if(!data)return 0;
  const mn=data.min?parseInt(data.min):null;
  if(mn&&!isNaN(mn))return Math.min(100,Math.round(mn/90*100));
  const e=estMin(m.d,m.t);
  return e?Math.min(100,Math.round(e/90*100)):0;
}

// ── FIXTURES ─────────────────────────────────────────────
// Grupos: h/a = nome canônico. Eliminatórias: wcId = ID da worldcup26.ir
const F=[
  // GRUPO A
  {id:"a1",g:"A",d:"2026-06-11",t:"16:00",h:"Mexico",a:"South Africa",v:"Estádio Azteca, Cidade do México",ph:"grupos"},
  {id:"a2",g:"A",d:"2026-06-11",t:"23:00",h:"South Korea",a:"Czechia",v:"Estadio Akron, Guadalajara",ph:"grupos"},
  {id:"a3",g:"A",d:"2026-06-18",t:"13:00",h:"Czechia",a:"South Africa",v:"Mercedes-Benz Stadium, Atlanta",ph:"grupos"},
  {id:"a4",g:"A",d:"2026-06-18",t:"22:00",h:"Mexico",a:"South Korea",v:"Estadio Akron, Guadalajara",ph:"grupos"},
  {id:"a5",g:"A",d:"2026-06-25",t:"22:00",h:"Czechia",a:"Mexico",v:"Estádio Azteca, Cidade do México",ph:"grupos"},
  {id:"a6",g:"A",d:"2026-06-25",t:"22:00",h:"South Africa",a:"South Korea",v:"Estadio BBVA, Monterrey",ph:"grupos"},
  // GRUPO B
  {id:"b1",g:"B",d:"2026-06-12",t:"16:00",h:"Canada",a:"Bosnia and Herzegovina",v:"BMO Field, Toronto",ph:"grupos"},
  {id:"b2",g:"B",d:"2026-06-13",t:"16:00",h:"Qatar",a:"Switzerland",v:"Levi's Stadium, San Francisco",ph:"grupos"},
  {id:"b3",g:"B",d:"2026-06-18",t:"16:00",h:"Switzerland",a:"Bosnia and Herzegovina",v:"SoFi Stadium, Los Angeles",ph:"grupos"},
  {id:"b4",g:"B",d:"2026-06-18",t:"19:00",h:"Canada",a:"Qatar",v:"BC Place, Vancouver",ph:"grupos"},
  {id:"b5",g:"B",d:"2026-06-24",t:"16:00",h:"Switzerland",a:"Canada",v:"BC Place, Vancouver",ph:"grupos"},
  {id:"b6",g:"B",d:"2026-06-24",t:"16:00",h:"Bosnia and Herzegovina",a:"Qatar",v:"Lumen Field, Seattle",ph:"grupos"},
  // GRUPO C
  {id:"c1",g:"C",d:"2026-06-13",t:"19:00",h:"Brazil",a:"Morocco",v:"MetLife Stadium, Nova York",ph:"grupos",br:1},
  {id:"c2",g:"C",d:"2026-06-13",t:"22:00",h:"Haiti",a:"Scotland",v:"Gillette Stadium, Boston",ph:"grupos"},
  {id:"c3",g:"C",d:"2026-06-19",t:"19:00",h:"Scotland",a:"Morocco",v:"Gillette Stadium, Boston",ph:"grupos"},
  {id:"c4",g:"C",d:"2026-06-19",t:"21:30",h:"Brazil",a:"Haiti",v:"Lincoln Financial Field, Filadélfia",ph:"grupos",br:1},
  {id:"c5",g:"C",d:"2026-06-24",t:"19:00",h:"Scotland",a:"Brazil",v:"Hard Rock Stadium, Miami",ph:"grupos",br:1},
  {id:"c6",g:"C",d:"2026-06-24",t:"19:00",h:"Morocco",a:"Haiti",v:"Mercedes-Benz Stadium, Atlanta",ph:"grupos"},
  // GRUPO D
  {id:"d1",g:"D",d:"2026-06-12",t:"22:00",h:"United States",a:"Paraguay",v:"SoFi Stadium, Los Angeles",ph:"grupos"},
  {id:"d2",g:"D",d:"2026-06-13",t:"01:00",h:"Australia",a:"Türkiye",v:"BC Place, Vancouver",ph:"grupos"},
  {id:"d3",g:"D",d:"2026-06-19",t:"01:00",h:"Türkiye",a:"Paraguay",v:"Levi's Stadium, San Francisco",ph:"grupos"},
  {id:"d4",g:"D",d:"2026-06-19",t:"16:00",h:"United States",a:"Australia",v:"Lumen Field, Seattle",ph:"grupos"},
  {id:"d5",g:"D",d:"2026-06-25",t:"23:00",h:"Türkiye",a:"United States",v:"SoFi Stadium, Los Angeles",ph:"grupos"},
  {id:"d6",g:"D",d:"2026-06-25",t:"23:00",h:"Paraguay",a:"Australia",v:"Levi's Stadium, San Francisco",ph:"grupos"},
  // GRUPO E
  {id:"e1",g:"E",d:"2026-06-14",t:"14:00",h:"Germany",a:"Curacao",v:"NRG Stadium, Houston",ph:"grupos"},
  {id:"e2",g:"E",d:"2026-06-14",t:"20:00",h:"Ivory Coast",a:"Ecuador",v:"Lincoln Financial Field, Filadélfia",ph:"grupos"},
  {id:"e3",g:"E",d:"2026-06-20",t:"17:00",h:"Germany",a:"Ivory Coast",v:"BMO Field, Toronto",ph:"grupos"},
  {id:"e4",g:"E",d:"2026-06-20",t:"21:00",h:"Ecuador",a:"Curacao",v:"Children's Mercy Park, Kansas City",ph:"grupos"},
  {id:"e5",g:"E",d:"2026-06-25",t:"17:00",h:"Curacao",a:"Ivory Coast",v:"Lincoln Financial Field, Filadélfia",ph:"grupos"},
  {id:"e6",g:"E",d:"2026-06-25",t:"17:00",h:"Ecuador",a:"Germany",v:"MetLife Stadium, Nova York",ph:"grupos"},
  // GRUPO F
  {id:"f1",g:"F",d:"2026-06-14",t:"17:00",h:"Netherlands",a:"Japan",v:"AT&T Stadium, Dallas",ph:"grupos"},
  {id:"f2",g:"F",d:"2026-06-14",t:"23:00",h:"Sweden",a:"Tunisia",v:"Estadio BBVA, Monterrey",ph:"grupos"},
  {id:"f3",g:"F",d:"2026-06-20",t:"14:00",h:"Netherlands",a:"Sweden",v:"NRG Stadium, Houston",ph:"grupos"},
  {id:"f4",g:"F",d:"2026-06-20",t:"01:00",h:"Tunisia",a:"Japan",v:"Estadio BBVA, Monterrey",ph:"grupos"},
  {id:"f5",g:"F",d:"2026-06-25",t:"20:00",h:"Japan",a:"Sweden",v:"AT&T Stadium, Dallas",ph:"grupos"},
  {id:"f6",g:"F",d:"2026-06-25",t:"20:00",h:"Tunisia",a:"Netherlands",v:"Children's Mercy Park, Kansas City",ph:"grupos"},
  // GRUPO G
  {id:"g1",g:"G",d:"2026-06-15",t:"16:00",h:"Belgium",a:"Egypt",v:"Lumen Field, Seattle",ph:"grupos"},
  {id:"g2",g:"G",d:"2026-06-15",t:"22:00",h:"Iran",a:"New Zealand",v:"SoFi Stadium, Los Angeles",ph:"grupos"},
  {id:"g3",g:"G",d:"2026-06-21",t:"16:00",h:"Belgium",a:"Iran",v:"SoFi Stadium, Los Angeles",ph:"grupos"},
  {id:"g4",g:"G",d:"2026-06-21",t:"22:00",h:"New Zealand",a:"Egypt",v:"BC Place, Vancouver",ph:"grupos"},
  {id:"g5",g:"G",d:"2026-06-27",t:"00:00",h:"Egypt",a:"Iran",v:"Lumen Field, Seattle",ph:"grupos"},
  {id:"g6",g:"G",d:"2026-06-27",t:"00:00",h:"New Zealand",a:"Belgium",v:"BC Place, Vancouver",ph:"grupos"},
  // GRUPO H
  {id:"h1",g:"H",d:"2026-06-15",t:"13:00",h:"Spain",a:"Cape Verde",v:"Mercedes-Benz Stadium, Atlanta",ph:"grupos"},
  {id:"h2",g:"H",d:"2026-06-15",t:"19:00",h:"Saudi Arabia",a:"Uruguay",v:"Hard Rock Stadium, Miami",ph:"grupos"},
  {id:"h3",g:"H",d:"2026-06-21",t:"13:00",h:"Spain",a:"Saudi Arabia",v:"Mercedes-Benz Stadium, Atlanta",ph:"grupos"},
  {id:"h4",g:"H",d:"2026-06-21",t:"19:00",h:"Uruguay",a:"Cape Verde",v:"Hard Rock Stadium, Miami",ph:"grupos"},
  {id:"h5",g:"H",d:"2026-06-26",t:"21:00",h:"Cape Verde",a:"Saudi Arabia",v:"NRG Stadium, Houston",ph:"grupos"},
  {id:"h6",g:"H",d:"2026-06-26",t:"21:00",h:"Uruguay",a:"Spain",v:"Estadio Akron, Guadalajara",ph:"grupos"},
  // GRUPO I
  {id:"i1",g:"I",d:"2026-06-16",t:"16:00",h:"France",a:"Senegal",v:"MetLife Stadium, Nova York",ph:"grupos"},
  {id:"i2",g:"I",d:"2026-06-16",t:"19:00",h:"Iraq",a:"Norway",v:"Gillette Stadium, Boston",ph:"grupos"},
  {id:"i3",g:"I",d:"2026-06-22",t:"18:00",h:"France",a:"Iraq",v:"Lincoln Financial Field, Filadélfia",ph:"grupos"},
  {id:"i4",g:"I",d:"2026-06-22",t:"21:00",h:"Norway",a:"Senegal",v:"MetLife Stadium, Nova York",ph:"grupos"},
  {id:"i5",g:"I",d:"2026-06-26",t:"16:00",h:"Norway",a:"France",v:"Gillette Stadium, Boston",ph:"grupos"},
  {id:"i6",g:"I",d:"2026-06-26",t:"16:00",h:"Senegal",a:"Iraq",v:"BMO Field, Toronto",ph:"grupos"},
  // GRUPO J
  {id:"j1",g:"J",d:"2026-06-16",t:"01:00",h:"Austria",a:"Jordan",v:"Levi's Stadium, San Francisco",ph:"grupos"},
  {id:"j2",g:"J",d:"2026-06-16",t:"22:00",h:"Argentina",a:"Algeria",v:"Children's Mercy Park, Kansas City",ph:"grupos"},
  {id:"j3",g:"J",d:"2026-06-22",t:"00:00",h:"Jordan",a:"Algeria",v:"Levi's Stadium, San Francisco",ph:"grupos"},
  {id:"j4",g:"J",d:"2026-06-22",t:"14:00",h:"Argentina",a:"Austria",v:"AT&T Stadium, Dallas",ph:"grupos"},
  {id:"j5",g:"J",d:"2026-06-27",t:"23:00",h:"Algeria",a:"Austria",v:"Children's Mercy Park, Kansas City",ph:"grupos"},
  {id:"j6",g:"J",d:"2026-06-27",t:"23:00",h:"Jordan",a:"Argentina",v:"AT&T Stadium, Dallas",ph:"grupos"},
  // GRUPO K
  {id:"k1",g:"K",d:"2026-06-17",t:"14:00",h:"Portugal",a:"DR Congo",v:"NRG Stadium, Houston",ph:"grupos"},
  {id:"k2",g:"K",d:"2026-06-17",t:"23:00",h:"Uzbekistan",a:"Colombia",v:"Estádio Azteca, Cidade do México",ph:"grupos"},
  {id:"k3",g:"K",d:"2026-06-23",t:"14:00",h:"Portugal",a:"Uzbekistan",v:"NRG Stadium, Houston",ph:"grupos"},
  {id:"k4",g:"K",d:"2026-06-23",t:"23:00",h:"Colombia",a:"DR Congo",v:"Estadio Akron, Guadalajara",ph:"grupos"},
  {id:"k5",g:"K",d:"2026-06-27",t:"20:30",h:"Colombia",a:"Portugal",v:"Hard Rock Stadium, Miami",ph:"grupos"},
  {id:"k6",g:"K",d:"2026-06-27",t:"20:30",h:"DR Congo",a:"Uzbekistan",v:"Mercedes-Benz Stadium, Atlanta",ph:"grupos"},
  // GRUPO L
  {id:"l1",g:"L",d:"2026-06-17",t:"17:00",h:"England",a:"Croatia",v:"AT&T Stadium, Dallas",ph:"grupos"},
  {id:"l2",g:"L",d:"2026-06-17",t:"20:00",h:"Ghana",a:"Panama",v:"BMO Field, Toronto",ph:"grupos"},
  {id:"l3",g:"L",d:"2026-06-23",t:"17:00",h:"England",a:"Ghana",v:"Gillette Stadium, Boston",ph:"grupos"},
  {id:"l4",g:"L",d:"2026-06-23",t:"20:00",h:"Panama",a:"Croatia",v:"BMO Field, Toronto",ph:"grupos"},
  {id:"l5",g:"L",d:"2026-06-27",t:"18:00",h:"Panama",a:"England",v:"MetLife Stadium, Nova York",ph:"grupos"},
  {id:"l6",g:"L",d:"2026-06-27",t:"18:00",h:"Croatia",a:"Ghana",v:"Lincoln Financial Field, Filadélfia",ph:"grupos"},
  // FASE ELIMINATÓRIA (wcId = ID na worldcup26.ir, _h/_a vêm dinâmicos da API)
  {id:"r32_1",g:"R32",d:"2026-06-28",t:"16:00",v:"SoFi Stadium, Los Angeles",ph:"elim",wcId:"73"},
  {id:"r32_2",g:"R32",d:"2026-06-29",t:"14:00",v:"NRG Stadium, Houston",ph:"elim",wcId:"74"},
  {id:"r32_3",g:"R32",d:"2026-06-29",t:"17:30",v:"Gillette Stadium, Boston",ph:"elim",wcId:"75"},
  {id:"r32_4",g:"R32",d:"2026-06-29",t:"22:00",v:"Estadio BBVA, Monterrey",ph:"elim",wcId:"76"},
  {id:"r32_5",g:"R32",d:"2026-06-30",t:"14:00",v:"AT&T Stadium, Dallas",ph:"elim",wcId:"77"},
  {id:"r32_6",g:"R32",d:"2026-06-30",t:"18:00",v:"MetLife Stadium, Nova York",ph:"elim",wcId:"78"},
  {id:"r32_7",g:"R32",d:"2026-06-30",t:"22:00",v:"Estádio Azteca, Cidade do México",ph:"elim",wcId:"79"},
  {id:"r32_8",g:"R32",d:"2026-07-01",t:"13:00",v:"Mercedes-Benz Stadium, Atlanta",ph:"elim",wcId:"80"},
  {id:"r32_9",g:"R32",d:"2026-07-01",t:"17:00",v:"Lumen Field, Seattle",ph:"elim",wcId:"81"},
  {id:"r32_10",g:"R32",d:"2026-07-01",t:"21:00",v:"Levi's Stadium, San Francisco",ph:"elim",wcId:"82"},
  {id:"r32_11",g:"R32",d:"2026-07-02",t:"00:00",v:"BC Place, Vancouver",ph:"elim",wcId:"83"},
  {id:"r32_12",g:"R32",d:"2026-07-02",t:"16:00",v:"SoFi Stadium, Los Angeles",ph:"elim",wcId:"84"},
  {id:"r32_13",g:"R32",d:"2026-07-02",t:"20:00",v:"BMO Field, Toronto",ph:"elim",wcId:"85"},
  {id:"r32_14",g:"R32",d:"2026-07-03",t:"15:00",v:"AT&T Stadium, Dallas",ph:"elim",wcId:"86"},
  {id:"r32_15",g:"R32",d:"2026-07-03",t:"17:00",v:"Mercedes-Benz Stadium, Atlanta",ph:"elim",wcId:"87"},
  {id:"r32_16",g:"R32",d:"2026-07-03",t:"22:30",v:"Children's Mercy Park, Kansas City",ph:"elim",wcId:"88"},
  {id:"r16_1",g:"Oitavas",d:"2026-07-04",t:"14:00",v:"NRG Stadium, Houston",ph:"elim",wcId:"89"},
  {id:"r16_2",g:"Oitavas",d:"2026-07-04",t:"18:00",v:"Lincoln Financial Field, Filadélfia",ph:"elim",wcId:"90"},
  {id:"r16_3",g:"Oitavas",d:"2026-07-05",t:"17:00",v:"MetLife Stadium, Nova York",ph:"elim",wcId:"91"},
  {id:"r16_4",g:"Oitavas",d:"2026-07-05",t:"21:00",v:"Estádio Azteca, Cidade do México",ph:"elim",wcId:"92"},
  {id:"r16_5",g:"Oitavas",d:"2026-07-06",t:"15:00",v:"AT&T Stadium, Dallas",ph:"elim",wcId:"93"},
  {id:"r16_6",g:"Oitavas",d:"2026-07-06",t:"20:00",v:"Lumen Field, Seattle",ph:"elim",wcId:"94"},
  {id:"r16_7",g:"Oitavas",d:"2026-07-07",t:"13:00",v:"Mercedes-Benz Stadium, Atlanta",ph:"elim",wcId:"95"},
  {id:"r16_8",g:"Oitavas",d:"2026-07-07",t:"17:00",v:"BC Place, Vancouver",ph:"elim",wcId:"96"},
  {id:"qf1",g:"Quartas",d:"2026-07-09",t:"17:00",v:"Gillette Stadium, Boston",ph:"semi",wcId:"97"},
  {id:"qf2",g:"Quartas",d:"2026-07-10",t:"16:00",v:"SoFi Stadium, Los Angeles",ph:"semi",wcId:"98"},
  {id:"qf3",g:"Quartas",d:"2026-07-11",t:"18:00",v:"Hard Rock Stadium, Miami",ph:"semi",wcId:"99"},
  {id:"qf4",g:"Quartas",d:"2026-07-11",t:"21:00",v:"Children's Mercy Park, Kansas City",ph:"semi",wcId:"100"},
  {id:"sf1",g:"Semifinal",d:"2026-07-14",t:"16:00",v:"AT&T Stadium, Dallas",ph:"semi",wcId:"101"},
  {id:"sf2",g:"Semifinal",d:"2026-07-15",t:"16:00",v:"AT&T Stadium, Dallas",ph:"semi",wcId:"102"},
  {id:"tp1",g:"3º Lugar",d:"2026-07-18",t:"18:00",v:"Hard Rock Stadium, Miami",ph:"semi",wcId:"103"},
  {id:"fi1",g:"🏆 FINAL",d:"2026-07-19",t:"16:00",v:"MetLife Stadium, Nova York",ph:"semi",wcId:"104"}
];

// ── HELPERS DE EXIBIÇÃO ──
function getDisplayNames(m){
  if(m.ph==="grupos"){return{h:m.h,a:m.a,hL:pt(m.h),aL:pt(m.a)};}
  const wc=WC_GAMES.find(g=>g.id===m.wcId);
  if(!wc)return{h:"",a:"",hL:"A definir",aL:"A definir"};
  const h=canon(wc.home_team_name_en||wc.home_team||"")||"";
  const a=canon(wc.away_team_name_en||wc.away_team||"")||"";
  return{
    h,a,
    hL:h?pt(h):(wc._hLabel||"A definir"),
    aL:a?pt(a):(wc._aLabel||"A definir"),
    hFlag:h?fl(h):"🏳️",aFlag:a?fl(a):"🏳️"
  };
}

// ── RENDER CARD ──
function mkCard(m){
  const n=getDisplayNames(m);
  // Data do match: para grupos usa m.d, para elim usa m.d mas atualiza se WC tiver outra
  let mDate=m.d,mTime=m.t;

  let data=null;
  if(m.ph==="grupos"){
    data=getMatchData(m);
  }else{
    data=getElimData(m);
  }

  const st=data?data.st:"upcoming";
  const isBR=m.br||n.h==="Brazil"||n.a==="Brazil";
  const minD=getMin(m,data);
  const pct=tPct(m,data);

  let pill="";
  if(st==="live")pill=`<span class="mc-st ms-live">🔴 ${minD||"AO VIVO"}</span>`;
  else if(st==="finished")pill='<span class="mc-st ms-done">✓ FIM</span>';
  else pill=`<span class="mc-st ms-up">${m.g}</span>`;

  let mid="";
  if((st==="live"||st==="finished")&&data&&data.hasScore&&data.hs!=null){
    const hw=+data.hs>+data.as,aw=+data.as>+data.hs;
    mid=`<div class="sc-box"><div class="sc${hw?" win":""}">${data.hs}</div><div class="sc-d">:</div><div class="sc${aw?" win":""}">${data.as}</div></div>`;
  }else if(st==="finished"&&(!data||!data.hasScore)){
    mid='<div style="font-family:\'Barlow Condensed\',sans-serif;font-size:11px;color:var(--text3);text-align:center">Placar<br>indisponível</div>';
  }else{
    mid=`<div class="tt">${mTime}</div>`;
  }
  const hw2=st==="finished"&&data&&data.hasScore&&+data.hs>+data.as;
  const aw2=st==="finished"&&data&&data.hasScore&&+data.as>+data.hs;

  // Gols (OFB, apenas grupos)
  let goalsLine="";
  if(m.ph==="grupos"&&st!=="upcoming"){
    const ofb=ofbMatch(m.h,m.a);
    if(ofb&&ofb.score&&ofb.score.ft){
      const g1=(ofb.goals1||[]).map(g=>g.name.split(" ").pop()+(g.minute?" "+g.minute+"'":"")+(g.penalty?" (P)":"")).join(", ");
      const g2=(ofb.goals2||[]).map(g=>g.name.split(" ").pop()+(g.minute?" "+g.minute+"'":"")+(g.penalty?" (P)":"")).join(", ");
      if(g1||g2)goalsLine=`<div class="mc-goals">${g1?fl(m.h)+" "+g1:""}${g1&&g2?" | ":""}${g2?fl(m.a)+" "+g2:""}</div>`;
    }
  }

  let timerH="";
  if(st==="live"){
    const ht=isHT(m.d,m.t);
    timerH=`<div class="mc-timer"><div class="timer-dot"></div><div class="timer-val">${ht?"INTERVALO":minD}</div><div class="timer-bar-wrap"><div class="timer-bar" style="width:${pct}%"></div></div></div>`;
  }

  const hFlag=n.hFlag||fl(n.h);
  const aFlag=n.aFlag||fl(n.a);

  return`<div class="mc ${st}${isBR?" br":""}" onclick="openModal('${m.id}')">
  <div class="mc-top"><span class="mc-grp">${m.g}</span>${pill}</div>
  <div class="mc-row">
    <div class="mc-side"><span class="mc-fl">${hFlag}</span><span class="mc-nm${hw2?" win":""}">${n.hL}</span></div>
    ${mid}
    <div class="mc-side r"><span class="mc-fl">${aFlag}</span><span class="mc-nm${aw2?" win":""}">${n.aL}</span></div>
  </div>${timerH}${goalsLine}
  <div class="mc-venue">${m.v}</div>
  ${st!=="upcoming"?'<div class="tap-hint">Toque para detalhes ↑</div>':""}
</div>`;
}

// ── RENDER JOGOS ──
function renderJogos(){
  let list=F.slice();
  if(curFilter==="live")list=list.filter(m=>mStatus(m)==="live");
  else if(curFilter==="today")list=list.filter(m=>isToday(m.d));
  else if(curFilter==="brazil")list=list.filter(m=>m.br||m.h==="Brazil"||m.a==="Brazil"||
    (m.ph!=="grupos"&&(()=>{const n=getDisplayNames(m);return n.h==="Brazil"||n.a==="Brazil";})()));
  else if(curFilter==="grupos")list=list.filter(m=>m.ph==="grupos");
  else if(curFilter==="oitavas")list=list.filter(m=>m.ph==="elim");
  else if(curFilter==="semi")list=list.filter(m=>m.ph==="semi");
  if(!list.length)return'<div class="empty">Nenhum jogo neste filtro</div>';
  const phO=["grupos","elim","semi"];
  const phN={grupos:"Fase de Grupos",elim:"Fase Eliminatória",semi:"Quartas · Semis · Final"};
  let html="";
  phO.forEach(ph=>{
    const pl=list.filter(m=>m.ph===ph);if(!pl.length)return;
    const byD={};pl.forEach(m=>{(byD[m.d]||(byD[m.d]=[])).push(m);});
    html+=`<div class="sh">${phN[ph]}</div>`;
    Object.keys(byD).sort().forEach(d=>{
      html+=`<div class="dh">${fmtD(d)}</div>`;
      byD[d].forEach(m=>{html+=mkCard(m);});
    });
  });
  return html;
}

// ── ABA BRASIL ──
function renderBrasil(){
  const brMatches=F.filter(m=>{
    if(m.ph==="grupos")return m.br||m.h==="Brazil"||m.a==="Brazil";
    const n=getDisplayNames(m);
    return n.h==="Brazil"||n.a==="Brazil";
  });

  // Gols do Brasil via OFB
  let brGoals=[];
  const brGroupMatches=brMatches.filter(m=>m.ph==="grupos");
  brGroupMatches.forEach(m=>{
    const ofb=ofbMatch(m.h,m.a);
    if(!ofb||!ofb.score)return;
    const isBRhome=m.h==="Brazil";
    const goals=isBRhome?(ofb.goals1||[]):(ofb.goals2||[]);
    goals.filter(g=>!g.owngoal).forEach(g=>{
      const existing=brGoals.find(x=>x.name===g.name);
      if(existing){existing.goals++;if(g.penalty)existing.pen++;}
      else{brGoals.push({name:g.name,goals:1,pen:g.penalty?1:0});}
    });
  });
  brGoals.sort((a,b)=>b.goals-a.goals);

  // Resultados
  let resultsHTML="";
  brMatches.forEach(m=>{
    const data=m.ph==="grupos"?getMatchData(m):getElimData(m);
    const n=getDisplayNames(m);
    const st=data?data.st:"upcoming";
    const isBRhome=n.h==="Brazil";
    let scoreStr="";
    if(data&&data.hasScore&&data.hs!=null){
      const brScore=isBRhome?data.hs:data.as;
      const opScore=isBRhome?data.as:data.hs;
      const result=brScore>opScore?"✅":brScore===opScore?"🤝":"❌";
      scoreStr=`${result} <strong style="color:var(--gold)">${brScore}×${opScore}</strong>`;
    }else if(st==="upcoming"){scoreStr=`<span style="color:var(--text3)">${m.t}</span>`;}
    else{scoreStr='<span style="color:var(--text3)">–</span>';}
    const opp=isBRhome?n.a:n.h;
    const oppFlag=isBRhome?(n.aFlag||fl(n.a)):(n.hFlag||fl(n.h));
    const loc=isBRhome?"Casa":"Fora";
    resultsHTML+=`<div class="br-row" onclick="openModal('${m.id}')">
      <div class="br-opp">${oppFlag} <span style="font-weight:700">${isBRhome?n.aL:n.hL}</span> <span style="color:var(--text3);font-size:10px">(${loc})</span></div>
      <div class="br-sc">${scoreStr}</div>
    </div>`;
  });

  // Artilheiros do Brasil
  let scorersHTML="";
  if(brGoals.length){
    scorersHTML=brGoals.map((s,i)=>`<div class="li">
      <div class="li-rk${i<3?" top":""}">${i+1}</div>
      <div class="li-fl">🇧🇷</div>
      <div class="li-inf"><div class="li-nm">${s.name}</div><div class="li-sb">${s.pen>0?s.pen+" pen. incluídos":""}</div></div>
      <div class="li-val">${s.goals} ⚽</div>
    </div>`).join("");
  }else{
    scorersHTML='<div class="no-data">Disponível após os jogos</div>';
  }

  // Próximo jogo
  const next=brMatches.find(m=>{
    const d=m.ph==="grupos"?getMatchData(m):getElimData(m);
    return!d||d.st==="upcoming";
  });
  let nextHTML="";
  if(next){
    const n=getDisplayNames(next);
    const opp=n.h==="Brazil"?n.aL:n.hL;
    const oppFlag=n.h==="Brazil"?(n.aFlag||fl(n.a)):(n.hFlag||fl(n.h));
    nextHTML=`<div style="background:var(--brazil-dim);border:1px solid rgba(0,156,59,.3);border-radius:var(--r);padding:13px 14px;margin-bottom:10px">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:12px;letter-spacing:1.5px;color:var(--brazil);margin-bottom:6px">🇧🇷 PRÓXIMO JOGO</div>
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700">${oppFlag} vs ${opp}</div>
      <div style="font-size:11px;color:var(--text3);margin-top:3px">${fmtD(next.d)} · ${next.t} · ${next.v.split(",")[0]}</div>
    </div>`;
  }

  // Stats do Brasil
  let totalBrGols=0,brContra=0;
  brGroupMatches.forEach(m=>{
    const data=getMatchData(m);
    if(!data||!data.hasScore)return;
    if(m.h==="Brazil"){totalBrGols+=+data.hs;brContra+=+data.as;}
    else{totalBrGols+=+data.as;brContra+=+data.hs;}
  });
  const brPlayed=brGroupMatches.filter(m=>{const d=getMatchData(m);return d&&d.st==="finished";}).length;

  return`<div style="padding:10px 11px">
${nextHTML}
<div class="kpi-grid" style="margin-bottom:10px">
  <div class="kpi"><div class="kpi-n" style="color:var(--green)">${totalBrGols}</div><div class="kpi-l">Gols marcados</div></div>
  <div class="kpi"><div class="kpi-n" style="color:${brContra>0?"var(--live)":"var(--green)"}">${brContra}</div><div class="kpi-l">Gols sofridos</div></div>
  <div class="kpi"><div class="kpi-n">${brPlayed}</div><div class="kpi-l">Jogos realizados</div></div>
  <div class="kpi"><div class="kpi-n" style="color:var(--gold)">${brGoals.reduce((s,g)=>s+g.goals,0)}</div><div class="kpi-l">Total de gols</div></div>
</div>
<div class="list-blk">
  <div class="lb-hdr"><span class="lhi">⚽</span><h3>ARTILHEIROS DO BRASIL</h3><span class="api-src">${brGoals.length?"✓ openfootball":"aguardando..."}</span></div>
  ${scorersHTML}
</div>
<div class="list-blk">
  <div class="lb-hdr"><span class="lhi">🇧🇷</span><h3>RESULTADOS</h3></div>
  ${resultsHTML||'<div class="no-data">Jogos ainda não realizados</div>'}
</div>
</div>`;
}

// ── GRUPOS ──
function calcGroup(gl){
  const gm=F.filter(m=>m.g===gl&&m.ph==="grupos");
  const ts={};
  [...new Set([...gm.map(m=>m.h),...gm.map(m=>m.a)])].forEach(t=>{
    ts[t]={j:0,v:0,e:0,d:0,gp:0,gc:0,sg:0,pts:0,form:[],live:false};
  });
  gm.forEach(m=>{
    const d=getMatchData(m);if(!d)return;
    const st=d.st;
    if((st==="finished"||st==="live")&&d.hs!=null&&d.as!=null){
      const hs=+d.hs,as=+d.as;
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
  return Object.entries(ts).map(([nm,s])=>({nm,...s}))
    .sort((a,b)=>b.pts-a.pts||b.sg-a.sg||b.gp-a.gp);
}

function renderGrupos(){
  if(!ofbOk&&!wcOk)return'<div class="empty" style="padding:40px">⏳ Aguardando APIs...<br><span style="font-size:11px;color:var(--text3)">Toque em 🔄</span></div>';
  const src=ofbOk?"openfootball":"worldcup26.ir";
  let html=`<div style="font-family:'Barlow Condensed',sans-serif;font-size:11px;color:var(--green);padding:2px 2px 10px">✓ Resultados: ${src}</div>`;
  ["A","B","C","D","E","F","G","H","I","J","K","L"].forEach(gl=>{
    const gm=F.filter(m=>m.g===gl&&m.ph==="grupos");
    const played=gm.filter(m=>{const d=getMatchData(m);return d&&d.st==="finished";}).length;
    const hasLive=gm.some(m=>{const d=getMatchData(m);return d&&d.st==="live";});
    const rows=calcGroup(gl);
    const flagPrev=rows.map(r=>fl(r.nm)).join("");
    html+=`<div class="grp-card" id="gc-${gl}">
<div class="grp-hdr" onclick="toggleGrp('${gl}')">
  <h3>GRUPO ${gl}</h3><div class="grp-flags">${flagPrev}</div>
  ${hasLive?'<span style="color:var(--live);font-size:10px;font-weight:800;animation:pulse 1.5s infinite;margin-left:4px">🔴 AO VIVO</span>':""}
  <span style="font-size:10px;color:var(--text3);margin-left:6px;font-family:'Barlow Condensed',sans-serif">${played}/6</span>
  <span class="grp-arrow">▼</span>
</div>
<div class="st-wrap"><table class="st">
<thead><tr><th>Seleção</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th><th>PTS</th><th>Forma</th></tr></thead><tbody>`;
    rows.forEach((t,i)=>{
      const pc=i===0?"p1":i===1?"p2":i===2?"p3":"";
      const sgC=t.sg>0?"sg-pos":t.sg<0?"sg-neg":"";
      const liveClass=t.live?' class="live-row"':"";
      const formH=t.form.slice(-5).map(r=>{
        if(r==="X")return'<div class="fd fd-lv">●</div>';
        return`<div class="fd fd-${r==="W"?"w":r==="D"?"d":"l"}">${r}</div>`;
      }).join("");
      html+=`<tr${liveClass}><td><div class="st-tm"><div class="pos ${pc}">${i+1}</div><div class="st-fl">${fl(t.nm)}</div><div class="st-nm">${pt(t.nm)}</div></div></td><td>${t.j}</td><td>${t.v}</td><td>${t.e}</td><td>${t.d}</td><td>${t.gp}</td><td>${t.gc}</td><td class="${sgC}">${t.sg>0?"+":""}${t.sg}</td><td class="pts-cell">${t.pts}${t.live?'<span style="color:var(--live);font-size:8px"> ●</span>':""}</td><td><div class="form-row">${formH||'<span style="color:var(--text3);font-size:9px">—</span>'}</div></td></tr>`;
    });
    html+=`</tbody></table></div>
<div class="st-legend"><span><span class="ld" style="background:var(--green)"></span>Classificado</span><span><span class="ld" style="background:var(--gold)"></span>Melhor 3º</span><span><span class="ld" style="background:#4B5563"></span>Eliminado</span>${hasLive?'<span><span class="ld" style="background:var(--live)"></span>Parcial</span>':""}</div>
<div class="grp-matches" id="gm-${gl}" style="display:none"><div class="gmt">JOGOS DO GRUPO ${gl}</div>`;
    gm.forEach(m=>{
      const d=getMatchData(m);const st=d?d.st:"upcoming";
      const ofb=ofbMatch(m.h,m.a);
      let sStr=m.t;
      if(st==="live"&&d&&d.hasScore)sStr=`<span style="color:var(--live)">${d.hs}–${d.as} ${getMin(m,d)}🔴</span>`;
      else if(st==="finished"&&d&&d.hasScore)sStr=`${d.hs}–${d.as}`;
      else if(st==="finished"&&(!d||!d.hasScore))sStr='<span style="color:var(--text3);font-size:10px">–</span>';
      let sc="";
      if(ofb&&ofb.score&&ofb.score.ft){
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
function toggleGrp(gl){
  const c=document.getElementById("gc-"+gl);
  const gm=document.getElementById("gm-"+gl);
  c.classList.toggle("open");
  gm.style.display=gm.style.display==="none"?"block":"none";
}

// ── MODAL ──
function openModal(id){
  const m=F.find(x=>x.id===id);if(!m)return;
  modalId=id;
  document.getElementById("modalOverlay").classList.add("on");
  document.body.style.overflow="hidden";
  document.getElementById("modalContent").innerHTML=buildModal(m);
  startMTmr(m);
}
function buildModal(m){
  const n=getDisplayNames(m);
  let data=m.ph==="grupos"?getMatchData(m):getElimData(m);
  const st=data?data.st:"upcoming";
  const hw=data&&data.hasScore&&data.hs!=null&&+data.hs>+data.as;
  const aw=data&&data.hasScore&&data.hs!=null&&+data.as>+data.hs;
  const minD=getMin(m,data);
  const pct=tPct(m,data);
  let scoreC="";
  if((st==="live"||st==="finished")&&data&&data.hasScore&&data.hs!=null){
    scoreC=`<div class="mt-score-box"><div class="mt-sc${hw?" win":""}">${data.hs}</div><div class="mt-sc-d">:</div><div class="mt-sc${aw?" win":""}">${data.as}</div></div>`;
  }else{scoreC=`<div class="mt-sc-time">${m.t}</div>`;}
  let liveBar="";
  if(st==="live"){
    const ht=isHT(m.d,m.t);
    liveBar=`<div class="modal-timer-bar"><div class="td"></div><div class="tv" id="mtv">${ht?"INTERVALO":minD}</div><div class="tbw"><div class="tb" id="mtb" style="width:${pct}%"></div></div><div class="tp">/ 90'</div></div>`;
  }
  const dt=new Date(m.d+"T12:00:00");
  const wd=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  const mo=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const dStr=`${wd[dt.getDay()]}, ${dt.getDate()} ${mo[dt.getMonth()]}`;
  const hFlag=n.hFlag||fl(n.h)||"🏳️";
  const aFlag=n.aFlag||fl(n.a)||"🏳️";
  const ofb=m.ph==="grupos"?ofbMatch(m.h,m.a):null;
  let body="";
  if(st==="upcoming"){body='<div class="no-data">⏳ Jogo ainda não iniciado</div>';}
  else if(ofb&&ofb.score&&ofb.score.ft){body=buildOFBDetail(m,ofb);}
  else if(st==="live"){body='<div class="no-data">🔴 Jogo em andamento<br><span style="font-size:10px;color:var(--text3)">Eventos detalhados disponíveis após encerramento</span></div>';}
  else if(st==="finished"&&data&&data.hasScore){
    body=`<div class="no-data">Placar final: ${data.hs}–${data.as}<br><span style="font-size:10px;color:var(--text3)">Eventos detalhados via openfootball em breve</span></div>`;
  }else{body='<div class="no-data">📡 Dados não disponíveis</div>';}
  return`<div class="modal-hdr">
  <div class="modal-title">⚽ ${m.g} · ${dStr} · ${m.t}</div>
  <div class="modal-teams">
    <div class="mt-side"><div class="mt-fl">${hFlag}</div><div class="mt-nm">${n.hL}</div></div>
    ${scoreC}
    <div class="mt-side"><div class="mt-fl">${aFlag}</div><div class="mt-nm">${n.aL}</div></div>
  </div>
</div>${liveBar}
<div class="modal-body">
  <div class="modal-venue"><div><div class="mv-txt">${m.v.split(",")[0]}</div><div class="mv-sub">${m.v.split(",").slice(1).join(",").trim()}</div></div></div>
  <div class="modal-info">
    <div class="mi"><div class="mi-val">${dStr.split(",")[1]?.trim()||dStr}</div><div class="mi-lbl">Data</div></div>
    <div class="mi"><div class="mi-val">${m.t}</div><div class="mi-lbl">Horário (BRT)</div></div>
  </div>${body}</div>`;
}
function buildOFBDetail(m,ofb){
  let html="";
  const g1=ofb.goals1||[],g2=ofb.goals2||[];
  if(g1.length||g2.length){
    html+='<div class="modal-sec"><div class="modal-sec-title">⚽ Gols</div>';
    [...g1.map(g=>({...g,side:"home"})),...g2.map(g=>({...g,side:"away"}))]
      .sort((a,b)=>parseInt(a.minute||0)-parseInt(b.minute||0))
      .forEach(g=>{
        const isH=g.side==="home";
        const icon=g.owngoal?"🔴":g.penalty?"🎯":"⚽";
        const lbl=g.owngoal?` <span style="color:var(--live);font-size:9px">(contra)</span>`:g.penalty?` <span style="color:var(--text3);font-size:9px">(pen)</span>`:"";
        html+=`<div class="ev-row"><div class="ev-min">${g.minute||"?"}'</div><div class="ev-icon">${icon}</div><div class="ev-name">${g.name||"—"}${lbl}</div><div class="ev-team">${isH?fl(m.h):fl(m.a)}</div></div>`;
      });
    html+="</div>";
  }
  if(ofb.score&&ofb.score.ht){
    html+=`<div class="modal-sec"><div class="modal-sec-title">📊 Por tempo</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
      <div class="mi"><div class="mi-val">${ofb.score.ht[0]}–${ofb.score.ht[1]}</div><div class="mi-lbl">1º Tempo</div></div>
      <div class="mi"><div class="mi-val">${ofb.score.ft[0]}–${ofb.score.ft[1]}</div><div class="mi-lbl">Final</div></div>
    </div></div>`;
  }
  if(!g1.length&&!g2.length&&!(ofb.score&&ofb.score.ht)){
    html+='<div class="no-data">0 × 0 · Sem gols registrados</div>';
  }
  return html;
}
function startMTmr(m){
  if(modalTmr)clearInterval(modalTmr);
  if(mStatus(m)!=="live")return;
  modalTmr=setInterval(()=>{
    const d=m.ph==="grupos"?getMatchData(m):getElimData(m);
    const tv=document.getElementById("mtv"),tb=document.getElementById("mtb");
    if(tv)tv.textContent=isHT(m.d,m.t)?"INTERVALO":getMin(m,d);
    if(tb)tb.style.width=tPct(m,d)+"%";
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
document.getElementById("modalBox").addEventListener("touchmove",e=>{
  if(e.touches[0].clientY-tY>70){document.getElementById("modalOverlay").classList.remove("on");document.body.style.overflow="";}
},{passive:true});

// ── STATS ──
function renderStats(){
  const played=F.filter(m=>{
    if(m.ph!=="grupos")return false;
    const d=getMatchData(m);return d&&d.st==="finished";
  }).length;
  const lc=liveCount();
  // Gols via OFB
  let totalG=0;
  const scorersMap={};
  OFB_MATCHES.filter(m=>m.score&&m.score.ft).forEach(m=>{
    (m.goals1||[]).forEach(g=>{totalG++;if(!g.owngoal){if(!scorersMap[g.name])scorersMap[g.name]={name:g.name,goals:0,pen:0,team:m._h};scorersMap[g.name].goals++;if(g.penalty)scorersMap[g.name].pen++;}});
    (m.goals2||[]).forEach(g=>{totalG++;if(!g.owngoal){if(!scorersMap[g.name])scorersMap[g.name]={name:g.name,goals:0,pen:0,team:m._a};scorersMap[g.name].goals++;if(g.penalty)scorersMap[g.name].pen++;}});
  });
  // Fallback gols via WC_GAMES
  if(totalG===0){
    WC_GAMES.filter(g=>g._st==="finished"&&g._hs!=null).forEach(g=>{totalG+=g._hs+g._as;});
  }
  const avg=played>0?(totalG/played).toFixed(1):"—";
  const pct=Math.round(played/104*100);

  // Artilheiros
  let sList=Object.values(scorersMap).sort((a,b)=>b.goals-a.goals).slice(0,15);
  if(!sList.length&&fdOk&&FD_SC.length){
    sList=FD_SC.slice(0,15).map(s=>({name:s.player?.name||"—",goals:s.goals||0,pen:s.penalties||0,team:canon(s.team?.name||"")}));
  }

  // Stats de times
  let teamStats=[];
  ["A","B","C","D","E","F","G","H","I","J","K","L"].forEach(gl=>{
    calcGroup(gl).filter(t=>t.j>0).forEach(t=>{
      let yc=0,rc=0;
      F.filter(m=>m.g===gl&&m.ph==="grupos").forEach(m=>{
        const ofb=ofbMatch(m.h,m.a);if(!ofb||!ofb.score)return;
        const isH=m.h===t.nm;
        const bk=isH?(ofb.bookings1||[]):(ofb.bookings2||[]);
        bk.forEach(b=>{
          const card=(b.card||"yellow").toLowerCase();
          // Apenas cartão VERMELHO direto conta como vermelho; segundo amarelo é só amarelo
          if(card==="red"||card==="direct red")rc++;
          else yc++; // yellow, second yellow
        });
      });
      teamStats.push({...t,yc,rc});
    });
  });

  const topAtk=[...teamStats].sort((a,b)=>b.gp-a.gp||b.sg-a.sg).slice(0,10);
  const topDef=[...teamStats].sort((a,b)=>a.gc-b.gc||b.j-a.j).slice(0,10);
  const topDis=[...teamStats].filter(t=>t.yc+t.rc>0).sort((a,b)=>(b.yc+b.rc*3)-(a.yc+a.rc*3)).slice(0,10);
  const maxGP=topAtk[0]?.gp||1;
  const src=ofbOk?"openfootball":wcOk?"worldcup26.ir":"football-data.org";

  const sH=sList.length?sList.map((s,i)=>{
    const flag=fl(s.team)||"🏳️";
    const teamPT=pt(s.team)||s.team||"—";
    return`<div class="li"><div class="li-rk${i<3?" top":""}">${i+1}</div><div class="li-fl">${flag}</div><div class="li-inf"><div class="li-nm">${s.name}</div><div class="li-sb">${teamPT}${s.pen>0?" · "+s.pen+" pen.":""}</div></div><div class="li-val">${s.goals} ⚽</div></div>`;
  }).join(""):'<div class="no-data">Disponível após os primeiros gols</div>';

  const atkH=topAtk.length?topAtk.map((t,i)=>`<div class="li"><div class="li-rk${i<3?" top":""}">${i+1}</div><div class="li-fl">${fl(t.nm)}</div><div class="li-inf"><div class="li-nm">${pt(t.nm)}</div><div class="li-sb">${t.j} jogo(s) · SG ${t.sg>0?"+":""}${t.sg}</div><div class="li-bar-wrap" style="margin-top:4px"><div class="li-bar" style="width:${Math.round(t.gp/maxGP*100)}%"></div></div></div><div class="li-val">${t.gp}</div></div>`).join(""):'<div class="empty">Aguardando jogos</div>';

  const defH=topDef.filter(t=>t.j>0).length?topDef.filter(t=>t.j>0).map((t,i)=>`<div class="li"><div class="li-rk${i<3?" top":""}">${i+1}</div><div class="li-fl">${fl(t.nm)}</div><div class="li-inf"><div class="li-nm">${pt(t.nm)}</div><div class="li-sb">${t.j} jogo(s) · GP ${t.gp}</div></div><div class="li-val" style="color:var(--green)">${t.gc}</div></div>`).join(""):'<div class="empty">Aguardando jogos</div>';

  const disH=topDis.length?topDis.map((t,i)=>`<div class="li"><div class="li-rk${i<3?" top":""}">${i+1}</div><div class="li-fl">${fl(t.nm)}</div><div class="li-inf"><div class="li-nm">${pt(t.nm)}</div><div class="li-sb">${t.j} jogo(s) · 🟨${t.yc} 🟥${t.rc}</div></div><div class="li-cards">${"<span class='yc'></span>".repeat(Math.min(t.yc,8))}${"<span class='rc'></span>".repeat(Math.min(t.rc,3))}</div></div>`).join("")
    :'<div class="no-data" style="font-size:11px">Dados de cartões via openfootball.<br>Disponíveis após atualização do repositório.</div>';

  return`<div class="kpi-grid">
  <div class="kpi"><div class="kpi-n">${played}</div><div class="kpi-l">Jogos realizados</div></div>
  <div class="kpi"><div class="kpi-n" style="color:${lc?"var(--live)":"var(--gold)"}">${lc}</div><div class="kpi-l" style="color:${lc?"var(--live)":""}">Ao vivo agora</div></div>
  <div class="kpi"><div class="kpi-n">${totalG}</div><div class="kpi-l">Total de gols</div></div>
  <div class="kpi"><div class="kpi-n">${avg}</div><div class="kpi-l">Média gols/jogo</div></div>
  <div class="kpi wide">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px">
      <div class="kpi-l" style="margin:0">Progresso · <span style="color:var(--green);font-size:9px">✓ ${src}</span></div>
      <span style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--gold)">${played}/104</span>
    </div>
    <div class="prog-bar"><div class="prog-fill" style="width:${pct}%"></div></div>
    <div class="kpi-sub">${pct}% · Copa: 11 Jun – 19 Jul 2026</div>
  </div>
</div>
<div class="list-blk"><div class="lb-hdr"><span class="lhi">⚽</span><h3>ARTILHEIROS</h3><span class="api-src">${sList.length?"✓ "+src:"aguardando..."}</span></div>${sH}</div>
<div class="list-blk"><div class="lb-hdr"><span class="lhi">🥅</span><h3>MAIORES ATAQUES</h3><span class="api-src">${played>0?"✓ "+src:"aguardando..."}</span></div>${atkH}</div>
<div class="list-blk"><div class="lb-hdr"><span class="lhi">🛡️</span><h3>MELHORES DEFESAS</h3><span class="api-src">${played>0?"✓ "+src:"aguardando..."}</span></div>${defH}</div>
<div class="list-blk"><div class="lb-hdr"><span class="lhi">🟨</span><h3>DISCIPLINA</h3><span class="api-src">${topDis.length?"✓ openfootball":"aguardando..."}</span></div>
  ${disH}
  ${topDis.length?'<div style="padding:9px 13px;border-top:1px solid var(--border2);font-family:\'Barlow Condensed\',sans-serif;font-size:11px;color:var(--text3)">🟨 2 amarelos acumulados = suspensão · 🟥 Vermelho direto = próximo jogo suspenso</div>':""}
</div>
<div class="list-blk"><div class="lb-hdr"><span class="lhi">📋</span><h3>SOBRE O TORNEIO</h3></div>
<table class="info-tbl">
  <tr><td>Edição</td><td>23ª Copa do Mundo FIFA</td></tr>
  <tr><td>Países sede</td><td>🇺🇸 EUA · 🇨🇦 Canadá · 🇲🇽 México</td></tr>
  <tr><td>Seleções</td><td>48 · 12 grupos de 4</td></tr>
  <tr><td>Total de jogos</td><td>104</td></tr>
  <tr><td>Fase de grupos</td><td>11–27 Jun 2026</td></tr>
  <tr><td>Fase eliminatória</td><td>28 Jun – 19 Jul 2026</td></tr>
  <tr><td>Final</td><td>19 Jul · MetLife, Nova York</td></tr>
  <tr><td>🇧🇷 Brasil — Grupo C</td><td>1º colocado</td></tr>
  <tr><td>Dados ao vivo</td><td style="color:var(--gold)">worldcup26.ir</td></tr>
  <tr><td>Resultados/Gols</td><td style="color:var(--gold)">openfootball</td></tr>
  <tr><td>Criado por</td><td style="color:var(--gold)">Pscheidt</td></tr>
</table></div>
<div class="src">Ao vivo: <a href="https://worldcup26.ir">worldcup26.ir</a> · Gols: <a href="https://github.com/openfootball/worldcup.json">openfootball</a> · Stats: <a href="https://football-data.org">football-data.org</a></div>`;
}

// ── PAGE CONTROL ──
function goPage(pg){
  curPage=pg;
  document.querySelectorAll(".pg").forEach(el=>el.classList.remove("on"));
  document.getElementById("pg-"+pg).classList.add("on");
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
  document.getElementById("nav-"+pg).classList.add("active");
  const isJogos=pg==="jogos";
  document.getElementById("tabBar").style.display=isJogos?"flex":"none";
  render();
}
function setFilter(fi){
  curFilter=fi;
  const fs=["all","live","today","brazil","grupos","oitavas","semi"];
  document.querySelectorAll(".tab").forEach((t,i)=>t.classList.toggle("on",fs[i]===fi));
  render();
}
function render(){
  document.getElementById("livePill").classList.toggle("on",liveCount()>0);
  document.getElementById("apiWarn").classList.toggle("on",!ofbOk&&!wcOk);
  if(curPage==="jogos")document.getElementById("jogosBody").innerHTML=renderJogos();
  else if(curPage==="brasil")document.getElementById("brasilBody").innerHTML=renderBrasil();
  else if(curPage==="grupos")document.getElementById("gruposBody").innerHTML=renderGrupos();
  else if(curPage==="stats")document.getElementById("statsBody").innerHTML=renderStats();
}

// ── MAIN ──
async function loadAll(){
  const btn=document.getElementById("refreshBtn");
  btn.classList.add("spin");
  await Promise.all([fetchOFB(),fetchWC(),fetchFD()]);
  render();
  const now=new Date();
  const src=ofbOk?"✓ openfootball":wcOk?"✓ worldcup26.ir":"⚠ sem dados";
  document.getElementById("updLbl").textContent=`${src} · ${now.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}`;
  btn.classList.remove("spin");
}
function scheduleRefresh(){
  const lc=liveCount();
  setTimeout(()=>{loadAll().then(scheduleRefresh);},lc>0?30000:300000);
}
loadAll().then(scheduleRefresh);
