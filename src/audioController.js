import { Component, React ,createRef} from 'react';
export class BusPlayer extends Component {
    constructor(props) {
        super(props)
        this.state = {audioSrc: "https://www.freesoundslibrary.com/wp-content/uploads/2021/06/ding-ding-sound-effect.mp3"}
        this.audioRef = createRef()
        this.playNum = undefined
        this.isPlaying = false
    }
    playlist = []

    componentDidUpdate(prevpops) {
        if(this.props !== prevpops && this.props.playNum !== prevpops.playNum)
        {
            let src = [].concat(this.props.audioSrc)
            const shouldPlay = this.props.shouldPlay
            
            if(src === undefined || !(Array.isArray(src) && src.length > 0) || typeof(shouldPlay) !== 'boolean' )
            {
                this.isPlaying = false
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
        this.isPlaying = false
    }
    
    play() {
        const audioEle = this.audioRef.current
        let path = this.playlist.shift()
        if(path === undefined )
        {
            this.isPlaying = false
            return
        }
        this.isPlaying = true
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