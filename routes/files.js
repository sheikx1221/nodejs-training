const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  const fileStream = fs.createReadStream(path.join(__dirname, '../data.json'), { encoding: 'utf8' });

  fileStream.pipe(res);
});

module.exports = router;
