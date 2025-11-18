const { database, command } = require('./mysqlDb');
const db = database();
const _ = command;
function updateHit(islogin,param) {
    if (islogin) {
        // console.log(param)
        db.collection("goods").doc(param).update({
            data: {
                //   点一次加一
                hit: _.inc(1)
            }
        }).then(res => {
            // console.log("hit调用了", res)
        })
        wx.navigateTo({
            url: `/pages/detail/detail?id=${param}`,
        })
    } else {
        wx.showToast({
            title: '请先去登录!',
            icon: "error"
        })
        setTimeout(() => {
            wx.switchTab({
                url: '/pages/center/center',
            })
        }, 1000)
    }
}

module.exports = {
    updateHit
};
