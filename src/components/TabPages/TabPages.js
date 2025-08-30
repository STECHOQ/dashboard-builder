import ui from '../../models/ui.js';
import { utils } from '../../helper/index.js';

export default window.customElements.define(
    'tab-pages',
    class extends HTMLElement {
        constructor(){
            super();
		}

		createItemPage(name){
			const self = this;

			const id = utils.toKebabCase(`ItemPage${name}`);

			const item = document.createElement('li');
			const itemLink = document.createElement('a');
			itemLink.classList.add('page-item');
			itemLink.id = id;
			itemLink.innerText = name
			item.append(itemLink);

			if(self._pages[id] === undefined){
				self._pages[id] = {
					name: name,
					element: itemLink,
					components: []
				}
			}else{
				if(self._pages[id].element === null){
					self._pages[id].element = itemLink;
				}
			}

			itemLink.addEventListener('click', () => {
				ui.emit('open-page', name)
			})

			return item;
		}

		createContent(){
			const self = this;

			const wrapper = document.createElement('div');

			const list = document.createElement('ul');
			list.classList.add('menu', 'w-full');

			/*self._pages = {
				'item-page-home': {
					name: 'Home',
					element: null
				},
			}*/ 
			self._pages = {};

			for(const pageIndex in self._pages){
				const name = self._pages[pageIndex].name;
				list.append(self.createItemPage(name));
			}

			const itemBtn = document.createElement('div');
			const btnAdd = document.createElement('button');
			btnAdd.classList.add('btn', 'btn-dash', 'btn-block');
			btnAdd.innerText = 'Add Page';
			itemBtn.append(btnAdd);

			wrapper.append(list, itemBtn);

			btnAdd.addEventListener('click', () => {
				let newName = '';
				while(true){
					newName = `New Page ${++self._newPageCounter}`;
					const newId = utils.toKebabCase(`ItemPage${newName}`);
					if(self._pages[newId] === undefined) break;
				}
				
				const newItem = self.createItemPage(newName);
				list.append(newItem);
			})

			return wrapper;
		}

		_newPageCounter = 0;

		createRenameDialog(){
			const self = this;

			const dialog = document.createElement('dialog');
			dialog.id = 'import-model';
			dialog.classList.add('modal');

			const modalBox = document.createElement('div');
			modalBox.classList.add('modal-box');
			dialog.append(modalBox);

			const title = document.createElement('h3');
			modalBox.append(title);
			title.classList.add('text-lg', 'font-bold');
			title.innerText = 'Rename';

			const input = document.createElement('input');
			input.setAttribute('type', 'text');
			input.classList.add('input');
			self._elRenameInput = input;
			modalBox.append(input);

			const modalAction = document.createElement('div');
			modalAction.classList.add('modal-action');
			modalBox.append(modalAction);

			const btnOpen = document.createElement('btn');
			btnOpen.classList.add('btn');
			btnOpen.innerText = 'Save';
			modalAction.append(btnOpen);

			const btnClose = document.createElement('btn');
			btnClose.classList.add('btn');
			btnClose.innerText = 'Close';
			modalAction.append(btnClose);

			btnClose.addEventListener('click', () => {
				dialog.close();
			})

			btnOpen.addEventListener('click', () => {

				const newName = self._elRenameInput.value;
				const newId = utils.toKebabCase(`ItemPage${newName}`);

				if(self._pages[newId] === undefined){
					self._pages[self._selectedPageId].name = newName;
					self._pages[self._selectedPageId].element.innerText = newName;
					self._pages[self._selectedPageId].element.id = newId;
					self._pages[newId] = self._pages[self._selectedPageId];
					delete self._pages[self._selectedPageId];
				}

				dialog.close();
			})

			return dialog;
		}

        connectedCallback(){
            const self = this;

            const contents = {
            	content: self.createContent(),
            	renameDialog: self.createRenameDialog()
            }

			self.append(contents.content);
			self.append(contents.renameDialog);

			self._selectedPageId;

			self._listeners = {
				'rightClick-pageRename': ({ detail }) => {
					self._selectedPageId = detail;
					self._elRenameInput.value = self._pages[detail].name;
					contents.renameDialog.showModal()
				},
				'rightClick-pageDelete': ({ detail }) => {
					self._pages[detail].element.parentElement.remove();
					delete self._pages[detail];
				},
				'rightClick-pageSetDefault': ({ detail }) => {
				},
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
