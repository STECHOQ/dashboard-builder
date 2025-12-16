import ui from '../../models/ui.js';
import { utils } from '../../helper/index.js';

export default window.customElements.define(
    'tab-pages',
    class extends HTMLElement {
        constructor(){
            super();
		}

		createDefaultMark(){
			const self = this;
			const icon = document.createElement('i');
			icon.classList.add('fa-solid', 'fa-star', 'text-yellow-500');

			return icon;
		}

		createItemPage(name){
			const self = this;

			const id = utils.toKebabCase(`tab-page-${name}`);

			const item = document.createElement('li');
			item.classList.add('bg-base-100', 'shadow-sm');

			const itemLink = document.createElement('div');
			itemLink.classList.add('page-item', 'flex', 'flex-col', 'items-start');
			itemLink.id = id;

			const titleWrapper = document.createElement('div');
			titleWrapper.classList.add('flex', 'w-full', 'justify-between', 'page-item-content');

			const defaultMark = self.createDefaultMark();
			defaultMark.classList.add('page-item-content-2', 'hidden');

			const title = document.createElement('p');
			title.classList.add('page-item-content-2');
			title.innerText = name;

			titleWrapper.append(title, defaultMark);

			const routePath = document.createElement('p');
			routePath.classList.add('text-gray-400', 'text-sm', 'page-item-content');
			routePath.innerText = id.replace('tab-page-', '/');

			itemLink.append(titleWrapper, routePath);

			item.append(itemLink);

			if(self._pages[id] === undefined){
				self._pages[id] = {
					name: name,
					element: {
						main: itemLink,
						title: title,
						routePath: routePath,
						defaultMark: defaultMark
					},
					isDefault: false,
					components: []
				}
			}else{
				if(!self._pages[id].element){
					self._pages[id].element = {
						main: itemLink,
						title: title,
						routePath: routePath,
						defaultMark: defaultMark
					}
				}
			}

			if(self._pages[id].isDefault){
				defaultMark.classList.remove('hidden');
			}

			itemLink.addEventListener('click', (e) => {

				let selectedElement = e.target;

				if(e.target.classList.contains('page-item-content')){
					selectedElement = e.target.parentElement;
				}

				if(e.target.classList.contains('page-item-content-2')){
					selectedElement = e.target.parentElement.parentElement;
				}

				const selectedPageName = selectedElement.querySelector('p.page-item-content-2').innerText;
				const selectedId = utils.toKebabCase(`tab-page-${selectedPageName}`);

				const name = self._pages[selectedId].name;
				const components = self._pages[selectedId].components

				ui.emit('open-page', {
					name,
					components
				})
			})

			return item;
		}

		createContent(){
			const self = this;

			const wrapper = document.createElement('div');

			const list = document.createElement('ul');
			list.classList.add('menu', 'w-full');
			list.id = 'list-tab-pages';

			self._listPages = list;

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
					const newId = utils.toKebabCase(`tab-page-${newName}`);
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
				const newId = utils.toKebabCase(`tab-page-${newName}`);

				if(self._pages[newId] === undefined){
					self._pages[self._selectedPageId].name = newName;
					self._pages[self._selectedPageId].element.title.innerText = newName;
					self._pages[self._selectedPageId].element.routePath.innerText = newId.replace('tab-page-', '/');
					self._pages[self._selectedPageId].element.main.id = newId;
					self._pages[newId] = self._pages[self._selectedPageId];
					delete self._pages[self._selectedPageId];

				}else{
					alert(`page "${newName}" is already exist`);
					return
				}

				dialog.close();
			})

			return dialog;
		}

		clearPages(){
			const self = this;

			self._listPages.innerHTML = '';
			self._pages = {};
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

					// check if editor tab is opened
					const drawers = document.getElementsByTagName('drawer-box');
					for(const drawer of drawers){
						const oldId = detail.replace('tab-page-','');
						if(drawer.getAttribute('page-id') == oldId){
							alert(`Can't rename opened page`);
							return;
						}
					}

					self._selectedPageId = detail;
					self._elRenameInput.value = self._pages[detail].name;
					contents.renameDialog.showModal()
				},
				'rightClick-pageDelete': ({ detail }) => {

					// check if editor tab is opened
					const drawers = document.getElementsByTagName('drawer-box');
					for(const drawer of drawers){
						const oldId = detail.replace('tab-page-','');
						if(drawer.getAttribute('page-id') == oldId){
							alert(`Can't delete opened page`);
							return;
						}
					}

					self._pages[detail].element.main.parentElement.remove();
					delete self._pages[detail];
				},
				'rightClick-pageSetDefault': ({ detail }) => {
					for(const pIndex in self._pages){
						self._pages[pIndex].isDefault = false;
						self._pages[pIndex].element.defaultMark.classList.add('hidden');
					}

					self._pages[detail].isDefault = true;
					self._pages[detail].element.defaultMark.classList.remove('hidden');
				},
				'rightClick-pageDuplicate': ({ detail }) => {

					let newName = '';
					let newId = '';
					while(true){
						newName = `Duplicate Page ${++self._newPageCounter}`;
						newId = utils.toKebabCase(`tab-page-${newName}`);
						if(self._pages[newId] === undefined) break;
					}

					self._pages[newId] = {
						components: structuredClone(self._pages[detail].components),
						isDefault: false,
						name : newName
					}

					const newItem = self.createItemPage(newName);
					self._listPages.append(newItem);

				},
				'drawer-update': ({ detail }) => {
					const {pageId, components} = detail;
					const id = `tab-page-${pageId}`

					self._pages[id].components = components;
				},
				'btn-export': () => {
					const pages = {}
					for(const pageIndex in self._pages){
						const id = pageIndex.replace('tab-page-', '')
						pages[id] = {
							name: self._pages[pageIndex].name,
							isDefault: self._pages[pageIndex].isDefault,
							components: structuredClone(self._pages[pageIndex].components),
						}
					}

					const blob = new Blob([JSON.stringify(pages)], { type: 'application/json' });
  					const url = URL.createObjectURL(blob);
  					const epoch = Math.floor(Date.now() / 1000);

  					const a = document.createElement('a');
  					a.href = url;
  					a.download = `project-${epoch}.json`;
  					a.click();

  					URL.revokeObjectURL(url); // free up memory
				},
				'btn-import': ({ detail }) => {
					// close all opened tabs 
					ui.emit('clear-tabs');

					// remove all pages 
					self.clearPages();

					// re-add pages 
					const newPages = detail.data;

					for(const pIndex in newPages){
						const pageId = `tab-page-${pIndex}`;
						self._pages[pageId] = newPages[pIndex];
						self._listPages.append(self.createItemPage(newPages[pIndex].name));
					}

				},
				'btn-build': async ({ detail }) => {

					const pages = {}
					for(const pageIndex in self._pages){
						const id = pageIndex.replace('tab-page-', '')
						pages[id] = {
							name: self._pages[pageIndex].name,
							isDefault: self._pages[pageIndex].isDefault,
							components: structuredClone(self._pages[pageIndex].components),
						}
					}

					const response = await fetch('/api/build', {
						method: 'post',
						body: JSON.stringify({
							pages,
							compressContentOnly: detail.isContentOnly ? true : false,
							isRaw: detail.isRaw ? true : false,
						})
					})

					if(response.ok){
						const blob = await response.blob();
  						const url = window.URL.createObjectURL(blob);

  						const a = document.createElement("a");
  						a.href = url;

						const disposition = response.headers.get("Content-Disposition");
						let filename = "download.zip";
						if (disposition && disposition.includes("filename=")) {
  							filename = disposition.split("filename=")[1].replace(/"/g, "");
						}

  						a.download = filename;
  						document.body.appendChild(a);
  						a.click();
  						a.remove();

  						// cleanup
  						window.URL.revokeObjectURL(url);
  					}
				}
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
