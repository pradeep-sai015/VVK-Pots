/* =====================================================
   V V K POTS – COMPLETE LOGIC (NO FIREBASE)
   TOTAL FUNCTIONS: 32
===================================================== */

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

// ===== 3. SAVE STORAGE =====
function saveToStorage() {
    localStorage.setItem('vvk_cart', JSON.stringify(cart));
    localStorage.setItem('vvk_wishlist', JSON.stringify(wishlist));
    localStorage.setItem('vvk_recent', JSON.stringify(recentlyViewed));
    localStorage.setItem('isLoggedIn', isLoggedIn);
}

// ===== 4. PAGE NAVIGATION =====
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');

    const page = document.getElementById(id + '-page');
    if(page) page.style.display = 'block';

    window.scrollTo(0,0);

    if(id==='cart') updateCartUI();
    if(id==='wishlist') updateWishlistUI();
    if(id==='recent') updateRecentUI();
    if(id==='checkout') updateCheckoutUI();
    if(id==='account') updateAuthUI();
}

// ===== 5. DISPLAY PRODUCTS =====
function displayProducts(data, containerId='product-list') {
    const list = document.getElementById(containerId);
    if(!list) return;

    list.innerHTML = data.map(p => {

        const qty = (cart.find(c=>c.id===p.id)||{}).quantity || 0;
        const isWished = wishlist.some(w=>w.id===p.id);

        return `
        <div class="product-card" style="border-radius:25px;">
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

// ===== 6. OPEN DETAIL =====
function openProductDetail(id) {
    const p = pots.find(x=>x.id===id);
    if(!p) return;

    recentlyViewed = recentlyViewed.filter(r=>r.id!==id);
    recentlyViewed.unshift(p);
    recentlyViewed = recentlyViewed.slice(0,10);
    saveToStorage();

    showPage('product-detail');

    detail-name.innerText = p.name;
    detail-price.innerText = "₹"+p.price;

    image-slider.innerHTML = p.images.map(i =>
        `<img src="${i}" onclick="viewFullImage(this.src)">`
    ).join('');

    const qty = (cart.find(c=>c.id===id)||{}).quantity||0;

    detail-qty-area.innerHTML = `
        <button onclick="changeQty(${id},-1)">-</button>
        <b>${qty}</b>
        <button onclick="changeQty(${id},1)">+</button>
    `;

    detail-buy-btn-area.innerHTML = `
        <button onclick="showPage('checkout')">
            Buy Now
        </button>`;
}

// ===== 7. CART ADD/REMOVE =====
function changeQty(id,d) {
    const i = cart.findIndex(c=>c.id===id);

    if(i>-1) {
        cart[i].quantity+=d;
        if(cart[i].quantity<1) cart.splice(i,1);
    } else if(d>0) {
        const p = pots.find(x=>x.id===id);
        cart.push({...p, quantity:1});
    }

    saveToStorage();
    updateCartUI();
    displayProducts(pots);
}

// ===== 8. UPDATE CART UI =====
function updateCartUI() {
    cart-count.innerText =
        cart.reduce((s,i)=>s+i.quantity,0);

    if(cart.length===0) {
        cart-items-full.innerHTML="Cart Empty ra";
        return;
    }

    cart-items-full.innerHTML = cart.map(i=>`
        <div>
            <b>${i.name}</b>
            ₹${i.price} x ${i.quantity}

            <button onclick="changeQty(${i.id},-1)">-</button>
            <button onclick="changeQty(${i.id},1)">+</button>
        </div>
    `).join('');
}

// ===== 9. CHECKOUT UI =====
function updateCheckoutUI() {
    const total =
        cart.reduce((s,i)=>s+i.price*i.quantity,0);

    checkout-total-price.innerText = "₹"+total;

    updateCheckoutAddress();
}

// ===== 10. SAVE ADDRESS =====
function saveAddressLocal() {
    const data={
        type: addr-type.value,
        house: addr-house.value,
        village: addr-village.value,
        city: addr-city.value,
        pin: addr-pin.value
    };

    localStorage.setItem('userAddress',JSON.stringify(data));
    alert("Saved ra");
}

// ===== 11. LOAD ADDRESS =====
function updateCheckoutAddress() {
    const a=JSON.parse(localStorage.getItem('userAddress'));

    if(!a){
        display-address.innerText="Address not saved";
        return;
    }

    display-address.innerText=
        `${a.house}, ${a.village}, ${a.city} - ${a.pin}`;
}

// ===== 12. WHATSAPP ORDER =====
function checkoutWhatsApp() {
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

    whatsapp-loader.style.display='block';

    let msg="VVK ORDER%0A";

    cart.forEach(i=>{
        msg+=`${i.name} x ${i.quantity}%0A`;
    });

    msg+=`%0AAddress:%0A${a.house}, ${a.city}`;

    setTimeout(()=>{
        window.location.href=
        `https://wa.me/916301678881?text=${msg}`;
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

// ===== 14. WISHLIST UI =====
function updateWishlistUI(){
    if(wishlist.length===0){
        wishlist-items-list.innerHTML="Empty ra";
        return;
    }

    wishlist-items-list.innerHTML=
    wishlist.map(p=>`
        <div onclick="openProductDetail(${p.id})">
            <img src="${p.img}">
            <b>${p.name}</b>
        </div>
    `).join('');
}

// ===== 15. RECENT UI =====
function updateRecentUI(){
    recent-items-list.innerHTML=
    recentlyViewed.map(p=>`
        <div onclick="openProductDetail(${p.id})">
            <img src="${p.img}">
            <b>${p.name}</b>
        </div>
    `).join('');
}

// ===== 16. LOGIN =====
function handleLogin(){
    const n=login-username.value.trim();
    if(!n) return alert("Name enter chey");

    isLoggedIn=true;
    localStorage.setItem('currentUser',n);
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
        user-profile.style.display='block';
        login-form.style.display='none';
        user-name-display.innerText=
            localStorage.getItem('currentUser');
    } else {
        user-profile.style.display='none';
        login-form.style.display='block';
    }
}

// ===== 19. CATEGORY FILTER =====
function filterCategory(c){
    showPage('home');

    const f=c==='All'
        ? pots
        : pots.filter(p=>p.category===c);

    displayProducts(f);
}

// ===== 20. MENU =====
function toggleMenu(){
    if(side-menu.style.right==='0px'){
        side-menu.style.right='-280px';
        menu-overlay.style.display='none';
    } else {
        side-menu.style.right='0px';
        menu-overlay.style.display='block';
    }
}

// ===== 21. IMAGE MODAL =====
function viewFullImage(src){
    full-image-modal.style.display='flex';
    modal-img-content.src=src;
}

// ===== 22. CLOSE MODAL =====
function closeFullImage(){
    full-image-modal.style.display='none';
}

// ===== 23. GOOGLE LOGIN =====
function handleCredentialResponse(r){
    isLoggedIn=true;
    localStorage.setItem('currentUser',"Google User");
    updateAuthUI();
}

// ===== 24. ADMIN AUTH =====
function checkAdminAuth(){
    if(admin-user.value==="admin" &&
       admin-pass.value==="1234"){
        showPage('admin');
    } else alert("Wrong");
}

// ===== 25. ADMIN LOCK =====
function lockAdmin(){
    showPage('account');
}

// ===== 26. SAVE PRODUCT (LOCAL) =====
function saveProduct(){
    alert("Local mode – no server");
}

// ===== 27. SEARCH =====
function performSearch(){
    const q=main-search-input.value.toLowerCase();

    const r=pots.filter(p=>
        p.name.toLowerCase().includes(q)
    );

    displayProducts(r,'search-results-list');
}

// ===== 28. LOAD SAVED ADDRESS =====
function loadSavedAddress(){
    const d=JSON.parse(localStorage.getItem('userAddress'));
    if(!d) return;

    addr-house.value=d.house||"";
    addr-village.value=d.village||"";
    addr-city.value=d.city||"";
    addr-pin.value=d.pin||"";
}

// ===== 29. RESET CART =====
function clearCart(){
    cart=[];
    saveToStorage();
    updateCartUI();
}

// ===== 30. COUNT TOTAL =====
function getTotal(){
    return cart.reduce((s,i)=>s+i.price*i.quantity,0);
}

// ===== 31. INIT =====
window.addEventListener('DOMContentLoaded',()=>{
    displayProducts(pots);
    updateCartUI();
    updateAuthUI();
    loadSavedAddress();
});

// ===== 32. DEBUG =====
function debug(){
    console.log(cart,wishlist,recentlyViewed);
}
