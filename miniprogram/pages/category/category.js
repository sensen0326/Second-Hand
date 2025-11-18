const { database } = require('../../utils/mysqlDb');
const db = database();
const hitFn = require("../../utils/index")
let categoryName = {
    1: "书籍资料",
    2: "电子设备",
    3: "学习用品",
    4: "体育用品",
    5: "生活用品",
    6: "服饰配饰",
    7: "男生专区",
    8: "女生专区"
}
Page({

    /**
     * 页面的初始数�?
     */
    data: {
        // 默认选中第一�?
        curNav: 1,
        navList: [{
            id: 1,
            name: '书籍资料'
        },
        {
            id: 2,
            name: '电子设备'
        },
        {
            id: 3,
            name: '学习用品'
        },
        {
            id: 4,
            name: '体育用品'
        },
        {
            id: 5,
            name: '生活用品'
        },
        {
            id: 6,
            name: '服饰配饰'
        },
        {
            id: 7,
            name: '男生专区'
        },
        {
            id: 8,
            name: '女生专区'
        }
        ],
        rightList: [],
        islogin: Boolean,
        showToast: Boolean
    },
    /* 把点击到的某一项 设为当前curNav   */
    switchRightTab: function (e) {
        let id = e.target.dataset.id;
        if (!id) {
            wx.setStorageSync('paramKey', "1");
        } else {
            wx.setStorageSync('paramKey', id);
        }
        this.setData({
            curNav: id
        })
        this.getData()
    },
    // 获取数据
    getData() {

        // console.log(gategoeyName[this.data.curNav])
        db.collection("goods").where({
            category: categoryName[this.data.curNav],
            status: 'approved'
        }).get().then(res => {
            this.setData({
                rightList: res.data,
            })
            if (res.data.length === 0) {
                this.setData({
                    showToast: true
                })
            } else {
                this.setData({
                    showToast: false
                })
            }
        })
    },
    // 传参跳转到商品详情页�?
    toDetail(event) {
        const goods_id = event.currentTarget.dataset.param;
        hitFn.updateHit(this.data.islogin,goods_id)
    },



    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 默认curNav等于1时获取数�?
        this.getData()
        const paramValue = wx.getStorageSync('paramKey');
        // 进行参数处理
        this.setData({
            curNav: paramValue,
            islogin: wx.getStorageSync('islogin')
        })
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
        const paramValue = wx.getStorageSync('paramKey');
        this.setData({
            curNav: paramValue,
            islogin: wx.getStorageSync('islogin')
        })
        this.getData() 
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
        this.onLoad();
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
