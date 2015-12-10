$(function () {

  //$.getJSON('/browser-sync/socket.io/socket.io.js').done();
  var socketConfig = {
    'reconnectionAttempts': 50,
    'path': '/browser-sync/socket.io'
  };
  var socket = io('' + location.host + '/browser-sync', socketConfig);

  socket.on('connecting', function(e) {
    console.log('正在连接。。。',e);
  });

  socket.on('connect', function(e) {
    console.log('连接成功', e);
  });
});
