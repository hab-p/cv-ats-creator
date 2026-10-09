import { PDFParse } from "pdf-parse";
// Importar el worker para evitar el error de "fake worker" en Node.js
import "pdfjs-dist/legacy/build/pdf.worker.mjs";

import { parseUploadedCvText } from "@/lib/cv-assistant";
import { getPdfCvData } from "@/lib/pdf-cv-data";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "No se recibio ningun archivo." }, { status: 400 });
    }

    const fallbackCv = await getPdfCvData();
    const mimeType = file.type.toLowerCase();
    let extractedText = "";

    if (mimeType.includes("pdf") || file.name.toLowerCase().endsWith(".pdf")) {
      const data = Buffer.from(await file.arrayBuffer());
      const parser = new PDFParse({ 
        data,
        verbosity: 0
      });
      const result = await parser.getText();
      await parser.destroy();
      extractedText = result.text;
    } else {
      extractedText = await file.text();
    }

    if (!extractedText.trim()) {
      return Response.json(
        { error: "No se pudo extraer texto util del archivo subido." },
        { status: 422 },
      );
    }

    const cvData = parseUploadedCvText(extractedText, fallbackCv);
    return Response.json({ cvData });
  } catch (error) {
    console.error("CV analyzer failed", error);
    return Response.json(
      { error: "Ocurrio un error analizando el CV. Proba con un PDF o TXT legible." },
      { status: 500 },
    );
  }
}
