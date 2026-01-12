const { readAudioTextFile } = require('../services/audioText.service');
const { saveAudioFile, readAudioFile } = require('../services/audio.service');
const { generateSpeech } = require('../services/elevenLabs.service');

const generateAudioHandler = async (req, res) => {
  const payload = req?.body || {};
  const productId = payload?.id || payload?.productId;
  let text = payload?.text;

  if (!text && productId) {
    try {
      const result = await readAudioTextFile({ productId });
      text = result.text;
    } catch (err) {
      if (err?.code === 'ENOENT') {
        return res.status(404).json({ error: 'Audio text topilmadi' });
      }
      return res.status(500).json({ error: err?.message || 'Server xatosi' });
    }
  }

  if (!text) {
    return res.status(400).json({ error: 'text talab qilinadi' });
  }

  const fileId = productId || Date.now();

  try {
    const audioBuffer = await generateSpeech(text);
    const result = await saveAudioFile({ fileId, buffer: audioBuffer });
    return res.status(200).json({
      id: String(fileId),
      fileUrl: "https://avto-video2.webpack.uz" + result.fileUrl
    });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Server xatosi' });
  }
};

const getAudioHandler = async (req, res) => {
  const fileId = req?.params?.id;

  if (!fileId) {
    return res.status(400).json({ error: 'id talab qilinadi' });
  }

  try {
    const result = await readAudioFile({ fileId });
    return res.status(200).json({
      id: String(fileId),
      fileUrl: "https://avto-video2.webpack.uz" + result.fileUrl
    });
  } catch (err) {
    if (err?.code === 'ENOENT') {
      return res.status(404).json({ error: 'Audio topilmadi' });
    }
    return res.status(500).json({ error: err?.message || 'Server xatosi' });
  }
};

module.exports = { generateAudioHandler, getAudioHandler };
