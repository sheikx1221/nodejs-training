var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  const fileStream = fs.createReadStream(path.join(__dirname, '../data.json'), { encoding: 'utf8' });

  fileStream.pipe(res);
});

module.exports = router;
