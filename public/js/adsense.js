(function () {
  const PUBLISHER_ID = "ca-pub-3044538481550122";
  const config = window.CONNECTION_CARDS_ADS || {};
  if (config.enabled === false) return;

  const script = document.createElement("script");
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUBLISHER_ID}`;
  document.head.appendChild(script);

  script.onload = function () {
    document.querySelectorAll(".ad-slot[data-ad-unit]").forEach(function (container) {
      const unitKey = container.dataset.adUnit;
      const slotId = (config.slots && config.slots[unitKey]) || "";

      const ins = document.createElement("ins");
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
  };
})();
