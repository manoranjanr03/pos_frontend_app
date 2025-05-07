import { redirect } from "next/navigation";

export default function Home() {
  redirect("/auth/login");
  // Note: redirect() must be called before any JSX is returned.
  // To avoid "Error: NEXT_REDIRECT", we don't return any JSX here.
  // The redirect function handles the navigation.
  return null;
}
