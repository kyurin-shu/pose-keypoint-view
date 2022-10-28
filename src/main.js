import { createApp } from 'vue'
import App from './App.vue'
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

import './assets/main.css'

Amplify.configure(awsExports);

createApp(App).mount('#app')