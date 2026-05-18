import { AppTopBar } from "@/components/layout/AppTopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { UserPlanProvider } from "@/components/providers/user-plan-provider";
import { fetchUserPlanSnapshot } from "@/lib/plan-server";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const initialSnapshot = user ? await fetchUserPlanSnapshot(user.id) : null;

  return (
    <UserPlanProvider initialSnapshot={initialSnapshot}>
      <div className="flex h-screen overflow-hidden bg-zinc-100 dark:bg-black">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col pt-14 lg:pt-0 lg:pl-60">
          <AppTopBar />
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </UserPlanProvider>
  );
}
