/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

import { registerPlugins } from '@/plugins'
import 'typeface-roboto';
import 'typeface-open-sans';
import '@/assets/styles/styles.scss'

import App from './App.vue'

import { createApp } from 'vue'
const app = createApp(App)

registerPlugins(app)
app.mount('#app')


