import ui from '../../models/ui.js';

class ELEMENT extends HTMLElement {
    constructor(){
        super();
	}

	createWrapper(){
		const self = this;

		const wrapper = document.createElement('div');
		wrapper.classList.add('h-screen', 'w-screen', 'overflow-auto');

		const component = document.createElement('div');
		component.classList.add('grid-stack');
		wrapper.append(component);

		return wrapper;
	}

    connectedCallback(){
        const self = this;

		self.append(self.createWrapper());

		self._iframes = [];

		window.onload = () => {
			GridStack.renderCB = async (el, w) => {
				const iframe = document.createElement('iframe');
				iframe.style.border = 'none';
				iframe.style.width = '100%'; // fill width of container
				iframe.style.height = 'auto';
				iframe.onload = () => {
					const doc = iframe.contentDocument || iframe.contentWindow.document;
					const resize = () => {
						iframe.style.height = doc.body.scrollHeight + 'px';
					};
					resize();

					// Optionally observe future changes
					new ResizeObserver(resize).observe(doc.body);
				};
				iframe.srcdoc = w.htmlContent;
				self._iframes.push(iframe);
				el.append(iframe)
    		};

			const items = [
    			{w: 1, h: 15, htmlContent: `
    			<html>
					<head>
						<link rel="stylesheet" href="/vendor/DaisyUI/daisyui-5.css">
						<script src="/vendor/DaisyUI/tailwind-4.js"></script>
						<style>
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
    			{w: 2, h: 30, htmlContent: `
    			<html>
					<head>
						<link rel="stylesheet" href="/vendor/DaisyUI/daisyui-5.css">
						<script src="/vendor/DaisyUI/tailwind-4.js"></script>
						<style>
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
				{x: 5, y: 30, w: 5, h: 15, htmlContent: `
    			<html>
					<head>
						<link rel="stylesheet" href="/vendor/DaisyUI/daisyui-5.css">
						<script src="/vendor/DaisyUI/tailwind-4.js"></script>
						<style>
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
			];
			self._grid = GridStack.init({
				float: true,
				cellHeight: '1vh',
				cellWidth: '1vw',
				//staticGrid: true
				//acceptWidgets: true,
    			//removable: true,
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
			'btn-test': () => {
				alert("TEST")
			},
			'btn-import': ({ detail }) => {
				self._grid.removeAll();
				self._grid.load(detail.data);
			},
			'btn-export': () => {
				const components = [];
				for(const node of self._grid.engine.nodes){
					const component = { 
						content: node.content,
						script: node.script,
						x: node.x,
						y: node.y,
						h: node.h,
						w: node.w
					}
					components.push(component);
				}

				const blob = new Blob([JSON.stringify(components)], { type: 'application/json' });
  				const url = URL.createObjectURL(blob);
  				const epoch = Math.floor(Date.now() / 1000);

  				const a = document.createElement('a');
  				a.href = url;
  				a.download = `test-${epoch}.json`;
  				a.click();

  				URL.revokeObjectURL(url); // free up memory
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
