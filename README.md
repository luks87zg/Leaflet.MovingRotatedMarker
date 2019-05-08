# Leaflet.MovingRotatedMarker

This plugin is combination of two plugins <a href="https://github.com/bbecquet/Leaflet.RotatedMarker" target="_blank">Leaflet.RotatedMarker</a>
and <a href="https://gitlab.com/IvanSanchez/Leaflet.Marker.SlideTo" target="_blank">Leaflet.Marker.SlideTo</a>

Enables movement and rotation of marker icons in Leaflet. <a href="http://luks87zg.github.io/Leaflet.MovingRotatedMarker/example" target="_blank">Demo</a>

Compatible with versions 0.7.* and 1.* of Leaflet. Doesn't work on IE < 9.

Usage
-----

```js
var m= L.marker([48.8631169, 2.3708919], {
    rotationAngle: 45 // default rotation
}).addTo(map);

// move marker to new position and set rotation
m.slideTo([48.864433, 2.371324], {
    duration: 3000,
    rotationAngle: 65
});

// or just set rotation with method
m.setRotationAngle(65);
```
