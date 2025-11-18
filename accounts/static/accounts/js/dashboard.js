// Application State
const appState = {
  currentView: 'dashboard',
  currentQuarter: null,
  currentSemester: null,
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

// Subjects are DIFFERENT per quarter within a semester
const SHS_SUBJECTS = {
  STEM: {
    "Grade 11": {
      "First Semester": {
        "Quarter 1": [
          "Oral Communication in Context",
          "Komunikasyon at Pananaliksik sa Wika at Kulturang Pilipino",
          "General Mathematics",
          "Earth and Life Science",
          "Introduction to Philosophy of the Human Person",
          "Physical Education & Health 1",
          "Pre-Calculus",
          "General Biology 1"
        ],
        "Quarter 2": [
          "Reading and Writing Skills",
          "Pagbasa at Pagsusuri ng Iba't Ibang Teksto Tungo sa Pananaliksik",
          "Statistics and Probability",
          "Physical Science",
          "Personal Development",
          "Physical Education & Health 2",
          "English for Academic and Professional Purposes",
          "General Chemistry 1"
        ]
      },
      "Second Semester": {
        "Quarter 1": [
          "21st Century Literature from the Philippines and the World",
          "Understanding Culture, Society, and Politics",
          "Practical Research 1 (Qualitative)",
          "Practical Research 2 (Quantitative)",
          "Empowerment Technologies",
          "Basic Calculus",
          "General Biology 2",
          "General Physics 1"
        ],
        "Quarter 2": [
          "Contemporary Philippine Arts from the Regions",
          "Media and Information Literacy",
          "Filipino sa Piling Larangan",
          "Buffer Subject / Elective",
          "General Chemistry 2"
        ]
      }
    },
    "Grade 12": {
      "First Semester": {
        "Quarter 1": [
          "Entrepreneurship",
          "Physical Education & Health 3",
          "General Physics 2",
          "Disaster Readiness and Risk Reduction"
        ],
        "Quarter 2": [
          "Inquiries, Investigations, and Immersion",
          "Physical Education & Health 3 (Cont.)"
        ]
      },
      "Second Semester": {
        "Quarter 1": [
          "Physical Education & Health 4",
          "Work Immersion / Research Project (Part 1)"
        ],
        "Quarter 2": [
          "Work Immersion / Research Project (Part 2)"
        ]
      }
    }
  },
  ABM: {
    "Grade 11": {
      "First Semester": {
        "Quarter 1": [
          "Oral Communication in Context",
          "Komunikasyon at Pananaliksik sa Wika at Kulturang Pilipino",
          "General Mathematics",
          "Earth and Life Science",
          "Introduction to Philosophy of the Human Person",
          "Physical Education & Health 1",
          "English for Academic and Professional Purposes",
          "Fundamentals of Accountancy, Business & Mgt 1"
        ],
        "Quarter 2": [
          "Reading and Writing Skills",
          "Pagbasa at Pagsusuri ng Iba't Ibang Teksto Tungo sa Pananaliksik",
          "Statistics and Probability",
          "Physical Science",
          "Personal Development",
          "Physical Education & Health 2",
          "Practical Research 1 (Qualitative)",
          "Business Mathematics"
        ]
      },
      "Second Semester": {
        "Quarter 1": [
          "21st Century Literature from the Philippines and the World",
          "Understanding Culture, Society, and Politics",
          "Media and Information Literacy",
          "Practical Research 2 (Quantitative)",
          "Empowerment Technologies",
          "Organization and Management",
          "Principles of Marketing",
          "Applied Economics"
        ],
        "Quarter 2": [
          "Contemporary Philippine Arts from the Regions",
          "Filipino sa Piling Larangan",
          "Buffer Subject / Elective",
          "Buffer Subject / Elective",
          "Fundamentals of Accountancy, Business & Mgt 1 (Cont.)"
        ]
      }
    },
    "Grade 12": {
      "First Semester": {
        "Quarter 1": [
          "Entrepreneurship",
          "Physical Education & Health 3",
          "Fundamentals of Accountancy, Business & Mgt 2",
          "Business Finance"
        ],
        "Quarter 2": [
          "Inquiries, Investigations, and Immersion",
          "Physical Education & Health 3 (Cont.)",
          "Business Finance (Cont.)",
          "Business Ethics and Social Responsibility"
        ]
      },
      "Second Semester": {
        "Quarter 1": [
          "Physical Education & Health 4",
          "Work Immersion / Business Enterprise Simulation (Part 1)"
        ],
        "Quarter 2": [
          "Physical Education & Health 4 (Cont.)",
          "Work Immersion / Business Enterprise Simulation (Part 2)"
        ]
      }
    }
  },
  HUMSS: {
    "Grade 11": {
      "First Semester": {
        "Quarter 1": [
          "Oral Communication in Context",
          "Komunikasyon at Pananaliksik sa Wika at Kulturang Pilipino",
          "General Mathematics",
          "Earth and Life Science",
          "Introduction to Philosophy of the Human Person",
          "Physical Education & Health 1",
          "English for Academic and Professional Purposes",
          "Philippine Politics and Governance"
        ],
        "Quarter 2": [
          "Reading and Writing Skills",
          "Pagbasa at Pagsusuri ng Iba't Ibang Teksto Tungo sa Pananaliksik",
          "Statistics and Probability",
          "Physical Science",
          "Personal Development",
          "Physical Education & Health 2",
          "Practical Research 1 (Qualitative)",
          "Disciplines and Ideas in the Social Sciences"
        ]
      },
      "Second Semester": {
        "Quarter 1": [
          "21st Century Literature from the Philippines and the World",
          "Understanding Culture, Society, and Politics",
          "Media and Information Literacy",
          "Practical Research 2 (Quantitative)",
          "Empowerment Technologies",
          "Disciplines and Ideas in the Applied Social Sciences",
          "Introduction to World Religions and Belief Systems",
          "Creative Writing"
        ],
        "Quarter 2": [
          "Contemporary Philippine Arts from the Regions",
          "Filipino sa Piling Larangan",
          "Buffer Subject / Elective",
          "Buffer Subject / Elective",
          "Introduction to World Religions and Belief Systems (Cont.)"
        ]
      }
    },
    "Grade 12": {
      "First Semester": {
        "Quarter 1": [
          "Entrepreneurship",
          "Physical Education & Health 3",
          "Community Engagement, Solidarity, and Citizenship",
          "Creative Non-Fiction"
        ],
        "Quarter 2": [
          "Inquiries, Investigations, and Immersion",
          "Physical Education & Health 3 (Cont.)",
          "Community Engagement, Solidarity, and Citizenship (Cont.)",
          "Trends, Networks, and Critical Thinking in the 21st Century Culture"
        ]
      },
      "Second Semester": {
        "Quarter 1": [
          "Physical Education & Health 4",
          "Work Immersion / Research (Part 1)"
        ],
        "Quarter 2": [
          "Physical Education & Health 4 (Cont.)",
          "Work Immersion / Research (Part 2)"
        ]
      }
    }
  },
  GAS: {
    "Grade 11": {
      "First Semester": {
        "Quarter 1": [
          "Oral Communication in Context",
          "Komunikasyon at Pananaliksik sa Wika at Kulturang Pilipino",
          "General Mathematics",
          "Earth and Life Science",
          "Introduction to Philosophy of the Human Person",
          "Physical Education & Health 1",
          "English for Academic and Professional Purposes",
          "Humanities 1"
        ],
        "Quarter 2": [
          "Reading and Writing Skills",
          "Pagbasa at Pagsusuri ng Iba't Ibang Teksto Tungo sa Pananaliksik",
          "Statistics and Probability",
          "Physical Science",
          "Personal Development",
          "Physical Education & Health 2",
          "Practical Research 1 (Qualitative)",
          "Social Science 1"
        ]
      },
      "Second Semester": {
        "Quarter 1": [
          "21st Century Literature from the Philippines and the World",
          "Understanding Culture, Society, and Politics",
          "Media and Information Literacy",
          "Practical Research 2 (Quantitative)",
          "Empowerment Technologies",
          "Organization and Management",
          "Disaster Readiness and Risk Reduction",
          "Elective 1"
        ],
        "Quarter 2": [
          "Contemporary Philippine Arts from the Regions",
          "Filipino sa Piling Larangan",
          "Buffer Subject / Elective",
          "Buffer Subject / Elective",
          "Elective 1 (Cont.)"
        ]
      }
    },
    "Grade 12": {
      "First Semester": {
        "Quarter 1": [
          "Entrepreneurship",
          "Physical Education & Health 3",
          "Humanities 2",
          "Applied Economics"
        ],
        "Quarter 2": [
          "Inquiries, Investigations, and Immersion",
          "Physical Education & Health 3 (Cont.)",
          "Humanities 2 (Cont.)",
          "Applied Economics (Cont.)"
        ]
      },
      "Second Semester": {
        "Quarter 1": [
          "Physical Education & Health 4",
          "Elective 2 (Part 1)",
          "Work Immersion / Research / Career Advocacy (Part 1)"
        ],
        "Quarter 2": [
          "Physical Education & Health 4 (Cont.)",
          "Elective 2 (Part 2)",
          "Work Immersion / Research / Career Advocacy (Part 2)"
        ]
      }
    }
  }
};

// SHS Component Weights
const SHS_COMPONENT_WEIGHTS = {
  // Core & Specialized
  default: { WW: 25, PT: 50, QA: 25 },
  // Work Immersion/Research/Business Enterprise/Exhibit/Performance
  immersion: { WW: 20, PT: 60, QA: 20 }
};

// Helper to get weights by subject
function getShsComponentWeights(subject) {
  const immersionKeywords = [
    "Work Immersion", "Research", "Business Enterprise", "Simulation", "Exhibit", "Performance", "Immersion", "Research Project"
  ];
  if (immersionKeywords.some(k => subject.toLowerCase().includes(k.toLowerCase()))) {
    return SHS_COMPONENT_WEIGHTS.immersion;
  }
  return SHS_COMPONENT_WEIGHTS.default;
}
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

async function initializeGradeStructure(profile) {
  // Load real quarters from database
  const quartersData = await loadQuarters();
  
  if (profile.isJHS) {
    // Use quarters from database only
    if (quartersData && quartersData.length > 0) {
      appState.quarters = quartersData.map(q => ({
        id: q.id,
        name: q.name,
        gwa: null,
        // reflect backend completion status
        marked: q.is_completed === true,
        is_completed: q.is_completed === true,
        subjects: {}
      }));
    } else {
      // No quarters - show empty state
      appState.quarters = [];
    }
    
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
    // For SHS, load quarters from database and organize by semester
    console.log('SHS: Loading quarters from database:', quartersData);
    
    if (quartersData && quartersData.length > 0) {
      // Group quarters by semester
      const firstSemesterQuarters = quartersData.filter(q => q.semester === 'First Semester');
      const secondSemesterQuarters = quartersData.filter(q => q.semester === 'Second Semester');
      
      console.log('First Semester quarters:', firstSemesterQuarters);
      console.log('Second Semester quarters:', secondSemesterQuarters);
      
      appState.semesters = [
        {
          name: 'First Semester',
          quarters: firstSemesterQuarters.map(q => ({
            id: q.id,
            name: q.name,
            semester: q.semester,
            gwa: null,
            marked: q.is_completed === true,
            is_completed: q.is_completed === true,
            subjects: {}
          })),
          finalGrade: null
        },
        {
          name: 'Second Semester',
          quarters: secondSemesterQuarters.map(q => ({
            id: q.id,
            name: q.name,
            semester: q.semester,
            gwa: null,
            marked: q.is_completed === true,
            is_completed: q.is_completed === true,
            subjects: {}
          })),
          finalGrade: null
        }
      ];
      
      console.log('Initialized SHS semesters:', appState.semesters);
    } else {
      // No quarters - empty state
      console.log('No quarters found for SHS user');
      appState.semesters = [
        { name: 'First Semester', quarters: [], finalGrade: null },
        { name: 'Second Semester', quarters: [], finalGrade: null }
      ];
    }
  }
}

// ==================== COMPLETE FUNCTION: renderGradeCards ====================
function renderGradeCards(profile) {
  const container = document.getElementById('quartersContainer');
  container.innerHTML = '';
  container.className = 'quarters-grid-compact'; // Reset classes

  if (profile.isJHS) {
    // JHS: Show 4 quarters in 2x2 grid
    container.classList.add('jhs-layout');
    
    if (appState.quarters.length === 0) {
      container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #666;"><h3 style="margin-bottom: 12px; color: #333;">No Quarters Yet</h3><p style="margin-bottom: 20px;">Click "Add Quarter" to create your first quarter and start tracking your grades!</p></div>';
    } else {
      appState.quarters.forEach(quarter => {
        const card = createQuarterCard(quarter);
        container.appendChild(card);
      });
    }
  } else if (profile.isSHS) {
    // SHS: Show two semester columns side by side
    container.classList.add('shs-layout');
    
    console.log('Rendering SHS semesters:', appState.semesters);
    
    if (!appState.semesters || appState.semesters.length === 0) {
      container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #666;"><h3 style="margin-bottom: 12px; color: #333;">No Semesters Yet</h3><p>Please register or reload the page.</p></div>';
      return;
    }
    
    appState.semesters.forEach((semester, semIndex) => {
      console.log(`Rendering ${semester.name} with ${semester.quarters.length} quarters`);
      
      // Create semester wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'semester-wrapper';
      
      // Semester title
      const title = document.createElement('div');
      title.className = 'semester-title';
      title.textContent = semester.name.toUpperCase();
      wrapper.appendChild(title);

      // Quarters container for this semester - VERTICAL
      const quartersContainer = document.createElement('div');
      quartersContainer.className = 'semester-quarters';

      if (semester.quarters.length === 0) {
        // Show empty state for this semester
        const emptyState = document.createElement('div');
        emptyState.style.cssText = 'text-align: center; padding: 40px 20px; color: #999; font-size: 14px;';
        emptyState.textContent = 'No quarters yet';
        quartersContainer.appendChild(emptyState);
      } else {
        semester.quarters.forEach(quarter => {
          console.log('Creating card for quarter:', quarter);
          const card = createQuarterCard(quarter, semester);
          quartersContainer.appendChild(card);
        });
      }

      wrapper.appendChild(quartersContainer);
      container.appendChild(wrapper);
    });
  }
}

// Update quarter card with new GWA
function updateQuarterCard(quarter) {
  const card = document.getElementById(`quarter-${quarter.id}`);
  if (!card) return;
  
  const gwaValue = quarter.gwa ? quarter.gwa.toFixed(1) : '--';
  
  // Update GWA display
  const gwaValueElement = card.querySelector('.gwa-value-mini');
  if (gwaValueElement) {
    gwaValueElement.textContent = gwaValue;
  }
  
  const detailValue = card.querySelector('.detail-value');
  if (detailValue) {
    detailValue.textContent = gwaValue === '--' ? 'Not computed' : gwaValue;
  }
  
  // Update progress ring
  const progressCircle = card.querySelector('.gwa-progress-mini');
  if (progressCircle && quarter.gwa) {
    const circumference = 2 * Math.PI * 27;
    const progress = (quarter.gwa / 100) * circumference;
    const dashOffset = circumference - progress;
    progressCircle.style.strokeDashoffset = dashOffset;
    
    // Update color based on grade
    let color = '#E5E7EB';
    if (quarter.gwa >= 90) color = '#10b981';
    else if (quarter.gwa >= 85) color = '#38CA79';
    else if (quarter.gwa >= 80) color = '#3b82f6';
    else if (quarter.gwa >= 75) color = '#f59e0b';
    else color = '#ef4444';
    progressCircle.style.stroke = color;
  }
}

function createQuarterCard(quarter, semester = null) {
  const card = document.createElement('div');
  card.className = 'quarter-card-compact';
  card.id = `quarter-${quarter.id}`;
  
  const gwaValue = quarter.gwa ? quarter.gwa.toFixed(1) : '--';
  const statusText = quarter.marked ? 'Completed' : 'In Progress';
  const statusClass = quarter.marked ? 'status-completed' : 'status-progress';
  
  console.log(`Creating quarter card - ID: ${quarter.id}, Name: ${quarter.name}, GWA: ${gwaValue}`);
  
  // Calculate progress for mini ring
  const circumference = 2 * Math.PI * 27; // radius = 27 for 60px circle
  const progress = quarter.gwa ? (quarter.gwa / 100) * circumference : 0;
  const dashOffset = circumference - progress;
  
  // We'll fetch actual subjects per quarter and update after render
  const initialSubjectCountText = '-- subjects';
  
  card.innerHTML = `
    <div class="quarter-header-compact">
      <div class="quarter-title-section">
        <h4 class="quarter-name">
          <span class="quarter-number">${quarter.name.split(' ')[0]}</span>
          ${quarter.name.split(' ')[1]}
        </h4>
        <span class="quarter-status-badge ${statusClass}">${statusText}</span>
      </div>
    </div>
    
    <div class="quarter-gwa-mini">
      <div class="gwa-ring-mini">
        <svg viewBox="0 0 60 60">
          <circle class="gwa-bg-mini" cx="30" cy="30" r="27"/>
          <circle class="gwa-progress-mini" cx="30" cy="30" r="27"
                  stroke-dasharray="${circumference}"
                  stroke-dashoffset="${dashOffset}"/>
        </svg>
        <div class="gwa-value-mini">${gwaValue}</div>
      </div>
      <div class="quarter-details">
        <div class="detail-label">Quarter GWA</div>
        <div class="detail-value">${gwaValue === '--' ? 'Not computed' : gwaValue}</div>
      </div>
    </div>
    
    <div class="quarter-subjects-preview">
      <span class="subject-count">${initialSubjectCountText}</span>
      <div class="subject-dots"></div>
    </div>
  `;

  card.addEventListener('click', () => {
    if (semester) {
      showShsSubjectsView(semester, quarter);
    } else {
      showSubjectsView(quarter);
    }
  });

  // After rendering, load the real subject count for this quarter
  fetchAndSetQuarterSubjectCount(quarter, card);
  return card;
}

// Update subject count and dots for a quarter card using backend data
async function fetchAndSetQuarterSubjectCount(quarter, cardEl) {
  try {
    const subjects = await loadSubjects(quarter.id);
    const count = Array.isArray(subjects) ? subjects.length : 0;
    const countEl = cardEl.querySelector('.subject-count');
    if (countEl) countEl.textContent = `${count} ${count === 1 ? 'subject' : 'subjects'}`;
    const dotsEl = cardEl.querySelector('.subject-dots');
    if (dotsEl) {
      const dotsCount = Math.min(Math.max(count, 0), 5);
      dotsEl.innerHTML = dotsCount > 0
        ? Array.from({ length: dotsCount }, () => '<span class="subject-dot"></span>').join('')
        : '';
    }
  } catch (e) {
    console.error('Failed to set quarter subject count', e);
  }
}

// ==================== VIEW NAVIGATION ====================

async function showShsSubjectsView(semester, quarter) {
  console.log('=== showShsSubjectsView called ===');
  console.log('Semester:', semester);
  console.log('Quarter:', quarter);
  
  appState.currentSemester = semester;
  appState.currentQuarter = quarter;

  // Update view title
  const displayQuarterName = quarter.name || 'Quarter';
  document.getElementById('subjectsViewTitle').textContent = `${semester.name} - ${displayQuarterName}`;
  
  // Add/Update quarter switching buttons
  const viewHeader = document.querySelector('#subjectsView .view-header');
  let quarterSwitcher = viewHeader.querySelector('.quarter-switcher');
  
  // Remove existing switcher if present
  if (quarterSwitcher) {
    quarterSwitcher.remove();
  }
  
  // Create new quarter switcher
  quarterSwitcher = document.createElement('div');
  quarterSwitcher.className = 'quarter-switcher';
  
  semester.quarters.forEach(q => {
    const btn = document.createElement('button');
    btn.className = 'quarter-switch-btn';
    if (q.id === quarter.id) {
      btn.classList.add('active');
    }
    
    btn.textContent = q.name || 'Quarter';
    
    btn.addEventListener('click', () => {
      showShsSubjectsView(semester, q);
    });
    
    quarterSwitcher.appendChild(btn);
  });
  
  viewHeader.appendChild(quarterSwitcher);
  
  // Render subject cards
  const grid = document.getElementById('subjectsGrid');
  grid.innerHTML = '';
  
  // Load subjects for this specific quarter from database
  const subjects = await loadSubjects(quarter.id);
  console.log('Loaded subjects for SHS quarter:', subjects);
  
  // Setup Add Subject button listener
  const btnAddSubject = document.getElementById('btnAddSubject');
  if (btnAddSubject) {
    // Remove old listener by cloning
    const newBtn = btnAddSubject.cloneNode(true);
    btnAddSubject.parentNode.replaceChild(newBtn, btnAddSubject);
    
    newBtn.addEventListener('click', () => {
      console.log('Add Subject button clicked!');
      const modal = document.getElementById('addSubjectModal');
      if (modal) {
        modal.style.display = '';
        modal.classList.add('show');
        console.log('Add Subject modal displayed');
      }
    });
  }
  
  if (subjects.length === 0) {
    // Show message if no subjects
    grid.innerHTML = '<div style="text-align: center; padding: 60px 20px; color: #666;"><h3 style="margin-bottom: 12px; color: #333;">No Subjects Yet</h3><p style="margin-bottom: 20px;">Click "Add Subject" button above to create your first subject and start tracking grades!</p></div>';
    showView('subjects');
    return;
  }
  
  // Render subject cards from database with calculated grades
  for (const subject of subjects) {
    // Load components for this subject to calculate grade
    const components = await loadComponents(quarter.id, subject.id);
    const gradeData = calculateSubjectGrade(subject.name, components);
    
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.setAttribute('data-subject', subject.name);
    
    // Determine status badge and progress display
    let statusBadge = '<span class="status-badge pending">No Components</span>';
    let progressValue = '--';
    let progressLabel = 'No grade';
    let strokeColor = '#E5E7EB';
    let strokeOffset = 2 * Math.PI * 52; // Full circle (no progress)
    
    if (gradeData.transmutedGrade !== null) {
      progressValue = gradeData.transmutedGrade;
      progressLabel = gradeData.transmutedGrade >= 75 ? 'Passing' : 'Needs Improvement';
      
      // Color based on grade
      if (gradeData.transmutedGrade >= 90) {
        strokeColor = '#10b981'; // Green
        statusBadge = '<span class="status-badge completed">Outstanding</span>';
      } else if (gradeData.transmutedGrade >= 85) {
        strokeColor = '#38CA79'; // Light green
        statusBadge = '<span class="status-badge completed">Very Good</span>';
      } else if (gradeData.transmutedGrade >= 80) {
        strokeColor = '#3b82f6'; // Blue
        statusBadge = '<span class="status-badge in-progress">Good</span>';
      } else if (gradeData.transmutedGrade >= 75) {
        strokeColor = '#f59e0b'; // Orange
        statusBadge = '<span class="status-badge in-progress">Passing</span>';
      } else {
        strokeColor = '#ef4444'; // Red
        statusBadge = '<span class="status-badge pending">Failed</span>';
      }
      
      // Calculate stroke offset for circular progress
      const circumference = 2 * Math.PI * 52;
      strokeOffset = circumference * (1 - gradeData.transmutedGrade / 100);
    }
    
    card.innerHTML = `
      <div class="subject-card-header">
        <h3 class="subject-card-title">${subject.name}</h3>
        <div class="subject-card-status">
          ${statusBadge}
        </div>
      </div>
      <div class="subject-card-body">
        <div class="circular-progress-container">
          <svg class="circular-progress" width="120" height="120" viewBox="0 0 120 120">
            <circle class="progress-bg" cx="60" cy="60" r="52" 
                    stroke="#E5E7EB" stroke-width="8" fill="none"/>
            <circle class="progress-bar" cx="60" cy="60" r="52" 
                    stroke="${strokeColor}" stroke-width="8" fill="none"
                    stroke-dasharray="${2 * Math.PI * 52}" 
                    stroke-dashoffset="${strokeOffset}"
                    transform="rotate(-90 60 60)"
                    stroke-linecap="round"/>
          </svg>
          <div class="progress-text">
            <span class="progress-value">${progressValue}</span>
            <span class="progress-label">${progressLabel}</span>
          </div>
        </div>
        <button class="btn-visit-subject">Visit</button>
      </div>
    `;
    
    card.style.cursor = 'pointer';
    
    card.addEventListener('click', (e) => {
      console.log('=== SHS CARD CLICKED ===');
      console.log('Subject object:', subject);
      showSubjectDetailView(subject);
    });
    
    const visitBtn = card.querySelector('.btn-visit-subject');
    if (visitBtn) {
      visitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('=== SHS VISIT BUTTON CLICKED ===');
        console.log('Subject object:', subject);
        showSubjectDetailView(subject);
      });
    }
    
    grid.appendChild(card);
  }
  
  console.log('SHS cards created, calling showView');
  showView('subjects');
  
  // Calculate and update quarter GWA in the background
  calculateQuarterGWA(quarter.id).then(gwa => {
    if (gwa !== null) {
      quarter.gwa = gwa;
      console.log('Quarter GWA updated:', gwa);
    }
  });
}

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

async function showSubjectsView(quarter) {
  console.log('=== showSubjectsView called ===');
  console.log('Quarter:', quarter);
  
  appState.currentQuarter = quarter;
  document.getElementById('subjectsViewTitle').textContent = `${quarter.name} - Subjects`;
  
  const grid = document.getElementById('subjectsGrid');
  console.log('Grid element:', grid);
  grid.innerHTML = '';
  
  // Load subjects for this specific quarter from database
  const subjects = await loadSubjects(quarter.id);
  console.log('Loaded subjects for quarter:', subjects);
  
  // Setup Add Subject button listener (needs to be done when subjects view is shown)
  const btnAddSubject = document.getElementById('btnAddSubject');
  if (btnAddSubject) {
    // Remove old listener by cloning
    const newBtn = btnAddSubject.cloneNode(true);
    btnAddSubject.parentNode.replaceChild(newBtn, btnAddSubject);
    
    newBtn.addEventListener('click', () => {
      console.log('Add Subject button clicked!');
      const modal = document.getElementById('addSubjectModal');
      if (modal) {
        modal.style.display = '';
        modal.classList.add('show');
        console.log('Add Subject modal displayed');
      }
    });
  }
  
  if (subjects.length === 0) {
    // Show message if no subjects
    grid.innerHTML = '<div style="text-align: center; padding: 60px 20px; color: #666;"><h3 style="margin-bottom: 12px; color: #333;">No Subjects Yet</h3><p style="margin-bottom: 20px;">Click "Add Subject" button above to create your first subject and start tracking grades!</p></div>';
    showView('subjects');
    return;
  }
  
  // Render subject cards from database with calculated grades
  for (const subject of subjects) {
    // Load components for this subject to calculate grade
    const components = await loadComponents(quarter.id, subject.id);
    const gradeData = calculateSubjectGrade(subject.name, components);
    
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.setAttribute('data-subject', subject.name);
    
    // Determine status badge and progress display
    let statusBadge = '<span class="status-badge pending">No Components</span>';
    let progressValue = '--';
    let progressLabel = 'No grade';
    let strokeColor = '#E5E7EB';
    let strokeOffset = 2 * Math.PI * 52; // Full circle (no progress)
    
    if (gradeData.transmutedGrade !== null) {
      progressValue = gradeData.transmutedGrade;
      progressLabel = gradeData.transmutedGrade >= 75 ? 'Passing' : 'Needs Improvement';
      
      // Color based on grade
      if (gradeData.transmutedGrade >= 90) {
        strokeColor = '#10b981'; // Green
        statusBadge = '<span class="status-badge completed">Outstanding</span>';
      } else if (gradeData.transmutedGrade >= 85) {
        strokeColor = '#38CA79'; // Light green
        statusBadge = '<span class="status-badge completed">Very Good</span>';
      } else if (gradeData.transmutedGrade >= 80) {
        strokeColor = '#3b82f6'; // Blue
        statusBadge = '<span class="status-badge in-progress">Good</span>';
      } else if (gradeData.transmutedGrade >= 75) {
        strokeColor = '#f59e0b'; // Orange
        statusBadge = '<span class="status-badge in-progress">Passing</span>';
      } else {
        strokeColor = '#ef4444'; // Red
        statusBadge = '<span class="status-badge pending">Failed</span>';
      }
      
      // Calculate stroke offset for circular progress
      const circumference = 2 * Math.PI * 52;
      strokeOffset = circumference * (1 - gradeData.transmutedGrade / 100);
    }
    
    card.innerHTML = `
      <div class="subject-card-header">
        <h3 class="subject-card-title">${subject.name}</h3>
        <div class="subject-card-status">
          ${statusBadge}
        </div>
      </div>
      <div class="subject-card-body">
        <div class="circular-progress-container">
          <svg class="circular-progress" width="120" height="120" viewBox="0 0 120 120">
            <circle class="progress-bg" cx="60" cy="60" r="52" 
                    stroke="#E5E7EB" stroke-width="8" fill="none"/>
            <circle class="progress-bar" cx="60" cy="60" r="52" 
                    stroke="${strokeColor}" stroke-width="8" fill="none"
                    stroke-dasharray="${2 * Math.PI * 52}" 
                    stroke-dashoffset="${strokeOffset}"
                    transform="rotate(-90 60 60)"
                    stroke-linecap="round"/>
          </svg>
          <div class="progress-text">
            <span class="progress-value">${progressValue}</span>
            <span class="progress-label">${progressLabel}</span>
          </div>
        </div>
        <button class="btn-visit-subject">Visit</button>
      </div>
    `;
    
    card.style.cursor = 'pointer';
    
    card.addEventListener('click', (e) => {
      console.log('=== CARD CLICKED ===');
      console.log('Subject:', subject);
      showSubjectDetailView(subject);
    });
    
    const visitBtn = card.querySelector('.btn-visit-subject');
    if (visitBtn) {
      visitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('=== VISIT BUTTON CLICKED ===');
        console.log('Subject:', subject);
        showSubjectDetailView(subject);
      });
    }
    
    grid.appendChild(card);
  }
  
  console.log('Cards created, calling showView');
  showView('subjects');
  
  // Calculate and update quarter GWA in the background
  calculateQuarterGWA(quarter.id).then(gwa => {
    if (gwa !== null) {
      quarter.gwa = gwa;
      console.log('Quarter GWA updated:', gwa);
      // Update the quarter card on dashboard if we go back
      updateQuarterCard(quarter);
    }
  });
}

// ==================== GRADE CALCULATION ====================

/**
 * Calculate subject grade based on DepEd methodology
 * @param {string} subjectName - Name of the subject
 * @param {Array} components - Array of component objects with score, highest_score, component_type
 * @returns {Object} Grade data with WW, PT, QA averages, initial grade, and transmuted grade
 */
function calculateSubjectGrade(subjectName, components) {
  console.log('Calculating grade for:', subjectName, components);
  
  // Get component weights for this subject (default to standard weights if not found)
  const weights = COMPONENT_WEIGHTS[subjectName] || { WW: 30, PT: 50, QA: 20 };
  console.log('Using weights:', weights);
  
  // Separate components by type
  const wwComponents = components.filter(c => c.component_type === 'WW');
  const ptComponents = components.filter(c => c.component_type === 'PT');
  const qaComponents = components.filter(c => c.component_type === 'QA');
  
  // Calculate average percentage for each component type
  const calculateAverage = (componentsList) => {
    if (componentsList.length === 0) return null;
    
    const total = componentsList.reduce((sum, comp) => {
      return sum + (comp.score / comp.highest_score * 100);
    }, 0);
    
    return total / componentsList.length;
  };
  
  const wwAverage = calculateAverage(wwComponents);
  const ptAverage = calculateAverage(ptComponents);
  const qaAverage = calculateAverage(qaComponents);
  
  console.log('Component averages:', { wwAverage, ptAverage, qaAverage });
  
  // Calculate weighted grade (Initial Grade)
  let initialGrade = null;
  let weightedSum = 0;
  let totalWeight = 0;
  
  if (wwAverage !== null) {
    weightedSum += wwAverage * (weights.WW / 100);
    totalWeight += weights.WW;
  }
  
  if (ptAverage !== null) {
    weightedSum += ptAverage * (weights.PT / 100);
    totalWeight += weights.PT;
  }
  
  if (qaAverage !== null) {
    weightedSum += qaAverage * (weights.QA / 100);
    totalWeight += weights.QA;
  }
  
  // Only calculate initial grade if we have at least one component
  if (totalWeight > 0) {
    initialGrade = weightedSum;
  }
  
  // Calculate transmuted grade using DepEd transmutation table
  const transmutedGrade = initialGrade !== null ? transmuteGrade(initialGrade) : null;
  
  console.log('Final grades:', { initialGrade, transmutedGrade });
  
  return {
    wwAverage,
    ptAverage,
    qaAverage,
    initialGrade,
    transmutedGrade,
    weights
  };
}

// Calculate Quarter GWA (average of all subject grades)
async function calculateQuarterGWA(quarterId) {
  console.log('Calculating quarter GWA for quarter:', quarterId);
  
  try {
    // Load all subjects for this quarter
    const subjects = await loadSubjects(quarterId);
    console.log('Subjects in quarter:', subjects);
    
    if (subjects.length === 0) {
      return null; // No subjects, no GWA
    }
    
    const subjectGrades = [];
    
    // Calculate grade for each subject
    for (const subject of subjects) {
      const components = await loadComponents(quarterId, subject.id);
      const gradeData = calculateSubjectGrade(subject.name, components);
      
      if (gradeData.transmutedGrade !== null) {
        subjectGrades.push(gradeData.transmutedGrade);
      }
    }
    
    console.log('Subject grades:', subjectGrades);
    // New rule: GWA is computed only if ALL required subject grades are present
    if (subjectGrades.length !== subjects.length) {
      return null; // Missing or invalid grades for one or more subjects
    }
    
    // Calculate average across all subjects
    const sum = subjectGrades.reduce((total, grade) => total + grade, 0);
    const gwa = sum / subjectGrades.length;
    
    console.log('Quarter GWA:', gwa);
    return gwa;
  } catch (error) {
    console.error('Error calculating quarter GWA:', error);
    return null;
  }
}

async function showSubjectDetailView(subject) {
  console.log('showSubjectDetailView called with:', subject);
  console.log('Subject name:', subject.name);
  console.log('Is subject MAPEH?', subject.name === 'MAPEH');
  console.log('Current quarter:', appState.currentQuarter);
  
  appState.currentSubject = subject;
  const quarter = appState.currentQuarter;
  
  document.getElementById('subjectDetailTitle').textContent = 
    `${quarter.name} - ${subject.name}`;
  
  // Load components from database for this subject and quarter
  const components = await loadComponents(quarter.id, subject.id);
  console.log('Loaded components for subject:', components);
  
  // Calculate grades based on components
  const gradeData = calculateSubjectGrade(subject.name, components);
  console.log('Calculated grade data:', gradeData);
  
  // Update circular progress displays with calculated grades
  updateGradeCircles(gradeData.initialGrade, gradeData.transmutedGrade);
  
  // Render components in a simple table
  const container = document.getElementById('componentsTableBody');
  if (!container) {
    console.error('Components table body not found!');
    return;
  }
  
  container.innerHTML = '';
  
  // Only render the active tab's components to keep sections separate
  const activeType = activeComponentTab || 'WW';
  const typeLabels = { WW: '📝 Written Works (WW)', PT: '🎯 Performance Tasks (PT)', QA: '📊 Quarterly Assessment (QA)' };
  const filtered = components.filter(c => c.component_type === activeType);

  // Header row for the active type
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = `<td colspan="6" style="background: #f3f4f6; font-weight: bold; padding: 12px;">${typeLabels[activeType]}</td>`;
  container.appendChild(headerRow);

  if (filtered.length === 0) {
    container.innerHTML += '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #666;">No components yet. Click "Add Component" to get started!</td></tr>';
  } else {
    const createComponentRow = (comp, disableActions=false) => {
      const row = document.createElement('tr');
      const percentage = (comp.score / comp.highest_score * 100).toFixed(2);
      row.innerHTML = `
        <td style="padding-left: 20px;">${comp.component_type}</td>
        <td>${comp.name}</td>
        <td>${comp.score}</td>
        <td>${comp.highest_score}</td>
        <td>${percentage}%</td>
        <td>
          <button class="btn-edit-component" data-id="${comp.id}" style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin-right: 6px; font-size: 12px;" ${disableActions ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>Edit</button>
          <button class="btn-delete-component" data-id="${comp.id}" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;" ${disableActions ? 'disabled style=\"opacity:0.5;cursor:not-allowed;\"' : ''}>Delete</button>
        </td>
      `;
      if (!disableActions) {
        row.querySelector('.btn-edit-component').addEventListener('click', () => openEditComponentModal(comp));
        row.querySelector('.btn-delete-component').addEventListener('click', () => deleteComponent(comp.id));
      }
      return row;
    };

    const finalized = appState.yearFinalized === true;
    filtered.forEach(comp => container.appendChild(createComponentRow(comp, finalized)));

    // Add type average row
    const typeAverage = activeType === 'WW' ? gradeData.wwAverage : activeType === 'PT' ? gradeData.ptAverage : gradeData.qaAverage;
    if (typeAverage !== null && typeAverage !== undefined) {
      const avgRow = document.createElement('tr');
      avgRow.innerHTML = `
        <td colspan="5" style="text-align: right; font-weight: bold; padding-right: 20px; background: #fafafa;">Average:</td>
        <td style="font-weight: bold; background: #fafafa;">${typeAverage.toFixed(2)}%</td>
      `;
      container.appendChild(avgRow);
    }
  }
  
  console.log('Calling showView with subjectDetail');
  showView('subjectDetail');
  
  // Setup Add Component button (needs to be done after view is shown)
  const btnAddComponent = document.getElementById('btnAddComponent');
  if (btnAddComponent) {
    // Remove any existing listeners
    const newBtn = btnAddComponent.cloneNode(true);
    btnAddComponent.parentNode.replaceChild(newBtn, btnAddComponent);
    // Add new listener
    newBtn.addEventListener('click', () => {
      console.log('Add Component button clicked!');
      // Respect finalization: prevent adding when finalized
      if (appState.yearFinalized === true) return;
      openAddComponentModal();
    });
    // Disable button when finalized
    if (appState.yearFinalized === true) {
      newBtn.disabled = true;
      newBtn.style.opacity = '0.6';
      newBtn.style.cursor = 'not-allowed';
    }
  }

  // Ensure component tabs reflect active selection and will re-render this view
  document.querySelectorAll('.component-tab').forEach(tab => {
    if (tab.dataset.component === activeComponentTab) tab.classList.add('active');
    else tab.classList.remove('active');
  });
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

async function showDashboardView() {
  appState.currentQuarter = null;
  appState.currentSubject = null;
  
  // Recalculate GWAs when returning to dashboard
  const profile = window.userProfile;
  
  if (profile.isJHS && appState.quarters && appState.quarters.length > 0) {
    console.log('Recalculating JHS quarter GWAs...');
    for (const quarter of appState.quarters) {
      const gwa = await calculateQuarterGWA(quarter.id);
      if (gwa !== null) {
        quarter.gwa = gwa;
        console.log(`Quarter ${quarter.name} GWA: ${gwa}`);
      }
    }
  } else if (profile.isSHS && appState.semesters && appState.semesters.length > 0) {
    console.log('Recalculating SHS quarter GWAs...');
    for (const semester of appState.semesters) {
      for (const quarter of semester.quarters) {
        const gwa = await calculateQuarterGWA(quarter.id);
        if (gwa !== null) {
          quarter.gwa = gwa;
          console.log(`${semester.name} - ${quarter.name} GWA: ${gwa}`);
        }
      }
      
      // Calculate semester final grade
      const q1 = semester.quarters[0];
      const q2 = semester.quarters[1];
      if (q1 && q2 && q1.gwa && q2.gwa) {
        semester.finalGrade = (q1.gwa + q2.gwa) / 2;
        console.log(`${semester.name} final grade: ${semester.finalGrade}`);
      }
    }
  }
  
  // Re-render dashboard with updated GWAs
  renderGradeCards(profile);
  updateOverallGwa(profile);
  
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
}

  
  // Quarter/Subjects breadcrumb
  if (appState.currentQuarter) {
    const separator1 = document.createElement('span');
    separator1.className = 'breadcrumb-separator';
    separator1.textContent = '›';
    breadcrumb.appendChild(separator1);
    
    const quarterItem = document.createElement('span');
    quarterItem.className = 'breadcrumb-item';
    
    // Display quarter name - use the actual quarter name from the object
    if (appState.currentSemester) {
      // For SHS: show semester name and quarter name
      quarterItem.textContent = `${appState.currentSemester.name} - ${appState.currentQuarter.name}`;
    } else {
      // For JHS: show regular quarter name
      quarterItem.textContent = appState.currentQuarter.name;
    }
    
    if (appState.currentView === 'subjects') {
      quarterItem.classList.add('active');
    } else {
      quarterItem.addEventListener('click', () => {
        if (appState.currentSemester) {
          showShsSubjectsView(appState.currentSemester, appState.currentQuarter);
        } else {
          showSubjectsView(appState.currentQuarter);
        }
      });
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
    // Ensure we show the subject's name, not [object Object]
    subjectItem.textContent = (typeof appState.currentSubject === 'object' && appState.currentSubject !== null)
      ? (appState.currentSubject.name || '')
      : (appState.currentSubject || '');
    breadcrumb.appendChild(subjectItem);
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
  const profile = window.userProfile;
  const grades = [];
  
  if (profile.isSHS) {
    // For SHS, get the current quarter's subjects based on semester and quarter
    const semester = appState.currentSemester;
    const strand = profile.strand || 'STEM';
    const gradeLevel = profile.gradeLevel || 'Grade 11';
    const quarterName = quarter.id === 1 || quarter.id === 3 ? 'Quarter 1' : 'Quarter 2';
    const quarterSubjects = SHS_SUBJECTS[strand]?.[gradeLevel]?.[semester.name]?.[quarterName] || [];
    
    quarterSubjects.forEach(subject => {
      const subjectData = quarter.subjects[subject];
      if (subjectData && subjectData.finalGrade) {
        grades.push(subjectData.finalGrade);
      }
    });
  } else {
    // For JHS
    JHS_SUBJECTS.forEach(subject => {
      const subjectData = quarter.subjects[subject];
      if (subjectData.finalGrade) {
        grades.push(subjectData.finalGrade);
      }
    });
  }
  
  if (grades.length > 0) {
    quarter.gwa = grades.reduce((sum, g) => sum + g, 0) / grades.length;
  }
  
  // For SHS, also compute semester final grade
  if (profile.isSHS && appState.currentSemester) {
    const semester = appState.currentSemester;
    const q1Grade = semester.quarters[0].gwa;
    const q2Grade = semester.quarters[1].gwa;
    
    if (q1Grade && q2Grade) {
      semester.finalGrade = (q1Grade + q2Grade) / 2;
    }
  }
  
  updateOverallGwa(profile);
}

function updateOverallGwa(profile) {
  let gwaValues = [];
  
  if (profile.isSHS) {
    // For SHS, use semester final grades
    appState.semesters.forEach(semester => {
      if (semester.finalGrade) {
        gwaValues.push(semester.finalGrade);
      }
    });
  } else {
    // For JHS, use quarter GWAs
    gwaValues = appState.quarters.filter(q => q.gwa).map(q => q.gwa);
  }
  
  const hasGwa = gwaValues.length > 0;
  
  if (hasGwa) {
    appState.overallGwa = (gwaValues.reduce((a,b)=>a+b,0) / gwaValues.length).toFixed(2);
  } else {
    appState.overallGwa = 0;
  }

  // Update GWA display
  const gwaValueElement = document.getElementById('overallGwaValue');
  const remarkElement = document.getElementById('overallRemark');
  const buttonHint = document.getElementById('buttonHint');
  const markDoneBtn = document.getElementById('markDoneBtn');
  
  gwaValueElement.textContent = hasGwa ? appState.overallGwa : '--';
  
  // Show remark only if there's a computed GWA
  if (hasGwa) {
    remarkElement.textContent =
      appState.overallGwa >= 90 ? 'Outstanding! 🌟' :
      appState.overallGwa >= 85 ? 'Great job! 🎉' :
      appState.overallGwa >= 80 ? 'You did great! 👏' :
      appState.overallGwa >= 75 ? 'Keep it up! 💪' :
      'Keep pushing forward! 🌟';
    remarkElement.style.opacity = '1';
  } else {
    remarkElement.textContent = 'Keep pushing forward! 🌟';
    remarkElement.style.opacity = '0.6';
  }
  
  // Determine completion: quarters considered complete when GWA is computed
  const allQuarters = profile.isSHS
    ? (appState.semesters.flatMap(s => s.quarters) || [])
    : (appState.quarters || []);
  const allQuartersCompleted = allQuarters.length > 0 && allQuarters.every(q => typeof q.gwa === 'number' && !isNaN(q.gwa));

  // Update current/most recent completed term label
  const termLabelEl = document.getElementById('currentTermLabel');
  if (termLabelEl) {
    let recent = null;
    const list = profile.isSHS ? allQuarters : appState.quarters;
    if (list && list.length) {
      // find last quarter with a computed gwa
      for (let i = list.length - 1; i >= 0; i--) {
        if (typeof list[i].gwa === 'number') { recent = list[i]; break; }
      }
    }
    termLabelEl.textContent = recent ? `Viewing: ${recent.name}` : '';
  }

  // Update hint text and button state based on completion status and finalization
  const finalized = appState.yearFinalized === true;
  buttonHint.classList.remove('hidden');
  if (finalized) {
    buttonHint.textContent = 'School year finalized';
    markDoneBtn.disabled = true;
    markDoneBtn.style.opacity = '0.6';
    markDoneBtn.style.cursor = 'not-allowed';
  } else if (allQuartersCompleted) {
    buttonHint.textContent = 'All terms completed. You can finalize.';
    markDoneBtn.disabled = false;
    markDoneBtn.style.opacity = '1';
    markDoneBtn.style.cursor = 'pointer';
  } else {
    buttonHint.textContent = 'All terms must be completed to finalize.';
    markDoneBtn.disabled = true;
    markDoneBtn.style.opacity = '0.6';
    markDoneBtn.style.cursor = 'not-allowed';
  }
  
  // Update quarter cards if on dashboard
  if (appState.currentView === 'dashboard') {
    renderGradeCards(profile);
  }
  
  // Update sidebar stats to reflect current GWA and progress
  updateSidebarStats(profile);
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
  const dateElement = document.getElementById('currentDate');
  if (dateElement) {
    dateElement.textContent = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}

function setupYearCompleteModal() {
  const markDoneBtn = document.getElementById('markDoneBtn');
  const modal = document.getElementById('confirmYearCompleteModal');
  const btnCancel = document.getElementById('btnCancelYearComplete');
  const btnConfirm = document.getElementById('btnConfirmYearComplete');
  const buttonHint = document.getElementById('buttonHint');
  
  if (!markDoneBtn || !modal) return;
  
  // Show modal when Mark Year Complete button is clicked
  markDoneBtn.addEventListener('click', () => {
    // Determine completion based on GWA presence
    const profile = window.userProfile;
    const allQuarters = profile.isSHS
      ? (appState.semesters.flatMap(s => s.quarters) || [])
      : (appState.quarters || []);
    const allQuartersCompleted = allQuarters.length > 0 && allQuarters.every(q => typeof q.gwa === 'number' && !isNaN(q.gwa));

    const titleEl = modal.querySelector('.modal-title');
    const messageEl = modal.querySelector('.modal-message');
    const warningEl = modal.querySelector('.modal-warning');

    if (!allQuartersCompleted) {
      // Error modal
      if (titleEl) titleEl.textContent = '⚠️ Cannot Finalize';
      if (messageEl) messageEl.textContent = 'All terms must be completed before marking the School Year as done.';
      if (warningEl) warningEl.textContent = '';
      btnConfirm.style.display = 'none';
      modal.classList.add('show');
    } else {
      // Confirmation modal
      if (titleEl) titleEl.textContent = '✅ Confirm Year Completion';
      if (messageEl) messageEl.textContent = 'Are you sure you want to finalize this school year? This will prevent further editing.';
      if (warningEl) warningEl.textContent = 'This action cannot be undone.';
      btnConfirm.style.display = '';
      modal.classList.add('show');
    }
  });
  
  // Cancel button - close modal
  btnCancel.addEventListener('click', () => {
    modal.classList.remove('show');
  });
  
  // Confirm button - mark year complete
  btnConfirm.addEventListener('click', () => {
    modal.classList.remove('show');
    markSchoolYearComplete();
  });
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  });
  
  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      modal.classList.remove('show');
    }
  });
}

function markSchoolYearComplete() {
  const markDoneBtn = document.getElementById('markDoneBtn');
  const buttonHint = document.getElementById('buttonHint');
  const remarkElement = document.getElementById('overallRemark');

  // Finalize the school year in app state
  appState.yearFinalized = true;
  try { localStorage.setItem('gradeData', JSON.stringify(appState)); } catch (e) {}
  
  // Update UI
  markDoneBtn.disabled = true;
  markDoneBtn.style.opacity = '0.6';
  markDoneBtn.style.cursor = 'not-allowed';
  buttonHint.classList.remove('hidden');
  buttonHint.textContent = 'School year finalized';
  
  // Update remark message
  if (appState.overallGwa > 0) {
    remarkElement.textContent =
      appState.overallGwa >= 90 ? 'Outstanding! 🌟' :
      appState.overallGwa >= 85 ? 'Great job! 🎉' :
      appState.overallGwa >= 80 ? 'You did great! 👏' :
      appState.overallGwa >= 75 ? 'Keep it up! 💪' :
      'You did great! 💪';
    remarkElement.style.opacity = '1';
  }
  
  // Update quarter cards to show completed status
  renderGradeCards(window.userProfile);
  
  // Update sidebar stats to reflect completion
  updateSidebarStats(window.userProfile);
  
  // Show success message
  alert('School year marked as complete! 🎉');
}

document.addEventListener('DOMContentLoaded', async () => {
  setCurrentDate();
  const profile = await fetchUserProfile();
  await initializeGradeStructure(profile);
  
  // Calculate all quarter GWAs before rendering
  if (profile.isJHS && appState.quarters.length > 0) {
    for (const quarter of appState.quarters) {
      const gwa = await calculateQuarterGWA(quarter.id);
      if (gwa !== null) {
        quarter.gwa = gwa;
        console.log(`Quarter ${quarter.name} GWA calculated:`, gwa);
      }
    }
  } else if (profile.isSHS && appState.semesters && appState.semesters.length > 0) {
    // Calculate GWA for all SHS quarters
    for (const semester of appState.semesters) {
      for (const quarter of semester.quarters) {
        const gwa = await calculateQuarterGWA(quarter.id);
        if (gwa !== null) {
          quarter.gwa = gwa;
          console.log(`SHS ${semester.name} - ${quarter.name} GWA calculated:`, gwa);
        }
      }
      
      // Calculate semester final grade (average of two quarters)
      const q1 = semester.quarters[0];
      const q2 = semester.quarters[1];
      if (q1 && q2 && q1.gwa && q2.gwa) {
        semester.finalGrade = (q1.gwa + q2.gwa) / 2;
        console.log(`${semester.name} final grade:`, semester.finalGrade);
      }
    }
  }
  
  renderGradeCards(profile);
  updateOverallGwa(profile);
  setupProfileDropdown();
  setupYearCompleteModal();
  updateSidebarStats(profile); // Initial sidebar stats
  await refreshYearProgress(); // Fetch backend quarter statuses and update progress
  await loadSubjects(); // Load subjects for dropdowns
  await loadComponents(); // Load components
  
  // Setup Add Quarter button
  const btnAddQuarter = document.getElementById('btnAddQuarter');
  if (btnAddQuarter) {
    btnAddQuarter.addEventListener('click', () => {
      console.log('Add Quarter button clicked!');
      const modal = document.getElementById('addQuarterModal');
      if (modal) {
        modal.style.display = '';
        modal.classList.add('show');
        console.log('Add Quarter modal displayed');
      }
    });
  }
  
  // Setup modal cancel button
  const btnCancelAddQuarter = document.getElementById('btnCancelAddQuarter');
  if (btnCancelAddQuarter) {
    btnCancelAddQuarter.addEventListener('click', () => {
      const modal = document.getElementById('addQuarterModal');
      modal.style.display = 'none';
      modal.classList.remove('show');
      document.getElementById('quarterNameInput').value = '';
    });
  }
  
  // Setup modal confirm button
  const btnConfirmAddQuarter = document.getElementById('btnConfirmAddQuarter');
  if (btnConfirmAddQuarter) {
    btnConfirmAddQuarter.addEventListener('click', async () => {
      const name = document.getElementById('quarterNameInput').value.trim();
      if (!name) {
        alert('Please enter a quarter name');
        return;
      }

      try {
        const csrfToken = getCSRFToken();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('csrfmiddlewaretoken', csrfToken);

        const response = await fetch('/quarters/add/', {
          method: 'POST',
          headers: {
            'X-CSRFToken': csrfToken
          },
          body: formData
        });

        const data = await response.json();
        if (data.id) {
          alert('Quarter added successfully!');
          const modal = document.getElementById('addQuarterModal');
          modal.style.display = 'none';
          modal.classList.remove('show');
          document.getElementById('quarterNameInput').value = '';
          // Reload the page to show new quarter
          location.reload();
        }
      } catch (error) {
        console.error('Error adding quarter:', error);
        alert('Failed to add quarter');
      }
    });
  }

  // Setup Add Subject Modal buttons - setup listener in showSubjectsView since button is dynamically there
  const btnCancelAddSubject = document.getElementById('btnCancelAddSubject');
  if (btnCancelAddSubject) {
    btnCancelAddSubject.addEventListener('click', () => {
      const modal = document.getElementById('addSubjectModal');
      modal.style.display = 'none';
      modal.classList.remove('show');
      document.getElementById('subjectNameInput').value = '';
    });
  }
  
  const btnConfirmAddSubject = document.getElementById('btnConfirmAddSubject');
  if (btnConfirmAddSubject) {
    btnConfirmAddSubject.addEventListener('click', async () => {
      const name = document.getElementById('subjectNameInput').value.trim();
      if (!name) {
        alert('Please enter a subject name');
        return;
      }

      if (!appState.currentQuarter) {
        alert('Please select a quarter first');
        return;
      }

      try {
        const csrfToken = getCSRFToken();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('quarter_id', appState.currentQuarter.id);
        formData.append('csrfmiddlewaretoken', csrfToken);

        const response = await fetch('/subjects/add/', {
          method: 'POST',
          headers: {
            'X-CSRFToken': csrfToken
          },
          body: formData
        });

        const data = await response.json();
        if (data.id) {
          alert('Subject added successfully!');
          const modal = document.getElementById('addSubjectModal');
          modal.style.display = 'none';
          modal.classList.remove('show');
          document.getElementById('subjectNameInput').value = '';
          // Reload subjects view
          showSubjectsView(appState.currentQuarter);
        }
      } catch (error) {
        console.error('Error adding subject:', error);
        alert('Failed to add subject');
      }
    });
  }

document.getElementById('backToQuarters').addEventListener('click', () => {
  if (appState.currentSemester) {
    // For SHS, go back to dashboard (shows semester view)
    appState.currentQuarter = null;
    appState.currentSemester = null;
    showDashboardView();
  } else {
    // For JHS, go back to dashboard
    showDashboardView();
  }
});

document.getElementById('backToSubjects').addEventListener('click', () => {
  if (appState.currentSemester) {
    // For SHS, go back to subjects view with semester context
    showShsSubjectsView(appState.currentSemester, appState.currentQuarter);
  } else {
    // For JHS, go back to subjects view
    showSubjectsView(appState.currentQuarter);
  }
});

  // Setup Add Component Modal buttons (button itself is set up in showSubjectDetailView)
  const btnCancelAddComponent = document.getElementById('btnCancelAddComponent');
  if (btnCancelAddComponent) {
    btnCancelAddComponent.addEventListener('click', () => {
      document.getElementById('addComponentModal').style.display = 'none';
    });
  }
  
  const btnConfirmAddComponent = document.getElementById('btnConfirmAddComponent');
  if (btnConfirmAddComponent) {
    console.log('btnConfirmAddComponent found, attaching listener');
    btnConfirmAddComponent.addEventListener('click', () => {
      console.log('Confirm button clicked!');
      addComponent();
    });
  } else {
    console.error('btnConfirmAddComponent NOT FOUND!');
  }
  
  // Setup Edit Component Modal buttons
  const btnCancelEditComponent = document.getElementById('btnCancelEditComponent');
  if (btnCancelEditComponent) {
    btnCancelEditComponent.addEventListener('click', () => {
      document.getElementById('editComponentModal').style.display = 'none';
    });
  }
  
  const btnConfirmEditComponent = document.getElementById('btnConfirmEditComponent');
  if (btnConfirmEditComponent) {
    btnConfirmEditComponent.addEventListener('click', async () => {
      await updateComponent();
      await refreshYearProgress();
    });
  }
  
  // Close modals when clicking outside
  document.getElementById('addComponentModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'addComponentModal') {
      e.target.style.display = 'none';
    }
  });
  
  document.getElementById('editComponentModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'editComponentModal') {
      e.target.style.display = 'none';
    }
  });

  // Component tab switching
  setupComponentTabs();
});

// ========== SPA NAVIGATION: SIDEBAR SETTINGS BUTTON ==========

// Utility to load a page's main content into .main-content .content-wrapper
async function loadMainContent(url, breadcrumbHtml, callback) {
  const mainContent = document.querySelector('.main-content .content-wrapper');
  if (!mainContent) return;

  try {
    const response = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    const html = await response.text();

    // Parse and extract the .main-content .content-wrapper from the fetched HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    let newContent = tempDiv.querySelector('.main-content .content-wrapper');
    if (!newContent) {
      // fallback: use the whole HTML if selector fails
      newContent = tempDiv;
    }
    mainContent.innerHTML = newContent.innerHTML;

    // Update breadcrumb if provided
    if (breadcrumbHtml) {
      const breadcrumb = document.getElementById('breadcrumbNav');
      if (breadcrumb) breadcrumb.innerHTML = breadcrumbHtml;
    }

    // Run callback (e.g., initializeSettingsPage)
    if (typeof callback === 'function') callback();

  } catch (error) {
    mainContent.innerHTML = '<div style="padding:32px;color:#ef4444;">Failed to load content.</div>';
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const navSettingsLink = document.getElementById('navSettingsLink');
  const goalsLink = document.getElementById('goalsLink');

  if (navSettingsLink) {
    navSettingsLink.addEventListener('click', function (e) {
      e.preventDefault();

      document.querySelectorAll('.sidebar .nav-item')
        .forEach(item => item.classList.remove('active'));
      navSettingsLink.classList.add('active');

      loadMainContent(
        '/settings/',
        '<span class="breadcrumb-item active" data-level="settings">Settings</span>',
        function () {
          ensureSettingsAssetsLoaded();
        }
      );
    });
  }

  if (goalsLink) {
    goalsLink.addEventListener('click', function (e) {
      e.preventDefault();

      document.querySelectorAll('.sidebar .nav-item')
        .forEach(item => item.classList.remove('active'));
      goalsLink.classList.add('active');

      loadMainContent(
        '/goal/',
        '<span class="breadcrumb-item active" data-level="goals">My Goals</span>',
        function () {
          ensureGoalsAssetsLoaded();
        }
      );
    });
  }
});

function ensureSettingsAssetsLoaded() {
  if (!window.settingsCssLoaded) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/static/accounts/css/settings.css';
    document.head.appendChild(link);
    window.settingsCssLoaded = true;
  }
    initializeSettingsPage();
}

function ensureGoalsAssetsLoaded() {
  if (!window.goalsJsLoaded) {
    const script = document.createElement('script');
    script.src = '/static/accounts/js/goal.js';
    script.onload = () => { window.goalsJsLoaded = true; };
    document.body.appendChild(script);
  } else if (typeof initializeGoalsPage === 'function') {
    initializeGoalsPage();
  }

  if (!window.goalsCssLoaded) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/static/accounts/css/goal.css';
    document.head.appendChild(link);
    window.goalsCssLoaded = true;
  }
}

function loadMainContent(url, breadcrumbHtml, callback) {
  fetch(url)
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newContent =
        doc.querySelector('.main-content')?.innerHTML || doc.body.innerHTML;
      document.querySelector('.main-content').innerHTML = newContent;

      const breadcrumbContainer = document.getElementById('breadcrumb');
      if (breadcrumbContainer) {
        breadcrumbContainer.innerHTML = breadcrumbHtml;
      }

      if (typeof callback === 'function') callback();
    })
    .catch(err => console.error('Error loading content:', err));
}

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
    // If we're in subject detail view (backend-driven), re-render that view
    if (appState.currentView === 'subjectDetail' && appState.currentSubject) {
      showSubjectDetailView(appState.currentSubject);
    } else {
      renderComponents();
    }
  }
}

function updateSidebarStats(profile) {
  const sidebarGwa = document.getElementById('sidebarGwa');
  const sidebarProgress = document.getElementById('sidebarProgress');
  const goalsCount = document.getElementById('goalsCount');
  
  if (sidebarGwa && sidebarProgress) {
    // Update GWA
    const gwa = appState.overallGwa;
    if (gwa > 0) {
      sidebarGwa.textContent = gwa;
    } else {
      sidebarGwa.textContent = '--';
    }
    
    // Calculate year progress based on backend-computed quarter completion
    const allQuarters = profile.isSHS
      ? (appState.semesters.flatMap(s => s.quarters) || [])
      : (appState.quarters || []);
    const completedQuarters = allQuarters.filter(q => q.is_completed === true || q.marked === true).length;
    const totalQuarters = 4; // Always 4 per school year
    const progress = Math.round((completedQuarters / totalQuarters) * 100);
    appState.yearProgress = progress;
    sidebarProgress.textContent = `${isFinite(progress) ? progress : 0}%`;
    
    // Update goals count (placeholder - integrate with actual goals system)
    if (goalsCount) {
      goalsCount.textContent = '0';
    }
  }
}

// ==================== CRUD OPERATIONS ====================

// Utility: Get CSRF token
function getCSRFToken() {
  return document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
         document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];
}

// Load Quarters
async function loadQuarters() {
  try {
    const response = await fetch('/quarters/list/');
    const data = await response.json();
    console.log('Loaded quarters:', data.quarters);
    return data.quarters || [];
  } catch (error) {
    console.error('Error loading quarters:', error);
    return [];
  }
}

// Load Subjects
async function loadSubjects(quarterId = null) {
  try {
    const url = quarterId ? `/subjects/list/?quarter_id=${quarterId}` : '/subjects/list/';
    const response = await fetch(url);
    const data = await response.json();
    console.log('Loaded subjects:', data.subjects);
    
    // Update subject dropdown in component modal
    const subjectSelect = document.getElementById('componentSubjectSelect');
    if (subjectSelect) {
      subjectSelect.innerHTML = '<option value="">Select Subject</option>';
      data.subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.id;
        option.textContent = subject.name;
        subjectSelect.appendChild(option);
      });
    }
    return data.subjects || [];
  } catch (error) {
    console.error('Error loading subjects:', error);
    return [];
  }
}

// Load Components
async function loadComponents(quarterId = null, subjectId = null) {
  try {
    let url = '/components/list/';
    const params = new URLSearchParams();
    if (quarterId) params.append('quarter_id', quarterId);
    if (subjectId) params.append('subject_id', subjectId);
    if (params.toString()) url += '?' + params.toString();
    
    const response = await fetch(url);
    const data = await response.json();
    console.log('Loaded components:', data.components);
    return data.components || [];
  } catch (error) {
    console.error('Error loading components:', error);
    return [];
  }
}

// ==================== COMPONENT CRUD OPERATIONS ====================

// Open Add Component Modal
function openAddComponentModal() {
  try {
    console.log('Opening add component modal...');
    console.log('Current subject:', appState.currentSubject);
    
    // Hide both modals first to ensure only one is shown
    const regularModal = document.getElementById('addComponentModal');
    const mapehModal = document.getElementById('mapehSubAreaModal');
    
    if (regularModal) {
      regularModal.style.display = 'none';
      regularModal.classList.remove('show');
    }
    
    if (mapehModal) {
      mapehModal.style.display = 'none';
      mapehModal.classList.remove('show');
    }
    
    // Check if current subject is MAPEH
    if (appState.currentSubject && appState.currentSubject.name === 'MAPEH') {
      console.log('Current subject is MAPEH, showing sub-area selection modal');
      // Show MAPEH sub-area selection modal instead
      if (mapehModal) {
        console.log('MAPEH modal found, showing it');
        
        // Clear any previous selections
        document.querySelectorAll('.mapeh-sub-area-option').forEach(option => {
          option.classList.remove('selected');
        });
        
        // Attach event listeners to MAPEH sub-area options
        attachMapehSubAreaEventListeners();
        
        // Show the modal using the same approach as other modals
        mapehModal.style.display = '';
        mapehModal.classList.add('show');
        
        console.log('MAPEH modal should be visible now');
        return;
      } else {
        console.error('MAPEH modal not found!');
      }
    }
    
    console.log('Showing regular add component modal');
    // Regular component modal for non-MAPEH subjects
    if (!regularModal) {
      console.error('Add component modal not found!');
      return;
    }
    
    // Clear form
    document.getElementById('componentNameInput').value = '';
    document.getElementById('componentTypeSelect').value = 'WW';
    document.getElementById('componentScoreInput').value = '';
    document.getElementById('componentHighestInput').value = '100';
    
    // Show the modal consistently
    regularModal.style.display = 'flex';
    regularModal.classList.add('show');
    
    console.log('Regular modal should be visible now');
  } catch (error) {
    console.error('Error in openAddComponentModal:', error);
  }
}

// Add Component with values
async function addComponentWithValues(name, type, score, highest) {
  console.log('addComponentWithValues called!');
  console.log('Values:', { name, type, score, highest });
  console.log('Current quarter:', appState.currentQuarter);
  console.log('Current subject:', appState.currentSubject);
  
  try {
    const csrfToken = getCSRFToken();
    const formData = new FormData();
    formData.append('quarter_id', appState.currentQuarter.id);
    formData.append('subject_id', appState.currentSubject.id);
    formData.append('name', name);
    formData.append('component_type', type);
    formData.append('score', score);
    formData.append('highest_score', highest);
    formData.append('csrfmiddlewaretoken', csrfToken);
    
    console.log('Sending request to /components/add/');
    const response = await fetch('/components/add/', {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken
      },
      body: formData
    });
    
    console.log('Response received:', response);
    const data = await response.json();
    console.log('Response data:', data);
    
    if (data.id) {
      console.log('Component added successfully!');
      alert('Component added successfully!');
      // Reload subject view to show new component
      showSubjectDetailView(appState.currentSubject);
    } else {
      alert('Failed to add component: ' + (data.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error adding component:', error);
    alert('Failed to add component');
  }
}

// Modify the addComponent function to handle MAPEH components
async function addComponent() {
  console.log('addComponent function called!');
  const name = document.getElementById('componentNameInput').value.trim();
  const type = document.getElementById('componentTypeSelect').value;
  const score = parseFloat(document.getElementById('componentScoreInput').value);
  const highest = parseFloat(document.getElementById('componentHighestInput').value);
  
  console.log('Form values:', { name, type, score, highest });
  
  if (!name || isNaN(score) || isNaN(highest)) {
    alert('Please fill in all fields correctly');
    return;
  }
  if (score < 0 || highest < 0) {
    alert('Scores cannot be negative');
    return;
  }
  if (highest === 0) {
    alert('Highest possible score must be greater than zero');
    return;
  }
  
  if (score > highest) {
    alert('Score cannot be higher than the highest possible score');
    return;
  }
  
  console.log('Validation passed, attempting to add component...');
  console.log('Current quarter:', appState.currentQuarter);
  console.log('Current subject:', appState.currentSubject);
  
  // Check if currentQuarter and currentSubject have id property
  if (!appState.currentQuarter || !appState.currentQuarter.id) {
    console.error('ERROR: Current quarter is missing or has no id!', appState.currentQuarter);
    alert('Error: No quarter selected. Please go back and select a quarter first.');
    return;
  }
  
  if (!appState.currentSubject || !appState.currentSubject.id) {
    console.error('ERROR: Current subject is missing or has no id!', appState.currentSubject);
    alert('Error: No subject selected. Please go back and select a subject first.');
    return;
  }
  
  try {
    const csrfToken = getCSRFToken();
    const formData = new FormData();
    formData.append('quarter_id', appState.currentQuarter.id);
    formData.append('subject_id', appState.currentSubject.id);
    
    // If this is a MAPEH component, prefix the name with the sub-area
    if (appState.currentSubject.name === 'MAPEH' && appState.currentMAPEHArea) {
      formData.append('name', `${appState.currentMAPEHArea} - ${name}`);
    } else {
      formData.append('name', name);
    }
    
    formData.append('component_type', type);
    formData.append('score', score);
    formData.append('highest_score', highest);
    formData.append('csrfmiddlewaretoken', csrfToken);
    
    console.log('Sending request to /components/add/ with data:', {
      quarter_id: appState.currentQuarter.id,
      subject_id: appState.currentSubject.id,
      name: appState.currentSubject.name === 'MAPEH' && appState.currentMAPEHArea ? `${appState.currentMAPEHArea} - ${name}` : name,
      type, score, highest
    });
    
    const response = await fetch('/components/add/', {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken
      },
      body: formData
    });
    
    console.log('Response received:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      alert(`Failed to add component: Server returned ${response.status}`);
      return;
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (data.id) {
      console.log('Component added successfully!');
      // Close modal
      document.getElementById('addComponentModal').style.display = 'none';
      document.getElementById('addComponentModal').classList.remove('show');
      // Reload subject view to show new component
      await showSubjectDetailView(appState.currentSubject);
      await refreshYearProgress();
    } else {
      alert('Failed to add component: ' + (data.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error adding component:', error);
    alert('Failed to add component: ' + error.message);
  }
}

// Open regular add component modal (without MAPEH check)
function openRegularAddComponentModal() {
  console.log('Opening regular add component modal...');
  const modal = document.getElementById('addComponentModal');
  if (!modal) {
    console.error('Add component modal not found!');
    return;
  }
  
  // Clear form
  document.getElementById('componentNameInput').value = '';
  document.getElementById('componentTypeSelect').value = 'WW';
  document.getElementById('componentScoreInput').value = '';
  document.getElementById('componentHighestInput').value = '100';
  
  // Simply remove display:none and let CSS handle the rest
  modal.style.display = '';
  modal.classList.add('show');
  
  console.log('Modal should be visible now');
}

// Attach event listeners to MAPEH sub-area options
function attachMapehSubAreaEventListeners() {
  console.log('Attaching MAPEH sub-area event listeners');
  
  // Add click listeners to MAPEH sub-area options
  document.querySelectorAll('.mapeh-sub-area-option').forEach(option => {
    // Remove any existing event listeners by cloning
    const newOption = option.cloneNode(true);
    option.parentNode.replaceChild(newOption, option);
    
    // Add click listener
    newOption.addEventListener('click', function() {
      console.log('MAPEH sub-area clicked:', this.getAttribute('data-area'));
      
      // Add selected class to clicked option
      this.classList.add('selected');
      
      // Get the selected area
      const selectedArea = this.getAttribute('data-area');
      console.log('Selected MAPEH area:', selectedArea);
      
      // Store the selected area in appState
      appState.currentMAPEHArea = selectedArea;
      
      // Close the MAPEH modal
      const mapehModal = document.getElementById('mapehSubAreaModal');
      mapehModal.style.display = 'none';
      mapehModal.classList.remove('show');
      
      // Open the regular add component modal
      openRegularAddComponentModal();
    });
  });
  
  // Cancel button for MAPEH modal
  const cancelBtn = document.getElementById('btnCancelMapehSubArea');
  if (cancelBtn) {
    // Remove existing listener by cloning
    const newCancelBtn = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    
    // Add new listener
    newCancelBtn.addEventListener('click', function() {
      console.log('MAPEH modal cancel button clicked');
      const mapehModal = document.getElementById('mapehSubAreaModal');
      mapehModal.style.display = 'none';
      mapehModal.classList.remove('show');
    });
  }
}

// Open regular add component modal (without MAPEH check)
function openRegularAddComponentModal() {
  console.log('Opening regular add component modal...');
  const modal = document.getElementById('addComponentModal');
  if (!modal) {
    console.error('Add component modal not found!');
    return;
  }
  
  // Clear form
  document.getElementById('componentNameInput').value = '';
  document.getElementById('componentTypeSelect').value = 'WW';
  document.getElementById('componentScoreInput').value = '';
  document.getElementById('componentHighestInput').value = '100';
  
  // Show the modal using a simple approach
  modal.style.display = 'flex';
  modal.classList.add('show');
  
  console.log('Modal should be visible now');
}

// Open Edit Component Modal
function openEditComponentModal(component) {
  console.log('Opening edit modal for component:', component);
  const modal = document.getElementById('editComponentModal');
  if (!modal) {
    console.error('Edit modal not found!');
    return;
  }
  
  // Populate form with component data
  document.getElementById('editComponentId').value = component.id;
  document.getElementById('editComponentNameInput').value = component.name;
  document.getElementById('editComponentTypeSelect').value = component.component_type;
  document.getElementById('editComponentScoreInput').value = component.score;
  document.getElementById('editComponentHighestInput').value = component.highest_score;
}

  
  // Show modal (remove display:none and add show class)
  modal.style.display = '';
  modal.classList.add('show');

// Update Component
async function updateComponent() {
  const id = document.getElementById('editComponentId').value;
  const name = document.getElementById('editComponentNameInput').value.trim();
  const type = document.getElementById('editComponentTypeSelect').value;
  const score = parseFloat(document.getElementById('editComponentScoreInput').value);
  const highest = parseFloat(document.getElementById('editComponentHighestInput').value);
  
  if (!name || isNaN(score) || isNaN(highest)) {
    alert('Please fill in all fields correctly');
    return;
  }
  
  if (score > highest) {
    alert('Score cannot be higher than the highest possible score');
    return;
  }
  
  try {
    const csrfToken = getCSRFToken();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('component_type', type);
    formData.append('score', score);
    formData.append('highest_score', highest);
    formData.append('csrfmiddlewaretoken', csrfToken);
    
    const response = await fetch(`/components/update/${id}/`, {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken
      },
      body: formData
    });
    
    const data = await response.json();
    if (data.id) {
      // Close modal
      document.getElementById('editComponentModal').style.display = 'none';
      document.getElementById('editComponentModal').classList.remove('show');
      // Reload subject view to show updated component
      showSubjectDetailView(appState.currentSubject);
    } else {
      alert('Failed to update component: ' + (data.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error updating component:', error);
    alert('Failed to update component');
  }
}

// Delete Component
async function deleteComponent(componentId) {
  if (!confirm('Are you sure you want to delete this component? This action cannot be undone.')) {
    return;
  }
  
  try {
    const csrfToken = getCSRFToken();
    const response = await fetch(`/components/delete/${componentId}/`, {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `csrfmiddlewaretoken=${csrfToken}`
    });
    
    const data = await response.json();
    if (data.success) {
      // Reload subject view to remove deleted component
      await showSubjectDetailView(appState.currentSubject);
      await refreshYearProgress();
    } else {
      alert('Failed to delete component: ' + (data.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error deleting component:', error);
    alert('Failed to delete component');
  }
}

// Refresh year progress from backend quarters status and update UI
async function refreshYearProgress() {
  try {
    const quartersData = await loadQuarters();
    if (!quartersData || quartersData.length === 0) {
      document.getElementById('sidebarProgress').textContent = '0%';
      return;
    }
    // Update appState quarters completion flags
    const profile = window.userProfile;
    if (profile.isSHS) {
      // Map by id for quick update
      const byId = Object.fromEntries(quartersData.map(q => [q.id, q]));
      (appState.semesters || []).forEach(sem => {
        (sem.quarters || []).forEach(q => {
          const backend = byId[q.id];
          if (backend) {
            q.is_completed = backend.is_completed === true;
            q.marked = backend.is_completed === true;
          }
        });
      });
    } else {
      appState.quarters = quartersData.map(q => ({
        id: q.id,
        name: q.name,
        gwa: (appState.quarters.find(x => x.id === q.id) || {}).gwa || null,
        marked: q.is_completed === true,
        is_completed: q.is_completed === true,
        subjects: (appState.quarters.find(x => x.id === q.id) || {}).subjects || {}
      }));
    }
    // Update sidebar now
    updateSidebarStats(profile);
  } catch (e) {
    console.error('Failed to refresh year progress:', e);
  }
}

// Helper: get SHS subject list for a specific term
function getShsSubjectsForTerm(gradeLevel, strand, semesterName, quarterName) {
  try {
    const strandMap = SHS_SUBJECTS[strand];
    if (!strandMap) return [];
    const gradeMap = strandMap[gradeLevel];
    if (!gradeMap) return [];
    const semMap = gradeMap[semesterName];
    if (!semMap) return [];
    const list = semMap[quarterName];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.warn('Unable to resolve SHS subjects for term:', { gradeLevel, strand, semesterName, quarterName }, e);
    return [];
  }
}