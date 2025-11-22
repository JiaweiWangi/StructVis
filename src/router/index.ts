import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path:'/graph',
      name:'Graph',
      component:()=>import('../graph/GraphVisualizer.vue'),
    },
    {
      path:'/sort',
      name:'Sort',
      component:()=>import('../sort/SortVisualizer.vue'),
    }
  ],
})

export default router
