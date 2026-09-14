const pairs = [
  ["body text", "#f3f6f8", "#0b1015", 4.5],
  ["muted text", "#9aa8b2", "#0b1015", 4.5],
  ["subtle text", "#7f8e99", "#0b1015", 4.5],
  ["navigation text", "#a8b4bc", "#0a0e12", 4.5],
  ["panel text", "#cbd4da", "#141a20", 4.5],
  ["live text", "#f47a6e", "#0b1015", 4.5],
  ["warning text", "#e0b862", "#0b1015", 4.5],
  ["danger text", "#f07870", "#0b1015", 4.5],
];

function rgb(hex) {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16) / 255);
}

function luminance(hex) {
  const [r, g, b] = rgb(hex).map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const one = luminance(a);
  const two = luminance(b);
  return (Math.max(one, two) + 0.05) / (Math.min(one, two) + 0.05);
}

const failures = [];
for (const [label, foreground, background, minimum] of pairs) {
  const ratio = contrast(foreground, background);
  if (ratio < minimum) failures.push(`${label}: ${ratio.toFixed(2)}:1 (minimum ${minimum}:1)`);
  else console.log(`${label}: ${ratio.toFixed(2)}:1`);
}

if (failures.length) {
  console.error("Contrast audit failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Core palette contrast audit passed.");
