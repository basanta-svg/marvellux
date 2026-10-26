/**
 * Scroll-scrubbed flight + road routes drawn over the Bhutan map.
 * An international line arrives at Paro, then solid domestic lines fan out
 * to Bumthang, Trashigang and Sarpang; road entry points pop in as the
 * international line lands at Paro (first scroll).
 * Positions are derived from the district paths, so nothing is hard-coded.
 */
const SVG_NS = 'http://www.w3.org/2000/svg';
const INK = '#1E1E1E';
const ROAD = '#E5243B';

const svg = document.getElementById('bhutan-svg');
const group = document.getElementById('routes-group');

type Pt = { x: number; y: number };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p: number, from: number, to: number) => clamp((p - from) / (to - from));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const k in attrs) node.setAttribute(k, String(attrs[k]));
  return node;
}

if (svg && group) {
  const district = (name: string) =>
    svg.querySelector<SVGGeometryElement>(`.district[title="${name}"]`);

  const center = (name: string): Pt | null => {
    const p = district(name);
    if (!p) return null;
    const b = p.getBBox();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  };

  /** Southernmost outline point of a district — where the road gate sits. */
  const southEdge = (name: string): Pt | null => {
    const p = district(name);
    if (!p) return null;
    const total = p.getTotalLength();
    let best: Pt = p.getPointAtLength(0);
    for (let i = 1; i <= 600; i++) {
      const pt = p.getPointAtLength((total * i) / 600);
      if (pt.y > best.y) best = { x: pt.x, y: pt.y };
    }
    return best;
  };

  /** Landing spot nudged below the district label so the plane icon never sits on text. */
  const landing = (name: string, dx: number, dy: number): Pt | null => {
    const c = center(name);
    return c && { x: c.x + dx, y: c.y + dy };
  };

  const paro = landing('Paro', 0, 14);
  const airports = [
    { name: 'Bathpalathang', at: landing('Bumthang', 0, 14), bend: 0.22, from: 0.26, to: 0.62 },
    { name: 'Yonphula', at: landing('Trashigang', 0, 14), bend: 0.12, from: 0.3, to: 0.82 },
    { name: 'Gelephu', at: landing('Sarpang', 0, 12), bend: -0.2, from: 0.28, to: 0.66 },
  ];
  const gates = [
    { name: 'Phuentsholing', at: southEdge('Chhukha'), from: 0.18, to: 0.24 },
    { name: 'Gelephu', at: southEdge('Sarpang'), from: 0.21, to: 0.26 },
    { name: 'Indo-Bhutan Gate', at: southEdge('Samdrup Jongkha'), from: 0.23, to: 0.28 },
  ];

  if (paro && airports.every((a) => a.at) && gates.every((g) => g.at)) {
    // --- build -----------------------------------------------------------
    const defs = el('defs');
    group.appendChild(defs);

    const planeGlyph = (s: number, fill: string) => {
      const g = el('g', { transform: `scale(${s}) translate(-12 -12)` });
      g.appendChild(
        el('path', {
          d: 'M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z',
          fill,
        }),
      );
      return g;
    };

    /** Solid route revealed by a mask whose solid stroke is drawn by scroll. */
    const makeRoute = (id: string, d: string) => {
      const mask = el('mask', { id: `route-mask-${id}`, maskUnits: 'userSpaceOnUse', x: -200, y: -200, width: 1200, height: 800 });
      const reveal = el('path', { d, fill: 'none', stroke: '#fff', 'stroke-width': 5, 'stroke-linecap': 'round' });
      mask.appendChild(reveal);
      defs.appendChild(mask);

      const dots = el('path', {
        d,
        fill: 'none',
        stroke: INK,
        'stroke-width': 0.7,
        'stroke-linecap': 'round',
        mask: `url(#route-mask-${id})`,
      });
      group.appendChild(dots);

      const len = reveal.getTotalLength();
      reveal.style.strokeDasharray = String(len);
      reveal.style.strokeDashoffset = String(len);
      return { measure: dots as SVGGeometryElement, reveal, len };
    };

    const node = (at: Pt, name: string) => {
      const g = el('g', { transform: `translate(${at.x} ${at.y})` });
      const inner = el('g');
      inner.style.transformBox = 'fill-box';
      inner.style.transformOrigin = 'center';
      const title = el('title');
      title.textContent = `${name} airport`;
      inner.appendChild(title);
      inner.appendChild(el('circle', { r: 6.2, fill: '#fff', stroke: INK, 'stroke-width': 1.1 }));
      inner.appendChild(planeGlyph(0.3, INK));
      g.appendChild(inner);
      group.appendChild(g);
      return inner;
    };

    // International approach: from off-map (upper left sky) down into Paro.
    const origin: Pt = { x: paro.x - 105, y: paro.y - 105 };
    const arrivalD = `M ${origin.x} ${origin.y} Q ${paro.x - 70} ${paro.y - 25} ${paro.x} ${paro.y}`;
    const arrival = makeRoute('arrival', arrivalD);
    const arrivalTag = el('text', { x: origin.x, y: origin.y - 6, 'text-anchor': 'middle', 'font-size': 7, 'font-weight': 600, fill: '#55534f' });
    arrivalTag.textContent = 'International flights';
    group.appendChild(arrivalTag);

    const branches = airports.map((a, i) => {
      const to = a.at as Pt;
      const dx = to.x - paro.x;
      const dy = to.y - paro.y;
      const dist = Math.hypot(dx, dy);
      const cx = (paro.x + to.x) / 2 + (-dy / dist) * dist * a.bend * -1;
      const cy = (paro.y + to.y) / 2 + (dx / dist) * dist * a.bend * -1;
      const route = makeRoute(`b${i}`, `M ${paro.x} ${paro.y} Q ${cx} ${cy} ${to.x} ${to.y}`);
      const marker = node(to, a.name);
      return { ...a, route, marker };
    });

    const parLabel = node(paro, 'Paro international');
    parLabel.style.opacity = '0';

    // Plane that rides the head of whichever line is drawing.
    const plane = el('g');
    plane.style.opacity = '0';
    plane.appendChild(el('circle', { r: 4.2, fill: '#F9A61A', stroke: INK, 'stroke-width': 0.8 }));
    plane.appendChild(planeGlyph(0.24, INK));
    group.appendChild(plane);

    const pins = gates.map((g) => {
      const at = g.at as Pt;
      const wrap = el('g', { transform: `translate(${at.x} ${at.y})` });
      const inner = el('g');
      inner.style.transformBox = 'fill-box';
      inner.style.transformOrigin = 'center bottom';
      inner.appendChild(el('line', { x1: 0, y1: 0, x2: 0, y2: -9, stroke: ROAD, 'stroke-width': 0.9 }));
      inner.appendChild(el('circle', { cx: 0, cy: -13, r: 5.2, fill: ROAD, stroke: '#fff', 'stroke-width': 1 }));
      // minimal car glyph
      inner.appendChild(el('path', { d: 'M -3 -11.6 v-2 l1.1 -2 h3.8 l1.1 2 v2 z', fill: '#fff' }));
      const t1 = el('text', { y: 8, 'text-anchor': 'middle', 'font-size': 5.2, 'font-weight': 700, fill: INK });
      t1.textContent = g.name.toUpperCase();
      const t2 = el('text', { y: 14, 'text-anchor': 'middle', 'font-size': 4.2, fill: '#55534f' });
      t2.textContent = '(entry/exit) by road';
      inner.appendChild(t1);
      inner.appendChild(t2);
      wrap.appendChild(inner);
      group.appendChild(wrap);
      return { ...g, inner };
    });

    // --- render at progress p -------------------------------------------
    const place = (route: { measure: SVGGeometryElement; len: number }, t: number) => {
      const l = route.len * t;
      const a = route.measure.getPointAtLength(l);
      const b = route.measure.getPointAtLength(Math.min(route.len, l + 0.5));
      const back = route.measure.getPointAtLength(Math.max(0, l - 0.5));
      const ang = (Math.atan2(b.y - back.y, b.x - back.x) * 180) / Math.PI + 90;
      plane.setAttribute('transform', `translate(${a.x} ${a.y}) rotate(${ang})`);
    };

    const pop = (n: SVGElement, t: number) => {
      n.style.opacity = String(t);
      n.style.transform = `scale(${0.4 + 0.6 * ease(t)})`;
    };

    const render = (p: number) => {
      const arr = ease(seg(p, 0, 0.26));
      arrival.reveal.style.strokeDashoffset = String(arrival.len * (1 - arr));
      arrivalTag.style.opacity = String(seg(p, 0, 0.08));
      pop(parLabel, seg(p, 0.2, 0.28));

      let head: { route: { measure: SVGGeometryElement; len: number }; t: number } | null = null;
      if (arr > 0 && arr < 1) head = { route: arrival, t: arr };

      branches.forEach((b) => {
        const t = ease(seg(p, b.from, b.to));
        b.route.reveal.style.strokeDashoffset = String(b.route.len * (1 - t));
        pop(b.marker, seg(t, 0.92, 1));
        if (t > 0 && t < 1) head = { route: b.route, t };
      });

      if (head) {
        const h = head as { route: { measure: SVGGeometryElement; len: number }; t: number };
        place(h.route, h.t);
        plane.style.opacity = '1';
      } else {
        plane.style.opacity = '0';
      }

      pins.forEach((g) => pop(g.inner, seg(p, g.from, g.to)));
    };

    // --- scroll driver ---------------------------------------------------
    // The map pins (sticky) while the user scrolls; each scroll "step" plays one stage.
    const pin = document.getElementById('map-pin');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // progress value reached at the end of each stage
    const STAGES = [0, 0.28, 0.56, 1];

    const stageAt = () => {
      if (!pin) return 3;
      const r = pin.getBoundingClientRect();
      const t = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
      return t > 0.72 ? 3 : t > 0.4 ? 2 : t > 0.08 ? 1 : 0;
    };

    // On phones the map isn't pinned, so show the finished state straight away.
    const mobile = window.matchMedia('(max-width: 767px)').matches;

    if (reduced || mobile || !pin) {
      render(1);
    } else {
      let stage = stageAt();
      let current = STAGES[stage];
      let last = 0;
      let raf = 0;
      const SPEED = 0.5; // progress units per second
      const tick = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000 || 0);
        last = now;
        const goal = STAGES[stage];
        const d = goal - current;
        current = Math.abs(d) <= SPEED * dt ? goal : current + Math.sign(d) * SPEED * dt;
        render(current);
        raf = current === goal ? 0 : requestAnimationFrame(tick);
      };
      const onScroll = () => {
        const next = stageAt();
        if (next === stage) return;
        stage = next;
        if (!raf) {
          last = performance.now();
          raf = requestAnimationFrame(tick);
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      render(current);
    }
  }
}
