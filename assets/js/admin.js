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
    // Ensure current user is an admin (check admins table)
    try {
      const { data: admins, error: aErr } = await supabase.from('admins').select('id').eq('id', session.user.id).limit(1)
      if (aErr) throw aErr
      if (!admins || admins.length === 0) {
        // Not an admin — redirect to login (or show no-permission)
        alert('You are not authorized to view this page. Contact the site owner.')
        await supabase.auth.signOut()
        location.href = '/admin/login.html'
        return
      }
    } catch (err) {
      console.error('Admin check failed', err)
      alert('Authorization check failed. See console for details.')
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
        <div class="card" data-id="${c.id}" style="margin-bottom:12px;padding:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong>${escapeHtml(c.name || '')}</strong>
            <div>
              <button class="btn small mark-handled" data-id="${c.id}">${c.handled ? 'Handled' : 'Mark handled'}</button>
              <button class="btn small danger delete-contact" data-id="${c.id}">Delete</button>
            </div>
          </div>
          <div style="margin-top:6px;white-space:pre-wrap">${escapeHtml(c.message || '')}</div>
          <div style="font-size:12px;color:#666;margin-top:6px">${new Date(c.created_at).toLocaleString()}</div>
        </div>
      `).join('\n')
      listEl.innerHTML = html

      // Wire action buttons
      document.querySelectorAll('.mark-handled').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = btn.dataset.id
          try {
            const { error: uErr } = await supabase.from('contacts').update({ handled: true }).eq('id', id)
            if (uErr) throw uErr
            btn.textContent = 'Handled'
            btn.disabled = true
          } catch (err) {
            console.error('Mark handled error', err)
            alert('Failed to mark handled. See console for details.')
          }
        })
      })

      document.querySelectorAll('.delete-contact').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = btn.dataset.id
          if (!confirm('Delete this contact? This cannot be undone.')) return
          try {
            const { error: dErr } = await supabase.from('contacts').delete().eq('id', id)
            if (dErr) throw dErr
            const el = document.querySelector(`.card[data-id="${id}"]`)
            if (el) el.remove()
          } catch (err) {
            console.error('Delete error', err)
            alert('Failed to delete contact. See console for details.')
          }
        })
      })
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
