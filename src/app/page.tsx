import CvBuilder from "@/components/cv-builder";
import { getPdfCvData } from "@/lib/pdf-cv-data";

export default async function Home() {
  const initialCvData = await getPdfCvData();

  return <CvBuilder initialCvData={initialCvData} />;
}
