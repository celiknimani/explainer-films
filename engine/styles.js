// Render style presets. Pick one with ?style=<name> in the player URL or --style on the tools.
// mat: which material family toon() returns. ramp: toon shading steps (0-255). outline: line width
// multiplier (0 = no outlines). ink: outline colour, or 'self' to tint each outline from its mesh colour.
// edges: width in pixels of crease lines drawn along hard edges (line styles only).
// fill: when set, every surface is painted this colour and only the lines carry the picture.
// env: overrides merged into every scene environment (sky, ground, clouds).
export const STYLES = {
  toon: { label: 'Toon', mat: 'toon', ramp: [105, 185, 255], outline: 1, ink: '#1E1C27' },
  paper: { label: 'Flat paper', mat: 'toon', ramp: [224, 255], outline: 0, ink: '#1E1C27' },
  clay: { label: 'Clay', mat: 'standard', outline: 0, ink: '#1E1C27' },
  blueprint: { label: 'Blueprint', mat: 'basic', fill: '#1C4A86', mono: true, outline: 1.7, edges: 2.2, ink: '#EAF2FF', grid: 'rgba(234,242,255,0.09)',
    env: { top: '#163C70', mid: '#1C4A86', hor: '#1C4A86', ground: '#1C4A86', clouds: false, sunvis: false } },
  neon: { label: 'Night neon', mat: 'basic', fill: '#0D1030', outline: 1.9, edges: 2.4, ink: 'self',
    env: { top: '#070919', mid: '#0D1030', hor: '#12163D', ground: '#0A0D26', clouds: false, sunvis: false } },
};
