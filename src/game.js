'use strict'

window.view = createView({pxMode: true})
const size = [ 640, 640 ]
const n = 10
const border = 2

const load = () => {
  generateLines(n).then( lines => init(lines) )
}

const init = lines => {
  let vlines = lines.vlines
  let hlines = lines.hlines
  const dx = maxL(size)/n
  const vline = xoff => i => view.drawImg( vlines[i], 0.5, 0 )( i*dx + xoff, 0 )
  const hline = yoff => i => view.drawImg( hlines[i], 0, 0.5 )( 0, i*dx + yoff )
  const drawGrid = ( xoff, yoff ) => {
    const drawv = vline(xoff)
    const drawh = hline(yoff)
    repeat( n + 1, i => {
      drawv(i)
      drawh(i)
    } )
  }
  run({ vlines, hlines, drawGrid })
}

const drawBorder = () => {
  view.fillRect( 0, 0, size[0], border )
  view.fillRect( 0, size[0] - border, size[0], border )
  view.fillRect( size[0] - border, 0, border, size[1] )
  view.fillRect( 0, 0, border, size[1] )
}

const run = ({ vlines, hlines, drawGrid }) => {
  drawGrid( 30, 50 )
  drawBorder()
}

load()
