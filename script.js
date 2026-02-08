/*************************************************
 V V K POTS – FULL LOCAL VERSION (NO FIREBASE)
 TOTAL FUNCTIONS: 34
*************************************************/

// ===== 1. DATA =====
const defaultPots = [
  {
    id: 1,
    name: "Traditional Clay Pot",
    price: 499,
    category: "Clay",
    img: "https://i.postimg.cc/XYwPXGRD/Earthen-Clay-Water-Pot-Plain-Red-with-Metal-Tap-11-Liter-1.webp",
    images: [
      "https://i.postimg.cc/XYwPXGRD/Earthen-Clay-Water-Pot-Plain-Red-with-Metal-Tap-11-Liter-1.webp"
    ]
  },
  {
    id: 2,
    name: "Designer Ceramic",
    price: 850,
    category: "Ceramic",
    img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400",
    images: [
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400"
    ]
  },
  {
    id: 3,
    name: "Diya",
    price: 149,
    category: "Diya",
    img: "https://i.postimg.cc/13BDXyzR/Screenshot_2026_02_06_17_32_28_581_com_flipkart_android.png",
    images: [
      "https://i.postimg.cc/13BDXyzR/Screenshot_2026_02_06_17_32_28_581_com_flipkart_android.png"
    ]
  }
];

// ===== 2. STATE =====
let pots = defaultPots;
let cart = JSON.parse(localStorage.getItem('vvk_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('vvk_wishlist')) || [];
let recentlyViewed = JSON.parse(localStorage.getItem('vvk_recent')) || [];
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

// ===== 3. STORAGE =====
function saveToStorage() {
  localStorage.setItem('vvk_cart', JSON.stringify(cart));
  localStorage.setItem('vvk_wishlist', JSON.stringify(wishlist));
  localStorage.setItem('vvk_recent', JSON.stringify(recentlyViewed));
  localStorage.setItem('isLoggedIn', isLoggedIn);
}

// ===== 4. NAVIGATION =====
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.style.display='none');

  const page = document.getElementById(id + '-page');
  if(page) page.style.display='block';

  window.scrollTo(0,0);

  if(id==='cart') updateCartUI();
  if(id==='wishlist') updateWishlistUI();
  if(id==='recent') updateRecentUI();
  if(id==='checkout') updateCheckoutUI();
  if(id==='account') updateAuthUI();
}

// ===== 5. DISPLAY =====
function displayProducts(data) {
  const list = document.getElementById('product-list');
  if(!list) return;

  list.innerHTML = data.map(p => {

    const qty = (cart.find(c=>c.id===p.id)||{}).quantity||0;
    const isWished = wishlist.some(w=>w.id===p.id);

    return `
    <div class="product-card">
      <div style="position:relative;">
        <img src="${p.img}" onclick="openProductDetail(${p.id})">

        <span onclick="event.stopPropagation(); toggleWishlist(${p.id})"
              style="position:absolute; top:8px; right:8px;">
          ${isWished?'❤️':'🤍'}
        </span>
      </div>

      <div style="padding:10px; text-align:center;">
        <b>${p.name}</b><br>
        ₹${p.price}<br>

        <button onclick="changeQty(${p.id},1)">
          Add (${qty})
        </button>
      </div>
    </div>`;
  }).join('');
}

// ===== 6. DETAIL =====
function openProductDetail(id) {
  const p = pots.find(x=>x.id===id);
  if(!p) return;

  recentlyViewed = recentlyViewed.filter(r=>r.id!==id);
  recentlyViewed.unshift(p);
  recentlyViewed = recentlyViewed.slice(0,10);
  saveToStorage();

  showPage('product-detail');

  document.getElementById('detail-name').innerText=p.name;
  document.getElementById('detail-price').innerText="₹"+p.price;

  document.getElementById('image-slider').innerHTML=
    p.images.map(i=>`<img src="${i}" onclick="viewFullImage(this.src)">`).join('');

  const qty=(cart.find(c=>c.id===id)||{}).quantity||0;

  document.getElementById('detail-qty-area').innerHTML=`
    <button onclick="changeQty(${id},-1)">-</button>
    <b>${qty}</b>
    <button onclick="changeQty(${id},1)">+</button>
  `;

  document.getElementById('detail-buy-btn-area').innerHTML=`
    <button onclick="showPage('checkout')">Buy Now</button>`;
}

// ===== 7. CART LOGIC =====
function changeQty(id,d){
  const i=cart.findIndex(c=>c.id===id);

  if(i>-1){
    cart[i].quantity+=d;
    if(cart[i].quantity<1) cart.splice(i,1);
  }else if(d>0){
    const p=pots.find(x=>x.id===id);
    cart.push({...p,quantity:1});
  }

  saveToStorage();
  updateCartUI();
  displayProducts(pots);
}
// ===== 8. CART UI =====
function updateCartUI() {

  const list = document.getElementById('cart-items-full');
  const buyBox = document.getElementById('cart-buy-now-container');

  if (cart.length === 0) {
    list.innerHTML = "<h3>Cart Empty</h3>";
    buyBox.innerHTML = "";
    return;
  }

  list.innerHTML = cart.map(i => `
    <div class="account-box cart-row">

      <img src="${i.img}" class="cart-img">

      <div class="cart-info">
        <b>${i.name}</b><br>
        <span class="qty-text">Qty: ${i.quantity}</span>
      </div>

      <div class="cart-actions">
        <button onclick="changeQty(${i.id},-1)">-</button>
        <button onclick="changeQty(${i.id},1)">+</button>
      </div>

    </div>
  `).join('');

  buyBox.innerHTML = `
    <button class="checkout-btn" onclick="showPage('checkout')">
      Buy Now
    </button>`;
}
// ===== 9. CHECKOUT =====
function updateCheckoutUI() {

  const box = document.getElementById('checkout-items');

  const total = getTotal();

  box.innerHTML = `
    <div class="account-box">

      <h3>Bill Summary</h3>

      <div>Items Total: ₹${total}</div>
      <div>Delivery: FREE</div>

      <hr>

      <b>Total Payable: ₹${total}</b>

    </div>`;
}

// ===== 10. SAVE ADDRESS =====
function saveAddressLocal() {

  const data = {
    type: document.getElementById('addr-type').value,
    house: document.getElementById('addr-house').value,
    village: document.getElementById('addr-village').value,
    city: document.getElementById('addr-city').value,
    pin: document.getElementById('addr-pin').value
  };

  localStorage.setItem('userAddress', JSON.stringify(data));

  alert("Saved ra");
}
// ===== 11. LOAD ADDRESS =====
function updateCheckoutAddress(){
  const a=JSON.parse(localStorage.getItem('userAddress'));
  const d=document.getElementById('display-address');

  if(!a){
    d.innerText="Address not saved";
    return;
  }

  d.innerText=`${a.house}, ${a.village},// ===== 10. SAVE ADDRESS =====
function saveAddressLocal() {

  const data = {
    type: document.getElementById('addr-type').value,
    house: document.getElementById('addr-house').value,
    village: document.getElementById('addr-village').value,
    city: document.getElementById('addr-city').value,
    pin: document.getElementById('addr-pin').value
  };

  localStorage.setItem('userAddress', JSON.stringify(data));

  alert("Saved ra");
} ${a.city} - ${a.pin}`;
}

// ===== 12. WHATSAPP =====
function checkoutWhatsApp(){
  const a=JSON.parse(localStorage.getItem('userAddress'));

  if(!a){
    alert("Address save chey");
    showPage('address-manage');
    return;
  }

  if(cart.length===0){
    alert("Cart empty");
    return;
  }

  document.getElementById('whatsapp-loader').style.display='block';

  let msg="VVK ORDER%0A";
  cart.forEach(i=>msg+=`${i.name} x ${i.quantity}%0A`);
  msg+=`%0AAddress:%0A${a.house}, ${a.city}`;

  setTimeout(()=>{
    window.location.href=`https://wa.me/916301678881?text=${msg}`;
  },1500);
}

// ===== 13. WISHLIST =====
function toggleWishlist(id){
  const i=wishlist.findIndex(w=>w.id===id);

  if(i>-1) wishlist.splice(i,1);
  else wishlist.push(pots.find(p=>p.id===id));

  saveToStorage();
  displayProducts(pots);
}
function updateWishlistUI() {

  const list = document.getElementById('wishlist-items-list');

  if (wishlist.length === 0) {
    list.innerHTML = "<h3>Wishlist empty ra</h3>";
    return;
  }

  list.innerHTML = wishlist.map(p => `
    <div class="product-card">

      <img src="${p.img}"
           onclick="openProductDetail(${p.id})">

      <div style="text-align:center;padding:8px;">

        <b>${p.name}</b><br>

        <button onclick="toggleWishlist(${p.id})"
                style="background:#ffdddd;border:none;">
          Remove
        </button>

      </div>
    </div>
  `).join('');
}

// ===== 15. RECENT UI =====
function updateRecentUI(){
  const list=document.getElementById('recent-items-list');
  if(!list)return;

  list.innerHTML=recentlyViewed.map(p=>`
    <div onclick="openProductDetail(${p.id})">
      <img src="${p.img}">
      <b>${p.name}</b>
    </div>
  `).join('');
}
function handleLogin() {

  const name =
    document.getElementById('login-username').value.trim();

  if (!name) return alert("Name enter chey ra");

  isLoggedIn = true;

  localStorage.setItem('currentUser', name);

  document.getElementById('user-name-display').innerText = name;

  updateAuthUI();
}

// ===== 17. LOGOUT =====
function handleLogout(){
  isLoggedIn=false;
  localStorage.removeItem('currentUser');
  updateAuthUI();
}

// ===== 18. AUTH UI =====
function updateAuthUI(){
  if(isLoggedIn){
    document.getElementById('user-profile').style.display='block';
    document.getElementById('login-form').style.display='none';
    document.getElementById('user-name-display').innerText=
      localStorage.getItem('currentUser');
  }else{
    document.getElementById('user-profile').style.display='none';
    document.getElementById('login-form').style.display='block';
  }
}

function filterCategory(c) {

  // color highlight
  document.querySelectorAll('.tag').forEach(t => {
    if (t.innerText.includes(c)) {
      t.style.background = "#2E7D32";
      t.style.color = "white";
    } else {
      t.style.background = "#eee";
      t.style.color = "black";
    }
  });

  showPage('home');

  const filtered = c === 'All'
      ? pots
      : pots.filter(p => p.category === c);

  displayProducts(filtered);
}

// ===== 20. MENU =====
function toggleMenu(){
  const menu=document.getElementById('side-menu');
  const over=document.getElementById('menu-overlay');

  if(menu.style.right==='0px'){
    menu.style.right='-280px';
    over.style.display='none';
  }else{
    menu.style.right='0px';
    over.style.display='block';
  }
}

// ===== 21. IMAGE MODAL =====
function viewFullImage(src){
  document.getElementById('full-image-modal').style.display='flex';
  document.getElementById('modal-img-content').src=src;
}

// ===== 22. CLOSE MODAL =====
function closeFullImage(){
  document.getElementById('full-image-modal').style.display='none';
}

// ===== 23. GOOGLE =====
function handleCredentialResponse(response) {

  const data = JSON.parse(
    atob(response.credential.split('.')[1])
  );

  isLoggedIn = true;

  localStorage.setItem('currentUser', data.name);

  document.getElementById('user-name-display')
    .innerText = data.name;

  updateAuthUI();
}

// ===== 24. ADMIN =====
function checkAdminAuth(){
  const u=document.getElementById('admin-user').value;
  const p=document.getElementById('admin-pass').value;

  if(u==="admin"&&p==="1234") showPage('admin');
  else alert("Wrong");
}

// ===== 25. LOCK ADMIN =====
function lockAdmin(){ showPage('account'); }

// ===== 26. SAVE PRODUCT =====
function saveProduct(){ alert("Local mode"); }

// ===== 27. SEARCH =====
function performSearch() {

  const q =
    document.getElementById('main-search-input')
      .value.toLowerCase().trim();

  // search all products
  const results = pots.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  );

  displayProducts(results, 'search-results-list');
}

// ===== 28. LOAD ADDRESS =====
function loadSavedAddress(){
  const d=JSON.parse(localStorage.getItem('userAddress'));
  if(!d)return;

  document.getElementById('addr-house').value=d.house||"";
  document.getElementById('addr-village').value=d.village||"";
  document.getElementById('addr-city').value=d.city||"";
  document.getElementById('addr-pin').value=d.pin||"";
}

// ===== 29. CLEAR CART =====
function clearCart(){
  cart=[];
  saveToStorage();
  updateCartUI();
}

// ===== 30. GET TOTAL =====
function getTotal(){
  return cart.reduce((s,i)=>s+i.price*i.quantity,0);
}

// ===== 31. DIRECT BUY =====
function directBuy(id){
  changeQty(id,1);
  showPage('checkout');
}

// ===== 32. RECENT ADD =====
function addRecent(p){
  recentlyViewed.unshift(p);
  saveToStorage();
}

// ===== 33. RESET =====
function resetApp(){
  localStorage.clear();
  location.reload();
}

// ===== 34. INIT =====
window.addEventListener('DOMContentLoaded',()=>{
  displayProducts(pots);
  updateCartUI();
  updateAuthUI();
  loadSavedAddress();
});
