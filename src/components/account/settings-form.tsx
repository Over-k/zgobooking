// src/components/account/settings-form.tsx
"use client";

import { useState, useEffect } from "react";
import { AccountSettings } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export function SettingsForm() {
  const [settings, setSettings] = useState<AccountSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/account/settings');
        if (!response.ok) {
          throw new Error('Failed to fetch account settings');
        }
        const data = await response.json();
        setSettings({
          id: data.id,
          userId: data.userId,
          language: data.language,
          currency: data.currency,
          timezone: data.timezone,
          showProfile: data.showProfile,
          shareActivity: data.shareActivity,
          allowMarketingEmails: data.allowMarketingEmails,
        });
      } catch (error) {
        console.error('Error fetching account settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handlePrivacyToggle = (
    key: keyof AccountSettings,
    value: boolean
  ) => {
    if (!settings) return;
    
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const handleSelectChange = (
    key: keyof Omit<AccountSettings, "privacySettings">,
    value: string
  ) => {
    if (!settings) return;
    
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/account/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: settings.language,
          currency: settings.currency,
          timezone: settings.timezone,
          privacySettings: {
            showProfile: settings.showProfile,
            shareActivity: settings.shareActivity,
            allowMarketingEmails: settings.allowMarketingEmails
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update account settings');
      }

      console.log("Settings updated successfully");
    } catch (error) {
      console.error('Error saving account settings:', error);
      console.log("Failed to save account settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete account');
      
      // Redirect to login page after deletion
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="py-10 text-center">
        <p>Unable to load settings. Please try again later.</p>
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
        <h3 className="text-2xl font-bold">Settings</h3>
        <p className="text-sm text-slate-500">
          Manage your account preferences and settings
        </p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Customize your account preferences and regional settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => handleSelectChange("language", value)}
              >
                <SelectTrigger id="language" className="w-full">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Languages</SelectLabel>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => handleSelectChange("currency", value)}
              >
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue placeholder="Select a currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Currencies</SelectLabel>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => handleSelectChange("timezone", value)}
              >
                <SelectTrigger id="timezone" className="w-full">
                  <SelectValue placeholder="Select a timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>North America</SelectLabel>
                    <SelectItem value="America/Los_Angeles">
                      Pacific Time (US & Canada)
                    </SelectItem>
                    <SelectItem value="America/Denver">
                      Mountain Time (US & Canada)
                    </SelectItem>
                    <SelectItem value="America/Chicago">
                      Central Time (US & Canada)
                    </SelectItem>
                    <SelectItem value="America/New_York">
                      Eastern Time (US & Canada)
                    </SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Europe</SelectLabel>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Paris">Paris</SelectItem>
                    <SelectItem value="Europe/Berlin">Berlin</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Asia</SelectLabel>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
                    <SelectItem value="Asia/Singapore">Singapore</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy & Data</CardTitle>
          <CardDescription>
            Manage your privacy settings and data preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-medium">Public Profile</h4>
                <p className="text-sm text-slate-500">
                  Allow others to see your profile and listings
                </p>
              </div>
              <Switch
                checked={settings.showProfile}
                onCheckedChange={(value) =>
                  handlePrivacyToggle("showProfile", value)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-medium">Share Activity</h4>
                <p className="text-sm text-slate-500">
                  Share your activity and reviews with the community
                </p>
              </div>
              <Switch
                checked={settings.shareActivity}
                onCheckedChange={(value) =>
                  handlePrivacyToggle("shareActivity", value)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-medium">Marketing Emails</h4>
                <p className="text-sm text-slate-500">
                  Receive emails about promotions and special offers
                </p>
              </div>
              <Switch
                checked={settings.allowMarketingEmails}
                onCheckedChange={(value) =>
                  handlePrivacyToggle("allowMarketingEmails", value)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>Manage your account and data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">Download Your Data</h4>
            <p className="text-sm text-slate-500">
              Request a copy of all your personal data
            </p>
            <Button variant="outline" className="mt-2" disabled>
              Request Data Export
            </Button>
          </div>

          <div>
            <h4 className="font-medium text-red-600">Danger Zone</h4>
            <p className="text-sm text-slate-500">
              These actions are permanent and cannot be undone
            </p>
            <div className="mt-2 space-y-2">
              <Button
              onClick={handleDeleteAccount}
                variant="outline"
                className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}