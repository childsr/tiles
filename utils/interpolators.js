'use strict'

const interp = f => (a,b,x) => a + (b - a)*f(x,a,b)
const terpOver = terp => ( x0, x1 ) => x => terp( x0, x1, ( x - x0 ) / ( x1 - x0 ) )

const lin = x => x
const smth = x => 6*x**5 - 15*x**4 + 10*x**3
const csn = x => -0.5*cos(pi*x) + 0.5
const qd = (x,a,b) => ( a > b ) ? -1 * ( x - 1 )**2 + 1 : x**2
const sq = (x,a,b) => ( a > b ) ? -1 * sqrt(-(x-1)) + 1 : sqrt(x)
const cirOut = x => sqrt( 1 - ( x - 1 )**2 )
const cirIn = x => -sqrt( 1 - x**2 ) + 1
const g = x => 2*x**3 - 3*x**2 + 1
const oscil = x => 0.25*g( 2.492*x - 0.746 ) + 3/8
const logCurve = t => (1/Math.log(2)) * Math.log(t+1)
const expCurve = t => (Math.exp(t) - 1) / (Math.E - 1)
const full = x => 0.5 * cost( x - 0.5 ) + 0.5

const f0 = x => sqrt( 0.25 - 4*( x - 0.25 )**2 )
const rsmstp = x => {
  if ( x < 0 ) return 0
  if ( x <= 0.25 ) return f0(x)
  if ( x <= 0.75 ) return 0.5
  if ( x <= 1 ) return -f0( x - 0.5 ) + 1
  return 1
}

const terps = {
  invert:       terp => (x,a,b) => terp(x,b,a),
  reverse:      terp => (x,a,b) => terp(-( x - 1),b,a),
  terpWith:     interp,
  terpOver,

  linear:       interp(lin),
  smoothStep:   interp(smth),
  cosine:       interp(csn),
  quadratic:    interp(qd),
  sqr:          interp(sq),
  circOut:      interp( (x,a,b) => ( a > b ) ? cirIn(x) : cirOut(x) ),
  circIn:       interp( (x,a,b) => ( a > b ) ? cirOut(x) : cirIn(x) ),
  oscillate:    interp(oscil),
  log:          interp( (x,a,b) => ( a > b ) ? expCurve(x) : 1 - logCurve(x) ),
  expon:        interp( (x,a,b) => ( a > b ) ? 1 - logCurve(x) : expCurve(x) ),
  ida:          interp( (x,a,b) =>  a ),
  idb:          interp( (x,a,b) =>  b ),
  full:         interp( full ),
  ifull:        interp( x => -full(x) + 1 ),
  rss:          interp(rsmstp)
}

makeObjGlobal(terps)
