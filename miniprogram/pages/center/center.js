const { database } = require('../../utils/mysqlDb');
const db = database();
Page({
    data: {
        isLogin: false,
        uname: 'xxxxx',
        userId: 'xxxx',
        avator:'https://img0.baidu.com/it/u=1240274933,2284862568&fm=253&fmt=auto&app=138&f=PNG?w=180&h=180',
        postNumber:0,
        isAdmin: false
    },
    onLogin() {
        wx.navigateTo({ url: '/pages/login/login' })
    },
    toPerson() {
        wx.navigateTo({ url: '/pages/person/person' })
    },
    taggleLogin(){
        const id = wx.getStorageSync('id')
        const userId = wx.getStorageSync('userId')
        const avator = wx.getStorageSync('avator')
        const uname =  wx.getStorageSync('uname')
        const role = wx.getStorageSync('role')
        if (id) {
            this.setData({ isLogin: true, userId, avator, uname, isAdmin: role === 'admin' })
        }else{
            this.setData({
                isLogin: false,
                userId:'xxxx',
                avator:"https://img0.baidu.com/it/u=1240274933,2284862568&fm=253&fmt=auto&app=138&f=PNG?w=180&h=180",
                uname:'xxxxx',
                isAdmin: false
            })
        }
    },
    toTrand(){ wx.navigateTo({ url: '/pages/trand/trand' }) },
    toOrdersBuy(){ wx.navigateTo({ url: '/pages/orders/orders?tab=buy' }) },
    toOrdersSell(){ wx.navigateTo({ url: '/pages/orders/orders?tab=sell' }) },
    toAdmin(){ wx.navigateTo({ url: '/pages/admin/admin' }) },
    getCount(){ 
        const id = wx.getStorageSync('id')
        db.collection("goods").where({ id }).get().then(res=>{
            this.setData({ postNumber:res.data.length })
        })
    },
    onLoad() { this.taggleLogin(); this.getCount(); },
    onShow() { this.taggleLogin(); this.getCount(); },
    onPullDownRefresh() { this.onLoad(); wx.stopPullDownRefresh(); },
});
