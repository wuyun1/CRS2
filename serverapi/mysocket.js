/**
 * Created by WYQ on 2015/12/10.
 */
var db= require("./mydbapi.js");

var teacher=null;
var isyding=0;
var students=[];
var cur_tmdatas=null;
var mysockethandle = function (socket) {
  console.log('Socket 连接成功');
  //socket.on('test', function () {
  //  console.log("test");
  //});
  socket.on('teacher_login',function () {
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
    socket.on('get_tm_data', function(type) {
      type=type||'default';
      if(type=="default"){
        db.findAll({}, function (err,datas) {
          cur_tmdatas=datas;
          socket.emit('tm_data',datas);
          socket.broadcast.emit("tm_data",datas);
        });
      }
    });
    socket.on("start_yd",function (tm_index) {
      if(cur_tmdatas){
        isyding=tm_index+1;
        socket.broadcast.emit("start_yd",tm_index);
      }
    });
    socket.on("stop_yd",function (tm_index) {
      if(cur_tmdatas){
        isyding=0;
        socket.broadcast.emit("stop_yd",tm_index);
      }
    });
  });
  socket.on('manger_login',function () {
    console.log("管理端以登录！");

    socket.on('save_problem',function  (pro,key) {
      key=key || "ID_"+(+new Date());
      db.put(key,pro, function () {
        console.log("保存题目:",pro,key);
      });
    });
    socket.on('del_pro',function(key) {
      if(!key) return false;
      db.del(key, function () {
        console.log("管理端删除题目:",key);
      })

    });
    socket.on('get_all_pro',function  (type) {

      type=type||'default';
      if(type=="default") {
        db.findAll({prefix: "ID_"}, function (err, datas) {
          socket.emit('all_pro_data', datas);
          console.log("管理端获取所有题目",datas);
        });
      }
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
        socket.emit("loginSuccess",index,nickname,num,cur_tmdatas,isyding);
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




};

module.exports = mysockethandle;
