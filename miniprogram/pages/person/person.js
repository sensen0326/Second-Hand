const { database } = require('../../utils/mysqlDb');
const db = database();
Page({

    data: {
        userData: {},
        disable: true,
        showform: false,
        canReview: false
    },
    outlogin() {
        wx.removeStorageSync('userId')
        wx.removeStorageSync('id')
        wx.removeStorageSync('avator')
        wx.removeStorageSync('uname')
        wx.removeStorageSync('role')
        wx.setStorageSync('islogin', false)
        this.setData({
            canReview: false
        })
        wx.showToast({
            title: '退出成功',
            icon: "success"
        })
        setTimeout(() => {
            wx.switchTab({
                url: '/pages/center/center',
            })
        }, 500)
    },
    // 更新头像/上传头像
    upAvator() {
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: async (res) => {
                const tempFilePaths = res.tempFilePaths[0];
                const id = wx.getStorageSync('id');
                const avator = wx.getStorageSync('avator')
                // 如果有旧头像，删除原图
                if (avator) {
                    function deleteImageByFileId(fileId) {
                        return new Promise((resolve, reject) => {
                            wx.cloud.deleteFile({
                                fileList: [fileId],
                            }).then(res => resolve(res)).catch(err => reject(err));
                        });
                    }
                    deleteImageByFileId(avator).then(() => {
                        console.log('旧头像删除成功');
                    }).catch(err => {
                        console.error('旧头像删除失败：', err);
                    });
                }

                try {
                    const cloudRes = await wx.cloud.uploadFile({
                        cloudPath: `avatars/${Date.now()}-${Math.random()}.jpg`,
                        filePath: tempFilePaths
                    });
                    await db.collection('users').doc(id).update({
                        data: { avator: cloudRes.fileID }
                    });
                    await db.collection('goods').where({ id }).update({
                        data: { avatorImg: cloudRes.fileID }
                    })
                    wx.showToast({ title: '头像更新成功!' });
                    this.getuserData()
                } catch (error) {
                    console.error(error);
                    wx.showToast({
                        title: '头像更新失败!',
                        icon: 'none'
                    });
                }
            },
            fail: (error) => {
                console.error('选择图片失败', error);
            }
        });
    },
    // 获取用户的信息
    getuserData() {
        const id = wx.getStorageSync('id')
        db.collection("users").doc(id).get().then(res => {
            const canReview = res.data.tel === '17603343390';
            this.setData({
                userData: res.data,
                canReview
            })
            wx.setStorageSync('avator', res.data.avator)
            wx.setStorageSync('uname', res.data.uname)
            wx.setStorageSync('tel', res.data.tel)
            wx.setStorageSync('role', canReview ? 'admin' : (res.data.role || 'user'))
        })
    },
    // 显示表单
    showForm() {
        this.setData({ showform: true })
    },
    closeForm() {
        this.setData({ showform: false })
    },
    toAdmin() {
        if (!this.data.canReview) {
            wx.showToast({ title: '无权限', icon: 'none' })
            return;
        }
        wx.navigateTo({ url: '/pages/admin/admin' })
    },
    updateUser(e) {
        const { uname, signature, tel } = e.detail.value
        const id = wx.getStorageSync('id')
        db.collection("users").doc(id).get().then(res => {
            if (uname === '' || signature === '' || tel === '') {
                wx.showToast({ title: '昵称/个签/电话均不能为空', icon: 'error' })
                return;
            }
            if (res.data.uname === uname && res.data.signature === signature && res.data.tel === tel) {
                wx.showToast({ title: '修改后再提交!', icon: 'error' })
                return;
            } else {
                db.collection("users").doc(id).update({
                    data: { uname, signature, tel }
                }).then(res => {
                    wx.showToast({ title: '修改成功!', icon: 'success' })
                    this.getuserData()
                    this.setData({ showform: false })
                })
            }
        })
    },

    onLoad() {
        this.getuserData()
    },
})
