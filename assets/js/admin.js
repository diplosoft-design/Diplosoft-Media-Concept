import { supabase } from './supabase.js'

const pathname = location.pathname

// Simple client-side guard: if on dashboard but not authenticated, redirect to login
async function ensureAuth() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

if (pathname.endsWith('/admin/dashboard.html') || pathname === '/admin/dashboard') {
  ;(async () => {
    const session = await ensureAuth()
    if (!session) {
      location.href = '/admin/login.html'
      return
    }

    // Fetch contacts
    const listEl = document.getElementById('contacts-list')
    try {
      const { data, error } = await supabase.from('contacts').select('*').order('created_at', { ascending: false }).limit(200)
      if (error) throw error
      if (!data || data.length === 0) {
        listEl.textContent = 'No contacts yet.'
        return
      }

      const html = data.map(c => `
        <div class="card" style="margin-bottom:12px;padding:12px;">
          <strong>${escapeHtml(c.name || '')}</strong> — <a href="mailto:${escapeHtml(c.email || '')}">${escapeHtml(c.email || '')}</a>
          <div style="margin-top:6px;white-space:pre-wrap">${escapeHtml(c.message || '')}</div>
          <div style="font-size:12px;color:#666;margin-top:6px">${new Date(c.created_at).toLocaleString()}</div>
        </div>
      `).join('\n')
      listEl.innerHTML = html
    } catch (err) {
      console.error(err)
      listEl.textContent = 'Error loading contacts. Check console.'
    }

    // Sign out handler
    const signOut = document.getElementById('sign-out')
    if (signOut) {
      signOut.addEventListener('click', async () => {
        await supabase.auth.signOut()
        location.href = '/admin/login.html'
      })
    }
  })()
}

if (pathname.endsWith('/admin/login.html') || pathname === '/admin/login') {
  const form = document.getElementById('admin-login')
  const errEl = document.getElementById('login-error')
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const fd = new FormData(form)
      const email = fd.get('email')
      const password = fd.get('password')
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // On success, redirect to dashboard
        location.href = '/admin/dashboard.html'
      } catch (err) {
        console.error('Login error', err)
        errEl.textContent = err.message || String(err)
      }
    })
  }
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"
  })[c])
}
