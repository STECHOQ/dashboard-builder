import ui from '../../models/ui.js';
import * as monaco from 'monaco-editor';

class ELEMENT extends HTMLElement {
    constructor(){
        super();
	}

	_drawerId;
	createWrapper(){
		const self = this;

		const randomUUID = window.crypto.randomUUID();

		const wrapper = document.createElement('div');
		wrapper.classList.add('overflow-auto', 'drawer-wrapper');

		const component = document.createElement('div');
		component.classList.add('grid-stack', 'drawer-main');
		component.id = `drawer-${randomUUID}`;
		self._drawerId = component.id;
		wrapper.append(component);

		return wrapper;
	}

	getRandomString(){
		return Math.random().toString(36).substring(2);
	}

	setData(items = []){
		const self = this;

		self._items = items;
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

		self._iframes = [];

		GridStack.renderCB = async (el, w) => {

			el.append(self.createDragHandler());

			const iframe = document.createElement('iframe');
			iframe.style.border = 'none';
			iframe.style.width = '100%'; // fill width of container
			iframe.style.height = '100%';
			iframe.setAttribute('allowtransparency', 'true');
			iframe.style.background = 'transparent';

			if(w.subGridOpts){
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
			const randomUUID = window.crypto.randomUUID();
			el.id = `widget-${randomUUID}`;
			w.id = randomUUID;
    	};

		/*const items = [
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
		self._items = items;*/

		self._grid = GridStack.init({
			float: true,
			cellHeight: '2vh',
			//staticGrid: true
			acceptWidgets: true,
    		//removable: true,
    		resizable: { handles: 'n,ne,e,se,s,sw,w,nw'},
    		//handle: '.drag-handler',
    		margin: 0,
    		column: 48,
    		cellHeightThrottle: 0,
		}, document.getElementById(self._drawerId));

		self._pageId = self.getAttribute('page-id');

		self._grid.load(self._items || []);

		self._grid.on('change', (e) => {
			//console.log('CHANGE', e)

			const components = self._grid.save();
			self.convertIframeContent(components);
			ui.emit('drawer-update', {
				pageId: self._pageId,
				components
			})
		})

		self._grid.on('added', (e) => {
			//console.log('ADD', e)

			const components = self._grid.save();
			self.convertIframeContent(components);
			ui.emit('drawer-update', {
				pageId: self._pageId,
				components
			})
		})

		self._grid.on('removed', (e) => {
			//console.log('REMOVE', e)

			const components = self._grid.save();
			self.convertIframeContent(components);
			ui.emit('drawer-update', {
				pageId: self._pageId,
				components
			})
		})

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


		self._listeners = {
			'rightClick-drawerCreateComponent': ({ detail }) => {

				if(self._drawerId != detail) return;

				self._grid.addWidget({
					content:  `<html>
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
</html>`, w: 5, h: 5, locked: 'yes'});
			},
			'rightClick-drawerCreateGroup': ({ detail }) => {

				if(self._drawerId != detail) return;

				self._grid.addWidget({
					subGridOpts: {children: [{
					content:  `<html>
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
		<b>New Group</b>

		<script type="module">
		</script>
	</body>
</html>`, w: 5, h: 5, locked: 'yes'}]},
					w: 10, h: 8, locked: 'yes', 
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
            .card {
            	height: calc(100vh - 5px);
				width: calc(100vw - 5px);
            }
		</style>
	</head>
	<body class="flex items-center justify-center h-screen w-screen">
		<div class="card bg-base-100 shadow-sm"></div>
	</body>
</html>`
				});
			},
			'rightClick-drawerDelete': ({ detail }) => {
				const {id, drawerId} = detail;

				if(self._drawerId != drawerId) return;

				const selectedId = id.replace('widget-','');
				const components = self._grid.save();
				self.convertIframeContent(components);
				self.findNode(components, selectedId, true);

				self._grid.removeAll();
				self._iframes = [];
				self._grid.load(components);

				//self._grid.removeWidget(self._selectedItem.parentNode);
			},
			'rightClick-drawerEdit': ({ detail }) => {

				const {id, drawerId} = detail;

				if(self._drawerId != drawerId) return;

				const selectedId = id.replace('widget-','');
				self._selectedItemId = id;

				const components = self._grid.save();
				self.convertIframeContent(components);
				const selectedNode = self.findNode(components, selectedId);

				if(selectedNode.content){
					ui.emit('update-editor', selectedNode.content)
				}else{
					ui.emit('update-editor', '')
				}

				ui.emit('open-editor', self._drawerId);
			},
			'drawer-editorOk': ({ detail }) => {

				if(self._drawerId != detail) return;

				/* need to improve to only update selected */
				const editorValue = monaco.editor.getModels()[0].getValue();

				const selectedId = self._selectedItemId.replace('widget-','');
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
			},
			'rightClick-drawerDuplicate': ({ detail }) => {

				const {id, drawerId} = detail;

				if(self._drawerId != drawerId) return;

				const selectedId = id.replace('widget-','');
				self._selectedItemId = id;

				const components = self._grid.save();
				self.convertIframeContent(components);
				const selectedNode = self.findNode(components, selectedId);

				/* need to improve to only update selected */
				self._grid.addWidget(selectedNode);
			},
			'btn-test': () => {
				alert("TEST")
			},
			'btn-import': ({ detail }) => {
				/*self._grid.removeAll();
				self._iframes = [];
				self._grid.load(detail.data);*/
			},
			'btn-export': () => {
				/*const components = self._grid.save();
				self.convertIframeContent(components);

				const blob = new Blob([JSON.stringify(components)], { type: 'application/json' });
  				const url = URL.createObjectURL(blob);
  				const epoch = Math.floor(Date.now() / 1000);

  				const a = document.createElement('a');
  				a.href = url;
  				a.download = `test-${epoch}.json`;
  				a.click();

  				URL.revokeObjectURL(url); // free up memory
  				*/
			},
			'btn-build': async () => {

				/*const pages = {
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
  				}*/
			},
			'drawer-createComponent': ({ detail }) => {

				const { pageId, component } = detail;

				if(self._pageId != pageId) return;

				self._grid.addWidget({ ...component, locked: 'yes'});
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

export default window.customElements.define(
    'drawer-box', ELEMENT
)
