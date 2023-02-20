import keyIndex from "key-index"
import { loadRecord } from "./../../../_frame/frame"
import { Data, DataBase, DataCollection } from "josm";
import ResablePromise from "../../../../../lib/resablePromise";
import FormUi from "../formUi";
import { EventListener } from "extended-dom"
import LinkedList, { Token } from "fast-linked-list"
import MultiMap from "multimap"
import interpolateString from "josm-interpolate-string";





type ReadonlyData<T> = Omit<Data<T>, "set">

type ErrorTree = {[key in number]: {value: string, msg: string, children: ErrorTree}}


type thenValidate = (msg: string | ReadonlyData<string>, cb: ((input: string) => boolean) | ReadonlyData<boolean>) => { remove: () => void, thenValidate: thenValidate }
// @ts-ignore
let tippy: Promise<typeof import("/Users/maximilianmairinger/projects/virtualCottage/node_modules/tippy.js/index")["default"]>



export default class EditAble extends FormUi {

  
  public isEmpty: ReadonlyData<boolean>
  public value: Data<string>


  protected contentBody = ce("content-body")
  protected placeholderContainer = ce("placeholder-container")
  
  protected placeholderText = ce("placeholder-text")

  protected placeholderUp: Data<boolean>


  private evenShowErrorWhenEmpty: Data<boolean> = new Data(false)

  constructor(public inputElem: HTMLInputElement | HTMLTextAreaElement, placeholder = "") {
    super()
    inputElem.id = "editAble"
    this.apd(this.contentBody)
    this.contentBody.apd(this.placeholderContainer.apd(this.placeholderText))
    this.contentBody.apd(inputElem as any)
    

    this.getContentBodyPromise.res(this.contentBody)

    

    this.userFeedbackMode.ripple.set(false)

    this.placeholder(placeholder)

    this.enabled.get((enabled) => {
      if (enabled) {
        this.inputElem.tabIndex = 0
        clickListener.activate()
      }
      else {
        this.inputElem.tabIndex = -1
        clickListener.deactivate()
      }
    }, false)

    

    
    const value = (this as any).value = new Data(this.inputElem.value)
    this.inputElem.on("input", () => {(this.value as Data<string>).set(this.inputElem.value)})
    value.get((v) => {
      this.inputElem.value = v
    }, false)
    const isEmpty = (this as any).isEmpty = value.tunnel((v) => v === "")

    this.placeholderUp = new Data(false) as any
    new DataCollection(this.isFocused as Data<boolean>, isEmpty).get((isFocused, isEmpty) => {
      this.placeholderUp.set(!isEmpty || isFocused)
    })

    
    


    let globalAnimDone: Symbol
    this.placeholderUp.get((up) => {
      

      let localAnimDone = globalAnimDone = Symbol()
      this.componentBody.removeClass("animDone")
      this.placeholderText.anim(up ? {paddingTop: ".5em", fontSize: ".8em"} : {paddingTop: "1em", fontSize: "1em"}, 200).then(() => {
        if (localAnimDone === globalAnimDone) this.componentBody.addClass("animDone")
      })
    })

    isEmpty.get((isEmpty) => {
      this.placeholderText.css({fontWeight: isEmpty ? "normal" : "bold"})
    })

    const clickListener = this.on("click", () => {
      inputElem.focus()
    })



    // TODO: maybe make this a observable list (DataBase), when inject/remove is implemented
    type Msgs = (string | ReadonlyData<string>)[]
    let msgs = [] as Msgs



    const parseMsg = (msg: ReadonlyData<string> | string) => {
      return interpolateString(msg, {
        value: this.value.get()
      }, {v: "value", val: "value"})
    }


    const errorCount = new Data(0)
    this.valid = errorCount.tunnel((count) => count === 0)



    const errorMsgElements = ce("ul")
    function propergateErrorMsgElems(error: DataBase<ErrorTree[number]>, parent: HTMLElement) {
      const el = ce("li")
      parent.apd(el)
      el.txt(parseMsg(error.msg))

      error.value.get((value) => {
        if (value) el.show()
        else el.hide()
      })

      return el
    }

    function keepTrackOfGlobalValidity(value: DataBase<ErrorTree[number]>["value"]) {
      value.get((value) => {
        if (value) errorCount.set(errorCount.get() + 1)
        else errorCount.set(errorCount.get() - 1)
      }, false)
      if (value.get()) errorCount.set(errorCount.get() + 1)
    }

    function subToAllChildren(errorTree: DataBase<ErrorTree>, parent: HTMLElement) {
      errorTree((full, diff) => {
        setTimeout(() => {
          for (const key in diff) {
            if (diff[key] === undefined) continue
            keepTrackOfGlobalValidity(errorTree[key].value)
            const el = propergateErrorMsgElems(errorTree[key], parent)
            subToAllChildren(errorTree[key].children, el)
          }
        })
      }, false)
    }

    subToAllChildren(this.errorTree, errorMsgElements)

    
    this.showingInvalidity = new Data(false)
    new DataCollection(this.valid as any, this.evenShowErrorWhenEmpty, isEmpty).get((valid, evenShowErrorWhenEmpty, isEmpty) => {
      (this.showingInvalidity as any).set(!valid && (!isEmpty || evenShowErrorWhenEmpty))
    })




    this.valid.get((valid) => {
      if (!valid) this.untilValid = new ResablePromise()
      else this.untilValid.res()
    }, false)


    this.showingInvalidity.get((invalid) => {
      if (invalid) this.untilShowingValid = new ResablePromise()
      else this.untilShowingValid.res()
    }, false)



    if (tippy === undefined) tippy = new Promise((res) => {
      loadRecord.full.add(async () => {
        res((await import("tippy.js")).default)
      })
    })


    const tip = tippy.then((tippy) => {
      const tip = tippy(this as HTMLElement, {
        content: errorMsgElements,
        allowHTML: true,
        placement: "top",
        animation: "scale-subtle",
        arrow: true,
        theme: "light",
        // trigger: "manual",
        maxWidth: 300,
        // interactive: true,
        hideOnClick: false,
        appendTo: this.componentBody as HTMLElement,
        // popperOptions: {
        //   modifiers: [
        //     {
        //       name: "offset",
        //       options: {
        //         offset: [0, 10],
        //       },
        //     },
        //   ],
        // },
      })
      this.showingInvalidity.get((invalid) => {
        if (!invalid) {
          tip.disable()
          tip.hide()
        }
      })


      return tip
    })


    const activateTippy = async () => {
      const t = await tip
      t.enable()
      // if still focused show
      if (this.isFocused.get()) t.show()
    }






    this.onChange(() => {
      if (this.showingInvalidity.get()) {
        this.componentBody.addClass("invalid")

        activateTippy()

        this.untilShowingValid.then(() => {
          this.componentBody.removeClass("invalid")
        })
      } 
    }, false)

    const callOnChange = () => {
      for (const cb of this.onChangeListener) cb(this.value.get())
      if (this.valid.get()) for (const cb of this.onValidChangeListener) cb(this.value.get())
    }

    const blurLs = this.inputElem.on("blur", callOnChange)
    // on enter
    const enterLs = this.inputElem.on("keydown", (e) => {
      if (e.key === "Enter") {
        callOnChange()
        blurLs.deactivate()
        enterLs.deactivate()
        const ls1 = this.inputElem.on("input", () => {
          blurLs.activate()
          enterLs.activate()
          ls2.deactivate()
        }, {once: true})
        const ls2 = this.inputElem.on("blur", () => {
          blurLs.activate()
          enterLs.activate()
          ls1.deactivate()
        }, {once: true})
      }
    })
  }

  public showingInvalidity: ReadonlyData<boolean>

  private onChangeListener = new LinkedList<(val: string) => void>()
  private onValidChangeListener = new LinkedList<(val: string) => void>()
  onChange(cb: (value: string) => void, onlyValid = true) {
    return onlyValid ? this.onValidChangeListener.push(cb) : this.onChangeListener.push(cb)
  }

  untilValid: ResablePromise<void> = ResablePromise.resolve() as any
  untilShowingValid: ResablePromise<void> = ResablePromise.resolve() as any



  private getContentBodyPromise: ResablePromise
  protected getContentBody() {
    return this.getContentBodyPromise !== undefined ? this.getContentBodyPromise : this.getContentBodyPromise = new ResablePromise()
  }


  private errorTree: DataBase<ErrorTree> = new DataBase({}) as any

  private errorTreeInfoMap = keyIndex<ErrorTree, {leadingIndex: number}>(() => {return {leadingIndex: 0}}, WeakMap)

  validate(msg: string | ReadonlyData<string>, _cb: ((input: string) => boolean) | ReadonlyData<boolean>): { remove: () => void, thenValidate: thenValidate } {
    const value = _cb instanceof Function ? this.value.tunnel(_cb) : _cb
    
    const info = this.errorTreeInfoMap(this.errorTree())

    const id = info.leadingIndex
    info.leadingIndex++
    this.errorTree({[id]: {msg, value, children: {}}})
    const deeperTree = this.errorTree[id].children

    const that = this
    function thenValidate(msg: string | ReadonlyData<string>, _newCb: ((input: string) => boolean) | ReadonlyData<boolean>, myErrorTree: DataBase<ErrorTree>) {
      const value = _newCb instanceof Function ? that.value.tunnel(_newCb) : _newCb

      const info = that.errorTreeInfoMap(myErrorTree())

      const id = info.leadingIndex
      info.leadingIndex++
      myErrorTree({[id]: {msg, value, children: {}}})
      const deeperTree = myErrorTree[id].children

      return {
        remove: () => {
          myErrorTree({[id]: undefined})
        },
        thenValidate: (a, b) => {
          // @ts-ignore
          return thenValidate(a, b, deeperTree)
        }
      }
    }

    return {
      remove: () => {
        this.errorTree({[id]: undefined})
      },
      thenValidate: (msg: string | ReadonlyData<string>, _newCb: ((input: string) => boolean) | ReadonlyData<boolean>) => 
        thenValidate(msg, _newCb, deeperTree)
      
    }
  }

  displayInvalidReminderIfNeeded() {
    if (this.valid.get()) return
    if (!this.evenShowErrorWhenEmpty.get()) {
      this.evenShowErrorWhenEmpty.set(true)
      this.focus(() => {
        this.evenShowErrorWhenEmpty.set(false)
      })
    }

    // todo: maybe wiggle when already showing invalidity
  }


  public valid: ReadonlyData<boolean>

  select() {
    this.inputElem.select()
  }
  disable() {
    this.enabled.set(false)
  }
  enable() {
    this.enabled.set(true)
  }
  clear() {
    this.value.set("")
  }
  
  focus(): this
  focus(cb: () => void): EventListener
  focus(cb?: () => void) {
    if (cb) return this.inputElem.on("focus", cb)
    this.inputElem.focus()
    return this
  }
  placeholder(to: string) {
    this.placeholderText.text(to)
  }
  content(to: string) {
    this.value.set(to)
  }
  public pug(): string {
    return super.pug() + require("./editAble.pug").default
  }
  stl() {
    // TODO: lazy import
    return super.stl() + require("tippy.js/themes/light.css") + require("tippy.js/animations/scale-subtle.css") + require("tippy.js/dist/tippy.css").toString() + require("./editAble.css").toString()
  }
  
}

