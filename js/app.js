(() => {
  const EASTERN = "٠١٢٣٤٥٦٧٨٩";
  const toEastern = (n) => String(n).replace(/\d/g, (d) => EASTERN[d]);
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const state = {
    lang: "en",
    config: null,
    menu: null,
    i18n: null,
    t: null,
    gallery: [],
    lbIndex: 0,
  };

  const GALLERY = [
    { src: "images/drinks.webp", altKey: "heroImageAlt" },
    { src: "images/tray.webp", altKey: "aboutImageAlt" },
    { src: "images/takeaway.webp", altEn: "Hush takeaway bag, coffee, and location box", altAr: "كيس هاش وكوب قهوة وعلبة الفروع" },
    { src: "images/croissants.webp", altEn: "Fresh croissants from the bakery", altAr: "كرواسون طازج من الفرن" },
  ];

  function preferredLang() {
    const saved = localStorage.getItem("hush-lang");
    if (saved === "ar" || saved === "en") return saved;
    const nav = (navigator.language || "en").toLowerCase();
    return nav.startsWith("ar") ? "ar" : "en";
  }

  function formatPrice(item) {
    const ar = state.lang === "ar";
    const suf = state.t.priceSuffix;
    const fmt = (n) => (ar ? toEastern(n) : String(n));
    if (item.priceS != null) {
      return `${fmt(item.priceS)} / ${fmt(item.priceM)} ${suf}`;
    }
    if (item.priceHot != null) {
      return `${state.t.hot} ${fmt(item.priceHot)} · ${state.t.iced} ${fmt(item.priceIced)} ${suf}`;
    }
    return `${fmt(item.price)} ${suf}`;
  }

  function applyLang(lang) {
    state.lang = lang;
    state.t = state.i18n[lang];
    localStorage.setItem("hush-lang", lang);
    document.documentElement.lang = state.t.lang;
    document.documentElement.dir = state.t.dir;
    document.title = state.t.metaTitle;
    const metaDesc = $('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", state.t.metaDescription);
    const ogTitle = $('meta[property="og:title"]');
    const ogDesc = $('meta[property="og:description"]');
    const ogLoc = $('meta[property="og:locale"]');
    if (ogTitle) ogTitle.setAttribute("content", state.t.metaTitle);
    if (ogDesc) ogDesc.setAttribute("content", state.t.metaDescription);
    if (ogLoc) ogLoc.setAttribute("content", state.t.ogLocale);

    $$("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (state.t[key] != null) el.textContent = state.t[key];
    });
    $$("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      if (state.t[key]) el.setAttribute("aria-label", state.t[key]);
    });

    $("#hero-img")?.setAttribute("alt", state.t.heroImageAlt);
    $("#about-img")?.setAttribute("alt", state.t.aboutImageAlt);

    renderMenu();
    renderLocations();
    renderGallery();
    updateJsonLd();
  }

  function renderMenu(activeId) {
    const cats = state.menu.categories;
    const tabs = $("#tabs");
    const grid = $("#menu-grid");
    if (!tabs || !grid) return;
    const current =
      activeId ||
      tabs.querySelector('[aria-selected="true"]')?.dataset.id ||
      cats[0].id;
    tabs.replaceChildren(
      ...cats.map((cat) => {
        const b = document.createElement("button");
        b.className = "tab";
        b.type = "button";
        b.dataset.id = cat.id;
        b.textContent = state.t.cats[cat.id] || cat.id;
        b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", String(cat.id === current));
        b.addEventListener("click", () => renderMenu(cat.id));
        return b;
      })
    );
    const cat = cats.find((c) => c.id === current) || cats[0];
    grid.replaceChildren(
      ...cat.items.map((item) => {
        const card = document.createElement("article");
        card.className = "item glass";
        const name = item[state.lang];
        const desc = state.lang === "ar" ? item.descAr : item.descEn;
        card.innerHTML = `<div class="item-top"><h3></h3><span class="price"></span></div>`;
        card.querySelector("h3").textContent = name;
        card.querySelector(".price").textContent = formatPrice(item);
        if (desc) {
          const p = document.createElement("p");
          p.textContent = desc;
          card.appendChild(p);
        }
        return card;
      })
    );
  }

  function mapSrc(branch) {
    return `https://www.google.com/maps?q=${encodeURIComponent(branch.mapQuery)}&output=embed`;
  }

  function dirUrl(branch) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(branch.mapQuery)}`;
  }

  function renderLocations() {
    const root = $("#locations-grid");
    if (!root) return;
    const hours = state.config.openingHours;
    root.replaceChildren(
      ...state.config.branches.map((b) => {
        const card = document.createElement("article");
        card.className = "loc glass";
        const name = b[state.lang];
        const address = state.lang === "ar" ? b.addressAr : b.addressEn;
        const mapTitle = state.t.mapTitle.replace("{branch}", name);
        const iframeId = `map-${b.id}`;
        card.innerHTML = `
          <h3></h3>
          <address></address>
          <div class="map-wrap">
            <iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="" id=""></iframe>
          </div>
          <div class="loc-actions">
            <a class="btn btn-primary" target="_blank" rel="noopener noreferrer"></a>
            <a class="btn btn-ghost"></a>
          </div>
          <p class="hours"></p>
        `;
        card.querySelector("h3").textContent = name;
        card.querySelector("address").textContent = address;
        const iframe = card.querySelector("iframe");
        iframe.id = iframeId;
        iframe.title = mapTitle;
        iframe.src = mapSrc(b);
        const dir = card.querySelector(".btn-primary");
        dir.href = dirUrl(b);
        dir.textContent = state.t.getDirections;
        const call = card.querySelector(".btn-ghost");
        call.href = `tel:${state.config.phoneIntl}`;
        call.textContent = state.t.call;
        card.querySelector(".hours").textContent = `${state.t.hoursLabel}: ${hours[state.lang]}`;
        return card;
      })
    );
  }

  function altFor(item) {
    if (item.altKey) return state.t[item.altKey];
    return state.lang === "ar" ? item.altAr : item.altEn;
  }

  function renderGallery() {
    const root = $("#gallery-grid");
    if (!root) return;
    state.gallery = GALLERY;
    root.replaceChildren(
      ...GALLERY.map((item, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        const img = document.createElement("img");
        img.src = item.src;
        img.alt = altFor(item);
        img.loading = "lazy";
        img.width = 800;
        img.height = 1000;
        btn.appendChild(img);
        btn.addEventListener("click", () => openLightbox(i));
        return btn;
      })
    );
  }

  function openLightbox(i) {
    state.lbIndex = i;
    const lb = $("#lightbox");
    const img = $("#lb-img");
    const item = GALLERY[i];
    img.src = item.src;
    img.alt = altFor(item);
    lb.classList.add("open");
    $("#lb-close").focus();
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    $("#lightbox").classList.remove("open");
    document.body.style.overflow = "";
  }

  function stepLightbox(dir) {
    state.lbIndex = (state.lbIndex + dir + GALLERY.length) % GALLERY.length;
    openLightbox(state.lbIndex);
  }

  function updateJsonLd() {
    const c = state.config;
    const branches = c.branches.map((b) => ({
      "@type": "CafeOrCoffeeShop",
      name: "Hush Café",
      image: "https://example.com/images/logo.webp",
      telephone: c.phoneIntl,
      address: {
        "@type": "PostalAddress",
        streetAddress: b.addressEn,
        addressLocality: "Alexandria",
        addressCountry: "EG",
      },
      url: window.location.origin + window.location.pathname,
      sameAs: [c.instagram],
    }));
    const data = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CafeOrCoffeeShop",
          "@id": `${window.location.href}#hush`,
          name: "Hush Café",
          description: state.t.metaDescription,
          image: new URL("images/logo.webp", window.location.href).href,
          telephone: c.phoneIntl,
          priceRange: "EGP",
          servesCuisine: "Coffee",
          sameAs: [c.instagram],
          department: branches,
          openingHours: c.openingHours.schemaHours.length
            ? c.openingHours.schemaHours
            : undefined,
        },
      ],
    };
    $("#jsonld").textContent = JSON.stringify(data);
  }

  function bindUi() {
    $("#lang-btn")?.addEventListener("click", () => {
      applyLang(state.lang === "en" ? "ar" : "en");
    });
    const panel = $("#mobile-panel");
    const menuBtn = $("#menu-btn");
    menuBtn?.addEventListener("click", () => {
      const open = panel.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    panel?.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        panel.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
    $("#lb-close")?.addEventListener("click", closeLightbox);
    $("#lb-prev")?.addEventListener("click", () => stepLightbox(-1));
    $("#lb-next")?.addEventListener("click", () => stepLightbox(1));
    $("#lightbox-backdrop")?.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", (e) => {
      if (!$("#lightbox").classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") stepLightbox(document.dir === "rtl" ? 1 : -1);
      if (e.key === "ArrowRight") stepLightbox(document.dir === "rtl" ? -1 : 1);
    });

    const wa = $("#wa-link");
    const ig = $("#ig-link");
    const call = $("#call-link");
    if (wa) wa.href = `https://wa.me/${state.config.whatsapp}`;
    if (ig) ig.href = state.config.instagram;
    if (call) {
      call.href = `tel:${state.config.phoneIntl}`;
      call.textContent = state.config.phone;
    }

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.classList.add("reveal-ready");
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              en.target.classList.add("in");
              io.unobserve(en.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      $$(".js-reveal").forEach((el) => io.observe(el));
    }
  }

  async function boot() {
    const [config, menu, i18n] = await Promise.all([
      fetch("data/config.json").then((r) => r.json()),
      fetch("data/menu.json").then((r) => r.json()),
      fetch("data/translations.json").then((r) => r.json()),
    ]);
    state.config = config;
    state.menu = menu;
    state.i18n = i18n;
    bindUi();
    applyLang(preferredLang());
  }

  boot().catch((err) => {
    console.error(err);
  });
})();
