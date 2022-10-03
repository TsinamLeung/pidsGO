import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import * as Main from './mainPage.js';
import * as Auto from './AutoPage.js'
import * as Recorder from './AutoModeRecorder.js'
import { LoginDialog, validPath } from './loginDialog'
import { ConfigParser } from './ConfigParser.ts'
async function onLoginDialogClose(info) {
  let driverID = info.driverID
  let lineID = info.lineID
  let pageRoute = info.pageRoute === undefined ? "" : info.pageRoute
  let userValidRes = await fetch(encodeURI(validPath + driverID + ".txt"))
  if (userValidRes.status !== 200) {
    RenderErrorPage()
    return
  }
  let responseText = await userValidRes.text()
  if (responseText.length > 0) {
    RenderErrorPage()
    return
  }
  const cp = new ConfigParser()
  let lineValidRes = await fetch(encodeURI(cp.lineCongfigPath + lineID + ".csv"))
  if (lineValidRes.status !== 200) {
    RenderErrorPage()
    return
  }
  if (pageRoute === "AUTOMODE") {
    RenderAutoMode(driverID, lineID, info.configCode)
  } else if (pageRoute === "AUTOROUTERECORDER") {
    RenderAutoModelRecorder(driverID, lineID)
  } else {
    RenderMain(driverID, lineID)
  }
}

function RenderLoginDialog()
{
  ReactDOM.render(
    <React.StrictMode>
    <LoginDialog closeCallback={onLoginDialogClose}/>
  </React.StrictMode>,
  document.getElementById('root')
  )
}

function RenderMain(driverID, lineID)
{
  ReactDOM.render(
    <React.StrictMode>
      <Main.MainPage driverID={driverID} lineID={lineID} />
    </React.StrictMode>,
    document.getElementById('root')
  );
}

function RenderErrorPage()
{
  ReactDOM.render(
    <h1>
      Cannot Found Corresponse Driver or Line, 无法找到相应的司机或线路
    </h1>
    ,
    document.getElementById('root')
  )
}

function RenderAutoMode(driverID, lineID, config) {
  ReactDOM.render(
    <React.StrictMode>
      <Auto.AutoModelPage driverID={driverID} lineID={lineID} config={config} />
    </React.StrictMode>,
    document.getElementById('root')
  );
}

function RenderAutoModelRecorder(driverID, lineID)  {
  ReactDOM.render(
    <React.StrictMode>
    <Recorder.AutoModelRecorderPage driverID={driverID} lineID={lineID}/>
  </React.StrictMode>,
  document.getElementById('root')
  )
}
RenderLoginDialog()

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
