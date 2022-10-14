import './App.css';
import { ButtonBox, SimpleDivider, IconInfoBox, InfoFramework, ArrivalButton, DepartureButton, StopButton, LineButton } from './uiComponent';
import Grid from '@mui/material/Grid';
import SvgIcon from '@mui/material/SvgIcon';
import { Divider, Stack} from '@mui/material';
import { Component, createRef } from 'react';
import { BusPlayer } from './audioController';
import { AutoConfig, AutoConfigContainer } from "./AutoConfig";
import UIInformation from './uiInfo';
import { ConfigParser } from './ConfigParser.ts';
import { LineInfoContainer, PlayDirection } from './LineInfoContainer.ts';
import { padding } from '@mui/system';
import {SatelliteAlt, SignalCellularAlt, Bluetooth, MoveToInbox} from '@mui/icons-material'
const HomeIcon = function (props) {
  return (
    <SvgIcon {...props}>

    </SvgIcon>
  );
}
const BottomButton = function (props) {
  return (
    <Grid item xs={props.xs} flexGrow={2}>
      <ButtonBox 
       onClick={props.onClick} 
       content={props.content}
       />
    </Grid>
  )
}

class Clock extends Component {
  constructor(props) {
    super(props);
    this.state = { date: new Date() };
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({
      date: new Date()
    });
  }
  render() {
    return (
      <Grid>
        {/* https://stackoverflow.com/questions/19346405/jquery-how-to-get-hhmmss-from-date-object */}
        <p style={{margin: 0}}>{this.state.date.toTimeString().split(' ')[0]}</p>
      </Grid>
    )
  }
}


export class MainPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      shouldPlay: false,
      audioSrc: [],
      audioPlayNum: 0,
      isAutoMode: props.enableAutoMode,
      fetchPositionTimeout: 3000
    }
    this.isSupportGeolocaiton = "geolocation" in navigator
    this.busPlayRef = createRef()
    if(this.state.isAutoMode) {
      const autoModeConfigCode = props.configCode
      this.autoConfigContainer = JSON.parse(autoModeConfigCode)
      Object.assign(AutoConfigContainer, this.autoConfigContainer)
      this.onGetlocationUpdate = this.onGetlocationUpdate.bind(this)
      this.lastTimeStamp = 0
      this.lastCoords = undefined
      this.lastStopIndex = -1
      this.inStopPlayNum = 0
    }
  
    this.UIInfo = new UIInformation()
    this.configParser = new ConfigParser()
    this.lineInfoContainer = new LineInfoContainer()
    this.isFetchingPosition = false

    this.onArrivalButton = this.onArrivalButton.bind(this)
    this.onDepartureButton = this.onDepartureButton.bind(this)
    this.onCustomButton = this.onCustomButton.bind(this)
    this.stopAudioPlay = this.stopAudioPlay.bind(this)
    this.UIInfo.lineID = this.props.lineID
    this.UIInfo.driver_ID = this.props.driverID
  }

  componentDidMount() {
    this.UIInfo.infoBox_text = "加 載 中 。\nLOADING .."
    this.setState({})
    if(this.state.isAutoMode && !this.state.isSupportGeolocaiton) {
      this.UIInfo.infoBox_text = "設 備 不 支 持 自 動 模 式。\nGeolocation are not support on your devices."
      this.setState({})
    }
    this.configParser.parseLineConfig(this.UIInfo.lineID).then(ret => {
      this.lineInfoContainer.updateContainer(ret)
      this.UIInfo.infoBox_text = "成 功 加 載，\nLoad Successed\n" + this.UIInfo.lineID
      this.updateUIInfo()
      this.setState({}) 
    }, reason => {
      console.error(reason)
      this.UIInfo.infoBox_text = "失 敗 加 載，\nLoad Failed\n" + this.UIInfo.lineID
    })
    
    this.configParser.parseButtonConfig(this.UIInfo.lineID).then(ret => {
      for(let i in ret)
      {
        let eachBtn = ret[i]
        let matches = eachBtn.buttonID.match(/btn(\d+)/)
        if(matches === null) 
        {
          continue
        }
        let btnID = matches[1]
        this.UIInfo.btn_text[btnID - 1] = eachBtn.text
        this.UIInfo.btn_audio[btnID - 1] = eachBtn.audio
      }
      this.setState({}) 
    })
    if(this.state.isAutoMode)
    {
      this.watchPositionID = navigator.geolocation.watchPosition(this.onGetlocationUpdate, null, {
        timeout: 3000
      })
    }
  }


  onGetlocationUpdate(pos) {
    function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
      var R = 6371; // Radius of the earth in km
      var dLat = deg2rad(lat2-lat1);  // deg2rad below
      var dLon = deg2rad(lon2-lon1); 
      var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c; // Distance in km
      return d;
    }
    
    function deg2rad(deg) {
      return deg * (Math.PI/180)
    }

    function inCircle(targetLat,targetLng,targetRadius,curLat,curLng,curRadius) {
      let distance = 1000*getDistanceFromLatLonInKm(targetLat,targetLng,curLat,curLng)
      let dTotal = targetRadius + curRadius
      return distance < dTotal
    }
    if (pos.timestamp > this.lastTimeStamp) {
      this.lastTimeStamp = pos.timestamp
    } else {
      return
    }
    if(this.lastCoords === undefined)
    {
      this.lastCoords = pos.coords
    }
    let coords = pos.coords
    let speed = coords.speed * 3.6
    let inCircleStops = this.autoConfigContainer.positionContainer.map(v => 
        inCircle(v.latitude, v.longtitude, this.autoConfigContainer.radius, 
                 coords.latitude, coords.longitude, coords.accuracy))
    const curStopIndex = inCircleStops.findIndex(v => v === true)
    if(this.busPlayRef.current === null)
    {
      return
    }
    const isStillPlaying = this.busPlayRef.current.isPlaying
    console.log(isStillPlaying)
    if(curStopIndex !== -1 && curStopIndex !== this.lastStopIndex) {
      this.lastStopIndex = curStopIndex
      this.lineInfoContainer.setIndex(curStopIndex)
      this.playAudio(this.lineInfoContainer.getArrivalPlaylist())
      this.inStopPlayNum = this.state.audioPlayNum
    } else if(curStopIndex === -1 && this.lastStopIndex !== curStopIndex && (this.inStopPlayNum !== this.state.audioPlayNum  || !isStillPlaying)) {
      // resume that stopIndex never change
      this.playAudio(this.lineInfoContainer.getDeparturePlaylist())
      this.lastStopIndex = -1
    }

    this.UIInfo.speed = speed.toFixed(1)
    this.updateUIInfo()
    this.setState({})
    this.lastCoords = coords
  }

  updateUIInfo() {
    this.UIInfo.infoBox_text = this.lineInfoContainer.getInfo()
    this.UIInfo.cur_price = this.lineInfoContainer.getFare()
    this.UIInfo.speed_limit = this.lineInfoContainer.getSpeedLimit()
  }

  playAudio(audioSrc) {
    this.setState({
      audioPlayNum: this.state.audioPlayNum + 1,
      audioSrc: audioSrc,
      shouldPlay: true
    })
  }
  onArrivalButton() {
    const playList = this.lineInfoContainer.getArrivalPlaylist()
    this.playAudio(playList)
  }

  onDepartureButton() {
    const playList = this.lineInfoContainer.getDeparturePlaylist()
    this.lineInfoContainer.switchSheet(PlayDirection.Forward)
    this.updateUIInfo()
    this.playAudio(playList)
  }
  
  onCustomButton(src) {
    if(src === '')
    {
      return
    }
    this.playAudio(src)
  }

  showDirection() {
    let direc = this.UIInfo.lineID.match(/(\d{2})$/g)
    if(direc === null)
    {
      return ""
    }
    return this.UIInfo.direc_info[direc] ?? "区间短线"
  }

  stopAudioPlay() {
    this.setState({
      shouldPlay: false,
      audioPlayNum: this.state.audioPlayNum + 1
    })
  }

  render()
  {
    return (
        <header className="App-header">
        <BusPlayer 
        audioSrc={this.state.audioSrc}
        shouldPlay={this.state.shouldPlay}
        playNum={this.state.audioPlayNum}
        ref={this.busPlayRef}
        />
        <Stack
          direction="column"
          justifyContent="start"
          alignItems="stretch"
          width='98vw'
          flexGrow={2}
          flexBasis="100vh"
          spacing={1}
          >
          <Grid container
            spacing={0.5}
            justifyContent='start'
            alignItems='center'
            margin={0}
            padding={0}
            >
            <SatelliteAlt />
            <Stack flexGrow={0.02} />
            <SignalCellularAlt />
            <Clock date={new Date()} />
            <Bluetooth />
            <MoveToInbox />
            <Stack flexGrow={1} />
            <span style={{fontSize:'0.5em'}}>Designed by DinGaau Zenam</span>
          </Grid>
          <Divider variant="middle" flexItem sx={{
            background: "white",
            color: "white",
            margin: 0,
            padding: 0,
            }} />
          {/* <SimpleDivider horizontal /> */}
          {/* 頂部 Top */}
          {/* 中間開始 Middle Start */}
          <Stack
            direction="row"
            spacing={3}
            justifyContent="space-between"

            >
            {/* 左 Left */} 
            <Stack
              direction="column"
              justifyContent="flex-start"
              alignItems="stretch"
              spacing={0}
              // width="90%"
              flexGrow={1}
            >
              {/* line1 */}
              <Stack 
              direction='row'
              spacing={1}
              flexGrow={0.1}
              justifyContent='space-between' 
              >
                {/* left */}
                <Stack
                  direction='column'
                  spacing={2}
                  padding={2}
                  alignItems='start'
                  >
                  <IconInfoBox title="司机工号：" content={this.UIInfo.driver_ID} contentColor="cyan"/>
                  <IconInfoBox title="设备编号：" content={this.UIInfo.device_ID} contentColor="cyan"/>
                  <IconInfoBox title="当前票价：" content={"￥" + this.UIInfo.cur_price} contentColor="cyan"/>
                </Stack>
                {/* right */}
                <InfoFramework
                  sx={{
                    alignItems:'flex-end',
                  }}
                  flexGrow={1}
                  backgroundColor='rgb(9, 100, 100)'
                  >
                  <p>{this.UIInfo.lineID}</p>
                  <p>{this.showDirection()}</p>
                </InfoFramework>
              </Stack>
              {/* line2 */}
              <Stack 
                flexGrow={1}
              />
              <InfoFramework 
                height='8em'
                flexGrow={1}
                backgroundColor="blue"
                sx={{mr:'1em'}}
                >
                  <pre style={{
                    textAlign:"start",
                    marginLeft: "1rem",
                    mairginright: "1.5rem",
                    color: "yellow",
                    fontSize: "calc(22px + 2vmin)"
                    }}>
                    {this.UIInfo.infoBox_text}
                  </pre>
              </InfoFramework>
              {/* line3 */}
              <Stack 
                flexGrow={1}
              />
              <Grid
                direction="row"
                container
                justifyContent="flex-end"
                alignItems="start"
                spacing={0}
                column={2}
                >
                <Grid item flexGrow={1} textAlign='start'>
                <IconInfoBox  title="限速：" content={this.UIInfo.speed_limit} contentColor="cyan"/>
                </Grid>
                <Grid item flexGrow={1} textAlign='start'>
                <IconInfoBox title="速度：" content={this.UIInfo.speed} contentColor="cyan"/>
                </Grid>
              </Grid>
            </Stack>
            {/* 右 Right */}
            <Stack 
              direction="column"
              justifyContent="space-between"
              alignItems="flex-end"
              flexGrow={0}
              spacing={1}
              >
              <ArrivalButton disabled={this.state.isAutoMode} onClick={this.onArrivalButton}>
                出 站
              </ArrivalButton>
              <DepartureButton disabled={this.state.isAutoMode} onClick={this.onDepartureButton}>
                入 站
              </DepartureButton>
              <StopButton onClick={this.stopAudioPlay}>
                停 止
              </StopButton>
              <LineButton onClick={() => {window.location.reload()}}>
                路 线
              </LineButton>
            </Stack>
          </Stack>
          {/* 中間結束 Middle End */}
          {/* 底部 Button */}
          <SimpleDivider horizontal />
          <Grid container
            spacing={0}
            justifyContent='center'
            justifySelf='start'
            columns={7}
            >
            <BottomButton content={this.UIInfo.btn_text[0]} onClick={this.onCustomButton.bind(this,this.UIInfo.btn_audio[0])} />
            <SimpleDivider veritcal />
            <BottomButton content={this.UIInfo.btn_text[1]} onClick={this.onCustomButton.bind(this,this.UIInfo.btn_audio[1])} />
            <SimpleDivider veritcal />
            <BottomButton content={this.UIInfo.btn_text[2]} onClick={this.onCustomButton.bind(this,this.UIInfo.btn_audio[2])} />
            <SimpleDivider veritcal />
            <BottomButton content={this.UIInfo.btn_text[3]} onClick={this.onCustomButton.bind(this,this.UIInfo.btn_audio[3])} />
            <SimpleDivider veritcal />
            <BottomButton content={this.UIInfo.btn_text[4]} onClick={this.onCustomButton.bind(this,this.UIInfo.btn_audio[4])} />
            <SimpleDivider veritcal />
            <BottomButton content={this.UIInfo.btn_text[5]} onClick={this.onCustomButton.bind(this,this.UIInfo.btn_audio[5])} />
            <SimpleDivider veritcal />
          </Grid>
        </Stack>
      </header>
    )
  }
}

