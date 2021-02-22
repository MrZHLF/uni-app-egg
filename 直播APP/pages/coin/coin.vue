<template>
	<view class="border-top border-light-secondary p-3">
		<view class="rounded py-4 flex flex-column align-center justify-center bg-main">
			<text class="text-white font-sm mb-2">当前金币</text>
			<text class="font-weight-bold text-white" style="font-size: 60rpx;">50</text>
		</view>
		<view class="border-top border-light-secondary my-3"></view>
		
		<view>
			<text class="font-sm text-muted">请选择重置金币</text>
		</view>
		<view class="flex flex-wrap" style="margin-left: -20rpx;margin-right: -20rpx;">
			<view style="width: 33.3%;box-sizing: border-box;" class="p-2" v-for="(item,index) in list" :key="index" @click="chooseCoin(index)">
				
				<view v-if="item.price > 0" style="height: 130rpx;" class="rounded flex flex-column align-center justify-center border" :class="activeIndex === index ? 'border-main' : ''"> 
					<view class="flex align-center">
						<text class="iconfont text-warning mr-1">&#xe633;</text>
						<text class="font-md font-weight-bold">{{item.coin}}</text>
					</view>
					<text class="font text-light-muted">￥{{item.price}}</text>
				</view>
				
				<view v-else style="height: 130rpx;" class="rounded flex flex-column align-center justify-center border">
					<text class="font text-light-muted">自定义</text>
				</view>
				
			</view>
		</view>
		
		<view class="position-fixed left-0 bottom-0 right-0 border-top flex px-3 align-center" style="height: 100rpx;">
			<view class="flex align-center">
				<text class="iconfont text-warning mr-1">&#xe633;</text>
				<text class="font-md font-weight-bold">{{price}}</text>
			</view>
			<view class="bg-main rounded flex justify-center align-center ml-auto" style="width: 150rpx;height: 70rpx;" @click="pay">
				<text class="text-white font-md">去充值</text>
			</view>
		</view>
		
		<uni-popup ref="popup" type="dialog">
			<uni-popup-dialog mode="input" message="自定义充值" :duration="2000" placeholder="充值金额" inputType="number" :before-close="true" @close="close" @confirm="confirm"></uni-popup-dialog>
		</uni-popup>
		
	</view>
</template>

<script>
	import uniPopup from '@/components/uni-ui/uni-popup/uni-popup.vue';
	import uniPopupDialog from '@/components/uni-ui/uni-popup/uni-popup-dialog.vue';
	export default {
		components:{
			uniPopup,
			uniPopupDialog
		},
		data() {
			return {
				list:[
					{coin:10,price:10},
					{coin:20,price:20},
					{coin:30,price:30},
					{coin:50,price:50},
					{coin:100,price:100},
					{price:0}
				],
				activeIndex:0,
				price:0
			}
		},
		onLoad() {
			let p = this.list[this.activeIndex].price
			if(p > 0) {
				// 选中价格
				this.price = p
			} 
		},
		methods: {
			pay() {
				console.log(2)
				// 微信支付
				this.$H.post('/ift/wxpay',{
					price: this.price
				},{
					token:true
				}).then(orderInfo => {
					console.log(orderInfo)
					uni.requestPayment({
						provider:"wxpay",
						orderInfo:orderInfo,
						success: (res) => {
							this.$store.dispatch('getUserInfo')
							uni.showToast({
								title:"充值成功",
								icon:"none"
							})
							uni.navigateBack({
								delta:1
							})
							console.log(res,'支付')
						},
						fail: (err) => {
							uni.showModal({
								title:'提示',
								content:"支付失败",
								showCancel:false
							})
							console.log(err,'支付失败')
						}
					})
				}).catch(err=> {
					console.log(err)
				})
			},
			close(done) {
				// TODO 做一些其他的事情，before-close 为true的情况下，手动执行 done 才会关闭对话框
				// ...
				done()
			},
			confirm(done, value) {
				console.log(value);
				if(!value) {
					uni.showToast({
						title:"请输入要充值的金额",
						icon:"none"
					})
				}
				this.price = value
				done()
			},
			chooseCoin(index) {
				this.activeIndex = index
				if(this.list[index].price) {
					// 选中价格
					this.price = this.list[index].price
				} else {
					//自定义价格
					this.$refs.popup.open()
				}
			},
		}
	}
</script>

<style>

</style>
