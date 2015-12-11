/**
 * Created by WYQ on 2015/12/10.
 */
  $(function () {

    var cur_pro_data=null;
    var cur_editpro_key=null;
    var tpl_an='                            <div class="input-group"> <span class="input-group-addon"> <input type="radio" class="is_right" aria-label="..." name="is_right" ><span></span> </span> <input type="text" class="form-control" aria-label="..." placeholder="请输入答案选项"> <span class="input-group-addon del_an_hide"> <a href="#close" id="btn_del_an" class="remove label label-danger"><i class="glyphicon-remove glyphicon"></i>删除</a> </span> </div>';
    var tpl_remove_btn='<a id="btn_del_an" class="remove label label-danger del_an_hide"><i class="glyphicon-remove glyphicon"></i>删除</a>';
    $('#loading_Modal').modal('show');
    $('#fullpage').fullpage({
      anchors: ['problem_list', 'edit_problem'],
      css3:true,
      paddingTop:"50px",
      paddingBottom:'50px',
      sectionsColor: ['#fff', '#fff', '#7BAABE', '#f90'],
      scrollOverflow:true,
      afterLoad:function (anchorLink, index) {
        $("#navbar-nav>.active").removeClass("active");
        $("#navbar-nav>li>a[href=#"+anchorLink+"]").parent().addClass("active");
        switch(anchorLink){
          case "problem_list":
            //$(document).attr('title','学生二维码登录');
            break;
          case "edit_problem":
            if(cur_editpro_key){
              $("#btn_save").text("保存修改");

            }else{
              $("#btn_save").text("添加新题目");
            }
            break;
          default:
            break;
        }
        $(document).attr('title',$("#navbar-nav>.active").text());
      }
    });
    $.fn.fullpage.setAllowScrolling(false);
    $("ul[aria-labelledby=dropdownMenu2]>li").click(function () {
      console.log($(this).text());
      $("#p_group").val($(this).text());
    });

    $("#tm_list").click(function (e) {
      var target=e.target;
      console.log(target);
      if(target.tagName.toUpperCase()!="A"){
        return false;
      }

      var cur_pro_index=$(target).attr("data_index"),
        cp=cur_pro_data[cur_pro_index];
      cur_editpro_key=cp['_key'];

      $('#p_content').val(cp['content']);

      $('#answer_container').children().remove();

      cp['answer'].forEach(function  (item) {
        var newan = $(tpl_an);
        newan.find(":text").val(item.xx);
        newan.find(":radio").attr("checked", item.is_right);
        newan.appendTo($("#answer_container"));

        $("#answer_container .remove").unbind("click");

        $("#answer_container .remove").click(function (argument) {
          $(this).parent().parent().remove();
          return false;
        });
      })

      $('#fullpage').fullpage.moveTo("edit_problem");
      // var problem={
      // 	content:$('#p_content').val(),
      // 	answer:Array.prototype.map.apply($('#answer_container>.input-group>:text'),[function(item){
      // 		return({
      // 			xx:item.value,
      // 			is_right:$(item).parent().find("input[name=is_right]").is(":checked")
      // 		})}]),
      // 	group:['default'],
      // };


    });

    $("#btn_add_an").click(function () {
      $(tpl_an).appendTo($("#answer_container"));
      $("#answer_container .remove").unbind("click");
      $("#answer_container .remove").click(function (argument) {
        $(this).parent().parent().remove();
      });
      $.fn.fullpage.reBuild();

    });

    $("#btn_add_pro").click(function () {

      $('#p_content').val("");

      $('#answer_container>*').remove();

      [{xx:"",is_right:true},{xx:"",is_right:true}].forEach(function  (item) {
        var newan = $(tpl_an);
        newan.find(":text").val(item.xx);
        newan.find(":radio").attr("checked", item.is_right);
        newan.appendTo($("#answer_container"));

        $("#answer_container .remove").unbind("click");

        $("#answer_container .remove").click(function (argument) {
          $(this).parent().parent().remove();
          return false;
        });

      })

      cur_editpro_key=null;

      $('#fullpage').fullpage.moveTo("edit_problem");


    });

    $("#answer_container .remove").click(function (argument) {
      $(this).parent().parent().remove();
    });


    $("#btn_save").click(function (argument) {

      var problem={
        content:$('#p_content').val(),
        answer:Array.prototype.map.apply($('#answer_container>.input-group>:text'),[function(item){
          return({
            xx:item.value,
            is_right:$(item).parent().find("input[name=is_right]").is(":checked")
          })}]),
        group:['default'],
      };

      console.log(problem);

      if(problem.content==""){
        alert("题目描述不能为空");
        return;
      }

      var sf_tui=false;
      problem.answer.forEach(function(item) {
        if(item.xx=="")
          sf_tui=true;
      });



      if(sf_tui){
        alert("题目选项不能有空");
        return;
      }

      if(!confirm(	"确定"+$("#btn_save").text()+"!")){
        return false;
      }


      socket.emit("save_problem",problem,cur_editpro_key);

      cur_editpro_key=null;

      $('#fullpage').fullpage.moveTo("problem_list");
      socket.emit('get_all_pro');
    });


    var socketConfig = {
      'reconnectionAttempts': 50,
      'path': '/browser-sync/socket.io'
    };
    var socket = io('' + location.host + '/browser-sync', socketConfig);

    socket.on('connecting', function(e) {
      console.log("正在连接。。。",e);
    });

    socket.on('connect', function(e) {
      console.log("连接成功", e);
      setTimeout(function  () {

        socket.emit('manger_login');

        socket.emit('get_all_pro');


      },1000);





    });

    socket.on('disconnect', function(e) {
      console.log("断开连接",e);
    });

    socket.on('connect_failed', function(e) {
      console.log("连接失败",e);
    });

    socket.on('error', function(e) {
      console.log("错误发生",e);
    });

    socket.on('message', function(e) {
      console.log("message：",e);
    });

    socket.on('anything', function(e) {
      console.log("anything:",e);
    });

    socket.on('test', function(e) {
      console.log("test:",e);
    });

    socket.on('all_pro_data',function (data) {
      $('#tm_list').children().remove();
      console.log(data);
      cur_pro_data=data;
      cur_pro_data.forEach(function (item,index) {
        var item_tm = $("<a>"+item.content+"</a>");
        item_tm.attr("id",item._key);
        item_tm.attr("data_index",index);
        $(tpl_remove_btn).appendTo(item_tm);
        item_tm.appendTo(		$("<li>").appendTo($("#tm_list"))	);

      });

      $("#tm_list>li>a>.remove").click(function () {
        console.log($(this).parent().attr("id"));

        if(!confirm(	"确定删除!")){
          return false;
        }

        socket.emit('del_pro',$(this).parent().attr("id"));

        socket.emit('get_all_pro');
      });
      $('#loading_Modal').modal('hide');

    });




  });


