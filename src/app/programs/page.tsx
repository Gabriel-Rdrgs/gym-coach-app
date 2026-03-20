import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import ProgramsClient from "./ProgramsClient";

export default async function ProgramsPage() {
  let session = null;

  try {
    session = await auth();
  } catch {
    session = null;
  }

  if (!session) {
    redirect("/login");
  }

  return <ProgramsClient />;
}
