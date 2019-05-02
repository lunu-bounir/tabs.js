/* globals Tabs */
'use strict';

var tabs = new Tabs(document.getElementById('tabs-1'), {
  dark: true,
  global: true,
  locals: {
    add: 'adds a new tab'
  }
});

var index = 1;
tabs.on('new', () => {
  const tab = tabs.add('tab ' + index++);
  tabs.activate(tab);
});

for (let i = 0; i < 0; i += 1) {
  tabs.add('tab ' + index++, {
    active: i === 2
  });
}
