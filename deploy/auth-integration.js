// Supabase Frontend Integration
// Add this to your HTML pages that need authentication

class SupabaseAuth {
  constructor() {
    this.supabase = null
    this.user = null
    this.init()
  }

  async init() {
    // Load Supabase from CDN
    if (typeof window !== 'undefined' && !window.supabase) {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
      script.type = 'module'
      document.head.appendChild(script)
      
      // Wait for script to load
      await new Promise(resolve => {
        script.onload = resolve
      })
    }

    // Initialize Supabase client
    this.supabase = window.supabase.createClient(
      window.SUPABASE_URL || 'YOUR_SUPABASE_URL',
      window.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
    )

    // Check for existing session
    await this.checkSession()
    
    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.user = session?.user || null
      this.updateUI()
    })
  }

  async checkSession() {
    const { data: { session } } = await this.supabase.auth.getSession()
    this.user = session?.user || null
    this.updateUI()
  }

  async signInWithGoogle() {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback'
      }
    })
    
    if (error) {
      console.error('Sign in error:', error)
      alert('Sign in failed: ' + error.message)
    }
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    if (error) {
      console.error('Sign out error:', error)
    }
  }

  async callSecureAPI(endpoint, options = {}) {
    const { data: { session } } = await this.supabase.auth.getSession()
    const token = session?.access_token

    if (!token) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(`/.netlify/functions/secure-api${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`)
    }

    return response.json()
  }

  updateUI() {
    // Update login/logout buttons
    const loginBtn = document.getElementById('loginBtn')
    const logoutBtn = document.getElementById('logoutBtn')
    const userInfo = document.getElementById('userInfo')

    if (this.user) {
      if (loginBtn) loginBtn.style.display = 'none'
      if (logoutBtn) logoutBtn.style.display = 'block'
      if (userInfo) {
        userInfo.style.display = 'block'
        userInfo.textContent = `Welcome, ${this.user.email}`
      }
    } else {
      if (loginBtn) loginBtn.style.display = 'block'
      if (logoutBtn) logoutBtn.style.display = 'none'
      if (userInfo) userInfo.style.display = 'none'
    }
  }

  // Enrollment helper
  async enrollInProgram(program) {
    if (!this.user) {
      alert('Please sign in to enroll')
      return
    }

    try {
      const result = await this.callSecureAPI('/enrollment', {
        method: 'POST',
        body: JSON.stringify({ program })
      })

      alert('Enrollment submitted successfully!')
      return result
    } catch (error) {
      console.error('Enrollment error:', error)
      alert('Enrollment failed: ' + error.message)
    }
  }
}

// Initialize auth when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.auth = new SupabaseAuth()

  // Bind event listeners
  const loginBtn = document.getElementById('loginBtn')
  const logoutBtn = document.getElementById('logoutBtn')

  if (loginBtn) {
    loginBtn.addEventListener('click', () => window.auth.signInWithGoogle())
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => window.auth.signOut())
  }

  // Bind enrollment buttons
  document.querySelectorAll('[data-enroll-program]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const program = e.target.getAttribute('data-enroll-program')
      window.auth.enrollInProgram(program)
    })
  })
})

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SupabaseAuth
}