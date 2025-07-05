"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthModel } from "@/lib/models/auth";
import Link from "next/link";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface ResetFormProps {
  resetText?: string;
}

export default function ResetForm({
  resetText = "Reset Password",
}: ResetFormProps) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to send verification code");
      }

      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Invalid or expired code");
      }

      setStep(3);
    } catch (err: any) {
      setError(err.message || "Invalid or expired code");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      // Redirect to login page on success
      window.location.href = AuthModel.getPath("signin");
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {error && (
        <div className="p-3 text-sm bg-red-50 text-red-500 rounded-md">
          {error}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Input
              type="email"
              placeholder="example@domain.com"
              required
              className="bg-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              We will send you a verification code to your email.
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Code"}
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground mb-2">
            Enter the 6-digit code sent to {email}
          </p>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
            disabled={isLoading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify Code"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(1)}
            disabled={isLoading}
          >
            Back
          </Button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handlePasswordReset} className="flex flex-col gap-4">
          <Input
            type="password"
            placeholder="New password"
            required
            className="bg-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <Input
            type="password"
            placeholder="Confirm password"
            required
            className="bg-white"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Resetting..." : resetText || "Reset Password"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(2)}
            disabled={isLoading}
          >
            Back
          </Button>
        </form>
      )}

      <div className="mt-6 flex justify-center gap-1 text-sm text-muted-foreground">
        <p>Remembered your password?</p>
        <Link
          href={AuthModel.getPath("signin")}
          className="font-medium text-primary hover:underline"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
