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

		//const drawerBox = document.createElement('drawer-box');
		//wrapperContent.append(drawerBox);
		wrapperContent.append(document.createElement('editor-tabs'));

		wrapper.append(wrapperContent);
		return wrapper;
	}

	createEditorModal(){
		const self = this;

		const dialog = document.createElement('dialog');
		dialog.id = 'import-model';
		dialog.classList.add('modal');

		const modalBox = document.createElement('div');
		modalBox.classList.add('modal-box', 'w-[80vw]', 'max-w-[80vw]', 'p-0');
		dialog.append(modalBox);

		const title = document.createElement('h3');
		modalBox.append(title);
		title.classList.add('text-lg', 'font-bold');
		title.innerText = 'Edit Code';

		const editorBox = document.createElement('editor-box');
		editorBox.classList.add('w-full');
		modalBox.append(editorBox);

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
			ui.emit('drawer-editorOk', self._selectedDrawerId)

			dialog.close();
		})

		return dialog;
	}


	checkNotif(){
		const flag = ui.getFlag();
		if(flag?.notification){
			new Notify(flag.notification);
		}
	}

	connectedCallback(){
		const self = this;

		const editorBoxModal = self.createEditorModal();
		self.append(editorBoxModal)

		self.append(document.createElement('right-click-menu'));

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
				/*const pageContent = self.querySelector('drawer-box');

				if(!detail.state){
					pageContent.classList.add('expand');
				}else{
					pageContent.classList.remove('expand');
				}*/
			},
			'open-editor': ({ detail }) => {
				self._selectedDrawerId = detail;
				editorBoxModal.showModal();
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
    'page-home',
    PageHome
)
