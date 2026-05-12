"use client"

import { useEffect, useState, use } from 'react'
import Sidebar from '../../components/Sidebar'
import { useAuth } from '../../providers'

export default function ProjectDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, token } = useAuth()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Add Member form
  const [email, setEmail] = useState('')

  const fetchProject = () => {
    if (!token) return
    fetch(`/api/projects/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(json => {
      setProject(json)
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchProject()
  }, [token, id])

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    const res = await fetch(`/api/projects/${id}/members`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    })

    if (res.ok) {
      setEmail('')
      fetchProject()
    } else {
      const data = await res.json()
      alert(data.error)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!token || !confirm('Are you sure you want to remove this member?')) return
    const res = await fetch(`/api/projects/${id}/members?userId=${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (res.ok) {
      fetchProject()
    } else {
      const data = await res.json()
      alert(data.error)
    }
  }

  if (!user || loading) return <div className="app-container"><div style={{padding: '2rem'}}>Loading...</div></div>
  if (project.error) return <div className="app-container"><div style={{padding: '2rem', color: 'var(--danger)'}}>{project.error}</div></div>

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{project.name}</h1>
          <p style={{ fontSize: '1.1rem' }}>{project.description}</p>
        </div>

        <div className="grid-details">
          <div>
            <h2>Tasks</h2>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {project.tasks.length === 0 ? (
                <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5 }}>📝</div>
                  No tasks yet.
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Assignee</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.tasks.map((task: any) => (
                        <tr key={task.id}>
                          <td style={{ fontWeight: 500 }}>{task.title}</td>
                          <td>
                            <span className={`badge badge-${task.status.toLowerCase()}`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                                {task.assignee?.name?.charAt(0) || '?'}
                              </div>
                              <span>{task.assignee?.name || 'Unassigned'}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2>Team Members</h2>
            <div className="card mb-6">
              <div className="flex flex-col gap-4">
                {project.members.map((member: any) => (
                  <div key={member.userId} className="flex justify-between items-center p-3" style={{ backgroundColor: 'var(--surface-hover)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-3">
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: 'white' }}>
                        {member.user.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{member.user.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{member.user.email}</div>
                      </div>
                    </div>
                    {user.role === 'ADMIN' && (
                      <button 
                        onClick={() => handleRemoveMember(member.userId)} 
                        className="btn btn-danger"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {user.role === 'ADMIN' && (
              <div className="card">
                <h3>Add Member</h3>
                <form onSubmit={handleAddMember} className="mt-4">
                  <div className="form-group">
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="User Email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block">Add to Project</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
