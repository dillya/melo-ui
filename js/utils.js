/*
 * Melo UI v1.0.0 - Utils
 * Copyright (C) 2020 Alexandre Dilly <dillya@sparod.com>
 */

export function parseIcon(icon) {
  if (icon.startsWith('svg:')) {
    var svg = icon.substring(4);
    return svg.slice(0, 4) + ' preserveAspectRatio="xMinYMin" ' + svg.slice(4);
  } else if (icon.startsWith('fa:'))
    return '<span class="iconify" data-align="left" data-icon="fa-solid:' + icon.substring(3) + '"></span>';
  else if (icon.startsWith('fab:'))
    return '<span class="iconify" data-align="left" data-icon="fa-brands:' + icon.substring(4) + '"></span>';
  else if (icon.startsWith('iconify:'))
    return '<span class="iconify" data-align="left" data-icon="' + icon.substring(8) + '"></span>';
  else
    return '<span class="iconify" data-icon=""></span>';
}

export function parseCover(cover, className) {
  if (cover.startsWith('img:'))
    return '<div class="' + className + '"><img src="' + cover.substring(4) + '"></div>';
  else
    return '<div class="' + className + '">' + parseIcon(cover) + '</div>';
}

export function extractCover(cover) {
  if (cover.startsWith('img:') || cover.startsWith('svg:') ||
      cover.startsWith('fa:') || cover.startsWith('fab:') ||
      cover.startsWith('iconify:'))
    return cover;
  return "img:asset/" + cover;
}

export function insertSorted(parent, element) {
  var name = element.dataset.name.toLowerCase();
  var before = null;

  for (let e of parent.children) {
    if (e.dataset.name === undefined ||
        e.dataset.name.toLowerCase().localeCompare(name) < 0)
      continue;

    before = e;
    break;
  }

  parent.insertBefore(element, before);
}

export function createNavLink(icon, name, callback = undefined) {
  var item = document.createElement('li');

  if (typeof name === 'string') {
    item.className = 'nav-item';
    item.innerHTML =
      '<a class="nav-link" href="#">' + parseIcon(icon) + name + '</a>';
  } else
    item.className = 'nav-separator';

  if (callback)
    item.firstElementChild.onclick = callback;

  return item;
}

export function isMobile() {
  return document.body.clientWidth < 760 ? true : false;
}
