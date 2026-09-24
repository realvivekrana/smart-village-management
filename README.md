# Smart Village Management

A full-stack MERN application designed to digitally connect citizens, local businesses, village services, community activities, jobs, complaints, emergency information, events, notices, and village administration in one centralized platform.

## 🚀 Project Overview

Smart Village Management is a professional digital platform built to modernize village-level services and improve communication between citizens, businesses, service providers, and administrators.

The system provides separate functionality for citizens, business owners, and administrators with secure authentication and role-based access control.

## ✨ Key Features

### 👤 Authentication & Users
- User registration and login
- JWT-based authentication
- Protected routes
- Role-based authorization
- Citizen and business-owner accounts
- User profile management
- Account activation/deactivation
- Last-login tracking

### 🏘️ Village Management
- Village information
- Village places
- Local services
- Important village information
- Public village content

### 📢 Notices & Announcements
- Village notices
- Important announcements
- Public notice listing
- Notice management for authorized users

### 📝 Complaints
- Citizen complaint submission
- Complaint tracking
- Complaint status management
- Complaint administration

### 🚨 Emergency Services
- Emergency contacts
- Important emergency information
- Quick access to emergency resources

### 🏪 Local Businesses
- Business listings
- Business profiles
- Business management
- Customer reviews

### ⭐ Reviews & Comments
- Service reviews
- Business reviews
- Community comments
- Rating functionality

### 👥 Community
- Community posts
- Community interaction
- Comments
- Local discussions

### 💼 Jobs
- Local job listings
- Job details
- Job applications
- Application management

### 📅 Events
- Village events
- Event details
- Event management
- Community participation

### 🔔 Notifications
- User notifications
- System notifications
- Notification management

### 📊 Dashboard
- User dashboard
- Administrative dashboard
- Application statistics
- Complaint statistics
- Service statistics

## 🛠️ Technology Stack

### Frontend

- React.js
- JavaScript
- Vite
- React Router
- Axios
- CSS
- Responsive UI

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Helmet
- CORS
- Morgan
- Express Rate Limit
- Express Validator
- Multer
- Cloudinary
- Nodemailer

### Development Tools

- Git
- GitHub
- Postman
- VS Code
- Nodemon

## 🏗️ Project Structure

```text
Smart Village Management
│
├── Backend
│   │
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── utils
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
│
├── Frontend
│   │
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── routes
│   │   ├── services
│   │   ├── utils
│   │   └── ...
│   │
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md