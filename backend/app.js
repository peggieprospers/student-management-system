require("dotenv").config();
const express = require("express");
const path = require("path");
const studentService = require("./studentService");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));
// Checks student data. Returns an error message, or null if the data is valid.
function validateStudent(body) {
  const { name, email, age, course } = body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return "Name is required";
  }
  if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    return "A valid email is required";
  }
  if (age === undefined || age === null || age === "" || !Number.isInteger(Number(age)) || Number(age) <= 0) {
    return "Age must be a positive whole number";
  }
  if (!course || typeof course !== "string" || course.trim() === "") {
    return "Course is required";
  }
  return null;
}


// GET /api/students - return all students
app.get("/api/students", async (req, res) => {
  try {
    const students = await studentService.getStudents();
    res.status(200).json(students);
  } catch (error) {
    console.error("Error getting students:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/students/search?name=John - search students by name
app.get("/api/students/search", async (req, res) => {
  try {
    const name = (req.query.name || "").trim();

    if (name === "") {
      return res.status(400).json({ message: "Search name is required" });
    }

    const students = await studentService.searchStudents(name);
    res.status(200).json(students);
  } catch (error) {
    console.error("Error searching students:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/students/filter?course=React - filter students by course
app.get("/api/students/filter", async (req, res) => {
  try {
    const course = (req.query.course || "").trim();

    if (course === "") {
      return res.status(400).json({ message: "Course is required" });
    }

    const students = await studentService.filterStudentsByCourse(course);
    res.status(200).json(students);
  } catch (error) {
    console.error("Error filtering students:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/students/:id - return one student
app.get("/api/students/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid student id" });
    }

    const student = await studentService.getStudentById(id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error("Error getting student:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/students - create a new student
app.post("/api/students", async (req, res) => {
  try {
    const body = req.body || {};
    const errorMessage = validateStudent(body);

    if (errorMessage) {
      return res.status(400).json({ message: errorMessage });
    }

    const name = body.name.trim();
    const email = body.email.trim();
    const age = Number(body.age);
    const course = body.course.trim();

    const newId = await studentService.createStudent(name, email, age, course);
    const newStudent = await studentService.getStudentById(newId);

    res.status(201).json(newStudent);
   } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "A student with this email already exists" });
    }
    console.error("Error creating student:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/students/:id - update an existing student
app.put("/api/students/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid student id" });
    }

    const body = req.body || {};
    const errorMessage = validateStudent(body);

    if (errorMessage) {
      return res.status(400).json({ message: errorMessage });
    }

    const name = body.name.trim();
    const email = body.email.trim();
    const age = Number(body.age);
    const course = body.course.trim();

    const found = await studentService.updateStudent(id, name, email, age, course);

    if (!found) {
      return res.status(404).json({ message: "Student not found" });
    }

    const updatedStudent = await studentService.getStudentById(id);
    res.status(200).json(updatedStudent);
    } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "A student with this email already exists" });
    }
    console.error("Error updating student:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// DELETE /api/students/:id - delete a student
app.delete("/api/students/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid student id" });
    }

    const found = await studentService.deleteStudent(id);

    if (!found) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Server error" });
  }
});