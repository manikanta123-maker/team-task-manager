"use client"

import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../providers'

export default function Tasks() {
  const { user, token } = useAuth()
  const [tasks, setTasks] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  
  // New Task Form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState('TODO')

  const fetchData = async () => {
    if (!token) return
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        fetch('/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/projects', { headers: { 'Authorization': `Bearer ${token}` } })
      ])
      
      const tasksData = await tasksRes.json()
      const projectsData = await projectsRes.json()
      
      setTasks(tasksData)
      setProjects(projectsData)
      if (projectsData.length > 0) setProjectId(projectsData[0].id)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [token])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, description, projectId, assigneeId, dueDate, status })
    })

    if (res.ok) {
      setShowModal(false)
      setTitle('')
      setDescription('')
      setDueDate('')
      fetchData()
    } else {
      const data = await res.json()
      alert(data.error)
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    if (!token) return
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    })

    if (res.ok) {
      fetchData()
    }
  }

  if (!user || loading) return <div className="app-container"><div style={{padding: '2rem'}}>Loading...</div></div>

  const renderColumn = (statusLabel: string, statusValue: string) => {
    const columnTasks = tasks.filter(t => t.status === statusValue)
    return (
      <div className="card" style={{ backgroundColor: 'var(--surface-hover)', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.02)' }}>
        <div className="flex justify-between items-center mb-5">
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>{statusLabel}</h3>
          <span className="badge" style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: 'var(--text-muted)' }}>{columnTasks.length}</span>
        </div>
        <div className="flex flex-col gap-4">
          {columnTasks.map(task => (
            <div key={task.id} className="card card-hoverable" style={{ padding: '1.25rem', cursor: 'grab', backgroundColor: 'var(--surface)' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '1.05rem' }}>{task.title}</div>
              {task.project && (
                <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.75rem', fontWeight: 500 }}>
                  {task.project.name}
                </div>
              )}
              {task.dueDate && (
                <div className="flex items-center gap-1" style={{ fontSize: '0.8rem', color: new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'var(--danger)' : 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 500 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
              )}
              <select 
                className="form-select mt-3" 
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', backgroundColor: 'rgba(0,0,0,0.2)' }}
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          ))}
          {columnTasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--border)', border: '2px dashed var(--border)', borderRadius: 'var(--radius)' }}>
              Drop tasks here
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div className="flex justify-between items-center mb-8">
          <h1>My Tasks Board</h1>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New Task
          </button>
        </div>

        <div className="grid-kanban">
          {renderColumn('To Do', 'TODO')}
          {renderColumn('In Progress', 'IN_PROGRESS')}
          {renderColumn('Done', 'DONE')}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2>Create New Task</h2>
              <form onSubmit={handleCreate}>
                <div className="form-group mt-4">
                  <label className="form-label">Task Title</label>
                  <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Project</label>
                  <select className="form-select" value={projectId} onChange={e => setProjectId(e.target.value)} required>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input type="date" className="form-input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Assignee</label>
                  <select className="form-select" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                    <option value="">Unassigned</option>
                    {/* Simplified for demo: Assign to self or project members would go here */}
                    <option value={user.id}>Assign to me</option>
                  </select>
                </div>
                <div className="flex justify-between mt-6">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={projects.length === 0}>Create Task</button>
                </div>
                {projects.length === 0 && (
                  <div className="mt-2 text-center" style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>
                    You must create a project before creating a task.
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
