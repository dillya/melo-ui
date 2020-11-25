/*
 * Melo UI v1.0.0 - Utils
 * Copyright (C) 2020 Alexandre Dilly <dillya@sparod.com>
 */

export function parseIcon(icon, align='left', inline=true) {
  if (icon.startsWith('svg:')) {
    var svg = icon.substring(4);
    return svg.slice(0, 4) + ' preserveAspectRatio="xMinYMin" ' + svg.slice(4);
  } else if (icon.startsWith('fa:'))
    icon = "fa-solid:" + icon.substring(3);
  else if (icon.startsWith('fab:'))
    icon = "fa-brands:" + icon.substring(4);
  else if (icon.startsWith('iconify:'))
    icon = icon.substring(8);
  else
    icon = "";

  if (Iconify.iconExists(icon))
    return Iconify.getSVG(icon, { 'data-align': align, 'data-inline': inline });
  return '<span class="iconify" data-align="left" data-icon="' + icon + '"></span>';
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
