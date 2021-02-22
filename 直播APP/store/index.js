import Vue from 'vue'
import Vuex from 'vuex'

import $H from '../common/request.js';
import $C from '../common/config.js';
import io from '../common/uni-socket.io.js';

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		user: null,
		token: null,
		socket: null
	},
	actions: {
		// 链接socket
		connectSocket({state,dispatch}) {
			const S = io($C.socketUrl,{
				query:{},
				transports:['websocket'],
				timeout:5000
			})
			let onlineEvent = (e) => {
				uni.$emit('live', {
					type:'online',
					data:e
				})
			}
			
			let commentEvent = (e) => {
				uni.$emit('live', {
					type:'comment',
					data:e
				})
			}
			
			// 监听链接
			S.on('connect',() => {
				console.log('已连接')
				// socket.io唯一链接
				state.socket = S
				const { id }  = S
				S.on(id ,(e) => {
					let d = e.data
					if (d.action === 'error') {
						let msg = d.payload
						if (e.meta.notoast) {
							return
						}
						return uni.showToast({
							title:msg,
							icon:"none"
						})
					}
				})
				// 监听在线用户信息
				S.on('online',onlineEvent)
				// 监听评论
				S.on('comment',commentEvent)
			})
			// 移除监听事件
			const removeListener = () => {
				if (S) {
					S.removeListener('online',onlineEvent)
					S.removeListener('comment',commentEvent)
				}
			}
			// 监听失败
			S.on('error',() => {
				removeListener()
				state.socket = null
				console.log('连接失败')
			})
			// 断开链接
			S.on('disconnect',() => {
				removeListener()
				state.socket = null
				console.log('断开链接')
			})
		},
		authMethod ({ state }, callback){
			if (!state.token) {
				uni.showToast({
					title:"请先登录",
					icon:"none"
				})
				return uni.navigateTo({
					url:"/pages/login/login"
				})
			}
			callback()
		},
		//初始化用户登录状态
		initUser({state}) {
			let u = uni.getStorageSync('user')
			let t = uni.getStorageSync('token')
			if (u) {
				state.user = JSON.parse(u)
				state.token = t
			}
		},
		logout({state}) {
			$H.post('/logout',{},{
				token:true,
				toast:false
			})
			state.user = null
			state.token = null
			uni.removeStorageSync('user')
			uni.removeStorageSync('token')
		},
		login({state},user){
			state.user = user
			state.token = user.token
			uni.setStorageSync('user',JSON.stringify(user))
			uni.setStorageSync('token',user.token)
		},
		getUserInfo({state}) {
			$H.get('/user/info',{
				token:true,
				noJump:true,
				toast:false
			}).then(res=> {
				state.user = res
				uni.setStorage({
					key:'user',
					data:JSON.stringify(state.user)
				})
			})
		}
	}
})