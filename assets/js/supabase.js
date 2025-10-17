// Supabase client scaffold for Diplosoft Media Concept
// NOTE: Replace SUPABASE_ANON_KEY placeholder before testing. Do NOT commit real keys.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://jsgnbzohfyiwpfgwucbs.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzZ25iem9oZnlpd3BmZ3d1Y2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTg1MjYsImV4cCI6MjA3NjI3NDUyNn0.fMWu79qyM8ioThTmG5zE6jqHqHMDvf7A4sNX3i127NE'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Contact form handling with improved diagnostics
const form = document.getElementById('contact-form')
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const fd = new FormData(form)
    const payload = {
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone') || null,
      subject: fd.get('subject') || null,
      message: fd.get('message')
    }

    // Basic client-side validation
    if (!payload.name || !payload.email || !payload.message) {
      alert('Please fill name, email and message.')
      return
    }

    // Optional quick network/endpoint check for easier debugging on remote hosts
    try {
      // Attempt the insert and capture detailed error information
      const { data, error } = await supabase.from('contacts').insert([payload])
      if (error) {
        // Log full error object for debugging
        console.error('Supabase insert error:', error)
        // Show a helpful alert including common failure reasons
        const userMessage = `Error submitting form: ${error.message || error.name || 'unknown error'}`
        alert(userMessage + '\n\nCommon causes: table not created, RLS blocking anonymous inserts, or CORS settings in Supabase project. Check browser console for full details.')
        return
      }

      alert('Thanks — your message has been sent.')
      form.reset()
    } catch (err) {
      // This catch will surface network / unexpected errors (CORS, network, module issues)
      console.error('Unexpected error submitting contact form:', err)
      let details = ''
      try { details = JSON.stringify(err) } catch (e) { details = String(err) }
      alert('There was an error submitting the form.\n\nDetails: ' + (err.message || details) + '\n\nOpen the browser console for full details.')
    }
  })
}

// Export the client for reuse in other modules (admin pages)
export { supabase }
