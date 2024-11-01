const express = require('express');
const router = express.Router();
const { activateAccentConversion, deactivateAccentConversion } = require('../controllers/ringCentralController');

router.post('/activate-accent', activateAccentConversion);
router.post('/deactivate-accent', deactivateAccentConversion);

module.exports = router;
