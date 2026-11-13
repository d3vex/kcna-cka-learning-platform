import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/HomeView.vue'),
    meta: { title: 'Overview' },
  },
  {
    path: '/track/:trackId',
    name: 'track',
    component: () => import('./views/TrackView.vue'),
    meta: { title: 'Course' },
  },
  {
    path: '/track/:trackId/lesson/:lessonId',
    name: 'lesson',
    component: () => import('./views/LessonView.vue'),
    meta: { title: 'Lesson' },
  },
  {
    path: '/practice',
    name: 'practice',
    component: () => import('./views/PracticeView.vue'),
    meta: { title: 'Practice' },
  },
  {
    path: '/exam',
    name: 'exam-hub',
    component: () => import('./views/ExamHubView.vue'),
    meta: { title: 'Mock exams' },
  },
  {
    path: '/exam/:trackId',
    name: 'exam-runner',
    component: () => import('./views/ExamRunnerView.vue'),
    meta: { title: 'Exam simulator' },
  },
  {
    path: '/reference',
    name: 'reference',
    component: () => import('./views/ReferenceView.vue'),
    meta: { title: 'Reference library' },
  },
  {
    path: '/resources',
    name: 'resources',
    component: () => import('./views/ResourcesView.vue'),
    meta: { title: 'Official resources' },
  },
  {
    path: '/progress',
    name: 'progress',
    component: () => import('./views/ProgressView.vue'),
    meta: { title: 'My progress' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const title = to.meta.title ? `${to.meta.title} · D3vex Academy` : 'D3vex Academy'
  document.title = title
})

export default router
