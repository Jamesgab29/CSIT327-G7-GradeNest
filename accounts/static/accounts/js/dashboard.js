// Application State
const appState = {
  currentView: 'dashboard',
  currentQuarter: null,
  currentSubject: null,
  quarters: [],
  semesters: [],
  overallGwa: 0
};

// DepEd JHS Subjects (Grades 7-10)
const JHS_SUBJECTS = [
  'Filipino',
  'English',
  'Mathematics',
  'Science',
  'Araling Panlipunan',
  'Edukasyon sa Pagpapakatao',
  'MAPEH',
  'Technology and Livelihood Education'
];

// DepEd Grade Transmutation Table (Initial Grade to Transmuted Grade)
// Based on DepEd Order No. 8, s. 2015
const TRANSMUTATION_TABLE = {
  100: 100, 99: 99, 98: 98, 97: 97, 96: 96,
  95: 95, 94: 94, 93: 93, 92: 92, 91: 91,
  90: 90, 89: 89, 88: 88, 87: 87, 86: 86,
  85: 85, 84: 84, 83: 83, 82: 82, 81: 81,
  80: 80, 79: 79, 78: 78, 77: 77, 76: 76,
  75: 75, 74: 74, 73: 73, 72: 72, 71: 71,
  70: 70, 69: 69, 68: 68, 67: 67, 66: 66,
  65: 65, 64: 64, 63: 63, 62: 62, 61: 61,
  60: 60, 59: 59, 58: 58, 57: 57, 56: 56,
  55: 55, 54: 54, 53: 53, 52: 52, 51: 51,
  50: 50, 49: 49, 48: 48, 47: 47, 46: 46,
  45: 45, 44: 44, 43: 43, 42: 42, 41: 41,
  40: 40, 39: 39, 38: 38, 37: 37, 36: 36,
  35: 35, 34: 34, 33: 33, 32: 32, 31: 31,
  30: 30, 29: 29, 28: 28, 27: 27, 26: 26,
  25: 25, 24: 24, 23: 23, 22: 22, 21: 21,
  20: 20, 19: 19, 18: 18, 17: 17, 16: 16,
  15: 15, 14: 14, 13: 13, 12: 12, 11: 11,
  10: 10, 9: 9, 8: 8, 7: 7, 6: 6,
  5: 5, 4: 4, 3: 3, 2: 2, 1: 1, 0: 0
};

function transmuteGrade(initialGrade) {
  // Round to nearest whole number
  const rounded = Math.round(initialGrade);
  // Return transmuted grade from table
  return TRANSMUTATION_TABLE[rounded] || rounded;
}

// DepEd Grade Components by Subject Type (Grades 1-10)
const COMPONENT_WEIGHTS = {
  'Filipino': { WW: 30, PT: 50, QA: 20 },
  'English': { WW: 30, PT: 50, QA: 20 },
  'Mathematics': { WW: 40, PT: 40, QA: 20 },
  'Science': { WW: 40, PT: 40, QA: 20 },
  'Araling Panlipunan': { WW: 30, PT: 50, QA: 20 },
  'Edukasyon sa Pagpapakatao': { WW: 30, PT: 50, QA: 20 },
  'MAPEH': { WW: 20, PT: 60, QA: 20 },
  'Technology and Livelihood Education': { WW: 20, PT: 60, QA: 20 }
};

const COMPONENT_NAMES = {
  WW: 'Written Works',
  PT: 'Performance Tasks',
  QA: 'Quarterly Assessment'
};

// ==================== VALIDATION & MODALS ====================

function showValidationError(inputElement, message) {
  // Add error styling
  inputElement.style.border = '2px solid #ef4444';
  
  // Create tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'validation-tooltip';
  tooltip.textContent = message;
  tooltip.style.cssText = `
    position: absolute;
    background: #ef4444;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    white-space: nowrap;
  `;
  
  // Position tooltip
  const rect = inputElement.getBoundingClientRect();
  tooltip.style.position = 'fixed';
  tooltip.style.top = (rect.top - 40) + 'px';
  tooltip.style.left = rect.left + 'px';
  
  document.body.appendChild(tooltip);
  
  // Remove after 3 seconds
  setTimeout(() => {
    inputElement.style.border = '';
    tooltip.remove();
  }, 3000);
}

function showDeleteConfirmation(itemName, onConfirm) {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'delete-modal-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    animation: fadeIn 0.2s ease;
  `;
  
  // Create modal content
  const modal = document.createElement('div');
  modal.className = 'delete-modal';
  modal.style.cssText = `
    background: white;
    padding: 32px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    max-width: 400px;
    text-align: center;
    animation: slideUp 0.3s ease;
  `;
  
  modal.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 16px;">🗑️</div>
    <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 20px;">Delete Item?</h3>
    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">
      Are you sure you want to delete "<strong>${itemName}</strong>"?<br>
      This action cannot be undone.
    </p>
    <div style="display: flex; gap: 12px; justify-content: center;">
      <button class="btn-cancel" style="
        padding: 10px 24px;
        border: 2px solid #e5e7eb;
        background: white;
        color: #6b7280;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      ">Cancel</button>
      <button class="btn-delete-confirm" style="
        padding: 10px 24px;
        border: none;
        background: #ef4444;
        color: white;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      ">Delete</button>
    </div>
  `;
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  // Add hover effects
  const cancelBtn = modal.querySelector('.btn-cancel');
  const deleteBtn = modal.querySelector('.btn-delete-confirm');
  
  cancelBtn.addEventListener('mouseenter', () => {
    cancelBtn.style.background = '#f9fafb';
    cancelBtn.style.borderColor = '#d1d5db';
  });
  cancelBtn.addEventListener('mouseleave', () => {
    cancelBtn.style.background = 'white';
    cancelBtn.style.borderColor = '#e5e7eb';
  });
  
  deleteBtn.addEventListener('mouseenter', () => {
    deleteBtn.style.background = '#dc2626';
  });
  deleteBtn.addEventListener('mouseleave', () => {
    deleteBtn.style.background = '#ef4444';
  });
  
  // Event listeners
  cancelBtn.addEventListener('click', () => {
    overlay.remove();
  });
  
  deleteBtn.addEventListener('click', () => {
    overlay.remove();
    onConfirm();
  });
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

// ==================== USER PROFILE ====================

async function fetchUserProfile() {
  try {
    const profile = window.userProfile;
    return { 
      gradeLevel: profile.gradeLevel, 
      schoolYear: profile.schoolYear, 
      strand: profile.strand, 
      isJHS: profile.isJHS === true || profile.isJHS === 'true',
      isSHS: profile.isSHS === true || profile.isSHS === 'true'
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { gradeLevel: 'Grade 7', schoolYear: 'Not set', strand: '', isJHS: true, isSHS: false };
  }
}

function initializeGradeStructure(profile) {
  if (profile.isJHS) {
    appState.quarters = [
      { id: 1, name: 'First Quarter', gwa: null, marked: false, subjects: {} },
      { id: 2, name: 'Second Quarter', gwa: null, marked: false, subjects: {} },
      { id: 3, name: 'Third Quarter', gwa: null, marked: false, subjects: {} },
      { id: 4, name: 'Fourth Quarter', gwa: null, marked: false, subjects: {} }
    ];
    
    // Initialize subjects for each quarter
    appState.quarters.forEach(quarter => {
      JHS_SUBJECTS.forEach(subject => {
        // Special handling for MAPEH - it has 4 sub-areas
        if (subject === 'MAPEH') {
          quarter.subjects[subject] = {
            isMAPEH: true,
            subAreas: {
              'Music': {
                components: {
                  WW: { items: [], weight: COMPONENT_WEIGHTS[subject].WW },
                  PT: { items: [], weight: COMPONENT_WEIGHTS[subject].PT },
                  QA: { items: [], weight: COMPONENT_WEIGHTS[subject].QA }
                },
                initialGrade: null,
                transmutedGrade: null
              },
              'Arts': {
                components: {
                  WW: { items: [], weight: COMPONENT_WEIGHTS[subject].WW },
                  PT: { items: [], weight: COMPONENT_WEIGHTS[subject].PT },
                  QA: { items: [], weight: COMPONENT_WEIGHTS[subject].QA }
                },
                initialGrade: null,
                transmutedGrade: null
              },
              'Physical Education': {
                components: {
                  WW: { items: [], weight: COMPONENT_WEIGHTS[subject].WW },
                  PT: { items: [], weight: COMPONENT_WEIGHTS[subject].PT },
                  QA: { items: [], weight: COMPONENT_WEIGHTS[subject].QA }
                },
                initialGrade: null,
                transmutedGrade: null
              },
              'Health': {
                components: {
                  WW: { items: [], weight: COMPONENT_WEIGHTS[subject].WW },
                  PT: { items: [], weight: COMPONENT_WEIGHTS[subject].PT },
                  QA: { items: [], weight: COMPONENT_WEIGHTS[subject].QA }
                },
                initialGrade: null,
                transmutedGrade: null
              }
            },
            finalGrade: null // Average of 4 sub-areas
          };
        } else {
          quarter.subjects[subject] = {
            isMAPEH: false,
            components: {
              WW: { items: [], weight: COMPONENT_WEIGHTS[subject].WW },
              PT: { items: [], weight: COMPONENT_WEIGHTS[subject].PT },
              QA: { items: [], weight: COMPONENT_WEIGHTS[subject].QA }
            },
            initialGrade: null,
            transmutedGrade: null,
            finalGrade: null
          };
        }
      });
    });
  } else if (profile.isSHS) {
    appState.semesters = [
      {
        name: 'First Semester',
        quarters: [
          { id: 1, name: 'First Quarter', gwa: null, marked: false, subjects: {} },
          { id: 2, name: 'Second Quarter', gwa: null, marked: false, subjects: {} }
        ]
      },
      {
        name: 'Second Semester',
        quarters: [
          { id: 3, name: 'First Quarter', gwa: null, marked: false, subjects: {} },
          { id: 4, name: 'Second Quarter', gwa: null, marked: false, subjects: {} }
        ]
      }
    ];
  }
}

function renderGradeCards(profile) {
  const container = document.getElementById('quartersContainer');
  container.innerHTML = '';

  if (profile.isJHS) {
    appState.quarters.forEach(quarter => {
      const card = createQuarterCard(quarter);
      container.appendChild(card);
    });
  } else if (profile.isSHS) {
    appState.semesters.forEach(semester => {
      const wrapper = document.createElement('div');
      wrapper.className = 'semester-wrapper';
      
      const title = document.createElement('div');
      title.className = 'semester-title';
      title.textContent = semester.name;
      wrapper.appendChild(title);

      const quartersContainer = document.createElement('div');
      quartersContainer.className = 'semester-quarters';

      semester.quarters.forEach(quarter => {
        const card = createQuarterCard(quarter);
        quartersContainer.appendChild(card);
      });

      wrapper.appendChild(quartersContainer);
      container.appendChild(wrapper);
    });
  }
}

function createQuarterCard(quarter) {
  const card = document.createElement('div');
  card.className = 'quarter-card';
  card.id = `quarter-${quarter.id}`;
  
  const gwaValue = quarter.gwa ? quarter.gwa.toFixed(2) : '--';
  const statusText = quarter.marked ? 'Completed' : 'In Progress';
  const statusClass = quarter.marked ? 'badge-green' : 'badge-orange';
  
  card.innerHTML = `
    <div class="quarter-card-left">
      <div class="quarter-title">
        <span class="quarter-number">${quarter.name.split(' ')[0].toUpperCase()}</span>
        <span class="quarter-label">${quarter.name.split(' ')[1].toUpperCase()}</span>
      </div>
      <div class="quarter-info">
        <span class="${statusClass}">${statusText}</span>
      </div>
    </div>
    <div class="gwa-display">
      <div class="gwa-circle">
        <span class="gwa-value">${gwaValue}</span>
        <span class="gwa-label">GWA</span>
      </div>
      <p class="gwa-text">(not yet computed)</p>
    </div>
  `;

  card.addEventListener('click', () => showSubjectsView(quarter));
  return card;
}

// ==================== VIEW NAVIGATION ====================

function showView(viewName) {
  console.log('showView called with:', viewName);
  
  // Hide all views
  document.querySelectorAll('.view-container').forEach(view => {
    view.classList.remove('active');
  });
  
  // Show selected view
  const targetView = document.getElementById(`${viewName}View`);
  console.log('Target view element:', targetView);
  
  if (targetView) {
    targetView.classList.add('active');
    appState.currentView = viewName;
    console.log('View activated successfully');
  } else {
    console.error('View not found:', `${viewName}View`);
  }
  
  // Update breadcrumb
  updateBreadcrumb();
}

function showSubjectsView(quarter) {
  console.log('=== showSubjectsView called ===');
  console.log('Quarter:', quarter);
  
  appState.currentQuarter = quarter;
  document.getElementById('subjectsViewTitle').textContent = `${quarter.name} - Subjects`;
  
  const grid = document.getElementById('subjectsGrid');
  console.log('Grid element:', grid);
  grid.innerHTML = '';
  
  console.log('JHS_SUBJECTS:', JHS_SUBJECTS);
  
  JHS_SUBJECTS.forEach(subject => {
    const subjectData = quarter.subjects[subject];
    const grade = subjectData.finalGrade || null;
    const percentage = grade ? grade : 0;
    const hasComponents = subjectData.components && 
      (subjectData.components.WW.items.length > 0 || 
       subjectData.components.PT.items.length > 0 || 
       subjectData.components.QA.items.length > 0);
    
    // Determine color based on grade (DepEd grading scale)
    let progressColor = '#E5E7EB'; // Default gray for no grade
    if (grade !== null) {
      if (grade >= 90) {
        progressColor = '#10b981'; // Green - Outstanding
      } else if (grade >= 85) {
        progressColor = '#38CA79'; // Light green - Very Satisfactory
      } else if (grade >= 80) {
        progressColor = '#3b82f6'; // Blue - Satisfactory
      } else if (grade >= 75) {
        progressColor = '#f59e0b'; // Orange - Fairly Satisfactory
      } else {
        progressColor = '#ef4444'; // Red - Did Not Meet Expectations
      }
    }
    
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.setAttribute('data-subject', subject);
    console.log('Creating card for subject:', subject);
    card.innerHTML = `
      <div class="subject-card-header">
        <h3 class="subject-card-title">${subject}</h3>
        <div class="subject-card-status">
          ${hasComponents ? '<span class="status-badge completed">Has Components</span>' : '<span class="status-badge pending">No Components</span>'}
        </div>
      </div>
      <div class="subject-card-body">
        <div class="circular-progress-container">
          <svg class="circular-progress" width="120" height="120" viewBox="0 0 120 120">
            <circle class="progress-bg" cx="60" cy="60" r="52" 
                    stroke="#E5E7EB" stroke-width="8" fill="none"/>
            <circle class="progress-bar" cx="60" cy="60" r="52" 
                    stroke="${progressColor}" stroke-width="8" fill="none"
                    stroke-dasharray="${2 * Math.PI * 52}" 
                    stroke-dashoffset="${2 * Math.PI * 52 * (1 - percentage / 100)}"
                    transform="rotate(-90 60 60)"
                    stroke-linecap="round"/>
          </svg>
          <div class="progress-text">
            <span class="progress-value">${grade !== null ? grade.toFixed(2) : '--'}</span>
            <span class="progress-label">${grade !== null ? percentage.toFixed(0) + '%' : 'No grade'}</span>
          </div>
        </div>
        <button class="btn-visit-subject">Visit</button>
      </div>
    `;
    
    // Make the entire card clickable
    card.style.cursor = 'pointer';
    
    console.log('Adding click listener to card for:', subject);
    
    // Add click handler to the card
    card.addEventListener('click', (e) => {
      console.log('=== CARD CLICKED ===');
      console.log('Subject:', subject);
      console.log('Event:', e);
      console.log('Target:', e.target);
      showSubjectDetailView(subject);
    });
    
    // Make sure the Visit button also works and doesn't interfere
    const visitBtn = card.querySelector('.btn-visit-subject');
    if (visitBtn) {
      console.log('Adding click listener to visit button for:', subject);
      visitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('=== VISIT BUTTON CLICKED ===');
        console.log('Subject:', subject);
        showSubjectDetailView(subject);
      });
    }
    
    console.log('Appending card to grid');
    grid.appendChild(card);
  });
  
  console.log('Cards created, calling showView');
  showView('subjects');
}

function showSubjectDetailView(subjectName) {
  console.log('showSubjectDetailView called with:', subjectName);
  console.log('Current quarter:', appState.currentQuarter);
  
  appState.currentSubject = subjectName;
  const quarter = appState.currentQuarter;
  const subjectData = quarter.subjects[subjectName];
  
  console.log('Subject data:', subjectData);
  
  document.getElementById('subjectDetailTitle').textContent = 
    `${quarter.name} - ${subjectName}`;
  
  // Initialize circular progress displays
  updateGradeCircles(null, null);
  
  // Check if this is MAPEH
  if (subjectData.isMAPEH) {
    console.log('Rendering MAPEH view');
    // For MAPEH, show sub-area tabs
    appState.currentMAPEHArea = appState.currentMAPEHArea || 'Music';
    renderMAPEHView();
  } else {
    console.log('Rendering regular subject components');
    // For regular subjects, show components directly
    renderComponents();
  }
  
  console.log('Calling showView with subjectDetail');
  showView('subjectDetail');
}

function updateGradeCircles(initialGrade, transmutedGrade) {
  const initialDisplay = document.getElementById('initialGradeDisplay');
  const transmutedDisplay = document.getElementById('transmutedGradeDisplay');
  const initialCircle = document.getElementById('initialGradeCircle');
  const transmutedCircle = document.getElementById('transmutedGradeCircle');
  
  const circumference = 2 * Math.PI * 54; // radius = 54 for larger circles
  
  if (initialGrade !== null && initialGrade !== undefined) {
    initialDisplay.textContent = initialGrade.toFixed(2);
    const offset = circumference * (1 - initialGrade / 100);
    initialCircle.style.strokeDashoffset = offset;
    
    // Color based on grade
    if (initialGrade >= 90) {
      initialCircle.setAttribute('stroke', '#10b981');
    } else if (initialGrade >= 85) {
      initialCircle.setAttribute('stroke', '#38CA79');
    } else if (initialGrade >= 80) {
      initialCircle.setAttribute('stroke', '#3b82f6');
    } else if (initialGrade >= 75) {
      initialCircle.setAttribute('stroke', '#f59e0b');
    } else {
      initialCircle.setAttribute('stroke', '#ef4444');
    }
  } else {
    initialDisplay.textContent = '--';
    initialCircle.style.strokeDashoffset = circumference;
  }
  
  if (transmutedGrade !== null && transmutedGrade !== undefined) {
    transmutedDisplay.textContent = transmutedGrade;
    const offset = circumference * (1 - transmutedGrade / 100);
    transmutedCircle.style.strokeDashoffset = offset;
    
    // Color based on grade
    if (transmutedGrade >= 90) {
      transmutedCircle.setAttribute('stroke', '#10b981');
    } else if (transmutedGrade >= 85) {
      transmutedCircle.setAttribute('stroke', '#38CA79');
    } else if (transmutedGrade >= 80) {
      transmutedCircle.setAttribute('stroke', '#3b82f6');
    } else if (transmutedGrade >= 75) {
      transmutedCircle.setAttribute('stroke', '#f59e0b');
    } else {
      transmutedCircle.setAttribute('stroke', '#ef4444');
    }
  } else {
    transmutedDisplay.textContent = '--';
    transmutedCircle.style.strokeDashoffset = circumference;
  }
}

function showDashboardView() {
  appState.currentQuarter = null;
  appState.currentSubject = null;
  showView('dashboard');
}

function updateBreadcrumb() {
  const breadcrumb = document.getElementById('breadcrumbNav');
  breadcrumb.innerHTML = '';
  
  // Dashboard breadcrumb
  const dashItem = document.createElement('span');
  dashItem.className = 'breadcrumb-item';
  dashItem.textContent = 'Dashboard';
  dashItem.addEventListener('click', showDashboardView);
  breadcrumb.appendChild(dashItem);
  
  if (appState.currentView === 'dashboard') {
    dashItem.classList.add('active');
    return;
  }
  
  // Quarter/Subjects breadcrumb
  if (appState.currentQuarter) {
    const separator1 = document.createElement('span');
    separator1.className = 'breadcrumb-separator';
    separator1.textContent = '›';
    breadcrumb.appendChild(separator1);
    
    const quarterItem = document.createElement('span');
    quarterItem.className = 'breadcrumb-item';
    quarterItem.textContent = appState.currentQuarter.name;
    
    if (appState.currentView === 'subjects') {
      quarterItem.classList.add('active');
    } else {
      quarterItem.addEventListener('click', () => showSubjectsView(appState.currentQuarter));
    }
    breadcrumb.appendChild(quarterItem);
  }
  
  // Subject detail breadcrumb
  if (appState.currentSubject && appState.currentView === 'subjectDetail') {
    const separator2 = document.createElement('span');
    separator2.className = 'breadcrumb-separator';
    separator2.textContent = '›';
    breadcrumb.appendChild(separator2);
    
    const subjectItem = document.createElement('span');
    subjectItem.className = 'breadcrumb-item active';
    subjectItem.textContent = appState.currentSubject;
    breadcrumb.appendChild(subjectItem);
  }
}

// ==================== MAPEH HANDLING ====================

function renderMAPEHView() {
  const quarter = appState.currentQuarter;
  const subjectData = quarter.subjects['MAPEH'];
  const container = document.getElementById('componentsTableBody');
  
  // Clear and add MAPEH tabs
  const tableWrapper = document.querySelector('.components-table-wrapper');
  
  // Check if tabs already exist
  let tabsContainer = document.querySelector('.mapeh-tabs');
  if (!tabsContainer) {
    tabsContainer = document.createElement('div');
    tabsContainer.className = 'mapeh-tabs';
    tableWrapper.insertBefore(tabsContainer, document.getElementById('componentsTable'));
  }
  
  tabsContainer.innerHTML = '';
  
  // Create tabs for each MAPEH area
  ['Music', 'Arts', 'Physical Education', 'Health'].forEach(area => {
    const tab = document.createElement('button');
    tab.className = 'mapeh-tab' + (area === appState.currentMAPEHArea ? ' active' : '');
    const areaData = subjectData.subAreas[area];
    const grade = areaData.transmutedGrade || '--';
    tab.innerHTML = `
      <span class="tab-name">${area}</span>
      <span class="tab-grade">${grade !== '--' ? grade : '--'}</span>
    `;
    tab.addEventListener('click', () => {
      appState.currentMAPEHArea = area;
      renderMAPEHView();
    });
    tabsContainer.appendChild(tab);
  });
  
  // Render components for the current MAPEH area
  renderMAPEHAreaComponents();
}

function renderMAPEHAreaComponents() {
  const quarter = appState.currentQuarter;
  const subjectData = quarter.subjects['MAPEH'];
  const areaData = subjectData.subAreas[appState.currentMAPEHArea];
  const container = document.getElementById('componentsTableBody');
  
  container.innerHTML = '';
  
  // Only render the active component tab
  const componentType = activeComponentTab;
  const component = areaData.components[componentType];
  const componentName = COMPONENT_NAMES[componentType];
  
  // Component category header row
  const headerRow = document.createElement('tr');
  headerRow.className = 'component-category-header';
  headerRow.innerHTML = `
    <td colspan="6">
      <div class="component-header-content">
        <strong>${componentName} (${component.weight}%)</strong>
        <button class="btn-add-item" data-component="${componentType}">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1V13M1 7H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Add ${componentName} Item
        </button>
      </div>
    </td>
  `;
  container.appendChild(headerRow);
  
  // Render items for this component
  if (component.items.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.className = 'empty-component-row';
    emptyRow.innerHTML = `
      <td colspan="6" class="empty-message">No items added yet. Click "Add ${componentName} Item" to start.</td>
    `;
    container.appendChild(emptyRow);
  } else {
    component.items.forEach((item, index) => {
      const row = createItemRow(componentType, item, index, true);
      container.appendChild(row);
    });
    
    // Add subtotal row
    const subtotalRow = createSubtotalRow(componentType, component);
    container.appendChild(subtotalRow);
  }
  
  // Add event listeners for "Add Item" buttons
  document.querySelectorAll('.btn-add-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const componentType = e.currentTarget.dataset.component;
      addComponentItem(componentType, true);
    });
  });
  
  updateMAPEHCalculations();
}

// ==================== COMPONENT MANAGEMENT ====================

function renderComponents() {
  const quarter = appState.currentQuarter;
  const subjectName = appState.currentSubject;
  const subjectData = quarter.subjects[subjectName];
  const container = document.getElementById('componentsTableBody');
  
  // Remove MAPEH tabs if they exist
  const existingTabs = document.querySelector('.mapeh-tabs');
  if (existingTabs) {
    existingTabs.remove();
  }
  
  container.innerHTML = '';
  
  // Only render the active component tab
  const componentType = activeComponentTab;
  const component = subjectData.components[componentType];
  const componentName = COMPONENT_NAMES[componentType];
  
  // Component category header row
  const headerRow = document.createElement('tr');
  headerRow.className = 'component-category-header';
  headerRow.innerHTML = `
    <td colspan="6">
      <div class="component-header-content">
        <strong>${componentName} (${component.weight}%)</strong>
        <button class="btn-add-item" data-component="${componentType}">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1V13M1 7H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Add ${componentName} Item
        </button>
      </div>
    </td>
  `;
  container.appendChild(headerRow);
  
  // Render items for this component
  if (component.items.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.className = 'empty-component-row';
    emptyRow.innerHTML = `
      <td colspan="6" class="empty-message">No items added yet. Click "Add ${componentName} Item" to start.</td>
    `;
    container.appendChild(emptyRow);
  } else {
    component.items.forEach((item, index) => {
      const row = createItemRow(componentType, item, index);
      container.appendChild(row);
    });
    
    // Add subtotal row
    const subtotalRow = createSubtotalRow(componentType, component);
    container.appendChild(subtotalRow);
  }
  
  // Add event listeners for "Add Item" buttons
  document.querySelectorAll('.btn-add-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const componentType = e.currentTarget.dataset.component;
      addComponentItem(componentType);
    });
  });
  
  updateAllCalculations();
}

function createItemRow(componentType, item, index, isMAPEH = false) {
  const row = document.createElement('tr');
  row.className = 'component-item-row';
  row.innerHTML = `
    <td>
      <input type="text" 
             class="component-input item-name-input" 
             value="${item.name || COMPONENT_NAMES[componentType] + ' ' + (index + 1)}" 
             data-component="${componentType}"
             data-index="${index}" 
             data-field="name"
             data-mapeh="${isMAPEH}"
             placeholder="Item name">
    </td>
    <td>
      <input type="number" 
             class="component-input score-input" 
             value="${item.score !== '' ? item.score : ''}" 
             data-component="${componentType}"
             data-index="${index}" 
             data-field="score"
             data-mapeh="${isMAPEH}"
             placeholder="0"
             min="0"
             step="0.01">
    </td>
    <td>
      <input type="number" 
             class="component-input total-input" 
             value="${item.total !== '' ? item.total : ''}" 
             data-component="${componentType}"
             data-index="${index}" 
             data-field="total"
             data-mapeh="${isMAPEH}"
             placeholder="0"
             min="0"
             step="0.01">
    </td>
    <td class="percentage-display">${item.percentageScore !== null ? item.percentageScore.toFixed(2) + '%' : '-'}</td>
    <td class="ps-display">${item.percentageScore !== null ? item.percentageScore.toFixed(2) : '-'}</td>
    <td class="actions-cell">
      <button class="btn-delete-item" data-component="${componentType}" data-index="${index}" data-mapeh="${isMAPEH}" title="Delete item">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4H14M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33333 14 3.33333 13.3333V4M5.33333 4V2.66667C5.33333 2 6 1.33333 6.66667 1.33333H9.33333C10 1.33333 10.6667 2 10.6667 2.66667V4" 
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </td>
  `;
  
  // Add event listeners
  row.querySelectorAll('.component-input').forEach(input => {
    input.addEventListener('blur', handleItemInput);
  });
  
  row.querySelector('.btn-delete-item').addEventListener('click', (e) => {
    const componentType = e.currentTarget.dataset.component;
    const index = parseInt(e.currentTarget.dataset.index);
    const isMAPEH = e.currentTarget.dataset.mapeh === 'true';
    deleteComponentItem(componentType, index, isMAPEH);
  });
  
  return row;
}

function createSubtotalRow(componentType, component) {
  const totalPS = component.items.reduce((sum, item) => {
    return sum + (item.percentageScore || 0);
  }, 0);
  
  const averagePS = component.items.length > 0 ? totalPS / component.items.length : 0;
  const weightedScore = (averagePS * component.weight) / 100;
  
  const row = document.createElement('tr');
  row.className = 'component-subtotal-row';
  row.innerHTML = `
    <td colspan="3"><strong>Average ${COMPONENT_NAMES[componentType]}</strong></td>
    <td class="subtotal-value"><strong>${averagePS.toFixed(2)}%</strong></td>
    <td class="subtotal-value"><strong>${averagePS.toFixed(2)}</strong></td>
    <td class="weighted-value" data-component="${componentType}"><strong>WS: ${weightedScore.toFixed(2)}</strong></td>
  `;
  
  return row;
}

function handleItemInput(event) {
  const componentType = event.target.dataset.component;
  const index = parseInt(event.target.dataset.index);
  const field = event.target.dataset.field;
  const value = event.target.value;
  const isMAPEH = event.target.dataset.mapeh === 'true';
  
  const quarter = appState.currentQuarter;
  const subjectData = quarter.subjects[appState.currentSubject];
  
  let item;
  if (isMAPEH) {
    item = subjectData.subAreas[appState.currentMAPEHArea].components[componentType].items[index];
  } else {
    item = subjectData.components[componentType].items[index];
  }
  
  if (field === 'name') {
    item[field] = value;
  } else {
    const numValue = value !== '' ? parseFloat(value) : '';
    
    // Validation: Score cannot exceed Highest Possible Score
    if (field === 'score' && numValue !== '' && item.total !== '' && numValue > item.total) {
      event.target.value = item.total;
      showValidationError(event.target, 'Score cannot exceed Highest Possible Score');
      return;
    }
    
    // Validation: If HPS is reduced below score, adjust score
    if (field === 'total' && numValue !== '' && item.score !== '' && item.score > numValue) {
      item.score = numValue;
      const row = event.target.closest('tr');
      const scoreInput = row.querySelector('.score-input');
      scoreInput.value = numValue;
      showValidationError(event.target, 'Score adjusted to match new Highest Possible Score');
    }
    
    item[field] = numValue;
  }
  
  // Calculate percentage score for this item
  if (item.score !== '' && item.total !== '' && item.total > 0) {
    item.percentageScore = (item.score / item.total) * 100;
  } else {
    item.percentageScore = null;
  }
  
  // Update the display
  const row = event.target.closest('tr');
  const percentageCell = row.querySelector('.percentage-display');
  const psCell = row.querySelector('.ps-display');
  
  if (item.percentageScore !== null) {
    percentageCell.textContent = item.percentageScore.toFixed(2) + '%';
    psCell.textContent = item.percentageScore.toFixed(2);
  } else {
    percentageCell.textContent = '-';
    psCell.textContent = '-';
  }
  
  // Update calculations
  if (isMAPEH) {
    updateMAPEHCalculations();
  } else {
    updateAllCalculations();
  }
}

function addComponentItem(componentType, isMAPEH = false) {
  const quarter = appState.currentQuarter;
  const subjectData = quarter.subjects[appState.currentSubject];
  
  let component;
  if (isMAPEH) {
    component = subjectData.subAreas[appState.currentMAPEHArea].components[componentType];
  } else {
    component = subjectData.components[componentType];
  }
  
  const itemNumber = component.items.length + 1;
  component.items.push({
    name: `${COMPONENT_NAMES[componentType]} ${itemNumber}`,
    score: '',
    total: '',
    percentageScore: null
  });
  
  if (isMAPEH) {
    renderMAPEHAreaComponents();
  } else {
    renderComponents();
  }
}

function deleteComponentItem(componentType, index, isMAPEH = false) {
  const quarter = appState.currentQuarter;
  const subjectData = quarter.subjects[appState.currentSubject];
  
  let component;
  if (isMAPEH) {
    component = subjectData.subAreas[appState.currentMAPEHArea].components[componentType];
  } else {
    component = subjectData.components[componentType];
  }
  
  const itemName = component.items[index].name || `Item ${index + 1}`;
  
  // Show confirmation modal
  showDeleteConfirmation(itemName, () => {
    component.items.splice(index, 1);
    
    if (isMAPEH) {
      renderMAPEHAreaComponents();
    } else {
      renderComponents();
    }
  });
}

function updateAllCalculations() {
  const quarter = appState.currentQuarter;
  const subjectData = quarter.subjects[appState.currentSubject];
  
  let totalWeightedScore = 0;
  let hasAllComponents = true;
  
  ['WW', 'PT', 'QA'].forEach(componentType => {
    const component = subjectData.components[componentType];
    
    if (component.items.length === 0) {
      hasAllComponents = false;
      return;
    }
    
    // Calculate average PS for this component
    const totalPS = component.items.reduce((sum, item) => {
      if (item.percentageScore === null) {
        hasAllComponents = false;
        return sum;
      }
      return sum + item.percentageScore;
    }, 0);
    
    const averagePS = component.items.length > 0 ? totalPS / component.items.length : 0;
    const weightedScore = (averagePS * component.weight) / 100;
    
    totalWeightedScore += weightedScore;
    
    // Update subtotal display
    const subtotalRow = document.querySelector(`tr.component-subtotal-row .weighted-value[data-component="${componentType}"]`);
    if (subtotalRow) {
      subtotalRow.innerHTML = `<strong>WS: ${weightedScore.toFixed(2)}</strong>`;
    }
  });
  
  // Auto-compute initial and transmuted grades if all components have data
  if (hasAllComponents && totalWeightedScore > 0) {
    subjectData.initialGrade = totalWeightedScore;
    subjectData.transmutedGrade = transmuteGrade(totalWeightedScore);
    subjectData.finalGrade = subjectData.transmutedGrade;
    
    // Update circular progress displays
    updateGradeCircles(subjectData.initialGrade, subjectData.transmutedGrade);
    
    // Update quarter GWA
    computeQuarterGWA();
  } else {
    subjectData.initialGrade = null;
    subjectData.transmutedGrade = null;
    subjectData.finalGrade = null;
    updateGradeCircles(null, null);
  }
}

function updateMAPEHCalculations() {
  const quarter = appState.currentQuarter;
  const subjectData = quarter.subjects['MAPEH'];
  const areaData = subjectData.subAreas[appState.currentMAPEHArea];
  
  let totalWeightedScore = 0;
  let hasAllComponents = true;
  
  ['WW', 'PT', 'QA'].forEach(componentType => {
    const component = areaData.components[componentType];
    
    if (component.items.length === 0) {
      hasAllComponents = false;
      return;
    }
    
    // Calculate average PS for this component
    const totalPS = component.items.reduce((sum, item) => {
      if (item.percentageScore === null) {
        hasAllComponents = false;
        return sum;
      }
      return sum + item.percentageScore;
    }, 0);
    
    const averagePS = component.items.length > 0 ? totalPS / component.items.length : 0;
    const weightedScore = (averagePS * component.weight) / 100;
    
    totalWeightedScore += weightedScore;
    
    // Update subtotal display
    const subtotalRow = document.querySelector(`tr.component-subtotal-row .weighted-value[data-component="${componentType}"]`);
    if (subtotalRow) {
      subtotalRow.innerHTML = `<strong>WS: ${weightedScore.toFixed(2)}</strong>`;
    }
  });
  
  // Compute initial and transmuted grade for this area
  if (hasAllComponents && totalWeightedScore > 0) {
    areaData.initialGrade = totalWeightedScore;
    areaData.transmutedGrade = transmuteGrade(totalWeightedScore);
  } else {
    areaData.initialGrade = null;
    areaData.transmutedGrade = null;
  }
  
  // Update area header
  const areaHeader = document.querySelector('.mapeh-area-header');
  if (areaHeader && areaData.initialGrade !== null) {
    areaHeader.innerHTML = `
      <td colspan="6">
        <div class="mapeh-area-title">
          <strong>${appState.currentMAPEHArea}</strong>
          <span class="grade-breakdown">Initial Grade: ${areaData.initialGrade.toFixed(2)} → Transmuted: ${areaData.transmutedGrade}</span>
        </div>
      </td>
    `;
  }
  
  // Update tab display
  const activeTab = document.querySelector('.mapeh-tab.active .tab-grade');
  if (activeTab && areaData.transmutedGrade !== null) {
    activeTab.textContent = areaData.transmutedGrade;
  }
  
  // Calculate overall MAPEH grade (average of 4 areas' transmuted grades)
  const areas = ['Music', 'Arts', 'Physical Education', 'Health'];
  const transmutedGrades = areas.map(area => subjectData.subAreas[area].transmutedGrade).filter(g => g !== null);
  
  if (transmutedGrades.length === 4) {
    const averageGrade = transmutedGrades.reduce((sum, g) => sum + g, 0) / 4;
    subjectData.finalGrade = Math.round(averageGrade); // Round to whole number
    
    // Show the average of all 4 areas in the circles
    const avgInitial = areas.map(area => subjectData.subAreas[area].initialGrade).filter(g => g !== null);
    const avgInitialGrade = avgInitial.reduce((sum, g) => sum + g, 0) / avgInitial.length;
    
    updateGradeCircles(avgInitialGrade, subjectData.finalGrade);
    
    // Update quarter GWA
    computeQuarterGWA();
  } else {
    subjectData.finalGrade = null;
    updateGradeCircles(null, null);
  }
}

function computeQuarterGWA() {
  const quarter = appState.currentQuarter;
  const grades = [];
  
  JHS_SUBJECTS.forEach(subject => {
    const subjectData = quarter.subjects[subject];
    if (subjectData.finalGrade) {
      grades.push(subjectData.finalGrade);
    }
  });
  
  if (grades.length > 0) {
    quarter.gwa = grades.reduce((sum, g) => sum + g, 0) / grades.length;
  }
  
  updateOverallGwa({ isJHS: true, isSHS: false });
}

function updateOverallGwa(profile) {
  const allQuarters = profile.isSHS
    ? appState.semesters.flatMap(s => s.quarters)
    : appState.quarters;

  const gwaValues = allQuarters.filter(q => q.gwa).map(q => q.gwa);
  
  if (gwaValues.length) {
    appState.overallGwa = (gwaValues.reduce((a,b)=>a+b,0) / gwaValues.length).toFixed(2);
  } else {
    appState.overallGwa = 0;
  }

  document.getElementById('overallGwaValue').textContent = gwaValues.length ? appState.overallGwa : '--';
  document.getElementById('overallRemark').textContent =
    appState.overallGwa >= 90 ? 'Outstanding!' :
    appState.overallGwa >= 85 ? 'Great job!' :
    appState.overallGwa >= 80 ? 'You did great' :
    appState.overallGwa >= 75 ? 'Keep it up!' :
    'You did great';
  
  // Update quarter cards if on dashboard
  if (appState.currentView === 'dashboard') {
    renderGradeCards(profile);
  }
}

function setupProfileDropdown() {
  const toggle = document.getElementById('profileDropdownToggle');
  const dropdown = document.getElementById('profileDropdown');
  toggle.addEventListener('click', e => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
  });
  document.addEventListener('click', e => {
    if (!toggle.contains(e.target) && !dropdown.contains(e.target)) dropdown.style.display = 'none';
  });
}
function setCurrentDate() {
  document.getElementById('currentDate').textContent =
    new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

document.addEventListener('DOMContentLoaded', async () => {
  setCurrentDate();
  const profile = await fetchUserProfile();
  initializeGradeStructure(profile);
  renderGradeCards(profile);
  updateOverallGwa(profile);
  setupProfileDropdown();
  
  // Navigation event listeners
  document.getElementById('backToQuarters').addEventListener('click', showDashboardView);
  document.getElementById('backToSubjects').addEventListener('click', () => {
    showSubjectsView(appState.currentQuarter);
  });
  
  // Component tab switching
  setupComponentTabs();
});

// Component tabs functionality
let activeComponentTab = 'WW'; // Default to Written Works

function setupComponentTabs() {
  document.addEventListener('click', (e) => {
    const tab = e.target.closest('.component-tab');
    if (tab) {
      const component = tab.dataset.component;
      switchComponentTab(component);
    }
  });
}

function switchComponentTab(componentType) {
  activeComponentTab = componentType;
  
  // Update tab active states
  document.querySelectorAll('.component-tab').forEach(tab => {
    if (tab.dataset.component === componentType) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  // Re-render components - check if it's MAPEH or regular subject
  if (appState.currentSubject === 'MAPEH') {
    renderMAPEHAreaComponents();
  } else {
    renderComponents();
  }
}