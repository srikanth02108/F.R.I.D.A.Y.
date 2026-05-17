import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { workspaceCardClass } from "@/components/workspace/workspace-styles";
import { cn } from "@/lib/utils";

export function AtsScoreLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Card className={cn(workspaceCardClass, "border-0 shadow-none")}>
        <CardContent className="flex flex-col items-center py-12">
          <Skeleton className="size-44 rounded-full" />
          <Skeleton className="mt-4 h-4 w-56" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className={cn(workspaceCardClass, "border-0 shadow-none")}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Skeleton className="h-28 w-full rounded-xl" />

      <div className="grid grid-cols-12 gap-4">
        <Card className={cn("col-span-12 lg:col-span-7", workspaceCardClass, "border-0 shadow-none")}>
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <Card className={cn("col-span-12 lg:col-span-5", workspaceCardClass, "border-0 shadow-none")}>
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
