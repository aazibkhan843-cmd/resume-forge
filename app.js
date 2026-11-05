/* ResumeForge. Everything you enter stays in this browser (localStorage). */
(function () {
  "use strict";
  var KEY = "resumeforge.v1";
  var PAGE_W = 794, INNER_PAGE = 1033;
  var SWATCHES = ["#0f766e", "#1d4ed8", "#be123c", "#c2410c", "#4338ca", "#1f2937"];
  var baseTitle = document.title;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var uid = function () { return Math.random().toString(36).slice(2, 9); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /* ---------- data ---------- */
  function blank() {
    return {
      personal: { name: "", title: "", email: "", phone: "", location: "", website: "", linkedin: "", github: "", summary: "", photo: "" },
      education: [], experience: [], projects: [], skills: [], certifications: [], awards: [], languages: [],
      settings: { template: "modern", accent: "#0f766e", font: "sans" }
    };
  }
  function sample() {
    return {
      personal: {
        name: "Aarav Sharma", title: "Frontend Developer", email: "aarav.sharma@example.com", phone: "+91 98765 43210",
        location: "Pune, India", website: "aarav.dev", linkedin: "linkedin.com/in/aaravsharma", github: "github.com/aarav-s",
        summary: "Frontend developer with three years of experience building fast, accessible web apps in React and TypeScript. Comfortable owning a feature from design handoff to production, and keen on clean UI and measurable performance."
      },
      experience: [
        { id: uid(), role: "Frontend Developer", company: "Northwind Labs", location: "Pune", start: "2024-07", end: "", current: true,
          bullets: "Rebuilt the customer dashboard in React and TypeScript, cutting load time from 4.1s to 1.6s.\nIntroduced a shared component library used by 4 product teams.\nMentored two interns through their first production releases." },
        { id: uid(), role: "Web Developer Intern", company: "Brightpath Studio", location: "Remote", start: "2024-01", end: "2024-06", current: false,
          bullets: "Built responsive landing pages for 12 clients from Figma designs.\nImproved Lighthouse accessibility scores from 71 to 96 across shipped sites." }
      ],
      projects: [
        { id: uid(), name: "ResumeForge", link: "github.com/aarav-s/resumeforge", tech: "HTML, CSS, JavaScript",
          description: "A browser-based resume builder with live preview, three templates and PDF export.\nWorks offline and stores data only in the browser." },
        { id: uid(), name: "TrailLog", link: "", tech: "React, Node.js, PostgreSQL",
          description: "Hiking log app with GPX import and elevation charts, used by 300+ people." }
      ],
      education: [
        { id: uid(), school: "Savitribai Phule Pune University", degree: "B.Tech", field: "Computer Engineering", start: "2020-08", end: "2024-06", current: false, details: "CGPA 8.7 / 10" }
      ],
      certifications: [
        { id: uid(), name: "Meta Front-End Developer Professional Certificate", issuer: "Coursera", date: "2024-03", link: "" },
        { id: uid(), name: "Google UX Design Certificate", issuer: "Google", date: "2023-11", link: "" }
      ],
      awards: [
        { id: uid(), title: "Smart India Hackathon Finalist", issuer: "Government of India", date: "2023-03", description: "Built a crop-advisory web app with a team of six." }
      ],
      languages: [
        { id: uid(), language: "Hindi", level: "Native" },
        { id: uid(), language: "English", level: "Fluent" },
        { id: uid(), language: "Urdu", level: "Advanced" }
      ],
      skills: ["JavaScript", "TypeScript", "React", "HTML & CSS", "Node.js", "Git", "Figma", "Accessibility"],
      settings: { template: "modern", accent: "#0f766e", font: "sans" }
    };
  }
  var TEMPLATES = ["modern", "classic", "minimal"], FONT_KEYS = ["sans", "serif", "plex"];
  var ITEM_FIELDS = {
    experience: ["role", "company", "location", "start", "end", "bullets"],
    projects: ["name", "link", "tech", "description"],
    education: ["school", "degree", "field", "start", "end", "details"],
    certifications: ["name", "issuer", "date", "link"],
    awards: ["title", "issuer", "date", "description"],
    languages: ["language", "level"]
  };
  var PHOTO_RE = /^data:image\/(?:png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+\/=]*$/;
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var LEVELS = ["Native", "Fluent", "Advanced", "Intermediate", "Basic"];
  function withId(x) { x = x || {}; if (!x.id) x.id = uid(); return x; }

    /* ---------- photo crop ---------- */
  (function () {
    var modal = $("#crop"), cv = $("#crop-canvas"), zoomEl = $("#crop-zoom");
    var cctx = cv.getContext("2d"), OUT = 360;
    var img = null, zoom = 1, cx = 0, cy = 0, drag = null, opener = null;

    function side() { return Math.min(img.width, img.height) / zoom; }
    function clamp() {
      var h = side() / 2;
      cx = Math.min(Math.max(cx, h), img.width - h);
      cy = Math.min(Math.max(cy, h), img.height - h);
    }
    function paint(ctx, size, guide) {
      var s = side();
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, cx - s / 2, cy - s / 2, s, s, 0, 0, size, size);
      if (!guide) return;
      var r = size / 2 - 6;
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,.55)";
      ctx.beginPath(); ctx.rect(0, 0, size, size); ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
      ctx.fill("evenodd");
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    function redraw() { clamp(); paint(cctx, cv.width, true); }
    function setZoom(z) {
      zoom = Math.min(4, Math.max(1, z));
      zoomEl.value = zoom;
      redraw();
    }

    function openCrop(image) {
      img = image; zoom = 1; cx = img.width / 2; cy = img.height / 2;
      zoomEl.value = 1;
      opener = document.activeElement;
      modal.hidden = false;
      redraw();
      cv.focus();
    }
    function closeCrop() {
      modal.hidden = true; img = null; drag = null;
      if (opener && opener.focus) opener.focus();
    }

    /* choose a file */
    $("#photo-file").addEventListener("change", function (e) {
      var f = e.target.files[0]; e.target.value = "";
      if (!f) return;
      if (!/^image\//.test(f.type)) { setStatus("Choose an image file (JPG, PNG or WebP)"); return; }
      var fr = new FileReader();
      fr.onload = function () {
        var im = new Image();
        im.onload = function () { openCrop(im); };
        im.onerror = function () { setStatus("Could not read that image"); };
        im.src = fr.result; /* data: URL, allowed by your img-src policy */
      };
      fr.readAsDataURL(f);
    });

    /* drag to move */
    cv.addEventListener("pointerdown", function (e) {
      if (!img) return;
      drag = { x: e.clientX, y: e.clientY, cx: cx, cy: cy };
      cv.setPointerCapture(e.pointerId);
      cv.classList.add("dragging");
    });
    cv.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var k = side() / cv.getBoundingClientRect().width;
      cx = drag.cx - (e.clientX - drag.x) * k;
      cy = drag.cy - (e.clientY - drag.y) * k;
      redraw();
    });
    function endDrag() { drag = null; cv.classList.remove("dragging"); }
    cv.addEventListener("pointerup", endDrag);
    cv.addEventListener("pointercancel", endDrag);

    /* zoom: slider and mouse wheel */
    zoomEl.addEventListener("input", function () { setZoom(parseFloat(zoomEl.value)); });
    cv.addEventListener("wheel", function (e) {
      if (!img) return;
      e.preventDefault();
      setZoom(zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08));
    }, { passive: false });

    /* keyboard: arrows move, + / - zoom, Esc closes, Tab stays inside the dialog */
    modal.addEventListener("keydown", function (e) {
      if (!img) return;
      if (e.key === "Escape") { e.preventDefault(); closeCrop(); return; }
      if (e.key === "Tab") {
        var items = $$("button, input, canvas", modal).filter(function (n) { return !n.disabled; });
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        return;
      }
      if (document.activeElement !== cv) return;
      var step = side() * 0.03, used = true;
      if (e.key === "ArrowLeft") cx -= step;
      else if (e.key === "ArrowRight") cx += step;
      else if (e.key === "ArrowUp") cy -= step;
      else if (e.key === "ArrowDown") cy += step;
      else if (e.key === "+" || e.key === "=") setZoom(zoom + 0.1);
      else if (e.key === "-") setZoom(zoom - 0.1);
      else used = false;
      if (used) { e.preventDefault(); redraw(); }
    });
    modal.addEventListener("mousedown", function (e) { if (e.target === modal) closeCrop(); });

    /* buttons */
    $("#crop-cancel").addEventListener("click", closeCrop);
    $("#crop-apply").addEventListener("click", function () {
      if (!img) return;
      clamp();
      var out = document.createElement("canvas");
      out.width = out.height = OUT;
      paint(out.getContext("2d"), OUT, false);
      S.personal.photo = out.toDataURL("image/jpeg", 0.85);
      renderPhotoUI(); changed();
      closeCrop();
    });
  })();
  
  /* Turns older free-text dates ("Jul 2024", "2020") into the YYYY-MM value a month picker needs. */
  function toMonth(v) {
    v = String(v == null ? "" : v).trim();
    if (!v) return "";
    if (/^\d{4}-\d{2}$/.test(v)) return v;
    var m = /^([A-Za-z]{3,9})\.?\s+(\d{4})$/.exec(v);
    if (m) {
      var idx = -1;
      MONTHS.forEach(function (x, i) { if (m[1].toLowerCase().indexOf(x.toLowerCase()) === 0) idx = i; });
      if (idx >= 0) return m[2] + "-" + (idx < 9 ? "0" : "") + (idx + 1);
    }
    m = /^(\d{4})$/.exec(v);
    return m ? m[1] + "-01" : "";
  }
  function migrateRange(it) {
    if (typeof it.current !== "boolean") it.current = /^(present|current|now|ongoing)$/i.test(String(it.end || "").trim());
    it.start = toMonth(it.start);
    it.end = it.current ? "" : toMonth(it.end);
    return it;
  }
  function migrateDate(it) { it.date = toMonth(it.date); return it; }
  /* Saved data and imported files are untrusted: keep only the shapes the page expects. */
  function text(v) { return typeof v === "string" ? v : (v == null || typeof v === "object") ? "" : String(v); }
  function cleanList(list, name) {
    return (Array.isArray(list) ? list : []).filter(function (x) { return x && typeof x === "object"; }).map(function (x) {
      var id = text(x.id).replace(/[^\w-]/g, "").slice(0, 24);
      var o = { id: id || uid() };
      ITEM_FIELDS[name].forEach(function (k) { o[k] = text(x[k]); });
      if (typeof x.current === "boolean") o.current = x.current;
      return o;
    });
  }
  function normalize(d) {
    var b = blank(); d = d && typeof d === "object" ? d : {};
    var src = d.personal && typeof d.personal === "object" ? d.personal : {}, P = {};
    Object.keys(b.personal).forEach(function (k) { P[k] = text(src[k]); });
    if (!PHOTO_RE.test(P.photo)) P.photo = "";
    var st = d.settings && typeof d.settings === "object" ? d.settings : {};
    return {
      personal: P,
      education: cleanList(d.education, "education").map(migrateRange),
      experience: cleanList(d.experience, "experience").map(migrateRange),
      projects: cleanList(d.projects, "projects"),
      certifications: cleanList(d.certifications, "certifications").map(migrateDate),
      awards: cleanList(d.awards, "awards").map(migrateDate),
      languages: cleanList(d.languages, "languages"),
      skills: Array.isArray(d.skills) ? d.skills.filter(function (s) { return typeof s === "string" && s.trim(); }).map(function (s) { return s.trim(); }) : [],
      settings: {
        template: TEMPLATES.indexOf(st.template) > -1 ? st.template : b.settings.template,
        accent: /^#[0-9a-f]{6}$/i.test(st.accent) ? st.accent : b.settings.accent,
        font: FONT_KEYS.indexOf(st.font) > -1 ? st.font : b.settings.font
      }
    };
  }
  function load() {
    try { var r = localStorage.getItem(KEY); if (r) return normalize(JSON.parse(r)); } catch (e) {}
    return sample();
  }
  var S = load();

  var saveTimer = null;
  function setStatus(t) { $("#status").textContent = t; }
  function scheduleSave() {
    setStatus("Saving…");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try { localStorage.setItem(KEY, JSON.stringify(S)); setStatus("Saved in this browser"); }
      catch (e) { setStatus("Not saved (storage blocked)"); }
    }, 300);
  }

  /* ---------- editor lists ---------- */
  var LISTS = {
    experience: {
      plural: "positions",
      fields: [["role", "Job title", "text", "full"], ["company", "Company", "text"], ["location", "Location", "text"],
               ["start", "Start date", "month"], ["end", "End date", "month"], ["current", "I currently work here", "check", "full"],
               ["bullets", "Achievements", "area", "full", "One per line. Start with a verb and add numbers where you can."]],
      title: function (i) { return [i.role, i.company].filter(Boolean).join(" · ") || "New position"; }
    },
    projects: {
      plural: "projects",
      fields: [["name", "Project name", "text"], ["link", "Link", "text"], ["tech", "Tech used", "text", "full", "React, Node.js"],
               ["description", "What it does", "area", "full", "One point per line."]],
      title: function (i) { return i.name || "New project"; }
    },
    education: {
      plural: "schools",
      fields: [["school", "School or university", "text", "full"], ["degree", "Degree", "text"], ["field", "Field of study", "text"],
               ["start", "Start date", "month"], ["end", "End date (or expected)", "month"], ["current", "I currently study here", "check", "full"],
               ["details", "Marks", "area", "full", "Grades, honours, relevant coursework."]],
      title: function (i) { return [i.degree, i.school].filter(Boolean).join(" · ") || "New school"; }
    },
    certifications: {
      plural: "certifications",
      fields: [["name", "Certification name", "text", "full"], ["issuer", "Issued by", "text"], ["date", "Date earned", "month"],
               ["link", "Credential link", "text", "full", "credly.com/badges/..."]],
      title: function (i) { return i.name || "New certification"; }
    },
    awards: {
      plural: "awards",
      fields: [["title", "Award title", "text", "full"], ["issuer", "Awarded by", "text"], ["date", "Date", "month"],
               ["description", "Details", "area", "full", "What it was for. One point per line."]],
      title: function (i) { return i.title || "New award"; }
    },
    languages: {
      plural: "languages",
      fields: [["language", "Language", "text"], ["level", "Level", "select", "", LEVELS]],
      title: function (i) { return [i.language, i.level].filter(Boolean).join(" · ") || "New language"; }
    }
  };

  function fieldHtml(list, it, f) {
    var id = list + "-" + it.id + "-" + f[0];
    var cls = "field" + (f[3] === "full" ? " full" : "");
    if (f[2] === "check") {
      return '<div class="' + cls + ' check"><input type="checkbox" id="' + id + '" data-field="' + f[0] + '"' + (it[f[0]] ? " checked" : "") + '><label for="' + id + '">' + f[1] + "</label></div>";
    }
    var ph = f[4] && f[2] !== "select" ? ' placeholder="' + esc(f[4]) + '"' : "";
    var ctl;
    if (f[2] === "area") {
      ctl = '<textarea id="' + id + '" data-field="' + f[0] + '" rows="4"' + ph + ">" + esc(it[f[0]]) + "</textarea>";
    } else if (f[2] === "select") {
      ctl = '<select id="' + id + '" data-field="' + f[0] + '">' + f[4].map(function (o) {
        return '<option value="' + esc(o) + '"' + (it[f[0]] === o ? " selected" : "") + ">" + esc(o) + "</option>";
      }).join("") + "</select>";
    } else if (f[2] === "month") {
      ctl = '<input type="month" id="' + id + '" data-field="' + f[0] + '" value="' + esc(it[f[0]]) + '"' + (f[0] === "end" && it.current ? " disabled" : "") + ">";
    } else {
      ctl = '<input id="' + id + '" data-field="' + f[0] + '" value="' + esc(it[f[0]]) + '"' + ph + ">";
    }
    return '<div class="' + cls + '"><label for="' + id + '">' + f[1] + "</label>" + ctl + "</div>";
  }

  function renderList(name) {
    var L = LISTS[name], box = $("#list-" + name), arr = S[name];
    if (!arr.length) {
      box.innerHTML = '<p class="empty">No ' + L.plural + " yet. Press Add and it shows up on your resume straight away.</p>";
      return;
    }
    box.innerHTML = arr.map(function (it, idx) {
      return '<div class="item" data-list="' + name + '" data-id="' + esc(it.id) + '">' +
        '<div class="item-head"><span class="item-title">' + esc(L.title(it)) + "</span>" +
        '<span class="item-tools">' +
        '<button type="button" class="icon" data-act="up" aria-label="Move up"' + (idx === 0 ? " disabled" : "") + ">↑</button>" +
        '<button type="button" class="icon" data-act="down" aria-label="Move down"' + (idx === arr.length - 1 ? " disabled" : "") + ">↓</button>" +
        '<button type="button" class="icon" data-act="remove" aria-label="Remove">×</button></span></div>' +
        '<div class="grid">' + L.fields.map(function (f) { return fieldHtml(name, it, f); }).join("") + "</div></div>";
    }).join("");
  }

  function renderSkills() {
    var chips = $("#chips"), input = $("#skill-input");
    $$(".chip", chips).forEach(function (c) { c.remove(); });
    S.skills.forEach(function (s, i) {
      var el = document.createElement("span");
      el.className = "chip";
      el.innerHTML = esc(s) + '<button type="button" data-act="skill-remove" data-i="' + i + '" aria-label="Remove ' + esc(s) + '">×</button>';
      chips.insertBefore(el, input);
    });
  }

  function renderStatic() {
    $$("[data-path]").forEach(function (el) {
      var p = el.dataset.path.split(".");
      el.value = S[p[0]][p[1]] || "";
    });
    syncSettings();
    renderList("experience"); renderList("projects"); renderList("education");
    renderList("certifications"); renderList("awards"); renderList("languages");
    renderPhotoUI();
    renderSkills();
  }

  function syncSettings() {
    var st = S.settings;
    $$("[data-act=tpl]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.v === st.template)); });
    $("#set-font").value = st.font;
    var sw = $("#swatches");
    sw.textContent = "";
    SWATCHES.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "swatch"; b.dataset.act = "accent"; b.dataset.v = c;
      b.style.background = c; b.setAttribute("aria-label", "Accent " + c);
      b.setAttribute("aria-pressed", String(c.toLowerCase() === st.accent.toLowerCase()));
      sw.appendChild(b);
    });
    var ci = document.createElement("input");
    ci.type = "color"; ci.id = "set-accent"; ci.dataset.set = "accent"; ci.value = st.accent;
    ci.setAttribute("aria-label", "Custom accent colour");
    sw.appendChild(ci);
  }

  /* ---------- resume rendering ---------- */
  function href(u) { u = String(u || "").trim(); return /^(https?:|mailto:)/i.test(u) ? u : "https://" + u; }
  function bullets(text) {
    var lines = String(text || "").split(/\r?\n/).map(function (l) { return l.trim().replace(/^[-•*]\s*/, ""); }).filter(Boolean);
    return lines.length ? "<ul>" + lines.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") + "</ul>" : "";
  }
  function fmtMonth(v, yearOnly) {
    var m = /^(\d{4})-(\d{2})$/.exec(v || "");
    if (!m) return v || "";
    return yearOnly ? m[1] : MONTHS[+m[2] - 1] + " " + m[1];
  }
  function range(i, yearOnly) {
    return [fmtMonth(i.start, yearOnly), i.current ? "Present" : fmtMonth(i.end, yearOnly)].filter(Boolean).join(" – ");
  }
  function sec(title, body) { return '<section class="sec"><h2>' + title + '</h2><div class="body">' + body + "</div></section>"; }

  function renderResume() {
    var p = S.personal, st = S.settings, r = $("#resume");
    r.className = "t-" + st.template + " f-" + st.font;
    r.style.setProperty("--ra", st.accent);

    var contacts = [];
    if (p.email) contacts.push('<a href="mailto:' + esc(p.email) + '">' + esc(p.email) + "</a>");
    if (p.phone) contacts.push("<span>" + esc(p.phone) + "</span>");
    if (p.location) contacts.push("<span>" + esc(p.location) + "</span>");
    ["website", "linkedin", "github"].forEach(function (k) {
      if (p[k]) contacts.push('<a href="' + esc(href(p[k])) + '">' + esc(String(p[k]).replace(/^https?:\/\//i, "").replace(/\/$/, "")) + "</a>");
    });

    var hasPhoto = /^data:image\//.test(p.photo || "");
    var h = "<header" + (hasPhoto ? ' class="has-photo"' : "") + '><div class="hd">' +
      "<h1>" + (p.name ? esc(p.name) : '<span class="ph">Your name</span>') + "</h1>" +
      (p.title ? '<div class="headline">' + esc(p.title) + "</div>" : "") +
      (contacts.length ? '<div class="contacts">' + contacts.join("") + "</div>" : "") +
      "</div>" + (hasPhoto ? '<img class="photo" alt="" src="' + esc(p.photo) + '">' : "") +
      "</header>";

    if (p.summary.trim()) h += sec("Profile", '<p class="summary">' + esc(p.summary.trim()) + "</p>");

    if (S.experience.length) h += sec("Experience", S.experience.map(function (i) {
      return '<div class="entry"><div class="row"><h3>' + esc(i.role || "Role") + '</h3><span class="dates">' + esc(range(i)) + "</span></div>" +
        '<div class="sub">' + esc([i.company, i.location].filter(Boolean).join(" · ")) + "</div>" + bullets(i.bullets) + "</div>";
    }).join(""));

    if (S.projects.length) h += sec("Projects", S.projects.map(function (i) {
      return '<div class="entry"><div class="row"><h3>' + esc(i.name || "Project") + "</h3>" +
        (i.link ? '<span class="dates"><a href="' + esc(href(i.link)) + '">' + esc(String(i.link).replace(/^https?:\/\//i, "")) + "</a></span>" : "") + "</div>" +
        (i.tech ? '<div class="sub">' + esc(i.tech) + "</div>" : "") + bullets(i.description) + "</div>";
    }).join(""));

    if (S.education.length) h += sec("Education", S.education.map(function (i) {
      return '<div class="entry"><div class="row"><h3>' + esc(i.school || "School") + '</h3><span class="dates">' + esc(range(i, true)) + "</span></div>" +
        '<div class="sub">' + esc([i.degree, i.field].filter(Boolean).join(", ")) + "</div>" + bullets(i.details) + "</div>";
    }).join(""));

    if (S.certifications.length) h += sec("Certifications", S.certifications.map(function (i) {
      var link = i.link ? '<a href="' + esc(href(i.link)) + '">' + esc(String(i.link).replace(/^https?:\/\//i, "")) + "</a>" : "";
      var sub = (i.issuer ? esc(i.issuer) : "") + (i.issuer && link ? " · " : "") + link;
      return '<div class="entry"><div class="row"><h3>' + esc(i.name || "Certification") + '</h3><span class="dates">' + esc(fmtMonth(i.date)) + "</span></div>" +
        (sub ? '<div class="sub">' + sub + "</div>" : "") + "</div>";
    }).join(""));

    if (S.awards.length) h += sec("Awards", S.awards.map(function (i) {
      return '<div class="entry"><div class="row"><h3>' + esc(i.title || "Award") + '</h3><span class="dates">' + esc(fmtMonth(i.date)) + "</span></div>" +
        (i.issuer ? '<div class="sub">' + esc(i.issuer) + "</div>" : "") + bullets(i.description) + "</div>";
    }).join(""));

    if (S.skills.length) h += sec("Skills", '<div class="chips-wrap">' + S.skills.map(function (s) { return '<span class="chip">' + esc(s) + "</span>"; }).join("") + "</div>");

    if (S.languages.length) h += sec("Languages", '<div class="chips-wrap">' + S.languages.map(function (i) {
      return '<span class="chip">' + esc(i.language || "Language") + (i.level ? " · " + esc(i.level) : "") + "</span>";
    }).join("") + "</div>");

    $("#inner").innerHTML = h;
    fit();
  }

  /* ---------- fit the paper to the pane ---------- */
  function fit() {
    var pv = $("#preview"), r = $("#resume"), stage = $("#stage");
    if (!pv.offsetParent && getComputedStyle(pv).display === "none") return;
    var cs = getComputedStyle(pv);
    var avail = pv.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (avail <= 0) return;
    var s = Math.min(1, avail / PAGE_W);
    r.style.transform = "scale(" + s + ")";
    stage.style.width = PAGE_W * s + "px";
    stage.style.height = r.offsetHeight * s + "px";
    var pages = Math.max(1, Math.ceil(($("#inner").scrollHeight - 2) / INNER_PAGE));
    $("#meta").textContent = pages + (pages === 1 ? " page" : " pages") + " · A4";
  }
  if (window.ResizeObserver) new ResizeObserver(fit).observe($("#preview"));
  window.addEventListener("resize", fit);

  function changed() { renderResume(); scheduleSave(); }

  /* ---------- events ---------- */
  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t.dataset.path) {
      var p = t.dataset.path.split("."); S[p[0]][p[1]] = t.value;
      if (t.dataset.path === "personal.name" && !S.personal.photo) renderPhotoUI();
      changed();
    } else if (t.dataset.field) {
      var box = t.closest(".item"), list = box.dataset.list;
      var it = S[list].find(function (x) { return x.id === box.dataset.id; });
      if (t.type === "checkbox") {
        it[t.dataset.field] = t.checked;
        var endBox = $('[data-field="end"]', box);
        if (endBox) { endBox.disabled = t.checked; if (t.checked) { endBox.value = ""; it.end = ""; } }
      } else {
        it[t.dataset.field] = t.value;
      }
      $(".item-title", box).textContent = LISTS[list].title(it);
      changed();
    } else if (t.dataset.set) {
      S.settings[t.dataset.set] = t.value;
      if (t.dataset.set === "accent") $$(".swatch").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.v.toLowerCase() === t.value.toLowerCase())); });
      changed();
    }
  });

  function addSkill(raw) {
    var v = String(raw || "").trim().replace(/,$/, "").trim();
    if (!v) return false;
    if (S.skills.some(function (s) { return s.toLowerCase() === v.toLowerCase(); })) return true;
    S.skills.push(v); renderSkills(); changed(); return true;
  }
  var skillInput = $("#skill-input");
  skillInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); if (addSkill(skillInput.value)) skillInput.value = ""; skillInput.focus(); }
    else if (e.key === "Backspace" && !skillInput.value && S.skills.length) { S.skills.pop(); renderSkills(); changed(); skillInput.focus(); }
  });
  skillInput.addEventListener("blur", function () { if (addSkill(skillInput.value)) skillInput.value = ""; });
  skillInput.addEventListener("paste", function (e) {
    var t = (e.clipboardData || window.clipboardData).getData("text");
    if (/[,\n]/.test(t)) { e.preventDefault(); t.split(/[,\n]/).forEach(addSkill); }
  });

  function arm(btn, label, fn) {
    if (btn.dataset.armed) { clearTimeout(+btn.dataset.armed); delete btn.dataset.armed; btn.textContent = btn.dataset.label; btn.classList.remove("armed"); fn(); return; }
    btn.dataset.label = btn.textContent; btn.textContent = label; btn.classList.add("armed");
    btn.dataset.armed = setTimeout(function () { delete btn.dataset.armed; btn.textContent = btn.dataset.label; btn.classList.remove("armed"); }, 3000);
  }
  function replaceAll(d, msg) { S = normalize(d); renderStatic(); renderResume(); scheduleSave(); setStatus(msg); }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]"); if (!b) return;
    var act = b.dataset.act;

    if (act === "tpl") { S.settings.template = b.dataset.v; syncSettings(); changed(); }
    else if (act === "accent") { S.settings.accent = b.dataset.v; syncSettings(); changed(); }
    else if (act === "tab") {
      $("#app").dataset.view = b.dataset.view;
      $$("[data-act=tab]").forEach(function (t) { t.setAttribute("aria-selected", String(t === b)); });
      if (b.dataset.view === "preview") requestAnimationFrame(fit);
    }
    else if (act === "add") {
      var name = b.dataset.list, blankItem = { id: uid() };
      LISTS[name].fields.forEach(function (f) { blankItem[f[0]] = f[2] === "check" ? false : f[2] === "select" ? f[4][1] || f[4][0] : ""; });
      S[name].push(blankItem); renderList(name); changed();
      var last = $$("#list-" + name + " .item").pop(); if (last) { var first = $("input", last); if (first) first.focus(); last.scrollIntoView({ block: "nearest" }); }
    }
    else if (act === "up" || act === "down" || act === "remove") {
      var box = b.closest(".item"), list = box.dataset.list, arr = S[list];
      var i = arr.findIndex(function (x) { return x.id === box.dataset.id; });
      if (act === "remove") arr.splice(i, 1);
      else { var j = act === "up" ? i - 1 : i + 1; if (j < 0 || j >= arr.length) return; var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp; }
      renderList(list); changed();
    }
    else if (act === "skill-remove") { S.skills.splice(+b.dataset.i, 1); renderSkills(); changed(); }
    else if (act === "sample") arm(b, "Replace with sample?", function () { replaceAll(sample(), "Sample loaded"); });
    else if (act === "clear") arm(b, "Clear everything?", function () { var keep = S.settings; var d = blank(); d.settings = keep; replaceAll(d, "Cleared"); });
    else if (act === "print") {
      document.title = ((S.personal.name || "Resume").trim() + " - Resume");
      window.print();
    }
    else if (act === "export") {
      var blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = ((S.personal.name || "resume").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "resume") + ".json";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      setStatus("Exported backup file");
    }
    else if (act === "import") $("#import-file").click();
    else if (act === "photo-pick") $("#photo-file").click();
    else if (act === "photo-remove") { S.personal.photo = ""; renderPhotoUI(); changed(); }
  });
  window.addEventListener("afterprint", function () { document.title = baseTitle; });

  $("#import-file").addEventListener("change", function (e) {
    var f = e.target.files[0]; if (!f) return;
    var fr = new FileReader();
    fr.onload = function () {
      try {
        var d = JSON.parse(fr.result);
        if (!d || typeof d !== "object" || !d.personal) throw new Error("bad");
        replaceAll(d, "Imported " + f.name);
      } catch (err) { setStatus("That file is not a ResumeForge export"); }
    };
    fr.readAsText(f); e.target.value = "";
  });

  /* ---------- profile photo ---------- */
  function renderPhotoUI() {
    var pv = $("#photo-preview"), has = /^data:image\//.test(S.personal.photo || "");
    if (has) { pv.style.backgroundImage = 'url("' + S.personal.photo + '")'; pv.textContent = ""; }
    else {
      pv.style.backgroundImage = "";
      var ini = (S.personal.name || "").trim().split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0].toUpperCase(); }).join("");
      pv.textContent = ini || "+";
    }
    $("#photo-remove").disabled = !has;
  }
  $("#photo-file").addEventListener("change", function (e) {
    var f = e.target.files[0]; e.target.value = "";
    if (!f) return;
    if (!/^image\//.test(f.type)) { setStatus("Choose an image file (JPG, PNG or WebP)"); return; }
    var fr = new FileReader();
    fr.onload = function () {
      var img = new Image();
      img.onload = function () {
        var size = 360, c = document.createElement("canvas");
        c.width = c.height = size;
        var ctx = c.getContext("2d"), side = Math.min(img.width, img.height);
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
        S.personal.photo = c.toDataURL("image/jpeg", 0.85);
        renderPhotoUI(); changed();
      };
      img.onerror = function () { setStatus("Could not read that image"); };
      img.src = fr.result;
    };
    fr.readAsDataURL(f);
  });

  /* ---------- boot ---------- */
  renderStatic();
  renderResume();
  setStatus(localStorage_ok() ? "Saved in this browser" : "Storage blocked: use Export to keep your work");
  function localStorage_ok() { try { localStorage.setItem("__t", "1"); localStorage.removeItem("__t"); return true; } catch (e) { return false; } }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
})();
