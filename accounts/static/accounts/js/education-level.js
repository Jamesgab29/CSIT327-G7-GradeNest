document.addEventListener("DOMContentLoaded", () => {
  const levelBtns = document.querySelectorAll('.level-btn');
  const gradeLevelSelect = document.getElementById('gradeLevel');
  const schoolYearSelect = document.getElementById('schoolYear');
  const strandGroup = document.getElementById('strandGroup');
  const strandSelect = document.getElementById('strand');
  const getStartedBtn = document.querySelector('.get-started-btn');
  const educationForm = document.getElementById('educationForm');

  let selectedLevel = null;

  const gradeOptions = {
    jhs: [
      { value: 'Grade 7', text: 'Grade 7' },
      { value: 'Grade 8', text: 'Grade 8' },
      { value: 'Grade 9', text: 'Grade 9' },
      { value: 'Grade 10', text: 'Grade 10' }
    ],
    shs: [
      { value: 'Grade 11', text: 'Grade 11' },
      { value: 'Grade 12', text: 'Grade 12' }
    ]
  };

  const strandOptions = [
    { value: 'STEM', text: 'STEM' },
    { value: 'GAS', text: 'GAS' },
    { value: 'ABM', text: 'ABM' },
    { value: 'HUMSS', text: 'HUMSS' }
  ];

  init();

  function init() {
    levelBtns.forEach(btn => btn.addEventListener('click', handleLevelSelection));
    gradeLevelSelect.addEventListener('change', validateMainForm);
    schoolYearSelect.addEventListener('change', validateMainForm);
    strandSelect.addEventListener('change', validateMainForm);
    educationForm.addEventListener('submit', handleMainFormSubmit);

    // Disable strand by default until SHS selected
    strandGroup.style.display = "none";
    strandSelect.disabled = true;
    
    // Disable button initially
    getStartedBtn.disabled = true;
  }

  // Handle JHS/SHS button selection
  function handleLevelSelection(e) {
    const btn = e.currentTarget || e.target.closest('.level-btn');
    if (!btn) return;

    selectedLevel = btn.dataset.level;

    // Highlight the active button
    levelBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    updateFormForLevel(selectedLevel);
  }

  // Update the dropdowns dynamically based on JHS or SHS
  function updateFormForLevel(level) {
    gradeLevelSelect.innerHTML = '<option value="">Choose your grade</option>';
    strandSelect.innerHTML = '<option value="">Select strand</option>';

    // Load grade options
    gradeOptions[level].forEach(opt => addOption(gradeLevelSelect, opt));

    // Show strand only if SHS
    if (level === 'shs') {
      strandOptions.forEach(opt => addOption(strandSelect, opt));
      strandGroup.style.display = "block";
      strandSelect.disabled = false;
    } else {
      strandGroup.style.display = "none";
      strandSelect.disabled = true;
      strandSelect.value = "";
    }

    // Reset selections when switching levels
    gradeLevelSelect.value = "";
    schoolYearSelect.value = "";
    
    validateMainForm();
  }

  function addOption(select, option) {
    const el = document.createElement('option');
    el.value = option.value;
    el.textContent = option.text;
    select.appendChild(el);
  }

  // Validate before submission
  function validateMainForm() {
    const grade = gradeLevelSelect.value;
    const year = schoolYearSelect.value;
    const strand = strandSelect.value;

    // Check if level is selected first
    if (!selectedLevel) {
      getStartedBtn.disabled = true;
      return;
    }

    let isValid = false;
    
    if (selectedLevel === 'jhs') {
      isValid = grade !== "" && year !== "";
    } else if (selectedLevel === 'shs') {
      isValid = grade !== "" && year !== "" && strand !== "";
    }

    getStartedBtn.disabled = !isValid;
  }

  // On submit
  function handleMainFormSubmit(e) {
    e.preventDefault();

    const grade = gradeLevelSelect.value;
    const strand = strandSelect.value;
    const schoolYear = schoolYearSelect.value;

    if (!selectedLevel) {
      alert("Please choose Junior or Senior High first.");
      return;
    }

    if (!grade || !schoolYear) {
      alert("Please fill out all required fields.");
      return;
    }

    if (selectedLevel === 'shs' && !strand) {
      alert("Please select a strand for Senior High School.");
      return;
    }

    // Submit the form
    educationForm.submit();
  }
});