import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import PRsClient from "./PRsClient";

export default async function PRsPage() {
  let session = null;

  try {
    session = await auth();
  } catch {
    session = null;
  }

  if (!session) {
    redirect("/login");
  }

  return <PRsClient />;
}
