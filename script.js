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
let dbData = { 
  items: fallbackCatalogue, 
  categories: fallbackCategories, 
  details: fallbackDetails 
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
  if (document.getElementById('navLinkHome')) document.getElementById('navLinkHome').innerText = isAr ? 'الرئيسية' : 'Accueil';
  if (document.getElementById('navLinkCatalog')) document.getElementById('navLinkCatalog').innerText = isAr ? 'المعرض' : 'Catalogue';
  if (document.getElementById('navLinkContact')) document.getElementById('navLinkContact').innerText = isAr ? 'اتصل بنا' : 'Contact';
  if (document.getElementById('filterSectionTitle')) document.getElementById('filterSectionTitle').innerText = isAr ? 'تصفح حسب الأصناف' : 'Parcourir par catégories';
  if (document.getElementById('catalogSectionTitle')) document.getElementById('catalogSectionTitle').innerText = isAr ? 'أحدث قطع الأثاث المضافة' : 'Nos derniers produits';
  if (document.getElementById('heroBtnText')) document.getElementById('heroBtnText').innerText = isAr ? 'تصفح المعرض الآن' : 'Découvrir le Catalogue';
  if (document.getElementById('footerContactTitle')) document.getElementById('footerContactTitle').innerText = isAr ? 'اتصل بنا أو تفضل بزيارة صالة عرضنا' : 'Contactez-nous ou visitez notre showroom';
}

function pullShowroomSettingsAndBubbles(lang) {
  const details = dbData.details || fallbackDetails;
  const logoContainer = document.getElementById('mainLogoPlace');
  if (logoContainer && details.brandName) {
    logoContainer.innerHTML = `<span class="logo-gold">${details.brandName.substring(0,2)}</span><span class="logo-white">${details.brandName.substring(2)}</span>`;
  }
  if (details.brandLogoBase64) {
    const hLogo = document.getElementById('headerLogoImg');
    const hrLogo = document.getElementById('heroLogoImg');
    if (hLogo) { hLogo.src = details.brandLogoBase64; hLogo.style.display = 'block'; }
    if (hrLogo) { hrLogo.src = details.brandLogoBase64; hrLogo.style.display = 'block'; }
  }
  if (document.getElementById('heroDynamicTitle')) document.getElementById('heroDynamicTitle').innerText = details.heroTitleAr || 'أثاث فاخر يناسب ذوقك';
  if (document.getElementById('heroDynamicDesc')) document.getElementById('heroDynamicDesc').innerText = details.heroDescAr || 'اكتشف تشكيلاتنا الراقية من أسرّة النوم وخزائن الملابس المصنوعة بأعلى جودة وعناية.';
  if (document.getElementById('footerPhone')) document.getElementById('footerPhone').innerText = details.phoneCall || '0550000000';

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
  container.innerHTML = '';
  categories.forEach((cat) => {
    const btn = document.createElement('button');
    btn.className = `filter-btn ${cat.id === currentFilterCategoryId ? 'active' : ''}`;
    btn.innerText = lang === 'AR' ? (cat.labelAr || cat.labelFr) : (cat.labelFr || cat.labelAr);
    btn.addEventListener('click', () => {
      currentFilterCategoryId = cat.id;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      buildMainShowroomGrid(lang, currentFilterCategoryId);
    });
    container.appendChild(btn);
  });
}

function buildMainShowroomGrid(lang, filterCategoryId = "cat_all") {
  const gridContainer = document.getElementById('mainCatalogGrid');
  if (!gridContainer) return;
  gridContainer.innerHTML = '';
  let items = dbData.items || [];
  const details = dbData.details || { whatsapp: "213550000000" };
  if (filterCategoryId !== "cat_all") items = items.filter(p => p.category === filterCategoryId);
  if (items.length === 0) {
    gridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align:center; font-family:'Cairo'; color:#666666; padding: 40px 0; font-weight: bold;">لا توجد منتجات متوفرة حالياً.</p>`;
    return;
  }
  items.forEach((product, index) => {
    const card = document.createElement('div');
    card.className = 'product-card';
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
    gridContainer.appendChild(card);
  });
  setupScrollAnimationTrigger();
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
  buildMainShowroomGrid(currentLang, currentFilterCategoryId);
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

// Render immediately using fallbacks so there is ZERO waiting or flickering on load!
render();

onValue(ref(db, 'items'), (snap) => {
  let val = snap.val();
  if (val && !Array.isArray(val)) val = Object.values(val);
  const newItems = (val && val.length > 0) ? val : fallbackCatalogue;
  if (JSON.stringify(dbData.items) !== JSON.stringify(newItems)) {
    dbData.items = newItems;
    render();
  }
});

onValue(ref(db, 'categories'), (snap) => {
  let val = snap.val();
  if (val && !Array.isArray(val)) val = Object.values(val);
  if (!val || !Array.isArray(val)) val = fallbackCategories;
  if (!val.some(c => c.id === 'cat_all')) val.unshift({ id: "cat_all", labelAr: "الكل", labelFr: "Tout" });
  if (JSON.stringify(dbData.categories) !== JSON.stringify(val)) {
    dbData.categories = val;
    render();
  }
});

onValue(ref(db, 'showroomDetails'), (snap) => {
  const newDetails = snap.val() || fallbackDetails;
  if (JSON.stringify(dbData.details) !== JSON.stringify(newDetails)) {
    dbData.details = newDetails;
    render();
  }
});
