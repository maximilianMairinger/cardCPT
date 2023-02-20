import { ElementList } from "extended-dom";
import { Data } from "josm";
import declareComponent from "../../../lib/declareComponent";
import ThemeAble from "../themeAble";
import "../_focusAble/_formUi/_editAble/_input/input"
import Input from "../_focusAble/_formUi/_editAble/_input/input"
import "./../_focusAble/_formUi/_rippleButton/_blockButton/blockButton"
import Button from "./../_focusAble/_formUi/_rippleButton/_blockButton/blockButton"
import toMs from "@sindresorhus/to-milliseconds"
import delay, { CancelAblePromise } from "tiny-delay"
import loadAudio from "audio-loader"
import playAudio from "audio-play"
import popup from "./../popup/uiPopup/uiPopup"


export default class Timer extends ThemeAble {

  constructor() {
    super(false)

    const inputs = this.q("c-input") as ElementList<Input>
    let nums = []
    for (const input of inputs) {
      input.focus(() => {input.select()})


      const num = input.validate("\"$[val]\" is not a Number", (val) => {
        return !isNaN(+val)
      })



      nums.push(num)
    }

    const min = this.q(".min") as Input
    const hr = this.q(".hr") as Input


    const hrNum = nums[0]

    hrNum.thenValidate("$[val] is not a Whole Number", (val) => {
      return Math.round(+val) === +val
    })
    hrNum.thenValidate("$[val] is not a Positive Number", (val) => {
      return +val >= 0
    }).thenValidate("My god. Take a break!", (val) => {
      return +val <= 24
    })





    let occupied1 = false
    let occupied2 = false
    min.onChange((va) => {
      const m = +va
      if (m >= 60) {
        if (hr.valid.get()) {
          const hrCount = Math.floor(m / 60)
          hr.value.set((+hr.value.get() + hrCount) + "")
          min.value.set((m - hrCount * 60) + "")
        }
        else {
          if (occupied1) return
          occupied1 = true
          hr.untilValid.then(() => {
            occupied1 = false
            const m = +min.value.get()
            if (m >= 60) {
              const hrCount = Math.floor(m / 60)
              hr.value.set((+hr.value.get() + hrCount) + "")
              min.value.set((m - hrCount * 60) + "")
            }
          })
        }
      }
      else if (m < 0) {
        if (hr.valid.get()) {
          if (+hr.value.get() === 0) {
            min.value.set("0")
            return
          }
          const hrCount = Math.floor(m / 60)
          hr.value.set((+hr.value.get() + hrCount) + "")
          min.value.set((m - hrCount * 60) + "")
        }
        else {
          if (occupied2) return
          occupied2 = true
          hr.untilValid.then(() => {
            occupied2 = false
            const m = +min.value.get()
            if (m < 0) {
              if (+hr.value.get() === 0) {
                min.value.set("0")
                return
              }
              const hrCount = Math.floor(m / 60)
              hr.value.set((+hr.value.get() + hrCount) + "")
              min.value.set((m - hrCount * 60) + "")
            }
          })
        }
      }
    })


    hr.onChange((h) => {
      if (hr.valid.get()) {
        if (h.length === 1) hr.value.set("0" + h)
        else if (h.length === 0) hr.value.set("00")
      }
    })

    min.onChange((m) => {
      if (min.valid.get()) {
        if (m.length === 1) min.value.set("0" + m)
        else if (m.length === 0) min.value.set("00")
      }
    });

    const btn = this.body.btn as Button

    btn.click(() => {
      if (this.running.get()) {
        this.running.set(false)
      }
      else if (hr.valid.get() && min.valid.get()) {
        this.running.set(true)
      }
    })

    let curDel: CancelAblePromise

    this.running.get((running) => {
      btn.content(running ? "Stop" : "Start")

      if (running) {
        for (const input of inputs) input.disable()

        const h = +hr.value.get()
        const m = +min.value.get()

        const total = toMs({hours: h, minutes: m})

        if (curDel) curDel.cancel()
        curDel = delay(total, () => {
          console.log("done")
          loadAudio("./res/audio/tingeling.mp3").then((audio) => {
            const stop = playAudio(audio, {}, () => {})

            popup("Time's up!", "The timer has finished", "OK")
          })
        })
      }
      else {
        for (const input of inputs) input.enable()

        if (curDel) curDel.cancel()
      }
    }, false)
    
  }

  public running = new Data(false)


  public pug(): string {
    return require("./timer.pug").default
  }
  stl() {
    return super.stl() + require("./timer.css").toString()
  }
  
}

declareComponent("timer", Timer)
