// Store our API endpoint inside queryUrl
// var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

var faultUrl = "https://raw.githubusercontent.com/monteirof4/Earthquake_Visualization/master/assets/data/boundaries.json"

function fillColors(mag) {
  var color = "#FF0000"
  
  if (mag <= 1) {
    color = "#00FF00";
  }
  else if (mag <= 2) {
    color = "#CCFF00";
  }
  else if (mag <= 3) {
    color = "#FFFF00";
  }
  else if (mag <= 4) {
    color = "#FFAA00";
  }
  else if (mag <= 5) {
    color = "#FF5500";
  };  

  return color;
};

// Request Earthquakes data
d3.json(queryUrl, function(earthquakeData) {
  // Once we get a response, send the data.features object to the createFeatures function
  var earthquakes = createFeatures(earthquakeData.features);
  
  d3.json(faultUrl, function(faultData) {
    // Once we get a response, send the data.features object to the createFeatures function
    var myStyle = {
      "color": "#FFAA00",
      "weight": 5,
      "opacity": 0.65
    };
    
    faultlines = L.geoJson(faultData.features, {
                                                style: myStyle});
    createMap(earthquakes, faultlines);
  });

});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.title +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }
  
  // Transform the markers to circles with radius and color equal to the earthquake magnitude 
  function pointToLayer(feature, latlng) {
    var geojsonMarkerOptions = {
      radius: feature.properties.mag * 5,
      fillColor: fillColors(feature.properties.mag),
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    };
    
    return L.circleMarker(latlng, geojsonMarkerOptions);
  };

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer
  });

  // Sending our earthquakes layer to the createMap function
  // createMap(earthquakes);
  return earthquakes;
}

function createMap(earthquakes, faultlines) {

  // Define streetmap and darkmap layers
  var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets-satellite",
    accessToken: API_KEY
  });

  var grayscaleMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var outdoorsMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": satelliteMap,
    "Grayscale": grayscaleMap,
    "Outdoors": outdoorsMap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Fault Lines": faultlines 
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      36.1699, -115.1398
    ],
    zoom: 3,
    layers: [satelliteMap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Set up the legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = [1,2,3,4,5,6];
    var labels = [];

    // Add min & max
    var legendInfo = "<h1>Magnitude</h1>" +
      "<div class=\"labels\">" +
        "<div class=\"min\">" + limits[0] + "</div>" +
        "<div class=\"max\">5+</div>" +
      "</div>";

    div.innerHTML = legendInfo;

    limits.forEach(function(limit, index) {
      labels.push("<li style=\"background-color: " + fillColors(limit) + "\"></li>");
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };

  // Adding legend to the map
  legend.addTo(myMap);

};
