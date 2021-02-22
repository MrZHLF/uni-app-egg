<template>
	<view>
		
		<view class="flex align-center" v-if="!user">
			<view class="flex align-center justify-center" style="width: 180rpx;height: 180rpx;">
				<image src="../../static/gift/4.png" class="rounded-circle" style="width: 105rpx;height: 105rpx;"></image>
			</view>
			<view class="flex flex-column">
				<text class="font-md">未登录</text>
				<text class="font text-muted">登录体验更多功能</text>
			</view>
			
			<view class="ml-auto mr-3">
				<view class="border border-main rounded flex align-center justify-center p-2" hover-class="bg-light" @click="openLogin">
					<text class="text-main font">立即登录</text>
				</view>
			</view>
		</view>
		
		
		<view class="flex align-center" v-else>
			<view class="flex align-center justify-center" style="width: 180rpx;height: 180rpx;">
				<image :src="user.avatar" class="rounded-circle" style="width: 105rpx;height: 105rpx;"></image>
			</view>
			<view class="flex flex-column">
				<text class="font-md">{{user.username}}</text>
				<!-- <text class="font text-muted">{{user.}}</text> -->
			</view>
			
			<view class="ml-auto mr-3">
				<view class="border border-main rounded flex align-center justify-center p-2" hover-class="bg-light">
					<text class="text-main font">编辑资料</text>
				</view>
			</view>
		</view>
		<view class="f-divider"></view>
		
		<f-list-item title="我的金币" icon="iconfaxian" :shoeRight="false" @click="authJump({url: '/pages/coin/coin'})">
			<text class="text-muted font">{{ user ? user.coin : 0}}金币 立即充值</text>
		</f-list-item>
		
		<f-list-item title="我的直播" icon="iconfaxian">
			<text class="text-muted font">0</text>
		</f-list-item>
		<f-list-item title="我的关注" icon="iconfaxian">
			<text class="text-muted font">0</text>
		</f-list-item>
		<f-list-item title="历史记录" icon="iconfaxian"></f-list-item>
	</view>
</template>

<script>
	import fListItem from '../../components/common/f-list-item.vue';
	import { mapState } from 'vuex'
	export default {
		data() {
			return {
				
			}
		},
		components:{
			fListItem
		},
		computed:{
			...mapState({
				user:state => state.user
			})
		},
		onShow() {
			this.$store.dispatch('getUserInfo')
		},
		onNavigationBarButtonTap() {
			this.authJump({
				url:'../user-set/user-set'
			})
		},
		methods: {
			openLogin(){
				uni.navigateTo({
					url:'../login/login'
				})
			}
		}
	}
</script>

<style>

</style>
