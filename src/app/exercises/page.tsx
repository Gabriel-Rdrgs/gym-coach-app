import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import ExercisesClient from "./ExercisesClient";

export default async function ExercisesPage() {
  let session = null;

  try {
    session = await auth();
  } catch {
    session = null;
  }

  if (!session) {
    redirect("/login");
  }

  return <ExercisesClient />;
}
