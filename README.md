# Diario de Trading Swing

Aplicación web privada para registrar operaciones de swing trading, analizar rendimiento y aprender de cada trade usando Next.js, TypeScript, Tailwind CSS, Supabase y Vercel.

## Qué incluye

- Login con Supabase usando magic link o email + contraseña.
- Dashboard con métricas clave de trading.
- CRUD completo de trades.
- Upload privado de screenshots con Supabase Storage.
- Analytics con gráficos útiles para swing trading.
- Filtros, orden y exportación CSV.
- Row Level Security para que cada usuario vea solo sus datos.
- Seed demo para poblar la app en un clic.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth + Database + Storage
- React Hook Form + Zod
- Recharts
- Vercel

## Estructura del proyecto

```text
app/
  (auth)/login/              Pantalla de acceso
  (app)/dashboard/           Dashboard principal
  (app)/trades/              Listado, detalle, edición y alta
  (app)/analytics/           Analítica avanzada
  (app)/settings/            Ajustes y seed demo
  api/                       API interna para CRUD, export y screenshots
components/
  charts/                    Gráficos reutilizables
  layout/                    Sidebar, topbar y navegación móvil
  trades/                    Login, formulario, tabla, detalle
  ui/                        Botones, cards, inputs y utilidades visuales
lib/
  auth/                      Helpers de autenticación
  supabase/                  Clientes SSR/browser y middleware
  trading/                   Validaciones, fórmulas, filtros, queries y CSV
  utils/                     Formatos y helpers visuales
supabase/
  setup.sql                  SQL completo para tablas, RLS, bucket y seed demo
types/
  database.ts                Tipos principales de la base de datos
```

## Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto usando este ejemplo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Qué es cada variable

- `NEXT_PUBLIC_SUPABASE_URL`: la URL de tu proyecto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: la clave pública de Supabase. Esta sí se puede usar en frontend.
- `NEXT_PUBLIC_APP_URL`: la URL donde corre la app. En local suele ser `http://localhost:3000`.

### Qué NO debes usar

- No pongas la `service_role` en el frontend.
- No agregues una variable pública llamada `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE`.
- La service role key no se usa en este proyecto.

## Cómo correr la app localmente

### 1. Instala Node.js

Instala Node.js 20 o superior desde [https://nodejs.org](https://nodejs.org).

### 2. Instala dependencias

```bash
npm install
```

### 3. Crea `.env.local`

Usa el contenido de `.env.example` y reemplaza los valores con los de tu proyecto Supabase.

### 4. Corre la app

```bash
npm run dev
```

### 5. Abre la app

Abre [http://localhost:3000](http://localhost:3000).

## Configuración completa de Supabase

### 1. Crea una cuenta

Ve a [https://supabase.com](https://supabase.com) y crea tu cuenta.

### 2. Crea un proyecto

Dentro de Supabase:

1. Haz clic en `New project`.
2. Elige tu organización.
3. Escribe un nombre para el proyecto.
4. Elige una contraseña para la base de datos y guárdala.
5. Elige la región más cercana.
6. Espera a que el proyecto termine de crearse.

### 3. Encuentra la URL y la anon key

Dentro de tu proyecto Supabase:

1. Ve a `Project Settings`.
2. Abre `Data API` o `API` según la versión del panel.
3. Copia:
   - `Project URL`
   - `anon public key`

Esos son los valores que debes pegar en `.env.local` y luego en Vercel.

### 4. Ejecuta el SQL

Dentro de Supabase:

1. Ve a `SQL Editor`.
2. Crea una nueva query.
3. Abre el archivo `supabase/setup.sql`.
4. Copia TODO el contenido.
5. Pégalo en el SQL Editor.
6. Haz clic en `Run`.

Ese script crea:

- La tabla `profiles`
- La tabla `trades`
- Índices
- Triggers `updated_at`
- Creación automática de perfiles al registrarse
- RLS
- Bucket privado `trade-screenshots`
- Policies del bucket
- Función `seed_demo_trades()`

### 5. Configura Auth

Dentro de Supabase:

1. Ve a `Authentication`.
2. Abre `Providers`.
3. Asegúrate de que `Email` esté activado.
4. Activa:
   - `Enable email confirmations`
   - `Enable magic link`
5. Si quieres permitir email + contraseña, déjalo activado también.

### 6. Define la URL de redirección

Dentro de Supabase:

1. Ve a `Authentication`.
2. Abre `URL Configuration`.
3. Agrega estas URLs:
   - `http://localhost:3000/auth/callback`
   - tu futura URL de Vercel, por ejemplo `https://tu-app.vercel.app/auth/callback`

## Despliegue en Vercel

### 1. Sube el proyecto a GitHub

Comandos:

```bash
git init
git add .
git commit -m "Inicializa diario de trading swing"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

### 2. Crea el proyecto en Vercel

1. Ve a [https://vercel.com](https://vercel.com).
2. Inicia sesión con GitHub.
3. Haz clic en `Add New Project`.
4. Elige tu repositorio.
5. Vercel detectará que es un proyecto Next.js.
6. Antes de deployar, agrega las variables de entorno.

### 3. Variables de entorno en Vercel

Agrega estas variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

En producción:

- `NEXT_PUBLIC_APP_URL` debe ser tu dominio de Vercel, por ejemplo `https://tu-app.vercel.app`

### 4. Deploy

1. Haz clic en `Deploy`.
2. Espera a que termine.
3. Copia tu URL pública.
4. Vuelve a Supabase y agrégala en `Authentication > URL Configuration`.

## Volver a desplegar después de cambios

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Describe el cambio"
git push
```

Vercel redeployará automáticamente.

## Comandos exactos, en orden

```bash
npm install
```

Instala dependencias.

```bash
npm run dev
```

Levanta la app local.

```bash
npm run typecheck
```

Verifica errores de TypeScript.

```bash
npm run build
```

Prueba que el build de producción funcione.

```bash
git init
git add .
git commit -m "Inicializa diario de trading swing"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

Sube el proyecto a GitHub.

## Checklist de pruebas

Después de configurar Supabase y correr la app:

- El login con magic link funciona.
- El login con email y contraseña funciona.
- Se crea el perfil automáticamente en `profiles`.
- Puedes crear un trade.
- Puedes editar un trade.
- Puedes borrar un trade.
- El dashboard muestra métricas.
- Analytics muestra gráficos.
- El CSV se exporta.
- El screenshot sube correctamente.
- El screenshot se guarda en `trade-screenshots`.
- Un usuario no puede ver datos de otro usuario.
- La app builda en local con `npm run build`.
- El deploy en Vercel funciona.

## Problemas comunes

### 1. No carga el login por magic link

Revisa:

- Que `Email` esté activado en Supabase Auth.
- Que hayas agregado `http://localhost:3000/auth/callback`.
- Que hayas agregado también la URL de Vercel.

### 2. El login funciona pero no guarda trades

Revisa:

- Que hayas ejecutado completo `supabase/setup.sql`.
- Que las policies RLS se hayan creado.
- Que la tabla `trades` exista.

### 3. No se suben imágenes

Revisa:

- Que el bucket `trade-screenshots` exista.
- Que las policies de `storage.objects` estén creadas.
- Que el archivo sea PNG, JPG o WEBP.
- Que pese menos de 5 MB.

### 4. La app funciona en local pero falla en Vercel

Revisa:

- Variables de entorno cargadas en Vercel.
- `NEXT_PUBLIC_APP_URL` apuntando a tu dominio real.
- URL de callback agregada en Supabase.

### 5. El dashboard no muestra datos

Revisa:

- Que tengas trades cerrados.
- Que no estés filtrando por estado o fecha.
- Que hayas usado `Cargar datos demo` en `Ajustes` si aún no ingresaste trades.

## Fórmulas usadas

La app calcula las métricas principales de manera consistente:

- Long: `pnl_bruto = (precio_salida - precio_entrada) * cantidad`
- Short: `pnl_bruto = (precio_entrada - precio_salida) * cantidad`
- `pnl_neto = pnl_bruto - fees`
- `riesgo_total = abs(precio_entrada - stop_loss) * cantidad`
- `reward_potencial = abs(take_profit - precio_entrada) * cantidad`
- `rr_planeado = reward_potencial / riesgo_total`
- `pnl_% = pnl_neto / (precio_entrada * cantidad) * 100`
- `R_realizado = pnl_neto / riesgo_total`
- `holding_days = diferencia entre fecha_salida y fecha_entrada`
- `profit_factor = suma_ganancias_netas / abs(suma_pérdidas_netas)`
- `expectancy = (win_rate * average_winner) - ((1 - win_rate) * abs(average_loser))`

Notas:

- Las métricas de rendimiento usan trades cerrados.
- `profit_factor` usa P&L neto, no bruto, porque refleja mejor la realidad.
- La equity curve acumula el P&L neto de trades cerrados ordenados por fecha de salida.

## Cómo verificar RLS manualmente

Puedes comprobar RLS así:

1. Crea dos cuentas distintas.
2. Inicia sesión con la cuenta A y crea trades.
3. Cierra sesión.
4. Inicia sesión con la cuenta B.
5. Verás una app vacía o solo sus propios trades.
6. La cuenta B no debe ver nada de la cuenta A.

## Explicación ultra simple

- `Next.js` es la tecnología que construye la web y sus pantallas.
- `Supabase` es donde se guardan usuarios, trades e imágenes.
- `Vercel` es donde publicas la web para usarla desde internet.
- Cuando haces deploy, Vercel toma tu código desde GitHub, lo compila y lo publica.
- Los datos quedan guardados en Supabase, no en Vercel.
- La web que ves en el navegador le pide datos a Supabase usando una clave pública segura.

## Archivos clave

- `supabase/setup.sql`: SQL completo para pegar en Supabase.
- `.env.example`: ejemplo de variables de entorno.
- `app/api/...`: endpoints internos para CRUD, exportación y screenshots.
- `lib/trading/calculations.ts`: fórmulas y analytics.
- `components/trades/trade-form.tsx`: formulario principal.
- `components/trades/trades-table.tsx`: tabla con filtros y acciones.

## Estado actual del proyecto

Validado localmente con:

```bash
npm run typecheck
npm run build
```

Ambos comandos pasaron correctamente al momento de dejar este proyecto listo.
