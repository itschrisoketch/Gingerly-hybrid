import { redirect } from "next/navigation"

export default function Home() {
  // Staging exists to review the app itself, so it opens on the login page
  // rather than bouncing out to the marketing site the way production does.
  if (process.env.NEXT_PUBLIC_APP_ENV === "staging") {
    redirect("/login")
  }

  const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL ?? "https://gingerly.africa"
  redirect(landingUrl)
}
