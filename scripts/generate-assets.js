const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 1. Generate 1024x1024 App Icon SVG
const iconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#151b28"/>
      <stop offset="60%" stop-color="#0a0d14"/>
      <stop offset="100%" stop-color="#040508"/>
    </radialGradient>
    <linearGradient id="trailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff007f"/>
      <stop offset="50%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#00f0ff"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background rounded rect -->
  <rect width="1024" height="1024" rx="220" fill="url(#bgGrad)"/>
  <rect width="1020" height="1020" x="2" y="2" rx="218" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="4"/>

  <!-- Dynamic trailing lines mimicking Canvas Cursor -->
  <path d="M 220 780 C 340 680, 260 420, 480 380 C 680 340, 780 560, 800 240" 
        fill="none" stroke="url(#trailGrad)" stroke-width="28" stroke-linecap="round" filter="url(#glow)"/>
  
  <path d="M 260 760 C 370 650, 310 440, 500 410 C 660 380, 740 520, 770 280" 
        fill="none" stroke="#00f0ff" stroke-width="14" stroke-opacity="0.8" stroke-linecap="round"/>

  <path d="M 300 740 C 400 620, 360 460, 520 440 C 640 420, 700 480, 740 320" 
        fill="none" stroke="#ff007f" stroke-width="8" stroke-opacity="0.9" stroke-linecap="round"/>

  <!-- Central glowing pointer cursor -->
  <circle cx="800" cy="240" r="28" fill="#ffffff" filter="url(#glow)"/>
  <circle cx="800" cy="240" r="14" fill="#00f0ff"/>

  <!-- Brand Symbol / Center Monogram -->
  <circle cx="512" cy="512" r="70" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.4)" stroke-width="3"/>
  <text x="512" y="528" font-family="system-ui, sans-serif" font-size="54" font-weight="900" fill="#ffffff" text-anchor="middle">S</text>
</svg>
`;

// 2. Generate 2732x2732 Splash Screen SVG
const splashSvg = `
<svg width="2732" height="2732" viewBox="0 0 2732 2732" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="splashBg" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#141a29"/>
      <stop offset="50%" stop-color="#0a0d14"/>
      <stop offset="100%" stop-color="#040508"/>
    </radialGradient>
    <linearGradient id="splashTrail" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff007f"/>
      <stop offset="35%" stop-color="#6366f1"/>
      <stop offset="70%" stop-color="#00f0ff"/>
      <stop offset="100%" stop-color="#4ade80"/>
    </linearGradient>
    <filter id="splashGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="30" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Deep dark canvas background -->
  <rect width="2732" height="2732" fill="url(#splashBg)"/>

  <!-- Radiant orbital curves -->
  <path d="M 600 1900 C 900 1600, 750 1100, 1366 1100 C 1950 1100, 1800 1600, 2100 800" 
        fill="none" stroke="url(#splashTrail)" stroke-width="45" stroke-linecap="round" filter="url(#splashGlow)" opacity="0.85"/>
  <path d="M 680 1850 C 950 1580, 850 1160, 1366 1160 C 1880 1160, 1750 1550, 2020 880" 
        fill="none" stroke="#00f0ff" stroke-width="20" stroke-linecap="round" opacity="0.9"/>
  <path d="M 760 1800 C 1000 1560, 950 1220, 1366 1220 C 1800 1220, 1700 1500, 1940 960" 
        fill="none" stroke="#a855f7" stroke-width="12" stroke-linecap="round" opacity="0.9"/>

  <!-- Core pointer glowing node -->
  <circle cx="2100" cy="800" r="50" fill="#ffffff" filter="url(#splashGlow)"/>
  <circle cx="2100" cy="800" r="26" fill="#00f0ff"/>

  <!-- Logo Icon Badge -->
  <circle cx="1366" cy="1366" r="180" fill="rgba(15,23,42,0.85)" stroke="rgba(255,255,255,0.15)" stroke-width="6"/>
  <circle cx="1366" cy="1366" r="140" fill="rgba(99,102,241,0.25)" stroke="#6366f1" stroke-width="4"/>
  <text x="1366" y="1415" font-family="system-ui, -apple-system, sans-serif" font-size="140" font-weight="900" fill="#ffffff" text-anchor="middle">S</text>

  <!-- Typography -->
  <text x="1366" y="1670" font-family="system-ui, -apple-system, sans-serif" font-size="88" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="4">SMIND CURSOR</text>
  <text x="1366" y="1740" font-family="system-ui, -apple-system, sans-serif" font-size="38" font-weight="500" fill="#94a3b8" text-anchor="middle" letter-spacing="2">INTERACTIVE CANVAS EXPERIENCE</text>
</svg>
`;

async function run() {
  console.log('Generating high-res assets...');
  
  await sharp(Buffer.from(iconSvg))
    .png()
    .toFile(path.join(assetsDir, 'icon-only.png'));

  await sharp(Buffer.from(iconSvg))
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));

  await sharp(Buffer.from(iconSvg))
    .png()
    .toFile(path.join(assetsDir, 'icon-foreground.png'));

  // Background for adaptive icons (solid dark)
  const bgSvg = `<svg width="1024" height="1024"><rect width="1024" height="1024" fill="#07090e"/></svg>`;
  await sharp(Buffer.from(bgSvg))
    .png()
    .toFile(path.join(assetsDir, 'icon-background.png'));

  await sharp(Buffer.from(splashSvg))
    .png()
    .toFile(path.join(assetsDir, 'splash.png'));

  await sharp(Buffer.from(splashSvg))
    .png()
    .toFile(path.join(assetsDir, 'splash-dark.png'));

  console.log('✓ All assets generated successfully in assets/ directory!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

