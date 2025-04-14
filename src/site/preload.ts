import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  sendMessage: (channel: string, data: any) => {
    ipcRenderer.send(channel, data);
  },
  on: (channel: string, callback: Function) => {
    const subscription = ipcRenderer.on(channel, (_, ...args) =>
      callback(...args)
    );
    return () => subscription.removeAllListeners(channel);
  },
  invoke: (channel: string, ...args: any[]) => {
    return ipcRenderer.invoke(channel, ...args);
  },
  send: ipcRenderer.send.bind(ipcRenderer),
});
