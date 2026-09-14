const pairs = [
  ["body text", "#1b2021", "#f4f5f3", 4.5],
  ["muted text", "#5f6967", "#f4f5f3", 4.5],
  ["subtle text", "#5b6562", "#f4f5f3", 4.5],
  ["navigation text", "#bbc3bf", "#202526", 4.5],
  ["live text on white", "#567400", "#ffffff", 4.5],
  ["danger text on white", "#c84b3f", "#ffffff", 4.5],
  ["warning text on white", "#9a5a00", "#ffffff", 4.5],
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
