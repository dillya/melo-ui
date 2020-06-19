/*
 * Melo UI v1.0.0 - Alert
 * Copyright (C) 2020 Alexandre Dilly <dillya@sparod.com>
 */

function showAlert(type, msg) {
  var element = document.createElement('div');
  element.className = 'alert alert-' + type + ' alert-dismissible fade show';
  element.innerHTML = msg +
    '<button type="button" class="close" aria-label="Close">' +
    '  <span aria-hidden="true">&times;</span>' +
    '</button>';

  var alerts = document.getElementById('alerts');
  alerts.appendChild(element);

  element.lastElementChild.onclick = function (event) {
    element.parentNode.removeChild(element);
  };

  setTimeout(function () {
    if (element.parentNode)
      element.parentNode.removeChild(element);
  }, 3000);
}

export { showAlert };
