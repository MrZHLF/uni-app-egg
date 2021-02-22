import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false
import $H from './common/request.js';

Vue.prototype.$H = $H

import store from 'store/index.js';


// 跳转验证
Vue.prototype.authJump = (options) => {
	if (!store.state.token) {
		uni.showToast({
			title:"请先登录",
			icon:"none"
		})
		return uni.navigateTo({
			url:"/pages/login/login"
		})
	}
	uni.navigateTo(options)
}

Vue.prototype.$store = store

App.mpType = 'app'

const app = new Vue({
	store,
    ...App
})
app.$mount()
