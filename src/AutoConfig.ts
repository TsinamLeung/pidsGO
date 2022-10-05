export class AutoConfig {
  latitude: number = 0.0
  longtitude: number = 0.0
  constructor(latitude : number, longtitude: number) {
    this.latitude = latitude
    this.longtitude = longtitude
  }
}

export class AutoConfigContainer {
  radius: number = 20
  positionContainer :Array<AutoConfig> = []
  updatePosition(index: number, position: AutoConfig) {
    this.positionContainer[index] = position
  }
  getPositionInfo(index: number) {
    const pinfo = this.positionContainer[index]
    if(this.positionContainer[index] !== undefined) {
      return 'longtitude:' + pinfo.longtitude + ',lattitude:' + pinfo.latitude
    } 
    return ''
  }
  
}