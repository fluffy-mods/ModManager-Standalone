import Vue from 'vue'
import Router from 'vue-router'
import PathsView from './views/Paths.vue'
import ModlistView from './views/ModlistDetails.vue';
import RoadmapView from './views/Roadmap.vue';
import TeamView from './views/Team.vue';
import ModDetailsView from './views/ModDetails.vue';

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/modlists/active'
    },
    {
      path: '/options/paths',
      name: 'options.paths',
      component: PathsView
    },
    {
      path: '/options/preferences',
      name: 'options.preferences'
    },
    {
      path: '/modlist/:list',
      name: 'modlists',
      props: true,
      component: ModlistView
    },
    {
      path: '/mod/:identifier',
      name: 'mods',
      props: true,
      component: ModDetailsView
    },
    {
      path: '/about/roadmap',
      name: 'roadmap',
      component: RoadmapView
    },
    {
      path: '/about/team',
      name: 'team',
      component: TeamView
    }
  ]
})
