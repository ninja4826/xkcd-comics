'use babel';
import {Emitter} from 'event-kit';

export const state = new Emitter();

export let store = new Map();
export let history = {};

store.set('error:connection', 'Check your connection, xkcd.com is unreachable');
store.set('error:load', 'Error downloading post');
store.set('error:bounds', 'Post not available');
store.set('error:openPostLink', 'An error occured opening the URL');
