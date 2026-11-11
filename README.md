# ACA Compliance Exposure Check (TAC Benefits Group)

Reconstrucción local de https://tac-aca-exposure-check.vercel.app/ — Next.js 16 (App Router, Turbopack), Tailwind v4, Motion y Zod.

## Arrancar

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Para producción: `npm run build && npm start`.

## Configuración

Copia `.env.example` a `.env.local`:

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_GATE_MODE` | `first` (formulario antes de las preguntas, por defecto), `last` (después) u `off` |
| `NEXT_PUBLIC_TAC_CALENDAR_URL` | Página de Calendly embebida en el resultado (por defecto `https://calendly.com/kcleary-tac540/30min`), con nombre y email ya rellenados; el botón de reserva baja hasta ella. `off` la oculta y el botón usa `NEXT_PUBLIC_TAC_CTA_URL` |
| `NEXT_PUBLIC_TAC_CTA_URL` | Destino del botón de reserva cuando no hay calendario embebido (por defecto, mailto a Kieran Cleary) |
| `LEAD_WEBHOOK_URL` | Webhook que recibe los leads en JSON (p. ej. el trigger "Inbound Webhook" de un workflow de GoHighLevel). Si está vacío, solo se imprime en la consola del servidor |

## Webhook de leads (GoHighLevel)

Se envían dos eventos JSON a `LEAD_WEBHOOK_URL`, distinguibles por el campo `event`:

- `lead_captured` — cuando el usuario llena el formulario (en modo `first`, antes de responder; sirve para capturar a quien abandona).
- `assessment_completed` — al terminar las 10 preguntas, con todo lo anterior más el resultado.

Campos principales (todos en el nivel superior, listos para mapear en GHL):

- Contacto: `first_name`, `last_name`, `full_name`, `email`, `company_name`, `role`, `role_label`
- Respuestas: `answer_associates`, `answer_specialty`, `answer_arrangement`, `answer_measurement`, `answer_offerRate`, `answer_coverage`, `answer_evidence`, `answer_lifecycle`, `answer_filing`, `answer_irsLetters` (texto de la opción elegida), `answers_summary` (pregunta → respuesta, ideal para una nota), `answers` (valores crudos)
- Resultado: `exposure_band`, `exposure_level`, `exposure_points`, `exposure_max_points`, `exposure_headline`, `findings_count`, `findings_summary`, `strengths_summary`, `estimate_scenario`, `estimate_amount` (con el supuesto por defecto del 25 % a tiempo completo)
- Contexto: `submitted_at`, `gate_mode`, `questions_answered` y cualquier `utm_*`, `ref` o `gclid` de la URL

En Vercel, añade `LEAD_WEBHOOK_URL` en *Settings → Environment Variables*.

## Estructura

- `src/lib/content.ts` — preguntas, textos de bandas, copy del formulario y del estimado
- `src/lib/scoring.ts` — puntos por respuesta, reglas de "trigger"/"floor", banda y estimado ilustrativo (compartido cliente/servidor)
- `src/lib/assess.ts` — textos de cada hallazgo y fortaleza; arma la respuesta de `/api/assess`
- `src/lib/leads.ts` — reenvío de leads al webhook
- `src/app/api/assess`, `src/app/api/lead` — rutas de API
- `src/components/exposure-check/` — pantalla de inicio, cuestionario, medidor, resultado y flujo principal (guarda el progreso en `localStorage`)
