import ui from '../../models/ui.js';
import { utils } from '../../helper/index.js';
import components from '../../models/constants/components.js';

export default window.customElements.define(
    'tab-components',
    class extends HTMLElement {
        constructor(){
            super();
		}

		createComponent(component){
			const self = this;

			const item = document.createElement('li');
			item.classList.add('bg-base-100', 'shadow-sm');

			const itemLink = document.createElement('div');
			itemLink.classList.add('page-item', 'h-[50px]', 'flex', 'items-center');

			itemLink.innerText = component.name;

			itemLink.addEventListener('click', () => {
				const openedTab = document.querySelector(`input[name="Tab_Pages"]:checked`);

				ui.emit('drawer-createComponent', {
					pageId: openedTab.value,
					component: component.component
				});
			})

			item.append(itemLink);

			return item;
		}

		createWrapper(){
			const self = this;

			const wrapper = document.createElement('div');
			wrapper.classList.add('h-full', 'w-full', 'overflow-y-auto');

			const list = document.createElement('ul');
			list.classList.add('menu', 'w-full');

			for(const component of components){
				list.append(self.createComponent(component));
			}

			wrapper.append(list);

			return wrapper;
		}

        connectedCallback(){
            const self = this;
            
            self.append(self.createWrapper());

			self._listeners = {
			}

			for(let key in self._listeners){
				ui.addEventListener(key, self._listeners[key]);
			}
        }

        disconnectedCallback(){
            const self = this;
        }
	}
)
