"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../providers'

export default function Projects() {
  const { user, token } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  
  // New Project Form
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const fetchProjects = () => {
    if (!token) return
    fetch('/api/projects', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(json => {
      setProjects(json)
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchProjects()
  }, [token])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, description })
    })

    if (res.ok) {
      setShowModal(false)
      setName('')
      setDescription('')
      fetchProjects()
    } else {
      const data = await res.json()
      alert(data.error)
    }
  }

  if (!user || loading) return <div className="app-container"><div style={{padding: '2rem'}}>Loading...</div></div>

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div className="flex justify-between items-center mb-6">
          <h1>Projects</h1>
          {user.role === 'ADMIN' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + New Project
            </button>
          )}
        </div>

        <div className="grid grid-cols-3">
          {projects.map(project => (
            <Link href={`/projects/${project.id}`} key={project.id} style={{ textDecoration: 'none' }}>
              <div className="card card-hoverable h-full flex flex-col justify-between" style={{ minHeight: '180px' }}>
                <div>
                  <h3 style={{ color: 'var(--primary)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>{project.name}</h3>
                  <p style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {project.description || 'No description provided.'}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="badge" style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-muted)', border: 'none' }}>
                    👥 {project.members?.length || 0} Members
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                    View Details &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {projects.length === 0 && (
            <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>No projects found. Create one to get started.</div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2>Create New Project</h2>
              <form onSubmit={handleCreate}>
                <div className="form-group mt-4">
                  <label className="form-label">Project Name</label>
                  <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
                </div>
                <div className="flex justify-between mt-6">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Project</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
