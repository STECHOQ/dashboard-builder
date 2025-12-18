import router from '../../models/router.js';
import ui from '../../models/ui.js';
import { utils, hDate, hNumber } from '../../helper/index.js';


const tabName = `Tab_Pages`;

class EditorTabs extends HTMLElement {
	constructor(){
		super();
	}

	createTabContent(val){
		const self = this;

		const content = document.createElement('div');
		content.innerHTML = `Tab content ${val}`;
		return content;
	}

	createTab({ name, content, checked }, tabId){
		const self = this;

		const label = document.createElement('label');
		label.classList.add('tab');

		const input = document.createElement('input');
		input.setAttribute('type', 'radio');
		input.setAttribute('name', tabName);
		input.setAttribute('value', tabId);
		if(checked){
			input.setAttribute('checked', 'checked');
		}

		const title = document.createElement('div');
		title.innerText = name;

		const closeIcon = document.createElement('i');
		closeIcon.classList.add('fa-solid', 'fa-xmark');

		const btnClose = document.createElement('btn');
		btnClose.classList.add('btn', 'btn-circle', 'btn-xs', 'z-1', 'ml-5', 'btn-ghost');
		btnClose.append(closeIcon);

		label.append(input, title, btnClose)

		const tabContent = document.createElement('div');
		tabContent.classList.add('tab-content', 'bg-base-100', 'border-base-300', 'relative');

		tabContent.append(self.createNavBar());

		tabContent.append(content);
		self._tabsContent[tabId] = {
			name,
			input
		}

		btnClose.addEventListener('click', (e) => {
			e.preventDefault();

			// if current tab is opened, then open next tab 
			const active = document.querySelector(`input[name="${tabName}"]:checked`);

			label.remove();
			tabContent.remove();

			delete self._tabsContent[tabId];

			if(active?.value == tabId){
				const nextTab = document.querySelector(`input[name="${tabName}"]`);
				if(nextTab){
					nextTab.checked = true;
				}
			}
		})

		return {
			label, 
			tabContent
		};
	}

	clearTabs(){
		const self = this;

		self._tabs.innerHTML = '';
		self._tabsContent = {};

	}

	createTabs(){
		const self = this;

		self._tabs = document.createElement('div');
		self._tabs.classList.add('tabs', 'tabs-lift', 'w-full', 'h-full');

		/*self._tabsContent = {
			home: {
				name: "Home", 
				content: document.createElement('drawer-box'),
			},
			login: {
				name: "Login", 
				content: document.createElement('drawer-box'), 
				checked: true
			},
			404: {
				name: "404", 
				content: self.createTabContent(3),
			},
		}

		for(const tabId in self._tabsContent){
			const tab = self._tabsContent[tabId];

			const {label, tabContent} = self.createTab(tab, tabId);

			tabs.append(label, tabContent);
		}*/
		self._tabsContent = {};

		return self._tabs;
	}

	toggleNavbar(){
		const self = this;

		if(self._isOpen){

			self._tabs.querySelectorAll('.tab').forEach(element => {
				element.classList.remove('hidden');
			});

			self.querySelector('.navbar-toggle i').classList.add('fa-chevron-up');
			self.querySelector('.navbar-toggle i').classList.remove('fa-chevron-down');
		}else{

			self._tabs.querySelectorAll('.tab').forEach(element => {
				element.classList.add('hidden');
			});

			self.querySelector('.navbar-toggle i').classList.remove('fa-chevron-up');
			self.querySelector('.navbar-toggle i').classList.add('fa-chevron-down');
		}

		ui.emit('navbar-state', {
			state: !self._isOpen
		})

		self._isOpen = !self._isOpen;
	}

	createNavBar(){
		const self = this;

		const nav = document.createElement('nav');
		nav.classList.add('navbar-toggle', 'shadow');

		nav.addEventListener('click', () => {
			self.toggleNavbar();
		})

		self._navbarToggle = nav;

		nav.append(self.createCollapseButton());

		return nav;
	}

	createCollapseButton(){
		const button = document.createElement('button');
		button.classList.add('text-muted', 'm-0', 'p-0');
		button.setAttribute('type', 'button');

		const icon = document.createElement('i');
		icon.classList.add('fa-solid', 'fa-chevron-up', 'cursor-pointer');
		button.append(icon);

		return button;
	}

	connectedCallback(){
		const self = this;

		self._isOpen = false;

		self.append(self.createTabs());
		self.classList.add('w-full');

		self._listeners = {
			'open-page': ({ detail }) => {
				const { name, components } = detail;

				const tabId = utils.toKebabCase(name);

				// check if tab already exist 
				if(self._tabsContent[tabId]){
					self._tabsContent[tabId].input.checked = true;
					return;
				}

				// open tab
				const tabData = { 
					name: name, 
					content: document.createElement('drawer-box'), 
					checked: true
				}
				tabData.content.setAttribute('page-id', tabId);
				tabData.content.setData(components);

				const { label, tabContent } = self.createTab(tabData, tabId);

				self._tabs.append(label, tabContent);
			},
			'clear-tabs': () => {
				self.clearTabs();
			}
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
    'editor-tabs',
    EditorTabs
)
