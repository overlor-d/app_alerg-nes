const menuSetup = document.getElementById('menuSetup');
const mainContent = document.getElementById('mainContent');
const startBtn = document.getElementById('startBtn');
const addMenuBtn = document.getElementById('addMenuBtn');
const menuTitle = document.getElementById('menuTitle');
const contentArea = document.getElementById('contentArea');
const printMenuBtn = document.getElementById('printMenuBtn');
const menuTableBody = document.getElementById('menuTableBody');
const printArea = document.getElementById('printArea');

const dishTypes = ['entree', 'plat', 'dessert'];
const dishLabels = { entree: 'Entrée', plat: 'Plat', dessert: 'Dessert' };
const listIds = { entree: 'listEntrees', plat: 'listPlats', dessert: 'listDesserts' };

const allergenes = [
  'Gluten',
  'Crustacés',
  'Œufs',
  'Poisson',
  'Arachides',
  'Soja',
  'Lait',
  'Fruits à coque',
  'Céleri',
  'Moutarde',
  'Graines de sésame',
  'Sulfites',
  'Lupins',
  'Mollusques'
];

let menus = [];
let currentIndex = null;

function updateMenuTable() {
  menuTableBody.innerHTML = '';
  menus.forEach((m, i) => {
    const tr = document.createElement('tr');
    tr.className = i === currentIndex ? 'table-primary' : '';
    tr.innerHTML = `<td style="cursor:pointer">${m.name}</td>`;
    tr.addEventListener('click', () => selectMenu(i));
    menuTableBody.appendChild(tr);
  });
}

function selectMenu(index) {
  currentIndex = index;
  renderCurrentMenu();
  updateMenuTable();
}

function renderCurrentMenu() {
  const menu = menus[currentIndex];
  menuTitle.textContent = menu.name;
  renderDishes(menu.dishes);
}

function renderDishes(dishes) {
  dishTypes.forEach(type => {
    const listEl = document.getElementById(listIds[type]);
    listEl.innerHTML = '';
    dishes[type].forEach((dish, idx) => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `<div><strong>${dish.name}</strong>${dish.allergens.length ? `<br><small class="text-muted">Allergènes: ${dish.allergens.join(', ')}</small>` : ''}</div><div class="btn-group btn-group-sm no-print"><button class="btn btn-outline-danger delete-btn">🗑️</button></div>`;
      li.addEventListener('click', () => openEdit(type, idx));
      li.querySelector('.delete-btn').addEventListener('click', e => {
        e.stopPropagation();
        dishes[type].splice(idx, 1);
        renderDishes(dishes);
      });
      listEl.appendChild(li);
    });
  });
}

function openForm(type) {
  if (currentIndex === null) return;
  const label = dishLabels[type];
  contentArea.innerHTML = '';
  const form = document.createElement('div');
  form.className = 'card card-body mb-4';
  form.innerHTML = `
    <h5 class="card-title">Nouvelle ${label}</h5>
    <div class="mb-3">
      <label class="form-label">Nom de la ${label}</label>
      <input type="text" class="form-control" id="newName">
    </div>
    <div class="mb-3 overflow-auto" style="max-height:200px;">
      ${allergenes.map(all => `
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${all}" id="new_${all}">
        <label class="form-check-label" for="new_${all}">${all}</label>
      </div>
      `).join('')}
    </div>
    <div class="text-end">
      <button class="btn btn-primary" id="addBtn">Ajouter</button>
    </div>
  `;
  contentArea.appendChild(form);
  form.querySelector('#addBtn').addEventListener('click', e => {
    e.stopPropagation();
    const name = form.querySelector('#newName').value.trim();
    if (!name) return;
    const selected = Array.from(form.querySelectorAll('.form-check-input:checked')).map(cb => cb.value);
    menus[currentIndex].dishes[type].push({ name, allergens: selected });
    contentArea.innerHTML = '';
    renderCurrentMenu();
  });
}

function openEdit(type, idx) {
  const label = dishLabels[type];
  const dishes = menus[currentIndex].dishes;
  const dish = dishes[type][idx];
  contentArea.innerHTML = '';
  const form = document.createElement('div');
  form.className = 'card card-body mb-4';
  form.innerHTML = `
    <h5 class="card-title">Modifier ${label}</h5>
    <div class="mb-3">
      <label class="form-label">Nom de la ${label}</label>
      <input type="text" class="form-control" id="editName" value="${dish.name}">
    </div>
    <div class="mb-3 overflow-auto" style="max-height:200px;">
      ${allergenes.map(all => `
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${all}" id="edit_${all}" ${dish.allergens.includes(all) ? 'checked' : ''}>
        <label class="form-check-label" for="edit_${all}">${all}</label>
      </div>
      `).join('')}
    </div>
    <div class="text-end">
      <button class="btn btn-success me-2" id="saveBtn">Enregistrer</button>
      <button class="btn btn-danger" id="delBtn">Supprimer</button>
    </div>
  `;
  contentArea.appendChild(form);

  form.querySelector('#saveBtn').addEventListener('click', () => {
    const newName = form.querySelector('#editName').value.trim();
    if (!newName) return;
    const newAll = Array.from(form.querySelectorAll('.form-check-input:checked')).map(cb => cb.value);
    menus[currentIndex].dishes[type][idx] = { name: newName, allergens: newAll };
    contentArea.innerHTML = '';
    renderCurrentMenu();
  });

  form.querySelector('#delBtn').addEventListener('click', e => {
    e.stopPropagation();
    dishes[type].splice(idx, 1);
    contentArea.innerHTML = '';
    renderCurrentMenu();
  });
}

function addMenu(name) {
  menus.push({ name, dishes: { entree: [], plat: [], dessert: [] } });
  currentIndex = menus.length - 1;
  updateMenuTable();
  mainContent.classList.remove('d-none');
  menuSetup.classList.add('d-none');
  renderCurrentMenu();
}

startBtn.addEventListener('click', () => {
  const name = document.getElementById('menuName').value.trim();
  if (!name) return;
  addMenu(name);
});

addMenuBtn.addEventListener('click', () => {
  const name = prompt('Nom du nouveau menu:');
  if (name) addMenu(name.trim());
});

document.getElementById('addEntreeBtn').addEventListener('click', () => openForm('entree'));
document.getElementById('addPlatBtn').addEventListener('click', () => openForm('plat'));
document.getElementById('addDessertBtn').addEventListener('click', () => openForm('dessert'));

printMenuBtn.addEventListener('click', () => {
  printArea.innerHTML = '';
  menus.forEach(menu => {
    const div = document.createElement('div');
    div.className = 'section-print';
    div.innerHTML = `<h1 class="menu-title-print">${menu.name}</h1>`;
    dishTypes.forEach(type => {
      if (menu.dishes[type].length) {
        const section = document.createElement('div');
        section.innerHTML = `<h2>${dishLabels[type]}s</h2><ul>${menu.dishes[type].map(d => `<li>${d.name}${d.allergens.length ? ` - Allergènes: ${d.allergens.join(', ')}` : ''}</li>`).join('')}</ul>`;
        div.appendChild(section);
      }
    });
    printArea.appendChild(div);
  });
  window.print();
});

