import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import ProgressClient from "./ProgressClient";

export default async function ProgressPage() {
  let session = null;

  try {
    session = await auth();
  } catch {
    session = null;
  }

  if (!session) {
    redirect("/login");
  }

  return <ProgressClient />;
}
