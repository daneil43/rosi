// بسيط: يعرض منتجات من products.json ويتعامل مع سلة محلية
const productsGrid = document.getElementById('products-grid');
const categoryFilter = document.getElementById('category-filter');
const searchInput = document.getElementById('search');
const cartBtn = document.getElementById('cart-btn');
const cartDrawer = document.getElementById('cart-drawer');
const cartItemsEl = document.getElementById('cart-items');
const cartCountEl = document.getElementById('cart-count');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = null;
const yearEl = document.getElementById('year');
const modal = document.getElementById('product-modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');
yearEl.textContent = new Date().getFullYear();

let products = [];
let cart = JSON.parse(localStorage.getItem('platinum_cart') || '[]');

function saveCart(){ localStorage.setItem('platinum_cart', JSON.stringify(cart)); renderCart(); }
function renderCart(){
  cartCountEl.textContent = cart.reduce((s,p)=>s+p.qty,0);
  cartItemsEl.innerHTML = '';
  if(cart.length===0){ cartItemsEl.textContent = 'لم يتم إضافة أي منتجات بعد.'; cartTotalEl.textContent = '0 د.ج'; return; }
  let total = 0;
  cart.forEach(item=>{
    total += item.price * item.qty;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.style.display = 'flex';
    el.style.justifyContent = 'space-between';
    el.style.padding = '8px 6px';
    el.innerHTML = `<div>
      <div style="font-weight:700">${item.name}</div>
      <div style="color:#6b7280;font-size:13px">${item.qty} × ${item.price} د.ج</div>
    </div>
    <div>
      <button data-id="${item.id}" class="remove-btn btn-ghost" style="font-size:13px">حذف</button>
    </div>`;
    cartItemsEl.appendChild(el);
  });
  cartTotalEl.textContent = `${total} د.ج`;
  cartItemsEl.querySelectorAll('.remove-btn').forEach(b=>{
    b.addEventListener('click', ()=>{ const id=Number(b.dataset.id); cart=cart.filter(ci=>ci.id!==id); saveCart(); });
  });
}

function openCart(){ cartDrawer.classList.add('open'); cartDrawer.setAttribute('aria-hidden','false'); }
function closeCart(){ cartDrawer.classList.remove('open'); cartDrawer.setAttribute('aria-hidden','true'); }

cartBtn?.addEventListener('click', ()=> openCart());
document.getElementById('close-cart')?.addEventListener('click', ()=> closeCart());
modalClose?.addEventListener('click', ()=> { modal.setAttribute('aria-hidden','true'); });
modal?.addEventListener('click', (e)=> { if(e.target===modal) modal.setAttribute('aria-hidden','true'); });

async function loadProducts(){
  try{
    const res = await fetch('products.json');
    products = await res.json();
    populateCategories();
    renderProducts(products);
  }catch(e){
    productsGrid.innerHTML = `<div class="card"><p class="muted">فشل تحميل بيانات المنتجات. تأكد من وجود ملف products.json على الخادم.</p></div>`;
    console.error(e);
  }
}

function populateCategories(){
  const cats = Array.from(new Set(products.map(p=>p.category))).sort();
  cats.forEach(c=>{
    const opt = document.createElement('option');
    opt.value=c; opt.textContent=c;
    categoryFilter.appendChild(opt);
  });
}

function renderProducts(list){
  productsGrid.innerHTML = '';
  if(list.length===0){ productsGrid.innerHTML = `<div class="card"><p class="muted">لا توجد منتجات تطابق البحث.</p></div>`; return; }
  list.forEach(p=>{
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <img loading="lazy" src="${p.image}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <div class="desc">${p.description}</div>
      <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;gap:10px">
        <div class="price">${p.price} د.ج</div>
        <div>
          <button class="btn add-btn" data-id="${p.id}">أضف إلى السلة</button>
          <button class="btn-ghost view-btn" data-id="${p.id}">عرض</button>
        </div>
      </div>
    `;
    productsGrid.appendChild(el);
  });

  document.querySelectorAll('.add-btn').forEach(b=>{
    b.addEventListener('click', ()=> {
      const id=Number(b.dataset.id);
      const prod = products.find(x=>x.id===id);
      const exists = cart.find(c=>c.id===id);
      if(exists) exists.qty++;
      else cart.push({ ...prod, qty: 1 });
      saveCart();
      openCart();
    });
  });

  document.querySelectorAll('.view-btn').forEach(b=>{
    b.addEventListener('click', ()=> {
      const id=Number(b.dataset.id); const p = products.find(x=>x.id===id);
      modalBody.innerHTML = `
        <div style="display:flex;gap:14px;flex-direction:column">
          <img src="${p.image}" alt="${p.name}" style="max-height:300px;width:100%;object-fit:cover;border-radius:8px" />
          <h3 style="margin:6px 0">${p.name}</h3>
          <p class="muted">${p.description}</p>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
            <div style="font-weight:700">${p.price} د.ج</div>
            <div>
              <button class="btn" id="modal-add">أضف إلى السلة</button>
            </div>
          </div>
        </div>
      `;
      document.getElementById('modal-add').addEventListener('click', ()=>{
        const exists = cart.find(c=>c.id===p.id);
        if(exists) exists.qty++; else cart.push({ ...p, qty:1 });
        saveCart();
        modal.setAttribute('aria-hidden','true');
        openCart();
      });
      modal.setAttribute('aria-hidden','false');
    });
  });
}

searchInput?.addEventListener('input', ()=>{
  const q = searchInput.value.trim().toLowerCase();
  const cat = categoryFilter.value;
  const filtered = products.filter(p=>{
    const matchesQ = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    const matchesCat = !cat || p.category === cat;
    return matchesQ && matchesCat;
  });
  renderProducts(filtered);
});

categoryFilter?.addEventListener('change', ()=> searchInput.dispatchEvent(new Event('input')));

// init
renderCart();
loadProducts();