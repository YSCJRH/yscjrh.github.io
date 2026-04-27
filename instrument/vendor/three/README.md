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
- The current `/instrument/` page imports `three.module.js`, `OrbitControls.js`, `TransformControls.js`, and `WebGL.js`.
- `TransformControls.js` is used only for bounded source/sample alignment handles on the local static Instrument Lab page. It is not a site-wide dependency and is not loaded by the rest of the personal website.

License: MIT; see LICENSE.
