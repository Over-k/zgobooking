"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import Link from "next/link";

interface SignupFormProps {
  signupText: string;
  googleText: string;
  loginText: string;
  loginUrl: string;
}

export function SignupForm({
  signupText,
  googleText,
  loginText,
  loginUrl,
}: SignupFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate only email in first step
    if (!email) {
      setError('Email is required');
      setIsLoading(false);
      return;
    }

    try {
      // First, check if email exists
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Email check failed');
      }

      // If email is valid, request verification code
      const verifyResponse = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || 'Failed to send verification code');
      }

      setStep(2);
      setOtpSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Email check failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Invalid or expired verification code");
      }

      setStep(3);
    } catch (err: any) {
      setError(err.message || "Invalid or expired verification code");
    } finally {
      setIsLoading(false);
    }
  };



  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const requestBody = { firstName, lastName, email, password, phone };
      
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error) {
          if (data.details) {
            const validationErrors = data.details.map((err: any) => err.message).join("\n");
            throw new Error(validationErrors);
          }
          throw new Error(data.error);
        }
        throw new Error(data.message || "Failed to sign up");
      }

      // Redirect to signin page or auto sign in
      await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/",
      });
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8">
      {step === 1 && (
        <form onSubmit={handleEmailSubmit}>
          {error && (
            <div className="p-3 text-sm bg-red-50 text-red-500 rounded-md">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4"
              required
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending verification code..." : "Send Verification Code"}
            </Button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleOtpSubmit}>
          {error && (
            <div className="p-3 text-sm bg-red-50 text-red-500 rounded-md">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-4">
            <Input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="mb-4"
              required
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleSignup}>
          {error && (
            <div className="p-3 text-sm bg-red-50 text-red-500 rounded-md">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-4">
            <Input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mb-4"
              required
            />
            <Input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mb-4"
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4 hidden"
              required
              disabled
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-4"
              required
            />
            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mb-4"
              required
            />
            <Input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mb-4 hidden"
            />
            <div className="flex items-center space-x-2">
              <input
                id="terms"
                type="checkbox"
                className="border-muted-foreground"
                required
              />
              <label htmlFor="terms">
                I accept the{" "}
                <a href="#" className="text-primary hover:underline">
                  terms and conditions
                </a>
              </label>
            </div>
            <div className="flex flex-col gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Signing up..." : signupText}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                disabled={isLoading}
              >
                <FcGoogle className="mr-2 size-5" />
                {googleText}
              </Button>
            </div>
          </div>
        </form>
      )}

      <div className="mt-6 flex justify-center gap-1 text-sm text-muted-foreground">
        <p>{loginText}</p>
        <Link
          href={loginUrl}
          className="font-medium text-primary hover:underline"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
