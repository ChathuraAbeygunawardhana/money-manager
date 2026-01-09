import { redirect } from "next/navigation";

export default async function Home() {
  // Always redirect to money dashboard - no auth required
  redirect("/money/dashboard");
}
