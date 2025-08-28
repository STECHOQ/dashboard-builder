import ui from '../../models/ui.js';

export default window.customElements.define(
    'side-bar',
    class extends HTMLElement {
        constructor(){
            super();
		}

		toggleNavbar(){
			const self = this;

			if(self._isOpen){
				self.classList.add('hide-close');
			}else{
				self.classList.remove('hide-close');
			}

			ui.emit('sidebar-state', {
				state: !self._isOpen
			})

			self._isOpen = !self._isOpen;
		}

		createCollapseButton(){
			const button = document.createElement('button');
			button.classList.add('navbar-toggler', 'text-muted', 'm-0', 'p-0', 'collapseSidebar');
			button.setAttribute('type', 'button');

			const icon = document.createElement('i');
			icon.classList.add('fa-solid', 'fa-bars', 'cursor-pointer');
			button.append(icon);

			return button;
		}

		createNavBar(){
			const self = this;

			const nav = document.createElement('nav');
			nav.classList.add('navbar-toggle', 'shadow');

			nav.addEventListener('click', () => {
				self.toggleNavbar();
			})

			self._navbarToggle = nav;

			nav.append(self.createCollapseButton());

			return nav;
		}

		createNavMenu(){
			const self = this;

			const nav = document.createElement('div');
			nav.classList.add('border-right', 'shadow', 'custom-sidebar');

			const content = document.createElement('side-bar-tabs');
			content.classList.add('w-[300px]')
			nav.append(content);

			nav.append(self.createNavBar());

			return nav;
		}

		createIcon(){
			const self = this;

			const aLink = document.createElement('nav');
			aLink.classList.add('btn', 'collapseSidebar', 'toggle-btn', 'd-lg-none', 'text-muted', 'ml-2', 'mt-3');

			const icon = document.createElement('i');
			icon.classList.add('fe', 'fe-x');
			aLink.append(icon);

			const srOnly = document.createElement('span');
			srOnly.classList.add('sr-only');
			icon.append(srOnly);

			return aLink;
		}

        connectedCallback(){
            const self = this;

            self._isOpen = true;
			self._navbarToggle;

			self.append(self.createNavMenu());

			if(ui.isMobile()){
				self.classList.add('mobile');
			}

			self._listeners = {
				'toggle-navbar': () => {
					self.toggleNavbar();
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
)
