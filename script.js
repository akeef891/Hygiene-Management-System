const token = localStorage.getItem("token")

if(!token && !window.location.pathname.includes("login.html")){
window.location.href="login.html"
}
const API_BASE = 'https://hygiene-management-system.onrender.com'
const AUTH_API = 'https://hygiene-management-system.onrender.com/api/auth'
const EMPLOYEE_API = 'https://hygiene-management-system.onrender.com/api/employees'
const TASK_API = 'https://hygiene-management-system.onrender.com/api/tasks'
const INSPECTION_API = 'https://hygiene-management-system.onrender.com/api/inspections'
console.log('Using API:', 'https://hygiene-management-system.onrender.com')

function logout() {
  localStorage.removeItem('token')
  window.location.href = 'login.html'
}

function toggleSidebar() {
  const el = document.querySelector('.sidebar')
  if (el) {
    el.classList.toggle('active')
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast')
  if (!toast) return

  toast.innerText = message
  toast.className = `toast show ${type}`

  window.clearTimeout(window.__toastTimeout)
  window.__toastTimeout = window.setTimeout(() => {
    toast.className = 'toast'
  }, 3000)
}

// UI loading/success/error feedback for every fetch call.
if (typeof window !== 'undefined' && window.fetch && !window.__toastFetchWrapped) {
  window.__toastFetchWrapped = true
  const originalFetch = window.fetch.bind(window)
  window.fetch = async (...args) => {
    showToast('Loading...', 'success')
    try {
      const res = await originalFetch(...args)
      if (res.ok) {
        showToast('Success', 'success')
      } else {
        showToast('Request failed', 'error')
      }
      return res
    } catch (err) {
      showToast(err?.message || 'Network error', 'error')
      throw err
    }
  }
}

function openEmployeeModal() {
  const form = document.getElementById('employeeForm')
  if (form && typeof form.scrollIntoView === 'function') {
    form.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const nameInput = document.getElementById('name')
  if (nameInput) {
    nameInput.focus()
  }
}

function filterTasks() {
  const search = document.getElementById('searchTask')?.value?.toLowerCase() || ''
  const rows = document.querySelectorAll('#taskTable tr')

  rows.forEach((row) => {
    const text = row.innerText.toLowerCase()
    row.style.display = text.includes(search) ? '' : 'none'
  })
}

function filterEmployees() {
  const search = document.getElementById('searchEmployee')?.value?.toLowerCase() || ''
  const rows = document.querySelectorAll('#employeeTable tr')

  rows.forEach((row) => {
    const text = row.innerText.toLowerCase()
    row.style.display = text.includes(search) ? '' : 'none'
  })
}

function filterInspections() {
  const search = document.getElementById('searchInspection')?.value?.toLowerCase() || ''
  const rows = document.querySelectorAll('#inspectionTable tr')

  rows.forEach((row) => {
    const text = row.innerText.toLowerCase()
    row.style.display = text.includes(search) ? '' : 'none'
  })
}

// edit state caches
let employeesCache = []
let tasksCache = []
let inspectionsCache = []
let currentEmployeeId = null
let currentTaskId = null
let currentInspectionId = null

function setText(id, text) {
  const el = document.getElementById(id)
  if (el) el.textContent = text
}

function showAlert(id, { type = 'ok', message }) {
  const el = document.getElementById(id)
  if (!el) return
  el.classList.remove('is-error', 'is-ok')
  el.classList.add(type === 'error' ? 'is-error' : 'is-ok')
  el.textContent = message
  el.style.display = 'block'
}

function hideAlert(id) {
  const el = document.getElementById(id)
  if (!el) return
  el.style.display = 'none'
}

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString()
}

async function apiFetch(path, options) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await res.json() : await res.text()

  if (!res.ok) {
    const msg =
      (body && body.message) ||
      (typeof body === 'string' ? body : '') ||
      `Request failed: ${res.status}`
    throw new Error(msg)
  }

  // Your backend sometimes returns `{ success, data }` and sometimes raw docs.
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) return body.data
  return body
}

// Dashboard / Auth
function initDashboard() {
  setText('apiBase', API_BASE)
}

async function loginManager(event) {
  event.preventDefault()

  const email = document.getElementById('email').value.trim()
  const password = document.getElementById('password').value.trim()
  const alertEl = document.getElementById('loginAlert')

  if (alertEl) {
    alertEl.style.display = 'none'
    alertEl.textContent = ''
  }

  if (!email || !password) {
    if (alertEl) {
      alertEl.textContent = 'Email and password are required'
      alertEl.style.display = 'block'
    }
    return
  }

  try {
    const res = await fetch(`${AUTH_API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Login failed')
    }

    if (data.token) {
      localStorage.setItem('token', data.token)
    }

   window.location.href="dashboard.html"
  } catch (err) {
    if (alertEl) {
      alertEl.textContent = err.message || 'Login failed'
      alertEl.style.display = 'block'
    }
  }
}

async function login(event) {
  event.preventDefault()

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  try {
    const res = await fetch('https://hygiene-management-system.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Login failed')
    }

    console.log('Login success:', data)

    localStorage.setItem('token', data.token)

    window.location.href = 'dashboard.html'
  } catch (err) {
    const errEl = document.getElementById('loginError')
    if (errEl) {
      errEl.innerText = err.message
    } else {
      showToast(err.message, 'error')
    }
  }
}

async function forgotPassword() {
  const email = document.getElementById('email')?.value

  if (!email) {
    showToast('Enter your email first', 'error')
    return
  }

  try {
    const res = await fetch('https://hygiene-management-system.onrender.com/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Failed')
    }

    showToast('Reset link sent to your email. Check Ethereal preview.', 'success')
  } catch (err) {
    showToast(err.message, 'error')
  }
}

async function loadDashboardStats() {
  try {
    const res = await fetch('https://hygiene-management-system.onrender.com/api/dashboard/stats')
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data?.message || 'Failed to load dashboard stats')
    }

    const { totalEmployees, pendingTasks, inspectionsToday, averageScore } = data

    const setNumber = (id, value) => {
      const el = document.getElementById(id)
      if (el) el.textContent = String(value)
    }

    setNumber('totalEmployees', totalEmployees ?? 0)
    setNumber('pendingTasks', pendingTasks ?? 0)
    setNumber('inspectionsToday', inspectionsToday ?? 0)

    const avgEl = document.getElementById('avgScore')
    if (avgEl) {
      avgEl.innerText = Number(averageScore ?? 0).toFixed(1)
    }
  } catch (error) {
    console.error('Dashboard loading failed', error)
  }
}

async function loadDashboardCharts() {
  try {
    const tasksRes = await fetch('https://hygiene-management-system.onrender.com/api/tasks')
    const inspectionsRes = await fetch('https://hygiene-management-system.onrender.com/api/inspections')

    const tasksResult = await tasksRes.json()
    const inspectionsResult = await inspectionsRes.json()

    const tasks = tasksResult.data || tasksResult
    const inspections = inspectionsResult.data || inspectionsResult

    const pendingTasks = Array.isArray(tasks)
      ? tasks.filter((t) => t.status === 'Pending').length
      : 0
    const completedTasks = Array.isArray(tasks)
      ? tasks.filter((t) => t.status === 'Completed').length
      : 0

    const taskCtx = document.getElementById('taskChart')

    if (taskCtx && typeof Chart !== 'undefined') {
      new Chart(taskCtx, {
        type: 'doughnut',
        data: {
          labels: ['Pending', 'Completed'],
          datasets: [
            {
              data: [pendingTasks, completedTasks],
              backgroundColor: ['#facc15', '#22c55e'],
            },
          ],
        },
      })
    }

    const inspectionArray = Array.isArray(inspections) ? inspections : []
    const inspectionScores = inspectionArray.map((i) => Number(i.score || 0))
    const inspectionLabels = inspectionArray.map((_, index) => `Inspection ${index + 1}`)

    const inspectionCtx = document.getElementById('inspectionChart')

    if (inspectionCtx && typeof Chart !== 'undefined') {
      new Chart(inspectionCtx, {
        type: 'line',
        data: {
          labels: inspectionLabels,
          datasets: [
            {
              label: 'Inspection Score',
              data: inspectionScores,
              borderColor: '#2563eb',
              pointBackgroundColor: [
                '#3b82f6',
                '#22c55e',
                '#f59e0b',
                '#ef4444',
              ],
              borderRadius: 6,
              borderWidth: 1,
              backgroundColor: 'rgba(37, 99, 235, 0.15)',
              tension: 0.25,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: {
                color: '#e2e8f0',
              },
            },
          },
          scales: {
            x: {
              ticks: { color: '#94a3b8' },
            },
            y: {
              ticks: { color: '#94a3b8' },
            },
          },
        },
      })
    }
  } catch (error) {
    console.error('Dashboard charts failed', error)
  }
}

async function loadEmployeePerformance() {
  try {
    const employeesRes = await fetch('https://hygiene-management-system.onrender.com/api/employees')
    const inspectionsRes = await fetch('https://hygiene-management-system.onrender.com/api/inspections')

    const employees = await employeesRes.json() // eslint-disable-line no-unused-vars
    const inspectionsResult = await inspectionsRes.json()

    const inspections = inspectionsResult.data || inspectionsResult

    const performance = {}

    if (Array.isArray(inspections)) {
      inspections.forEach((i) => {
        const empId = i.employeeId?._id || i.employeeId

        if (!empId) return

        if (!performance[empId]) {
          performance[empId] = {
            scores: [],
            name: i.employeeId?.name || 'Employee',
          }
        }

        performance[empId].scores.push(Number(i.score))
      })
    }

    const ranking = Object.values(performance)
      .map((emp) => {
        const total = emp.scores.reduce((a, b) => a + b, 0)
        const avg = total / emp.scores.length
        return {
          name: emp.name,
          avg: Number.isFinite(avg) ? avg.toFixed(1) : '0.0',
        }
      })
      .sort((a, b) => b.avg - a.avg)

    const table = document.getElementById('performanceTable')
    if (!table) return

    table.innerHTML = ''

    ranking.forEach((emp, index) => {
      const row = `
        <tr>
          <td>${index + 1}</td>
          <td>${emp.name}</td>
          <td>${emp.avg}</td>
        </tr>
      `

      table.innerHTML += row
    })
  } catch (error) {
    console.error('Performance load failed', error)
  }
}

async function loadRecentActivity() {
  try {
    const tasksRes = await fetch('https://hygiene-management-system.onrender.com/api/tasks')
    const inspectionsRes = await fetch('https://hygiene-management-system.onrender.com/api/inspections')

    const tasksResult = await tasksRes.json()
    const inspectionsResult = await inspectionsRes.json()

    const tasks = tasksResult.data || tasksResult
    const inspections = inspectionsResult.data || inspectionsResult

    const activities = []

    if (Array.isArray(tasks)) {
      tasks.forEach((task) => {
        activities.push({
          type: 'task',
          text: `Task "${task.task}" assigned`,
          date: new Date(task.createdAt),
        })
      })
    }

    if (Array.isArray(inspections)) {
      inspections.forEach((i) => {
        const emp = i.employeeId?.name || 'Employee'
        activities.push({
          type: 'inspection',
          text: `Inspection completed for ${emp} — Score ${i.score}`,
          date: new Date(i.createdAt),
        })
      })
    }

    activities.sort((a, b) => b.date - a.date)

    const feed = document.getElementById('activityFeed')
    if (!feed) return

    feed.innerHTML = ''

    activities.slice(0, 8).forEach((a) => {
      const item = document.createElement('li')
      item.textContent = a.text
      feed.appendChild(item)
    })
  } catch (error) {
    console.error('Activity feed failed', error)
  }
}

async function loadHygieneAnalytics() {
  try {
    const res = await fetch('https://hygiene-management-system.onrender.com/api/inspections')
    const result = await res.json()

    const inspections = result.data || result

    if (!Array.isArray(inspections)) return

    const rules = {
      nailsClean: 0,
      uniformProper: 0,
      gloves: 0,
      mask: 0,
      hairNet: 0,
      handWash: 0,
      shoesClean: 0,
      idCard: 0,
      apron: 0,
      hairTied: 0,
      noJewelry: 0,
      handsSanitized: 0,
    }

    inspections.forEach((i) => {
      Object.keys(rules).forEach((r) => {
        if (i[r]) rules[r]++
      })
    })

    const total = inspections.length

    const percentages = Object.values(rules).map((v) => {
      if (total === 0) return 0
      return Math.round((v / total) * 100)
    })

    const labels = [
      'Nails Clean',
      'Uniform Proper',
      'Gloves',
      'Mask',
      'Hair Net',
      'Hand Wash',
      'Shoes Clean',
      'ID Card',
      'Apron',
      'Hair Tied',
      'No Jewelry',
      'Hands Sanitized',
    ]

    const ctx = document.getElementById('hygieneChart')
    if (!ctx || typeof Chart === 'undefined') return

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Compliance %',
            data: percentages,
            backgroundColor: '#22c55e',
          },
        ],
      },
    })
  } catch (err) {
    console.error('Hygiene analytics error', err)
  }
}

// Generic edit/delete helpers
async function deleteItem(id, type) {
  const confirmDelete = window.confirm('Are you sure you want to delete this?')
  if (!confirmDelete) return

  await fetch(`${API_BASE}/api/${type}/${id}`, {
    method: 'DELETE',
  })

  // Simple: reload page so current list refreshes
  window.location.reload()
}

async function updateItem(id, type, data) {
  await fetch(`${API_BASE}/api/${type}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  window.location.reload()
}

async function markCompleted(id) {
  try {
    const res = await fetch(`https://hygiene-management-system.onrender.com/api/tasks/${id}/status`, {
      method: 'PUT',
    })

    const data = await res.json()

    console.log('Updated Task:', data)

    showToast('Task marked as Completed', 'success')

    await loadTasks()
  } catch (err) {
    console.error(err)
  }
}

// Employees (required functions)
async function loadEmployees() {
  const tbody = document.getElementById('employeeTable')
  if (!tbody) return

  const res = await fetch(EMPLOYEE_API)
  const json = await res.json()

  if (!res.ok) {
    throw new Error(json?.message || `Failed to load employees (${res.status})`)
  }

  const employees = Array.isArray(json) ? json : json?.data

  employeesCache = Array.isArray(employees) ? employees : []

  if (!Array.isArray(employees) || employees.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-state">No data available</td></tr>`
    return
  }

  tbody.innerHTML = employees
    .map(
      (e) => `
        <tr>
          <td>${escapeHtml(e?.name ?? '')}</td>
          <td>${escapeHtml(e?.department ?? '')}</td>
          <td>${escapeHtml(e?.status || 'Active')}</td>
          <td>
            <button class="btn-edit" onclick="editEmployee('${e._id}')">Edit</button>
            <button class="btn-delete" onclick="deleteItem('${e._id}','employees')">Delete</button>
          </td>
        </tr>
      `
    )
    .join('')
}

async function addEmployee(event) {
  event.preventDefault()

  try {
    hideAlert('employeeAlert')

    const name = document.getElementById('name')?.value?.trim()
    const department = document.getElementById('department')?.value?.trim()

    if (!name || !department) return

    const res = await fetch(EMPLOYEE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, department, status: 'Active' }),
    })

    const json = await res.json()

    if (!res.ok) {
      throw new Error(json?.message || `Failed to add employee (${res.status})`)
    }

    const form = document.getElementById('employeeForm')
    if (form && typeof form.reset === 'function') form.reset()

    showAlert('employeeAlert', { type: 'ok', message: 'Employee added.' })
    await loadEmployees()
  } catch (e) {
    showAlert('employeeAlert', { type: 'error', message: e.message || 'Failed to add employee' })
  }
}

function editEmployee(id) {
  const emp = employeesCache.find((e) => e._id === id)
  if (!emp) return

  currentEmployeeId = id

  const nameInput = document.getElementById('name')
  const deptInput = document.getElementById('department')
  const hiddenId = document.getElementById('employeeIdEdit')
  const submitBtn = document.getElementById('employeeSubmitBtn')

  if (nameInput) nameInput.value = emp.name || ''
  if (deptInput) deptInput.value = emp.department || ''
  if (hiddenId) hiddenId.value = id
  if (submitBtn) submitBtn.textContent = 'Update Employee'
}

async function saveEmployee(event) {
  event.preventDefault()

  const name = document.getElementById('name')?.value?.trim()
  const department = document.getElementById('department')?.value?.trim()

  if (!name || !department) return

  // If editing, use generic updateItem
  if (currentEmployeeId) {
    await updateItem(currentEmployeeId, 'employees', { name, department, status: 'Active' })
    return
  }

  // Otherwise, fall back to create
  return addEmployee(event)
}

// Tasks
async function addTask(event) {
  event.preventDefault()

  try {
    hideAlert('taskAlert')

    const employeeId = document.getElementById('employeeId').value
    const taskName = document.getElementById('taskName').value
    const location = document.getElementById('location').value
    const dueDate = document.getElementById('dueDate').value

    if (!employeeId || !taskName || !location || !dueDate) return

    const response = await fetch(TASK_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: taskName,
        location: location,
        employeeId: employeeId,
        date: dueDate,
        status: 'Pending',
      }),
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(result?.message || `Failed to add task (${response.status})`)
    }

    const form = document.getElementById('taskForm')
    if (form && typeof form.reset === 'function') form.reset()

    showAlert('taskAlert', { type: 'ok', message: 'Task added.' })
    await loadTasks()
  } catch (error) {
    showAlert('taskAlert', { type: 'error', message: error.message || 'Failed to add task' })
  }
}

async function loadTasks() {
  const table = document.getElementById('taskTable')
  if (!table) return

  try {
    const res = await fetch('https://hygiene-management-system.onrender.com/api/tasks')
    const result = await res.json()

    const tasks = result?.data || result

    console.log('Tasks:', tasks)

    tasksCache = Array.isArray(tasks) ? tasks : []

    if (!Array.isArray(tasks) || tasks.length === 0) {
      table.innerHTML = `<tr><td colspan="6" class="empty-state">No data available</td></tr>`
      return
    }

    table.innerHTML = ''

    tasks.forEach((task) => {
      const employee = task.employeeId || ''
      const formattedDate = task.date ? new Date(task.date).toLocaleDateString() : ''
      const row = `
        <tr>
          <td>${escapeHtml(task.task ?? '')}</td>
          <td>${escapeHtml(task.location ?? '')}</td>
          <td>${escapeHtml(employee || '')}</td>
          <td>${escapeHtml(formattedDate)}</td>
          <td>
            ${
              task.status === 'Completed'
                ? '<span class="badge badge-success">Completed</span>'
                : '<span class="badge badge-pending">Pending</span>'
            }
          </td>
          <td>
            <button class="btn-edit" onclick="editTask('${task._id}')">Edit</button>
            <button class="btn-delete" onclick="deleteItem('${task._id}','tasks')">Delete</button>
            <button class="btn-complete" onclick="markCompleted('${task._id}')">Complete</button>
          </td>
        </tr>
      `
      table.innerHTML += row
    })
  } catch (error) {
    console.error('Failed to load tasks', error)
  }
}

function editTask(id) {
  const task = tasksCache.find((t) => t._id === id)
  if (!task) return

  currentTaskId = id

  const empSelect = document.getElementById('employeeId')
  const taskNameInput = document.getElementById('taskName')
  const locationInput = document.getElementById('location')
  const dueDateInput = document.getElementById('dueDate')

  if (empSelect) empSelect.value = task.employeeId || ''
  if (taskNameInput) taskNameInput.value = task.task || ''
  if (locationInput) locationInput.value = task.location || ''
  if (dueDateInput && task.date) {
    const d = new Date(task.date)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    dueDateInput.value = `${yyyy}-${mm}-${dd}`
  }
}

async function saveTask(event) {
  event.preventDefault()

  const employeeId = document.getElementById('employeeId').value
  const taskName = document.getElementById('taskName').value
  const location = document.getElementById('location').value
  const dueDate = document.getElementById('dueDate').value

  if (!employeeId || !taskName || !location || !dueDate) return

  if (currentTaskId) {
    await updateItem(currentTaskId, 'tasks', {
      task: taskName,
      location,
      employeeId,
      date: dueDate,
      status: 'Pending',
    })
    return
  }

  return addTask(event)
}

async function loadEmployeeDropdown() {
  try {
    const response = await fetch('https://hygiene-management-system.onrender.com/api/employees')
    const result = await response.json()

    const employees = Array.isArray(result) ? result : result.data || []

    const dropdown = document.getElementById('employeeId')
    if (!dropdown) return

    dropdown.innerHTML = '<option value=\"\">Select Employee</option>'

    employees.forEach((emp) => {
      const option = document.createElement('option')
      option.value = emp._id
      option.textContent = emp.name
      dropdown.appendChild(option)
    })
  } catch (error) {
    console.error('Failed to load employees', error)
  }
}

// Inspections
async function loadInspections() {
  try {
    const response = await fetch('https://hygiene-management-system.onrender.com/api/inspections')
    const result = await response.json()

    const inspections = result.data || result

    const table = document.getElementById('inspectionTable')
    if (!table) return

    table.innerHTML = ''

    if (!Array.isArray(inspections) || inspections.length === 0) {
      table.innerHTML = `<tr><td colspan="5" class="empty-state">No data available</td></tr>`
      return
    }

    inspectionsCache = inspections

    inspections.forEach((item) => {
      const employee =
        item.employeeId?.name ||
        item.employeeId?._id ||
        item.employeeId ||
        ''

      const totalParameters = 12
      const rawScore = Number(item.score || 0)
      const clampedScore = Math.max(0, Math.min(totalParameters, rawScore))
      const scoreDisplay = `${clampedScore} / ${totalParameters}`

      const percentage = (clampedScore / totalParameters) * 100
      let status = ''
      let statusClass = ''

      if (percentage >= 80) {
        status = 'Good'
        statusClass = 'status-good'
      } else if (percentage >= 60) {
        status = 'Average'
        statusClass = 'status-average'
      } else {
        status = 'Needs Improvement'
        statusClass = 'status-poor'
      }

      const score10 = Math.max(0, Math.min(10, Number(item.score || 0)))
      const scoreWidth = (score10 / 10) * 100

      const row = `
        <tr>
          <td>${employee}</td>
          <td>
            <div class="progress">
              <div class="progress-bar" style="width:${scoreWidth}%">
                ${score10}/10
              </div>
            </div>
          </td>
          <td><span class="${statusClass}">${status}</span></td>
          <td>${new Date(item.date).toLocaleDateString()}</td>
          <td>
            <button class="btn-edit" onclick="editInspection('${item._id}')">Edit</button>
            <button class="btn-delete" onclick="deleteItem('${item._id}','inspections')">Delete</button>
          </td>
        </tr>
      `

      table.innerHTML += row
    })
  } catch (error) {
    console.error('Failed to load inspections', error)
  }
}

function editInspection(id) {
  const insp = inspectionsCache.find((i) => i._id === id)
  if (!insp) return

  currentInspectionId = id

  const empSelect = document.getElementById('employeeId')
  const dateInput = document.getElementById('date')

  if (empSelect) {
    const empId = insp.employeeId?._id || insp.employeeId
    empSelect.value = empId || ''
  }

  if (dateInput && insp.date) {
    const d = new Date(insp.date)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    dateInput.value = `${yyyy}-${mm}-${dd}`
  }

  // checklist
  const mapBool = (key) => Boolean(insp[key])
  const ids = [
    'nailsClean',
    'uniformProper',
    'gloves',
    'mask',
    'hairNet',
    'handWash',
    'shoesClean',
    'idCard',
    'apron',
    'hairTied',
    'noJewelry',
    'handsSanitized',
  ]
  ids.forEach((idName) => {
    const el = document.getElementById(idName)
    if (el) el.checked = mapBool(idName)
  })
}

async function addInspection(event) {
  event.preventDefault()

  const employeeId = document.getElementById('employeeId').value
  const date = document.getElementById('date').value

  const checks = [
    document.getElementById('nailsClean').checked,
    document.getElementById('uniformProper').checked,
    document.getElementById('gloves').checked,
    document.getElementById('mask').checked,
    document.getElementById('hairNet').checked,
    document.getElementById('handWash').checked,
    document.getElementById('shoesClean').checked,
    document.getElementById('idCard').checked,
    document.getElementById('apron').checked,
    document.getElementById('hairTied').checked,
    document.getElementById('noJewelry').checked,
    document.getElementById('handsSanitized').checked,
  ]

  const score = checks.filter(Boolean).length

  const payload = {
    employeeId,
    score,
    date,
    nailsClean: checks[0],
    uniformProper: checks[1],
    gloves: checks[2],
    mask: checks[3],
    hairNet: checks[4],
    handWash: checks[5],
    shoesClean: checks[6],
    idCard: checks[7],
    apron: checks[8],
    hairTied: checks[9],
    noJewelry: checks[10],
    handsSanitized: checks[11],
  }

  try {
    // If currently editing, update instead of create
    if (currentInspectionId) {
      await updateItem(currentInspectionId, 'inspections', payload)
      return
    }

    const response = await fetch('https://hygiene-management-system.onrender.com/api/inspections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Inspection creation failed:', error)
      return
    }

    document.getElementById('inspectionForm').reset()

    loadInspections()
  } catch (error) {
    console.error('Inspection creation failed', error)
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body?.dataset?.page
  if (page === 'dashboard') {
    initDashboard()
    if (document.getElementById('totalEmployees')) {
      loadDashboardStats()
    }
    if (document.getElementById('taskChart')) {
      loadDashboardCharts()
    }
    if (document.getElementById('performanceTable')) {
      loadEmployeePerformance()
    }
    if (document.getElementById('activityFeed')) {
      loadRecentActivity()
    }
    if (document.getElementById('hygieneChart')) {
      loadHygieneAnalytics()
    }
    return
  }
  if (page === 'employees') {
    loadEmployees().catch((e) => showAlert('employeeAlert', { type: 'error', message: e.message }))
    return
  }
  if (page === 'tasks') {
    const dateInput = document.getElementById('dueDate')
    if (dateInput && !dateInput.value) {
      const today = new Date()
      const yyyy = today.getFullYear()
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const dd = String(today.getDate()).padStart(2, '0')
      dateInput.value = `${yyyy}-${mm}-${dd}`
    }

    if (document.getElementById('employeeId')) {
      loadEmployeeDropdown()
    }

    return
  }
  if (page === 'inspections') {
    if (document.getElementById('employeeId')) {
      loadEmployeeDropdown()
    }
    loadInspections()
    return
  }
})

window.onload = function () {
  if (document.getElementById('taskTable')) {
    loadTasks()
  }
}