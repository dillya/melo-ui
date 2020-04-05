/*
 * Melo UI v1.0.0 - Action sheet
 * Copyright (C) 2020 Alexandre Dilly <dillya@sparod.com>
 */

import { showOverlay } from './overlay.js';

function openActionSheet(element) {
  var as = document.getElementById('action-sheet');
  var body = as.getElementsByClassName('action-sheet-body')[0];

  body.innerHTML = '';
  body.appendChild(element);

  as.classList.add('no-transform');
  showOverlay(event, function (event) { as.classList.remove('no-transform'); },
    'modal-backdrop show');
}

export { openActionSheet };
