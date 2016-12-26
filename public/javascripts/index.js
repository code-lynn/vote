
var url = window.location.href,
    indexReg = /index/,
    registerReg = /register/,
    detailReg=/detail/,
    searchReg=/search/,
    limit = 10,
    offset = 0,
    total = 0,
    userInfo='userInfo',
    loadMoreFlag = false;
//投票-单例模式
var vote = {
    //首页
    indexInit: function() {
        var that = this;
        this.manageVote();
        this.manageUserInfo();
        this.getRequest('/vote/index/data?limit=' + limit + '&offset=0', 'GET', '', function(data) {
            var lists = data.data.objects;
            total = data.data.total;
            $('.coming').html(that.getIndexUserStr(lists))
        });
        this.loadMore();
    },
    //投票功能
    manageVote:function () {
        var that=this;
        // $(document).click(function (event) {});
        $(document).on('click','.btn',function (event) {//？？？
            var user=that.getStorage(userInfo);
            if(user){//用户已登录
                var selfId=user.id,
                    voterId=+$(this).attr('data_id');
                that.getRequest('/vote/index/poll?id='+voterId+'&voterId='+selfId,'GET','',function (data) {
                    console.log(data);
                    if(data.errno===0){
                        var $numEle=$(event.target).siblings('.vote').children('span'),
                            voteNum=parseInt($numEle.html());
                        $numEle.html(++voteNum+'票').addClass('bounceIn');

                    }else {
                        alert(data.msg);
                    }
                })
            }else {
                $('.mask').show();
            }
        })
    },
    //登陆退出
    manageUserInfo:function () {
      var that=this;
      var user=this.getStorage(userInfo);
      if(user){
        $('.sign_in span').html('退出登录');
        $('.register').html('个人主页');
        $('.no_signed').hide();
        $('.username').html(user.name);
      }
        //登录
        $('.sign_in').click(function (event) {
            $('.mask').show();
        });
        //弹出层
        $('.mask').click(function (event) {
            if(event.target.className==='mask'){
                $(this).hide();
            }
        });
        //退出登录-删除本地存储
        $('.dropout').click(function (event) {
            that.deleteStorage(userInfo);
            window.location=url;
        });
        //用户登录
        $('.subbtn').click(function (event) {
            var $usernum=$('.usernum').val(),
                $password=$('.user_password').val();
            if ($usernum === '') {
                alert('请输入你的id号');
                return false
            }
            if ($password === '') {
                alert('请输入密码');
                return false
            }
            var sendData={
                id:$usernum,
                password:$password
            };
            //发送请求 保存user
            that.getRequest('/vote/index/info','POST',sendData,function (data) {
                // console.log(data);
                that.setStorage(userInfo,{
                    name:data.user.username,
                    id:data.user.id
                });
                if(data.errno===0){
                    window.location= url;
                }else {
                    alert(data.msg);
                }

            });
        })
    },
    //报名页
    registerInit:function () {
        var that=this;
        $('.rebtn').click(function (event) {
            //获取表单数据
            var sendData=that.getRegisterData();
            //提交请求
            that.getRequest('/vote/register/data','POST',sendData,function (data) {
                console.log(data);
                if(data.errno===0){
                    //用户信息存储到本地
                    that.setStorage(userInfo,{
                        id:data.id,
                        name:sendData.username
                    });
                    window.location = '/vote/index';
                }else {
                    alert(data.msg);
                }
            })
        })
    },
    //详情页
    detailInit:function () {
        var that=this;
        var id=/detail\/(\d*)/.exec(url)[1];//？？？
        that.getRequest('/vote/all/detail/data?id=' + id, 'GET', '', function(data) {
            $('.personal').html()

        })
    },




    //本地存储-本地不同页面直接对话
    setStorage:function (key,obj) {
        localStorage.setItem(key,JSON.stringify(obj));
    },
    getStorage:function (key) {
        return JSON.parse(localStorage.getItem(key));
    },
    deleteStorage:function (key) {
        return localStorage.removeItem(key);
    },
    //报名页-获取数据
    getRegisterData:function () {
        var $username=$('.username').val(),
            $innitialPassword=$('.initial_password').val(),
            $confirmPassword=$('.comfirm_password').val(),
            $mobile=$('.mobile').val(),
            $description=$('.description').val();
        var gender='boy';
        if($username==''){
            alert('请输入用户名');
            return false;
        }
        if(!$innitialPassword==$confirmPassword){
            alert('您两次输入密码不一致');
            return false;
        }
        if(!/^\d{11}$/i.test($mobile)){
            alert('请输入正确手机号');
            return false;
        }
        if($description==''){
            alert('请输入自我描述');
            return false;
        }
        $('input[type=radio]')[0].checked?gender='boy':gender='girl';
        return {
            username:$username,
            password:$confirmPassword,
            mobile:$mobile,
            description:$description,
            gender:gender
        }
    },
    //下拉刷新
    loadMore: function() {
        //引用插件
       /* var that = this
        loadMore({
            callback: function(load) {
                offset = offset + limit
                if (offset < total) {
                    that.registerData('/vote/index/data?limit=' + limit + '&offset=' + offset, 'GET', '', function(data) {
                        var lists = data.data.objects;
                        /!*延时是为了更好的演示效果*!/
                        setTimeout(function(){
                            $('.coming').append(that.getIndexUserStr(lists))
                            load.reset();
                        }, 1000)
                    })
                } else {
                    load.complete();
                    /!*延时是为了更好的演示效果*!/
                    setTimeout(function(){
                        load.reset();
                    }, 1000)
                }
            }
        });*/

       //不引用插件：
        var that = this;
        window.onscroll = function() {
        	var winHeight = document.documentElement.clientHeight || document.body.clientHeight;
        	var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        	var realHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        	var changeHeight  = winHeight + scrollTop
        	if (changeHeight >= realHeight && !loadMoreFlag) {
        		loadMoreFlag = true
        		offset = offset + limit
        		if (offset < total) {
        			that.getRequest('/vote/index/data?limit=' + limit + '&offset=' + offset, 'GET', '', function(data) {
        				var lists = data.data.objects;

                        setTimeout(function(){
                            $('.coming').append(that.getIndexUserStr(lists));
                            //发送ajax，实现局部刷新，请求来的数据只 重新渲染页面中的 $('.coming)元素
                            loadMoreFlag = false
                        }, 1000);

        			})
        		} else {
        		    setTimeout(function () {
                        $('.loadmore').html("内容已经全部显示～")
                        loadMoreFlag = false
                    },1000);

        		}
        	}
        }
    },
    //首页拼接字符串
    getIndexUserStr: function (lists) {
        var str = '';
        for (var i = 0; i < lists.length; i++) {
            str +=  '<li>'
                +'<div class="head">'
                +'   <a href="detail.html">'
                +'      <img src="' + lists[i].head_icon + '" alt="">'
                +'   </a>'
                +'</div>'
                +'<div class="up">'
                +'   <div class="vote">'
                +'      <span>' + lists[i].vote + '票</span>'
                +'  </div>'
                +'   <div data_id="'+lists[i].id+'" class="btn">'
                +'      投TA一票'
                +'   </div>'
                +'</div>'
                +'<div class="descr">'
                +'   <a href="detail.html">'
                +'     <div>'
                +'        <span>' + lists[i].username + '</span>'
                +'        <span>|</span>'
                +'        <span>编号#' + lists[i].id + '</span>'
                +'      </div>'
                +'      <p>' + lists[i].description + '</p>'
                +'   </a>'
                +'</div>   '
                +'</li>'
        }
        return str
    },
    //封装-发送请求
    getRequest: function(url, method, data, fn) {
        $.ajax({
            url: url,
            type: method,
            dataType: 'json',
            data: data,
            success: fn
        })
    }
};
//接口逻辑
$(document).ready(function($) {
    if (indexReg.test(url)) {
        vote.indexInit()
    } else if (registerReg.test(url)) {
        vote.registerInit();
    }else if (detailReg.test(url)) {
        vote.detailInit();
    }

});



