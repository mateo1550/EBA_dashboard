import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'URL_REMOVED'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'KEY_REMOVED'

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
