import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSkeleton() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-10 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>

      <header className="mb-12">
        <Skeleton className="h-10 w-2/3 mb-3" />
        <Skeleton className="h-4 w-1/3 mb-4" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] lg:grid-rows-[auto_auto] gap-12">
        <div className="flex flex-col gap-12 lg:col-start-1 lg:row-start-1">
          <Skeleton className="h-36 w-full rounded-xl" />

          {/* All time options */}
          <div>
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="divide-y">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="py-4 flex items-center gap-4">
                  <Skeleton className="h-4 w-6 shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-2" />
                    <Skeleton className="h-1 w-full rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-10 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right col: Cast your vote */}
        <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div>
              <Skeleton className="h-3 w-24 mb-3" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-24 rounded-full" />
                      <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="lg:col-start-1 lg:row-start-2">
          <Skeleton className="h-5 w-36 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Skeleton className="h-6 w-24 rounded-md" />
                  <Skeleton className="h-6 w-20 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
} 