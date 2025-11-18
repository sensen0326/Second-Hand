/**
 * 快速开始教程知识点
 */
const QuickStartPoints = [
  { id: '1', title: '无需搭建服务器，快速构建小程序' },
  { id: '2', title: '免登录、免鉴权调用微信开放服�? },
];

function highlightText(content) {
  return `<span> \`${content}\` </span>`;
}

/**
 * 快速开始教程步�? */
const QuickStartSteps = [
  {
    id: '1',
    title: '创建列表页面并初始化数据',
    contents: [
      {
        type: 'text',
        content: `编辑教程内置的页�?{highlightText('miniprogram/pages/goods-list/index.js')}，在${highlightText('Page')}�?{highlightText('data')}配置项中添加初始化数�?{highlightText('goodsList')}，代码如下所示。该页面将用于展示商品列表。`,
      },
      {
        type: 'code',
        content: `
        Page({
        data: {
            goodsList: [{
            _id: '1',
            title: '商品1',
            price: 1,
            }],
        },
        })
        `,
      },
      {
        type: 'text',
        content: '保存文件，查看页面，可以看到列表渲染出初始数据�?,
      },
      {
        type: 'image',
        content: 'list-init.png',
      }
    ],
    showJumpButton: true,
  },
  {
    id: '2',
    title: '实现并部署一个后台接�?,
    contents: [
      {
        type: 'text',
        content: `编辑教程内置的后台接口文�?{highlightText('cloudfunctions/quickstartFunctions/fetchGoodsList/index.js')}，使用下面代码覆盖文件内容，返回一些模拟的商品列表数据。`,
      },
      {
        type: 'code',
        content: `
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
exports.main = async (event, context) => {
  return {
    dataList: [
      { _id: '1', title: '微信气泡徽章', price: 1800 },
      { _id: '2', title: '微信地球鼠标�?, price: 5800 },
      { _id: '3', title: '微信黄脸大贴�?, price: 500 }
    ],
  }
};
        `
      },
      {
        type: 'text',
        content: `保存文件后，�?{highlightText('cloudfunctions/quickstartFunctions')}目录右键，选择【上传并部署-云端安装依赖】，等待进度完成，即完成后端接口的开发与部署。`,
      },
      {
        type: 'image',
        content: 'function_deploy.png',
      },
      {
        type: 'text',
        content: `注：新用户部署时会提示创建云开发环境�?span style="color: red;">新用户可免费开通云开发环境并试用�?/span>`,
      },
      {
        type: 'image',
        content: 'create_env.png',
      },
      {
        type: 'text',
        content: `新用户开通环境后�?{highlightText('cloudfunctions')}目录右键，选择当前环境为新建的环境。`,
      },
      {
        type: 'image',
        content: 'env-select.png',
      },
    ],
    showJumpButton: false,
  },
  {
    id: '3',
    title: '小程序端调用后台接口',
    contents: [
      {
        type: 'text',
        content: `编辑列表�?{highlightText('miniprogram/pages/goods-list/index.js')}，在 Page 下新增一个方�?{highlightText('fetchGoodsList')}，用于调用后端接口，并在 Page �?{highlightText('onLoad')}生命周期调用该方法：`,
      },
      {
        type: 'code',
        content: `
async fetchGoodsList() {
  this.setData({ isLoading: true });
  const res = await wx.cloud.callFunction({
    name: 'quickstartFunctions',
    data: { type: 'fetchGoodsList' },
  });
  const goodsList = res?.result?.dataList || [];
  this.setData({
    isLoading: false,
    goodsList
  });
},
        `
      },
      {
        type: 'code',
        content: `
onLoad() {
  this.fetchGoodsList();
},
        `,
      },
      {
        type: 'text',
        content: `保存文件后，查看列表页，可以看到调用后台接口获取到了模拟数据并正确显示。`,
      },
      {
        type: 'image',
        content: 'list-scf.png',
      }
    ],
    showJumpButton: true,
  },
  {
    id: '4',
    title: '从数据库中读取真实数�?,
    contents: [
      {
        type: 'text',
        content: '前面步骤中，后台接口返回的是模拟数据，实际开发中，我们需要利用数据库实现持久存储，下面我们来通过云开发数据库能力实现这个效果�?,
      },
      {
        type: 'text',
        content: `点击开发者工具顶部的【云开发】按钮，打开云开发控制台，选中【数据库】，新增一个商品集合命�?{highlightText('goods')}，并添加若干条记录。注：本示例中，集合中的记录请保证具�?{highlightText('title')}�?{highlightText('price')}字段。`,
      },
      {
        type: 'image',
        content: 'scf-enter.png',
      },
      {
        type: 'image',
        content: 'database_add.png',
      },
      {
        type: 'text',
        content: `编辑后台接口代码${highlightText('cloudfunctions/quickstartFunctions/fetchGoodsList/index.js')}，用下面代码覆盖文件内容，用于读取数据库中数据：`,
      },
      {
        type: 'code',
        content: `
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  const result = await db.collection('goods')
    .skip(0)
    .limit(10)
    .get();
  return {
    dataList: result?.data,
  };
};
        `,
      },
      {
        type: 'text',
        content: `保存文件后，�?{highlightText('cloudfunctions/quickstartFunctions')}目录右键，选择【上传并部署-云端安装依赖】，重新部署后台接口。`,
      },
      {
        type: 'text',
        content: '查看页面，可以看到正确获取数据库中的数据并显示在列表中�?,
      },
      {
        type: 'image',
        content: 'list-database.png',
      }
    ],
    showJumpButton: true,
  },
  {
    id: '5',
    title: '调用开放接口生成小程序�?,
    contents: [
      {
        type: 'text',
        content: '实际小程序开发中，我们通常会对小程序进行传播分享。下面我们利用免鉴权的云调用能力实现小程序码�?,
      },
      {
        type: 'text',
        content: `编辑教程内置的接口文�?{highlightText('cloudfunctions/quickstartFunctions/genMpQrcode/index.js')}，用以下代码覆盖文件内容。该接口用于生成小程序码图片并上传到云存储保存。`,
      },
      {
        type: 'code',
        content: `
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  const pagePath = event.pagePath;
  // 获取小程序二维码的buffer
  const resp = await cloud.openapi.wxacode.get({
    path: pagePath,
  });
  const { buffer } = resp;
  // 将图片上传云存储空间
  const upload = await cloud.uploadFile({
    cloudPath: String(pagePath).replaceAll('/', '_') + '.png',
    fileContent: buffer
  });
  return upload.fileID;
};
        `,
      },
      {
        type: 'text',
        content: `保存文件后，�?{highlightText('cloudfunctions/quickstartFunctions')}目录右键，选择【上传并部署-云端安装依赖】，部署该接口。`,
      },
      {
        type: 'text',
        content: `编辑商品列表�?{highlightText('miniprogram/pages/goods-list/index.js')}，在 Page 配置中新增一个方�?{highlightText('generateMPCode')}，用于调用接口获取小程序码：`,
      },
      {
        type: 'code',
        content: `
async generateMPCode() {
  wx.showLoading();
  const resp = await wx.cloud.callFunction({
    name: 'quickstartFunctions',
    data: {
      type: 'genMpQrcode',
      pagePath: 'pages/goods-list/index',
    }
  });
  this.setData({ codeModalVisible: true, codeImageSrc: resp?.result });
  wx.hideLoading();
},
        `
      },
      {
        type: 'text',
        content: `保存文件后，在商品列表页点击【分享】按钮，会调�?{highlightText('generateMPCode')}方法获取小程序码并弹框显示。`,
      },
      {
        type: 'image',
        content: 'list-share.png',
      }
    ],
    showJumpButton: true,
  },
];

module.exports = {
  QuickStartPoints,
  QuickStartSteps,
}
