import router from '../../models/router.js';
import ui from '../../models/ui.js';
import { utils, hDate, hNumber } from '../../helper/index.js';

class RightClickMenu extends HTMLElement {
	constructor(){
		super();
	}

	createMenuItem(name){
		const self = this;

		const item = document.createElement('li');
		const link = document.createElement('a');
		link.innerText = name;
		item.append(link);

		return item;
	}

	createRightClickMenu(){
		const self = this;

		const menu = document.createElement('div');
		menu.id = 'right-click-menu';
		menu.classList.add('menu', 'bg-base-100', 'shadow-lg', 'rounded-box', 'absolute', 'z-50');
		const list = document.createElement('ul');
		list.classList.add('menu', 'w-full', 'p-0');
		menu.append(list);

		self._rightClickItems = {
			drawerCreateComponent: self.createMenuItem('Create Component'),
			drawerCreateGroup: self.createMenuItem('Create Group'),
			drawerEdit: self.createMenuItem('Edit'),
			drawerDelete: self.createMenuItem('Delete'),
			drawerDuplicate: self.createMenuItem('Duplicate'),
			pageRename: self.createMenuItem('Rename'),
			pageDelete: self.createMenuItem('Delete'),
			pageSetDefault: self.createMenuItem('Set Default'),
			pageDuplicate: self.createMenuItem('Duplicate'),
		}

		for(const key in self._rightClickItems){
			list.append(self._rightClickItems[key]);
		}

		self._rightClickItems.drawerCreateComponent.addEventListener('click', () => {
			ui.emit('rightClick-drawerCreateComponent', self._selectedItem.id);
		});

		self._rightClickItems.drawerCreateGroup.addEventListener('click', () => {
			ui.emit('rightClick-drawerCreateGroup', self._selectedItem.id);
		});

		self._rightClickItems.drawerDelete.addEventListener('click', () => {
			const drawerEl = self.findParentDrawerId(self._selectedItem);
			ui.emit('rightClick-drawerDelete', { id: self._selectedItem.id, drawerId: drawerEl.id });
		});

		self._rightClickItems.drawerEdit.addEventListener('click', () => {
			const drawerEl = self.findParentDrawerId(self._selectedItem);
			ui.emit('rightClick-drawerEdit', { id: self._selectedItem.id, drawerId: drawerEl.id });
		});

		self._rightClickItems.drawerDuplicate.addEventListener('click', () => {
			const drawerEl = self.findParentDrawerId(self._selectedItem);
			ui.emit('rightClick-drawerDuplicate', { id: self._selectedItem.id, drawerId: drawerEl.id });
		});

		self._rightClickItems.pageRename.addEventListener('click', () => {
			ui.emit('rightClick-pageRename', self._selectedItem.id);
		});
		self._rightClickItems.pageDelete.addEventListener('click', () => {
			ui.emit('rightClick-pageDelete', self._selectedItem.id);
		});
		self._rightClickItems.pageSetDefault.addEventListener('click', () => {
			ui.emit('rightClick-pageSetDefault', self._selectedItem.id);
		});
		self._rightClickItems.pageDuplicate.addEventListener('click', () => {
			ui.emit('rightClick-pageDuplicate', self._selectedItem.id);
		});

		return menu;
	}

	// https://stackoverflow.com/questions/8729193/how-to-get-all-parent-nodes-of-given-element-in-pure-javascript
	findParentDrawerId(element){
		let a = element
		let els = [];
		while (a) {

			if(a.classList.contains('drawer-main')){
				return a;
			}

    		els.unshift(a);
    		a = a.parentNode;
		}
		return null;
	}

	_selectedItem;
	_checkRightClickMenu(){
		const self = this;

		for(const name in self._rightClickItems){
			self._rightClickItems[name].classList.add('hidden');
		}

		let isFound = false;
		for(const key in self._selectedItem.classList){
			const item = self._selectedItem.classList[key];

			switch (item) {
				case 'drag-handler':
					isFound = true;
					self._selectedItem = self._selectedItem.parentNode;

					self._rightClickItems.drawerEdit.classList.remove('hidden');
					self._rightClickItems.drawerDelete.classList.remove('hidden');
					self._rightClickItems.drawerDuplicate.classList.remove('hidden');
					break;

				case 'grid-stack':
					isFound = true;
					self._rightClickItems.drawerCreateComponent.classList.remove('hidden');
					self._rightClickItems.drawerCreateGroup.classList.remove('hidden');
					break;

				case 'page-item-content-2':
					self._selectedItem = self._selectedItem.parentNode;

				case 'page-item-content':
					self._selectedItem = self._selectedItem.parentNode;

				case 'page-item':
					isFound = true;
					self._rightClickItems.pageRename.classList.remove('hidden');
					self._rightClickItems.pageDelete.classList.remove('hidden');
					self._rightClickItems.pageSetDefault.classList.remove('hidden');
					self._rightClickItems.pageDuplicate.classList.remove('hidden');
					break;

				default:
					break;
			}
		}

		return isFound;
	}

	connectedCallback(){
		const self = this;

		const rightClickMenu = self.createRightClickMenu()
		rightClickMenu.classList.add("hidden");
		self.append(rightClickMenu);

		document.addEventListener("contextmenu", function (e) {
  			e.preventDefault(); // prevent default context menu

  			// Optional: only show menu when clicking on specific area
  			// if (!e.target.closest('.grid-stack-item')) return;
  			self._selectedItem = e.target;
			const isFound = self._checkRightClickMenu();

			if(!isFound){
				rightClickMenu.classList.add("hidden");
				return;
			}

  			// Calculate position and prevent overflow
  			const menuWidth = 150;
  			const menuHeight = 120;
  			const pageWidth = window.innerWidth;
  			const pageHeight = window.innerHeight;

  			let posX = e.clientX;
  			let posY = e.clientY;

  			if (posX + menuWidth > pageWidth) posX = pageWidth - menuWidth;
  			if (posY + menuHeight > pageHeight) posY = pageHeight - menuHeight;

  			rightClickMenu.style.left = `${posX}px`;
  			rightClickMenu.style.top = `${posY}px`;

  			rightClickMenu.classList.remove("hidden");
		});

		// Hide menu on click elsewhere
		document.addEventListener("click", () => {
  			rightClickMenu.classList.add("hidden");
		});

		self._listeners = {
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
    'right-click-menu',
    RightClickMenu
)
