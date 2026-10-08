const pool = require("./db");

// 1. Get all students
async function getStudents() {
  const [rows] = await pool.execute("SELECT * FROM students");
  return rows;
}

// 2. Get one student by id (returns undefined if not found)
async function getStudentById(id) {
  const [rows] = await pool.execute(
    "SELECT * FROM students WHERE id = ?",
    [id]
  );
  return rows[0];
}

// 3. Create a student, return the new id
async function createStudent(name, email, age, course) {
  const [result] = await pool.execute(
    "INSERT INTO students (name, email, age, course) VALUES (?, ?, ?, ?)",
    [name, email, age, course]
  );
  return result.insertId;
}

// 4. Update a student, return true if a row was found
async function updateStudent(id, name, email, age, course) {
  const [result] = await pool.execute(
    "UPDATE students SET name = ?, email = ?, age = ?, course = ? WHERE id = ?",
    [name, email, age, course, id]
  );
  return result.affectedRows > 0;
}

// 5. Delete a student, return true if a row was found
async function deleteStudent(id) {
  const [result] = await pool.execute(
    "DELETE FROM students WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
}

// 6. Search students by name (partial match)
async function searchStudents(name) {
  const [rows] = await pool.execute(
    "SELECT * FROM students WHERE name LIKE ?",
    [`%${name}%`]
  );
  return rows;
}

// 7. Filter students by course
async function filterStudentsByCourse(course) {
  const [rows] = await pool.execute(
    "SELECT * FROM students WHERE course = ?",
    [course]
  );
  return rows;
}

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  searchStudents,
  filterStudentsByCourse,
};