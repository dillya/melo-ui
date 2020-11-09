/*
 * Melo UI v1.0.0 - Player
 * Copyright (C) 2020 Alexandre Dilly <dillya@sparod.com>
 */

import { parseIcon, parseCover, extractCover } from './utils.js';
import { showAlert } from './alert.js';

import * as Settings from './settings.js';

var melo = require('melo');

// Mobile player sheet
var opened = false;

// Current websockets
var eventWebsocket;
var retryWebsocket = 3;

// Current position
var currentState = 0;
var currentStreamState = 0;
var currentPosition = 0;
var currentDuration = 0;
var currentTimer;

// Current mute
var currentMute = false;

/*
 * Display
 */

window.addEventListener("resize", function () {
  if (opened)
    updateLayout();
}, false);

startEvent();

function startEvent() {
  eventWebsocket =
          new WebSocket("ws://" + location.host + "/api/event/player");
  eventWebsocket.binaryType = 'arraybuffer';
  eventWebsocket.onmessage = function (event) {
    var msg = new Uint8Array(event.data);
    var ev = melo.Player.Event.decode(msg);

    if (ev.event === "add") {
      Settings.addPlayer(ev.add.id, ev.add.icon, ev.add.name);
    } else if (ev.event === "media") {
      var media = document.getElementById('player-open');
      var title = media.getElementsByClassName('title')[0];
      var subtitle = media.getElementsByClassName('subtitle')[0];

      var media2 = document.getElementById('player-body');
      var title2 = media2.getElementsByClassName('title')[0];
      var subtitle2 = media2.getElementsByClassName('subtitle')[0];

      if (ev.media.tags && ev.media.tags.title) {
        title.textContent = ev.media.tags.title;
        subtitle.textContent = ev.media.tags.artist + ' / ' + ev.media.tags.album;
        title2.textContent = ev.media.tags.title;
        subtitle2.textContent = ev.media.tags.artist + ' / ' + ev.media.tags.album;
      } else {
        title.textContent = ev.media.name;
        subtitle.textContent = "---";
        title2.textContent = ev.media.name;
        subtitle2.textContent = "---";
      }
      var temp = document.createElement('div');
      if (ev.media.tags && ev.media.tags.cover)
        temp.innerHTML = parseCover(extractCover(ev.media.tags.cover), "media-cover square");
      else
        temp.innerHTML = parseCover("fa:music", "media-cover square");
      var temp2 = temp.cloneNode(true);
      media.firstElementChild.replaceWith(temp.firstElementChild);
      temp2.firstElementChild.id = "player-cover";
      temp2.firstElementChild.className = "";
      media2.firstElementChild.replaceWith(temp2.firstElementChild);
      updateLayout();

    } else if (ev.event === "status") {
      currentState = ev.status.state;

      if (ev.status.streamState && currentTimer) {
        clearInterval(currentTimer);
        currentTimer = undefined;
      }

      var ctrl = document.getElementById('playerbar-play');
      var ctrl2 = document.getElementById('player-play');
      if (ev.status.state === 1) { /* playing */
        ctrl.innerHTML = ctrl2.innerHTML = parseIcon("fa:pause");
        if (ev.status.streamState === 0 && !currentTimer)
          currentTimer = setInterval(function() {
            currentPosition += 1000;
            document.getElementById('playerbar-elapsed').textContent =
                printTime(currentPosition / 1000);
            document.getElementById('player-elapsed').textContent =
                printTime(currentPosition / 1000);
            var percent = currentDuration ? currentPosition / (currentDuration / 100) : 0;
            document.getElementById('playerbar-progress').firstElementChild.style.width = percent + "%";
            document.getElementById('player-progress').firstElementChild.style.width = percent + "%";
          }, 1000);
      } else { /* !playing */
        ctrl.innerHTML = ctrl2.innerHTML = parseIcon("fa:play");
        if (currentTimer)
          clearInterval(currentTimer);
        if (ev.status.state !== 2)
          currentPosition = currentDuration = 0;
        currentTimer = undefined;
      }

      if (ev.status.streamState === 1) { /* loading */
        var prog = document.getElementById('playerbar-progress').firstElementChild;
        prog.classList.add('progress-bar-striped');
        prog.classList.add('progress-bar-animated');
        prog.style.width = "100%";
        var prog = document.getElementById('player-progress').firstElementChild;
        prog.classList.add('progress-bar-striped');
        prog.classList.add('progress-bar-animated');
        prog.style.width = "100%";
      } else if (ev.status.streamState === 2) { /* buffering */
        var prog = document.getElementById('playerbar-progress').firstElementChild;
        prog.classList.add('progress-bar-striped');
        prog.classList.add('bg-warning');
        prog.style.width = ev.status.value + "%";
        var prog2 = document.getElementById('player-progress').firstElementChild;
        prog.classList.add('progress-bar-striped');
        prog.classList.add('bg-warning');
        prog2.style.width = ev.status.value + "%";
      } else { /* none */
        var prog = document.getElementById('playerbar-progress').firstElementChild;
        prog.classList.remove('progress-bar-striped');
        prog.classList.remove('progress-bar-animated');
        prog.classList.remove('bg-warning');
        var prog2 = document.getElementById('player-progress').firstElementChild;
        prog2.classList.remove('progress-bar-striped');
        prog2.classList.remove('progress-bar-animated');
        prog2.classList.remove('bg-warning');
      }

      if (ev.status.state === 0) { /* none */
        ctrl.classList.add('disabled');
        ctrl2.classList.add('disabled');
      } else { /* !none */
        ctrl.classList.remove('disabled');
        ctrl2.classList.remove('disabled');
      }
      currentStreamState = ev.status.streamState;
    } else if (ev.event === "position") {
      currentPosition = ev.position.position;
      currentDuration = ev.position.duration;
      document.getElementById('playerbar-elapsed').textContent =
          printTime(currentPosition / 1000);
      document.getElementById('playerbar-duration').textContent =
          printTime(currentDuration / 1000);
      document.getElementById('player-elapsed').textContent =
          printTime(currentPosition / 1000);
      document.getElementById('player-duration').textContent =
          printTime(currentDuration / 1000);

      if (!currentStreamState) {
        var percent = currentDuration ? currentPosition / (currentDuration / 100) : 0;
        document.getElementById('playerbar-progress').firstElementChild.style.width = percent + "%";
        document.getElementById('player-progress').firstElementChild.style.width = percent + "%";
      }
    } else if (ev.event === "volume") {
      console.log("Volume: " + ev.volume.volume);
      document.getElementById('playerbar-vol').firstElementChild.value = ev.volume.volume * 100;
      document.getElementById('player-vol').firstElementChild.value = ev.volume.volume * 100;
      if (ev.volume.mute) {
        document.getElementById('playerbar-vol-down').innerHTML =
          document.getElementById('player-vol-down').innerHTML =
            parseIcon("fa:volume-mute");
        document.getElementById('playerbar-vol').firstElementChild.disabled = true;
        document.getElementById('player-vol').firstElementChild.disabled = true;
      } else {
        document.getElementById('playerbar-vol-down').innerHTML =
          document.getElementById('player-vol-down').innerHTML =
            parseIcon("fa:volume-down");
        document.getElementById('playerbar-vol').firstElementChild.disabled = false;
        document.getElementById('player-vol').firstElementChild.disabled = false;
      }
      currentMute = ev.volume.mute;
    } else if (ev.event === "error") {
      showAlert("danger", 'Failed to play media: ' + ev.error);
    } else if (ev.event === "playlist") {
      if (ev.playlist.prev) {
        document.getElementById('playerbar-backward').classList.remove('disabled');
        document.getElementById('player-backward').classList.remove('disabled');
      } else {
        document.getElementById('playerbar-backward').classList.add('disabled');
        document.getElementById('player-backward').classList.add('disabled');
      }
      if (ev.playlist.next) {
        document.getElementById('playerbar-forward').classList.remove('disabled');
        document.getElementById('player-forward').classList.remove('disabled');
      } else {
        document.getElementById('playerbar-forward').classList.add('disabled');
        document.getElementById('player-forward').classList.add('disabled');
      }
      if (ev.playlist.shuffle) {
        document.getElementById('player-shuffle').classList.add('active');
        document.getElementById('playlist-shuffle').classList.add('active');
      } else {
        document.getElementById('player-shuffle').classList.remove('active');
        document.getElementById('playlist-shuffle').classList.remove('active');
      }
    }
  };
  eventWebsocket.onclose = function (event) {
    if (currentTimer) {
        clearInterval(currentTimer);
        currentTimer = undefined;
    }
    if (retryWebsocket) {
      setTimeout(startEvent(), 1000);
      retryWebsocket--;
    }
  };
}

function open() {
  document.getElementById('player').classList.add('no-transform');
  document.body.classList.add('overflow-hidden');
  updateLayout();
  opened = true;
}

function close() {
  opened = false;
  document.body.classList.remove('overflow-hidden');
  document.getElementById('player').classList.remove('no-transform');
}

function updateLayout()
{
  var pl = document.getElementById("player-body");

  var size = Math.min(pl.clientWidth, pl.clientHeight);

  var cover = document.getElementById("player-cover");
  cover.style.flexBasis = size + "px";
  if (cover.firstElementChild && cover.firstElementChild.tagName === "I") {
    var size = Math.min(cover.offsetWidth, cover.offsetHeight);
    cover.firstElementChild.style.fontSize = size / 2 + "px";
    cover.firstElementChild.style.paddingTop = (cover.offsetHeight / 4) - 16 + "px";
  }
}

function printTime(value)
{
  if (value > 3600)
    return ~~(value / 3660) + ":" + ('0' + ~~((value % 3600) / 60)).slice(-2) +
        ":" + ('0' + ~~(value % 60)).slice(-2);
  else
    return ~~(value / 60) + ":" + ('0' + ~~(value % 60)).slice(-2);
}

function playCtrl() {
  if (currentState === 1)
    var state = 2;
  else
    var state = 1;

  console.log("play: " + state);

  var req = new WebSocket("ws://" + location.host + "/api/request/player");
  req.binaryType = 'arraybuffer';
  req.onopen = function (event) {
    var c = { setState: state };
    var cmd = melo.Player.Request.create(c);

    this.send(melo.Player.Request.encode(cmd).finish());
  };
}

function previousCtrl() {
  var req = new WebSocket("ws://" + location.host + "/api/request/player");
  req.binaryType = 'arraybuffer';
  req.onopen = function (event) {
    var c = { playPrevious: true };
    var cmd = melo.Player.Request.create(c);

    this.send(melo.Player.Request.encode(cmd).finish());
  };
}

function nextCtrl() {
  var req = new WebSocket("ws://" + location.host + "/api/request/player");
  req.binaryType = 'arraybuffer';
  req.onopen = function (event) {
    var c = { playNext: true };
    var cmd = melo.Player.Request.create(c);

    this.send(melo.Player.Request.encode(cmd).finish());
  };
}

function seekCtrl(event, progress) {
  if (!currentDuration)
    return;

  var x = event.clientX - progress.offsetLeft;
  var pos = ~~(x * currentDuration / progress.offsetWidth);

  pos = Math.max(Math.min(pos, currentDuration), 0);

  var req = new WebSocket("ws://" + location.host + "/api/request/player");
  req.binaryType = 'arraybuffer';
  req.onopen = function (event) {
    var c = { setPosition: pos };
    var cmd = melo.Player.Request.create(c);

    this.send(melo.Player.Request.encode(cmd).finish());
  };
};

function volumeCtrl(event) {
  var volume = this.value / 100.0;

  var req = new WebSocket("ws://" + location.host + "/api/request/player");
  req.binaryType = 'arraybuffer';
  req.onopen = function (event) {
    var c = { setVolume: volume };
    var cmd = melo.Player.Request.create(c);

    this.send(melo.Player.Request.encode(cmd).finish());
  };
}

function muteCtrl(event) {
  var mute = !currentMute;

  var req = new WebSocket("ws://" + location.host + "/api/request/player");
  req.binaryType = 'arraybuffer';
  req.onopen = function (event) {
    var c = { setMute: mute };
    var cmd = melo.Player.Request.create(c);

    this.send(melo.Player.Request.encode(cmd).finish());
  };
}

document.getElementById('player-play').onclick = playCtrl;
document.getElementById('playerbar-play').onclick = playCtrl;
document.getElementById('player-play').onclick = playCtrl;
document.getElementById('playerbar-backward').onclick = previousCtrl;
document.getElementById('player-backward').onclick = previousCtrl;
document.getElementById('playerbar-forward').onclick = nextCtrl;
document.getElementById('player-forward').onclick = nextCtrl;

document.getElementById('playerbar-vol').firstElementChild.onchange = volumeCtrl;
document.getElementById('player-vol').firstElementChild.onchange = volumeCtrl;
document.getElementById('playerbar-vol-down').onclick = muteCtrl;
document.getElementById('player-vol-down').onclick = muteCtrl;


document.getElementById('playerbar-progress').onclick = function (event) {
  seekCtrl(event, document.getElementById('playerbar-progress'));
};
document.getElementById('player-progress').onclick = function (event) {
  seekCtrl(event, document.getElementById('player-progress'));
};

/* Player pop-over */

/* Initialize duration bar of player and player bar */
initPlayerPosition(document.getElementById("player-progress"),
  document.getElementById("player-pos-popover"));
initPlayerPosition(document.getElementById("playerbar-progress"),
  document.getElementById("playerbar-pos-popover"));

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
  var el = event.currentTarget;

  /* Clamp position */
  if (px < el.offsetLeft)
    px = el.offsetLeft;
  else if (px > el.offsetLeft + el.offsetWidth)
    px = el.offsetLeft + el.offsetWidth;

  var pos = (px - el.offsetLeft) / el.offsetWidth;
  elm.textContent = printTime(pos * currentDuration / 1000);

  /* Align position */
  px -= (elm.offsetWidth / 2);

  /* Set position */
  elm.style.left = px + "px";
}

export { open, close };
