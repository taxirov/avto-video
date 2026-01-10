const express = require('express');
const { generateAudioTextHandler, getAudioTextHandler } = require('../controllers/audioText.controller');

const router = express.Router();

router.post('/generate/audio/text', generateAudioTextHandler);
router.get('/generate/audio/text/:id', getAudioTextHandler);

module.exports = router;
