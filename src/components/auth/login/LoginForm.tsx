"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FcGoogle } from "react-icons/fc";
import { AuthModel } from "@/lib/models/auth";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { JSX } from 'react';

interface LoginFormProps {
  loginText: string;
  googleText: string;
  signupText: string;
  signupUrl: string;
}

export default function LoginForm({
  loginText,
  googleText,
  signupText,
  signupUrl,
}: LoginFormProps): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // First, check if we have valid credentials
      if (!email.trim() || !password.trim()) {
        setError("Please fill in both email and password");
        return;
      }
      // Try direct sign in without redirect
      const result = await signIn("credentials", {
        redirect: true,
        email: email.trim(),
        password: password.trim(),
        callbackUrl: "/",

      });

      if (result?.error) {
        setError(result.error);
        return;
      }
    } catch (err) {
      setError("An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <div className="grid gap-4">
        {error && (
          <div className="p-3 text-sm bg-red-50 text-red-500 rounded-md">
            {error}
          </div>
        )}
        <Input
          type="email"
          placeholder="Enter your email"
          required
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
        <Input
          type="password"
          placeholder="Enter your password"
          required
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
        <div className="flex justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" className="border-muted-foreground" />
            <label
              htmlFor="remember"
              className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember me
            </label>
          </div>
          <Link
            href={AuthModel.getPath("reset")}
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
          {isLoading ? "Loading..." : loginText}
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
      <div className="mx-auto mt-8 flex justify-center gap-1 text-sm text-muted-foreground">
        <p>{signupText}</p>
        <Link href={signupUrl} className="font-medium text-primary">
          Sign up
        </Link>
      </div>
    </form>
  );
}
