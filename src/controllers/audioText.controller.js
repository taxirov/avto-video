const { buildAudioTemplate } = require('../utils/audioTemplate');
const { saveAudioTextFile, readAudioTextFile } = require('../services/audioText.service');
const { convertToLatin } = require('../services/matnUz.service');

const generateAudioTextHandler = async (req, res) => {
  const product = req.body.product || req.body;
  const productId = product?.id;

  if (!product || !productId) {
    return res.status(400).json({ error: 'product.id talab qilinadi' });
  }

  try {
    const text = buildAudioTemplate(product);
    const latinText = await convertToLatin(text);
    const result = await saveAudioTextFile({ productId, text: latinText });
    return res.status(200).json({
      productId,
      fileUrl: "https://auto-video.webpack.uz" + result.fileUrl,
      text: result.text,
    });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Server xatosi' });
  }
};

const getAudioTextHandler = async (req, res) => {
  const productId = req?.params?.id;

  if (!productId) {
    return res.status(400).json({ error: 'id talab qilinadi' });
  }

  try {
    const result = await readAudioTextFile({ productId });
    return res.status(200).json({
      productId,
      fileUrl: "https://auto-video.webpack.uz" +  result.fileUrl,
      text: result.text,
    });
  } catch (err) {
    if (err?.code === 'ENOENT') {
      return res.status(404).json({ error: 'Audio text topilmadi' });
    }
    return res.status(500).json({ error: err?.message || 'Server xatosi' });
  }
};

module.exports = { generateAudioTextHandler, getAudioTextHandler };
