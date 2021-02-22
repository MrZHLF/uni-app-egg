'use strict';

const Controller = require('egg').Controller;

class GiftController extends Controller {
  // 列表
  async index() {
    const {
      ctx,
      app
    } = this;

    let data = await ctx.page('Gift')

    await ctx.renderTemplate({
      title: "礼物列表",
      tempType: "table",
      table: {
        // 按钮
        buttons: {
          // 新增操作
          add: "/admin/gift/create"
        },
        // 表头
        columns: [{
          title: "礼物",
          fixed: 'left',
          render(item) {
            console.log(item.image,'44')
            let image = item.image ? item.image : '/public/assets/img/profiles/avatar-03.jpg'
            return `
              <h2 class="table-avatar">
                  <a href="profile.html" class="avatar avatar-sm mr-2"><img class="avatar-img rounded-circle" src="${image}"></a>
                  <a href="profile.html">${item.name}</a>
              </h2>
              `
          }
        }, {
          title: "金币",
          fixed: 'center',
          key: "coin"
        }, {
          title: "创建时间",
          fixed: 'center',
          width: 180,
          key: "created_time"
        }, {
          title: "操作",
          width: 200,
          fixed: 'center',
          action: {
            edit: function (id) {
              return `/admin/gift/edit/${id}`
            },
            delete: function (id) {
              return `/admin/gift/delete/${id}`
            },
          }
        }]
      },
      data
    })
  }
  // 创建表单
  async create() {
    const {
      ctx,
      app
    } = this;
    await ctx.renderTemplate({
      title: "创建礼物",
      tempType: "form",
      form: {
        // 提交地址
        action: "/admin/gift",
        fields: [{
            label: "礼物名称",
            type: "text",
            name: "name",
            placeholder: "礼物名称",
          }, {
            label: "礼物图标",
            type: "file",
            name: "image",
          },
          {
            label: "金币",
            type: "number",
            name: "coin",
            default: 0
          }
        ]
      },
      // 新增成功跳转路径
      successUrl: "/admin/gift"
    })
  }

  async save() {
    const {
      ctx,
      app
    } = this;

    // 参数验证
    ctx.validate({
      name: {
        type: 'string',
        required: true,
        desc: '礼物名称'
      },
      image: {
        type: "string",
      },
      coin: {
        type: "int",
      }
    });
    let {
      name,
      image,
      coin
    } = ctx.request.body;

    // 创建礼物
    let gift = await app.model.Gift.create({
      name,
      image,
      coin
    });
    if (!gift) {
      ctx.throw(400, '创建礼物失败');
    }
    ctx.apiSuccess(gift);
  }

  // 修改表单
  async edit() {
    let { ctx,app }= this
    let id = ctx.params.id
    let data = await app.model.Gift.findOne({
      where:{
        id
      }
    })
    if(!data) {
      return await ctx.pageFail('该记录不存在')
    }
    data = JSON.parse(JSON.stringify(data))
    await ctx.renderTemplate({
      id:ctx.params.id,
      title: "修改礼物",
      tempType: "form",
      form: {
        // 提交地址
        action: "/admin/gift/" + ctx.params.id,
        fields:[{
            label: "礼物名称",
            type: "text",
            name: "name",
            placeholder: "礼物名称",
        }, {
            label: "礼物图标",
            type: "file",
            name: "image",
        },
        {
            label: "金币",
            type: "number",
            name: "coin",
            default: 0
        }],
        data
      },
      // 新增成功跳转路径
      successUrl:"/admin/gift"
    })
  }
  // 更新表单
  async update() {
    let { ctx,app } = this
    ctx.validate({
      id:{
          type:"int",
          required:true
      },
      name:{
          type:"string",
          required:true
      },
      image:{
          type:"string",
      },
      coin:{
          type:"int",
      }
    })
    let id = ctx.params.id
    let { name,image,coin } = ctx.request.body
    // 当前管理员是否存在
    let gift = await app.model.Gift.findOne({
      where:{id}
    })
    if(!gift) {
      return ctx.apiFail('该记录不存在')
    }
    gift.name = name
    gift.image = image
    gift.coin = coin
    ctx.apiSuccess(await gift.save())
  }

  // 删除礼物
  async delete() {
    let { ctx,app } = this
    let id = ctx.params.id
    await app.model.Gift.destroy({
      where:{id}
    })
    ctx.toast('删除成功','success')
    ctx.redirect(`/admin/gift`);
  }

}

module.exports = GiftController;
