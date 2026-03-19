import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import WorkoutsClient from "./WorkoutsClient";

export default async function WorkoutsPage() {
  let session = null;

  try {
    session = await auth();
  } catch {
    session = null;
  }

  if (!session) {
    redirect("/login");
  }

  // Se chegou aqui, está autenticado.
  // Renderiza o componente client normal.
  return <WorkoutsClient />;
}
