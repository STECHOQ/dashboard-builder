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

			const contentWrapper = document.createElement('navbar-menu-content');
			const content = document.createElement('side-bar-tabs');
			contentWrapper.append(content);
			/*contentWrapper.innerHTML = `
			<div class="tabs tabs-lift tabs-bottom rotate-90 origin-top-left translate-x-73">
  			  <input type="radio" name="my_tabs_5" class="tab" aria-label="Tab 1" checked="checked" />
  			  <div class="tab-content bg-base-100 border-base-300 p-1">
  			  	  <div class="origin-bottom-left h-full rotate-270 translate-x-60">
  			  	  	  <div class="tab-actual-content">
  			  	  	    Tab content 1
  			  	  	  </div>
  			  	  </div>
  			  </div>

  			  <input type="radio" name="my_tabs_5" class="tab" aria-label="Tab 2"/>
			  <div class="tab-content bg-base-100 border-base-300 p-1">
  			  	  <div class="origin-bottom-left h-full rotate-270 translate-x-60">
  			  	  	  <div class="tab-actual-content">
  			  	  	    Tab content 2
  			  	  	  </div>
  			  	  </div>
  			  </div>

  			  <input type="radio" name="my_tabs_5" class="tab" aria-label="Tab 3" />
			  <div class="tab-content bg-base-100 border-base-300 p-1">
  			  	  <div class="origin-bottom-left h-full rotate-270 translate-x-60">
  			  	  	  <div class="tab-actual-content">
  			  	  	    Tab content 3
  			  	  	  </div>
  			  	  </div>
  			  </div>
			</div>
			`*/
			nav.append(contentWrapper);

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
