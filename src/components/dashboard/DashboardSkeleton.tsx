import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-white text-yellow-900 p-6">
            {/* Header Skeleton */}
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded bg-yellow-200/50" />
                    <Skeleton className="h-8 w-64 bg-yellow-200/50" />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-10 w-24 rounded bg-yellow-200/50" />
                    <Skeleton className="h-10 w-32 rounded bg-yellow-200/50" />
                </div>
            </header>

            {/* Child Card Skeleton */}
            <Card className="mb-6 border-yellow-400 bg-white shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                    <Skeleton className="w-20 h-20 rounded-full bg-yellow-200/50" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-32 bg-yellow-200/50" />
                        <Skeleton className="h-4 w-24 bg-yellow-200/50" />
                    </div>
                </CardContent>
            </Card>

            {/* Tabs Skeleton */}
            <div className="space-y-4">
                <div className="flex gap-2 border border-yellow-400 rounded-lg p-1 bg-white w-fit shadow-sm">
                    <Skeleton className="h-10 w-24 rounded bg-yellow-200/50" />
                    <Skeleton className="h-10 w-24 rounded bg-yellow-200/50" />
                    <Skeleton className="h-10 w-24 rounded bg-yellow-200/50" />
                    <Skeleton className="h-10 w-24 rounded bg-yellow-200/50" />
                </div>

                {/* Content Skeleton */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-white border-yellow-400 shadow-md">
                            <CardContent className="p-4 space-y-3">
                                <Skeleton className="h-6 w-1/2 bg-yellow-200/50" />
                                <Skeleton className="h-32 w-full bg-yellow-200/50" />
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-yellow-400 shadow-md">
                            <CardContent className="p-4 space-y-3">
                                <Skeleton className="h-6 w-1/2 bg-yellow-200/50" />
                                <Skeleton className="h-32 w-full bg-yellow-200/50" />
                            </CardContent>
                        </Card>
                    </div>
                    <Card className="bg-white border-yellow-400 shadow-md">
                        <CardContent className="p-4 space-y-3">
                            <Skeleton className="h-6 w-1/3 bg-yellow-200/50" />
                            <Skeleton className="h-48 w-full bg-yellow-200/50" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
