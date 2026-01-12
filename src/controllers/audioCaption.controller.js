const { saveAudioCaptionFile } = require('../services/audioCaption.service');
const { buildAudioTemplateDigits } = require('../utils/audioTemplate');

const generateAudioCaptionHandler = async (req, res) => {
  const payload = req?.body || {};
  const product = payload?.product || payload;
  const productId = product?.id || payload?.productId;
  const durationSeconds = Number(payload?.durationSeconds || payload?.duration || payload?.audioDuration);
  const text = typeof payload?.text === 'string' ? payload.text : '';

  if (!productId) {
    return res.status(400).json({ error: 'productId talab qilinadi' });
  }
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return res.status(400).json({ error: 'durationSeconds talab qilinadi' });
  }

  try {
    const baseText = text.trim() ? text.trim() : buildAudioTemplateDigits(product || {});
    if (!baseText) {
      return res.status(400).json({ error: 'Matn topilmadi' });
    }

    const srt = buildSrtFromText(baseText, durationSeconds);
    const result = await saveAudioCaptionFile({ productId, srt });
    return res.status(200).json({
      productId,
      fileUrl: "https://avto-video2.webpack.uz" + result.fileUrl,
      srt,
    });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Server xatosi' });
  }
};

function buildSrtFromText(text, durationSeconds) {
  const cleaned = String(text || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';

  const parts = cleaned.split(/[.!?]+/).map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return '';

  const wordsPerPart = parts.map((p) => p.split(/\s+/).filter(Boolean).length);
  const totalWords = wordsPerPart.reduce((a, b) => a + b, 0) || 1;

  let current = 0;
  const lines = [];

  parts.forEach((sentence, idx) => {
    const wordCount = wordsPerPart[idx] || 1;
    const slice = (durationSeconds * wordCount) / totalWords;
    const start = current;
    const end = Math.min(durationSeconds, start + Math.max(0.4, slice));
    current = end;
    lines.push(`${idx + 1}`);
    lines.push(`${formatSrtTime(start)} --> ${formatSrtTime(end)}`);
    lines.push(sentence);
    lines.push('');
  });

  return lines.join('\n');
}

function formatSrtTime(seconds) {
  const totalMs = Math.max(0, Math.round(seconds * 1000));
  const ms = totalMs % 1000;
  const totalSec = Math.floor(totalMs / 1000);
  const s = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const m = totalMin % 60;
  const h = Math.floor(totalMin / 60);
  return `${pad2(h)}:${pad2(m)}:${pad2(s)},${pad3(ms)}`;
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

function pad3(value) {
  return String(value).padStart(3, '0');
}

module.exports = { generateAudioCaptionHandler };
