import { redirect } from "next/navigation"

export default function Home() {
  const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL ?? "https://gingerly.africa"
  redirect(landingUrl)
}
