/*
 * Melo UI v1.0.0 - Settings
 * Copyright (C) 2020 Alexandre Dilly <dillya@sparod.com>
 */

import { insertSorted, parseIcon } from './utils.js';
import { showAlert } from './alert.js';

var melo = require('melo');

/*
 * Tabs
 */

document.getElementById('settings-global').onclick = openTab;
document.getElementById('settings-network').onclick = openTab;
document.getElementById('settings-browsers').onclick = openTab;
document.getElementById('settings-players').onclick = openTab;

function openTab(event) {
  open(event.currentTarget.id);
}

function addCategory(parent, id, icon, name, callback) {
  var cat = document.createElement('div');
  cat.dataset.id = id;
  cat.dataset.name = name;
  cat.innerHTML =
      '<div class="settings-header"><i class="fa fa-chevron-right"></i>' + parseIcon(icon) + name + '</div>' +
      '<div class="settings-body d-none">No settings</div>';

  /* Set open / close action */
  cat.firstElementChild.dataset.opened = false;
  cat.firstElementChild.onclick = function (event) {
    if (event.currentTarget.dataset.opened === 'true') {
      event.currentTarget.nextElementSibling.classList.add('d-none');
      event.currentTarget.firstElementChild.classList.replace('fa-chevron-down', 'fa-chevron-right');
      event.currentTarget.dataset.opened = false;
    } else {
      if (callback)
        callback(event, id, event.currentTarget.nextElementSibling);
      event.currentTarget.nextElementSibling.classList.remove('d-none');
      event.currentTarget.firstElementChild.classList.replace('fa-chevron-right', 'fa-chevron-down');
      event.currentTarget.dataset.opened = true;
    }
  };

  /* Insert by alphabetic order */
  insertSorted(parent, cat);
}

function addBrowser(id, icon, name) {
  addCategory(document.getElementById('settings-body-browsers'), id, icon, name, getSettings);
}

function addPlayer(id, icon, name) {
  addCategory(document.getElementById('settings-body-players'), id, icon, name, getSettings);
}

function open(id) {
  var link = document.getElementById(id);

  for (var el of document.getElementById('settings-tab').children)
    el.firstElementChild.classList.remove('active');
  link.classList.add('active');

  for (var el of document.getElementById('settings-body').children)
    el.classList.add('d-none');
  document.getElementById(link.dataset.id).classList.remove('d-none');

  if (id === 'settings-global')
    getSettings(event, 'global', document.getElementById('settings-body-global'));
  else if (id === 'settings-network')
    getNetwork()
  document.getElementById('settings-title').textContent = link.textContent;
}

function getSettings(event, id, body) {
  var requestWebsocket =
    new WebSocket("ws://" + location.host + "/api/request/settings");
  requestWebsocket.binaryType = 'arraybuffer';
  requestWebsocket.settings_id = id;
  requestWebsocket.settings_body = body;

  requestWebsocket.onopen = function (event) {
    var c = { id: this.settings_id, getGroupList: "" };
    var cmd = melo.Settings.Request.create(c);

    this.send(melo.Settings.Request.encode(cmd).finish());
  };
  requestWebsocket.onmessage = function (event) {
    var msg = new Uint8Array(event.data);
    var resp = melo.Settings.Response.decode(msg);

    /* Expect group list */
    if (resp.resp !== "groupList")
      return;

    displaySettings(this.settings_body, this.settings_id, resp.groupList);
  };
}

function getNetwork() {
  var requestWebsocket =
    new WebSocket("ws://" + location.host + "/api/request/network");
  requestWebsocket.binaryType = 'arraybuffer';
  requestWebsocket.onopen = function (event) {
    var c = { getDeviceList: true };
    var cmd = melo.Network.Request.create(c);

    this.send(melo.Network.Request.encode(cmd).finish());
  };
  requestWebsocket.onmessage = function (event) {
    var msg = new Uint8Array(event.data);
    var resp = melo.Network.Response.decode(msg);

    /* Expect device list */
    if (resp.resp !== "deviceList")
      return;

    var body = document.getElementById('settings-body-network');
    body.innerHTML = "";

    /* Display device list */
    for (var dev of resp.deviceList.devices) {
      if (dev.type === 0)
        addCategory(body, dev.iface, "fa:ethernet", "Ethernet", getEthernet);
      else if (dev.type === 1)
        addCategory(body, dev.iface, "fa:wifi", "Wifi", getWifi);
    }
  };
}

function addIPSettings(iface, name, ip, v6)
{
  var form = document.createElement('form');
  form.dataset.iface = iface;

  var html = '<fieldset><legend>' + name + '</legend>';
  html += '<div class="form-group">' +
      '<label for="mode">Mode: </label>' +
      '<select class="form-control" id="mode">' +
      '  <option value="0"' + (ip.mode == 0 ? " selected": "") + '>Automatic</option>' +
      '  <option value="1"' + (ip.mode == 1 ? " selected": "") + '>Manual</option>' +
      '  <option value="2"' + (ip.mode == 2 ? " selected": "") + '>Disabled</option>' +
      '  </select>' +
      '</div>';
  html += '<div class="form-group">' +
      '<label for="address">IP address: </label>' +
      '<input type="text" class="form-control" id="address" value="' + ip.address + '">' +
      '</div>';
  html += '<div class="form-group">' +
      '<label for="prefix">Prefix: </label>' +
      '<input type="text" class="form-control" id="prefix" value="' + ip.prefix + '">' +
      '</div>';
  html += '<div class="form-group">' +
      '<label for="gateway">Gateway: </label>' +
      '<input type="text" class="form-control" id="gateway" value="' + ip.gateway + '">' +
      '</div>';
  html += '<div class="form-group">' +
      '<label for="dns">DNS: </label>' +
      '<input type="text" class="form-control" id="dns" value="' + ip.dns + '">' +
      '</div>';
  html += '<button type="submit" class="btn btn-primary">Save</button>';
  html += '</fieldset>';
  form.innerHTML = html;

  form.onsubmit = function (event) {
    var ip_settings = {
      mode: event.currentTarget['mode'].value,
      address: event.currentTarget['address'].value,
      prefix: event.currentTarget['prefix'].value,
      gateway: event.currentTarget['gateway'].value,
      dns: event.currentTarget['dns'].value,
    };

    if (v6)
      var c = {
        setIpv6Settings: {
          iface: event.currentTarget.dataset.iface,
          settings: ip_settings,
        }
      };
    else
      var c = {
        setIpv4Settings: {
          iface: event.currentTarget.dataset.iface,
          settings: ip_settings,
        }
      };

    var requestWebsocket =
      new WebSocket("ws://" + location.host + "/api/request/network");
    requestWebsocket.binaryType = 'arraybuffer';

    requestWebsocket.onopen = function (event) {
      var cmd = melo.Network.Request.create(c);

      this.send(melo.Network.Request.encode(cmd).finish());
    };
    requestWebsocket.onmessage = function (event) {
      var msg = new Uint8Array(event.data);
      var resp = melo.Network.Response.decode(msg);

      /* Handle response */
      if (resp.resp !== "ipSettings")
        return;

      /* TODO */
      console.log("ip settings");
      console.log(resp.ipSettings);
    };
  };

  return form;
}

function getEthernet(event, id, body)
{
  var requestWebsocket =
    new WebSocket("ws://" + location.host + "/api/request/network");
  requestWebsocket.binaryType = 'arraybuffer';
  requestWebsocket.iface = id;
  requestWebsocket.body = body;

  requestWebsocket.onopen = function (event) {
    var c = { getEthernetDevice: this.iface };
    var cmd = melo.Network.Request.create(c);

    this.send(melo.Network.Request.encode(cmd).finish());
  };
  requestWebsocket.onmessage = function (event) {
    var msg = new Uint8Array(event.data);
    var resp = melo.Network.Response.decode(msg);

    /* Expect ethernet device */
    if (resp.resp !== "ethernetDevice")
      return;

    body.appendChild(addIPSettings(this.iface, "IPv4", resp.ethernetDevice.ipv4, false));
    body.appendChild(addIPSettings(this.iface, "IPv6", resp.ethernetDevice.ipv6, true));
  };
}

function getWifi(event, id, body)
{
  body.innerHTML = "";

  var requestWebsocket =
    new WebSocket("ws://" + location.host + "/api/request/network");
  requestWebsocket.binaryType = 'arraybuffer';
  requestWebsocket.iface = id;
  requestWebsocket.body = body;

  requestWebsocket.onopen = function (event) {
    var c = { getWifiDevice: this.iface };
    var cmd = melo.Network.Request.create(c);

    this.send(melo.Network.Request.encode(cmd).finish());
  };
  requestWebsocket.onmessage = function (event) {
    var msg = new Uint8Array(event.data);
    var resp = melo.Network.Response.decode(msg);

    /* Expect wifi device */
    if (resp.resp !== "wifiDevice")
      return;

    body.appendChild(addIPSettings(this.iface, "IPv4", resp.wifiDevice.ipv4, false));
    body.appendChild(addIPSettings(this.iface, "IPv6", resp.wifiDevice.ipv6, true));
  };

  var requesWifitWebsocket =
    new WebSocket("ws://" + location.host + "/api/request/network");
  requesWifitWebsocket.binaryType = 'arraybuffer';
  requesWifitWebsocket.iface = id;
  requesWifitWebsocket.body = body;

  requesWifitWebsocket.onopen = function (event) {
    var c = { getApList: this.iface };
    var cmd = melo.Network.Request.create(c);

    this.send(melo.Network.Request.encode(cmd).finish());
  };
  requesWifitWebsocket.onmessage = function (event) {
    var msg = new Uint8Array(event.data);
    var resp = melo.Network.Response.decode(msg);

    /* Expect AP list */
    if (resp.resp !== "apList")
      return;

    var html = '<ul class="nav flex-column">';
    for (var ap of resp.apList.accessPoints) {
      var st = 'text-success';

      if (ap.strength < 33)
        st = 'text-danger';
      else if (ap.strength < 66)
        st = 'text-warning';

      html += '<li class="nav-item ' +
        (resp.apList.activeBssid === ap.bssid ? 'text-primary' : '') + '">' +
        '<i class="fa fa-signal ' + st + '"></i>' +
        (!ap.ssid || ap.ssid === '' ? '<i>No name</i>' : ap.ssid) +
        (ap.private ? '<i class="fa fa-lock ml-2"></i>' : '') +
        ' : ' + ap.mode + ' - ' + ap.security +
        '</li>';
    }
    body.innerHTML += html + '</ul>';
  };
}

function displaySettings(element, id, groupList)
{
  if (groupList.groups.length === 0)
    return;

  element.innerHTML = '';

  for (var group of groupList.groups) {
    var form = document.createElement('form');
    form.dataset.id = id;
    form.dataset.group = group.id;
    var html = '<fieldset><legend>' + group.name + '</legend>';

    for (var entry of group.entries) {
      var check = false;
      var value;

      if (entry.value === 'boolean') {
        value = entry.boolean;
        check = true;
      } else if (entry.value === 'int32')
        value = entry.int32;
      else if (entry.value === 'uint32')
        value = entry.uint32;
      else if (entry.value === 'int64')
        value = entry.int64;
      else if (entry.value === 'uint64')
        value = entry.uint64;
      else if (entry.value === 'string')
        value = entry.string;

      if (check)
        html += '<div class="form-check">' +
            '<input type="checkbox" class="form-check-input" id="' + entry.id + '" ' +
            'data-type="' + entry.value + '"' +
            (value === true ? " checked " : "") +
            (entry.readOnly ? " disabled" : "") + '>' +
            '<label for="' + entry.id + '">' + entry.name + '</label>' +
            '</div>';
      else
        html += '<div class="form-group">' +
            '<label for="' + entry.id + '">' + entry.name + ': </label>' +
            '<input type="' + (entry.password ? "password" : "text") + '" ' +
            'class="form-control" id="' + entry.id + '" value="' + value + '"' +
            'data-type="' + entry.value + '"' +
            (entry.readOnly ? " disabled" : "") + '>' +
            '</div>';
    }

    html += '<button type="submit" class="btn btn-primary">Save</button>';
    form.innerHTML = html + '</fieldset>';

    form.onsubmit = function (event) {
      var c = {
        id: event.currentTarget.dataset.id,
        setGroup: {
          id: event.currentTarget.dataset.group,
          entries: []
        }
      };

      for (var entry of event.currentTarget) {
        if (entry.dataset.type === 'boolean')
          var e = { id: entry.id, boolean: entry.checked };
        else if (entry.dataset.type === 'int32')
          var e = { id: entry.id, int32: entry.value };
        else if (entry.dataset.type === 'uint32')
          var e = { id: entry.id, uint32: entry.value };
        else if (entry.dataset.type === 'int64')
          var e = { id: entry.id, int64: entry.value };
        else if (entry.dataset.type === 'uint64')
          var e = { id: entry.id, uint64: entry.value };
        else if (entry.dataset.type === 'string')
          var e = { id: entry.id, string: entry.value };
        else
          continue;

        c.setGroup.entries.push(e);
      }

      var requestWebsocket =
        new WebSocket("ws://" + location.host + "/api/request/settings");
      requestWebsocket.binaryType = 'arraybuffer';

      requestWebsocket.onopen = function (event) {
        var cmd = melo.Settings.Request.create(c);

        this.send(melo.Settings.Request.encode(cmd).finish());
      };
      requestWebsocket.onmessage = function (event) {
        var msg = new Uint8Array(event.data);
        var resp = melo.Settings.Response.decode(msg);

        /* Handle response */
        if (resp.resp === "group") {
          /* TODO */
          console.log("group");
          console.log(resp.group);
        } else if (resp.resp === "error")
          showAlert("danger", 'Failed to save settings: ' + resp.error);
      };
    };

    element.appendChild(form);
  }
}

export { addBrowser, addPlayer, open };
