const path = require('path');
const fs = require('fs/promises');

const AUDIO_CAPTION_DIR = path.join(process.cwd(), 'storage', 'audioCaption');

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const saveAudioCaptionFile = async ({ productId, srt }) => {
  await ensureDir(AUDIO_CAPTION_DIR);

  const safeId = String(productId).trim();
  const fileName = `${safeId}_audioCaption.srt`;
  const filePath = path.join(AUDIO_CAPTION_DIR, fileName);

  await fs.writeFile(filePath, srt, 'utf8');

  return {
    fileName,
    filePath,
    fileUrl: `/files/audioCaption/${fileName}`,
  };
};

module.exports = { saveAudioCaptionFile };
