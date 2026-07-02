import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const dir = new URL('.', import.meta.url).pathname;
const publicDir = new URL('../public/', import.meta.url).pathname;

const iconSvg = readFileSync(dir + 'icon-source.svg');
const maskableSvg = readFileSync(dir + 'icon-maskable-source.svg');

await sharp(iconSvg).resize(192, 192).png().toFile(publicDir + 'pwa-192x192.png');
await sharp(iconSvg).resize(512, 512).png().toFile(publicDir + 'pwa-512x512.png');
await sharp(maskableSvg).resize(512, 512).png().toFile(publicDir + 'maskable-icon-512x512.png');
await sharp(iconSvg).resize(180, 180).flatten({ background: '#6d28d9' }).png().toFile(publicDir + 'apple-touch-icon.png');

console.log('Icons generated.');
