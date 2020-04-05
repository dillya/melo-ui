/*
 * Melo UI v1.0.0 - Settings
 * Copyright (C) 2020 Alexandre Dilly <dillya@sparod.com>
 */

import { createNavLink, insertSorted } from './utils.js';

/*
 * Tabs
 */

function addTab(id, icon, name) {
  var parent = document.getElementById('settings-tab')

  /* Create list element */
  var li = createNavLink(icon, name);
  li.dataset.name = name;

  /* Insert by alphabetic order */
  insertSorted(parent, li);
}

export { addTab };
