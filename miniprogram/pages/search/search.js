const { database } = require('../../utils/mysqlDb');
const db = database();
const hitFn = require("../../utils/index")
Page({

    /**
     * 页面的初始数�?
     */
    data: {
        inputValue: '',
        searchHistory: [],
        news: true,
        hot: false,
        showHistory: true,
        showView: false,
        goodsList: [],
        sortOption: { field: 'time', order: 'desc' },
        islogin: Boolean
    },
    // 添加搜索历史记录的逻辑
    addsearchHistory(event) {
        const keyword = event.detail.value;
        this.getGoodsData(keyword)
        if (this.data.news) {
            this.tonew(keyword)
        } else {
            this.tohot(keyword)
        }
        // console.log(keyword)
        if (keyword.trim() !== '') {
            const history = this.data.searchHistory;
            if (!history.includes(keyword)) {
                history.push(keyword);
                this.setData({ searchHistory: history });
                wx.setStorageSync('searchHistory', history);
            }
        }
        // 搜索完成后立即更新显示的搜索历史记录
        this.setData({
            searchHistory: wx.getStorageSync('searchHistory') || [],
        });

    },
    // 删除本地存储
    delstorage() {
        // console.log('调用�?)
        wx.removeStorageSync('searchHistory', history);
        // 删除完成后立即更新显示的搜索历史记录
        this.setData({
            searchHistory: wx.getStorageSync('searchHistory') || [],
        });
    },
    // 切换搜索分类的逻辑
    tonew() {
        this.setData({
            news: true,
            hot: false,
            sortOption: { field: 'time', order: 'desc' }
        })
        this.getGoodsData(this.data.inputValue);
        // console.log("nihao",this.data.inputValue)
    },
    tohot() {
        this.setData({
            news: false,
            hot: true,
            sortOption: { field: 'hit', order: 'desc' }
        })
        // console.log("nihao",this.data.inputValue)
        this.getGoodsData(this.data.inputValue);
    },
    // 切换搜索的商品展示区和搜索记录的逻辑
    toshowHistory(show) {
        const bool = show.detail.value;
        if (bool) {
            this.setData({
                showHistory: false,
                showView: true
            })
        } else {
            this.setData({
                showHistory: true,
                showView: false
            })
        }
    },
    // 搜索商品逻辑
    getGoodsData(keyword) {
        const trimmed = (keyword || '').trim();
        if (!trimmed) {
            this.setData({
                goodsList: []
            });
            return;
        }
        db.collection("goods")
            .orderBy(this.data.sortOption.field, this.data.sortOption.order)
            .where({
                status: 'approved',
                title: db.RegExp({
                    regexp: trimmed,
                    options: 'i',
                }),
            })
            .get()
            .then(res => {
                this.setData({
                    goodsList: res.data
                })
            });
    },
    // 点击搜索记录直接赋值给输入�?
    sendValue(event) {
        const a = event.currentTarget.dataset.param;
        this.setData({
            inputValue: a
        })
        // this.addsearchHistory(event)
    },
    // 跳转到详情页面的逻辑
    toDetail(event) {
        const goods_id = event.currentTarget.dataset.param;
        hitFn.updateHit(this.data.islogin,goods_id)
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            searchHistory: wx.getStorageSync('searchHistory') || [],
            islogin: wx.getStorageSync('islogin')
        });
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
