'use strict';

const Controller = require('egg').Controller;

class ManagerController extends Controller {
  //列表
  async index() {
    let { ctx,app } = this
    let data = await ctx.page('Manager')
    await ctx.renderTemplate({
      title:"管理员列表",
      tempType: "table",
      table: {
        // 按钮
        buttons: {
          add: "/admin/manager/create"
        },
        // 表头
        columns: [{
          title: '管理员',
          fixed: 'left',
          key: "username"
        }, {
            title: '创建时间',
            key: 'created_time',
            width: 180,
            fixed: 'center'
        }, {
            title: "操作",
            width: 200,
            fixed: 'center',
            action:{
                edit:function(id){
                    return `/admin/manager/edit/${id}`
                },
                delete:function(id){
                    return `/admin/manager/delete/${id}`
                },
            }
        }],
      },
      data
    })

  }
  //创建管理员表单
  async create() {
    const { ctx, app } = this;
        // 渲染公共模板
    await ctx.renderTemplate({
      // 页面标题
      title: "创建管理员",
      // 模板类型 form表单，table表格分页
      tempType: "form",
      // 表单配置
      form: {
          // 提交地址
          action: "/admin/manager",
          // 字段配置
          fields:[{
              label: "用户名",
              type: "text",
              name: "username",
              placeholder: "用户名",
              // default:"默认值"
          }, {
              label: "密码",
              type: "text",
              name: "password",
              placeholder: "密码"
          }]
      },
      // 新增成功跳转路径
      successUrl:"/admin/manager"
    })
  }

  async save() {
    let { ctx,app } = this
    ctx.validate({
      username: {type:"string",required:true,desc:"管理员账户"},
      password:{type:"string",required:true,desc:"密码"},
    })
    let {username,password} = ctx.request.body
    if(await app.model.Manager.findOne({
      where:{
        username
      }
    })) {
      return ctx.apiFail('该管理员已存在')
    }
    let manage = await app.model.Manager.create({
      username,password
    })
    ctx.apiSuccess(manage)
  }

  // 删除管理员
  async delete() {
    let {ctx,app} = this
    const id = ctx.params.id
    await app.model.Manager.destroy({
      where:{
        id
      }
    })
    ctx.toast('删除成功','success')
    ctx.redirect(`/admin/manager`);
  }


  // 更新逻辑
    async edit(){
        const { ctx, app } = this;
        const id = ctx.params.id
        let data = await app.model.Manager.findOne({
            where:{
                id
            }
        })
        if(!data){
            return await ctx.pageFail('该记录不存在')
        }

        data = JSON.parse(JSON.stringify(data))
        delete data.password

        await ctx.renderTemplate({
            id:ctx.params.id,
            title: "修改管理员",
            tempType: "form",
            form: {
                // 提交地址
                action: "/admin/manager/" + ctx.params.id,
                fields:[{
                  label: "用户名",
                  type: "text",
                  name: "username",
                  placeholder: "用户名",
                }, {
                    label: "密码",
                    type: "text",
                    name: "password",
                    placeholder: "密码"
                }],
                data
            },
            // 修改成功跳转路径
            successUrl:"/admin/manager"
        })
    }
    // 更新逻辑
    async update(){
        const { ctx, app } = this;
        ctx.validate({
            id:{
                type:"int",
                required:true
            },
            username:{
                type:"string",
                required:true
            },
            password:{
                type:"string",
            },
        })
        const id = ctx.params.id
        const { username,password } = ctx.request.body
        // 用户名是否被使用
        const Op = app.Sequelize.Op;
        if(await app.model.Manager.findOne({
            where:{
                id:{
                    [Op.ne]: id,
                },
                username
            }
        })){
            return ctx.apiFail('该用户名已存在')
        }
        // 当前管理员是否存在
        let manager = await app.model.Manager.findOne({
            where:{
                id
            }
        })
        if(!manager){
            return ctx.apiFail('该记录不存在')
        }

        manager.username = username
        if(password){
            manager.password = password
        }
        ctx.apiSuccess(await manager.save())
    }
}

module.exports = ManagerController;
