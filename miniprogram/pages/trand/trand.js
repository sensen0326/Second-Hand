// Use local API (MySQL)
const { database, command } = require('../../utils/mysqlDb');
const db = database();
const _ = command;
Page({
    data: {
        classup: true,
        classdown: false,
        newGoodsList: [],
        downGoodsList: [],
        goods_id: "",
        isShow: Boolean,
        contents: ""
    },
    toup() {
        this.setData({ classup: true, classdown: false });
        this.getData();
    },
    todown() {
        this.setData({ classup: false, classdown: true });
        this.getDownGoods();
    },

    // 获取在卖商品数据
    getData() {
        const id = wx.getStorageSync('id')
        db.collection("goods").where({ id }).get().then(res => {
            if (res.data.length === 0) {
                this.setData({ isShow: true, contents: "暂未发布的商品，快去发布吧~" })
            } else {
                this.setData({ isShow: false, contents: "" })
            }
            this.setData({ newGoodsList: res.data })
        })
    },
    // 获取已下架商品数据
    getDownGoods() {
        const id = wx.getStorageSync('id')
        db.collection("downs").where({ id }).get().then(res => {
            if (res.data.length === 0) {
                this.setData({ isShow: true, contents: "暂未下架过商品~" })
            } else {
                this.setData({ isShow: false, contents: "" })
            }
            this.setData({ downGoodsList: res.data })
        })
    },
    // 下架商品
    delgoods(e) {
        const param = e.currentTarget.dataset.param;
        wx.showLoading({ title: '正在下架，请稍候...' });
        db.collection("goods").doc(param).get().then(res => {
            db.collection("downs").add({
                data: {
                    id: res.data.id,
                    showtime: new Date().toLocaleString(),
                    title: res.data.title,
                    imageIds: res.data.imageIds,
                    newdegree: res.data.newdegree
                }
            }).catch(err => {
                console.log(err);
                wx.hideLoading();
                wx.showToast({ title: '下架失败，请稍后重试', icon: 'none' });
                return;
            });
        }).catch(err => {
            console.log(err);
            wx.hideLoading();
            wx.showToast({ title: '下架失败，请稍后重试', icon: 'none' });
            return;
        });
        db.collection("goods").doc(param).remove().then(res => {
            wx.hideLoading();
            wx.showToast({ title: '下架成功!' });
            this.getData();
        }).catch(err => {
            console.log(err);
            wx.hideLoading();
            wx.showToast({ title: '下架失败，请稍后重试', icon: 'none' });
        });
    },
    onLoad() { this.getData(); },
    onPullDownRefresh() {
        this.getData();
        wx.stopPullDownRefresh();
        wx.showToast({ title: '刷新成功!', icon: "success" })
    },
});
