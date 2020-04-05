/*
 * Melo UI v1.0.0 - Main javascript
 * Copyright (C) 2020 Alexandre Dilly <dillya@sparod.com>
 */

/*
 * UI
 */

/* Add default listeners */
document.getElementById('topbar-toggle').onclick = toggleSideBar;
document.getElementById('topbar-settings').onclick = openSettings;

document.getElementById('sidebar-home').onclick = openHome;
document.getElementById('sidebar-settings').onclick = openSettings;

document.getElementById('overlay').onclick = closeOverlay;
document.getElementById('actionsheet-close').onclick = closeActionSheet;

document.getElementById('player').onclick = openPlayer;
document.getElementById('playlist').onclick = openPlaylist;

/* Add browsers */
addBrowser({id: 1, icon: "fa:folder-open", name: "Files"});
addBrowser({id: 2, icon: "fa:music", name: "Library"});
addBrowser({id: 3, icon: "fa:broadcast-tower", name: "Sparod radio"});
addBrowser({id: 4, icon: "fa:broadcast-tower", name: "Rad.io"});
addBrowser({id: 5, icon: "fab:spotify", name: "Spotify"});
addBrowser({id: 6, icon: "fab:youtube", name: "Youtube"});

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
 * Utils
 */

function parseIcon(icon) {
  /* Parse icon */
  if (icon.startsWith('fa:'))
    return '<i class="fa fa-' + icon.substring(3) + '"></i>';
  else if (icon.startsWith('fab:'))
    return '<i class="fab fa-' + icon.substring(4) + '"></i>';
  else
    return '<i class="fa"></i>';
}

/*
 * Overlay
 */

var overlayCloseCallback;

function closeOverlay() {
  if (overlayCloseCallback !== undefined)
    overlayCloseCallback();

  hideOverlay();
}

function showOverlay(callback) {
  overlayCloseCallback = callback;

  overlay.style.display = 'block';
  document.body.classList.add('overflow-hidden');
}

function hideOverlay() {
  overlayCloseCallback = undefined;

  overlay.style.display = 'none';
  document.body.classList.remove('overflow-hidden');
}

/*
 * Action sheet
 */

function newActionSheet() {
  var as = document.getElementById('action-sheet');

  /* TODO: fill action sheet */
  as.getElementsByClassName('action-sheet-body')[0].innerHTML = '';

  showOverlay(closeActionSheet);
  as.classList.add('no-transform');
}

function closeActionSheet() {
  document.getElementById('action-sheet').classList.remove('no-transform');
  hideOverlay();
}

/*
 * Side bar
 */

function toggleSideBar() {
  var side = document.getElementById('side-bar').classList;

  if (side.contains('no-transform')) {
    side.remove('no-transform');
    hideOverlay();
  } else {
    showOverlay(function() {closeSideBar()});
    side.add('no-transform');
  }
}

function closeSideBar() {
  document.getElementById('side-bar').classList.remove('no-transform');
  hideOverlay();
}

function removeSideBarActive() {
  var a = document.getElementById('side-bar').getElementsByClassName('active');

  if (a.length < 1)
    return;

  a[0].classList.remove('active');
}

function genSideBarItem(id, icon, name) {
  var li = document.createElement('li');
  li.className = 'nav-item';
  li.innerHTML =
    '<a class="nav-link" href="#" data-id="' + id + '">' + icon + name + '</a>';
  li.firstElementChild.onclick = openBrowser;
  return li;
}

/*
 * Home
 */

function openHome() {
  removeSideBarActive();

  this.classList.add('active');
  document.getElementById('home').classList.remove('d-none');
  document.getElementById('settings').classList.add('d-none');
  document.getElementById('browser').classList.add('d-none');

  closeSideBar();
}

function genHomeCard(id, icon, name) {
  var card = document.createElement('div');
  card.className = 'card';
  card.innerHTML =
    '<div class="card-img-top card-icon square">' + icon + '</div>' +
    '  <div class="card-body">' +
    '    <h5 class="card-title">' + name + '</h5>' +
    '  </div>' +
    '</div>';
  card.onclick = openBrowser;
  return card;
}

/*
 * Settings
 */

function openSettings() {
  removeSideBarActive();

  if (this.id !== 'sidebar-settings')
    document.getElementById('sidebar-settings').classList.add('active');
  else
    this.classList.add('active');
  document.getElementById('home').classList.add('d-none');
  document.getElementById('settings').classList.remove('d-none');
  document.getElementById('browser').classList.add('d-none');

  closeSideBar();
}

function addSettings(settings) {
  var tabs = document.getElementById('settings-tab');
  var icon = parseIcon(settings.icon);

  /* Add element */
  tabs.innerHTML += genSettingsTab(settings.id, icon, settings.name);
}

function genSettingsTab(id, icon, name) {
  return '<li class="nav-item">' +
         '  <a class="nav-link" href="#" data-id="' + id + '">' + icon + name + '</a>' +
         '</li>';
}

/*
 * Browser
 */

function openBrowser() {
  removeSideBarActive();

  this.classList.add('active');
  document.getElementById('home').classList.add('d-none');
  document.getElementById('settings').classList.add('d-none');
  document.getElementById('browser').classList.remove('d-none');

  closeSideBar();
}

function addBrowser(browser) {
  var side = document.getElementById('sidebar-browsers');
  var home = document.getElementById('home-browsers');
  var icon = parseIcon(browser.icon);

  /* Add element */
  side.appendChild(genSideBarItem(browser.id, icon, browser.name));
  home.appendChild(genHomeCard(browser.id, icon, browser.name));
}

/*
 * Playlist
 */

function addPlaylist(playlist) {
  var side = document.getElementById('sidebar-playlists');
  var home = document.getElementById('home-playlists');
  var icon = parseIcon(playlist.icon);

  /* Add element */
  side.appendChild(genSideBarItem(playlist.id, icon, playlist.name));
  home.appendChild(genHomeCard(playlist.id, icon, playlist.name));
}

/******************************************************************************/

/*
 * UI
 */

var playerOpened = false;
var playlistOpened = false;
var browserDisplayCard = true;
var browserSearch = false;
var actionSheetOpened = false;

window.addEventListener("resize", function() {
  if (playerOpened)
    updatePlayerLayout();
}, false);

/* Initialize popover of browser nav */
initPopover(document.getElementById('browser-sort'),
  document.getElementById('browser-sort-popover'));
initPopover(document.getElementById('browser-more'),
  document.getElementById('browser-more-popover'));

/* TODO: remove */
{
  var bro_card = document.getElementById('browser-card');
  bro_card.innerHTML += bro_card.innerHTML;
  var bro_media = document.getElementById('browser-media');
  bro_media.innerHTML += bro_media.innerHTML;
  var playlist = document.getElementById('playlist-body');
  playlist.innerHTML += playlist.innerHTML;
}

/* TODO */
document.getElementById('browser-media').querySelectorAll('.media-action').forEach(item => {
  initPopoverMedia(item.lastElementChild, document.getElementById('browser-media-popover'));
});

/* Initialize duration bar of player and player bar */
initPlayerPosition(document.getElementById("player-progress"),
  document.getElementById("player-pos-popover"));
initPlayerPosition(document.getElementById("playerbar-progress"),
  document.getElementById("playerbar-pos-popover"));


/*
 * Player
 */

function updatePlayerLayout()
{
  var pl = document.getElementById("player-body");

  var size = Math.min(pl.clientWidth, pl.clientHeight);

  document.getElementById("player-cover").style.flexBasis = size + "px";
}

function openPlayer() {
  document.body.classList.add('overflow-hidden');
  document.getElementById('player').classList.add('no-transform');
  updatePlayerLayout();
  playerOpened = true;
}

function closePlayer() {
  playerOpened = false;
  document.getElementById('player').classList.remove('no-transform');
  document.body.classList.remove('overflow-hidden');
}

function initPlayerPosition(progress, popover) {
  /* Desktop version */
  progress.addEventListener("mouseenter", event => showPlayerPosition(event, popover));
  progress.addEventListener("mousemove", event => updatePlayerPosition(event, popover));
  progress.addEventListener("mouseleave", event => hidePlayerPosition(event, popover));

  /* Mobile version */
  progress.addEventListener("touchstart", event => showPlayerPosition(event, popover));
  progress.addEventListener("touchmove", event => updatePlayerPosition(event, popover));
  progress.addEventListener("touchend", event => hidePlayerPosition(event, popover));
}

function showPlayerPosition(event, elm) {
  elm.style.display = 'block';
  updatePlayerPosition(event, elm);
}

function hidePlayerPosition(event, elm) {
  elm.style.display = 'none';
}

function updatePlayerPosition(event, elm) {
  var px = event.clientX === undefined ? event.touches[0].clientX : event.clientX;

  /* Clamp position */
  if (px < event.target.offsetLeft)
    px = event.target.offsetLeft;
  else if (px > event.target.offsetLeft + event.target.offsetWidth)
    px = event.target.offsetLeft + event.target.offsetWidth;

  /* Align position */
  px -= (elm.offsetWidth / 2);

  /* Set position */
  elm.style.left = px + "px";
}

/*
 * Playlist
 */

function openPlaylist() {
  if (!playerOpened)
    document.body.classList.add('overflow-hidden');
  document.getElementById('playlist').classList.add('no-transform');
  document.getElementById('wrapper').classList.add('playlist-bar');
  document.getElementById('overlay').style.display = 'block';
  playlistOpened = true;
}

function closePlaylist() {
  if (!playerOpened)
    document.body.classList.remove('overflow-hidden');
  document.getElementById('wrapper').classList.remove('playlist-bar');
  document.getElementById('playlist').classList.remove('no-transform');
  document.getElementById('overlay').style.display = 'none';
  playlistOpened = false;
}

function togglePlaylist() {
  if (playlistOpened)
    closePlaylist()
  else
    openPlaylist()
}

function editPlaylist() {
  var body = document.getElementById('playlist-body');
  if (body.hasAttribute("edit"))
    body.removeAttribute("edit");
  else
    body.setAttribute("edit", "");
}

/*
 * Browser
 */

function toggleSearch() {
  var title = document.getElementById('browser-title').classList;
  var input = document.getElementById('browser-search').classList;
  var ctrl = document.getElementById('browser-nav-control').classList;

  if (browserSearch) {
    title.remove('d-none');
    input.add('d-none');
    ctrl.remove('d-none');
  } else {
    title.add('d-none');
    input.remove('d-none');
    ctrl.add('d-none');
  }
  browserSearch = !browserSearch;
}

function toggleDisplay() {
  var ctrl = document.getElementById('browser-display').classList;
  var as_ctrl = document.getElementById('as-display').classList; // TODO
  var card = document.getElementById('browser-card').classList;
  var media = document.getElementById('browser-media').classList;

  if (browserDisplayCard) {
    ctrl.remove('fa-th-list');
    ctrl.add('fa-th-large');
    as_ctrl.remove('fa-th-list');
    as_ctrl.add('fa-th-large');
    card.add('d-none');
    media.remove('d-none');
  } else {
    ctrl.remove('fa-th-large');
    ctrl.add('fa-th-list');
    as_ctrl.remove('fa-th-large');
    as_ctrl.add('fa-th-list');
    card.remove('d-none');
    media.add('d-none');
  }
  browserDisplayCard = !browserDisplayCard;
  if (actionSheetOpened)
    closeActionSheet();
}

function initPopover(link, popover) {
  link.addEventListener("focusin", event => showPopover(event, popover));
  link.addEventListener("focusout", event => hidePopover(event, popover));
}

function showPopover(event, pop) {
  /* Display popover content in action sheet: TODO */
  if (document.body.clientWidth < 760) {
    openActionSheet(pop.getElementsByClassName('popover-body')[0]);
    return;
  }

  pop.style.display = 'block';

  var px = event.target.offsetLeft + (event.target.offsetWidth / 2) - (pop.offsetWidth / 2);
  var py = event.target.offsetTop + event.target.offsetHeight;
  var ax = (pop.offsetWidth / 2) - (pop.firstElementChild.offsetWidth / 2);
  var diff = px + pop.offsetWidth + 16 - pop.offsetParent.offsetWidth;

  if (diff > 0) {
    px -= diff;
    ax += diff;
  }

  /* Set popover position */
  pop.style.left = px + "px";
  pop.style.top = py + "px";

  /* Set arrow position */
  pop.firstElementChild.style.left = ax + "px";
}

function hidePopover(event, pop) {
  pop.style.display = 'none';
}

/*
 * Action sheet
 */

/*
function openActionSheet(elm) {
  var as = document.getElementById('action-sheet');

  document.getElementById('overlay').style.display = 'block';
  as.classList.add('no-transform');

  actionSheetOpened = true;
}

function closeActionSheet() {
  var as = document.getElementById('action-sheet');

  actionSheetOpened = false;

  as.classList.remove('no-transform');
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('action-sheet-sort').classList.add('d-none');
}
*/
function collapseSort() {
  var as = document.getElementById('action-sheet-sort');

  if (as.classList.contains('d-none'))
    as.classList.remove('d-none');
  else
    as.classList.add('d-none');
}

// Action sheet media
function initPopoverMedia(link, popover) {
  link.addEventListener("focusin", event => openActionSheetMedia(event, popover));
  link.addEventListener("focusout", event => closeActionSheetMedia(event, popover));
}

function openActionSheetMedia(event, pop) {
  if (document.body.clientWidth < 760) {
    var as = document.getElementById('action-sheet-media');

    document.getElementById('overlay').style.display = 'block';
    as.classList.add('no-transform');

    actionSheetOpened = true;
    return;
  }

  pop.style.display = 'block';

  var px = event.target.offsetLeft - pop.offsetWidth - 16;
  var py = event.target.offsetTop + (event.target.offsetHeight / 2) - (pop.offsetHeight / 2);
  var ay = (pop.offsetHeight / 2) - (pop.firstElementChild.offsetHeight / 2);
  var diff = py + pop.offsetHeight + 16 - pop.offsetParent.offsetHeight;

  if (py < 16) {
    ay += py - 16;
    py = 16;
  }
  if (diff > 0) {
    py -= diff;
    ay += diff;
  }
  console.log(diff);


  /* Set popover position */
  pop.style.left = px + "px";
  pop.style.top = py + "px";

  /* Set arrow position */
  pop.firstElementChild.style.top = ay + "px";
}

function closeActionSheetMedia(event, pop) {
  if (document.body.clientWidth < 760) {
    var as = document.getElementById('action-sheet-media');
    actionSheetOpened = false;

    as.classList.remove('no-transform');
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('action-sheet-sort').classList.add('d-none');
    return;
  }

  pop.style.display = 'none';
}
