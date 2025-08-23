import router from '../../models/router.js';
import ui from '../../models/ui.js';
import { utils, hDate, hNumber } from '../../helper/index.js';

class PageHome extends HTMLElement {
	constructor(){
		super();
	}

	createWrapper(){
		const self = this;
		const wrapper = document.createElement('div');
		//wrapper.classList.add('h-screen');

		const navbar = document.createElement('navigation-bar');
		wrapper.append(navbar);

		const wrapperContent = document.createElement('div');
		wrapperContent.classList.add('h-screen', 'flex');

		const sideBar = document.createElement('side-bar');
		wrapperContent.append(sideBar);

		const drawerBox = document.createElement('drawer-box');
		wrapperContent.append(drawerBox);

		wrapper.append(wrapperContent);
		return wrapper;
	}


	checkNotif(){
		const flag = ui.getFlag();
		if(flag?.notification){
			new Notify(flag.notification);
		}
	}

	connectedCallback(){
		const self = this;

		self.classList.add('page-agregat');

		window.onload = async () => {
			self.classList.add('show');
			ui.triggerUpdateScreen();
			await utils.sleep(300);	// to make sure that screen was ready

			self.checkNotif();
		}

		const wrapper = self.createWrapper();
		//~ self.createForm();

		self.append(wrapper);

		self._listeners = {
			'screen-resize': () => {

			},
			'sidebar-state': ({ detail }) => {
				const pageContent = self.querySelector('drawer-box');

				if(!detail.state){
					pageContent.classList.add('expand');
				}else{
					pageContent.classList.remove('expand');
				}
			},
		}

		for(let key in self._listeners){
			ui.addEventListener(key, self._listeners[key]);
		}
	}

	disconnectedCallback(){
		const self = this;

		for(let key in self._listeners){
			ui.removeEventListener(key, self._listeners[key]);
		}
	}
}

export default window.customElements.define(
    'page-home',
    PageHome
)
