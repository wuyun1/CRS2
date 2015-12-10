


  function reRequire(mopath){
    var pwd =require('path').resolve(mopath);
    require.cache[pwd]&&delete require.cache[pwd];
    return require(pwd);
  }


  var run =function (err,env)  {
    var app = env.app;
    var io = env.io;
    io.on('connection', reRequire("./serverapi/mysocket.js"));
    app.use("/serverapi",reRequire("./serverapi/myroute.js"));
  };



  module.exports=run;
