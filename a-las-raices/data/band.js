// A Las Raices — one place for dates, residency, tickets and contact details.
// The website and the printable posters all read from this file.
//
// Set DRAFT to false once the dates, prices and contact details below are confirmed.
// While it's true, the site shows a "draft" banner and posters print a SAMPLE watermark.
window.ALR = {
  DRAFT: true,

  contact: {
    leader: "Demircan Ulugun",
    phone: "",          // e.g. "+34 600 000 000" (WhatsApp)
    email: "",          // e.g. "bookings@alasraices.com"
    website: "",        // e.g. "alasraices.com" once the domain is live
    facebook: "https://www.facebook.com/people/A-Las-Raices/100083239897155/",
    area: "La Zenia · Cabo Roig · Torrevieja · Costa Blanca"
  },

  // Bookings and ticket orders are sent here (Exposure form API → Telegram alert).
  formApi: "https://dodealswithlee.onrender.com/api/client-form",

  // Weekly residency (shown on the website and the residency poster).
  residency: {
    title: "Sunday Gipsy Fiesta",
    day: "Every Sunday",
    time: "2pm – 5pm",
    venue: "Beach bar name TBC",
    place: "La Zenia Beach",
    note: "Free entry · Book a table to guarantee a seat"
  },

  // Upcoming dates. Dates are YYYY-MM-DD. Add `tickets: true` for shows sold through the site.
  gigs: [
    { date: "2026-10-24", time: "2pm", venue: "The Lucky Lion", town: "Cabo Roig", lineup: "Trio" },
    { date: "2026-10-25", time: "2pm", venue: "Beach bar name TBC", town: "La Zenia Beach", lineup: "Trio", residency: true },
    { date: "2026-10-30", time: "8pm", venue: "Bushwacka", town: "Cabo Roig", lineup: "Duo" },
    { date: "2026-11-01", time: "2pm", venue: "Beach bar name TBC", town: "La Zenia Beach", lineup: "Trio", residency: true },
    { date: "2026-11-07", time: "8pm", venue: "Venue TBC", town: "Torrevieja", lineup: "Full band", title: "Gipsy Fiesta Night", tickets: true }
  ],

  // Ticket packages for ticketed shows. `payLink` = a Stripe Payment Link (leave "" to take
  // reservations and payment on the door until Stripe is set up).
  ticketPackages: [
    { id: "ticket", name: "Show Ticket",   price: 12,  per: "person",  includes: ["Entry to the show"], payLink: "" },
    { id: "fiesta", name: "Fiesta Package", price: 29, per: "person",  includes: ["Entry", "Welcome sangria", "Tapas plate"], payLink: "", featured: true },
    { id: "vip",    name: "VIP Table",     price: 149, per: "table of 4", includes: ["Reserved table by the stage", "Bottle of cava", "Tapas to share", "Photo with the band"], payLink: "" }
  ],

  // Private events — quote on request.
  privatePackages: [
    { name: "Duo",       blurb: "Guitar & vocals. Dinners, terraces, intimate parties." },
    { name: "Trio",      blurb: "Guitars, vocals & percussion. Birthdays, villa & beach parties." },
    { name: "Full Band", blurb: "Up to nine musicians. Weddings, festivals, corporate nights." }
  ]
};

// Shared helpers
window.ALR.fmtDate = function (iso, opts) {
  var d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", opts || { weekday: "short", day: "numeric", month: "short" });
};
window.ALR.upcoming = function (limit) {
  var today = new Date(); today.setHours(0, 0, 0, 0);
  return window.ALR.gigs
    .filter(function (g) { return new Date(g.date + "T23:59:59") >= today; })
    .sort(function (a, b) { return a.date < b.date ? -1 : 1; })
    .slice(0, limit || 99);
};
