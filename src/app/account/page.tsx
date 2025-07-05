import { redirect } from "next/navigation";

export default function AccountPage() {
  // Redirect to the personal info page by default
  redirect("/account/personal-info");
}
