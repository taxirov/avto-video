const express = require('express');
const { generateAudioTextHandler, getAudioTextHandler } = require('../controllers/audioText.controller');
const { generateAudioHandler, getAudioHandler } = require('../controllers/audio.controller');
const { generateAudioCaptionHandler } = require('../controllers/audioCaption.controller');

const router = express.Router();

router.post('/generate/audio/text', generateAudioTextHandler);
router.post('/generate/audio', generateAudioHandler);
router.post('/generate/audio/caption', generateAudioCaptionHandler);
router.get('/audio/:id', getAudioHandler);
router.get('/audio/text/:id', getAudioTextHandler);

module.exports = router;
