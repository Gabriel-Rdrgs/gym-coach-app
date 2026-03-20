import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import ProgramDetailClient from "./ProgramDetailClient";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  let session = null;

  try {
    session = await auth();
  } catch {
    session = null;
  }

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const programId = parseInt(id);

  if (isNaN(programId)) {
    notFound();
  }

  return <ProgramDetailClient id={programId} />;
}
