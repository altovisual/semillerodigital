export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Ayuda</h1>
        <div className="space-y-4">
          <section className="border rounded-lg p-4">
            <h2 className="font-semibold mb-2">Preguntas Frecuentes</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>
                ¿Cómo cambio de rol? Ve al botón de perfil (arriba a la derecha) → Rol → selecciona Coordinador, Profesor o Estudiante.
              </li>
              <li>
                ¿Dónde cambio el tema o el idioma? En Ajustes (/settings) puedes seleccionar tema claro/oscuro, idioma y preferencias de notificaciones.
              </li>
              <li>
                ¿Cómo veo mis notificaciones? En la campana del header o desde el menú de perfil → Notificaciones.
              </li>
            </ul>
          </section>
          <section className="border rounded-lg p-4">
            <h2 className="font-semibold mb-2">Atajos útiles</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Desde el panel de perfil puedes ir a Perfil, Ajustes, Notificaciones y Ayuda rápidamente.</li>
            </ul>
          </section>
          <section className="border rounded-lg p-4">
            <h2 className="font-semibold mb-2">Contacto</h2>
            <p className="text-sm text-muted-foreground">
              Si necesitas soporte adicional, por favor contacta al coordinador del programa.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
