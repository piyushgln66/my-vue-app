import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import FirstComponent from './FirstComponent.vue'
import SecondComponent from './SecondComponent.vue'
import QuestionnaireComponent from './QuestionnaireComponent.vue'
import ResultsComponent from './ResultsComponent.vue'

const routes = [
  { path: '/', component: SecondComponent },
  { path: '/first', component: FirstComponent },
  { path: '/second', component: SecondComponent },
  { path: '/questionnaire', component: QuestionnaireComponent },
  { path: '/results', component: ResultsComponent }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
