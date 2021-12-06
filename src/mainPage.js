import './App.css';
import { ButtonBox, SimpleDivider, IconInfoBox, InfoFramework, ArrivalButton, DepartureButton, StopButton, LineButton } from './uiComponent';
import Grid from '@mui/material/Grid';
import SvgIcon from '@mui/material/SvgIcon';
import { Divider, Stack } from '@mui/material';
import { Component } from 'react';
import { BusPlayer } from './audioController';

import UIInformation from './uiInfo';
import { ConfigParser } from './ConfigParser.ts';
import { LineInfoContainer, PlayDirection } from './LineInfoContainer.ts';
import { padding } from '@mui/system';

const HomeIcon = function (props) {
  return (
    <SvgIcon {...props}>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
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
      audioSrc: []
    }
    this.UIInfo = new UIInformation();
    this.configParser = new ConfigParser()
    this.lineInfoContainer = new LineInfoContainer()
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
  }

  updateUIInfo()
  {
    this.UIInfo.infoBox_text = this.lineInfoContainer.getInfo()
    this.UIInfo.cur_price = this.lineInfoContainer.getFare()
    this.UIInfo.speed_limit = this.lineInfoContainer.getSpeedLimit()
  }

  onArrivalButton() {
    const playList = this.lineInfoContainer.getArrivalPlaylist()
    this.setState({
      audioSrc: playList,
      shouldPlay: true
    })
  }

  onDepartureButton() {
    const playList = this.lineInfoContainer.getDeparturePlaylist()
    this.lineInfoContainer.switchSheet(PlayDirection.Forward)
    this.updateUIInfo()
    this.setState({
      audioSrc: playList,
      shouldPlay: true
    })
  }
  
  onCustomButton(src) {
    if(src === '')
    {
      return
    }
    this.setState({
      audioSrc: src,
      shouldPlay: true
    })
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
    this.setState({shouldPlay: false})
  }
  render()
  {
    return (
        <header className="App-header">
        <BusPlayer 
        audioSrc={this.state.audioSrc}
        shouldPlay={this.state.shouldPlay}
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
            <HomeIcon />
            <Clock date={new Date()} />
            <Stack flexGrow={1} />
            <span>Designed by DinGaau </span>
            <span style={{
              color:"white",
              paddingLeft:"0.5em",
              }}>Zenam</span>
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
              <ArrivalButton onClick={this.onArrivalButton}>
                出 站
              </ArrivalButton>
              <DepartureButton onClick={this.onDepartureButton}>
                入 站
              </DepartureButton>
              <StopButton onClick={this.stopAudioPlay}>
                停 止
              </StopButton>
              <LineButton>
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

