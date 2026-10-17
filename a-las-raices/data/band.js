// A Las Raices — one place for dates, residency, tickets and contact details.
// The website and the printable posters all read from this file.
//
// Set DRAFT to false once the dates, prices and contact details below are confirmed.
// While it's true, the site shows a "draft" banner and posters print a SAMPLE watermark.
window.ALR = {
  DRAFT: true,

  // All bookings (private gigs, venue + band parties, tickets) go through Exposure Solutions.
  agency: {
    name: "Exposure Solutions",
    assistant: "Lilly",           // Exposure's phone assistant (ElevenLabs agent on the number below)
    phone: "+353 98 78500",       // international format, used for call links
    phoneLocal: "098 78500",      // how it's printed
    whatsapp: "",                 // optional WhatsApp number for bookings
    email: "hello@exposuresolutions.me",
    website: "exposuresolutions.me",
    logo: "assets/exposure-logo.png"
  },

  // Customer photo/video uploads (Cloudflare Pages Function → Exposure Telegram).
  uploadApi: "/api/upload",

  // After the job: contractor uploads photos/videos of the finished job, then the
  // customer pays the balance. Paste a Stripe Payment Link here to take card payments.
  finalPayment: { link: "", note: "Exposure will send your final invoice once the photos are in." },

  contact: {
    leader: "Demircan Ulugun",
    website: "",        // e.g. "alasraices.com" once the band has its own domain
    facebook: "https://www.facebook.com/people/A-Las-Raices/100083239897155/",
    area: "La Zenia · Cabo Roig · Torrevieja · Costa Blanca"
  },

  // Partner venues: where the band plays, where the screen ad runs, and where people can
  // book a party with the band. `party: true` = can be booked as "venue + band".
  venues: [
    { name: "Beach bar name TBC", town: "La Zenia Beach", type: "Beach bar", screen: true, party: true, blurb: "Sunday residency on the sand." },
    { name: "The Lucky Lion",     town: "Cabo Roig",      type: "Bar & restaurant", screen: true, party: true, blurb: "Saturday afternoon fiestas." },
    { name: "Bushwacka",          town: "Cabo Roig",      type: "Bar", screen: true, party: true, blurb: "Evening sets on the strip." }
  ],

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
