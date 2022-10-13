import { LineInfo } from "./ConfigParser"

export enum PlayDirection {
    Forward = 1,
    Backward = -1,
    Replay = 0,
}

export class LineInfoContainer {
    currentIndex = 0
    _container: Array<LineInfo> = []

    updateContainer(lineInfos: Array<LineInfo>) {
        this._container = lineInfos
    }

    setIndex(index: number) {
        if (index < 0) {
            index = 0
        } else {
            index = index % this._container.length
        }
        this.currentIndex = index
    }
    
    switchSheet(direc: PlayDirection) {
        let index = this.currentIndex
        switch (direc) {
            case PlayDirection.Forward:
                index += 1
                break;
            case PlayDirection.Backward:
                index -= 1
                break;
            case PlayDirection.Replay:
                break;
        }
        this.setIndex(index)
        return this._container[index]
    }

    getInfo() {
        return this._container[this.currentIndex].info
    }

    getFare() {
        return this._container[this.currentIndex].fare
    }

    getSpeedLimit() {
        return this._container[this.currentIndex].speed
    }

    getDeparturePlaylist() {
        return this._container[this.currentIndex].departureaudio
    }

    getArrivalPlaylist() {
        return this._container[this.currentIndex].arrivalaudio
    }

    getCurrentIndex() {
        return this.currentIndex
    }
}