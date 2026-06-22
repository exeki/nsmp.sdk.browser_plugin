import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sizes = [16, 32, 48, 96, 128];
const variants = [
    {src: 'icons/nsmp_logo_colored.svg', dir: 'public/icon'},
    {src: 'icons/nsmp_logo_gray.svg', dir: 'public/icon-gray'},
];

for (const {src, dir} of variants) {
    const outDir = join(root, dir);
    mkdirSync(outDir, {recursive: true});
    const svg = readFileSync(join(root, src));
    const master = await sharp(svg).resize(128, 128).png().toBuffer();

    for (const size of sizes) {
        const png = size === 128
            ? master
            : await sharp(master).resize(size, size).png().toBuffer();

        writeFileSync(join(outDir, `${size}.png`), png);
    }
}

console.log('Icons generated in public/icon and public/icon-gray');
