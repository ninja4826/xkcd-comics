'use babel';
import fetch from 'node-fetch';
import {state, store} from './state';
import {xkcdPostViewDisposable} from './view';

export class xkcd {
  constructor() {
    this.url = 'https://xkcd.com/{id}/info.0.json';
    this.currentURL = 'https://xkcd.com/info.0.json';
    this.data = {};
  }

  view(id) {
    const url = this.url.replace(/\{id\}/, id);
    /* jshint ignore:start */
    (async() => {
      let post = await this.postMetaData(url);
      this.data = await post.json();

      if (this.data)
        state.emit('post:load', this.data);
    }());
    /* jshint ignore:end */
  }

  viewCurrent() {
    /* jshint ignore:start */
    (async() => {
      let post = await this.postMetaData(this.currentURL);
      this.data = await post.json();

      if (this.data)
        state.emit('post:load:current', this.data);
    }());
    /* jshint ignore:end */
  }

  postMetaData(url) {
    return fetch(url).then(this.promiseStatus).catch(e => {
      xkcdPostViewDisposable.add(atom.notifications.addInfo('xkcd: Error', {detail: store.get('error:load'), dismissable: true}));
    });
  }

  promiseStatus(promise) {
    if (promise.status !== 200)
      atom.notifications.addInfo('xkcd: Error', {detail: store.get('error:load'), dismissable: true});
      
    return promise;
  }
}
