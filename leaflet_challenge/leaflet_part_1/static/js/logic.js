// Initialize the map
var map = L.map('map').setView([20, 0], 2);

// Add the Mapbox satellite tile layer
L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamVubGVlbWNuZXciLCJhIjoiY20wcjZieW5pMDVsYzJtcHVlaDN4cmg5YyJ9.5iyAyymhtgJga6CZ-91oyw', {
    maxZoom: 18,
    attribution: '© Mapbox © OpenStreetMap © Satellite',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiamVubGVlbWNuZXciLCJhIjoiY20wcjZieW5pMDVsYzJtcHVlaDN4cmg5YyJ9.5iyAyymhtgJga6CZ-91oyw'
}).addTo(map);

// Function to get color based on earthquake depth, using green tones
function getColor(depth) {
    return depth > 90 ? '#004d00' :   // Dark green for deep earthquakes
           depth > 70 ? '#006600' :   // Slightly lighter dark green
           depth > 50 ? '#009900' :   // Medium green
           depth > 30 ? '#00cc00' :   // Lighter green
           depth > 10 ? '#00ff00' :   // Bright green for shallow earthquakes
                        '#b3ffb3';    // Very light green for the shallowest earthquakes
}

// Function to get radius based on earthquake magnitude
function getRadius(magnitude) {
    return magnitude * 4;  // Adjust for proper sizing
}

// Create empty layers for the overlay controls
var earthquakes = L.layerGroup();
var tectonicPlates = L.layerGroup();

// Fetch earthquake data from USGS and add it to the earthquakes overlay layer
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {
    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            var mag = feature.properties.mag;
            var depth = feature.geometry.coordinates[2];

            return L.circleMarker(latlng, {
                radius: getRadius(mag),
                fillColor: getColor(depth),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                "<h3>" + feature.properties.place + "</h3>" +
                "<p>Magnitude: " + feature.properties.mag + "<br>" +
                "Depth: " + feature.geometry.coordinates[2] + " km</p>"
            );
        }
    }).addTo(earthquakes);
});

// Fetch tectonic plates data and add it to the tectonicPlates overlay layer
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(plateData) {
    L.geoJSON(plateData, {
        style: function() {
            return { color: "#ff6600", weight: 2 };  // Orange color for the tectonic plate boundaries
        }
    }).addTo(tectonicPlates);
});

// Create and add legend to the map
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        depths = [0, 10, 30, 50, 70, 90],
        labels = [];

    div.innerHTML = '<strong>Earthquake Depth (Green Scale)</strong><br>';

    for (var i = 0; i < depths.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
            depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);

// Add base and overlay layers to the map
var baseLayers = {
    "Satellite": L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamVubGVlbWNuZXciLCJhIjoiY20wcjZieW5pMDVsYzJtcHVlaDN4cmg5YyJ9.5iyAyymhtgJga6CZ-91oyw')
};

var overlayLayers = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
};

// Add layer control to the map
L.control.layers(baseLayers, overlayLayers, {
    collapsed: false
}).addTo(map);

// Make both layers visible by default
earthquakes.addTo(map);
tectonicPlates.addTo(map);


