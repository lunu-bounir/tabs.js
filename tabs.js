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
      this.parent = parent;
      parent.classList.add('tabs');
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
      `, 'text/html');
      this.tempate = dom.querySelector('a');
      // click
      parent.addEventListener('click', e => {
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
      parent.addEventListener('focusin', ({target}) => {
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
          this.remove(active);
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
