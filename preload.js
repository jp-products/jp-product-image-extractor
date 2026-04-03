
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  createDirectory: (path) => ipcRenderer.invoke('create-directory', path),
  saveFile: (filePath, buffer) => ipcRenderer.invoke('save-file', { filePath, buffer }),
  downloadFile: (url, filePath) => ipcRenderer.invoke('download-file', { url, filePath }),
  isDesktop: true
});
