// local_risk_map.js
// Module B1: Local Risk Map (Vanilla JS + Leaflet)
// Author: For HarvestGuard - copy into repository and include in index.html

// Farmer's mocked location (change to farmer's district coords if known)
const farmerLocation = { lat: 23.8103, lng: 90.4125 }; // Dhaka (example)

// Create map container element (if not present, index.html should have <div id="local-risk-map"></div>)
function initLocalRiskMap() {
  // ensure Leaflet is loaded
  if (typeof L === "undefined") {
    console.error("Leaflet not loaded.");
    return;
  }

  // create map
  const map = L.map("local-risk-map", { touchZoom: true, zoomControl: true }).setView([farmerLocation.lat, farmerLocation.lng], 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  // marker icons using simple colored circle markers (Leaflet simple)
  const blueIcon = L.icon({ iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png", iconSize: [32,32], iconAnchor: [16,32] });
  const greenIcon = L.icon({ iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png", iconSize: [32,32], iconAnchor: [16,32] });
  const redIcon = L.icon({ iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png", iconSize: [32,32], iconAnchor: [16,32] });
  const orangeIcon = L.icon({ iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/orange-dot.png", iconSize: [32,32], iconAnchor: [16,32] });

  // farmer marker (blue)
  const farmerMarker = L.marker([farmerLocation.lat, farmerLocation.lng], { icon: blueIcon }).addTo(map);
  farmerMarker.bindPopup("আপনার অবস্থান").openPopup();

  // generate 10-15 anonymous mock neighbors inside small bounding box around district center
  function generateMockNeighbors(count = 12) {
    const neighbors = [];
    // bounding box ~ +/- 0.06 degrees (~6-7 km depending on lat) - adjust if you want smaller/larger
    const latRange = 0.06;
    const lngRange = 0.06;
    const riskLevels = ["Low", "Medium", "High"];
    const crops = ["ধান", "সবজি", "আলু", "মসলা", "শাকসবজি"];

    for (let i = 0; i < count; i++) {
      const lat = farmerLocation.lat + (Math.random() - 0.5) * latRange;
      const lng = farmerLocation.lng + (Math.random() - 0.5) * lngRange;
      const risk = riskLevels[Math.floor(Math.random() * riskLevels.length)];
      const crop = crops[Math.floor(Math.random() * crops.length)];
      const minutesAgo = Math.floor(Math.random() * 120) + 5;
      const updateBangla = `${minutesAgo} মিনিট আগে`;

      neighbors.push({
        id: "anon-" + i,
        lat, lng, risk, crop, updateBangla
      });
    }
    return neighbors;
  }

  const neighbors = generateMockNeighbors(12);

  // add neighbor markers with color-coded icons and Bangla popups
  neighbors.forEach(n => {
    let icon = greenIcon;
    if (n.risk === "High") icon = redIcon;
    else if (n.risk === "Medium") icon = orangeIcon;

    const marker = L.marker([n.lat, n.lng], { icon }).addTo(map);

    // popup content entirely in Bangla — anonymous
    const riskBangla = n.risk === "High" ? "উচ্চ" : n.risk === "Medium" ? "মধ্যম" : "নিম্ন";
    const popupHtml = `<div style="font-size:14px;line-height:1.2">
      ফসল: ${n.crop} <br/>
      ঝুঁকি: ${riskBangla} <br/>
      আপডেট: ${n.updateBangla}
    </div>`;

    marker.bindPopup(popupHtml);
  });

  // make map responsive if container size changes
  setTimeout(() => { map.invalidateSize(); }, 300);
}

// If DOM already has map container, initialize after DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // ensure there is a map div
  if (!document.getElementById("local-risk-map")) {
    // If index.html doesn't have map div, create below a logical place: append to body end
    const wrapper = document.createElement("div");
    wrapper.style.margin = "12px 0";
    wrapper.innerHTML = `<h3 style="margin:6px 0">স্থানীয় ঝুঁকি মানচিত্র</h3><div id="local-risk-map" style="height:420px;border:1px solid #ddd;border-radius:6px"></div>`;
    document.body.appendChild(wrapper);
  }
  initLocalRiskMap();
});
