'use strict'

window.view = createView({pxMode: true})
const size = [ 640, 640 ]
const s2 = map( mult(0.1), size )
const n = 10
const border = 2
const dx = maxL(size)/n
const Fd = 0.1
const Fs = 0.1
const accFactor = 0.25
const speed0 = 0.75
const edgeL = s2[0] / 2
const edgeR = size[0] - s2[0] / 2
const edgeT = s2[1] / 2
const edgeB = size[1] - s2[1] / 2
let drawBlue, drawGreen, drawRed, drawGray, drawBlack, drawPlayer
let timer, mousepos, clicked, paused, t0, score, newHigh
let highScore = window.localStorage.getItem('tilesHighScore') || 0
let alive
const pln1 = exp2( noise1() )
const pln2 = exp2( noise1() )
const pdir = t => V.unit( [ pln1( Fd * t ), pln2( Fd * t ) ] )
const pln3 = exp2( noise1() )
const scbuf = 5
const fontSize = 24
const rotarr = n => arr => {
  if ( n === 0 ) return arr
  if ( n === 1 ) return ppd(lst(arr))(head(arr))
  if ( n === -1 ) return apd(fst(arr))(tail(arr))
  if ( n > 1 ) return rotarr( n - 1 )( ppd(lst(arr))(head(arr)) )
  return rotarr( n + 1 )( apd(fst(arr))(tail(arr)) )
}
const gridToPx = ( offx, offy ) => pt => [
  s2[0]*pt[0] + s2[0]/2 + offx, s2[1]*pt[1] + s2[1]/2 + offy
]
const pxToGrid = ( offx, offy ) => pt => [
  round( ( pt[0] - 0.5*s2[0] - offx ) / s2[0] ),
  round( ( pt[1] - 0.5*s2[1] - offy ) / s2[1] )
]
const keyListener = e => {
  const key = e.key
  if ( key === ' ' || key === 'Escape' || key === 'p' ){
    paused = !paused
    if (paused) {
      console.log('PAUSED')
      t0 = timer()
      timer = () => t0
    }
    else {
      console.log('UNPAUSED')
      const timer0 = setTimer()
      timer = () => t0 + timer0()
    }

  }
}

const load = () => {
  window.removeEventListener( 'keydown', load )
  window.removeEventListener( 'click', load )
  generateArt(n).then( art => init(art) )
}
const init = art => {
  view.context.font = `small-caps bold ${fontSize}px sans-serif`
  clicked = false
  alive = true
  paused = false
  t0 = 0
  score = 0
  newHigh = false
  initMouse()
  initKeyboard()

  drawBlue = ( offx, offy ) => ( x, y ) => view.drawImg(
    art.blueBox, 0.5, 0.5 )(
    s2[0]*x + s2[0]/2 + offx, s2[1]*y + s2[1]/2 + offy
  )
  drawGreen = ( offx, offy ) => ( x, y ) => view.drawImg(
    art.greenBox, 0.5, 0.5 )(
    s2[0]*x + s2[0]/2 + offx, s2[1]*y + s2[1]/2 + offy
  )
  drawRed = ( offx, offy ) => ( x, y ) => view.drawImg(
    art.redBox, 0.5, 0.5 )(
    s2[0]*x + s2[0]/2 + offx, s2[1]*y + s2[1]/2 + offy
  )
  drawGray = ( offx, offy ) => ( x, y ) => view.drawImg(
    art.grayBox, 0.5, 0.5 )(
    s2[0]*x + s2[0]/2 + offx, s2[1]*y + s2[1]/2 + offy
  )
  drawBlack = ( offx, offy ) => ( x, y ) => view.drawImg(
    art.blackBox, 0.5, 0.5 )(
    s2[0]*x + s2[0]/2 + offx, s2[1]*y + s2[1]/2 + offy
  )
  drawPlayer = ( offx, offy ) => ( x, y ) => view.drawImg(
    art.player, 0.5, 0.5 )( ...gridToPx( offx, offy )([x,y])
  )
  const p1_ = perlin()
  p1_.perlin_octaves = 1
  const p1 = exp2( x => p1_.noise(x) )
  const p2_ = perlin()
  p2_.perlin_octaves = 1
  const p2 = exp2( x => p2_.noise(x) )
  const state = {
    offg: [ 0, 0 ],
    offt: [ 0, 0 ],
    offp: [ 0, 0 ],
    player: [ 5, 6 ],
    vlines: art.vlines,
    hlines: art.hlines,
    p1,
    p2,
    // vel: [ 2*rand2(), 2*rand2() ],
    t: 0
  }
  run(state)
}
const initMouse = () => {
  const click = e => {
    if ( !paused && alive ) clicked = true
  }
  view.canvas.onmousemove = e => {
    mousepos = [ e.clientX, e.clientY ]
  }
  view.canvas.onmouseleave = e => {
    mousepos = null
  }
  view.canvas.onclick = click
}
const initKeyboard = () => {
  window.addEventListener( 'keyup', keyListener )
}

const run = istate => {
  let state = istate
  let id
  const loop = () => {
    if ( !paused ) {
      state = step(state)
      draw(state)
    }
    if (alive) requestAnimationFrame(loop)
  }
  timer = setTimer()
  id = requestAnimationFrame(loop)
}

const writeCentered = y => str => {
  const txtw = view.context.measureText(str).width
  const x = view.w/2 - txtw/2
  view.text( str, x, y )
}
const writeCentered2 = y => str => {
  const txtw = view.context.measureText(str).width
  const x = view.w/2 - txtw/2
  view.text( str, x, y )
  view.setColor(black)
  view.context.strokeText( str, x, y )
}
const drawGrid = state => {
  const { vlines, hlines, offg } = state
  const vline = i => view.drawImg( vlines[i], 0.5, 0 )( i*dx + offg[0], 0 )
  const hline = i => view.drawImg( hlines[i], 0, 0.5 )( 0, i*dx + offg[1] )
  repeat( n + 1, i => {
    vline(i)
    hline(i)
  } )
}
const drawTiles = state => {
  const btile = drawBlack( ...map(round)(state.offt) )

  btile( -3, -3 )
  btile( 0, -3 )
  btile( 3, -3 )
  btile( 6, -3 )
  btile( 9, -3 )
  btile( 12, -3 )

  btile( -3, 0 )
  btile( 0, 0 )
  btile( 3, 0 )
  btile( 6, 0 )
  btile( 9, 0 )
  btile( 12, 0 )

  btile( -3, 3 )
  btile( 0, 3 )
  btile( 3, 3 )
  btile( 6, 3 )
  btile( 9, 3 )
  btile( 12, 3 )

  btile( -3, 6 )
  btile( 0, 6 )
  btile( 3, 6 )
  btile( 6, 6 )
  btile( 9, 6 )
  btile( 12, 6 )

  btile( -3, 9 )
  btile( 0, 9 )
  btile( 3, 9 )
  btile( 6, 9 )
  btile( 9, 9 )
  btile( 12, 9 )

  btile( -3, 12 )
  btile( 0, 12 )
  btile( 3, 12 )
  btile( 6, 12 )
  btile( 9, 12 )
  btile( 12, 12 )
}
const drawBorder = () => {
  view.setColor(black)
  view.fillRect( 0, 0, size[0], border )
  view.fillRect( 0, size[0] - border, size[0], border )
  view.fillRect( size[0] - border, 0, border, size[1] )
  view.fillRect( 0, 0, border, size[1] )
}
const drawScore = () => {
  // view.setFontSize(fontSize)
  const str = 'Score: ' + flr( timer() )
  const txtw = view.context.measureText(str).width
  const boxx = ( view.w - txtw )/2 - scbuf - border
  const boxx2 = boxx + border
  const boxw = txtw + 2*scbuf + 2*border
  const boxw2 = boxw - 2*border
  const boxh = fontSize + scbuf + border
  const boxh2 = boxh - border
  view.setColor(black)
  view.seta(0.85)
  view.fillRect( boxx, 0, boxw, boxh )
  view.setColor(white)
  view.seta(0.85)
  view.fillRect( boxx2, 0, boxw2, boxh2 )
  view.setColor(black)
  view.text( str, boxx2 + scbuf, 0.9*fontSize )
}
const highlight = state => {
  const player = state.player
  if ( alive ) drawGray( ...state.offp )( ...player )
  else drawRed( ...state.offp )( ...player )
  if ( !mousepos ) return
  const mouseGridPt = pxToGrid( ...state.offp )(mousepos)
  if ( fold(AND)( map2(equals)( mouseGridPt, player ) ) )
    // if at player position
    drawGray( ...state.offp )( ...mouseGridPt )
  else if ( valid( player, mouseGridPt ) )
    // if pointing to a valid target tile
    drawBlue( ...state.offp )( ...mouseGridPt )
  else
    // if pointing to an invalid target
    drawGray( ...state.offp )( ...mouseGridPt )
}
const drawGameOver = () => {

  const best = newHigh ? 'New High Score!: ' : 'Best: '

  view.fillAll( seta( gray, 0.85 ) )
  view.setColor( seta( white, 0.9 ) )
  view.context.font = `small-caps 50px sans-serif`
  writeCentered(200)('Game Over')
  view.context.font = `small-caps 40px sans-serif`
  writeCentered(320)( 'Score: ' + score )
  writeCentered(370)( 'Best: ' + highScore )
  if ( newHigh ) writeCentered(420)('New High Score!')
  view.context.font = `small-caps 30px sans-serif`
  writeCentered(580)('Click To Restart')
  window.addEventListener( 'keydown', load )
  window.addEventListener( 'click', load )
}
const draw = state => {
  view.fillAll(white)

  drawTiles(state)
  drawPlayer( ...state.offp )( ...state.player )

  highlight(state)
  drawGrid(state)
  drawBorder()
  drawScore()
  if (!alive) drawGameOver()
}

const gameOver = () => {
  alive = false
  score = round( timer() )
  if ( score > highScore ) {
    window.localStorage.setItem( 'tilesHighScore', score )
    highScore = score
    newHigh = true
  }
  window.removeEventListener( 'keyup', keyListener )
}

const valid = ( player, target ) => {
  const [ x, y ] = player
  const [ xt, yt ] = target
  return distn( x, y, xt, yt ) <= 2.1
}
const safe = ( x, y ) => ( x % 3 === 0 || y % 3 === 0 )
const velocity = state => {
  // state -> vec
  const t = timer()
  const speed = speed0 + t * ( 1 + pln3( Fs * t ) ) * accFactor
  const dir = pdir(t)
  return V.scaleBy(speed)(dir)
}
const step = state => {
  // state -> state

  const t = timer()
  const addvel = addv(velocity(state))
  const offg = addvel(state.offg)
  const offt = addvel(state.offt)
  const offp = addvel(state.offp)
  const rgx = abs(offg[0]) > s2[0]
  const rgy = abs(offg[1]) > s2[1]
  const rgx2 = abs(offg[0]) > 0.8*s2[0]
  const rgy2 = abs(offg[1]) > 0.8*s2[1]

  let player

  const playerPx = gridToPx( ...state.offp )( state.player )
  if (
    playerPx[0] < edgeL || playerPx[0] > edgeR ||
    playerPx[1] < edgeT || playerPx[1] > edgeB
  ){
    gameOver()
  }
  else if ( clicked && mousepos ) {
    clicked = false
    const mouseGridPt = pxToGrid( ...state.offp )(mousepos)
    if ( valid( state.player, mouseGridPt ) ) {
      player = mouseGridPt
      if ( !safe( ...mouseGridPt ) ) {
        gameOver()
      }
    }
  }

  return merge( state, {
    offg: [
      rgx ? offg[0] % s2[0] : offg[0],
      rgy ? offg[1] % s2[1] : offg[1]
    ],
    offt: [
      abs(offt[0]) > 3*s2[0] ? offt[0] % (3*s2[0]) : offt[0],
      abs(offt[1]) > 3*s2[1] ? offt[1] % (3*s2[1]) : offt[1]
    ],
    vlines: rgx2 ? rotarr(
      sign(offg[0])*flr( offg[0] / s2[0] )
    )( state.vlines ) : state.vlines,
    hlines: rgy2 ? rotarr(
      sign(offg[1])*flr( offg[1] / s2[1] )
    )( state.hlines ) : state.hlines,
    offp,
    player: player || state.player
  } )
}

const start = () => {
  window.addEventListener( 'keydown', load )
  window.addEventListener( 'click', load )
  generateIntroArt().then( box => {
    const [ w, h ] = size
    const rw = 50
    view.fillAll(white)
    view.drawImg( box, 0.5, 0.5 )( ...view.center )
    view.setColor(black)
    view.fillRect( 0, 0, rw, h )
    view.fillRect( 0, 0, h, rw )
    view.fillRect( h - rw, 0, rw, h )
    view.fillRect( 0, h - rw, h, rw )
    view.context.font = `small-caps bold 80px sans-serif`
    writeCentered(300)('Tiles')
    view.context.font = `small-caps 15px sans-serif`
    writeCentered(580)('(based on xkcd.com/245)')
    view.context.font = `small-caps bold 20px sans-serif`
    writeCentered(450)('Click To Start')
  } )
}

view.context.font = `small-caps bold 80px sans-serif`
view.fillAll(black)
view.setColor(white)
writeCentered(320)('Loading...')
setTimeout( start, 1 )
