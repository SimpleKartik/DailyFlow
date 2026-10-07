const express = require('express');
const router = express.Router();
const { getLogs, upsertLog, updateLog, deleteLog } = require('../controllers/logController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getLogs)
  .post(protect, upsertLog);

router.route('/:id')
  .put(protect, updateLog)
  .delete(protect, deleteLog);

module.exports = router;
