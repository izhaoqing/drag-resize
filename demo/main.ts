import { createApp } from 'vue';
import DragResize from '../src/main';
import App from './App.vue';

// import '@unocss/reset/tailwind.css';
// 'uno:[layer-name].css'
import 'uno:components.css';
// layers that are not 'components' and 'utilities' will fallback to here
import 'uno.css';
// "utilities" layer will have the highest priority
import 'uno:utilities.css';

const app = createApp(App);
app.component('DragResize', DragResize);
app.mount('#app');
