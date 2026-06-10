// Original inline-SVG illustrations per developmental domain (interim, designer-free).
// Calm line style, decorative only (wrapper carries aria-hidden). No copyrighted assets.
// Color comes from CSS `currentColor`, so they follow the theme.

const SVG_OPEN = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';

const DOMAIN_ILLUS = {
  // Social & emotional: two friendly faces + a small heart.
  social: SVG_OPEN +
    '<circle cx="24" cy="29" r="12"/>' +
    '<circle cx="45" cy="34" r="9"/>' +
    '<circle cx="20" cy="28" r="1.4" fill="currentColor" stroke="none"/>' +
    '<circle cx="28" cy="28" r="1.4" fill="currentColor" stroke="none"/>' +
    '<path d="M20 33q4 3.5 8 0"/>' +
    '<circle cx="42" cy="33" r="1.2" fill="currentColor" stroke="none"/>' +
    '<circle cx="48" cy="33" r="1.2" fill="currentColor" stroke="none"/>' +
    '<path d="M42 37q3 2.5 6 0"/>' +
    '<path d="M47 19c-3-2.2-5.5-4.4-5.5-6.7a2.8 2.8 0 0 1 5.5-.8 2.8 2.8 0 0 1 5.5.8c0 2.3-2.5 4.5-5.5 6.7z"/>' +
    '</svg>',

  // Language & communication: a speech bubble + sound waves.
  language: SVG_OPEN +
    '<path d="M12 26a9 9 0 0 1 9-9h10a9 9 0 0 1 9 9v5a9 9 0 0 1-9 9h-7l-8 6v-7a9 9 0 0 1-4-8z"/>' +
    '<path d="M21 25h10"/><path d="M21 31h7"/>' +
    '<path d="M47 23q5 9 0 18"/>' +
    '<path d="M52 18q8 14 0 28"/>' +
    '</svg>',

  // Learning & thinking: stacking blocks + a little spark.
  cognitive: SVG_OPEN +
    '<rect x="13" y="36" width="16" height="15" rx="2.5"/>' +
    '<rect x="29" y="40" width="13" height="11" rx="2.5"/>' +
    '<rect x="19" y="21" width="13" height="15" rx="2.5"/>' +
    '<path d="M47 16v8"/><path d="M43 20h8"/><path d="M44.5 17.5l5 5"/><path d="M49.5 17.5l-5 5"/>' +
    '</svg>',

  // Movement & physical: a reaching figure + a toy.
  movement: SVG_OPEN +
    '<circle cx="23" cy="19" r="6"/>' +
    '<path d="M23 25v13"/>' +
    '<path d="M23 29l-8 6"/><path d="M23 29l11 4"/>' +
    '<path d="M23 38l-6 10"/><path d="M23 38l7 9"/>' +
    '<circle cx="46" cy="38" r="6"/>' +
    '</svg>'
};

function domainIllus(domain) {
  return (DOMAIN_ILLUS && DOMAIN_ILLUS[domain]) || "";
}
