const { database } = require('../../utils/mysqlDb');
const db = database();
Page({

    /**
     * 页面的初始数�?
     */
    data: {
        tel: '',
        pwd: '',
        comfirmPwd: '',
        passwordType:true
    },
    onRegister(e) {
        // 定义两个数组,随机取其中一个拼接起来用来做名字
        let adjs = ["爱玩�?, "调皮�?, "美丽�?, "大气�?, "壮硕�?, "坚强�?];
        let ns = ["鲨鱼", "螃蟹", "青蛙", "旺财", "熊猫", "老虎", "狮子"]
        const adj = adjs[Math.floor(Math.random() * adjs.length)]
        const n = ns[Math.floor(Math.random() * ns.length)]



        console.log(e.detail.value)
        const userInfo = e.detail.value
        console.log(userInfo.tel)
        

        if (userInfo.tel.trim() === '' || userInfo.comfirmPwd.trim() === '' || userInfo.pwd.trim() === '') {
            wx.showToast({
                title: '表单需填写完整',
                icon: 'error'
            })
            return;
        }
        if (userInfo.pwd !== userInfo.comfirmPwd) {
            wx.showToast({
                title: '两次密码不一�?,
                icon: 'error'
            })
            return;
        }


        // 手机号正则验�?
        const telRegex = /^\d{11}$/;
        if (!telRegex.test(userInfo.tel)) {
            wx.showModal({
                title: '错误提示',
                content: '手机号必须为 11 位数字，请检查您输入的手机号码是否正确�?,
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
            console.log(res)
            if (res.data.length === 1) {
                wx.showToast({
                    title: '用户已注�?,
                    icon: 'error'
                })
                return;
            } else {
                db.collection("users").add({
                    data: {

                        tel: userInfo.tel,
                        pwd: userInfo.pwd,
                        role: 'user',
                        // 默认的一些数据，包括头像，昵称，个签
                        uname: adj + n,
                        avator: "https://img2.baidu.com/it/u=4086480905,111209506&fm=253&fmt=auto&app=138&f=PNG?w=421&h=326",
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
     // 点击隐藏或显示密�?
     changeType(e){
        this.setData({
            passwordType:!this.data.passwordType,
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函�?
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分�?
     */
    onShareAppMessage() {

    }
})
