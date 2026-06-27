import { useEffect, useMemo, useState } from 'react'
import './App.css'

const categories = ['All', 'Personal', 'Work', 'Ideas', 'Study']

function InteractiveLogo() {
  return (
    <div className="logo-mark" aria-label="i-Notes logo">
      <div className="logo-ring" />
      <div className="logo-core">
        <span>i</span>
      </div>
      <div className="logo-spark" />
    </div>
  )
}

function App() {
  const [authMode, setAuthMode] = useState('register')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [draft, setDraft] = useState({ title: '', content: '', category: 'Personal' })
  const [notes, setNotes] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('iNotesUsers') || '[]')
    const savedNotes = JSON.parse(localStorage.getItem('iNotesNotes') || '[]')

    if (savedUsers.length > 0) {
      setMessage('Welcome back to i-Notes.')
    }

    setNotes(savedNotes)
    setIsReady(true)
  }, [])

  useEffect(() => {
    if (!isReady) return
    localStorage.setItem('iNotesNotes', JSON.stringify(notes))
  }, [notes, isReady])

  const userNotes = useMemo(() => {
    if (!currentUser) return []
    return notes.filter((note) => note.userEmail === currentUser.email)
  }, [currentUser, notes])

  const visibleNotes = useMemo(() => {
    if (activeCategory === 'All') return userNotes
    return userNotes.filter((note) => note.category === activeCategory)
  }, [activeCategory, userNotes])

  const stats = useMemo(() => {
    const personal = userNotes.filter((note) => note.category === 'Personal').length
    return {
      total: userNotes.length,
      personal,
    }
  }, [userNotes])

  const handleAuth = (event) => {
    event.preventDefault()
    const storedUsers = JSON.parse(localStorage.getItem('iNotesUsers') || '[]')

    if (authMode === 'register') {
      if (!form.name || !form.email || !form.password) {
        setMessage('Please fill in every field to create an account.')
        return
      }

      if (form.password !== form.confirmPassword) {
        setMessage('Passwords do not match. Please try again.')
        return
      }

      const existingUser = storedUsers.find((user) => user.email === form.email)
      if (existingUser) {
        setMessage('That email already exists. Try logging in instead.')
        return
      }

      const newUser = {
        id: `${Date.now()}`,
        name: form.name,
        email: form.email,
        password: form.password,
      }

      storedUsers.push(newUser)
      localStorage.setItem('iNotesUsers', JSON.stringify(storedUsers))
      setMessage('Account created successfully. You can sign in now.')
      setForm({ name: '', email: '', password: '', confirmPassword: '' })
      setAuthMode('login')
      return
    }

    const existingUser = storedUsers.find(
      (user) => user.email === form.email && user.password === form.password,
    )

    if (!existingUser) {
      setMessage('We could not find that account. Please register first.')
      return
    }

    setCurrentUser(existingUser)
    setIsLoggedIn(true)
    setMessage(`Welcome back, ${existingUser.name}!`)
  }

  const handleCreateNote = (event) => {
    event.preventDefault()
    if (!draft.title.trim() || !draft.content.trim()) {
      setMessage('Add a title and a note before saving.')
      return
    }

    const newNote = {
      id: `${Date.now()}`,
      userEmail: currentUser.email,
      title: draft.title.trim(),
      content: draft.content.trim(),
      category: draft.category,
      createdAt: new Date().toLocaleString(),
    }

    setNotes((prev) => [newNote, ...prev])
    setDraft({ title: '', content: '', category: 'Personal' })
    setMessage('Note saved to your collection.')
  }

  const handleDeleteNote = (noteId) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId))
    setMessage('Note removed.')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
    setMessage('You have been logged out.')
  }

  if (!isLoggedIn) {
    return (
      <div className="app-shell auth-page">
        <section className="hero-panel">
          <InteractiveLogo />
          <h1>i-Notes keeps your ideas calm and close.</h1>
          <p className="hero-copy">
            Capture personal thoughts, work tasks, and creative sparks in one beautifully simple space.
          </p>
          <ul className="feature-list">
            <li>Secure sign-in and account creation</li>
            <li>Save notes instantly in your own space</li>
            <li>Organize everything by personal and work categories</li>
          </ul>
        </section>

        <section className="form-panel">
          <div className="auth-switch">
            <button
              type="button"
              className={authMode === 'login' ? 'active' : ''}
              onClick={() => setAuthMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={authMode === 'register' ? 'active' : ''}
              onClick={() => setAuthMode('register')}
            >
              Register
            </button>
          </div>

          <form className="auth-form" onSubmit={handleAuth}>
            <h2>{authMode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            {authMode === 'register' && (
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            )}
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
            {authMode === 'register' && (
              <input
                type="password"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
              />
            )}
            <button type="submit" className="primary-btn">
              {authMode === 'login' ? 'Log in' : 'Register'}
            </button>
          </form>

          {message && <p className="message-box">{message}</p>}
        </section>
      </div>
    )
  }

  return (
    <div className="app-shell dashboard-page">
      <header className="topbar">
        <div className="brand-row">
          <InteractiveLogo />
          <div>
            <p className="eyebrow">Personal note dashboard</p>
            <h1>i-Notes</h1>
          </div>
        </div>
        <div className="topbar-actions">
          <div className="user-pill">{currentUser?.name}</div>
          <button type="button" className="ghost-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="dashboard-grid">
        <aside className="summary-card">
          <h2>Your space</h2>
          <p>Everything you save is kept right here for quick access.</p>
          <div className="stats-row">
            <div>
              <strong>{stats.total}</strong>
              <span>Notes</span>
            </div>
            <div>
              <strong>{stats.personal}</strong>
              <span>Personal</span>
            </div>
          </div>
          <div className="category-list">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={activeCategory === category ? 'chip active' : 'chip'}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </aside>

        <main className="notes-panel">
          <form className="composer" onSubmit={handleCreateNote}>
            <h2>Create a new note</h2>
            <input
              type="text"
              placeholder="Title"
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
            <textarea
              placeholder="Write your note here..."
              rows="4"
              value={draft.content}
              onChange={(event) => setDraft({ ...draft, content: event.target.value })}
            />
            <div className="composer-footer">
              <select
                value={draft.category}
                onChange={(event) => setDraft({ ...draft, category: event.target.value })}
              >
                <option value="Personal">Personal</option>
                <option value="Work">Work</option>
                <option value="Ideas">Ideas</option>
                <option value="Study">Study</option>
              </select>
              <button type="submit" className="primary-btn">
                Save note
              </button>
            </div>
          </form>

          {message && <p className="message-box">{message}</p>}

          <section className="notes-list">
            {visibleNotes.length === 0 ? (
              <div className="empty-state">
                <h3>No notes yet</h3>
                <p>Start with a personal note or a quick idea and it will appear here.</p>
              </div>
            ) : (
              visibleNotes.map((note) => (
                <article className="note-card" key={note.id}>
                  <div className="note-head">
                    <span className="note-category">{note.category}</span>
                    <button type="button" className="delete-btn" onClick={() => handleDeleteNote(note.id)}>
                      Remove
                    </button>
                  </div>
                  <h3>{note.title}</h3>
                  <p>{note.content}</p>
                  <small>{note.createdAt}</small>
                </article>
              ))
            )}
          </section>
        </main>
      </section>
    </div>
  )
}

export default App
