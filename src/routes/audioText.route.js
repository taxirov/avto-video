const express = require('express');
const { generateAudioTextHandler } = require('../controllers/audioText.controller');

const router = express.Router();

router.post('/generate/audio/text', generateAudioTextHandler);

module.exports = router;
