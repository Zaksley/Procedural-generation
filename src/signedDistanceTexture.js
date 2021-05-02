function abs(a) {
   if (Array.isArray(a))
      return a.map((x) => Math.abs(x));
   else
      return Math.abs(a);
}

function min(v1, v2) {
   if (!Array.isArray(v1))
      return v1 > v2 ? v2 : v1;
   if (!Array.isArray(v2))
      return v1.map((x) => x > v2    ? v2    : x);
   return v1.map((x, i) => x > v2[i] ? v2[i] : x);
}

function max(v1, v2) {
   if (!Array.isArray(v1))
      return v1 > v2 ? v2 : v1;
   if (!Array.isArray(v2))
      return v1.map((x) => x < v2    ? v2    : x);
   return v1.map((x, i) => x < v2[i] ? v2[i] : x);
}

function all(v) {
   return v.reduce((acc, e) => acc && e);
}

function not(v) {
   return v.map((x) => !x);
}

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

function optwovec(v1, v2, op) {
   if (!Array.isArray(v2))
      v2 = v1.map(() => v2);
   switch(op) {
      case '+': return v1.map((x, i) => x + v2[i]);
      case '-': return v1.map((x, i) => x - v2[i]);
      case '*': return v1.map((x, i) => x * v2[i]);
      case '/': return v1.map((x, i) => x / v2[i]);
   }
}

function opvec(v, ...args) {
   const l = args.length;
   if (l % 2 === 1)
      throw new Error("odd args number (opvec)");
   for(let i = 0; i < l; i+=2) {
      v = optwovec(v, args[i+1], args[i]);
   }
   return v;
}

function dot(a, b) {
   return optwovec(a,b,'*').reduce((acc, e) => acc + e);
}

function dot2(a) {
   return dot(a, a);
}

function ndot(a, b) {
   return optwovec(a,b,'*').reduce((acc, e, i) => acc + e * (-1)**(i%2));
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

function color_sdFunc(d, color) {
   let col = [255 * (1 - sign(d) * (1 - color[0] / 255)), 255 * (1 - sign(d) * (1 - color[1] / 255)), 255 * (1 - sign(d) * (1 - color[2] / 255))];
   col = col.map((x) => x * (1 - Math.exp(-3 * abs(d))));
   col = col.map((x) => x * (0.8 + 0.2 * Math.cos(150 * d)));
   col = mix(col, [255, 255, 255], 1 - smoothstep(0, 0.01, abs(d)));
   col[3] = color[3];

   return col;
}

function sdCircle(dict) {
   const r = dict['radius']        || 100;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']   || colors[0] || [255*0.9,255*0.6,255*0.3,255];
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
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, b, r) {
      [r[0], r[1]] = p[0] > 0 ? [r[0], r[1]] : [r[2], r[3]];
      r[0] = p[1] > 0 ? r[0] : r[1]; 
      const q = opvec(abs(p), '-', b, '+', r[0]);
       
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
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, b) {
      const d = opvec(abs(p), '-', b);
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
   const angle = dict['angle']     || -30;
   const size1 = dict['size']      || 0.9 * WIDTH / 2;
   const size2 = dict['size2']     || 1 / 3 * size1;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, a, b, th) {
      const l = length(opvec(b, '-', a));
      const d = opvec(b, '-', a, '/', l);
      let q = opvec(p, '-', opvec(a, '+', b, '*', 0.5));
      q = [q[0] * d[0] - d[1] * q[1], q[0] * d[1] + q[1] * d[0]];
      q = opvec([l, th], '*', -0.5, '+' ,abs(q));
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
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, a, b) {
      const ba = opvec(b, '-', a);
      const pa = opvec(p, '-', a);
      const h = clamp(dot(pa, ba) / dot(ba, ba), 0, 1);
      return length(opvec(ba, '*', -h, '+', pa));
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
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, b) {
      const q = abs(p);
      const h = clamp((-2 * ndot(q, b) + ndot(b, b)) / dot2(b), -1, 1);
      let d = length(opvec(b, '*', [1 - h, 1 + h], '*', -0.5, '+', q));

      return d * sign(q[0] * b[1] + q[1] * b[0] - b[0] * b[1]);
   }

   return function (x, y) {
      const p = [x - center_x, y - center_y];
      const ra = [size1, size2];

      const d = 2 * dist(p, ra) / WIDTH;
       
      return fcolor(d);
   }; 
}

function sdIsoscelesTrapezoid(dict) {
   const size1 = dict['size']      || 0.9 * WIDTH / 4;
   const size2 = dict['size2']     || size1 / 2;
   const height = dict['size3']    || 1.5 * size1;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, r1, r2, he) {
      const k1 = [r2, he];
      const k2 = [r2 - r1, 2 * he];
      p[0] = abs(p[0]);
      const ca = [Math.max(0, p[0] - ((p[1] < 0) ? r1 : r2)), abs(p[1]) - he];
      const cb = opvec(k2, '*', clamp(dot(optwovec(k1, p, '-'), k2) / dot2(k2), 0, 1), '+', p, '-', k1);
      const s = (cb[0] < 0 && ca[1] < 0) ? -1 : 1;

      return s * Math.sqrt(Math.min(dot2(ca), dot2(cb)));
   }

   return function (x, y) {
      const p = [x - center_x, y - center_y];
      
      const d = 2 * dist(p, size2, size1, height) / WIDTH;
       
      return fcolor(d);
   }; 
}

function sdParallelogram(dict) {
   const size1 = dict['size']      || 0.9 * WIDTH / 4;
   const size2 = dict['size2']     || size1 / 2;
   const sk = dict['size3']        || -50;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, wi, he, sk) {
      const e = [sk, he];
      p = p[1] < 0 ? p.map((x) => -x) : p;
      const w = opvec(p, '-', e); 
      w[0] -= clamp(w[0], -wi, wi);
      let d = [dot2(w), -w[1]];
      const s = p[0] * e[1] - p[1] * e[0];
      p = s < 0 ? p.map((x) => -x) : p;
      let v = optwovec(p, [wi, 0], '-');
      v = opvec(e, '*', -clamp(dot(v, e) / dot2(e), -1, 1), '+', v);
      d = min(d, [dot2(v), wi * he - abs(s)]);
      return Math.sqrt(d[0]) * sign(-d[1]);
   }

   return function (x, y) {
      const p = [x - center_x, y - center_y];
      
      const d = 2 * dist(p, size2, size1, sk) / WIDTH;
       
      return fcolor(d);
   }; 
}

function sdEquilateralTriangle(dict) {
   const size = dict['size']       || 0.9 * WIDTH / 4;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p) {
      const k = Math.sqrt(3);
      p[0] = abs(p[0]) - size;
      p[1] = p[1] + size / k;
      if (p[0] + k * p[1] > 0) p = [(p[0] - k * p[1]) / 2, (-k * p[0] - p[1]) / 2];
      p[0] -= clamp(p[0], -2 * size , 0);
      return -length(p) * sign(p[1]);
   }

   return function (x, y) {
      const p = [x - center_x, center_y - y];
      
      const d = 2 * dist(p) / WIDTH;
       
      return fcolor(d);
   };
}

function sdIsoscelesTriangle(dict) {
   const size1 = dict['size']      || 0.9 * WIDTH / 2;
   const size2 = dict['size2']     || size1 / 4;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, q) {
      p[0] = abs(p[0]);
      const a = opvec(q, '*', -clamp(dot(p, q) / dot2(q), 0, 1), '+', p);
      const b = opvec(q, '*', [-clamp(p[0] / q[0], 0, 1), -1], '+', p);
      const k = sign(q[1]);
      const d = min(dot2(a), dot2(b));
      const s = Math.max(k * (p[0] * q[1] - p[1] * q[0]), k * (p[1] - q[1]));

      return Math.sqrt(d) * sign(s);
   }

   return function (x, y) {
      const p = [x - center_x, y - center_y + size1 / 2];
      const q = [size2, size1];
      
      const d = 2 * dist(p, q) / WIDTH;
       
      return fcolor(d);
   };
}

function sdTriangle(dict) {
   const points = dict['points']   || [[WIDTH / 4, HEIGHT / 5], [WIDTH / 5, 3 * HEIGHT / 5], [4 * WIDTH / 5, 7 * HEIGHT / 8]];
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));
   const p0 = points[0];
   const p1 = points[1];
   const p2 = points[2];

   function dist(p, p0, p1, p2) {
      const e0 = optwovec(p1, p0, '-'), e1 = optwovec(p2, p1, '-'), e2 = optwovec(p0, p2, '-');
      const v0 = optwovec(p, p0, '-'), v1 = optwovec(p, p1, '-'), v2 = optwovec(p, p2, '-');
      const pq0 = opvec(e0, '*', -clamp(dot(v0, e0) / dot2(e0), 0, 1), '+', v0);
      const pq1 = opvec(e1, '*', -clamp(dot(v1, e1) / dot2(e1), 0, 1), '+', v1);
      const pq2 = opvec(e2, '*', -clamp(dot(v2, e2) / dot2(e2), 0, 1), '+', v2);
      const s = sign(e0[0] * e2[1] - e0[1] * e2[0]);
      const d = min(min([dot2(pq0), s * (v0[0] * e0[1] - v0[1] * e0[0])],
                        [dot2(pq1), s * (v1[0] * e1[1] - v1[1] * e1[0])]),
                        [dot2(pq2), s * (v2[0] * e2[1] - v2[1] * e2[0])]);

      return -Math.sqrt(d[0]) * sign(d[1]);
   }

   return function (x, y) {
      const p = [x, y];
      
      const d = 2 * dist(p, p0, p1, p2) / WIDTH;
       
      return fcolor(d);
   };
}

function sdUnevenCapsule(dict) {
   const r1 = dict['size']         || WIDTH / 9;
   const r2 = dict['size2']        || r1 / 2.5;
   const height = dict['size3']    || 3 * r1;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, r1, r2, h) {
      p[0] = abs(p[0]);
      const b = (r1 - r2) / h;
      const a = Math.sqrt(1 - b * b);
      const k = dot(p, [-b, a]);
      if (k < 0) return length(p) - r1;
      if (k > a * h) return length(optwovec(p, [0, h], '-')) - r2;
      return dot(p, [a, b]) - r1;
   }

   return function (x, y) {
      const p = [x - center_x, center_y - y + height / 2];
      
      const d = 2 * dist(p, r1, r2, height) / WIDTH;
       
      return fcolor(d);
   };
}

function sdRegularPentagon(dict) {
   const r = dict['size']          || WIDTH / 5;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, r) {
      const k = [0.809016994, 0.587785252, 0.726542528];
      p[0] = abs(p[0]);
      p = opvec([-k[0], k[1]], '*', -2 * min(dot([-k[0], k[1]], p), 0), '+', p);
      p = opvec([ k[0], k[1]], '*', -2 * min(dot([ k[0], k[1]], p), 0), '+', p);
      p = optwovec(p, [clamp(p[0], -r * k[2], r * k[2]), r], '-');

      return length(p) * sign(p[1]);
   }

   return function (x, y) {
      const p = [x - center_x, y - center_y];
      
      const d = 2 * dist(p, r) / WIDTH;
       
      return fcolor(d);
   };
}

function sdRegularHexagon(dict) {
   const r = dict['size']          || WIDTH / 5;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, r) {
      const k = [-0.866025404, 0.5, 0.577350269];
      p = abs(p);
      p = opvec([k[0], k[1]], '*', -2 * min(dot([k[0], k[1]], p), 0), '+', p);
      p = optwovec(p, [clamp(p[0], -k[2] * r, k[2] * r), r], '-');

      return length(p) * sign(p[1]);
   }

   return function (x, y) {
      const p = [x - center_x, y - center_y];
      
      const d = 2 * dist(p, r) / WIDTH;
       
      return fcolor(d);
   };
}

function sdRegularOctogon(dict) {
   const r = dict['size']          || WIDTH / 5;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, r) {
      const k = [-0.9238795325, 0.3826834323, 0.4142135623];
      p = abs(p);
      p = opvec([ k[0], k[1]], '*', -2 * min(dot([ k[0], k[1]], p), 0), '+', p);
      p = opvec([-k[0], k[1]], '*', -2 * min(dot([-k[0], k[1]], p), 0), '+', p);
      p = optwovec(p, [clamp(p[0], -k[2] * r, k[2] * r), r], '-');

      return length(p) * sign(p[1]);
   }

   return function (x, y) {
      const p = [x - center_x, y - center_y];
      
      const d = 2 * dist(p, r) / WIDTH;
       
      return fcolor(d);
   };
}

function sdHexagram(dict) {
   const r = dict['size']          || WIDTH / 5;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, r) {
      const k = [-0.5, 0.8660254038, 0.5773502692, 1.7320508076];
      p = abs(p);
      p = opvec([k[0], k[1]], '*', -2 * min(dot([k[0], k[1]], p), 0), '+', p);
      p = opvec([k[1], k[0]], '*', -2 * min(dot([k[1], k[0]], p), 0), '+', p);
      p = optwovec(p, [clamp(p[0], k[2] * r, k[3] * r), r], '-');

      return length(p) * sign(p[1]);
   }

   return function (x, y) {
      const p = [x - center_x, y - center_y];
      
      const d = 2 * dist(p, r) / WIDTH;
       
      return fcolor(d);
   };
}

function sdStar5(dict) {
   const r = dict['size']          || WIDTH / 5;
   const rf = dict['size2'] / r    || 1.7;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, r, rf) {
      const k1 = [0.809016994375, -0.587785252292];
      const k2 = [-k1[0], k1[1]];
      p[0] = abs(p[0]);
      p = opvec(k1, '*', -2 * Math.max(dot(k1, p), 0), '+', p);
      p = opvec(k2, '*', -2 * Math.max(dot(k2, p), 0), '+', p);
      p[0] = abs(p[0]);
      p[1] -= r;
      const ba = [rf * -k1[1], rf * k1[0] - 1];
      const h = clamp(dot(p, ba) / dot2(ba), 0, r);
      return length(opvec(ba, '*', -h, '+', p)) * sign(p[1] * ba[0] - p[0] * ba[1]);
   }

   return function (x, y) {
      const p = [x - center_x, y - center_y];
      
      const d = 2 * dist(p, r, rf) / WIDTH;
       
      return fcolor(d);
   };
}

function sdRegularStar(dict) {
   const r = dict['size']          || WIDTH / 5;
   const n = dict['branches']      || 7;
   const m = dict['init']          || 4;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   const an = 3.141593 / n;
   const en = 3.141593 / m;
   const acs = [Math.cos(an), Math.sin(an)];
   const ecs = [Math.cos(en), Math.sin(en)];

   function dist(p, r, n, m) {
      const bn = abs(Math.atan2(p[0], p[1])) % (2 * an) - an;
      p = [length(p) * Math.cos(bn), length(p) * abs(Math.sin(bn))];

      p = opvec(acs, '*', -r, '+', p);
      p = opvec(ecs, '*', clamp(-dot(p, ecs), 0, r * acs[1] / ecs[1]), '+', p);

      return length(p) * sign(p[0]);
   }

   return function (x, y) {
      const p = [x - center_x, center_y - y];
      
      const d = 2 * dist(p, r, n, m) / WIDTH;
       
      return fcolor(d);
   };
}

function sdPie(dict) {
   const r = dict['size']          || WIDTH / 5;
   const percent = dict['percent'] || 1 / 3;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   const c = [Math.sin(3.14 * percent), Math.cos(3.14 * percent)];

   function dist(p, c, r) {
      p[0] = abs(p[0]);
      const l = length(p) - r;
      const m = length(opvec(c, '*', -clamp(dot(p, c), 0, r), '+', p));
      return Math.max(l, m * sign(c[1] * p[0] - c[0] * p[1]));
   }

   return function (x, y) {
      const p = [x - center_x, y - center_y];
      
      const d = 2 * dist(p, c, r) / WIDTH;
       
      return fcolor(d);
   };
}

function sdArc(dict) {
   const ra = dict['size']         || WIDTH / 5;
   const rb = dict['size2']        || ra / 4;
   const ana = dict['angle']*3.14/180  || 30 * 3.14 / 180;
   const anb = dict['angle2']*3.14/360 || 250 * 3.14 / 360;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   const sca = [Math.sin(ana), Math.cos(ana)];
   const scb = [Math.sin(anb), Math.cos(anb)];

   function dist(p, sca, scb, ra, rb) {
      p = [p[0] * sca[0] - p[1] * sca[1], p[0] * sca[1] + p[1] * sca[0]];
      p[0] = abs(p[0]);
      const k = (scb[1] * p[0] > scb[0] * p[1]) ? dot(p, scb) : length(p);
      return Math.sqrt(dot(p, p) + ra * ra - 2 * ra * k) - rb;
   }

   return function (x, y) {
      const p = [x - center_x, y - center_y];
      
      const d = 2 * dist(p, sca, scb, ra, rb) / WIDTH;
       
      return fcolor(d);
   };
}

function sdHorseshoe(dict) {
   const r = dict['size']          || WIDTH / 5;
   const th = dict['size2']        || WIDTH / 5;
   const size = dict['size3']      || WIDTH / 10;
   const percent = dict['percent'] || 0.3;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   const c = [Math.sin(3.14 * percent / 2), Math.cos(3.14 * percent / 2)];
   const w = [size, 0.25 * th];

   function dist(p, c, r, w) {
      p[0] = abs(p[0]);
      const l = length(p);
      p = [p[0] * -c[0] + p[1] * c[1], p[0] * c[1] + p[1] * c[0]];
      p = [(p[1] > 0) ? p[0] : l * sign(-c[0]), (p[0] > 0) ? p[1] : l];
      p = optwovec([p[0], abs(p[1] - r)], w, '-');

      return length_max(p, 0) + min_max(p, 0);
   }

   return function (x, y) {
      const p = [x - center_x, center_y - y];
      
      const d = 2 * dist(p, c, r, w) / WIDTH;
       
      return fcolor(d);
   };
}

function sdVesica(dict) {
   const r1 = dict['size']         || WIDTH / 5;
   const r2 = dict['size2']        || -r1 / 2;
   const r3 = dict['size3']        || 0;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, r, d) {
      p = abs(p);
      const b = Math.sqrt(r * r - d * d);

      return ((p[1] - b) * d > p[0] * b) ? length(optwovec(p, [0, b], '-')) * sign(d) : length(optwovec(p, [-d, 0], '-')) - r;
   }

   return function (x, y) {
      const p = [x - center_x, y - center_y];
      
      const d = 2 * (dist(p, r1 + r3, r2) + r3) / WIDTH;
       
      return fcolor(d);
   };
}

function sdMoon(dict) {
   const ra = dict['size']         || WIDTH / 4;
   const rb = dict['size2']        || ra * 7 / 8;
   const di = dict['size3']        || WIDTH / 8;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, d, ra, rb) {
      p[1] = abs(p[1]);
      const a = (ra * ra - rb * rb + d * d) / (2 * d);
      const b = Math.sqrt(Math.max(ra * ra - a * a, 0));
      if (d * (p[0] * b - p[1] * a) > d * d * Math.max(b - p[1], 0))
         return length(optwovec(p, [a, b], '-'));
      return Math.max(length(p) - ra, -(length(optwovec(p, [d, 0], '-')) - rb));
   }

   return function (x, y) {
      const p = [x - center_x, y - center_y];
      
      const d = 2 * dist(p, di, ra, rb) / WIDTH;
       
      return fcolor(d);
   };
}

// ... NEED TO BE FIXED ...
function sdCircleCross(dict) {
   const height = dict['size']     || WIDTH / 5;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, h) {
      const k = 0.5 * (h + 1 / h);
      p = abs(p);
      if (p[0] < 1 && p[1] < p[0] * (k - h) + h)
         return k - Math.sqrt(dot2(optwovec(p, [1, k], '-')));
      return Math.sqrt(min(dot2(optwovec(p, [0, h], '-')), dot2(optwovec(p, [1, 0], '-'))))
   }

   return function (x, y) {
      const p = [x - center_x, y - center_y];
      
      const d = 2  *  dist(p, height) / WIDTH;
       
      return fcolor(d);
   };
}

function sdSimpleEgg(dict) {
   const ra = dict['size']         || WIDTH / 4;
   const rb = dict['size2']        || 0;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, ra, rb) {
      const k = Math.sqrt(3);
      p[0] = abs(p[0]);
      const r = ra - rb;
      return ((p[1] < 0)             ? length(p) - r :
             (k * (p[0] + r) < p[1]) ? length([p[0], p[1] - k * r]) :
                                       length([p[0] + r, p[1]]) - 2 * r) - rb;
   }

   return function (x, y) {
      const p = [x - center_x, center_y - y + ra / 2];
      
      const d = 2 * dist(p, ra, rb) / WIDTH;
       
      return fcolor(d);
   };
}

function sdHeart(dict) {
   const size = dict['size']       || WIDTH / 2;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, s) {
      p[0] = abs(p[0]);
      if (p[1] + p[0] > s)
         return Math.sqrt(dot2([p[0] - 0.25 * s, p[1] - 0.75 * s])) - s * Math.sqrt(2) / 4;
      return Math.sqrt(min(dot2([p[0], p[1] - s]), dot2([p[0] - 0.5 * Math.max(p[0] + p[1], 0), p[1] - 0.5 * Math.max(p[0] + p[1], 0)]))) * sign(p[0] - p[1]);
   }

   return function (x, y) {
      const p = [x - center_x, center_y - y + size / 2];
      
      const d = 2 * dist(p, size) / WIDTH;
       
      return fcolor(d);
   };
}

// ... NEED TO BE FIXED ...
function sdCross(dict) {
   const size = dict['size']       || WIDTH / 2;
   const r = dict['radius']        || size / 2; 
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   const b = [0.5*size, 2*size];

   function dist(p, b, r) {
      p = abs(p);
      p = (p[1] > p[0]) ? [p[1], p[0]] : p;
      const q = optwovec(p, b, '-');
      const k = Math.max(q[1], q[0]);
      const w = (k > 0) ? q : [b[1] - p[0], -k];

      return sign(k) * length_max(w, 0) + r;
   }

   return function (x, y) {
      const p = [x - center_x, y - center_y];
      
      const d = 2 * dist(p, b, r) / WIDTH;
       
      return fcolor(d);
   };
}

function sdRoundedX(dict) {
   const size = dict['size']       || WIDTH / 3;
   const r = dict['radius']        || size / 4; 
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, w, r) {
      p = abs(p);
      return length(optwovec(p, min(p[0] + p[1], w) * 0.5, '-')) -r;
   }

   return function (x, y) {
      const p = [x - center_x, y - center_y];
      
      const d = 2 * dist(p, size, r) / WIDTH;
       
      return fcolor(d);
   };
}

function sdPolygon(dict) {
   const nbp = dict['branches']    || getRandomInt(7) + 3;
   const polygon = dict['points']  || randomPolygon(nbp);
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(p, v) {
      const N = v.length;
      let d = dot2(optwovec(p, v[0], '-'));
      let s = 1;
      for(let i = 0, j = N - 1; i < N; j = i, i++) {
         const e = optwovec(v[j], v[i], '-');
         const w = optwovec(p,    v[i], '-');
         const b = opvec(e, '*', -clamp(dot(w, e) / dot2(e), 0, 1), '+', w);
         d = min(d, dot2(b));
         const c = [p[1] >= v[i][1], p[1] < v[j][1], e[0] * w[1] > e[1] * w[0]];
         if(all(c) || all(not(c)))
            s *= -1;
      }
      return s * Math.sqrt(d);
   }

   return function (x, y) {
      const p = [x, y];
      
      const d = 2 * dist(p, polygon) / WIDTH;
       
      return fcolor(d);
   };
}

function sdEllipse(dict) {
   const ra = dict['radius']       || WIDTH / 4; 
   const rb = dict['radius']       || ra / 1.5; 
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   const ab = [ra, rb];

   function dist(p, ab) {
      p = abs(p);
      if (p[0] > p[1]) {
         p  = [ p[1],  p[0]];
         ab = [ab[1], ab[0]];
      }
      const l = ab[1] * ab[1] - ab[0] * ab[0];
      const m = ab[0] * p[0] / l;  const m2 = m * m;
      const n = ab[1] * p[1] / l;  const n2 = n * n;
      const c = (m2 + n2 - 1) / 3; const c3 = c * c * c;
      const q = c3 + m2 * n2 * 2;
      const d = c3 + m2 * n2;
      const g = m + m * n2;
      let co;
      if (d < 0) 
      {
         const h = Math.acos(q / c3) / 3;
         const s = Math.cos(h);
         const t = Math.sin(h) * Math.sqrt(3);
         const rx = Math.sqrt(-c * (s + t + 2) + m2);
         const ry = Math.sqrt(-c * (s - t + 2) + m2);
         co = (ry + sign(l) * rx + abs(g) / (rx * ry) - m) / 2;
      } 
      else
      {
         const h = 2 * m * n * Math.sqrt(d);
         const s = sign(q + h) * (abs(q + h) ** (1 / 3));
         const u = sign(q - h) * (abs(q - h) ** (1 / 3));
         const rx = -s - u - c * 4 + 2 * m2;
         const ry = (s - u) * Math.sqrt(3);
         const rm = Math.sqrt(rx * rx + ry * ry);
         co = (ry / Math.sqrt(rm - rx) + 2 * g / rm - m) / 2;
      }
      const r = [ab[0] * co, ab[1] * Math.sqrt(1 - co * co)];

      return length(optwovec(r, p, '-')) * sign(p[1] - r[1]);
   }

   return function (x, y) {
      const p = [x - center_x, y - center_y];
      
      const d = 2 * dist(p, ab) / WIDTH;
       
      return fcolor(d);
   };
}

function sdParabola(dict) {
   const pk = dict['size']         || WIDTH / 4;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(pos, k) {
      pos[0] = abs(pos[0]);
      const ik = 1 / k;
      const p = ik * (pos[1] - 0.5 * ik) / 3;
      const q = 0.25 * ik * ik * pos[0];
      const h = q * q - p * p * p;
      const r = Math.sqrt(abs(h));
      const x = (h > 0) ? 
         ((q + r) ** (1 / 3)) - (abs(q - r) ** (1 / 3)) * sign(r - q) :
         2 * Math.cos(Math.atan2(r, q) / 3) * Math.sqrt(p);

      return length(optwovec(pos, [x, k * x * x], '-')) * sign(pos[0] - x);
   }

   return function (x, y) {
      const p = [x - center_x, center_y - y];
      
      const d = 2 * dist(p, 1 / pk) / WIDTH;
       
      return fcolor(d);
   };
}

function sdParabolaSegment(dict) {
   const width = dict['size']      || WIDTH / 4;
   const height = dict['size2']    || HEIGHT / 4;
   const center = dict['center']   || [];
   const center_x = center[0]      || WIDTH / 2;
   const center_y = center[1]      || HEIGHT / 2;
   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || [255*0.9,255*0.6,255*0.3,255];
   const fcolor = (d) => (color_sdFunc(d, color));

   function dist(pos, wi, he) {
      pos[0] = abs(pos[0]);
      const ik = wi * wi / he;
      const p = ik * (he - pos[1] - 0.5 * ik) / 3;
      const q = 0.25 * ik * ik * pos[0];
      const h = q * q - p * p * p;
      const r = Math.sqrt(abs(h));
      let x = (h > 0) ? 
         ((q + r) ** (1 / 3)) - (abs(q - r) ** (1 / 3)) * sign(r - q) :
         2 * Math.cos(Math.atan2(r, q) / 3) * Math.sqrt(p);
      x = min(x, wi);
      return length(optwovec(pos, [x, he - x * x / ik], '-')) * sign(ik * (pos[1] - he) + pos[0] * pos[0]);
   }

   return function (x, y) {
      const p = [x - center_x, center_y - y];
      
      const d = 2 * dist(p, width, height) / WIDTH;
       
      return fcolor(d);
   };
}