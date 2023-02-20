import { ReadonlyData } from "./../../../formUi"
import { Data, DataCollection } from "josm";
import declareComponent from "../../../../../../../lib/declareComponent";
import Input from "../input";
import LocalFuse from "fuse.js";
import Fuse from "../../../../../../../lib/fuse";
import { Remote } from "comlink";







export default abstract class AutoCompleteInput extends Input {
  private fuse: Remote<LocalFuse<string>>
  public predictions: ReadonlyData<ReturnType<LocalFuse<string>["search"]>> = new Data([])
  constructor(predictions: string[] = [], placeholder?: string) {
    super(placeholder)
    this.fuse = new Fuse(predictions) as any
    

    (async () => {
      const fuse = await this.fuse

      this.value.get(async (value) => {
        const predictions = await fuse.search(value)
        console.log(predictions);
        (this.predictions as any).set(predictions)
      }, false)
    })()
    
  }

  async changePredictions(predictions: string[]) {
    const fuse = await this.fuse
    await fuse.setCollection(predictions)
  }


  // callback when element is removed from DOM

  public pug(): string {
    return super.pug() + require("./autoCompleteInput.pug").default
  }
  stl() {
    return super.stl() + require("./autoCompleteInput.css").toString()
  }
  
}

declareComponent("auto-complete", AutoCompleteInput)
