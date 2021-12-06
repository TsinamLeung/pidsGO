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
      lineID: ""
    }
    this.close = this.close.bind(this)
  }

  close() {
    this.setState({
      show: false
    })
    if(this.closeCallback !== undefined)
    {
      this.closeCallback({
        driverID: this.state.driverID,
        lineID: this.state.lineID
      })
    }
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
          <Button variant="outlined" href="#" onClick={this.close}>
            发送
          </Button>
        </ButtonGroup>
      </Dialog>
    );  
  }
}
