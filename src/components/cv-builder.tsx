"use client";

import { useEffect, useMemo, useState } from "react";

import { applyJobDescriptionToCvWithPreset } from "@/lib/cv-assistant";
import type { CvData, Education, Experience, Project, SkillGroup } from "@/lib/cv-types";

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100";

type CvBuilderProps = {
  initialCvData: CvData;
};

type JsPdfInstance = InstanceType<(typeof import("jspdf"))["jsPDF"]>;

type AtsExperience = {
  role: string;
  companyLine: string;
  period: string;
  bullets: string[];
};

type AtsProject = {
  heading: string;
  description: string;
};

type AtsEducation = {
  institution: string;
  details: string;
};

type AtsSnapshot = {
  fullName: string;
  title: string;
  contactLine: string;
  summary: string;
  skills: string[];
  experiences: AtsExperience[];
  projects: AtsProject[];
  education: AtsEducation[];
  languages: string;
  highlights: string[];
  closingStatement: string;
};

type PersistedCvState = {
  version: number;
  cvData: CvData;
  jobDescription: string;
  jobFocus: "backend" | "frontend" | "fullstack";
};

const LOCAL_STORAGE_KEY = "cv-creator:ats-form-state";
const LOCAL_STORAGE_VERSION = 4;

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function splitTextareaLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitPipeValues(value: string) {
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueItems(items: string[]) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function stripDates(text: string) {
  // Elimina rangos de fechas comunes como "Nov 2025 – Ene 2026", "11/2025 - 01/2026", "2023 - Presente", etc.
  const dateRangeRegex =
    /(?:(?:\d{1,2}\/\d{2,4})|(?:\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic)[a-z]*\s+\d{2,4})|(?:\d{4}))\s*[-–—]\s*(?:(?:\d{1,2}\/\d{2,4})|(?:\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic)[a-z]*\s+\d{2,4})|(?:\d{4})|Present|Actualidad|Presente)/gi;

  return text.replace(dateRangeRegex, "").replace(/\s{2,}/g, " ").trim();
}

function clampLines(pdf: JsPdfInstance, text: string, maxWidth: number, maxLines?: number) {
  const safeText = text.trim();
  const lines = safeText
    ? (pdf.splitTextToSize(safeText, maxWidth) as string[])
    : [];

  if (!maxLines || lines.length <= maxLines) {
    return lines;
  }

  const trimmed = lines.slice(0, maxLines);
  let lastLine = trimmed[maxLines - 1] ?? "";

  while (lastLine.length > 0 && pdf.getTextWidth(`${lastLine}...`) > maxWidth) {
    lastLine = lastLine.slice(0, -1);
  }

  trimmed[maxLines - 1] = `${lastLine.trimEnd()}...`;
  return trimmed;
}

function drawTextLines(
  pdf: JsPdfInstance,
  lines: string[],
  x: number,
  y: number,
  lineHeight: number,
) {
  lines.forEach((line, index) => {
    pdf.text(line, x, y + index * lineHeight);
  });

  return y + lines.length * lineHeight;
}

function buildAtsSnapshot(cvData: CvData): AtsSnapshot {
  const flatSkills = uniqueItems(
    cvData.skillGroups.flatMap((group) => group.items).filter(Boolean),
  ).slice(0, 12);

  const experiences = cvData.experience
    .filter((item) => item.role || item.company)
    .slice(0, 2)
    .map((item) => ({
      role: stripDates(item.role),
      companyLine: [item.company, item.location].filter(Boolean).join(" | "),
      period: item.period,
      bullets: item.bullets.filter(Boolean).slice(0, 3),
    }));

  const projects = cvData.projects
    .filter((item) => item.name || item.description)
    .slice(0, 2)
    .map((item) => ({
      heading: [item.name, item.stack.slice(0, 4).join(", ")].filter(Boolean).join(" | "),
      description: item.description,
    }));

  const education = cvData.education
    .filter((item) => item.institution || item.details)
    .slice(0, 2)
    .map((item) => ({
      institution: item.institution,
      details: item.details,
    }));

  return {
    fullName: cvData.fullName.trim(),
    title: stripDates(cvData.title.trim()),
    contactLine: [
      cvData.email,
      cvData.phone,
      cvData.portfolioUrl,
      cvData.location,
      cvData.availability,
    ]
      .map((item) => item?.trim())
      .filter(Boolean)
      .join(" | "),
    summary: cvData.summary.trim(),
    skills: flatSkills,
    experiences,
    projects,
    education,
    languages: cvData.languages.trim(),
    highlights: cvData.profileHighlights.filter(Boolean).slice(0, 3),
    closingStatement: cvData.closingStatement.trim(),
  };
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="border-b border-slate-300 pb-1">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700">
        {children}
      </h3>
    </div>
  );
}

export default function CvBuilder({ initialCvData }: CvBuilderProps) {
  const [cvData, setCvData] = useState<CvData>(initialCvData);
  const [jobDescription, setJobDescription] = useState("");
  const [jobFocus, setJobFocus] = useState<"backend" | "frontend" | "fullstack">("backend");
  const [jobMessage, setJobMessage] = useState<string | null>(null);
  const [selectedCvFile, setSelectedCvFile] = useState<File | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isApplyingJob, setIsApplyingJob] = useState(false);
  const [isAnalyzingCv, setIsAnalyzingCv] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [hasLoadedPersistedState, setHasLoadedPersistedState] = useState(false);
  const atsCv = useMemo(() => buildAtsSnapshot(cvData), [cvData]);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const rawValue = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!rawValue) {
          setHasLoadedPersistedState(true);
          return;
        }

        const persisted = JSON.parse(rawValue) as Partial<PersistedCvState>;
        if (persisted.version !== LOCAL_STORAGE_VERSION) {
          window.localStorage.removeItem(LOCAL_STORAGE_KEY);
          setHasLoadedPersistedState(true);
          return;
        }

        if (persisted.cvData) {
          setCvData(persisted.cvData);
        }

        if (typeof persisted.jobDescription === "string") {
          setJobDescription(persisted.jobDescription);
        }

        if (
          persisted.jobFocus === "backend" ||
          persisted.jobFocus === "frontend" ||
          persisted.jobFocus === "fullstack"
        ) {
          setJobFocus(persisted.jobFocus);
        }
      } catch (error) {
        console.error("No se pudo leer el estado guardado del CV", error);
      } finally {
        setHasLoadedPersistedState(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!hasLoadedPersistedState) {
      return;
    }

    const payload: PersistedCvState = {
      version: LOCAL_STORAGE_VERSION,
      cvData,
      jobDescription,
      jobFocus,
    };

    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error("No se pudo guardar el estado del CV", error);
    }
  }, [cvData, jobDescription, jobFocus, hasLoadedPersistedState]);

  const updateField = <K extends keyof CvData>(field: K, value: CvData[K]) => {
    setCvData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateSkillGroup = (index: number, field: keyof SkillGroup, value: string) => {
    setCvData((current) => ({
      ...current,
      skillGroups: current.skillGroups.map((item, currentIndex) =>
        currentIndex === index
          ? {
              ...item,
              [field]: field === "items" ? splitTextareaLines(value) : value,
            }
          : item,
      ),
    }));
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    setCvData((current) => ({
      ...current,
      experience: current.experience.map((item, currentIndex) =>
        currentIndex === index
          ? {
              ...item,
              [field]: field === "bullets" ? splitTextareaLines(value) : value,
            }
          : item,
      ),
    }));
  };

  const updateProject = (index: number, field: keyof Project, value: string) => {
    setCvData((current) => ({
      ...current,
      projects: current.projects.map((item, currentIndex) =>
        currentIndex === index
          ? {
              ...item,
              [field]: field === "stack" ? splitPipeValues(value) : value,
            }
          : item,
      ),
    }));
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    setCvData((current) => ({
      ...current,
      education: current.education.map((item, currentIndex) =>
        currentIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const handleReset = () => {
    setCvData(initialCvData);
    setJobDescription("");
    setJobFocus("backend");
    setJobMessage(null);
    setSelectedCvFile(null);
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const handleApplyJobDescription = async () => {
    const trimmedDescription = jobDescription.trim();
    if (!trimmedDescription) {
      setJobMessage("La descripción del puesto es requerida para aplicar.");
      return;
    }

    setIsApplyingJob(true);
    setJobMessage(null);

    try {
      setCvData((current) => applyJobDescriptionToCvWithPreset(current, trimmedDescription, jobFocus));
      setJobMessage("Descripción del puesto aplicada con éxito.");
    } catch (error) {
      console.error("Error applying job description:", error);
      setJobMessage("Error al aplicar la descripción del puesto.");
    } finally {
      setIsApplyingJob(false);
    }
  };

  const handleAnalyzeCv = async () => {
    if (!selectedCvFile) {
      setJobMessage("Por favor, selecciona un archivo CV para analizar.");
      return;
    }

    try {
      setIsAnalyzingCv(true);
      setJobMessage(null);

      const formData = new FormData();
      formData.append("file", selectedCvFile);

      const response = await fetch("/api/cv-analyzer", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { cvData?: CvData; error?: string };

      if (!response.ok || !payload.cvData) {
        throw new Error(payload.error || "Error al analizar el CV");
      }

      const nextCvData = jobDescription.trim()
        ? applyJobDescriptionToCvWithPreset(payload.cvData, jobDescription, jobFocus)
        : payload.cvData;

      setCvData(nextCvData);
      setJobMessage(
        jobDescription.trim()
          ? "CV analizado y adaptado con éxito."
          : "CV analizado y cargado con éxito.",
      );
    } catch (error) {
      console.error("CV upload analyzer failed", error);
      setJobMessage(
        error instanceof Error
          ? error.message
          : "Error genérico al analizar el CV",
      );
    } finally {
      setIsAnalyzingCv(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      setDownloadError(null);
      const { jsPDF } = await import("jspdf");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 44;
      const contentWidth = pageWidth - margin * 2;
      const bottomLimit = pageHeight - 34;

      const drawSectionHeader = (title: string, y: number) => {
        if (y > bottomLimit) {
          return y;
        }

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(55, 65, 81);
        pdf.text(title.toUpperCase(), margin, y);

        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(0.7);
        pdf.line(margin, y + 6, pageWidth - margin, y + 6);

        return y + 20;
      };

      const drawParagraph = (
        text: string,
        y: number,
        maxLines: number,
        fontSize = 9.1,
        lineHeight = fontSize + 4.2,
      ) => {
        const lines = clampLines(pdf, text, contentWidth, maxLines);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(fontSize);
        pdf.setTextColor(17, 24, 39);
        return drawTextLines(pdf, lines, margin, y, lineHeight) + 7;
      };

      const drawBulletItems = (items: string[], y: number, maxBullets: number) => {
        let cursorY = y;

        items.slice(0, maxBullets).forEach((item) => {
          if (cursorY > bottomLimit) {
            return;
          }

          const lines = clampLines(pdf, item, contentWidth - 12, 2);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8.9);
          pdf.setTextColor(17, 24, 39);

          lines.forEach((line, index) => {
            if (index === 0) {
              pdf.text("•", margin, cursorY);
            }

            pdf.text(line, margin + 10, cursorY);
            cursorY += 12;
          });

          cursorY += 2;
        });

        return cursorY + 5;
      };

      const drawBulletGridTwoColumns = (items: string[], y: number, maxItems: number) => {
        const safeItems = items.slice(0, maxItems);
        const columnGap = 26;
        const columnWidth = (contentWidth - columnGap) / 2;
        const rowHeight = 12.6;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.9);
        pdf.setTextColor(17, 24, 39);

        let renderedRows = 0;

        for (let index = 0; index < safeItems.length; index += 1) {
          const rowIndex = Math.floor(index / 2);
          const columnIndex = index % 2;
          const cursorY = y + rowIndex * rowHeight;

          if (cursorY > bottomLimit) {
            break;
          }

          const x = columnIndex === 0 ? margin : margin + columnWidth + columnGap;
          const line = clampLines(pdf, safeItems[index], columnWidth - 14, 1)[0] ?? "";

          pdf.text("•", x, cursorY);
          pdf.text(line, x + 10, cursorY);

          renderedRows = Math.max(renderedRows, rowIndex + 1);
        }

        return y + renderedRows * rowHeight + 10;
      };

      let y = 48;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
      pdf.setTextColor(15, 23, 42);
      y = drawTextLines(pdf, clampLines(pdf, atsCv.fullName, contentWidth, 2), margin, y, 24) + 4;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(51, 65, 85);
      y = drawTextLines(pdf, clampLines(pdf, atsCv.title, contentWidth, 2), margin, y, 15) + 4;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(71, 85, 105);
      y = drawTextLines(pdf, clampLines(pdf, atsCv.contactLine, contentWidth, 2), margin, y, 13) + 12;

      y = drawSectionHeader("Resumen Profesional", y);
      y = drawParagraph(atsCv.summary, y, 4, 9.2, 13.6);

      y = drawSectionHeader("Habilidades Clave", y);
      y = drawBulletGridTwoColumns(atsCv.skills, y, 12);

      y = drawSectionHeader("Experiencia Profesional", y);
      atsCv.experiences.forEach((item) => {
        if (y > bottomLimit - 54) {
          return;
        }

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9.6);
        pdf.setTextColor(17, 24, 39);
        pdf.text(item.role || "Experiencia", margin, y);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.8);
        pdf.setTextColor(100, 116, 139);
        if (item.period) {
          pdf.text(item.period, pageWidth - margin, y, { align: "right" });
        }

        y += 14;
        y = drawParagraph(item.companyLine, y, 1, 8.8, 12);
        y = drawBulletItems(item.bullets, y, 3);
        y += 4;
      });

      y = drawSectionHeader("Proyectos Destacados", y);
      atsCv.projects.forEach((project) => {
        if (y > bottomLimit - 34) {
          return;
        }

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9.4);
        pdf.setTextColor(17, 24, 39);
        y =
          drawTextLines(pdf, clampLines(pdf, project.heading, contentWidth, 1), margin, y, 12) + 3;
        y = drawParagraph(project.description, y, 2, 8.8, 12.6);
        y += 2;
      });

      y = drawSectionHeader("Educacion", y);
      atsCv.education.forEach((item) => {
        if (y > bottomLimit - 28) {
          return;
        }

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9.2);
        pdf.setTextColor(17, 24, 39);
        y = drawTextLines(pdf, clampLines(pdf, item.institution, contentWidth, 1), margin, y, 12);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.8);
        pdf.setTextColor(71, 85, 105);
        y = drawTextLines(pdf, clampLines(pdf, item.details, contentWidth, 1), margin, y, 12) + 6;
      });

      y = drawSectionHeader("Idiomas y Fortalezas", y);
      y = drawParagraph(
        [atsCv.languages, atsCv.highlights.join(" | ")].filter(Boolean).join(" | "),
        y,
        2,
        8.9,
        12.6,
      );

      if (atsCv.closingStatement && y < bottomLimit - 18) {
        y = drawSectionHeader("Nota Final", y);
        y = drawParagraph(atsCv.closingStatement, y, 2, 8.7, 12.4);
      }

      const fileName = `${slugify(atsCv.fullName) || "cv"}-ats.pdf`;
      const pdfBlob = pdf.output("blob");
      const objectUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement("a");

      downloadLink.href = objectUrl;
      downloadLink.download = fileName;
      downloadLink.style.display = "none";

      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 1000);
    } catch (error) {
      console.error("PDF generation failed", error);
      setDownloadError(
        "No se pudo generar el PDF ATS. Proba nuevamente dentro de unos segundos.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-x-auto bg-slate-100 text-slate-900">
      <div className="mx-auto flex w-full max-w-[2000px] flex-col gap-8 px-4 py-8 lg:px-8">
        <section className="relative rounded-[2rem] bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 p-8 text-white shadow-2xl shadow-slate-300">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-100">
            Generador de CV compatible con ATS
          </span>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Crea un CV para Desarrolladores de Software optimizado para ATS en segundos
          </h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-200 sm:text-base">
            Ingresa la descripción del puesto y deja que nuestra herramienta adapte tu CV para superar los sistemas de seguimiento de candidatos.
          </p>

          {/* Mensaje latente de próxima actualización */}
          <div className="absolute top-8 right-8 hidden xl:block">
            <div className="animate-heartbeat flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 backdrop-blur-md">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
              <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
                Próxima actualización: Traducción automática al inglés
              </span>
            </div>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[440px_minmax(0,1fr)]">
          <aside className="space-y-6 rounded-[2rem] bg-white p-6 shadow-lg shadow-slate-200">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:bg-slate-500"
              >
                {isDownloading ? "Generando PDF..." : "Descargar PDF"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Reiniciar formulario
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              Esta herramienta analiza la descripción del puesto y tu CV para identificar palabras clave y frases relevantes, asegurando que tu CV se destaque.
            </div>

            <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Aplicación de Puesto</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Pega la descripción del puesto para el que te postulas. La herramienta optimizará tu CV para este puesto.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setJobFocus("backend")}
                  className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                    jobFocus === "backend"
                      ? "bg-slate-900 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Backend
                </button>
                <button
                  type="button"
                  onClick={() => setJobFocus("frontend")}
                  className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                    jobFocus === "frontend"
                      ? "bg-slate-900 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Frontend
                </button>
                <button
                  type="button"
                  onClick={() => setJobFocus("fullstack")}
                  className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                    jobFocus === "fullstack"
                      ? "bg-slate-900 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Full Stack
                </button>
              </div>
              <div className="flex flex-wrap gap-2">

              </div>
              <textarea
                className={`${inputClassName} min-h-32 resize-y`}
                placeholder="Pega la descripción del puesto aquí..."
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
              />
              <button
                type="button"
                onClick={handleApplyJobDescription}
                disabled={isApplyingJob}
                className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:bg-slate-500"
              >
                {isApplyingJob ? "Analizando vacante..." : "Aplicar descripción del puesto"}
              </button>
            </section>

            <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Analizador de CV</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Sube tu CV actual (PDF o TXT) para que la IA lo analice y extraiga la información clave.
                </p>
              </div>
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={(event) => setSelectedCvFile(event.target.files?.[0] ?? null)}
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              />
              <button
                type="button"
                onClick={handleAnalyzeCv}
                disabled={isAnalyzingCv}
                className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white disabled:cursor-wait disabled:opacity-70"
              >
                {isAnalyzingCv ? "Procesando CV..." : "Analizar CV"}
              </button>
            </section>

            {downloadError ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                No se pudo generar el PDF ATS. Proba nuevamente dentro de unos segundos.
              </div>
            ) : null}

            {jobMessage ? (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">
                {jobMessage}
              </div>
            ) : null}

            <div className="pt-4">
              <h2 className="text-xl font-bold text-slate-900">
                Cargue o edite sus datos manualmente:
              </h2>
            </div>

            <section className="space-y-4">
              <h2 className="text-base font-semibold">Datos Personales</h2>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Nombre Completo</span>
                <input
                  className={inputClassName}
                  value={cvData.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Título Profesional</span>
                <input
                  className={inputClassName}
                  value={cvData.title}
                  onChange={(event) => updateField("title", event.target.value)}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Correo Electrónico</span>
                  <input
                    className={inputClassName}
                    value={cvData.email}
                    onChange={(event) => updateField("email", event.target.value)}
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Teléfono</span>
                  <input
                    className={inputClassName}
                    value={cvData.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">URL Portafolio</span>
                  <input
                    className={inputClassName}
                    value={cvData.portfolioUrl ?? ""}
                    onChange={(event) => updateField("portfolioUrl", event.target.value)}
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Ubicación</span>
                  <input
                    className={inputClassName}
                    value={cvData.location}
                    onChange={(event) => updateField("location", event.target.value)}
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">
                    Disponibilidad
                  </span>
                  <input
                    className={inputClassName}
                    value={cvData.availability}
                    onChange={(event) => updateField("availability", event.target.value)}
                  />
                </label>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-base font-semibold">Resumen Profesional</h2>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Resumen
                </span>
                <textarea
                  className={`${inputClassName} min-h-32 resize-y`}
                  value={cvData.summary}
                  onChange={(event) => updateField("summary", event.target.value)}
                />
              </label>
            </section>

            <section className="space-y-4">
              <h2 className="text-base font-semibold">Habilidades Clave</h2>
              {cvData.skillGroups.map((group, index) => (
                <div
                  key={`${group.title}-${index}`}
                  className="space-y-3 rounded-3xl border border-slate-200 p-4"
                >
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">Categoría</span>
                    <input
                      className={inputClassName}
                      value={group.title}
                      onChange={(event) => updateSkillGroup(index, "title", event.target.value)}
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Habilidades (una por línea)
                    </span>
                    <textarea
                      className={`${inputClassName} min-h-24 resize-y`}
                      value={group.items.join("\n")}
                      onChange={(event) => updateSkillGroup(index, "items", event.target.value)}
                    />
                  </label>
                </div>
              ))}
            </section>

            <section className="space-y-4">
              <h2 className="text-base font-semibold">Experiencia Profesional</h2>
              {cvData.experience.map((experience, index) => (
                <div
                  key={`${experience.role}-${index}`}
                  className="space-y-3 rounded-3xl border border-slate-200 p-4"
                >
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">Puesto</span>
                    <input
                      className={inputClassName}
                      value={experience.role}
                      onChange={(event) => updateExperience(index, "role", event.target.value)}
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">Empresa</span>
                    <input
                      className={inputClassName}
                      value={experience.company}
                      onChange={(event) =>
                        updateExperience(index, "company", event.target.value)
                      }
                    />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-slate-700">Ubicación</span>
                      <input
                        className={inputClassName}
                        value={experience.location}
                        onChange={(event) =>
                          updateExperience(index, "location", event.target.value)
                        }
                      />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-slate-700">Período</span>
                      <input
                        className={inputClassName}
                        value={experience.period}
                        onChange={(event) =>
                          updateExperience(index, "period", event.target.value)
                        }
                      />
                    </label>
                  </div>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Logros (uno por línea)
                    </span>
                    <textarea
                      className={`${inputClassName} min-h-32 resize-y`}
                      value={experience.bullets.join("\n")}
                      onChange={(event) =>
                        updateExperience(index, "bullets", event.target.value)
                      }
                    />
                  </label>
                </div>
              ))}
            </section>

            <section className="space-y-4">
              <h2 className="text-base font-semibold">Proyectos Destacados</h2>
              {cvData.projects.map((project, index) => (
                <div
                  key={`${project.name}-${index}`}
                  className="space-y-3 rounded-3xl border border-slate-200 p-4"
                >
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">Título del Proyecto</span>
                    <input
                      className={inputClassName}
                      value={project.name}
                      onChange={(event) => updateProject(index, "name", event.target.value)}
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Contexto del Proyecto
                    </span>
                    <input
                      className={inputClassName}
                      value={project.context}
                      onChange={(event) =>
                        updateProject(index, "context", event.target.value)
                      }
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Stack (separado por |)
                    </span>
                    <input
                      className={inputClassName}
                      value={project.stack.join(" | ")}
                      onChange={(event) => updateProject(index, "stack", event.target.value)}
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Descripción del Proyecto
                    </span>
                    <textarea
                      className={`${inputClassName} min-h-24 resize-y`}
                      value={project.description}
                      onChange={(event) =>
                        updateProject(index, "description", event.target.value)
                      }
                    />
                  </label>
                </div>
              ))}
            </section>

            <section className="space-y-4">
              <h2 className="text-base font-semibold">Educación</h2>
              {cvData.education.map((education, index) => (
                <div
                  key={`${education.institution}-${index}`}
                  className="space-y-3 rounded-3xl border border-slate-200 p-4"
                >
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Institución
                    </span>
                    <input
                      className={inputClassName}
                      value={education.institution}
                      onChange={(event) => updateEducation(index, "institution", event.target.value)}
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">Detalles</span>
                    <input
                      className={inputClassName}
                      value={education.details}
                      onChange={(event) => updateEducation(index, "details", event.target.value)}
                    />
                  </label>
                </div>
              ))}
            </section>

            <section className="space-y-4">
              <h2 className="text-base font-semibold">Idiomas y Fortalezas</h2>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Idiomas</span>
                <input
                  className={inputClassName}
                  value={cvData.languages}
                  onChange={(event) => updateField("languages", event.target.value)}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Puntos Destacados del Perfil (uno por línea)
                </span>
                <textarea
                  className={`${inputClassName} min-h-24 resize-y`}
                  value={cvData.profileHighlights.join("\n")}
                  onChange={(event) =>
                    updateField("profileHighlights", splitTextareaLines(event.target.value))
                  }
                />
              </label>
            </section>

            <section className="space-y-4">
              <h2 className="text-base font-semibold">Nota Final</h2>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Declaración Final
                </span>
                <textarea
                  className={`${inputClassName} min-h-32 resize-y`}
                  value={cvData.closingStatement}
                  onChange={(event) => updateField("closingStatement", event.target.value)}
                />
              </label>
            </section>
          </aside>

          <section className="overflow-x-auto pb-4">
            <div className="w-max min-w-full rounded-[2rem] bg-slate-200/80 p-3 shadow-inner shadow-slate-300 sm:p-6">
              <article className="min-h-[1122px] w-[860px] rounded-[1.75rem] bg-white p-10 text-slate-900 shadow-2xl shadow-slate-400/30 xl:w-[900px]">
                <header className="border-b border-slate-300 pb-5">
                  <h2 className="text-4xl font-bold tracking-tight text-slate-900">
                    {atsCv.fullName}
                  </h2>
                  <p className="mt-2 text-base font-medium text-slate-700">{atsCv.title}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{atsCv.contactLine}</p>
                </header>

                <div className="space-y-5 pt-5 text-[13px] leading-6 text-slate-700">
                  <section>
                    <SectionTitle>Resumen Profesional</SectionTitle>
                    <p className="mt-3">{atsCv.summary}</p>
                  </section>

                  <section>
                    <SectionTitle>Habilidades Clave</SectionTitle>
                    <ul className="mt-3 grid grid-cols-2 gap-x-10 gap-y-1">
                      {atsCv.skills.map((skill) => (
                        <li key={skill} className="flex gap-2">
                          <span>•</span>
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <SectionTitle>Experiencia Profesional</SectionTitle>
                    <div className="mt-3 space-y-4">
                      {atsCv.experiences.map((item) => (
                        <article key={`${item.role}-${item.period}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-slate-900">{item.role}</h4>
                              <p className="text-sm text-slate-500">{item.companyLine}</p>
                            </div>
                            <p className="shrink-0 text-sm text-slate-500">{item.period}</p>
                          </div>
                          <ul className="mt-2 space-y-1">
                            {item.bullets.map((bullet) => (
                              <li key={bullet} className="flex gap-2">
                                <span>•</span>
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </article>
                      ))}
                    </div>
                  </section>

                  <section>
                    <SectionTitle>Proyectos Destacados</SectionTitle>
                    <div className="mt-3 space-y-3">
                      {atsCv.projects.map((project) => (
                        <article key={project.heading}>
                          <h4 className="font-semibold text-slate-900">{project.heading}</h4>
                          <p className="mt-1">{project.description}</p>
                        </article>
                      ))}
                    </div>
                  </section>

                  <section>
                    <SectionTitle>Educacion</SectionTitle>
                    <div className="mt-3 space-y-2">
                      {atsCv.education.map((item) => (
                        <article key={`${item.institution}-${item.details}`}>
                          <h4 className="font-semibold text-slate-900">{item.institution}</h4>
                          <p className="text-sm text-slate-500">{item.details}</p>
                        </article>
                      ))}
                    </div>
                  </section>

                  <section>
                    <SectionTitle>Idiomas y Fortalezas</SectionTitle>
                    <p className="mt-3">{atsCv.languages}</p>
                    <p className="mt-2">{atsCv.highlights.join(" | ")}</p>
                  </section>

                  {atsCv.closingStatement ? (
                    <section>
                      <SectionTitle>Nota Final</SectionTitle>
                      <p className="mt-3">{atsCv.closingStatement}</p>
                    </section>
                  ) : null}
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
