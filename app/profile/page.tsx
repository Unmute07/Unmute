"use client";

import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { AccountSettings } from "@/components/profile/AccountSettings";
import { DangerZone } from "@/components/profile/DangerZone";
import { PreferencesCard } from "@/components/profile/PreferencesCard";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { SecurityCard } from "@/components/profile/SecurityCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-10 w-72 rounded-lg" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading, profile, profileLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar />
        <div className="flex-1">
          <Header title="Profile" subtitle="Manage your account, preferences, and security" />
          <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
            {loading || profileLoading || !user ? (
              <ProfileSkeleton />
            ) : (
              <Tabs defaultValue="profile">
                <TabsList>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <ProfileCard user={user} profile={profile} />
                    <AccountSettings />
                  </div>
                </TabsContent>

                <TabsContent value="preferences" className="mt-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <PreferencesCard uid={user.uid} profile={profile} />
                  </div>
                </TabsContent>

                <TabsContent value="security" className="mt-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <SecurityCard user={user} />
                    <DangerZone user={user} />
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
