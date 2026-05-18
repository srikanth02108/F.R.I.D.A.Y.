"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LogOut, Menu } from "lucide-react";
import toast from "react-hot-toast";

import { FridayLogo } from "@/components/brand/friday-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserPlan } from "@/components/providers/user-plan-provider";
import { getPlanSidebarLabel } from "@/lib/plan-access";
import { navItems } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/types/database";

type UserContext = {
  email: string;
  displayName: string;
  initial: string;
  avatarUrl: string | null;
  planLabel: string;
};

const sidebarShellClass =
  "bg-zinc-950 text-zinc-100 border-r border-zinc-900 dark:bg-black";

function getInitial(name: string, email: string): string {
  const source = name.trim() || email.trim();
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source[0]?.toUpperCase() ?? "?";
}

function SidebarBrand() {
  return (
    <div
      className={cn(
        "flex h-16 shrink-0 items-center border-b border-zinc-900 px-5",
        sidebarShellClass,
      )}
    >
      <FridayLogo
        size={36}
        href="/app/dashboard"
        wordmarkClassName="text-sm text-zinc-100"
      />
    </div>
  );
}

function SidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-zinc-900 text-white ring-1 ring-purple-500/20"
                : "text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-50",
            )}
          >
            <Icon
              className={cn(
                "size-[18px] shrink-0",
                isActive ? "text-purple-400" : "text-zinc-500",
              )}
            />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarUserDeck({
  userContext,
  loadingUser,
  onSignOut,
}: {
  userContext: UserContext | null;
  loadingUser: boolean;
  onSignOut: () => void;
}) {
  return (
    <div className="shrink-0 space-y-3 border-t border-zinc-900 p-4">
      {loadingUser ? (
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full bg-zinc-800" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-24 bg-zinc-800" />
            <Skeleton className="h-3 w-32 bg-zinc-800" />
          </div>
        </div>
      ) : userContext ? (
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg bg-zinc-900/60 px-2 py-2 transition-all duration-300",
            "hover:ring-1 hover:ring-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]",
          )}
        >
          <Avatar size="sm" className="size-10">
            {userContext.avatarUrl ? (
              <AvatarImage
                src={userContext.avatarUrl}
                alt={userContext.displayName}
              />
            ) : null}
            <AvatarFallback className="bg-purple-600 text-sm font-semibold text-white">
              {userContext.initial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-50">
              {userContext.displayName}
            </p>
            <p className="truncate text-xs text-zinc-500">
              {userContext.email}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-zinc-500">Sign in to sync your vault</p>
      )}

      {userContext ? (
        <p className="text-xs text-zinc-500">{userContext.planLabel}</p>
      ) : null}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-50"
        onClick={onSignOut}
        disabled={loadingUser}
      >
        <LogOut className="size-4" />
        Sign Out
      </Button>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { snapshot: planSnapshot } = useUserPlan();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const loadUserContext = useCallback(async () => {
    setLoadingUser(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setUserContext(null);
        return;
      }

      const email = user.email ?? "";
      let displayName =
        (user.user_metadata?.full_name as string | undefined)?.trim() ?? "";
      let avatarUrl: string | null = null;
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        const row = profile as Pick<UserProfile, "full_name" | "avatar_url">;
        if (row.full_name?.trim()) {
          displayName = row.full_name.trim();
        }
        avatarUrl = row.avatar_url;
      }

      const planLabel = getPlanSidebarLabel(planSnapshot);

      if (!displayName) {
        displayName = email.split("@")[0] || "User";
      }

      setUserContext({
        email,
        displayName,
        initial: getInitial(displayName, email),
        avatarUrl,
        planLabel,
      });
    } catch (error) {
      console.error("[Sidebar] Failed to load user context", error);
      setUserContext(null);
    } finally {
      setLoadingUser(false);
    }
  }, [planSnapshot]);

  useEffect(() => {
    void loadUserContext();
  }, [loadUserContext]);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUserContext(null);
      toast.success("Signed out successfully");
      window.location.href = "/";
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not sign out";
      toast.error(message);
    }
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 left-0 z-50 flex h-14 items-center justify-between border-b border-zinc-900 px-4 lg:hidden",
          sidebarShellClass,
        )}
      >
        <FridayLogo
          size={32}
          href="/app/dashboard"
          wordmarkClassName="text-sm text-zinc-100"
        />
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-zinc-100 hover:bg-zinc-900 hover:text-white"
              aria-label="Open navigation menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className={cn(
              "w-72 border-zinc-900 p-0 text-zinc-100 sm:max-w-xs",
              sidebarShellClass,
            )}
            showCloseButton
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <div className="flex h-full flex-col">
              <SidebarBrand />
              <SidebarNav pathname={pathname} onNavigate={closeMobile} />
              <SidebarUserDeck
                userContext={userContext}
                loadingUser={loadingUser}
                onSignOut={() => {
                  closeMobile();
                  void handleSignOut();
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 hidden h-screen w-60 flex-col lg:flex",
          sidebarShellClass,
        )}
      >
        <SidebarBrand />
        <SidebarNav pathname={pathname} />
        <SidebarUserDeck
          userContext={userContext}
          loadingUser={loadingUser}
          onSignOut={() => void handleSignOut()}
        />
      </aside>
    </>
  );
}
