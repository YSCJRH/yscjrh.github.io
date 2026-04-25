# Three.js local vendor

Vendored from npm package three@0.184.0 for the /instrument/ static route.

Included files:
- build/three.module.js -> three.module.js
- build/three.core.js -> three.core.js
- examples/jsm/controls/OrbitControls.js -> addons/controls/OrbitControls.js
- examples/jsm/controls/TransformControls.js -> addons/controls/TransformControls.js
- examples/jsm/capabilities/WebGL.js -> addons/capabilities/WebGL.js

Local patch:
- Control add-ons import `../../three.module.js` instead of the bare `three` specifier so the static page does not depend on an import map.

Runtime note:
- The current MVP imports `three.module.js`, `three.core.js`, `OrbitControls.js`, and `WebGL.js`.
- `TransformControls.js` is vendored for the planned restricted-manipulation phase, but is not imported by the current page and does not add runtime transfer unless a later phase loads it.

License: MIT; see LICENSE.
