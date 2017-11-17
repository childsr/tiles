'use strict'



const V = ( () => {
  const add = addl
  const addm = ( ...args ) => fold( add )( args )
  const angv = ( theta, r = 1 ) => map( multiply(r), [ cos(theta), sin(theta) ] ) // vector from angle
  const avg = ( ...vecs ) => map( average, transpose( vecs ) )
  const cmp = v => dir =>
    // ( vec, vec ) -> vec
    scaleTo( dot( v, unit( dir ) ) )(dir)
  const dist = curry( ( v0, v1 ) => mag( sub( v0, v1 ) ) )
  const div = map2(divide)
  const dot = C( sum, map2( multiply ) )
  const mag = v => sqrt( v[0]**2 + v[1]**2)
  const mag2 = v => dot( v, v )
  const mult = map2(multiply)
  const negate = map( multiply(-1) )
  const pvec = ( r, theta ) => [ r*cos(theta), r*sin(theta) ]
  const rot = theta => {
    // ang -> vec -> vec
  	const c = cos(theta)
  	const s = sin(theta)
  	return v =>
  		[ v[0] * c - v[1] * s, v[0] * s + v[1] * c ]
  }
  const rotab = pt0 => theta => {
    // pt -> ang -> vec -> vec
    // rotate about pt
    const r = rot(theta)
    return v => addl(pt0)( r( sub( v, pt0 ) ) )
  }
  const rsub = curry( ( v1, v0 ) => add( v0, negate(v1) ) ) //subtract in reverse order
  const scale = curry( ( v, scalar ) => map( multiply(scalar), v ) )
  const scaleBy = curry( ( scalar, v ) => scale( v, scalar ) )
  const scaleTo = curry( ( scalar, v ) => C( scaleBy( scalar ), unit )( v ) )
  const sub =  curry( ( v0, v1 ) => add( v0, negate(v1) ) )
  const unit = v => scale( v, 1 / mag(v) )
  const zv = n => array( n, 0 )

  return {
    add,
    addm,
    angv,
    avg,
    cmp,
    dist,
    div,
    dot,
    mag,
    mag2,
    mult,
    negate,
    pvec,
    rot,
    rotab,
    rsub,
    scale,
    scaleBy,
    scaleTo,
    sub,
    unit,
    zv
  }
} )()
