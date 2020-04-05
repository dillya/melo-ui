/*
 * Melo UI v1.0.0 - Player
 * Copyright (C) 2020 Alexandre Dilly <dillya@sparod.com>
 */

var opened = false;

/*
 * Display
 */

window.addEventListener("resize", function () {
  if (opened)
    updateLayout();
}, false);

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

  document.getElementById("player-cover").style.flexBasis = size + "px";
}

export { open, close };
