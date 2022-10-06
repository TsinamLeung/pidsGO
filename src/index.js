import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import * as Main from './mainPage.js';
import * as Recorder from './AutoModeRecorder.js'
import { LoginDialog, validPath } from './loginDialog'
import { ConfigParser } from './ConfigParser.ts'

async function onLoginDialogClose(info) {
  let driverID = info.driverID
  let lineID = info.lineID
  let pageRoute = info.pageRoute === undefined ? "" : info.pageRoute
  let userValidRes = await fetch(encodeURI(validPath + driverID + ".txt"))
  const regularErrMsg = 'Cannot Found Corresponse Driver or Line, 无法找到相应的司机或线路'
  const autoCodeError = 'incorrect Special Code, 特殊代码不正确'
  if (userValidRes.status !== 200) {
    RenderErrorPage()
    return
  }
  let responseText = await userValidRes.text()
  if (responseText.length > 0) {
    RenderErrorPage(regularErrMsg)
    return
  }
  const cp = new ConfigParser()
  let lineValidRes = await fetch(encodeURI(cp.lineCongfigPath + lineID + ".csv"))
  if (lineValidRes.status !== 200) {
    RenderErrorPage(regularErrMsg)
    return
  }
  if (pageRoute === "AUTOMODE") {
    // {"radius":20,"positionContainer":[{"latitude":23.262073,"longtitude":113.326443},null,null,null,null,null,null,{"latitude":23.262073,"longtitude":113.326443},null,null,null,null,null,null,null,null,{"latitude":23.2620728,"longtitude":113.3264427},{"latitude":23.2620728,"longtitude":113.3264427}]}
    if(info.configCode === undefined)
    {
      RenderErrorPage(autoCodeError)
      return
    }
    JSON.parse(info.configCode)
    RenderMain(driverID, lineID, info.configCode, true)
  } else if (pageRoute === "AUTOROUTERECORDER") {
    RenderAutoModelRecorder(driverID, lineID)
  } else {
    RenderMain(driverID, lineID, info.configCode, false)
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

function RenderMain(driverID, lineID, configCode, enableAutoMode)
{
  ReactDOM.render(
    <React.StrictMode>
      <Main.MainPage driverID={driverID} lineID={lineID} configCode={configCode} enableAutoMode={enableAutoMode} />
    </React.StrictMode>,
    document.getElementById('root')
  );
}

function RenderErrorPage(error_msg)
{
  ReactDOM.render(
    <h1>
      {error_msg}
    </h1>
    ,
    document.getElementById('root')
  )
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
