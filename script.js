// --- 1. FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyBLukl9cIxfzOUuing87QgbImaMK7US7lk",
  authDomain: "vvk-pots.firebaseapp.com",
  databaseURL: "https://vvk-pots-default-rtdb.firebaseio.com",
  projectId: "vvk-pots",
  storageBucket: "vvk-pots.firebasestorage.app",
  messagingSenderId: "475009142869",
  appId: "1:475009142869:web:6ffff48dae98b2fe5f44dc",
  measurementId: "G-31RKTKRTV7"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// --- 2. STATE MANAGEMENT ---
const defaultPots = [
    { id: 1, name: "Traditional Clay Pot", price: 499, category: "Clay", img: "https://i.postimg.cc/XYwPXGRD/Earthen-Clay-Water-Pot-Plain-Red-with-Metal-Tap-11-Liter-1.webp", images: ["https://i.postimg.cc/XYwPXGRD/Earthen-Clay-Water-Pot-Plain-Red-with-Metal-Tap-11-Liter-1.webp"], stock: true },
    { id: 2, name: "Designer Ceramic", price: 850, category: "Ceramic", img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400", images: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400"], stock: true },
    { id: 3, name: "Diya", price: 149, category: "Diya", img: "https://i.postimg.cc/13BDXyzR/Screenshot_2026_02_06_17_32_28_581_com_flipkart_android.png", images: ["https://i.postimg.cc/13BDXyzR/Screenshot_2026_02_06_17_32_28_581_com_flipkart_android.png"], stock: true }
];

let pots = defaultPots;
let cart = JSON.parse(localStorage.getItem('vvk_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('vvk_wishlist')) || [];
let recentlyViewed = JSON.parse(localStorage.getItem('vvk_recent')) || [];
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
let addresses = JSON.parse(localStorage.getItem('vvk_addresses')) || { 1: null, 2: null };

function saveToStorage() {
    localStorage.setItem('vvk_cart', JSON.stringify(cart));
    localStorage.setItem('vvk_wishlist', JSON.stringify(wishlist));
    localStorage.setItem('vvk_recent', JSON.stringify(recentlyViewed));
    localStorage.setItem('isLoggedIn', isLoggedIn);
    localStorage.setItem('vvk_addresses', JSON.stringify(addresses));
}

// --- 3. DATABASE SYNC ---
function loadPotsFromDB() {
    database.ref('pots').on('value', (snapshot) => {
        const data = snapshot.val();
        pots = data ? Object.values(data) : defaultPots;
        displayProducts(pots);
        if(document.getElementById('admin-page').style.display === 'block') adminSearchProducts();
    });
}

// --- 4. UI ENGINE (Rounded & Device Friendly) ---
function displayProducts(data, containerId = 'product-list', limit = 50) {
    const list = document.getElementById(containerId);
    if(!list) return;
    list.innerHTML = data.slice(0, limit).map(p => {
        const isWished = wishlist.some(w => w.id === p.id);
        const cartItem = cart.find(c => c.id === p.id);
        const qty = cartItem ? cartItem.quantity : 0;
        return `
        <div class="product-card" style="border-radius:25px; overflow:hidden; border: 1px solid #ddd;">
            <div style="position:relative;">
                <img src="${p.img}" onclick="openProductDetail(${p.id})" style="width:100%; height:180px; object-fit:cover;">
                <span onclick="event.stopPropagation(); toggleWishlist(${p.id})" 
                      style="position:absolute; top:10px; right:10px; font-size:1.5rem; cursor:pointer;">
                    ${isWished ? '❤️' : '🤍'}
                </span>
            </div>
            <div style="padding:15px; text-align:center;">
                <h4 style="margin:5px 0;">${p.name}</h4>
                <p style="color:#2E7D32; font-weight:bold;">₹${p.price}</p>
                <button class="checkout-btn" onclick="changeQty(${p.id}, 1)" style="width:100%; border-radius:15px;">Add (${qty})</button>
            </div>
        </div>`;
    }).join('');
}

// --- 5. INVENTORY MANAGEMENT (No Home Redirect) ---
function saveProduct() {
    const idIn = document.getElementById('edit-pot-id').value;
    const name = document.getElementById('new-pot-name').value;
    const price = document.getElementById('new-pot-price').value;
    const cat = document.getElementById('new-pot-category').value;
    const imgStr = document.getElementById('new-pot-img').value;

    if(!name || !price || !imgStr) return alert("All fields are mandatory ra!");

    const id = idIn ? Number(idIn) : Date.now();
    const images = imgStr.split(',').map(s => s.trim());
    const productData = { id, name, price: Number(price), category: cat, img: images[0], images, stock: true };

    database.ref('pots/' + id).set(productData).then(() => {
        alert("Product Saved to Firebase!");
        // Clear inputs after save
        document.getElementById('edit-pot-id').value = "";
        document.getElementById('new-pot-name').value = "";
        document.getElementById('new-pot-price').value = "";
        document.getElementById('new-pot-category').value = "";
        document.getElementById('new-pot-img').value = "";
        // Refresh inventory list only, stay on admin page
        adminSearchProducts();
    });
}

function adminSearchProducts() {
    const list = document.getElementById('admin-remove-list');
    if(!list) return;
    list.innerHTML = pots.map(p => `
        <div class="account-box" style="display:flex; justify-content:space-between; align-items:center; border-radius:20px;">
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${p.img}" style="width:40px; height:40px; border-radius:10px; object-fit:cover;">
                <span>${p.name} (₹${p.price})</span>
            </div>
            <div>
                <button onclick="editProduct(${p.id})" style="background:orange; color:white; border:none; padding:5px 10px; border-radius:10px;">Edit</button>
                <button onclick="removeProductFromStore(${p.id})" style="background:red; color:white; border:none; padding:5px 10px; border-radius:10px;">X</button>
            </div>
        </div>`).join('');
}

// --- 6. ADDRESS & WHATSAPP REDIRECT ---
function saveAddress() {
    const type = document.getElementById('addr-type').value;
    const house = document.getElementById('addr-house').value;
    const village = document.getElementById('addr-village').value;
    const city = document.getElementById('addr-city').value;
    const pin = document.getElementById('addr-pin').value;
    if(!house || !city || !pin) return alert("Fill mandatory address details ra!");
    addresses[type] = { house, village, city, pin };
    saveToStorage();
    alert("Address Saved Successfully!");
}

function placeOrder() {
    const addr = document.getElementById('ship-address').value;
    if(!addr.trim()) return alert("Address kachithanga kottu ra!");
    document.getElementById('whatsapp-modal').style.display = 'flex';
    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const items = cart.map(i => `${i.name} (${i.quantity})`).join('%0A');
    const msg = `*NEW ORDER - VVK POTS*%0AItems:%0A${items}%0ATotal: ₹${total}%0AAddress: ${addr}`;
    setTimeout(() => {
        window.location.href = `https://wa.me/916301678881?text=${msg}`;
        cart = []; saveToStorage();
    }, 1500);
}

// --- 7. CORE UI FLOWS ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    const target = document.getElementById(pageId + '-page');
    if(target) target.style.display = 'block';
    window.scrollTo(0,0);
    if(pageId === 'cart') updateCartUI();
    if(pageId === 'checkout') updateCheckoutUI();
    if(pageId === 'wishlist') updateWishlistUI();
    if(pageId === 'recent') updateRecentUI();
    if(pageId === 'account') updateAuthUI();
}
// 1. UPDATE AUTH UI: Login/Profile display toggle chesthundhi
function updateAuthUI() {
    const profile = document.getElementById('user-profile');
    const login = document.getElementById('login-form');
    if(isLoggedIn) {
        profile.style.display = 'block';
        login.style.display = 'none';
        document.getElementById('user-name-display').innerText = localStorage.getItem('currentUser') || "User";
    } else {
        profile.style.display = 'none';
        login.style.display = 'block';
    }
}

// 2. OPEN PRODUCT DETAILS: Detail page load chesi image slider ready chesthundhi
function openProductDetail(id) {
    const p = pots.find(x => x.id === id);
    if(!p) return; 

    // Recently viewed logic update chesthunnam ra
    recentlyViewed = recentlyViewed.filter(r => r.id !== id);
    recentlyViewed.unshift(p);
    recentlyViewed = recentlyViewed.slice(0, 10); // Max 10 items mathrame unchutham
    saveToStorage();

    showPage('product-detail');
    
    document.getElementById('detail-name').innerText = p.name;
    document.getElementById('detail-price').innerText = `₹${p.price}`;
    
    const slider = document.getElementById('image-slider');
    const imgList = p.images && p.images.length > 0 ? p.images : [p.img];
    
    // Anni images slider lo rounded corners tho load avthayi
    slider.innerHTML = imgList.map(link => `
        <img src="${link}" onclick="viewFullImage(this.src)" 
             style="min-width:100%; height:300px; object-fit:cover; scroll-snap-align:start; border-radius:20px; cursor:zoom-in;">
    `).join('');
    
    // Qty logic refresh chesthunna ra
    const qty = (cart.find(c => c.id === id) || {quantity: 0}).quantity;
    document.getElementById('detail-qty-area').innerHTML = `
        <div style="display:flex; align-items:center; gap:20px; justify-content:center; margin:15px 0;">
            <button class="btn-large-fixed" style="border-radius:15px;" onclick="changeQty(${p.id}, -1); openProductDetail(${p.id})">-</button>
            <b style="font-size:1.2rem;">${qty}</b>
            <button class="btn-large-fixed" style="border-radius:15px;" onclick="changeQty(${p.id}, 1); openProductDetail(${p.id})">+</button>
        </div>`;
        
    document.getElementById('detail-buy-btn-area').innerHTML = `
        <button onclick="directBuy(${p.id})" class="checkout-btn" style="width:100%; border-radius:20px;">Buy Now</button>`;
    
    const isWished = wishlist.some(w => w.id === p.id);
    document.getElementById('detail-wishlist-icon').innerHTML = `
        <span onclick="toggleWishlist(${p.id}); openProductDetail(${p.id})">${isWished ? '❤️' : '🤍'}</span>`;
}

// 3. VIEW FULL IMAGE: Image zoom modal open chesthundhi
function viewFullImage(src) {
    const modal = document.getElementById('full-image-modal');
    const modalImg = document.getElementById('modal-img-content');
    if(modal && modalImg) {
        modal.style.display = "flex";
        modalImg.src = src;
    }
}

// 4. CLOSE FULL IMAGE: Zoom modal ni hide chesthundhi
function closeFullImage() {
    const modal = document.getElementById('full-image-modal');
    if(modal) modal.style.display = "none";
}

// 5. UPDATE RECENT UI: Recently viewed items grid ni update chesthundhi
function updateRecentUI() {
    const list = document.getElementById('recent-items-list');
    if(!list) return;
    if(recentlyViewed.length === 0) {
        list.innerHTML = "<div class='account-box' style='grid-column: 1 / -1; border-radius:20px;'><h3>Inka emi chudaledu ra!</h3></div>";
        return;
    }
    list.innerHTML = recentlyViewed.map(p => `
        <div class="product-card" style="border-radius:25px;">
            <img src="${p.img}" onclick="openProductDetail(${p.id})" style="width:100%; height:150px; object-fit:cover; border-radius:25px 25px 0 0;">
            <div style="padding:15px; text-align:center;">
                <b style="font-size:0.9rem;">${p.name}</b><br>
                <span style="color:#2e7d32; font-weight:bold;">₹${p.price}</span>
            </div>
        </div>`).join('');
}

function toggleWishlist(id) {
    const idx = wishlist.findIndex(w => w.id === id);
    if(idx > -1) wishlist.splice(idx, 1);
    else { const p = pots.find(x => x.id === id); if(p) wishlist.push(p); }
    saveToStorage();
    displayProducts(pots);
    if(document.getElementById('wishlist-page').style.display === 'block') updateWishlistUI();
}

function updateWishlistUI() {
    const list = document.getElementById('wishlist-items-list');
    if(!list || wishlist.length === 0) { list.innerHTML = "<h4>Wishlist is empty ra!</h4>"; return; }
    list.innerHTML = wishlist.map(p => `
        <div class="product-card" style="border-radius:25px;">
            <img src="${p.img}" onclick="openProductDetail(${p.id})">
            <div style="padding:10px; text-align:center;">
                <b>${p.name}</b><br>
                <button onclick="toggleWishlist(${p.id})" style="color:red; border:none; background:none;">Remove ❤️</button>
            </div>
        </div>`).join('');
}

// --- 8. STARTUP LOGIC ---
window.onload = () => {
    loadPotsFromDB();
    updateAuthUI();
    showPage('home');
};
  
