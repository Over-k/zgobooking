// src/app/account/settings/page.tsx
import { SettingsForm } from "@/components/account/settings-form";

export const metadata = {
  title: "Account Settings",
  description: "Manage your account settings and preferences",
};

export default function SettingsPage() {
  return <SettingsForm />;
}
