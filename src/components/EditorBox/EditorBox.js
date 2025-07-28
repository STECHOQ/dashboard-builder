import ui from '../../models/ui.js';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

self.MonacoEnvironment = {
    getWorker(_, label) {
        if (label === 'json') {
            return new jsonWorker();
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return new cssWorker();
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return new htmlWorker();
        }
        if (label === 'typescript' || label === 'javascript') {
            return new tsWorker();
        }
        return new editorWorker();
    },
};

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
