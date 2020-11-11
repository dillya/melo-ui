/*
 * Melo UI v1.0.0 - Home
 * Copyright (C) 2020 Alexandre Dilly <dillya@sparod.com>
 */

import { insertSorted, parseIcon } from './utils.js';

function addCard(parent, id, icon, name, search, callback) {
  /* Create card element */
  var card = document.createElement('div');
  card.className = 'card card-click';
  card.dataset.id = id;
  card.dataset.name = name;
  card.dataset.search = search;
  card.innerHTML =
    '<div class="card-img-top card-icon square">' + parseIcon(icon) + '</div>' +
    '  <div class="card-body">' +
    '    <h5 class="card-title">' + name + '</h5>' +
    '  </div>' +
    '</div>';
  card.onclick = callback;

  /* Insert by alphabetic order */
  insertSorted(parent, card);
}

function removeCard(parent, id) {
  for (let e of parent.children)
    if (e.dataset && e.dataset.id === id) {
      e.remove();
      return;
    }
}

function addBrowser(id, icon, name, search, callback) {
  addCard(document.getElementById('home-browsers'), id, icon, name, search,
      callback);
}

function addPlaylist(id, icon, name, callback) {
  addCard(document.getElementById('home-playlists'), id, icon, name, false, 
      callback);
}

function removePlaylist(id) {
  removeCard(document.getElementById('home-playlists'), id);
}

export { addBrowser, addPlaylist, removePlaylist };
