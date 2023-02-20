import declareComponent from "../../../../../../../../lib/declareComponent";
import AutoCompleteInput from "../autoCompleteInput";








export default abstract class Select extends AutoCompleteInput {
  constructor(predictions: string[] = [], placeholder?: string) {
    super(predictions, placeholder)
    

    this.validate("Please select one of the options", this.predictions.tunnel((predictions) => predictions.length === 0))
    
  }

  public pug(): string { 
    return super.pug() + require("./select.pug").default
  }
  stl() {
    return super.stl() + require("./select.css").toString()
  }
  
}

declareComponent("select", Select)
