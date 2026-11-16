import { CONFIG } from "./config.js";
const FB="https://www.gstatic.com/firebasejs/10.12.2/";
let initializeApp, getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut, onAuthStateChanged, getFirestore, collection, doc, onSnapshot, setDoc, deleteDoc, writeBatch, getDoc, getDocs, updateDoc;

/* ================= PILLARS, PROGRAMMES, FIELDS ================= */
const SOLAR_ST = ["Site Visit","Pending Proposal","Pending Approval Memo","Approved","Ongoing","Completed"];
const HOUSE_ST = ["Application received","Approved","Vendor appointed","Under construction","Completed"];
const GEN_ST = ["Planning","Approved","Ongoing","Completed"];
const SVAR = {"Site Visit":"--s-visit","Pending Proposal":"--s-proposal","Pending Approval Memo":"--s-memo","Approved":"--s-approved","Ongoing":"--s-ongoing","Completed":"--s-done",
  "Application received":"--s-proposal","Vendor appointed":"--s-vendor","Under construction":"--s-ongoing","Planning":"--s-proposal"};
const STAGES = [["pipeline","In pipeline","--s-proposal"],["approved","Approved","--s-approved"],["progress","In progress","--s-ongoing"],["done","Completed","--s-done"]];
const STAGE_OF = {"Site Visit":"pipeline","Pending Proposal":"pipeline","Pending Approval Memo":"pipeline","Application received":"pipeline","Planning":"pipeline",
  "Approved":"approved","Vendor appointed":"approved","Ongoing":"progress","Under construction":"progress","Completed":"done"};
const TYPES = ["Solar Rooftop","Solar Streetlight","Rooftop + Streetlight","Other"];
const STATES = ["Johor","Kedah","Kelantan","Malacca","Negeri Sembilan","Pahang","Perak","Perlis","Penang","Sabah","Sarawak","Selangor","Terengganu","W.P. Kuala Lumpur","W.P. Labuan","W.P. Putrajaya","Nationwide"];
const COMPONENTS = ["Komuniti Lestari","Tree for a Tree","Pulau Tenaga Hijau","Biodiversity","Firefly Conservation","Extinction Species"];
const YEARS = [2023,2024,2025,2026,2027,2028,2029,2030];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const PEN=[[1.2,99.6],[6.8,104.6]], ALL=[[0.8,99.6],[7.4,119.3]];

const PILLARS = [["env","Environment"],["eco","Economic Social"],["edu","Education"],["wakalah","Wakalah"],["sports","Sports"]];
const f = (k,label,t="text",o={}) => ({k,label,t,...o});
const STATUS=f("status","Status","status"), STATE=f("state","State","sel",{opts:STATES}), YEAR=f("year","Year","year"), DISTRICT=f("district","District"), REMARKS=f("remarks","Remarks","area",{full:1});
const PAYMENT=f("payment","Payment","sel",{opts:["Not Paid","Paid"],def:"Not Paid",flag:"Paid"});
const ENV_TAIL=[f("month","Month","sel",{opts:MONTHS}),f("appDate","Application received","date"),f("completionDate","Completion date","date"),
  f("invoice","Invoice","sel",{opts:["Not Received","Received"],def:"Not Received",flag:"Received"}),PAYMENT,f("nposNo","NPOS payment no."),f("nposDate","NPOS payment date","date"),REMARKS];
const SCHOOL_HEAD=nm=>[f("name",nm,"text",{full:1,req:1}),f("school","School","text",{full:1}),STATUS,STATE,DISTRICT,YEAR];
const HOUSE_FIELDS=[f("name","Recipient","text",{full:1,req:1}),STATUS,STATE,DISTRICT,f("postcode","Postcode"),YEAR,f("address","Address","area",{full:1}),
  f("agency","Applying agency"),f("fund","Fund (DANA)","sel",{opts:["Wakalah","CSR"]}),f("appDate","Memo / application date","date"),f("memoRef","Approval reference"),
  f("amountRequested","Amount requested (RM)","money"),f("value","Approved amount (RM)","money"),f("vendor","Vendor"),f("contractValue","Contract value (RM)","money"),
  f("appointedDate","Vendor appointed","date"),f("startDate","Construction start","date"),f("endDate","Construction end","date"),f("progress","Build progress (%)","pct"),
  PAYMENT,f("paymentDate","Payment date","date"),
  f("docs","Documents received","checks",{full:1,keys:[["photo","House photo"],["asnafLetter","Asnaf letter"],["eKasih","eKasih"],["landTitle","Land title / grant"]]}),
  f("description","Background","area",{full:1}),REMARKS];

const PROGRAMMES = [
  { id:"solar", pillar:"env", name:"Solar Rooftop & Streetlight", short:"Solar", unit:["project","projects"], statuses:SOLAR_ST, valueLabel:"Project value",
    blurb:"Solar rooftop and streetlight projects across Malaysia.",
    fields:[f("name","Project name","text",{full:1,req:1}),f("type","Project type","sel",{opts:TYPES.slice(0,3),def:"Solar Rooftop"}),f("component","Component","sel",{opts:COMPONENTS,def:"Komuniti Lestari"}),STATUS,STATE,YEAR,
      f("value","Project value (RM)","money"),f("kwp","Capacity (kWp)","num"),f("units","Streetlight units","num"),...ENV_TAIL] },
  { id:"tree", pillar:"env", name:"Tree for a Tree", short:"Tree for a Tree", unit:["project","projects"], statuses:SOLAR_ST, valueLabel:"Project value", fixed:{component:"Tree for a Tree",type:"Other"},
    blurb:"Tree planting projects.",
    fields:[f("name","Project name","text",{full:1,req:1}),STATUS,STATE,DISTRICT,YEAR,f("value","Project value (RM)","money"),f("trees","Trees planted","num"),f("partner","Partner / agency"),...ENV_TAIL] },
  { id:"env-other", pillar:"env", name:"Other environment projects", short:"Other", unit:["project","projects"], statuses:SOLAR_ST, valueLabel:"Project value", fixed:{type:"Other"},
    blurb:"Biodiversity, firefly, Pulau Tenaga Hijau and other environment projects.",
    fields:[f("name","Project name","text",{full:1,req:1}),f("component","Component","sel",{opts:COMPONENTS}),STATUS,STATE,YEAR,f("value","Project value (RM)","money"),...ENV_TAIL] },
  { id:"vehicle", pillar:"eco", name:"Sumbangan Kenderaan Terpakai", short:"Kenderaan Terpakai", unit:["donation","donations"], statuses:GEN_ST, valueLabel:"Value",
    blurb:"Used TNB vehicles donated to community organisations.",
    fields:[f("name","Donation name","text",{full:1,req:1}),f("recipient","Recipient organisation","text",{full:1}),STATUS,STATE,DISTRICT,YEAR,
      f("vehicleType","Vehicle type"),f("vehicles","Number of vehicles","num"),f("value","Value (RM)","money"),f("appDate","Request received","date"),f("handoverDate","Handover date","date"),PAYMENT,REMARKS] },
  { id:"ceria", pillar:"edu", name:"Ceria Ke Sekolah", short:"Ceria Ke Sekolah", unit:["school","schools"], statuses:GEN_ST, valueLabel:"Value",
    blurb:"School essentials for pupils from low-income families.",
    fields:[...SCHOOL_HEAD("Programme name"),f("students","Students reached","num"),f("value","Value (RM)","money"),f("appDate","Request received","date"),f("eventDate","Programme date","date"),PAYMENT,REMARKS] },
  { id:"jek", pillar:"edu", name:"Sekolah Angkat JEK", short:"Sekolah Angkat JEK", unit:["school","schools"], statuses:GEN_ST, valueLabel:"Value",
    blurb:"Schools adopted under the JEK programme.",
    fields:[...SCHOOL_HEAD("Programme name"),f("students","Students reached","num"),f("value","Value (RM)","money"),f("appDate","Request received","date"),f("startDate","Start date","date"),f("completionDate","Completion date","date"),PAYMENT,REMARKS] },
  { id:"pbj", pillar:"wakalah", name:"Projek Baiti Jannati (PBJ)", short:"PBJ", unit:["house","houses"], statuses:HOUSE_ST, valueLabel:"Approved amount",
    blurb:"Houses built or repaired for asnaf families.", fields:HOUSE_FIELDS },
  { id:"pmr", pillar:"wakalah", name:"Perumahan Mesra Rakyat (PMR)", short:"PMR", unit:["house","houses"], statuses:HOUSE_ST, valueLabel:"Approved amount",
    blurb:"Perumahan Mesra Rakyat houses.", fields:HOUSE_FIELDS },
  { id:"hoki", pillar:"sports", name:"Sekolah Hoki Angkat TNB", short:"Sekolah Hoki Angkat", unit:["school","schools"], statuses:GEN_ST, valueLabel:"Value",
    blurb:"Schools adopted for TNB's hockey development programme.",
    fields:[...SCHOOL_HEAD("Programme name"),f("players","Players","num"),f("coach","Coach"),f("value","Value (RM)","money"),f("appDate","Request received","date"),f("completionDate","Completion date","date"),PAYMENT,REMARKS] },
];
const PROG = Object.fromEntries(PROGRAMMES.map(p=>[p.id,p]));
const PILLAR_NAME = Object.fromEntries(PILLARS);
const programmeOf = p => PROG[p.programme] ? p.programme : (p.type && p.type!=="Other" ? "solar" : p.component==="Tree for a Tree" ? "tree" : "env-other");
const progOf = p => PROG[programmeOf(p)];

const S = { projects:new Map(), year:String(Math.min(2030,Math.max(2023,new Date().getFullYear()))), pillar:"", prog:"", type:"", status:"", state:"", comp:"", q:"", sel:null, editing:null, confirmDel:false, pick:false, canWrite:false, user:null, loaded:false };
const PH={ for:null, unsub:null, list:[], loading:false, open:null, busy:0 };
try{ const v=JSON.parse(localStorage.getItem("csr-view")||"{}"); if(v.pillar!=null) S.pillar=v.pillar; if(v.prog!=null) S.prog=v.prog; if(v.type!=null) S.type=v.type; const y=localStorage.getItem("csr-year"); if(y!==null) S.year=y; }catch(e){}
if(S.prog && !PROG[S.prog]) S.prog=""; if(S.pillar && !PILLAR_NAME[S.pillar]) S.pillar="";
const saveView=()=>{ try{ localStorage.setItem("csr-view",JSON.stringify({pillar:S.pillar,prog:S.prog,type:S.type})); }catch(e){} };
const projYear = p => p.year ? +p.year : (p.appDate ? +String(p.appDate).slice(0,4) : null);

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rm = v => v==null||v==="" ? "—" : "RM " + Number(v).toLocaleString("en-MY",{maximumFractionDigits:0});
const rmShort = v => { v=+v||0; return v>=1e6 ? "RM "+(v/1e6).toFixed(2)+"M" : v>=1e3 ? "RM "+Math.round(v/1e3)+"k" : "RM "+Math.round(v); };
const fmtDate = d => { if(!d) return "—"; const x=new Date(d+"T00:00:00"); return isNaN(x)?d:x.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}); };
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const sc = s => `var(${SVAR[s]||"--muted"})`;
const scHex = s => css(SVAR[s]||"--muted");
const stageVar = st => (STAGES.find(x=>x[0]===st)||[])[2]||"--muted";
const sum = (rows,k) => rows.reduce((a,p)=>a+(+p[k]||0),0);
const plural = (n,u) => `${n} ${n===1?u[0]:u[1]}`;
function toast(m){ const t=$("toast"); t.textContent=m; t.hidden=false; clearTimeout(toast._t); toast._t=setTimeout(()=>t.hidden=true,3200); }
function gmaps(p){ return p.lat!=null ? `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([p.address||p.school||p.name,p.district,p.state,"Malaysia"].filter(Boolean).join(", "))}`; }

/* the programmes the current view covers */
function viewProgs(){ if(S.prog) return [PROG[S.prog]]; return PROGRAMMES.filter(p=>!S.pillar||p.pillar===S.pillar); }
const single = () => viewProgs().length===1 ? viewProgs()[0] : null;
function viewUnit(){ const u=[...new Set(viewProgs().map(p=>p.unit[1]))]; return u.length===1 ? viewProgs()[0].unit : ["project","projects"]; }
function typeMatch(p){ if(S.prog!=="solar"||!S.type) return true; if(S.type==="rooftop") return p.type==="Solar Rooftop"||p.type==="Rooftop + Streetlight"; return p.type==="Solar Streetlight"||p.type==="Rooftop + Streetlight"; }
function statusMatch(p){ if(!S.status) return true; return single() ? p.status===S.status : STAGE_OF[p.status]===S.status; }
const inYear = p => !S.year || projYear(p)===+S.year;
function filtered(ignoreStatus){
  const q=S.q.trim().toLowerCase(), ids=new Set(viewProgs().map(p=>p.id));
  return [...S.projects.values()].filter(p=>{
    if(!ids.has(programmeOf(p)) || !typeMatch(p) || !inYear(p)) return false;
    if(S.state && p.state!==S.state) return false;
    if(S.comp && p.component!==S.comp) return false;
    if(!ignoreStatus && !statusMatch(p)) return false;
    if(q && ![p.name,p.remarks,p.state,p.district,p.recipient,p.agency,p.school,p.vendor,p.address,p.component].join(" ").toLowerCase().includes(q)) return false;
    return true;
  }).sort((a,b)=>PROGRAMMES.indexOf(progOf(a))-PROGRAMMES.indexOf(progOf(b)) || (a.no||9999)-(b.no||9999) || String(a.name).localeCompare(String(b.name)));
}

/* ================= MAP (Leaflet + OpenStreetMap, or Google Maps if a key is set) ================= */
const SHAPES = {
  rooftop:"M -7,0 a 7,7 0 1,0 14,0 a 7,7 0 1,0 -14,0",
  street:"M 0,-8.5 8.5,0 0,8.5 -8.5,0 z",
  both:"M -7,0 A 7 7 0 1 1 0,7 L -7,7 z",
  dot:"M -5,0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0",
  house:"M 0,-8.5 L 8.5,-1 L 6,-1 L 6,7.5 L -6,7.5 L -6,-1 L -8.5,-1 z",
  school:"M -6.5,-6.5 h 13 v 13 h -13 z",
  tree:"M 0,-8.5 L 8,6.5 L -8,6.5 z",
  vehicle:"M -8.5,-4.5 h 17 v 9 h -17 z",
};
function shapeOf(p){
  const id=programmeOf(p);
  if(id==="solar") return {"Solar Streetlight":"street","Rooftop + Streetlight":"both"}[p.type]||"rooftop";
  return {tree:"tree","env-other":"dot",vehicle:"vehicle",ceria:"school",jek:"school",hoki:"school",pbj:"house",pmr:"house"}[id]||"dot";
}
function pinSvg(shape,color,approx,sel,size=20){
  const ring = approx ? `<circle r="10.5" fill="none" stroke="${color}" stroke-width="1.4" stroke-dasharray="2.2 2"/>` : "";
  return `<svg class="pin-svg" width="${size}" height="${size}" viewBox="-12 -12 24 24" aria-hidden="true">${ring}<path d="${SHAPES[shape]}" fill="${color}" stroke="${sel?"var(--fg)":"var(--surface)"}" stroke-width="${sel?3:2}" stroke-linejoin="round"/></svg>`;
}
const M = { markers:new Map(), pickMarker:null, clickCb:null };
async function initMap(){
  if(CONFIG.googleMapsKey){
    try{ await loadGoogle(CONFIG.googleMapsKey); return initGoogle(); }
    catch(e){ console.warn("Google Maps failed, using OpenStreetMap", e); toast("Google Maps couldn’t load. Showing the free map instead."); }
  }
  if(window.L) initLeaflet();
}
function loadGoogle(key){
  return new Promise((res,rej)=>{
    window.__gmReady=res; window.gm_authFailure=()=>rej(new Error("Maps key rejected"));
    const s=document.createElement("script");
    s.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&callback=__gmReady&v=weekly&loading=async`;
    s.async=true; s.onerror=rej; document.head.appendChild(s);
    setTimeout(()=>rej(new Error("timeout")),15000);
  });
}
function initGoogle(){
  const g=google.maps;
  const map=new g.Map($("map"),{ mapTypeId:"roadmap", mapTypeControl:true, mapTypeControlOptions:{mapTypeIds:["roadmap","hybrid"]}, streetViewControl:true, fullscreenControl:true, clickableIcons:false, gestureHandling:"greedy" });
  const toB=b=>new g.LatLngBounds({lat:b[0][0],lng:b[0][1]},{lat:b[1][0],lng:b[1][1]});
  map.fitBounds(toB(PEN));
  map.addListener("click",e=>M.clickCb&&M.clickCb(e.latLng.lat(),e.latLng.lng()));
  Object.assign(M,{
    kind:"google",
    fit:b=>map.fitBounds(toB(b)),
    flyTo:(lat,lng,z)=>{ map.panTo({lat,lng}); if(map.getZoom()<z) map.setZoom(z); },
    upsert(id,p,sel,onClick){
      const icon={ path:SHAPES[shapeOf(p)], fillColor:scHex(p.status), fillOpacity:p.locVerified?1:.75, strokeColor:sel?"#111":(p.locVerified?"#fff":scHex(p.status)), strokeWeight:sel?3:2, scale:sel?1.35:1, anchor:new g.Point(0,0) };
      let m=M.markers.get(id);
      if(!m){ m=new g.Marker({map,position:{lat:p.lat,lng:p.lng},icon,title:p.name}); m.addListener("click",()=>m._click()); M.markers.set(id,m); }
      else { m.setPosition({lat:p.lat,lng:p.lng}); m.setIcon(icon); m.setTitle(p.name); }
      m.setZIndex(sel?1000:1); m._click=onClick;
    },
    remove(id){ const m=M.markers.get(id); if(m){ m.setMap(null); M.markers.delete(id);} },
    ids:()=>[...M.markers.keys()],
    setPick(lat,lng){ if(M.pickMarker) M.pickMarker.setMap(null); M.pickMarker = lat==null?null:new g.Marker({map,position:{lat,lng},zIndex:2000}); },
    picking(on){ map.setOptions({draggableCursor:on?"crosshair":null}); }
  });
}
function initLeaflet(){
  const map=L.map("map",{zoomControl:true,minZoom:5,maxZoom:19,zoomSnap:.25});
  const osm=L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap contributors"}).addTo(map);
  const sat=L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:19,attribution:"Imagery © Esri"});
  L.control.layers({"Street map":osm,"Satellite":sat},null,{position:"topleft"}).addTo(map);
  map.fitBounds(PEN);
  map.on("click",e=>M.clickCb&&M.clickCb(e.latlng.lat,e.latlng.lng));
  Object.assign(M,{
    kind:"leaflet",
    fit:b=>map.flyToBounds(b,{duration:.5}),
    flyTo:(lat,lng,z)=>map.flyTo([lat,lng],Math.max(map.getZoom(),z),{duration:.5}),
    upsert(id,p,sel,onClick){
      const key=`${shapeOf(p)}|${p.status}|${p.locVerified?1:0}|${sel?1:0}`;
      let m=M.markers.get(id);
      const icon=()=>L.divIcon({className:"",html:pinSvg(shapeOf(p),sc(p.status),!p.locVerified,sel,sel?26:20),iconSize:sel?[26,26]:[20,20],iconAnchor:sel?[13,13]:[10,10]});
      if(!m){ m=L.marker([p.lat,p.lng],{icon:icon(),title:p.name}).addTo(map); m.on("click",()=>m._click()); M.markers.set(id,m); }
      else { m.setLatLng([p.lat,p.lng]); if(m._key!==key) m.setIcon(icon()); }
      m._key=key; m.setZIndexOffset(sel?1000:0); m._click=onClick;
    },
    remove(id){ const m=M.markers.get(id); if(m){ map.removeLayer(m); M.markers.delete(id);} },
    ids:()=>[...M.markers.keys()],
    setPick(lat,lng){ if(M.pickMarker) map.removeLayer(M.pickMarker); M.pickMarker = lat==null?null:L.circleMarker([lat,lng],{radius:10,color:css("--accent"),weight:3,fillOpacity:.2}).addTo(map); },
    picking(on){ map.getContainer().classList.toggle("picking",on); }
  });
}
M.clickCb=(lat,lng)=>{
  if(!S.pick) return;
  lat=+lat.toFixed(6); lng=+lng.toFixed(6);
  const fm=$("editForm"); if(fm){ fm.elements.lat.value=lat; fm.elements.lng.value=lng; fm.elements.locVerified.checked=true; }
  M.setPick(lat,lng); setPick(false);
};
function setPick(on){ S.pick=on; $("pickBanner").hidden=!on; M.picking&&M.picking(on); const b=$("pickBtn"); if(b) b.textContent=on?"Cancel picking":"Pick on map"; }
function renderMap(rows){
  if(!M.upsert) return;
  const keep=new Set();
  rows.forEach(p=>{ if(p.lat==null||p.lng==null) return; keep.add(p._id); M.upsert(p._id,p,S.sel===p._id,()=>select(p._id)); });
  M.ids().forEach(id=>{ if(!keep.has(id)) M.remove(id); });
}
function renderLegend(rows){
  const seen=[...new Set(rows.map(shapeOf))];
  const names={rooftop:"Solar rooftop",street:"Solar streetlight",both:"Rooftop + streetlight",dot:"Other environment",house:"House (PBJ / PMR)",school:"School",tree:"Tree planting",vehicle:"Vehicle donation"};
  const order=Object.keys(names).filter(k=>seen.includes(k));
  $("mapLegend").innerHTML=order.map(k=>`<div class="row">${pinSvg(k,"var(--muted)",false,false,14)}${names[k]}</div>`).join("")+
    (rows.some(p=>p.lat!=null&&!p.locVerified)?`<div class="row">${pinSvg("rooftop","var(--muted)",true,false,14)}Approximate location</div>`:"");
  $("mapLegend").hidden=!order.length;
}

/* ================= UI ================= */
function renderNav(){
  const yr=[...S.projects.values()].filter(inYear);
  const count=pred=>yr.filter(pred).length;
  $("pillarChips").innerHTML=[["","Overview",yr.length],...PILLARS.map(([id,n])=>[id,n,count(p=>progOf(p).pillar===id)])]
    .map(([v,l,c])=>`<button class="chip" type="button" data-pillar="${v}" aria-pressed="${S.pillar===v}">${esc(l)}<span class="c">${c}</span></button>`).join("");
  if(!S.pillar || PROGRAMMES.filter(p=>p.pillar===S.pillar).length===1){ $("progChips").innerHTML=""; $("progChips").hidden=true; }
  else{
    const ps=PROGRAMMES.filter(p=>p.pillar===S.pillar);
    const opts=ps.length>1?[["","All "+PILLAR_NAME[S.pillar],count(p=>progOf(p).pillar===S.pillar)]]:[];
    ps.forEach(p=>{ if(p.id==="env-other" && !count(x=>programmeOf(x)==="env-other") && S.prog!=="env-other") return; opts.push([p.id,p.name,count(x=>programmeOf(x)===p.id)]); });
    $("progChips").innerHTML=opts.map(([v,l,c])=>`<button class="chip" type="button" data-prog="${v}" aria-pressed="${(S.prog||(ps.length===1?ps[0].id:""))===v}">${esc(l)}<span class="c">${c}</span></button>`).join("");
    $("progChips").hidden=false;
  }
  const solarRows=yr.filter(p=>programmeOf(p)==="solar");
  if(S.prog==="solar"){
    const opts=[["","All solar",solarRows.length],["rooftop","Rooftop",solarRows.filter(p=>p.type==="Solar Rooftop"||p.type==="Rooftop + Streetlight").length],["street","Streetlight",solarRows.filter(p=>p.type==="Solar Streetlight"||p.type==="Rooftop + Streetlight").length]];
    $("typeChips").innerHTML=opts.map(([v,l,c])=>`<button class="chip" type="button" data-v="${v}" aria-pressed="${S.type===v}">${l}<span class="c">${c}</span></button>`).join("");
    $("typeChips").hidden=false;
  } else { $("typeChips").hidden=true; $("typeChips").innerHTML=""; }
  $("fComp").hidden = S.pillar!=="env" || (S.prog && S.prog!=="env-other" && S.prog!=="solar");
  if($("fComp").hidden && S.comp){ S.comp=""; $("fComp").value=""; }
}
function setView(pillar,prog){
  S.pillar=pillar; S.prog=prog; S.status=""; S.sel=null; S.editing=null; setPick(false); M.setPick&&M.setPick(null);
  if(pillar && !prog){ const ps=PROGRAMMES.filter(p=>p.pillar===pillar); if(ps.length===1) S.prog=ps[0].id; }
  if(S.prog!=="solar") S.type="";
  saveView(); render();
}
function renderTitle(){
  const sp=single(), base=(CONFIG.title||"TNB CSR Dashboard").replace(/\s*20\d\d$/,"");
  const heading = sp ? sp.name : S.pillar ? PILLAR_NAME[S.pillar]+" pillar" : base;
  const yr=S.year||"2023–2030";
  $("appTitle").textContent=`${heading} ${yr}`;
  $("eyebrow").textContent = sp ? `TNB CSR · ${PILLAR_NAME[sp.pillar]} pillar` : S.pillar ? "TNB CSR" : "TNB CSR · All pillars";
  $("appSub").textContent = sp ? sp.blurb : S.pillar ? PROGRAMMES.filter(p=>p.pillar===S.pillar).map(p=>p.name).join(", ")+"." : "Flagship programmes across the five CSR pillars.";
  document.title=`${heading} ${yr}`;
}
function renderKpis(rows){
  const sp=single(), u=viewUnit(), U=u[1][0].toUpperCase()+u[1].slice(1);
  const val=sum(rows,"value"), noval=rows.filter(p=>!p.value).length, pinned=rows.filter(p=>p.lat!=null).length;
  const st=k=>rows.filter(p=>STAGE_OF[p.status]===k).length;
  const done=st("done"), active=st("approved")+st("progress"), pipe=st("pipeline");
  const paid=rows.filter(p=>p.payment==="Paid").length;
  const isHouse = sp ? sp.statuses===HOUSE_ST : viewProgs().every(p=>p.statuses===HOUSE_ST);
  const k=[[U,rows.length,`${pinned} on the map`],[sp?sp.valueLabel:"Total value",rmShort(val),noval?`${noval} without a value yet`:"All valued"],
    ["Completed",done,rows.length?Math.round(done/rows.length*100)+"% of "+u[1]:""],
    isHouse?["Under way",active,`${rows.filter(p=>p.status==="Under construction").length} under construction`]:["Approved or ongoing",active,"Approved or in progress"],
    ["In pipeline",pipe,isHouse?"Application received":"Not yet approved"],["Paid",`${paid}/${rows.length}`,`${rows.length-paid} not paid`]];
  $("kpis").innerHTML=k.map(([l,v,h])=>`<div class="kpi"><span class="l">${esc(l)}</span><span class="v" title="${esc(v)}">${esc(v)}</span><span class="h">${esc(h)}</span></div>`).join("");
}
function renderPipe(rows){
  const sp=single(), n=rows.length||1;
  const counts = sp ? sp.statuses.map(s=>[s,s,rows.filter(p=>p.status===s).length,sc(s)]) : STAGES.map(([k,l,v])=>[k,l,rows.filter(p=>STAGE_OF[p.status]===k).length,`var(${v})`]);
  const none=rows.filter(p=>!STAGE_OF[p.status]).length;
  $("pipeTitle").textContent = sp ? "Status pipeline" : "Progress across programmes";
  $("pipeBar").innerHTML=counts.filter(c=>c[2]).map(([k,l,c,col])=>`<span title="${esc(l)}: ${c}" style="width:${c/n*100}%;background:${col}"></span>`).join("");
  $("pipeLegend").innerHTML=counts.map(([k,l,c,col])=>`<button type="button" data-s="${esc(k)}" aria-pressed="${S.status===k}"><span class="dot" style="background:${col}"></span>${esc(l)} <span class="num">${c}</span></button>`).join("")
    +(none?`<span class="status-line">${none} with no status</span>`:"")+(S.status?`<button type="button" data-s="">Clear status filter</button>`:"");
}
function listMeta(p){
  const pr=progOf(p), bits=[];
  if(!single()) bits.push(pr.short);
  if(p.district) bits.push(p.district); else if(p.state) bits.push(p.state);
  if(p.district && p.state) bits.push(p.state);
  if(pr.id==="solar") bits.push(p.type||"");
  if(p.school && p.school!==p.name) bits.push(p.school);
  if((pr.id==="pbj"||pr.id==="pmr") && p.progress!=null && p.status!=="Completed") bits.push(`${p.progress}% built`);
  return bits.filter(Boolean).map(b=>`<span>${esc(b)}</span>`).join("");
}
function renderList(rows){
  $("listCount").textContent=`${rows.length} shown`;
  $("sideTitle").textContent = S.editing ? (S.editing._id?"Edit "+progOf(S.editing).unit[0]:"New "+progOf(S.editing).unit[0]) : S.sel ? "Details" : viewUnit()[1][0].toUpperCase()+viewUnit()[1].slice(1);
  if(!S.loaded) return;
  if(!rows.length){
    const sp=single();
    $("list").innerHTML = `<div class="empty">${S.projects.size&&!sp?"Nothing matches these filters.":`No ${sp?sp.unit[1]:"projects"}${S.year?" for "+S.year:""} yet.`}${S.canWrite?`<br><br><button class="btn primary" type="button" id="emptyAdd">+ Add ${sp?sp.unit[0]:"project"}</button> <button class="btn" type="button" id="importFile">Import a list</button>`:S.user?"":" Sign in to add one."}</div>`;
    if($("importFile")) $("importFile").onclick=()=>$("importAny").click();
    if($("emptyAdd")) $("emptyAdd").onclick=()=>$("addBtn").click();
    return;
  }
  $("list").innerHTML=rows.map(p=>`<button type="button" class="item ${S.sel===p._id?"sel":""}" data-id="${p._id}">
    <span class="no">${p.no??""}</span><span class="nm">${esc(p.name)}</span><span class="val">${p.value?rmShort(p.value):"—"}</span>
    <span class="meta"><span class="pill" style="--pc:${sc(p.status)}"><span class="dot"></span>${esc(p.status||"No status")}</span>${listMeta(p)}${p.lat==null?'<span>No pin</span>':(p.locVerified?'':'<span>Approx. pin</span>')}</span>
  </button>`).join("");
}
function select(id,pan){
  S.sel=id; S.editing=null; S.confirmDel=false; setPick(false); M.setPick&&M.setPick(null);
  const p=S.projects.get(id);
  if(pan && p && p.lat!=null) M.flyTo&&M.flyTo(p.lat,p.lng,12);
  render();
  if(window.innerWidth<960) $("side").scrollIntoView({behavior:"smooth",block:"start"});
}
function closeDetail(){ S.sel=null; S.editing=null; setPick(false); M.setPick&&M.setPick(null); render(); }
function fmtField(fd,p){
  const v=p[fd.k];
  if(fd.t==="checks"){ const o=v||{}; return fd.keys.map(([k,l])=>`<span class="flag ${o[k]?"ok":"no"}">${o[k]?"✓":"✗"} ${esc(l)}</span>`).join(" "); }
  if(v==null||v===""){ return null; }
  if(fd.t==="money") return `<span class="num">${rm(v)}</span>`;
  if(fd.t==="date") return fmtDate(v);
  if(fd.t==="num") return `<span class="num">${Number(v).toLocaleString()}</span>`;
  if(fd.t==="pct") return `<span class="prog"><span style="width:${Math.max(0,Math.min(100,+v))}%"></span></span> <span class="num">${v}%</span>`;
  if(fd.flag) return `<span class="flag ${v===fd.flag?"ok":"no"}">${esc(v)}</span>`;
  if(fd.t==="area") return esc(v).replace(/\n/g,"<br>");
  return esc(v);
}
function renderSide(){
  const p = S.editing || (S.sel && S.projects.get(S.sel));
  $("list").hidden=!!p; $("detail").hidden=!p; $("listCount").hidden=!!p;
  if(!p) return;
  if(S.editing) return renderEdit(S.editing);
  const pr=progOf(p), skip=new Set(["name","status"]);
  const rows=pr.fields.filter(fd=>!skip.has(fd.k)).map(fd=>[fd,fmtField(fd,p)]).filter(([fd,h])=>h!=null && !(fd.k==="remarks"));
  if(pr.id==="solar" && !p.kwp && !p.units) rows.push([{label:"Capacity"},'<span class="status-line">Not recorded</span>']);
  $("detail").innerHTML=`
    <div class="row-actions"><button class="btn small" type="button" id="backBtn">← Back to list</button></div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <span class="pill" style="--pc:${sc(p.status)};align-self:flex-start"><span class="dot"></span>${esc(p.status||"No status")}</span>
      <h3>${esc(p.name)}</h3>
      <div class="status-line">${esc(pr.name)} · ${esc(PILLAR_NAME[pr.pillar])} pillar${p.no!=null?` · No. ${p.no}`:""}</div>
    </div>
    <dl class="dl">${rows.map(([fd,h])=>`<dt>${esc(fd.label)}</dt><dd>${h}</dd>`).join("")}
      <dt>Remarks</dt><dd>${esc(p.remarks||"—")}</dd></dl>
    <div class="photos-box">
      <div class="photos-head"><strong>Photos</strong>${S.canWrite?`<button class="btn small" type="button" id="addPhotosBtn">+ Add photos</button>`:""}</div>
      <div id="photoGrid" class="photo-grid"></div>
    </div>
    <div class="loc">
      <strong>Location</strong>
      ${p.lat!=null?`<span class="num">${p.lat}, ${p.lng}</span><span class="status-line">${p.locVerified?"Exact location confirmed":"Approximate pin (placed from the name or town). Edit to set the exact spot."}</span>`:`<span class="status-line">No pin yet${p.state==="Nationwide"?" (nationwide project)":""}.</span>`}
      <a href="${gmaps(p)}" target="_blank" rel="noopener">Open in Google Maps ↗</a>
    </div>
    ${S.canWrite?`<div class="row-actions"><button class="btn primary" type="button" id="editBtn">Edit</button><button class="btn danger" type="button" id="delBtn">Delete</button></div>`:""}
    ${S.confirmDel?`<div class="confirm"><span>Delete “${esc(p.name)}” for everyone?</span><button class="btn small danger" type="button" id="delYes">Delete</button><button class="btn small" type="button" id="delNo">Keep it</button></div>`:""}
    ${p.updatedAt?`<div class="status-line">Last updated ${new Date(p.updatedAt).toLocaleString("en-GB",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}${p.updatedBy?" by "+esc(p.updatedBy):""}</div>`:""}`;
  $("backBtn").onclick=closeDetail;
  if($("addPhotosBtn")) $("addPhotosBtn").onclick=()=>$("photoInput").click();
  renderPhotos();
  if($("editBtn")) $("editBtn").onclick=()=>{ S.editing={...p}; render(); };
  if($("delBtn")) $("delBtn").onclick=()=>{ S.confirmDel=true; render(); };
  if($("delYes")) $("delYes").onclick=async()=>{ try{ const ph=await getDocs(collection(db,"projects",p._id,"photos")); for(const d of ph.docs) await deleteDoc(d.ref); await deleteDoc(doc(db,"projects",p._id)); S.sel=null; S.confirmDel=false; toast("Deleted"); render(); }catch(e){ toast(permMsg(e)); } };
  if($("delNo")) $("delNo").onclick=()=>{ S.confirmDel=false; render(); };
}
const permMsg = e => e && e.code==="permission-denied" ? "Your account isn’t on the editor list. Ask the owner to add you." : "Couldn’t save: "+(e.message||e.code||e);
function opt(list,v,blank){ return (blank!=null?`<option value="">${blank}</option>`:"")+list.map(x=>`<option ${String(x)===String(v)?"selected":""}>${esc(x)}</option>`).join(""); }
function fieldInput(fd,p,pr){
  const v=p[fd.k], id=`e-${fd.k}`, cls=fd.full?' class="full"':"";
  let inp;
  switch(fd.t){
    case "status": inp=`<select id="${id}" name="${fd.k}">${opt(pr.statuses,pr.statuses.includes(v)?v:pr.statuses[0])}</select>`; break;
    case "year": inp=`<select id="${id}" name="${fd.k}">${opt(YEARS,projYear(p)||S.year||new Date().getFullYear())}</select>`; break;
    case "sel": inp=`<select id="${id}" name="${fd.k}">${opt(v&&!fd.opts.includes(v)?[...fd.opts,v]:fd.opts,v??fd.def,fd.def?null:"—")}</select>`; break;
    case "money": inp=`<input id="${id}" name="${fd.k}" type="number" step="0.01" min="0" inputmode="decimal" value="${v??""}">`; break;
    case "num": inp=`<input id="${id}" name="${fd.k}" type="number" step="any" min="0" value="${v??""}">`; break;
    case "pct": inp=`<input id="${id}" name="${fd.k}" type="number" step="1" min="0" max="100" value="${v??""}">`; break;
    case "date": inp=`<input id="${id}" name="${fd.k}" type="date" value="${esc(v||"")}">`; break;
    case "area": inp=`<textarea id="${id}" name="${fd.k}">${esc(v||"")}</textarea>`; break;
    case "checks": return `<fieldset class="full checks"><legend>${esc(fd.label)}</legend>${fd.keys.map(([k,l])=>`<label><input type="checkbox" name="${fd.k}.${k}" ${(v||{})[k]?"checked":""}>${esc(l)}</label>`).join("")}</fieldset>`;
    default: inp=`<input id="${id}" name="${fd.k}" ${fd.req?"required":""} value="${esc(v??"")}">`;
  }
  return `<label${cls}>${esc(fd.label)}${inp}</label>`;
}
function readForm(fm,pr){
  const out={};
  for(const fd of pr.fields){
    if(fd.t==="checks"){ out[fd.k]=Object.fromEntries(fd.keys.map(([k])=>[k,!!fm.elements[`${fd.k}.${k}`]?.checked])); continue; }
    const el=fm.elements[fd.k]; if(!el) continue;
    const raw=el.value.trim();
    if(["money","num","pct","year"].includes(fd.t)) out[fd.k]= raw===""?null:Number(raw);
    else out[fd.k]= raw===""?(fd.t==="date"||fd.t==="sel"?null:""):raw;
  }
  return out;
}
function renderEdit(p){
  const pr=progOf(p);
  const progSel = !p._id ? `<label class="full">Programme<select id="e-programme" name="programme">${PROGRAMMES.map(x=>`<option value="${x.id}" ${x.id===pr.id?"selected":""}>${esc(PILLAR_NAME[x.pillar])}: ${esc(x.name)}</option>`).join("")}</select></label>` : "";
  $("detail").innerHTML=`
  <form class="edit" id="editForm" novalidate>
    ${progSel}
    ${pr.fields.map(fd=>fieldInput(fd,p,pr)).join("")}
    <div class="full loc">
      <strong>Location</strong>
      <label>Paste a Google Maps link or “lat, lng”<input id="e-paste" name="paste" placeholder="e.g. 3.1390, 101.6869"></label>
      <span class="hint" id="pasteHint">Easiest: click “Pick on map”, switch to satellite and click the exact spot. Or right-click the spot in Google Maps, copy the coordinates and paste them here.</span>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <label>Latitude<input id="e-lat" name="lat" type="number" step="any" value="${p.lat??""}"></label>
        <label>Longitude<input id="e-lng" name="lng" type="number" step="any" value="${p.lng??""}"></label>
      </div>
      <label style="flex-direction:row;align-items:center;gap:8px;color:var(--fg)"><input id="e-locVerified" name="locVerified" type="checkbox" style="width:auto" ${p.locVerified?"checked":""}>This is the exact location</label>
      <div class="row-actions"><button class="btn small" type="button" id="pickBtn">Pick on map</button></div>
    </div>
    <div class="full row-actions"><button class="btn primary" type="submit" id="saveBtn">Save</button><button class="btn" type="button" id="cancelBtn">Cancel</button></div>
  </form>`;
  const fm=$("editForm");
  if($("e-programme")) $("e-programme").onchange=e=>{ const keep=readForm(fm,pr); const np=PROG[e.target.value]; S.editing={...S.editing,...keep,programme:np.id,status:np.statuses[0],lat:fm.elements.lat.value===""?null:+fm.elements.lat.value,lng:fm.elements.lng.value===""?null:+fm.elements.lng.value}; renderEdit(S.editing); };
  fm.elements.paste.addEventListener("input",e=>{
    const v=e.target.value.trim(); if(!v) return;
    const ll=parseLatLng(v);
    if(ll){ fm.elements.lat.value=ll[0]; fm.elements.lng.value=ll[1]; fm.elements.locVerified.checked=true; $("pasteHint").textContent=`Location set to ${ll[0]}, ${ll[1]}.`; M.setPick&&M.setPick(ll[0],ll[1]); M.flyTo&&M.flyTo(ll[0],ll[1],16); }
    else $("pasteHint").textContent = /goo\.gl|maps\.app/.test(v) ? "Short links can’t be read. Open the link, right-click the spot to copy its coordinates, and paste them here." : "Couldn’t find coordinates in that text.";
  });
  $("pickBtn").onclick=()=>setPick(!S.pick);
  $("cancelBtn").onclick=()=>{ const id=S.editing._id; S.editing=null; setPick(false); M.setPick&&M.setPick(null); S.sel=id||null; render(); };
  fm.addEventListener("submit",async e=>{
    e.preventDefault();
    const vals=readForm(fm,pr);
    if(!vals.name){ fm.elements.name.focus(); toast("Add a name"); return; }
    const num=n=>{const v=fm.elements[n].value.trim(); return v===""?null:Number(v);};
    const lat=num("lat"), lng=num("lng");
    if((lat==null)!==(lng==null) || (lat!=null && (Math.abs(lat)>90||Math.abs(lng)>180))){ toast("Enter both latitude and longitude, or leave both empty"); return; }
    const base={...S.editing}; delete base._id;
    const data={ ...base, ...vals, ...(pr.fixed||{}), programme:pr.id, lat, lng, locVerified: lat!=null && fm.elements.locVerified.checked, updatedAt:new Date().toISOString(), updatedBy:S.user?.email||"" };
    if(pr.id==="solar" && data.no==null) data.no=nextNo();
    for(const k of Object.keys(data)) if(data[k]===undefined) delete data[k];
    $("saveBtn").disabled=true;
    try{
      const ref = S.editing._id ? doc(db,"projects",S.editing._id) : doc(collection(db,"projects"));
      await setDoc(ref,data);
      S.editing=null; S.sel=ref.id; setPick(false); M.setPick&&M.setPick(null); toast("Saved"); render();
    }catch(err){ $("saveBtn").disabled=false; toast(permMsg(err)); }
  });
  if(p.lat!=null) M.setPick&&M.setPick(p.lat,p.lng);
}
function parseLatLng(s){
  const m = s.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || s.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) || s.match(/[?&](?:q|query|ll|destination)=(-?\d+\.\d+)(?:,|%2C)\s*(-?\d+\.\d+)/) || s.match(/^\s*\(?\s*(-?\d{1,2}\.\d+)\s*[, ]\s*(-?\d{2,3}\.\d+)\s*\)?\s*$/);
  if(!m) return null; const a=+(+m[1]).toFixed(6), b=+(+m[2]).toFixed(6);
  return Math.abs(a)<=90&&Math.abs(b)<=180 ? [a,b] : null;
}
function nextNo(){ return Math.max(0,...[...S.projects.values()].filter(p=>programmeOf(p)==="solar").map(p=>p.no||0))+1; }

/* lower cards */
const segKey = p => single() ? p.status : STAGE_OF[p.status];
const segList = () => single() ? single().statuses.map(s=>[s,s,sc(s)]) : STAGES.map(([k,l,v])=>[k,l,`var(${v})`]);
function stackBars(groups,emptyMsg){
  const arr=Object.entries(groups).sort((a,b)=>b[1].total-a[1].total||b[1].n-a[1].n), max=Math.max(1,...arr.map(a=>a[1].total)), segs=segList();
  return arr.length ? arr.map(([s,d])=>`<div class="bar"><span class="lab" title="${esc(s)}">${esc(s)} <span class="status-line">(${d.n})</span></span><span class="track">${segs.filter(([k])=>d.seg[k]).map(([k,l,col])=>`<span title="${esc(l)}: ${rm(d.seg[k])}" style="width:${d.seg[k]/max*100}%;background:${col}"></span>`).join("")}</span><span class="n">${rmShort(d.total)}</span></div>`).join("") : `<div class="empty">${emptyMsg}</div>`;
}
function groupBy(rows,keyFn){
  const by={};
  rows.forEach(p=>{ const s=keyFn(p)||"Unassigned"; const g=(by[s]=by[s]||{total:0,n:0,seg:{}}); g.total+=(+p.value||0); g.n++; const k=segKey(p); g.seg[k]=(g.seg[k]||0)+(+p.value||0); });
  return by;
}
const ratioRow=(l,a,b,txt)=>`<div class="bar"><span class="lab">${l}</span><span class="track"><span style="width:${b?a/b*100:0}%;background:var(--good)"></span><span style="width:${b?(b-a)/b*100:100}%;background:color-mix(in srgb,var(--bad) 55%,transparent)"></span></span><span class="n">${txt}</span></div>`;
const plainRow=(l,txt)=>`<div class="bar"><span class="lab">${l}</span><span class="track"></span><span class="n">${txt}</span></div>`;
function renderLower(rows){
  const sp=single(), n=rows.length;
  $("stateBars").innerHTML=stackBars(groupBy(rows,p=>p.state),"Nothing matches these filters.");
  $("stateNote").textContent = sp ? "Bars are coloured by status. Values in RM." : "Bars are coloured by progress stage. Values in RM.";
  let h="";
  if(!sp){
    h+=`<h2>By programme</h2><div class="bars">${stackBars(groupBy(rows,p=>progOf(p).short),"Nothing matches these filters.")}</div>`;
  }
  const paid=rows.filter(p=>p.payment==="Paid"), paidVal=sum(paid,"value"), tot=sum(rows,"value");
  h+=`<h2>Payment</h2><div class="bars">`;
  if(rows.some(p=>p.invoice)) { const inv=rows.filter(p=>p.invoice==="Received").length; h+=ratioRow("Invoice received",inv,n,`${inv} / ${n}`); }
  h+=ratioRow("Paid",paid.length,n,`${paid.length} / ${n}`)+ratioRow("Value paid",paidVal,tot,rmShort(paidVal))+`</div>`;
  const ids=new Set(rows.map(programmeOf)), hi=[], notes=[];
  if(ids.has("solar")){
    const sr=rows.filter(p=>programmeOf(p)==="solar");
    const sl=sr.filter(p=>p.type==="Solar Streetlight"||p.type==="Rooftop + Streetlight"), rf=sr.filter(p=>p.type==="Solar Rooftop"||p.type==="Rooftop + Streetlight");
    const units=sum(sl,"units"), doneUnits=sum(sl.filter(p=>p.status==="Completed"),"units"), kwp=sum(rf,"kwp");
    hi.push(ratioRow("Streetlights installed",doneUnits,units,`${doneUnits} / ${units} units`), plainRow("Rooftop capacity",kwp?kwp.toLocaleString()+" kWp":"—"));
    const missing=rf.filter(p=>!p.kwp).length; if(missing) notes.push(`${missing} rooftop project${missing>1?"s have":" has"} no kWp recorded yet.`);
  }
  const houses=rows.filter(p=>["pbj","pmr"].includes(programmeOf(p)));
  if(houses.length){
    const done=houses.filter(p=>p.status==="Completed").length, uc=houses.filter(p=>p.status==="Under construction");
    hi.push(ratioRow("Houses completed",done,houses.length,`${done} / ${houses.length}`));
    if(uc.length){ const withP=uc.filter(p=>p.progress!=null); hi.push(plainRow("Under construction",`${uc.length}${withP.length?` · avg ${Math.round(sum(withP,"progress")/withP.length)}%`:""}`)); }
    const cv=sum(houses,"contractValue"); if(cv) hi.push(plainRow("Contract value",rmShort(cv)));
    const funds={}; houses.forEach(p=>{ const k=p.fund||"Not recorded"; funds[k]=(funds[k]||0)+(+p.value||0); });
    if(Object.keys(funds).length>1||!funds["Not recorded"]) Object.entries(funds).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>hi.push(plainRow(`Fund: ${esc(k)}`,rmShort(v))));
  }
  const reach=(prog,k,label)=>{ const r=rows.filter(p=>prog.includes(programmeOf(p))); if(!r.length) return; const t=sum(r,k), d=sum(r.filter(p=>p.status==="Completed"),k); hi.push(t?ratioRow(label,d,t,`${d.toLocaleString()} / ${t.toLocaleString()}`):plainRow(label,"—")); };
  reach(["ceria","jek"],"students","Students reached"); reach(["hoki"],"players","Hockey players"); reach(["tree"],"trees","Trees planted"); reach(["vehicle"],"vehicles","Vehicles handed over");
  if(hi.length) h+=`<h2>Highlights</h2><div class="bars">${hi.join("")}</div>`;
  if(notes.length) h+=`<div class="note">${esc(notes.join(" "))}</div>`;
  $("card2").innerHTML=h;
}
function render(){
  renderNav();
  const all=filtered(true), rows=filtered(false);
  renderTitle(); renderKpis(all); renderPipe(all); renderMap(rows); renderLegend(all); renderLower(all);
  if(!S.editing || !$("editForm")){ renderList(rows); renderSide(); }
  else renderList(rows);
  $("addBtn").hidden=!S.canWrite; $("importBtn").hidden=!S.canWrite;
  const sp=single(); $("addBtn").textContent=`+ Add ${sp?sp.unit[0]:"project"}`;
  syncPhotos();
}

/* events */
$("pillarChips").addEventListener("click",e=>{const b=e.target.closest("button"); if(b) setView(b.dataset.pillar,"");});
$("progChips").addEventListener("click",e=>{const b=e.target.closest("button"); if(b) setView(S.pillar,b.dataset.prog);});
$("typeChips").addEventListener("click",e=>{const b=e.target.closest("button"); if(!b) return; S.type=b.dataset.v; saveView(); render();});
$("fYear").innerHTML=`<option value="">All years (${YEARS[0]}–${YEARS.at(-1)})</option>`+YEARS.map(y=>`<option ${String(y)===S.year?"selected":""}>${y}</option>`).join("");
$("fYear").onchange=e=>{S.year=e.target.value; try{localStorage.setItem("csr-year",S.year)}catch(e){} S.sel=null; render();};
$("importBtn").onclick=()=>$("importAny").click();
$("importAny").onchange=e=>{ const fl=e.target.files[0]; e.target.value=""; if(fl) importFile(fl); };
STATES.forEach(s=>$("fState").insertAdjacentHTML("beforeend",`<option>${s}</option>`));
COMPONENTS.forEach(s=>$("fComp").insertAdjacentHTML("beforeend",`<option>${s}</option>`));
$("fState").onchange=e=>{S.state=e.target.value;render();};
$("fComp").onchange=e=>{S.comp=e.target.value;render();};
$("fSearch").oninput=e=>{S.q=e.target.value;render();};
$("pipeLegend").addEventListener("click",e=>{const b=e.target.closest("button"); if(!b) return; S.status = S.status===b.dataset.s ? "" : b.dataset.s; render();});
$("list").addEventListener("click",e=>{const b=e.target.closest(".item"); if(b) select(b.dataset.id,true);});
$("viewPen").onclick=()=>M.fit&&M.fit(PEN);
$("viewAll").onclick=()=>M.fit&&M.fit(ALL);
$("addBtn").onclick=()=>{
  const pr=single()||viewProgs()[0]||PROG.solar;
  const ed={ _id:null, programme:pr.id, year:+(S.year||new Date().getFullYear()), status:pr.statuses[0], ...(pr.fixed||{}) };
  pr.fields.forEach(fd=>{ if(fd.def!=null && ed[fd.k]==null) ed[fd.k]=fd.def; });
  if(pr.id==="solar" && S.type) ed.type=S.type==="street"?"Solar Streetlight":"Solar Rooftop";
  S.sel=null; S.editing=ed; render(); if(window.innerWidth<960) $("side").scrollIntoView({behavior:"smooth"});
};
function exportRows(p){
  const pr=progOf(p), o={"Programme":pr.name,"Pillar":PILLAR_NAME[pr.pillar]};
  if(p.no!=null) o["No."]=p.no;
  for(const fd of pr.fields){
    if(fd.t==="checks"){ fd.keys.forEach(([k,l])=>o[l]=(p[fd.k]||{})[k]?"Yes":"No"); continue; }
    o[fd.label] = fd.t==="year" ? projYear(p) : (p[fd.k] ?? "");
  }
  Object.assign(o,{"Latitude":p.lat??"","Longitude":p.lng??"","Exact Location":p.locVerified?"Yes":"No","Google Maps":p.lat!=null?gmaps(p):""});
  return o;
}
$("exportBtn").onclick=()=>{
  if(!window.XLSX){ toast("Export isn’t available right now"); return; }
  const rows=filtered(false); if(!rows.length){ toast("Nothing to export in this view"); return; }
  const wb=XLSX.utils.book_new();
  for(const pr of PROGRAMMES){
    const r=rows.filter(p=>programmeOf(p)===pr.id); if(!r.length) continue;
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(r.map(exportRows)),pr.short.replace(/[\\/?*[\]:]/g,"").slice(0,31));
  }
  const sp=single(), label=sp?sp.short:S.pillar?PILLAR_NAME[S.pillar]:"TNB CSR";
  XLSX.writeFile(wb,`${label} ${S.year||"all years"} ${new Date().toISOString().slice(0,10)}.xlsx`);
};

/* ================= FIREBASE ================= */
const configured = CONFIG.firebase && CONFIG.firebase.projectId;
let db=null, auth=null;
render();
initMap().then(render);

if(!configured){
  $("signInBtn").hidden=true; $("msSignInBtn").hidden=true; S.loaded=true;
  $("syncNote").textContent="Setup needed: add the Firebase settings to config.js (see SETUP.md).";
  render();
} else {
  startFirebase().catch(e=>{ console.error(e); $("syncNote").textContent="Couldn’t connect to the database: "+(e.message||e); });
}
const userEmail = u => (u && (u.email || (u.providerData||[]).map(x=>x.email).find(Boolean)) || "").toLowerCase();
function signInError(e,which){
  if(e.code==="auth/popup-closed-by-user"||e.code==="auth/cancelled-popup-request") return;
  if(e.code==="auth/account-exists-with-different-credential") return toast(`This email already signs in with ${which==="Microsoft"?"Google":"Microsoft"}. Use that button instead.`);
  if(e.code==="auth/operation-not-allowed") return toast(`${which} sign-in isn’t switched on yet. See SETUP.md.`);
  toast("Sign-in didn’t finish: "+e.code);
}
async function startFirebase(){
  const [a,b,c]=await Promise.all([import(FB+"firebase-app.js"),import(FB+"firebase-auth.js"),import(FB+"firebase-firestore.js")]);
  ({initializeApp}=a); ({getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut, onAuthStateChanged}=b); ({getFirestore, collection, doc, onSnapshot, setDoc, deleteDoc, writeBatch, getDoc, getDocs, updateDoc}=c);
  const app=initializeApp(CONFIG.firebase); db=getFirestore(app); auth=getAuth(app);
  $("signInBtn").onclick=()=>signInWithPopup(auth,new GoogleAuthProvider()).catch(e=>signInError(e,"Google"));
  if(CONFIG.microsoft && CONFIG.microsoft.enabled===false) $("msSignInBtn").hidden=true;
  $("msSignInBtn").onclick=()=>{
    const pv=new OAuthProvider("microsoft.com");
    pv.setCustomParameters({prompt:"select_account",...(CONFIG.microsoft?.tenant?{tenant:CONFIG.microsoft.tenant}:{})});
    signInWithPopup(auth,pv).catch(e=>signInError(e,"Microsoft"));
  };
  $("signOutBtn").onclick=()=>signOut(auth);
  let unsub=null;
  onAuthStateChanged(auth, async user=>{
    S.user=user?{email:userEmail(user)}:null; S.canWrite=false;
    const msOk=!(CONFIG.microsoft && CONFIG.microsoft.enabled===false);
    $("signInBtn").hidden=!!user; $("msSignInBtn").hidden=!!user||!msOk; $("signOutBtn").hidden=!user; $("who").textContent=user?S.user.email:"";
    if(unsub){ unsub(); unsub=null; }
    S.projects=new Map(); S.loaded=false; render();
    if(user){
      try{ const ac=await getDoc(doc(db,"config","access")); const ed=(ac.exists()&&ac.data().editors)||[]; S.canWrite=ed.map(x=>String(x).toLowerCase()).includes(S.user.email); }catch(e){ S.canWrite=false; }
    }
    $("syncNote").textContent="Loading…";
    unsub=onSnapshot(collection(db,"projects"), snap=>{
      S.projects=new Map(snap.docs.map(d=>[d.id,{...d.data(),_id:d.id}])); S.loaded=true;
      $("syncNote").textContent = S.canWrite ? "Live. You can edit; changes save for everyone." : user ? "Live. View only (ask the owner for edit access)." : "Live. Sign in to edit.";
      if(S.sel && !S.projects.has(S.sel)) S.sel=null;
      render();
    }, err=>{
      S.loaded=true;
      if(err.code==="permission-denied"){ $("syncNote").textContent = user ? "Your account doesn’t have access yet. Ask the owner to add your email." : "Sign in to see the projects."; $("list").innerHTML=`<div class="empty">${esc($("syncNote").textContent)}</div>`; }
      else $("syncNote").textContent="Couldn’t load the projects: "+err.code;
    });
  });
}

/* ================= IMPORT ================= */
const COLS={no:["no."],component:["component"],name:["project name"],state:["state"],month:["month"],appDate:["application received date"],value:["project value (rm)"],status:["project status"],completionDate:["project completion date"],invoice:["invoice status"],payment:["payment status"],nposNo:["npos payment no."],nposDate:["npos payment date"],remarks:["remarks"],year:["year","tahun"],type:["type"],kwp:["capacity (kwp)","kwp"],units:["streetlight units"],lat:["latitude"],lng:["longitude"],programme:["programme"],exact:["exact location"]};
const norm=h=>String(h??"").toLowerCase().replace(/\s+/g," ").trim();
const isoDate=v=>{ if(v==null||v==="") return null; if(typeof v==="number"&&v>20000&&v<80000){ const d=new Date(Date.UTC(1899,11,30)+Math.round(v)*864e5); return d.toISOString().slice(0,10); } if(v instanceof Date&&!isNaN(v)) return `${v.getFullYear()}-${String(v.getMonth()+1).padStart(2,"0")}-${String(v.getDate()).padStart(2,"0")}`; const s=String(v).trim(); let m=s.match(/^(\d{4})-(\d{2})-(\d{2})/); if(m) return m[0]; m=s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/); if(m) return `${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`; m=s.match(/^(\d{2})(\d{2})(\d{4})$/); if(m) return `${m[3]}-${m[2]}-${m[1]}`; return null; };
const numv=v=>{ if(v==null||v==="") return null; const n=Number(String(v).replace(/[^0-9.\-]/g,"")); return String(v).trim()===""||isNaN(n)?null:n; };
function guessType(n){ n=n.toLowerCase(); const r=n.includes("rooftop")||n.includes("solar di "); const st=n.includes("streetlight")||n.includes("lampu jalan"); return r&&st?"Rooftop + Streetlight":r?"Solar Rooftop":st?"Solar Streetlight":"Other"; }
/* One sheet → records. Accepts the original Masterlist layout, or a sheet exported from this dashboard. */
function sheetRows(grid,sheetName,fallbackProg){
  const progByName=Object.fromEntries(PROGRAMMES.flatMap(p=>[[norm(p.name),p.id],[norm(p.short),p.id],[p.id,p.id]]));
  const sheetProg=progByName[norm(sheetName)]||fallbackProg;
  const pr=PROG[sheetProg]||PROG.solar;
  const nameLabels=[...new Set(PROGRAMMES.map(p=>norm(p.fields[0].label)))];
  const hi=grid.findIndex(r=>r.some(c=>norm(c)==="project name"||nameLabels.includes(norm(c))));
  if(hi<0) return null;
  const head=grid[hi].map(norm), col={};
  for(const [k,names] of Object.entries(COLS)){ const i=head.findIndex(h=>names.includes(h)); if(i>=0) col[k]=i; }
  for(const fd of pr.fields){ if(fd.t==="checks"){ fd.keys.forEach(([k,l])=>{ const i=head.indexOf(norm(l)); if(i>=0) col[`${fd.k}.${k}`]=i; }); continue; } const i=head.indexOf(norm(fd.label)); if(i>=0 && col[fd.k]==null) col[fd.k]=i; }
  const fallbackYear=+(S.year||new Date().getFullYear());
  return grid.slice(hi+1).filter(r=>col.name!=null&&r[col.name]&&String(r[col.name]).trim()).map(r=>{
    const g=k=>col[k]==null?null:r[col[k]];
    const progId=progByName[norm(g("programme"))]||pr.id, P=PROG[progId];
    const nm=String(g("name")).replace(/\s+/g," ").trim();
    const o={ programme:progId, name:nm };
    for(const fd of P.fields){
      if(fd.k==="name"||fd.k==="year") continue;
      if(fd.t==="checks"){ const c={}; let any=false; fd.keys.forEach(([k])=>{ const v=g(`${fd.k}.${k}`); if(v!=null){ any=true; c[k]=/^(y|yes|ya|true|1|✓|ada)$/i.test(String(v).trim()); } }); if(any) o[fd.k]=c; continue; }
      const v=g(fd.k); if(v==null||v==="") continue;
      if(["money","num","pct"].includes(fd.t)) o[fd.k]=numv(v);
      else if(fd.t==="date") o[fd.k]=isoDate(v);
      else if(fd.t==="status") o[fd.k]=P.statuses.includes(v)?v:P.statuses[0];
      else o[fd.k]=String(v).trim();
    }
    if(!o.status) o.status=P.statuses[0];
    if(o.payment!=="Paid") o.payment="Not Paid";
    if(P.fields.some(fd=>fd.k==="invoice") && o.invoice!=="Received") o.invoice="Not Received";
    if(progId==="solar"){ o.type=TYPES.includes(g("type"))?g("type"):guessType(nm); if(o.type==="Other") o.programme=(o.component==="Tree for a Tree"||/tree for a tree/i.test(nm))?"tree":"env-other"; const um=nm.match(/(\d+)\s*unit/i); if(o.units==null&&um) o.units=+um[1]; }
    const no=numv(g("no")); if(no!=null) o.no=no;
    const lat=numv(g("lat")), lng=numv(g("lng")), both=lat!=null&&lng!=null;
    o.year=numv(g("year")) || (o.appDate?+o.appDate.slice(0,4):fallbackYear);
    Object.assign(o,{lat:both?lat:null,lng:both?lng:null,locVerified:both&&/^y/i.test(String(g("exact")||""))});
    if(PROG[o.programme].fixed) Object.assign(o,PROG[o.programme].fixed);
    return o;
  });
}
async function readRows(fl){
  if(/\.json$/i.test(fl.name)){
    const rows=JSON.parse(await fl.text());
    if(!Array.isArray(rows)||!rows.every(r=>r&&r.data&&r.data.name)) throw new Error("This isn’t a projects file.");
    return rows.map(r=>({...r.data,_seedId:r.id}));
  }
  if(!window.XLSX) throw new Error("Excel import isn’t available right now. Reload the page and try again.");
  const wb=XLSX.read(await fl.arrayBuffer());
  const fallback=single()?.id||"solar";
  const ml=wb.SheetNames.find(n=>norm(n)==="masterlist");
  const names=ml?[ml]:wb.SheetNames;
  const out=[];
  for(const n of names){ const r=sheetRows(XLSX.utils.sheet_to_json(wb.Sheets[n],{header:1,raw:true,defval:null}),n,fallback); if(r) out.push(...r); }
  if(!out.length) throw new Error("Couldn’t find a name column. Use the Masterlist columns, or a sheet exported from this dashboard.");
  return out;
}
async function importFile(fl){
  if(!db){ toast("Finish setup before importing."); return; }
  try{
    const rows=await readRows(fl);
    const key=p=>`${projYear(p)}|${programmeOf(p)}|${String(p.name).toLowerCase().replace(/\s+/g," ").trim()}`;
    const have=new Set([...S.projects.values()].map(key));
    const seen=new Set(), fresh=rows.filter(r=>{ const k=key(r); if(have.has(k)||seen.has(k)||(r._seedId&&S.projects.has(r._seedId))) return false; seen.add(k); return true; });
    const skipped=rows.length-fresh.length;
    if(!fresh.length){ toast(rows.length?`Nothing new: all ${rows.length} records are already in the dashboard.`:"No records found in that file."); return; }
    const now=new Date().toISOString(), by=S.user?.email||"";
    for(let i=0;i<fresh.length;i+=400){ const b=writeBatch(db); fresh.slice(i,i+400).forEach(r=>{ const {_seedId,...d}=r; b.set(_seedId&&/^[\w-]{1,100}$/.test(_seedId)?doc(db,"projects",_seedId):doc(collection(db,"projects")),{...d,updatedAt:now,updatedBy:by}); }); await b.commit(); }
    const progs=[...new Set(fresh.map(p=>progOf(p).short))].join(", "), yrs=[...new Set(fresh.map(projYear))].sort().join(", ");
    toast(`Imported ${fresh.length} (${progs}) for ${yrs}${skipped?`. Skipped ${skipped} already in the dashboard.`:"."}`);
  }catch(e){ toast(e.code?permMsg(e):(e.message||"Import failed")); }
}

/* ================= PHOTOS =================
   Stored in Firestore (no billing needed): projects/{id}/photos/{photoId}
   Each photo is shrunk in the browser to fit well under Firestore's 1 MB document limit. */
function syncPhotos(){
  const want = db && S.sel && !S.editing ? S.sel : null;
  if(want===PH.for) return;
  if(PH.unsub){ PH.unsub(); PH.unsub=null; }
  PH.for=want; PH.list=[]; PH.loading=!!want;
  if(!want) return;
  PH.unsub=onSnapshot(collection(db,"projects",want,"photos"), snap=>{
    PH.loading=false;
    PH.list=snap.docs.map(d=>({...d.data(),_id:d.id})).sort((a,b)=>String(a.takenAt||a.uploadedAt).localeCompare(String(b.takenAt||b.uploadedAt)));
    renderPhotos(); if(PH.open) renderLightbox();
  }, err=>{ PH.loading=false; renderPhotos(err.code==="permission-denied"?"Photos need the updated access rules (see SETUP.md).":"Couldn’t load photos."); });
}
function renderPhotos(msg){
  const g=$("photoGrid"); if(!g) return;
  if(msg){ g.innerHTML=`<span class="status-line">${esc(msg)}</span>`; return; }
  if(!db){ g.innerHTML=`<span class="status-line">Photos are available once setup is finished.</span>`; return; }
  const busy = PH.busy?`<div class="ph-tile ph-busy">Uploading ${PH.busy}…</div>`:"";
  if(PH.loading){ g.innerHTML=`<span class="status-line">Loading photos…</span>`; return; }
  if(!PH.list.length && !PH.busy){ g.innerHTML=`<span class="status-line">No photos yet.${S.canWrite?" Add site visit, progress or completion photos.":""}</span>`; return; }
  g.innerHTML=PH.list.map((ph,i)=>`<button type="button" class="ph-tile" data-i="${i}" title="${esc(ph.caption||"")}"><img src="${ph.thumb||ph.data}" alt="${esc(ph.caption||"Project photo")}" loading="lazy"></button>`).join("")+busy;
  g.querySelectorAll(".ph-tile[data-i]").forEach(b=>b.onclick=()=>{ PH.open=PH.list[+b.dataset.i]._id; renderLightbox(); });
}
function loadImage(file){
  return new Promise((res,rej)=>{ const url=URL.createObjectURL(file), img=new Image(); img.onload=()=>{ URL.revokeObjectURL(url); res(img); }; img.onerror=()=>{ URL.revokeObjectURL(url); rej(new Error("unreadable")); }; img.src=url; });
}
function shrink(img,maxSide,quality){
  const r=Math.min(1,maxSide/Math.max(img.naturalWidth,img.naturalHeight));
  const c=document.createElement("canvas"); c.width=Math.round(img.naturalWidth*r); c.height=Math.round(img.naturalHeight*r);
  const x=c.getContext("2d"); x.fillStyle="#fff"; x.fillRect(0,0,c.width,c.height); x.drawImage(img,0,0,c.width,c.height);
  return { url:c.toDataURL("image/jpeg",quality), w:c.width, h:c.height };
}
async function addPhotos(files){
  const pid=S.sel; if(!pid||!files.length) return;
  let ok=0; const bad=[];
  PH.busy=files.length; renderPhotos();
  for(const fl of files){
    try{
      if(!/^image\//.test(fl.type) && !/\.(jpe?g|png|webp|heic|heif)$/i.test(fl.name)) throw new Error("not an image");
      const img=await loadImage(fl);
      let side=1600, q=.78, full=shrink(img,side,q);
      while(full.url.length>850000 && side>600){ side=Math.round(side*.8); q=Math.max(.6,q-.05); full=shrink(img,side,q); }
      const thumb=shrink(img,360,.7);
      const taken=fl.lastModified?new Date(fl.lastModified).toISOString():new Date().toISOString();
      await setDoc(doc(collection(db,"projects",pid,"photos")),{ data:full.url, thumb:thumb.url, w:full.w, h:full.h, caption:"", fileName:fl.name, takenAt:taken, uploadedAt:new Date().toISOString(), uploadedBy:S.user?.email||"" });
      ok++;
    }catch(e){ bad.push(fl.name); if(e.code==="permission-denied"){ toast(permMsg(e)); break; } }
    PH.busy--; renderPhotos();
  }
  PH.busy=0; renderPhotos();
  if(bad.length) toast(`${ok} added. Couldn’t read ${bad.length} file${bad.length>1?"s":""} (${bad.slice(0,2).join(", ")}${bad.length>2?"…":""}). iPhone HEIC photos may need to be saved as JPEG first.`);
  else if(ok) toast(`${ok} photo${ok>1?"s":""} added`);
}
function renderLightbox(){
  const lb=$("lightbox"), i=PH.list.findIndex(x=>x._id===PH.open);
  if(i<0){ PH.open=null; lb.hidden=true; return; }
  const ph=PH.list[i], when=ph.takenAt?new Date(ph.takenAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):"";
  lb.hidden=false;
  lb.innerHTML=`<div class="lb-inner" role="dialog" aria-label="Photo ${i+1} of ${PH.list.length}">
    <div class="lb-top"><span class="status-line">${i+1} / ${PH.list.length}${when?" · "+when:""}${ph.uploadedBy?" · added by "+esc(ph.uploadedBy):""}</span><button class="btn small" type="button" id="lbClose">Close ✕</button></div>
    <div class="lb-img"><button class="lb-nav" type="button" id="lbPrev" aria-label="Previous" ${i===0?"disabled":""}>‹</button><img src="${ph.data}" alt="${esc(ph.caption||"Project photo")}"><button class="lb-nav" type="button" id="lbNext" aria-label="Next" ${i===PH.list.length-1?"disabled":""}>›</button></div>
    ${S.canWrite?`<div class="lb-edit"><input id="lbCaption" placeholder="Add a caption, e.g. Roof completed" value="${esc(ph.caption||"")}"><button class="btn small primary" type="button" id="lbSave">Save caption</button><button class="btn small danger" type="button" id="lbDel">Delete photo</button></div><div id="lbConfirm"></div>`:(ph.caption?`<div class="lb-cap">${esc(ph.caption)}</div>`:"")}
  </div>`;
  const go=d=>{ const n=PH.list[i+d]; if(n){ PH.open=n._id; renderLightbox(); } };
  $("lbClose").onclick=closeLightbox; $("lbPrev").onclick=()=>go(-1); $("lbNext").onclick=()=>go(1);
  if($("lbSave")) $("lbSave").onclick=async()=>{ try{ await updateDoc(doc(db,"projects",PH.for,"photos",ph._id),{caption:$("lbCaption").value.trim()}); toast("Caption saved"); }catch(e){ toast(permMsg(e)); } };
  if($("lbDel")) $("lbDel").onclick=()=>{ $("lbConfirm").innerHTML=`<div class="confirm"><span>Delete this photo for everyone?</span><button class="btn small danger" type="button" id="lbDelYes">Delete</button><button class="btn small" type="button" id="lbDelNo">Keep it</button></div>`;
    $("lbDelNo").onclick=()=>$("lbConfirm").innerHTML="";
    $("lbDelYes").onclick=async()=>{ try{ const next=PH.list[i+1]||PH.list[i-1]; await deleteDoc(doc(db,"projects",PH.for,"photos",ph._id)); PH.open=next?next._id:null; toast("Photo deleted"); if(!PH.open) closeLightbox(); }catch(e){ toast(permMsg(e)); } }; };
}
function closeLightbox(){ PH.open=null; $("lightbox").hidden=true; $("lightbox").innerHTML=""; }
$("photoInput").onchange=e=>{ const fs=[...e.target.files]; e.target.value=""; addPhotos(fs); };
$("lightbox").addEventListener("click",e=>{ if(e.target.id==="lightbox") closeLightbox(); });
document.addEventListener("keydown",e=>{ if(!PH.open||e.target.tagName==="INPUT") return; if(e.key==="Escape") closeLightbox(); if(e.key==="ArrowLeft") $("lbPrev")?.click(); if(e.key==="ArrowRight") $("lbNext")?.click(); });
