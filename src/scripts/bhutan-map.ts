/**
 * Interactive dzongkhag map: click a district to see its description.
 * Path titles in the SVG must match the names below exactly.
 */
import { DISTRICTS } from '../data/districts';

const svg = document.getElementById('bhutan-svg');
const tooltip = document.getElementById('map-tooltip');
const tooltipName = document.getElementById('map-tooltip-name');
const tooltipDesc = document.getElementById('map-tooltip-desc');
const SVG_NS = 'http://www.w3.org/2000/svg';

if (svg && tooltip && tooltipName && tooltipDesc) {
  const byName = new Map(DISTRICTS.map((d) => [d.name, d]));
  const pairs = Array.from(svg.querySelectorAll<SVGGraphicsElement>('.district'))
    .map((path) => [path, byName.get(path.getAttribute('title') ?? '')] as const)
    .filter((p): p is [SVGGraphicsElement, (typeof DISTRICTS)[number]] => !!p[1]);

  // District name labels
  const labels = document.getElementById('labels-group');
  if (labels) {
    pairs.forEach(([path, d]) => {
      const bb = path.getBBox();
      const cx = bb.x + bb.width / 2;
      const cy = bb.y + bb.height / 2;
      const words = d.name.split(' ');
      const txt = document.createElementNS(SVG_NS, 'text');
      txt.setAttribute('class', 'district-label');
      txt.setAttribute('x', String(cx));
      txt.setAttribute('y', String(cy));
      if (words.length === 1) {
        txt.textContent = d.name;
      } else {
        const lineHeight = 8;
        const startY = cy - ((words.length - 1) * lineHeight) / 2;
        words.forEach((w, i) => {
          const ts = document.createElementNS(SVG_NS, 'tspan');
          ts.setAttribute('x', String(cx));
          ts.setAttribute('y', String(startY + i * lineHeight));
          ts.textContent = w;
          txt.appendChild(ts);
        });
      }
      labels.appendChild(txt);
    });
  }

  const positionTooltip = (cx: number, cy: number) => {
    const tw = tooltip.offsetWidth || 240;
    const th = tooltip.offsetHeight || 80;
    const offset = 18;
    const left = Math.max(tw / 2 + 8, Math.min(cx, window.innerWidth - tw / 2 - 8));
    let top = cy - th - offset;
    if (top < 8) top = cy + offset;
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  };

  const closeTooltip = () => {
    svg.querySelectorAll('.district.active').forEach((el) => el.classList.remove('active'));
    tooltip.classList.remove('visible');
  };

  pairs.forEach(([path, d]) => {
    path.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasActive = path.classList.contains('active');
      closeTooltip();
      if (wasActive) return;
      path.classList.add('active');
      tooltipName.textContent = d.name;
      tooltipDesc.textContent = d.desc;
      positionTooltip(e.clientX, e.clientY);
      tooltip.classList.add('visible');
    });
  });
  document.addEventListener('click', closeTooltip);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeTooltip();
  });
  window.addEventListener('scroll', closeTooltip, { passive: true });
}
