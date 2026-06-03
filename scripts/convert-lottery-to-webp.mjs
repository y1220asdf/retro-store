import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, '..', 'public', 'images');

const FILES = [
  'lottery_card.png',
  'lottery_back.png',
  'lottery_background.png',
  'lottery_arrow.png',
];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function convertOne(filename) {
  const inputPath = path.join(imagesDir, filename);
  const outputPath = inputPath.replace(/\.png$/i, '.webp');

  await sharp(inputPath)
    .webp({ quality: 85, effort: 4 })
    .toFile(outputPath);

  const [inputStat, outputStat] = await Promise.all([
    stat(inputPath),
    stat(outputPath),
  ]);

  const ratio = ((1 - outputStat.size / inputStat.size) * 100).toFixed(1);
  console.log(
    `✓ ${filename} → ${path.basename(outputPath)}  (${formatBytes(inputStat.size)} → ${formatBytes(outputStat.size)}, -${ratio}%)`,
  );
}

async function main() {
  console.log(`輸出目錄: ${imagesDir}\n`);

  for (const file of FILES) {
    await convertOne(file);
  }

  console.log('\n全部轉換完成。');
}

main().catch((err) => {
  console.error('轉檔失敗:', err.message);
  process.exit(1);
});
