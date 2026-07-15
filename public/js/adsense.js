(function () {
  var PUBLISHER_ID = "ca-pub-3044538481550122";
  var config = window.CONNECTION_CARDS_ADS || {};
  if (config.enabled === false) return;

  function mountAds() {
    if (!window.adsbygoogle) {
      setTimeout(mountAds, 100);
      return;
    }

    document.querySelectorAll(".ad-slot[data-ad-unit]").forEach(function (container) {
      if (container.dataset.adMounted === "true") return;
      container.dataset.adMounted = "true";

      var unitKey = container.dataset.adUnit;
      var slotId = (config.slots && config.slots[unitKey]) || "";

      var ins = document.createElement("ins");
      ins.className = "adsbygoogle";
      ins.style.display = "block";
      ins.setAttribute("data-ad-client", PUBLISHER_ID);
      if (slotId) ins.setAttribute("data-ad-slot", slotId);
      ins.setAttribute("data-ad-format", "auto");
      ins.setAttribute("data-full-width-responsive", "true");

      container.appendChild(ins);
      container.hidden = false;

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.warn("AdSense:", error);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountAds);
  } else {
    mountAds();
  }
})();
