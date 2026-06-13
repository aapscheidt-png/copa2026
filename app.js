// COPA DO MUNDO 2026 · app.js · by Pscheidt

const FDKEY = "86cb611164f348ac89dcc715dda20f92";
const FD    = "https://api.football-data.org/v4";
const FDH   = { "X-Auth-Token": FDKEY };

// ── RESULTADOS CONHECIDOS (fallback hardcoded) ──
// Atualizado diariamente. Fonte: FIFA oficial
const KNOWN = {
  "a1":{hs:0,as:1,status:"finished"},   // México 0-1 África do Sul
  "a2":{hs:3,as:1,status:"finished"},   // Coreia do Sul 3-1 Tchéquia
  "b1":{hs:1,as:1,status:"finished"},   // Canadá 1-1 Bósnia
  "d1":{hs:2,as:0,status:"finished"},   // EUA 2-0 Paraguai
  "d2":{hs:1,as:2,status:"finished"},   // Austrália 1-2 Turquia
  "b2":{hs:0,as:3,status:"finished"},   // Catar 0-3 Suíça
  "c1":{hs:2,as:1,status:"finished"},   // Brasil 2-1 Marrocos
  "c2":{hs:0,as:2,status:"finished"},   // Haiti 0-2 Escócia
};

const FL={
  "Mexico":"🇲🇽","South Africa":"🇿🇦","South Korea":"🇰🇷","Czechia":"🇨🇿","Czech Republic":"🇨🇿",
  "Canada":"🇨🇦","Bosnia and Herzegovina":"🇧🇦","Qatar":"🇶🇦","Switzerland":"🇨🇭",
  "Brazil":"🇧🇷","Morocco":"🇲🇦","Haiti":"🇭🇹","Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","Australia":"🇦🇺",
  "Türkiye":"🇹🇷","Turkey":"🇹🇷","United States":"🇺🇸","Paraguay":"🇵🇾","Germany":"🇩🇪",
  "Curacao":"🇨🇼","Netherlands":"🇳🇱","Japan":"🇯🇵","Ivory Coast":"🇨🇮","Côte d'Ivoire":"🇨🇮",
  "Ecuador":"🇪🇨","Sweden":"🇸🇪","Tunisia":"🇹🇳","Spain":"🇪🇸","Cape Verde":"🇨🇻",
  "Belgium":"🇧🇪","Egypt":"🇪🇬","Saudi Arabia":"🇸🇦","Uruguay":"🇺🇾","Iran":"🇮🇷",
  "New Zealand":"🇳🇿","Austria":"🇦🇹","Jordan":"🇯🇴","France":"🇫🇷","Senegal":"🇸🇳",
  "Iraq":"🇮🇶","Norway":"🇳🇴","Argentina":"🇦🇷","Algeria":"🇩🇿","Portugal":"🇵🇹",
  "DR Congo":"🇨🇩","England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Croatia":"🇭🇷","Ghana":"🇬🇭","Panama":"🇵🇦",
  "Uzbekistan":"🇺🇿","Colombia":"🇨🇴","Korea Republic":"🇰🇷"
};
const PT={
  "Mexico":"México","South Africa":"África do Sul","South Korea":"Coreia do Sul",
  "Czechia":"Tchéquia","Czech Republic":"Tchéquia","Canada":"Canadá",
  "Bosnia and Herzegovina":"Bósnia-Herz.","Qatar":"Catar","Switzerland":"Suíça",
  "Brazil":"Brasil","Morocco":"Marrocos","Haiti":"Haiti","Scotland":"Escócia",
  "Australia":"Austrália","Türkiye":"Turquia","Turkey":"Turquia",
  "United States":"EUA","Paraguay":"Paraguai","Germany":"Alemanha","Curacao":"Curaçao",
  "Netherlands":"Países Baixos","Japan":"Japão","Ivory Coast":"Costa do Marfim",
  "Côte d'Ivoire":"Costa do Marfim","Ecuador":"Equador","Sweden":"Suécia",
  "Tunisia":"Tunísia","Spain":"Espanha","Cape Verde":"Cabo Verde","Belgium":"Bélgica",
  "Egypt":"Egito","Saudi Arabia":"Arábia Saudita","Uruguay":"Uruguai","Iran":"Irã",
  "New Zealand":"Nova Zelândia","Austria":"Áustria","Jordan":"Jordânia","France":"França",
  "Senegal":"Senegal","Iraq":"Iraque","Norway":"Noruega","Argentina":"Argentina",
  "Algeria":"Argélia","Portugal":"Portugal","DR Congo":"RD Congo","England":"Inglaterra",
  "Croatia":"Croácia","Ghana":"Gana","Panama":"Panamá","Uzbekistan":"Uzbequistão",
  "Colombia":"Colômbia","Korea Republic":"Coreia do Sul"
};
const fl=n=>FL[n]||"🏳️";
const pt=n=>PT[n]||n;

const GROUPS={
  A:["Mexico","South Africa","South Korea","Czechia"],
  B:["Canada","Bosnia and Herzegovina","Qatar","Switzerland"],
  C:["Brazil","Morocco","Haiti","Scotland"],
  D:["United States","Paraguay","Australia","Türkiye"],
  E:["Germany","Curacao","Ivory Coast","Ecuador"],
  F:["Netherlands","Japan","Sweden","Tunisia"],
  G:["Belgium","Egypt","Iran","New Zealand"],
  H:["Spain","Cape Verde","Saudi Arabia","Uruguay"],
  I:["France","Senegal","Iraq","Norway"],
  J:["Austria","Jordan","Argentina","Algeria"],
  K:["Portugal","DR Congo","Uzbekistan","Colombia"],
  L:["England","Croatia","Ghana","Panama"]
};

const M=[
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
  // ELIMINATÓRIAS
  {id:"e01",g:"1/16",d:"2026-06-28",t:"16:00",h:"2º Grupo A",a:"2º Grupo B",v:"SoFi Stadium, Los Angeles",ph:"oitavas"},
  {id:"e02",g:"1/16",d:"2026-06-29",t:"14:00",h:"1º Grupo C",a:"2º Grupo F",v:"NRG Stadium, Houston",ph:"oitavas"},
  {id:"e03",g:"1/16",d:"2026-06-29",t:"17:30",h:"1º Grupo E",a:"Melhor 3º",v:"Gillette Stadium, Boston",ph:"oitavas"},
  {id:"e04",g:"1/16",d:"2026-06-29",t:"22:00",h:"1º Grupo F",a:"2º Grupo C",v:"Estadio BBVA, Monterrey",ph:"oitavas"},
  {id:"e05",g:"1/16",d:"2026-06-30",t:"14:00",h:"2º Grupo E",a:"2º Grupo I",v:"AT&T Stadium, Dallas",ph:"oitavas"},
  {id:"e06",g:"1/16",d:"2026-06-30",t:"18:00",h:"1º Grupo I",a:"Melhor 3º",v:"MetLife Stadium, Nova York",ph:"oitavas"},
  {id:"e07",g:"1/16",d:"2026-06-30",t:"22:00",h:"1º Grupo A",a:"Melhor 3º",v:"Estádio Azteca, Cidade do México",ph:"oitavas"},
  {id:"e08",g:"1/16",d:"2026-07-01",t:"13:00",h:"1º Grupo L",a:"Melhor 3º",v:"Mercedes-Benz Stadium, Atlanta",ph:"oitavas"},
  {id:"e09",g:"1/16",d:"2026-07-01",t:"17:00",h:"1º Grupo G",a:"Melhor 3º",v:"Lumen Field, Seattle",ph:"oitavas"},
  {id:"e10",g:"1/16",d:"2026-07-01",t:"21:00",h:"1º Grupo D",a:"Melhor 3º",v:"Levi's Stadium, San Francisco",ph:"oitavas"},
  {id:"e11",g:"1/16",d:"2026-07-02",t:"00:00",h:"1º Grupo B",a:"Melhor 3º",v:"BC Place, Vancouver",ph:"oitavas"},
  {id:"e12",g:"1/16",d:"2026-07-02",t:"16:00",h:"1º Grupo H",a:"2º Grupo J",v:"SoFi Stadium, Los Angeles",ph:"oitavas"},
  {id:"e13",g:"1/16",d:"2026-07-02",t:"20:00",h:"2º Grupo K",a:"2º Grupo L",v:"BMO Field, Toronto",ph:"oitavas"},
  {id:"e14",g:"1/16",d:"2026-07-03",t:"15:00",h:"2º Grupo D",a:"2º Grupo G",v:"AT&T Stadium, Dallas",ph:"oitavas"},
  {id:"e15",g:"1/16",d:"2026-07-03",t:"17:00",h:"1º Grupo J",a:"2º Grupo H",v:"Mercedes-Benz Stadium, Atlanta",ph:"oitavas"},
  {id:"e16",g:"1/16",d:"2026-07-03",t:"22:30",h:"1º Grupo K",a:"Melhor 3º",v:"Children's Mercy Park, Kansas City",ph:"oitavas"},
  {id:"o1",g:"Oitavas",d:"2026-07-04",t:"14:00",h:"Venc.(2Ax2B)",a:"Venc.(1Fx2C)",v:"NRG Stadium, Houston",ph:"oitavas"},
  {id:"o2",g:"Oitavas",d:"2026-07-04",t:"18:00",h:"Venc.(1Ex3º)",a:"Venc.(1Ix3º)",v:"Lincoln Financial Field, Filadélfia",ph:"oitavas"},
  {id:"o3",g:"Oitavas",d:"2026-07-05",t:"17:00",h:"Venc.(1Cx2F)",a:"Venc.(2Ex2I)",v:"MetLife Stadium, Nova York",ph:"oitavas"},
  {id:"o4",g:"Oitavas",d:"2026-07-05",t:"21:00",h:"Venc.(1Ax3º)",a:"Venc.(1Lx3º)",v:"Estádio Azteca, Cidade do México",ph:"oitavas"},
  {id:"o5",g:"Oitavas",d:"2026-07-06",t:"15:00",h:"Venc.(2Kx2L)",a:"Venc.(1Hx2J)",v:"AT&T Stadium, Dallas",ph:"oitavas"},
  {id:"o6",g:"Oitavas",d:"2026-07-06",t:"20:00",h:"Venc.(1Dx3º)",a:"Venc.(1Gx3º)",v:"Lumen Field, Seattle",ph:"oitavas"},
  {id:"o7",g:"Oitavas",d:"2026-07-07",t:"13:00",h:"Venc.(1Jx2H)",a:"Venc.(2Dx2G)",v:"Mercedes-Benz Stadium, Atlanta",ph:"oitavas"},
  {id:"o8",g:"Oitavas",d:"2026-07-07",t:"17:00",h:"Venc.(1Bx3º)",a:"Venc.(1Kx3º)",v:"BC Place, Vancouver",ph:"oitavas"},
  {id:"q1",g:"Quartas",d:"2026-07-09",t:"17:00",h:"Venc.J89",a:"Venc.J90",v:"Gillette Stadium, Boston",ph:"semi"},
  {id:"q2",g:"Quartas",d:"2026-07-10",t:"16:00",h:"Venc.J93",a:"Venc.J94",v:"SoFi Stadium, Los Angeles",ph:"semi"},
  {id:"q3",g:"Quartas",d:"2026-07-11",t:"18:00",h:"Venc.J91",a:"Venc.J92",v:"Hard Rock Stadium, Miami",ph:"semi"},
  {id:"q4",g:"Quartas",d:"2026-07-11",t:"21:00",h:"Venc.J95",a:"Venc.J96",v:"Children's Mercy Park, Kansas City",ph:"semi"},
  {id:"sf1",g:"Semifinal",d:"2026-07-14",t:"16:00",h:"Venc.QF1",a:"Venc.QF2",v:"AT&T Stadium, Dallas",ph:"semi"},
  {id:"sf2",g:"Semifinal",d:"2026-07-15",t:"16:00",h:"Venc.QF3",a:"Venc.QF4",v:"AT&T Stadium, Dallas",ph:"semi"},
  {id:"tp1",g:"3º Lugar",d:"2026-07-18",t:"18:00",h:"Perd.SF1",a:"Perd.SF2",v:"Hard Rock Stadium, Miami",ph:"semi"},
  {id:"fi1",g:"🏆 FINAL",d:"2026-07-19",t:"16:00",h:"Venc.SF1",a:"Venc.SF2",v:"MetLife Stadium, Nova York",ph:"semi"}
];

// ─── STATE ────────────────────────────────
let SC={};
let FD_SCORERS=[];
let FD_STANDINGS={};
let fdOk=false;
let curPage="jogos",curFilter="all";
let modalMatchId=null,modalTimerInt=null;

// ─── HELPERS ──────────────────────────────
const todayStr=()=>{const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
const isToday=d=>d===todayStr();

function isPast(d,t){
  const[h,m]=t.split(":").map(Number);
  const dt=new Date(d+"T12:00:00");
  dt.setHours(h,m+100);
  return dt<new Date();
}
function estMin(d,t){
  const[h,m]=t.split(":").map(Number);
  const kick=new Date(d+"T12:00:00");kick.setHours(h,m,0);
  const el=Math.floor((new Date()-kick)/60000);
  if(el<0)return null;
  if(el<=45)return Math.min(el,45);
  if(el<=60)return 45;
  if(el<=105)return Math.min(el-15,90);
  return 90;
}
function isHT(d,t){
  const[h,m]=t.split(":").map(Number);
  const k=new Date(d+"T12:00:00");k.setHours(h,m,0);
  const el=Math.floor((new Date()-k)/60000);
  return el>45&&el<=60;
}

// Retorna placar: API tem prioridade, senão KNOWN
function getSC(id){return SC[id]||KNOWN[id]||null;}

// Status do jogo: API tem prioridade, senão KNOWN, senão calcula pelo horário
function mSt(m){
  if(SC[m.id])return SC[m.id].status;
  if(KNOWN[m.id])return KNOWN[m.id].status;
  if(isPast(m.d,m.t))return"finished";
  if(isToday(m.d)){
    const now=new Date();
    const[h,mi]=m.t.split(":").map(Number);
    const mt=new Date();mt.setHours(h,mi,0);
    if(now>=mt)return"live";
  }
  return"upcoming";
}

function getMin(m){
  const sc=SC[m.id];
  if(sc&&sc.min&&/^\d+/.test(sc.min))return sc.min+"'";
  const e=estMin(m.d,m.t);
  if(e===null)return"";
  if(isHT(m.d,m.t))return"Intervalo";
  return e+"'";
}
function tPct(m){
  const sc=SC[m.id];
  if(sc&&sc.min&&!isNaN(parseInt(sc.min)))return Math.min(100,Math.round(parseInt(sc.min)/90*100));
  const e=estMin(m.d,m.t);
  return e?Math.min(100,Math.round(e/90*100)):0;
}
function fmtD(d){
  const dt=new Date(d+"T12:00:00");
  const wd=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  const mo=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago"];
  const tod=isToday(d)?'<span class="today-lbl"> — HOJE</span>':"";
  return`${wd[dt.getDay()]}, ${dt.getDate()} ${mo[dt.getMonth()]}${tod}`;
}
const liveCount=()=>M.filter(m=>mSt(m)==="live").length;
function nmMatch(a,b){
  if(!a||!b)return false;
  const al=a.toLowerCase(),bl=b.toLowerCase();
  return al.includes(bl.slice(0,5))||bl.includes(al.slice(0,5));
}

// ─── API: football-data.org ───────────────
async function fetchFDMatches(){
  try{
    const r=await fetch(`${FD}/competitions/WC/matches?season=2026`,{headers:FDH,signal:AbortSignal.timeout(9000)});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    const data=await r.json();
    (data.matches||[]).forEach(fm=>{
      const match=M.find(m=>nmMatch(m.h,fm.homeTeam?.name)&&nmMatch(m.a,fm.awayTeam?.name));
      if(!match)return;
      const st=fm.status;
      let status="upcoming";
      if(st==="FINISHED")status="finished";
      else if(["IN_PLAY","PAUSED","HALFTIME"].includes(st))status="live";
      const hs=fm.score?.fullTime?.home??fm.score?.halfTime?.home??null;
      const as=fm.score?.fullTime?.away??fm.score?.halfTime?.away??null;
      const min=fm.minute?String(fm.minute):null;
      if(hs!=null||status!=="upcoming"){
        SC[match.id]={hs,as,status,min,fdId:fm.id};
      }
    });
    fdOk=true;
  }catch(e){console.warn("FD matches:",e.message);fdOk=false;}
}

async function fetchFDStandings(){
  try{
    const r=await fetch(`${FD}/competitions/WC/standings?season=2026`,{headers:FDH,signal:AbortSignal.timeout(9000)});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    const data=await r.json();
    FD_STANDINGS={};
    (data.standings||[]).forEach(grp=>{
      const letter=(grp.group||"").replace(/.*GROUP_/,"");
      if(!letter)return;
      FD_STANDINGS[letter]=(grp.table||[]).map(row=>({
        team:row.team?.name||"",pts:row.points||0,played:row.playedGames||0,
        won:row.won||0,drawn:row.draw||0,lost:row.lost||0,
        gf:row.goalsFor||0,ga:row.goalsAgainst||0,gd:row.goalDifference||0,form:row.form||""
      }));
    });
  }catch(e){console.warn("FD standings:",e.message);}
}

async function fetchFDScorers(){
  try{
    const r=await fetch(`${FD}/competitions/WC/scorers?season=2026&limit=20`,{headers:FDH,signal:AbortSignal.timeout(9000)});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    const data=await r.json();
    FD_SCORERS=data.scorers||[];
  }catch(e){console.warn("FD scorers:",e.message);}
}

async function fetchFDMatchDetail(fdId){
  if(!fdId)return null;
  try{
    const r=await fetch(`${FD}/matches/${fdId}`,{headers:FDH,signal:AbortSignal.timeout(8000)});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    return await r.json();
  }catch(e){console.warn("FD detail:",e.message);return null;}
}

// ─── TABELA LOCAL (usa KNOWN + SC) ────────
function calcLocalGroup(gl){
  const st={};
  GROUPS[gl].forEach(t=>{st[t]={j:0,v:0,e:0,d:0,gp:0,gc:0,sg:0,pts:0,form:[],live:false};});
  M.filter(m=>m.g===gl&&m.ph==="grupos").forEach(m=>{
    const sc=getSC(m.id);
    const status=mSt(m);
    if((status==="finished"||status==="live")&&sc&&sc.hs!=null&&sc.as!=null){
      const hs=+sc.hs,as=+sc.as;
      if(!st[m.h]||!st[m.a])return;
      st[m.h].j++;st[m.a].j++;
      st[m.h].gp+=hs;st[m.h].gc+=as;st[m.h].sg+=hs-as;
      st[m.a].gp+=as;st[m.a].gc+=hs;st[m.a].sg+=as-hs;
      if(status==="live"){st[m.h].live=true;st[m.a].live=true;}
      if(hs>as){st[m.h].v++;st[m.h].pts+=3;st[m.h].form.push(status==="live"?"X":"W");st[m.a].d++;st[m.a].form.push(status==="live"?"X":"L");}
      else if(hs===as){st[m.h].e++;st[m.h].pts++;st[m.h].form.push(status==="live"?"X":"D");st[m.a].e++;st[m.a].pts++;st[m.a].form.push(status==="live"?"X":"D");}
      else{st[m.a].v++;st[m.a].pts+=3;st[m.a].form.push(status==="live"?"X":"W");st[m.h].d++;st[m.h].form.push(status==="live"?"X":"L");}
    }
  });
  return Object.entries(st).map(([nm,s])=>({nm,...s}))
    .sort((a,b)=>b.pts-a.pts||b.sg-a.sg||b.gp-a.gp);
}

// ─── RENDER: CARD ─────────────────────────
function mkCard(m){
  const sc=getSC(m.id);
  const status=mSt(m);
  const isBR=m.br||m.h==="Brazil"||m.a==="Brazil";
  let pill="";
  if(status==="live")pill=`<span class="mc-st ms-live">🔴 ${getMin(m)}</span>`;
  else if(status==="finished")pill='<span class="mc-st ms-done">✓ FIM</span>';
  else pill=`<span class="mc-st ms-up">${m.g}</span>`;
  let mid="";
  if((status==="live"||status==="finished")&&sc&&sc.hs!=null){
    const hw=+sc.hs>+sc.as,aw=+sc.as>+sc.hs;
    mid=`<div class="sc-box"><div class="sc${hw?" win":""}">${sc.hs}</div><div class="sc-d">:</div><div class="sc${aw?" win":""}">${sc.as}</div></div>`;
  }else{mid=`<div class="tt">${m.t}</div>`;}
  const hw2=status==="finished"&&sc&&+sc.hs>+sc.as;
  const aw2=status==="finished"&&sc&&+sc.as>+sc.hs;
  let timerH="";
  if(status==="live"){
    timerH=`<div class="mc-timer"><div class="timer-dot"></div><div class="timer-val">${isHT(m.d,m.t)?"INTERVALO":getMin(m)}</div><div class="timer-bar-wrap"><div class="timer-bar" style="width:${tPct(m)}%"></div></div></div>`;
  }
  return`<div class="mc ${status}${isBR?" br":""}" onclick="openModal('${m.id}')">
  <div class="mc-top"><span class="mc-grp">${m.g}</span>${pill}</div>
  <div class="mc-row">
    <div class="mc-side"><span class="mc-fl">${fl(m.h)}</span><span class="mc-nm${hw2?" win":""}">${pt(m.h)}</span></div>
    ${mid}
    <div class="mc-side r"><span class="mc-fl">${fl(m.a)}</span><span class="mc-nm${aw2?" win":""}">${pt(m.a)}</span></div>
  </div>
  ${timerH}
  <div class="mc-venue">${m.v}</div>
  ${status!=="upcoming"?'<div class="tap-hint">Toque para ver detalhes ↑</div>':""}
</div>`;
}

// ─── RENDER: JOGOS ────────────────────────
function renderJogos(){
  let list=M.slice();
  if(curFilter==="live")list=list.filter(m=>mSt(m)==="live");
  else if(curFilter==="today")list=list.filter(m=>isToday(m.d));
  else if(curFilter==="brazil")list=list.filter(m=>m.br||m.h==="Brazil"||m.a==="Brazil");
  else if(curFilter==="grupos")list=list.filter(m=>m.ph==="grupos");
  else if(curFilter==="oitavas")list=list.filter(m=>m.ph==="oitavas");
  else if(curFilter==="semi")list=list.filter(m=>m.ph==="semi");
  if(!list.length)return'<div class="empty">Nenhum jogo neste filtro</div>';
  const phO=["grupos","oitavas","semi"];
  const phN={grupos:"Fase de Grupos",oitavas:"Fase Eliminatória",semi:"Quartas · Semis · Final"};
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

// ─── RENDER: GRUPOS ───────────────────────
function renderGrupos(){
  const useFD=Object.keys(FD_STANDINGS).length>0;
  let html=`<div style="font-family:'Barlow Condensed',sans-serif;font-size:11px;color:var(--text3);padding:2px 2px 10px">${useFD?'<span style="color:var(--green)">✓ Dados: football-data.org</span>':"Dados locais · 🔴 = parcial ao vivo"}</div>`;
  Object.keys(GROUPS).forEach(gl=>{
    const gmatches=M.filter(m=>m.g===gl&&m.ph==="grupos");
    const played=gmatches.filter(m=>mSt(m)==="finished").length;
    const hasLive=gmatches.some(m=>mSt(m)==="live");
    const flagPrev=GROUPS[gl].map(t=>fl(t)).join("");
    let rows=[];
    if(useFD&&FD_STANDINGS[gl]){
      rows=FD_STANDINGS[gl].map(row=>{
        const localTeam=GROUPS[gl].find(t=>nmMatch(t,row.team))||row.team;
        return{nm:localTeam,j:row.played,v:row.won,e:row.drawn,d:row.lost,gp:row.gf,gc:row.ga,sg:row.gd,pts:row.pts,form:row.form||"",live:false};
      });
    }else{
      rows=calcLocalGroup(gl).map(t=>({...t,form:t.form.join("")}));
    }
    html+=`<div class="grp-card" id="gc-${gl}">
<div class="grp-hdr" onclick="toggleGrp('${gl}')">
  <h3>GRUPO ${gl}</h3><div class="grp-flags">${flagPrev}</div>
  ${hasLive?'<span style="color:var(--live);font-size:10px;font-weight:800;animation:pulse 1.5s infinite;margin-left:4px;font-family:\'Barlow Condensed\',sans-serif">🔴 AO VIVO</span>':""}
  <span style="font-family:'Barlow Condensed',sans-serif;font-size:10px;color:var(--text3);margin-left:6px">${played}/6</span>
  <span class="grp-arrow">▼</span>
</div>
<div class="st-wrap"><table class="st">
<thead><tr><th>Seleção</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th><th>PTS</th><th>Forma</th></tr></thead>
<tbody>`;
    rows.forEach((t,i)=>{
      const pc=i===0?"p1":i===1?"p2":i===2?"p3":"";
      const sgC=t.sg>0?"sg-pos":t.sg<0?"sg-neg":"";
      const formStr=typeof t.form==="string"?t.form:t.form.join("");
      const formH=formStr.slice(-5).split("").map(r=>{
        if(r==="X")return'<div class="fd fd-lv">●</div>';
        return`<div class="fd fd-${r==="W"?"w":r==="D"?"d":"l"}">${r}</div>`;
      }).join("");
      html+=`<tr${t.live?' class="live-row"':""}><td><div class="st-tm"><div class="pos ${pc}">${i+1}</div><div class="st-fl">${fl(t.nm)}</div><div class="st-nm">${pt(t.nm)}</div></div></td><td>${t.j}</td><td>${t.v}</td><td>${t.e}</td><td>${t.d}</td><td>${t.gp}</td><td>${t.gc}</td><td class="${sgC}">${t.sg>0?"+":""}${t.sg}</td><td class="pts-cell">${t.pts}${t.live?'<span style="color:var(--live);font-size:8px"> ●</span>':""}</td><td><div class="form-row">${formH||'<span style="color:var(--text3);font-size:9px">—</span>'}</div></td></tr>`;
    });
    html+=`</tbody></table></div>
<div class="st-legend"><span><span class="ld" style="background:var(--green)"></span>Classificado</span><span><span class="ld" style="background:var(--gold)"></span>Melhor 3º</span><span><span class="ld" style="background:#4B5563"></span>Eliminado</span>${hasLive?'<span><span class="ld" style="background:var(--live)"></span>Parcial ao vivo</span>':""}</div>
<div class="grp-matches" id="gm-${gl}" style="display:none"><div class="gmt">JOGOS DO GRUPO ${gl}</div>`;
    gmatches.forEach(m=>{
      const sc=getSC(m.id);const status=mSt(m);
      let sStr=m.t;
      if(status==="live"&&sc&&sc.hs!=null)sStr=`<span style="color:var(--live)">${sc.hs}–${sc.as} ${getMin(m)}🔴</span>`;
      else if(status==="finished"&&sc&&sc.hs!=null)sStr=`${sc.hs}–${sc.as}`;
      const dt=new Date(m.d+"T12:00:00");
      html+=`<div class="gm-row" onclick="openModal('${m.id}')"><div class="gm-home">${fl(m.h)}<span class="gm-hn">${pt(m.h)}</span></div><div class="gm-score">${sStr}</div><div class="gm-away"><span class="gm-an">${pt(m.a)}</span>${fl(m.a)}</div><div class="gm-dt">${dt.getDate()}/${dt.getMonth()+1}</div></div>`;
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

// ─── MODAL ────────────────────────────────
async function openModal(id){
  const m=M.find(x=>x.id===id);if(!m)return;
  modalMatchId=id;
  document.getElementById("modalOverlay").classList.add("on");
  document.body.style.overflow="hidden";
  document.getElementById("modalContent").innerHTML=buildModalShell(m,null);
  startModalTimer(m);
  if(mSt(m)!=="upcoming"){
    const sc=getSC(m.id);
    const detail=await fetchFDMatchDetail(sc?.fdId);
    if(modalMatchId===id){
      document.getElementById("modalContent").innerHTML=buildModalShell(m,detail);
      startModalTimer(m);
    }
  }
}
function buildModalShell(m,detail){
  const sc=getSC(m.id);const status=mSt(m);
  const hw=sc&&+sc.hs>+sc.as,aw=sc&&+sc.as>+sc.hs;
  let scoreCenter="";
  if((status==="live"||status==="finished")&&sc&&sc.hs!=null){
    scoreCenter=`<div class="mt-score-box"><div class="mt-sc${hw?" win":""}">${sc.hs}</div><div class="mt-sc-d">:</div><div class="mt-sc${aw?" win":""}">${sc.as}</div></div>`;
  }else{scoreCenter=`<div class="mt-sc-time">${m.t}</div>`;}
  let liveBar="";
  if(status==="live"){
    liveBar=`<div class="modal-timer-bar"><div class="td"></div><div class="tv" id="mtv">${isHT(m.d,m.t)?"INTERVALO":getMin(m)}</div><div class="tbw"><div class="tb" id="mtb" style="width:${tPct(m)}%"></div></div><div class="tp">/ 90'</div></div>`;
  }
  const dt=new Date(m.d+"T12:00:00");
  const wd=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  const mo=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago"];
  const dStr=`${wd[dt.getDay()]}, ${dt.getDate()} ${mo[dt.getMonth()]}`;
  let bodyHTML="";
  if(status==="upcoming")bodyHTML='<div class="no-data">⏳ Jogo ainda não iniciado</div>';
  else if(!detail)bodyHTML='<div class="no-data">📡 Detalhes via football-data.org<br><span style="font-size:10px">Disponíveis após o apito final</span></div>';
  else bodyHTML=buildDetailBody(m,sc,detail);
  return`<div class="modal-hdr">
  <div class="modal-title">⚽ ${m.g} · ${dStr} · ${m.t}</div>
  <div class="modal-teams">
    <div class="mt-side"><div class="mt-fl">${fl(m.h)}</div><div class="mt-nm">${pt(m.h)}</div></div>
    ${scoreCenter}
    <div class="mt-side"><div class="mt-fl">${fl(m.a)}</div><div class="mt-nm">${pt(m.a)}</div></div>
  </div>
</div>${liveBar}
<div class="modal-body">
  <div class="modal-venue"><div><div class="mv-txt">${m.v.split(",")[0]}</div><div class="mv-sub">${m.v.split(",").slice(1).join(",").trim()}</div></div></div>
  <div class="modal-info">
    <div class="mi"><div class="mi-val">${dStr.split(",")[1]?.trim()||dStr}</div><div class="mi-lbl">Data</div></div>
    <div class="mi"><div class="mi-val">${m.t}</div><div class="mi-lbl">Horário (Brasília)</div></div>
  </div>${bodyHTML}
</div>`;
}
function buildDetailBody(m,sc,detail){
  let html="";
  const goals=detail.goals||[];
  const bookings=detail.bookings||[];
  const subs=detail.substitutions||[];
  if(goals.length){
    html+='<div class="modal-sec"><div class="modal-sec-title">⚽ Gols</div>';
    goals.forEach(g=>{
      const isHome=nmMatch(m.h,g.team?.name||"");
      const isOG=(g.type||"").toLowerCase().includes("own_goal");
      const isPen=(g.type||"").toLowerCase().includes("penalty");
      html+=`<div class="ev-row"><div class="ev-min">${g.minute}'${g.injuryTime?"+"+g.injuryTime:""}</div><div class="ev-icon">${isOG?"🔴":isPen?"🎯":"⚽"}</div><div class="ev-name">${g.scorer?.name||"—"}${isOG?' <span style="color:var(--live);font-size:9px">(contra)</span>':""}${isPen?' <span style="color:var(--text3);font-size:9px">(pen)</span>':""}</div><div class="ev-team">${isHome?fl(m.h):fl(m.a)}</div></div>`;
    });
    html+="</div>";
  }else if(sc&&(+sc.hs>0||+sc.as>0)){
    html+='<div class="modal-sec"><div class="modal-sec-title">⚽ Gols</div><div class="no-data" style="font-size:11px">Marcadores não disponíveis</div></div>';
  }
  if(bookings.length){
    html+='<div class="modal-sec"><div class="modal-sec-title">🟨 Cartões</div>';
    bookings.forEach(b=>{
      const isHome=nmMatch(m.h,b.team?.name||"");
      const isRed=(b.card||"").toLowerCase().includes("red");
      html+=`<div class="ev-row"><div class="ev-min">${b.minute}'${b.injuryTime?"+"+b.injuryTime:""}</div><div class="ev-icon">${isRed?"🟥":"🟨"}</div><div class="ev-name">${b.player?.name||"—"}</div><div class="ev-team">${isHome?fl(m.h):fl(m.a)}</div></div>`;
    });
    html+="</div>";
  }
  if(subs.length){
    html+='<div class="modal-sec"><div class="modal-sec-title">🔄 Substituições</div>';
    subs.forEach(s=>{
      const isHome=nmMatch(m.h,s.team?.name||"");
      html+=`<div class="ev-row"><div class="ev-min">${s.minute}'</div><div class="ev-icon">🔄</div><div class="ev-name"><span style="color:var(--green)">▲</span> ${s.playerIn?.name||"—"} / <span style="color:var(--live)">▼</span> ${s.playerOut?.name||"—"}</div><div class="ev-team">${isHome?fl(m.h):fl(m.a)}</div></div>`;
    });
    html+="</div>";
  }
  const hSt=detail.homeTeam?.statistics||{};
  const aSt=detail.awayTeam?.statistics||{};
  const stats=[
    {l:"Posse de Bola",h:hSt.ballPossession,a:aSt.ballPossession,u:"%"},
    {l:"Chutes a Gol",h:hSt.shotsOnGoal,a:aSt.shotsOnGoal},
    {l:"Total Chutes",h:hSt.totalShots,a:aSt.totalShots},
    {l:"Escanteios",h:hSt.cornerKicks,a:aSt.cornerKicks},
    {l:"Faltas",h:hSt.fouls,a:aSt.fouls},
    {l:"Impedimentos",h:hSt.offsides,a:aSt.offsides},
    {l:"Defesas",h:hSt.goalKeeperSaves,a:aSt.goalKeeperSaves},
  ].filter(s=>s.h!=null||s.a!=null);
  if(stats.length){
    html+='<div class="modal-sec"><div class="modal-sec-title">📊 Estatísticas</div>';
    stats.forEach(s=>{
      const hv=+(s.h||0),av=+(s.a||0),tot=hv+av||1;
      const hpct=Math.round(hv/tot*100);
      html+=`<div class="stat-cmp"><div class="stat-cmp-row"><span>${hv}${s.u||""}</span><span>${s.l}</span><span>${av}${s.u||""}</span></div><div class="stat-cmp-bars"><div class="stat-bar-h" style="flex:${hpct}"></div><div class="stat-bar-a" style="flex:${100-hpct}"></div></div></div>`;
    });
    html+="</div>";
  }
  if(!goals.length&&!bookings.length&&!subs.length&&!stats.length){
    html+='<div class="no-data">📡 Detalhes indisponíveis<br><span style="font-size:10px">Dados aparecem após o apito final</span></div>';
  }
  return html;
}
function startModalTimer(m){
  if(modalTimerInt)clearInterval(modalTimerInt);
  if(mSt(m)!=="live")return;
  modalTimerInt=setInterval(()=>{
    const tv=document.getElementById("mtv");
    const tb=document.getElementById("mtb");
    if(tv)tv.textContent=isHT(m.d,m.t)?"INTERVALO":getMin(m);
    if(tb)tb.style.width=tPct(m)+"%";
  },1000);
}
function closeModal(e){
  if(e&&e.target!==document.getElementById("modalOverlay"))return;
  document.getElementById("modalOverlay").classList.remove("on");
  document.body.style.overflow="";
  modalMatchId=null;
  if(modalTimerInt){clearInterval(modalTimerInt);modalTimerInt=null;}
}
let tY=0;
document.getElementById("modalBox").addEventListener("touchstart",e=>{tY=e.touches[0].clientY;},{passive:true});
document.getElementById("modalBox").addEventListener("touchmove",e=>{
  if(e.touches[0].clientY-tY>70){document.getElementById("modalOverlay").classList.remove("on");document.body.style.overflow="";}
},{passive:true});

// ─── RENDER: STATS ────────────────────────
function renderStats(){
  const played=M.filter(m=>mSt(m)==="finished").length;
  const lc=liveCount();
  let totalG=0;
  M.forEach(m=>{
    const s=getSC(m.id);
    if(mSt(m)==="finished"&&s&&s.hs!=null)totalG+=+s.hs+ +s.as;
  });
  const avg=played>0?(totalG/played).toFixed(1):"—";
  const pct=Math.round(played/104*100);
  let teamStats=[];
  Object.keys(GROUPS).forEach(gl=>{
    if(fdOk&&FD_STANDINGS[gl]){
      FD_STANDINGS[gl].forEach(row=>{
        const localT=GROUPS[gl].find(t=>nmMatch(t,row.team))||row.team;
        if(row.played>0)teamStats.push({nm:localT,gp:row.gf,gc:row.ga,sg:row.gd,j:row.played,pts:row.pts});
      });
    }else{
      calcLocalGroup(gl).forEach(t=>{if(t.j>0)teamStats.push({nm:t.nm,gp:t.gp,gc:t.gc,sg:t.sg,j:t.j,pts:t.pts});});
    }
  });
  const topAtk=[...teamStats].sort((a,b)=>b.gp-a.gp).slice(0,10);
  const topDef=[...teamStats].filter(t=>t.j>0).sort((a,b)=>a.gc-b.gc||b.j-a.j).slice(0,10);
  const maxGP=topAtk[0]?.gp||1;
  let scorersH=FD_SCORERS.length
    ?FD_SCORERS.slice(0,15).map((s,i)=>{
      const tn=s.team?.name||"";
      const fKey=Object.keys(FL).find(k=>nmMatch(k,tn));
      const flag=fKey?fl(fKey):"🏳️";
      const tKey=Object.keys(PT).find(k=>nmMatch(k,tn));
      const teamPT=tKey?pt(tKey):tn;
      return`<div class="li"><div class="li-rk${i<3?" top":""}">${i+1}</div><div class="li-fl">${flag}</div><div class="li-inf"><div class="li-nm">${s.player?.name||"—"}</div><div class="li-sb">${teamPT}${s.assists!=null?" · "+s.assists+" assist.":""}${s.penalties!=null?" · "+s.penalties+" pen.":""}</div></div><div class="li-val">${s.goals??"—"} ⚽</div></div>`;
    }).join("")
    :'<div class="no-data">Aguardando dados da API · <span style="color:var(--gold)">football-data.org</span></div>';
  const atkH=topAtk.length
    ?topAtk.map((t,i)=>`<div class="li"><div class="li-rk${i<3?" top":""}">${i+1}</div><div class="li-fl">${fl(t.nm)}</div><div class="li-inf"><div class="li-nm">${pt(t.nm)}</div><div class="li-sb">${t.j} jogo(s) · SG ${t.sg>0?"+":""}${t.sg}</div><div class="li-bar-wrap" style="margin-top:4px"><div class="li-bar" style="width:${Math.round(t.gp/maxGP*100)}%"></div></div></div><div class="li-val">${t.gp}</div></div>`).join("")
    :'<div class="empty">Aguardando jogos</div>';
  const defH=topDef.length
    ?topDef.map((t,i)=>`<div class="li"><div class="li-rk${i<3?" top":""}">${i+1}</div><div class="li-fl">${fl(t.nm)}</div><div class="li-inf"><div class="li-nm">${pt(t.nm)}</div><div class="li-sb">${t.j} jogo(s) · GP ${t.gp}</div></div><div class="li-val" style="color:var(--green)">${t.gc}</div></div>`).join("")
    :'<div class="empty">Aguardando jogos</div>';
  return`
<div class="kpi-grid">
  <div class="kpi"><div class="kpi-n">${played}</div><div class="kpi-l">Jogos realizados</div></div>
  <div class="kpi"><div class="kpi-n" style="color:${lc?"var(--live)":"var(--gold)"}">${lc}</div><div class="kpi-l" style="color:${lc?"var(--live)":""}">Ao vivo agora</div></div>
  <div class="kpi"><div class="kpi-n">${totalG}</div><div class="kpi-l">Total de gols</div></div>
  <div class="kpi"><div class="kpi-n">${avg}</div><div class="kpi-l">Média gols/jogo</div></div>
  <div class="kpi wide">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px">
      <div class="kpi-l" style="margin:0">Progresso ${fdOk?'· <span style="color:var(--green)">✓ football-data.org</span>':"· dados locais"}</div>
      <span style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--gold)">${played}/104</span>
    </div>
    <div class="prog-bar"><div class="prog-fill" style="width:${pct}%"></div></div>
    <div class="kpi-sub">${pct}% concluído · Copa: 11 Jun – 19 Jul 2026</div>
  </div>
</div>
<div class="list-blk">
  <div class="lb-hdr"><span class="lhi">⚽</span><h3>ARTILHEIROS</h3><span class="api-src">${FD_SCORERS.length?"✓ football-data.org":"aguardando..."}</span></div>
  ${scorersH}
</div>
<div class="list-blk">
  <div class="lb-hdr"><span class="lhi">🥅</span><h3>GOLS POR SELEÇÃO</h3><span class="api-src">${fdOk?"✓ fd.org":"local"}</span></div>
  ${atkH}
</div>
<div class="list-blk">
  <div class="lb-hdr"><span class="lhi">🛡️</span><h3>MENOS GOLS SOFRIDOS</h3><span class="api-src">${fdOk?"✓ fd.org":"local"}</span></div>
  ${defH}
</div>
<div class="list-blk">
  <div class="lb-hdr"><span class="lhi">🟨</span><h3>CARTÕES &amp; DISCIPLINA</h3></div>
  <div style="padding:12px 14px;font-family:'Barlow Condensed',sans-serif;font-size:12px;color:var(--text3);line-height:1.9">
    Cartões disponíveis no <strong style="color:var(--gold)">detalhe de cada jogo</strong>.<br>
    🟨 2 amarelos = suspensão · 🟥 Vermelho = próximo jogo<br>
    Fonte: <a href="https://football-data.org" target="_blank" style="color:var(--gold)">football-data.org</a>
  </div>
</div>
<div class="list-blk">
  <div class="lb-hdr"><span class="lhi">📋</span><h3>SOBRE O TORNEIO</h3></div>
  <table class="info-tbl">
    <tr><td>Edição</td><td>23ª Copa do Mundo FIFA</td></tr>
    <tr><td>Países sede</td><td>🇺🇸 EUA · 🇨🇦 Canadá · 🇲🇽 México</td></tr>
    <tr><td>Seleções</td><td>48 · 12 grupos de 4</td></tr>
    <tr><td>Total de jogos</td><td>104</td></tr>
    <tr><td>Abertura</td><td>11 Jun · Cidade do México</td></tr>
    <tr><td>Final</td><td>19 Jul · MetLife, Nova York</td></tr>
    <tr><td>🇧🇷 Brasil — Grupo C</td><td>🇧🇷🇲🇦🇭🇹🏴󠁧󠁢󠁳󠁣󠁴󠁿</td></tr>
    <tr><td>Criado por</td><td style="color:var(--gold)">Pscheidt</td></tr>
  </table>
</div>
<div class="src">Stats: <a href="https://football-data.org">football-data.org</a></div>`;
}

// ─── PAGE CONTROL ─────────────────────────
function goPage(pg){
  curPage=pg;
  document.querySelectorAll(".pg").forEach(el=>el.classList.remove("on"));
  document.getElementById("pg-"+pg).classList.add("on");
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
  document.getElementById("nav-"+pg).classList.add("active");
  document.getElementById("tabBar").style.display=pg==="jogos"?"flex":"none";
  render();
}
function setFilter(fi){
  curFilter=fi;
  const fs=["all","live","today","brazil","grupos","oitavas","semi"];
  document.querySelectorAll(".tab").forEach((t,i)=>t.classList.toggle("on",fs[i]===fi));
  render();
}
function render(){
  const lc=liveCount();
  document.getElementById("livePill").classList.toggle("on",lc>0);
  document.getElementById("apiWarn").classList.toggle("on",!fdOk);
  if(curPage==="jogos")document.getElementById("jogosBody").innerHTML=renderJogos();
  if(curPage==="grupos")document.getElementById("gruposBody").innerHTML=renderGrupos();
  if(curPage==="stats")document.getElementById("statsBody").innerHTML=renderStats();
}

// ─── MAIN ─────────────────────────────────
async function loadAll(){
  const btn=document.getElementById("refreshBtn");
  btn.classList.add("spin");
  await Promise.all([fetchFDMatches(),fetchFDStandings(),fetchFDScorers()]);
  render();
  const now=new Date();
  const src=fdOk?"✓ football-data.org":"⚠ dados locais";
  document.getElementById("updLbl").textContent=`${src} · ${now.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}`;
  btn.classList.remove("spin");
}
function scheduleRefresh(){
  const delay=liveCount()>0?60000:300000;
  setTimeout(()=>{loadAll().then(scheduleRefresh);},delay);
}
loadAll().then(scheduleRefresh);
