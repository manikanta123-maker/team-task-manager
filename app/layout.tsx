import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from './providers'

export const metadata: Metadata = {
  title: 'Team Task Manager',
  description: 'Manage your team projects and tasks efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
