import { Component, React ,createRef} from 'react';
export class BusPlayer extends Component {
    constructor(props) {
        super(props)
        this.state = {audioSrc: "https://www.freesoundslibrary.com/wp-content/uploads/2021/06/ding-ding-sound-effect.mp3"}
        this.audioRef = createRef()
    }
    playlist = []

    componentDidUpdate(prevpops) {
        if(this.props !== prevpops)
        {
            let src = [].concat(this.props.audioSrc)
            const shouldPlay = this.props.shouldPlay
            
            if(src === undefined || !(Array.isArray(src) && src.length > 0) || typeof(shouldPlay) !== 'boolean' )
            {
                return
            }
            this.playlist = src
            this.stopPlay()
            if(shouldPlay)
            {
                this.play()
            }
        }
    }
    componentDidMount() {
        const audioEle = this.audioRef.current
        audioEle.addEventListener("ended", this.play.bind(this), false)
    }
    stopPlay() {
        const audioEle = this.audioRef.current
        audioEle.pause()
        audioEle.currentTime = 0
    }

    play() {
        const audioEle = this.audioRef.current
        let path = this.playlist.shift()
        if(path === undefined )
        {
            return;
        }

        audioEle.src = path
        audioEle.play()
    }

    render()
    {
        return(
            <audio 
            ref={this.audioRef}
            >
                Your Device Doesn't support this app.<br/>
                閣 下 設 備 不 支 援 此 應 用 程 式
            </audio>
        )
    }
}