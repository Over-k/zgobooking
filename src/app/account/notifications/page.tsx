import { NotificationPreferencesForm } from "@/components/account/notification-preferences";

export const metadata = {
  title: "Notification Preferences",
  description: "Manage your notification settings and preferences",
};

export default function NotificationsPage() {
  return <NotificationPreferencesForm />;
}
