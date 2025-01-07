
document.addEventListener("DOMContentLoaded", function () {
  const map = L.map("map").setView([31.5204, 74.3587], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);
  const customIcon = L.icon({
    iconUrl: "<%= asset_path('marker-icon-2x.png') %>",
    iconSize: [25, 30],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null
  });
  L.Marker.prototype.options.icon = customIcon;
  const geocoder = L.Control.Geocoder.nominatim();
  const citiesList = [
    "Islamabad", "Karachi", "Lahore", "Rawalpindi", "Peshawar", "Quetta", 
    "Multan", "Faisalabad", "Sialkot", "Gujranwala", "Sukkur", "Bahawalpur",
    "Sargodha", "Dera Ghazi Khan", "Jhelum", "Mardan", "Swat", "Gujrat", 
    "Mingora", "Chiniot", "Larkana", "Khushab", "Chakwal", "Nawabshah",
    "Zhob", "Bannu", "Sahiwal", "Hassan Abdal", "Mianwali", "Kasur", 
    "Kohat", "Saidu Sharif", "Mirpur", "Muzaffarabad", "Chitral", 
    "Shikarpur", "Tando Adam", "Sheikhupura", "Mansehra", "Dera Ismail Khan",
    "Haripur", "Lodhran", "Turbat", "Ghotki", "Jacobabad", "Matiari", 
    "Mithan Kot", "Pishin", "Sibi", "Tando Allahyar", "Gujar Khan", 
    "Muzaffargarh", "Bhalwal", "Khairpur", "Abbottabad", "Kotli", "Buner", 
    "Swabi", "Karak", "Jammu", "Ziarat"
  ];

  function updateFormFields(lat, lon, structuredAddress, country, province, postalCode, city) {
    const timestamp = new Date().toISOString().slice(0, 16);
    document.getElementById("latitude").value = lat;
    document.getElementById("longitude").value = lon;
    document.getElementById("address").value = structuredAddress;
    document.getElementById("country").value = country;
    document.getElementById("state").value = province;
    document.getElementById("postal_code").value = postalCode;
    document.getElementById("city").value = city;
    document.getElementById("timestamp").value = timestamp;
    document.getElementById("latitude-input").value = lat;
    document.getElementById("longitude-input").value = lon;
  }

  function parseAddressComponents(displayName) {
    const parts = displayName.split(",").map((part) => part.trim());
    const country = parts[parts.length - 1] || "";
    const postalCode = parts.find((part) => /^\d+$/.test(part)) || "";
    const province = parts.find((part) => ["Punjab", "Sindh", "Balochistan", "Khyber Pakhtunkhwa"].includes(part)) || "";
    const city = parts.find((part) => citiesList.includes(part)) || "";
    const structuredAddress = parts.slice(0, 3).concat(province || [], country || []).join(", ");
    return { country, postalCode, province, city, structuredAddress };
  }

  async function geocodeLocation(location) {
    const results = await new Promise((resolve) =>
      resolve(geocoder.geocode(location, () => {}))
    );
    if (results.length === 0) throw new Error("Location not found. Please try again.");
    return results[0];
  }

  async function reverseGeocode(lat, lon) {
    const results = await new Promise((resolve) =>
      resolve(geocoder.reverse({ lat, lng: lon }, map.options.crs.scale(map.getZoom())))
    );
    if (results.length === 0) throw new Error("Address not found.");
    return results[0];
  }

  function processResults(results, lat, lon) {
    const displayName = results.name || results.properties?.display_name || "";
    const { country, postalCode, province, city, structuredAddress } = parseAddressComponents(displayName);
    map.setView([lat, lon], 13);

    const marker = L.marker([lat, lon], { draggable: true }).addTo(map);
    marker.bindPopup(`<b>${structuredAddress}</b>`).openPopup();

    updateFormFields(lat, lon, structuredAddress, country, province, postalCode, city);

    marker.on("dragend", async function (e) {
      const newLat = e.target.getLatLng().lat;
      const newLon = e.target.getLatLng().lng;

      try {
        const reverseResults = await reverseGeocode(newLat, newLon);
        const displayName = reverseResults.name || reverseResults.properties?.display_name || "";
        const { country, postalCode, province, city, structuredAddress } = parseAddressComponents(displayName);

        // Update marker popup and form fields
        marker.bindPopup(`<b>${structuredAddress}</b>`).openPopup();
        updateFormFields(newLat, newLon, structuredAddress, country, province, postalCode, city);
      } catch (error) {
        console.error("Error:", error.message);
        alert("An error occurred while fetching the address.");
      }
    });
  }

  document.getElementById("search-btn").addEventListener("click", async function (e) {
e.preventDefault();
const location = document.getElementById("location-input").value.trim();
const latitude = document.getElementById("latitude-input").value.trim();
const longitude = document.getElementById("longitude-input").value.trim();

if (latitude && longitude) {
try {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  if (isNaN(lat) || isNaN(lon)) throw new Error("Invalid latitude or longitude.");
  const results = await reverseGeocode(lat, lon);
  processResults(results, lat, lon);
} catch (error) {
  console.error("Error:", error.message);
  alert(error.message);
}
} else if (location) {
try {
  const results = await geocodeLocation(location);
  processResults(results, results.center.lat, results.center.lng);
} catch (error) {
  console.error("Error:", error.message);
  alert(error.message);
}
} else {
alert("Please enter a location or latitude and longitude.");
}
});


  document.getElementById("current-location-btn").addEventListener("click", function (e) {
    e.preventDefault();
    if (!navigator.geolocation) return alert("Geolocation is not supported by your browser.");
    navigator.geolocation.getCurrentPosition(
      async function (position) {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const results = await reverseGeocode(lat, lon);
          processResults(results, lat, lon);
        } catch (error) {
          console.error("Error:", error.message);
          alert("An error occurred while fetching the address.");
        }
      },
      (error) => {
        console.error("Geolocation error:", error.message);
        alert("Unable to fetch your location. Please check your device settings.");
      }
    );
  });
});
