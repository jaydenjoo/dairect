import { redirect, permanentRedirect } from "next/navigation";

export default function PricingRedirect() {
  permanentRedirect("/#pricing");
  // unreachable — satisfies TS return type
  redirect("/#pricing");
}
