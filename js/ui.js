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

document.getElementById('browser-search').onclick = Browser.toggleSearch;
document.getElementById('browser-sort').onclick = Browser.openSort;
document.getElementById('browser-display').onclick = Browser.toggleDisplay;
document.getElementById('browser-more').onclick = Browser.openMore;

document.getElementById('player-open').onclick = Player.open;
document.getElementById('player-close').onclick = Player.close;

document.getElementById('playlist-open').onclick = Playlist.open;
document.getElementById('playlist-close').onclick = Playlist.close;
document.getElementById('playlist-toggle').onclick = Playlist.toggle;
document.getElementById('playlist-edit').onclick = Playlist.toggleEdit;

document.addEventListener('click', function (event) {
  hidePopover(event);
  hideOverlay(event);
});

/*** Start of simulation ***/

/* Add browsers */
/*
addBrowser({id: "com.sparod.file.browser", icon: "fa:folder-open", name: "Files"});
addBrowser({id: 2, icon: "fa:music", name: "Library"});
addBrowser({id: 3, icon: "fa:broadcast-tower", name: "Sparod radio"});
addBrowser({id: 4, icon: "fa:broadcast-tower", name: "Rad.io"});
addBrowser({id: 5, icon: "fab:spotify", name: "Spotify"});
addBrowser({id: 6, icon: "fab:youtube", name: "Youtube"});
*/

/* Add playlists */
addPlaylist({id: 1, icon: "fa:list", name: "Playlist 1"});
addPlaylist({id: 2, icon: "fa:list", name: "Playlist 2"});
addPlaylist({id: 3, icon: "fa:list", name: "Playlist 3"});
addPlaylist({id: 4, icon: "fa:list", name: "Playlist 4"});
addPlaylist({id: 5, icon: "fa:list", name: "Playlist 5"});
addPlaylist({id: 6, icon: "fa:list", name: "Playlist 6"});

/* Add settings */
addSettings({id: 1, icon: "fa:folder-open", name: "Files"});
addSettings({id: 2, icon: "fa:music", name: "Library"});
addSettings({id: 3, icon: "fa:broadcast-tower", name: "Sparod radio"});
addSettings({id: 4, icon: "fa:broadcast-tower", name: "Rad.io"});
addSettings({id: 5, icon: "fab:spotify", name: "Spotify"});
addSettings({id: 6, icon: "fab:youtube", name: "Youtube"});

/*
function addBrowser(browser) {
  Sidebar.addBrowser(browser.id, browser.icon, browser.name, openBrowser);
  Home.addBrowser(browser.id, browser.icon, browser.name, openBrowser);
}
*/

function addPlaylist(playlist) {
  Sidebar.addPlaylist(playlist.id, playlist.icon, playlist.name);
  Home.addPlaylist(playlist.id, playlist.icon, playlist.name)
}

function addSettings(settings) {
  Settings.addTab(settings.id, settings.icon, settings.name);
}

/*** End of simulation ***/

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
}

function openBrowser() {
  Sidebar.setBrowserActive(this.dataset.id);
  replaceOpened(document.getElementById('browser'));

  Browser.open(this.dataset.id, this.dataset.name, this.dataset.search);
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
  }
};
