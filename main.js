const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const url = require("url");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const os = require("os");

const {
  getNumThreads,
  saveNumThreads,
  checkConfigTableExist,
} = require("./models/Thread");

const {
  saveTiktokInfo,
  getTiktokInfos,
  truncateTiktokInfos,
  checkTiktokInfoTableExist,
} = require("./models/TiktokInfo");

require("dotenv").config();

const isDev = process.env.NODE_ENV === "development";
const pathAppDb = isDev ? "./app.db" : path.resolve(__dirname, "..", "app.db");

const db = new sqlite3.Database(pathAppDb, async (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the app.db database.");

    await checkTiktokInfoTableExist();
    await checkConfigTableExist();
  }
});


//SETUP WINDOW
function createWindow() {
  mainWindow = new BrowserWindow({
    title: "",
    width: 1200,
    height: 700,
    webPreferences: {
      contextIsolation: true, //tách biệt mt của renderer và main hoặc preload, tránh tác động từ renderer đến main hoặc preload
      nodeIntegration: false, //ngăn hoặc cho phép sử dụng require() của nodejs để tải các module, dù là false thì preload.js vần dùng đc require() do khác biệt với các renderer
      sandbox: false,
      preload: path.join(__dirname, `preload.js`),
    },
  });

  const startUrl = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "./ui/build/index.html")}`;

  mainWindow.loadURL(startUrl);

  mainWindow.webContents.openDevTools();

  Menu.setApplicationMenu(null);
}
app.whenReady().then(() => {
  createWindow();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});


//IPC ACTIONS
ipcMain.on("start-download", async (event, arg) => {
  console.log(arg);
});
ipcMain.on("get-num-threads", async (event, arg) => {
  const threads = await getNumThreads();
  event.sender.send("get-num-threads", { threads: threads });
});
ipcMain.on("save-num-threads", async (event, arg) => {
  const response = await saveNumThreads(arg.threads);
  if (response.msg) {
    event.sender.send("save-num-threads", { msg: response.msg, code: 0 });
  } else {
    event.sender.send("save-num-threads", { msg: response });
  }
  // await truncateTiktokInfos();
});
ipcMain.on("save-tiktok-info", async (event, arg) => {
  const response = await saveTiktokInfo(arg.username);
  if (response.msg) {
    event.sender.send("save-tiktok-info", { msg: response.msg, code: 0 });
  } else {
    event.sender.send("save-tiktok-info", { msg: response });
  }
});
ipcMain.on("get-tiktok-infos", async (event, arg) => {
  const response = await getTiktokInfos();
  event.sender.send("get-tiktok-infos", { data: response });
});


module.exports = {
  db
};
