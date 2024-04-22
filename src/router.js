import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/components/Home.vue'; // Adjust the path if Home.vue is indeed in the views folder
import Tracks from '@/components/Tracks.vue'; // Adjust accordingly
import TrackDetail from './components/TrackDetail.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/tracks',
    name: 'Tracks',
    component: Tracks
  },
  {
    path: '/tracks/:trackId',
    name: 'TrackDetail',
    component: TrackDetail
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;