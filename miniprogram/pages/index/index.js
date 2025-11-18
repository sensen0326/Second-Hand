const hitFn = require("../../utils/index")
const { database } = require('../../utils/mysqlDb');
const db = database();;

Page({
    data: {
        //九宫格数�?
        list: [],
        // 轮播图数�?
        tus: [],
        // 商品列表数据
        goodsList: [],
        page: 2, // 当前页码
        pageSize: 2, // 每页条数
        prompt: false,  //是否显示已经到底�?
        islogin: Boolean //判断是否登录
    },
    // 点击或聚焦输入框时触发的逻辑
    toSearch() {
        wx.navigateTo({
            url: "/pages/search/search",
        })
    },

    // 跳转到catagory页面的逻辑
    toCategory(event) {
        // 加号隐式转换成number类型
        const params = +event.currentTarget.dataset.param;
        if (!params) {
            wx.setStorageSync('paramKey', "1");
            wx.switchTab({
                url: '/pages/category/category'
            })
        } else {
            wx.setStorageSync('paramKey', params);
            wx.switchTab({
                url: '/pages/category/category'
            })
        }
    },
    // 跳转到详情页面的逻辑
    toDetail(event) {
        const goods_id = event.currentTarget.dataset.param;
        hitFn.updateHit(this.data.islogin,goods_id)
    },

    // 触底加载数据
    loadProducts() {
        db.collection('goods')
            .where({
                status: 'approved'
            })
            .skip((this.data.page - 1) * this.data.pageSize)
            .limit(this.data.pageSize)
            .get({
                success: res => {
                    const newGoodsList = this.data.goodsList.concat(res.data);
                    this.setData({
                        goodsList: newGoodsList,
                        page: this.data.page + 1,
                    });

                    // 判断是否还有更多数据可加�?
                    if (res.data.length > 0) {
                        this.findEvent();
                        this.setData({
                            prompt: false
                        })
                    } else {
                        this.setData({
                            prompt: true
                        })
                    }
                },
                fail: err => {
                    console.error(err);
                },
            });
    },
    // 数据加载事件
    findEvent: function () {
        wx.showLoading({
            title: "数据加载�?.."
        })
        setTimeout(function () {
            wx.hideLoading()
        }, 200)
    },
    // 拨打电话逻辑
    tels: function () {
        wx.makePhoneCall({
            phoneNumber: '12345678910',
        })
    },
    // 获取商品数据逻辑
    getData() {
        db.collection("goods")
            .where({
                status: 'approved'
            })
            .limit(2) // 限制获取前两条数�?
            .get()
            .then(res => {
                // console.log(res);
                const goodsList = res.data;
                this.setData({
                    goodsList,
                });
                console.log(typeof res.data)
            })
            .catch(err => {
                console.error(err);
            });
    },
    // 获取页面数据
    getPageData() {
        // 获取轮播图数�?
        db.collection("lunbotus").get().then(res => {
            this.setData({
                tus: res.data
            })
            // console.log(res.data)
        })
        // 获取九宫格数�?
        db.collection("jiugongges").get().then(res => {
            this.setData({
                list: res.data
            })
            // console.log(res.data)
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.findEvent();
        this.getPageData()
        this.getData()
        this.setData({
            islogin: wx.getStorageSync('islogin')
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.setData({
            islogin: wx.getStorageSync('islogin')
        })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.loadProducts();
        // 数据加载完成后，停止下拉刷新动画
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函�?
     */
    onReachBottom: function () {
        this.loadProducts();
    },

    /**
     * 用户点击右上角分�?
     */
    onShareAppMessage: function () {

    }
})
