import RippleButton from "../rippleButton";
import delay from "delay"
import declareComponent from "../../../../../../lib/declareComponent";
import { Data } from "josm";
import ResablePromise from "../../../../../../lib/resablePromise";


export default class BlockButton extends RippleButton {
  protected textElem = ce("button-text")
  protected contentBody = ce("content-body").apd(this.textElem)
  constructor(content: string = "", onClick?: ((e?: MouseEvent | KeyboardEvent) => any)) {
    super();

    this.getContentBodyPromise.res(this.contentBody)

    if (onClick) this.click(onClick)
    this.content(content);
    this.apd(this.contentBody)
  }

  private getContentBodyPromise: ResablePromise
  protected getContentBody() {
    return this.getContentBodyPromise !== undefined ? this.getContentBodyPromise : this.getContentBodyPromise = new ResablePromise()
  }

  content(to: string | Data<string>) {
    this.textElem.text(to as any)
  }
  stl() {
    return super.stl() + require('./blockButton.css').toString();
  }
  pug() {
    return super.pug() + require("./blockButton.pug").default
  }
}

declareComponent("block-button", BlockButton)