var path = require('path'),
	express = require('express'), //引入express模块
	http = require('http'),
	app = express(),
  problemdb=require('./db/problem'),
	server = require('http').createServer(app);

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '80');


/**
 * Create HTTP server.
 */


app.use(express.static(path.join(__dirname, '../www'))); //指定静态HTML文件的位置
app.use(express.static(path.join(__dirname, '../bower_components')));
server.listen(port);

var teacher=null;
var users=[];
var students=[];
var cur_tmdatas=null;

var io = require('socket.io').listen(server);
io.on('connection', function(socket) {
    //�ǳ�����

    // socket.emit("loginFaild","已有教师端在线，教师端不能重复登录登录！");









    socket.on('teacher_login',function (argument) {

       if(teacher!=null)
       {

           console.log("教师端重复登录登录！");
           socket.emit("loginFaild","已有教师端在线，教师端不能重复登录登录！");
           return false;
       }


      console.log("教师端以登录！");
      socket.emit("loginSuccess");
      teacher=socket;

      socket.on('disconnect', function(e) {
            teacher=null;
            console.log("教师端已经下线！",e);
            socket.broadcast.emit("logout");
            students=[];
        });


      socket.on('get_tm_data', function(cate) {
            if(cate=="default"){
               problemdb.filter(100,function(obj,key) {if(obj._key) return true;  else return false;  }, function (datas) {
                 cur_tmdatas=datas;
                 socket.emit('tm_data',datas);
                 socket.broadcast.emit("tm_data",datas);
               });
            }
        });


      socket.on("start_yd",function (tm_index) {
          if(cur_tmdatas){
            socket.broadcast.emit("start_yd",tm_index);
          }
      });

      socket.on("stop_yd",function (tm_index) {
          if(cur_tmdatas){
            socket.broadcast.emit("stop_yd",tm_index);
          }
      });





    });




    socket.on('manger_login',function (argument) {

      console.log("管理端以登录！");
      socket.on('save_problem',function  (pro,key) {


        key=key || "ID_"+(+new Date());




        problemdb.set(key,pro);

        console.log("保存题目:",pro,key);

      });

      socket.on('del_pro',function(key) {

        if(!key) return false;






        problemdb.remove(key);

        console.log("删除题目:",key);

      });


      socket.on('get_all_pro',function  () {
        console.log("获取所有题目");

        problemdb.filter(100,function(obj,key) {
          if(obj._key) return true;
          else return false;
        }, function (datas) {
          socket.emit('all_pro_data',datas);
        });

      });

      socket.on('message', function(e) {
          console.log("message：",e);
      });

      socket.on('anything', function(e) {
          console.log("anything:",e);
      });


    });

 socket.on('xs_login', function() {

      console.log("学生端连接");

      socket.on("xslogin",function (nickname,num) {
        console.log(nickname,num,"学生端登录");


        if(teacher) {
            students.push(socket);
            var index=students.indexOf(socket);
            socket.emit("loginSuccess",index,nickname,num,cur_tmdatas);
            teacher.emit("xs_dl",index,nickname,num);

            socket.xs_name=nickname;
            socket.xs_num=num;

            socket.on("yd_data",function(num,xx_index) {
              teacher.emit("yd_data",num,xx_index);
            });




        }else{
            socket.emit("loginFaild","教师端已经下线！");
        }


      socket.on('disconnect', function(e) {
            if(students.length!=0){
               var index=students.indexOf(socket);
               students=students.slice(0,index).concat(students.slice(index+1,students.length));
               teacher&&teacher.emit("xs_xx",index,socket.xs_name,socket.xs_num);
               console.log("学生下线！",index,socket.xs_name,socket.xs_num);
            }

        });


      });

      socket.emit("require_login");
});



    socket.on('login', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
		 socket.nickname = nickname;
		 users.push(nickname);
		 socket.emit('loginSuccess');
		 io.sockets.emit('system', nickname, users.length, 'login');
        };


	socket.on('disconnect', function() {
	    //���Ͽ����ӵ��û���users��ɾ��
	    users.splice(socket.userIndex, 1);
	    //֪ͨ���Լ�������������
	    socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
	});

	socket.on('postMsg', function(msg) {
		//����Ϣ���͵����Լ����������û�
		socket.broadcast.emit('newMsg', socket.nickname, msg);
	    });

	socket.on('img', function(imgData) {
	    //ͨ��һ��newImg�¼��ַ������Լ�����ÿ���û�
	     socket.broadcast.emit('newImg', socket.nickname, imgData);
	 });


    });
});

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}
