const { database } = require('../../utils/mysqlDb');
const db = database();
Page({

    data: {
        tel: '',
        pwd: '',
        comfirmPwd: '',
        passwordType: true
    },
    onRegister(e) {
        // 定义两个数组,随机取其中一个拼接起来用来做名字
        const adjs = ["爱玩", "调皮", "美丽", "大气", "壮硕", "坚强"];
        const ns = ["鲨鱼", "螃蟹", "青蛙", "旺财", "熊猫", "老虎", "狮子"];
        const adj = adjs[Math.floor(Math.random() * adjs.length)];
        const n = ns[Math.floor(Math.random() * ns.length)];

        const userInfo = e.detail.value;

        if (userInfo.tel.trim() === '' || userInfo.comfirmPwd.trim() === '' || userInfo.pwd.trim() === '') {
            wx.showToast({
                title: '表单需填写完整',
                icon: 'error'
            })
            return;
        }
        if (userInfo.pwd !== userInfo.comfirmPwd) {
            wx.showToast({
                title: '两次密码不一致',
                icon: 'error'
            })
            return;
        }

        // 手机号正则验证
        const telRegex = /^\d{11}$/;
        if (!telRegex.test(userInfo.tel)) {
            wx.showModal({
                title: '错误提示',
                content: '手机号必须为 11 位数字，请检查您输入的手机号码是否正确',
                showCancel: false
            });
            return;
        }

        // 密码正则验证
        const pwdRegex = /^[A-Z].*[a-z].*[0-9].*$/;
        if (!pwdRegex.test(userInfo.pwd)) {
            wx.showModal({
                title: '错误提示',
                content: '密码必须以大写字母开头，包含大小写字母和数字',
                showCancel: false
            });
            return;
        }

        db.collection("users").where({
            tel: userInfo.tel
        }).get().then(res => {
            if (res.data.length === 1) {
                wx.showToast({
                    title: '用户已注册',
                    icon: 'error'
                })
                return;
            } else {
                db.collection("users").add({
                    data: {
                        tel: userInfo.tel,
                        pwd: userInfo.pwd,
                        role: 'user',
                        uname: adj + n,
                        avator: "http://localhost:3000/static/touxiang.jpg",
                        signature: ''
                    }
                }).then(res => {
                    wx.showToast({
                        title: '注册成功!',
                        icon: 'success'
                    })
                    setTimeout(() => {
                        wx.navigateTo({
                            url: '/pages/login/login',
                        })
                    }, 1000)
                })
            }
        })
    },
     // 点击隐藏或显示密码
     changeType(e){
        this.setData({
            passwordType:!this.data.passwordType,
        })
    },

    onLoad(options) {},
    onReady() {},
    onShow() {},
    onHide() {},
    onUnload() {},
    onPullDownRefresh() {},
    onReachBottom() {},
    onShareAppMessage() {},
})
