import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ailnqkgrqmhchagcgprc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpbG5xa2dycW1oY2hhZ2NncHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4Mjg1MjUsImV4cCI6MjA2MDQwNDUyNX0.zuwo3EcljyHrq_z1MqmxZ3WuQsxGN7lwziCz1sh1NSE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 