// Helpers shared by the print pieces. Needs ../data/band.js loaded first.
(function () {
  var D = window.ALR, C = D.contact;

  // Text for contact lines; shows a highlighted placeholder if a detail isn't filled in yet.
  window.contactBits = function () {
    return {
      phone: C.phone ? "WhatsApp " + C.phone : '<span class="todo">WhatsApp +34 ··· ··· ···</span>',
      email: C.email || '<span class="todo">bookings@ email TBC</span>',
      web: C.website || "facebook.com/A-Las-Raices",
      area: C.area,
      leader: C.leader
    };
  };

  window.markSample = function () {
    if (D.DRAFT) document.querySelectorAll(".sheet").forEach(function (s) { s.classList.add("sample"); });
  };

  // Make every element with [data-edit] editable on screen.
  window.makeEditable = function () {
    document.querySelectorAll("[data-edit]").forEach(function (el) { el.setAttribute("contenteditable", "true"); el.spellcheck = false; });
  };

  window.toolbar = function (html) {
    var t = document.createElement("div");
    t.className = "toolbar";
    t.innerHTML = (html || "") +
      '<span class="hint">Click any text to change it.</span>' +
      '<button class="primary" type="button" onclick="window.print()">Print / Save as PDF</button>';
    document.body.prepend(t);
    return t;
  };
})();
