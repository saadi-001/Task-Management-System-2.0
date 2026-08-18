<div align="center">

# 🚀 Task Management System 2.0

### ⚡ Production-Style Task & Project Management REST API

**Secure • Scalable • Modular • Enterprise-Oriented**

<br>

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?style=for-the-badge\&logo=node.js\&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-REST_API-000000?style=for-the-badge\&logo=express\&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge\&logo=prisma\&logoColor=white)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge\&logo=mysql\&logoColor=white)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-Security-000000?style=for-the-badge\&logo=jsonwebtokens\&logoColor=white)](https://jwt.io/)
[![MinIO](https://img.shields.io/badge/MinIO-Storage-C72E49?style=for-the-badge\&logo=minio\&logoColor=white)](https://min.io/)

<br>

A backend system designed to manage **organizations, users, projects, tickets, roles, permissions, assignments, and file attachments** through a clean and maintainable REST API.

</div>

---

## 🎯 What This Project Offers

<table>
<tr>
<td width="50%">

### 🔐 Authentication

* JWT Authentication
* Secure bcrypt password hashing
* Protected API endpoints

</td>
<td width="50%">

### 👑 RBAC

* Roles & Permissions
* Permission-based middleware
* Access control

</td>
</tr>

<tr>
<td>

### 🏢 Organizations

* Organization CRUD
* User assignment
* Owner management

</td>
<td>

### 📁 Projects

* Complete CRUD
* Organization-based management
* Secure project access

</td>
</tr>

<tr>
<td>

### 🎫 Tickets

* Complete CRUD
* User assignment
* Status workflow

</td>
<td>

### 🖼️ Attachments

* Multer file handling
* MinIO object storage
* Attachment metadata

</td>
</tr>
</table>

---

## 🧠 Architecture

The backend follows a **layered architecture** with clear separation of responsibilities.

```text
                    ┌──────────────┐
                    │    Client    │
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │    Routes    │
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │  Middleware  │
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │ Controllers  │
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │   Services   │
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │ Repositories │
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │ Prisma / ORM │
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │    MySQL     │
                    └──────────────┘
```

---

## 🛠️ Technology Stack

| Layer           | Technology            |
| --------------- | --------------------- |
| Runtime         | **Node.js**           |
| Framework       | **Express.js**        |
| ORM             | **Prisma**            |
| Database        | **MySQL**             |
| Authentication  | **JWT**               |
| Security        | **bcrypt**            |
| File Upload     | **Multer**            |
| Object Storage  | **MinIO**             |
| Documentation   | **Swagger / OpenAPI** |
| Version Control | **Git / GitHub**      |

---

## 🎫 Ticket Workflow

Business rules are enforced inside the **Service Layer**, preventing invalid ticket transitions.

```text
┌──────────────┐
│ Ready to Do  │
└──────┬───────┘
       ↓
┌──────────────┐
│ In Progress  │
└──────┬───────┘
       ↓
┌──────────────┐
│   Testing    │
└──────┬───────┘
       ↓
┌──────────────┐
│     Done     │
└──────────────┘
```

### 🔄 Supported Flow

`Ready to Do → In Progress → Testing → Done`

`Ready to Do → Blocked → In Progress`

`Testing → In Progress`

`Done → In Progress`

❌ Invalid transitions are automatically rejected.

---

## 🖼️ File Storage Architecture

```text
             Image Upload
                  │
                  ▼
              ┌───────┐
              │Multer │
              └───┬───┘
                  ↓
              ┌───────┐
              │ MinIO │
              └───┬───┘
                  │
                  ↓
            File / Object URL
                  │
                  ▼
              ┌───────┐
              │ MySQL │
              └───────┘
          Attachment Metadata
```

> 📦 **MinIO** stores the actual files, while **MySQL** stores their metadata.

---

## 📂 Project Structure

```text
Task-Management-System-2.0/
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── app.js
│
├── .env
├── package.json
├── prisma.config.ts
└── server.js
```

---

## 📚 API Overview

### 🔐 Authentication

```http
POST /api/auth/signup
POST /api/auth/login
```

### 📁 Projects

```http
POST   /api/projects
GET    /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
```

### 🎫 Tickets

```http
POST   /api/tickets
GET    /api/tickets
GET    /api/tickets/:id
PUT    /api/tickets/:id
DELETE /api/tickets/:id
PATCH  /api/tickets/:id/assign
```

### 🖼️ Attachments

```http
POST /api/tickets/:ticketId/attachments
GET  /api/tickets/:ticketId/attachments
```

---

## 📖 Swagger Documentation

Explore and test the API interactively:

### 👉 `http://localhost:3000/api-docs`

---

## ⚡ Quick Start

```bash
# Clone
git clone https://github.com/saadi-001/Task-Management-System-2.0.git

# Enter project
cd Task-Management-System-2.0

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### 🔑 Environment Variables

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/DATABASE_NAME"
JWT_SECRET="your_secret"

MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY="your_access_key"
MINIO_SECRET_KEY="your_secret_key"
MINIO_BUCKET="task-management"
```

> ⚠️ Never commit real credentials or secrets to GitHub.

---

## 🧩 Engineering Principles

```text
✓ Separation of Concerns
✓ Layered Architecture
✓ Repository Pattern
✓ Service-Based Business Logic
✓ Middleware-Based Authorization
✓ Secure Authentication
✓ Environment-Based Configuration
✓ Prisma Database Migrations
```

---

<div align="center">

## 👨‍💻 Developed By

### **Muhammad Saad**

**BS Software Engineering**

<br>

⭐ **If you like this project, consider giving it a star!**

<br>

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge\&logo=github\&logoColor=white)](https://github.com/saadi-001/Task-Management-System-2.0)

</div>
