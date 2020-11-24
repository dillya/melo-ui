/*
 * Melo UI v1.0.0 - Popover
 * Copyright (C) 2020 Alexandre Dilly <dillya@sparod.com>
 */

var currentPopover;
var currentInstance = null;

function showPopover(dir, button, element, content) {
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

  /* Replace instance */
  if (currentInstance)
    currentInstance.destroy();
  currentInstance = Popper.createPopper(button, element, {
    placement: dir,
    modifiers: [ { name: 'offset', options: { offset: [0, 8], }, }, ],
  });

  button.isPopover = true;
}

function hidePopover(event) {
  if (event && event.isPopover)
    return;

  if (currentPopover)
    currentPopover.style.display = 'none';
  currentPopover = null;

  if (currentInstance)
    currentInstance.destroy();
  currentInstance = null;
}

export { showPopover, hidePopover };
