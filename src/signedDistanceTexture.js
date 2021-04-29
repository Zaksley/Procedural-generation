function sign(n) {
   return n < 0 ? -1 : 1;
}

function clamp(mid, min, max) {
   return mid > min ? mid < max ? mid : max : min;
}

function length(array) {
   return Math.sqrt(array.map((x) => x*x).reduce((acc, e) => acc + e));
}

function length_max(array, n) {
   return length(array.map((x) => x > n ? x : n));
}

function dot(a, b) {
   return a.map((x, i) => x * b[i]).reduce((acc, e) => acc + e);
}

function ndot(a, b) {
   return a.map((x, i) => x * b[i]).reduce((acc, e, i) => acc + e * (-1)**(i%2));
}

function min_max(array, n) {
   return Math.min(array.reduce((acc, e) => e > acc ? e : acc), n);
}

function mix(array1, array2, a) {
   return array1.map((x,i) => x * (1 - a) + array2[i] * a);
}

function smoothstep(edge1, edge2, step) {
   const x = Math.max(0, Math.min(1, (step - edge1) / (edge2 - edge1)));
   return x * x * (3 - 2 * x);
}
//orange: [255, 128, 0, 255]
function color_sdFunc(d, color) {
   let col = [255 * (1 - sign(d) * (1 - color[0] / 255)), 255 * (1 - sign(d) * (1 - color[1] / 255)), 255 * (1 - sign(d) * (1 - color[2] / 255))];
   col = col.map((x) => x * (1 - Math.exp(-3 * Math.abs(d))));
   col = col.map((x) => x * (0.8 + 0.2 * Math.cos(150 * d)));
   col = mix(col, [255, 255, 255], 1 - smoothstep(0, 0.01, Math.abs(d)));
   col[3] = color[3];

   return col;
}

function sdCircle(dict) {
   const r = dict['radius']        || 100;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']   || colors[0] || COLORS.orange;
   const fcolor = (d) => (color_sdFunc(d, color));

   return function(x, y) {
       const p = [x - center_x, y - center_y];
       const d = 2 * (length(p) - r) / WIDTH;

       return fcolor(d);
   };
}

function sdRoundedBox(dict) {
   const r = dict['init']          || [1, 4, 4, 1];
   const size1 = dict['size']      || 0.9 * WIDTH / 4;
   const size2 = dict['size2']     || 2 / 3 * size1;
   const round = dict['radius']    || 1 / 3 * size1;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || COLORS.orange;
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, b, r) {
       [r[0], r[1]] = p[0] > 0 ? [r[0], r[1]] : [r[2], r[3]];
       r[0] = p[1] > 0 ? r[0] : r[1]; 
       const q = p.map((x, i) => Math.abs(x) - b[i] + r[0]);
       
       return min_max(q, 0) + length_max(q, 0) - r[0];
   }

   return function (x, y) {
       const p = [x - center_x, y - center_y];
       const si = [size1, size2];
       const ra = r.map((x) => round * (1 + Math.cos(x)));

       const d = 2 * dist(p, si, ra) / WIDTH;
       
       return fcolor(d);
   };
}

function sdBox(dict) {
   const size1 = dict['size']      || 0.9 * WIDTH / 4;
   const size2 = dict['size2']     || 2 / 3 * size1;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || COLORS.orange;
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, b) {
       const d = p.map((x, i) => Math.abs(x) - b[i]);
       return length_max(d, 0) + min_max(d, 0);
   }

   return function (x, y) {
       const p = [x - center_x, y - center_y];
       const si = [size1, size2];

       const d = 2 * dist(p, si) / WIDTH;
       
       return fcolor(d);
   };
}

function sdOrientedBox(dict) { 
   const angle = dict['angle']     || 30;
   const size1 = dict['size']      || 0.9 * WIDTH / 4;
   const size2 = dict['size2']     || 2 / 3 * size1;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || COLORS.orange;
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, a, b, th) {
       const l = length(b.map((x, i) => x - a[i]));
       const d = b.map((x, i) => (x - a[i]) / l);
       let q = p.map((x, i) => x - (a[i] + b[i]) * 0.5);
       q = [q[0] * d[0] - d[1] * q[1], q[0] * d[1] + q[1] * d[0]];
       q = [l, th].map((x, i) => Math.abs(q[i]) - x * 0.5);
       return length_max(q, 0) + min_max(q, 0);
   }

   return function (x, y) {
       const alpha = angle * Math.PI / 180;
       const p = [x - center_x, y - center_y];
       const v1 = [size1 / 2 * Math.cos(alpha), size1 / 2 * Math.sin(alpha)];
       const v2 = [-size1 / 2 * Math.cos(alpha), -size1 / 2 * Math.sin(alpha)];

       const d = 2 * dist(p, v1, v2, size2) / WIDTH;
       
       return fcolor(d);
   };
}

function sdSegment(dict) { 
   const angle = dict['angle']     || 30;
   const size1 = dict['size']      || 0.9 * WIDTH / 4;
   const th = dict['size2']        || 10;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || COLORS.orange;
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, a, b) {
       const ba = b.map((x, i) => x - a[i]);
       const pa = p.map((x, i) => x - a[i]);
       const h = clamp(dot(pa, ba) / dot(ba, ba), 0, 1);
       return length(pa.map((x, i) => x - h * ba[i]));
   }

   return function (x, y) {
       const alpha = angle * Math.PI / 180;
       const p = [x - center_x, y - center_y];
       const v1 = [size1 / 2 * Math.cos(alpha), size1 / 2 * Math.sin(alpha)];
       const v2 = [-size1 / 2 * Math.cos(alpha), -size1 / 2 * Math.sin(alpha)];

       const d = 2 * (dist(p, v1, v2) - th)/ WIDTH;
       
       return fcolor(d);
   };
}

function sdRhombus(dict) {
   const size1 = dict['size']      || 0.9 * WIDTH / 4;
   const size2 = dict['size2']     || 2 / 3 * size1;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || COLORS.orange;
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, b) {
       const q = p.map((x) => Math.abs(x));
       const h = clamp((-2 * ndot(q, b) + ndot(b, b)) / dot(b, b), -1, 1);
       let d = length(q.map((x, i) => x - 0.5 * b[i] * (1 - (-1)**i * h)));
       d *= sign(q[0] * b[1] + q[1] * b[0] - b[0] * b[1]);

       return d;
   }

   return function (x, y) {
       const alpha = angle * Math.PI / 180;
       const p = [x - center_x, y - center_y];
       const ra = [size1, size2];

       const d = 2 * dist(p, ra) / WIDTH;
       
       return fcolor(d);
   }; 
}