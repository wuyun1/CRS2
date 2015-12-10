var express = require('express');
//var bodyParser     =         require("body-parser");

var router = express.Router();

//console.log("ROUTE:");
// 该路由使用的中间件
//router.use(bodyParser.urlencoded({ extended: false }));
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});
// 定义网站主页的路由
router.get('/', function(req, res) {
  res.end('Birds home page');
});

module.exports = router;
