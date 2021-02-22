'use strict';

const Controller = require('egg').Controller;

class NspController extends Controller {
  // 验证是否授权
  async checkToken(token) {
    let {
      ctx,
      app,
      service,
      helper
    } = this
    const nsp = app.io.of('/');
    const socket = ctx.socket;
    const id = socket.id;

    // 用户验证
    if (!token) {
      socket.emit(id, ctx.helper.parseMsg('error', '你没有权限访问该接口'))
      return false
    }

    // 根据token解密，换取用户信息
    let user = {}
    try {
      user = ctx.checkToken(token)
    } catch (error) {
      let fail = error.name === 'TokenExpiredError' ? 'token 已过期! 请重新获取令牌' : 'Token 令牌不合法!';
      socket.emit(id, ctx.helper.parseMsg('error'), fail)
      return false
    }

    // 判断当前用户是否登录
    let t = await ctx.service.cache.get('user_' + user.id)
    if (!t || t != token) {
      socket.emit(id, ctx.helper.parseMsg('error', 'Token 令牌不合法!'));
      return false
    }

    // 获取当前用户信息，验证当前用信息是否被禁用
    user = await app.model.User.findByPk(user.id)
    if (!user) {
      socket.emit(id, ctx.helper.parseMsg('error', '用户不存在或已被禁用'))
      return false
    }
    return user
  }
  // 进入直播间
  async joinLive() {
    let {
      ctx,
      app,
      service,
      helper
    } = this
    const nsp = app.io.of('/')
    // 前端传递过来参数
    const message = ctx.args[0] || {}

    //当前连接
    const socket = ctx.socket
    const id = socket.id


  }
}

module.exports = NspController;