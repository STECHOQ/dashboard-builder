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
			 
			const selectedId = Number(self._selectedItemId.replace('widget-',''));
			const components = self._grid.save();
			self.convertIframeContent(components);
			const selectedWidget = self.findNode(components, selectedId);
			if(selectedWidget.content){
				selectedWidget.content = editorValue;
			}

			const el = document.getElementById(self._selectedItemId);
			el.innerHTML = '';
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

		self.append(self.createWrapper());

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
    			margin: 0,
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


		self._listeners = {
			'rightClick-drawerCreateComponent': () => {
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
			},
			'rightClick-drawerCreateGroup': () => {
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
			},
			'rightClick-drawerDelete': ({ detail }) => {
				const selectedId = Number(detail.replace('widget-',''));
				const components = self._grid.save();
				self.convertIframeContent(components);
				self.findNode(components, selectedId, true);

				self._grid.removeAll();
				self._iframes = [];
				self._grid.load(components);

				//self._grid.removeWidget(self._selectedItem.parentNode);
			},
			'rightClick-drawerEdit': ({ detail }) => {
				const selectedId = Number(detail.replace('widget-',''));
				self._selectedItemId = detail;

				const components = self._grid.save();
				self.convertIframeContent(components);
				const selectedNode = self.findNode(components, selectedId);

				self._editorBoxModal.showModal();
				if(selectedNode.content){
					ui.emit('update-editor', selectedNode.content)
				}else{
					ui.emit('update-editor', '')
				}
			},
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
