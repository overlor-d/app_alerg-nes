/* ===== Menus & Allergènes (sans prix, PDF côté serveur) ===== */

const STORAGE_KEY = "menus_pdf_v1";
const EU_ALLERGENS = [
  "Céréales contenant du gluten","Crustacés","Œufs","Poissons","Arachides","Soja","Lait",
  "Fruits à coque","Céleri","Moutarde","Graines de sésame","Sulfites","Lupin","Mollusques"
];

let state = { menus: [], selectedMenuId: null };

/* Utils */
const uid = () => crypto.randomUUID?.() || String(Date.now()) + Math.random().toString(16).slice(2);
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const load = () => { try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) state = JSON.parse(raw); } catch (_) {} };
const getSelectedMenu = () => state.menus.find(m => m.id === state.selectedMenuId) || null;

/* DOM */
const menuSetup = document.getElementById("menuSetup");
const mainContent = document.getElementById("mainContent");

const startBtn = document.getElementById("startBtn");
const menuNameInput = document.getElementById("menuName");
const addMenuBtn = document.getElementById("addMenuBtn");
const menuTableBody = document.getElementById("menuTableBody");

const menuTools = document.getElementById("menuTools");
const renameInput = document.getElementById("renameInput");
const renameBtn = document.getElementById("renameBtn");
const deleteMenuBtn = document.getElementById("deleteMenuBtn");

const menuTitle = document.getElementById("menuTitle");
const listEntrees = document.getElementById("listEntrees");
const listPlats = document.getElementById("listPlats");
const listDesserts = document.getElementById("listDesserts");

const itemForm = document.getElementById("itemForm");
const itemCategory = document.getElementById("itemCategory");
const itemName = document.getElementById("itemName");
const itemNote  = document.getElementById("itemNote");
const allergenList = document.getElementById("allergenList");

const pdfBtn = document.getElementById("pdfBtn");

/* Allergènes */
function renderAllergenChoices() {
  allergenList.innerHTML = "";
  EU_ALLERGENS.forEach((a, idx) => {
    const col = document.createElement("div");
    col.className = "col";
    col.innerHTML = `
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="alg_${idx}" value="${a}">
        <label class="form-check-label" for="alg_${idx}">${a}</label>
      </div>
    `;
    allergenList.appendChild(col);
  });
}

/* Table des menus */
function renderMenusTable() {
  menuTableBody.innerHTML = "";
  if (state.menus.length === 0) {
    menuTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Aucun menu.</td></tr>`;
    return;
  }
  state.menus.forEach(menu => {
    const tr = document.createElement("tr");
    tr.className = (menu.id === state.selectedMenuId) ? "table-primary" : "";
    tr.innerHTML = `
      <td>
        <button class="btn btn-link p-0 text-decoration-none fw-semibold select-menu" data-id="${menu.id}">
          ${menu.name}
        </button>
      </td>
      <td class="text-center">${menu.entrees.length}</td>
      <td class="text-center">${menu.plats.length}</td>
      <td class="text-center">${menu.desserts.length}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-danger delete-menu" data-id="${menu.id}">Supprimer</button>
      </td>
    `;
    menuTableBody.appendChild(tr);
  });

  menuTableBody.querySelectorAll(".select-menu").forEach(btn => {
    btn.addEventListener("click", () => { state.selectedMenuId = btn.dataset.id; save(); refreshUI(); });
  });
  menuTableBody.querySelectorAll(".delete-menu").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const m = state.menus.find(x => x.id === id);
      if (!m) return;
      if (confirm(`Supprimer le menu « ${m.name} » ?`)) {
        state.menus = state.menus.filter(x => x.id !== id);
        if (state.selectedMenuId === id) state.selectedMenuId = state.menus[0]?.id || null;
        save(); refreshUI();
      }
    });
  });
}

/* Vue du menu sélectionné */
function renderSelectedMenu() {
  const menu = getSelectedMenu();
  if (!menu) {
    menuTitle.textContent = "";
    listEntrees.innerHTML = listPlats.innerHTML = listDesserts.innerHTML = "";
    menuTools.classList.add("d-none");
    return;
  }
  menuTitle.textContent = menu.name;
  renameInput.value = menu.name;
  menuTools.classList.remove("d-none");

  const renderList = (ul, items, cat) => {
    ul.innerHTML = "";
    items.forEach((it, idx) => {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-start";
      const allergens = it.allergens.map(a => `<span class="badge text-bg-secondary me-1">${a}</span>`).join("");
      const note  = it.note ? `<div class="small text-muted">${it.note}</div>` : "";
      li.innerHTML = `
        <div class="me-2">
          <div class="fw-semibold">${it.name}</div>
          ${note}
          <div class="mt-1">${allergens}</div>
        </div>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary edit-item" data-cat="${cat}" data-idx="${idx}">Éditer</button>
          <button class="btn btn-outline-danger delete-item" data-cat="${cat}" data-idx="${idx}">Suppr.</button>
        </div>
      `;
      ul.appendChild(li);
    });
  };

  renderList(listEntrees, menu.entrees, "entrees");
  renderList(listPlats,   menu.plats,   "plats");
  renderList(listDesserts,menu.desserts,"desserts");

  document.querySelectorAll(".delete-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.cat, idx = Number(btn.dataset.idx);
      if (!confirm("Supprimer cet élément ?")) return;
      getSelectedMenu()[cat].splice(idx, 1);
      save(); renderSelectedMenu(); renderMenusTable();
    });
  });

  document.querySelectorAll(".edit-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.cat, idx = Number(btn.dataset.idx);
      const it = getSelectedMenu()[cat][idx];
      itemCategory.value = cat;
      itemName.value = it.name;
      itemNote.value  = it.note  || "";
      allergenList.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = it.allergens.includes(cb.value));
      itemName.focus();
    });
  });
}

/* Refresh */
function refreshUI() {
  const hasMenus = state.menus.length > 0;
  menuSetup.classList.toggle("d-none", hasMenus);
  mainContent.classList.toggle("d-none", !hasMenus);
  renderMenusTable();
  renderSelectedMenu();
}

/* Actions */
startBtn?.addEventListener("click", () => {
  const name = (menuNameInput.value || "").trim() || "Nouveau menu";
  const menu = { id: uid(), name, entrees: [], plats: [], desserts: [] };
  state.menus.unshift(menu);
  state.selectedMenuId = menu.id;
  save(); refreshUI();
});

addMenuBtn?.addEventListener("click", () => {
  const name = prompt("Nom du nouveau menu :", "Nouveau menu");
  if (!name) return;
  const menu = { id: uid(), name: name.trim(), entrees: [], plats: [], desserts: [] };
  state.menus.unshift(menu);
  state.selectedMenuId = menu.id;
  save(); refreshUI();
});

renameBtn?.addEventListener("click", () => {
  const m = getSelectedMenu(); if (!m) return;
  const newName = (renameInput.value || "").trim();
  if (!newName) return;
  m.name = newName; save(); refreshUI();
});

deleteMenuBtn?.addEventListener("click", () => {
  const m = getSelectedMenu(); if (!m) return;
  if (!confirm(`Supprimer le menu « ${m.name} » ?`)) return;
  state.menus = state.menus.filter(x => x.id !== m.id);
  state.selectedMenuId = state.menus[0]?.id || null;
  save(); refreshUI();
});

itemForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const m = getSelectedMenu(); if (!m) return;

  const name = itemName.value.trim();
  if (!name) { itemName.focus(); return; }

  const allergens = Array.from(allergenList.querySelectorAll("input:checked")).map(cb => cb.value);
  const obj = { id: uid(), name, note: itemNote.value.trim(), allergens };

  const cat = itemCategory.value;
  const existingIdx = m[cat].findIndex(x => x.name === obj.name);
  if (existingIdx >= 0) m[cat][existingIdx] = obj; else m[cat].push(obj);

  itemName.value = ""; itemNote.value = "";
  allergenList.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = false);

  save(); renderSelectedMenu(); renderMenusTable();
});

/* Génération PDF côté serveur */
pdfBtn?.addEventListener("click", async () => {
  try {
    const payload = { menus: state.menus.map(m => ({
      name: m.name,
      entrees: m.entrees || [],
      plats: m.plats || [],
      desserts: m.desserts || []
    })) };
    const res = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "menus.pdf";
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
  } catch (e) {
    alert("Impossible de générer le PDF : " + e.message);
  }
});

/* Init */
renderAllergenChoices();
load();
refreshUI();
