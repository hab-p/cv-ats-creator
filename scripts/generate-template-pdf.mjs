import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cvData = {
  fullName: "Henry Junior Alvarez Bustamante",
  title: "Software Developer Full Stack Next/Nest",
  summary:
    "Desarrollador full stack con foco en experiencias web modernas, arquitectura limpia y productos escalables. Trabajo con Next.js, NestJS, TypeScript y bases de datos relacionales para construir interfaces rapidas, APIs mantenibles y flujos orientados a negocio.",
  contact: [
    "henry.alvarez.dev@example.com",
    "+54 11 5555 0101",
    "Buenos Aires, Argentina",
    "henryjunior.dev",
    "linkedin.com/in/henryjunior",
  ],
  skills: [
    "Next.js",
    "NestJS",
    "React",
    "TypeScript",
    "Node.js",
    "PostgreSQL",
    "Prisma",
    "Tailwind CSS",
    "REST APIs",
    "Docker",
  ],
  experience: [
    {
      role: "Full Stack Developer",
      company: "NovaStack Solutions",
      period: "2023 - Actualidad",
      achievements:
        "Desarrolle una plataforma B2B con Next.js y NestJS que redujo en 35% los tiempos operativos y mejoro la conversion comercial mediante dashboards y automatizaciones.",
    },
    {
      role: "Frontend Developer",
      company: "Pixel Forge Studio",
      period: "2021 - 2023",
      achievements:
        "Implemente interfaces accesibles con React y TypeScript, optimice performance web en ecommerce y colabore con UX para elevar la retencion de usuarios.",
    },
  ],
  projects: [
    {
      name: "CV Creator Pro",
      stack: "Next.js, TypeScript, Tailwind CSS, jsPDF",
      description:
        "Editor visual de curriculums con vista previa en tiempo real y exportacion a PDF lista para compartir.",
    },
    {
      name: "OpsBoard API",
      stack: "NestJS, PostgreSQL, Prisma, Docker",
      description:
        "Backend modular para gestion de operaciones, reportes y permisos por rol con enfoque enterprise.",
    },
  ],
};

function wrapText(text, maxCharsPerLine) {
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (candidate.length <= maxCharsPerLine) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

async function main() {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const width = page.getWidth();
  const height = page.getHeight();

  const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  let cursorY = height - 54;

  page.drawRectangle({
    x: 0,
    y: height - 160,
    width,
    height: 160,
    color: rgb(0.07, 0.1, 0.17),
  });

  page.drawText(cvData.fullName, {
    x: 42,
    y: cursorY,
    size: 23,
    font: boldFont,
    color: rgb(1, 1, 1),
  });

  cursorY -= 30;

  page.drawText(cvData.title, {
    x: 42,
    y: cursorY,
    size: 12,
    font: regularFont,
    color: rgb(0.81, 0.89, 0.97),
  });

  cursorY -= 28;

  page.drawText(cvData.contact.join("  |  "), {
    x: 42,
    y: cursorY,
    size: 9,
    font: regularFont,
    color: rgb(0.86, 0.9, 0.95),
  });

  const leftX = 42;
  const rightX = 378;
  let leftY = height - 205;
  let rightY = height - 205;

  page.drawText("RESUMEN", {
    x: leftX,
    y: leftY,
    size: 10,
    font: boldFont,
    color: rgb(0.2, 0.3, 0.45),
  });

  leftY -= 18;

  for (const line of wrapText(cvData.summary, 60)) {
    page.drawText(line, {
      x: leftX,
      y: leftY,
      size: 10,
      font: regularFont,
      color: rgb(0.25, 0.28, 0.33),
    });
    leftY -= 14;
  }

  leftY -= 14;

  page.drawText("EXPERIENCIA", {
    x: leftX,
    y: leftY,
    size: 10,
    font: boldFont,
    color: rgb(0.2, 0.3, 0.45),
  });

  leftY -= 18;

  for (const item of cvData.experience) {
    page.drawText(item.role, {
      x: leftX,
      y: leftY,
      size: 11,
      font: boldFont,
      color: rgb(0.08, 0.11, 0.16),
    });

    leftY -= 14;

    page.drawText(`${item.company} | ${item.period}`, {
      x: leftX,
      y: leftY,
      size: 9,
      font: regularFont,
      color: rgb(0.09, 0.46, 0.73),
    });

    leftY -= 15;

    for (const line of wrapText(item.achievements, 60)) {
      page.drawText(line, {
        x: leftX,
        y: leftY,
        size: 10,
        font: regularFont,
        color: rgb(0.25, 0.28, 0.33),
      });
      leftY -= 13;
    }

    leftY -= 14;
  }

  page.drawText("SKILLS", {
    x: rightX,
    y: rightY,
    size: 10,
    font: boldFont,
    color: rgb(0.2, 0.3, 0.45),
  });

  rightY -= 18;

  for (const skill of cvData.skills) {
    page.drawText(`- ${skill}`, {
      x: rightX,
      y: rightY,
      size: 10,
      font: regularFont,
      color: rgb(0.25, 0.28, 0.33),
    });
    rightY -= 13;
  }

  rightY -= 18;

  page.drawText("PROYECTOS", {
    x: rightX,
    y: rightY,
    size: 10,
    font: boldFont,
    color: rgb(0.2, 0.3, 0.45),
  });

  rightY -= 18;

  for (const project of cvData.projects) {
    page.drawText(project.name, {
      x: rightX,
      y: rightY,
      size: 11,
      font: boldFont,
      color: rgb(0.08, 0.11, 0.16),
    });

    rightY -= 14;

    page.drawText(project.stack, {
      x: rightX,
      y: rightY,
      size: 9,
      font: regularFont,
      color: rgb(0.09, 0.46, 0.73),
    });

    rightY -= 15;

    for (const line of wrapText(project.description, 28)) {
      page.drawText(line, {
        x: rightX,
        y: rightY,
        size: 10,
        font: regularFont,
        color: rgb(0.25, 0.28, 0.33),
      });
      rightY -= 13;
    }

    rightY -= 14;
  }

  const outputDirectory = path.join(__dirname, "..", "public", "templates");
  const outputFile = path.join(outputDirectory, "cv-template-base.pdf");

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(outputFile, await pdf.save());

  console.log(`PDF generado en ${outputFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
