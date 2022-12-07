import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import { ButtonGroup } from '@mui/material';
import { Stack } from '@mui/material';
import { TextField } from '@mui/material';
import { Button } from '@mui/material';

export const validPath = "/valid/"
export class LoginDialog extends React.Component {
  constructor(props) {
    super(props)
    this.closeCallback = this.props.closeCallback
    this.state = {
      show: true,
      driverID: "",
      lineID: "",
      pageRoute: "",
      configCode: '',
      disableAuto: true,
    }
    this.onManualClose = this.onManualClose.bind(this)
    this.onAutoModeClose = this.onAutoModeClose.bind(this)
    this.onGoToAutoModeRecorder = this.onGoToAutoModeRecorder.bind(this)
  }
  closeWithArguments(...args) {
    this.setState({
      show: false
    })
    if(this.closeCallback !== undefined)
    {
      this.closeCallback(...args)
    }
  }
  onManualClose() {
    this.closeWithArguments({
      driverID: this.state.driverID,
      lineID: this.state.lineID
    })
  }
  
  onAutoModeClose() {
    this.closeWithArguments({
      driverID: this.state.driverID,
      lineID: this.state.lineID,
      configCode: this.state.configCode,
      pageRoute: "AUTOMODE"
    })
  }
  onGoToAutoModeRecorder() {
    this.closeWithArguments({
      driverID: this.state.driverID,
      lineID: this.state.lineID,
      pageRoute: "AUTOROUTERECORDER"
    })
  }
  render()
  {

    return (
      <Dialog
        fullScreen
        open={this.state.show}
      >
        <Stack padding={"1em"}/>
        <ButtonGroup>
          <Stack spacing={1} flexGrow={1}>
            <TextField label="司机编号" variant="outlined" value={this.state.driverID} onChange={(event) => {this.setState({driverID: event.target.value})}} />
            <TextField label="线路编号" variant="outlined" value={this.state.lineID}  onChange={(event) => {this.setState({lineID: event.target.value})}} />
          </Stack>
          <Button variant="outlined" href="#" onClick={this.onManualClose}>
            手动模式
          </Button>
          <Button variant="outlined" href="#" disabled={this.state.disableAuto} onClick={this.onAutoModeClose}>
            自动模式
          </Button>
        </ButtonGroup>
        <Stack spacing={1} flexGrow={0.01}></Stack>
        <TextField label="配置代码" variant="outlined" value={this.state.configCode}  onChange={(event) => {
          
          this.setState({
            configCode: event.target.value,
            disableAuto: event.target.value.length === 0})
          }} />
        <Button variant="outlined" href="#" onClick={this.onGoToAutoModeRecorder}>
            采集工具
        </Button>
      </Dialog>
    );  
  }
}
