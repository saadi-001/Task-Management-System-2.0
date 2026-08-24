<div align="center">

# 🚀 Task Management System 2.0

### Production-Style Task & Project Management REST API

**Secure • Modular • Scalable • Dockerized**

[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-REST_API-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![MinIO](https://img.shields.io/badge/MinIO-Object_Storage-C72E49?style=for-the-badge&logo=minio&logoColor=white)](https://min.io/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

</div>

---

## 📌 Overview

Task Management System 2.0 is a backend REST API designed for managing users, organizations, projects, tickets, assignments, roles, permissions, comments, activity history, and file attachments.

The project follows a **layered architecture** with clear separation between routes, middleware, controllers, services, repositories, and database access.

The complete backend can be run using **Docker Compose**, with MySQL used for persistent data and MinIO used for object/file storage.

---

## ✨ Key Features

### 🔐 Authentication & Security

- JWT-based authentication
- User signup and login
- Password hashing with bcrypt
- Protected API endpoints
- Authentication middleware

### 🛡️ Role-Based Access Control

- Roles management
- Permissions management
- Role-permission assignment
- User-role management
- Permission-based authorization

### 🏢 Organization Management

- Create organizations
- Update organizations
- Delete organizations
- Organization owner management
- Organization member management

### 📁 Project Management

- Create projects
- Get all projects
- Get project by ID
- Update projects
- Delete projects
- Organization-based project management

### 🎫 Ticket Management

- Create tickets
- Get all tickets
- Get ticket by ID
- Update tickets
- Delete tickets
- Assign tickets to users
- Ticket status workflow
- Priority management

### 📎 File Attachments

- Ticket image attachments
- Base64 image upload
- Base64 → Buffer conversion
- MinIO object storage
- Attachment metadata stored in MySQL
- Retrieve ticket attachments

### 📚 API Documentation

- Swagger / OpenAPI documentation
- Interactive API testing
- Protected endpoint documentation

---

## 🏗️ Architecture

The project follows a layered backend architecture:

```text
Client
  │
  ▼
Routes
  │
  ▼
Middleware
  │
  ▼
Controllers
  │
  ▼
Services
  │
  ▼
Repositories
  │
  ▼
Prisma ORM
  │
  ▼
MySQL