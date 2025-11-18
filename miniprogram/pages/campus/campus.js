// Use local API (MySQL)
const { database, command } = require('../../utils/mysqlDb');
const db = database();
const _ = command;
Page({

    /**
     * 椤甸潰鐨勫垵濮嬫暟鎹?
     */
    data: {
        classtrends: true,
        classlife: false,
        newGoodsList: [],
        islogin: Boolean
    },
    totrends() {
        this.setData({
            classtrends: true,
            classlife: false
        })
    },
    tolife() {
        this.setData({
            classtrends: false,
            classlife: true
        })
    },

    // 鑾峰彇鏁版嵁
    getData() {
        db.collection("goods").where({
            status: 'approved'
        }).get().then(res => {
            // console.log(res)
            this.setData({
                newGoodsList: res.data
            })
        })
    },

    // 娴忚閲忕洃鍚€昏緫
    countView(e) {
        const param = e.currentTarget.dataset.param
        hitFn.updateHit(this.data.islogin,param)
    },
    /**
     * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
     */
    onLoad(options) {
        this.getData()
        this.setData({
            islogin: wx.getStorageSync('islogin')
        })
    },

    /**
     * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍒濇娓叉煋瀹屾垚
     */
    onReady() {

    },

    /**
     * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
     */
    onShow() {
        this.setData({
            islogin: wx.getStorageSync('islogin')
        })
    },

    /**
     * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰闅愯棌
     */
    onHide() {

    },

    /**
     * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍗歌浇
     */
    onUnload() {

    },

    /**
     * 椤甸潰鐩稿叧浜嬩欢澶勭悊鍑芥暟--鐩戝惉鐢ㄦ埛涓嬫媺鍔ㄤ綔
     */
    onPullDownRefresh() {
        this.getData()
        // 鏁版嵁鍔犺浇瀹屾垚鍚庯紝鍋滄涓嬫媺鍒锋柊鍔ㄧ敾
        wx.stopPullDownRefresh();
        wx.showToast({
            title: '鍒锋柊鎴愬姛!',
            icon: "success"
        })
    },

    /**
     * 椤甸潰涓婃媺瑙﹀簳浜嬩欢鐨勫鐞嗗嚱鏁?
     */
    onReachBottom() {

    },

    /**
     * 鐢ㄦ埛鐐瑰嚮鍙充笂瑙掑垎浜?
     */
    onShareAppMessage() {

    }
})
