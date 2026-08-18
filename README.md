🎯 Task Management System 2.0

A backend Task Management System built with Node.js, Express.js, Prisma and MySQL — with JWT authentication, RBAC, project & ticket management, user assignment, MinIO file storage, and a complete ticket status workflow.

🟦 Project Overview

Task Management System 2.0 is a backend application designed to manage:

👤 Users & authentication

🏢 Organizations & members

📁 Projects

🎫 Tickets / Tasks

👥 Ticket assignment

🖼️ Ticket image attachments

🔐 Roles & permissions (RBAC)

🔄 Controlled ticket status workflow

The project follows a clean layered architecture so that routes, controllers, business logic and database queries stay separated.

🟩 Key Features

Feature

Status

🔐 Signup / Login

✅

🔑 JWT Authentication

✅

🔒 Password Hashing with bcrypt

✅

👑 Role Based Access Control (RBAC)

✅

🏢 Organization Management

✅

📁 Project Create / Read / Update / Delete

✅

🎫 Ticket Create / Read / Update / Delete

✅

👤 Assign Ticket to User

✅

🖼️ Attach Images to Ticket

✅

☁️ MinIO Object Storage

✅

🔄 Ticket Status Workflow

✅

📚 Swagger / OpenAPI

✅

🟪 Architecture

Client
  ↓
Routes
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Prisma
  ↓
MySQL

📌 File Upload Flow

Client
  ↓
Multer
  ↓
Attachment Service
  ↓
MinIO
  ↓
File URL
  ↓
MySQL Attachment Metadata

🟨 Authentication

🔐 Signup

User Password
     ↓
bcrypt.hash()
     ↓
Hashed Password
     ↓
MySQL

The original plain password is not stored in the database.

🔑 Login

Email + Password
       ↓
Find User
       ↓
bcrypt.compare()
       ↓
Generate JWT
       ↓
Return Token

🛡️ Protected Request

Authorization: Bearer <JWT>
             ↓
      authMiddleware
             ↓
       Verify Token
             ↓
          req.user

🟥 RBAC

The project uses Role Based Access Control (RBAC).

User
 ↓
UserRole
 ↓
Role
 ↓
RolePermission
 ↓
Permission
 ↓
Allow / 403 Forbidden

The permissionMiddleware checks whether the logged-in user's role has the required permission.

🔄 Ticket Status Workflow

Tickets cannot randomly jump between statuses.

Available Statuses

Ready to Do • In Progress • Blocked • Testing • Done

✅ Allowed Transitions

Ready to Do
 ├──→ In Progress
 └──→ Blocked ──→ In Progress

In Progress
 ├──→ Ready to Do
 ├──→ Blocked
 └──→ Testing

Testing
 ├──→ Done
 └──→ In Progress

Done
 └──→ In Progress

🚫 Examples of Blocked Transitions

Ready to Do → Testing   ❌
In Progress → Done      ❌
Blocked → Testing       ❌

The workflow is handled in the ticket service layer, so invalid transitions are rejected before the database update.

🖼️ Ticket Attachments

Images are handled using Multer + MinIO.

Image Upload
    ↓
Multer memoryStorage
    ↓
File Buffer
    ↓
MinIO Bucket
    ↓
FileUrl
    ↓
MySQL attachment table

Storage Responsibility

Storage

Responsibility

☁️ MinIO

Stores the actual uploaded file

🗄️ MySQL

Stores FileName, FileUrl, TaskID and attachment metadata

📁 Project Structure

Task Management System 2.0/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   ├── config/
│   │   ├── prisma.js
│   │   ├── swagger.js
│   │   └── minio.js
│   │
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

🧩 Main Modules

👤 Authentication

Signup

Login

bcrypt password hashing

JWT token generation

JWT authentication middleware

🏢 Organizations

Organization CRUD

Assign users

Remove users

Transfer owner

📁 Projects

Create project

Get projects

Get project by ID

Update project

Delete project

🎫 Tickets

Create ticket

Get tickets

Get ticket by ID

Update ticket

Delete ticket

Assign ticket to user

Status workflow

🔐 Roles & Permissions

Create/list permissions

Role management

Assign permissions to roles

Assign roles to users

Permission-based route protection

🖼️ Attachments

Upload image

Store image in MinIO

Store attachment metadata in MySQL

Retrieve ticket attachments

🛠️ Tech Stack

Technology

Purpose

🟢 Node.js

Backend runtime

⚡ Express.js

REST API framework

🔷 JavaScript

Backend development

🔺 Prisma

ORM / database access

🐬 MySQL

Relational database

🔐 JWT

Authentication

🔒 bcrypt

Password hashing

📦 Multer

File upload handling

☁️ MinIO

Object/file storage

📚 Swagger

API documentation

🧪 Thunder Client

API testing

🌿 Git & GitHub

Version control

🚀 Getting Started

1️⃣ Clone the Repository

git clone https://github.com/saadi-001/Task-Management-System-2.0.git
cd Task-Management-System-2.0

2️⃣ Install Dependencies

npm install

3️⃣ Configure .env

Example:

DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/DATABASE_NAME"

JWT_SECRET="your_secret"

MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY="your_access_key"
MINIO_SECRET_KEY="your_secret_key"
MINIO_BUCKET="task-management"

⚠️ Never commit real passwords, API keys or secrets to GitHub.

4️⃣ Generate Prisma Client

npx prisma generate

5️⃣ Start the Backend

npm run dev

🗄️ Database

The project uses MySQL with Prisma.

Main Models

user
organization
organizationmembers
project
projectmembers
task
comment
attachment
activityhistory
permission
role
rolepermission
userrole

📚 API Overview

🔐 Auth

POST /api/auth/signup
POST /api/auth/login

🏢 Organizations

/api/organizations

📁 Projects

POST   /api/projects
GET    /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id

🎫 Tickets

POST   /api/tickets
GET    /api/tickets
GET    /api/tickets/:id
PUT    /api/tickets/:id
DELETE /api/tickets/:id

👤 Ticket Assignment

PATCH /api/tickets/:id/assign

🖼️ Ticket Attachments

POST /api/tickets/:ticketId/attachments
GET  /api/tickets/:ticketId/attachments

📖 Swagger

Swagger/OpenAPI is included in the project for API documentation and testing.

Start the server and open the configured Swagger endpoint from swagger.js.

🧪 Workflow Testing

The ticket workflow has been tested for both valid and invalid transitions.

✅ Valid Transitions

Ready to Do → In Progress
Ready to Do → Blocked
In Progress → Ready to Do
In Progress → Blocked
In Progress → Testing
Blocked → In Progress
Testing → Done
Testing → In Progress
Done → In Progress

❌ Correctly Rejected

Ready to Do → Testing
In Progress → Done
Blocked → Testing

🧠 Quick Revision

AUTH
Signup → bcrypt → MySQL
Login → bcrypt.compare → JWT
JWT → authMiddleware → req.user

RBAC
User → Role → Permission → Allow / 403

PROJECT
Route → Controller → Service → Repository → Prisma → MySQL

TICKET
CRUD → Assignment → Status Workflow

ATTACHMENT
Multer → Buffer → MinIO → FileUrl → MySQL

GIT
git status → git add → git commit → git push

👨‍💻 Project

Task Management System 2.0

Built as a backend project with a focus on:

Clean Architecture • Separation of Concerns • Authentication • Authorization • File Storage • Business Rules

🔗 Repository

GitHub Repository