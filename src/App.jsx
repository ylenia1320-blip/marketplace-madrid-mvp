import React, { useState } from "react";
import {
  Sparkles, MapPin, Calendar, Clock, Euro, Users, ArrowRight, Check,
  FileText, X, ChevronLeft, Star, Building2, UserRound, Ticket, Send
} from "lucide-react";

// ---------------------------------------------------------------------------
// Design tokens (carried from the project's legal document branding)
// Navy  #1B2A4A  — authority, contracts, structure
// Gold  #B8860B  — premium / private-parties tier
// Teal  #0F6E6E  — active state, confirmed match
// Cream #FBF9F4  — page ground
// ---------------------------------------------------------------------------

const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500&family=Work+Sans:wght@400;500;600;700&display=swap');
    .font-display { font-family: 'Fraunces', serif; }
    .font-body { font-family: 'Work Sans', sans-serif; }
  `}</style>
);

const seedProfiles = [
  { id: "p1", name: "Carla M.", age: 24, city: "Madrid", rate: 25, bio: "3 años de experiencia en imagen para discotecas del centro." },
  { id: "p2", name: "Elena R.", age: 27, city: "Madrid", rate: 30, bio: "Azafata de eventos corporativos, inglés C1." },
];

const seedEvents = [
  {
    id: "e1", clientName: "Discoteca Aura", type: "discoteca",
    venue: "Aura Club", date: "2026-07-18", time: "23:00 - 05:00",
    location: "Calle Velázquez, Madrid", budget: 120, spots: 2,
    functions: "Recepción de VIPs y animación de pista principal.",
    applicants: ["p1"], selected: null,
  },
  {
    id: "e2", clientName: "Grupo Corporate Events", type: "corporativo",
    venue: "Palacio de Congresos", date: "2026-07-22", time: "09:00 - 14:00",
    location: "Paseo de la Castellana, Madrid", budget: 180, spots: 3,
    functions: "Acreditación de asistentes y azafatas de sala en congreso fintech.",
    applicants: [], selected: null,
  },
];

const TYPE_LABEL = { discoteca: "Discoteca", corporativo: "Evento corporativo", private: "Private party" };
const TYPE_COLOR = {
  discoteca: { bg: "#DCEFEF", text: "#0F6E6E", border: "#0F6E6E" },
  corporativo: { bg: "#E9EDF4", text: "#1B2A4A", border: "#1B2A4A" },
  private: { bg: "#F5E6C8", text: "#8A6205", border: "#B8860B" },
};

function TicketDivider() {
  return (
    <div className="relative h-4 flex items-center">
      <div className="absolute left-[-14px] w-7 h-7 rounded-full bg-[#FBF9F4]" />
      <div className="absolute right-[-14px] w-7 h-7 rounded-full bg-[#FBF9F4]" />
      <div className="w-full border-t border-dashed" style={{ borderColor: "#C9C2AE" }} />
    </div>
  );
}

function Badge({ children, type }) {
  const c = TYPE_COLOR[type];
  return (
    <span
      className="font-body text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {children}
    </span>
  );
}

function EventTicket({ event, profiles, children }) {
  const c = TYPE_COLOR[event.type];
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border" style={{ borderColor: "#E5E0D3" }}>
      <div className="p-5" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge type={event.type}>{TYPE_LABEL[event.type]}</Badge>
            <h3 className="font-display text-xl mt-2" style={{ color: "#1B2A4A" }}>{event.venue}</h3>
            <p className="font-body text-sm text-stone-500">{event.clientName}</p>
          </div>
          <div className="text-right font-body">
            <div className="flex items-center gap-1 justify-end text-sm font-semibold" style={{ color: c.text }}>
              <Euro size={14} /> {event.budget}/evento
            </div>
            <p className="text-xs text-stone-400 mt-0.5">{event.spots} plazas</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-y-2 font-body text-sm text-stone-600">
          <div className="flex items-center gap-1.5"><Calendar size={14} className="text-stone-400" /> {event.date}</div>
          <div className="flex items-center gap-1.5"><Clock size={14} className="text-stone-400" /> {event.time}</div>
          <div className="flex items-center gap-1.5 col-span-2"><MapPin size={14} className="text-stone-400" /> {event.location}</div>
        </div>
        <p className="font-body text-sm text-stone-500 mt-3 leading-relaxed">{event.functions}</p>
      </div>

      <div className="px-5"><TicketDivider /></div>

      <div className="p-5 pt-4" style={{ backgroundColor: "#FCFAF6" }}>{children}</div>
    </div>
  );
}

function StepFlow({ active }) {
  const steps = [
    { n: 1, label: "Publicar evento", icon: Building2 },
    { n: 2, label: "Profesionales aplican", icon: UserRound },
    { n: 3, label: "Selección / match", icon: Check },
    { n: 4, label: "Contrato generado", icon: FileText },
  ];
  return (
    <div className="flex items-center justify-between font-body">
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <div className="flex flex-col items-center gap-1.5 text-center w-20">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center border-2"
              style={{
                borderColor: active >= s.n ? "#B8860B" : "#DAD3C0",
                backgroundColor: active >= s.n ? "#B8860B" : "transparent",
                color: active >= s.n ? "#fff" : "#B0A88E",
              }}
            >
              <s.icon size={16} />
            </div>
            <span className="text-[11px] leading-tight" style={{ color: active >= s.n ? "#1B2A4A" : "#B0A88E" }}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-[2px] mb-5" style={{ backgroundColor: active > s.n ? "#B8860B" : "#E5E0D3" }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function loadJsPDF() {
  return new Promise((resolve, reject) => {
    if (window.jspdf) return resolve(window.jspdf);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => resolve(window.jspdf);
    script.onerror = () => reject(new Error("No se pudo cargar el generador de PDF"));
    document.head.appendChild(script);
  });
}

function buildContractPdf({ jsPDF, event, profile, today }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = 56;

  const NAVY = [27, 42, 74];
  const GOLD = [184, 134, 11];
  const GREY = [90, 90, 90];

  // Header bar
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.text("Anexo I + Contrato de Prestación de Servicios", margin, 42);
  y = 100;

  // Anexo I box
  doc.setFillColor(245, 230, 200);
  doc.roundedRect(margin, y, contentW, 100, 6, 6, "F");
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("ANEXO I — DATOS DEL EVENTO", margin + 14, y + 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const anexoLines = [
    `Cliente: ${event.clientName}`,
    `Ubicación: ${event.venue}, ${event.location}`,
    `Fecha: ${event.date}    Horario: ${event.time}`,
    `Funciones: ${event.functions}`,
    `Precio pactado: ${event.budget} € (IVA no incluido)`,
  ];
  let ay = y + 38;
  anexoLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, contentW - 28);
    doc.text(wrapped, margin + 14, ay);
    ay += wrapped.length * 12;
  });
  y += 116;

  // Contract body
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...GOLD);
  doc.text("CONTRATO DE PRESTACIÓN DE SERVICIOS", margin, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(40, 40, 40);

  const paragraphs = [
    `En Madrid, a ${today}, de una parte ${profile.name}, mayor de edad, en su condición de trabajadora autónoma, en adelante "la Profesional"; de otra, ${event.clientName}, en adelante "el Cliente".`,
    `Artículo 1. Objeto. La Profesional se obliga a prestar al Cliente el servicio descrito en el Anexo I, a cambio del precio allí pactado.`,
    `Artículo 2. Naturaleza mercantil. La Profesional presta sus servicios con plena autonomía e independencia organizativa, sin sujeción a horario impuesto más allá de la duración del evento, por lo que este contrato tiene naturaleza de arrendamiento de servicios (arts. 1544 y ss. Código Civil).`,
    `Artículo 3. Pago. El Cliente abonará el importe pactado contra factura emitida por la Profesional. La comisión de intermediación de la Plataforma se factura de forma independiente.`,
  ];

  paragraphs.forEach((para) => {
    const wrapped = doc.splitTextToSize(para, contentW);
    if (y + wrapped.length * 13 > 760) {
      doc.addPage();
      y = 56;
    }
    doc.text(wrapped, margin, y);
    y += wrapped.length * 13 + 10;
  });

  // Signatures
  y += 30;
  if (y > 740) {
    doc.addPage();
    y = 80;
  }
  doc.setDrawColor(...GREY);
  doc.line(margin, y, margin + 180, y);
  doc.line(pageW - margin - 180, y, pageW - margin, y);
  doc.setFontSize(9);
  doc.setTextColor(...GREY);
  doc.text("La Profesional", margin, y + 14);
  doc.text("El Cliente", pageW - margin - 180, y + 14);

  // Footer note
  doc.setFontSize(7.5);
  doc.setTextColor(...GREY);
  doc.text(
    "Documento generado automáticamente a partir de la plantilla legal del proyecto. Requiere firma de ambas partes para su validez.",
    margin, 812
  );

  return doc;
}

function ContractPreview({ event, profile, onClose }) {
  const today = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState("");

  async function handleDownload() {
    setDownloading(true);
    setPdfError("");
    try {
      const { jsPDF } = await loadJsPDF();
      const doc = buildContractPdf({ jsPDF, event, profile, today });
      const safeName = `${event.venue}_${profile.name}`.replace(/[^a-zA-Z0-9]+/g, "_");
      doc.save(`Contrato_${safeName}.pdf`);
    } catch (err) {
      console.error(err);
      setPdfError("No se pudo generar el PDF. Comprueba tu conexión e inténtalo de nuevo.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(27,42,74,0.55)" }}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="p-5 flex items-center justify-between border-b" style={{ borderColor: "#E5E0D3" }}>
          <div className="flex items-center gap-2">
            <FileText size={18} style={{ color: "#B8860B" }} />
            <h3 className="font-display text-lg" style={{ color: "#1B2A4A" }}>Anexo I + Contrato generado</h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
        </div>
        <div className="p-6 font-body text-sm text-stone-700 leading-relaxed space-y-4">
          <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: "#B8860B" }}>Anexo I — Datos del evento</p>
          <div className="rounded-lg p-4 space-y-1.5" style={{ backgroundColor: "#FBF9F4" }}>
            <p><strong>Cliente:</strong> {event.clientName}</p>
            <p><strong>Ubicación:</strong> {event.venue}, {event.location}</p>
            <p><strong>Fecha:</strong> {event.date} · <strong>Horario:</strong> {event.time}</p>
            <p><strong>Funciones:</strong> {event.functions}</p>
            <p><strong>Precio pactado:</strong> {event.budget} € (IVA no incluido)</p>
          </div>

          <p className="text-xs uppercase tracking-wide font-semibold pt-2" style={{ color: "#B8860B" }}>Contrato de prestación de servicios</p>
          <p>En Madrid, a {today}, de una parte <strong>{profile.name}</strong>, mayor de edad, en su condición de trabajadora autónoma, en adelante "la Profesional"; de otra, <strong>{event.clientName}</strong>, en adelante "el Cliente".</p>
          <p><strong>Artículo 1. Objeto.</strong> La Profesional se obliga a prestar al Cliente el servicio descrito en el Anexo I, a cambio del precio allí pactado.</p>
          <p><strong>Artículo 2. Naturaleza mercantil.</strong> La Profesional presta sus servicios con plena autonomía e independencia organizativa, sin sujeción a horario impuesto más allá de la duración del evento, por lo que este contrato tiene naturaleza de arrendamiento de servicios (arts. 1544 y ss. Código Civil).</p>
          <p><strong>Artículo 3. Pago.</strong> El Cliente abonará el importe pactado contra factura emitida por la Profesional. La comisión de intermediación de la Plataforma se factura de forma independiente.</p>
          <p className="text-xs text-stone-400 pt-2">Documento generado automáticamente a partir de la plantilla legal del proyecto. Requiere firma de ambas partes para su validez.</p>
        </div>
        <div className="p-5 border-t flex flex-col gap-2" style={{ borderColor: "#E5E0D3" }}>
          {pdfError && <p className="text-xs font-body" style={{ color: "#C0392B" }}>{pdfError}</p>}
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="font-body text-sm font-semibold px-5 py-2.5 rounded-full"
              style={{ color: "#1B2A4A", border: "1px solid #E5E0D3" }}
            >
              Cerrar
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 font-body text-sm font-semibold px-5 py-2.5 rounded-full text-white disabled:opacity-60"
              style={{ backgroundColor: "#B8860B" }}
            >
              <FileText size={14} /> {downloading ? "Generando PDF…" : "Descargar PDF"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState(null); // 'cliente' | 'profesional'
  const [profiles, setProfiles] = useState([]);
  const [events, setEvents] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [myProfileId, setMyProfileId] = useState(null);
  const [registerForm, setRegisterForm] = useState({ name: "", age: "", city: "Madrid", rate: "", bio: "" });
  const [eventForm, setEventForm] = useState({
    clientName: "", type: "discoteca", venue: "", date: "", time: "",
    location: "", budget: "", spots: "1", functions: "",
  });
  const [contractView, setContractView] = useState(null); // { event, profile }
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  // Load data on mount (falls back to seed data if nothing stored yet)
  React.useEffect(() => {
    try {
      const p = localStorage.getItem("marketplace_profiles");
      const e = localStorage.getItem("marketplace_events");
      setProfiles(p ? JSON.parse(p) : seedProfiles);
      setEvents(e ? JSON.parse(e) : seedEvents);
    } catch (err) {
      console.error("Storage load error:", err);
      setProfiles(seedProfiles);
      setEvents(seedEvents);
    } finally {
      setLoaded(true);
    }
  }, []);

  function persist(nextProfiles, nextEvents) {
    setSaving(true);
    try {
      if (nextProfiles !== undefined) localStorage.setItem("marketplace_profiles", JSON.stringify(nextProfiles));
      if (nextEvents !== undefined) localStorage.setItem("marketplace_events", JSON.stringify(nextEvents));
    } catch (err) {
      console.error("Storage save error:", err);
    } finally {
      setTimeout(() => setSaving(false), 250);
    }
  }

  const myProfile = profiles.find((p) => p.id === myProfileId);

  function flash(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center font-body" style={{ backgroundColor: "#FBF9F4" }}>
        {FONTS}
        <div className="flex items-center gap-2 text-sm" style={{ color: "#1B2A4A" }}>
          <Sparkles size={16} style={{ color: "#B8860B" }} className="animate-pulse" /> Cargando datos guardados…
        </div>
      </div>
    );
  }


  function handleRegister(e) {
    e.preventDefault();
    if (!registerForm.name || !registerForm.age || !registerForm.rate) return;
    const id = "p" + Date.now();
    const newProfile = { id, ...registerForm, age: Number(registerForm.age), rate: Number(registerForm.rate) };
    const next = [...profiles, newProfile];
    setProfiles(next);
    setMyProfileId(id);
    persist(next, undefined);
    flash("Perfil creado y guardado. Ya puedes aplicar a eventos.");
  }

  function handlePostEvent(e) {
    e.preventDefault();
    if (!eventForm.clientName || !eventForm.venue || !eventForm.date) return;
    const id = "e" + Date.now();
    const next = [{ id, ...eventForm, budget: Number(eventForm.budget), spots: Number(eventForm.spots), applicants: [], selected: null }, ...events];
    setEvents(next);
    setEventForm({ clientName: "", type: "discoteca", venue: "", date: "", time: "", location: "", budget: "", spots: "1", functions: "" });
    persist(undefined, next);
    flash("Evento publicado y guardado.");
  }

  function applyToEvent(eventId) {
    const next = events.map((ev) => (ev.id === eventId && !ev.applicants.includes(myProfileId)
      ? { ...ev, applicants: [...ev.applicants, myProfileId] }
      : ev));
    setEvents(next);
    persist(undefined, next);
    flash("Aplicación enviada y guardada.");
  }

  function selectApplicant(eventId, profileId) {
    const next = events.map((ev) => (ev.id === eventId ? { ...ev, selected: profileId } : ev));
    setEvents(next);
    persist(undefined, next);
    flash("Match confirmado. Contrato generado.");
  }

  // ---------------- ROLE SELECT ----------------
  if (!role) {
    return (
      <div className="min-h-screen font-body" style={{ backgroundColor: "#FBF9F4" }}>
        {FONTS}
        <div className="max-w-3xl mx-auto px-6 pt-20 pb-16">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <Ticket size={18} style={{ color: "#B8860B" }} />
            <span className="font-body text-xs tracking-[0.2em] uppercase font-semibold" style={{ color: "#B8860B" }}>
              Prototipo MVP — Madrid
            </span>
          </div>
          <h1 className="font-display text-center text-4xl md:text-5xl leading-tight" style={{ color: "#1B2A4A" }}>
            El intermediario que faltaba<br />entre <em>imagen</em> y <em>evento</em>.
          </h1>
          <p className="font-body text-center text-stone-500 mt-5 max-w-lg mx-auto">
            Match en tiempo real entre discotecas, eventos corporativos y profesionales de imagen, con contrato generado automáticamente al cerrar el trato.
          </p>

          <div className="mt-14 mb-10">
            <StepFlow active={0} />
          </div>

          <div className="grid sm:grid-cols-2 gap-5 mt-10">
            <button
              onClick={() => setRole("cliente")}
              className="group text-left p-6 rounded-2xl border-2 bg-white transition hover:shadow-md"
              style={{ borderColor: "#E5E0D3" }}
            >
              <Building2 size={22} style={{ color: "#1B2A4A" }} />
              <h3 className="font-display text-xl mt-3" style={{ color: "#1B2A4A" }}>Soy Cliente</h3>
              <p className="font-body text-sm text-stone-500 mt-1">Discoteca, empresa de eventos o particular. Publica un evento y selecciona candidatas.</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-semibold" style={{ color: "#B8860B" }}>
                Entrar <ArrowRight size={14} className="group-hover:translate-x-0.5 transition" />
              </div>
            </button>

            <button
              onClick={() => setRole("profesional")}
              className="group text-left p-6 rounded-2xl border-2 bg-white transition hover:shadow-md"
              style={{ borderColor: "#E5E0D3" }}
            >
              <UserRound size={22} style={{ color: "#0F6E6E" }} />
              <h3 className="font-display text-xl mt-3" style={{ color: "#1B2A4A" }}>Soy Profesional</h3>
              <p className="font-body text-sm text-stone-500 mt-1">Modelo de imagen o azafata. Regístrate y aplica a eventos disponibles.</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-semibold" style={{ color: "#0F6E6E" }}>
                Entrar <ArrowRight size={14} className="group-hover:translate-x-0.5 transition" />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- CLIENTE VIEW ----------------
  if (role === "cliente") {
    return (
      <div className="min-h-screen font-body" style={{ backgroundColor: "#FBF9F4" }}>
        {FONTS}
        <Header role="cliente" onBack={() => setRole(null)} saving={saving} />
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
          <div className="mb-2"><StepFlow active={events.some(e => e.applicants.length) ? 2 : 1} /></div>

          <section className="bg-white rounded-2xl p-6 border" style={{ borderColor: "#E5E0D3" }}>
            <h2 className="font-display text-xl mb-4" style={{ color: "#1B2A4A" }}>Publicar evento</h2>
            <form onSubmit={handlePostEvent} className="grid sm:grid-cols-2 gap-3">
              <Input label="Nombre del cliente / local" value={eventForm.clientName} onChange={(v) => setEventForm({ ...eventForm, clientName: v })} />
              <Select label="Tipo" value={eventForm.type} onChange={(v) => setEventForm({ ...eventForm, type: v })}
                options={[["discoteca", "Discoteca"], ["corporativo", "Evento corporativo"], ["private", "Private party (premium)"]]} />
              <Input label="Nombre del evento / venue" value={eventForm.venue} onChange={(v) => setEventForm({ ...eventForm, venue: v })} />
              <Input label="Ubicación" value={eventForm.location} onChange={(v) => setEventForm({ ...eventForm, location: v })} />
              <Input label="Fecha" type="date" value={eventForm.date} onChange={(v) => setEventForm({ ...eventForm, date: v })} />
              <Input label="Horario" placeholder="23:00 - 05:00" value={eventForm.time} onChange={(v) => setEventForm({ ...eventForm, time: v })} />
              <Input label="Presupuesto por persona (€)" type="number" value={eventForm.budget} onChange={(v) => setEventForm({ ...eventForm, budget: v })} />
              <Input label="Plazas" type="number" value={eventForm.spots} onChange={(v) => setEventForm({ ...eventForm, spots: v })} />
              <div className="sm:col-span-2">
                <Textarea label="Funciones a desempeñar" value={eventForm.functions} onChange={(v) => setEventForm({ ...eventForm, functions: v })} />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button type="submit" className="flex items-center gap-2 font-body text-sm font-semibold px-5 py-2.5 rounded-full text-white" style={{ backgroundColor: "#1B2A4A" }}>
                  <Send size={14} /> Publicar evento
                </button>
              </div>
            </form>
          </section>

          <section>
            <h2 className="font-display text-xl mb-4" style={{ color: "#1B2A4A" }}>Mis eventos</h2>
            <div className="space-y-5">
              {events.filter(e => e.clientName).map((ev) => (
                <EventTicket key={ev.id} event={ev}>
                  {ev.selected ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-body font-semibold" style={{ color: "#0F6E6E" }}>
                        <Check size={16} /> Match confirmado: {profiles.find(p => p.id === ev.selected)?.name}
                      </div>
                      <button
                        onClick={() => setContractView({ event: ev, profile: profiles.find(p => p.id === ev.selected) })}
                        className="text-xs font-semibold underline" style={{ color: "#1B2A4A" }}
                      >
                        Ver contrato
                      </button>
                    </div>
                  ) : ev.applicants.length === 0 ? (
                    <p className="font-body text-sm text-stone-400">Aún sin aplicaciones.</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-body text-xs font-semibold uppercase tracking-wide text-stone-400">Candidatas ({ev.applicants.length})</p>
                      {ev.applicants.map((pid) => {
                        const p = profiles.find(pp => pp.id === pid);
                        if (!p) return null;
                        return (
                          <div key={pid} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ backgroundColor: "#F2EFE6" }}>
                            <div className="font-body text-sm">
                              <span className="font-semibold" style={{ color: "#1B2A4A" }}>{p.name}</span>
                              <span className="text-stone-500"> · {p.age} años · {p.rate} €/evento</span>
                            </div>
                            <button
                              onClick={() => selectApplicant(ev.id, pid)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-full text-white"
                              style={{ backgroundColor: "#B8860B" }}
                            >
                              Seleccionar
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </EventTicket>
              ))}
            </div>
          </section>
        </div>
        {toast && <Toast text={toast} />}
        {contractView && <ContractPreview event={contractView.event} profile={contractView.profile} onClose={() => setContractView(null)} />}
      </div>
    );
  }

  // ---------------- PROFESIONAL VIEW ----------------
  if (!myProfile) {
    return (
      <div className="min-h-screen font-body" style={{ backgroundColor: "#FBF9F4" }}>
        {FONTS}
        <Header role="profesional" onBack={() => setRole(null)} saving={saving} />
        <div className="max-w-md mx-auto px-6 py-10">
          <h2 className="font-display text-2xl mb-1" style={{ color: "#1B2A4A" }}>Crear perfil</h2>
          <p className="font-body text-sm text-stone-500 mb-6">Verificación de identidad simulada en este prototipo.</p>
          <form onSubmit={handleRegister} className="bg-white rounded-2xl p-6 border space-y-3" style={{ borderColor: "#E5E0D3" }}>
            <Input label="Nombre" value={registerForm.name} onChange={(v) => setRegisterForm({ ...registerForm, name: v })} />
            <Input label="Edad" type="number" value={registerForm.age} onChange={(v) => setRegisterForm({ ...registerForm, age: v })} />
            <Input label="Ciudad" value={registerForm.city} onChange={(v) => setRegisterForm({ ...registerForm, city: v })} />
            <Input label="Tarifa por evento (€)" type="number" value={registerForm.rate} onChange={(v) => setRegisterForm({ ...registerForm, rate: v })} />
            <Textarea label="Bio breve" value={registerForm.bio} onChange={(v) => setRegisterForm({ ...registerForm, bio: v })} />
            <button type="submit" className="w-full font-body text-sm font-semibold px-5 py-2.5 rounded-full text-white mt-2" style={{ backgroundColor: "#0F6E6E" }}>
              Crear perfil y ver eventos
            </button>
          </form>
        </div>
        {toast && <Toast text={toast} />}
      </div>
    );
  }

  const myEvents = events.filter(e => e.selected === myProfile.id);
  const openEvents = events.filter(e => e.selected !== myProfile.id);

  return (
    <div className="min-h-screen font-body" style={{ backgroundColor: "#FBF9F4" }}>
      {FONTS}
      <Header role="profesional" onBack={() => setRole(null)} name={myProfile.name} saving={saving} />
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <div className="mb-2"><StepFlow active={myEvents.length ? 3 : 2} /></div>

        {myEvents.length > 0 && (
          <section>
            <h2 className="font-display text-xl mb-4" style={{ color: "#1B2A4A" }}>Confirmados</h2>
            <div className="space-y-5">
              {myEvents.map((ev) => (
                <EventTicket key={ev.id} event={ev}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-body font-semibold" style={{ color: "#0F6E6E" }}>
                      <Check size={16} /> Evento confirmado
                    </div>
                    <button
                      onClick={() => setContractView({ event: ev, profile: myProfile })}
                      className="text-xs font-semibold underline" style={{ color: "#1B2A4A" }}
                    >
                      Ver contrato
                    </button>
                  </div>
                </EventTicket>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="font-display text-xl mb-4" style={{ color: "#1B2A4A" }}>Eventos disponibles</h2>
          <div className="space-y-5">
            {openEvents.map((ev) => {
              const applied = ev.applicants.includes(myProfile.id);
              return (
                <EventTicket key={ev.id} event={ev}>
                  <div className="flex items-center justify-between">
                    <p className="font-body text-xs text-stone-400">{ev.applicants.length} candidata(s) aplicada(s)</p>
                    <button
                      disabled={applied}
                      onClick={() => applyToEvent(ev.id)}
                      className="text-xs font-semibold px-4 py-2 rounded-full text-white disabled:opacity-50"
                      style={{ backgroundColor: applied ? "#A8A296" : "#B8860B" }}
                    >
                      {applied ? "Ya has aplicado" : "Aplicar"}
                    </button>
                  </div>
                </EventTicket>
              );
            })}
          </div>
        </section>
      </div>
      {toast && <Toast text={toast} />}
      {contractView && <ContractPreview event={contractView.event} profile={contractView.profile} onClose={() => setContractView(null)} />}
    </div>
  );
}

function Header({ role, onBack, name, saving }) {
  return (
    <div className="border-b bg-white" style={{ borderColor: "#E5E0D3" }}>
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 font-body text-sm text-stone-500 hover:text-stone-700">
          <ChevronLeft size={16} /> Cambiar rol
        </button>
        <div className="flex items-center gap-3">
          <span className="font-body text-[11px]" style={{ color: saving ? "#B8860B" : "#B0A88E" }}>
            {saving ? "Guardando…" : "Guardado"}
          </span>
          <div className="flex items-center gap-2">
            {role === "cliente" ? <Building2 size={15} style={{ color: "#1B2A4A" }} /> : <UserRound size={15} style={{ color: "#0F6E6E" }} />}
            <span className="font-body text-sm font-semibold" style={{ color: "#1B2A4A" }}>
              {role === "cliente" ? "Panel Cliente" : `Panel Profesional${name ? " · " + name : ""}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block">
      <span className="font-body text-xs font-semibold text-stone-500">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border px-3 py-2 font-body text-sm focus:outline-none focus:ring-2"
        style={{ borderColor: "#E5E0D3" }}
      />
    </label>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="font-body text-xs font-semibold text-stone-500">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="mt-1 w-full rounded-lg border px-3 py-2 font-body text-sm focus:outline-none focus:ring-2"
        style={{ borderColor: "#E5E0D3" }}
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="font-body text-xs font-semibold text-stone-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border px-3 py-2 font-body text-sm bg-white focus:outline-none focus:ring-2"
        style={{ borderColor: "#E5E0D3" }}
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

function Toast({ text }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 font-body text-sm text-white px-4 py-2.5 rounded-full shadow-lg" style={{ backgroundColor: "#1B2A4A" }}>
        <Sparkles size={14} style={{ color: "#B8860B" }} /> {text}
      </div>
    </div>
  );
}
