'use babel';
import {Emitter} from 'event-kit';

export const state = new Emitter();

export let store = new Map();
export let history = {};

store.set('error:connection', 'Check your connection, xkcd.com is unreachable or this comic doesn\'t exist');
store.set('error:load', 'Error downloading post');
store.set('error:bounds', 'Post not available');
store.set('error:input:type', 'Invalid comic id');
store.set('error:open:comic:link', 'An error occured opening the URL');
