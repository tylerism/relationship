// After Google AdSense approves your site:
// 1. Set publisherId to your ca-pub-... ID from AdSense → Account → Account information
// 2. Create a Display ad unit in AdSense and paste its slot ID into slots.footer
// 3. Update public/ads.txt with your publisher ID (pub-... without "ca-")
// 4. Set enabled to true and redeploy
window.CONNECTION_CARDS_ADS = {
  enabled: false,
  publisherId: "",
  slots: {
    footer: ""
  }
};
