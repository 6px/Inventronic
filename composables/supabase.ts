import { createClient } from '@supabase/supabase-js'

export const useSupabase = () => {
  

return createClient(
  "https://uxpdfjmzzxczanpasdwx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cGRmam16enhjemFucGFzZHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAxNjk1MDAsImV4cCI6MjAxNTc0NTUwMH0.dqIbxe8SewbqgnAqLotppTGnn8sG-nHws5KmSaf1Joc"
)
}
