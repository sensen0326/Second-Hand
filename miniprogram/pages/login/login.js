const { database } = require('../../utils/mysqlDb');
const db = database();

Page({

    data: {
        ischecked: true,
        passwordType:true
    },
    // 勾选协议的逻辑
    togglechecked() {
        this.setData({
            ischecked: this.data.ischecked ? false : true
        })
    },
    // 登录逻辑
    login(e) {
        const formData = e.detail.value
        if (formData.username === "" || formData.password === "") {
            wx.showToast({
                title: '表单须填写完毕',
                icon: 'error'
            })
            return;
        }
        if (!this.data.ischecked) {
            wx.showToast({
                title: '请勾选协议',
                icon: 'error'
            })
            return;
        }

        // openid进行身份鉴权
        db.collection("users").where({
            tel: formData.username,
            pwd: formData.password
        }).get().then(res => {
            if (res.data.length === 1) {
                wx.showToast({
                    title: '登陆成功!',
                    icon: "success"
                })
                const _id = res.data[0]._id.slice(0, 5)
                wx.setStorageSync('userId', _id)
                wx.setStorageSync('id', res.data[0]._id)
                wx.setStorageSync('avator', res.data[0].avator)
                wx.setStorageSync('uname', res.data[0].uname)
                wx.setStorageSync('tel', res.data[0].tel)
                wx.setStorageSync('role', res.data[0].role || 'user')
                wx.setStorageSync('islogin', true)
                setTimeout(() => {
                    wx.switchTab({
                        url: '/pages/index/index',
                    })
                }, 1000)
            } else {
                wx.showToast({
                    title: '账号或密码错误',
                    icon: "error"
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
