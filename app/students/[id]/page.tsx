interface StudentDetailPageProps {
  params: { id: string }
}

export default function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { id } = params
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto space-y-2">
        <h1 className="text-2xl font-bold">Detalle del Estudiante</h1>
        <p className="text-muted-foreground">ID: {id}</p>
        <div className="mt-6 border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Vista de detalle del estudiante en construcción...</p>
        </div>
      </div>
    </div>
  )
}
