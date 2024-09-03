import folium
import requests
import json

# Fetch the GeoJSON data from the URL
url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
response = requests.get(url)
data = response.json()

# Initialize a map centered at an approximate central location of the dataset
map_center = [20.0, 0.0]  # This is a rough estimate, you can adjust based on your data
m = folium.Map(location=map_center, zoom_start=2)

# Function to determine marker size based on magnitude
def get_marker_size(magnitude):
    return magnitude * 2  # Adjust this multiplier as needed

# Function to determine marker color based on depth
def get_marker_color(depth):
    return '#%02x%02x%02x' % (int(255 - depth * 2.55), 0, int(depth * 2.55))

# Add earthquake markers to the map
for feature in data['features']:
    coordinates = feature['geometry']['coordinates']
    magnitude = feature['properties']['mag']
    depth = coordinates[2]  # Depth is the third element in the coordinates array
    folium.CircleMarker(
        location=[coordinates[1], coordinates[0]],  # Lat, Long
        radius=get_marker_size(magnitude),
        color=get_marker_color(depth),
        fill=True,
        fill_color=get_marker_color(depth),
       
