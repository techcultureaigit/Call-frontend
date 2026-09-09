import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ surveyId?: string | string[] }>;
}

export default async function AnalyticsRedirectPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const raw = params.surveyId;
  const surveyId = Array.isArray(raw) ? raw[0] : raw;
  if (surveyId && surveyId !== "all") {
    redirect(`/survey/${surveyId}/analytics`);
  }
  redirect("/survey");
}
