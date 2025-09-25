interface TaskPageProps {
  params: { id: string }
}

export default function TaskDetailPage({ params }: TaskPageProps) {
  const { id } = params
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Detalle de Tarea</h1>
        <p className="text-muted-foreground">ID: {id}</p>
        <div className="mt-6 border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Contenido de la tarea en construcción...</p>
        </div>
      </div>
    </div>
  )
}
