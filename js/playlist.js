/*
 * Melo UI v1.0.0 - Playlist
 * Copyright (C) 2020 Alexandre Dilly <dillya@sparod.com>
 */

import { showOverlay } from './overlay.js';
import { isMobile, parseCover } from './utils.js';

var opened = false;

/*
 * Display
 */

function open(event) {
  if (!isMobile())
    showOverlay(event, close);
  document.getElementById('playlist').classList.add('no-transform');
  document.body.classList.add('overflow-hidden');
  opened = true;
}

function close() {
  opened = false;
  document.getElementById('playlist').classList.remove('no-transform');
  document.body.classList.remove('overflow-hidden');
}

function toggle(event) {
  if (!opened)
    open(event)
}

function toggleEdit() {
  var body = document.getElementById('playlist-body');

  if (body.hasAttribute("edit"))
    body.removeAttribute("edit");
  else
    body.setAttribute("edit", "");

  event.stopPropagation();
}

function addMedia(media) {
  /* Create item */
  var item = document.createElement('div');
  item.className = 'media';
  item.innerHTML =
    '<div class="media-check media-edit"><i class="fa fa-check"></i></div>' +
    parseCover(media.cover, 'media-cover square') +
    '<div class="media-body">' +
    '  <h5>' + media.title + '</h5>' +
    '  <h6>' + media.artist + ' - ' + media.album + '</h6>' +
    '</div>' +
    '<div class="media-action media-edit">' +
    '  <a tabindex="0"><i class="fa fa-bars"></i></a>' +
    '</div>';

  document.getElementById('playlist-body').appendChild(item);
}

export { open, close, toggle, toggleEdit };

/*** Simultation ***/
for (var i = 0; i < 2; i++) {
  addMedia({id: "", cover: "img:demo/cover.jpg", title: "Title", artist: "The rolling stones", album: "Grrr!"});
  addMedia({id: "", cover: "fa:folder-open", title: "Title", artist: "Michael Jackson", album: ""});
  addMedia({id: "", cover: "img:demo/cover1.png", title: "Title", artist: "Michael Jackson", album: "Xspense"});
  addMedia({id: "", cover: "img:demo/cover2.jpg", title: "Title", artist: "AC/DC", album: "Black ICE"});
  addMedia({id: "", cover: "img:demo/cover3.jpg", title: "Title", artist: "Supertamp", album: "Breakfast in America"});
  addMedia({id: "", cover: "img:demo/cover4.jpg", title: "Title", artist: "Norah Jones", album: "Album"});
  addMedia({id: "", cover: "img:demo/cover5.jpg", title: "Title", artist: "M83", album: "Junk"});
}
