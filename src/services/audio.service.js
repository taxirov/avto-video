const path = require('path');
const fs = require('fs/promises');

const AUDIO_DIR = path.join(process.cwd(), 'storage', 'audio');

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const saveAudioFile = async ({ fileId, buffer }) => {
  await ensureDir(AUDIO_DIR);

  const safeId = String(fileId).trim();
  const fileName = `${safeId}_audio.mp3`;
  const filePath = path.join(AUDIO_DIR, fileName);

  await fs.writeFile(filePath, buffer);

  return {
    fileName,
    filePath,
    fileUrl: `/files/audio/${fileName}`,
  };
};

module.exports = { saveAudioFile };
