/*
 * Melo UI v1.0.0 - Side bar
 * Copyright (C) 2020 Alexandre Dilly <dillya@sparod.com>
 */

import { showOverlay } from './overlay.js';
import { createNavLink, insertSorted } from './utils.js';

// Active nav item
var activeNav = document.getElementById('sidebar-home');

/*
 * Display
 */

function toggle() {
  var side = document.getElementById('side-bar').classList;

  if (side.contains('no-transform')) {
    side.remove('no-transform');
  } else {
    showOverlay(event, close);
    side.add('no-transform');
  }
}

function close() {
  document.getElementById('side-bar').classList.remove('no-transform');
}

/*
 * Navigation
 */

function addItem(parent, id, icon, name, callback) {
  /* Create list element */
  var li = createNavLink(icon, name, callback);
  li.firstElementChild.dataset.id = id;
  li.firstElementChild.dataset.name = name;
  li.dataset.name = name;

  /* Insert by alphabetic order */
  insertSorted(parent, li);
}

function addBrowser(id, icon, name, callback) {
  addItem(document.getElementById('sidebar-browsers'), id, icon, name,
    callback);
}

function addPlaylist(id, icon, name) {
  addItem(document.getElementById('sidebar-playlists'), id, icon, name, null);
}

/*
 * Nav item
 */

function replaceActive(element) {
  activeNav.classList.remove('active');
  activeNav = element;
  activeNav.classList.add('active');
}

function setHomeActive() {
  replaceActive(document.getElementById('sidebar-home'));
}

function setSettingsActive() {
  replaceActive(document.getElementById('sidebar-settings'));
}

function setBrowserActive(id) {
  var browsers = document.getElementById('sidebar-browsers');

  for (let e of browsers.children)
    if (e.firstChild.dataset.id === id) {
      replaceActive(e.firstChild);
      return;
    }
}

export { toggle };
export { setHomeActive, setSettingsActive, setBrowserActive };
export { addBrowser, addPlaylist };
