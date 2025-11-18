const { database } = require('../../utils/mysqlDb');
const db = database();

Page({
  data: {
    id: Number,
    goodsDetailList: {},
    imageIds: [],
    canBuy: false,
    canComplete: false,
  },

  getGoodsDetail() {
    db.collection('goods').doc(this.data.id).get().then(res => {
      const detail = res.data || {};
      const imgs = Array.isArray(detail.imageIds) ? detail.imageIds : (detail.imageIds ? [detail.imageIds] : []);
      const myId = wx.getStorageSync('id');
      const canBuy = !!myId && detail.id !== myId;
      const canComplete = !!myId && detail.id === myId;
      this.setData({ goodsDetailList: detail, imageIds: imgs, canBuy, canComplete });
    });
  },

  previewImage(e) {
    const current = e.currentTarget.dataset.src;
    const urls = this.data.imageIds && this.data.imageIds.length ? this.data.imageIds : [current];
    wx.previewImage({ current, urls });
  },

  async createOrder() {
    const buyerId = wx.getStorageSync('id');
    if (!buyerId) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    const detail = this.data.goodsDetailList;
    if (!detail || !detail._id) return;
    await db.collection('orders').add({
      data: {
        goodsId: detail._id,
        buyerId,
        sellerId: detail.id,
        title: detail.title,
        cover: detail.imageIds && detail.imageIds[0] ? detail.imageIds[0] : '',
        price: detail.price || 0,
        status: 'created',
      },
    });
    wx.showToast({ title: '下单成功，等待线下交易', icon: 'success' });
  },

  async completeOrder() {
    const detail = this.data.goodsDetailList;
    if (!detail || !detail._id) return;
    const res = await db.collection('orders').where({ goodsId: detail._id, status: 'created' }).get();
    if (!res.data || !res.data.length) {
      wx.showToast({ title: '暂无进行中的订单', icon: 'none' });
      return;
    }
    const orderId = res.data[0].id || res.data[0]._id;
    await db.collection('orders').doc(orderId).update({ data: { status: 'completed' } });
    wx.showToast({ title: '已标记完成', icon: 'success' });
  },

  onLoad(options) {
    const { id } = options;
    this.setData({ id });
    this.getGoodsDetail();
  },
});
