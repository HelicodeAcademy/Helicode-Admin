import { redirect } from "next/navigation";

export default function OfframpRevenueRedirectPage() {
  redirect("/dashboard/revenue?tab=offramp");
}
