const { readAudioTextFile } = require('../services/audioText.service');
const { saveAudioFile } = require('../services/audio.service');
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
      fileUrl: "https://auto-video.webpack.uz" + result.fileUrl
    });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Server xatosi' });
  }
};

module.exports = { generateAudioHandler };
