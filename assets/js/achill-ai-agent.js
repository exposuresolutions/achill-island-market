/* Achill Market AI Agent loader
   Hidden by default until a widget ID is provided.
*/
(function () {
  var WIDGET_ID = (window.ACHILL_CHAT_WIDGET_ID || "").trim();
  if (!WIDGET_ID) return;

  var script = document.createElement("script");
  script.src = "https://widgets.leadconnectorhq.com/loader.js";
  script.async = true;
  script.setAttribute(
    "data-resources-url",
    "https://widgets.leadconnectorhq.com/chat-widget/loader.js"
  );
  script.setAttribute("data-widget-id", WIDGET_ID);
  document.body.appendChild(script);
})();
