document.addEventListener("DOMContentLoaded", function () {
var map = L.map('map').setView([31.5204, 74.3587], 13);
const citiesList = [
  "Islamabad", "Karachi", "Lahore", "Rawalpindi", "Peshawar", 
  "Quetta", "Multan", "Faisalabad", "Sialkot", "Gujranwala", 
  "Sukkur", "Bahawalpur", "Sargodha", "Dera Ghazi Khan", "Jhelum", 
  "Mardan", "Swat", "Gujrat", "Mingora", "Faisalabad", 
  "Chiniot", "Larkana", "Khushab", "Chakwal", "Nawabshah", 
  "Zhob", "Bannu", "Sahiwal", "Hassan Abdal", "Mianwali", 
  "Kasur", "Kohat", "Saidu Sharif", "Bannu", "Mirpur", 
  "Muzaffarabad", "Chitral", "Shikarpur", "Tando Adam", 
  "Jhelum", "Sheikhupura", "Mansehra", "Mianwali", "Dera Ismail Khan",
  "Haripur", "Sukkur", "Hangu", "Lodhran", "Turbat", "Ghotki", 
  "Jacobabad", "Matiari", "Mithan Kot", "Pishin", "Sibi", "Jacobabad", 
  "Tando Allahyar", "Gujar Khan", "Sargodha", "Chiniot", 
  "Muzaffargarh", "Bhalwal", "Kohat", "Mardan", "Khairpur", "Abbottabad", 
  "Kotli", "Buner", "Swabi", "Karak", "Jammu", "Mirpur", "Ziarat", "Dera Ghazi Khan"
];
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

var geocoder = L.Control.Geocoder.nominatim();
document.getElementById("search-btn").addEventListener("click", async function (e) {
  e.preventDefault(); 
  var location = document.getElementById("location-input").value;

  if (location.trim() === "") {
    alert("Please enter a location.");
    return;
  }

  try {
    const results = await new Promise((resolve, reject) => {
      return resolve(geocoder.geocode(location, function(results, status) {}));

    });
    if (results.length === 0) {
      throw new Error("Location not found. Please try again.");
    }

    var lat = results[0].center.lat;
    var lon = results[0].center.lng;
    var address = results[0].name || "No address available";
    var addressDetails = results[0].properties || {};
    var displayName = results[0].name || results[0].properties?.display_name || "N/A";
    var timestamp = new Date();

    if (isNaN(timestamp)) {
      throw new Error("Invalid timestamp.");
    }

    var formattedTimestamp = timestamp.toISOString().slice(0, 16);
    var parts = displayName.split(',').map(part => part.trim());
    var country = parts[parts.length - 1] || "";
    var postalCode = "";
  for (let i = parts.length - 1; i >= 0; i--) {
    if (/^\d+$/.test(parts[i])) {
      postalCode = parts[i];
      break;
    }
  }
  var provinceList = ["Punjab", "Sindh", "Balochistan", "Khyber Pakhtunkhwa"];
  var province = "";
  for (let part of parts) {
    if (provinceList.includes(part)) {
      province = part;
      break;
    }
  }
  var addressParts = parts.slice(0, 3);
  if (province !== "") {
    addressParts.push(province);
  }
  if (country !== "") {
    addressParts.push(country);
  }
  var city = "N/A";
  if (province !== "N/A") {
    var provinceIndex = parts.indexOf(province);
    if (provinceIndex > 0) {
      city = parts[provinceIndex - 1];
    }
  }
  var structuredAddress = addressParts.join(", ");
  var city = "";
  for (let i = 0; i < parts.length; i++) {
    if (citiesList.includes(parts[i])) {
      city = parts[i];
      break;
    }
  }
    map.setView([lat, lon], 13);
    var marker = L.marker([lat, lon]).addTo(map);
    marker.bindPopup(`<b>${address}</b>`).openPopup();
    document.getElementById("latitude").value = lat;
    document.getElementById("longitude").value = lon;
    document.getElementById("address").value = structuredAddress;
    document.getElementById("country").value = country;
    document.getElementById("state").value = province;
    document.getElementById("postal_code").value = postalCode;
    document.getElementById("city").value = city;
    document.getElementById("timestamp").value = formattedTimestamp;

  } catch (error) {
    console.error("Error:", error.message);
    alert(error.message);
  }
});
});

