import Component from "../component"
import declareComponent from "../../lib/declareComponent"
import PageManager from "./../_themeAble/_frame/_manager/pageManager/pageManager"
import lang from "../../lib/lang"
import LowerNav from "../_themeAble/lowerNav/lowerNav"
import Header from "../_themeAble/header/header"
import { dirString } from "../../lib/domain"
import { ElementList } from "extended-dom"
import HighlightAbleIcon from "../_themeAble/_icon/_highlightAbleIcon/highlightAbleIcon"
import { Data, DataSubscription } from "josm"
import { linkRecord } from "../_themeAble/link/link"
import RocketIcon from "./../_themeAble/_icon/_highlightAbleIcon/rocket/rocket"
import ThoughtBubbleIcon from "./../_themeAble/_icon/_highlightAbleIcon/thoughtBubble/thoughtBubble"
import TeamIcon from "./../_themeAble/_icon/_highlightAbleIcon/team/team"
import ContactIcon from "./../_themeAble/_icon/_highlightAbleIcon/contact/contact"


const topLimit = 10
const scrollTrendActivationCount = 20

// intentionally never resolve those
linkRecord.record()

export default class Site extends Component {

  constructor() {
    super()


    


    let lastScrollProg = 0
    

    // let lowerNav = new LowerNav()
    let currentlyShowingLowerNav: boolean


    let header = new Header(async (hide, init, func) => {
      if (hide) {
        
        currentlyShowingLowerNav = false

        // await lowerNav.disable(init, func)

      }
      else {
        currentlyShowingLowerNav = true

        
        // await lowerNav.enable(init, func)
        // if (currentSection !== undefined) lowerNav.updateSelectedLink(currentSection)

      }
      
    }, true)

    let navs = new ElementList<Element>(header)
    
    let currentSection: string

    const pageIconIndex = {
      single: new ThoughtBubbleIcon(),
      "4some": new TeamIcon(),
      full: new RocketIcon()
    }

    let pageManager = new PageManager((page, sections, domainLevel) => {
      let section = page
      currentSection = section
      // if (currentlyShowingLowerNav) lowerNav.updateSelectedLink(section)
      header.updateSelectedLink(section)
    }, () => {

    }, (prog) => {
      if (lastScrollProg > topLimit) {
        if (prog <= topLimit) {
          header.onTop()
        }
      }
      else if (prog > topLimit) {
        header.notTop()
      }

      lastScrollProg = prog
    });

    // lowerNav.updatePage(pageIconIndex, 0)
    header.updatePage(Object.keys(pageIconIndex), 0)
    

    this.apd(pageManager)
    pageManager.activate()
    pageManager.minimalContentPaint().then(() => {


      // @ts-ignore
      const themeSubHeader = new DataSubscription(new Data(undefined), (theme) => {
        header.theme.set(theme as any)
      }, true, false)

      

      // @ts-ignore
      // const themeSubLowerNav = new DataSubscription(new Data(undefined), (theme) => {
      //   lowerNav.theme.set(theme as any)
      // }, true, false)
      

      // const accentThemeSub = new DataSubscription(new Data(undefined), (theme) => {
        
      //   lowerNav.accentTheme.set(theme as any)
      // }, true, false)
      // pageManager.addAccentThemeIntersectionListener(lowerNav, accentThemeSub.data.bind(accentThemeSub))    
      pageManager.addThemeIntersectionListener(header, themeSubHeader.data.bind(themeSubHeader))    
      // pageManager.addThemeIntersectionListener(lowerNav, themeSubLowerNav.data.bind(themeSubLowerNav))
      
      pageManager.fullContentPaint().then(() => {
        pageManager.completePaint().then(() => {

        })
      })

    })
    
    
    





    this.apd(header)
    
    
    


    

  }

  stl() {
    return super.stl() + require("./site.css").toString()
  }
  pug() {
    return require("./site.pug").default
  }
}

declareComponent("site", Site)
