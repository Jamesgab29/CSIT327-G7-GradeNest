const dashboardData = {
  quarters: [],
  semesters: [],
  overallGwa: 0,
  allMarked: false
};

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
    dashboardData.quarters = [
      { id: 1, name: 'First Quarter', gwa: null, marked: false },
      { id: 2, name: 'Second Quarter', gwa: null, marked: false },
      { id: 3, name: 'Third Quarter', gwa: null, marked: false },
      { id: 4, name: 'Fourth Quarter', gwa: null, marked: false }
    ];
  } else if (profile.isSHS) {
    dashboardData.semesters = [
      {
        name: 'First Semester',
        quarters: [
          { id: 1, name: 'First Quarter', gwa: null, marked: false },
          { id: 2, name: 'Second Quarter', gwa: null, marked: false }
        ]
      },
      {
        name: 'Second Semester',
        quarters: [
          { id: 3, name: 'First Quarter', gwa: null, marked: false },
          { id: 4, name: 'Second Quarter', gwa: null, marked: false }
        ]
      }
    ];
  }
}

function renderGradeCards(profile) {
  const container = document.getElementById('quartersContainer');
  container.innerHTML = '';

  if (profile.isJHS) {
    dashboardData.quarters.forEach(quarter => {
      const card = createQuarterCard(quarter);
      container.appendChild(card);
    });
  } else if (profile.isSHS) {
    dashboardData.semesters.forEach(semester => {
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

  card.addEventListener('click', () => openQuarterModal(quarter));
  return card;
}

function openQuarterModal(quarter) {
  const modal = document.getElementById('quarterModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  modalTitle.textContent = `${quarter.name} Details`;
  modalBody.innerHTML = `
    <p><strong>Status:</strong> ${quarter.marked ? 'Completed' : 'In Progress'}</p>
    <p><strong>GWA:</strong> ${quarter.gwa ? quarter.gwa.toFixed(2) : 'Not computed'}</p>
  `;
  openModal();
}

function openModal() {
  document.getElementById('quarterModal').classList.add('show');
  document.getElementById('modalOverlay').classList.add('show');
}
function closeModal() {
  document.getElementById('quarterModal').classList.remove('show');
  document.getElementById('modalOverlay').classList.remove('show');
}

function updateOverallGwa(profile) {
  const allQuarters = profile.isSHS
    ? dashboardData.semesters.flatMap(s => s.quarters)
    : dashboardData.quarters;

  const gwaValues = allQuarters.filter(q => q.gwa).map(q => q.gwa);
  
  if (gwaValues.length) {
    dashboardData.overallGwa = (gwaValues.reduce((a,b)=>a+b,0) / gwaValues.length).toFixed(2);
  } else {
    dashboardData.overallGwa = 0;
  }

  document.getElementById('overallGwaValue').textContent = gwaValues.length ? dashboardData.overallGwa : '--';
  document.getElementById('overallRemark').textContent =
    dashboardData.overallGwa >= 90 ? 'Outstanding!' :
    dashboardData.overallGwa >= 85 ? 'Great job!' :
    dashboardData.overallGwa >= 80 ? 'You did great' :
    dashboardData.overallGwa >= 75 ? 'Keep it up!' :
    'You did great';
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

  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  document.getElementById('modalOkBtn').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', closeModal);
});