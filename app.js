(function () {
  /**
   * IN-STOCK PHOTOS
   * ---------------
   * Put files in:  images/in-stock/  (not "instock" or "in stock" — use this exact path)
   * Names:         item01.jpg … item06.jpg  (or .png — set photoFileName on each product)
   *
   * Local files are loaded first. If a file is missing, the demo image is used.
   * Bump CATALOG_IMAGE_CACHE when you replace files with the same name (browser cache).
   */
  const CATALOG_IMAGE_FOLDER = "images/in-stock/";
  const CATALOG_IMAGE_CACHE = "2";

  const products = [
    {
      id: "forest-patch",
      photoFileName: "item01.jpg",
      title: "item01",
      category: "patches",
      price: "$18",
      meta: "Iron-on · 3″",
      alt: "Embroidered forest scene patch on fabric",
      demoPhotoUrl:
        "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=600&fit=crop",
    },
    {
      id: "monogram-hoop",
      photoFileName: "item02.jpg",
      title: "item02",
      category: "home",
      price: "$42",
      meta: "6″ hoop · cotton ground",
      alt: "Embroidery hoop with decorative stitching",
      demoPhotoUrl:
        "data:image/jpeg;base64,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",
    },
    {
      id: "cap-logo",
      photoFileName: "item03.jpg",
      title: "item03",
      category: "apparel",
      price: "$34",
      meta: "Adjustable · one size",
      alt: "Baseball cap with embroidered detail",
      demoPhotoUrl:
        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=600&fit=crop",
    },
    {
      id: "floral-collar",
      photoFileName: "item04.jpg",
      title: "Item04",
      category: "apparel",
      price: "$56",
      meta: "Fits most shirt collars",
      alt: "Floral embroidered textile detail",
      demoPhotoUrl:
        "data:image/jpeg;base64,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",
    },
    {
      id: "bee-patch",
      photoFileName: "item05.jpg",
      title: "Item 05",
      category: "patches",
      price: "$22",
      meta: "Sew-on",
      alt: "Small embroidered bee motif on cloth",
      demoPhotoUrl:
        "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&h=600&fit=crop",
    },
    {
      id: "linen-runner",
      photoFileName: "item06.jpg",
      title: "Item06",
      category: "home",
      price: "$68",
      meta: "Linen · 14×48″",
      alt: "Table linen with subtle stitched border",
      demoPhotoUrl:
        "data:image/jpeg;base64,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",
    },
  ];

  function catalogImageLocalUrl(product) {
    const q = CATALOG_IMAGE_CACHE ? `?v=${encodeURIComponent(CATALOG_IMAGE_CACHE)}` : "";
    return `${CATALOG_IMAGE_FOLDER}${product.photoFileName}${q}`;
  }

  const grid = document.getElementById("product-grid");
  const filterBtns = document.querySelectorAll("[data-filter]");
  const backdrop = document.getElementById("order-modal-backdrop");
  const modal = document.getElementById("order-modal");
  const modalClose = document.getElementById("order-modal-close");
  const modalForm = document.getElementById("order-modal-form");
  const modalItemLabel = document.getElementById("order-modal-item-label");
  const modalItemInput = document.getElementById("order-modal-item-input");
  const modalStatus = document.getElementById("order-modal-status");
  const customForm = document.getElementById("custom-form");
  const customStatus = document.getElementById("custom-form-status");
  const yearEl = document.getElementById("year");

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function renderProducts() {
    if (!grid) return;
    grid.innerHTML = products
      .map(
        (p) => `
      <li class="product-card" data-category="${p.category}">
        <figure>
          <img src="${escapeAttr(catalogImageLocalUrl(p))}" alt="${escapeAttr(p.alt)}" width="600" height="600" loading="lazy" onerror='this.onerror=null;this.src=${JSON.stringify(p.demoPhotoUrl)};' />
        </figure>
        <div class="product-body">
          <h3>${escapeHtml(p.title)}</h3>
          <p class="product-meta">${escapeHtml(p.meta)}</p>
          <p class="product-price">${escapeHtml(p.price)}</p>
          <button type="button" class="btn btn-primary btn-block" data-open-order-modal data-item="${escapeAttr(p.title)}">
            Request this piece
          </button>
        </div>
      </li>
    `
      )
      .join("");

    grid.querySelectorAll("[data-open-order-modal]").forEach((btn) => {
      btn.addEventListener("click", () => openOrderModal(btn.getAttribute("data-item") || ""));
    });
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function escapeAttr(s) {
    return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }

  function openOrderModal(itemName) {
    if (!modal || !backdrop) return;
    modalItemInput.value = itemName;
    modalItemLabel.innerHTML = itemName
      ? `You are requesting: <strong>${escapeHtml(itemName)}</strong>`
      : "";
    modalStatus.textContent = "";
    modalStatus.className = "form-hint";
    modal.removeAttribute("hidden");
    backdrop.removeAttribute("hidden");
    requestAnimationFrame(() => {
      modal.classList.add("is-open");
      backdrop.classList.add("is-open");
    });
    const focusTarget = modal.querySelector("input[type=email]");
    if (focusTarget) focusTarget.focus();
  }

  function closeOrderModal() {
    if (!modal || !backdrop) return;
    modal.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    window.setTimeout(() => {
      modal.setAttribute("hidden", "");
      backdrop.setAttribute("hidden", "");
    }, 280);
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter") || "all";
      filterBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
      document.querySelectorAll(".product-card").forEach((card) => {
        const cat = card.getAttribute("data-category");
        const show = filter === "all" || cat === filter;
        card.classList.toggle("is-hidden", !show);
      });
    });
  });

  document.querySelectorAll(".header-cta[data-open-order-modal]").forEach((btn) => {
    btn.addEventListener("click", () => openOrderModal(btn.getAttribute("data-item") || "General inquiry"));
  });

  if (modalClose) modalClose.addEventListener("click", closeOrderModal);
  if (backdrop) backdrop.addEventListener("click", closeOrderModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.hasAttribute("hidden")) closeOrderModal();
  });

  if (modalForm) {
    const submitBtn = modalForm.querySelector('button[type="submit"]');
    modalForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(modalForm);
      const email = (fd.get("email") || "").toString().trim();
      if (!email) {
        modalStatus.textContent = "Please enter your email.";
        modalStatus.className = "form-hint is-error";
        return;
      }
      const itemRequested = (fd.get("item") || "").toString();
      const notes = (fd.get("notes") || "").toString().trim();
      const payload = { item: itemRequested, email, notes };

      if (submitBtn) submitBtn.disabled = true;
      modalStatus.textContent = "Sending…";
      modalStatus.className = "form-hint";

      try {
        const res = await fetch("/api/in-stock-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          modalStatus.textContent = data.error || "Could not send. Try again.";
          modalStatus.className = "form-hint is-error";
          return;
        }
        modalStatus.textContent = data.emailSent
          ? "Thanks — we will email you shortly to confirm."
          : "Thanks — your request was received.";
        modalStatus.className = "form-hint is-success";
        modalForm.reset();
        modalItemInput.value = itemRequested;
        window.setTimeout(closeOrderModal, 1800);
      } catch {
        modalStatus.textContent =
          "Network error. Run the site with npm start (Node server), not as a raw file.";
        modalStatus.className = "form-hint is-error";
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  if (customForm) {
    const customSubmit = customForm.querySelector('button[type="submit"]');
    customForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      customStatus.className = "form-hint";
      const fd = new FormData(customForm);
      const name = (fd.get("name") || "").toString().trim();
      const email = (fd.get("email") || "").toString().trim();
      const title = (fd.get("title") || "").toString().trim();
      const description = (fd.get("description") || "").toString().trim();
      if (!name || !email || !title || !description) {
        customStatus.textContent = "Please fill in name, email, title, and description.";
        customStatus.className = "form-hint is-error";
        return;
      }

      if (customSubmit) customSubmit.disabled = true;
      customStatus.textContent = "Sending…";

      try {
        const res = await fetch("/api/custom-brief", {
          method: "POST",
          body: fd,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          customStatus.textContent = data.error || "Could not send. Try again.";
          customStatus.className = "form-hint is-error";
          return;
        }
        customStatus.textContent = data.emailSent
          ? "Brief received. We will follow up by email."
          : "Brief received — thank you.";
        customStatus.className = "form-hint is-success";
        customForm.reset();
      } catch {
        customStatus.textContent =
          "Network error. Run the site with npm start (Node server), not as a raw file.";
        customStatus.className = "form-hint is-error";
      } finally {
        if (customSubmit) customSubmit.disabled = false;
      }
    });
  }

  renderProducts();
})();
