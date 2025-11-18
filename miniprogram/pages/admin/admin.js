const { database } = require('../../utils/mysqlDb');
const db = database();

Page({
    data: {
        tabs: [
            { key: 'pending', label: '待审核' },
            { key: 'approved', label: '已通过' },
            { key: 'rejected', label: '已驳回' },
        ],
        statusFilter: 'pending',
        goodsList: [],
        isAdmin: false,
        loading: false,
    },
    onLoad() {
        const role = wx.getStorageSync('role');
        const isAdmin = role === 'admin';
        this.setData({ isAdmin });
        if (!isAdmin) {
            wx.showToast({
                title: '无权限访问',
                icon: 'error'
            });
            setTimeout(() => {
                wx.switchTab({ url: '/pages/center/center' });
            }, 800);
            return;
        }
        this.fetchGoods();
    },
    onShow() {
        if (this.data.isAdmin) {
            this.fetchGoods();
        }
    },
    onPullDownRefresh() {
        if (!this.data.isAdmin) {
            wx.stopPullDownRefresh();
            return;
        }
        this.fetchGoods(() => {
            wx.stopPullDownRefresh();
            wx.showToast({ title: '刷新成功', icon: 'success' });
        });
    },
    changeTab(event) {
        const { key } = event.currentTarget.dataset;
        if (key === this.data.statusFilter) return;
        this.setData({ statusFilter: key });
        this.fetchGoods();
    },
    fetchGoods(done) {
        this.setData({ loading: true });
        db.collection('goods')
            .where({ status: this.data.statusFilter })
            .orderBy('time', 'desc')
            .get()
            .then(res => {
                const list = res.data.map(item => ({
                    ...item,
                    cover: item.imageIds && item.imageIds.length ? item.imageIds[0] : '',
                    displayTime: item.showtime || '',
                }));
                this.setData({ goodsList: list, loading: false });
                if (typeof done === 'function') done();
            })
            .catch(err => {
                console.error(err);
                this.setData({ loading: false });
                if (typeof done === 'function') done();
                wx.showToast({ title: '加载失败', icon: 'none' });
            });
    },
    approve(event) {
        const { id } = event.currentTarget.dataset;
        this.updateStatus(id, 'approved');
    },
    reject(event) {
        const { id } = event.currentTarget.dataset;
        wx.showModal({
            title: '提示',
            content: '确认驳回该商品吗？',
            success: res => {
                if (res.confirm) this.updateStatus(id, 'rejected');
            }
        });
    },
    viewDetail(event) {
        const { id } = event.currentTarget.dataset;
        wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
    },
    updateStatus(id, status) {
        const adminId = wx.getStorageSync('id');
        const adminName = wx.getStorageSync('uname');
        wx.showLoading({ title: '处理中...' });
        db.collection('goods')
            .doc(id)
            .update({
                data: {
                    status,
                    reviewedAt: new Date(),
                    reviewerId: adminId || '',
                    reviewerName: adminName || '',
                },
            })
            .then(() => {
                wx.hideLoading();
                wx.showToast({ title: status === 'approved' ? '已通过' : '已驳回' });
                this.fetchGoods();
            })
            .catch(err => {
                wx.hideLoading();
                console.error(err);
                wx.showToast({ title: '更新失败', icon: 'none' });
            });
    },
});
