import ui from '../../models/ui.js';
import * as monaco from 'monaco-editor';

class ELEMENT extends HTMLElement {
    constructor(){
        super();
	}

	createWrapper(){
		const self = this;

		const component = document.createElement('div');
		component.style.height = "80vh";
		component.style.width = "80vw";

		return component;
	}

    connectedCallback(){
        const self = this;

        const wrapper = self.createWrapper();

		self.append(wrapper);

		const editor = monaco.editor.create(wrapper, {
    		value: ``,
    		language: 'html',
    		theme: 'vs-dark',
  		});

		self._listeners = {
			'screen-resize': () => {
			},
			'update-editor': ({detail}) => {
				editor.getModel().setValue(detail)
			},
			'get-editor-value': () => {
				const editorValue = editor.getModel().getValue();
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
    'editor-box', ELEMENT
)
