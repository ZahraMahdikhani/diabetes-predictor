const form = document.getElementById("diabetesForm")
const sections = document.querySelectorAll(".form-section")
const prevBtn = document.getElementById("prevBtn")
const nextBtn = document.getElementById("nextBtn")
const submitBtn = document.getElementById("submitBtn")
const progressBar = document.getElementById("progressBar")

let currentSection = 0

// Initialize
function init() {
  showSection(0)
  updateButtons()
}

// Show specific section
function showSection(n) {
  const section = sections[n]

  sections.forEach((s) => s.classList.add("hidden"))
  section.classList.remove("hidden")

  updateProgressBar()
}

// Update progress bar
function updateProgressBar() {
  const progress = ((currentSection + 1) / sections.length) * 100
  progressBar.style.width = progress + "%"
}

// Update button visibility
function updateButtons() {
  prevBtn.style.display = currentSection > 0 ? "block" : "none"
  nextBtn.style.display = currentSection < sections.length - 1 ? "block" : "none"
  submitBtn.style.display = currentSection === sections.length - 1 ? "block" : "none"
}

// Validate current section
function validateSection() {
  const currentInputs = sections[currentSection].querySelectorAll("input, select")
  for (const input of currentInputs) {
    if (input.type !== "radio" && input.type !== "checkbox") {
      if (!input.value) return false
    }
  }

  // Check radio groups
  const radioGroups = {}
  for (const input of currentInputs) {
    if (input.type === "radio") {
      if (!radioGroups[input.name]) {
        radioGroups[input.name] = false
      }
      if (input.checked) {
        radioGroups[input.name] = true
      }
    }
  }

  for (const checked of Object.values(radioGroups)) {
    if (!checked) return false
  }

  return true
}

// Next button
nextBtn.addEventListener("click", () => {
  if (validateSection()) {
    currentSection++
    if (currentSection >= sections.length) {
      currentSection = sections.length - 1
    }
    showSection(currentSection)
    updateButtons()
  } else {
    alert("لطفا تمام فیلد‌های این بخش را پر کنید")
  }
})

// Previous button
prevBtn.addEventListener("click", () => {
  currentSection--
  if (currentSection < 0) {
    currentSection = 0
  }
  showSection(currentSection)
  updateButtons()
})

// Form submit
form.addEventListener("submit", (e) => {
  if (!validateSection()) {
    e.preventDefault()
    alert("لطفا تمام فیلد‌های این بخش را پر کنید")
  }
})

// Initialize on page load
init()
