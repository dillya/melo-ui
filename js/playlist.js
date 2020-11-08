/*
 * Melo UI v1.0.0 - Playlist
 * Copyright (C) 2020 Alexandre Dilly <dillya@sparod.com>
 */

import { showOverlay } from './overlay.js';
import { isMobile, parseCover, extractCover } from './utils.js';

var melo = require('melo');

// Playlist sheet / side
var opened = false;

// Event websocket
var eventWebsocket;

// Active element
var currentActive = [];

// Sort object
var lastElement = null;
var moveSource;

/*
 * Display
 */

function open(event) {
  if (!isMobile())
    showOverlay(event, close);
  document.getElementById('playlist').classList.add('no-transform');
  document.body.classList.add('overflow-hidden');
  opened = true;

  currentActive = [];

  /* Create event websocket */
  eventWebsocket =
    new WebSocket("ws://" + location.host + "/api/event/playlist");
  eventWebsocket.binaryType = 'arraybuffer';
  eventWebsocket.onmessage = function (event) {
    var msg = new Uint8Array(event.data);
    var ev = melo.Playlist.Event.decode(msg);

    /* Handle global playlist events */
    if (ev.event === "add") {
      var list = document.getElementById('playlist-body');
      for (var idx of ev.add.parent.indices)
        list = list.children[idx].lastElementChild;
      list.insertBefore(addMedia(ev.add), list.firstChild);
    } else if (ev.event === "update") {
      updateMedia(ev.update);
    } else if (ev.event === "delete") {
      var list = document.getElementById('playlist-body');
      if (ev.delete.linear) {
        var el;
        for (idx of ev.delete.first.indices) {
          el = list.children[idx];
          list = el.lastElementChild;
        }
        while (ev.delete.length--) {
          var e = el;
          el = el.nextElementSibling;
          e.remove();
        }
      } else {
        var els = []
        for (var media of ev.delete.list) {
          var next = list;
          var el;
          for (idx of media.indices) {
            el = next.children[idx];
            next = el.lastElementChild;
          }
          els.push(el);
        }
        for (var el of els)
          el.remove();
      }
    } else if (ev.event === "play") {
      var body = document.getElementById('playlist-body');
      var list = body;
      for (var idx of currentActive) {
        list.children[idx].firstElementChild.classList.remove('active');
        list = list.children[idx].lastElementChild;
      }
      list = body;
      for (var idx of ev.play.indices) {
        list.children[idx].firstElementChild.classList.add('active');
        list = list.children[idx].lastElementChild;
      }
      currentActive =  ev.play.indices;
    } else if (ev.event === "shuffle") {
      getMediaList();
    }
  };

  getMediaList();
}

function getMediaList() {
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

      var list = document.getElementById('playlist-body');
      for (var idx of resp.mediaList.current.indices) {
        list.children[idx].firstElementChild.classList.add('active');
        list = list.children[idx].lastElementChild;
      }
      currentActive = resp.mediaList.current.indices;
    }
  };
}

function close() {
  /* Exit edition */
  exitEdit();

  /* Close event websocket */
  eventWebsocket.close();
  opened = false;
  document.getElementById('playlist').classList.remove('no-transform');
  document.getElementById('playlist-body').removeAttribute("edit");
  document.body.classList.remove('overflow-hidden');
}

function toggle(event) {
  if (!opened)
    open(event)
}

function shuffle(event) {
  var shuffled = !document.getElementById('playlist-shuffle').classList.contains('active');
  var cmd = melo.Playlist.Request.create( { shuffle: shuffled } );
  var req = new WebSocket("ws://" + location.host + "/api/request/playlist");
  req.binaryType = 'arraybuffer';
  req.onopen = function (event) {
    this.send(melo.Playlist.Request.encode(cmd).finish());
  };
  event.stopPropagation();
}

function enterEdit() {
  var body = document.getElementById('playlist');
  var lists = body.getElementsByClassName('media-list');

  /* Switch to Restore default controls */
  document.getElementById('playlist-controls').classList.add('d-none');
  document.getElementById('playlist-controls-edit').classList.remove('d-none');

  for (var list of lists) {
    /* Skip not sortable lists */
    if (list !== lists[0] && list.previousElementSibling &&
        !list.previousElementSibling.hasAttribute("sortable"))
      continue;

    /* Set editable */
    list.setAttribute("edit", "");

    /* Set media list to sortable */
    Sortable.create(list, {
      group: "playlist",
      handle: ".media-action",
      multiDrag: true,
      selectedClass: "selected",

      /* Elements dragging started */
      onStart: function (event) {
        console.log(event);
        /* Save source position */
        var parents = getIndices(event.from.parentElement);
        if (event.oldIndicies.length) {
          moveSource = [];;
          for (var item of event.oldIndicies) {
            var indices = parents.slice();
            indices.push(item.index);
            moveSource.push({ indices: indices });
          }
        } else {
          parents.push(event.oldIndex);
          moveSource = { indices: parents };
        }
        console.log(moveSource);
      },

      /* Elements have been moved */
      onEnd: function (event) {
        /* Get destination */
        var ids = getIndices(event.to.parentElement)
        ids.push(event.newIndex);
        var dest = { indices: ids };

        /* Generate command */
        if (event.oldIndicies.length)
          var c = { move: { range: { linear: false, list: moveSource }, dest: dest } };
        else
          var c = { move: { range: { linear: true, first: moveSource, length: 1 }, dest: dest } };
        console.log(c);

        /* Send move request */
        var cmd = melo.Playlist.Request.create(c);
        var req = new WebSocket("ws://" + location.host + "/api/request/playlist");
        req.binaryType = 'arraybuffer';
        req.onopen = function (event) {
          this.send(melo.Playlist.Request.encode(cmd).finish());
        };
      },

      /* Multi-drag select */
      onSelect: function(event) {
        event.item.children[0].children[0].innerHTML = '<i class="fa fa-check"></i>';
        lastElement = event.item;
      },
      onDeselect: function(event) {
        event.item.children[0].children[0].innerHTML = '';
      },
    });
  }

  event.stopPropagation();
}

function exitEdit() {
  var body = document.getElementById('playlist');
  var lists = body.getElementsByClassName('media-list');

  /* Restore default controls */
  document.getElementById('playlist-controls').classList.remove('d-none');
  document.getElementById('playlist-controls-edit').classList.add('d-none');


  for (var list of lists) {
    if (list.hasAttribute("edit")) {
      /* Remove editable and destroy sortable */
      list.removeAttribute("edit");
      Sortable.get(list).destroy();
    }
  }

  event.stopPropagation();
}

function getIndices(el) {
  var indices = [];

  while (el.parentElement.classList.contains('media-list')) {
    indices.unshift(getIndex(el));
    el = el.parentElement.parentElement;
  }

  return indices;
}

function deleteMedias() {
  var body = document.getElementById('playlist-body');
  var selected = document.getElementsByClassName('selected');

  var list = [];
  for (var el of selected)
    list.push({ indices: getIndices(el) });
  console.log(list);
  var c = { delete: { linear: false, list: list } };
  var cmd = melo.Playlist.Request.create(c);

  var req = new WebSocket("ws://" + location.host + "/api/request/playlist");
  req.binaryType = 'arraybuffer';
  req.onopen = function (event) {
    this.send(melo.Playlist.Request.encode(cmd).finish());
  };

  event.stopPropagation();
}

function savePlaylist() {
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
    var cover = extractCover(media.tags.cover);
  else
    var cover = "fa:music";

  /* Create item */
  var item = document.createElement('div');
  item.className = 'media media-click'
  item.innerHTML =
    '<div class="media-check media-edit"></div>' +
    parseCover(cover, 'media-cover square') +
    '<div class="media-body">' +
    '  <h5>' + title + '</h5>' +
    '  <h6>' + subtitle + '</h6>' +
    '</div>' +
    '<div class="media-action media-edit">' +
    '  <a href="#"><i class="fa fa-bars"></i></a>' +
    '</div>';

  /* Set attributes */
  if (media.sortable)
    item.setAttribute("sortable", "");

  /* Add play action on cover and body */
  item.children[0].onclick = selectMedia;
  if (media.playable)
    item.children[1].onclick = item.children[2].onclick = playMedia;
  item.children[3].onclick = function(event) {
    event.preventDefault();
    event.stopPropagation();
  };

  return item;
}

function updateMedia(media) {
  var list = document.getElementById('playlist-body');
  for (var idx of media.parent.indices)
    list = list.children[idx].lastElementChild;
  var item = list.children[media.index].firstElementChild;

  var title = media.tags && media.tags.title ? media.tags.title : media.name;
  var subtitle = "";
  if (media.tags) {
    subtitle = media.tags.artist;
    if (media.tags.album)
      subtitle += ' / ' + media.tags.album;
  }

  var temp = document.createElement('div');
  if (media.tags && media.tags.cover)
    temp.innerHTML = parseCover(extractCover(media.tags.cover),
        "media-cover square");
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

  for (var child of media.children)
    list.appendChild(addMedia(child));

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

function getIndex(el) {
  var index = 0;

  while ((el = el.previousElementSibling))
    index++;

  return index;
}

function selectMedia(event) {
  var el = this.parentElement.parentElement;

  event.preventDefault();
  if (event.shiftKey)
    document.getSelection().removeAllRanges();

  /* Select into sortable object */
  if (el.classList.contains('selected')) {
    Sortable.utils.deselect(el);
    this.innerHTML = '';
  } else {
    /* Shift selection */
    if (event.shiftKey && lastElement) {
      var l = getIndex(lastElement);
      var c = getIndex(el);
      var e = lastElement;

      if (l < c)
        while ((e = e.nextElementSibling) != el) {
          Sortable.utils.select(e);
          e.children[0].children[0].innerHTML = '<i class="fa fa-check"></i>';
        }
      else
        while ((e = e.previousElementSibling) != el) {
          Sortable.utils.select(e);
          e.children[0].children[0].innerHTML = '<i class="fa fa-check"></i>';
        }
    }

    Sortable.utils.select(el);
    this.innerHTML = '<i class="fa fa-check"></i>';

    lastElement = el;
  }

  event.stopPropagation();
}

function playMedia(event) {
  var el = this.parentElement.parentElement;

  var indices = [];

  while (el.parentElement.classList.contains('media-list')) {
    indices.unshift(getIndex(el));
    el = el.parentElement.parentElement;
  }

  var req = new WebSocket("ws://" + location.host + "/api/request/playlist");
  req.binaryType = 'arraybuffer';
  req.onopen = function (event) {
    var c = { play: { indices: indices } };
    var cmd = melo.Playlist.Request.create(c);

    this.send(melo.Playlist.Request.encode(cmd).finish());
  };
}

export { open, close, toggle, shuffle, enterEdit, exitEdit, savePlaylist, deleteMedias };
