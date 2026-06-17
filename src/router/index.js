import { createRouter, createWebHistory } from 'vue-router'

const Main = () => import('@/views/Main.vue')
const Login = () => import('@/views/Login.vue')

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录', public: true },
  },
  {
    path: '/',
    name: 'Main',
    component: Main,
    redirect: '/home',
    children: [],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
