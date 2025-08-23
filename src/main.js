// PLEASE DON'T CHANGE EVERYTHING BETWEEN '/* ... */' blabla '/* end of ... */'

/* js components */
import './components/DrawerBox/DrawerBox.js';
import './components/EditorBox/EditorBox.js';
import './components/NavigationBar/NavigationBar.js';
import './components/SideBar/SideBar.js';
import './pages/Page404/Page404.js';
import './pages/PageHome/PageHome.js';
import './pages/PageLogin/PageLogin.js';
/* end of js components */

/* js components plugin */
/* end of js components plugin */

import router from './models/router.js';

const rawMainEl = document.getElementsByTagName('main-element');
const main = rawMainEl[0];

const routes = {
	'/': {
		redirect: '/home'
	},

	/* generated routes */
	'/404': { component: 'page-404' },
	'/home': { component: 'page-home' },
	'/login': { component: 'page-login' },
	/* end of generated routes */
}

// if route change, then
const pathChange = (value) => {

	// check if redirect
	if(routes[value.to]?.redirect){
		router.go(routes[value.to]?.redirect);
		return;
	}
}

router.init(main, routes, pathChange);
