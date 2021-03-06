import React from 'react'
import 'react-tippy/dist/tippy.css'
import { Spinner } from 'react-bootstrap'
import { Tooltip } from 'react-tippy'
import RightPanel from './RightPanel'
import OthersView from './OthersView'
import 'bootstrap/dist/css/bootstrap.min.css'
import CollapsibleButton from './CollapsibleButton'
import { Typeahead } from 'react-bootstrap-typeahead'
import Header from './Header'
import '../../CSS/Main.css'
import Config from '../../config'
import OverlaysObj from './OverlaysObj.js'
import ElementsObj from './ElementsObj.js'

class OverlaysView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      overlaysObj: null,
      selectedOverlay: null,
      elementObj: null,
      isToggle: true
    }
  }

  componentDidMount() {
    var intervalNo = new Date().toISOString().split('.')[0]

    // you need to allow origin to get data from outside server.
    var allowOrigin = 'https://cors-anywhere.herokuapp.com/'
    // var allowOrigin = ''

    // URL for REST API.
    var url = 'http://' + Config.ip + ':' + Config.port + '/overlays?interval=1613067615784'
    //var url = allowOrigin + 'http://67.58.53.58:5000/IPOP/overlays?interval=2020-04-29T21:28:42&current_state=True'

    console.log(url);

    fetch(url).then(res => res.json())
      .then((overlays) => {
        return new OverlaysObj(overlays) // create overlay object that contain all overlays and its details.
      })
      .then((overlaysObj) => { this.setState({ overlaysObj: overlaysObj }) }) // set overlay object to overlaysObj state.
      .catch(() => {
        //console.log('error has been occered on fetch overlay process.')
      })
  }

  // toggle overlay right panel
  handleRightPanelToggle = () => {
    var rightPanelEvent = new Promise((resolve, reject) => {
      try {
        this.setState(prevState => {
          return { isToggle: !prevState.isToggle }
        })
        resolve()
      } catch (e) {
        //console.log(e)
      }
    })

    rightPanelEvent.then(() => {
      if (this.state.isToggle) {
        document.getElementById('rightPanel').hidden = false
      } else {
        document.getElementById('rightPanel').hidden = true
      }
    })
  }

  renderMainContent = () => {
    if (this.state.overlaysObj !== null) {
      if (this.state.selectedOverlay !== null) {
        if (this.state.elementObj !== null) {
          return this.renderGraphContent()
        } else {
          return <Spinner id='loading' animation='border' variant='info' />
        }
      } else {
        return this.renderOverlaysContent()
      }
    } else {
      return <Spinner id='loading' animation='border' variant='info' />
    }
  }

  renderGraphContent = () => {
    return <OthersView overlayName={this.state.selectedOverlay} elementObj={this.state.elementObj} />
  }

  renderOverlaysContent = () => {
    const overlays = this.state.overlaysObj.getOverlayName().map((overlay) => {
      return <Tooltip className='overlayTooltips' sticky={true} key={overlay} duration='500' animation='scale' interactive position='bottom' arrow={true} open={true}
        html={(<div>{overlay}</div>)}>
        <button onClick={this.selectOverlay.bind(this, overlay)} id={overlay} className='overlay' />
      </Tooltip>
    })

    return <>
      <div id="overlayList">{overlays}</div>
      <RightPanel rightPanelTopic={`Overlays (${this.state.overlaysObj.getOverlayList().length})`} >{this.renderRightPanel()}</RightPanel>
    </>
  }

  renderRightPanel = () => {
    return this.renderOverlayBtn()
  }

  renderOverlayBtn = () => {
    const overlayBtn = this.state.overlaysObj.getOverlayName().map((overlay) => {
      return <CollapsibleButton onClick="s" key={overlay + 'Btn'} id={overlay + 'Btn'} name={overlay} className='overlayBtn'>
        <div>{this.state.overlaysObj.getOverlayDescription(overlay)}<br />Number of nodes : {this.state.overlaysObj.getNumberOfNodes(overlay)}<br />Number of links : {this.state.overlaysObj.getNumberOfLinks(overlay)}</div>
      </CollapsibleButton>
    })
    return overlayBtn
  }

  selectOverlay = (overlayId) => {
    this.setState({ selectedOverlay: overlayId })

    var intervalNo = new Date().toISOString().split('.')[0]

    var allowOrigin = 'https://cors-anywhere.herokuapp.com/'
    // var allowOrigin = ''
    var nodeURL = allowOrigin + 'http://' + Config.ip + ':' + Config.port + '/IPOP/overlays/' + overlayId + '/nodes?interval=' + intervalNo + '&current_state=True'
    var linkURL = allowOrigin + 'http://' + Config.ip + ':' + Config.port + '/IPOP/overlays/' + overlayId + '/links?interval=' + intervalNo + '&current_state=True'

    //console.log(nodeURL);

    //console.log(linkURL);

    var elementObj = null

    try {

      fetch(nodeURL).then(res => res.json()).then(nodesJSON => {
        //console.log(nodesJSON);

        fetch(linkURL).then(res => res.json()).then(linksJSON => {
          //console.log(linksJSON);

          elementObj = new ElementsObj(nodesJSON[overlayId]['current_state'], linksJSON[overlayId]['current_state'])

          var nodes = nodesJSON[overlayId]['current_state']

          Object.keys(nodes).sort().forEach((nodeID) => {

            // graphElement.push(JSON.parse(`{"group":"nodes","data": {"id": "${nodeID}","label": "${nodes[nodeID].NodeName}","state":"","type":""}}`))
            elementObj.addNodeElement(nodeID)

            var links = linksJSON[overlayId]['current_state'][nodeID]
            try {

              Object.keys(links).forEach(linkID => {
                // graphElement.push(JSON.parse(`{"group":"edges","data": { "id":"${linkID}" ,"label":"${links[linkID]['InterfaceName']}","source": "${links[linkID]['SrcNodeId']}","target": "${links[linkID]['TgtNodeId']}","state":"","type":"${links[linkID]['Type']}"}}`))
                elementObj.addLinkElement(nodeID, linkID)
              })

            } catch{
                console.log(`${nodeID} has no tunnel.`)
            }
          })

          return elementObj

        }).then((elementObj) => {
          this.setState({ elementObj: elementObj })
        })

      })

    } catch{
      // console.log('error has been occered on fetch node and tunnel process.')
    }
  }

  render() {
    return (<div id="container" className="container-fluid" style={{ padding: '0' }} >

      <Header>
        <Typeahead
          id="searchOverlay"
          onChange={(selected) => {
            try {
              this.selectOverlay(selected[0])
            } catch {
              //console.log('Error has been occured on select search result.')
            }
          }}
          options={this.state.overlaysObj !== null ? this.state.overlaysObj.getOverlayName() : []}
          selected={this.state.selected}
          selectHintOnEnter
          placeholder="Search overlay"
          renderMenuItemChildren={(option) => {
            return (
              <div className="searchResult">
                <div className="resultLabel">
                  {option}
                </div>
                <small className='resultLabel'>{`Number of nodes :  ${this.state.overlaysObj.getNumberOfNodes(option)} Number of links : ${this.state.overlaysObj.getNumberOfLinks(option)}`}</small><br />
              </div>
            )
          }}
        >
        </Typeahead>
      </Header>

      {/* <button onClick={this.handleRightPanelToggle} id="overlayRightPanelBtn" /> */}

      <div id="mainContent" className="row" style={{ backgroundColor: '#101B2B', color: 'white', margin: 'auto' }}>
        {this.renderMainContent()}
      </div>

    </div>)
  }
}

export default OverlaysView