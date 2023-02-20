import { delay } from "tiny-delay"
import { declareComponent } from "../../../../../lib/declareComponent"
import Page from "../page"
import "../../../_focusAble/_formUi/_editAble/_input/input"
import "../../../_focusAble/_formUi/_editAble/textArea/textArea"
import TextArea from "../../../_focusAble/_formUi/_editAble/textArea/textArea"
import Input from "../../../_focusAble/_formUi/_editAble/_input/input"
import "../../../_focusAble/_formUi/_rippleButton/_blockButton/blockButton"
import "../../../textBlob/textBlob"
import "../../../../form/form"
import "../../../_focusAble/_formUi/_editAble/_input/_autoCompleteInput/autoCompleteInput"
import "../../../_focusAble/_formUi/_editAble/_input/_autoCompleteInput/select/select"
import AutoCompleteInput from "../../../_focusAble/_formUi/_editAble/_input/_autoCompleteInput/autoCompleteInput"




class HomePage extends Page {
  // defaultDomain = "welcome"

  constructor() {
    super();
    
    (this.body.auto as AutoCompleteInput).changePredictions(["maximilian", "moritz", "ting"])
    

  }


  stl() {
    return super.stl() + require("./home.css").toString()
  }
  pug() {
    return require("./home.pug").default
  }

}

export default declareComponent("home-page", HomePage)