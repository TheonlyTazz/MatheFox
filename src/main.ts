import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { primeSpeechVoices } from './composables/useSpeech'
import './styles.css'

primeSpeechVoices()
createApp(App).use(createPinia()).mount('#app')
