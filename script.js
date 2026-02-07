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

// --- 3. DATABASE & SYNC ---
function loadPotsFromDB() {
    database.ref('pots').on('value', (snapshot) => {
        const data = snapshot.val();
        pots = data ? Object.values(data) : defaultPots;
        displayProducts(pots);
        if(document.getElementById('admin-page').style.display !== 'none') adminSearchProducts();
    });
}

// --- 4. UI ENGINE (Everything Rounded) ---
function displayProducts(data, containerId = 'product-list', limit = 50) {
    const list = document.getElementById(containerId);
    if(!list) return;
    list.innerHTML = data.slice(0, limit).map(p => {
        const isWished = wishlist.some(w => w.id === p.id);
        const cartItem = cart.find(c => c.id === p.id);
        const qty = cartItem ? cartItem.quantity : 0;
        return `
        <div class="product-card" style="border-radius:25px; overflow:hidden;">
            <div style="position:relative;">
                <img src="${p.img}" onclick="openProductDetail(${p.id})" style="width:100%; height:180px; object-fit:cover;">
                <span onclick="event.stopPropagation(); toggleWishlist(${p.id})" 
                      style="position:absolute; top:10px; right:10px; font-size:1.5rem; cursor:pointer; filter:drop-shadow(0 0 2px black);">
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

// --- 5. PAGE ROUTING & SEARCH ---
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

function performSearch() {
    const q = document.getElementById('main-search-input').value.toLowerCase();
    const results = pots.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    displayProducts(results, 'search-results-list');
}

// --- 6. CART & CHECKOUT (WhatsApp Redirect) ---
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

function updateCartUI() {
    const count = cart.reduce((t, i) => t + i.quantity, 0);
    document.getElementById('cart-count').innerText = count;
    const list = document.getElementById('cart-items-full');
    const btnContainer = document.getElementById('cart-buy-now-container');
    if(cart.length === 0) { list.innerHTML = "<h4>Cart is empty!</h4>"; btnContainer.innerHTML = ""; return; }
    list.innerHTML = cart.map(i => `
        <div class="account-box" style="display:flex; justify-content:space-between; align-items:center; border-radius:20px;">
            <img src="${i.img}" style="width:50px; height:50px; border-radius:10px;">
            <div style="flex:1; margin-left:10px;"><b>${i.name}</b><br>₹${i.price}</div>
            <div style="display:flex; gap:10px;"><button onclick="changeQty(${i.id},-1)">-</button><b>${i.quantity}</b><button onclick="changeQty(${i.id},1)">+</button></div>
        </div>`).join('');
    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    btnContainer.innerHTML = `<button class="checkout-btn" style="width:90%; border-radius:20px;" onclick="showPage('checkout')">Buy Now (Total: ₹${total})</button>`;
}

function placeOrder() {
    const addr = document.getElementById('ship-address').value;
    if(!addr.trim()) return alert("Please provide address!");
    document.getElementById('whatsapp-modal').style.display = 'flex';
    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const items = cart.map(i => `${i.name} x ${i.quantity}`).join(', ');
    const msg = encodeURIComponent(`*NEW ORDER*\nItems: ${items}\nTotal: ₹${total}\nAddress: ${addr}`);
    setTimeout(() => {
        window.location.href = `https://wa.me/916301678881?text=${msg}`;
        cart = []; saveToStorage();
    }, 1500);
}

// --- 7. ADDRESS MANAGEMENT (Full Details) ---
function saveAddress() {
    const type = document.getElementById('addr-type').value;
    const house = document.getElementById('addr-house').value;
    const village = document.getElementById('addr-village').value;
    const city = document.getElementById('addr-city').value;
    const pin = document.getElementById('addr-pin').value;
    if(!house || !village || !city || !pin) return alert("Fill all address details!");
    addresses[type] = { house, village, city, pin };
    saveToStorage();
    alert("Address Saved!");
    showPage('account');
}

// --- 8. INVENTORY MANAGEMENT (Edit & Save Fix) ---
function saveProduct() {
    const idIn = document.getElementById('edit-pot-id').value;
    const name = document.getElementById('new-pot-name').value;
    const price = document.getElementById('new-pot-price').value;
    const cat = document.getElementById('new-pot-category').value;
    const imgStr = document.getElementById('new-pot-img').value;
    if(!name || !price || !imgStr) return alert("Fill all details!");
    const id = idIn ? Number(idIn) : Date.now();
    const images = imgStr.split(',').map(s => s.trim());
    const data = { id, name, price: Number(price), category: cat, img: images[0], images, stock: true };
    
    database.ref('pots/' + id).set(data).then(() => {
        alert("Product Saved to Firebase!");
        // Clear inputs
        document.getElementById('edit-pot-id').value = "";
        document.getElementById('new-pot-name').value = "";
        document.getElementById('new-pot-price').value = "";
        document.getElementById('new-pot-category').value = "";
        document.getElementById('new-pot-img').value = "";
        adminSearchProducts(); // Refresh list without going home
    });
}

function adminSearchProducts() {
    const list = document.getElementById('admin-remove-list');
    list.innerHTML = pots.map(p => `
        <div class="account-box" style="display:flex; justify-content:space-between; align-items:center; border-radius:20px;">
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${p.img}" style="width:40px; height:40px; border-radius:10px;">
                <span>${p.name} (₹${p.price})</span>
            </div>
            <div>
                <button onclick="editProduct(${p.id})" style="background:orange; color:white; border:none; padding:5px 10px; border-radius:10px;">Edit</button>
                <button onclick="removeProductFromStore(${p.id})" style="background:red; color:white; border:none; padding:5px 10px; border-radius:10px;">X</button>
            </div>
        </div>`).join('');
}

// --- 9. STARTUP ---
window.onload = () => {
    loadPotsFromDB();
    updateAuthUI();
    showPage('home');
};

// ... (Other functions like toggleWishlist, handleLogin, etc. remain as provided in previous versions)
