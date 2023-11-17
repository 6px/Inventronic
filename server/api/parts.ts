import { createError } from 'h3'

import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient(event)

  const { data, error } = await client.from('Parts').select().order('created_at')
  console.log(data)
  if (error) {
    throw createError({ statusMessage: error.message })
  }

  return data
})