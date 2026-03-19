import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import MetricsClient from "./MetricsClient";

export default async function MetricsPage() {
  let session = null;

  try {
    session = await auth();
  } catch {
    session = null;
  }

  if (!session) {
    redirect("/login");
  }

  return <MetricsClient />;
}
