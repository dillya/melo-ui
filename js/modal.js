/*
 * Melo UI v1.0.0 - Modal
 * Copyright (C) 2020 Alexandre Dilly <dillya@sparod.com>
 */

import { showOverlay, hideOverlay } from './overlay.js';

document.getElementById('modal').getElementsByClassName('modal-content')[0]
    .onclick = function(event) {
      event.stopPropagation();
    };

function openModal(title, content, ok, cancel = undefined, cb = undefined) {
  var modal = document.getElementById('modal');
  var header = document.getElementsByClassName('modal-header')[0];
  var body = document.getElementsByClassName('modal-body')[0];
  var footer = document.getElementsByClassName('modal-footer')[0];

  header.textContent = title;
  body.innerHTML = content;

  var foot = "";
  if (cancel && cancel !== "")
    foot +=
      '<button id="done" type="button" class="btn btn-secondary">' + cancel + '</button>';
  foot += '<button id="done" type="button" class="btn btn-primary">' + ok + '</button>';
  footer.innerHTML = foot;

  if (cancel && cancel !== "")
    footer.firstElementChild.onclick = hideOverlay;
  footer.lastElementChild.onclick = function (event) {
    if (cb)
      cb(body);
      hideOverlay(event);
  };

  modal.style.display = 'block';
  showOverlay(event, function (event) { modal.style.display = 'none'; },
    'modal-backdrop show');
}

export { openModal };
