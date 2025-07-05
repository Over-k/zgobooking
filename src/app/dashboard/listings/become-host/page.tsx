"use client";
import { Breadcrumb } from "@/components/dashboard/breadcrumb";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Home,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface HostRequest {
  id: string;
  status: "pending" | "approved" | "rejected";
  reason?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    pending: {
      icon: Clock,
      label: "Under Review",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    approved: {
      icon: CheckCircle,
      label: "Approved",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    rejected: {
      icon: XCircle,
      label: "Rejected",
      className: "bg-red-100 text-red-800 border-red-200",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${config.className}`}
    >
      <Icon className="w-4 h-4" />
      {config.label}
    </div>
  );
};

const HostApplicationForm = ({
  onSubmit,
  loading,
}: {
  onSubmit: (reason: string) => void;
  loading: boolean;
}) => {
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reason);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Become a Host
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <Home className="w-12 h-12 mx-auto text-primary" />
            <h2 className="text-xl font-semibold">Start Hosting Today</h2>
            <p className="text-gray-500">
              Share your space with travelers from around the world
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">
                Why do you want to become a host? *
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="pl-10 min-h-[120px]"
                  placeholder="Tell us about your hosting goals, experience, and what makes your space special..."
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !reason.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Host Application"
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500">
            <p>
              By submitting this form, you agree to our{" "}
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function NewListingPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hostRequest, setHostRequest] = useState<HostRequest | null>(null);
  const router = useRouter();


  useEffect(() => {
    if (session?.user?.id) {
      fetchHostRequest();
    }
  }, [session?.user?.id]);
  const fetchHostRequest = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/host-requests/${session.user.id}`);

      if (response.ok) {
        const data = await response.json();
        setHostRequest(data);
      } else if (response.status !== 404) {
        // Only show error if it's not a 404 (no request found)
        throw new Error("Failed to fetch host request");
      }
    } catch (error) {
      console.error("Error fetching host request:", error);
      toast.error("Failed to load host request status");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (reason: string) => {
    if (!session?.user?.id) {
      toast.error("Please sign in to submit a host request");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/host-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          reason: reason.trim(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to submit host request");
      }

      const newRequest = await response.json();
      setHostRequest(newRequest);
      toast.success("Host application submitted successfully!");
    } catch (error) {
      console.error("Error submitting host request:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit application"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!session) {
    redirect("/auth/signin");
  }
  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb />
        <h1 className="mt-2 text-3xl font-bold">Become a Host</h1>
        <p className="text-muted-foreground mt-2">
          {hostRequest
            ? "Track your host application status"
            : "Share your space with travelers from around the world"}
        </p>
      </div>

      {hostRequest ? (
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Your Host Application</CardTitle>
              <StatusBadge status={hostRequest.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Submitted:</span>
                <p>{new Date(hostRequest.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Last Updated:</span>
                <p>{new Date(hostRequest.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>

            {hostRequest.reason && (
              <div>
                <span className="font-medium text-gray-600">Your Message:</span>
                <p className="mt-1 p- rounded-lg text-sm">
                  {hostRequest.reason}
                </p>
              </div>
            )}

            {hostRequest.status === "pending" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900">
                      Application Under Review
                    </h3>
                    <p className="text-blue-700 text-sm mt-1">
                      We're reviewing your host application. This typically
                      takes 2-3 business days. We'll notify you via email once a
                      decision is made.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {hostRequest.status === "approved" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-900">
                      Congratulations!
                    </h3>
                    <p className="text-green-700 text-sm mt-1">
                      Your host application has been approved. You can now
                      create your first listing.
                    </p>
                  </div>
                </div>
                <Button
                  className="mt-3"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/dashboard/listings/new");
                  }}
                >
                  Create Your First Listing
                </Button>
              </div>
            )}

            {hostRequest.status === "rejected" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-900">
                      Application Not Approved
                    </h3>
                    <p className="text-red-700 text-sm mt-1">
                      Unfortunately, your host application was not approved at
                      this time. You may submit a new application after
                      addressing any concerns.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/dashboard/listings/become-host");
                  }}
                >
                  Submit New Application
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <HostApplicationForm
          onSubmit={handleSubmitRequest}
          loading={submitting}
        />
      )}
    </div>
  );
}