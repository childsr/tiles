const F = 0.03
const k = 1.25
const lw = 2
const buf = 2
const l = 640
const Rd = 25

const th = lw + 2*buf
const color = black
const s = l / 10
const shaded = size => ( color, amin = 50, amax = 255 ) => {
  // size -> color -> shader
  const maxd = size
  const ctr = [ size/2, size/2 ]
  const a = ( x, y ) => {
    const d = dist( [ x, y ], ctr ) / maxd
    return smoothStep( amin, amax, d )
  }
  return ( x, y, clr ) => seta( color, a( x, y ) )
}
const genbox = ( shdr, size ) => {
  return generateImg( size, size )(shdr)
}

//Generate all visual assets
const generateArt = async (n) => {
  const vline = length => {
    const pln = ( () => {
      const p = perlin()
      p.perlin_octaves = 1
      return exp2( ( x, y ) => k*p.noise( F*x, F*y ) )
    } )()
    const x0 = ( th + 2*k ) / 2
    const shape = rect( th, length )( x0, length/2, 0 )
    const ld = ( x, y ) => abs( x - x0 )
    const a = ( x, y ) => {
      const d = ( ld( x, y ) - lw/2 ) / buf
      if ( d < 0 ) return 255
      if ( d > 1 ) return 0
      return linear( 255, 0, d )
    }
    const shdr0 = only(shape)(nfill(color))
    const shdr = ( x, y, clr ) => {
      const dx = pln(x,y)
      return seta( shdr0( x + dx, y, clr ), a( x + dx, y ) )
    }
    return shdr
  }
  const hline = l => {
    const line = vline(l)
    return ( x, y, clr ) => line( y, x, clr )
  }

  const gen = generateImg( th + 2*k, l )
  const genh = generateImg( l, th + 2*k )

  const volOn = new Image( 50, 50 )
  volOn.src = 'soundOn.png'
  const volOff = new Image( 22, 44 )
  volOff.src = 'soundOff.png'

  const p = new Promise( success => success( {
    vlines: mapn( n+1, i => gen(vline(l)) ),
    hlines: mapn( n+1, i => genh(hline(l)) ),
    blueBox: genbox( shaded(s)(blue), s ),
    greenBox: genbox( shaded(s)(green), s ),
    redBox: genbox( shaded(s)(red), s ),
    grayBox: genbox( shaded(s)( gray, 0, 100 ), s ),
    blackBox: genbox( nfill(black), 1.015*s ),
    player: playerImg(Rd),
    volOn,
    volOff
  } ) )

  return await p
}

const generateIntroArt = async () => {
  const p = new Promise( success => success(
    genbox( shaded(l - 100)(black), l - 100 ) )
  )
  return await p
}
