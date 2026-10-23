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
| `NEXT_PUBLIC_TAC_CTA_URL` | Destino del botón "Book my complimentary compliance review" (por defecto, mailto a Kieran Cleary) |
| `LEAD_WEBHOOK_URL` | Webhook que recibe los leads en JSON (p. ej. el trigger "Inbound Webhook" de un workflow de GoHighLevel). Si está vacío, solo se imprime en la consola del servidor |

## Estructura

- `src/lib/content.ts` — preguntas, textos de bandas, copy del formulario y del estimado
- `src/lib/scoring.ts` — puntos por respuesta, reglas de "trigger"/"floor", banda y estimado ilustrativo (compartido cliente/servidor)
- `src/lib/assess.ts` — textos de cada hallazgo y fortaleza; arma la respuesta de `/api/assess`
- `src/lib/leads.ts` — reenvío de leads al webhook
- `src/app/api/assess`, `src/app/api/lead` — rutas de API
- `src/components/exposure-check/` — pantalla de inicio, cuestionario, medidor, resultado y flujo principal (guarda el progreso en `localStorage`)
