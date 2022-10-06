import {
  Component,
  forwardRef
} from "react";
import { Button, ButtonGroup } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { BusPlayer } from './audioController';
import { ConfigParser } from './ConfigParser.ts';
import { LineInfoContainer, PlayDirection } from "./LineInfoContainer";
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { AutoConfig, AutoConfigContainer } from "./AutoConfig";
import List from '@mui/material/List';
import MuiAlert from '@mui/material/Alert';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export class AutoModelRecorderPage extends Component {
  constructor(props) {
    super(props)
    this.lineID = props.lineID
    this.driverID = props.driverID
    const isSupportGeolocaiton = "geolocation" in navigator
    this.state = {
      supportGeolocation: isSupportGeolocaiton,
      showDialog: isSupportGeolocaiton,
      shouldPlay: false,
      currentPlayAudio: "",
      dialogHint: "",
    }

    this.configParser = new ConfigParser()
    this.lineInfoContainer = new LineInfoContainer()
    this.positionContainer = new AutoConfigContainer()

    this.onSetPosition = this.onSetPosition.bind(this)
    this.updateDialogHint = this.updateDialogHint.bind(this)
    this.onArrivalButton = this.onArrivalButton.bind(this)
    this.onDepartureButton = this.onDepartureButton.bind(this)
    this.onPreviousSheet = this.onPreviousSheet.bind(this)
    this.onNextSheet = this.onNextSheet.bind(this)
    this.configuredList = this.configuredList.bind(this)
    this.onGenerateButton = this.onGenerateButton.bind(this)
  }

  componentDidMount() {
      this.configParser.parseLineConfig(this.lineID).then(lineInfoArray => {
        this.lineInfoContainer.updateContainer(lineInfoArray)
        this.updateDialogHint(this.lineInfoContainer.getInfo())
      })
  }
  
  onSetPosition() {
   navigator.geolocation.getCurrentPosition((pos)=>{
    const lat = pos.coords.latitude
    const long = pos.coords.longitude
    const curIndex = this.lineInfoContainer.getCurrentIndex()
    this.positionContainer.updatePosition(curIndex,new AutoConfig(lat,long))
    this.setState({})
  })
  }

  updateDialogHint(content) {
    this.setState({
      dialogHint: content,
      shouldPlay: false
    })
  }
  
  onNextSheet() {
    this.lineInfoContainer.switchSheet(PlayDirection.Forward)
    this.updateDialogHint(this.lineInfoContainer.getInfo())
  }

  onPreviousSheet() {
    this.lineInfoContainer.switchSheet(PlayDirection.Backward)
    this.updateDialogHint(this.lineInfoContainer.getInfo())
  }
  
  onArrivalButton() {
    const playList = this.lineInfoContainer.getArrivalPlaylist()
    this.setState({
      currentPlayAudio: playList,
      shouldPlay: true
    })
  }

  onDepartureButton() {
    const playList = this.lineInfoContainer.getDeparturePlaylist()
    this.setState({
      currentPlayAudio: playList,
      shouldPlay: true
    })
  }

  configuredList() {
    return (
      <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
        {this.lineInfoContainer._container.map((v,i) => (
          <ListItem
            key={i}
            disableGutters
          >
            <ListItemText primary={v.info + this.positionContainer.getPositionInfo(i)} />
          </ListItem>
        ))}
      </List>
    )
  }

  onGenerateButton() {
    this.updateDialogHint(JSON.stringify(this.positionContainer))
  }

  render() {
    return ( 
      <header className = "App-header" >
        <h5>
          {this.state.supportGeolocation ? 
          "" : 
          "閣下設備不支援位置採集功能。 GeoLocation Is Not Available On Your Devices"}
        </h5>
        <BusPlayer 
        audioSrc={this.state.currentPlayAudio}
        shouldPlay={this.state.shouldPlay}
        />
        <Dialog
          fullScreen
          open={this.state.showDialog}
        >
        <Alert severity="info">{this.state.dialogHint}</Alert>
        <ButtonGroup>
          <Button variant="outlined" href="#" onClick={this.onSetPosition}>設置位置</Button>
          <Button variant="outlined" href="#" onClick={this.onNextSheet}>下一個站點</Button>
          <Button variant="outlined" href="#" onClick={this.onPreviousSheet}>上一個站點</Button>
          <Button variant="outlined" href="#" onClick={this.onArrivalButton}>試聽入站</Button>
          <Button variant="outlined" href="#" onClick={this.onDepartureButton}>試聽出站</Button>
          <Button variant="outlined" href="#" onClick={this.onGenerateButton}>生成配置代碼</Button>
        </ButtonGroup>
        {this.configuredList()}
        </Dialog>
      </header>
    )
  }
}