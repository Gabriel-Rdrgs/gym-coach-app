import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DietPage() {
  let session = null;

  try {
    session = await auth();
  } catch {
    session = null;
  }

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">
        Módulo de Dieta
      </h1>
      <p className="text-sm text-gray-400">
        Em breve você poderá registrar e acompanhar sua alimentação aqui,
        integrado com seus treinos e progresso corporal.
      </p>
    </div>
  );
}
