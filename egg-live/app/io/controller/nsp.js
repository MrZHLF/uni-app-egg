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
    const {
      ctx,
      app,
      service,
      helper
    } = this;
    const nsp = app.io.of('/');
    const message = ctx.args[0] || {};
    const socket = ctx.socket;
    const id = socket.id;

    const {
      live_id,
      token
    } = message;

    let user = await this.checkToken(token)
    if (!user) {
      return
    }

    // 验证当前直播间是否存在且是否处于开播中
    let msg = await service.live.checkStatus(live_id)
    if (msg) {
      console.log(msg, 'msg');
      socket.emit(id, ctx.helper.parseMsg('error', msg));
      return
    }

    const room = 'live_' + live_id
    // 用户加入
    console.log('#join', room);
    socket.join(room);

    const rooms = [room];
    // 在线列表
    // nsp.adapter.clients(rooms, (err, clients) => {
    //     console.log('#online_join', clients);
    // });

    // 加入存储中
    let list = await service.cache.get('userList_' + room);
    list = list ? list : [];
    list = list.filter(item => item.id !== user.id)
    list.unshift({
      id: user.id,
      name: user.nickname || user.username,
      avatar: user.avatar,
    })
    service.cache.set('userList_' + room, list)

    // 更新在线用户列表
    nsp.adapter.clients(rooms, (err, clients) => {
      console.log('#online_join', clients);
      nsp.to(room).emit('online', {
        clients,
        action: 'join',
        user: {
          id: user.id,
          name: user.nickname || user.username,
          avatar: user.avatar,
        },
        data: list
      });
    });

    // 加入播放历史记录
    let liveUser = await app.model.LiveUser.findOne({
      where: {
        user_id: user.id,
        live_id
      }
    })
    if (!liveUser) {
      app.model.LiveUser.create({
        user_id: user.id,
        live_id
      })
      // 总观看人数+1
      let live = await service.live.exist(live_id)
      live.increment({
        look_count: 1
      })
    }
  }

  // 直播间发送消息
  async comment() {
    const {
      ctx,
      app,
      service,
      helper
    } = this;
    const nsp = app.io.of('/');
    const message = ctx.args[0] || {};
    const socket = ctx.socket;
    const id = socket.id;

    const {
      live_id,
      data,
      token
    } = message;

    let user = await this.checkToken(token)
    if (!user) {
      return
    }

    try {
      // 验证当前直播间是否存在且是否处于开播中
      let msg = await service.live.checkStatus(live_id)
      if (msg) {
        socket.emit(id, ctx.helper.parseMsg('error', msg));
        return
      }

      const room = 'live_' + live_id
      // 推送消息到直播间
      nsp.to(room).emit('comment', {
        user: {
          id: user.id,
          name: user.nickname || user.username,
          avatar: user.avatar,
        },
        id: ctx.randomString(10),
        content: data
      });

      app.model.Comment.create({
        content: data,
        live_id,
        user_id: user.id
      })

    } catch (error) {
      app.logger.error(error);
    }
  }

  // 离开直播间
  async leaveLive() {
    const {
      ctx,
      app,
      service,
      helper
    } = this;
    const nsp = app.io.of('/');
    const message = ctx.args[0] || {};
    const socket = ctx.socket;
    const id = socket.id;

    const {
      live_id,
      token
    } = message;

    let user = await this.checkToken(token)
    if (!user) {
      return
    }

    // 验证当前直播间是否存在且是否处于开播中
    let msg = await service.live.checkStatus(live_id)
    if (msg) {
      socket.emit(id, ctx.helper.parseMsg('error', {
        notoast: true
      }));
      return
    }

    const room = 'live_' + live_id
    // 用户离开
    console.log('#leave', room);
    socket.leave(room);

    const rooms = [room];
    // 在线列表
    nsp.adapter.clients(rooms, (err, clients) => {
      console.log('#online_join', clients);

      // 更新在线用户列表
      nsp.to(room).emit('online', {
        clients,
        action: 'leave',
        user: {
          id: user.id,
          name: user.nickname || user.username,
          avatar: user.avatar,
        },
      });
    });

    let list = await service.cache.get('userList_' + room);
    if (list) {
      list = list.filter(item => item.id !== user.id)
      service.cache.set('userList_' + room, list)
    }
  }

}

module.exports = NspController;