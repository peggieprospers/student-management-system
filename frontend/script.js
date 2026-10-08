const API_URL = "/api/students";

// Grab the elements we need from the page
const tableBody = document.getElementById("student-table-body");
const searchInput = document.getElementById("search-input");
const filterSelect = document.getElementById("filter-course");
const messageEl = document.getElementById("message");

// Show a message under the form ("success" or "error")
function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = type;
}

// Draw the table rows from an array of students
function renderStudents(students) {
  tableBody.innerHTML = "";

  if (students.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.textContent = "No students found.";
    row.appendChild(cell);
    tableBody.appendChild(row);
    return;
  }

  students.forEach((student) => {
    const row = document.createElement("tr");

    [student.id, student.name, student.email, student.age, student.course].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });

    const actionsCell = document.createElement("td");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";
    editBtn.dataset.id = student.id;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.dataset.id = student.id;

    actionsCell.appendChild(editBtn);
    actionsCell.appendChild(deleteBtn);
    row.appendChild(actionsCell);

    tableBody.appendChild(row);
  });
}

// GET /api/students - load all students
async function loadStudents() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Server returned status " + response.status);
    }
    const students = await response.json();
    renderStudents(students);
  } catch (error) {
    console.error("Error loading students:", error);
    showMessage("Could not load students. Is the server running?", "error");
  }
}

// GET /api/students/search?name=... - search by name
async function searchStudents() {
  const name = searchInput.value.trim();
  filterSelect.value = ""; // searching resets the course filter

  if (name === "") {
    return loadStudents();
  }

  try {
    const response = await fetch(`${API_URL}/search?name=${encodeURIComponent(name)}`);
    if (!response.ok) {
      throw new Error("Server returned status " + response.status);
    }
    const students = await response.json();
    renderStudents(students);
  } catch (error) {
    console.error("Error searching students:", error);
    showMessage("Search failed. Please try again.", "error");
  }
}

// GET /api/students/filter?course=... - filter by course
async function filterStudents() {
  const course = filterSelect.value;
  searchInput.value = ""; // filtering clears the search box

  if (course === "") {
    return loadStudents();
  }

  try {
    const response = await fetch(`${API_URL}/filter?course=${encodeURIComponent(course)}`);
    if (!response.ok) {
      throw new Error("Server returned status " + response.status);
    }
    const students = await response.json();
    renderStudents(students);
  } catch (error) {
    console.error("Error filtering students:", error);
    showMessage("Filter failed. Please try again.", "error");
  }
}

// ---------- Form elements ----------
const form = document.getElementById("student-form");
const idInput = document.getElementById("student-id");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const ageInput = document.getElementById("age");
const courseInput = document.getElementById("course");
const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");

// Send a request with an optional JSON body. Returns the data,
// or throws an Error containing the server's message.
async function sendRequest(url, method, body) {
  const options = { method };
  if (body) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

// Check the form values. Returns an error message, or null if valid.
function validateForm(student) {
  if (student.name === "") return "Name is required";
  if (student.email === "" || !/^\S+@\S+\.\S+$/.test(student.email)) {
    return "Please enter a valid email";
  }
  const age = Number(student.age);
  if (student.age === "" || !Number.isInteger(age) || age <= 0) {
    return "Age must be a positive whole number";
  }
  if (student.course === "") return "Please select a course";
  return null;
}

// Put the form back into "Add Student" mode
function resetForm() {
  form.reset();
  idInput.value = "";
  formTitle.textContent = "Add Student";
  submitBtn.textContent = "Add Student";
  cancelBtn.classList.add("hidden");
}

// Reload the table, keeping the current search or filter
function refreshView() {
  if (searchInput.value.trim() !== "") return searchStudents();
  if (filterSelect.value !== "") return filterStudents();
  return loadStudents();
}

// POST /api/students
async function addStudent(student) {
  await sendRequest(API_URL, "POST", student);
}

// PUT /api/students/:id
async function updateStudent(id, student) {
  await sendRequest(`${API_URL}/${id}`, "PUT", student);
}

// Load one student into the form for editing
async function editStudent(id) {
  try {
    const student = await sendRequest(`${API_URL}/${id}`, "GET");
    idInput.value = student.id;
    nameInput.value = student.name;
    emailInput.value = student.email;
    ageInput.value = student.age;
    courseInput.value = student.course;

    formTitle.textContent = "Edit Student";
    submitBtn.textContent = "Update Student";
    cancelBtn.classList.remove("hidden");
    showMessage("", "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    showMessage(error.message, "error");
  }
}

// DELETE /api/students/:id
async function deleteStudent(id) {
  if (!confirm("Are you sure you want to delete this student?")) return;

  try {
    await sendRequest(`${API_URL}/${id}`, "DELETE");
    if (idInput.value === String(id)) resetForm(); // deleted the one being edited
    showMessage("Student deleted successfully", "success");
    refreshView();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

// Form submit: add or update
form.addEventListener("submit", async (event) => {
  event.preventDefault(); // stop the page from reloading

  const student = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    age: ageInput.value.trim(),
    course: courseInput.value,
  };

  const problem = validateForm(student);
  if (problem) {
    showMessage(problem, "error");
    return;
  }

  student.age = Number(student.age);

  try {
    if (idInput.value) {
      await updateStudent(idInput.value, student);
      showMessage("Student updated successfully", "success");
    } else {
      await addStudent(student);
      showMessage("Student added successfully", "success");
    }
    resetForm();
    refreshView();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

// Cancel button leaves edit mode
cancelBtn.addEventListener("click", () => {
  resetForm();
  showMessage("", "");
});

// One listener for all Edit and Delete buttons
tableBody.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const id = button.dataset.id;
  if (button.classList.contains("edit-btn")) editStudent(id);
  if (button.classList.contains("delete-btn")) deleteStudent(id);
});

// Connect events to functions
searchInput.addEventListener("input", searchStudents);
filterSelect.addEventListener("change", filterStudents);

// Run once when the page opens
loadStudents();