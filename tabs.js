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
          this.emit('action', target.closest('.tab'), command);
        }
        e.preventDefault();
      });
      // focus
      parent.addEventListener('focusin', ({target}) => {
        if (target.classList.contains('tab') && target.dataset.active !== 'true') {
          [...parent.querySelectorAll('[data-active=true]')].forEach(t => t.dataset.active = false);
          target.dataset.active = true;
          this.emit('select', target);
        }
      });
    }
    add(title, properties = {}) {
      const node = this.tempate.cloneNode(true);
      node.title = node.querySelector('[data-id=title]').textContent = title;
      if (properties.dirty) {
        node.dataset.dirty = true;
      }
      this.parent.appendChild(node);
      this.emit('created', node);
      if (properties.active) {
        node.focus();
      }
    }
    clean(tab) {
      tab.dataset.dirty = false;
    }
    dirty(tab) {
      tab.dataset.dirty = true;
    }
  };
  window.Tabs = SimpleTabs;
}
