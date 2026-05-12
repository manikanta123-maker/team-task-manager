# TaskFlow: Team Task Manager

TaskFlow is a full-stack Next.js application for team task management.  
It features secure authentication, role-based access control (RBAC), project management, and task tracking.

---

## Features

### Authentication
- Secure Signup and Login using JWT authentication
- Password hashing using bcryptjs

### Role-Based Access Control (RBAC)
#### Admin
- Create projects
- Add/remove project members
- Manage all tasks

#### Member
- View assigned projects
- Manage tasks within assigned projects

### Project Management
- Create and manage projects
- Assign team members to projects

### Task Management
- Create tasks
- Assign tasks to members
- Track task status:
  - To Do
  - In Progress
  - Done
- Due date and overdue tracking

### Dashboard
- Task statistics overview
- Recent tasks section

---

## Technology Stack

- **Frontend & Backend:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Production), SQLite (Local Development)
- **ORM:** Prisma
- **Authentication:** JWT using jose
- **Password Hashing:** bcryptjs
- **Styling:** CSS

---

# Local Development Setup

## 1. Clone the Repository

```bash
git clone <your-repo-url>
cd team-task-manager