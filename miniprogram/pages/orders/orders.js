const { database } = require('../../utils/mysqlDb');
const db = database();

Page({
  data: {
    tab: 'buy',
    orders: [],
    loading: false,
  },

  onLoad(options) {
    if (options && options.tab) {
      this.setData({ tab: options.tab });
    }
    this.fetchOrders();
  },
  onShow() {
    this.fetchOrders();
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.tab) return;
    this.setData({ tab }, () => this.fetchOrders());
  },

  async fetchOrders() {
    const uid = wx.getStorageSync('id');
    if (!uid) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    this.setData({ loading: true });
    const filter = this.data.tab === 'buy' ? { buyerId: uid } : { sellerId: uid };
    try {
      const res = await db.collection('orders').where(filter).get();
      this.setData({ orders: res.data || [], loading: false });
    } catch (err) {
      console.error(err);
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  async complete(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    try {
      await db.collection('orders').doc(id).update({ data: { status: 'completed' } });
      wx.showToast({ title: '已完成', icon: 'success' });
      this.fetchOrders();
    } catch (err) {
      console.error(err);
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },
});
