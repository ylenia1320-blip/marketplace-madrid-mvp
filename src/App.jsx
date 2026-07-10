import React, { useState } from "react";
import {
  Sparkles, MapPin, Calendar, Clock, Euro, Users, ArrowRight, Check,
  FileText, X, ChevronLeft, Star, Building2, UserRound, Ticket, Send, Lock, Camera
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
  { id: "p1", name: "Carla M.", age: 24, city: "Madrid", rate: 25, bio: "3 años de experiencia en imagen para discotecas del centro.", photo: null },
  { id: "p2", name: "Elena R.", age: 27, city: "Madrid", rate: 30, bio: "Azafata de eventos corporativos, inglés C1.", photo: null },
];

const seedEvents = [
  {
    id: "e1", clientName: "Discoteca Aura", type: "discoteca",
    venue: "Aura Club", date: "2026-07-18", time: "23:00 - 05:00",
    city: "Madrid", location: "Calle Velázquez, Madrid", budget: 120, spots: 2,
    functions: "Recepción de VIPs y animación de pista principal.",
    applicants: ["p1"], selected: null,
  },
  {
    id: "e2", clientName: "Grupo Corporate Events", type: "corporativo",
    venue: "Palacio de Congresos", date: "2026-07-22", time: "09:00 - 14:00",
    city: "Madrid", location: "Paseo de la Castellana, Madrid", budget: 180, spots: 3,
    functions: "Acreditación de asistentes y azafatas de sala en congreso fintech.",
    applicants: [], selected: null,
  },
];

const CITY_OPTIONS = ["Madrid", "Barcelona", "Marbella", "Valencia", "Murcia"];

const TYPE_LABEL = { discoteca: "Discoteca", corporativo: "Evento corporativo", private: "Private party", vip: "VIP / Privado" };
const TYPE_COLOR = {
  discoteca: { bg: "#DCEFEF", text: "#0F6E6E", border: "#0F6E6E" },
  corporativo: { bg: "#E9EDF4", text: "#1B2A4A", border: "#1B2A4A" },
  private: { bg: "#F5E6C8", text: "#8A6205", border: "#B8860B" },
  vip: { bg: "#1B2A4A", text: "#FFFFFF", border: "#1B2A4A" },
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

function readAndResizeImage(file, maxSize = 480, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("No se pudo procesar la imagen"));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Mínimo legal SMI 2026 (RD 126/2026) para contratos de duración determinada
// inferiores a 120 días: 57,82 €/jornada legal (referencia: jornada de 8h).
// No sustituye la comprobación del convenio sectorial específico (discotecas,
// que puede fijar un mínimo superior vía "contrato de bolo") — ver aviso en el formulario.
const SMI_JORNADA_MIN = 57.82;
const SMI_HORA_MIN = SMI_JORNADA_MIN / 8;

function parseEventHours(timeStr) {
  if (!timeStr) return null;
  // Extrae los dos primeros patrones HH:MM del texto, sea cual sea el separador
  // que use la persona ("23:00 - 05:00", "23:00 a 5:00", "de 23h a 5h", etc.)
  const matches = [...timeStr.matchAll(/(\d{1,2}):?(\d{2})?\s*h?/gi)]
    .map((m) => ({ h: parseInt(m[1], 10), min: m[2] ? parseInt(m[2], 10) : 0 }))
    .filter((t) => t.h >= 0 && t.h <= 23 && t.min >= 0 && t.min <= 59);
  if (matches.length < 2) return null;
  const start = matches[0].h * 60 + matches[0].min;
  const end = matches[1].h * 60 + matches[1].min;
  let diff = end - start;
  if (diff <= 0) diff += 24 * 60; // cruza medianoche
  if (diff <= 0 || diff > 20 * 60) return null; // resultado poco razonable, descartar
  return diff / 60;
}

function legalMinimumForEvent(timeStr) {
  const hours = parseEventHours(timeStr);
  if (!hours) return null;
  return { hours, minimum: Math.round(hours * SMI_HORA_MIN * 100) / 100 };
}

// Lista de horas en intervalos de 30 min, para los desplegables de horario (sin ambigüedad de formato).
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

function Avatar({ name, photo, size = 40 }) {
  const initials = (name || "?").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size, border: "1px solid #E5E0D3" }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-body font-semibold"
      style={{ width: size, height: size, backgroundColor: "#1B2A4A", color: "#F5E6C8", fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

function EventTicket({ event, profiles, children, revealed = true }) {
  const c = TYPE_COLOR[event.type];
  const isMasked = event.confidential && !revealed;
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border" style={{ borderColor: "#E5E0D3" }}>
      <div className="p-5" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge type={event.type}>{TYPE_LABEL[event.type]}</Badge>
              {event.confidential && (
                <span className="flex items-center gap-1 font-body text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#B8860B" }}>
                  <Lock size={11} /> Confidencial
                </span>
              )}
            </div>
            <h3 className="font-display text-xl mt-2" style={{ color: "#1B2A4A" }}>
              {isMasked ? "Evento privado" : event.venue}
            </h3>
            <p className="font-body text-sm text-stone-500">
              {isMasked ? "Detalles disponibles solo por invitación" : event.clientName}
            </p>
          </div>
          <div className="text-right font-body">
            <div className="flex items-center gap-1 justify-end text-sm font-semibold" style={{ color: c.text === "#FFFFFF" ? "#1B2A4A" : c.text }}>
              {isMasked || !event.budget ? (
                <span className="text-stone-400 italic text-xs">A negociar</span>
              ) : (
                <><Euro size={14} /> {event.budget}/evento</>
              )}
            </div>
            <p className="text-xs text-stone-400 mt-0.5">{event.spots} plazas</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-y-2 font-body text-sm text-stone-600">
          <div className="flex items-center gap-1.5"><Calendar size={14} className="text-stone-400" /> {event.date}</div>
          <div className="flex items-center gap-1.5"><Clock size={14} className="text-stone-400" /> {event.time}</div>
          <div className="flex items-center gap-1.5 col-span-2">
            <MapPin size={14} className="text-stone-400" />
            {isMasked ? "Ubicación se confirma tras selección" : event.location}
          </div>
        </div>
        <p className="font-body text-sm text-stone-500 mt-3 leading-relaxed">
          {isMasked ? "Este evento requiere discreción. Aplica y, si tu perfil encaja, recibirás el resto de detalles directamente." : event.functions}
        </p>
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

// Parte un texto en líneas que caben en un ancho máximo (pdf-lib no lo hace de forma nativa).
// Extrae las dos horas (HH:MM) de un texto de horario libre, sea cual sea el
// separador usado ("23:00 - 05:00", "23:00 a 5:00", "de 23h a 5h", etc.).
function extractTimes(timeStr) {
  if (!timeStr) return [null, null];
  const matches = [...timeStr.matchAll(/(\d{1,2}):?(\d{2})?\s*h?/gi)]
    .map((m) => ({ h: parseInt(m[1], 10), min: m[2] ? parseInt(m[2], 10) : 0 }))
    .filter((t) => t.h >= 0 && t.h <= 23 && t.min >= 0 && t.min <= 59);
  if (matches.length < 2) return [null, null];
  const fmt = (t) => `${String(t.h).padStart(2, "0")}:${String(t.min).padStart(2, "0")}`;
  return [fmt(matches[0]), fmt(matches[1])];
}

function wrapText(text, font, size, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = "";
  words.forEach((word) => {
    const test = current ? current + " " + word : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function loadPdfLib() {
  return new Promise((resolve, reject) => {
    if (window.PDFLib) return resolve(window.PDFLib);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js";
    script.onload = () => resolve(window.PDFLib);
    script.onerror = () => reject(new Error("No se pudo cargar el generador de PDF"));
    document.head.appendChild(script);
  });
}

// Genera el contrato real: una portada con los datos del evento ya rellenados,
// seguida de las páginas ORIGINALES e intactas del modelo oficial del SEPE
// (contrato artístico de duración determinada, códigos 407/507).
async function buildOfficialContractPdf({ PDFLib, event, profile, today }) {
  const { PDFDocument, rgb, StandardFonts } = PDFLib;

  const baseBytes = await fetch("/contrato-base-sepe.pdf").then((r) => {
    if (!r.ok) throw new Error("No se encontró el documento base del SEPE");
    return r.arrayBuffer();
  });
  const baseDoc = await PDFDocument.load(baseBytes);

  const outDoc = await PDFDocument.create();
  const fontRegular = await outDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await outDoc.embedFont(StandardFonts.HelveticaBold);

  const NAVY = rgb(27 / 255, 42 / 255, 74 / 255);
  const GOLD = rgb(184 / 255, 134 / 255, 11 / 255);
  const GOLD_LIGHT = rgb(245 / 255, 230 / 255, 200 / 255);
  const GREY = rgb(90 / 255, 90 / 255, 90 / 255);
  const DARK = rgb(0.15, 0.15, 0.15);

  // ---------- Portada de datos (generada) ----------
  const page = outDoc.addPage([595.28, 841.89]);
  const { width: pageW, height: pageH } = page.getSize();
  const margin = 48;

  page.drawRectangle({ x: 0, y: pageH - 70, width: pageW, height: 70, color: NAVY });
  page.drawText("Datos para cumplimentar el contrato oficial", {
    x: margin, y: pageH - 34, size: 15, font: fontBold, color: rgb(1, 1, 1),
  });
  page.drawText("Contrato artístico de duración determinada — SEPE, códigos 407/507 (RD 1435/1985)", {
    x: margin, y: pageH - 50, size: 9, font: fontRegular, color: rgb(1, 1, 1),
  });

  let y = pageH - 100;

  function drawNote(text, size = 9, color = DARK, font = fontRegular) {
    page.drawText(text, { x: margin, y, size, font, color });
    y -= size + 8;
  }
  function drawField(label, value) {
    page.drawText(`${label}: `, { x: margin, y, size: 10, font: fontBold, color: NAVY });
    const labelW = fontBold.widthOfTextAtSize(`${label}: `, 10);
    page.drawText(String(value), { x: margin + labelW, y, size: 10, font: fontRegular, color: DARK });
    y -= 18;
  }

  // Caja de aviso
  page.drawRectangle({ x: margin, y: y - 74, width: pageW - margin * 2, height: 74, color: GOLD_LIGHT });
  page.drawText("Esta portada es un resumen orientativo, generado automáticamente.", {
    x: margin + 12, y: y - 16, size: 9.5, font: fontBold, color: NAVY,
  });
  page.drawText("Las páginas siguientes son el documento ORIGINAL del SEPE, sin modificar.", {
    x: margin + 12, y: y - 32, size: 9, font: fontRegular, color: DARK,
  });
  page.drawText("Traslada estos datos a los campos en blanco/puntos del formulario oficial", {
    x: margin + 12, y: y - 47, size: 9, font: fontRegular, color: DARK,
  });
  page.drawText("(a mano, o con un editor de PDF) antes de firmarlo.", {
    x: margin + 12, y: y - 61, size: 9, font: fontRegular, color: DARK,
  });
  y -= 100;

  drawNote("DATOS DEL EVENTO", 10.5, NAVY, fontBold);
  drawField("Cliente final", event.billingEntity || event.clientName);
  drawField("Ubicación", `${event.venue}, ${event.location}`);
  drawField("Fecha", event.date);
  drawField("Horario", event.time);
  drawField("Funciones", event.functions);
  drawField("Retribución bruta pactada", `${event.budget} €`);
  y -= 12;

  drawNote("DATOS DE LA TRABAJADORA", 10.5, NAVY, fontBold);
  drawField("Nombre", profile.name);
  drawField("Edad", `${profile.age} años`);
  drawField("Ciudad", profile.city);
  y -= 12;

  drawNote("DATOS DE LA EMPRESA", 10.5, NAVY, fontBold);
  drawField("Razón social", "[COMPLETAR — NOMBRE COMERCIAL / RAZÓN SOCIAL]");
  drawField("NIF/CIF", "[COMPLETAR]");
  y -= 12;

  drawField("Documento generado el", today);

  page.drawText(
    "A partir de aquí: páginas 1, 2, 3, 13 y 22 del modelo oficial \"Contrato de Trabajo Temporal\" del SEPE (www.sepe.es).",
    { x: margin, y: 40, size: 7.5, font: fontRegular, color: GREY }
  );

  // ---------- Páginas reales del SEPE, copiadas sin alterar ----------
  const officialPageIndices = baseDoc.getPageIndices();
  const copiedPages = await outDoc.copyPages(baseDoc, officialPageIndices);
  copiedPages.forEach((p) => outDoc.addPage(p));

  // ---------------------------------------------------------------------
  // Relleno automático de los huecos del formulario oficial (no manual).
  // Coordenadas obtenidas del propio PDF original (595.28 x 841.89 pt).
  // ---------------------------------------------------------------------
  const [startTime, endTime] = extractTimes(event.time);
  const eventDateStr = event.date || "";
  const fillColor = rgb(27 / 255, 42 / 255, 74 / 255);
  const fillFont = fontRegular;
  const fillSize = 8.5;

  // Página 1 del formulario oficial (Cláusulas PRIMERA-CUARTA): copiedPages[0]
  const page1 = copiedPages[0];
  const page1H = page1.getHeight();
  // SEGUNDA — horario: "...prestadas de ___, a ___,"
  if (startTime) page1.drawText(startTime, { x: 440, y: page1H - 635 - 8, size: fillSize, font: fillFont, color: fillColor });
  if (endTime) page1.drawText(endTime, { x: 79, y: page1H - 645 - 8, size: fillSize, font: fillFont, color: fillColor });
  // TERCERA — duración: "...se extenderá desde ___, hasta ___."
  if (eventDateStr) {
    page1.drawText(eventDateStr, { x: 291, y: page1H - 714 - 9, size: fillSize, font: fillFont, color: fillColor });
    page1.drawText(eventDateStr, { x: 423, y: page1H - 714 - 9, size: fillSize, font: fillFont, color: fillColor });
  }
  // CUARTA — retribución: "...percibirá una retribución total de ___ euros brutos..."
  if (event.budget) {
    page1.drawText(String(event.budget), { x: 264, y: page1H - 743 - 9, size: fillSize, font: fillFont, color: fillColor });
  }

  // Página 4 del extracto (cláusula específica artística, original pág. 13): copiedPages[3]
  const page4 = copiedPages[3];
  const page4H = page4.getHeight();
  const causa = `Prestación del servicio de imagen/azafata para el evento organizado por ${event.billingEntity || event.clientName} en ${event.venue}.`;
  const causaWrapped = wrapText(causa, fillFont, fillSize, 330);
  causaWrapped.forEach((line, i) => {
    page4.drawText(line, { x: 200, y: page4H - 362.3 - 9 - i * 11, size: fillSize, font: fillFont, color: fillColor });
  });
  const duracionTexto = `Un (1) día — ${eventDateStr}${startTime ? `, de ${startTime} a ${endTime || "fin del evento"}` : ""}.`;
  page4.drawText(duracionTexto, { x: 192, y: page4H - 388.3 - 9, size: fillSize, font: fillFont, color: fillColor });
  // Marca "Personal Técnico y Auxiliar" (categoría aplicable a modelos/azafatas de imagen)
  page4.drawText("X", { x: 72, y: page4H - 454.5 - 9, size: 10, font: fontBold, color: fillColor });
  if (event.functions) {
    const funcWrapped = wrapText(event.functions, fillFont, fillSize, 450);
    funcWrapped.slice(0, 2).forEach((line, i) => {
      page4.drawText(line, { x: 95, y: page4H - 486.3 - 9 - i * 11, size: fillSize, font: fillFont, color: fillColor });
    });
  }

  return outDoc;
}


// Genera el Acuerdo de Confidencialidad (NDA), adaptado del modelo oficial
// de la Oficina Española de Patentes y Marcas (OEPM), para eventos confidenciales.
function buildConfidentialityPdf({ jsPDF, event, profile, today }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = 56;

  const NAVY = [27, 42, 74];
  const GOLD = [184, 134, 11];
  const GREY = [90, 90, 90];
  const DARK = [40, 40, 40];

  function ensureSpace(needed) {
    if (y + needed > 780) {
      doc.addPage();
      y = 56;
    }
  }
  function renderParagraph(text, opts = {}) {
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.size || 9.5);
    doc.setTextColor(...(opts.color || DARK));
    const wrapped = doc.splitTextToSize(text, contentW);
    ensureSpace(wrapped.length * 13 + 6);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 13 + (opts.spaceAfter ?? 10);
  }
  function renderClauseTitle(text) {
    ensureSpace(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    doc.text(text, margin, y);
    y += 16;
  }
  function renderBullets(items) {
    items.forEach((item) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(...DARK);
      const wrapped = doc.splitTextToSize(item, contentW - 16);
      ensureSpace(wrapped.length * 13 + 4);
      doc.text("•", margin, y);
      doc.text(wrapped, margin + 14, y);
      y += wrapped.length * 13 + 4;
    });
    y += 4;
  }

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("times", "bold");
  doc.setFontSize(17);
  doc.text("Acuerdo de Confidencialidad", margin, 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Adaptado del modelo oficial de la Oficina Española de Patentes y Marcas (OEPM)", margin, 50);
  y = 100;

  const empresa = event.billingEntity || "[NOMBRE COMERCIAL / RAZÓN SOCIAL DE LA EMPRESA]";

  renderParagraph(`En Madrid, a ${today}`, { spaceAfter: 8 });
  renderParagraph("REUNIDOS", { bold: true, color: NAVY, spaceAfter: 8 });
  renderParagraph(`De una parte, ${empresa}, en adelante "la Empresa".`);
  renderParagraph(`De otra parte, ${profile.name}, mayor de edad, con NIF [NIF], en adelante "la Profesional".`);
  renderParagraph('La Empresa y la Profesional recibirán la denominación de "la Parte" por separado y "las Partes" de forma conjunta.');
  renderParagraph("MANIFIESTAN", { bold: true, color: NAVY, spaceAfter: 8 });
  renderParagraph(`I. Que la Empresa opera una plataforma de contratación de profesionales de imagen y azafatas para eventos.`);
  renderParagraph(`II. Que la Profesional ha sido contratada para el evento organizado en ${event.venue}, ${event.location}, el ${event.date}, en los términos del contrato de trabajo suscrito entre ambas partes.`);
  renderParagraph("III. Que, con motivo de dicho evento, la Profesional podrá tener acceso a información relativa a la identidad de los asistentes, la ubicación y otros detalles de carácter privado.");
  renderParagraph("IV. Que las Partes desean proteger dicha información de su uso y divulgación no autorizados, y a tal efecto firman el presente Acuerdo, con arreglo a las siguientes:", { spaceAfter: 14 });
  renderParagraph("CLÁUSULAS", { bold: true, color: GOLD, size: 11, spaceAfter: 10 });

  renderClauseTitle("1. Objeto");
  renderParagraph("Este Acuerdo regula el tratamiento de la Información Confidencial a la que la Profesional tenga acceso con motivo de su prestación de servicios en el evento.");

  renderClauseTitle("2. Definición de Información Confidencial");
  renderParagraph('Se entiende por "Información Confidencial" la identidad de los asistentes, organizadores y anfitriones; la ubicación y detalles logísticos del evento; cualquier imagen, grabación o situación presenciada durante el mismo; y cualquier dato personal o de contexto de los asistentes.');

  renderClauseTitle("3. Obligaciones de la Profesional");
  renderBullets([
    "Utilizar la Información Confidencial de forma reservada.",
    "No divulgar ni comunicar la Información Confidencial a terceros, incluyendo otras profesionales, amistades o familiares.",
    "No captar fotografías ni grabaciones de audio o vídeo del evento, salvo autorización expresa y por escrito de la Empresa.",
    "No publicar ni insinuar en redes sociales o cualquier medio información relativa al evento.",
    "Utilizar la Información Confidencial exclusivamente para la correcta prestación de su servicio.",
  ]);

  renderClauseTitle("4. Excepciones");
  renderParagraph("La Profesional podrá usar o difundir información que sea de conocimiento público sin mediar incumplimiento, que ya conociera con anterioridad, o que deba comunicar por requerimiento legal o judicial, notificándolo a la Empresa con la mayor antelación posible.");

  renderClauseTitle("5. Propiedad de la información");
  renderParagraph("La Información Confidencial es de propiedad exclusiva de la Empresa y del Cliente del evento. Este Acuerdo no supone cesión ni licencia de derechos sobre la misma.");

  renderClauseTitle("6. Duración");
  renderParagraph("Las obligaciones de confidencialidad tienen carácter indefinido y continuarán en vigor incluso tras la finalización de la relación laboral, hasta que la información sea de dominio público sin que medie incumplimiento de la Profesional.");

  renderClauseTitle("7. Incumplimiento");
  renderParagraph("La Empresa tendrá derecho a reclamar ante los tribunales competentes una indemnización por los daños y perjuicios causados por la divulgación o uso no autorizado de la Información Confidencial, sin perjuicio de la cláusula penal que, en su caso, se pacte en el Anexo II.");

  renderClauseTitle("8. Ley aplicable y jurisdicción");
  renderParagraph("Este Acuerdo se rige por la legislación española. Para cualquier controversia, ambas partes se someten a los Juzgados y Tribunales de Madrid capital.", { spaceAfter: 20 });

  renderParagraph("Y en prueba de conformidad, firman el presente Acuerdo por duplicado y a un solo efecto en el lugar y fecha indicados.", { spaceAfter: 40 });

  ensureSpace(40);
  doc.setDrawColor(...GREY);
  doc.line(margin, y, margin + 180, y);
  doc.line(pageW - margin - 180, y, pageW - margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GREY);
  doc.text("La Profesional", margin, y + 14);
  doc.text("La Empresa", pageW - margin - 180, y + 14);

  doc.setFontSize(7.5);
  doc.setTextColor(...GREY);
  doc.text(
    "Adaptado del modelo oficial de la OEPM (www.oepm.es). Se recomienda asesoramiento legal para su adaptación definitiva.",
    margin, 812
  );

  return doc;
}

function ContractPreview({ event, profile, onClose }) {
  const today = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
  const [downloading, setDownloading] = useState(false);
  const [downloadingNda, setDownloadingNda] = useState(false);
  const [pdfError, setPdfError] = useState("");

  async function handleDownload() {
    setDownloading(true);
    setPdfError("");
    try {
      const PDFLib = await loadPdfLib();
      const outDoc = await buildOfficialContractPdf({ PDFLib, event, profile, today });
      const bytes = await outDoc.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const safeName = `${event.venue}_${profile.name}`.replace(/[^a-zA-Z0-9]+/g, "_");
      const a = document.createElement("a");
      a.href = url;
      a.download = `Contrato_Oficial_${safeName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setPdfError("No se pudo generar el PDF. Comprueba tu conexión e inténtalo de nuevo.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleDownloadNda() {
    setDownloadingNda(true);
    setPdfError("");
    try {
      const { jsPDF } = await loadJsPDF();
      const doc = buildConfidentialityPdf({ jsPDF, event, profile, today });
      const safeName = `${event.venue}_${profile.name}`.replace(/[^a-zA-Z0-9]+/g, "_");
      doc.save(`Confidencialidad_${safeName}.pdf`);
    } catch (err) {
      console.error(err);
      setPdfError("No se pudo generar el PDF. Comprueba tu conexión e inténtalo de nuevo.");
    } finally {
      setDownloadingNda(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(27,42,74,0.55)" }}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="p-5 flex items-center justify-between border-b" style={{ borderColor: "#E5E0D3" }}>
          <div className="flex items-center gap-2">
            <FileText size={18} style={{ color: "#B8860B" }} />
            <h3 className="font-display text-lg" style={{ color: "#1B2A4A" }}>Anexo I + Contrato de trabajo generado</h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
        </div>
        <div className="p-6 font-body text-sm text-stone-700 leading-relaxed space-y-4">
          <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: "#B8860B" }}>Anexo I — Datos del evento</p>
          <div className="rounded-lg p-4 space-y-1.5" style={{ backgroundColor: "#FBF9F4" }}>
            <p><strong>Cliente final:</strong> {event.billingEntity || event.clientName}</p>
            <p><strong>Ubicación:</strong> {event.venue}, {event.location}</p>
            <p><strong>Fecha:</strong> {event.date} · <strong>Horario:</strong> {event.time}</p>
            <p><strong>Funciones:</strong> {event.functions}</p>
            <p><strong>Salario bruto pactado:</strong> {event.budget} € (antes de retenciones)</p>
          </div>

          <p className="text-xs uppercase tracking-wide font-semibold pt-2" style={{ color: "#B8860B" }}>Contrato de trabajo — Artista de un día (RD 1435/1985)</p>
          <p>En Madrid, a {today}.</p>
          <p className="font-semibold" style={{ color: "#1B2A4A" }}>REUNIDOS</p>
          <p>De una parte, <strong>[NOMBRE COMERCIAL / RAZÓN SOCIAL DE LA EMPRESA]</strong>, con NIF/CIF [NIF/CIF], en su condición de empleadora, en adelante "la Empresa".</p>
          <p>De otra parte, <strong>{profile.name}</strong>, mayor de edad, con NIF [NIF] y número de afiliación a la Seguridad Social [NAF], en adelante "la Trabajadora".</p>
          <p>Ambas partes se reconocen mutua capacidad legal para contratar y, a tal efecto,</p>
          <p className="font-semibold" style={{ color: "#1B2A4A" }}>EXPONEN</p>
          <p>Que la Empresa ha sido contratada por <strong>{event.billingEntity || event.clientName}</strong> para prestar el servicio descrito en el Anexo I, y que necesita para ello los servicios profesionales de la Trabajadora para el evento correspondiente.</p>
          <p>Y en su virtud, ACUERDAN suscribir el presente contrato de trabajo especial de artistas en espectáculos públicos, con arreglo a las siguientes:</p>

          <p><strong>Artículo 1. Objeto y régimen jurídico.</strong> La Trabajadora prestará a la Empresa el servicio descrito en el Anexo I, bajo la relación laboral especial de artistas en espectáculos públicos regulada por el Real Decreto 1435/1985, de 1 de agosto.</p>
          <p><strong>Artículo 2. Duración.</strong> El presente contrato tiene una duración de un (1) día, coincidente con la fecha del evento. La Trabajadora queda dada de alta en el régimen correspondiente de la Seguridad Social desde el inicio de la jornada y de baja a su finalización.</p>
          <p><strong>Artículo 3. Retribución.</strong> La Trabajadora percibirá la cantidad indicada en el Anexo I en concepto de salario bruto, sobre la que se aplicarán las retenciones de IRPF y cotizaciones a la Seguridad Social legalmente establecidas. La Empresa hará entrega de la nómina correspondiente en el plazo legal.</p>
          <p className="text-xs text-stone-400">La retribución pactada cumple el salario mínimo interprofesional vigente para contratos de duración determinada inferiores a 120 días (57,82 €/jornada legal, RD 126/2026), sin perjuicio de la tabla salarial específica que, en su caso, establezca el convenio colectivo sectorial aplicable.</p>
          <p><strong>Artículo 4. Cancelaciones.</strong> En caso de cancelación del evento por causas ajenas a la Trabajadora con menos de 48-72 horas de antelación, la Empresa abonará la compensación pactada. En caso de que la Trabajadora no pueda acudir tras confirmar, deberá comunicarlo con la mayor antelación posible.</p>
          <p><strong>Artículo 5. Obligaciones de la Trabajadora.</strong> Prestar el servicio con la diligencia profesional habitual; cumplir el horario y ubicación pactados; respetar el código de conducta e imagen razonablemente exigido para el evento.</p>
          <p><strong>Artículo 6. Obligaciones de la Empresa.</strong> Dar de alta a la Trabajadora en la Seguridad Social antes del inicio de la jornada; facilitar las condiciones adecuadas para la prestación del servicio; abonar la retribución pactada y emitir la nómina en el plazo legal.</p>
          <p><strong>Artículo 7. Protección de datos e imagen.</strong> La Empresa se compromete a utilizar cualquier imagen o dato personal de la Trabajadora exclusivamente para los fines aquí previstos, respetando la Ley Orgánica 1/1982 y la normativa de protección de datos.</p>
          <p><strong>Artículo 8. Legislación y jurisdicción.</strong> Este contrato se rige por el Real Decreto 1435/1985 y demás normativa laboral española aplicable. Para cualquier controversia, ambas partes se someten a los Juzgados de lo Social de Madrid capital.</p>
          <p className="text-xs text-stone-400 pt-2">Documento generado automáticamente a partir de la plantilla legal del proyecto. Requiere firma de ambas partes para su validez.</p>
        </div>
        <div className="p-5 border-t flex flex-col gap-2" style={{ borderColor: "#E5E0D3" }}>
          {pdfError && <p className="text-xs font-body" style={{ color: "#C0392B" }}>{pdfError}</p>}
          <div className="flex justify-end gap-2 flex-wrap">
            <button
              onClick={onClose}
              className="font-body text-sm font-semibold px-5 py-2.5 rounded-full"
              style={{ color: "#1B2A4A", border: "1px solid #E5E0D3" }}
            >
              Cerrar
            </button>
            {event.confidential && (
              <button
                onClick={handleDownloadNda}
                disabled={downloadingNda}
                className="flex items-center gap-2 font-body text-sm font-semibold px-5 py-2.5 rounded-full disabled:opacity-60"
                style={{ color: "#1B2A4A", border: "1px solid #1B2A4A" }}
              >
                <Lock size={14} /> {downloadingNda ? "Generando…" : "Descargar Confidencialidad"}
              </button>
            )}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 font-body text-sm font-semibold px-5 py-2.5 rounded-full text-white disabled:opacity-60"
              style={{ backgroundColor: "#B8860B" }}
            >
              <FileText size={14} /> {downloading ? "Generando PDF…" : "Descargar contrato oficial"}
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
  const [cityFilter, setCityFilter] = useState("Todas");

  React.useEffect(() => {
    if (myProfileId) {
      const p = profiles.find((pp) => pp.id === myProfileId);
      if (p?.city) setCityFilter(p.city);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myProfileId]);
  const [registerForm, setRegisterForm] = useState({ name: "", age: "", city: "Madrid", rate: "", bio: "", photo: null, photos: [], height: "", languages: "" });
  const [photoError, setPhotoError] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);
  const [eventForm, setEventForm] = useState({
    clientName: "", type: "discoteca", venue: "", date: "", timeStart: "", timeEnd: "",
    city: "Madrid", location: "", budget: "", spots: "1", functions: "",
    confidential: false, billingEntity: "",
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
    if (!registerForm.photo) {
      setPhotoError("Sube una foto de perfil para continuar — es lo primero que verán los Clientes.");
      return;
    }
    const id = "p" + Date.now();
    const newProfile = {
      id, ...registerForm,
      age: Number(registerForm.age),
      rate: Number(registerForm.rate),
      height: registerForm.height ? Number(registerForm.height) : null,
    };
    const next = [...profiles, newProfile];
    setProfiles(next);
    setMyProfileId(id);
    persist(next, undefined);
    flash("Perfil creado y guardado. Ya puedes aplicar a eventos.");
  }

  async function handlePhotoChange(file) {
    if (!file) return;
    setPhotoError("");
    setPhotoLoading(true);
    try {
      const dataUrl = await readAndResizeImage(file);
      setRegisterForm((f) => ({ ...f, photo: dataUrl }));
    } catch (err) {
      console.error(err);
      setPhotoError("No se pudo procesar la foto. Prueba con otra imagen.");
    } finally {
      setPhotoLoading(false);
    }
  }

  async function handleGalleryPhotoChange(file) {
    if (!file) return;
    if (registerForm.photos.length >= 4) {
      setPhotoError("Máximo 4 fotos adicionales.");
      return;
    }
    setPhotoError("");
    setPhotoLoading(true);
    try {
      const dataUrl = await readAndResizeImage(file);
      setRegisterForm((f) => ({ ...f, photos: [...f.photos, dataUrl] }));
    } catch (err) {
      console.error(err);
      setPhotoError("No se pudo procesar la foto. Prueba con otra imagen.");
    } finally {
      setPhotoLoading(false);
    }
  }

  function removeGalleryPhoto(index) {
    setRegisterForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== index) }));
  }

  function handlePostEvent(e) {
    e.preventDefault();
    if (!eventForm.clientName || !eventForm.venue || !eventForm.date) return;
    const id = "e" + Date.now();
    const combinedTime = eventForm.timeStart && eventForm.timeEnd ? `${eventForm.timeStart} - ${eventForm.timeEnd}` : "";
    const next = [{ id, ...eventForm, time: combinedTime, budget: eventForm.budget ? Number(eventForm.budget) : null, spots: Number(eventForm.spots), applicants: [], selected: null }, ...events];
    setEvents(next);
    setEventForm({ clientName: "", type: "discoteca", venue: "", date: "", timeStart: "", timeEnd: "", city: "Madrid", location: "", budget: "", spots: "1", functions: "", confidential: false, billingEntity: "" });
    persist(undefined, next);
    flash(eventForm.confidential ? "Evento privado publicado — solo visible por invitación." : "Evento publicado y guardado.");
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
              <Select label="Tipo" value={eventForm.type}
                onChange={(v) => setEventForm({ ...eventForm, type: v, confidential: v === "vip" ? true : eventForm.confidential })}
                options={[["discoteca", "Discoteca"], ["corporativo", "Evento corporativo"], ["private", "Private party (premium)"], ["vip", "VIP / Privado (a medida)"]]} />
              <Input label="Nombre del evento / venue" value={eventForm.venue} onChange={(v) => setEventForm({ ...eventForm, venue: v })} />
              <Select label="Ciudad" value={eventForm.city} onChange={(v) => setEventForm({ ...eventForm, city: v })}
                options={CITY_OPTIONS.map((c) => [c, c])} />
              <Input label="Ubicación" value={eventForm.location} onChange={(v) => setEventForm({ ...eventForm, location: v })} />
              <Input label="Fecha" type="date" value={eventForm.date} onChange={(v) => setEventForm({ ...eventForm, date: v })} />
              <Select label="Hora de entrada" value={eventForm.timeStart} onChange={(v) => setEventForm({ ...eventForm, timeStart: v })}
                options={[["", "Selecciona"], ...TIME_OPTIONS.map((t) => [t, t])]} />
              <Select label="Hora de salida" value={eventForm.timeEnd} onChange={(v) => setEventForm({ ...eventForm, timeEnd: v })}
                options={[["", "Selecciona"], ...TIME_OPTIONS.map((t) => [t, t])]} />
              <div>
                <Input
                  label={eventForm.type === "vip" ? "Presupuesto (opcional, a negociar)" : "Presupuesto por persona (€)"}
                  type="number" value={eventForm.budget} onChange={(v) => setEventForm({ ...eventForm, budget: v })}
                />
                {(() => {
                  if (eventForm.type === "vip" || !eventForm.budget || !eventForm.timeStart || !eventForm.timeEnd) return null;
                  const legal = legalMinimumForEvent(`${eventForm.timeStart} - ${eventForm.timeEnd}`);
                  if (!legal) return null;
                  const belowMinimum = Number(eventForm.budget) < legal.minimum;
                  return (
                    <p className="font-body text-[11px] mt-1" style={{ color: belowMinimum ? "#C0392B" : "#0F6E6E" }}>
                      {belowMinimum
                        ? `⚠ Por debajo del mínimo legal (SMI 2026): ${legal.minimum} € para ${legal.hours.toFixed(1)}h. Revísalo antes de publicar.`
                        : `✓ Cumple el mínimo legal orientativo (${legal.minimum} € para ${legal.hours.toFixed(1)}h).`}
                    </p>
                  );
                })()}
              </div>
              <Input label="Plazas" type="number" value={eventForm.spots} onChange={(v) => setEventForm({ ...eventForm, spots: v })} />
              <div className="sm:col-span-2">
                <Textarea label="Funciones a desempeñar" value={eventForm.functions} onChange={(v) => setEventForm({ ...eventForm, functions: v })} />
              </div>

              {eventForm.type === "vip" && (
                <div className="sm:col-span-2 rounded-xl p-4 space-y-3" style={{ backgroundColor: "#F2EFE6" }}>
                  <div className="flex items-center gap-2">
                    <Lock size={14} style={{ color: "#B8860B" }} />
                    <p className="font-body text-xs font-semibold" style={{ color: "#1B2A4A" }}>Evento confidencial</p>
                  </div>
                  <label className="flex items-start gap-2 font-body text-xs text-stone-600">
                    <input
                      type="checkbox"
                      checked={eventForm.confidential}
                      onChange={(e) => setEventForm({ ...eventForm, confidential: e.target.checked })}
                      className="mt-0.5"
                    />
                    Ocultar cliente, ubicación y precio a las Profesionales hasta que yo seleccione manualmente a quién invitar.
                  </label>
                  <Input
                    label="Nombre para factura (si es distinto del cliente, ej. representante o agencia)"
                    value={eventForm.billingEntity}
                    onChange={(v) => setEventForm({ ...eventForm, billingEntity: v })}
                    placeholder="Opcional — se usará en el contrato/factura en vez del nombre del cliente"
                  />
                  <p className="font-body text-[11px] text-stone-500 leading-relaxed">
                    La factura sigue siendo obligatoria siempre. Esto solo cambia a qué nombre se emite (el del cliente o el de su representante/agencia si esa es la vía real de cobro), nunca elimina la factura.
                  </p>
                </div>
              )}

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
                          <div key={pid} className="rounded-lg px-3 py-2 space-y-2" style={{ backgroundColor: "#F2EFE6" }}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar name={p.name} photo={p.photo} size={36} />
                                <div className="font-body text-sm">
                                  <span className="font-semibold" style={{ color: "#1B2A4A" }}>{p.name}</span>
                                  <span className="text-stone-500"> · {p.age} años{p.height ? ` · ${p.height} cm` : ""} · {p.rate} €/evento</span>
                                  {p.languages && <p className="text-xs text-stone-400">{p.languages}</p>}
                                </div>
                              </div>
                              <button
                                onClick={() => selectApplicant(ev.id, pid)}
                                className="text-xs font-semibold px-3 py-1.5 rounded-full text-white flex-shrink-0"
                                style={{ backgroundColor: "#B8860B" }}
                              >
                                Seleccionar
                              </button>
                            </div>
                            {p.photos && p.photos.length > 0 && (
                              <div className="flex gap-1.5 pl-[52px]">
                                {p.photos.map((photo, i) => (
                                  <img key={i} src={photo} alt="" className="rounded object-cover" style={{ width: 32, height: 32 }} />
                                ))}
                              </div>
                            )}
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
            <div>
              <span className="font-body text-xs font-semibold text-stone-500">Foto de perfil</span>
              <div className="mt-2 flex items-center gap-4">
                <Avatar name={registerForm.name} photo={registerForm.photo} size={64} />
                <label
                  className="flex items-center gap-2 font-body text-xs font-semibold px-4 py-2 rounded-full cursor-pointer"
                  style={{ color: "#1B2A4A", border: "1px solid #E5E0D3" }}
                >
                  <Camera size={14} />
                  {photoLoading ? "Procesando…" : registerForm.photo ? "Cambiar foto" : "Subir foto"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoChange(e.target.files?.[0])}
                  />
                </label>
              </div>
              {photoError && <p className="font-body text-xs mt-2" style={{ color: "#C0392B" }}>{photoError}</p>}
            </div>

            <div>
              <span className="font-body text-xs font-semibold text-stone-500">Fotos adicionales (hasta 4)</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {registerForm.photos.map((photo, i) => (
                  <div key={i} className="relative">
                    <img src={photo} alt={`Foto ${i + 1}`} className="rounded-lg object-cover" style={{ width: 56, height: 56, border: "1px solid #E5E0D3" }} />
                    <button
                      type="button"
                      onClick={() => removeGalleryPhoto(i)}
                      className="absolute -top-1.5 -right-1.5 rounded-full flex items-center justify-center"
                      style={{ width: 18, height: 18, backgroundColor: "#C0392B" }}
                    >
                      <X size={11} color="white" />
                    </button>
                  </div>
                ))}
                {registerForm.photos.length < 4 && (
                  <label
                    className="flex items-center justify-center rounded-lg cursor-pointer"
                    style={{ width: 56, height: 56, border: "1px dashed #B0A896", color: "#B0A896" }}
                  >
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleGalleryPhotoChange(e.target.files?.[0])}
                    />
                  </label>
                )}
              </div>
            </div>

            <Input label="Nombre" value={registerForm.name} onChange={(v) => setRegisterForm({ ...registerForm, name: v })} />
            <Input label="Edad" type="number" value={registerForm.age} onChange={(v) => setRegisterForm({ ...registerForm, age: v })} />
            <Input label="Altura (cm)" type="number" placeholder="Ej. 172" value={registerForm.height} onChange={(v) => setRegisterForm({ ...registerForm, height: v })} />
            <Input label="Idiomas" placeholder="Ej. Español, Inglés B2" value={registerForm.languages} onChange={(v) => setRegisterForm({ ...registerForm, languages: v })} />
            <Select label="Ciudad" value={registerForm.city} onChange={(v) => setRegisterForm({ ...registerForm, city: v })}
              options={CITY_OPTIONS.map((c) => [c, c])} />
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
  const effectiveCityFilter = cityFilter === "Todas" ? null : cityFilter;
  const openEventsAll = events.filter(e => e.selected !== myProfile.id);
  const openEvents = effectiveCityFilter ? openEventsAll.filter((e) => e.city === effectiveCityFilter) : openEventsAll;

  return (
    <div className="min-h-screen font-body" style={{ backgroundColor: "#FBF9F4" }}>
      {FONTS}
      <Header role="profesional" onBack={() => setRole(null)} name={myProfile.name} photo={myProfile.photo} saving={saving} />
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
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-display text-xl" style={{ color: "#1B2A4A" }}>Eventos disponibles</h2>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-stone-400" />
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="font-body text-xs font-semibold px-3 py-1.5 rounded-full bg-white"
                style={{ border: "1px solid #E5E0D3", color: "#1B2A4A" }}
              >
                <option value="Todas">Todas las ciudades</option>
                {CITY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-5">
            {openEvents.length === 0 && (
              <p className="font-body text-sm text-stone-400">No hay eventos disponibles en {effectiveCityFilter || "esta selección"} ahora mismo.</p>
            )}
            {openEvents.map((ev) => {
              const applied = ev.applicants.includes(myProfile.id);
              return (
                <EventTicket key={ev.id} event={ev} revealed={!ev.confidential}>
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

function Header({ role, onBack, name, photo, saving }) {
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
            {role === "cliente" ? (
              <Building2 size={15} style={{ color: "#1B2A4A" }} />
            ) : photo ? (
              <Avatar name={name} photo={photo} size={22} />
            ) : (
              <UserRound size={15} style={{ color: "#0F6E6E" }} />
            )}
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
