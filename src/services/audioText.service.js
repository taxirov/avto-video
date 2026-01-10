const path = require('path');
const fs = require('fs/promises');

const AUDIO_TEXT_DIR = path.join(process.cwd(), 'storage', 'audioText');

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const saveAudioTextFile = async ({ productId, text }) => {
  await ensureDir(AUDIO_TEXT_DIR);

  const safeId = String(productId).trim();
  const fileName = `${safeId}_audioText.txt`;
  const filePath = path.join(AUDIO_TEXT_DIR, fileName);

  await fs.writeFile(filePath, text, 'utf8');

  return {
    fileName,
    filePath,
    fileUrl: `/files/audioText/${fileName}`,
    text,
  };
};

const readAudioTextFile = async ({ productId }) => {
  const safeId = String(productId).trim();
  const fileName = `${safeId}_audioText.txt`;
  const filePath = path.join(AUDIO_TEXT_DIR, fileName);
  const text = await fs.readFile(filePath, 'utf8');

  return {
    fileName,
    filePath,
    fileUrl: `/files/audioText/${fileName}`,
    text,
  };
};

module.exports = { saveAudioTextFile, readAudioTextFile };
