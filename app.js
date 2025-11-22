/* App logic using localStorage for persistence.
   Data structures:
   - items: [{id, name, unit, price, qty}]
   - sales: [{id, itemId, qty, price, dateISO}]
*/
const LS_ITEMS = "bar_items_v1";
const LS_SALES = "bar_sales_v1";

function uid(prefix="id"){return prefix + Math.random().toString(36).slice(2,9)}

// Storage helpers
function loadItems(){ return JSON.parse(localStorage.getItem(LS_ITEMS) || "[]") }
function saveItems(items){ localStorage.setItem(LS_ITEMS, JSON.stringify(items)) }
function loadSales(){ return JSON.parse(localStorage.getItem(LS_SALES) || "[]") }
function saveSales(sales){ localStorage.setItem(LS_SALES, JSON.stringify(sales)) }

function $(id){return document.getElementById(id)}
function q(sel){return document.querySelector(sel)}

function formatMoney(v){ return Number(v).toFixed(2).replace('.',',') }

function refreshSelects(){
  const items = loadItems()
  const e = $("e-item"); const s = $("s-item");
  e.innerHTML = ""; s.innerHTML = "";
  if(!items.length){
    const opt = document.createElement('option'); opt.text = "— nenhum produto —"; opt.value="";
    e.appendChild(opt); s.appendChild(opt.cloneNode(true));
    return;
  }
  items.forEach(it=>{
    const opt = document.createElement('option'); opt.value = it.id; opt.text = it.name + " (" + it.qty + " " + (it.unit||'') + ")";
    const opt2 = opt.cloneNode(true);
    e.appendChild(opt);
    s.appendChild(opt2);
  });
  populateInventoryTable();
}

function populateInventoryTable(){
  const items = loadItems()
  const tbody = q("#table-inventory tbody"); tbody.innerHTML = "";
  const alerts = $("stock-alerts"); alerts.innerHTML = "";
  items.forEach(it=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${it.name}</td>
      <td>${it.unit||''}</td>
      <td>${it.price? 'R$ '+formatMoney(it.price): '-'}</td>
      <td>${it.qty}</td>
      <td>
        <button class="action-btn btn outline" onclick="editItem('${it.id}')">Editar</button>
        <button class="action-btn btn outline" onclick="deleteItem('${it.id}')">Remover</button>
      </td>`;
    tbody.appendChild(tr);
    if(it.qty <= 5){
      const tag = document.createElement('span'); tag.className = 'stock-low'; tag.textContent = it.name + ' baixo: ' + it.qty;
      alerts.appendChild(tag);
    }
  });
}

function populateSalesTable(){
  const sales = loadSales().sort((a,b)=>new Date(b.date) - new Date(a.date));
  const tbody = q("#table-sales tbody"); tbody.innerHTML = "";
  sales.forEach(s=>{
    const items = loadItems();
    const it = items.find(x=>x.id===s.itemId) || {name: s.name || 'Produto removido'};
    const tr = document.createElement('tr');
    const val = Number(s.qty) * Number(s.price || 0);
    tr.innerHTML = `<td>${new Date(s.date).toLocaleString()}</td>
      <td>${it.name}</td>
      <td>${s.qty}</td>
      <td>${s.price? 'R$ '+formatMoney(s.price): '-'}</td>
      <td>R$ ${formatMoney(val)}</td>`;
    tbody.appendChild(tr);
  });
  populateSummary();
}

function populateSummary(){
  const sales = loadSales();
  // group by date (YYYY-MM-DD)
  const map = {};
  sales.forEach(s=>{
    const day = new Date(s.date).toISOString().slice(0,10);
    map[day] = map[day] || 0;
    map[day] += Number(s.qty) * Number(s.price || 0);
  });
  const container = $("sales-summary"); container.innerHTML = "";
  const days = Object.keys(map).sort((a,b)=>b.localeCompare(a)).slice(0,30);
  days.forEach(d=>{
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `<div class="small">${d}</div><div><strong>R$ ${formatMoney(map[d])}</strong></div>`;
    container.appendChild(card);
  });
}

function addItem(ev){
  ev.preventDefault();
  const name = $("p-name").value.trim();
  const unit = $("p-unit").value.trim();
  const price = parseFloat(($("p-price").value||"").replace(',','.')) || 0;
  const qty = parseInt($("p-qty").value||"0") || 0;
  if(!name) return alert("Nome e obrigatorio");
  const items = loadItems();
  const it = {id: uid('it_'), name, unit, price, qty};
  items.push(it);
  saveItems(items);
  $("form-add").reset();
  refreshSelects();
  populateSalesTable();
}

function clearAdd(){
  $("form-add").reset();
}

function registerEntry(ev){
  ev.preventDefault();
  const itemId = $("e-item").value;
  const qty = parseInt($("e-qty").value||"0") || 0;
  if(!itemId || qty<=0) return alert("Escolha produto e insira quantidade positiva");
  const items = loadItems();
  const it = items.find(x=>x.id===itemId);
  if(!it) return alert("Produto nao encontrado");
  it.qty = Number(it.qty) + Number(qty);
  saveItems(items);
  $("form-entry").reset();
  refreshSelects();
}

function registerSale(ev){
  ev.preventDefault();
  const itemId = $("s-item").value;
  const qty = parseInt($("s-qty").value||"0") || 0;
  const price = parseFloat(($("s-price").value||"").replace(',','.')) || 0;
  if(!itemId || qty<=0) return alert("Escolha produto e insira quantidade positiva");
  const items = loadItems();
  const it = items.find(x=>x.id===itemId);
  if(!it) return alert("Produto nao encontrado");
  if(it.qty < qty) return alert("Estoque insuficiente");
  it.qty = Number(it.qty) - Number(qty);
  saveItems(items);
  const sales = loadSales();
  const s = {id: uid('s_'), itemId, qty, price: price || it.price || 0, date: new Date().toISOString()};
  sales.push(s);
  saveSales(sales);
  $("form-sale").reset();
  refreshSelects();
  populateSalesTable();
}

function editItem(id){
  const items = loadItems();
  const it = items.find(x=>x.id===id);
  if(!it) return;
  const newName = prompt("Nome do produto:", it.name);
  if(newName===null) return;
  const newPrice = prompt("Preco (use . como separador):", it.price||'0');
  const newUnit = prompt("Unidade:", it.unit||'');
  it.name = newName.trim() || it.name;
  it.price = parseFloat((newPrice||"").replace(',','.')) || it.price;
  it.unit = (newUnit||"").trim();
  saveItems(items);
  refreshSelects();
}

function deleteItem(id){
  if(!confirm("Remover produto? Isso nao apagara vendas ja registradas.")) return;
  let items = loadItems();
  items = items.filter(x=>x.id!==id);
  saveItems(items);
  refreshSelects();
  populateSalesTable();
}

function exportJSON(){
  const payload = {items: loadItems(), sales: loadSales()};
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'bar-do-lago-export.json'; document.body.appendChild(a); a.click();
  a.remove(); URL.revokeObjectURL(url);
}

function importJSONFile(file){
  const reader = new FileReader();
  reader.onload = (e)=>{
    try{
      const data = JSON.parse(e.target.result);
      if(Array.isArray(data.items) && Array.isArray(data.sales)){
        saveItems(data.items);
        saveSales(data.sales);
        refreshSelects();
        populateSalesTable();
        alert('Importacao concluida.');
      } else {
        alert('Formato invalido. O JSON deve conter {items:[], sales:[]}');
      }
    }catch(err){ alert('Arquivo invalido'); }
  };
  reader.readAsText(file);
}

function init(){
  // attach handlers
  $("form-add").addEventListener('submit', addItem);
  $("btn-clear").addEventListener('click', clearAdd);
  $("form-entry").addEventListener('submit', registerEntry);
  $("form-sale").addEventListener('submit', registerSale);
  $("btn-export").addEventListener('click', exportJSON);
  $("btn-import").addEventListener('click', ()=> $("file-input").click());
  $("file-input").addEventListener('change', (ev)=> {
    const f = ev.target.files[0];
    if(f) importJSONFile(f);
    ev.target.value = '';
  });

  if(!localStorage.getItem(LS_ITEMS)){
    // seed with example
    const seed = [
      {id: uid('it_'), name: 'Cerveja Pilsen 350ml', unit:'un', price:6.50, qty:50},
      {id: uid('it_'), name: 'Refrigerante 2L', unit:'un', price:8.00, qty:20},
      {id: uid('it_'), name: 'Petisco - Porcao', unit:'porcao', price:18.00, qty:10},
    ];
    saveItems(seed);
  }

  refreshSelects();
  populateSalesTable();
}

window.addEventListener('DOMContentLoaded', init);
