import ui from '../../models/ui.js';
import * as monaco from 'monaco-editor';

class ELEMENT extends HTMLElement {
    constructor(){
        super();
	}

	createWrapper(){
		const self = this;

		const wrapper = document.createElement('div');
		wrapper.classList.add('h-screen', 'overflow-auto');

		const component = document.createElement('div');
		component.classList.add('grid-stack');
		wrapper.append(component);

		return wrapper;
	}

	createMenuItem(className, name, url){
		const self = this;

		const item = document.createElement('li');
		item.id = `rightMenuClick-${className}`
		const link = document.createElement('a');
		link.href = url;
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

		const items = {
			createComponent: self.createMenuItem('CreateComponent', 'Create Component', '#'),
			createGroup: self.createMenuItem('CreateGroup', 'Create Group', '#'),
			edit: self.createMenuItem('Edit', 'Edit', '#'),
			delete: self.createMenuItem('Delete', 'Delete', '#')
		}

		for(const key in items){
			list.append(items[key]);
		}

		items.createComponent.addEventListener('click', () => {
			self._grid.addWidget({
				content:  `
<html>
	<head>
		<link rel="stylesheet" href="/vendor/DaisyUI/daisyui-5.css">
		<script src="/vendor/DaisyUI/tailwind-4.js"></script>
		<style>
			html, body {
            	margin: 0;
            	padding: 0;
            	background: transparent !important;
          	}
		</style>
	</head>
	<body>
		<b>New Component</b>

		<script type="module">
		</script>
	</body>
</html>`, w: 1, h: 15, locked: 'yes'});
		});

		items.createGroup.addEventListener('click', () => {
			self._grid.addWidget({
				subGridOpts: {children: []},
				w: 1, h: 15, locked: 'yes', 
				content: `
				<html>
	<head>
		<meta name="color-scheme" content="light dark">
		<link rel="stylesheet" href="/vendor/DaisyUI/daisyui-5.css">
		<script src="/vendor/DaisyUI/tailwind-4.js"></script>
		<style>
			html, body {
            	margin: 0;
            	padding: 0;
            	background: transparent !important;
            }
		</style>
	</head>
	<body class="flex items-center justify-center h-screen w-screen">
		<div class="card bg-base-100 w-[98vw] h-[98vh] shadow-sm"></div>
	</body>
</html>`
			});
		});

		items.delete.addEventListener('click', () => {

			const selectedId = Number(self._selectedItem.id.replace('widget-',''));
			const components = self._grid.save();
			self.convertIframeContent(components);
			self.findNode(components, selectedId, true);

			self._grid.removeAll();
			self._iframes = [];
			self._grid.load(components);

			//self._grid.removeWidget(self._selectedItem.parentNode);
		});

		items.edit.addEventListener('click', () => {
			const selectedId = Number(self._selectedItem.id.replace('widget-',''));

			const components = self._grid.save();
			self.convertIframeContent(components);
			const selectedNode = self.findNode(components, selectedId);

			self._editorBoxModal.showModal();
			if(selectedNode.content){
				ui.emit('update-editor', selectedNode.content)
			}else{
				ui.emit('update-editor', '')
			}

		});
		return menu;
	}

	moveOut(){
		const self = this;

		
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
			/* need to improve to only update selected */
			const editorValue = monaco.editor.getModels()[0].getValue();
			 
			const selectedId = Number(self._selectedItem.id.replace('widget-',''));
			const components = self._grid.save();
			self.convertIframeContent(components);
			const selectedWidget = self.findNode(components, selectedId);
			if(selectedWidget.content){
				selectedWidget.content = editorValue;
			}

			self._selectedItem.innerHTML = '';
			//self._grid.update(self._selectedItem.parentElement, selectedWidget)
			self._grid.removeAll();
			self._iframes = [];

			self._grid.load(components);

			dialog.close();
		})

		return dialog;
	}

	getRandomString(){
		return Math.random().toString(36).substring(2);
	}

	_checkRightClickMenu(){
		const self = this;

		let isWidget = false;
		for(const key in self._selectedItem.classList){
			const item = self._selectedItem.classList[key];

			switch (item) {
				case 'drag-handler':
					self._selectedItem = self._selectedItem.parentNode;

				case 'grid-stack-item-content':
					isWidget = true;
					break;

				default:
					break;
			}
		}

		if(isWidget){
			document.querySelector('#rightMenuClick-Edit').classList.remove('hidden');
			document.querySelector('#rightMenuClick-Delete').classList.remove('hidden');
			document.querySelector('#rightMenuClick-CreateComponent').classList.add('hidden');
			document.querySelector('#rightMenuClick-CreateGroup').classList.add('hidden');
		}else{
			document.querySelector('#rightMenuClick-Edit').classList.add('hidden');
			document.querySelector('#rightMenuClick-Delete').classList.add('hidden');
			document.querySelector('#rightMenuClick-CreateComponent').classList.remove('hidden');
			document.querySelector('#rightMenuClick-CreateGroup').classList.remove('hidden');
		}
	}

	convertIframeContent(nodes){
		const self = this;

		for(const node of nodes){
			if(node.content !== undefined){
				const match = node.content.match(/srcdoc="([^"]*)"/s);
				let srcdoc = match ? match[1] : node.content;

				const textarea = document.createElement("textarea");
				textarea.innerHTML = srcdoc;
				const htmlString = textarea.value;

				node.content = htmlString;
			}

			if(node.subGridOpts !== undefined){
				self.convertIframeContent(node.subGridOpts.children);
			}
		}
	}

	findNode(nodes, id, isRemove = false){
		const self = this;

		for(const nIndex in nodes){
			const node = nodes[nIndex];
			if(node.id == id){
				if(isRemove){
					nodes.splice(nIndex, 1);
				}

				return node;
			}

			if(node.subGridOpts !== undefined && node.subGridOpts?.children?.length){
				const result = self.findNode(node.subGridOpts.children, id, isRemove)
				if(result) return result;
			}
		}

		return null;
	}

	createDragHandler(){
		const self = this;

		const el = document.createElement('div');
		el.classList.add('drag-handler');
		el.classList.add('fa-solid', 'fa-grip');

		return el;
	}

    connectedCallback(){
        const self = this;

        self._selectedItem;

		self.append(self.createWrapper());
		const rightClickMenu = self.createRightClickMenu()
		rightClickMenu.classList.add("hidden");
		self.append(rightClickMenu);

		self._editorBoxModal = self.createEditorModal();
		self.append(self._editorBoxModal)

		self._iframes = [];

		self._counterId = 0;
		window.onload = () => {
			GridStack.renderCB = async (el, w) => {

				el.append(self.createDragHandler());

				const iframe = document.createElement('iframe');
				iframe.style.border = 'none';
				iframe.style.width = '100%'; // fill width of container
				iframe.style.height = 'auto';
				iframe.setAttribute('allowtransparency', 'true');
				iframe.style.background = 'transparent';

				if(w.subGridOpts){
					iframe.style.height = '100%';
					iframe.style.position = 'absolute';
				}else{

					iframe.onload = () => {
						const doc = iframe.contentDocument || iframe.contentWindow.document;
						const resize = () => {
							iframe.style.height = doc.body.scrollHeight + 'px';
						};
						resize();

						// Optionally observe future changes
						new ResizeObserver(resize).observe(doc.body);
					};
				}
				iframe.srcdoc = w.content;
				self._iframes.push(iframe);
				el.append(iframe)

				//el.id = `widget-${self.getRandomString()}_${w.x || 0}_${w.y || 0}`;
				el.id = `widget-${self._counterId}`;
				w.id = self._counterId;

				self._counterId++;
    		};

			const items = [
    			{w: 1, h: 15, locked: 'yes', content: `
<html>
	<head>
		<link rel="stylesheet" href="/vendor/DaisyUI/daisyui-5.css">
		<script src="/vendor/DaisyUI/tailwind-4.js"></script>
		<style>
			html, body {
            	margin: 0;
            	padding: 0;
            	background: transparent !important;
          	}
			.btn { background-color: aqua; width: 100% }
		</style>
	</head>
	<body>
		<button class="btn">Click !</button>
		<script type="module">
			import ui from './vendor/global/ui.js';

			const bridge = ui.createIframeBridge(window.parent);
			document.querySelector('.btn').addEventListener('click', () => {
				bridge.send('btn-test', { data: 'OK' }, { broadcast: true });
			});
		</script>
	</body>
</html>
    			`
    			}, 
    			{w: 2, h: 30, locked: 'yes', content: `
<html>
	<head>
		<link rel="stylesheet" href="/vendor/DaisyUI/daisyui-5.css">
		<script src="/vendor/DaisyUI/tailwind-4.js"></script>
		<style>
			html, body {
            	margin: 0;
            	padding: 0;
            	background: transparent !important;
          	}
		</style>
	</head>
	<body>
		<div>
			<span>Counter: </span>
			<span id="counter-value"></span>
		</div>
		<div>
			<span>Input: </span>
			<span id="input-value"></span>
		</div>

		<script type="module">
			import ui from './vendor/global/ui.js';
			const bridge = ui.createIframeBridge(window.parent);

			let counter = 0;
			bridge.on('btn-test', (data) => {
				document.querySelector('#counter-value').innerText = counter++;
			});

			bridge.on('input-test', (data) => {
				document.querySelector('#input-value').innerText = data.data;
			});
		</script>
	</body>
</html>
    			`
    			}, 
				{x: 5, y: 30, w: 5, h: 15, locked: 'yes', content: `
<html>
	<head>
		<link rel="stylesheet" href="/vendor/DaisyUI/daisyui-5.css">
		<script src="/vendor/DaisyUI/tailwind-4.js"></script>
		<style>
			html, body {
            	margin: 0;
            	padding: 0;
            	background: transparent !important;
          	}
		</style>
	</head>
	<body>
		<input type="text" placeholder="Type here" class="input w-full" />
		<script type="module">
			import ui from './vendor/global/ui.js';
			const bridge = ui.createIframeBridge(window.parent);

			const input = document.querySelector('input');
			input.addEventListener('input', ui.debounce(() => {
				const value = document.querySelector('input').value;
				bridge.send('input-test', { data: value }, { broadcast: true });
			}, 500))
		</script>
	</body>
</html>
    			`},
    			 {x:5, y:0, w:3, h:15, locked: 'yes', 
    			 content: `<html>
	<head>
		<meta name="color-scheme" content="light dark">
		<link rel="stylesheet" href="/vendor/DaisyUI/daisyui-5.css">
		<script src="/vendor/DaisyUI/tailwind-4.js"></script>
		<style>
			html, body {
            	margin: 0;
            	padding: 0;
            	background: transparent !important;
            }
		</style>
	</head>
	<body class="flex items-center justify-center h-screen w-screen">
		<div class="card bg-blue-500 w-[98vw] h-[98vh] shadow-sm"></div>
	</body>
</html>`,
    			 subGridOpts: {children: [{x:0, y:0, h:15, w: 5, locked: 'yes', content: `<html>
	<head>
		<link rel="stylesheet" href="/vendor/DaisyUI/daisyui-5.css">
		<script src="/vendor/DaisyUI/tailwind-4.js"></script>
		<style>
			html, body {
            	margin: 0;
            	padding: 0;
            	background: transparent !important;
          	}
		</style>
	</head>
	<body>
		<input type="text" placeholder="Type here" class="input w-full" />
		<script type="module">
			import ui from './vendor/global/ui.js';
			const bridge = ui.createIframeBridge(window.parent);

			const input = document.querySelector('input');
			input.addEventListener('input', ui.debounce(() => {
				const value = document.querySelector('input').value;
				bridge.send('input-test', { data: value }, { broadcast: true });
			}, 500))
		</script>
	</body>
</html>`}]}},
			];
			self._grid = GridStack.init({
				float: true,
				cellHeight: '1vh',
				cellWidth: '1vw',
				//staticGrid: true
				acceptWidgets: true,
    			//removable: true,
    			resizable: { handles: 'n,ne,e,se,s,sw,w,nw'},
    			minRow: 2,
    			handle: '.drag-handler',
			});
			self._grid.load(items);

			window.addEventListener('message', (event) => {
				const { type, payload, _broadcasted } = event.data;

				if (_broadcasted && payload) {
					// Re-broadcast to all iframes (except sender)
					for (const iframe of self._iframes) {
						if (iframe.contentWindow !== event.source) {
							iframe.contentWindow.postMessage({ type, payload, _broadcasted: true }, '*');
						}
					}

					// Optionally trigger locally too (parent self-handler)
					/*window.dispatchEvent(new MessageEvent('message', {
						data: { type, payload, _broadcasted: true },
						origin: event.origin
					}));*/
				}
			});
		}

		document.addEventListener("contextmenu", function (e) {
  			e.preventDefault(); // prevent default context menu

  			// Optional: only show menu when clicking on specific area
  			// if (!e.target.closest('.grid-stack-item')) return;
  			self._selectedItem = e.target;
			self._checkRightClickMenu();

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
			'btn-test': () => {
				alert("TEST")
			},
			'btn-import': ({ detail }) => {
				self._grid.removeAll();
				self._iframes = [];
				self._grid.load(detail.data);
			},
			'btn-export': () => {
				const components = self._grid.save();
				self.convertIframeContent(components);

				const blob = new Blob([JSON.stringify(components)], { type: 'application/json' });
  				const url = URL.createObjectURL(blob);
  				const epoch = Math.floor(Date.now() / 1000);

  				const a = document.createElement('a');
  				a.href = url;
  				a.download = `test-${epoch}.json`;
  				a.click();

  				URL.revokeObjectURL(url); // free up memory
			},
			'btn-build': async () => {

				const pages = {
					home: {}
				}

				const components = self._grid.save();
				self.convertIframeContent(components);

				pages.home = components;

				const response = await fetch('/api/build', {
					method: 'post',
					body: JSON.stringify(pages)
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

export default window.customElements.define(
    'drawer-box', ELEMENT
)
