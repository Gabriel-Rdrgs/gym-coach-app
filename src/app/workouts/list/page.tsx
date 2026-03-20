import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import WorkoutsListClient from "./WorkoutsListClient";

export default async function WorkoutsListPage() {
  let session = null;

  try {
    session = await auth();
  } catch {
    session = null;
  }

  if (!session) {
    redirect("/login");
  }

  return <WorkoutsListClient />;
}
