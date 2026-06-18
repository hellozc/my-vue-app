import { createRouter, createWebHistory } from 'vue-router'

const Main = () => import('@/views/Main.vue')
const Login = () => import('@/views/Login.vue')
const LayoutEditorPage = () => import('@/views/system/LayoutEditorPage.vue')

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
    children: [
      {
        path: '/system/layout/editor/:id?',
        name: 'layoutEditor',
        component: LayoutEditorPage,
        meta: { title: '布局编辑器' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
