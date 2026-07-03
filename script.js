import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBja7CFCWgkA9BatRobvBFsv3G5v5JNmvU",
  authDomain: "sell-web-bed1.firebaseapp.com",
  databaseURL: "https://sell-web-bed1-default-rtdb.firebaseio.com",
  projectId: "sell-web-bed1",
  storageBucket: "sell-web-bed1.firebasestorage.app",
  messagingSenderId: "228289800494",
  appId: "1:228289800494:web:d6e6ff6eb0c791d0dbf2bf",
  measurementId: "G-VRF81277ED"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const fallbackCatalogue = [
  { id: 1001, category: "cat_1", titleFr: "Lit Double Capitonnée Velours Royal", titleAr: "سرير كابيتوني ملكي مزدوج لشخصين فاخر", price: 88000, img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=600", colors: ["#8B6239", "#000000"] },
  { id: 1002, category: "cat_2", titleFr: "Armoire Dressing Prestige en Hêtre 6 Portes", titleAr: "خزانة ملابس فاخرة 6 أبواب من خشب الزان الأصلي", price: 165000, img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=600", colors: ["#8B6239", "#FFFFFF"] }
];

const fallbackCategories = [
  { id: "cat_all", labelAr: "الكل", labelFr: "Tout" },
  { id: "cat_1", labelAr: "أسرّة النوم", labelFr: "Lits" },
  { id: "cat_2", labelAr: "خزائن الملابس ودريسنج", labelFr: "Armoires" }
];

const fallbackDetails = {
  brandName: "DzMobilier",
  heroTitleAr: "أثاث فاخر يناسب ذوقك",
  heroDescAr: "اكتشف تشكيلاتنا الراقية من أسرّة النوم وخزائن الملابس المصنوعة بأعلى جودة وعناية.",
  whatsapp: "213550000000",
  phoneCall: "0550000000",
  googleMapsUrl: "https://maps.google.com"
};

let currentLang = 'AR';
let currentFilterCategoryId = "cat_all";

// Stable stringify helper that sorts keys to prevent JSON ordering differences from triggering re-renders!
function stableStringify(data) {
  if (data === null || data === undefined) return '';
  if (typeof data !== 'object') return JSON.stringify(data);
  if (Array.isArray(data)) {
    return '[' + data.map(stableStringify).join(',') + ']';
  }
  const keys = Object.keys(data).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + stableStringify(data[k])).join(',') + '}';
}

// Read from localStorage first so that admin settings load DIRECTLY without waiting for Firebase!
let savedItems = null;
let savedCategories = null;
let savedDetails = null;
try {
  savedItems = JSON.parse(localStorage.getItem('dzMobilier_saved_items'));
  savedCategories = JSON.parse(localStorage.getItem('dzMobilier_saved_categories'));
  savedDetails = JSON.parse(localStorage.getItem('dzMobilier_saved_details'));
} catch (e) {
  console.log('Error reading localStorage cache:', e);
}

let dbData = { 
  items: (savedItems && Array.isArray(savedItems) && savedItems.length > 0) ? savedItems : fallbackCatalogue, 
  categories: (savedCategories && Array.isArray(savedCategories) && savedCategories.length > 0) ? savedCategories : fallbackCategories, 
  details: (savedDetails && typeof savedDetails === 'object') ? savedDetails : fallbackDetails 
};

/* ========== LOADING STATE ========== */
function showLoading() {
  const grid = document.getElementById('mainCatalogGrid');
  if (grid) grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;font-family:Cairo;color:#888;padding:40px 0;">جارٍ تحميل المنتجات...</p>';
}

function applyLanguageInterfaceLayout(lang) {
  const isAr = lang === 'AR';
  document.documentElement.lang = isAr ? 'ar' : 'fr';
  document.documentElement.dir = isAr ? 'rtl' : 'ltr';
  const setIfDifferent = (id, text) => {
    const el = document.getElementById(id);
    if (el && el.innerText !== text) el.innerText = text;
  };
  setIfDifferent('navLinkHome', isAr ? 'الرئيسية' : 'Accueil');
  setIfDifferent('navLinkCatalog', isAr ? 'المعرض' : 'Catalogue');
  setIfDifferent('navLinkContact', isAr ? 'اتصل بنا' : 'Contact');
  setIfDifferent('filterSectionTitle', isAr ? 'تصفح حسب الأصناف' : 'Parcourir par catégories');
  setIfDifferent('catalogSectionTitle', isAr ? 'أحدث قطع الأثاث المضافة' : 'Nos derniers produits');
  setIfDifferent('heroBtnText', isAr ? 'تصفح المعرض الآن' : 'Découvrir le Catalogue');
  setIfDifferent('footerContactTitle', isAr ? 'اتصل بنا أو تفضل بزيارة صالة عرضنا' : 'Contactez-nous ou visitez notre showroom');
}

function pullShowroomSettingsAndBubbles(lang) {
  const details = dbData.details || fallbackDetails;
  const logoContainer = document.getElementById('mainLogoPlace');
  if (logoContainer && details.brandName) {
    const newLogoHtml = `<span class="logo-gold">${details.brandName.substring(0,2)}</span><span class="logo-white">${details.brandName.substring(2)}</span>`;
    if (logoContainer.innerHTML !== newLogoHtml) logoContainer.innerHTML = newLogoHtml;
  }
  if (details.brandLogoBase64) {
    const hLogo = document.getElementById('headerLogoImg');
    const hrLogo = document.getElementById('heroLogoImg');
    if (hLogo && hLogo.src !== details.brandLogoBase64) { hLogo.src = details.brandLogoBase64; hLogo.style.display = 'block'; }
    if (hrLogo && hrLogo.src !== details.brandLogoBase64) { hrLogo.src = details.brandLogoBase64; hrLogo.style.display = 'block'; }
  }
  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el && el.innerText !== txt) el.innerText = txt;
  };
  setTxt('heroDynamicTitle', details.heroTitleAr || 'أثاث فاخر يناسب ذوقك');
  setTxt('heroDynamicDesc', details.heroDescAr || 'اكتشف تشكيلاتنا الراقية من أسرّة النوم وخزائن الملابس المصنوعة بأعلى جودة وعناية.');
  setTxt('footerPhone', details.phoneCall || '0550000000');

  const callBtn = document.getElementById('floatCall');
  const locationBtn = document.getElementById('floatLocation');
  const fbBtn = document.getElementById('floatFb');
  const instaBtn = document.getElementById('floatInsta');
  const tiktokBtn = document.getElementById('floatTiktok');

  if (callBtn) callBtn.href = `tel:${details.phoneCall || '0550000000'}`;
  if (locationBtn) locationBtn.href = details.googleMapsUrl || 'https://maps.google.com';
  if (fbBtn) { if (details.facebook && details.facebook.trim() !== "") { fbBtn.href = details.facebook; fbBtn.style.display = "flex"; } else { fbBtn.style.display = "none"; } }
  if (instaBtn) { if (details.instagram && details.instagram.trim() !== "") { instaBtn.href = details.instagram; instaBtn.style.display = "flex"; } else { instaBtn.style.display = "none"; } }
  if (tiktokBtn) { if (details.tiktok && details.tiktok.trim() !== "") { tiktokBtn.href = details.tiktok; tiktokBtn.style.display = "flex"; } else { tiktokBtn.style.display = "none"; } }
}

function generateCategoryFilterButtons(lang) {
  const container = document.getElementById('categoryFiltersContainer');
  if (!container) return;
  let categories = dbData.categories || [];
  
  let tempDiv = document.createElement('div');
  categories.forEach((cat) => {
    const btn = document.createElement('button');
    btn.className = `filter-btn ${cat.id === currentFilterCategoryId ? 'active' : ''}`;
    btn.innerText = lang === 'AR' ? (cat.labelAr || cat.labelFr) : (cat.labelFr || cat.labelAr);
    tempDiv.appendChild(btn);
  });
  
  // NEVER replace DOM if visual HTML structure is identical! Prevents glitching!
  if (container.innerHTML !== tempDiv.innerHTML) {
    container.innerHTML = tempDiv.innerHTML;
    Array.from(container.children).forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        currentFilterCategoryId = categories[idx].id;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        buildMainShowroomGrid(lang, currentFilterCategoryId, false);
      });
    });
  }
}

function buildMainShowroomGrid(lang, filterCategoryId = "cat_all", isBackgroundUpdate = false) {
  const gridContainer = document.getElementById('mainCatalogGrid');
  if (!gridContainer) return;
  let items = dbData.items || [];
  const details = dbData.details || { whatsapp: "213550000000" };
  if (filterCategoryId !== "cat_all") items = items.filter(p => p.category === filterCategoryId);
  if (items.length === 0) {
    const emptyHtml = `<p style="grid-column: 1/-1; text-align:center; font-family:'Cairo'; color:#666666; padding: 40px 0; font-weight: bold;">لا توجد منتجات متوفرة حالياً.</p>`;
    if (gridContainer.innerHTML !== emptyHtml) gridContainer.innerHTML = emptyHtml;
    return;
  }
  
  let tempDiv = document.createElement('div');
  items.forEach((product, index) => {
    const card = document.createElement('div');
    // If it's a background update or one of the first 8 cards, show immediately without opacity delay/glitch!
    card.className = (isBackgroundUpdate || index < 8) ? 'product-card animate-visible' : 'product-card';
    card.style.setProperty('--card-delay', `${index * 0.05}s`);
    let displayTitle = lang === 'AR' ? (product.titleAr || product.titleFr) : (product.titleFr || product.titleAr);
    let orderButtonText = lang === 'AR' ? '<i class="fab fa-whatsapp"></i> طلب الآن' : '<i class="fab fa-whatsapp"></i> Commander';
    let colorDotsHtml = '';
    let initialSelectedColor = "غير محدد";
    if (product.colors && product.colors.length > 0) {
      initialSelectedColor = product.colors[0];
      colorDotsHtml = `<div class="product-colors">`;
      product.colors.forEach((col, idx) => {
        let activeStyle = idx === 0 ? 'border: 2px solid #2d2a26; transform: scale(1.15);' : 'border: 1px solid rgba(0,0,0,0.15);';
        colorDotsHtml += `<span class="color-dot" data-color-name="${col}" style="background-color: ${col}; ${activeStyle}"></span>`;
      });
      colorDotsHtml += `</div>`;
    }
    let whatsappMessage = `Bonjour, je suis intéressé par le produit: ${displayTitle} (Couleur: ${initialSelectedColor})`;
    card.innerHTML = `
      <div class="product-img-wrapper"><img src="${product.img}" class="product-img" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=DzMobilier'"></div>
      <div class="product-info">
        <h3 class="product-title">${displayTitle}</h3>
        ${colorDotsHtml}
        <div class="product-meta">
          <span class="product-price">${parseFloat(product.price).toLocaleString('fr-DZ')} دج</span>
          <a href="https://wa.me/${details.whatsapp || '213550000000'}?text=${encodeURIComponent(whatsappMessage)}" target="_blank" class="order-btn">${orderButtonText}</a>
        </div>
      </div>`;
    const dots = card.querySelectorAll('.color-dot');
    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        dots.forEach(d => { d.style.border = '1px solid rgba(0,0,0,0.15)'; d.style.transform = 'scale(1)'; });
        e.target.style.border = '2px solid #2d2a26';
        e.target.style.transform = 'scale(1.15)';
        let selectedColorName = e.target.getAttribute('data-color-name');
        card.querySelector('.order-btn').href = `https://wa.me/${details.whatsapp || '213550000000'}?text=${encodeURIComponent(`Bonjour, je suis intéressé par le produit: ${displayTitle} (Couleur: ${selectedColorName})`)}`;
      });
    });
    tempDiv.appendChild(card);
  });
  
  // NEVER replace DOM if visual structure is identical! Eliminates any glitch or blinking!
  if (gridContainer.innerHTML !== tempDiv.innerHTML) {
    gridContainer.innerHTML = tempDiv.innerHTML;
    setupScrollAnimationTrigger();
  }
}

function setupScrollAnimationTrigger() {
  const cards = document.querySelectorAll('.product-card');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { root: null, rootMargin: '50px', threshold: 0.05 });
  cards.forEach(card => observer.observe(card));
}

function render() {
  if (!dbData.items || !dbData.categories || !dbData.details) return;
  applyLanguageInterfaceLayout(currentLang);
  pullShowroomSettingsAndBubbles(currentLang);
  generateCategoryFilterButtons(currentLang);
  buildMainShowroomGrid(currentLang, currentFilterCategoryId, false);
}

/* ========== INIT ========== */
const langSelect = document.getElementById('langSelect');
if (langSelect) {
  currentLang = localStorage.getItem('dzMobilierLang') || 'AR';
  langSelect.value = currentLang;
  langSelect.addEventListener('change', (e) => {
    localStorage.setItem('dzMobilierLang', e.target.value);
    currentLang = e.target.value;
    render();
  });
}

// Render immediately using localStorage cache or fallbacks!
render();

onValue(ref(db, 'items'), (snap) => {
  let val = snap.val();
  if (val && !Array.isArray(val)) val = Object.values(val);
  const newItems = (val && val.length > 0) ? val : fallbackCatalogue;
  if (stableStringify(dbData.items) !== stableStringify(newItems)) {
    dbData.items = newItems;
    try { localStorage.setItem('dzMobilier_saved_items', JSON.stringify(newItems)); } catch(e){}
    buildMainShowroomGrid(currentLang, currentFilterCategoryId, true);
  }
});

onValue(ref(db, 'categories'), (snap) => {
  let val = snap.val();
  if (val && !Array.isArray(val)) val = Object.values(val);
  if (!val || !Array.isArray(val)) val = fallbackCategories;
  if (!val.some(c => c.id === 'cat_all')) val.unshift({ id: "cat_all", labelAr: "الكل", labelFr: "Tout" });
  if (stableStringify(dbData.categories) !== stableStringify(val)) {
    dbData.categories = val;
    try { localStorage.setItem('dzMobilier_saved_categories', JSON.stringify(val)); } catch(e){}
    generateCategoryFilterButtons(currentLang);
  }
});

onValue(ref(db, 'showroomDetails'), (snap) => {
  const newDetails = snap.val() || fallbackDetails;
  if (stableStringify(dbData.details) !== stableStringify(newDetails)) {
    dbData.details = newDetails;
    try { localStorage.setItem('dzMobilier_saved_details', JSON.stringify(newDetails)); } catch(e){}
    pullShowroomSettingsAndBubbles(currentLang);
  }
});
