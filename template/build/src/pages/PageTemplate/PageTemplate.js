import router from '../../models/router.js';
import ui from '../../models/ui.js';

class PageTemplate extends HTMLElement {
	constructor(){
		super();
	}

	createWrapper(){
		const self = this;
		const wrapper = document.createElement('div');
		wrapper.classList.add('h-screen');

		const items = 
		COMPONENTS_ARRAY

		const drawerBox = document.createElement('drawer-box');
		drawerBox.setData(items);
		wrapper.append(drawerBox);

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

		const wrapper = self.createWrapper();

		self.append(wrapper);
	}

	disconnectedCallback(){
		const self = this;
	}
}

export default window.customElements.define(
    'page-template',
    PageTemplate
)
