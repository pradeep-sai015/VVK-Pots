// --- FIREBASE CONFIGURATION ---
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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// --- DATABASE LOADING LOGIC ---
function loadPotsFromDB() {
    database.ref('pots').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Database nundi data ni array ga marchi 'pots' variable loki load chesthunnam
            pots = Object.values(data);
            displayProducts(pots);
        } else {
            // Database empty ga unte default pots chupisthundhi
            pots = defaultPots;
            displayProducts(pots);
        }
    });
}

const defaultPots = [
    { id: 1, name: "Traditional Clay Pot", price: 499, category: "Clay", img: "https://i.postimg.cc/XYwPXGRD/Earthen-Clay-Water-Pot-Plain-Red-with-Metal-Tap-11-Liter-1.webp", images: ["https://i.postimg.cc/XYwPXGRD/Earthen-Clay-Water-Pot-Plain-Red-with-Metal-Tap-11-Liter-1.webp"], stock: true },
    { id: 2, name: "Designer Ceramic", price: 850, category: "Ceramic", img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400", images: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400"], stock: true },{ id: 3, name: "Diya", price: 149, category: "Diya", img: "https://i.postimg.cc/13BDXyzR/Screenshot_2026_02_06_17_32_28_581_com_flipkart_android.png", images: ["https://i.postimg.cc/13BDXyzR/Screenshot_2026_02_06_17_32_28_581_com_flipkart_android.png"], stock: true }
];

let pots = JSON.parse(localStorage.getItem('elite_store_pots')) || defaultPots;
let cart = JSON.parse(localStorage.getItem('elite_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('elite_wishlist')) || [];
let recentlyViewed = JSON.parse(localStorage.getItem('elite_recent')) || [];
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
let addresses = JSON.parse(localStorage.getItem('elite_addresses')) || { 1: null, 2: null };

const ADMIN_USERNAME = "V K K-POTS015";
const ADMIN_PASSWORD = "PRADEEP_SAI00";

function saveToStorage() {
    localStorage.setItem('elite_store_pots', JSON.stringify(pots));
    localStorage.setItem('elite_cart', JSON.stringify(cart));
    localStorage.setItem('elite_wishlist', JSON.stringify(wishlist));
    localStorage.setItem('elite_recent', JSON.stringify(recentlyViewed));
    localStorage.setItem('isLoggedIn', isLoggedIn);
    localStorage.setItem('elite_addresses', JSON.stringify(addresses));
    
}

// Function to link and show all pages correctly
function showPage(pageId) {
    // 1. First, hide all sections with class 'page'
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    
    // 2. Dynamic Linking: Click chesina page ID ki '-page' add chesi target chesthunnam
    // Example: 'privacy' click chesthe 'privacy-page' kanipisthundi
    const target = document.getElementById(pageId + '-page');
    
    if(target) {
        target.style.display = 'block';
        // Page start nundi kanipinchela top ki scroll chesthunna ra
        window.scrollTo(0, 0); 
    } else {
        console.error("Page not found !: " + pageId + "-page");
    }
    
    // 3. Page-specific logic refresh
    if(pageId === 'cart') updateCartUI();
    if(pageId === 'checkout') updateCheckoutUI();
    if(pageId === 'account') updateAuthUI();
    if(pageId === 'wishlist') updateWishlistUI();
    if(pageId === 'recent') updateRecentUI();
    
    // Note: Legal pages (privacy, terms, copyright) ki kotha logic akkarledu, 
    // endukante vatilo kevalam matter matrame undi ra.
}



// UI UPDATE: Login Form Hide Fix
function updateAuthUI() {
    const profile = document.getElementById('user-profile');
    const login = document.getElementById('login-form');
    if(isLoggedIn) {
        profile.style.display = 'block';
        login.style.display = 'none';
        document.getElementById('user-name-display').innerText = localStorage.getItem('currentUser');
    } else {
        profile.style.display = 'none';
        login.style.display = 'block';
    }
}

// SLIDER & RECENT FIX
function openProductDetail(id) {
    // 1. Correct ga pot ni find chesthunnam ra
    const p = pots.find(x => x.id === id);
    if(!p) return; 

    // 2. Recent viewed update
    recentlyViewed = recentlyViewed.filter(r => r.id !== id);
    recentlyViewed.unshift(p);
    saveToStorage();

    // 3. Detail page open
    showPage('product-detail');
    
    // 4. Content update logic
    document.getElementById('detail-name').innerText = p.name;
    document.getElementById('detail-price').innerText = `₹${p.price}`;
    
    const slider = document.getElementById('image-slider');
    const imgList = p.images && p.images.length > 0 ? p.images : [p.img];
    
    // IMAGE CLICK LOGIC ADDED HERE
    slider.innerHTML = imgList.map(link => `
        <img src="${link}" onclick="viewFullImage(this.src)" style="min-width:100%; height:300px; object-fit:cover; scroll-snap-align:start; border-radius:15px; cursor:zoom-in;">
    `).join('');
    
    const qty = (cart.find(c => c.id === id) || {quantity: 0}).quantity;
    document.getElementById('detail-qty-area').innerHTML = `
        <div style="display:flex; align-items:center; gap:20px; justify-content:center; margin:15px 0;">
            <button class="btn-large-fixed" onclick="changeQty(${p.id}, -1); openProductDetail(${p.id})">-</button>
            <b>${qty}</b>
            <button class="btn-large-fixed" onclick="changeQty(${p.id}, 1); openProductDetail(${p.id})">+</button>
        </div>`;
        
    document.getElementById('detail-buy-btn-area').innerHTML = `
        <button onclick="directBuy(${p.id})" class="checkout-btn" style="width:100%">Buy Now</button>`;
    
    const isWished = wishlist.some(w => w.id === p.id);
    document.getElementById('detail-wishlist-icon').innerHTML = `
        <span onclick="toggleWishlist(${p.id}); openProductDetail(${p.id})">${isWished ? '❤️' : '🤍'}</span>`;
}

// 5. Full Image View Functions (Add these at the end of script.js)
function viewFullImage(src) {
    const modal = document.getElementById('full-image-modal');
    const modalImg = document.getElementById('modal-img-content');
    if(modal && modalImg) {
        modal.style.display = "flex";
        modalImg.src = src;
    }
}

function closeFullImage() {
    const modal = document.getElementById('full-image-modal');
    if(modal) modal.style.display = "none";
}

function saveProduct() {
    const idIn = document.getElementById('edit-pot-id').value;
    const name = document.getElementById('new-pot-name').value;
    const price = document.getElementById('new-pot-price').value;
    const cat = document.getElementById('new-pot-category').value;
    const imgStr = document.getElementById('new-pot-img').value;

    if(!name || !price || !imgStr) return alert("Details kachithanga kottu ra!");

    const imgArr = imgStr.split(',').map(s => s.trim()).filter(s => s !== "");
    const newId = idIn ? Number(idIn) : Date.now();

    const productData = {
        id: newId, 
        name: name, 
        price: Number(price), 
        category: cat, 
        img: imgArr[0], 
        images: imgArr, 
        stock: true
    };

    // 1. Local update (UI Refresh kosam)
    if(idIn) {
        const idx = pots.findIndex(p => p.id == idIn);
        if(idx > -1) pots[idx] = productData;
    } else {
        pots.push(productData);
    }

    // 2. Firebase Database Sync (Main Line)
    database.ref('pots/' + newId).set(productData)
        .then(() => {
            alert("Success: Saved to Database!");
            // Resetting form
            document.getElementById('edit-pot-id').value = "";
            document.getElementById('new-pot-name').value = "";
            document.getElementById('new-pot-price').value = "";
            document.getElementById('new-pot-category').value = "";
            document.getElementById('new-pot-img').value = "";
            
            adminSearchProducts();
            displayProducts(pots);
            showPage('home'); // Home ki vellu ra
        })
        .catch(err => alert("Error: " + err.message));

    saveToStorage(); 
}


// ADMIN SAVE FIX: Multi-Image & Form Reset

    saveToStorage();
    document.getElementById('edit-pot-id').value = "";
    document.getElementById('new-pot-name').value = "";
    document.getElementById('new-pot-price').value = "";
    document.getElementById('new-pot-category').value = "";
    document.getElementById('new-pot-img').value = "";
    
    adminSearchProducts();
    displayProducts(pots);
    alert("Saved Successfully! Ikkade untavu chudu.");
    
    // ... (paina unna patha logic kachithanga undali ra) ...

    const newProduct = {
        id: newId,
        name: name,
        price: Number(price),
        category: cat,
        img: imgArr[0],
        images: imgArr,
        stock: true
    };

    // 1. Local storage lo save chesthunnam
    saveToStorage(); 

    // 2. Database loki pampalsina line IKKADA undali
    database.ref('pots/' + newId).set(newProduct)
        .then(() => alert("Saved to Database!"))
        .catch(err => console.error(err));

    // Form reset logic
    document.getElementById('edit-pot-id').value = "";
    // ... 
    }
    
}

// WISHLIST ❤️ SYMBOL FIX
function displayProducts(data, containerId = 'product-list', limit = 8) {
    const list = document.getElementById(containerId);
    if(!list) return;
    const displayData = data.slice(0, limit);
    list.innerHTML = displayData.map(p => {
        const qty = (cart.find(c => c.id === p.id) || {quantity: 0}).quantity;
        const isWished = wishlist.some(w => w.id === p.id);
        
        return `
        <div class="product-card">
            <div style="position:relative;">
                <img src="${p.img}" onclick="openProductDetail(${p.id})" style="border-radius: 20px 20px 0 0;">
                <span onclick="event.stopPropagation(); toggleWishlist(${p.id}); displayProducts(pots)" 
                      style="position:absolute; top:12px; right:12px; font-size:1.2rem; cursor:pointer; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                    ${isWished ? '❤️' : '🤍'}
                </span>
            </div>
            <div style="padding:12px; text-align:center;">
                <h3 style="font-size:0.9rem; margin:5px 0;">${p.name}</h3>
                <p style="color:#2e7d32; font-weight:bold; margin-bottom:10px;">₹${p.price}</p>
                <button class="checkout-btn" onclick="changeQty(${p.id}, 1)" style="width:100%; border-radius:12px;">Add (${qty})</button>
            </div>
        </div>`;
    }).join('');
}


// WISHLIST UI FIX
function updateWishlistUI() {
    const list = document.getElementById('wishlist-items-list');
    if(!list) return;
    if(wishlist.length === 0) {
        list.innerHTML = "<div class='account-box' style='grid-column: 1 / -1;'><h3>Wishlist khali ga undi ra!</h3></div>";
        return;
    }
    list.innerHTML = wishlist.map(p => `
        <div class="product-card">
            <img src="${p.img}" onclick="openProductDetail(${p.id})">
            <div style="padding:10px; text-align:center;">
                <b>${p.name}</b><br>₹${p.price}
                <button onclick="toggleWishlist(${p.id}); updateWishlistUI()" style="background:none; border:none; color:red; margin-top:5px; cursor:pointer;">Remove ❤️</button>
            </div>
        </div>`).join('');
}

// RECENT VIEWED UI FIX
function updateRecentUI() {
    const list = document.getElementById('recent-items-list');
    if(!list) return;
    if(recentlyViewed.length === 0) {
        list.innerHTML = "<div class='account-box' style='grid-column: 1 / -1;'><h3>Inka emi chudaledu ra!</h3></div>";
        return;
    }
    list.innerHTML = recentlyViewed.map(p => `
        <div class="product-card">
            <img src="${p.img}" onclick="openProductDetail(${p.id})">
            <div style="padding:10px; text-align:center;">
                <b>${p.name}</b><br>₹${p.price}
            </div>
        </div>`).join('');
}

// INVENTORY IMAGE FIX
function adminSearchProducts() {
    const t = document.getElementById('admin-search-remove').value.toLowerCase();
    const list = document.getElementById('admin-remove-list');
    if(!list) return;
    
    list.innerHTML = pots.filter(p => p.name.toLowerCase().includes(t)).map(p => `
        <div class="account-box" style="display:flex; justify-content:space-between; align-items:center; border-radius:20px; padding:15px; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:12px;">
                <img src="${p.img}" style="width:50px; height:50px; border-radius:10px; object-fit:cover; border: 1px solid #ddd;">
                <span><b>${p.name}</b><br><small>₹${p.price}</small></span>
            </div>
            <div style="display:flex; gap:8px;">
                <button onclick="editProduct(${p.id})" style="background:orange; color:white; border:none; padding:8px 12px; border-radius:10px;">Edit</button>
                <button onclick="removeProductFromStore(${p.id})" style="background:red; color:white; border:none; padding:8px 12px; border-radius:10px;">X</button>
            </div>
        </div>`).join('');
}

// CART & QTY
function changeQty(id, d) {
    const idx = cart.findIndex(c => c.id === id);
    if(idx > -1) {
        cart[idx].quantity += d;
        if(cart[idx].quantity < 1) cart.splice(idx, 1);
    } else if(d > 0) {
        const p = pots.find(x => x.id === id);
        if(p) cart.push({...p, quantity: 1, img: p.img, price: p.price, name: p.name});
    }
    saveToStorage();
    updateCartUI();
    displayProducts(pots);
}

function updateCartUI() {
    document.getElementById('cart-count').innerText = cart.reduce((t, i) => t + i.quantity, 0);
    const list = document.getElementById('cart-items-full');
    const buyBtn = document.getElementById('cart-buy-now-container');
    if(!list) return;
    if(cart.length === 0) { list.innerHTML="<h3>Cart Empty ra!</h3>"; if(buyBtn) buyBtn.innerHTML=""; return; }
    list.innerHTML = cart.map(item => `
        <div class="account-box" style="display:flex; justify-content:space-between; align-items:center;">
            <img src="${item.img}" style="width:50px; height:50px; border-radius:10px;">
            <div style="flex-grow:1; margin-left:10px;"><b>${item.name}</b><br>₹${item.price}</div>
            <div style="display:flex; gap:10px;"><button onclick="changeQty(${item.id}, -1)">-</button><b>${item.quantity}</b><button onclick="changeQty(${item.id}, 1)">+</button></div>
        </div>`).join('');
    let sub = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    if(buyBtn) buyBtn.innerHTML = `<button class="checkout-btn" style="width:90%; background:#2e7d32;" onclick="showPage('checkout')">Buy Now (Total: ₹${sub})</button>`;
}

// OTHERS
function toggleWishlist(id) {
    const idx = wishlist.findIndex(w => w.id === id);
    if(idx > -1) { wishlist.splice(idx, 1); } 
    else { const p = pots.find(x => x.id === id); if(p) wishlist.push(p); }
    saveToStorage();
}
function directBuy(id) { 
    const p = pots.find(x => x.id === id); 
    if(!cart.find(c => c.id === id)) cart.push({...p, quantity: 1, img: p.img, price: p.price, name: p.name}); 
    saveToStorage(); showPage('checkout'); 
}
function handleLogin() { 
    const n = document.getElementById('login-username').value; 
    if(n) { isLoggedIn = true; localStorage.setItem('currentUser', n); saveToStorage(); updateAuthUI(); } 
}
function handleLogout() { if(confirm("Sign out?")) { isLoggedIn = false; localStorage.removeItem('isLoggedIn'); localStorage.removeItem('currentUser'); saveToStorage(); updateAuthUI(); } }
function toggleMenu() { const m = document.getElementById('side-menu'); const o = document.getElementById('menu-overlay'); if(m.style.right === '0px') { m.style.right = '-280px'; o.style.display = 'none'; } else { m.style.right = '0px'; o.style.display = 'block'; } }
function checkAdminAuth() { if(document.getElementById('admin-user').value === ADMIN_USERNAME && document.getElementById('admin-pass').value === ADMIN_PASSWORD) showPage('admin'); else alert("Wrong!"); }
function lockAdmin() { showPage('account'); }
function editProduct(id) { const p = pots.find(x => x.id === id); document.getElementById('edit-pot-id').value = p.id; document.getElementById('new-pot-name').value = p.name; document.getElementById('new-pot-price').value = p.price; document.getElementById('new-pot-category').value = p.category; document.getElementById('new-pot-img').value = p.images ? p.images.join(',') : p.img; }
function removeProductFromStore(id) { if(confirm("Remove?")) { pots = pots.filter(p => p.id !== id); saveToStorage(); adminSearchProducts(); displayProducts(pots); } }
function filterCategory(c) {
    // 1. Home page ki switch chesthunnam
    showPage('home'); 

    // 2. Tags highlight logic
    document.querySelectorAll('.tag').forEach(t => {
        // Text match ayithe green color (active class) vasthundi
        if(t.innerText.includes(c)) t.classList.add('active');
        else t.classList.remove('active');
    });

    // 3. Exact Category match logic
    const filtered = (c === 'All') ? pots : pots.filter(p => p.category === c);
    
    // 4. Grid refresh
    displayProducts(filtered);
}

function saveAddress() {
    const t = document.getElementById('addr-type').value;
    
    // HTML nundi details teesukuntunnam ra
    const house = document.getElementById('addr-house').value.trim();
    const village = document.getElementById('addr-village').value.trim();
    const city = document.getElementById('addr-city').value.trim();
    const pin = document.getElementById('addr-pin').value.trim();
    
    if(!house || !city || !pin) return alert("Compulsory fill details House No, City and Pin !");

    // Object structure update chesa
    addresses[t] = { house, village, city, pin };
    
    saveToStorage();
    alert("Address Saved Successfully !");
    showPage('account');
}

function updateCheckoutUI() { let sub = cart.reduce((s, i) => s + (i.price * i.quantity), 0); const summary = document.getElementById('checkout-bill-summary'); summary.innerHTML = `<div class="account-box"><h4>Bill Summary</h4><div style="display:flex; justify-content:space-between;"><span>Items:</span><span>₹${sub}</span></div><div style="display:flex; justify-content:space-between;"><span>Delivery:</span><span style="color:green;">FREE</span></div><hr><div style="display:flex; justify-content:space-between; font-weight:bold;"><span>Payable:</span><span>₹${sub}</span></div></div>`; }
function placeOrder() {
    const addr = document.getElementById('ship-address').value;
    if(!addr.trim()) return alert("PLEASE WRITE ADDRESS !");

    // 1. WhatsApp Redirect Modal chupinchu ra
    document.getElementById('whatsapp-modal').style.display = 'flex';

    // 2. Order Details string generate chesthunnam
    let orderItems = cart.map(i => `• ${i.name} (Qty: ${i.quantity}) - ₹${i.price * i.quantity}`).join('%0A');
    let totalBill = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    
    // 3. Poorthi Message formatting
    let message = `*NEW ORDER - V K K POTS*%0A%0A` +
                  `*Items:*%0A${orderItems}%0A%0A` +
                  `*Total Payable:* ₹${totalBill}%0A%0A` +
                  `*Shipping Address:*%0A${addr.trim()}%0A%0A%0A%0A` +
                  `_Please confirm my order !_`;

    // 4. Redirect with full details
    setTimeout(() => {
        window.location.href = `https://wa.me/916301678881?text=${message}`;
        
        // Order success ayyaka cart clear chesthunnam ra
        cart = [];
        saveToStorage();
    }, 1500);
}

function parseJwt(token) { var base64Url = token.split('.')[1]; var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); return JSON.parse(window.atob(base64)); }
// Arey kevalam ee function ni matrame add chey ra
function performSearch() {
    // Search bar lo nuvvu kotte text ni teesukuntundi
    const q = document.getElementById('main-search-input').value.toLowerCase().trim();
    
    // Pots list lo filter chesthundhi
    const results = pots.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q)
    );
    
    // Filter ayina results ni search page grid lo chupisthundi
    displayProducts(results, 'search-results-list', 50);
}

function handleCredentialResponse(response) { const user = parseJwt(response.credential); isLoggedIn = true; localStorage.setItem('currentUser', user.name); saveToStorage(); updateAuthUI(); }
function updateShipAddressArea() {
    const val = document.getElementById('select-address-dropdown').value;
    const addrArea = document.getElementById('ship-address');
    
    // 1. Value and Address undho ledho check chesthunnam
    if (val && addresses[val]) {
        const a = addresses[val];
        
        // 2. Variable check: Okavela village leda pin lekapothe 'undefined' raakunda empty string ('') peduthunnam
        const h = a.house || '';
        const v = a.village || '';
        const c = a.city || '';
        const p = a.pin || '';
        
        // 3. Formatting: Anni kalipi neat ga comma thoo join chesthunnam ra
        // Filter(v => v) vadadam valla empty values unna chota extra commas raavu
        const fullAddr = [h, v, c, p].filter(v => v.trim() !== "").join(", ");
        
        addrArea.value = fullAddr;
    } else {
        addrArea.value = "";
    }
}

function updateAddressSummaries() { }

// Start
window.onload = () => {
    loadPotsFromDB();
};

updateAuthUI();
showPage('home');
}
