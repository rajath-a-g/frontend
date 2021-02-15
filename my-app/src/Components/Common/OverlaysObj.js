export default class OverlaysObj {
  constructor(overlays) {
    var overlayList = []
    console.log(overlays)
    overlays.forEach(obj => obj['Overlays'].forEach(overlay => {
      console.log(overlay)
      const overlayStr = { name: overlay.OverlayId, numberOfNodes: overlay.NumNodes, numberOfLinks: overlay.NumEdges }
      // const overlayStr = { name: overlay, numberOfNodes: overlays[overlay].NumNodes, numberOfLinks: overlays[overlay].NumLinks }
      overlayList.push(overlayStr)
    }))

    this.getOverlayList = () => {
      return overlayList
    }

    this.getOverlayName = () => {
      var overlaysName = []
      this.getOverlayList().forEach(overlay => { overlaysName.push(overlay.name) })
      return overlaysName
    }

    this.getOverlay = (overlay) => {
      return overlayList.find(element => element.name === overlay)
    }

    this.getNumberOfNodes = (overlay) => {
      return overlayList.find(element => element.name === overlay).numberOfNodes
    }

    this.getNumberOfLinks = (overlay) => {
      return overlayList.find(element => element.name === overlay).numberOfLinks
    }
    this.getOverlayDescription = (overlay) => {
      return "EVio"
    }


  }
}
