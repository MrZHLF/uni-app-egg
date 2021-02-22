'use strict';

const Controller = require('egg').Controller;

class LiveController extends Controller {
  // 直播间是否存在
  async exist(id) {
    return this.app.model.Live.findOne({
      where: {
        id
      }
    })
  }
  // 是否出去开播
  async checkStatus(id) {
    let live = await this.exist(id)
    if (!live) {
      return '直播间不存在'
    }
    if (live.status == 0) {
      return '直播间未开播'
    }
    if (live.status == 3) {
      return '直播间已经结束'
    }
    return false
  }
}

module.exports = LiveController;