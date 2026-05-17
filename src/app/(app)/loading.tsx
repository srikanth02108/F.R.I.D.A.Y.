import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-slate-900 lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-5">
          <Skeleton className="size-9 rounded-lg bg-slate-700" />
          <Skeleton className="h-4 w-28 bg-slate-700" />
        </div>
        <div className="flex-1 space-y-2 px-3 py-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg bg-slate-800" />
          ))}
        </div>
        <div className="border-t border-slate-800 p-4">
          <Skeleton className="h-12 w-full rounded-lg bg-slate-800" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pt-14 lg:pt-0">
        <header className="fixed top-0 right-0 left-0 z-40 flex h-14 items-center gap-3 border-b border-slate-800 bg-slate-900 px-4 lg:hidden">
          <Skeleton className="size-9 rounded-lg bg-slate-700" />
          <Skeleton className="h-4 w-32 bg-slate-700" />
        </header>
        <header className="hidden h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 lg:flex">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </header>

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="mx-auto w-full max-w-6xl flex-1 space-y-8 overflow-y-auto px-6 py-8 lg:px-8">
            <div className="space-y-2">
              <Skeleton className="h-8 w-72 max-w-full" />
              <Skeleton className="h-4 w-48" />
            </div>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-xl border bg-white p-6 shadow-sm"
                >
                  <Skeleton className="size-11 shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </section>
            <section className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-xl" />
              ))}
            </section>
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
