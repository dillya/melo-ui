/*
 * Melo UI v1.0.0 - UI
 * Copyright (C) 2020 Alexandre Dilly <dillya@sparod.com>
 */

import * as Home from './home.js';
import * as Settings from './settings.js';
import * as Browser from './browser.js';

import * as Player from './player.js';
import * as Playlist from './playlist.js';
import * as Sidebar from './sidebar.js';

import { hideOverlay } from './overlay.js';
import { hidePopover } from './popover.js';
import { parseIcon } from './utils.js';

document.getElementById('topbar-toggle').onclick = Sidebar.toggle;
document.getElementById('topbar-settings').onclick = openSettings;
document.getElementById('topbar-toggle').onclick = Sidebar.toggle;

document.getElementById('sidebar-home').onclick = openHome;
document.getElementById('sidebar-settings').onclick = openSettings;
document.getElementById('sidebar-power').onclick = powerOff;
document.getElementById('sidebar-playlists-new').onclick = Playlist.create;

document.getElementById('browser-search').onclick = Browser.toggleSearch;
document.getElementById('browser-sort').onclick = Browser.openSort;
document.getElementById('browser-display').onclick = Browser.toggleDisplay;
document.getElementById('browser-more').onclick = Browser.openMore;

document.getElementById('playlist-load').onclick = Playlist.load;
document.getElementById('playlist-unload').onclick = Playlist.unload;
document.getElementById('playlist-destroy').onclick = Playlist.destroy;

document.getElementById('player-open').onclick = Player.open;
document.getElementById('player-close').onclick = Player.close;
document.getElementById('player-shuffle').onclick = Playlist.shuffle;
document.getElementById('player-repeat').onclick = Playlist.repeat;

document.getElementById('playlist-open').onclick = Playlist.open;
document.getElementById('playlist-close').onclick = Playlist.close;
document.getElementById('playlist-toggle').onclick = Playlist.toggle;
document.getElementById('playlist-shuffle').onclick = Playlist.shuffle;
document.getElementById('playlist-repeat').onclick = Playlist.repeat;
document.getElementById('playlist-edit').onclick = Playlist.enterEdit;
document.getElementById('playlist-save').onclick = Playlist.savePlaylist;
document.getElementById('playlist-done').onclick = Playlist.exitEdit;
document.getElementById('playlist-delete').onclick = Playlist.deleteMedias;

document.addEventListener('click', function (event) {
  hidePopover(event);
  hideOverlay(event);
});

var currentOpened = document.getElementById('home');

function replaceOpened(element) {
  currentOpened.classList.add('d-none');
  currentOpened = element;
  currentOpened.classList.remove('d-none');
}

function openHome() {
  Sidebar.setHomeActive();
  replaceOpened(document.getElementById('home'));
}

function openSettings() {
  Sidebar.setSettingsActive();
  replaceOpened(document.getElementById('settings'));
  Settings.open('settings-global');
}

function openBrowser() {
  Sidebar.setBrowserActive(this.dataset.id);
  replaceOpened(document.getElementById('browser'));

  Browser.open(this.dataset.id, this.dataset.name, this.dataset.search);
}

function openPlaylist() {
  Sidebar.setPlaylistActive(this.dataset.id);
  replaceOpened(document.getElementById('playlist-browser'));

  Playlist.openList(this.dataset.id, this.dataset.name);
}

var melo = require('melo');

/* Open websocket with Melo */
var ws_ev_bro = new WebSocket("ws://" + location.host + "/api/event/browser");
ws_ev_bro.binaryType = 'arraybuffer';
ws_ev_bro.onmessage = function (event) {
  var msg = new Uint8Array(event.data);
  var ev = melo.Browser.Event.decode(msg);

  /* Handle event */
  if (ev.event === "add") {
    var desc = ev.add;
    Sidebar.addBrowser(desc.id, desc.icon, desc.name, desc.supportSearch, openBrowser);
    Home.addBrowser(desc.id, desc.icon, desc.name, desc.supportSearch, openBrowser);
    Settings.addBrowser(desc.id, desc.icon, desc.name);
  }
};
var ws_ev_plist = new WebSocket("ws://" + location.host + "/api/event/playlist");
ws_ev_plist.binaryType = 'arraybuffer';
ws_ev_plist.onmessage = function (event) {
  var msg = new Uint8Array(event.data);
  var ev = melo.Playlist.Event.decode(msg);

  /* Handle event */
  if (ev.event === "created") {
    var desc = ev.created;
    if (!desc.icon)
      desc.icon = "iconify:fa-solid:list";
    if (!desc.name)
      desc.name = "No name";
    Sidebar.addPlaylist(desc.id, desc.icon, desc.name, openPlaylist);
    Home.addPlaylist(desc.id, desc.icon, desc.name, openPlaylist)
  } else if (ev.event === "destroyed") {
    Sidebar.removePlaylist(ev.destroyed);
    Home.removePlaylist(ev.destroyed);
  } else if (ev.event === "loaded") {
    if (ev.loaded !== "default")
      document.getElementById('playlist-unload').parentElement.classList.remove('d-none');
    else
      document.getElementById('playlist-unload').parentElement.classList.add('d-none');
  }
};

function powerOff() {
  var req = new WebSocket("ws://" + location.host + "/api/request/system");
  req.binaryType = 'arraybuffer';
  req.onopen = function (event) {
    var c = { powerOff: true };
    var cmd = melo.System.Request.create(c);

    this.send(melo.System.Request.encode(cmd).finish());
  };
}
