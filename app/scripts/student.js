/**
 * Created by WYQ on 2015/12/10.
 */

//
//require.config({
//  shim: {
//    'bootstrap': ['jquery'],
//    'fullpage': ['jquery'],
//    'jquery_qrcode': ['jquery'],
//    'bootstrapValidator': ['bootstrap'],
//    'slimScroll': ['jquery']
//  },
//  paths: {
//    jquery: '/jquery/dist/jquery.min',
//    bootstrap: '/bootstrap/dist/js/bootstrap.min',
//    fullpage: '/fullpage.js/jquery.fullPage',
//    socketio: '/socket.io/socket.io',
//    slimScroll: '/slimScroll/jquery.slimscroll.min',
//    jquery_qrcode: '/jquery-qrcode/jquery.qrcode.min',
//    bootstrapValidator: '/bootstrapvalidator/dist/js/bootstrapValidator.min',
//  }
//});
//
//
//require(['jquery', 'socketio', 'bootstrap', 'fullpage', 'bootstrapValidator', 'slimScroll'], function ($, io) {
//

  $(function () {


    $('#fullpage').fullpage({
      // anchors: ['page_login', 'page_beginanswer'],
      css3: true,
       paddingTop:'50px',
      // continuousVertical:true,
      // loopHorizontal:true,
      scrollOverflow: true,
      // sectionsColor: ['#fff', '#fff', '#7BAABE', '#f90'],
      afterLoad: function (anchorLink, index) {


      }
    });

    $('#fullpage').fullpage.setAllowScrolling(false);
    // $('#form_login').submit(function (e) {
    // 	console.log(e);
    // 	return false;
    // })

    var xs_name = null;
    var xs_num = null;
    var xs_index = null;
    var cur_tmdatas = null;
    var start_dati = false;
    var cur_xx = null;

    var tpl_warning = function (title, content) {
      return '<div class="alert alert-warning alert-dismissible fade in" role="alert"> <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button> <strong>' + title + '</strong> ' + content + '  </div>';
    }


    $('#loading_Modal').modal('show');

    $('#open_login').click(function () {
      $('#login_Modal').modal('show');
    });

    $('#logout_btn').click(function () {
      localStorage.crs_msg=undefined;
      location.reload(true);
    });

    var socketConfig = {
      'reconnectionAttempts': 50,
      'path': '/browser-sync/socket.io'
    };

    var socket = io('' + location.host + '/browser-sync', socketConfig);

    socket.on('connecting', function (e) {
      console.log('正在连接。。。', e);
    });

    socket.on('connect', function (e) {
      console.log('连接成功', e);


      setTimeout(function () {
        $('#loading_Modal').modal('hide');
        socket.emit('xs_login');
      }, 1000);
      //socket.emit('test');


    });

    socket.on('disconnect', function (e) {
      console.log('断开连接', e);
    });

    socket.on('connect_failed', function (e) {
      console.log('连接失败', e);
    });

    socket.on('error', function (e) {
      console.log('错误发生', e);
    });

    socket.on('message', function (e) {
      console.log('message：', e);
    });

    socket.on('anything', function (e) {
      console.log('anything:', e);
    });

    socket.on('test', function (e) {
      console.log('test:', e);
    });
    function start_yd(tm_index) {
      var tm_xx = cur_tmdatas[tm_index].answer;
      var wrap_xx_list = $('#list_xx');
      wrap_xx_list.children().remove();

      tm_xx.forEach(function (item, index) {
        var xx = $('<button>');
        xx.attr('type', 'button').attr('class', 'btn btn-primary btn-lg').attr('is_right', item.is_right).text(item.xx).attr('xx_index', index);
        xx.click(function (argument) {
          cur_xx = $(this);
          socket.emit('yd_data', xs_num, cur_xx.attr('xx_index'));
          $('#dt_tip').text('已提交应答数据！等待教师端显示应答结果。');
          cur_xx.css('border', '3px solid #0f0');
          $('#list_xx>li>button').attr('disabled', 'disabled');
        });
        wrap_xx_list.append($("<li/>").append(xx));
      });
      $('#dt_tip').text('');
      start_dati = true;
      $.fn.fullpage.reBuild();

    }
    socket.on('start_yd',start_yd );

    socket.on('stop_yd', function (e) {
      if (start_dati == false) return;
      $('#list_xx>li>button').attr('disabled', 'disabled');
      if (cur_xx.attr('is_right') == 'false') {
        cur_xx.parent().addClass('cha');
        $('#list_xx>li>button[is_right=true]').parent().addClass('right');
      }else{
        cur_xx.parent().addClass('gou');
      }
      $('#dt_tip').text('');
      start_dati = true;
    });
    socket.on('require_login', function (argument) {

      $('#login_Modal').modal('show');

      var user_msg = JSON.parse(localStorage.crs_msg);
      console.log(user_msg);
      if (user_msg && user_msg.name && user_msg.num) {
        $('#user_name').val(user_msg.name);
        $('#user_no').val(user_msg.num);
        $('#btn_login').button('loading');
        $('#btn_login').click();
      }
    });


    socket.on('loginSuccess', function (index, name, num, tm,isyding) {
      $('#btn_login').button('reset');
      $('#login_Modal').modal('hide');
      $('#login_tip').hide();
      $('#open_login').hide();
      xs_name = name;
      xs_num = num;
      xs_index = index;
      cur_tmdatas = tm;
      localStorage.crs_msg = JSON.stringify({name: xs_name, num: xs_num});
      $(document).attr('title', 'CRS课堂应答器' + '|' + name);
      $('#fullpage').fullpage.moveTo(2);
      console.log(isyding);
      if(isyding){
        start_yd(isyding-1);
      }


    });

    socket.on('tm_data', function (tm) {

      cur_tmdatas = tm;


    });


    socket.on('logout', function (index, name, num) {

      location.reload(true);
      //$(document).attr('title','CRS课堂应答器'+'|未登录！');


    });


    socket.on('loginFaild', function (c) {
      $('#btn_login').button('reset');
      $('#form_login').append($(tpl_warning('登录失败！', c)));

    });


    // $('#btn_test').on('click', function () {
    //     var $btn = $(this).button('loading');
    //     // business logic...
    //     setTimeout(function () {
    // 		$btn.button('reset');
    // 	},3000);
    //   });


    $('#btn_login').click(function () {

      $('#form_login').bootstrapValidator('validate');
      if ($('#form_login').data('bootstrapValidator').isValid()) {

        $('#btn_login').button('loading');
        socket.emit('xslogin', $('#user_name').val(), $('#user_no').val());


      }
      ;
      //$('#login_Modal').modal('hide');
    });


  });


  $(function () {


    $('#form_login').bootstrapValidator({
      // live: 'disabled',
      message: 'This value is not valid',
      feedbackIcons: {
        valid: 'glyphicon glyphicon-ok',
        invalid: 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
      },
      fields: {

        user_name: {
          message: 'The username is not valid',
          validators: {
            notEmpty: {
              message: 'The username is required and cannot be empty'
            },
            stringLength: {
              min: 2,
              max: 30,
              message: 'The username must be more than 3 and less than 30 characters long'
            },
            // regexp: {
            //     regexp: /^[a-zA-Z0-9_\.]+$/,
            //     message: 'The username can only consist of alphabetical, number, dot and underscore'
            // },

            // different: {
            //     field: 'password',
            //     message: 'The username and password cannot be the same as each other'
            // }
          }
        },
        user_no: {
          message: 'The username is not valid',
          validators: {
            notEmpty: {
              message: 'The username is required and cannot be empty'
            },
            stringLength: {
              min: 2,
              max: 30,
              message: 'The username must be more than 2 and less than 30 characters long'
            },
            regexp: {
              regexp: /^[0-9]+$/,
              message: 'The username can only consist of alphabetical, number, dot and underscore'
            },

            // different: {
            //     field: 'password',
            //     message: 'The username and password cannot be the same as each other'
            // }
          }
        },


      }
    });


  });


//});
//
//




