/* globals Tabs */
'use strict';

var tabs = new Tabs(document.getElementById('tabs-1'), {
  dark: false,
  global: true
});
tabs.on('created', e => console.log('created', e));
tabs.on('select', e => console.log('select', e));
tabs.on('action', (e, command) => console.log('action', e, command));
tabs.add('tab 1');
tabs.add('tab is tooooooooooo long');
tabs.add('tab 2', {
  dirty: true
});
tabs.add('tab 3', {
  active: true
});
tabs.add('tab 4');
