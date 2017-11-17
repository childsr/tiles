const F = 0.025
const k = 1
const lw = 2
const buf = 1
const l = 640

const th = lw + 2*buf

const color = black

const generateLines = async (n) => {
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

  let vlines, hlines

  const p = new Promise( success => success( {
    vlines: mapn( n+1, i => gen(vline(l)) ),
    hlines: mapn( n+1, i => genh(hline(l)) )
  } ) )

  return await p
}
