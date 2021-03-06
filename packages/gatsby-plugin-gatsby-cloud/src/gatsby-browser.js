import React from "react"
import { createPortal } from "react-dom"
import Indicator from "./components/Indicator"

const ShadowPortal = ({ children, identifier }) => {
  const mountNode = React.useRef(null)
  const portalNode = React.useRef(null)
  const shadowNode = React.useRef(null)
  const [, forceUpdate] = React.useState()

  React.useEffect(() => {
    const ownerDocument = mountNode.current.ownerDocument
    portalNode.current = ownerDocument.createElement(identifier)
    shadowNode.current = portalNode.current.attachShadow({ mode: `open` })
    ownerDocument.body.appendChild(portalNode.current)
    forceUpdate({})
    return () => {
      if (portalNode.current && portalNode.current.ownerDocument) {
        portalNode.current.ownerDocument.body.removeChild(portalNode.current)
      }
    }
  }, [])

  return shadowNode.current ? (
    createPortal(children, shadowNode.current)
  ) : (
    <span ref={mountNode}></span>
  )
}

export const wrapRootElement = ({ element }, pluginOptions) => {
  if (
    process.env.GATSBY_PREVIEW_INDICATOR_ENABLED === `true` &&
    !pluginOptions?.disablePreviewUI
  ) {
    return (
      <>
        {element}
        <ShadowPortal identifier="gatsby-preview-indicator">
          <Indicator />
        </ShadowPortal>
      </>
    )
  } else {
    return <>{element}</>
  }
}
