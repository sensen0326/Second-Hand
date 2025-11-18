const API_BASE = wx.getStorageSync('API_BASE') || 'http://localhost:3000/api';

function request(method, url, data, params = {}) {
  return new Promise((resolve, reject) => {
    const query = Object.keys(params)
      .filter(k => params[k] !== undefined && params[k] !== null && params[k] !== '')
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join('&');
    const fullUrl = query ? `${API_BASE}${url}?${query}` : `${API_BASE}${url}`;
    wx.request({
      url: fullUrl,
      method,
      data,
      header: { 'content-type': 'application/json' },
      success: res => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: reject,
    });
  });
}

const command = {
  inc: value => ({ $inc: value })
};

function RegExpWrapper({ regexp, options }) {
  return { $regex: regexp, $options: options || '' };
}

class CollectionRef {
  constructor(name, filters = {}, options = {}) {
    this.name = name;
    this.filters = filters;
    this.options = options;
  }
  where(filters) {
    return new CollectionRef(this.name, { ...this.filters, ...filters }, this.options);
  }
  orderBy(field, order) {
    return new CollectionRef(this.name, this.filters, { ...this.options, sortField: field, sortOrder: order });
  }
  skip(n) {
    return new CollectionRef(this.name, this.filters, { ...this.options, skip: n });
  }
  limit(n) {
    return new CollectionRef(this.name, this.filters, { ...this.options, limit: n });
  }
  doc(id) {
    return new DocRef(this.name, id);
  }
  add({ data }) {
    return request('POST', `/${this.name}`, data);
  }
  async get() {
    const params = {};
    if (this.filters.status) params.status = this.filters.status;
    if (this.filters.category) params.category = this.filters.category;
    if (this.filters.id) params.ownerId = this.filters.id;
    if (this.filters.title && this.filters.title.$regex) {
      params.q = this.filters.title.$regex;
    }
    const limit = this.options.limit || 10;
    const skip = this.options.skip || 0;
    params.pageSize = limit;
    params.page = Math.floor(skip / limit) + 1;
    Object.entries(this.filters).forEach(([key, val]) => {
      if (params[key] !== undefined) return;
      if (val && typeof val === 'object') return;
      params[key] = val;
    });
    if (this.options.sortField) {
      params.sortField = this.options.sortField;
      params.sortOrder = (this.options.sortOrder || '').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    }
    const res = await request('GET', `/${this.name}`, null, params);
    // 标准化返回体，兼容云开发 res.data
    return { data: res.data || res };
  }
}

class DocRef {
  constructor(name, id) {
    this.name = name;
    this.id = id;
  }
  async get() {
    const res = await request('GET', `/${this.name}/${this.id}`);
    return { data: res };
  }
  update({ data }) {
    const payload = {};
    Object.keys(data || {}).forEach(key => {
      const val = data[key];
      if (val && typeof val === 'object' && val.$inc !== undefined) {
        if (key === 'hit') {
          payload.hitIncrement = val.$inc;
        }
      } else {
        payload[key] = val;
      }
    });
    return request('PUT', `/${this.name}/${this.id}`, payload);
  }
  remove() {
    return request('DELETE', `/${this.name}/${this.id}`);
  }
}

function database() {
  const db = {
    collection: name => new CollectionRef(name),
    command,
    RegExp: RegExpWrapper,
  };
  return db;
}

module.exports = {
  database,
  command,
  RegExp: RegExpWrapper,
};
