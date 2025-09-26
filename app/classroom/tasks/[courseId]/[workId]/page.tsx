import { Metadata } from "next"
import { getClassroomClient } from "@/lib/google-client"
import { GradeBadge } from "@/components/shared/grade-badge"
import { StatusChips } from "@/components/shared/status-chips"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Detalle de Tarea | Classroom",
}

// Acepta el tipo de fecha de Classroom (puede traer year/month/day como number | null)
function fmtDate(d?: { year?: number | null; month?: number | null; day?: number | null } | null) {
  const y = d?.year ?? undefined
  const m = d?.month ?? undefined
  const day = d?.day ?? undefined
  if (!y || !m || !day) return "—"
  return `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export default async function Page({ params }: { params: { courseId: string; workId: string } }) {
  const { classroom } = await getClassroomClient()
  const { courseId, workId } = params

  // Coursework details (includes description and materials)
  const cw = await classroom.courses.courseWork.get({ courseId, id: workId }).then(r => r.data)

  // Try to get current user's submission; if none (e.g., teacher), list all for a summary
  const meSubmissionRes = await classroom.courses.courseWork.studentSubmissions.list({ courseId, courseWorkId: workId, userId: "me" as any })
  const meSubmission = (meSubmissionRes.data.studentSubmissions || [])[0]

  let allSubmissions: any[] = []
  if (!meSubmission) {
    const all = await classroom.courses.courseWork.studentSubmissions.list({ courseId, courseWorkId: workId })
    allSubmissions = all.data.studentSubmissions || []
  }

  const maxPoints = cw.maxPoints ?? null
  const due = fmtDate(cw.dueDate)

  return (
    <div className="container mx-auto max-w-5xl py-6">
      <div className="mb-4">
        <Link href="/dashboard/student" className="text-sm text-muted-foreground underline">Volver</Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-balance">{cw.title || `Tarea ${workId}`}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Curso:</span> <span>{courseId}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Fecha de entrega:</span> <span>{due}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Puntos:</span>
              <span>{typeof maxPoints === "number" ? maxPoints : "—"}</span>
              {typeof meSubmission?.assignedGrade === "number" && (
                <GradeBadge assigned={meSubmission.assignedGrade} maxPoints={maxPoints} />
              )}
            </div>
            {cw.alternateLink && (
              <div>
                <a href={cw.alternateLink} target="_blank" rel="noreferrer" className="text-primary underline">Abrir en Classroom</a>
              </div>
            )}
          </div>

          {cw.description && (
            <div className="prose prose-sm max-w-none">
              <h3>Descripción</h3>
              <p>{cw.description}</p>
            </div>
          )}

          {/* Materials preview */}
          {cw.materials && cw.materials.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Materiales</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {cw.materials.map((m: any, idx: number) => {
                  const drive = m.driveFile?.driveFile
                  const link = drive?.alternateLink || m.link?.url || cw.alternateLink
                  const title = drive?.title || m.link?.title || `Archivo ${idx + 1}`
                  const fileId = drive?.id
                  const canPreview = !!fileId
                  return (
                    <div key={idx} className="border rounded p-3 space-y-2">
                      <div className="font-medium text-sm">{title}</div>
                      {canPreview ? (
                        <div className="aspect-video w-full">
                          <iframe
                            src={`https://drive.google.com/file/${fileId}/preview`}
                            className="w-full h-full rounded"
                            allow="autoplay"
                          />
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">Previsualización no disponible</div>
                      )}
                      {link && (
                        <a href={link} target="_blank" rel="noreferrer" className="text-primary underline text-sm">Abrir recurso</a>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* My submission or summary */}
          {meSubmission ? (
            <div className="space-y-3">
              <h3 className="font-medium">Mi entrega</h3>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary">Estado: {meSubmission.state}</Badge>
                {typeof meSubmission.assignedGrade === "number" && (
                  <GradeBadge assigned={meSubmission.assignedGrade} maxPoints={maxPoints} />
                )}
                {meSubmission.alternateLink && (
                  <a href={meSubmission.alternateLink} target="_blank" rel="noreferrer" className="text-primary underline">Abrir en Classroom</a>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="font-medium">Entregas del curso</h3>
              <StatusChips items={allSubmissions.map(s => ({ state: s.state, late: s.late }))} />
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Alumno</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Tarde</TableHead>
                      <TableHead>Nota</TableHead>
                      <TableHead>Enlace</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allSubmissions.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{s.userId || "—"}</TableCell>
                        <TableCell>{s.state || "—"}</TableCell>
                        <TableCell>{s.late ? "Sí" : "No"}</TableCell>
                        <TableCell>
                          <GradeBadge assigned={typeof s.assignedGrade === "number" ? s.assignedGrade : null} maxPoints={maxPoints} />
                        </TableCell>
                        <TableCell>
                          {s.alternateLink ? (
                            <a href={s.alternateLink} target="_blank" rel="noreferrer" className="text-primary underline">Abrir</a>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
