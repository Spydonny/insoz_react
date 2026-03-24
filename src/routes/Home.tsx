import { useEffect, useState } from "react";
import { fetchChildren } from "@/lib/api";
import { Child } from "@/types/child";
import { ChildCard } from "@/components/ChildCard";
import { AddChildDialog } from "@/components/AddChildDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const [children, setChildren] = useState<Child[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const { loading } = useAuth();

  useEffect(() => {
    setChildrenLoading(true);
    fetchChildren()
      .then(setChildren)
      .finally(() => setChildrenLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Skeleton className="w-10 h-10 rounded" />
            <Skeleton className="w-32 h-8" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="w-32 h-10 rounded-xl" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
          {[...Array(8)].map((_, i) => (
            <Card
              key={i}
              className="bg-white border border-yellow-200 shadow-md"
            >
              <CardContent className="flex flex-col items-center p-4 space-y-3">
                <Skeleton className="w-24 h-24 rounded-full bg-yellow-200/50" />
                <Skeleton className="h-5 w-3/4 bg-yellow-200/50" />
                <Skeleton className="h-4 w-1/2 bg-yellow-200/50" />
                <Skeleton className="h-3 w-2/3 bg-yellow-200/50" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {childrenLoading ? (
          <>
            {[...Array(8)].map((_, i) => (
              <Card
                key={i}
                className="bg-white border border-yellow-200 shadow-md"
              >
                <CardContent className="flex flex-col items-center p-4 space-y-3">
                  <Skeleton className="w-24 h-24 rounded-full bg-yellow-200/50" />
                  <Skeleton className="h-5 w-3/4 bg-yellow-200/50" />
                  <Skeleton className="h-4 w-1/2 bg-yellow-200/50" />
                  <Skeleton className="h-3 w-2/3 bg-yellow-200/50" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            {children.map((child) => (
              <ChildCard key={child.uuid} child={child} />
            ))}
            <AddChildDialog
              onAdd={(newChild) => setChildren((prev) => [...prev, newChild])}
            />
          </>
        )}
      </div>
    </div>
  );
}
