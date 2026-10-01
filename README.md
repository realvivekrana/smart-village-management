# 🏡 Kakarcholi Village Management System

> A modern full-stack MERN platform for digitally connecting villagers, local businesses, village services, community activities, jobs, emergency resources, complaints, notices, and village administration in one centralized portal.

<p align="center">
  <strong>Digital • Accessible • Community-Centric • Secure</strong>
</p>

---

## 🌐 Live Application

**Frontend:** https://smart-village-management.vercel.app/

**Repository:** https://github.com/realvivekrana/smart-village-management

---

## 📌 Overview

**Kakarcholi Village Management System** is a full-stack web application designed to provide a centralized digital platform for village residents and administrators.

The platform brings commonly needed village information and services together in one place, including government and emergency contacts, village services, notices, events, jobs, local businesses, community discussions, complaints, village information, and a local marketplace.

The application follows a role-based architecture so that public visitors, registered citizens, business owners, and administrators can access the functionality relevant to them.

---

## ✨ Core Features

### 🏘️ Village Information

- Village overview and information
- Village places and important locations
- Village gallery
- Government and important contacts
- Village statistics and information
- Public contact information

### 📝 Citizen Services

- Citizen registration and login
- Personal profile management
- Village service discovery
- Service application workflow
- Household information management
- Complaint creation and tracking
- Application status tracking
- Notifications

### 📢 Notices & Announcements

- Public village notices
- Notice categories
- Notice details pages
- Admin notice management
- Important announcements for residents

### 📅 Events

- Village events listing
- Event categories
- Event details
- Admin event management
- Public access to upcoming events

### 💼 Jobs & Employment

- Local job listings
- Job categories
- Job type classification
- Job details
- Citizen job applications
- Business-owner job management
- Application management

### 🏪 Local Business Directory

- Local business listings
- Business categories
- Business details
- Business-owner dashboard
- Add and edit business profiles
- Customer reviews and ratings

### 🛍️ Gaon Bazaar

- Local buy/sell listings
- Community marketplace
- Listing categories
- Listing details
- Citizen listing management
- Lost & found related community listings

### 👥 Community

- Community posts
- Local discussions
- Questions and announcements
- Buy/sell posts
- Help requests
- Lost & found posts
- Comments and interactions

### 🚨 Emergency & SOS

- Emergency contacts
- Police information
- Fire services
- Ambulance and hospital information
- Electricity and water contacts
- Panchayat contacts
- Disaster-related contacts
- SOS alert functionality

### 🛠️ Village Services

The platform supports service categories such as:

- Certificates
- Licenses
- Utilities
- Health
- Education
- Social welfare
- Agriculture
- Land records
- Infrastructure
- Other village services

### 📊 Admin Dashboard

Administrators can manage major platform resources through dedicated dashboard sections:

- Users
- Complaints
- Businesses
- Events
- Jobs
- Notices
- Services
- Emergency contacts
- Community posts
- Government contacts
- Households
- Village directory
- Village features
- Village settings
- Applications/submissions
- Reports

---

## 🔐 Authentication & Authorization

The application implements secure authentication and role-based access control.

### Authentication

- JWT-based authentication
- Protected routes
- Login and registration
- Forgot password flow
- Reset password flow
- Password hashing with `bcryptjs`
- Token-based API authorization
- Authentication state management on the frontend

### Roles

| Role | Access |
|---|---|
| **Public Visitor** | Public village information, notices, events, jobs, businesses, services, emergency information and community content |
| **Citizen** | Citizen dashboard, complaints, applications, household information, community posts, marketplace and other authenticated features |
| **Business Owner** | Business profile, business listings, jobs and job applications management |
| **Admin** | Platform administration, users, village data, content, complaints, services, reports and settings |

---

## 🧱 Technology Stack

### Frontend

- **React.js 18**
- **JavaScript (ES6+)**
- **Vite**
- **React Router DOM**
- **Axios**
- **Tailwind CSS**
- **Lucide React**
- **React Hot Toast**
- **date-fns**

### Backend

- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose**
- **JWT / JSON Web Token**
- **bcryptjs**
- **Express Validator**
- **Helmet**
- **CORS**
- **Morgan**
- **Express Rate Limit**
- **Multer**
- **Cloudinary**
- **Nodemailer**

### Development & Deployment

- Git
- GitHub
- VS Code
- Postman
- Nodemon
- Vercel — Frontend deployment
- Render / Node-compatible hosting — Backend deployment

---

## 🏗️ Architecture

```text
                    ┌─────────────────────────┐
                    │       Web Browser       │
                    │   React + Vite + UI     │
                    └────────────┬────────────┘
                                 │
                                 │ HTTPS / REST API
                                 ▼
                    ┌─────────────────────────┐
                    │     Express.js API      │
                    │ Auth • Validation • RBAC│
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
       ┌────────────┐     ┌──────────────┐   ┌──────────────┐
       │  MongoDB   │     │  Cloudinary  │   │ SMTP/Email   │
       │  Database  │     │ Image Upload │   │ Notifications│
       └────────────┘     └──────────────┘   └──────────────┘
```

---

## 📁 Project Structure

```text
smart-village-management/
│
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seeds/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🔌 Backend API Modules

The backend exposes REST API modules under `/api/v1` for the major platform features.

```text
/api/v1/auth
/api/v1/village
/api/v1/businesses
/api/v1/community
/api/v1/listings
/api/v1/gallery
/api/v1/complaints
/api/v1/contact
/api/v1/dashboard
/api/v1/emergency
/api/v1/events
/api/v1/jobs
/api/v1/applications
/api/v1/notices
/api/v1/notifications
/api/v1/users
/api/v1/services
/api/v1/households
/api/v1/government-contacts
/api/v1/sos
/api/v1/village-features
```

A health endpoint is also available:

```text
GET /api/health
```

---

## ⚙️ Environment Variables

### Backend

Create a `.env` file inside `Backend/` using `.env.example` as the template.

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d

# Optional - Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional - SMTP / password reset email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
```

### Frontend

Create a `.env` file inside `Frontend/` using `.env.example`.

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Kakarcholi Village Portal
```

For production, set `VITE_API_URL` to the deployed backend API URL.

> **Security:** Never commit `.env` files, database credentials, JWT secrets, Cloudinary credentials, SMTP credentials, or other private keys to GitHub.

---

## 🚀 Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/realvivekrana/smart-village-management.git
cd smart-village-management
```

### 2. Install backend dependencies

```bash
cd Backend
npm install
```

Create your `.env` file and configure MongoDB and JWT settings.

Start the backend:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

### 3. Install frontend dependencies

Open a new terminal:

```bash
cd Frontend
npm install
```

Create the frontend `.env` file:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Kakarcholi Village Portal
```

Start the frontend:

```bash
npm run dev
```

The Vite development server will normally be available at:

```text
http://localhost:5173
```

---

## 🌱 Database Seeding

The backend includes seed scripts for initial platform data.

### Create admin user

```bash
cd Backend
npm run seed:admin
```

### Seed village data

```bash
npm run seed:village
```

### Seed Kakarcholi village data

```bash
npm run seed:kakarcholi
```

### Seed village features

```bash
npm run seed:features
```

### Seed emergency contacts

```bash
npm run seed:emergency
```

### Seed government contacts

```bash
npm run seed:government-contacts
```

> Review the seed files and environment configuration before running them against a production database.

---

## 🖥️ Production Deployment

### Frontend — Vercel

The frontend is built with Vite and can be deployed to Vercel.

Recommended Vercel settings:

```text
Root Directory: Frontend
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

Because the frontend uses React Router, keep `Frontend/vercel.json` configured for SPA routing:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This allows routes such as `/notices`, `/events`, `/jobs`, `/services`, etc. to work correctly when opened directly or refreshed.

### Backend

The Express backend can be deployed to Render or another Node.js-compatible hosting provider.

Production environment variables should include at least:

```text
NODE_ENV=production
PORT=<provider-assigned-or-configured-port>
FRONTEND_URL=<deployed-frontend-url>
MONGO_URI=<production-mongodb-uri>
JWT_SECRET=<strong-production-secret>
JWT_EXPIRES_IN=7d
```

If using Cloudinary or SMTP functionality, configure their corresponding production credentials as well.

---

## 🔒 Security Measures

The backend includes several security and reliability measures:

- JWT authentication
- Password hashing with bcrypt
- Role-based authorization
- Protected API routes
- Request validation with Express Validator
- HTTP security headers with Helmet
- CORS configuration
- API rate limiting
- Secure authentication middleware
- Centralized error handling
- Graceful server shutdown
- Environment-based configuration

---

## 🧪 Useful Commands

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Backend

```bash
npm run dev
npm start
npm run seed:admin
npm run seed:village
npm run seed:kakarcholi
npm run seed:features
npm run seed:emergency
npm run seed:government-contacts
```

---

## 🗺️ Main Public Routes

```text
/
/about
/businesses
/businesses/:id
/events
/events/:id
/jobs
/jobs/:id
/notices
/notices/:id
/services
/services/:id
/emergency
/village-places
/gallery
/contact
/government-contacts
/community
/village-services
/gaon-bazaar
```

### Authentication Routes

```text
/login
/register
/forgot-password
```

### Citizen Area

```text
/citizen/dashboard
/citizen/profile
/citizen/complaints
/citizen/complaints/create
/citizen/sos
/citizen/village-services
/citizen/notices
/citizen/events
/citizen/my-household
/citizen/applications
/citizen/job-applications
/citizen/bazaar
/citizen/photos
/citizen/posts
/citizen/notifications
```

### Business Owner Area

```text
/business-owner/dashboard
/business-owner/business
/business-owner/business/add
/business-owner/business/edit/:id
/business-owner/jobs
/business-owner/applications
```

### Admin Area

```text
/admin/dashboard
/admin/users
/admin/complaints
/admin/businesses
/admin/events
/admin/jobs
/admin/notices
/admin/services
/admin/emergency
/admin/community
/admin/reports
/admin/village-settings
/admin/village-directory
/admin/government-contacts
/admin/households
/admin/submissions
/admin/applications
/admin/contact-messages
/admin/village-features
```

> Route names may evolve as the application continues to be developed. The source of truth is `Frontend/src/routes/AppRoutes.jsx`.

---

## 🎯 Project Goals

The project is designed around the following goals:

1. Digitize commonly used village information and services.
2. Make important contacts and emergency resources easier to access.
3. Improve communication between citizens and village administration.
4. Provide a structured system for submitting and tracking complaints.
5. Create visibility for local businesses and employment opportunities.
6. Support community participation through posts, comments and events.
7. Provide administrators with centralized management and reporting tools.
8. Build a scalable foundation for future digital village services.

---

## 🔮 Future Improvements

Potential future enhancements include:

- Progressive Web App (PWA) support
- Push notifications
- SMS/WhatsApp notification integration
- Online service payment integration
- Advanced analytics and reporting
- Document verification workflows
- Multilingual content expansion
- Offline-first support for low-connectivity areas
- Improved accessibility features
- Mobile application using React Native
- More government-service integrations

---

## 🤝 Contributing

Contributions and suggestions are welcome.

A typical workflow:

```bash
git checkout -b feature/your-feature
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature
```

Then open a pull request with a clear description of the change.

---

## 📄 License

This project currently uses the license declared in the backend package configuration (`ISC`). Review the repository configuration before distributing or reusing the project commercially.

---

## 👨‍💻 Author

**Vivek Kumar Rana**

- GitHub: https://github.com/realvivekrana
- LinkedIn: https://www.linkedin.com/in/mrvivekrana/
- Email: vivekranaworks@gmail.com

---

## ⭐ Support the Project

If you find this project useful, consider starring the repository on GitHub and sharing feedback or improvement ideas.

---

<p align="center">
  <strong>Kakarcholi Village Management System</strong><br />
  Building a more connected and accessible digital village experience.
</p>