/*
 * Melo UI v1.0.0 - Overlay
 * Copyright (C) 2020 Alexandre Dilly <dillya@sparod.com>
 */

var closeCb;

function showOverlay(event, callback = undefined, className = undefined) {
  var overlay = document.getElementById('overlay');

  /* Close previous */
  if (closeCb)
    closeCb();
  closeCb = callback;

  overlay.className = className ? className : 'overlay';
  event.isOverlay = true;
}

function hideOverlay(event) {
  var overlay = document.getElementById('overlay');

  /* Hide only when overlay is clicked or an event has been raised */
  if (event && (event.isOverlay === true || (event.target !== overlay &&
      event.target.localName !== 'a' && event.target.localName !== 'button' &&
      event.target.ParentElement.localName !== 'a')))
    return;

  if (closeCb) {
    closeCb();
    closeCb = undefined;
  }

  overlay.className = 'd-none';
}

export { showOverlay, hideOverlay };
