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

	setData(items){
		const self = this;

		self._items = items;
	}

    connectedCallback(){
        const self = this;

        self._selectedItem;

		self.append(self.createWrapper());
		
		self._iframes = [];

		self._counterId = 0;
		window.onload = () => {
			GridStack.renderCB = async (el, w) => {

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

			self._grid = GridStack.init({
				float: true,
				cellHeight: '1vh',
				cellWidth: '1vw',
				//staticGrid: true
				//acceptWidgets: true,
    			//removable: true,
    			margin: 0,
    			column: 48,
    			cellHeightThrottle: 0,
			});
			
			self._grid.setStatic(true)
			self._grid.load(self._items);

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


		self._listeners = {}

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
