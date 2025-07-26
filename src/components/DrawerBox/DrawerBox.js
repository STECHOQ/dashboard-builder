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

		window.onload = () => {
			GridStack.renderCB = (el, w) => {
      			el.innerHTML = w.content;

      			if(w.script){
      				setTimeout(() => {
      					eval('"use strict";' + w.script);
      				}, 50);
      			}
    		};

			const items = [
    			{w: 1, h: 15, content: '<button class="btn" id="btn-test">Click !</button>', script: `document.getElementById('btn-test').addEventListener('click', () => { ui.emit("btn-test") })`}, 
    			{w: 2, h: 30, content: `<div class="radial-progress" style="--value:70;" aria-valuenow="70" role="progressbar">70%</div>`}, 
				{x: 5, y: 30, w: 5, h: 15, content: '<input type="text" placeholder="Type here" class="input w-full" />'},
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
