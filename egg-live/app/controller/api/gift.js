'use strict';

const Controller = require('egg').Controller;

class GiftController extends Controller {
  // 礼物列表

  async list() {
    let {
      ctx,
      app
    } = this
    ctx.apiSuccess(await app.model.Gift.findAll())
  }

  // 微信支付
  async wxpay() {
    let {
      ctx,
      app
    } = this
    let user_id = ctx.authUser.id
    // 参数验证
    ctx.validate({
      price: {
        type: 'init',
        required: true,
        desc: '重置费用'
      }
    })

    const {
      price
    } = ctx.request.body
    if (price < 1) {
      return ctx.apiFail('至少充值1元')
    }
    // 创建订单
    let no = ctx.randomString(20)
    let order = await app.model.Order.create({
      no,
      user_id,
      price
    })
    if (!order) {
      return ctx.apiFail('创建订单失败')
    }
    const result = await app.tenpay.getAppParams({
      out_trade_no: no,
      body: '支付测试',
      total_fee: price * 100,
      trade_type: "APP"
    })
    ctx.apiSuccess(result)
  }

  async notify() {
    // 支付回调
    const {
      ctx,
      app,
      server
    } = this
    let info = ctx.request.weixin;
    if (!info || info.result_code !== 'SUCCESS') {
      return ctx.reply('支付失败')
    }
    // 查询当前订单
    let order = await app.model.Order.findOne({
      where: {
        no: out_trade_no
      }
    })
    if (!order) {
      return ctx.reply('订单不存在')
    }
    // 修改订单状态
    order.status = 'success'
    order.save()

    // 修改用户余额
    let user = await server.user.exist(order.user_id)
    if (user) {
      user.coin += parseInt(info.total_fee) / 100
      user.save()
    }

    // 回复消息
    ctx.reply()
  }
}

module.exports = GiftController;