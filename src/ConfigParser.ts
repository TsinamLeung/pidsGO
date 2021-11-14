import CSV from 'csv-parse/lib/sync';

const ResourcePath = 'resource/'
const ButtonSettingSuffix = "_btn"

export class LineInfo {
    arrivalaudio: Array<String> = []
    departureaudio: Array<String> = []
    speed: String = ""
    gps: String = ""
    info: String = ""
    fare: String = ""
}

export class ButtonInfo {
    buttonID: String = ""
    text: String = ""
    audio: String = ""
}

export class ConfigParser {
    lineCongfigPath = "/config/"
    audioResoucePath = "/resource/"
    lineConfigHeader = ["arrivalaudio", "departureaudio", "speed", "gps", "info", "fare"]
    btnConfigHeader = ["buttonid", "text", "audio"]

    audioPathProcess(src : String) {
        let ret = src.split(";").filter((val, _index, _arr) => {
            return String(val).length > 0
        })

        ret = ret.map((val) => {
            return ResourcePath + val
        })
        return ret
    }
    async parseButtonConfig(lineid: String): Promise<ButtonInfo[]> {
        let ret : Array<ButtonInfo> = []

        let response = await fetch(this.lineCongfigPath + lineid + ButtonSettingSuffix + ".csv")
        if (response.status !== 200) {
            response = await fetch(this.lineCongfigPath + lineid + "default_btn" + ".csv")
            if(response.status !== 200) 
            {
                console.error("[parseButtonConfig]fetch error")
                return []
            }
        }

        const responseText = await response.text()
        const btnCSV = CSV(responseText, {
            trim: true,
            skip_empty_lines: true,
            columns: true,
            cast: (value,context) => {

                if(context.column === this.btnConfigHeader[2]){
                    return this.audioPathProcess(value)
                }
                return value
            }
        })
        
        for(let index in btnCSV) 
        {
            let obj = new ButtonInfo()
            Object.assign(obj, btnCSV[index])
            ret.push(obj)
        }
        return ret
    }
    async parseLineConfig(lineid: String): Promise<LineInfo[]> {
        let response = await fetch(this.lineCongfigPath + lineid + ".csv")
        if (response.status !== 200) {
            console.error("cannot load line")
            return []
        }
        const responseText = await response.text()
        const lineCSV = CSV(responseText, {
            trim: true,
            skip_empty_lines: true,
            columns: true,
            cast: (value, context) => {
                if (context.column === this.lineConfigHeader[0] || context.column === this.lineConfigHeader[1]) {
                    let ret = this.audioPathProcess(value)
                    return ret
                }

                if (context.column === this.lineConfigHeader[4]) {
                    let ret = String(value).replace("^", "\n")
                    return ret
                }

                return value
            }
        })
        let ret: Array<LineInfo> = []
        for (let index in lineCSV) {
            let o = new LineInfo()
            Object.assign(o, lineCSV[index])
            ret.push(o)
        }
        return ret
    }
}
