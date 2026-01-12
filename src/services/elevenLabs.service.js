const axios = require('axios');

const ELEVENLABS_API_URL =
  process.env.ELEVENLABS_API_URL || 'https://api.elevenlabs.io/v1/text-to-speech/NOpBlnGInO9m6vDvFkFC';
const ELEVENLABS_API_KEY =
  process.env.ELEVENLABS_API_KEY || 'sk_eb736eb54bb49683c91fead56ae08c7797cecbe9ed754c92';

const generateSpeech = async (text) => {
  try {
    const response = await axios.post(
      ELEVENLABS_API_URL,
      {
        text: String(text || ''),
        model_id: "eleven_v3"
      },
      {
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        responseType: 'arraybuffer',
        maxRedirects: 0,
        timeout: 30000,
      }
    );

    return Buffer.from(response.data);
  } catch (err) {
    const status = err?.response?.status;
    const raw = err?.response?.data;
    const location = err?.response?.headers?.location;
    const message = Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw || err?.message || '');
    const details = message ? `: ${message}` : '';
    const redirectHint = location ? ` Redirect: ${location}` : '';
    throw new Error(`ElevenLabs xatosi (${status || 'unknown'})${details}${redirectHint}`);
  }
};

module.exports = { generateSpeech };
