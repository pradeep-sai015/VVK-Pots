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

// --- 2. DATA INITIALIZATION ---
const defaultPots = [
    { id: 1, name: "Traditional Clay Pot", price: 499, category: "Clay", img: "https://i.postimg.cc/XYwPXGRD/Earthen-Clay-Water-Pot-Plain-Red-with-Metal-Tap-11-Liter-1.webp", images: ["https://i.postimg.cc/XYwPXGRD/Earthen-Clay-Water-Pot-Plain-Red-with-Metal-Tap-11-Liter-1.webp"], stock: true },
    { id: 2, name: "Designer Ceramic", price: 850, category: "Ceramic", img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400", images: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400"], stock: true },
    { id: 3, name: "Diya", price: 149, category: "Diya", img: "https://i.postimg.cc/13BDXyzR/Screenshot_2026_02_06_17_32_28_581_com_flipkart_android.png", images: ["https://i.postimg.cc/13BDXyzR/Screenshot_2026_02_06_17_32_28_581_com_flipkart_android.png"], stock: true }
];

let pots = JSON.parse(localStorage.getItem('elite_store_pots')) || defaultPots;
let cart = JSON.parse(localStorage.getItem('elite_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('elite_wishlist')) || [];
let recentlyViewed = JSON.parse(localStorage.getItem('elite_recent')) || [];
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
let addresses = JSON.parse(localStorage.getItem('elite_addresses')) || { 1: null, 2: null };

const ADMIN_USERNAME = "V K K-POTS015";
const ADMIN_PASSWORD = "PRADEEP_SAI00";

// --- 3. STORAGE & DATABASE LOADING ---
function saveToStorage() {
    localStorage.setItem('elite_cart', JSON.stringify(cart));
    localStorage.setItem('elite_wishlist', JSON.stringify(wishlist));
    localStorage.setItem('elite_recent', JSON.stringify(recentlyViewed));
    localStorage.setItem('isLoggedIn', isLoggedIn);
    localStorage.setItem('elite_addresses', JSON.stringify(addresses));
}

function loadPotsFromDB() {
    database.ref('pots').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            pots = Object.values(data);
            displayProducts(pots);
        } else {
            pots = defaultPots;
            displayProducts(pots);
        }
    });
}

// --- 4. UI & NAVIGATION ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    const target = document.getElementById(pageId + '-page');
    if(target) {
        target.style.display = 'block';
        window.scrollTo(0, 0); 
    }
    if(pageId === 'cart') updateCartUI();
    if(pageId === 'checkout') updateCheckoutUI();
    if(pageId === 'account') updateAuthUI();
    if(pageId === 'wishlist') updateWishlistUI();
    if(pageId === 'recent') updateRecentUI();
}

function displayProducts(data, containerId = 'product-list', limit = 50) {
    const list = document.getElementById(containerId);
    if(!list) return;
    list.innerHTML = data.slice(0, limit).map(p => {
        const qty = (cart.find(c => c.id === p.id) || {quantity: 0}).quantity;
        const isWished = wishlist.some(w => w.id === p.id);
        return `
        <div class="product-card">
            <div style="position:relative;">
                <img src="${p.img}" onclick="openProductDetail(${p.id})" style="border-radius: 20px 20px 0 0;">
                <span onclick="event.stopPropagation(); toggleWishlist(${p.id}); displayProducts(pots)" 
                      style="position:absolute; top:12px; right:12px; font-size:1.2rem; cursor:pointer;">
                    ${isWished ? '❤️' : '🤍'}
                </span>
            </div>
            <div style="padding:12px; text-align:center;">
                <h3 style="font-size:0.9rem;">${p.name}</h3>
                <p style="color:#2e7d32; font-weight:bold;">₹${p.price}</p>
                <button class="checkout-btn" onclick="changeQty(${p.id}, 1)" style="width:100%;">Add (${qty})</button>
            </div>
        </div>`;
    }).join('');
}

// --- 5. PRODUCT DETAILS & RECENTLY VIEWED ---
function openProductDetail(id) {
    const p = pots.find(x => x.id === id);
    if(!p) return; 

    // Update Recently Viewed
    recentlyViewed = recentlyViewed.filter(r => r.id !== id);
    recentlyViewed.unshift(p);
    if(recentlyViewed.length > 10) recentlyViewed.pop();
    saveToStorage();

    showPage('product-detail');
    document.getElementById('detail-name').innerText = p.name;
    document.getElementById('detail-price').innerText = `₹${p.price}`;
    
    const slider = document.getElementById('image-slider');
    const imgList = p.images && p.images.length > 0 ? p.images : [p.img];
    slider.innerHTML = imgList.map(link => `<img src="${link}" onclick="viewFullImage(this.src)" style="min-width:100%; height:300px; object-fit:cover; border-radius:15px;">`).join('');
    
    const qty = (cart.find(c => c.id === id) || {quantity: 0}).quantity;
    document.getElementById('detail-qty-area').innerHTML = `<div style="display:flex; align-items:center; gap:20px; justify-content:center; margin:15px 0;"><button onclick="changeQty(${p.id}, -1); openProductDetail(${p.id})">-</button><b>${qty}</b><button onclick="changeQty(${p.id}, 1); openProductDetail(${p.id})">+</button></div>`;
    document.getElementById('detail-buy-btn-area').innerHTML = `<button onclick="directBuy(${p.id})" class="checkout-btn" style="width:100%">Buy Now</button>`;
    
    const isWished = wishlist.some(w => w.id === p.id);
    document.getElementById('detail-wishlist-icon').innerHTML = `<span onclick="toggleWishlist(${p.id}); openProductDetail(${p.id})">${isWished ? '❤️' : '🤍'}</span>`;
}

// --- 6. ADMIN & INVENTORY MANAGEMENT ---
function saveProduct() {
    const idIn = document.getElementById('edit-pot-id').value;
    const name = document.getElementById('new-pot-name').value;
    const price = document.getElementById('new-pot-price').value;
    const cat = document.getElementById('new-pot-category').value;
    const imgStr = document.getElementById('new-pot-img').value;

    if(!name || !price || !imgStr) return alert("Fill all details!");

    const imgArr = imgStr.split(',').map(s => s.trim()).filter(s => s !== "");
    const newId = idIn ? Number(idIn) : Date.now();

    const productData = { id: newId, name, price: Number(price), category: cat, img: imgArr[0], images: imgArr, stock: true };

    database.ref('pots/' + newId).set(productData).then(() => {
        alert("Saved to Database!");
        document.getElementById('edit-pot-id').value = "";
        adminSearchProducts();
        showPage('home');
    });
    saveToStorage();
}

function removeProductFromStore(id) {
    if(confirm("Delete this item?")) {
        database.ref('pots/' + id).remove().then(() => alert("Removed!"));
    }
}

function adminSearchProducts() {
    const t = document.getElementById('admin-search-remove').value.toLowerCase();
    const list = document.getElementById('admin-remove-list');
    if(!list) return;
    list.innerHTML = pots.filter(p => p.name.toLowerCase().includes(t)).map(p => `
        <div class="account-box" style="display:flex; justify-content:space-between; align-items:center;">
            <span><b>${p.name}</b> (₹${p.price})</span>
            <div><button onclick="editProduct(${p.id})">Edit</button> <button onclick="removeProductFromStore(${p.id})">X</button></div>
        </div>`).join('');
}

// --- 7. CART, WISHLIST & ACCOUNT ---
function changeQty(id, d) {
    const idx = cart.findIndex(c => c.id === id);
    if(idx > -1) {
        cart[idx].quantity += d;
        if(cart[idx].quantity < 1) cart.splice(idx, 1);
    } else if(d > 0) {
        const p = pots.find(x => x.id === id);
        if(p) cart.push({...p, quantity: 1});
    }
    saveToStorage();
    updateCartUI();
    displayProducts(pots);
}

function toggleWishlist(id) {
    const idx = wishlist.findIndex(w => w.id === id);
    if(idx > -1) wishlist.splice(idx, 1);
    else { const p = pots.find(x => x.id === id); if(p) wishlist.push(p); }
    saveToStorage();
    updateWishlistUI();
}

function updateWishlistUI() {
    const list = document.getElementById('wishlist-items-list');
    if(list) displayProducts(wishlist, 'wishlist-items-list');
}

function updateRecentUI() {
    const list = document.getElementById('recent-items-list');
    if(list) displayProducts(recentlyViewed, 'recent-items-list');
}

// --- 8. START LOGIC ---
window.onload = () => {
    loadPotsFromDB();
    updateAuthUI();
    showPage('home');
};

// ... (Paina missing unna small helper functions like viewFullImage, toggleMenu, handleLogin kooda deentlo unchali ra) ...
      
