(function () {
  "use strict";

  var AUTH_PATH = /^\/(login|register)\/?$/;
  var COOKIE_NAME = "sadar_mobile_ui";
  var isMobileViewport = window.matchMedia("(max-width: 991.98px)").matches;

  if (!isMobileViewport) return;

  function getPreference() {
    var match = document.cookie.match(new RegExp("(?:^|; )" + COOKIE_NAME + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : "";
  }

  function savePreference(value) {
    var secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = COOKIE_NAME + "=" + encodeURIComponent(value) + "; Path=/; Max-Age=31536000; SameSite=Lax" + secure;
  }

  var preference = getPreference();
  var style = document.createElement("style");
  style.textContent = `
    :root { --sadar-choice-brand: #1e3a8a; }
    .sadar-ui-choice-overlay, .sadar-ui-choice-overlay * { box-sizing: border-box; }
    .sadar-ui-choice-overlay {
      position: fixed; inset: 0; z-index: 2147483000; display: grid; place-items: center;
      padding: max(18px, env(safe-area-inset-top)) 16px max(18px, env(safe-area-inset-bottom));
      overflow: auto; color: #14213d; font-family: Inter, "Segoe UI", Arial, sans-serif;
      background: rgba(15, 23, 42, .38); opacity: 0; visibility: hidden;
      backdrop-filter: blur(14px) saturate(125%); -webkit-backdrop-filter: blur(14px) saturate(125%);
      transition: opacity .28s ease, visibility .28s ease;
    }
    .sadar-ui-choice-overlay.is-open { opacity: 1; visibility: visible; }
    .sadar-ui-choice-dialog {
      position: relative; width: min(100%, 410px); overflow: hidden;
      border: 1px solid rgba(255,255,255,.94); border-radius: 30px;
      background: linear-gradient(145deg, rgba(255,255,255,.985), rgba(239,245,255,.96));
      box-shadow: 0 28px 80px rgba(15,23,42,.25), inset 0 1px 0 #fff;
      transform: translateY(24px) scale(.965); opacity: 0;
      transition: transform .42s cubic-bezier(.2,.9,.25,1.12), opacity .28s ease;
    }
    .sadar-ui-choice-overlay.is-open .sadar-ui-choice-dialog { transform: translateY(0) scale(1); opacity: 1; }
    .sadar-ui-choice-aura { position: absolute; inset: 0 0 auto; height: 150px; overflow: hidden; pointer-events: none; }
    .sadar-ui-choice-aura::before, .sadar-ui-choice-aura::after {
      content: ""; position: absolute; border-radius: 999px; filter: blur(3px); opacity: .42;
      animation: sadarChoiceFloat 6s ease-in-out infinite alternate;
    }
    .sadar-ui-choice-aura::before { width: 150px; height: 150px; top: -82px; right: -22px; background: #93c5fd; }
    .sadar-ui-choice-aura::after { width: 110px; height: 110px; top: 18px; left: -62px; background: #c4b5fd; animation-delay: -2s; }
    .sadar-ui-choice-content { position: relative; padding: 22px; }
    .sadar-ui-choice-kicker { display: flex; align-items: center; gap: 9px; margin-bottom: 13px; color: var(--sadar-choice-brand); font-size: 11px; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }
    .sadar-ui-choice-kicker-icon { display: grid; width: 30px; height: 30px; place-items: center; border-radius: 10px; color: #fff; background: var(--sadar-choice-brand); box-shadow: 0 7px 16px rgba(30,58,138,.22); }
    .sadar-ui-choice-title { margin: 0; color: #111c33; font-size: clamp(23px, 6.2vw, 28px); font-weight: 850; letter-spacing: -.025em; line-height: 1.14; }
    .sadar-ui-choice-copy { margin: 8px 0 19px; color: #64748b; font-size: 14px; line-height: 1.5; }
    .sadar-ui-choice-options { display: grid; gap: 11px; }
    .sadar-ui-choice-option {
      position: relative; display: grid; grid-template-columns: 46px minmax(0,1fr) 24px; align-items: center; gap: 12px;
      width: 100%; min-height: 84px; padding: 13px; border: 1px solid rgba(30,58,138,.13); border-radius: 19px;
      color: #172033; background: rgba(255,255,255,.8); text-align: left; cursor: pointer;
      box-shadow: 0 8px 24px rgba(30,58,138,.07), inset 0 1px 0 #fff;
      transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease, background .2s ease;
    }
    .sadar-ui-choice-option:hover, .sadar-ui-choice-option:focus-visible { transform: translateY(-2px); border-color: rgba(30,58,138,.42); outline: none; box-shadow: 0 14px 30px rgba(30,58,138,.13), inset 0 1px 0 #fff; }
    .sadar-ui-choice-option.is-primary { color: #fff; border-color: var(--sadar-choice-brand); background: linear-gradient(135deg, #1e3a8a, #284da9); box-shadow: 0 14px 30px rgba(30,58,138,.24), inset 0 1px 0 rgba(255,255,255,.25); }
    .sadar-ui-choice-option.is-primary:hover, .sadar-ui-choice-option.is-primary:focus-visible { border-color: #1e3a8a; box-shadow: 0 18px 34px rgba(30,58,138,.3), inset 0 1px 0 rgba(255,255,255,.25); }
    .sadar-ui-choice-option.is-current { outline: 2px solid rgba(34,197,94,.72); outline-offset: 2px; }
    .sadar-ui-choice-icon { display: grid; width: 46px; height: 46px; place-items: center; border-radius: 15px; color: var(--sadar-choice-brand); background: #eaf0ff; font-size: 18px; font-weight: 900; box-shadow: inset 0 1px 0 #fff; }
    .sadar-ui-choice-icon svg { width: 23px; height: 23px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
    .is-primary .sadar-ui-choice-icon { color: #fff; background: rgba(255,255,255,.16); }
    .sadar-ui-choice-label { display: block; font-size: 15px; font-weight: 800; line-height: 1.25; }
    .sadar-ui-choice-description { display: block; margin-top: 4px; color: #718096; font-size: 12px; line-height: 1.4; }
    .is-primary .sadar-ui-choice-description { color: rgba(255,255,255,.76); }
    .sadar-ui-choice-badge { display: inline-flex; margin-left: 6px; padding: 3px 7px; border-radius: 999px; color: #1e3a8a; background: #dbeafe; font-size: 8px; font-weight: 900; letter-spacing: .05em; vertical-align: 2px; text-transform: uppercase; }
    .sadar-ui-choice-badge.is-current { color: #166534; background: #dcfce7; }
    .sadar-ui-choice-arrow { font-size: 22px; font-weight: 400; opacity: .78; transition: transform .2s ease; }
    .sadar-ui-choice-option:hover .sadar-ui-choice-arrow { transform: translateX(3px); }
    .sadar-ui-choice-note { display: flex; align-items: flex-start; gap: 7px; margin: 15px 2px 0; color: #7b8798; font-size: 11px; line-height: 1.45; }
    .sadar-ui-choice-close { position: absolute; top: 17px; right: 17px; z-index: 2; display: grid; width: 36px; height: 36px; place-items: center; border: 1px solid rgba(30,58,138,.1); border-radius: 999px; color: #334155; background: rgba(255,255,255,.72); cursor: pointer; box-shadow: 0 6px 16px rgba(30,58,138,.08); }
    .sadar-ui-choice-switch {
      position: fixed; right: 14px; bottom: calc(14px + env(safe-area-inset-bottom)); z-index: 2147482000;
      display: inline-flex; align-items: center; gap: 7px; min-height: 40px; padding: 8px 13px;
      border: 1px solid rgba(255,255,255,.9); border-radius: 999px; color: #fff; background: rgba(30,58,138,.94);
      font: 700 11px/1.2 inherit; box-shadow: 0 12px 28px rgba(30,58,138,.24), inset 0 1px 0 rgba(255,255,255,.28);
      cursor: pointer; animation: sadarChoiceSwitchIn .45s cubic-bezier(.2,.9,.25,1.1) both;
    }
    .sadar-ui-choice-switch:focus-visible { outline: 3px solid rgba(147,197,253,.8); outline-offset: 2px; }
    .sadar-ui-choice-overlay.is-loading .sadar-ui-choice-option { pointer-events: none; opacity: .68; }
    .sadar-ui-choice-overlay.is-loading .sadar-ui-choice-option.is-selected::after { content: ""; position: absolute; right: 16px; width: 18px; height: 18px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: sadarChoiceSpin .65s linear infinite; }
    @keyframes sadarChoiceFloat { to { transform: translate3d(12px,10px,0) scale(1.08); } }
    @keyframes sadarChoiceSwitchIn { from { opacity: 0; transform: translateY(14px) scale(.94); } }
    @keyframes sadarChoiceSpin { to { transform: rotate(360deg); } }
    @media (max-height: 690px) { .sadar-ui-choice-content { padding: 19px; } .sadar-ui-choice-copy { margin-bottom: 14px; } .sadar-ui-choice-option { min-height: 74px; padding: 10px 12px; } .sadar-ui-choice-note { margin-top: 11px; } }
    @media (max-width: 370px) { .sadar-ui-choice-option { grid-template-columns: 42px minmax(0,1fr) 18px; gap: 10px; } .sadar-ui-choice-icon { width: 42px; height: 42px; } .sadar-ui-choice-badge { display: table; margin: 4px 0 0; } }
    @media (max-width: 575px) {
      .sadar-ui-choice-switch { top: calc(12px + env(safe-area-inset-top)); right: 12px; bottom: auto; width: 40px; min-height: 40px; justify-content: center; padding: 0; border-radius: 14px; }
      .sadar-ui-choice-switch span:last-child { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    }
    @media (prefers-reduced-motion: reduce) { .sadar-ui-choice-overlay, .sadar-ui-choice-dialog, .sadar-ui-choice-option, .sadar-ui-choice-arrow, .sadar-ui-choice-aura::before, .sadar-ui-choice-aura::after, .sadar-ui-choice-switch { animation: none !important; transition: none !important; } }
  `;
  document.head.appendChild(style);

  var overlay = document.createElement("div");
  overlay.className = "sadar-ui-choice-overlay";
  overlay.hidden = true;
  overlay.innerHTML = `
    <section class="sadar-ui-choice-dialog" role="dialog" aria-modal="true" aria-labelledby="sadar-ui-choice-title" aria-describedby="sadar-ui-choice-copy">
      <div class="sadar-ui-choice-aura" aria-hidden="true"></div>
      ${preference ? '<button class="sadar-ui-choice-close" type="button" aria-label="Tutup pilihan tampilan">&#10005;</button>' : ""}
      <div class="sadar-ui-choice-content">
        <div class="sadar-ui-choice-kicker"><span class="sadar-ui-choice-kicker-icon" aria-hidden="true">&#10022;</span><span>Preferensi tampilan</span></div>
        <h2 class="sadar-ui-choice-title" id="sadar-ui-choice-title">Pilih tampilan SADAR</h2>
        <p class="sadar-ui-choice-copy" id="sadar-ui-choice-copy">Pilih pengalaman yang paling nyaman untuk perangkatmu.</p>
        <div class="sadar-ui-choice-options">
          <button class="sadar-ui-choice-option is-primary ${preference === "modern" ? "is-current" : ""}" type="button" data-sadar-ui="modern" aria-pressed="${preference === "modern"}">
            <span class="sadar-ui-choice-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="2.5" width="14" height="19" rx="3"></rect><path d="M9 6.5h6M12 17.5v.01"></path><path d="m18 5 1-1 1 1 1-1" opacity=".8"></path></svg></span>
            <span><span class="sadar-ui-choice-label">Tampilan Baru ${preference === "modern" ? '<span class="sadar-ui-choice-badge is-current">Aktif</span>' : '<span class="sadar-ui-choice-badge">Disarankan</span>'}</span><span class="sadar-ui-choice-description">Liquid glass modern yang dioptimalkan khusus untuk mobile.</span></span>
            <span class="sadar-ui-choice-arrow" aria-hidden="true">&#8250;</span>
          </button>
          <button class="sadar-ui-choice-option ${preference === "legacy" ? "is-current" : ""}" type="button" data-sadar-ui="legacy" aria-pressed="${preference === "legacy"}">
            <span class="sadar-ui-choice-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="15" rx="2.5"></rect><path d="M3 9h18M8 9v10"></path></svg></span>
            <span><span class="sadar-ui-choice-label">Tampilan Lama ${preference === "legacy" ? '<span class="sadar-ui-choice-badge is-current">Aktif</span>' : ""}</span><span class="sadar-ui-choice-description">Tampilan responsif original dari main-desktop.</span></span>
            <span class="sadar-ui-choice-arrow" aria-hidden="true">&#8250;</span>
          </button>
        </div>
        <p class="sadar-ui-choice-note"><span aria-hidden="true">&#9432;</span><span>Pilihan tersimpan di browser ini. Gunakan tombol &quot;Ganti tampilan&quot; untuk memilih ulang.</span></p>
      </div>
    </section>
  `;
  document.body.appendChild(overlay);

  var firstOption = overlay.querySelector("[data-sadar-ui='modern']");
  var closeButton = overlay.querySelector(".sadar-ui-choice-close");
  var lastFocused = null;

  function openDialog() {
    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.documentElement.style.overflow = "hidden";
    window.requestAnimationFrame(function () {
      overlay.classList.add("is-open");
      firstOption.focus({ preventScroll: true });
      window.setTimeout(function () { firstOption.focus({ preventScroll: true }); }, 60);
    });
  }

  function closeDialog() {
    if (!preference) return;
    overlay.classList.remove("is-open");
    document.documentElement.style.overflow = "";
    window.setTimeout(function () {
      overlay.hidden = true;
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }, 280);
  }

  overlay.addEventListener("click", function (event) {
    var option = event.target.closest("[data-sadar-ui]");
    if (!option) return;
    var value = option.getAttribute("data-sadar-ui");
    if (value !== "modern" && value !== "legacy") return;
    overlay.classList.add("is-loading");
    option.classList.add("is-selected");
    option.querySelector(".sadar-ui-choice-arrow").style.visibility = "hidden";
    savePreference(value);
    window.setTimeout(function () { window.location.reload(); }, 320);
  });

  overlay.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeDialog();
    if (event.key !== "Tab") return;
    var focusable = Array.from(overlay.querySelectorAll("button:not([disabled])"));
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  if (closeButton) closeButton.addEventListener("click", closeDialog);

  var switchButton = null;
  var activeAuthPath = "";

  function ensureSwitchButton() {
    if (switchButton) return;
    switchButton = document.createElement("button");
    switchButton.type = "button";
    switchButton.className = "sadar-ui-choice-switch";
    switchButton.setAttribute("aria-label", "Ganti pilihan tampilan SADAR");
    switchButton.innerHTML = '<span aria-hidden="true">&#10022;</span><span>Ganti tampilan</span>';
    switchButton.addEventListener("click", openDialog);
    document.body.appendChild(switchButton);
  }

  function syncRoute() {
    var currentPath = window.location.pathname;
    if (!AUTH_PATH.test(currentPath)) {
      activeAuthPath = "";
      overlay.classList.remove("is-open", "is-loading");
      overlay.hidden = true;
      document.documentElement.style.overflow = "";
      if (switchButton) {
        switchButton.remove();
        switchButton = null;
      }
      return;
    }

    if (activeAuthPath === currentPath) return;
    activeAuthPath = currentPath;
    if (preference === "modern" || preference === "legacy") ensureSwitchButton();
    else window.setTimeout(openDialog, 420);
  }

  ["pushState", "replaceState"].forEach(function (method) {
    var original = window.history[method];
    window.history[method] = function () {
      var result = original.apply(this, arguments);
      window.setTimeout(syncRoute, 0);
      return result;
    };
  });
  window.addEventListener("popstate", syncRoute);
  syncRoute();
})();
