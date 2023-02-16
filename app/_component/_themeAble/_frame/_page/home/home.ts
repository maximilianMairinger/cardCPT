import { delay } from "tiny-delay"
import { declareComponent } from "../../../../../lib/declareComponent"
import Page from "../page"
import "../../../_focusAble/_formUi/_editAble/input/input"
import "../../../_focusAble/_formUi/_editAble/textArea/textArea"
import TextArea from "../../../_focusAble/_formUi/_editAble/textArea/textArea"
import Input from "../../../_focusAble/_formUi/_editAble/input/input"
import "../../../_focusAble/_formUi/_rippleButton/_blockButton/blockButton"
import "../../../textBlob/textBlob"
import "../../../../form/form"




class HomePage extends Page {
  // defaultDomain = "welcome"

  constructor() {
    super();
    

    
  }


  stl() {
    return super.stl() + require("./home.css").toString()
  }
  pug() {
    return require("./home.pug").default
  }

}

export default declareComponent("home-page", HomePage)