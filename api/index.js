var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('api is ok');
});

// 聊天接口
router.use(require('./chat'));
// deepseek 官方
router.use(require('./chat-deepseek'));

module.exports = router;
