//this is the main starting file of the app
const path = require("path");
const os = require("os");
const {
  app,
  BrowserWindow,
  ipcMain,
  shell,
} = require("electron");

//production means its build ready(no deafult console) other is "development"
process.env.NODE_ENV = "production";


const isDev = process.env.NODE_ENV === "production" ? true : false;
const imagemin = require("imagemin");
const imageminMozjpeg = require("imagemin-mozjpeg");
const { default: imageminPngquant } = require("imagemin-pngquant");
const slash = require('slash')


let mainWindow;
let aboutWindow;
const isWin = process.platform === "win32" ? true : false;
console.log(process.platform);

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Image Shrink",
    width: 400,
    height: 500,
    icon: __dirname + "/assets/icons/win/icon.ico",
    resizable: isDev ? false : true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });
  mainWindow.loadFile("./app/index.html");
  if (!isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// function createAboutWindow() {
//   aboutWindow = new BrowserWindow({
//     title: "About",
//     width: 400,
//     height: 500,
//     resizable: false,
//   });
// }
//making menu buttons on top
// const menu = [
//   {
//     label: "File",
//     submenu: [
//       {
//         label: "Quit",
//         accelerator: "CmdOrCtrl+W",
//         click: () => app.quit(),
//       },
//     ],
//   },
//   {
//     label: "About",
//     click: () => createAboutWindow(),
//   },
// ];

app.on("ready", () => {
  createMainWindow();
  // const mainmenu = Menu.buildFromTemplate(menu);
  // Menu.setApplicationMenu(mainmenu);
  mainWindow.setMenuBarVisibility(false);
  mainWindow.on("ready", () => (mainWindow = null));
});

ipcMain.on("img:minimize", (e, options) => {
  options.dest = path.join(os.homedir(), 'Pictures');
  shrinkImage(options);
});

async function shrinkImage({ imgPath, quality, dest }) {
  try {
    const pngQuality = quality / 100;
    const files = await imagemin([slash(imgPath)], {
      destination: dest,
      plugins: [
        imageminMozjpeg({ quality }),
        imageminPngquant({
          quality: [0.0, pngQuality],
        }),
      ],
    });
    // console.log(files);
    shell.openPath(dest)
    mainWindow.webContents.send('image:done')
  } catch (err) {
    console.log(err);
  }
}
