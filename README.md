# Student Management System

A small full-stack app for managing students: view, add, edit, delete, search and filter.

**Tech:** HTML, CSS, vanilla JavaScript, Node.js, Express.js, MySQL (mysql2)

## Setup

1. Create the database and table in MySQL (`school_db`, table `students`
   with columns id, name, age, email, course; email is UNIQUE).
2. In `backend/`, create a `.env` file:

```
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=school_db
```

3. Install and run:

```
   cd backend
   npm install
   npm run dev
```

4. Open http://localhost:3000

## API

| Method | URL | Purpose |
|---|---|---|
| GET | /api/students | All students |
| GET | /api/students/:id | One student |
| POST | /api/students | Create |
| PUT | /api/students/:id | Update |
| DELETE | /api/students/:id | Delete |
| GET | /api/students/search?name= | Search by name |
| GET | /api/students/filter?course= | Filter by course |