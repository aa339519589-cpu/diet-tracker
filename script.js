// State
let records = JSON.parse(localStorage.getItem('dietRecords')) || [];
const DAILY_GOAL = 2000;

// DOM Elements
const form = document.getElementById('mealForm');
const foodInput = document.getElementById('foodName');
const caloriesInput = document.getElementById('calories');
const mealTypeSelect = document.getElementById('mealType');
const mealTimeInput = document.getElementById('mealTime');
const recordsList = document.getElementById('recordsList');
const totalCaloriesEl = document.getElementById('totalCalories');
const progressFill = document.getElementById('progressFill');
const todayDateEl = document.getElementById('todayDate');
const clearAllBtn = document.getElementById('clearAll');

// Set default time to now
function setDefaultTime() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localISOTime = new Date(now.getTime() - offset * 60000).toISOString().slice(0, 16);
  mealTimeInput.value = localISOTime;
}

// Format date for display
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}月${day}日 ${hours}:${minutes}`;
}

// Get today's date string (YYYY-MM-DD)
function getTodayStr() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

// Get today's records
function getTodayRecords() {
  const today = getTodayStr();
  return records.filter(r => r.dateTime.startsWith(today));
}

// Calculate today's total
function calcTodayTotal() {
  return getTodayRecords().reduce((sum, r) => sum + r.calories, 0);
}

// Get meal icon
function getMealIcon(type) {
  const icons = {
    '早餐': '🌅',
    '午餐': '☀️',
    '晚餐': '🌙',
    '加餐': '🍪'
  };
  return icons[type] || '🍽️';
}

// Get meal class
function getMealClass(type) {
  const classes = {
    '早餐': 'breakfast',
    '午餐': 'lunch',
    '晚餐': 'dinner',
    '加餐': 'snack'
  };
  return classes[type] || 'snack';
}

// Render
function render() {
  const todayTotal = calcTodayTotal();
  totalCaloriesEl.textContent = todayTotal;
  
  const percent = Math.min((todayTotal / DAILY_GOAL) * 100, 100);
  progressFill.style.width = percent + '%';
  
  // Change progress color when over goal
  if (todayTotal >= DAILY_GOAL) {
    progressFill.style.background = 'linear-gradient(90deg, #e17055, #d63031)';
  } else {
    progressFill.style.background = 'linear-gradient(90deg, #00b894, #e17055)';
  }
  
  // Sort records by dateTime descending
  const sorted = [...records].sort((a, b) => b.dateTime.localeCompare(a.dateTime));
  
  if (sorted.length === 0) {
    recordsList.innerHTML = '<div class="empty-state">还没有记录，开始添加吧！</div>';
    return;
  }
  
  recordsList.innerHTML = sorted.map(record => `
    <div class="record-item">
      <div class="record-icon ${getMealClass(record.mealType)}">
        ${getMealIcon(record.mealType)}
      </div>
      <div class="record-info">
        <div class="record-name">${escapeHtml(record.foodName)}</div>
        <div class="record-meta">${record.mealType} · ${formatDate(record.dateTime)}</div>
      </div>
      <div class="record-calories">${record.calories}</div>
      <button class="record-delete" data-id="${record.id}">✕</button>
    </div>
  `).join('');
  
  // Delete handlers
  document.querySelectorAll('.record-delete').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.dataset.id;
      records = records.filter(r => r.id !== id);
      saveAndRender();
    });
  });
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Save to localStorage and re-render
function saveAndRender() {
  localStorage.setItem('dietRecords', JSON.stringify(records));
  render();
}

// Set today's date
function setTodayDate() {
  const now = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  todayDateEl.textContent = now.toLocaleDateString('zh-CN', options);
}

// Add record
form.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const foodName = foodInput.value.trim();
  const calories = parseInt(caloriesInput.value);
  const mealType = mealTypeSelect.value;
  const dateTime = mealTimeInput.value;
  
  if (!foodName || !calories || !dateTime) {
    alert('请填写完整信息');
    return;
  }
  
  const record = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    foodName,
    calories,
    mealType,
    dateTime
  };
  
  records.push(record);
  saveAndRender();
  
  // Reset form
  form.reset();
  setDefaultTime();
  foodInput.focus();
});

// Clear all
clearAllBtn.addEventListener('click', function() {
  if (records.length === 0) return;
  if (confirm('确定要清空所有饮食记录吗？')) {
    records = [];
    saveAndRender();
  }
});

// Init
setDefaultTime();
setTodayDate();
render();