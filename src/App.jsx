import { useState, useEffect, useCallback, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Cell,
} from "recharts";

// ─── FORMAT HELPERS ───────────────────────────────────────
const fmt = (n) =>
  Math.round(Number(n || 0))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const fARS = (n) => {
  if (n === null || n === undefined || isNaN(Number(n))) return "—";
  return "$" + fmt(n);
};
const fUSD = (n, rate) => {
  if (!rate || !n || isNaN(Number(n)) || Number(n) === 0) return null;
  return "USD " + fmt(Math.round(Number(n) / Number(rate)));
};
const fEUR = (n) => "€" + fmt(n || 0);

const Usd = ({ ars, rate }) => {
  const u = fUSD(ars, rate);
  return u ? <div style={{ fontSize: 9, color: "#5a5a6e", marginTop: 1 }}>{u}</div> : null;
};

const monthName = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"][d.getMonth()] + " " + d.getFullYear();
};

const daysTo = (dateStr) => {
  const diff = new Date(dateStr) - new Date();
  return Math.max(0, Math.ceil(diff / 86400000));
};

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
    if (opts)
      return (
        <select ref={ref} value={v || ""} onChange={e => { setV(e.target.value); onSave(e.target.value); setEditing(false); }} onBlur={() => setEditing(false)}
          style={{ background: "rgba(212,168,83,0.1)", border: "1px solid #d4a853", borderRadius: 4, color: "#e8e8ec", padding: "2px 6px", fontSize: 12, ...style }}>
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    return (
      <input ref={ref} type={type} value={v || ""}
        onChange={e => setV(e.target.value)}
        onBlur={() => { onSave(type === "number" ? Number(v) : v); setEditing(false); }}
        onKeyDown={e => { if (e.key === "Enter") { onSave(type === "number" ? Number(v) : v); setEditing(false); } }}
        style={{ background: "rgba(212,168,83,0.1)", border: "1px solid #d4a853", borderRadius: 4, color: "#e8e8ec", padding: "2px 6px", fontSize: 12, width: "100%", ...style }} />
    );
  }
  return (
    <span onClick={() => setEditing(true)}
      style={{ cursor: "pointer", borderBottom: "1px dashed rgba(212,168,83,0.3)", paddingBottom: 1, ...style }}
      title="Click para editar">
      {val === 0 ? "0" : (val || "—")}
    </span>
  );
};

const StatusBadge = ({ status, onChange }) => {
  const colors = {
    confirmed: "#4ade80", pending: "#fb923c", done: "#4ade80", planning: "#60a5fa",
    active: "#4ade80", lead: "#fb923c", cold: "#f87171", repeat: "#4ade80",
    interested: "#d4a853", new_lead: "#60a5fa", new_client: "#22d3ee",
    inactive: "#f87171", delivered: "#4ade80", programada: "#60a5fa", planned: "#60a5fa",
  };
  const c = colors[status] || "#d4a853";
  return (
    <span onClick={onChange}
      style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, background: c + "22", color: c, cursor: onChange ? "pointer" : "default" }}
      title={onChange ? "Click para cambiar" : ""}>
      {status}
    </span>
  );
};

// ─── COLORS ───────────────────────────────────────────────
const GOLD = "#d4a853", GREEN = "#4ade80", BLUE = "#60a5fa", PURPLE = "#a78bfa",
  RED = "#f87171", CYAN = "#22d3ee", ORANGE = "#fb923c";

// ─── INITIAL DATA ─────────────────────────────────────────
const initGigs = [
  { id: 1, who: "Casa Delta", date: "2026-06-15", city: "Barcelona", project: "Music Canción · Open House", status: "confirmed", amount: 100 },
  { id: 2, who: "Casa Delta", date: "2026-06-15", city: "Barcelona", project: "Yoga + Círculo de Voces", status: "confirmed", amount: 100 },
  { id: 3, who: "Nico Pente", date: "2026-06-19", city: "Florencia", project: "Isidora Project · DJ SET", status: "confirmed", amount: 100 },
  { id: 4, who: "Nico Pente", date: "2026-06-24", city: "Florencia", project: "Otridivinci · Canción", status: "confirmed", amount: 100 },
  { id: 5, who: "Nico Pente", date: "2026-06-25", city: "Florencia", project: "Chiosco Toscana · DJ SET", status: "confirmed", amount: 100 },
  { id: 6, who: "Nico Pente", date: "2026-06-26", city: "Florencia", project: "A definir", status: "pending", amount: 100 },
  { id: 7, who: "Juli Ares", date: "2026-07-19", city: "Madrid", project: "Sesionista y Telonero", status: "confirmed", amount: 100 },
  { id: 8, who: "Juli Ares", date: "2026-07-28", city: "Barcelona", project: "Sesionista y Telonero", status: "confirmed", amount: 100 },
  { id: 9, who: "Casa Astor", date: "2026-07-01", city: "Barcelona", project: "Fecha Acústica", status: "pending", amount: 0 },
  { id: 10, who: "Bridge48/Jambori/Marula", date: "2026-08-04", city: "Barcelona", project: "Fecha trio Rock", status: "pending", amount: 0 },
];

const initClients = [
  { id: 1, name: "Infinidad Audiovisual", project: "Pack Banda Sonora", details: "A definir", status: "active", monto: 0 },
  { id: 2, name: "Citizens of Tomorrow", project: "Banda Sonora Publicidad", details: "TyC Sports", status: "active", monto: 0 },
  { id: 3, name: "Inicia Aurora", project: "Frankenstein OST", details: "Music, SFX, VO", status: "active", monto: 0 },
  { id: 4, name: "Sonar Luz", project: "Curso Música Cine", details: "3 Meses · 12 clases", status: "planning", monto: 0 },
  { id: 5, name: "Mario", project: "Contactarse", details: "", status: "lead", monto: 0 },
  { id: 6, name: "Tomás Ostiglia", project: "Contactarse", details: "", status: "lead", monto: 0 },
  { id: 7, name: "Bridge 48", project: "Llevar portfolio", details: "", status: "lead", monto: 0 },
];

const initBoiosCRM = [
  { id: 1, name: "Andrea Rossi", lastDate: "2026-04-10", status: "repeat", lastMsg: "llegó todo bien!!", nextAction: "Contactar próximo pedido", totalQty: 72, totalRev: 204000 },
  { id: 2, name: "Marcelo Zubrisky", lastDate: "2026-04-18", status: "new_client", lastMsg: "Quiero 36 boios", nextAction: "Preparar pedido", totalQty: 36, totalRev: 102000 },
  { id: 3, name: "Roni Goldberg", lastDate: "2026-04-18", status: "delivered", lastMsg: "Me chafaron un boio", nextAction: "Mejorar packaging", totalQty: 12, totalRev: 32000 },
  { id: 4, name: "Peto Yatche", lastDate: "2026-04-13", status: "repeat", lastMsg: "Como siempre serán un 10", nextAction: "Confirmar 24 unid.", totalQty: 72, totalRev: 188000 },
  { id: 5, name: "Christian", lastDate: "2026-04-14", status: "repeat", lastMsg: "Dales genial", nextAction: "Confirmar pedido", totalQty: 36, totalRev: 96000 },
  { id: 6, name: "Delfina", lastDate: "2026-04-11", status: "repeat", lastMsg: "Muchas gracias Eze!", nextAction: "Ofrecer nuevo pedido", totalQty: 24, totalRev: 64000 },
  { id: 7, name: "Zoe Trilnik", lastDate: "2026-04-21", status: "repeat", lastMsg: "hechaa", nextAction: "Confirmar semanal", totalQty: 24, totalRev: 66000 },
  { id: 8, name: "Silvi", lastDate: "2026-04-11", status: "repeat", lastMsg: "Llegó. Gracias", nextAction: "Contactar", totalQty: 12, totalRev: 32000 },
  { id: 9, name: "Gabriela (Huma)", lastDate: "2026-04-19", status: "repeat", lastMsg: "Voy", nextAction: "Ofrecer nuevo pedido", totalQty: 12, totalRev: 16000 },
  { id: 10, name: "Jaime Adler", lastDate: "2026-04-21", status: "interested", lastMsg: "Te aviso. Gracias", nextAction: "Follow-up 5 días", totalQty: 0, totalRev: 0 },
  { id: 11, name: "Susana Jarabroviski", lastDate: "2026-04-17", status: "interested", lastMsg: "Te aviso semana próxima", nextAction: "Follow-up lunes", totalQty: 12, totalRev: 32000 },
  { id: 12, name: "Irene", lastDate: "2026-04-16", status: "new_lead", lastMsg: "Pasame el flyer", nextAction: "Seguimiento", totalQty: 0, totalRev: 0 },
  { id: 13, name: "Judi", lastDate: "2026-04-16", status: "new_lead", lastMsg: "Envíame el flyer", nextAction: "Seguimiento", totalQty: 0, totalRev: 0 },
  { id: 14, name: "Cristina", lastDate: "2026-04-16", status: "new_lead", lastMsg: "Son riquísimos!", nextAction: "Ofrecer pedido", totalQty: 0, totalRev: 0 },
  { id: 15, name: "Lau Rozic", lastDate: "2026-03-11", status: "cold", lastMsg: "Tendré en cuenta", nextAction: "Re-contactar", totalQty: 0, totalRev: 0 },
  { id: 16, name: "Fernanda", lastDate: "2026-04-12", status: "repeat", lastMsg: "Audio", nextAction: "Confirmar pedido", totalQty: 138, totalRev: 380000 },
  { id: 17, name: "Lolo", lastDate: "2026-04-10", status: "repeat", lastMsg: "Entrega", nextAction: "Confirmar semanal", totalQty: 72, totalRev: 192000 },
  { id: 18, name: "Gaston", lastDate: "2026-04-09", status: "repeat", lastMsg: "Confirmar", nextAction: "Confirmar", totalQty: 60, totalRev: 160000 },
];

const initBoiosW = [
  { week: 1, qty: 120, revenue: 300000, costs: 101000 },
  { week: 2, qty: 132, revenue: 506000, costs: 98000 },
  { week: 3, qty: 90, revenue: 272000, costs: 85000 },
  { week: 4, qty: 174, revenue: 496000, costs: 85000 },
  { week: 5, qty: 114, revenue: 336000, costs: 90000 },
  { week: 6, qty: 114, revenue: 336000, costs: 90000 },
  { week: 7, qty: 78, revenue: 198000, costs: 90000 },
  { week: 8, qty: 30, revenue: 82000, costs: 90000 },
  { week: 9, qty: 138, revenue: 374000, costs: 85000 },
  { week: 10, qty: 48, revenue: 128000, costs: 85000 },
  { week: 11, qty: 60, revenue: 166000, costs: 85000 },
];

const initChecklist = [
  { id: 1, item: "Plan de Negocio completo", done: true },
  { id: 2, item: "Pitch Deck (14 slides)", done: true },
  { id: 3, item: "MVP desplegado", done: true },
  { id: 4, item: "Doc técnica NeuroCoreEngine", done: true },
  { id: 5, item: "Landing Page web", done: true },
  { id: 6, item: "Reunión UBA (Chabe)", done: true },
  { id: 7, item: "Pasaporte vigente (>1 año)", done: false },
  { id: 8, item: "Antecedentes penales apostillados", done: false },
  { id: 9, item: "Seguro médico España (≥30.000€)", done: false },
  { id: 10, item: "Medios económicos documentados", done: false },
  { id: 11, item: "Solicitar informe ENISA", done: false },
  { id: 12, item: "Constituir SL española", done: false },
  { id: 13, item: "Foto carné OACI", done: false },
  { id: 14, item: "Tasas consulares", done: false },
];

const initRoadmap = [
  { id: 1, mes: "Abril 2026", proyecto: "Boios", hito: "Packaging mejorado · resolver caso Roni Goldberg", prioridad: "alta", estado: "active" },
  { id: 2, mes: "Abril 2026", proyecto: "Sonar Luz", hito: "Landing + pixel Meta + primer reel", prioridad: "alta", estado: "pending" },
  { id: 3, mes: "Abril 2026", proyecto: "Sonar Luz", hito: "30 DMs directos a músicos/productores", prioridad: "alta", estado: "pending" },
  { id: 4, mes: "Abril 2026", proyecto: "NeuroEconomy", hito: "Pasaporte vigente + antecedentes penales", prioridad: "alta", estado: "pending" },
  { id: 5, mes: "Mayo 2026", proyecto: "Sonar Luz", hito: "Webinar gratuito 14 mayo · 60 minutos", prioridad: "alta", estado: "pending" },
  { id: 6, mes: "Mayo 2026", proyecto: "Sonar Luz", hito: "Email sequence 5 correos + cierre cohorte 1", prioridad: "alta", estado: "pending" },
  { id: 7, mes: "Mayo 2026", proyecto: "Sonar Luz", hito: "Ads Meta USD 50–80 audiencia caliente", prioridad: "media", estado: "pending" },
  { id: 8, mes: "Mayo 2026", proyecto: "Espeis", hito: "LinkedIn: conectar 20 productoras MAD/BCN", prioridad: "media", estado: "pending" },
  { id: 9, mes: "Mayo 2026", proyecto: "NeuroEconomy", hito: "Seguro médico España + medios económicos", prioridad: "alta", estado: "pending" },
  { id: 10, mes: "Mayo 2026", proyecto: "NeuroEconomy", hito: "Solicitar ENISA + Constituir SL española", prioridad: "media", estado: "pending" },
  { id: 11, mes: "Mayo 2026", proyecto: "España", hito: "Vuelo a España · 11 mayo · salida Buenos Aires", prioridad: "alta", estado: "confirmed" },
  { id: 12, mes: "Junio 2026", proyecto: "España", hito: "Florencia con Nico Pente (19–26 jun)", prioridad: "alta", estado: "confirmed" },
  { id: 13, mes: "Junio 2026", proyecto: "Sonar Luz", hito: "Inicio Cohorte 1 · martes 19hs España", prioridad: "alta", estado: "pending" },
  { id: 14, mes: "Junio 2026", proyecto: "Boios", hito: "Freezar tandas · dejar operación con Mile y Dan", prioridad: "alta", estado: "pending" },
  { id: 15, mes: "Julio 2026", proyecto: "España", hito: "Madrid · Juli Ares sesionista (19 jul)", prioridad: "alta", estado: "confirmed" },
  { id: 16, mes: "Julio 2026", proyecto: "España", hito: "Barcelona · Juli Ares sesionista (28 jul)", prioridad: "alta", estado: "confirmed" },
  { id: 17, mes: "Julio 2026", proyecto: "Espeis", hito: "Reuniones presenciales productoras BCN/MAD", prioridad: "media", estado: "pending" },
  { id: 18, mes: "Julio 2026", proyecto: "Sonar Luz", hito: "Mid-point cohorte 1 · abrir inscripción cohorte 2", prioridad: "media", estado: "pending" },
  { id: 19, mes: "Agosto 2026", proyecto: "España", hito: "Bridge48/Jambori/Marula BCN (4 ago)", prioridad: "media", estado: "pending" },
  { id: 20, mes: "Agosto 2026", proyecto: "Sonar Luz", hito: "Cierre cohorte 1 · inicio inscripción cohorte 2", prioridad: "alta", estado: "pending" },
  { id: 21, mes: "Agosto 2026", proyecto: "NeuroEconomy", hito: "Presentar solicitud visa emprendedor", prioridad: "alta", estado: "pending" },
  { id: 22, mes: "Agosto 2026", proyecto: "Espeis", hito: "Primer contrato producción España (pub/cine)", prioridad: "media", estado: "pending" },
];

const initPauta = [
  { id: 1, proyecto: "Sonar Luz", plataforma: "Meta Ads", presupuestoUSD: 50, inicio: "2026-05-07", fin: "2026-05-14", objetivo: "Registros webinar", estado: "planned" },
  { id: 2, proyecto: "Sonar Luz", plataforma: "Meta Ads", presupuestoUSD: 80, inicio: "2026-05-14", fin: "2026-06-07", objetivo: "Cierre cohorte 1", estado: "planned" },
  { id: 3, proyecto: "Boios", plataforma: "WhatsApp + Stories orgánico", presupuestoUSD: 0, inicio: "2026-04-01", fin: "2026-05-11", objetivo: "Referidos + suscripción", estado: "active" },
  { id: 4, proyecto: "Espeis", plataforma: "LinkedIn orgánico", presupuestoUSD: 0, inicio: "2026-05-01", fin: "2026-08-31", objetivo: "3 reuniones productoras", estado: "planned" },
  { id: 5, proyecto: "Boios", plataforma: "Meta Ads (test)", presupuestoUSD: 30, inicio: "2026-05-01", fin: "2026-05-15", objetivo: "Test nuevos barrios CABA", estado: "planned" },
];

const initSegmentos = [
  { id: 1, proyecto: "Sonar Luz", segmento: "Músicos productores 25–40", plataforma: "Instagram", ubicacion: "ARG/MEX/COL", tamano: "500K+", dolor: "Quieren componer para imagen pero no saben cómo entrar a la industria", hook: "Tus acordes ya son banda sonora", color: PURPLE },
  { id: 2, proyecto: "Sonar Luz", segmento: "Compositores indie autodidactas", plataforma: "YouTube / IG", ubicacion: "LATAM", tamano: "200K+", dolor: "Tienen habilidad pero sin metodología ni conocimiento de industria", hook: "De Ableton al cine en 3 meses", color: PURPLE },
  { id: 3, proyecto: "Espeis", segmento: "Productoras boutique España", plataforma: "LinkedIn", ubicacion: "Madrid / Barcelona", tamano: "500+ empresas", dolor: "Buscan compositores con trayectoria + sensibilidad LATAM", hook: "10 años · Sundance · Berlinale · 6 películas", color: GREEN },
  { id: 4, proyecto: "Boios", segmento: "Vecinos zona norte CABA", plataforma: "WhatsApp / Stories", ubicacion: "Saavedra/Belgrano/Palermo", tamano: "Local", dolor: "Quieren comida casera artesanal de calidad, confiable y accesible", hook: "Tradición medio-oriental, hecho a mano", color: GOLD },
  { id: 5, proyecto: "NeuroEconomy", segmento: "Hispanohablantes con ansiedad financiera", plataforma: "Instagram / TikTok", ubicacion: "Global", tamano: "600M+", dolor: "Saben lo que deberían hacer con el dinero pero no lo hacen", hook: "Tu cerebro sabotea tus finanzas. Podemos cambiarlo.", color: CYAN },
];

const initProyeccion = [
  { mes: "Abril", boiosARS: 1200000, sonarUSD: 0, gigsEUR: 0, espeisEUR: 0 },
  { mes: "Mayo", boiosARS: 1200000, sonarUSD: 0, gigsEUR: 0, espeisEUR: 0 },
  { mes: "Junio", boiosARS: 600000, sonarUSD: 800, gigsEUR: 300, espeisEUR: 0 },
  { mes: "Julio", boiosARS: 0, sonarUSD: 800, gigsEUR: 200, espeisEUR: 0 },
  { mes: "Agosto", boiosARS: 0, sonarUSD: 800, gigsEUR: 200, espeisEUR: 500 },
];

const initSocial = {
  ig_followers: 0,
  ig_goal: 200,
  ig_engagement: 0,
  ig_posts_week: 3,
  li_followers: 0,
  li_goal: 50,
  hashtags: "#filmscoring #musicaparacine #compositorargentino #soundtrack #ableton #sonarluz #boiosdesaavedra",
};

const initSemana = [
  { dia: "Lunes", manana: "Boios · pedidos + producción tanda", tarde: "Sonar Luz · contenido + DMs", noche: "Composición / El Asexsor" },
  { dia: "Martes", manana: "NeuroEconomy · visa + dev", tarde: "Espeis · proyectos activos", noche: "Clases Sonar Luz (desde jun)" },
  { dia: "Miércoles", manana: "Boios · entregas zona norte", tarde: "Espeis · LinkedIn + contenido", noche: "Libre / Ensayo" },
  { dia: "Jueves", manana: "Espeis · composición + clientes", tarde: "Sonar Luz · preparar clase", noche: "Networking / Eventos" },
  { dia: "Viernes", manana: "Boios · producción tanda", tarde: "Contenido IG (Reel semanal)", noche: "Gigs / Fechas artísticas" },
  { dia: "Sábado", manana: "Producción musical libre", tarde: "Boios · entregas zona sur", noche: "Gigs / Fechas artísticas" },
  { dia: "Domingo", manana: "Planificación semana siguiente", tarde: "Boios · cierre tanda", noche: "Descanso" },
];

// ─── MAIN APP ─────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("overview");
  const [dolarBlue, setDolarBlue] = useStore("ij_dblue", 1200);
  const [eurRate, setEurRate] = useStore("ij_eur", 1300);
  const [gigs, setGigs] = useStore("ij_gigs", initGigs);
  const [clients, setClients] = useStore("ij_clients", initClients);
  const [boiosCRM, setBoiosCRM] = useStore("ij_bcrm", initBoiosCRM);
  const [boiosW, setBoiosW] = useStore("ij_bw", initBoiosW);
  const [checklist, setChecklist] = useStore("ij_ck", initChecklist);
  const [roadmap, setRoadmap] = useStore("ij_roadmap", initRoadmap);
  const [pauta, setPauta] = useStore("ij_pauta", initPauta);
  const [segmentos] = useStore("ij_segs", initSegmentos);
  const [proyeccion, setProyeccion] = useStore("ij_proy", initProyeccion);
  const [social, setSocial] = useStore("ij_social", initSocial);
  const [semana] = useStore("ij_semana", initSemana);
  const [ahorros, setAhorros] = useStore("ij_ahorros", { ars: 0, usd: 0, eur: 0 });

  // Handlers
  const updGig = (id, k, v) => setGigs(gigs.map(g => g.id === id ? { ...g, [k]: v } : g));
  const addGig = () => setGigs([...gigs, { id: Date.now(), who: "", date: "", city: "", project: "", status: "pending", amount: 0 }]);
  const delGig = (id) => setGigs(gigs.filter(g => g.id !== id));
  const toggleGig = (id) => updGig(id, "status", gigs.find(g => g.id === id)?.status === "confirmed" ? "pending" : "confirmed");

  const updClient = (id, k, v) => setClients(clients.map(c => c.id === id ? { ...c, [k]: v } : c));
  const addClient = () => setClients([...clients, { id: Date.now(), name: "", project: "", details: "", status: "lead", monto: 0 }]);
  const delClient = (id) => setClients(clients.filter(c => c.id !== id));

  const updB = (id, k, v) => setBoiosCRM(boiosCRM.map(c => c.id === id ? { ...c, [k]: v } : c));
  const addB = () => setBoiosCRM([...boiosCRM, { id: Date.now(), name: "", lastDate: new Date().toISOString().slice(0, 10), status: "new_lead", lastMsg: "", nextAction: "", totalQty: 0, totalRev: 0 }]);
  const delB = (id) => setBoiosCRM(boiosCRM.filter(c => c.id !== id));

  const toggleCk = (id) => setChecklist(checklist.map(c => c.id === id ? { ...c, done: !c.done } : c));
  const updW = (wk, k, v) => setBoiosW(boiosW.map(w => w.week === wk ? { ...w, [k]: v } : w));
  const addW = () => setBoiosW([...boiosW, { week: boiosW.length + 1, qty: 0, revenue: 0, costs: 0 }]);

  const updRM = (id, k, v) => setRoadmap(roadmap.map(r => r.id === id ? { ...r, [k]: v } : r));
  const addRM = () => setRoadmap([...roadmap, { id: Date.now(), mes: "Abril 2026", proyecto: "", hito: "", prioridad: "media", estado: "pending" }]);
  const delRM = (id) => setRoadmap(roadmap.filter(r => r.id !== id));

  const updP = (id, k, v) => setPauta(pauta.map(p => p.id === id ? { ...p, [k]: v } : p));
  const addP = () => setPauta([...pauta, { id: Date.now(), proyecto: "", plataforma: "", presupuestoUSD: 0, inicio: "", fin: "", objetivo: "", estado: "planned" }]);
  const delP = (id) => setPauta(pauta.filter(p => p.id !== id));

  const updProy = (mes, k, v) => setProyeccion(proyeccion.map(p => p.mes === mes ? { ...p, [k]: v } : p));

  // Computed values
  const tRev = boiosW.reduce((s, w) => s + w.revenue, 0);
  const tCost = boiosW.reduce((s, w) => s + w.costs, 0);
  const tNeto = tRev - tCost;
  const cGigs = gigs.filter(g => g.status === "confirmed");
  const ckDone = checklist.filter(c => c.done).length;
  const cGigsRev = cGigs.reduce((s, g) => s + g.amount, 0);

  const bChart = boiosW.map(w => ({
    name: `S${w.week}`,
    Ingreso: w.revenue,
    Costo: w.costs,
    Neto: w.revenue - w.costs,
    Unidades: w.qty,
  }));

  const bCum = boiosW.reduce((a, w, i) => {
    const p = a[i - 1] || { cR: 0, cN: 0 };
    a.push({ name: `S${w.week}`, cR: p.cR + w.revenue, cN: p.cN + (w.revenue - w.costs) });
    return a;
  }, []);

  const sonarD = [
    { n: "Cohorte 1", I: 2120, A: 100, N: 2020 },
    { n: "Cohorte 2", I: 4620, A: 500, N: 4120 },
    { n: "Cohorte 3", I: 5760, A: 700, N: 5060 },
  ];

  const neuroD = [
    { n: "Año 1", B2C: 48, B2B: 0 },
    { n: "Año 2", B2C: 288, B2B: 0 },
    { n: "Año 3", B2C: 1150, B2B: 100 },
    { n: "Año 4", B2C: 2880, B2B: 700 },
    { n: "Año 5", B2C: 5760, B2B: 2300 },
  ];

  const tt = { background: "#111114", border: "1px solid #2a2a32", borderRadius: 8, fontSize: 12 };

  const proyChart = proyeccion.map(p => ({
    name: p.mes,
    Boios: p.boiosARS,
    Sonar: p.sonarUSD * dolarBlue,
    Gigs: p.gigsEUR * eurRate,
    Espeis: p.espeisEUR * eurRate,
  }));

  const meses = ["Abril 2026", "Mayo 2026", "Junio 2026", "Julio 2026", "Agosto 2026"];
  const proyColores = { "España": BLUE, "Espeis": GREEN, "Sonar Luz": PURPLE, "NeuroEconomy": CYAN, "Boios": GOLD };

  const DelBtn = ({ onClick }) => (
    <button onClick={onClick} style={{ background: "none", border: "none", color: "#5a5a6e", cursor: "pointer", fontSize: 14, padding: "0 4px" }} title="Eliminar">×</button>
  );

  const pages = [
    { id: "overview", label: "Panel General", color: GOLD },
    { id: "roadmap", label: "Hoja de Ruta", color: ORANGE },
    { id: "espana", label: "España Calendar", color: BLUE },
    { id: "espeis", label: "Estudio Espeis", color: GREEN },
    { id: "sonar", label: "Sonar Luz", color: PURPLE },
    { id: "boios", label: "Boios CRM", color: GOLD },
    { id: "neuro", label: "NeuroEconomy", color: CYAN },
    { id: "finanzas", label: "Finanzas", color: GREEN },
    { id: "marketing", label: "Marketing", color: ORANGE },
  ];

  const exportAll = () => {
    const d = { gigs, clients, boiosCRM, boiosW, checklist, roadmap, pauta, proyeccion, social, ahorros, dolarBlue, eurRate, exported: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "iejezkel_backup_" + new Date().toISOString().slice(0, 10) + ".json"; a.click();
  };

  const importAll = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader(); r.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target.result);
        if (d.gigs) setGigs(d.gigs); if (d.clients) setClients(d.clients);
        if (d.boiosCRM) setBoiosCRM(d.boiosCRM); if (d.boiosW) setBoiosW(d.boiosW);
        if (d.checklist) setChecklist(d.checklist); if (d.roadmap) setRoadmap(d.roadmap);
        if (d.pauta) setPauta(d.pauta); if (d.proyeccion) setProyeccion(d.proyeccion);
        if (d.social) setSocial(d.social);
        if (d.dolarBlue) setDolarBlue(d.dolarBlue); if (d.eurRate) setEurRate(d.eurRate);
        if (d.ahorros) setAhorros(d.ahorros);
        alert("Datos importados correctamente");
      } catch { alert("Error al importar"); }
    }; r.readAsText(f);
  };

  const R = () => {
    switch (page) {

    // ── OVERVIEW ──────────────────────────────────────────
    case "overview": return (
      <div>
        <h2 className="pt">Iejezkel · España 2026</h2>
        <p className="ps">Vista general · Click en cualquier dato para editarlo</p>

        <div className="cd" style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "#5a5a6e", marginBottom: 4 }}>Countdown España</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, color: GOLD, lineHeight: 1 }}>
              {daysTo("2026-05-11")} <span style={{ fontSize: 14, color: "#9a9aaa" }}>días</span>
            </div>
            <div style={{ fontSize: 10, color: "#5a5a6e", marginTop: 4 }}>Salida Buenos Aires · 11 mayo 2026</div>
            <div style={{ fontSize: 10, color: "#5a5a6e" }}>Regreso · 9 agosto 2026</div>
          </div>
          <div style={{ borderLeft: "1px solid #2a2a32", paddingLeft: 24, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 11, color: "#9a9aaa" }}>
              Webinar Sonar Luz · <span style={{ color: PURPLE }}>{daysTo("2026-05-14")} días</span>
            </div>
            <div style={{ fontSize: 11, color: "#9a9aaa", display: "flex", alignItems: "center", gap: 6 }}>
              Dólar blue:&nbsp;
              <EC val={dolarBlue} type="number" onSave={setDolarBlue} style={{ color: CYAN, fontSize: 11 }} />
              &nbsp;ARS/USD &nbsp;·&nbsp; EUR:&nbsp;
              <EC val={eurRate} type="number" onSave={setEurRate} style={{ color: BLUE, fontSize: 11 }} />
              &nbsp;ARS/€
            </div>
            <div style={{ fontSize: 10, color: "#5a5a6e" }}>Click en los valores para actualizar</div>
          </div>
        </div>

        <div className="g4">
          <div className="cd">
            <h3>Gigs Confirmados</h3>
            <div className="vl gold">{cGigs.length}</div>
            <div className="sub">{gigs.length} totales · {fEUR(cGigsRev)}</div>
            <div style={{ fontSize: 9, color: "#5a5a6e", marginTop: 2 }}>{fARS(cGigsRev * eurRate)}</div>
          </div>
          <div className="cd">
            <h3>Boios Neto</h3>
            <div className="vl green">{fARS(tNeto)}</div>
            <Usd ars={tNeto} rate={dolarBlue} />
            <div className="sub">{boiosCRM.length} clientes · {boiosW.length} semanas</div>
          </div>
          <div className="cd">
            <h3>Sonar Luz</h3>
            <div className="vl">0 / 8</div>
            <div className="sub">USD 100/mes · obj. USD 2.120</div>
            <div style={{ fontSize: 9, color: "#5a5a6e", marginTop: 2 }}>{fARS(2120 * dolarBlue)} (3 cohortes: {fARS(12500 * dolarBlue)})</div>
          </div>
          <div className="cd">
            <h3>Visa España</h3>
            <div className="vl">{ckDone}/{checklist.length}</div>
            <div className="pb"><div className="pf" style={{ width: `${ckDone / checklist.length * 100}%`, background: GOLD }} /></div>
            <div className="sub">{checklist.length - ckDone} ítems pendientes</div>
          </div>
        </div>

        {/* AHORROS */}
        <div className="cd" style={{ marginBottom: 20 }}>
          <h3>Ahorros · Capital disponible</h3>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 10, color: "#5a5a6e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Pesos ARS</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ color: "#5a5a6e", fontSize: 14 }}>$</span>
                <EC val={ahorros.ars} type="number" onSave={v => setAhorros({ ...ahorros, ars: v })} style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, color: GOLD }} />
              </div>
              <Usd ars={ahorros.ars} rate={dolarBlue} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#5a5a6e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Dólares USD</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ color: "#5a5a6e", fontSize: 14 }}>USD</span>
                <EC val={ahorros.usd} type="number" onSave={v => setAhorros({ ...ahorros, usd: v })} style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, color: CYAN }} />
              </div>
              <div style={{ fontSize: 9, color: "#5a5a6e", marginTop: 1 }}>{fARS(ahorros.usd * dolarBlue)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#5a5a6e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Euros EUR</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ color: "#5a5a6e", fontSize: 14 }}>€</span>
                <EC val={ahorros.eur} type="number" onSave={v => setAhorros({ ...ahorros, eur: v })} style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, color: BLUE }} />
              </div>
              <div style={{ fontSize: 9, color: "#5a5a6e", marginTop: 1 }}>{fARS(ahorros.eur * eurRate)}</div>
            </div>
            <div style={{ borderLeft: "1px solid #2a2a32", paddingLeft: 24 }}>
              <div style={{ fontSize: 10, color: "#5a5a6e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Total ARS equiv.</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, color: GREEN }}>
                {fARS(ahorros.ars + ahorros.usd * dolarBlue + ahorros.eur * eurRate)}
              </div>
              <div style={{ fontSize: 9, color: "#5a5a6e", marginTop: 1 }}>
                USD {fmt(Math.round((ahorros.ars / dolarBlue) + ahorros.usd + (ahorros.eur * eurRate / dolarBlue)))} total equiv.
              </div>
              <div style={{ fontSize: 10, color: 5095 * eurRate > (ahorros.ars + ahorros.usd * dolarBlue + ahorros.eur * eurRate) ? RED : GREEN, marginTop: 4 }}>
                {5095 * eurRate > (ahorros.ars + ahorros.usd * dolarBlue + ahorros.eur * eurRate)
                  ? "Falta " + fARS(5095 * eurRate - (ahorros.ars + ahorros.usd * dolarBlue + ahorros.eur * eurRate)) + " para cubrir España"
                  : "Cubre los " + fEUR(5095) + " de gastos España"}
              </div>
            </div>
          </div>
        </div>

        <div className="g2">
          <div className="cd">
            <h3>Boios · Ingresos vs Costos (ARS)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={bChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a32" />
                <XAxis dataKey="name" tick={{ fill: "#5a5a6e", fontSize: 10 }} />
                <YAxis tickFormatter={v => "$" + (v / 1000).toFixed(0) + "K"} tick={{ fill: "#5a5a6e", fontSize: 9 }} />
                <Tooltip contentStyle={tt} formatter={(v, n) => [fARS(v), n]} />
                <Bar dataKey="Ingreso" fill={GOLD} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Costo" fill={RED} radius={[4, 4, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="cd">
            <h3>Boios · Acumulado Neto (ARS)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={bCum}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a32" />
                <XAxis dataKey="name" tick={{ fill: "#5a5a6e", fontSize: 10 }} />
                <YAxis tickFormatter={v => "$" + (v / 1000).toFixed(0) + "K"} tick={{ fill: "#5a5a6e", fontSize: 9 }} />
                <Tooltip contentStyle={tt} formatter={(v, n) => [fARS(v), n]} />
                <Area type="monotone" dataKey="cR" name="Ingreso Acum." stroke={GOLD} fill="rgba(212,168,83,.15)" strokeWidth={2} />
                <Area type="monotone" dataKey="cN" name="Neto Acum." stroke={GREEN} fill="rgba(74,222,128,.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="g2">
          <div className="cd">
            <h3>Sonar Luz · 3 Cohortes (USD)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={sonarD}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a32" />
                <XAxis dataKey="n" tick={{ fill: "#5a5a6e", fontSize: 10 }} />
                <YAxis tick={{ fill: "#5a5a6e", fontSize: 10 }} />
                <Tooltip contentStyle={tt} formatter={(v, n) => ["USD " + v, n]} />
                <Bar dataKey="N" name="Neto USD" fill={PURPLE} radius={[4, 4, 0, 0]} />
                <Bar dataKey="A" name="Ads" fill={RED} radius={[4, 4, 0, 0]} opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="cd">
            <h3>NeuroEconomy · Revenue 5 Años (€K)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={neuroD}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a32" />
                <XAxis dataKey="n" tick={{ fill: "#5a5a6e", fontSize: 10 }} />
                <YAxis tick={{ fill: "#5a5a6e", fontSize: 10 }} />
                <Tooltip contentStyle={tt} formatter={(v, n) => ["€" + v + "K", n]} />
                <Area type="monotone" dataKey="B2C" stackId="1" stroke={CYAN} fill="rgba(34,211,238,.15)" />
                <Area type="monotone" dataKey="B2B" stackId="1" stroke={PURPLE} fill="rgba(167,139,250,.15)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ib">
          <strong>Acciones esta semana:</strong><br />
          → <strong>Boios:</strong> {boiosCRM.filter(c => ["new_lead", "interested"].includes(c.status)).length} leads por contactar · packaging pendiente (caso Roni)<br />
          → <strong>Sonar Luz:</strong> Iniciar pre-lanzamiento: landing + pixel + primer reel · {daysTo("2026-05-14")} días para el webinar<br />
          → <strong>España:</strong> {gigs.filter(g => g.status === "pending").length} fechas pendientes por confirmar<br />
          → <strong>Visa:</strong> {checklist.length - ckDone} ítems pendientes · Prioridad: pasaporte + antecedentes + seguro
        </div>
      </div>
    );

    // ── HOJA DE RUTA ──────────────────────────────────────
    case "roadmap": return (
      <div>
        <h2 className="pt">Hoja de Ruta</h2>
        <p className="ps">Timeline · Proyección · Redes · Pauta · Segmentación · Organización</p>

        {/* Timeline */}
        <div className="cd" style={{ marginBottom: 16 }}>
          <h3>Timeline por Mes · Click en estado para cambiar</h3>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {meses.map(mes => (
              <div key={mes} style={{ minWidth: 200, flex: "1 0 200px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: GOLD, marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid #2a2a32" }}>{mes}</div>
                {roadmap.filter(r => r.mes === mes).map(r => {
                  const c = proyColores[r.proyecto] || ORANGE;
                  const borderColor = r.estado === "confirmed" || r.estado === "done" ? GREEN : r.estado === "active" ? ORANGE : "#2a2a32";
                  return (
                    <div key={r.id} style={{ marginBottom: 6, padding: "6px 8px", background: c + "0d", borderLeft: `2px solid ${borderColor}`, borderRadius: "0 6px 6px 0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 9, color: c, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{r.proyecto}</span>
                        {r.prioridad === "alta" && <span style={{ fontSize: 8, color: RED, fontWeight: 700 }}>ALTA</span>}
                      </div>
                      <div style={{ fontSize: 11, color: "#e8e8ec", marginTop: 2, lineHeight: 1.4 }}>{r.hito}</div>
                      <div style={{ display: "flex", gap: 4, marginTop: 4, alignItems: "center" }}>
                        <StatusBadge status={r.estado} onChange={() => {
                          const estados = ["pending", "active", "confirmed", "done"];
                          const i = estados.indexOf(r.estado);
                          updRM(r.id, "estado", estados[(i + 1) % estados.length]);
                        }} />
                        <DelBtn onClick={() => delRM(r.id)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="add-btn" onClick={addRM}>+ Agregar hito</div>
        </div>

        {/* Proyección */}
        <div className="cd" style={{ marginBottom: 16 }}>
          <h3>Proyección de Ingresos por Mes · Click para editar</h3>
          <div className="g2">
            <div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={proyChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a32" />
                  <XAxis dataKey="name" tick={{ fill: "#5a5a6e", fontSize: 10 }} />
                  <YAxis tickFormatter={v => "$" + (v / 1000).toFixed(0) + "K"} tick={{ fill: "#5a5a6e", fontSize: 9 }} />
                  <Tooltip contentStyle={tt} formatter={(v, n) => [fARS(v), n + " (ARS equiv.)"]} />
                  <Bar dataKey="Boios" fill={GOLD} stackId="a" />
                  <Bar dataKey="Sonar" fill={PURPLE} stackId="a" />
                  <Bar dataKey="Gigs" fill={BLUE} stackId="a" />
                  <Bar dataKey="Espeis" fill={GREEN} radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                {[["Boios", GOLD], ["Sonar", PURPLE], ["Gigs", BLUE], ["Espeis", GREEN]].map(([l, c]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                    <span style={{ fontSize: 10, color: "#9a9aaa" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <table>
                <thead>
                  <tr><th>Mes</th><th style={{ color: GOLD }}>Boios ARS</th><th style={{ color: PURPLE }}>Sonar USD</th><th style={{ color: BLUE }}>Gigs EUR</th><th style={{ color: GREEN }}>Espeis EUR</th><th>Total ARS</th></tr>
                </thead>
                <tbody>
                  {proyeccion.map(p => {
                    const total = p.boiosARS + (p.sonarUSD * dolarBlue) + (p.gigsEUR * eurRate) + (p.espeisEUR * eurRate);
                    return (
                      <tr key={p.mes}>
                        <td style={{ color: GOLD, fontWeight: 500 }}>{p.mes}</td>
                        <td><EC val={p.boiosARS} type="number" onSave={v => updProy(p.mes, "boiosARS", v)} style={{ color: GOLD }} /></td>
                        <td><EC val={p.sonarUSD} type="number" onSave={v => updProy(p.mes, "sonarUSD", v)} style={{ color: PURPLE }} /></td>
                        <td><EC val={p.gigsEUR} type="number" onSave={v => updProy(p.mes, "gigsEUR", v)} style={{ color: BLUE }} /></td>
                        <td><EC val={p.espeisEUR} type="number" onSave={v => updProy(p.mes, "espeisEUR", v)} style={{ color: GREEN }} /></td>
                        <td style={{ color: GREEN, fontWeight: 600 }}>{fARS(total)}</td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td style={{ color: GOLD, fontWeight: 700 }}>TOTAL</td>
                    <td colSpan={4} />
                    <td style={{ color: GREEN, fontWeight: 700 }}>
                      {fARS(proyeccion.reduce((s, p) => s + p.boiosARS + p.sonarUSD * dolarBlue + p.gigsEUR * eurRate + p.espeisEUR * eurRate, 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div style={{ fontSize: 9, color: "#5a5a6e", marginTop: 6 }}>
                Conversión: USD × {fARS(dolarBlue)} (blue) · EUR × {fARS(eurRate)}
              </div>
            </div>
          </div>
        </div>

        {/* Redes */}
        <div className="cd" style={{ marginBottom: 16 }}>
          <h3>Redes Sociales · Métricas y Objetivos</h3>
          <div className="g4">
            <div>
              <div style={{ fontSize: 10, color: "#5a5a6e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>IG Followers</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: ORANGE }}>
                <EC val={social.ig_followers} type="number" onSave={v => setSocial({ ...social, ig_followers: v })} style={{ fontSize: 26 }} />
              </div>
              <div style={{ fontSize: 10, color: "#5a5a6e", marginTop: 2 }}>Meta: +{social.ig_goal} nuevos en España</div>
              <div className="pb" style={{ marginTop: 4 }}>
                <div className="pf" style={{ width: `${Math.min(100, (social.ig_followers / Math.max(1, social.ig_followers + social.ig_goal)) * 100)}%`, background: ORANGE }} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#5a5a6e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Engagement %</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: GOLD }}>
                <EC val={social.ig_engagement} type="number" onSave={v => setSocial({ ...social, ig_engagement: v })} />%
              </div>
              <div style={{ fontSize: 10, color: "#5a5a6e", marginTop: 2 }}>Benchmark: 3–5%</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#5a5a6e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Posts / Semana</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: BLUE }}>
                <EC val={social.ig_posts_week} type="number" onSave={v => setSocial({ ...social, ig_posts_week: v })} />
              </div>
              <div style={{ fontSize: 10, color: "#5a5a6e", marginTop: 2 }}>Lun · Mié · Vie</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#5a5a6e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>LinkedIn Followers</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: GREEN }}>
                <EC val={social.li_followers} type="number" onSave={v => setSocial({ ...social, li_followers: v })} />
              </div>
              <div style={{ fontSize: 10, color: "#5a5a6e", marginTop: 2 }}>Meta: +{social.li_goal} productoras</div>
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 10, color: "#5a5a6e", borderTop: "1px solid #2a2a32", paddingTop: 10 }}>
            <strong style={{ color: "#9a9aaa" }}>Hashtags:</strong>{" "}
            <EC val={social.hashtags} onSave={v => setSocial({ ...social, hashtags: v })} style={{ color: "#5a5a6e", fontSize: 10 }} />
          </div>
        </div>

        {/* Pauta */}
        <div className="cd" style={{ marginBottom: 16 }}>
          <h3>Pauta Publicitaria</h3>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead><tr><th>Proyecto</th><th>Plataforma</th><th>Presup. USD</th><th>ARS equiv.</th><th>Inicio</th><th>Fin</th><th>Objetivo</th><th>Estado</th><th /></tr></thead>
              <tbody>
                {pauta.map(p => (
                  <tr key={p.id}>
                    <td><EC val={p.proyecto} onSave={v => updP(p.id, "proyecto", v)} style={{ color: GOLD, fontWeight: 500 }} /></td>
                    <td><EC val={p.plataforma} onSave={v => updP(p.id, "plataforma", v)} /></td>
                    <td>
                      <EC val={p.presupuestoUSD} type="number" onSave={v => updP(p.id, "presupuestoUSD", v)} style={{ color: p.presupuestoUSD > 0 ? ORANGE : "#5a5a6e" }} />
                    </td>
                    <td style={{ fontSize: 10, color: "#5a5a6e" }}>{p.presupuestoUSD > 0 ? fARS(p.presupuestoUSD * dolarBlue) : "—"}</td>
                    <td><EC val={p.inicio} onSave={v => updP(p.id, "inicio", v)} style={{ fontSize: 11 }} /></td>
                    <td><EC val={p.fin} onSave={v => updP(p.id, "fin", v)} style={{ fontSize: 11 }} /></td>
                    <td><EC val={p.objetivo} onSave={v => updP(p.id, "objetivo", v)} style={{ color: CYAN, fontSize: 11 }} /></td>
                    <td><EC val={p.estado} onSave={v => updP(p.id, "estado", v)} opts={["planned", "active", "done", "paused"]} /></td>
                    <td><DelBtn onClick={() => delP(p.id)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <div className="add-btn" style={{ display: "inline-block" }} onClick={addP}>+ Agregar campaña</div>
            <div style={{ fontSize: 11, color: "#9a9aaa" }}>
              Total: <span style={{ color: ORANGE }}>USD {pauta.reduce((s, p) => s + (p.presupuestoUSD || 0), 0)}</span>
              <span style={{ fontSize: 9, color: "#5a5a6e", marginLeft: 6 }}>{fARS(pauta.reduce((s, p) => s + (p.presupuestoUSD || 0), 0) * dolarBlue)}</span>
              <span style={{ color: GREEN, marginLeft: 12 }}>ROI estimado 18x → {fARS(pauta.reduce((s, p) => s + (p.presupuestoUSD || 0), 0) * 18 * dolarBlue)}</span>
            </div>
          </div>
        </div>

        {/* Segmentación */}
        <div className="cd" style={{ marginBottom: 16 }}>
          <h3>Segmentación de Audiencias</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {segmentos.map(s => (
              <div key={s.id} style={{ background: s.color + "0a", border: `1px solid ${s.color}33`, borderRadius: 8, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 9, color: s.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.proyecto}</span>
                  <span style={{ fontSize: 9, color: "#5a5a6e" }}>{s.tamano}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#e8e8ec", marginBottom: 4 }}>{s.segmento}</div>
                <div style={{ fontSize: 10, color: "#9a9aaa", marginBottom: 6 }}>{s.plataforma} · {s.ubicacion}</div>
                <div style={{ fontSize: 10, color: "#5a5a6e", marginBottom: 8, fontStyle: "italic", lineHeight: 1.4 }}>"{s.dolor}"</div>
                <div style={{ fontSize: 11, color: s.color, borderTop: `1px solid ${s.color}22`, paddingTop: 6 }}>
                  <strong>Hook:</strong> {s.hook}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Organización */}
        <div className="cd">
          <h3>Semana Tipo · Organización</h3>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Día</th>
                  <th style={{ color: GOLD }}>Mañana</th>
                  <th style={{ color: ORANGE }}>Tarde</th>
                  <th style={{ color: PURPLE }}>Noche</th>
                </tr>
              </thead>
              <tbody>
                {semana.map((d, i) => (
                  <tr key={i}>
                    <td style={{ color: GOLD, fontWeight: 600, fontSize: 11, whiteSpace: "nowrap" }}>{d.dia}</td>
                    <td style={{ fontSize: 11 }}>{d.manana}</td>
                    <td style={{ fontSize: 11 }}>{d.tarde}</td>
                    <td style={{ fontSize: 11, color: "#9a9aaa" }}>{d.noche}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );

    // ── ESPAÑA CALENDAR ───────────────────────────────────
    case "espana": return (
      <div>
        <h2 className="pt">España 2026 · Calendar</h2>
        <p className="ps">{daysTo("2026-05-11")} días para el vuelo · 11 mayo → 9 agosto 2026 · Click en status para cambiar</p>

        <div className="g4" style={{ marginBottom: 16 }}>
          <div className="cd">
            <h3>Confirmados</h3>
            <div className="vl gold">{cGigs.length}</div>
            <div className="sub">{gigs.length} totales</div>
          </div>
          <div className="cd">
            <h3>Revenue Confirmado</h3>
            <div className="vl green">{fEUR(cGigsRev)}</div>
            <div className="sub">{fARS(cGigsRev * eurRate)}</div>
            <Usd ars={cGigsRev * eurRate} rate={dolarBlue} />
          </div>
          <div className="cd">
            <h3>Revenue Pendiente</h3>
            <div className="vl" style={{ color: ORANGE }}>{fEUR(gigs.filter(g => g.status === "pending").reduce((s, g) => s + g.amount, 0))}</div>
            <div className="sub">{gigs.filter(g => g.status === "pending").length} fechas por confirmar</div>
          </div>
          <div className="cd">
            <h3>Próxima Fecha</h3>
            <div className="vl" style={{ fontSize: 20 }}>{daysTo("2026-05-11")} días</div>
            <div className="sub">Salida · 11 mayo 2026</div>
          </div>
        </div>

        {["Mayo 2026", "Junio 2026", "Julio 2026", "Agosto 2026"].map(mes => {
          const mesGigs = gigs.filter(g => monthName(g.date) === mes);
          if (!mesGigs.length) return null;
          return (
            <div className="cd" key={mes} style={{ marginBottom: 12 }}>
              <h3>{mes}</h3>
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead><tr><th>Fecha</th><th>Ciudad</th><th>Proyecto</th><th>Con quién</th><th>Caché €</th><th>ARS est.</th><th>Status</th><th /></tr></thead>
                  <tbody>
                    {mesGigs.sort((a, b) => new Date(a.date) - new Date(b.date)).map(g => (
                      <tr key={g.id}>
                        <td><EC val={g.date} onSave={v => updGig(g.id, "date", v)} style={{ color: GOLD, fontWeight: 500 }} /></td>
                        <td><EC val={g.city} onSave={v => updGig(g.id, "city", v)} /></td>
                        <td><EC val={g.project} onSave={v => updGig(g.id, "project", v)} style={{ color: "#e8e8ec" }} /></td>
                        <td><EC val={g.who} onSave={v => updGig(g.id, "who", v)} /></td>
                        <td><EC val={g.amount} type="number" onSave={v => updGig(g.id, "amount", v)} style={{ color: GREEN }} /></td>
                        <td style={{ fontSize: 10, color: "#5a5a6e" }}>{g.amount ? fARS(g.amount * eurRate) : "—"}</td>
                        <td><StatusBadge status={g.status} onChange={() => toggleGig(g.id)} /></td>
                        <td><DelBtn onClick={() => delGig(g.id)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
        <div className="add-btn" onClick={addGig}>+ Agregar fecha</div>

        <div className="cd" style={{ marginTop: 12 }}>
          <h3>Revenue por Ciudad (€)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={["Barcelona", "Florencia", "Madrid"].map(c => ({
              name: c,
              Confirmado: gigs.filter(g => g.city === c && g.status === "confirmed").reduce((s, g) => s + g.amount, 0),
              Pendiente: gigs.filter(g => g.city === c && g.status === "pending").reduce((s, g) => s + g.amount, 0),
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a32" />
              <XAxis dataKey="name" tick={{ fill: "#5a5a6e", fontSize: 11 }} />
              <YAxis tick={{ fill: "#5a5a6e", fontSize: 11 }} />
              <Tooltip contentStyle={tt} formatter={(v, n) => [fEUR(v), n]} />
              <Bar dataKey="Confirmado" fill={GREEN} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Pendiente" fill={ORANGE} radius={[4, 4, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="ib" style={{ marginTop: 12 }}>
          <strong>Pendientes por contactar:</strong> Ksania · Brian Alt · Maxi Gallovich · Manu Estrach · Darjeeling · Martín Grossman (Pichuco/Astor) · Casa de Lovos · Marula · Jambori · Casa Astor
        </div>
      </div>
    );

    // ── ESTUDIO ESPEIS ────────────────────────────────────
    case "espeis": return (
      <div>
        <h2 className="pt">Estudio Espeis</h2>
        <p className="ps">Música y Sonido para Cine y Publicidad · Pipeline de clientes</p>

        <div className="g4" style={{ marginBottom: 16 }}>
          <div className="cd">
            <h3>Proyectos Activos</h3>
            <div className="vl green">{clients.filter(c => c.status === "active").length}</div>
          </div>
          <div className="cd">
            <h3>En Planning</h3>
            <div className="vl" style={{ color: BLUE }}>{clients.filter(c => c.status === "planning").length}</div>
          </div>
          <div className="cd">
            <h3>Leads</h3>
            <div className="vl" style={{ color: ORANGE }}>{clients.filter(c => c.status === "lead").length}</div>
          </div>
          <div className="cd">
            <h3>Pipeline € est.</h3>
            <div className="vl gold">{fEUR(clients.reduce((s, c) => s + (c.monto || 0), 0))}</div>
            <div className="sub">{fARS(clients.reduce((s, c) => s + (c.monto || 0), 0) * eurRate)}</div>
          </div>
        </div>

        <div className="cd" style={{ marginBottom: 16 }}>
          <h3>Pipeline de Clientes</h3>
          <table>
            <thead><tr><th>Cliente</th><th>Proyecto</th><th>Detalles</th><th>Monto €</th><th>ARS est.</th><th>Status</th><th /></tr></thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id}>
                  <td><EC val={c.name} onSave={v => updClient(c.id, "name", v)} style={{ color: "#e8e8ec", fontWeight: 500 }} /></td>
                  <td><EC val={c.project} onSave={v => updClient(c.id, "project", v)} /></td>
                  <td><EC val={c.details} onSave={v => updClient(c.id, "details", v)} /></td>
                  <td><EC val={c.monto} type="number" onSave={v => updClient(c.id, "monto", v)} style={{ color: GREEN }} /></td>
                  <td style={{ fontSize: 10, color: "#5a5a6e" }}>{c.monto ? fARS(c.monto * eurRate) : "—"}</td>
                  <td><EC val={c.status} onSave={v => updClient(c.id, "status", v)} opts={["active", "planning", "lead", "done"]} /></td>
                  <td><DelBtn onClick={() => delClient(c.id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="add-btn" onClick={addClient}>+ Agregar cliente</div>
        </div>

        <div className="ib">
          <strong>Pricing España:</strong> Cine indie {fEUR(500)}–{fEUR(2000)} ({fARS(500 * eurRate)}–{fARS(2000 * eurRate)}) · Publicidad {fEUR(1000)}–{fEUR(5000)} · Serie {fEUR(3000)}–{fEUR(8000)}<br />
          <strong>Un proyecto publicidad €2.000</strong> = {fARS(2000 * eurRate)} → cubre ~2 meses de gastos Europa<br />
          → LinkedIn: conectar 20 productoras Madrid/Barcelona<br />
          → Reels: proceso Ableton, before/after escenas<br />
          → Presencial: USB con reel + PDF portfolio · Target: productoras boutique con proyectos LATAM
        </div>
      </div>
    );

    // ── SONAR LUZ ─────────────────────────────────────────
    case "sonar": return (
      <div>
        <h2 className="pt">Sonar Luz</h2>
        <p className="ps">Laboratorio de Música para Imagen · Webinar en {daysTo("2026-05-14")} días (14 mayo)</p>

        <div className="g4">
          <div className="cd">
            <h3>Alumnos Inscriptos</h3>
            <div className="vl gold">0 / 8</div>
            <div className="sub">Breakeven: 6 alumnos</div>
            <div className="pb"><div className="pf" style={{ width: "0%", background: PURPLE }} /></div>
          </div>
          <div className="cd">
            <h3>Precio mensual</h3>
            <div className="vl">USD 100</div>
            <div className="sub">{fARS(100 * dolarBlue)}/mes</div>
          </div>
          <div className="cd">
            <h3>Pago completo</h3>
            <div className="vl">USD 270</div>
            <div className="sub">{fARS(270 * dolarBlue)}</div>
          </div>
          <div className="cd">
            <h3>ROI Ads est.</h3>
            <div className="vl green">18x</div>
            <div className="sub">USD 100 → USD 1.840</div>
            <div style={{ fontSize: 9, color: "#5a5a6e", marginTop: 2 }}>{fARS(1840 * dolarBlue)}</div>
          </div>
        </div>

        <div className="g2">
          <div className="cd">
            <h3>Proyección 3 Cohortes (USD)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sonarD}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a32" />
                <XAxis dataKey="n" tick={{ fill: "#5a5a6e", fontSize: 11 }} />
                <YAxis tick={{ fill: "#5a5a6e", fontSize: 11 }} />
                <Tooltip contentStyle={tt} formatter={(v, n) => ["USD " + v, n]} />
                <Bar dataKey="I" name="Ingresos" fill={PURPLE} radius={[4, 4, 0, 0]} />
                <Bar dataKey="A" name="Ads" fill={RED} radius={[4, 4, 0, 0]} opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
            {sonarD.map((d, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #2a2a32", fontSize: 11 }}>
                <span style={{ color: PURPLE }}>{d.n}</span>
                <span>USD {d.N} neto</span>
                <span style={{ fontSize: 9, color: "#5a5a6e" }}>{fARS(d.N * dolarBlue)}</span>
              </div>
            ))}
            <div style={{ marginTop: 8, fontSize: 11, color: GREEN }}>
              Total 3 cohortes: USD 12.500 · <strong>{fARS(12500 * dolarBlue)}</strong>
            </div>
          </div>
          <div className="cd">
            <h3>Embudo de Captación</h3>
            {[
              { l: "Alcance orgánico", v: "15K", p: 100 },
              { l: "Interacción", v: "300", p: 70 },
              { l: "Landing page", v: "75", p: 45 },
              { l: "Lead captado", v: "45", p: 30 },
              { l: "Webinar registrado", v: "32", p: 22 },
              { l: "Asistió al webinar", v: "16", p: 14 },
              { l: "Solicita consulta", v: "8", p: 8 },
              { l: "ALUMNO INSCRIPTO", v: "6–8", p: 5 },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 10, minWidth: 120, color: "#5a5a6e" }}>{s.l}</span>
                <div style={{ flex: 1, height: 20, background: "rgba(167,139,250,.1)", borderRadius: 4 }}>
                  <div style={{ width: `${s.p}%`, height: "100%", background: "rgba(167,139,250,.35)", borderRadius: 4, display: "flex", alignItems: "center", paddingLeft: 6, fontSize: 10, color: PURPLE, fontWeight: 600 }}>{s.v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ib">
          <strong>Plan pre-lanzamiento (6 semanas hasta 14 mayo):</strong><br />
          → Fase 1: Landing + pixel Meta + lead magnet (checklist entrega profesional)<br />
          → Fase 2: 30 DMs directos · Webinar gratuito 14 mayo (60 min)<br />
          → Fase 3: Email sequence 5 correos + cierre con urgencia de cupo (8 máx)<br />
          → Fase 4: Ads Meta USD 50–80 audiencia caliente del webinar<br />
          → ROI: {fARS(100 * dolarBlue)} en ads → {fARS(1840 * dolarBlue)} en ingresos (18x)
        </div>
      </div>
    );

    // ── BOIOS CRM ─────────────────────────────────────────
    case "boios": return (
      <div>
        <h2 className="pt">Boios de Saavedra · CRM</h2>
        <p className="ps">{boiosCRM.length} contactos · {boiosW.length} semanas · Mile 45% · Dan 20% · Ezu 35%</p>

        <div className="g4">
          <div className="cd">
            <h3>Ingresos Total</h3>
            <div className="vl gold">{fARS(tRev)}</div>
            <Usd ars={tRev} rate={dolarBlue} />
          </div>
          <div className="cd">
            <h3>Neto Total</h3>
            <div className="vl green">{fARS(tNeto)}</div>
            <Usd ars={tNeto} rate={dolarBlue} />
          </div>
          <div className="cd">
            <h3>Clientes Activos</h3>
            <div className="vl">{boiosCRM.filter(c => ["repeat", "delivered", "new_client"].includes(c.status)).length}</div>
            <div className="sub">recurrentes + nuevos</div>
          </div>
          <div className="cd">
            <h3>Leads Calientes</h3>
            <div className="vl" style={{ color: ORANGE }}>{boiosCRM.filter(c => ["new_lead", "interested"].includes(c.status)).length}</div>
            <div className="sub">por contactar ahora</div>
          </div>
        </div>

        <div className="cd" style={{ marginBottom: 16 }}>
          <h3>CRM · WhatsApp Analysis</h3>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead><tr><th>Cliente</th><th>Fecha</th><th>Status</th><th>Último Msg</th><th>Próxima Acción</th><th>Qty</th><th>Revenue ARS</th><th /></tr></thead>
              <tbody>
                {boiosCRM.sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate)).map(c => (
                  <tr key={c.id}>
                    <td><EC val={c.name} onSave={v => updB(c.id, "name", v)} style={{ color: "#e8e8ec", fontWeight: 500 }} /></td>
                    <td><EC val={c.lastDate} onSave={v => updB(c.id, "lastDate", v)} style={{ color: GOLD, fontSize: 11 }} /></td>
                    <td><EC val={c.status} onSave={v => updB(c.id, "status", v)} opts={["repeat", "delivered", "new_client", "interested", "new_lead", "cold", "inactive"]} /></td>
                    <td style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <EC val={c.lastMsg} onSave={v => updB(c.id, "lastMsg", v)} />
                    </td>
                    <td><EC val={c.nextAction} onSave={v => updB(c.id, "nextAction", v)} style={{ color: CYAN, fontSize: 11 }} /></td>
                    <td><EC val={c.totalQty} type="number" onSave={v => updB(c.id, "totalQty", v)} /></td>
                    <td>
                      <EC val={c.totalRev} type="number" onSave={v => updB(c.id, "totalRev", v)} style={{ color: GOLD }} />
                      {c.totalRev > 0 && <Usd ars={c.totalRev} rate={dolarBlue} />}
                    </td>
                    <td><DelBtn onClick={() => delB(c.id)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="add-btn" onClick={addB}>+ Agregar cliente</div>
        </div>

        <div className="g2">
          <div className="cd">
            <h3>Ventas por Semana (editable)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={bChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a32" />
                <XAxis dataKey="name" tick={{ fill: "#5a5a6e", fontSize: 10 }} />
                <YAxis tickFormatter={v => "$" + (v / 1000).toFixed(0) + "K"} tick={{ fill: "#5a5a6e", fontSize: 9 }} />
                <Tooltip contentStyle={tt} formatter={(v, n) => [fARS(v), n]} />
                <Bar dataKey="Ingreso" fill={GOLD} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Neto" fill={GREEN} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <table style={{ marginTop: 8 }}>
              <thead><tr><th>S</th><th>Qty</th><th>Revenue</th><th>Costos</th><th>Neto</th></tr></thead>
              <tbody>
                {boiosW.map(w => (
                  <tr key={w.week}>
                    <td style={{ color: GOLD }}>S{w.week}</td>
                    <td><EC val={w.qty} type="number" onSave={v => updW(w.week, "qty", v)} /></td>
                    <td>
                      <EC val={w.revenue} type="number" onSave={v => updW(w.week, "revenue", v)} style={{ color: GOLD }} />
                      <Usd ars={w.revenue} rate={dolarBlue} />
                    </td>
                    <td><EC val={w.costs} type="number" onSave={v => updW(w.week, "costs", v)} style={{ color: RED }} /></td>
                    <td style={{ color: GREEN, fontSize: 11 }}>{fARS(w.revenue - w.costs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="add-btn" onClick={addW}>+ Agregar semana</div>
          </div>
          <div className="cd">
            <h3>Top Clientes por Revenue</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={boiosCRM.filter(c => c.totalRev > 0).sort((a, b) => b.totalRev - a.totalRev).slice(0, 10).map(c => ({ name: c.name.split(" ")[0], Rev: c.totalRev }))}
                layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a32" />
                <XAxis type="number" tickFormatter={v => "$" + (v / 1000).toFixed(0) + "K"} tick={{ fill: "#5a5a6e", fontSize: 9 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#9a9aaa", fontSize: 11 }} width={70} />
                <Tooltip contentStyle={tt} formatter={(v) => [fARS(v), "Revenue"]} />
                <Bar dataKey="Rev" fill={GOLD} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ib">
          <strong>Recomendaciones:</strong><br />
          → <strong>Referidos:</strong> 2 boios gratis por cliente nuevo (Andrea ya trajo a Marcelo)<br />
          → <strong>Suscripción semanal:</strong> a los {boiosCRM.filter(c => c.status === "repeat").length} recurrentes con 5% descuento<br />
          → <strong>Packaging urgente:</strong> Roni Goldberg reportó boio aplastado en delivery<br />
          → <strong>Pre-viaje:</strong> Freezar tandas + dejar operación con Mile (45%) y Dan (20%)
        </div>
      </div>
    );

    // ── NEUROECONOMY ──────────────────────────────────────
    case "neuro": return (
      <div>
        <h2 className="pt">NeuroEconomy</h2>
        <p className="ps">Plataforma Fintech + Neurociencia · Visa Emprendedor España (Ley 14/2013)</p>

        <div className="g4">
          <div className="cd"><h3>Motor IA</h3><div className="vl gold">7 agentes</div><div className="sub">NeuroCoreEngine</div></div>
          <div className="cd"><h3>Tests</h3><div className="vl green">53/53</div><div className="sub">100% passing</div></div>
          <div className="cd"><h3>TAM</h3><div className="vl">600M+</div><div className="sub">hispanohablantes</div></div>
          <div className="cd">
            <h3>Visa España</h3>
            <div className="vl">{ckDone}/{checklist.length}</div>
            <div className="pb"><div className="pf" style={{ width: `${ckDone / checklist.length * 100}%`, background: GOLD }} /></div>
            <div className="sub">{checklist.length - ckDone} pendientes</div>
          </div>
        </div>

        <div className="g2">
          <div className="cd">
            <h3>Checklist Visa Emprendedor</h3>
            {checklist.map(c => (
              <div className="ck" key={c.id} onClick={() => toggleCk(c.id)}>
                <div className={`cb ${c.done ? "dn" : ""}`}>{c.done ? "✓" : "—"}</div>
                <span style={{ color: c.done ? "#5a5a6e" : "#e8e8ec", textDecoration: c.done ? "line-through" : "none" }}>{c.item}</span>
              </div>
            ))}
            <div className="ib" style={{ marginTop: 12 }}>
              <strong>Próximas 3 acciones críticas:</strong><br />
              {checklist.filter(c => !c.done).slice(0, 3).map((c, i) => (
                <div key={i}>→ {c.item}</div>
              ))}
            </div>
          </div>
          <div className="cd">
            <h3>Revenue 5 Años (€K)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={neuroD}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a32" />
                <XAxis dataKey="n" tick={{ fill: "#5a5a6e", fontSize: 11 }} />
                <YAxis tick={{ fill: "#5a5a6e", fontSize: 11 }} />
                <Tooltip contentStyle={tt} formatter={(v, n) => ["€" + v + "K", n]} />
                <Area type="monotone" dataKey="B2C" stackId="1" stroke={CYAN} fill="rgba(34,211,238,.15)" />
                <Area type="monotone" dataKey="B2B" stackId="1" stroke={PURPLE} fill="rgba(167,139,250,.15)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="ib" style={{ marginTop: 8 }}>
              <strong>Modelo:</strong> B2C €9,99–19,99/mes · B2B2C license fee · B2B IP licencia anual<br />
              Breakeven mes 24–28 · Pre-seed €100–200K vía UBA + Angels<br />
              500K usuarios año 5 · <strong>€8M revenue año 5</strong>
            </div>
          </div>
        </div>
      </div>
    );

    // ── FINANZAS ──────────────────────────────────────────
    case "finanzas": return (
      <div>
        <h2 className="pt">Finanzas · Consolidado</h2>
        <p className="ps">P&L cross-proyecto · Tipos de cambio editables</p>

        <div className="cd" style={{ marginBottom: 16, display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 10, color: "#5a5a6e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Dólar Blue (ARS/USD)</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <EC val={dolarBlue} type="number" onSave={setDolarBlue} style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, color: CYAN }} />
              <span style={{ color: "#5a5a6e", fontSize: 12 }}>ARS</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#5a5a6e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Euro (ARS/€)</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <EC val={eurRate} type="number" onSave={setEurRate} style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, color: BLUE }} />
              <span style={{ color: "#5a5a6e", fontSize: 12 }}>ARS</span>
            </div>
          </div>
          <div style={{ fontSize: 10, color: "#5a5a6e", borderLeft: "1px solid #2a2a32", paddingLeft: 24 }}>
            Click en los valores para editar<br />Se guardan automáticamente
          </div>
        </div>

        <div className="g4">
          <div className="cd">
            <h3>Boios Neto</h3>
            <div className="vl green">{fARS(tNeto)}</div>
            <Usd ars={tNeto} rate={dolarBlue} />
          </div>
          <div className="cd">
            <h3>Sonar Luz (obj. C1)</h3>
            <div className="vl gold">USD 2.120</div>
            <div className="sub">{fARS(2120 * dolarBlue)}</div>
          </div>
          <div className="cd">
            <h3>Gigs Confirmados</h3>
            <div className="vl">{fEUR(cGigsRev)}</div>
            <div className="sub">{fARS(cGigsRev * eurRate)}</div>
            <Usd ars={cGigsRev * eurRate} rate={dolarBlue} />
          </div>
          <div className="cd">
            <h3>Gastos España (3m)</h3>
            <div className="vl" style={{ color: RED }}>€4.300–5.800</div>
            <div className="sub">{fARS(4300 * eurRate)} – {fARS(5800 * eurRate)}</div>
          </div>
        </div>

        <div className="g2">
          <div className="cd">
            <h3>Ingresos por Proyecto (ARS equiv.)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[
                { n: "Boios", v: tNeto },
                { n: "Sonar", v: 2120 * dolarBlue },
                { n: "Gigs", v: cGigsRev * eurRate },
                { n: "Espeis", v: clients.reduce((s, c) => s + (c.monto || 0), 0) * eurRate },
                { n: "Neuro", v: 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a32" />
                <XAxis dataKey="n" tick={{ fill: "#5a5a6e", fontSize: 11 }} />
                <YAxis tickFormatter={v => "$" + (v / 1000).toFixed(0) + "K"} tick={{ fill: "#5a5a6e", fontSize: 9 }} />
                <Tooltip contentStyle={tt} formatter={(v) => [fARS(v), "Ingreso ARS"]} />
                <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                  {[GOLD, PURPLE, BLUE, GREEN, CYAN].map((c, i) => <Cell key={i} fill={c} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="cd">
            <h3>Gastos España (3 meses)</h3>
            <table>
              <thead><tr><th>Concepto</th><th>/mes €</th><th>Total €</th><th>ARS est.</th></tr></thead>
              <tbody>
                {[
                  { c: "Alojamiento", m: 700, t: 2100 },
                  { c: "Alimentación", m: 350, t: 1050 },
                  { c: "Transporte", m: 125, t: 375 },
                  { c: "Vuelos", m: 0, t: 1000 },
                  { c: "Tools / Software", m: 50, t: 150 },
                  { c: "Ads / Marketing", m: 40, t: 120 },
                  { c: "Seguro médico", m: 100, t: 300 },
                ].map((g, i) => (
                  <tr key={i}>
                    <td style={{ color: "#e8e8ec" }}>{g.c}</td>
                    <td>{g.m ? fEUR(g.m) : "—"}</td>
                    <td style={{ color: RED }}>{fEUR(g.t)}</td>
                    <td style={{ fontSize: 10, color: "#5a5a6e" }}>{fARS(g.t * eurRate)}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ color: GOLD, fontWeight: 700 }}>TOTAL</td>
                  <td />
                  <td style={{ color: RED, fontWeight: 700 }}>€5.095</td>
                  <td style={{ fontSize: 10, color: RED, fontWeight: 600 }}>{fARS(5095 * eurRate)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="ib">
          <strong>Estrategia:</strong> Boios = cash flow Argentina hasta la partida.<br />
          Sonar Luz + Gigs cubren ~50% de los gastos Europa.<br />
          Espeis = upside: un proyecto pub {fEUR(2000)} = {fARS(2000 * eurRate)} cubre un mes completo.<br />
          <strong>Reserva mínima:</strong> {fEUR(5000)} = {fARS(5000 * eurRate)} para los 3 meses.
        </div>
      </div>
    );

    // ── MARKETING ─────────────────────────────────────────
    case "marketing": return (
      <div>
        <h2 className="pt">Marketing & Social</h2>
        <p className="ps">Instagram @ezequieltarica · Estrategia por proyecto</p>

        <div className="g4">
          <div className="cd">
            <h3>Red Principal</h3>
            <div className="vl gold">Instagram</div>
            <div className="sub">@ezequieltarica</div>
          </div>
          <div className="cd">
            <h3>Frecuencia</h3>
            <div className="vl">3x/sem</div>
            <div className="sub">+ Stories diarias</div>
          </div>
          <div className="cd">
            <h3>Budget Ads Total</h3>
            <div className="vl" style={{ color: ORANGE }}>USD {pauta.reduce((s, p) => s + (p.presupuestoUSD || 0), 0)}</div>
            <div className="sub">{fARS(pauta.reduce((s, p) => s + (p.presupuestoUSD || 0), 0) * dolarBlue)}</div>
          </div>
          <div className="cd">
            <h3>Followers IG</h3>
            <div className="vl" style={{ color: ORANGE }}>
              <EC val={social.ig_followers} type="number" onSave={v => setSocial({ ...social, ig_followers: v })} />
            </div>
            <div className="sub">Meta: +{social.ig_goal} en España</div>
          </div>
        </div>

        <div className="g2">
          <div className="cd">
            <h3>Calendario Semanal de Contenido</h3>
            <table>
              <thead><tr><th>Día</th><th>Proyecto</th><th>Formato</th><th>Concepto</th></tr></thead>
              <tbody>
                {[
                  { d: "Lunes", p: "Sonar Luz", f: "Reel 30s", c: "Before/After escena" },
                  { d: "Miércoles", p: "Espeis", f: "Carrusel", c: "Portfolio + BTS" },
                  { d: "Viernes", p: "Boios/Arte", f: "Story/Reel", c: "Producto + música" },
                  { d: "Diario", p: "Todos", f: "Stories", c: "Proceso y vida" },
                ].map((r, i) => (
                  <tr key={i}>
                    <td style={{ color: GOLD }}>{r.d}</td>
                    <td>{r.p}</td>
                    <td>{r.f}</td>
                    <td style={{ fontSize: 11 }}>{r.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="cd">
            <h3>Estrategia por Proyecto</h3>
            {[
              { p: "Sonar Luz", s: "DMs + webinar + lead magnet + email sequence (5 correos)", k: "8 alumnos cohorte 1", c: PURPLE },
              { p: "Espeis", s: "LinkedIn productoras + reels Ableton + PDF portfolio presencial", k: "3 reuniones BCN/MAD", c: GREEN },
              { p: "Boios", s: "Stories producto + referidos (2 gratis por cliente nuevo) + flyer", k: "15 docenas/semana", c: GOLD },
              { p: "Arte / Gigs", s: "Stories viaje + ensayos + tag venues España · Instagram artístico", k: "+200 followers España", c: BLUE },
            ].map((s, i) => (
              <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid #2a2a32" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: s.c }}>{s.p}</span>
                <div style={{ fontSize: 11, color: "#9a9aaa", marginTop: 2 }}>{s.s}</div>
                <div style={{ fontSize: 10, color: GREEN, marginTop: 2 }}>KPI: {s.k}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="ib">
          <strong>Meta Ads LATAM benchmarks:</strong> CPM $2,50–4 · CPC $0,50–0,90 · CPL $6–12 · Show-up 40–55% · Conv. webinar 12–20%<br />
          <strong>Hashtags:</strong> <span style={{ color: "#9a9aaa" }}>{social.hashtags}</span>
        </div>
      </div>
    );

    default: return null;
    }
  };

  return (
    <>
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
.nd{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.mn{flex:1;overflow-y:auto;padding:24px 32px;background:#0a0a0c}
.pt{font-family:'Playfair Display',serif;font-size:24px;margin-bottom:2px}
.ps{font-size:12px;color:#5a5a6e;margin-bottom:20px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}
.g2{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px}
.cd{background:#111114;border:1px solid #2a2a32;border-radius:10px;padding:16px}
.cd h3{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#5a5a6e;margin-bottom:8px}
.vl{font-family:'Playfair Display',serif;font-size:26px;color:#e8e8ec;line-height:1.2}
.vl.gold{color:#d4a853}.vl.green{color:#4ade80}
.sub{font-size:11px;color:#9a9aaa;margin-top:3px}
table{width:100%;border-collapse:collapse;font-size:12px}
th{text-align:left;padding:8px 10px;border-bottom:1px solid #2a2a32;color:#5a5a6e;font-weight:500;font-size:10px;text-transform:uppercase;letter-spacing:1px}
td{padding:8px 10px;border-bottom:1px solid rgba(42,42,50,.4);color:#9a9aaa;vertical-align:top}
tr:hover td{background:rgba(212,168,83,.02)}
.ib{background:rgba(212,168,83,.08);border:1px solid rgba(212,168,83,.2);border-radius:8px;padding:14px;font-size:12px;color:#d4a853;line-height:1.7;margin-top:12px}
.ib strong{color:#e8e8ec}
.add-btn{background:rgba(212,168,83,.1);border:1px dashed #d4a853;border-radius:8px;padding:10px;text-align:center;cursor:pointer;color:#d4a853;font-size:12px;font-weight:500;margin-top:8px;transition:all .15s}
.add-btn:hover{background:rgba(212,168,83,.2)}
.pb{height:5px;background:#222228;border-radius:3px;overflow:hidden;margin-top:6px}
.pf{height:100%;border-radius:3px;transition:width .4s}
.ck{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(42,42,50,.3);font-size:12px;cursor:pointer}
.cb{width:16px;height:16px;border-radius:4px;border:2px solid #2a2a32;display:flex;align-items:center;justify-content:center;font-size:10px;color:#4ade80;flex-shrink:0}
.cb.dn{background:rgba(74,222,128,.15);border-color:#4ade80}
.exp-bar{display:flex;gap:6px;flex-wrap:wrap;padding:8px 16px;border-top:1px solid #2a2a32}
.exp-btn{background:none;border:1px solid #2a2a32;color:#9a9aaa;border-radius:6px;padding:5px 12px;font-size:11px;cursor:pointer;font-family:'DM Sans',sans-serif}
.exp-btn:hover{border-color:#d4a853;color:#d4a853}
@media(max-width:768px){
  .sb{width:56px;min-width:56px}
  .sb-brand h1,.sb-brand p,.ni span:not(.nd){display:none}
  .ni{justify-content:center;padding:12px}
  .mn{padding:16px}
  .g4,.g3{grid-template-columns:repeat(2,1fr)}
  .g2{grid-template-columns:1fr}
}
      `}</style>
      <div className="app">
        <nav className="sb">
          <div className="sb-brand">
            <h1>IEJEZKEL</h1>
            <p>España 2026</p>
          </div>
          {pages.map(p => (
            <div key={p.id} className={`ni ${page === p.id ? "on" : ""}`} onClick={() => setPage(p.id)}>
              <div className="nd" style={{ background: p.color }} />
              <span>{p.label}</span>
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div className="exp-bar">
            <button className="exp-btn" onClick={exportAll}>⬇ Backup</button>
            <label className="exp-btn" style={{ cursor: "pointer" }}>
              ⬆ Importar
              <input type="file" accept=".json" onChange={importAll} style={{ display: "none" }} />
            </label>
          </div>
          <div style={{ padding: "8px 16px", fontSize: 9, color: "#5a5a6e" }}>
            <div style={{ color: "#d4a853", fontSize: 10 }}>May → Ago · BCN · FLR · MAD</div>
            <div style={{ marginTop: 2 }}>Auto-guardado local</div>
          </div>
        </nav>
        <main className="mn">{R()}</main>
      </div>
    </>
  );
}
