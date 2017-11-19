/**/const playerImg = R => {
  const F = 1.5
  const k0 = 1
  const lw = 2
  const buf = 2

  const k = k0 / R
  const th = lw + 2*buf
  const color = lightBlue
  const off = lw/2 + buf + k0
  const R2 = R + off
  const size = 2 * R2

  const pcirc = ( rd, opts = {} ) => {
    const { seed, k, u, a, b } = merge(
      { seed: rand(), k: 0.05, u: 1, a: 1, b: 1.25 }, opts
    )
    const P = b**2/a
    const dr = rd*k
    const p = perlin(seed)
    p.perlin_octaves = 1
    const pln0 = exp2( ( x, y ) => p.noise( F*x - 1000, F*y - 1000 ) )
    const pln = theta => {
      return rd + dr*pln0( u*cos(theta), u*sin(theta) )
    }

    makeObjGlobal({ dr, pln0, pln })

    return C( pln, angleTo )
  }

  const rp = pcirc(R)
  const shape = ( x, y ) => {
    const xp = x - R2
    const yp = y - R2
    return magn( xp, yp ) < rp( xp, yp )
  }
  const shdr0 = only(shape)( ( x, y, clr ) => {
    return seta( clr, clamp( 0, 255 )( clr[3] + 50 ) )
  } )
  const pced = ( x, y ) => {
    const xp = x - R2
    const yp = y - R2
    return abs( magn( xp, yp ) - rp( xp, yp ) )
  }
  const a = ( x, y ) => {
    const d = ( pced( x, y ) - lw/2 ) / buf
    if ( d < 0 ) return 255
    if ( d > 1 ) return 0
    return linear( 255, 0, d )
  }
  const shdr1 = ( x, y, clr ) => seta( color, a( x, y ) )

  const shdr = ( x, y, clr ) => {
    const clr0 = shdr1( x, y, clr )
    return shdr0( x, y, clr0 )
  }

  return generateImg( size, size )(shdr)
}
