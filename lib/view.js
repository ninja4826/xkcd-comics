'use babel';
import {CompositeDisposable} from 'atom';
import {xkcd as _xkcd} from './xkcd';
import {state, store} from './state';
import debounce from 'lodash/function/debounce';
import opn from 'opn';

export let xkcdPostViewDisposable = null;

export class xkcdPostView extends HTMLElement {
	createdCallback() {
		xkcdPostViewDisposable = new CompositeDisposable();
		this.xkcd = new _xkcd();
		this.classList.add('xkcdimage-view');

		this.postSection = document.createElement('section');
		this.buttonSection = document.createElement('div');

		this.postTitle = document.createElement('h2');
		this.postDescription = document.createElement('span');
		this.postTranscript = document.createElement('span');
		this.postImage = document.createElement('img');

		this.gotoId = document.createElement('atom-text-editor');

		this.previousButton = document.createElement('button');
		this.currentButton = document.createElement('button');
		this.nextButton = document.createElement('button');
		this.postLinkButton = document.createElement('button');
		this.closeButton = document.createElement('button');

		this.postSection.classList.add('xkcd-content');
		this.postTitle.classList.add('xkcd-title', 'text-warning');
		this.postDescription.classList.add('xkcd-description');
		this.postTranscript.classList.add('xkcd-transcript', 'text-info');
		this.postImage.classList.add('xkcd-image');
		this.gotoId.classList.add('xkcd-gotoId', 'inline-block-tight');
		this.gotoId.setAttribute('mini', true);

		this.buttonSection.classList.add('xkcd-buttons');
		this.nextButton.classList.add('btn', 'inline-block-tight');
		this.previousButton.classList.add('btn', 'inline-block-tight');
		this.currentButton.classList.add('btn', 'inline-block-tight');
		this.postLinkButton.classList.add('btn', 'inline-block-tight', 'icon', 'icon-link-external', 'btn-success');
		this.closeButton.classList.add('btn', 'inline-block-tight', 'icon', 'icon-x', 'btn-error', 'xkcd-close');

		this.previousButton.textContent = 'Previous';
		this.currentButton.textContent = `Current`;
		this.nextButton.textContent = 'Next';
		this.postLinkButton.textContent = 'Open in xkcd';
		this.closeButton.textContent = 'Close';

		const debounce_view_post = debounce((id) => this.xkcd.view((id)), 350);
		const debounce_view_current_post = debounce(() => this.xkcd.viewCurrent(), 350);
		const debounce_view_post_link = debounce((id) => {
			opn(`https://xkcd.com/${id}`, error => {
				if (error)
					return xkcdPostViewDisposable.add(atom.notifications.addWarning('xkcd', {detail: store.get('error:open:comic:link')}));
			});
		}, 350);

		let gotoIdModel = this.gotoId.getModel();
		gotoIdModel.setPlaceholderText('Input post ID and press \'enter\'');

		this.gotoId.addEventListener('keydown', (e) => {
			let id = Number(gotoIdModel.getText());
			console.info(id);
			console.info(e);

			if (e.keyCode == 13)
				if (isNaN(id))
					xkcdPostViewDisposable.add(atom.notifications.addInfo('xkcd', {detail: store.get('error:input:type')}));
				else
					debounce_view_post(id);
		});

		this.previousButton.addEventListener('click', () => {
			const id = this.postId - 1;
			if (id === 0)
				this.outOfBounds();
			else
				debounce_view_post(id);
		});

		this.currentButton.addEventListener('click', () => {
				if (this.current == this.postId)
					return;
				else
					debounce_view_current_post();
		});

		this.nextButton.addEventListener('click', () => {
			const id = this.postId + 1;
				if (id > this.current)
					this.outOfBounds();
				else
					debounce_view_post(id);
		});

		this.postLinkButton.addEventListener('click', () => {
			const id = this.postId;
			debounce_view_post_link(id);
		});

		this.closeButton.addEventListener('click', () => {
			state.emit('post:closePanel');
		});
	}

	attachedCallback() {
		state.on('post:load:current', (data) => {
			this.current = data.num;
			this.updatePost(data);
		});

		state.on('post:load', (data) => {
			this.updatePost(data);
		});
	}

	detachedCallback() {
		this.detach();
	}

	updatePost(data) {
		this.detach();

		this.postId = data.num;
		this.postTitle.textContent = `[${data.num}] ${data.title}`;
		this.postDescription.textContent = data.alt;
		this.postTranscript.textContent = `${data.transcript === '' ? '' : data.transcript.replace(/[\[\[\]\]\{\{\}\}]/g, '')}`;
		this.postImage.src = data.img;

		this.postDescription.appendChild(this.postTranscript);
		this.postSection.appendChild(this.postTitle);
		this.postSection.appendChild(this.postDescription);

		this.appendChild(this.postSection);
		this.appendChild(this.postImage);

		xkcdPostViewDisposable.add(atom.tooltips.add(this.currentButton, {title: `Current (${this.current})`}));

		this.buttonSection.appendChild(this.previousButton);
		this.buttonSection.appendChild(this.currentButton);
		this.buttonSection.appendChild(this.nextButton);
		this.buttonSection.appendChild(this.gotoId);
		this.buttonSection.appendChild(this.postLinkButton);
		this.buttonSection.appendChild(this.closeButton);
		this.appendChild(this.buttonSection);
	}

	outOfBounds() {
		return xkcdPostViewDisposable.add(atom.notifications.addInfo('xkcd', {detail: store.get('error:bounds')}));
	}

	detach() {
		while (this.firstChild) {
			this.removeChild(this.firstChild);
		}
	}
}

xkcdPostView = document.registerElement('xkcdimage-view', xkcdPostView);
