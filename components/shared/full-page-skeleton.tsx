"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function FullPageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-lg p-4 space-y-4">
          <Skeleton className="h-6 w-56" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          ))}
        </div>
        <div className="border rounded-lg p-4 space-y-4">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
