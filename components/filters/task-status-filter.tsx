"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Filter, X, CheckCircle, Clock, AlertCircle, XCircle, RotateCcw, Settings } from "lucide-react"

export interface TaskStatusFilterProps {
  selectedStatuses: string[]
  onStatusChange: (statuses: string[]) => void
  totalCount: number
  filteredCount: number
  className?: string
}

// Definición de estados disponibles
export const TASK_STATUSES = [
  {
    key: "turned_in",
    label: "Entregadas",
    icon: CheckCircle,
    color: "bg-green-500/10 text-green-700 border-green-200 dark:text-green-400 dark:border-green-800",
    description: "Tareas entregadas por los estudiantes"
  },
  {
    key: "assigned",
    label: "Asignadas",
    icon: Clock,
    color: "bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-400 dark:border-blue-800",
    description: "Tareas asignadas pero no entregadas"
  },
  {
    key: "returned",
    label: "Devueltas",
    icon: RotateCcw,
    color: "bg-purple-500/10 text-purple-700 border-purple-200 dark:text-purple-400 dark:border-purple-800",
    description: "Tareas devueltas con comentarios"
  },
  {
    key: "late",
    label: "Atrasadas",
    icon: AlertCircle,
    color: "bg-orange-500/10 text-orange-700 border-orange-200 dark:text-orange-400 dark:border-orange-800",
    description: "Tareas entregadas fuera de tiempo"
  },
  {
    key: "missing",
    label: "No entregadas",
    icon: XCircle,
    color: "bg-red-500/10 text-red-700 border-red-200 dark:text-red-400 dark:border-red-800",
    description: "Tareas sin entregar"
  }
] as const

export function TaskStatusFilter({
  selectedStatuses,
  onStatusChange,
  totalCount,
  filteredCount,
  className = ""
}: TaskStatusFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleStatus = (statusKey: string) => {
    console.log('toggleStatus called with:', statusKey, 'current selected:', selectedStatuses)
    if (selectedStatuses.includes(statusKey)) {
      const newStatuses = selectedStatuses.filter(s => s !== statusKey)
      console.log('Removing status, new array:', newStatuses)
      onStatusChange(newStatuses)
    } else {
      const newStatuses = [...selectedStatuses, statusKey]
      console.log('Adding status, new array:', newStatuses)
      onStatusChange(newStatuses)
    }
  }

  const clearAllFilters = () => {
    console.log('clearAllFilters called')
    onStatusChange([])
  }

  const selectAllStatuses = () => {
    console.log('selectAllStatuses called')
    onStatusChange(TASK_STATUSES.map(s => s.key))
  }

  const hasActiveFilters = selectedStatuses.length > 0
  const isPartialSelection = selectedStatuses.length > 0 && selectedStatuses.length < TASK_STATUSES.length

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Filtros visibles en desktop */}
      <div className="hidden lg:flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Filtrar por estado:</span>
        <div className="flex flex-wrap items-center gap-1">
          {TASK_STATUSES.map((status) => {
            const IconComponent = status.icon
            const isSelected = selectedStatuses.includes(status.key)
            
            return (
              <Button
                key={status.key}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => toggleStatus(status.key)}
                className={`h-8 text-xs ${
                  isSelected 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                }`}
              >
                <IconComponent className="h-3 w-3 mr-1" />
                {status.label}
              </Button>
            )
          })}
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Botón de filtro para mobile/tablet */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          size="sm"
          className={`h-9 px-3 ${hasActiveFilters ? "border-primary" : ""}`}
          onClick={() => {
            console.log('Filter button clicked, current isOpen:', isOpen)
            setIsOpen(!isOpen)
          }}
        >
          <Filter className="h-4 w-4 mr-2" />
          <span>Filtros</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
              {selectedStatuses.length}
            </Badge>
          )}
        </Button>
        
        {/* Modal simple para mobile */}
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
            <div className="bg-background w-full max-h-[80vh] rounded-t-lg overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Filtrar por estado</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAllStatuses}
                    className="h-7 text-xs"
                  >
                    Todos
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-7 text-xs"
                  >
                    Limpiar
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {TASK_STATUSES.map((status) => {
                    const IconComponent = status.icon
                    const isSelected = selectedStatuses.includes(status.key)
                    
                    return (
                      <div
                        key={status.key}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log('Status clicked:', status.key)
                          toggleStatus(status.key)
                        }}
                        className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors select-none ${
                          isSelected 
                            ? "bg-primary/10 border border-primary/20" 
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className={`p-1.5 rounded-md ${status.color}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{status.label}</span>
                            {isSelected && (
                              <CheckCircle className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {status.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Mostrando {filteredCount} de {totalCount} tareas
                    </span>
                    {isPartialSelection && (
                      <Badge variant="outline" className="text-xs">
                        {selectedStatuses.length} filtros activos
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contador de resultados */}
      <div className="text-sm text-muted-foreground">
        {hasActiveFilters ? (
          <span>
            {filteredCount} de {totalCount} tareas
          </span>
        ) : (
          <span>{totalCount} tareas</span>
        )}
      </div>
    </div>
  )
}
