(() => {
  const listings = window.CAMPUS_LISTINGS || [];
  const grid = document.getElementById("listingGrid");
  const searchInput = document.getElementById("searchInput");
  const resultsCount = document.getElementById("resultsCount");
  const emptyState = document.getElementById("emptyState");
  const toast = document.getElementById("toast");
  const listingDialog = document.getElementById("listingDialog");
  const dialogContent = document.getElementById("dialogContent");
  const actionDialog = document.getElementById("actionDialog");
  const actionDialogContent = document.getElementById("actionDialogContent");
  let activeCategory = "Tümü";
  let activeFilter = "all";
  let searchTerm = "";
  let sortMode = "recent";
  let saved = new Set();
  let visibleLimit = 8;
  let toastTimeout;

  const money = value => new Intl.NumberFormat("tr-TR").format(value) + " ₺";
  const esc = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  function notify(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("show"), 2600);
  }
  function filteredListings() {
    let list = listings.filter(item => {
      const categoryMatch = activeCategory === "Tümü" || item.category === activeCategory;
      const filterMatch = activeFilter === "all" || (activeFilter === "urgent" && item.urgent) || (activeFilter === "swap" && item.swap);
      const haystack = [item.title,item.category,item.seller,item.description].join(" ").toLocaleLowerCase("tr-TR");
      return categoryMatch && filterMatch && haystack.includes(searchTerm.toLocaleLowerCase("tr-TR"));
    });
    if (sortMode === "price-asc") list.sort((a,b) => a.price-b.price);
    else if (sortMode === "price-desc") list.sort((a,b) => b.price-a.price);
    else list.sort((a,b) => a.id-b.id);
    return list;
  }
  function cardTemplate(item) {
    const badge = item.urgent ? '<span class="listing-badge badge-urgent">⚡ Acil satılık</span>' : item.swap ? '<span class="listing-badge badge-swap">⇄ Takas olur</span>' : item.id === 5 ? '<span class="listing-badge badge-new">Yeni ilan</span>' : "";
    return `<article class="listing-card">
      <div class="listing-image"><div class="listing-art art-${esc(item.art)}"><span class="art-emoji" aria-hidden="true">${esc(item.emoji)}</span></div>${badge}
      <button class="save-button ${saved.has(item.id)?"saved":""}" data-save="${item.id}" aria-label="${saved.has(item.id)?"Kaydedilenlerden çıkar":"Kaydet"}" title="Kaydet">${saved.has(item.id)?"♥":"♡"}</button></div>
      <div class="listing-body"><div class="listing-category">${esc(item.category)}</div><h3 class="listing-title">${esc(item.title)}</h3><div class="listing-price-row"><div class="listing-price">${money(item.price)}</div><span class="listing-condition">${esc(item.condition)}</span></div>
      <div class="listing-meta"><span class="seller-mini"><span class="seller-avatar">${esc(item.initials)}</span><span class="seller-name">${esc(item.seller)}</span></span><span class="listing-campus">${esc(item.campus)} · ${esc(item.age)}</span></div>
      <button class="card-open" data-open="${item.id}" aria-label="${esc(item.title)} ilan detayını aç" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">İlanı aç</button>
      </div><button class="card-click-area" data-open="${item.id}" aria-label="${esc(item.title)} detayını görüntüle" style="position:absolute;inset:0;opacity:0;width:100%;height:100%;border:0;background:transparent;pointer-events:none"></button>
    </article>`;
  }
  function render() {
    const list = filteredListings();
    const visible = list.slice(0, visibleLimit);
    grid.innerHTML = visible.map(cardTemplate).join("");
    resultsCount.textContent = list.length + " ilan";
    emptyState.classList.toggle("hidden", list.length > 0);
    document.getElementById("loadMore").classList.toggle("hidden", list.length <= visibleLimit);
    document.getElementById("savedCount").textContent = saved.size;
    grid.querySelectorAll(".listing-card").forEach(card => {
      const openButton = card.querySelector("[data-open]");
      card.addEventListener("click", event => {
        if (event.target.closest("[data-save]")) return;
        openDetails(Number(openButton.dataset.open));
      });
      card.style.position = "relative";
    });
    grid.querySelectorAll("[data-save]").forEach(button => button.addEventListener("click", event => {
      event.stopPropagation();
      const id = Number(button.dataset.save);
      if (saved.has(id)) { saved.delete(id); notify("İlan kaydedilenlerden çıkarıldı."); }
      else { saved.add(id); notify("İlan kaydedilenlere eklendi."); }
      render();
    }));
  }
  function openDetails(id) {
    const item = listings.find(listing => listing.id === id);
    if (!item) return;
    dialogContent.innerHTML = `<div class="dialog-detail-image art-${esc(item.art)}">${esc(item.emoji)}</div><div class="dialog-detail-body"><div class="eyebrow muted-eyebrow">${esc(item.category)}</div><h2>${esc(item.title)}</h2><div class="dialog-detail-price">${money(item.price)}</div><div class="detail-info"><span class="detail-pill">${esc(item.condition)}</span><span class="detail-pill">⌂ ${esc(item.campus)} kampüsü</span><span class="detail-pill">${item.swap?"⇄ Takas görüşülebilir":"Elden teslim"}</span></div><p>${esc(item.description)}</p><div class="detail-info"><span class="seller-avatar">${esc(item.initials)}</span><span class="detail-pill">İlan sahibi: ${esc(item.seller)}</span><span class="detail-pill">${esc(item.age)}</span></div><button class="button button-primary" id="contactSeller">Satıcıyla iletişime geç <span>↗</span></button><div class="dialog-note">Tasarım önizlemesi: Mesajlaşma ve öğrenci doğrulaması ikinci aşamada gerçek altyapıya bağlanacak. Buluşmada ürünü kontrol etmeni öneririz.</div></div>`;
    listingDialog.showModal();
    document.getElementById("contactSeller").addEventListener("click", () => notify("Mesajlaşma özelliği altyapı aşamasında eklenecek."));
  }
  function openAction(type) {
    if (type === "login") {
      actionDialogContent.innerHTML = `<h2>Tekrar hoş geldin.</h2><p>Kampüs topluluğuna giriş yap. Bu ekran şu an tasarım önizlemesidir.</p><form class="demo-form" id="loginForm"><label>Üniversite e-postan<input type="email" placeholder="ogrenci@universite.edu.tr" required /></label><label>Şifren<input type="password" placeholder="Şifren" required /></label><button class="button button-primary" type="submit">Giriş yap <span>↗</span></button></form><div class="dialog-note">Gerçek hesap oluşturma, e-posta doğrulaması ve güvenli oturum yönetimi 2. aşamada eklenecek.</div>`;
    } else if (type === "sell") {
      actionDialogContent.innerHTML = `<h2>İlanını oluştur.</h2><p>İyi fotoğraf, net açıklama ve doğru fiyatla ürünün daha kolay alıcı bulsun.</p><form class="demo-form" id="sellForm"><label>İlan başlığı<input required maxlength="70" placeholder="Örn. Anatomi Atlası" /></label><label>Kategori<select required><option value="">Kategori seç</option><option>Ders & Akademi</option><option>Teknoloji</option><option>Ev & Yurt</option><option>Hobi & Yaşam</option></select></label><label>Fiyat (₺)<input type="number" min="0" required placeholder="0" /></label><label>Ürün açıklaması<textarea rows="3" required placeholder="Ürünün durumunu ve detaylarını anlat..."></textarea></label><button class="button button-primary" type="submit">İlan önizlemesi oluştur <span>↗</span></button></form><div class="dialog-note">Bu aşamada form demo amaçlıdır; ilanlar henüz veritabanına kaydedilmez.</div>`;
    }
    actionDialog.showModal();
    const form = actionDialogContent.querySelector("form");
    form.addEventListener("submit", event => { event.preventDefault(); actionDialog.close(); notify(type === "login" ? "Giriş sistemi 2. aşamada bağlanacak." : "İlan oluşturma altyapısı 3. aşamada çalışır hale gelecek."); });
  }
  document.querySelectorAll(".category-card").forEach(button => button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    document.querySelectorAll(".category-card").forEach(item => item.classList.toggle("selected", item === button));
    visibleLimit = 8; render(); document.getElementById("ilanlar").scrollIntoView({behavior:"smooth",block:"start"});
  }));
  document.querySelectorAll(".filter-chip").forEach(button => button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll(".filter-chip").forEach(item => item.classList.toggle("active", item === button));
    visibleLimit = 8; render();
  }));
  function runSearch() { searchTerm = searchInput.value.trim(); visibleLimit = 8; render(); document.getElementById("ilanlar").scrollIntoView({behavior:"smooth",block:"start"}); }
  document.getElementById("searchButton").addEventListener("click", runSearch);
  searchInput.addEventListener("keydown", event => { if (event.key === "Enter") runSearch(); });
  searchInput.addEventListener("input", () => { if (!searchInput.value.trim()) { searchTerm = ""; render(); } });
  document.getElementById("sortSelect").addEventListener("change", event => { sortMode = event.target.value; render(); });
  document.getElementById("loadMore").addEventListener("click", () => { visibleLimit += 4; render(); });
  document.getElementById("clearFilters").addEventListener("click", () => {
    activeCategory = "Tümü"; activeFilter = "all"; searchTerm = ""; searchInput.value = ""; visibleLimit = 8;
    document.querySelectorAll(".category-card").forEach(item => item.classList.toggle("selected", item.dataset.category === "Tümü"));
    document.querySelectorAll(".filter-chip").forEach(item => item.classList.toggle("active", item.dataset.filter === "all"));
    render();
  });
  document.getElementById("loginButton").addEventListener("click", () => openAction("login"));
  document.getElementById("sellButton").addEventListener("click", () => openAction("sell"));
  document.getElementById("savedShortcut").addEventListener("click", () => {
    const ids = [...saved];
    if (!ids.length) { notify("Henüz kaydettiğin ilan yok. Beğendiğin ilanlardaki kalbe dokun."); return; }
    activeCategory = "Tümü"; activeFilter = "all"; searchTerm = "";
    searchInput.value = "";
    grid.innerHTML = listings.filter(item => saved.has(item.id)).map(cardTemplate).join("");
    resultsCount.textContent = ids.length + " kaydedilen ilan";
    emptyState.classList.add("hidden");
    document.getElementById("ilanlar").scrollIntoView({behavior:"smooth",block:"start"});
    grid.querySelectorAll(".listing-card").forEach(card => card.addEventListener("click", event => { if (!event.target.closest("[data-save]")) openDetails(Number(card.querySelector("[data-open]").dataset.open)); }));
    grid.querySelectorAll("[data-save]").forEach(button => button.addEventListener("click", event => { event.stopPropagation(); saved.delete(Number(button.dataset.save)); render(); }));
  });
  document.getElementById("swapButton").addEventListener("click", () => {
    activeCategory = "Tümü"; activeFilter = "swap"; visibleLimit = 12;
    document.querySelectorAll(".category-card").forEach(item => item.classList.toggle("selected", item.dataset.category === "Tümü"));
    document.querySelectorAll(".filter-chip").forEach(item => item.classList.toggle("active", item.dataset.filter === "swap"));
    render(); document.getElementById("ilanlar").scrollIntoView({behavior:"smooth",block:"start"});
  });
  document.getElementById("mobileMenu").addEventListener("click", () => document.querySelector(".main-nav").classList.toggle("open"));
  document.getElementById("dialogClose").addEventListener("click", () => listingDialog.close());
  document.getElementById("actionDialogClose").addEventListener("click", () => actionDialog.close());
  [listingDialog, actionDialog].forEach(dialog => dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); }));
  render();
})();