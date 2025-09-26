"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* Mis Tareas */}
        <div className="border rounded-lg p-4 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-40" />
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between border rounded p-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>

        {/* Próximas Entregas */}
        <div className="border rounded-lg p-4 space-y-4">
          <Skeleton className="h-6 w-56" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between border rounded p-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Mi Progreso */}
      <div className="border rounded-lg p-4">
        <Skeleton className="h-6 w-40 mb-3" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )
}
