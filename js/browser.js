/*
 * Melo UI v1.0.0 - Browser
 * Copyright (C) 2020 Alexandre Dilly <dillya@sparod.com>
 */

import { openActionSheet } from './action.js';
import { openModal } from './modal.js';
import { showPopoverBottom, showPopoverLeft, hidePopover } from './popover.js';
import { createNavLink, isMobile, parseCover } from './utils.js';

const listClasses = {
  card: {
    list: 'card-grid',
    item: 'card card-click',
    check: 'd-none',
    cover: 'card-img-top square',
    body: 'card-body',
    action: 'd-none',
  },
  media: {
    list: 'media-list',
    item: 'media media-click',
    check: 'media-check media-edit',
    cover: 'media-cover square',
    body: 'media-body',
    action: 'media-action',
  },
};

// Media item display (card / list)
var displayCard = true;

/*
 * Display
 */

function open(id, name) {
  /* Set browser title */
  document.getElementById('browser-title').textContent = name;

  /* Get root list */
  // TODO: fill the tab bar

  /* Get root for first tab */
  // TODO: fill the browser list
}

function toggleSearch() {
  document.getElementById('browser-title').classList.toggle('d-none');
  document.getElementById('browser-search-input').classList.toggle('d-none');
  document.getElementById('browser-nav-control').classList.toggle('d-none');
}

function toggleDisplay() {
  const classes = displayCard ? listClasses.media : listClasses.card;

  /* Get media list */
  var list = document.getElementById('browser-list');

  /* Replace classes of medias */
  for (let item of list.children) {
    item.className = classes.item;
    item.children[0].className = classes.check;
    item.children[1].className = classes.cover;
    item.children[2].className = classes.body;
    item.children[3].className = classes.action;
  }

  /* Replace media list class */
  list.className = classes.list;

  /* Toggle display icon */
  var ctrl = document.getElementById('browser-display').firstElementChild
    .classList;
  ctrl.toggle('fa-th-list');
  ctrl.toggle('fa-th-large');

  displayCard = !displayCard;
//  hideOverlay(); // TODO
}

function createSortMenu() {
  var list = document.createElement('ul');
  list.className = 'nav flex-column';

  // TODO: construct from browser caps
  list.appendChild(createNavLink('fa:check', 'Ascending'));
  list.appendChild(createNavLink('', 'Descending'));
  list.appendChild(createNavLink());
  list.appendChild(createNavLink('fa:check', 'Name'));
  list.appendChild(createNavLink('', 'Title'));
  list.appendChild(createNavLink('', 'Artist'));
  list.appendChild(createNavLink('', 'Album'));
  list.appendChild(createNavLink('', 'Year'));

  return list;
}

function openSort(event) {
  /* Add menu to popover */
  showPopoverBottom(event, document.getElementById('browser-tab-popover'),
    createSortMenu());
}

function openMore(event) {
  var list = document.createElement('ul');
  list.className = 'nav flex-column';

  /* Add basic actions */
  list.appendChild(createNavLink('fa:play', 'Play all', playMedia));
  list.appendChild(createNavLink('fa:plus', 'Add all', addMedia));

  /* Add sort / display for mobile */
  if (isMobile()) {
    list.appendChild(createNavLink());

    /* Add sort with its sub-menu */
    var sort = createNavLink('fa:sort', 'Sort', function(event) {
      event.target.nextElementSibling.classList.toggle('d-none');
      event.stopPropagation();
    });
    var sort_menu = createSortMenu();
    sort_menu.classList.add('d-none');
    sort.appendChild(sort_menu);
    list.appendChild(sort);

    /* Add display control */
    list.appendChild(createNavLink(
      displayCard ? 'fa:th-list' : 'fa:th-large', 'Display', toggleDisplay));
  }

  /* Add settings */
  list.appendChild(createNavLink());
  list.appendChild(createNavLink('fa:cog', 'Settings')); //, openSettings));

  /* Add menu to action-sheet / popover */
  if (isMobile())
    openActionSheet(list);
  else
    showPopoverBottom(event, document.getElementById('browser-tab-popover'),
      list);
}

/*
 * Browser media list
 */

function addMedias(medias) {
  const classes = displayCard ? listClasses.card : listClasses.media

  /* Create fragment */
  var frag = document.createDocumentFragment();

  /* Add medias */
  medias.forEach(function (media) {
    /* Create item element */
    var item = document.createElement('div');
    item.className = classes.item;
    item.innerHTML =
      '<div class="' + classes.check + '"><i class="fa fa-check"></i></div>' +
      parseCover(media.cover, classes.cover) +
      '<div class="' + classes.body + '">' +
      '  <h5 class="card-title">' + media.title + '</h5>' +
      '  <h6 class="card-subtitle">' + media.artist + ' - ' + media.album + '</h6>' +
      '</div>' +
      '<div class="' + classes.action + '">' +
      '  <a class="d-none d-md-inline-block" href="#" data-id="' + media.id + '">' +
      '    <i class="fa fa-plus"></i>' +
      '  </a>' +
      '  <a id="more" href="#"><i class="fa fa-ellipsis-h"></i></a>' +
      '</div>';

    /* Add play action on cover and body */
    // TODO: set on item and stop propagation
    item.children[1].dataset.id = media.id;
    item.children[1].onclick = playMedia;
    item.children[2].dataset.id = media.id;
    item.children[2].onclick = playMedia;

    /* Add actions */
    var actions = item.lastElementChild;
    actions.children[0].onclick = addMedia;
    actions.children[1].addEventListener("click",
      event => openMediaAction(event, media.id));

    /* Append item */
    frag.appendChild(item);
  });

  /* Append fragment */
  document.getElementById('browser-list').appendChild(frag);
}

function openMediaAction(event, id) {
  var list = document.createElement('ul');
  list.className = 'nav flex-column';

  /* Add basic actions */
  var item = createNavLink('fa:play', 'Play', playMedia);
  item.firstElementChild.dataset.id = id;
  list.appendChild(item);
  item = createNavLink('fa:plus', 'Add', addMedia);
  item.firstElementChild.dataset.id = id;
  list.appendChild(item);
  item = createNavLink('fa:info', 'Info', displayMediaInfo);
  item.firstElementChild.dataset.id = id;
  list.appendChild(item);

  list.appendChild(createNavLink());

  /* Add custom actions */
  list.appendChild(createNavLink('fa:search', 'Scan'));

  /* Add menu to action-sheet / popover */
  if (isMobile())
    openActionSheet(list);
  else
    showPopoverLeft(event, document.getElementById('browser-media-popover'),
      list);
}

/*
 * Actions
 */

function playMedia(event) {
  console.log("Play: " + this.dataset.id);
}

function addMedia(event) {
  console.log("Add: " + this.dataset.id);
}

function displayMediaInfo(event) {
  console.log("Info: " + this.dataset.id);
  openModal();
}

/************************************/

// TODO
function addTab(tab) {
  var tabs = document.getElementById('browser-tab');

  /* Create list element */
  var li = createNavLink(tab.icon, tab.name);

  if (!tabs.children.length)
    li.firstChild.classList.add('active');

  tabs.appendChild(li);
}

export { open, toggleSearch, toggleDisplay, openSort, openMore };

/*** Simulation ***/

addTab({id: 1, icon: "fa:folder-open", name: "Local"});
addTab({id: 2, icon: "fa:network-wired", name: "Network"});
addTab({id: 3, icon: "fa:hdd", name: "USB drive A"});
addTab({id: 4, icon: "fab:usb", name: "USB drive B"});
addTab({id: 5, icon: "fab:usb", name: "USB drive C"});

for (var i = 0; i < 15; i++) {
  var medias = [
    {id: "rol", cover: "img:demo/cover.jpg", title: "Title", artist: "The rolling stones", album: "Grrr!"},
    {id: "fol", cover: "fa:folder-open", title: "Title", artist: "Michael Jackson", album: ""},
    {id: "mic", cover: "img:demo/cover1.png", title: "Title", artist: "Michael Jackson", album: "Xspense"},
    {id: "acd", cover: "img:demo/cover2.jpg", title: "Title", artist: "AC/DC", album: "Black ICE"},
    {id: "sup", cover: "img:demo/cover3.jpg", title: "Title", artist: "Supertamp", album: "Breakfast in America"},
    {id: "nor", cover: "img:demo/cover4.jpg", title: "Title", artist: "Norah Jones", album: "Album"},
    {id: "m83", cover: "img:demo/cover5.jpg", title: "Title", artist: "M83", album: "Junk"},
  ];

  addMedias(medias);
}
