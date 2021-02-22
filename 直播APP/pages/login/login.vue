<template>
	<view>
		<view class="flex align-center justify-center" style="height: 350rpx;">
			<text style="font-size: 50rpx;">YOU-LOGO</text>
		</view>
		<view class="px-3">
			<input type="text" v-model="form.username" class="bg-light px-3 mb-3 font" placeholder="请输入用户名" style="height: 120rpx;"/>
			<input type="text" v-model="form.password" class="bg-light px-3 mb-3 font" placeholder="请输入密码" style="height: 120rpx;"/>
			<input v-if="type !='login'" type="text" v-model="form.repassword" class="bg-light px-3 mb-3 font" placeholder="请输入密码" style="height: 120rpx;"/>
		</view>
		<view class="p-3 flex align-center justify-center">
			<view class="bg-main rounded p-3 flex justify-center align-center flex-1" hover-class="bg-main-hover" @click="submit">
				<text class="text-white font-md">{{type == 'login' ? '登录' : '注冊' }}</text>
			</view>
		</view>
		
		<view class="flex align-center justify-center" @click="changType">
			<text class="text-light-muted font p-2">{{type == 'login' ? '注册账号' : '去登录' }} </text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				type:'login',
				form: {
					username:"",
					password:"",
					repassword:""
				}
			}
		},
		methods: {
			changType(){
				this.type = this.type == 'login' ? 'reg' : 'login'
			},
			submit() {
				console.log(this.form)
				let msg = this.type == 'login' ? '登录' : '注册'
				this.$H.post('/'+this.type,this.form).then((res) =>{
					console.log(res,'55555')
					uni.showToast({
						title:msg+'成功',
						icon:"none"
					});
					
					if(this.type === 'reg') {
						this.changType()
						this.form = {
							username:"",
							password:"",
							repassword:""
						}
					} else {
						
						this.$store.dispatch('login',res)
						uni.navigateBack({
							delta:1
						})
					}
				})
			}
		}
	}
</script>

<style>

</style>
