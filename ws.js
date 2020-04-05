/* Open websocket with Melo */
ws = new WebSocket("ws://" + location.host + "/api");

/* To decode protobufs, we need to see binary message as 'arraybuffer' */
ws.binaryType = 'arraybuffer';

/* Websocket connection callback */
ws.onopen = function (event) {
  document.getElementById("events").innerHTML += "Opened<br>";
};

/* Websocket message reception callback */
ws.onmessage = function (event) {
  /* Parse only binary messages */
  if (event.data instanceof ArrayBuffer) {
    /* Extract message header and body */
    var header = new Uint8Array(event.data, 0, 4);
    var msg = new Uint8Array(event.data, 4);

    /* Decode event message */
    var ev = melo.Browser.Event.decode(msg);

    /* Handle message */
    if (ev.msg === "add") {
      var desc = ev.add;
      document.getElementById('events').innerHTML +=
        '<i>pevent (' + header[0] + ':' + header[1] + ':' + header[2] +
        '):</i> <i class="fa fa-' + desc.icon + '"></i> ' +
         desc.name + ' (' + desc.id + ')<br>';
    } else {
      document.getElementById('events').innerHTML +=
        '<i>pevent (' + header[0] + ':' + header[1] + ':' + header[2] +
        '):</i> unknown: ' + ev.msg + '<br>';
    }
  }
};
