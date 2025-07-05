import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import AdminDashboard from "./AdminDashboard"
export default function HostRequestsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <AdminDashboard  />
    </Suspense>
  );
}
