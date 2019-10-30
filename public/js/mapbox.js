const locations = JSON.parse(document.getElementById('map').dataset.locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoidmVzZWwtb3V0IiwiYSI6ImNqaXZnaDExeTJrcTEzd3BhOXhjYmxwajkifQ.131KHjl660lf66ahdYc6tw';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/vesel-out/ck2dgkq3h0bvu1dpceo9a5ucz',
  scrollZoom: false
  //   center: [-118.113491, 34.111745],
  //   zoom: 4,
  //   interactive: false
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(location => {
  // create marker
  const el = document.createElement('div');
  el.className = 'marker';

  // add marker
  const marker = new mapboxgl.Marker({
    element: el,
    anchor: 'bottom' // bottom of the pin will be on the exact location
  })
    .setLngLat(location.coordinates) // expects an array of lng and lat values
    .addTo(map);

  // add popup to marker
  const popup = new mapboxgl.Popup({
    offset: 30
  })
    .setLngLat(location.coordinates)
    .setHTML(`<p>Day ${location.day}: ${location.description}</p>`);
  // .addTo(map);

  // add popup to marker
  marker.setPopup(popup);
  // extend map's bounds to include current location
  bounds.extend(location.coordinates);
});

// padding is needed to fit the locations on the map
map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100
  }
});
