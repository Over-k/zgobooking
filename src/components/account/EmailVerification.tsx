"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn } from "next-auth/react";
export function EmailVerification({ 
  newEmail, 
  onVerificationComplete, 
  onCancel 
}: { 
  newEmail: string; 
  onVerificationComplete: () => void; 
  onCancel: () => void;
}) {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit verification code");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/account/security/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: newEmail, 
          code: verificationCode 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'Invalid code') {
          const newAttempts = remainingAttempts - 1;
          setRemainingAttempts(newAttempts);
          
          if (newAttempts <= 0) {
            setError("Too many failed attempts. Please request a new code.");
          } else {
            setError(`Invalid code. ${newAttempts} attempts remaining.`);
          }
        } else {
          throw new Error(data.error || 'Verification failed');
        }
      } else {
        await signIn("credentials", {
          redirect: false,
          email: newEmail,
          trigger: "update"
        });
        onVerificationComplete();
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      setError(error instanceof Error ? error.message : 'Failed to verify email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setIsSubmitting(true);
    setError("");
    
    try {
      const response = await fetch('/api/account/security/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification code');
      }
      
      // Reset attempts
      setRemainingAttempts(3);
      
    } catch (error) {
      console.error('Error resending verification code:', error);
      setError(error instanceof Error ? error.message : 'Failed to resend verification code');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify Your Email</CardTitle>
        <CardDescription>
          Enter the 6-digit verification code sent to {newEmail}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verification-code">Verification Code</Label>
            <Input
              id="verification-code"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              className="text-center text-xl tracking-widest"
              disabled={isSubmitting || remainingAttempts <= 0}
            />
          </div>
          
          {error && (
            <div className="text-destructive text-sm">
              <span>{error}</span>
            </div>
          )}
          
          <div className="flex flex-col space-y-2">
            <Button 
              type="submit" 
              disabled={isSubmitting || remainingAttempts <= 0}
              className="w-full"
            >
              {isSubmitting ? "Verifying..." : "Verify Email"}
            </Button>
            
            <div className="flex justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResendCode}
                disabled={isSubmitting}
              >
                Resend Code
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}