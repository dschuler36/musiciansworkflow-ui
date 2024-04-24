/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'
import axios from 'axios';
import vuetify from '@/plugins/vuetify'; 
// Components
import App from './App.vue'
import router from './router';

// Composables
import { createApp } from 'vue'

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

const app = createApp(App)
app.use(router);
app.use(vuetify);

registerPlugins(app)

app.mount('#app')
