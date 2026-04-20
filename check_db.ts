import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function check() {
  const { data, error } = await supabase
    .from('external_opportunities')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error fetching external_opportunities:', error)
  } else {
    console.log('Columns in external_opportunities:', data.length > 0 ? Object.keys(data[0]) : 'No data to determine columns')
  }
}

check()
