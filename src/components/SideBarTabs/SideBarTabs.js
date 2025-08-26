import ui from '../../models/ui.js';

export default window.customElements.define(
    'side-bar-tabs',
    class extends HTMLElement {
        constructor(){
            super();
		}

		createTabContent(val){
			const self = this;

			const content = document.createElement('div');
			content.innerHTML = `Tab content ${val}`;
			return content;
		}

		createTabs(){
			const self = this;

			const tabs = document.createElement('div');
			tabs.classList.add('tabs', 'tabs-lift', 'tabs-bottom', 'rotate-90', 'origin-top-left', 'translate-x-73');

			const tabName = `Tab_Menu`;

			const tabsContent = [
				{name: "Tab 1", content: self.createTabContent(1), checked: true},
				{name: "Tab 2", content: self.createTabContent(2)},
				{name: "Tab 3", content: self.createTabContent(3)},
			]

			for(const tab of tabsContent){
				const input = document.createElement('input');
				input.setAttribute('type', 'radio');
				input.classList.add('tab');
				input.setAttribute('aria-label', tab.name);
				input.setAttribute('name', tabName);
				if(tab.checked){
					input.setAttribute('checked', 'checked');
				}

				const tabContent = document.createElement('div');
				tabContent.classList.add('tab-content', 'bg-base-100', 'border-base-300', 'p-1');

				const tabContentWrapper = document.createElement('div');
				tabContentWrapper.classList.add('origin-bottom-left', 'h-full', 'rotate-270', 'translate-x-60');
				tabContent.append(tabContentWrapper);

				const actualContentWrapper = document.createElement('div');
				actualContentWrapper.classList.add('tab-actual-content');
				tabContentWrapper.append(actualContentWrapper);

				actualContentWrapper.append(tab.content);

				tabs.append(input, tabContent);
			}

			return tabs;
		}

        connectedCallback(){
            const self = this;

            self._isOpen = true;
			self._navbarToggle;

			self.append(self.createTabs());

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
