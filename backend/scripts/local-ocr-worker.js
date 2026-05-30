const { recognize } = require('tesseract.js');

const imagePath = process.argv[2];

if (!imagePath) {
  console.error('Image path is required');
  process.exit(1);
}

(async () => {
  const result = await recognize(imagePath, 'eng');
  process.stdout.write(JSON.stringify({ rawText: result?.data?.text || '' }));
})().catch((err) => {
  console.error(err?.message || String(err));
  process.exit(1);
});
