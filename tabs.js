'use strict';

{
  const Emitter = typeof window.Emitter === 'undefined' ? class Emitter {
    constructor() {
      this.events = {};
    }
    on(name, callback) {
      this.events[name] = this.events[name] || [];
      this.events[name].push(callback);
    }
    once(name, callback) {
      callback.once = true;
      this.on(name, callback);
    }
    emit(name, ...data) {
      (this.events[name] || []).forEach(c => {
        c(...data);
        if (c.once) {
          const index = this.events[name].indexOf(c);
          this.events[name].splice(index, 1);
        }
      });
    }
  } : window.Emitter;

  const SimpleTabs = class extends Emitter {
    constructor(parent, properties = {}) {
      super();
      this.number = 0;
      parent.classList.add('tabs-container');
      const div = document.createElement('div');
      parent.appendChild(div);
      this.parent = div;
      div.classList.add('tabs');
      if (properties.dark) {
        parent.classList.add('dark');
      }
      const parser = new DOMParser();
      const dom = parser.parseFromString(`
        <a class="tab" href="#">
          <span data-id="title">Title</span>
          <span type="flex"></span>
          <input type="button" data-command="close" value="×">
          <input type="button" data-command="warn-n-close" value="•">
        </a>
        <svg version="1.1" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" width="14">
          <path d="M417.4,224H288V94.6c0-16.9-14.3-30.6-32-30.6c-17.7,0-32,13.7-32,30.6V224H94.6C77.7,224,64,238.3,64,256  c0,17.7,13.7,32,30.6,32H224v129.4c0,16.9,14.3,30.6,32,30.6c17.7,0,32-13.7,32-30.6V288h129.4c16.9,0,30.6-14.3,30.6-32  C448,238.3,434.3,224,417.4,224z"/>
        </svg>
      `, 'text/html');
      this.tempate = dom.querySelector('a');
      // add
      const add = document.createElement('button');
      add.addEventListener('click', () => this.emit('new'));
      add.title = properties.locales && properties.locales.add ? properties.locales.add : 'add a new tab';
      add.appendChild(dom.querySelector('svg'));
      parent.appendChild(add);
      // click
      div.addEventListener('click', e => {
        const {target} = e;
        const command = target.dataset.command;
        if (command) {
          if (command === 'close') {
            this.remove(target.closest('.tab'));
          }
          else {
            this.emit('action', target.closest('.tab'), command);
          }
        }
        e.preventDefault();
      });
      // focus
      div.addEventListener('focusin', ({target}) => {
        this.activate(target);
      });
      // keymap
      (properties.global ? window : parent).addEventListener('keydown', e => {
        this.keymap(e);
      });
    }
    keymap(e) {
      if (e.metaKey && e.code.startsWith('Digit')) {
        const num = Number(e.code.substr(5));
        e.preventDefault();
        const tab = this.parent.querySelector(`a.tab:nth-child(${num})`);
        if (tab) {
          this.activate(tab);
        }
      }
      else if (e.metaKey && e.altKey && (e.code === 'ArrowLeft' || e.code === 'ArrowRight')) {
        e.preventDefault();
        this.navigate(e.code === 'ArrowLeft' ? 'backward' : 'forward');
      }
      else if (e.metaKey && e.code === 'KeyW') {
        e.preventDefault();
        const active = this.active();
        if (active) {
          if (active.dataset.dirty === 'true') {
            this.emit('action', active, 'warn-n-close');
          }
          else {
            this.remove(active);
          }
        }
      }
    }
    add(title, properties = {}) {
      const node = this.tempate.cloneNode(true);
      node.title = node.querySelector('[data-id=title]').textContent = title;
      if (properties.dirty) {
        node.dataset.dirty = true;
      }
      this.parent.appendChild(node);
      this.emit('created', node, properties);
      if (properties.active) {
        this.activate(node);
      }
      return node;
    }
    remove(tab = this.active()) {
      if (tab && tab.classList.contains('tab') && tab.dataset.dirty !== 'true') {
        this.emit('remove', tab);
        if (tab.dataset.active === 'true') {
          this.navigate('forward') || this.navigate('backward');
        }
        tab.remove();
      }
    }
    clean(tab) {
      tab.dataset.dirty = false;
    }
    dirty(tab) {
      tab.dataset.dirty = true;
    }
    isDirty(tab) {
      return tab.dataset.dirty === 'true';
    }
    title(tab) {
      return tab.querySelector('[data-id=title]').textContent;
    }
    activate(tab) {
      if (tab && tab.classList.contains('tab') && tab.dataset.active !== 'true') {
        [...this.parent.querySelectorAll('[data-active=true]')].forEach(t => t.dataset.active = false);
        tab.dataset.active = true;
        if (document.hasFocus()) {
          tab.focus();
        }
        this.emit('select', tab);
      }
    }
    active() {
      return this.parent.querySelector('a.tab[data-active=true]');
    }
    navigate(direction = 'forward') {
      const active = this.active();
      if (active) {
        const next = direction === 'forward' ? active.nextElementSibling : active.previousElementSibling;
        this.activate(next);
        return next;
      }
    }
    list() {
      return [...this.parent.querySelectorAll('a.tab')];
    }
  };
  window.Tabs = SimpleTabs;
}
