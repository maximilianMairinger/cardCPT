import declareComponent from "../../../lib/declareComponent";
import ThemeAble from "../themeAble";
import { Data } from "josm";
import ResablePromise from "../../../lib/resablePromise";
import { LongWithoutOverridesClass } from "bson";




export default class Popup extends ThemeAble {
  public showing = new Data(false) as Data<boolean>

  public done: ResablePromise<string | boolean>

  constructor() {
    super()
    this.showing.get((showing) => {
      if (showing) {
        
        this.body.back.show()
        this.body.back.anim({opacity: 1})
        this.body.body.show()
        this.body.body.anim({opacity: 1, translateY: .1}).then(() => {
          console.log("done showing")
        })
        console.log("showing")
      }
      else {
        this.body.body.anim({opacity: 0, translateY: 10}).then(() => {
          this.body.body.hide()
          console.log("done hiding")
        })
        this.body.back.anim({opacity: 0}).then(() => {
          this.body.back.hide()
        })
        console.log("hiding")
      }
    }, false)

    this.body.back.on("mousedown", () => {
      this.hide()
      this.done.res(false)
    })

    this.mkProm()
  }
  protected mkProm() {
    this.done = new ResablePromise()
  }

  show() {
    this.showing.set(true)
    return this
  }

  hide() {
    this.showing.set(false)
    return this
  }
  

  public pug(): string {
    return require("./popup.pug").default
  }
  stl() {
    return super.stl() + require("./popup.css").toString()
  }
  
}



declareComponent("pop-up", Popup)

