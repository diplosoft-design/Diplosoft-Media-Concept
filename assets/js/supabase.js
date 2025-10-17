// Supabase client scaffold for Diplosoft Media Concept
// NOTE: Replace SUPABASE_ANON_KEY placeholder before testing. Do NOT commit real keys.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://jsgnbzohfyiwpfgwucbs.supabase.co'
const SUPABASE_ANON_KEY = 'REPLACE_WITH_ANON_KEY'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Contact form handling
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

    try {
      const { data, error } = await supabase.from('contacts').insert([payload])
      if (error) throw error
      alert('Thanks — your message has been sent.')
      form.reset()
    } catch (err) {
      console.error(err)
      alert('There was an error submitting the form. Check console for details.')
    }
  })
}
