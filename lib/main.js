'use babel';
import {CompositeDisposable} from 'atom';
import {xkcd} from './xkcd';
import {xkcdPostView, xkcdPostViewDisposable} from './view';
import {state} from './state';

export default main = {

  disposables: null,
  view: null,
  panel: null,

  activate: function() {
    this.disposables = new CompositeDisposable();
    this.view = new xkcdPostView();

    this.disposables.add(atom.commands.add('atom-workspace', {
      'xkcd-viewer:open': () => {
        new xkcd().viewCurrent();
        this.panel = atom.workspace.addRightPanel({item: this.view, visible: false});
        this.panel.show();
      }
    }));

    state.on('post:closePanel', () => {
      this.panel.hide();
    });
  },

  deactivate: function() {
    this.disposables.dispose();
    xkcdPostViewDisposable.dispose();
    this.panel.destroy();
  }
};
