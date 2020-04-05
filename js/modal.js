/*
 * Melo UI v1.0.0 - Modal
 * Copyright (C) 2020 Alexandre Dilly <dillya@sparod.com>
 */

import { showOverlay } from './overlay.js';

function openModal() {
  var modal = document.getElementById('modal');

  modal.style.display = 'block';
  showOverlay(event, function (event) { modal.style.display = 'none'; },
    'modal-backdrop show');
}

export { openModal };
