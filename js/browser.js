/*
 * Melo UI v1.0.0 - Browser
 * Copyright (C) 2020 Alexandre Dilly <dillya@sparod.com>
 */

import { openActionSheet } from './action.js';
import { showAlert } from './alert.js';
import { openModal } from './modal.js';
import { showPopoverBottom, showPopoverLeft, hidePopover } from './popover.js';
import { createNavLink, isMobile, parseIcon, parseCover, extractCover } from './utils.js';

var melo = require('melo');

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

var countPerRequest = 50;

// Media item display (card / list)
var displayCard = true;

// Current browser ID
var currentId;
var currentPath;
var currentAuth = "";
var currentSortMenu = [];
var currentSort = [];
var currentActionMenu = [];

// Current websockets
var eventWebsocket;
var requestWebsocket; // TODO: hold multiple requests?

/*
 * Display
 */

function open(id, name, search = false) {
  /* Set browser title */
  document.getElementById('browser-title').textContent = name;

  /* Open new browser */
  if (currentId !== id) {
    /* Set new ID */
    currentId = id;

    /* Reset path */
    currentPath = undefined;

    /* Reset sort options */
    currentSort = [];
    currentSortMenu = [];
    document.getElementById('browser-sort').classList.add('disabled');

    /* Reset actions */
    currentActionMenu = [];

    /* Close previously opened websockets */
    if (eventWebsocket)
      eventWebsocket.close();
    if (requestWebsocket)
      requestWebsocket.close();

    if (search === "true") {
      document.getElementById('browser-search').classList.remove('disabled');
      document.getElementById('browser-search-input').firstElementChild.disabled = false;
    } else {
      document.getElementById('browser-search').classList.add('disabled');
      document.getElementById('browser-search-input').firstElementChild.disabled = true;
    }

    resetTab();
    resetMedias();

    /* Get root list */
    requestWebsocket =
        new WebSocket("ws://" + location.host + "/api/request/browser/" + id);
    requestWebsocket.binaryType = 'arraybuffer';
    requestWebsocket.onopen = function (event) {
      var c = { getMediaList: { query: "/", offset: 0, count: 25 } };
      var cmd = melo.Browser.Request.create(c);

      this.send(melo.Browser.Request.encode(cmd).finish());
    };
    requestWebsocket.onmessage = function (event) {
      var msg = new Uint8Array(event.data);
      var resp = melo.Browser.Response.decode(msg);

      /* Expect media list */
      if (resp.resp !== "mediaList")
        return;

      addTabs(resp.mediaList.items);

      currentPath = "/" + resp.mediaList.items[0].id;
    };
    requestWebsocket.onclose = function (event) {
      /* TODO: list */
      if (currentPath) {
        list(currentPath);
        document.getElementById('browser-tab').firstElementChild.firstElementChild.classList.add('active');
      }
    };
  }
}

function get_list(path, offset, token)
{
  console.log (path + "-" + offset + "-" + token);
  /* Get list */
  requestWebsocket =
      new WebSocket("ws://" + location.host + "/api/request/browser/" + currentId);
  requestWebsocket.binaryType = 'arraybuffer';
  requestWebsocket.onopen = function (event) {
    var c = {
      getMediaList: {
        query: path,
        auth: currentAuth,
        offset: offset,
        token: token,
        count: countPerRequest,
        sort: currentSort,
      }
    };
    var cmd = melo.Browser.Request.create(c);

    this.send(melo.Browser.Request.encode(cmd).finish());
  };
  requestWebsocket.onmessage = function (event) {
    var msg = new Uint8Array(event.data);
    var resp = melo.Browser.Response.decode(msg);

    /* Handle message */
    if (resp.resp === "mediaList") {
      addMedias(resp.mediaList.items);

      /* Update sort menu */
      if (!resp.mediaList.offset) {
        var first = true;

        currentSort = [];
        currentSortMenu = [];
        document.getElementById('browser-sort').classList.add('disabled');

        for (var menu of resp.mediaList.sortMenus) {
          if (!first)
            currentSortMenu.push({});
          for (var item of menu.items)
            currentSortMenu.push({ id: item.id, name: item.name });
          first = false;
        }
        currentSort = resp.mediaList.sort.slice();
        if (!first)
          document.getElementById('browser-sort').classList.remove('disabled');
      }

      /* Update action menu */
      if (!resp.mediaList.offset) {
        currentActionMenu = resp.mediaList.actions.slice();
      }

      /* Add "load more" item */
      if (resp.mediaList.count)
        addMore(resp.mediaList.count + resp.mediaList.offset, resp.mediaList.count, resp.mediaList.nextToken);
    } else if (resp.resp === "mediaItem") {
      updateMedia(resp.mediaItem);
    } else if (resp.resp === "error") {
      if (resp.error.code === 401) {
        var body = '<form>' +
        '  <div class="form-group">' +
        '    <label for="username">Username: </label>' +
        '    <input type="text" class="form-control" id="username">' +
        '  </div>' +
        '  <div class="form-group">' +
        '    <label for="domain">Domain: </label>' +
        '    <input type="text" class="form-control" id="domain">' +
        '  </div>' +
        '  <div class="form-group">' +
        '    <label for="password">Password: </label>' +
        '    <input type="password" class="form-control" id="password">' +
        '  </div>' +
        '</form>';
        openModal("Authentication required", body, "Ok", "Cancel", function (content) {
          var form = content.firstElementChild;
          var user = form['username'].value;
          var domain = form['domain'].value;
          var pass = form['password'].value;
          currentAuth = "";
          if (domain !== "")
            currentAuth += domain + ':';
          currentAuth += user + ':' + pass;

          list(currentPath);
        });
      } else {
        showAlert("danger", resp.error.message);
      }
    }
  }
}

function list(path) {
  requestWebsocket.close();
  resetMedias();

  /* Set current path */
  currentPath = path;

  get_list(path, 0, "");

  var prev = document.getElementById('browser-prev');
  if (path.split('/').length > 2) {
    prev.classList.remove('disabled');
    prev.onclick = previous;
  } else {
    prev.classList.add('disabled');
    prev.onclick = null;
  }
}

function previous() {
  var last = currentPath.lastIndexOf('/');
  list(currentPath.substring(0, last));
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
    if (item.children.length == 4) {
      item.children[0].className = classes.check;
      item.children[1].className = classes.cover;
      item.children[2].className = classes.body;
      item.children[3].className = classes.action;
    } else {
      item.children[0].className = classes.body;
    }
  }

  /* Replace media list class */
  list.className = classes.list;

  /* Toggle display icon */
  document.getElementById('browser-display').innerHTML =
    parseIcon(displayCard ? 'fa:th-large' : 'fa:th-list');

  displayCard = !displayCard;
}

function createSortMenu() {
  var list = document.createElement('ul');
  list.className = 'nav flex-column';
  var menu_id = 0;

  for (let item of currentSortMenu) {
    if (item.id) {
      let l = createNavLink(
          currentSort[menu_id] === item.id ? 'fa:check' : '', item.name, setSort);
      l.firstElementChild.dataset.id = item.id;
      l.firstElementChild.dataset.menu_id = menu_id;
      list.appendChild(l);
    } else {
      list.appendChild(createNavLink());
      menu_id++;
    }
  }

  return list;
}

function setSort(event) {
  currentSort[this.dataset.menu_id] = this.dataset.id;
  list(currentPath);
}

function openSort(event) {
  /* Add menu to popover */
  showPopoverBottom(event, document.getElementById('browser-tab-popover'),
    createSortMenu());
}

function openMore(event) {
  var list = document.createElement('ul');
  list.className = 'nav flex-column';
  var custom = 0;

  /* Add basic actions */
  for (let action of currentActionMenu) {
    if (action.type == 16) {
      custom++;
      continue;
    }

    /* Use default icon */
    if (!action.icon) {
      if (action.type === 1)
        var icon = "fa:play";
      else if (action.type === 2)
        var icon = "fa:plus";
      else
        var icon = "";
    } else
        var icon = action.icon;

    /* Create link */
    var item = createNavLink(icon, action.name, actionMedia);
    item.firstElementChild.dataset.id = "";
    item.firstElementChild.dataset.type = action.type;
    list.appendChild(item);
  }

  if (custom) {
    list.appendChild(createNavLink());

    /* Add custom actions */
    for (let action of currentActionMenu) {
      if (action.type != 16)
        continue;

      /* Set icon */
      var icon = action.icon ? action.icon : "";

      /* Create link */
      var item = createNavLink(icon, action.name, actionMedia);
      item.firstElementChild.dataset.id = "";
      item.firstElementChild.dataset.type = action.type;
      item.firstElementChild.dataset.customId = action.customId;
      list.appendChild(item);
    }
  }

  if (currentActionMenu.length > 0)
    list.appendChild(createNavLink());

  /* Add sort / display for mobile */
  if (isMobile()) {
    /* Add sort with its sub-menu */
    var sort = createNavLink('fa:sort', 'Sort', function(event) {
      event.currentTarget.nextElementSibling.classList.toggle('d-none');
      event.stopPropagation();
    });
    if (currentSortMenu.length > 0) {
      var sort_menu = createSortMenu();
      sort_menu.classList.add('d-none');
      sort.appendChild(sort_menu);
    } else
      sort.firstElementChild.classList.add('disabled');
    list.appendChild(sort);

    /* Add display control */
    list.appendChild(createNavLink(
      displayCard ? 'fa:th-list' : 'fa:th-large', 'Display', toggleDisplay));

    list.appendChild(createNavLink());
  }

  /* Add settings */
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

function resetMedias() {
  document.getElementById('browser-list').innerHTML = "";
}

function addMedias(medias) {
  const classes = displayCard ? listClasses.card : listClasses.media

  /* Create fragment */
  var frag = document.createDocumentFragment();

  /* Add medias */
  for (var media of medias) {
    var title = media.tags && media.tags.title ? media.tags.title : media.name;
    var subtitle = "";
    if (media.tags) {
      subtitle = media.tags.artist;
      if (media.tags.album)
        subtitle += ' / ' + media.tags.album;
    }

    if (media.tags && media.tags.cover)
      var cover = extractCover(media.tags.cover);
    else if (media.type === 1)
      var cover = "fa:music";
    else
      var cover = "fa:folder";

    /* Create item element */
    var item = document.createElement('div');
    item.className = classes.item;
    item.dataset.id = media.id;
    item.innerHTML =
      '<div class="' + classes.check + '">' + parseIcon("fa:check") + '</div>' +
      parseCover(cover, classes.cover) +
      '<div class="' + classes.body + '">' +
      '  <h5 class="card-title">' + title + '</h5>' +
      '  <h6 class="card-subtitle">' + subtitle + '</h6>' +
      '</div>' +
      '<div class="' + classes.action + '">' +
      '  <a class="d-none d-md-inline-block" href="#">' + parseIcon("fa:plus") + '</a>' +
      '  <a href="#">' + parseIcon("fa:ellipsis-h") + '</a>' +
      '</div>';

    /* Add play action on cover and body */
    // TODO: set on item and stop propagation
    item.children[1].dataset.id = media.id;
    item.children[2].dataset.id = media.id;
    if (media.type === 1)
      item.children[1].onclick = item.children[2].onclick = playMedia;
    else
      item.children[1].onclick = item.children[2].onclick = openMedia;

    /* Add actions */
    var actions = item.lastElementChild;
    actions.children[0].dataset.id = media.id;
    actions.children[0].dataset.name = title || media.id;
    actions.children[0].onclick = addMedia;
    actions.children[1].dataset.id = media.id;
    actions.children[1].dataset.name = title || media.id;
    actions.children[1].actions = media.actions.slice();
    actions.children[1].onclick = openMediaAction;

    /* Append item */
    frag.appendChild(item);
  }

  /* Append fragment */
  document.getElementById('browser-list').appendChild(frag);
}

function addMore(offset, count, token) {
  const classes = displayCard ? listClasses.card : listClasses.media

  /* Create more element */
  var item = document.createElement('div');
  item.className = classes.item;
  item.innerHTML =
      '<div class="' + classes.body + '">' +
      '  <h5 class="h-100 d-flex align-items-center justify-content-center">' +
      '    Load more' +
      '  </h5>' +
      '</div>';

  /* Add action */
  item.onclick = function (event) {
    item.parentNode.removeChild(item);
    get_list(currentPath, offset, token);
  };

  /* Append fragment */
  document.getElementById('browser-list').appendChild(item);
}

function updateMedia(media) {
  const classes = displayCard ? listClasses.card : listClasses.media
  var list = document.getElementById('browser-list');

  for (var el of list.children) {
    if (media.id === el.dataset.id) {
      if (media.tags && media.tags.title) {
        var title = el.getElementsByClassName('card-title')[0];
        var subtitle = el.getElementsByClassName('card-subtitle')[0];

        title.textContent = media.tags.title;
        subtitle.textContent = media.tags.artist + ' / ' + media.tags.album;

        if (media.tags.cover) {
          var temp = document.createElement('div');
          temp.innerHTML = parseCover(extractCover(media.tags.cover),
            classes.cover);

          el.children[1].replaceWith(temp.firstElementChild);
        }

        var actions = el.lastElementChild;
        actions.children[0].dataset.name = media.tags.title;
        actions.children[1].dataset.name = media.tags.title;
      }
    }
  }
}

function openMediaAction(event) {
  var list = document.createElement('ul');
  var id = this.dataset.id;
  var custom = 0;
  list.className = 'nav flex-column';

  /* Add basic actions */
  for (let action of this.actions) {
    if (action.type == 16) {
      custom++;
      continue;
    }

    /* Use default icon */
    if (!action.icon) {
      if (action.type === 1)
        var icon = "fa:play";
      else if (action.type === 2)
        var icon = "fa:plus";
      else
        var icon = "";
    } else
        var icon = action.icon;

    /* Create link */
    var item = createNavLink(icon, action.name, actionMedia);
    item.firstElementChild.dataset.id = id;
    if (action.type === 2)
      item.firstElementChild.dataset.name = this.dataset.name;
    item.firstElementChild.dataset.type = action.type;
    list.appendChild(item);
  }

  /* Add info link */
  item = createNavLink('fa:info', 'Info', displayMediaInfo);
  item.firstElementChild.dataset.id = id;
  item.firstElementChild.dataset.name = this.dataset.name;
  list.appendChild(item);

  if (custom) {
    list.appendChild(createNavLink());

    /* Add custom actions */
    for (let action of this.actions) {
      if (action.type != 16)
        continue;

      /* Set icon */
      var icon = action.icon ? action.icon : "";

      /* Create link */
      var item = createNavLink(icon, action.name, actionMedia);
      item.firstElementChild.dataset.id = id;
      item.firstElementChild.dataset.type = action.type;
      item.firstElementChild.dataset.customId = action.customId;
      list.appendChild(item);
    }
  }

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

function openMedia(event) {
  list(currentPath + "/" + this.dataset.id);
}

function actionMedia(event) {
  var path = currentPath.startsWith("search:") ? "search:" : currentPath + "/";
  var req = new WebSocket("ws://" + location.host + "/api/request/browser/" + currentId);
  req.binaryType = 'arraybuffer';
  req.media_id = this.dataset.id;
  req.action_type = this.dataset.type;
  req.customId = this.dataset.customId;
  req.onopen = function (event) {
    var c = {
      doAction: {
        path: path + this.media_id,
        type: this.action_type,
        customId: this.customId,
      }
    };
    var cmd = melo.Browser.Request.create(c);

    this.send(melo.Browser.Request.encode(cmd).finish());
  };
  if (this.dataset.type == 2)
    showAlert("info", this.dataset.name + " added");
  console.log("action: " + this.dataset.id + "/" + this.dataset.type);
}

function playMedia(event) {
  var path = currentPath.startsWith("search:") ? "search:" : currentPath + "/";
  var req = new WebSocket("ws://" + location.host + "/api/request/browser/" + currentId);
  req.binaryType = 'arraybuffer';
  req.media_id = this.dataset.id;
  req.onopen = function (event) {
    var c = { doAction: { path: path + this.media_id, type: 1 } };
    var cmd = melo.Browser.Request.create(c);

    this.send(melo.Browser.Request.encode(cmd).finish());
  };
  console.log("Play: " + this.dataset.id);
}

function addMedia(event) {
  var path = currentPath.startsWith("search:") ? "search:" : currentPath + "/";
  var req = new WebSocket("ws://" + location.host + "/api/request/browser/" + currentId);
  req.binaryType = 'arraybuffer';
  req.media_id = this.dataset.id;
  req.onopen = function (event) {
    var c = { doAction: { path: path + this.media_id, type: 2 } };
    var cmd = melo.Browser.Request.create(c);

    this.send(melo.Browser.Request.encode(cmd).finish());
  };
  showAlert("info", this.dataset.name + " added");
}

function displayMediaInfo(event) {
  openModal(this.dataset.name, "Not yet implemented", "Done");
}

document.getElementById('browser-search-input').firstElementChild.onkeyup = function(event) {
  if (event.key === "Enter") {
    console.log("search:" + event.currentTarget.value);
    list("search:" + event.currentTarget.value);
  }
};

/************************************/

// TODO
function resetTab() {
  document.getElementById('browser-tab').innerHTML = "";
}

function addTabs(medias) {
  /* Create fragment */
  var frag = document.createDocumentFragment();

  /* Add medias */
  for (var media of medias) {
    var cover = media.tags && media.tags.cover ? extractCover(media.tags.cover)
      : "fa:folder";
    /* Create list element */
    var li = createNavLink(cover, media.name, function (event) {
      list("/" + event.currentTarget.dataset.id);
      for (var el of document.getElementById('browser-tab').children)
        el.firstElementChild.classList.remove('active');
      event.currentTarget.classList.add('active');
    });
    li.firstElementChild.dataset.id = media.id;

    /* Add delete / eject */
    for (var action of media.actions) {
      if (action.type != 7)
        continue;
      var tmp = document.createElement("a");
      tmp.href = "#";
      tmp.className = "action";
      tmp.dataset.id = media.id;
      tmp.dataset.type = action.type;
      tmp.innerHTML = parseIcon(action.icon);
      tmp.onclick = function (event) {
        var req = new WebSocket("ws://" + location.host + "/api/request/browser/" + currentId);
        req.binaryType = 'arraybuffer';
        req.media_id = this.dataset.id;
        req.onopen = function (event) {
          var c = { doAction: { path: "/" + this.media_id, type: 7 } };
          var cmd = melo.Browser.Request.create(c);
          this.send(melo.Browser.Request.encode(cmd).finish());
        };
        req.onmessage = function (event) {
          var msg = new Uint8Array(event.data);
          var resp = melo.Browser.Response.decode(msg);

          if (resp.resp === "error")
            showAlert("danger", resp.error.message);
        }
        event.stopPropagation();
      };
      li.firstChild.appendChild(tmp);
    }

    /* Append element */
    frag.appendChild(li);
  }

  /* Append fragment */
  document.getElementById('browser-tab').appendChild(frag);

//  if (!tabs.children.length)
//    li.firstChild.classList.add('active');
}

export { open, toggleSearch, toggleDisplay, openSort, openMore };

/*** Simulation ***/

/*
addTab({id: 1, icon: "fa:folder-open", name: "Local"});
addTab({id: 2, icon: "fa:network-wired", name: "Network"});
addTab({id: 3, icon: "fa:hdd", name: "USB drive A"});
addTab({id: 4, icon: "fab:usb", name: "USB drive B"});
addTab({id: 5, icon: "fab:usb", name: "USB drive C"});
*/
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

  //addMedias(medias);
}

export { addMedias };
