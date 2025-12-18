import ui from '../../models/ui.js';

class ELEMENT extends HTMLElement {
    constructor(){
        super();
	}

	createImportDialog(){
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
		title.innerText = 'Import';

		const input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.setAttribute('accept', '.json');
		input.classList.add('file-input', 'my-4')
		modalBox.append(input);

		const modalAction = document.createElement('div');
		modalAction.classList.add('modal-action');
		modalBox.append(modalAction);

		const btnOpen = document.createElement('btn');
		btnOpen.classList.add('btn');
		btnOpen.innerText = 'Open File';
		modalAction.append(btnOpen);

		const btnClose = document.createElement('btn');
		btnClose.classList.add('btn');
		btnClose.innerText = 'Close';
		modalAction.append(btnClose);

		btnClose.addEventListener('click', () => {
			dialog.close();
		})

		btnOpen.addEventListener('click', () => {

			try{
				const parsed = JSON.parse(self._tmpJsonFile);
				ui.emit('btn-import', {data : parsed});
			}catch(err){
				alert('Invalid JSON format');
				console.log(err)
			}

			dialog.close();
		})

		input.addEventListener('change', (event) => {
  			const file = event.target.files[0];
  			if (!file) return;

  			const reader = new FileReader();
  			reader.onload = (e) => {
  				self._tmpJsonFile = e.target.result;
  			};
  			reader.readAsText(file);
		});

		return dialog;
	}

	createWrapper(){
		const self = this;

		const component = document.createElement('div');
		component.classList.add('navbar', 'shadow-sm', 'min-h-0', 'p-0');

		const wrapper = document.createElement('div');
		wrapper.classList.add('flex', 'p-2', 'items-center');
		component.append(wrapper);

		const title = document.createElement('div');
		title.classList.add('font-bold', 'mr-2');
		title.innerText = 'WebUI';
		wrapper.append(title);

		const btnImport = document.createElement('button');
		btnImport.classList.add('btn', 'mr-2');
		btnImport.innerText = 'Import';
		wrapper.append(btnImport);

		const dialogImport = self.createImportDialog();
		component.append(dialogImport);

		const btnExport = document.createElement('button');
		btnExport.classList.add('btn', 'mr-2');
		btnExport.innerText = 'Export';
		wrapper.append(btnExport);

		const btnBuild = document.createElement('button');
		btnBuild.classList.add('btn', 'mr-2');
		btnBuild.innerText = 'Build the dist';
		wrapper.append(btnBuild);

		const btnBuildContent = document.createElement('button');
		btnBuildContent.classList.add('btn', 'mr-2');
		btnBuildContent.innerText = 'Build Content Only';
		wrapper.append(btnBuildContent);

		const btnGetRaw = document.createElement('button');
		btnGetRaw.classList.add('btn', 'mr-2');
		btnGetRaw.innerText = 'Get Raw Folder';
		wrapper.append(btnGetRaw);

		btnImport.addEventListener('click', () => {
			dialogImport.showModal();
		})

		btnExport.addEventListener('click', () => {
			ui.emit('btn-export');
		})

		btnBuild.addEventListener('click', () => {
			ui.emit('btn-build', { isContentOnly: false });
		})

		btnBuildContent.addEventListener('click', () => {
			ui.emit('btn-build', { isContentOnly: true });
		})

		btnGetRaw.addEventListener('click', () => {
			ui.emit('btn-build', { isRaw: true });
		})

		return component;
	}

    connectedCallback(){
        const self = this;

		self.append(self.createWrapper());

		self._listeners = {
			'screen-resize': () => {
			},

			'navbar-state': ({ detail }) => {
				if(detail.state){
					self.classList.add('hidden');
				}else{
					self.classList.remove('hidden');
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

export default window.customElements.define(
    'navigation-bar', ELEMENT
)
