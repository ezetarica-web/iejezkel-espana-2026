import { useState, useEffect, useCallback, useRef } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

// ─── LOCAL STORAGE HOOK ───────────────────────────────────
const useStore = (key, init) => {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : init;
    } catch { return init; }
  });
  const save = useCallback((v) => {
    setData(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key]);
  return [data, save];
};

// ─── EDITABLE CELL ────────────────────────────────────────
const EC = ({ val, onSave, type = "text", opts, style }) => {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(val);
  const ref = useRef();
  useEffect(() => { setV(val); }, [val]);
  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);
  if (editing) {
    if (opts) return <select ref={ref} value={v||""} onChange={e=>{setV(e.target.value);onSave(e.target.value);setEditing(false)}} onBlur={()=>setEditing(false)} style={{background:"rgba(212,168,83,0.1)",border:"1px solid #d4a853",borderRadius:4,color:"#e8e8ec",padding:"2px 6px",fontSize:12,...style}}>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select>;
    return <input ref={ref} type={type} value={v||""} onChange={e=>setV(e.target.value)} onBlur={()=>{onSave(type==="number"?Number(v):v);setEditing(false)}} onKeyDown={e=>{if(e.key==="Enter"){onSave(type==="number"?Number(v):v);setEditing(false)}}} style={{background:"rgba(212,168,83,0.1)",border:"1px solid #d4a853",borderRadius:4,color:"#e8e8ec",padding:"2px 6px",fontSize:12,width:"100%",...style}} />;
  }
  return <span onClick={()=>setEditing(true)} style={{cursor:"pointer",borderBottom:"1px dashed rgba(212,168,83,0.3)",paddingBottom:1,...style}} title="Click para editar">{val===0?"0":(val || "—")}</span>;
};

const StatusBadge = ({ status, onChange }) => {
  const colors = { confirmed:"#4ade80",pending:"#fb923c",done:"#4ade80",planning:"#60a5fa",active:"#4ade80",lead:"#fb923c",cold:"#f87171",repeat:"#4ade80",interested:"#d4a853",new_lead:"#60a5fa",new_client:"#22d3ee",inactive:"#f87171",delivered:"#4ade80",programada:"#60a5fa" };
  const c = colors[status]||"#d4a853";
  return <span onClick={onChange} style={{display:"inline-block",padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,background:c+"22",color:c,cursor:onChange?"pointer":"default"}} title={onChange?"Click para cambiar":""}>{status}</span>;
};

// ─── COLORS ───────────────────────────────────────────────
const GOLD="#d4a853",GREEN="#4ade80",BLUE="#60a5fa",PURPLE="#a78bfa",RED="#f87171",CYAN="#22d3ee",ORANGE="#fb923c";

// ─── INITIAL DATA ─────────────────────────────────────────
const initGigs = [
  {id:1,who:"Casa Delta",date:"2026-06-15",city:"Barcelona",project:"Music Canción · Open House",status:"confirmed",amount:100},
  {id:2,who:"Casa Delta",date:"2026-06-15",city:"Barcelona",project:"Yoga + Círculo de Voces",status:"confirmed",amount:100},
  {id:3,who:"Nico Pente",date:"2026-06-19",city:"Florencia",project:"Isidora Project · DJ SET",status:"confirmed",amount:100},
  {id:4,who:"Nico Pente",date:"2026-06-24",city:"Florencia",project:"Otridivinci · Canción",status:"confirmed",amount:100},
  {id:5,who:"Nico Pente",date:"2026-06-25",city:"Florencia",project:"Chiosco Toscana · DJ SET",status:"confirmed",amount:100},
  {id:6,who:"Nico Pente",date:"2026-06-26",city:"Florencia",project:"A definir",status:"pending",amount:100},
  {id:7,who:"Juli Ares",date:"2026-07-19",city:"Madrid",project:"Sesionista y Telonero",status:"confirmed",amount:100},
  {id:8,who:"Juli Ares",date:"2026-07-28",city:"Barcelona",project:"Sesionista y Telonero",status:"confirmed",amount:100},
  {id:9,who:"Casa Astor",date:"2026-07-01",city:"Barcelona",project:"Fecha Acústica",status:"pending",amount:0},
  {id:10,who:"Bridge48/Jambori/Marula",date:"2026-08-04",city:"Barcelona",project:"Fecha trio Rock",status:"pending",amount:0},
];
const initClients = [
  {id:1,name:"Infinidad Audiovisual",project:"Pack Banda Sonora",details:"A definir",status:"active"},
  {id:2,name:"Citizens of Tomorrow",project:"Banda Sonora Publicidad",details:"TyC Sports",status:"active"},
  {id:3,name:"Inicia Aurora",project:"Frankenstein OST",details:"Music, SFX, VO",status:"active"},
  {id:4,name:"Sonar Luz",project:"Curso Música Cine",details:"3 Meses · 12 clases",status:"planning"},
  {id:5,name:"Mario",project:"Contactarse",details:"",status:"lead"},
  {id:6,name:"Tomás Ostiglia",project:"Contactarse",details:"",status:"lead"},
  {id:7,name:"Bridge 48",project:"Llevar portfolio",details:"",status:"lead"},
];
const initBoiosCRM = [
  {id:1,name:"Andrea Rossi",lastDate:"2026-04-10",status:"repeat",lastMsg:"llegó todo bien!!",nextAction:"Contactar próximo pedido",totalQty:72,totalRev:204000},
  {id:2,name:"Marcelo Zubrisky",lastDate:"2026-04-18",status:"new_client",lastMsg:"Quiero 36 boios",nextAction:"Preparar pedido",totalQty:36,totalRev:102000},
  {id:3,name:"Roni Goldberg",lastDate:"2026-04-18",status:"delivered",lastMsg:"Me chafaron un boio",nextAction:"Mejorar packaging",totalQty:12,totalRev:32000},
  {id:4,name:"Peto Yatche",lastDate:"2026-04-13",status:"repeat",lastMsg:"Como siempre serán un 10",nextAction:"Confirmar 24 unid.",totalQty:72,totalRev:188000},
  {id:5,name:"Christian",lastDate:"2026-04-14",status:"repeat",lastMsg:"Dales genial",nextAction:"Confirmar pedido",totalQty:36,totalRev:96000},
  {id:6,name:"Delfina",lastDate:"2026-04-11",status:"repeat",lastMsg:"Muchas gracias Eze!",nextAction:"Ofrecer nuevo pedido",totalQty:24,totalRev:64000},
  {id:7,name:"Zoe Trilnik",lastDate:"2026-04-21",status:"repeat",lastMsg:"hechaa",nextAction:"Confirmar semanal",totalQty:24,totalRev:66000},
  {id:8,name:"Silvi",lastDate:"2026-04-11",status:"repeat",lastMsg:"Llegó. Gracias",nextAction:"Contactar",totalQty:12,totalRev:32000},
  {id:9,name:"Gabriela (Huma)",lastDate:"2026-04-19",status:"repeat",lastMsg:"Voy",nextAction:"Ofrecer nuevo pedido",totalQty:12,totalRev:16000},
  {id:10,name:"Jaime Adler",lastDate:"2026-04-21",status:"interested",lastMsg:"Te aviso. Gracias",nextAction:"Follow-up 5 días",totalQty:0,totalRev:0},
  {id:11,name:"Susana Jarabroviski",lastDate:"2026-04-17",status:"interested",lastMsg:"Te aviso semana próxima",nextAction:"Follow-up lunes",totalQty:12,totalRev:32000},
  {id:12,name:"Irene",lastDate:"2026-04-16",status:"new_lead",lastMsg:"Pasame el flyer",nextAction:"Seguimiento",totalQty:0,totalRev:0},
  {id:13,name:"Judi",lastDate:"2026-04-16",status:"new_lead",lastMsg:"Envíame el flyer",nextAction:"Seguimiento",totalQty:0,totalRev:0},
  {id:14,name:"Cristina",lastDate:"2026-04-16",status:"new_lead",lastMsg:"Son riquísimos!",nextAction:"Ofrecer pedido",totalQty:0,totalRev:0},
  {id:15,name:"Lau Rozic",lastDate:"2026-03-11",status:"cold",lastMsg:"Tendré en cuenta",nextAction:"Re-contactar",totalQty:0,totalRev:0},
  {id:16,name:"Fernanda",lastDate:"2026-04-12",status:"repeat",lastMsg:"Audio",nextAction:"Confirmar pedido",totalQty:138,totalRev:380000},
  {id:17,name:"Lolo",lastDate:"2026-04-10",status:"repeat",lastMsg:"Entrega",nextAction:"Confirmar semanal",totalQty:72,totalRev:192000},
  {id:18,name:"Gaston",lastDate:"2026-04-09",status:"repeat",lastMsg:"Confirmar",nextAction:"Confirmar",totalQty:60,totalRev:160000},
];
const initBoiosW = [
  {week:1,qty:120,revenue:300000,costs:101000},{week:2,qty:132,revenue:506000,costs:98000},
  {week:3,qty:90,revenue:272000,costs:85000},{week:4,qty:174,revenue:496000,costs:85000},
  {week:5,qty:114,revenue:336000,costs:90000},{week:6,qty:114,revenue:336000,costs:90000},
  {week:7,qty:78,revenue:198000,costs:90000},{week:8,qty:30,revenue:82000,costs:90000},
  {week:9,qty:138,revenue:374000,costs:85000},{week:10,qty:48,revenue:128000,costs:85000},
  {week:11,qty:60,revenue:166000,costs:85000},
];
const initChecklist = [
  {id:1,item:"Plan de Negocio completo",done:true},{id:2,item:"Pitch Deck (14 slides)",done:true},
  {id:3,item:"MVP desplegado",done:true},{id:4,item:"Doc técnica NeuroCoreEngine",done:true},
  {id:5,item:"Landing Page web",done:true},{id:6,item:"Reunión UBA (Chabe)",done:true},
  {id:7,item:"Pasaporte vigente (>1 año)",done:false},{id:8,item:"Antecedentes penales apostillados",done:false},
  {id:9,item:"Seguro médico España (≥30.000€)",done:false},{id:10,item:"Medios económicos documentados",done:false},
  {id:11,item:"Solicitar informe ENISA",done:false},{id:12,item:"Constituir SL española",done:false},
  {id:13,item:"Foto carné OACI",done:false},{id:14,item:"Tasas consulares",done:false},
];

// ─── MAIN APP ─────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("overview");
  const [gigs, setGigs] = useStore("ij_gigs", initGigs);
  const [clients, setClients] = useStore("ij_clients", initClients);
  const [boiosCRM, setBoiosCRM] = useStore("ij_bcrm", initBoiosCRM);
  const [boiosW, setBoiosW] = useStore("ij_bw", initBoiosW);
  const [checklist, setChecklist] = useStore("ij_ck", initChecklist);

  const updGig=(id,k,v)=>setGigs(gigs.map(g=>g.id===id?{...g,[k]:v}:g));
  const addGig=()=>setGigs([...gigs,{id:Date.now(),who:"",date:"",city:"",project:"",status:"pending",amount:0}]);
  const delGig=(id)=>setGigs(gigs.filter(g=>g.id!==id));
  const toggleGig=(id)=>updGig(id,"status",gigs.find(g=>g.id===id)?.status==="confirmed"?"pending":"confirmed");
  const updClient=(id,k,v)=>setClients(clients.map(c=>c.id===id?{...c,[k]:v}:c));
  const addClient=()=>setClients([...clients,{id:Date.now(),name:"",project:"",details:"",status:"lead"}]);
  const delClient=(id)=>setClients(clients.filter(c=>c.id!==id));
  const updB=(id,k,v)=>setBoiosCRM(boiosCRM.map(c=>c.id===id?{...c,[k]:v}:c));
  const addB=()=>setBoiosCRM([...boiosCRM,{id:Date.now(),name:"",lastDate:new Date().toISOString().slice(0,10),status:"new_lead",lastMsg:"",nextAction:"",totalQty:0,totalRev:0}]);
  const delB=(id)=>setBoiosCRM(boiosCRM.filter(c=>c.id!==id));
  const toggleCk=(id)=>setChecklist(checklist.map(c=>c.id===id?{...c,done:!c.done}:c));
  const updW=(wk,k,v)=>setBoiosW(boiosW.map(w=>w.week===wk?{...w,[k]:v}:w));
  const addW=()=>setBoiosW([...boiosW,{week:boiosW.length+1,qty:0,revenue:0,costs:0}]);

  const tRev=boiosW.reduce((s,w)=>s+w.revenue,0);
  const tCost=boiosW.reduce((s,w)=>s+w.costs,0);
  const cGigs=gigs.filter(g=>g.status==="confirmed");
  const ckDone=checklist.filter(c=>c.done).length;
  const bChart=boiosW.map(w=>({name:`S${w.week}`,Ingreso:w.revenue/1000,Costo:w.costs/1000,Neto:(w.revenue-w.costs)/1000,Unidades:w.qty}));
  const bCum=boiosW.reduce((a,w,i)=>{const p=a[i-1]||{cR:0,cN:0};a.push({name:`S${w.week}`,cR:(p.cR+w.revenue)/1000,cN:(p.cN+w.revenue-w.costs)/1000});return a;},[]);
  const crmPie=Object.entries(boiosCRM.reduce((a,c)=>{a[c.status]=(a[c.status]||0)+1;return a;},{})).map(([k,v])=>({name:k,value:v}));
  const sonarD=[{n:"Cohorte 1",I:2120,A:100,N:2020},{n:"Cohorte 2",I:4620,A:500,N:4120},{n:"Cohorte 3",I:5760,A:700,N:5060}];
  const neuroD=[{n:"Año 1",B2C:48,B2B:0},{n:"Año 2",B2C:288,B2B:0},{n:"Año 3",B2C:1150,B2B:100},{n:"Año 4",B2C:2880,B2B:700},{n:"Año 5",B2C:5760,B2B:2300}];
  const PC=[GREEN,GOLD,BLUE,CYAN,ORANGE,RED,PURPLE];
  const tt={background:"#111114",border:"1px solid #2a2a32",borderRadius:8,fontSize:12};

  const exportAll=()=>{
    const d={gigs,clients,boiosCRM,boiosW,checklist,exported:new Date().toISOString()};
    const blob=new Blob([JSON.stringify(d,null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="iejezkel_backup_"+new Date().toISOString().slice(0,10)+".json";a.click();
  };
  const importAll=(e)=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();r.onload=(ev)=>{
      try{const d=JSON.parse(ev.target.result);if(d.gigs)setGigs(d.gigs);if(d.clients)setClients(d.clients);if(d.boiosCRM)setBoiosCRM(d.boiosCRM);if(d.boiosW)setBoiosW(d.boiosW);if(d.checklist)setChecklist(d.checklist);alert("Datos importados correctamente");}catch{alert("Error al importar");}
    };r.readAsText(f);
  };

  const pages=[
    {id:"overview",label:"Panel General",color:GOLD},{id:"espana",label:"España Calendar",color:BLUE},
    {id:"espeis",label:"Estudio Espeis",color:GREEN},{id:"sonar",label:"Sonar Luz",color:PURPLE},
    {id:"boios",label:"Boios CRM",color:GOLD},{id:"neuro",label:"NeuroEconomy",color:CYAN},
    {id:"finanzas",label:"Finanzas",color:GREEN},{id:"marketing",label:"Marketing",color:ORANGE},
  ];

  const DelBtn=({onClick})=><button onClick={onClick} style={{background:"none",border:"none",color:"#5a5a6e",cursor:"pointer",fontSize:14,padding:"0 4px"}} title="Eliminar">×</button>;

  const R=()=>{switch(page){
  case "overview":return(<div>
    <h2 className="pt">Iejezkel · España 2026</h2><p className="ps">Vista general · Click en cualquier dato para editarlo</p>
    <div className="g4">
      <div className="cd"><h3>Gigs Confirmados</h3><div className="vl gold">{cGigs.length}</div><div className="sub">{gigs.length} totales</div></div>
      <div className="cd"><h3>Boios Neto ARS</h3><div className="vl green">${((tRev-tCost)/1000).toFixed(0)}K</div><div className="sub">{boiosCRM.length} clientes</div></div>
      <div className="cd"><h3>Sonar Luz</h3><div className="vl">0 / 8</div><div className="sub">USD 100/mes</div></div>
      <div className="cd"><h3>Visa España</h3><div className="vl">{ckDone}/{checklist.length}</div><div className="pb"><div className="pf" style={{width:`${ckDone/checklist.length*100}%`,background:GOLD}}/></div></div>
    </div>
    <div className="g2">
      <div className="cd"><h3>Boios · Ingresos vs Costos (ARS K)</h3><ResponsiveContainer width="100%" height={200}><BarChart data={bChart}><CartesianGrid strokeDasharray="3 3" stroke="#2a2a32"/><XAxis dataKey="name" tick={{fill:"#5a5a6e",fontSize:10}}/><YAxis tick={{fill:"#5a5a6e",fontSize:10}}/><Tooltip contentStyle={tt}/><Bar dataKey="Ingreso" fill={GOLD} radius={[4,4,0,0]}/><Bar dataKey="Costo" fill={RED} radius={[4,4,0,0]} opacity={.6}/></BarChart></ResponsiveContainer></div>
      <div className="cd"><h3>Boios · Acumulado (ARS K)</h3><ResponsiveContainer width="100%" height={200}><AreaChart data={bCum}><CartesianGrid strokeDasharray="3 3" stroke="#2a2a32"/><XAxis dataKey="name" tick={{fill:"#5a5a6e",fontSize:10}}/><YAxis tick={{fill:"#5a5a6e",fontSize:10}}/><Tooltip contentStyle={tt}/><Area type="monotone" dataKey="cR" stroke={GOLD} fill="rgba(212,168,83,.15)" strokeWidth={2}/><Area type="monotone" dataKey="cN" stroke={GREEN} fill="rgba(74,222,128,.1)" strokeWidth={2}/></AreaChart></ResponsiveContainer></div>
    </div>
    <div className="g2">
      <div className="cd"><h3>Sonar Luz · 3 Cohortes (USD)</h3><ResponsiveContainer width="100%" height={180}><BarChart data={sonarD}><CartesianGrid strokeDasharray="3 3" stroke="#2a2a32"/><XAxis dataKey="n" tick={{fill:"#5a5a6e",fontSize:10}}/><YAxis tick={{fill:"#5a5a6e",fontSize:10}}/><Tooltip contentStyle={tt}/><Bar dataKey="N" fill={PURPLE} radius={[4,4,0,0]}/><Bar dataKey="A" fill={RED} radius={[4,4,0,0]} opacity={.5}/></BarChart></ResponsiveContainer></div>
      <div className="cd"><h3>NeuroEconomy · Revenue 5 Años (€K)</h3><ResponsiveContainer width="100%" height={180}><AreaChart data={neuroD}><CartesianGrid strokeDasharray="3 3" stroke="#2a2a32"/><XAxis dataKey="n" tick={{fill:"#5a5a6e",fontSize:10}}/><YAxis tick={{fill:"#5a5a6e",fontSize:10}}/><Tooltip contentStyle={tt}/><Area type="monotone" dataKey="B2C" stackId="1" stroke={CYAN} fill="rgba(34,211,238,.15)"/><Area type="monotone" dataKey="B2B" stackId="1" stroke={PURPLE} fill="rgba(167,139,250,.15)"/></AreaChart></ResponsiveContainer></div>
    </div>
    <div className="ib"><strong>Acciones esta semana:</strong><br/>→ <strong>Boios:</strong> {boiosCRM.filter(c=>["new_lead","interested"].includes(c.status)).length} leads por contactar<br/>→ <strong>Sonar Luz:</strong> Iniciar pre-lanzamiento: landing + pixel + primer reel<br/>→ <strong>España:</strong> {gigs.filter(g=>g.status==="pending").length} fechas pendientes por confirmar<br/>→ <strong>Visa:</strong> {checklist.length-ckDone} ítems pendientes. Prioridad: pasaporte + antecedentes + seguro</div>
  </div>);

  case "espana":return(<div>
    <h2 className="pt">España 2026 · Calendar</h2><p className="ps">Click en status para cambiar confirmado ↔ pendiente</p>
    <div className="cd" style={{marginBottom:16}}>
      <h3>Fechas</h3><div style={{overflowX:"auto"}}><table><thead><tr><th>Fecha</th><th>Ciudad</th><th>Proyecto</th><th>Con quién</th><th>€</th><th>Status</th><th></th></tr></thead>
      <tbody>{gigs.map(g=><tr key={g.id}>
        <td><EC val={g.date} onSave={v=>updGig(g.id,"date",v)} style={{color:GOLD,fontWeight:500}}/></td>
        <td><EC val={g.city} onSave={v=>updGig(g.id,"city",v)}/></td>
        <td><EC val={g.project} onSave={v=>updGig(g.id,"project",v)} style={{color:"#e8e8ec"}}/></td>
        <td><EC val={g.who} onSave={v=>updGig(g.id,"who",v)}/></td>
        <td><EC val={g.amount} type="number" onSave={v=>updGig(g.id,"amount",v)}/></td>
        <td><StatusBadge status={g.status} onChange={()=>toggleGig(g.id)}/></td>
        <td><DelBtn onClick={()=>delGig(g.id)}/></td>
      </tr>)}</tbody></table></div>
      <div className="add-btn" onClick={addGig}>+ Agregar fecha</div>
    </div>
    <div className="cd"><h3>Revenue por Ciudad (€)</h3><ResponsiveContainer width="100%" height={200}><BarChart data={["Barcelona","Florencia","Madrid"].map(c=>({name:c,Confirmado:gigs.filter(g=>g.city===c&&g.status==="confirmed").reduce((s,g)=>s+g.amount,0),Pendiente:gigs.filter(g=>g.city===c&&g.status==="pending").reduce((s,g)=>s+g.amount,0)}))}><CartesianGrid strokeDasharray="3 3" stroke="#2a2a32"/><XAxis dataKey="name" tick={{fill:"#5a5a6e",fontSize:11}}/><YAxis tick={{fill:"#5a5a6e",fontSize:11}}/><Tooltip contentStyle={tt}/><Bar dataKey="Confirmado" fill={GREEN} radius={[4,4,0,0]}/><Bar dataKey="Pendiente" fill={ORANGE} radius={[4,4,0,0]} opacity={.6}/></BarChart></ResponsiveContainer></div>
  </div>);

  case "espeis":return(<div>
    <h2 className="pt">Estudio Espeis</h2><p className="ps">Pipeline de clientes</p>
    <div className="cd" style={{marginBottom:16}}>
      <h3>Pipeline</h3><table><thead><tr><th>Cliente</th><th>Proyecto</th><th>Detalles</th><th>Status</th><th></th></tr></thead>
      <tbody>{clients.map(c=><tr key={c.id}>
        <td><EC val={c.name} onSave={v=>updClient(c.id,"name",v)} style={{color:"#e8e8ec",fontWeight:500}}/></td>
        <td><EC val={c.project} onSave={v=>updClient(c.id,"project",v)}/></td>
        <td><EC val={c.details} onSave={v=>updClient(c.id,"details",v)}/></td>
        <td><EC val={c.status} onSave={v=>updClient(c.id,"status",v)} opts={["active","planning","lead","done"]}/></td>
        <td><DelBtn onClick={()=>delClient(c.id)}/></td>
      </tr>)}</tbody></table>
      <div className="add-btn" onClick={addClient}>+ Agregar cliente</div>
    </div>
    <div className="ib"><strong>Marketing Espeis España:</strong><br/>→ LinkedIn: conectar 20 productoras Madrid/Barcelona<br/>→ Reels: proceso Ableton, before/after escenas<br/>→ Presencial: USB con reel + PDF portfolio<br/>→ Pricing: Cine indie €500-2000 · Publicidad €1000-5000 · Serie €3000-8000<br/>→ Target: productoras boutique que trabajan con LATAM</div>
  </div>);

  case "sonar":return(<div>
    <h2 className="pt">Sonar Luz</h2><p className="ps">Laboratorio de Música para Imagen</p>
    <div className="g4">
      <div className="cd"><h3>Precio/mes</h3><div className="vl gold">USD 100</div></div>
      <div className="cd"><h3>Pago completo</h3><div className="vl">USD 270</div></div>
      <div className="cd"><h3>Breakeven</h3><div className="vl green">6 alum.</div></div>
      <div className="cd"><h3>ROI ads</h3><div className="vl gold">18x</div></div>
    </div>
    <div className="g2">
      <div className="cd"><h3>Proyección 3 Cohortes (USD)</h3><ResponsiveContainer width="100%" height={220}><BarChart data={sonarD}><CartesianGrid strokeDasharray="3 3" stroke="#2a2a32"/><XAxis dataKey="n" tick={{fill:"#5a5a6e",fontSize:11}}/><YAxis tick={{fill:"#5a5a6e",fontSize:11}}/><Tooltip contentStyle={tt}/><Bar dataKey="I" name="Ingresos" fill={PURPLE} radius={[4,4,0,0]}/><Bar dataKey="A" name="Ads" fill={RED} radius={[4,4,0,0]} opacity={.5}/></BarChart></ResponsiveContainer><div className="sub" style={{textAlign:"center"}}>Total 3 cohortes: ~USD 12.500</div></div>
      <div className="cd"><h3>Embudo de Captación</h3>{[{l:"Alcance",v:"15K",p:100},{l:"Interacción",v:"300",p:70},{l:"Landing",v:"75",p:45},{l:"Lead",v:"45",p:30},{l:"Webinar",v:"32",p:22},{l:"Asistió",v:"16",p:14},{l:"Consulta",v:"8",p:8},{l:"ALUMNO",v:"6-8",p:5}].map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}><span style={{fontSize:10,minWidth:70,color:"#5a5a6e"}}>{s.l}</span><div style={{flex:1,height:20,background:"rgba(212,168,83,.15)",borderRadius:4}}><div style={{width:`${s.p}%`,height:"100%",background:"rgba(212,168,83,.35)",borderRadius:4,display:"flex",alignItems:"center",paddingLeft:6,fontSize:10,color:GOLD,fontWeight:600}}>{s.v}</div></div></div>)}</div>
    </div>
    <div className="ib"><strong>Plan de captación:</strong><br/>→ Fase 1: 30 DMs + lead magnet (checklist entrega profesional)<br/>→ Fase 2: Webinar 60min + ads USD 50-80 audiencia caliente<br/>→ Fase 3: Email sequence 5 correos + cierre con urgencia real de cupo<br/>→ ROI estimado: USD 100 en ads → USD 1.840 en ingresos (18x)</div>
  </div>);

  case "boios":return(<div>
    <h2 className="pt">Boios de Saavedra · CRM</h2><p className="ps">{boiosCRM.length} contactos · {boiosW.length} semanas</p>
    <div className="g4">
      <div className="cd"><h3>Ingresos</h3><div className="vl gold">${(tRev/1000).toFixed(0)}K</div></div>
      <div className="cd"><h3>Neto</h3><div className="vl green">${((tRev-tCost)/1000).toFixed(0)}K</div></div>
      <div className="cd"><h3>Activos</h3><div className="vl">{boiosCRM.filter(c=>["repeat","delivered","new_client"].includes(c.status)).length}</div></div>
      <div className="cd"><h3>Leads</h3><div className="vl" style={{color:ORANGE}}>{boiosCRM.filter(c=>["new_lead","interested"].includes(c.status)).length}</div></div>
    </div>
    <div className="cd" style={{marginBottom:16}}>
      <h3>CRM · WhatsApp Analysis</h3><div style={{overflowX:"auto"}}><table><thead><tr><th>Cliente</th><th>Fecha</th><th>Status</th><th>Último Msg</th><th>Acción</th><th>Qty</th><th>$</th><th></th></tr></thead>
      <tbody>{boiosCRM.sort((a,b)=>new Date(b.lastDate)-new Date(a.lastDate)).map(c=><tr key={c.id}>
        <td><EC val={c.name} onSave={v=>updB(c.id,"name",v)} style={{color:"#e8e8ec",fontWeight:500}}/></td>
        <td><EC val={c.lastDate} onSave={v=>updB(c.id,"lastDate",v)} style={{color:GOLD,fontSize:11}}/></td>
        <td><EC val={c.status} onSave={v=>updB(c.id,"status",v)} opts={["repeat","delivered","new_client","interested","new_lead","cold","inactive"]}/></td>
        <td style={{maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}><EC val={c.lastMsg} onSave={v=>updB(c.id,"lastMsg",v)}/></td>
        <td><EC val={c.nextAction} onSave={v=>updB(c.id,"nextAction",v)} style={{color:CYAN,fontSize:11}}/></td>
        <td><EC val={c.totalQty} type="number" onSave={v=>updB(c.id,"totalQty",v)}/></td>
        <td><EC val={c.totalRev} type="number" onSave={v=>updB(c.id,"totalRev",v)} style={{color:GOLD}}/></td>
        <td><DelBtn onClick={()=>delB(c.id)}/></td>
      </tr>)}</tbody></table></div>
      <div className="add-btn" onClick={addB}>+ Agregar cliente</div>
    </div>
    <div className="g2">
      <div className="cd"><h3>Ventas por Semana (editable)</h3><ResponsiveContainer width="100%" height={180}><BarChart data={bChart}><CartesianGrid strokeDasharray="3 3" stroke="#2a2a32"/><XAxis dataKey="name" tick={{fill:"#5a5a6e",fontSize:10}}/><YAxis tick={{fill:"#5a5a6e",fontSize:10}}/><Tooltip contentStyle={tt}/><Bar dataKey="Ingreso" fill={GOLD} radius={[4,4,0,0]}/><Bar dataKey="Neto" fill={GREEN} radius={[4,4,0,0]}/></BarChart></ResponsiveContainer>
        <table style={{marginTop:8}}><thead><tr><th>S</th><th>Qty</th><th>Revenue</th><th>Costos</th></tr></thead>
        <tbody>{boiosW.map(w=><tr key={w.week}><td style={{color:GOLD}}>S{w.week}</td><td><EC val={w.qty} type="number" onSave={v=>updW(w.week,"qty",v)}/></td><td><EC val={w.revenue} type="number" onSave={v=>updW(w.week,"revenue",v)} style={{color:GOLD}}/></td><td><EC val={w.costs} type="number" onSave={v=>updW(w.week,"costs",v)} style={{color:RED}}/></td></tr>)}</tbody></table>
        <div className="add-btn" onClick={addW}>+ Agregar semana</div>
      </div>
      <div className="cd"><h3>Top Clientes por Revenue (ARS K)</h3><ResponsiveContainer width="100%" height={250}><BarChart data={boiosCRM.filter(c=>c.totalRev>0).sort((a,b)=>b.totalRev-a.totalRev).slice(0,10).map(c=>({name:c.name.split(" ")[0],Rev:c.totalRev/1000}))} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#2a2a32"/><XAxis type="number" tick={{fill:"#5a5a6e",fontSize:10}}/><YAxis type="category" dataKey="name" tick={{fill:"#9a9aaa",fontSize:11}} width={70}/><Tooltip contentStyle={tt}/><Bar dataKey="Rev" fill={GOLD} radius={[0,4,4,0]}/></BarChart></ResponsiveContainer></div>
    </div>
    <div className="ib"><strong>Recomendaciones:</strong><br/>→ Referidos: 2 boios gratis por cliente nuevo (Andrea ya trajo a Marcelo)<br/>→ Suscripción semanal a los 6 recurrentes (5% descuento)<br/>→ Mejorar packaging (Roni reportó boio aplastado)<br/>→ Pre-viaje: dejar tandas freezadas con Mile y Dan</div>
  </div>);

  case "neuro":return(<div>
    <h2 className="pt">NeuroEconomy</h2><p className="ps">Click en ítems para marcar completados</p>
    <div className="g4">
      <div className="cd"><h3>Motor</h3><div className="vl gold">7 agentes</div></div>
      <div className="cd"><h3>Tests</h3><div className="vl green">53/53</div></div>
      <div className="cd"><h3>TAM</h3><div className="vl">600M+</div></div>
      <div className="cd"><h3>Visa</h3><div className="vl">{ckDone}/{checklist.length}</div><div className="pb"><div className="pf" style={{width:`${ckDone/checklist.length*100}%`,background:GOLD}}/></div></div>
    </div>
    <div className="g2">
      <div className="cd"><h3>Checklist Visa Emprendedor</h3>{checklist.map(c=><div className="ck" key={c.id} onClick={()=>toggleCk(c.id)}><div className={`cb ${c.done?"dn":""}`}>{c.done?"✓":"—"}</div><span style={{color:c.done?"#5a5a6e":"#e8e8ec",textDecoration:c.done?"line-through":"none"}}>{c.item}</span></div>)}</div>
      <div className="cd"><h3>Revenue 5 Años (€K)</h3><ResponsiveContainer width="100%" height={220}><AreaChart data={neuroD}><CartesianGrid strokeDasharray="3 3" stroke="#2a2a32"/><XAxis dataKey="n" tick={{fill:"#5a5a6e",fontSize:11}}/><YAxis tick={{fill:"#5a5a6e",fontSize:11}}/><Tooltip contentStyle={tt}/><Area type="monotone" dataKey="B2C" stackId="1" stroke={CYAN} fill="rgba(34,211,238,.15)"/><Area type="monotone" dataKey="B2B" stackId="1" stroke={PURPLE} fill="rgba(167,139,250,.15)"/></AreaChart></ResponsiveContainer>
        <div className="ib" style={{marginTop:8}}><strong>Modelo:</strong> B2C €9.99-19.99/mes · B2B2C license fee · B2B IP licencia anual<br/>Breakeven mes 24-28 · Pre-seed €100-200K vía UBA + Angels</div>
      </div>
    </div>
  </div>);

  case "finanzas":return(<div>
    <h2 className="pt">Finanzas · Consolidado</h2><p className="ps">P&L cross-proyecto</p>
    <div className="g4">
      <div className="cd"><h3>Boios Neto</h3><div className="vl green">${((tRev-tCost)/1000).toFixed(0)}K ARS</div></div>
      <div className="cd"><h3>Sonar Luz</h3><div className="vl gold">USD 2.120</div></div>
      <div className="cd"><h3>Gigs</h3><div className="vl">€{cGigs.reduce((s,g)=>s+g.amount,0)}</div></div>
      <div className="cd"><h3>Gastos España</h3><div className="vl" style={{color:RED}}>€4.3-5.8K</div></div>
    </div>
    <div className="g2">
      <div className="cd"><h3>Ingresos por Proyecto</h3><ResponsiveContainer width="100%" height={220}><BarChart data={[{n:"Boios",v:((tRev-tCost)/1000)},{n:"Sonar",v:2.12},{n:"Gigs",v:cGigs.reduce((s,g)=>s+g.amount,0)/10},{n:"Espeis",v:0},{n:"Neuro",v:0}]}><CartesianGrid strokeDasharray="3 3" stroke="#2a2a32"/><XAxis dataKey="n" tick={{fill:"#5a5a6e",fontSize:11}}/><YAxis tick={{fill:"#5a5a6e",fontSize:11}}/><Tooltip contentStyle={tt}/><Bar dataKey="v" radius={[4,4,0,0]}>{[GOLD,PURPLE,BLUE,GREEN,CYAN].map((c,i)=><Cell key={i} fill={c}/>)}</Bar></BarChart></ResponsiveContainer></div>
      <div className="cd"><h3>Gastos España (3 meses)</h3><table><thead><tr><th>Concepto</th><th>/mes</th><th>Total</th></tr></thead><tbody>{[{c:"Alojamiento",m:"€700",t:"€2.100"},{c:"Alimentación",m:"€350",t:"€1.050"},{c:"Transporte",m:"€125",t:"€375"},{c:"Vuelos",m:"—",t:"€1.000"},{c:"Tools",m:"€50",t:"€150"},{c:"Ads",m:"€40",t:"€120"},{c:"Seguro",m:"€100",t:"€300"}].map((g,i)=><tr key={i}><td style={{color:"#e8e8ec"}}>{g.c}</td><td>{g.m}</td><td style={{color:RED}}>{g.t}</td></tr>)}</tbody></table></div>
    </div>
    <div className="ib"><strong>Resumen:</strong> Boios = cash flow Argentina. Sonar + Gigs cubren ~50% gastos Europa. Espeis = upside (un proyecto de pub €2-5K cubre un mes). Mantener €5.000 de reserva para 3 meses.</div>
  </div>);

  case "marketing":return(<div>
    <h2 className="pt">Marketing & Social</h2><p className="ps">Instagram @ezequieltarica · Estrategia por proyecto</p>
    <div className="g3">
      <div className="cd"><h3>Red</h3><div className="vl gold">Instagram</div></div>
      <div className="cd"><h3>Frecuencia</h3><div className="vl">3x/sem</div></div>
      <div className="cd"><h3>Budget Ads</h3><div className="vl" style={{color:ORANGE}}>USD 100</div></div>
    </div>
    <div className="g2">
      <div className="cd"><h3>Calendario Semanal</h3><table><thead><tr><th>Día</th><th>Proyecto</th><th>Formato</th><th>Concepto</th></tr></thead><tbody>{[{d:"Lun",p:"Sonar Luz",f:"Reel 30s",c:"Before/After escena"},{d:"Mié",p:"Espeis",f:"Carrusel",c:"Portfolio + BTS"},{d:"Vie",p:"Boios/Art",f:"Story/Reel",c:"Producto + música"},{d:"Diario",p:"Todos",f:"Stories",c:"Proceso y vida"}].map((r,i)=><tr key={i}><td style={{color:GOLD}}>{r.d}</td><td>{r.p}</td><td>{r.f}</td><td style={{fontSize:11}}>{r.c}</td></tr>)}</tbody></table></div>
      <div className="cd"><h3>Estrategia por Proyecto</h3>{[{p:"Sonar Luz",s:"DMs + webinar + lead magnet + email sequence",k:"8 alumnos",c:PURPLE},{p:"Espeis",s:"LinkedIn productoras + reels Ableton + PDF portfolio",k:"3 reuniones",c:GREEN},{p:"Boios",s:"Stories producto + referidos + flyer",k:"15 doc/sem",c:GOLD},{p:"Art/Gigs",s:"Stories viaje + ensayos + tag venues",k:"+200 followers ES",c:BLUE}].map((s,i)=><div key={i} style={{padding:"8px 0",borderBottom:"1px solid #2a2a32"}}><span style={{fontSize:12,fontWeight:600,color:s.c}}>{s.p}</span><div style={{fontSize:11,color:"#9a9aaa",marginTop:2}}>{s.s}</div><div style={{fontSize:10,color:GREEN,marginTop:2}}>KPI: {s.k}</div></div>)}</div>
    </div>
    <div className="ib"><strong>Meta Ads LATAM benchmarks:</strong> CPM $2.50-4 · CPC $0.50-0.90 · CPL $6-12 · Show-up 40-55% · Conv. webinar 12-20%<br/><strong>Hashtags:</strong> #filmscoring #musicaparacine #compositorargentino #soundtrack #ableton #sonarluz #boiosdesaavedra</div>
  </div>);

  default:return null;}};

  return(<>
    <style>{`
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Playfair+Display:wght@400;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body,#root{height:100%;background:#0a0a0c;color:#e8e8ec;font-family:'DM Sans',sans-serif}
.app{display:flex;height:100vh}
.sb{width:220px;min-width:220px;background:#111114;border-right:1px solid #2a2a32;display:flex;flex-direction:column;padding:16px 0;overflow-y:auto}
.sb-brand{padding:0 16px 16px;border-bottom:1px solid #2a2a32;margin-bottom:8px}
.sb-brand h1{font-family:'Playfair Display',serif;font-size:17px;color:#d4a853;letter-spacing:3px}
.sb-brand p{font-size:9px;color:#5a5a6e;text-transform:uppercase;letter-spacing:3px;margin-top:2px}
.ni{padding:9px 16px;cursor:pointer;font-size:12px;color:#9a9aaa;transition:all .15s;display:flex;align-items:center;gap:8px;border-left:3px solid transparent}
.ni:hover{background:#1a1a1f;color:#e8e8ec}
.ni.on{background:rgba(212,168,83,.15);color:#d4a853;border-left-color:#d4a853;font-weight:500}
.nd{width:5px;height:5px;border-radius:50%}
.mn{flex:1;overflow-y:auto;padding:24px 32px;background:#0a0a0c}
.pt{font-family:'Playfair Display',serif;font-size:24px;margin-bottom:2px}
.ps{font-size:12px;color:#5a5a6e;margin-bottom:20px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}
.g2{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px}
.cd{background:#111114;border:1px solid #2a2a32;border-radius:10px;padding:16px}
.cd h3{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#5a5a6e;margin-bottom:6px}
.vl{font-family:'Playfair Display',serif;font-size:26px;color:#e8e8ec}
.vl.gold{color:#d4a853}.vl.green{color:#4ade80}
.sub{font-size:11px;color:#9a9aaa;margin-top:3px}
table{width:100%;border-collapse:collapse;font-size:12px}
th{text-align:left;padding:8px 10px;border-bottom:1px solid #2a2a32;color:#5a5a6e;font-weight:500;font-size:10px;text-transform:uppercase;letter-spacing:1px}
td{padding:8px 10px;border-bottom:1px solid rgba(42,42,50,.4);color:#9a9aaa}
tr:hover td{background:rgba(212,168,83,.02)}
.ib{background:rgba(212,168,83,.15);border:1px solid rgba(212,168,83,.2);border-radius:8px;padding:14px;font-size:12px;color:#d4a853;line-height:1.6;margin-top:12px}
.ib strong{color:#e8e8ec}
.add-btn{background:rgba(212,168,83,.15);border:1px dashed #d4a853;border-radius:8px;padding:10px;text-align:center;cursor:pointer;color:#d4a853;font-size:12px;font-weight:500;margin-top:8px;transition:all .15s}
.add-btn:hover{background:rgba(212,168,83,.25)}
.pb{height:5px;background:#222228;border-radius:3px;overflow:hidden;margin-top:6px}
.pf{height:100%;border-radius:3px;transition:width .4s}
.ck{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(42,42,50,.3);font-size:12px;cursor:pointer}
.cb{width:16px;height:16px;border-radius:4px;border:2px solid #2a2a32;display:flex;align-items:center;justify-content:center;font-size:10px;color:#4ade80;flex-shrink:0}
.cb.dn{background:rgba(74,222,128,.15);border-color:#4ade80}
.exp-bar{display:flex;gap:6px;flex-wrap:wrap;padding:8px 16px;border-top:1px solid #2a2a32}
.exp-btn{background:none;border:1px solid #2a2a32;color:#9a9aaa;border-radius:6px;padding:5px 12px;font-size:11px;cursor:pointer;font-family:'DM Sans',sans-serif}
.exp-btn:hover{border-color:#d4a853;color:#d4a853}
@media(max-width:768px){.sb{width:60px;min-width:60px}.sb-brand h1{font-size:12px}.sb-brand p,.ni span:not(.nd){display:none}.ni{justify-content:center;padding:12px}.mn{padding:16px}.g4,.g3{grid-template-columns:repeat(2,1fr)}.g2{grid-template-columns:1fr}}
    `}</style>
    <div className="app">
      <nav className="sb">
        <div className="sb-brand"><h1>IEJEZKEL</h1><p>España 2026</p></div>
        {pages.map(p=><div key={p.id} className={`ni ${page===p.id?"on":""}`} onClick={()=>setPage(p.id)}><div className="nd" style={{background:p.color}}/><span>{p.label}</span></div>)}
        <div style={{flex:1}}/>
        <div className="exp-bar">
          <button className="exp-btn" onClick={exportAll}>⬇ Backup</button>
          <label className="exp-btn" style={{cursor:"pointer"}}>⬆ Importar<input type="file" accept=".json" onChange={importAll} style={{display:"none"}}/></label>
        </div>
        <div style={{padding:"8px 16px",fontSize:9,color:"#5a5a6e"}}>
          <div style={{color:"#d4a853",fontSize:10}}>Jun → Ago · BCN · FLR · MAD</div>
          <div style={{marginTop:2}}>Auto-guardado local</div>
        </div>
      </nav>
      <main className="mn">{R()}</main>
    </div>
  </>);
}
