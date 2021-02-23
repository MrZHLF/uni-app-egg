'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const {
    router,
    controller,
    io
  } = app;
  router.get('/admin', controller.admin.home.index);

  // 管理员
  router.get('/admin/manager/delete/:id', controller.admin.manager.delete);
  router.get('/admin/manager/edit/:id', controller.admin.manager.edit);
  router.get('/admin/manager', controller.admin.manager.index);
  router.get('/admin/manager/create', controller.admin.manager.create);
  router.post('/admin/manager', controller.admin.manager.save);
  router.post('/admin/manager/:id', controller.admin.manager.update);

  // 登录
  router.get('/admin/login', controller.admin.home.login);
  router.post('/admin/loginevent', controller.admin.home.loginevent);
  router.get('/admin/logout', controller.admin.home.logout);


  // 用户管理
  router.get('/admin/user/delete/:id', controller.admin.user.delete);
  router.get('/admin/user/edit/:id', controller.admin.user.edit);
  router.get('/admin/user', controller.admin.user.index);
  router.get('/admin/user/create', controller.admin.user.create);
  router.post('/admin/user/:id', controller.admin.user.update);
  router.post('/admin/user', controller.admin.user.save);

  // 礼物模块
  router.get('/admin/gift/delete/:id', controller.admin.gift.delete);
  router.get('/admin/gift', controller.admin.gift.index);
  router.get('/admin/gift/create', controller.admin.gift.create);
  router.get('/admin/gift/edit/:id', controller.admin.gift.edit);
  router.post('/admin/gift', controller.admin.gift.save);
  router.post('/admin/gift/:id', controller.admin.gift.update);

  // 上传文件
  router.post('/admin/upload', controller.admin.common.upload);

  // 订单管理
  router.get('/admin/order/delete/:id', controller.admin.order.delete);
  router.get('/admin/order', controller.admin.order.index);

  // 直播间管理
  router.get('/admin/live', controller.admin.live.index); //直播间列表
  router.get('/admin/live/look/:id', controller.admin.live.look); //观看记录
  router.get('/admin/live/gift/:id', controller.admin.live.gift); //直播间礼物
  router.get('/admin/live/comment/:id', controller.admin.live.comment); //弹幕记录
  router.get('/admin/live/close/:id', controller.admin.live.close); //关闭直播间
  router.get('/admin/live/delete/:id', controller.admin.live.delete); //删除直播间


  // 用户注册
  router.post('/api/reg', controller.api.user.reg);
  // 用户登录
  router.post('/api/login', controller.api.user.login);
  // 退出登录
  router.post('/api/logout', controller.api.user.logout)
  //获取当前用户信息
  router.get('/api/user/info', controller.api.user.info);
  // 创建直播间
  router.post('/api/live/create', controller.api.live.save);
  // 修改直播间状态
  router.post('/api/live/changestatus', controller.api.live.changestatus);
  // 直播间列表
  router.get('/api/live/list/:page', controller.api.live.list);
  // 查看直播间
  router.get('/api/live/read/:id', controller.api.live.read);


  router.post('/api/gift/wxpay', controller.api.gift.wxpay); //微信支付
  router.post('/api/gift/notify', controller.api.gift.notify); //支付回调
  router.get('/api/gift/list', controller.api.gift.list); //礼物列表
  router.post('/api/upload', controller.api.common.upload); //上传


  io.of('/').route('comment', io.controller.nsp.comment);
  io.of('/').route('joinLive', io.controller.nsp.joinLive);
  io.of('/').route('leaveLive', io.controller.nsp.leaveLive);
  io.of('/').route('gift', io.controller.nsp.gift);
};