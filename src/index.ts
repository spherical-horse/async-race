import Store from './store/store';
import App from './application/app';
import EventBus from './observers/eventBus';
import Router from './router/router';

new App(new Store(), new EventBus(), new Router()).start();
