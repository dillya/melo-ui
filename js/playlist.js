/*
 * Melo UI v1.0.0 - Playlist
 * Copyright (C) 2020 Alexandre Dilly <dillya@sparod.com>
 */

import { showOverlay } from './overlay.js';
import { isMobile, parseCover } from './utils.js';

var melo = require('melo');

// Playlist sheet / side
var opened = false;

// Event websocket
var eventWebsocket;

// Active element
var currentActive = 0;
var currentSubActive = 0;

/*
 * Display
 */

function open(event) {
  if (!isMobile())
    showOverlay(event, close);
  document.getElementById('playlist').classList.add('no-transform');
  document.body.classList.add('overflow-hidden');
  opened = true;

  currentActive = 0;
  currentSubActive = 0;

  /* Create event websocket */
  eventWebsocket =
    new WebSocket("ws://" + location.host + "/api/event/playlist");
  eventWebsocket.binaryType = 'arraybuffer';
  eventWebsocket.onmessage = function (event) {
    var msg = new Uint8Array(event.data);
    var ev = melo.Playlist.Event.decode(msg);

    /* Handle global playlist events */
    if (ev.event === "add") {
      console.log(ev.add.name);
      var body = document.getElementById('playlist-body');
      body.insertBefore(addMedia(ev.add), body.firstChild);
      currentActive++;
    } else if (ev.event === "addSub") {
      console.log("add_sub: " + ev.addSub.name);
      /* TODO: add sub media */
    } else if (ev.event === "update") {
      console.log("update: " + ev.update.index);
      updateMedia(ev.update);
    } else if (ev.event === "updateSub") {
      console.log("update_sub: " + ev.updateSub.index + ":" + ev.updateSub.parent);
      updateMedia(ev.updateSub);
    } else if (ev.event === "play") {
      var body = document.getElementById('playlist-body');
      /* TODO: update sub media index */
      if (currentActive < body.children.length) {
        body.children[currentActive].firstElementChild.classList.remove('active');
        if (currentSubActive >= 0 && currentSubActive < body.children[currentActive].lastElementChild.children.length)
          body.children[currentActive].lastElementChild.children[currentSubActive].classList.remove('active');
      }
      if (ev.play.index < body.children.length) {
        body.children[ev.play.index].firstElementChild.classList.add('active');
        if (ev.play.subIndex >= 0 && ev.play.subIndex < body.children[ev.play.index].lastElementChild.children.length)
          body.children[ev.play.index].lastElementChild.children[ev.play.subIndex].classList.add('active');
      }
      currentActive = ev.play.index;
      currentSubActive = ev.play.subIndex;
      console.log(ev.play.index);
    }
  };

  resetMedias();

  /* Get playlist */
  var req =
    new WebSocket("ws://" + location.host + "/api/request/playlist");
  req.binaryType = 'arraybuffer';
  req.onopen = function (event) {
    var c = { getMediaList: { offset: 0, count: 100 } };
    var cmd = melo.Playlist.Request.create(c);

    this.send(melo.Playlist.Request.encode(cmd).finish());
  };
  req.onmessage = function (event) {
    var msg = new Uint8Array(event.data);
    var resp = melo.Playlist.Response.decode(msg);

    /* Handle media list */
    if (resp.resp === "mediaList") {
      console.log(resp.mediaList.offset + " - " + resp.mediaList.count + " - " +
          resp.mediaList.current.index + ":" + resp.mediaList.current.subIndex);
      addMedias(resp.mediaList.medias);

      var body = document.getElementById('playlist-body');
      if (currentActive < body.children.length) {
        body.children[currentActive].firstElementChild.classList.remove('active');
        if (currentSubActive >= 0 && currentSubActive < body.children[currentActive].lastElementChild.children.length)
          body.children[currentActive].lastElementChild.children[currentSubActive].classList.remove('active');
      }
      if (resp.mediaList.current.index < body.children.length) {
        body.children[resp.mediaList.current.index].firstElementChild.classList.add('active');
        if (resp.mediaList.current.subIndex >= 0 && resp.mediaList.current.subIndex < body.children[resp.mediaList.current.index].lastElementChild.children.length)
          body.children[resp.mediaList.current.index].lastElementChild.children[resp.mediaList.current.subIndex].classList.add('active');
      }
      currentActive = resp.mediaList.current.index;
      currentSubActive = resp.mediaList.current.subIndex;
    }
  };
}

function close() {
  /* Close event websocket */
  eventWebsocket.close();

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

function resetMedias() {
  document.getElementById('playlist-body').innerHTML = "";
}

function genMedia(media) {
  var title = media.tags && media.tags.title ? media.tags.title : media.name;
  var subtitle = "";
  if (media.tags) {
    subtitle = media.tags.artist;
    if (media.tags.album)
      subtitle += ' / ' + media.tags.album;
  }

  if (media.tags && media.tags.cover)
    var cover = "img:asset/" + media.tags.cover;
  else
    var cover = "fa:music";

  /* Create item */
  var item = document.createElement('div');
  item.className = 'media media-click'
  item.innerHTML =
    '<div class="media-check media-edit"><i class="fa fa-check"></i></div>' +
    parseCover(cover, 'media-cover square') +
    '<div class="media-body">' +
    '  <h5>' + title + '</h5>' +
    '  <h6>' + subtitle + '</h6>' +
    '</div>' +
    '<div class="media-action media-edit">' +
    '  <a tabindex="0"><i class="fa fa-bars"></i></a>' +
    '</div>';

  /* Add play action on cover and body */
  // TODO: set on item and stop propagation
  item.children[1].onclick = item.children[2].onclick = playMedia;

  return item;
}

function updateMedia(media) {
  var body = document.getElementById('playlist-body');

  if (media.parent !== undefined) {
    if (media.parent >= body.children.length)
      return;
    body = body.children[media.parent].lastElementChild;

    if (media.index >= body.children.length)
      return;
    var item = body.children[media.index];
  } else {
    if (media.index >= body.children.length)
      return;
    var item = body.children[media.index].firstElementChild;
  }

  var title = media.tags && media.tags.title ? media.tags.title : media.name;
  var subtitle = "";
  if (media.tags) {
    subtitle = media.tags.artist;
    if (media.tags.album)
      subtitle += ' / ' + media.tags.album;
  }

  var temp = document.createElement('div');
  if (media.tags && media.tags.cover)
    temp.innerHTML = parseCover("img:asset/" + media.tags.cover, "media-cover square");
  else
    temp.innerHTML = parseCover("fa:music", "media-cover square");

  item.children[1].replaceWith(temp.firstElementChild);
  item.children[2].children[0].innerHTML = title;
  item.children[2].children[1].innerHTML = subtitle;
}

function addMedia(media) {
  var item = document.createElement('div');
  item.appendChild(genMedia(media));

  var list = document.createElement('div');
  list.className = 'media-list ml-4';
  for (var sub of media.subMedias)
    list.appendChild(genMedia(sub));
  item.appendChild(list);

  return item;
}

function addMedias(medias) {
  /* Create fragment */
  var frag = document.createDocumentFragment();

  /* Add medias */
  for (var media of medias)
    frag.appendChild(addMedia(media));

  document.getElementById('playlist-body').appendChild(frag);
}

function playMedia(event) {
  var par = this.parentNode.parentNode;
  var sub_id = -1;

  /* Find sub-media index */
  if (this.parentElement.parentElement.classList.contains('media-list')) {
    par = this.parentNode;
    sub_id = 0;
    while (par.previousSibling !== null) {
      par = par.previousSibling;
      sub_id++;
    }
    par = this.parentNode.parentNode.parentNode;
  }

  /* Find media index */
  var id = 0;
  while (par.previousSibling !== null) {
    par = par.previousSibling;
    id++;
  }

  var req = new WebSocket("ws://" + location.host + "/api/request/playlist");
  req.binaryType = 'arraybuffer';
  req.onopen = function (event) {
    var c = { play: { index: id, subIndex: sub_id } };
    var cmd = melo.Playlist.Request.create(c);

    this.send(melo.Playlist.Request.encode(cmd).finish());
  };
}

export { open, close, toggle, toggleEdit };

/*** Simultation ***/
/*
for (var i = 0; i < 2; i++) {
  addMedia({id: "", cover: "img:demo/cover.jpg", title: "Title", artist: "The rolling stones", album: "Grrr!"});
  addMedia({id: "", cover: "fa:folder-open", title: "Title", artist: "Michael Jackson", album: ""});
  addMedia({id: "", cover: "img:demo/cover1.png", title: "Title", artist: "Michael Jackson", album: "Xspense"});
  addMedia({id: "", cover: "img:demo/cover2.jpg", title: "Title", artist: "AC/DC", album: "Black ICE"});
  addMedia({id: "", cover: "img:demo/cover3.jpg", title: "Title", artist: "Supertamp", album: "Breakfast in America"});
  addMedia({id: "", cover: "img:demo/cover4.jpg", title: "Title", artist: "Norah Jones", album: "Album"});
  addMedia({id: "", cover: "img:demo/cover5.jpg", title: "Title", artist: "M83", album: "Junk"});
}
*/
