🚀 Task Management System 2.0

A production-style RESTful Backend API built with Node.js, Express.js, Prisma ORM, and MySQL featuring JWT authentication, RBAC, organization management, project & ticket management, user assignment, MinIO file storage, and a complete ticket status workflow.

✨ Project Highlights

🔐 JWT Authentication & Authorization

🔒 Password Hashing using bcrypt

👤 User Management

🏢 Organization Management

👑 Roles & Permissions (RBAC)

📁 Project Management

🎫 Ticket Management

👤 Assign Tickets to Users

🖼️ Ticket Image Attachments

☁️ MinIO Object Storage

🔄 Complete Ticket Status Workflow

📚 Swagger API Documentation

🛠 Tech Stack

Technology

Usage

Node.js

Backend Runtime

Express.js

REST API Framework

Prisma ORM

Database ORM

MySQL

Database

JWT

Authentication

bcrypt

Password Hashing

Multer

File Upload Handling

MinIO

Object Storage

Swagger

API Documentation

Git & GitHub

Version Control

🏗 System Architecture

Client
   │
   ▼
Routes
   │
Middleware
   │
Controllers
   │
Services
   │
Repositories
   │
Prisma ORM
   │
MySQL Database

📂 Project Structure

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
│   └── utils/
│
├── .env
├── .gitignore
├── package.json
└── server.js

🔑 Authentication

JWT based authentication protects secured endpoints.

Signup

Password
   ↓
bcrypt.hash()
   ↓
Hashed Password
   ↓
MySQL

The original plain password is not stored in the database.

Login

Email + Password
       ↓
bcrypt.compare()
       ↓
Generate JWT
       ↓
Return Token

Protected requests use:

Authorization: Bearer YOUR_TOKEN

👑 Role Based Access Control

RBAC is implemented using roles and permissions.

User
 ↓
Role
 ↓
Permission
 ↓
Allow / 403 Forbidden

The permission middleware checks whether the logged-in user has the required permission.

🏢 Organization Management

Create Organization

Update Organization

Delete Organization

Assign User

Remove User

Transfer Organization Owner

📁 Project Management

Complete Project CRUD is implemented.

POST   /api/projects
GET    /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id

🎫 Ticket Management

Complete Ticket CRUD is implemented.

POST   /api/tickets
GET    /api/tickets
GET    /api/tickets/:id
PUT    /api/tickets/:id
DELETE /api/tickets/:id

Assign Ticket

PATCH /api/tickets/:id/assign

The system checks that both the ticket and user exist before assigning the ticket.

🔄 Ticket Status Workflow

Tickets cannot randomly move between statuses.

Current Status

Allowed Status

Ready to Do

In Progress, Blocked

In Progress

Ready to Do, Blocked, Testing

Blocked

In Progress

Testing

Done, In Progress

Done

In Progress

Invalid transitions are rejected by the ticket service.

Ready to Do → Testing   ❌
In Progress → Done      ❌
Blocked → Testing       ❌

🖼️ Ticket Image Attachments

Images are handled using Multer + MinIO.

Image
  ↓
Multer
  ↓
File Buffer
  ↓
MinIO
  ↓
File URL
  ↓
MySQL Attachment Metadata

MinIO stores the actual uploaded file, while MySQL stores the attachment metadata.

📖 API Documentation

Swagger / OpenAPI is included for API documentation and testing.

http://localhost:3000/api-docs

Main APIs

POST   /api/auth/signup
POST   /api/auth/login

POST   /api/projects
GET    /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id

POST   /api/tickets
GET    /api/tickets
GET    /api/tickets/:id
PUT    /api/tickets/:id
DELETE /api/tickets/:id

PATCH  /api/tickets/:id/assign

POST   /api/tickets/:ticketId/attachments
GET    /api/tickets/:ticketId/attachments

🚀 Installation

Clone Repository

git clone https://github.com/saadi-001/Task-Management-System-2.0.git
cd Task-Management-System-2.0

Install Dependencies

npm install

Generate Prisma Client

npx prisma generate

Configure .env

DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/DATABASE_NAME"
JWT_SECRET="your_secret"

MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY="your_access_key"
MINIO_SECRET_KEY="your_secret_key"
MINIO_BUCKET="task-management"

Start Server

npm run dev

⚠️ Never commit real passwords, API keys or secrets to GitHub.

🧪 Testing

Valid Workflow

Ready to Do → In Progress   ✅
Ready to Do → Blocked       ✅
Blocked → In Progress       ✅
In Progress → Testing       ✅
Testing → Done              ✅
Testing → In Progress       ✅
Done → In Progress          ✅

Invalid Workflow

Ready to Do → Testing       ❌
In Progress → Done          ❌
Blocked → Testing            ❌

👨‍💻 Author

Muhammad Saad

BS Software Engineering

⭐ If you found this project useful, consider giving it a star.