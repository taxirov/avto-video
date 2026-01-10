const axios = require('axios');

const MATN_UZ_API_URL = process.env.MATN_UZ_API_URL || 'https://matn.uz/api/v1/latin';
const MATN_UZ_API_KEY =
  process.env.MATN_UZ_API_KEY || 'vmTYSQIIyB8kUDAaNy33Asu4jjnQ5qXbsJcIehi7SOmoUmhvmdogxsTlKmM8c6W46AFweVlvflEs0VdK';

const extractLatinText = (payload) => {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;
  if (typeof payload !== 'object') return '';
  if (payload.error || payload.message) return '';
  return (
    payload.text ||
    payload.body ||
    payload.body?.text ||
    payload.body?.result ||
    payload.result ||
    payload.result?.text ||
    payload.latin ||
    payload.latin_text ||
    (typeof payload.data === 'string' ? payload.data : '') ||
    payload.data?.text ||
    payload.data?.latin ||
    payload.data?.latin_text ||
    payload.data?.body ||
    payload.data?.body?.text ||
    payload.data?.result ||
    payload.data?.result?.text ||
    ''
  );
};

const normalizeLatinResponse = (data) => {
  if (!data) return '';
  if (typeof data !== 'string') return extractLatinText(data);

  const trimmed = data.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed.startsWith('"')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === 'string') return parsed;
      return extractLatinText(parsed);
    } catch (err) {
      return trimmed.replace(/^"(.*)"$/s, '$1');
    }
  }

  return trimmed;
};

const convertToLatin = async (text) => {
  try {
    const response = await axios.post(
      MATN_UZ_API_URL,
      { text: String(text || '') },
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${MATN_UZ_API_KEY}`,
        },
        responseType: 'text',
        transformResponse: [(data) => data],
        timeout: 15000,
      }
    );

    const latinText = normalizeLatinResponse(response.data);
    if (latinText) return latinText;
    throw new Error('Matn.uz javobida text topilmadi');
  } catch (err) {
    const payload = err?.response?.data;
    const errorMessage =
      payload?.error ||
      payload?.message ||
      err?.message ||
      'Matn.uz xatolik qaytardi';
    throw new Error(errorMessage);
  }
};

module.exports = { convertToLatin };
