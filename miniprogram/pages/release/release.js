const { database } = require('../../utils/mysqlDb');
const db = database();
Page({
    data: {
        categoryList: [
            { id: 1, className: "书籍资料" },
            { id: 2, className: "电子设备" },
            { id: 3, className: "学习用品" },
            { id: 4, className: "体育用品" },
            { id: 5, className: "生活用品" },
            { id: 6, className: "服饰配饰" },
            { id: 7, className: "男生专区" },
            { id: 8, className: "女生专区" },
        ],
        newdegreeList: [
            { id: 1, newdegreeName: "全新" },
            { id: 2, newdegreeName: "99新" },
            { id: 3, newdegreeName: "95新" },
            { id: 4, newdegreeName: "9成新" },
            { id: 5, newdegreeName: "8成新" },
        ],
        showDropdown: false,
        selectedCategory: null,
        shownewdegree: false,
        newdegreeName: null,
        title: '',
        issus: '',
        price: '0.00',
        tel: '',
        uploadedImagePaths: [],
        videoPath: '',
        Currenttime: '',
    },

    // 处理图片上传
    async uploadImage() {
        const res = await wx.chooseImage({
          count: 9,
          sizeType: ['original', 'compressed'],
          sourceType: ['album', 'camera'],
        });
        const uploadTasks = res.tempFilePaths.map(filePath => {
          return wx.cloud.uploadFile({
            cloudPath: `images/${Date.now()}-${Math.random()}.jpg`,
            filePath: filePath,
          });
        });
        const results = await Promise.all(uploadTasks);
        this.setData({
          uploadedImagePaths: [...this.data.uploadedImagePaths,...results.map(item => item.fileID)],
        });
      },

    deleteImage(e) {
        const index = e.currentTarget.dataset.index;
        this.data.uploadedImagePaths.splice(index, 1);
        this.setData({
          uploadedImagePaths: this.data.uploadedImagePaths,
        });
      },

    // 选择并上传视频（<=15s，<=50MB）
    async uploadVideo() {
        try {
            const res = await wx.chooseVideo({
                sourceType: ['album', 'camera'],
                compressed: true,
                maxDuration: 15,
                camera: 'back'
            });
            if (res.duration > 15) {
                wx.showToast({ title: '视频需在15秒内', icon: 'none' });
                return;
            }
            if (res.size && res.size > 50 * 1024 * 1024) {
                wx.showToast({ title: '视频需小于50MB', icon: 'none' });
                return;
            }
            const upload = await wx.cloud.uploadFile({
                cloudPath: `videos/${Date.now()}-${Math.random()}.mp4`,
                filePath: res.tempFilePath,
            });
            this.setData({ videoPath: upload.fileID });
            wx.showToast({ title: '视频上传成功', icon: 'success' });
        } catch (err) {
            console.error(err);
            wx.showToast({ title: '视频上传失败', icon: 'none' });
        }
    },

    // 将获取过来的数据的time转换成常用的时间格式
    ParseDate() {
        const currentDate = new Date();
        const formatted = currentDate.toString();
        const date = formatted.slice(8, 10)
        const year = formatted.slice(11, 15)
        const hour = formatted.slice(16, 24)
        const month = formatted.slice(4, 7)
        const monthsArr = {
            Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
            Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
        };
        this.setData({
            Currenttime: `${year}.${monthsArr[month]}.${date}  ${hour}`
        })
    },

    // 处理商品信息提交
    async addData(e) {
        const formData = e.detail.value;
        const currentDate = new Date();
        const id = wx.getStorageSync('id');
        const avator = wx.getStorageSync('avator');
        const uname = wx.getStorageSync('uname');
        this.ParseDate();

        if (!formData.title || !formData.issus || !formData.price || !this.data.selectedCategory || !this.data.selectednewdegree || !formData.tel) {
            wx.showToast({ title: '所有项均不为空', icon: 'error' });
            return;
        }
        if (typeof formData.price !== 'number') {
            formData.price = parseFloat(formData.price) || 0;
        }
        formData.price = formData.price.toFixed(2);

        const goodsInfo = {
            title: formData.title,
            description: formData.issus,
            price: formData.price,
            category: this.data.selectedCategory,
            newdegree: this.data.selectednewdegree,
            tel: formData.tel,
            hit: 0,
            time: currentDate,
            showtime: this.data.Currenttime,
            imageIds: this.data.uploadedImagePaths || [],
            videoUrl: this.data.videoPath || '',
            id: id,
            avatorImg: avator,
            username: uname,
            status: 'pending',
        };
        await db.collection('goods').add({ data: goodsInfo });
        wx.showToast({ title: '商品已提交审核，等待管理员审核', icon: 'success' });
        this.setData({
            title: '',
            issus: '',
            price: '0.00',
            selectedCategory: null,
            showDropdown: false,
            selectednewdegree: null,
            shownewdegree: false,
            tel: '',
            uploadedImagePaths: [],
            videoPath: '',
        });
    },

    // 处理分类下拉菜单的切换
    toggleDropdown() {
        this.setData({ showDropdown: !this.data.showDropdown });
    },
    selectClass(e) {
        const category = e.currentTarget.dataset.param;
        this.setData({ selectedCategory: category, showDropdown: false });
    },

    // 处理新旧程度下拉菜单的切换
    togglenewdegree() {
        this.setData({ shownewdegree: !this.data.shownewdegree });
    },
    selectnewdegree(e) {
        const newdegree = e.currentTarget.dataset.params;
        this.setData({ selectednewdegree: newdegree, shownewdegree: false });
    },

    onLoad() {
        const telphone = wx.getStorageSync('tel')
        this.setData({ tel: telphone })
    },

    onShow() {
        const telphone = wx.getStorageSync('tel')
        const id = wx.getStorageSync('id')
        this.setData({ tel: telphone })
        if (!id) {
            wx.showToast({ title: '请先登录!', icon: 'error' })
            setTimeout(() => {
                wx.switchTab({ url: '/pages/center/center' })
            }, 1000)
        }
    }
})
