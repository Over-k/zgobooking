"use client";

import { useState, useEffect } from "react";
import { SecuritySettings } from "@prisma/client";
import { LoginHistory } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { EmailVerification } from "./EmailVerification";

export function SecurityForm() {
  const [securityData, setSecurityData] = useState<SecuritySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [newEmailAddress, setNewEmailAddress] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordFormError, setPasswordFormError] = useState("");
  const [emailFormError, setEmailFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isToggling2FA, setIsToggling2FA] = useState(false);

  const fetchLoginHistory = async (page: number = 1) => {
    try {
      setIsLoadingMore(true);
      const response = await fetch(`/api/account/login-history?page=${page}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch login history');
      }
      
      const { data, meta } = await response.json();
      setLoginHistory(page === 1 ? data : [...loginHistory, ...data]);
      setTotalPages(meta.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching login history:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/account/security');
        
        if (response.ok) {
          const data = await response.json();
          setSecurityData(data);
          setTwoFactorEnabled(data.twoFactorEnabled);
        }
      } catch (error) {
        console.error('Error fetching security data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSecurityData();
    fetchLoginHistory();
  }, []);

  useEffect(() => {
    // Clear success message after 5 seconds
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFormError("");
    setIsSubmitting(true);
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const currentPassword = formData.get('current-password') as string;
    const newPassword = formData.get('new-password') as string;
    const confirmPassword = formData.get('confirm-password') as string;

    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordFormError("All fields are required");
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 8) {
      setPasswordFormError("New password must be at least 8 characters");
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFormError("New passwords do not match");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/account/security/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }
      
      setIsChangingPassword(false);
      setSuccessMessage("Password updated successfully");
      form.reset();
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordFormError(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailFormError("");
    setIsSubmitting(true);
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newEmail = formData.get('new-email') as string;
    const password = formData.get('password') as string;

    // Basic validation
    if (!newEmail || !password) {
      setEmailFormError("All fields are required");
      setIsSubmitting(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailFormError("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/account/security/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentEmail: securityData?.email,
          newEmail, 
          password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate email change');
      }
      
      // Store new email for verification step
      setNewEmailAddress(newEmail);
      
      // Switch to verification view
      setIsChangingEmail(false);
      setIsVerifyingEmail(true);
      
      form.reset();
    } catch (error) {
      console.error('Error initiating email change:', error);
      setEmailFormError(error instanceof Error ? error.message : 'Failed to initiate email change');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailVerificationComplete = async () => {
    // Refresh security data to get updated email
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = await fetch('/api/account/security');
      
      if (!response.ok) {
        throw new Error('Failed to fetch security data');
      }
      
      const data = await response.json();
      setSecurityData(data);
      setTwoFactorEnabled(data.twoFactorEnabled);
      
      setIsVerifyingEmail(false);
      setIsChangingEmail(true);
      setSuccessMessage("Email updated successfully");
    } catch (error) {
      console.error('Error refreshing security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    try {
      const newState = !twoFactorEnabled;
      setIsToggling2FA(true);
      setTwoFactorEnabled(newState); // Optimistic update
      
      const response = await fetch('/api/account/security', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twoFactorEnabled: newState }),
      });

      if (!response.ok) {
        throw new Error('Failed to update 2FA settings');
      }
      
      const data = await response.json();
      setSecurityData(data);
    } catch (error) {
      console.error('Error updating 2FA settings:', error);
      // Revert optimistic update
      setTwoFactorEnabled(!twoFactorEnabled);
    } finally {
      setIsToggling2FA(false);
    }
  };

  if (isLoading) {
    return (
<div className="flex flex-col items-center justify-center min-h-screen py-10 space-y-2">
  <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900"></div>
  <p className="text-gray-600 text-sm">Loading, please wait...</p>
</div>
    );
  }

  if (!securityData) {
    return (
      <div className="py-10 text-center">
        <p>Unable to load security settings. Please try again later.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Security & Login</h3>
        <p className="text-sm text-slate-500">
          Manage your account security settings and login information
        </p>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
          {successMessage}
        </div>
      )}
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password or reset it if you've forgotten it
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isChangingPassword ? (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {securityData && (
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      name="current-password" 
                    type="password" 
                    required 
                  />
                </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password" 
                    name="new-password" 
                    type="password" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password" 
                    name="confirm-password" 
                    type="password" 
                    required 
                  />
                </div>
              </div>
              
              {passwordFormError && (
                <div className="mt-4 text-destructive">
                  <span>{passwordFormError}</span>
                </div>
              )}
              
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsChangingPassword(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Current Password</p>
                <p className="text-sm text-slate-500">
                  ••••••••••••
                </p>
                <p className="text-xs text-slate-400">
                  Last changed: {new Date(securityData.lastPasswordChange).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsChangingPassword(true)}
              >
                Change Password
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Address</CardTitle>
          <CardDescription>
            Change the email address associated with your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isVerifyingEmail ? (
            <EmailVerification 
              newEmail={newEmailAddress}
              onVerificationComplete={handleEmailVerificationComplete}
              onCancel={() => setIsVerifyingEmail(false)}
            />
          ) : isChangingEmail ? (
            <form onSubmit={handleEmailChange} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current-email">Current Email</Label>
                  <Input
                    id="current-email"
                    name="current-email"
                    type="email"
                    value={securityData.email}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-email">New Email</Label>
                  <Input 
                    id="new-email" 
                    name="new-email" 
                    type="email" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Confirm with Password</Label>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    required 
                  />
                </div>
              </div>
              
              {emailFormError && (
                <div className="mt-4 text-destructive">
                  <span>{emailFormError}</span>
                </div>
              )}
              
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsChangingEmail(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Update Email"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Email Address</p>
                <p className="text-sm text-slate-500">{securityData.email}</p>
                <p className="text-xs text-slate-400">
                  Status: {securityData.emailVerifiedAt ? "Verified" : "Not Verified"}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsChangingEmail(true)}
              >
                Change Email
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Two-factor authentication</p>
              <p className="text-sm text-slate-500">
                {twoFactorEnabled ? "Enabled" : "Disabled"}
              </p>
              <p className="text-xs text-slate-400">
                Receive a code via SMS when logging in from an unrecognized device
              </p>
            </div>
            <Switch
              id="2fa"
              checked={twoFactorEnabled}
              onCheckedChange={handleTwoFactorToggle}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>
            Recent login activity on your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loginHistory && loginHistory.length > 0 ? (
              loginHistory.map((login, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{login.device}</p>
                    <p className="text-sm text-slate-500">{login.location}</p>
                  </div>
                  <p className="text-sm text-slate-500">
                    {new Date(login.date).toLocaleDateString()} at{" "}
                    {new Date(login.date).toLocaleTimeString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-slate-500">No recent login activity</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          {currentPage < totalPages ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fetchLoginHistory(currentPage + 1)}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Loading...' : 'View More Login Activity'}
            </Button>
          ) : (
            <Button variant="outline" className="w-full" disabled>
              No more login activity
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}