// Helpers shared by the print pieces. Needs ../data/band.js loaded first.
(function () {
  var D = window.ALR, C = D.contact;

  // Booking contact lines — all bookings go through the agency (Exposure Solutions).
  // Shows a highlighted placeholder if a detail isn't filled in yet.
  window.contactBits = function () {
    var A = D.agency;
    return {
      agency: A.name,
      phone: A.phone ? "WhatsApp " + A.phone : '<span class="todo">WhatsApp +34 ··· ··· ···</span>',
      email: A.email,
      web: A.website,
      area: C.area,
      leader: C.leader,
      facebook: "facebook.com/A-Las-Raices"
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
