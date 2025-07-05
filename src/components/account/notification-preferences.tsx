"use client";

import { useState, useEffect } from "react";
import { NotificationPreferences } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export function NotificationPreferencesForm() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/account/notification-preferences');
        if (!response.ok) {
          throw new Error('Failed to fetch notification preferences');
        }
        const data = await response.json();
        setPreferences(data);
      } catch (error) {
        console.error('Error fetching notification preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleToggle = (
    preference: keyof NotificationPreferences,
    value: boolean
  ) => {
    if (!preferences) return;
    
    setPreferences((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [preference]: value,
      };
    });
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/account/notification-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) {
        throw new Error('Failed to update notification preferences');
      }

      const data = await response.json();
      setPreferences(data);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  };

  const renderEmailPreferences = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="font-medium">Marketing</h4>
          <p className="text-sm text-slate-500">
            Receive emails about new features, promotions, and special offers
          </p>
        </div>
        <Switch
          checked={preferences?.emailMarketing ?? false}
          onCheckedChange={(value) => handleToggle("emailMarketing", value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="font-medium">Account Updates</h4>
          <p className="text-sm text-slate-500">
            Important information about your account and security
          </p>
        </div>
        <Switch
          checked={preferences?.emailAccountUpdates ?? false}
          onCheckedChange={(value) => handleToggle("emailAccountUpdates", value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="font-medium">Booking Reminders</h4>
          <p className="text-sm text-slate-500">
            Get reminders about upcoming bookings and check-ins
          </p>
        </div>
        <Switch
          checked={preferences?.emailBookingReminders ?? false}
          onCheckedChange={(value) => handleToggle("emailBookingReminders", value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="font-medium">New Messages</h4>
          <p className="text-sm text-slate-500">
            Be notified when you receive new messages
          </p>
        </div>
        <Switch
          checked={preferences?.emailNewMessages ?? false}
          onCheckedChange={(value) => handleToggle("emailNewMessages", value)}
        />
      </div>
    </div>
  );

  const renderPushPreferences = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="font-medium">Marketing</h4>
          <p className="text-sm text-slate-500">
            Receive push notifications about new features, promotions, and special offers
          </p>
        </div>
        <Switch
          checked={preferences?.pushMarketing ?? false}
          onCheckedChange={(value) => handleToggle("pushMarketing", value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="font-medium">Account Updates</h4>
          <p className="text-sm text-slate-500">
            Important information about your account and security
          </p>
        </div>
        <Switch
          checked={preferences?.pushAccountUpdates ?? false}
          onCheckedChange={(value) => handleToggle("pushAccountUpdates", value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="font-medium">Booking Reminders</h4>
          <p className="text-sm text-slate-500">
            Get reminders about upcoming bookings and check-ins
          </p>
        </div>
        <Switch
          checked={preferences?.pushBookingReminders ?? false}
          onCheckedChange={(value) => handleToggle("pushBookingReminders", value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="font-medium">New Messages</h4>
          <p className="text-sm text-slate-500">
            Be notified when you receive new messages
          </p>
        </div>
        <Switch
          checked={preferences?.pushNewMessages ?? false}
          onCheckedChange={(value) => handleToggle("pushNewMessages", value)}
        />
      </div>
    </div>
  );

  const renderSMSPreferences = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="font-medium">Marketing</h4>
          <p className="text-sm text-slate-500">
            Receive SMS about new features, promotions, and special offers
          </p>
        </div>
        <Switch
          checked={preferences?.smsMarketing ?? false}
          onCheckedChange={(value) => handleToggle("smsMarketing", value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="font-medium">Account Updates</h4>
          <p className="text-sm text-slate-500">
            Important information about your account and security
          </p>
        </div>
        <Switch
          checked={preferences?.smsAccountUpdates ?? false}
          onCheckedChange={(value) => handleToggle("smsAccountUpdates", value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="font-medium">Booking Reminders</h4>
          <p className="text-sm text-slate-500">
            Get reminders about upcoming bookings and check-ins
          </p>
        </div>
        <Switch
          checked={preferences?.smsBookingReminders ?? false}
          onCheckedChange={(value) => handleToggle("smsBookingReminders", value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="font-medium">New Messages</h4>
          <p className="text-sm text-slate-500">
            Be notified when you receive new messages
          </p>
        </div>
        <Switch
          checked={preferences?.smsNewMessages ?? false}
          onCheckedChange={(value) => handleToggle("smsNewMessages", value)}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Notifications</h3>
        <p className="text-sm text-slate-500">
          Manage how and when you receive notifications
        </p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive and how you
            want to receive them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="push">Push</TabsTrigger>
              <TabsTrigger value="sms">SMS</TabsTrigger>
            </TabsList>
            <TabsContent value="email" className="mt-6">
              {renderEmailPreferences()}
            </TabsContent>
            <TabsContent value="push" className="mt-6">
              {renderPushPreferences()}
            </TabsContent>
            <TabsContent value="sms" className="mt-6">
              {renderSMSPreferences()}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={handleSave}>Save Preferences</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
