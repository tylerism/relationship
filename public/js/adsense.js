(function () {
  const config = window.CONNECTION_CARDS_ADS;
  if (!config?.enabled || !config.publisherId) return;

  const publisherId = config.publisherId.trim();
  if (!publisherId.startsWith("ca-pub-")) {
    console.warn("AdSense: publisherId should look like ca-pub-XXXXXXXXXXXXXXXX");
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
  document.head.appendChild(script);

  script.onload = function () {
    document.querySelectorAll(".ad-slot[data-ad-unit]").forEach(function (container) {
      const unitKey = container.dataset.adUnit;
      const slotId = (config.slots && config.slots[unitKey]) || "";

      const ins = document.createElement("ins");
      ins.className = "adsbygoogle";
      ins.style.display = "block";
      ins.setAttribute("data-ad-client", publisherId);
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
