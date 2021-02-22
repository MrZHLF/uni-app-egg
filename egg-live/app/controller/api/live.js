'use strict';

const Controller = require('egg').Controller;
const md5 = require('md5');
class LiveController extends Controller {
  async save() {
    let {
      ctx,
      app
    } = this
    let user_id = ctx.authUser.id
    // 参数验证
    ctx.validate({
      title: {
        type: 'string',
        required: true,
        desc: '直播间标题'
      },
      cover: {
        type: 'string',
        required: true,
        desc: '直播间封面'
      }
    });
    let {
      title,
      cover
    } = ctx.request.body

    // 生成唯一key
    let key = ctx.randomString(20)
    // 创建
    let user = await app.model.Live.create({
      title,
      cover,
      key,
      user_id
    })
    // 生成签名
    let sign = this.sign(key)
    ctx.apiSuccess({
      data: user,
      sign
    })
  }
  sign(key) {
    let {
      ctx,
      app
    } = this;
    const secret = app.config.mediaServer.auth.secret
    const expire = parseInt((Date.now() + 100000000) / 1000)
    const hashValue = md5(`/live/${key}-${expire}-${secret}`)
    return `${expire}-${hashValue}`
  }

  // 修改直播间状态
  async changestatus() {
    let {
      ctx,
      app
    } = this
    let user_id = ctx.authUser.id
    // 参数验证
    ctx.validate({
      id: {
        type: 'int',
        required: true,
        desc: '直播间ID'
      },
      type: {
        type: 'string',
        required: true,
        range: {
          in: ['play', 'pause', 'stop']
        }
      }
    })
    let {
      id,
      type
    } = ctx.request.body
    let live = await app.model.Live.findOne({
      where: {
        id,
        user_id
      }
    })

    if (!live) {
      return ctx.apiFail('改直播间不存在')
    }

    if (live.status === 3) {
      return ctx.apiFail('直播间已结束')
    }

    const status = {
      play: 1,
      pause: 2,
      stop: 3
    }

    live.status = status[type]
    await live.save()
    return ctx.apiSuccess('ok')
  }

  //直播间列表
  async list() {
    let {
      ctx,
      app
    } = this
    ctx.validate({
      page: {
        required: true,
        desc: "页码",
        type: "int"
      }
    });
    let rows = await ctx.page('Live');
    ctx.apiSuccess(rows);
    // let page = ctx.params.page
    // let limit = 10
    // let offset = (page - 1) * limit
    // let rows = await app.model.Live.findAll({
    //   limit,
    //   offset
    // })
    // ctx.apiSuccess(rows)
  }
  // 查看指定直播间
  async read() {
    let {
      ctx,
      app
    } = this
    // 参数验证
    ctx.validate({
      id: {
        required: true,
        desc: "直播间ID",
        type: "int"
      }
    })
    let id = ctx.params.id
    let live = await app.model.Live.findOne({
      where: {
        id
      },
      include: [{
        model: app.model.User,
        attributes: ['id', 'username', 'avatar']
      }]
    })
    if (!live) {
      return ctx.apiFail('当前直播不存在')
    }
    // 生成签名
    let sign = this.sign(live.key)
    live = JSON.parse(JSON.stringify(live))
    ctx.apiSuccess({
      data: live,
      sign
    })
  }
}

module.exports = LiveController;