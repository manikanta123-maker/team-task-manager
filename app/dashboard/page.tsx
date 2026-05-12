"use client"

import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../providers'

export default function Dashboard() {
  const { user, token } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      fetch('/api/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(json => {
        setData(json)
        setLoading(false)
      })
    }
  }, [token])

  if (!user || loading) return <div className="app-container"><div style={{padding: '2rem'}}>Loading...</div></div>

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div className="flex justify-between items-center mb-6">
          <h1>Dashboard</h1>
          <div className="flex items-center gap-2">
            <span style={{color: 'var(--text-muted)'}}>Welcome back,</span>
            <strong style={{color: 'var(--primary)'}}>{user.name}</strong>
          </div>
        </div>

        <div className="grid grid-cols-dashboard mb-6">
          <div className="card card-hoverable">
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Tasks</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-main)' }}>{data.stats.total}</div>
          </div>
          <div className="card card-hoverable" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: 'var(--success)' }}></div>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-main)' }}>{data.stats.done}</div>
          </div>
          <div className="card card-hoverable" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: 'var(--danger)' }}></div>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overdue</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--danger)' }}>{data.stats.overdue}</div>
          </div>
        </div>

        <h2 className="mt-6 mb-4">Recent Tasks</h2>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {data.recentTasks.length === 0 ? (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📭</div>
              No recent tasks found.
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Assignee</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentTasks.map((task: any) => (
                    <tr key={task.id}>
                      <td style={{ fontWeight: 500 }}>{task.title}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{task.project?.name}</td>
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
      </main>
    </div>
  )
}
