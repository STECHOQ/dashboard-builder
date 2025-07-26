import router from '../../models/router.js';
import ui from '../../models/ui.js';

class PageLogin extends HTMLElement {
	constructor(){
		super();
	}

	createLeftCol(){
		const col = document.createElement('div');
		col.classList.add('left-col');

		const image = document.createElement('img');
		col.append(image);

		return col;
	}

	createLoginButton(){
		const self = this;

		const button = document.createElement('button');
		button.classList.add('btn');

		button.innerText = 'Masuk';
		button.addEventListener('click', async () => {
			self.login();
		})

		return button;
	}

	createRightCol(){
		const self = this;

		const col = document.createElement('div');
		col.classList.add('right-col');

		const form = document.createElement('div');
		form.classList.add('login-form');

		const title = document.createElement('h1');
		title.innerText = "TEST";
		form.append(title);

		const emailInput = document.createElement('input');
		emailInput.classList.add('form-control');
		emailInput.setAttribute('type', 'email');
		emailInput.setAttribute('placeholder', 'alamat e-mail');
		emailInput.addEventListener('keyup', ({key}) => {
			if(key == 'Enter'){
				self.login();
			}
		})

		form.append(emailInput);
		self._input.email = emailInput;

		const passwordInput = document.createElement('input');
		passwordInput.classList.add('form-control');
		passwordInput.setAttribute('type', 'password');
		passwordInput.setAttribute('placeholder', 'kata kunci');
		passwordInput.addEventListener('keyup', ({key}) => {
			if(key == 'Enter'){
				self.login();
			}
		})

		form.append(passwordInput);
		self._input.password = passwordInput;

		form.append(self.createLoginButton());

		const logo = document.createElement('img');
		//logo.setAttribute('src', config.page.image.logo);
		form.append(logo);

		col.append(form);

		return col;
	}

	async login(){
		const self = this;

		ui.setFlag({
			notification: {
				status: 'success',
				title: 'Selamat datang kembali!',
			}
		})

		router.go('/');


	}

	createBackgroundOverlay(){
		const self = this;

		const overlay = document.createElement('div');
		overlay.classList.add('overlay');

		overlay.append(self.createLeftCol());
		overlay.append(self.createRightCol());

		return overlay;
	}

	checkNotif(){
		const flag = ui.getFlag();
		if(flag?.notification){
			new Notify(flag.notification);
		}
	}

	connectedCallback(){
		const self = this;

		self.classList.add('page-login');

		window.onload = () => {
			self.classList.add('show');
			ui.triggerUpdateScreen();

			self.checkNotif();
		}

		self._input = {};

		self.append(self.createBackgroundOverlay());

		self._listeners = {
			'screen-resize': () => {

				const leftCol = self.querySelector('.left-col');
				const rightCol = self.querySelector('.right-col');
				const overlay = self.querySelector('.overlay');

				if(ui.isMobile()){
					leftCol.classList.add('mobile');
					rightCol.classList.add('mobile');
					overlay.classList.add('mobile');
				}else{
					leftCol.classList.remove('mobile');
					rightCol.classList.remove('mobile');
					overlay.classList.remove('mobile');
				}
			}
		}

		for(let key in self._listeners){
			ui.addEventListener(key, self._listeners[key]);
		}
	}

	disconnectedCallback(){
		const self = this;

		for(let key in self._listeners){
			ui.removeEventListener(key, self._listeners[key]);
		}
	}
}

export default window.customElements.define(
    'page-login',
    PageLogin,
)
