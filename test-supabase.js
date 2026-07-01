import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ebasupabase.agenteeba.online'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.20DtBmWlcThQfKcSka8yuyoaFIE0DQP7zXxpQTgruP8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function getDistinctStates() {
  console.log("Fetching states...")
  const { data, error } = await supabase
    .from('pagos')
    .select('estado_conciliacion')
  
  if (error) {
    console.error("Error al conectar:", error.message)
    process.exit(1)
  } else {
    const states = new Set(data.map(r => r.estado_conciliacion))
    console.log("Distinct states found:", Array.from(states))
  }
}

getDistinctStates()
