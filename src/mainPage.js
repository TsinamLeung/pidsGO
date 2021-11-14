import './App.css';
import { ButtonBox, SimpleDivider, IconInfoBox, InfoFramework, PurpleButton, ArrivalButton, DepartureButton, StopButton, LineButton } from './uiComponent';
import Grid from '@mui/material/Grid';
import SvgIcon from '@mui/material/SvgIcon';
import { Stack } from '@mui/material';
import { Component } from 'react';
import { BusPlayer } from './audioController';

import UIInformation from './uiInfo';
import { ConfigParser } from './ConfigParser.ts';
import { LineInfoContainer, PlayDirection } from './LineInfoContainer.ts';

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
       content={props.content} />
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
        <p>{this.state.date.toTimeString().split(' ')[0]}</p>
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
          spacing={1}
          width='98vw'
          height='100vh'
          >
          <Grid container
            spacing={0.5}
            justifyContent='start'
            alignItems='center'
            margin={0}
            >
            <HomeIcon />
            <Clock date={new Date()} />

          </Grid>
          <SimpleDivider horizontal />
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
              spacing={0.5}
              width="90%"
              padding='1em'
            >
              {/* line1 */}
              <Stack 
              direction='row'
              spacing={1}
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
                  sx={{alignItems:'flex-end'}}
                  height="100%"
                  width="20%"
                  backgroundColor='rgb(9, 100, 100)'
                  >
                  <p>{this.UIInfo.lineID}</p>
                  <p>{this.UIInfo.breif_direc}</p>
                </InfoFramework>
              </Stack>
              {/* line2 */}
              <InfoFramework 
                height='8em'
                width="98%" 
                backgroundColor="blue"
                >
                  <pre style={{textAlign:"start"}}>
                    {this.UIInfo.infoBox_text}
                  </pre>
              </InfoFramework>
              {/* line3 */}
              <Grid
                direction="row"
                container
                justifyContent="flex-start"
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
              spacing={1}
              >
              <ArrivalButton onClick={this.onArrivalButton}>
                入 站
              </ArrivalButton>
              <DepartureButton onClick={this.onDepartureButton}>
                出 站
              </DepartureButton>
              <StopButton>
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
            justifySelf='end'
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

