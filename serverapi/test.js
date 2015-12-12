/**
 * Created by WYQ on 2015/12/10.
 */
var db = require("./myDbApi.js");
var source =  require("./source.json");
//db.find({}, function (k,d) {
//  console.log(k+"="+d);
//});
for(var i in source){
	console.log(i);
	db.put(i,
		{content:source[i].content,
		answer:source[i].answer,
		group:source[i].group
	});
}
// db.put("k4",{a:3});
//db.put("k1","1112323111 ");
//db.put("k34","1111发大是大非1111 ", function (e) {
//  console.log(e)
//});
//db.put("k44","阿斯蒂芬111111 ");
//db.put("k64","111个111111 ");
//db.put("k74","11111阿道夫1111 ");
//db.put("84","111111阿士大夫撒的111 ");
//db.put("k94","1111阿萨德发该死的11111 ");
db.findAll({}, function (k,d) {
  console.log(k,d);
});
//db.del("k4", function (e) {
//  console.log("del:"+e)
//});
//db.get("k4", function (k,d) {
//  console.log(k,d);
//});
