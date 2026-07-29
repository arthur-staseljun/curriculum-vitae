(function () {
  const VERSION = (document.querySelector('meta[name="i18n-version"]')?.content) ?? "1";
  const FILES = { lv: "./locales/lv.json", ru: "./locales/ru.json", en: "./locales/en.json" };
  const FALLBACK = "lv";
  const cache = {};

  /* --- contacts live in one place: edit here --- */
  const CONTACT = {
    email: "arthur.staseljun@gmail.com",
    phoneDisplay: "+371 268 43 654",
    phoneHref: "+37126843654"
  };

  function apply(dict) {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      const v = dict[el.dataset.i18n];
      if (v === undefined) return;
      if (el.tagName === "TITLE") {
        document.title = v;
        return;
      }
      if (el.tagName === "META") {
        el.setAttribute("content", v);
        return;
      }
      el.textContent = v;
    });
    document.querySelectorAll("[data-tags]").forEach(function (el) {
      const v = dict[el.dataset.tags];
      if (Array.isArray(v)) {
        el.innerHTML = "";
        v.forEach(function (t) {
          const s = document.createElement("span");
          s.className = "pill";
          s.textContent = t;
          el.appendChild(s);
        });
      }
    });
    const mail = "mailto:" + CONTACT.email;
    const tel = "tel:" + CONTACT.phoneHref;
    document.getElementById("cta-mail").href = mail;
    document.getElementById("cta-phone").href = tel;
    const cm = document.getElementById("contact-mail");
    cm.href = mail;
    cm.textContent = CONTACT.email;
    const cp = document.getElementById("contact-phone");
    cp.href = tel;
    cp.textContent = CONTACT.phoneDisplay;
  }

  function load(lang) {
    if (cache[lang]) {
      return Promise.resolve(cache[lang]);
    }
    return fetch(`${FILES[lang]}?v=${VERSION}`)
      .then(function (r) {
        if (r.ok) {
          return r.json();
        }
        throw new Error(r.status);
      })
      .then(function (d) {
        cache[lang] = d;
        return d;
      });
  }

  function setLang(lang) {
    let activeLang = FILES[lang] ?? FALLBACK;
    load(activeLang)
      .catch(function () {
        if (activeLang === FALLBACK) {
          return {};
        }
        return load(FALLBACK);
      })
      .then(function (d) {
        apply(d || {});
        document.documentElement.lang = activeLang;
        if (typeof Storage !== "undefined") {
          localStorage.setItem("cv-lang", activeLang);
        }
        document.querySelectorAll("[data-lang]").forEach(function (b) {
          b.dataset.pressed = String(b.dataset?.lang === activeLang);
        });
      });
  }

  document.querySelectorAll("[data-lang]").forEach(function (b) {
    b.addEventListener("click", function () {
      setLang(this.dataset?.lang);
    });
  });

  let stored = typeof Storage === "undefined" ? null : localStorage.getItem("cv-lang");
  setLang(stored || FALLBACK);

  /* theme */
  const root = document.documentElement;
  const tBtn = document.getElementById("theme-toggle");
  const storedTheme = typeof Storage === "undefined" ? null : localStorage.getItem("cv-theme");
  let savedTheme = storedTheme || "dark";

  function setTheme(t) {
    root.dataset.theme = t;
    tBtn.textContent = t === "light" ? "🌙" : "☀️";
    if (typeof Storage !== "undefined") {
      localStorage.setItem("cv-theme", t);
    }
  }
  setTheme(savedTheme);
  tBtn.addEventListener("click", function () {
    setTheme(root.dataset.theme === "light" ? "dark" : "light");
  });
})();




