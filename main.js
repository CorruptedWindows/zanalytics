const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    resizable: false,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      backgroundThrottling: false,
      contextIsolation: true,
    }
  });

  mainWindow.loadFile('index.html');

  // Menu personalizzato
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        { label: 'Esci', click: () => app.quit() }
      ]
    },
    {
      label: 'Visualizza',
      submenu: [
        {
          label: 'Ricarica',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow.reload()
        },
        { role: 'togglefullscreen', label: 'Attiva/Disattiva Schermo Intero' },
      ]
    },
    {
      label: 'Aiuto',
      submenu: [
        {
          label: 'Informazioni',
          click: () => {
            const aboutWin = new BrowserWindow({
              icon: path.join(__dirname, 'icon.ico'),
              width: 640,
              height: 500,
              resizable: false,
              title: "Informazioni",
              minimizable: false,
              maximizable: false,
              parent: BrowserWindow.getFocusedWindow(),
              modal: true,
              webPreferences: {
                nodeIntegration: true
              }
            });
            aboutWin.setMenu(null);
            aboutWin.loadFile('about.html');
          }
        }
      ]
    }
  ];

  const customMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(customMenu);

  // Avvia il monitoraggio in background
  const monitorPath = path.join(__dirname, 'trafficMonitor.js');
  const trafficMonitor = fork(monitorPath);

  trafficMonitor.on('message', (msg) => {
    if (msg.type === 'alert') {
      mainWindow.webContents.send('traffic-alert', msg.amount);
    }
  });
}

app.whenReady().then(createWindow);
