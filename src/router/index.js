import { createRouter, createWebHistory } from 'vue-router'
// 1. 컴포넌트들 임포트 (경로가 실제 파일 위치와 맞는지 꼭 확인!)
import ReptileList from '../components/ReptileList.vue'
import RegisterPage from '../views/RegisterPage.vue' 
import DetailPage from '../views/DetailPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: ReptileList
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage
  },
  {
    path: '/detail/:id', // 클릭한 개체의 ID를 주소로 넘기는 핵심 경로
    name: 'Detail',
    component: DetailPage
  }
]

const router = createRouter({
  // 주소창에 #이 붙지 않는 깔끔한 히스토리 모드
  history: createWebHistory(),
  routes
})

export default router