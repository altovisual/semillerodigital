interface StudentGradePageProps {
  params: { id: string }
}

export default function StudentGradePage({ params }: StudentGradePageProps) {
  const { id } = params
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto space-y-2">
        <h1 className="text-2xl font-bold">Calificaciones del Estudiante</h1>
        <p className="text-muted-foreground">Estudiante ID: {id}</p>
        <div className="mt-6 border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Vista de calificaciones en construcción...</p>
        </div>
      </div>
    </div>
  )
}
