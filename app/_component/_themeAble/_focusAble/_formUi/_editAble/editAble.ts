import { loadRecord } from "./../../../_frame/frame"
import { Data, DataCollection } from "josm";
import ResablePromise from "../../../../../lib/resablePromise";
import FormUi from "../formUi";
import { EventListener } from "extended-dom"
import LinkedList, { Token } from "fast-linked-list"
import MultiMap from "multimap"
import interpolateString from "josm-interpolate-string";


type ReadonlyData<T> = Omit<Data<T>, "set">


type thenValidate = ((msg: string | ReadonlyData<string>, cb: (input: string) => boolean) => { remove: () => void, thenValidate: thenValidate }) & ((cb: (input: string) => boolean) => { remove: () => void, thenValidate: thenValidate })
// @ts-ignore
let tippy: Promise<typeof import("/Users/maximilianmairinger/projects/virtualCottage/node_modules/tippy.js/index")["default"]>

export default class EditAble extends FormUi {

  
  public isEmpty: ReadonlyData<boolean>
  public value: Data<string>


  protected contentBody = ce("content-body")
  protected placeholderContainer = ce("placeholder-container")
  
  protected placeholderText = ce("placeholder-text")

  protected placeholderUp: Data<boolean>
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

    this.value.get((v) => {
      let valid = true
      msgs = []
      for (const [cb, msg] of this.cbs) {
        if (!cb(v)) {
          valid = false
          if (msg !== undefined) msgs.push(msg)
        }
        else {
          const rec = (cb) => {
            const cbs = this.laterCbs.get(cb)
            if (cbs !== undefined) {
              for (const {cb, msg} of cbs) {
                if (!cb(v)) {
                  valid = false
                  if (msg !== undefined) msgs.push(msg)
                }
                else rec(cb)
              }
            }
          }
          rec(cb)
        }
      }
      (this.valid as Data<boolean>).set(valid)
    })



    this.valid.get((valid) => {
      if (!valid) this.untilValid = new ResablePromise()
      else this.untilValid.res()
    }, false)




    if (tippy === undefined) tippy = new Promise((res) => {
      loadRecord.full.add(async () => {
        res((await import("tippy.js")).default)
      })
    })


    const updateTippy = () => {
      tippy.then((tippy) => {
        if (!this.valid.get()) {
          const parseMsg = (msg: string) => {
            return interpolateString(msg, {
              value: this.value.get(),
              val: this.value.get(),
              v: this.value.get(),
            })
          }
          const constrMsgHTML = (msg: Msgs[number]): Element => {
            const li = ce("li")
            return msg instanceof Array ? li.apd(...msg.map(constrMsgHTML)) : li.text(typeof msg === "string" ? parseMsg(msg) : msg.tunnel(parseMsg) as any)
          }
          const content = ce("ul").apd(...msgs.map(constrMsgHTML))
          if (tip === undefined) {
            tip = tippy(this as HTMLElement, {
              content,
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
            this.valid.get((valid) => {
              if (valid) tip.disable()
            }, false)
          }
          else tip.setContent(content)

          tip.enable()

          // if still focused show
          if (this.isFocused.get()) tip.show()
          
        }
      })
    }

    const updateTippyOnChange = this.value.get(() => {
      updateTippy()
    }, false)
    updateTippyOnChange.deactivate()


    let tip: import("tippy.js").Instance
    this.onChange(() => {
      if (!this.valid.get()) {
        this.componentBody.addClass("invalid")

        updateTippyOnChange.activate()

        this.untilValid.then(() => {
          this.componentBody.removeClass("invalid")
          updateTippyOnChange.deactivate()
        })

        updateTippy()



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

  private onChangeListener = new LinkedList<(val: string) => void>()
  private onValidChangeListener = new LinkedList<(val: string) => void>()
  onChange(cb: (value: string) => void, onlyValid = true) {
    return onlyValid ? this.onValidChangeListener.push(cb) : this.onChangeListener.push(cb)
  }

  untilValid: ResablePromise<void> = ResablePromise.resolve() as any



  private getContentBodyPromise: ResablePromise
  protected getContentBody() {
    return this.getContentBodyPromise !== undefined ? this.getContentBodyPromise : this.getContentBodyPromise = new ResablePromise()
  }

  private cbs = new Map<(input: string) => boolean, string | ReadonlyData<string>>()
  private laterCbs = new MultiMap<(input: string) => boolean, {cb: (input: string) => boolean, msg?: string | ReadonlyData<string>, remove: () => void}>()
  validate(msg: string | ReadonlyData<string>, cb: (input: string) => boolean): { remove: () => void, thenValidate: thenValidate }
  validate(cb: ((input: string) => boolean), msg_cb?: string | ReadonlyData<string>): { remove: () => void, thenValidate: thenValidate }
  validate(cb_msg: string | ReadonlyData<string> | ((input: string) => boolean), msg_cb?: string | ReadonlyData<string> | ((input: string) => boolean)) {
    const a = cb_msg instanceof Function
    const cb = a ? cb_msg : msg_cb as (input: string) => boolean
    const msg = (a ? msg_cb : cb_msg) as string | ReadonlyData<string>
    this.cbs.set(cb, msg)



    const that = this
    function thenValidate(msg: string | ReadonlyData<string>, cb: (input: string) => boolean): { remove: () => void, thenValidate: thenValidate }
    function thenValidate(cb: (input: string) => boolean, msg_cb?: string | ReadonlyData<string>): { remove: () => void, thenValidate: thenValidate }
    function thenValidate(cb_msg: string | ReadonlyData<string> | ((input: string) => boolean), msg_cb?: string | ReadonlyData<string> | ((input: string) => boolean), oldCB = cb) {
      const a = cb_msg instanceof Function
      const newCb = a ? cb_msg : msg_cb as (input: string) => boolean
      const msg = (a ? msg_cb : cb_msg) as string | ReadonlyData<string>

      const remove = () => {
        that.laterCbs.delete(oldCB)
        for (const {remove} of that.laterCbs.get(newCb)) remove()
      }

      that.laterCbs.set(oldCB, {cb: newCb, msg, remove})

      return {
        remove,
        thenValidate: (a, b) => {
          // @ts-ignore
          return thenValidate(a, b, newCb)
        }
      }
    }

    return {
      remove: () => {
        that.cbs.delete(cb)
        for (const {remove} of that.laterCbs.get(cb)) remove()
      },
      thenValidate
    }
  }


  public valid: ReadonlyData<boolean> = new Data(true)

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

