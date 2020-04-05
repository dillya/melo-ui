/*
 * Melo UI v1.0.0 - Popover
 * Copyright (C) 2020 Alexandre Dilly <dillya@sparod.com>
 */

var currentPopover;

function show(element, content) {
  /* Replace current popover */
  if (currentPopover)
    currentPopover.style.display = 'none';
  currentPopover = element;

  /* Replace content */
  var body = element.getElementsByClassName('popover-body')[0];
  body.innerHTML = '';
  body.appendChild(content);

  /* Display popover */
  element.style.display = 'block';
}

function showPopoverBottom(event, element, content) {
  show(element, content);

  var px = event.target.offsetLeft + (event.target.offsetWidth / 2) - (element.offsetWidth / 2);
  var py = event.target.offsetTop + event.target.offsetHeight;
  var ax = (element.offsetWidth / 2) - (element.firstElementChild.offsetWidth / 2);
  var diff = px + element.offsetWidth + 16 - element.offsetParent.offsetWidth;

  if (diff > 0) {
    px -= diff;
    ax += diff;
  }

  /* Set popover position */
  element.style.left = px + "px";
  element.style.top = py + "px";

  /* Set arrow position */
  element.firstElementChild.style.left = ax + "px";

  event.isPopover = true;
}

function showPopoverLeft(event, element, content) {
  show(element, content);

  var px = event.target.offsetLeft - element.offsetWidth - 16;
  var py = event.target.offsetTop + (event.target.offsetHeight / 2) - (element.offsetHeight / 2);
  var ay = (element.offsetHeight / 2) - (element.firstElementChild.offsetHeight / 2);
  var diff = py + element.offsetHeight + 16 - element.offsetParent.offsetHeight;

  if (py < 16) {
    ay += py - 16;
    py = 16;
  }
  if (diff > 0) {
    py -= diff;
    ay += diff;
  }

  /* Set popover position */
  element.style.left = px + "px";
  element.style.top = py + "px";

  /* Set arrow position */
  element.firstElementChild.style.top = ay + "px";

  event.isPopover = true;
}

function hidePopover(event) {
  if (event && event.isPopover)
    return;

  if (currentPopover)
    currentPopover.style.display = 'none';
  currentPopover = null;
}

export { showPopoverBottom, showPopoverLeft, hidePopover };
