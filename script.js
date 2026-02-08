
// --- 2. STATE MANAGEMENT ---
const defaultPots = [
    { id: 1, name: "Traditional Clay Pot", price: 499, category: "Clay", img: "https://i.postimg.cc/XYwPXGRD/Earthen-Clay-Water-Pot-Plain-Red-with-Metal-Tap-11-Liter-1.webp", images: ["https://i.postimg.cc/XYwPXGRD/Earthen-Clay-Water-Pot-Plain-Red-with-Metal-Tap-11-Liter-1.webp"], stock: true },
    { id: 2, name: "Designer Ceramic", price: 850, category: "Ceramic", img: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400", images: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400"], stock: true },
    { id: 3, name: "Diya", price: 149, category: "Diya", img: "https://i.postimg.cc/13BDXyzR/Screenshot_2026_02_06_17_32_28_581_com_flipkart_android.png,https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400", images: ["https://i.postimg.cc/13BDXyzR/Screenshot_2026_02_06_17_32_28_581_com_flipkart_android.png,https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400"], stock: true }
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
                      style="position:absolute; top:10px; right:10px; font-size:1.1rem; cursor:pointer;">
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
// 6. CHANGE QUANTITY: Cart lo quantity penchadam leda thagginchadam
function changeQty(id, d) {
    const idx = cart.findIndex(c => c.id === id);
    if(idx > -1) {
        cart[idx].quantity += d;
        // Quantity 1 kante thakkuva ayithe cart nundi theesesthundhi
        if(cart[idx].quantity < 1) cart.splice(idx, 1);
    } else if(d > 0) {
        // Kotha item ayithe cart lo add chesthundhi
        const p = pots.find(x => x.id === id);
        if(p) cart.push({...p, quantity: 1});
    }
    saveToStorage();
    updateCartUI();
    displayProducts(pots); // UI lo quantity count update avvadaniki
}

// 7. UPDATE CART UI: Cart page lo items list and Bill summary chupisthundhi
function updateCartUI() {
    const count = cart.reduce((t, i) => t + i.quantity, 0);
    document.getElementById('cart-count').innerText = count;
    
    const list = document.getElementById('cart-items-full');
    const btnContainer = document.getElementById('cart-buy-now-container');
    
    if(!list) return;
    
    if(cart.length === 0) {
        list.innerHTML = "<div class='account-box' style='border-radius:20px;'><h3>Cart Empty ra! Pots add chey.</h3></div>";
        if(btnContainer) btnContainer.innerHTML = "";
        return;
    }

    // Cart items display with rounded design
    list.innerHTML = cart.map(item => `
        <div class="account-box" style="display:flex; justify-content:space-between; align-items:center; border-radius:20px; padding:15px; margin-bottom:10px;">
            <img src="${item.img}" style="width:60px; height:60px; border-radius:12px; object-fit:cover;">
            <div style="flex-grow:1; margin-left:15px;">
                <b style="font-size:0.9rem;">${item.name}</b><br>
                <span style="color:#2E7D32;">₹${item.price} x ${item.quantity}</span>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
                <button class="btn-qty" onclick="changeQty(${item.id}, -1)" style="border-radius:8px;">-</button>
                <b>${item.quantity}</b>
                <button class="btn-qty" onclick="changeQty(${item.id}, 1)" style="border-radius:8px;">+</button>
            </div>
        </div>`).join('');

    let total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    if(btnContainer) {
        btnContainer.innerHTML = `
            <button class="checkout-btn" style="width:100%; border-radius:20px; font-size:1.1rem; padding:15px;" 
                    onclick="showPage('checkout')">
                Buy Now (Total: ₹${total})
            </button>`;
    }
}

// 8. HANDLE LOGIN: Manual login logic
function handleLogin() {
    const nameInput = document.getElementById('login-username');
    const name = nameInput ? nameInput.value.trim() : "";
    
    if(name) {
        isLoggedIn = true;
        localStorage.setItem('currentUser', name);
        localStorage.setItem('isLoggedIn', 'true');
        saveToStorage();
        updateAuthUI();
        alert("Welcome " + name + "!");
    } else {
        alert("Please enter your name ra!");
    }
}

// 9. HANDLE LOGOUT: Session clear chesthundhi
function handleLogout() {
    if(confirm("Sign out avthunnara?")) {
        isLoggedIn = false;
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        saveToStorage();
        updateAuthUI();
        showPage('home'); // Logout ayyaka home ki vellali
    }
}

// 10. TOGGLE MENU: Side navigation drawer open/close
function toggleMenu() {
    const menu = document.getElementById('side-menu');
    const overlay = document.getElementById('menu-overlay');
    
    if(!menu || !overlay) return;

    if(menu.style.right === '0px') {
        menu.style.right = '-280px';
        overlay.style.display = 'none';
    } else {
        menu.style.right = '0px';
        overlay.style.display = 'block';
    }
}


// 12. REMOVE PRODUCT FROM STORE: Firebase and local nundi product delete chesthundhi
function removeProductFromStore(id) {
    if (confirm("Ee product ni permanent ga theeseyala ra?")) {
        // 1. Firebase nundi remove chesthunnam
        database.ref('pots/' + id).remove()
            .then(() => {
                // 2. Local array update
                pots = pots.filter(p => p.id !== id);
                saveToStorage();
                adminSearchProducts(); // List refresh
                displayProducts(pots);
                alert("Product Removed Successfully!");
            })
            .catch(err => alert("Error: " + err.message));
    }
}




// 15. UPDATE CHECKOUT UI: Billing summary and delivery details chupisthundhi
function updateCheckoutUI() {
    const summary = document.getElementById('checkout-bill-summary');
    if (!summary) return;

    let subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    let delivery = 0; // Free delivery logic
    let total = subtotal + delivery;

    // Rounded design thoo billing box
    summary.innerHTML = `
        <div class="account-box" style="border-radius:20px; padding:20px; background:#FFF8E1; border: 1px solid #D7CCC8;">
            <h4 style="margin-bottom:15px; border-bottom:1px solid #ddd; padding-bottom:5px;">Bill Summary</h4>
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span>Items Total:</span> <b>₹${subtotal}</b>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span>Delivery Charges:</span> <b style="color:green;">FREE</b>
            </div>
            <hr style="border:0.5px solid #D7CCC8; margin:10px 0;">
            <div style="display:flex; justify-content:space-between; font-size:1.2rem; color:#3E2723;">
                <b>Total Payable:</b> <b>₹${total}</b>
            </div>
        </div>`;
}
// 16. PARSE JWT: Google Login nundi vache secure token ni decode chesthundhi
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// 17. PERFORM SEARCH: Search bar lo type chese text batti products ni filter chesthundhi
function performSearch() {
    const q = document.getElementById('main-search-input').value.toLowerCase().trim();
    // Search page lo filter ayina results matrame rounded design tho kanipisthayi
    const results = pots.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q)
    );
    displayProducts(results, 'search-results-list', 50);
}

// 18. HANDLE CREDENTIAL RESPONSE: Google login success ayyaka user  profile ni set chesthundhi
function handleCredentialResponse(response) {
    try {
        const user = parseJwt(response.credential);
        isLoggedIn = true;
        localStorage.setItem('currentUser', user.name);
        localStorage.setItem('isLoggedIn', 'true');
        saveToStorage();
        updateAuthUI();
        showPage('home'); // Login success ayyaka home ki vellali
        alert("Google Login Success! Welcome " + user.name);
    } catch (err) {
        console.error("Google Login Error:", err);
    }
}

// 19. UPDATE SHIP ADDRESS AREA: Dropdown lo address select chesthe textarea fill chesthundhi
function updateShipAddressArea() {
    const val = document.getElementById('select-address-dropdown').value;
    const addrArea = document.getElementById('ship-address');
    
    if (val && addresses[val]) {
        const a = addresses[val];
        // Empty fields unte neat ga filter chesthunnam ra
        const fullAddr = [a.house, a.village, a.city, a.pin]
            .filter(v => v && v.trim() !== "")
            .join(", ");
        addrArea.value = fullAddr;
    } else {
        addrArea.value = "";
    }
}

// 20. UPDATE ADDRESS SUMMARIES: Account page lo saved addresses ni refresh chesthundhi
function saveAddress() {
    // HTML nundi values collect chesthunnam
    const type = document.getElementById('addr-type').value; // Home or Office
    const house = document.getElementById('addr-house').value;
    const village = document.getElementById('addr-village').value;
    const city = document.getElementById('addr-city').value;
    const pin = document.getElementById('addr-pin').value;

    // Validate if all fields are filled
    if (!house || !city || !pin) {
        alert("Please fill all the details ra!");
        return;
    }

    // User login ayyi unte valla ID ki save chesthunnam
    if (currentUser) {
        const addrData = {
            type: type,
            house: house,
            village: village,
            city: city,
            pincode: pin
        };

        // Firebase loki push chesthunnam
        firebase.database().ref('users/' + currentUser.uid + '/address/' + type).set(addrData)
            .then(() => {
                alert(type + " Address saved successfully ra!");
                showPage('account');
            })
            .catch((error) => {
                console.error("Error saving address: ", error);
            });
    } else {
        alert("Please Login first ra!");
    }
}

// 21. FILTER CATEGORY: Home page and Menu bar nundi categories filter chesthundhi
function filterCategory(c) {
    // 1. Home page ki switch chesthunnam ra
    showPage('home'); 

    // 2. UI Tags highlight logic (Rounded tags kosam)
    document.querySelectorAll('.tag').forEach(t => {
        if(t.innerText.includes(c)) t.classList.add('active');
        else t.classList.remove('active');
    });

    // 3. Database nundi vachina pots ni filter chesthunnam
    const filtered = (c === 'All') ? pots : pots.filter(p => p.category === c);
    
    // 4. Grid refresh chesthunnam
    displayProducts(filtered);
}

// 22. IMAGE SLIDER LOGIC: Product detail page lo images scroll avvadaniki
function setupSlider() {
    const slider = document.getElementById('image-slider');
    if (!slider) return;
    
    // Slider rounded corners and smooth scrolling
    slider.style.display = 'flex';
    slider.style.overflowX = 'auto';
    slider.style.scrollSnapType = 'x mandatory';
    slider.style.borderRadius = '20px';
}

// 23. ADMIN LOGIN REDIRECT FIX: Admin panel open kakapothe idi kachithanga undali
function adminLoginRedirect() {
    const adminPage = document.getElementById('admin-page');
    if (adminPage) {
        showPage('admin');
        adminSearchProducts(); // Inventory refresh chesthundhi
    } else {
        console.error("Admin Page section dhorakadam ledu ra!");
    }
}

// 24. SAVE PRODUCT SYNC: Data save ayyaka devices anni refresh avvadaniki
function syncProductToAllDevices(id, productData) {
    database.ref('pots/' + id).set(productData)
        .then(() => {
            alert("Success: Saved & Synced to all devices!");
            // Admin panel lone unchi details clear chesthunnam ra
            document.getElementById('edit-pot-id').value = "";
            document.getElementById('new-pot-name').value = "";
            document.getElementById('new-pot-price').value = "";
            document.getElementById('new-pot-category').value = "";
            document.getElementById('new-pot-img').value = "";
            adminSearchProducts();
        })
        .catch(err => alert("Sync Error: " + err.message));
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
// 1. Address Save to Local Storage
function saveAddressLocal() {
    const addressData = {
        type: document.getElementById('addr-type').value,
        house: document.getElementById('addr-house').value,
        village: document.getElementById('addr-village').value,
        city: document.getElementById('addr-city').value,
        pin: document.getElementById('addr-pin').value
    };

    if (!addressData.house || !addressData.city) {
        alert("Arey, address details motham fill chey ra!");
        return;
    }

    // JSON format lo local storage lo save chesthunnam
    localStorage.setItem('userAddress', JSON.stringify(addressData));
    alert("Address Local Storage lo save ayindi ra! ✅");
    showPage('account');
}

// 2. Load Saved Address (Account page open ayinappudu idi call chey)
function loadSavedAddress() {
    const saved = localStorage.getItem('userAddress');
    if (saved) {
        const data = JSON.parse(saved);
        // Saved data ni inputs lo fill chesthunnam
        document.getElementById('addr-house').value = data.house;
        document.getElementById('addr-village').value = data.village;
        document.getElementById('addr-city').value = data.city;
        document.getElementById('addr-pin').value = data.pin;
    }
}

// 3. WhatsApp Redirect Function
function checkoutWhatsApp() {
    const savedAddress = localStorage.getItem('userAddress');
    if (!savedAddress) {
        alert("Arey, mundu address save chey ra!");
        showPage('address-manage-page');
        return;
    }

    const addr = JSON.parse(savedAddress);
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cartItems.length === 0) {
        alert("Cart empty ga undi ra!");
        return;
    }

    // Loading Box chupisthunnam
    document.getElementById('whatsapp-loader').style.display = 'block';

    let message = `*V V K POTS - NEW ORDER*%0A%0A`;
    message += `*Customer Address:*%0A${addr.house}, ${addr.village}, ${addr.city} - ${addr.pin}%0A%0A`;
    message += `*Items Ordered:*%0A`;

    let total = 0;
    cartItems.forEach(item => {
        message += `- ${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}%0A`;
        total += item.price * item.quantity;
    });

    message += `%0A*Total Amount: ₹${total}*%0A%0A_Arey, ventane order confirm chey ra!_`;

    // WhatsApp Number: +91 6301678881
    const whatsappUrl = `https://wa.me/916301678881?text=${message}`;

    // 2 seconds tharvatha redirect
    setTimeout(() => {
        window.location.href = whatsappUrl;
        document.getElementById('whatsapp-loader').style.display = 'none';
    }, 2000);
}

// --- 8. STARTUP LOGIC ---
window.onload = () => {
    loadPotsFromDB();
    updateAuthUI();
    showPage('home');
};
  
