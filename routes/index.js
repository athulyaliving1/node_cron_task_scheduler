var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  
  var datetime = new Date();
console.log(datetime);
  res.render('index', { title: 'Express' });
});
 
module.exports = router;
