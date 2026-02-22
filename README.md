# Tuition Tracker

A functional MERN-stack (MongoDB, Express, React, Node.js) web application designed to help tutors and administrators manage students, assign homework, grade submissions, and track daily attendance.

The project features a beautiful glassmorphism UI with real-time statistics like student completion streaks and global leaderboards.

## Features

**Admin Capabilities:**
- Create and manage student accounts
- Assign homework (with titles, descriptions, and due dates)
- Grade student homework submissions (mark as "Done" or "Not Done")
- Leave personal remarks/feedback on submissions
- Automatically calculate student completion percentages
- Manage daily student attendance with an interactive interface
- Auto-calculate and display a Global Leaderboard ranking for all students

**Student Capabilities:**
- Secure JWT-based login
- View customized dashboard with top-level performance statistics
- See exclusively assigned Pending Tasks and Due Dates
- View Completed Tasks with grading results and admin feedback
- Track personal daily attendance percentages

## Tech Stack
- **Frontend:** React (Vite), React Router DOM, Vanilla CSS (Glassmorphism design)
- **Backend:** Node.js, Express
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JSON Web Tokens (JWT), bcryptjs

## Running Locally

### Prerequisites
- Node.js installed
- MongoDB URI (e.g., MongoDB Atlas account)

### 1. Backend Setup
1. Navigate into the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder and add the following variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin
   ```
4. Start the backend server:
   ```bash
   node server.js
   ```

### 2. Frontend Setup
1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```

## API Structure

The backend provides RESTful API endpoints organized into sub-routes:

- **Auth:** `/api/auth/student/login`, `/api/auth/admin/login`
- **Admin:** `/api/admin/students`, `/api/admin/homework`, `/api/admin/submissions/:id`, `/api/admin/attendance`
- **Student:** `/api/student/dashboard`, `/api/student/submissions/:id`
