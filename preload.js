const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  get: (channel, data) => ipcRenderer.invoke(channel, data),
  send: (channel, data) => ipcRenderer.send(channel, data),
  onTrafficAlert: (callback) => {
    ipcRenderer.on('traffic-alert', (event, amount) => {
      callback(amount);
    });
  }
});

