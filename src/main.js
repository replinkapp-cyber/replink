import { createApp } from 'vue'
import { createPinia } from 'pinia' // 1. Pinia 가져오기
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
const pinia = createPinia() // 2. Pinia 인스턴스 생성

app.use(pinia)  // 3. 앱에 Pinia 등록 (router보다 먼저 해도 상관없음)
app.use(router) // 4. 라우터 등록

app.mount('#app')