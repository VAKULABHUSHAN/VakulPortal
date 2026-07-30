document.querySelectorAll(".link-btn").forEach(link => {
  // Add active state scaling
  link.addEventListener("mousedown", () => {
    link.style.transform = "scale(0.97)";
  });

  link.addEventListener("mouseup", () => {
    link.style.transform = "";
  });

  link.addEventListener("mouseleave", () => {
    link.style.transform = "";
  });

  // Track mouse position for the dynamic glow effect
  link.addEventListener("mousemove", event => {
    const rect = link.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Update CSS custom properties
    link.style.setProperty("--x", `${x}px`);
    link.style.setProperty("--y", `${y}px`);
  });
});
function drawTree() {
  const svg = document.querySelector('.tree-svg');
  const root = document.querySelector('#tree-root');
  const dots = document.querySelectorAll('.node-dot');

  if (!svg || !root || !dots.length) return;

  // Set accurate dimensions
  svg.setAttribute('width', svg.parentElement.offsetWidth);
  svg.setAttribute('height', svg.parentElement.offsetHeight);

  const svgRect = svg.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();

  // Tree starts precisely at the bottom center of the profile photo
  const startX = rootRect.left + rootRect.width / 2 - svgRect.left;
  let startY = rootRect.bottom - svgRect.top;

  let trunkX = startX;
  const isMobile = window.innerWidth <= 768;

  // Mobile layout shifts the trunk left to align alongside nodes
  if (isMobile) {
    const firstDot = dots[0].getBoundingClientRect();
    trunkX = firstDot.left - svgRect.left - 40;
  }

  // Find lowest point to draw the trunk down to
  let lowestY = startY;
  dots.forEach(dot => {
    const rect = dot.getBoundingClientRect();
    const y = rect.top + rect.height / 2 - svgRect.top;
    if (y > lowestY) lowestY = y;
  });
  lowestY += 60; // Extend slightly past last node

  let html = '';

  // Generate Trunk Path
  let trunkD = `M ${startX} ${startY}`;
  if (Math.abs(startX - trunkX) > 5) {
    // Elegant bezier curve connecting center profile to left trunk
    trunkD += ` C ${startX} ${startY + 30}, ${trunkX} ${startY + 20}, ${trunkX} ${startY + 60}`;
    startY += 60;
  }
  trunkD += ` L ${trunkX} ${lowestY}`;

  html += `<path class="tree-path trunk-path" d="${trunkD}" />`;

  // Generate Branches & Leaves
  dots.forEach((dot, index) => {
    const dotRect = dot.getBoundingClientRect();
    const endX = dotRect.left + dotRect.width / 2 - svgRect.left;
    const endY = dotRect.top + dotRect.height / 2 - svgRect.top;

    // Smooth bezier curve for branch
    const branchStartY = endY + 30;
    const cpX = trunkX + (endX - trunkX) * 0.5;

    const branchD = `M ${trunkX} ${branchStartY} C ${trunkX} ${endY}, ${cpX} ${endY}, ${endX} ${endY}`;

    const isMain = dot.closest('.tree-node').classList.contains('resume-node');
    const bClass = isMain ? 'tree-path branch-path main-branch-path' : 'tree-path branch-path';

    html += `<path class="${bClass}" id="branch-${index}" d="${branchD}" />`;

    // Add decorative leaves along the branch lines (engraving aesthetic)
    const dir = endX > trunkX ? 1 : -1;
    const leafX = endX - (35 * dir); // Positioned halfway along branch
    const leafY = endY + 10;
    const angle = dir > 0 ? 30 : -30;

    html += `<g style="transform: translate(${leafX}px, ${leafY}px) rotate(${angle}deg);">
               <g class="leaf-swayer" style="animation-delay: ${index * 0.4}s">
                 <path class="leaf" d="M 0 0 C 4 -6 10 -4 14 0 C 10 4 4 6 0 0 Z" style="animation-delay: ${1.5 + index * 0.15}s" />
               </g>
             </g>`;

    // Add secondary leaves to alternate branches for richness
    if (index % 2 === 0) {
      const trunkLeafY = branchStartY - 15;
      html += `<g style="transform: translate(${trunkX}px, ${trunkLeafY}px) rotate(${dir > 0 ? -150 : 150}deg);">
                 <g class="leaf-swayer" style="animation-delay: ${index * 0.3}s">
                   <path class="leaf" d="M 0 0 C 3 -5 8 -3 11 0 C 8 3 3 5 0 0 Z" style="animation-delay: ${1.3 + index * 0.1}s" />
                 </g>
               </g>`;
    }
  });

  svg.innerHTML = html;

  // Animation Execution Setup
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const paths = svg.querySelectorAll('.tree-path');
  paths.forEach((path, i) => {
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;

    if (prefersReduced) {
      path.style.strokeDashoffset = 0;
    } else {
      path.style.strokeDashoffset = len;
      if (path.classList.contains('trunk-path')) {
        path.style.animation = `drawPath 1.5s cubic-bezier(0.4, 0, 0.2, 1) 0.5s forwards`;
      } else {
        const delay = 1.0 + (i * 0.15);
        path.style.animation = `drawPath 1s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s forwards`;
      }
    }
  });

  // Fade up HTML nodes synced with their respective branches
  dots.forEach((dot, i) => {
    const node = dot.closest('.tree-node');
    if (!prefersReduced) {
      const delay = 1.5 + (i * 0.15);
      node.style.animation = `nodeFadeUp 0.6s ease-out ${delay}s forwards`;
    }
  });

  // Attach precise branch hover state logic
  if (!window._eventsAttached) {
    dots.forEach((dot, i) => {
      const node = dot.closest('.tree-node');
      node.addEventListener('mouseenter', () => {
        const path = document.getElementById(`branch-${i}`);
        if (path) {
          path.style.opacity = '1';
          path.style.strokeWidth = path.classList.contains('main-branch-path') ? '2' : '1.2';
        }
      });
      node.addEventListener('mouseleave', () => {
        const path = document.getElementById(`branch-${i}`);
        if (path) {
          path.style.opacity = '';
          path.style.strokeWidth = '';
        }
      });
    });
    window._eventsAttached = true;
  }
}

// Ensure resize events redraw the paths to maintain responsiveness
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(drawTree, 150);
});

// Soft scroll parallax on the entire tree-wrapper to give it a botanical drifting feel
window.addEventListener('scroll', () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth <= 768) return; // Disable on mobile as requested

  const scrolled = window.scrollY;
  const wrapper = document.querySelector('.tree-wrapper');
  if (wrapper) {
    wrapper.style.transform = `translateY(${scrolled * 0.1}px)`;
  }
});
