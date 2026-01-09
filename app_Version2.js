// ملفات ثابتة جاهزة: تحميل منتجات وغيرها
const productsGrid = document.getElementById('products-grid');
const categoryFilter = document.getElementById('category-filter');
const searchInput = document.getElementById('search');
const cartBtn = document.getElementById('cart-btn');
const cartDrawer = document.getElementById('cart-drawer');
const cartItemsEl = document.getElementById('cart-items');
const cartCountEl = document.getElementById('cart-count');
const cartTotalEl = document.getElementById('cart-total');
const yearEl = document.getElementById('year');
const modal = document.getElementById('product-modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

yearEl.textContent = new Date().getFullYear();

let products = [];
let cart = JSON.parse(localStorage.getItem('platinum_cart')||'[]');

function saveCart(){ localStorage.setItem('platinum_cart', JSON.stringify(cart)); renderCart(); }
function renderCart(){ cartCountEl.textContent = cart.reduce((s,p)=>s+p.qty,0); cartItemsEl.innerHTML=''; if(!cart.length){cartItemsEl.textContent='لا توجد منتجات'; cartTotalEl && (cartTotalEl.textContent='0 د.ج'); return;} let total=0; cart.forEach(i=>{ total+=i.price*i.qty; const el=document.createElement('div'); el.className='card'; el.innerHTML=`<div style="display:flex;justify-content:space-between"><div><strong>${i.name}</strong><div class="muted">${i.qty} × ${i.price} د.ج</div></div><button class="btn-ghost remove" data-id="${i.id}">حذف</button></div>`; cartItemsEl.appendChild(el); }); cartTotalEl && (cartTotalEl.textContent=total+' د.ج'); cartItemsEl.querySelectorAll('.remove').forEach(b=>b.onclick=()=>{cart=cart.filter(x=>x.id!==b.dataset.id); saveCart();}); }
function openCart(){cartDrawer.classList.add('open'); cartDrawer.setAttribute('aria-hidden','false');}
function closeCart(){cartDrawer.classList.remove('open'); cartDrawer.setAttribute('aria-hidden','true');}
document.getElementById('close-cart')?.addEventListener('click', closeCart);
document.getElementById('cart-btn')?.addEventListener('click', openCart);
modalClose?.addEventListener('click', ()=> modal.setAttribute('aria-hidden','true'));
modal?.addEventListener('click', (e)=> { if(e.target===modal) modal.setAttribute('aria-hidden','true'); });

async function loadProducts(){
  try{
    const r = await fetch('products.json'); products = await r.json();
    populateCategories(); renderProducts(products);
  }catch(e){
    productsGrid.innerHTML = `<div class="card"><p class="muted">فشل تحميل products.json. ضع الملف في نفس المجلد.</p></div>`;
    console.error(e);
  }
}
function populateCategories(){ const cats = Array.from(new Set(products.map(p=>p.category))); cats.forEach(c=>{ const o=document.createElement('option'); o.value=c; o.textContent=c; categoryFilter.appendChild(o); }); }
function renderProducts(list){
  productsGrid.innerHTML=''; if(!list.length){ productsGrid.innerHTML='<div class="card"><p class="muted">لا توجد منتجات</p></div>'; return; }
  list.forEach(p=>{ const el=document.createElement('article'); el.className='card'; el.innerHTML=`<img src="${p.image}" alt="${p.name}" style="width:100%;height:140px;object-fit:cover;border-radius:8px"/><h3>${p.name}</h3><div class="muted">${p.description}</div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px"><strong>${p.price} د.ج</strong><div><button class="btn add" data-id="${p.id}">أضف</button><button class="btn-ghost view" data-id="${p.id}">عرض</button></div></div>`; productsGrid.appendChild(el); });
  document.querySelectorAll('.add').forEach(b=>b.onclick=()=>{ const id=b.dataset.id; const p=products.find(x=>x.id===id); const ex=cart.find(c=>c.id===id); if(ex) ex.qty++; else cart.push({...p,qty:1}); saveCart(); openCart();});
  document.querySelectorAll('.view').forEach(b=>b.onclick=()=>{ const p=products.find(x=>x.id===b.dataset.id); modalBody.innerHTML=`<img src="${p.image}" style="width:100%;max-height:320px;object-fit:cover;border-radius:8px"/><h3>${p.name}</h3><p class="muted">${p.description}</p><div style="display:flex;justify-content:space-between"><strong>${p.price} د.ج</strong><button id="madd" class="btn">أضف</button></div>`; document.getElementById('madd').onclick=()=>{ const ex=cart.find(c=>c.id===p.id); if(ex) ex.qty++; else cart.push({...p,qty:1}); saveCart(); modal.setAttribute('aria-hidden','true'); openCart(); }; modal.setAttribute('aria-hidden','false'); });
}

searchInput?.addEventListener('input', ()=> { const q=searchInput.value.trim().toLowerCase(); const cat=categoryFilter.value; renderProducts(products.filter(p=> ( (!q) || p.name.toLowerCase().includes(q)||p.description.toLowerCase().includes(q) ) && (!cat||p.category===cat) )); });
categoryFilter?.addEventListener('change', ()=> searchInput.dispatchEvent(new Event('input')));

renderCart(); loadProducts();