'use strict'

const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')
const debug = require('electron-debug')
debug({showDevTools: true})
require('../lib/src/utils')
const watch = require('node-watch')

let win
let fill = 0.7
const URL = 'index.html'
const title = 'tiles'
const size = [ 640, 640 ]
watch( __dirname, { recursive: true }, () => debug.refresh(win) )
app.on('ready',() => {
  const disp = require('electron').screen.getPrimaryDisplay()
  const dw = disp.workAreaSize.width
  const dh = disp.workAreaSize.height
  let winOpts = {
    webPreferences: {
      nodeIntegrationInWorker: true
    },
    width: size[0],
    height: size[1],
    x: floor( ( dw - size[0] ) / 2 ),
    y: floor( ( dh - size[1] ) / 2 ),
    title
  }
  win = new BrowserWindow(winOpts)
  win.loadURL(url.format({
    pathname: path.join(__dirname, URL),
    protocol: 'file:',
    slashes: true
  }))
})
