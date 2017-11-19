'use strict'

const curry = R.curry
const rcurry = f => curry( rargs( f ) )

//Array Operations
const append = curry( ( x, arr ) => concat( arr, [x] ) )
const at = curry( ( arr, i ) => arr[i] )
const addl = curry( ( arr0, arr1 ) => map2( add, arr0, arr1 ) )
const addv = addl
const binMask = curry( ( mask, arr ) => filterByI( at(mask), arr ) )
const cloneL = arr => {
  let arr1 = []
  for ( let i = 0; i < arr.length; i++ ) arr1.push( arr[i] )
  return arr1
}
const comb = curry( ( list0, list1 ) => map2( add, list0, list1 ) )
const concat = curry( ( l0, l1 ) => l0.concat(l1) )
const countby = f => l => {
  let n = 0
  for ( let i = 0; i < length(l); i++ ){
    if ( f( l[i] ) ) n++
  }
  return n
}
const duplicate = ( arr, n = 2 ) => {
  let arr0 = []
  for( let i = 0; i < n; i++ ) {
    arr0 = concat( arr, arr0 )
  }
  return arr0
}
const filter = curry( ( f, arr ) => {
  let arr1 = []
  for ( let i = 0; i < length( arr ); i++ ){
    if ( f( arr[i] ) ) arr1.push( arr[i] )
  }
  return arr1
} )
const filter2 = curry( ( f, arr0, arr1 ) => {
  return arr0.filter( (x,i) => f( x, arr1[i] ) )
} )
const filtern = curry( ( n, f, g = id ) => {
  let arr = []
  for( let i = 0; i < n; i++ ) {
    if ( f(i) ) arr.push( g(i) )
  }
  return arr
} )
const filterRng = curry( ( n0, n1, f, g = id ) =>
  filtern( n1 - n0, tfmArg(f)( add(n0) ), tfmArg(g)( add(n0) ) ) )
const filterByI = curry( ( f, arr ) => {
  let arr0 = []
  const n = length(arr)
  for( let i = 0; i < n; i++ ) {
    if ( f(i) ) arr0.push( arr[i] )
  }
  return arr0
} )
const fold = ( f, iVal ) => arr => {
  const useival = !isNot( iVal )
  let acc = useival ? iVal : arr[0]
  for ( let i = useival ? 0 : 1; i < length( arr ); i++ ){
    acc = f( acc, arr[i] )
  }
  return acc
}
const foldR = ( f, iVal ) => arr => {
  const useival = !isNot( iVal )
  let acc = useival ? iVal : last( arr )
  for ( let i = lasti(arr) - ( useival ? 0 : 1 ); i >= 0; i-- ){
    acc = f( acc, arr[i] )
  }
  return acc
}
const foldTo = curry( ( n, f, iVal ) => {
  let acc = iVal
  for( let i = 0; i < n; i++ ) acc = f( acc, i )
  return acc
} )
const forEach = curry( ( f, arr ) => {
  for ( let i = 0; i < length( arr ); i++ ){
    f( arr[i] )
  }
} )
const forEach2 = curry( ( f, arr0, arr1 ) => {
  for ( let i = 0; i < length( arr0 ); i++ ){
    f( arr0[i], arr1[i] )
  }
} )
const forEachN = curry( ( f, ...arrs ) => {
  for ( let i = 0; i < length( fst( arrs ) ); i++ ){
    f( ...pluck( i, arrs ) )
  }
} )
const forEachR = curry( ( f, arr ) => {
  for ( let i = length( arr ) - 1; i >= 0; i-- ){
    f( arr[i] )
  }
} )
const fst = arr => arr[0]
const genList = curry( ( n, f ) => {
  let arr = Array(n)
  for( let i = 0; i < n; i++ ) arr[i] = f(i)
  return arr
} )
const genList2 = ( w, h, f ) => {
  //Generate a 2D array of the given size
  // let arr = Array(w).fill( Array(h) )
  let arr = []
  for (let i = 0; i < w; i++) {
    arr.push([])
    for (let j = 0; j < h; j++) {
      // arr[i][j] = f( i, j )
      arr[i].push( f( i, j ) )
    }
  }
  return arr
}
const has = curry( ( x, arr ) => arr.includes(x) )
const head = arr => slice( 0, lasti(arr), arr )
const isarr = Array.isArray
const flatten = arr =>
  arr.reduce(
    (acc, val) => acc.concat( Array.isArray(val) ? flatten(val) : val ),
    []
  )
const lasti = arr => arr.length - 1
const last = arr => arr[ length( arr ) - 1 ]
const leftpad = arr => n => x => concat( list( n - length(arr), x ), arr )
const length = arr => arr.length
const list = curry( ( n, val ) => {
  return Array(n).fill(val)
} )
const listify = ( ...args ) => args
const map = curry( ( f, list ) => genList( list.length, i => f(list[i]) ) )
const map2 = curry( ( f, arr0, arr1 ) => {
  //f is a function that takes two arguments. Return a new array where each
  //element is the result of f(arr0[i],arr1[i]).
  //Returned array with have length equal to the min length of of the two given
  //arrays.
  return genList(
    min( arr0.length, arr1.length ), i => f( arr0[i], arr1[i] )
  )
} )
const mapi = curry( ( f, list ) => list.map( ( x, i ) => f( x, i ) ) )
const mapn = genList
const mapN = curry( ( f, ...arrs ) => {
  //f is a function that takes N arguments. Return a new array where each
  //element is the result of f( arrs[0][i], arrs[1][i], ... arrs[N][i] )
  return genList( arrs[0].length, i => f( ...pluck( i, arrs ) ) )
} )
const mergeL = curry( ( l0, l1 ) => {
  // ( [ num ], [ num ] ) => [ num ]
  const go = ( arr, l0, l1 ) => {
    if ( !length( l0 ) ) return concat( arr, l1 )
    if ( !length( l1 ) ) return concat( arr, l0 )
    if ( last( l0 ) <= l1[0] ) return concat( arr, concat( l0, l1 ) )
    if ( last( l1 ) <= l0[0] ) return concat( arr, concat( l1, l0 ) )
    const minList = l0[ 0 ] < l1[ 0 ] ? l0 : l1
    const maxList = l0[ 0 ] >= l1[ 0 ] ? l0 : l1
    return go( append( minList[0], arr ), remove( 0, 1, minList ), maxList )
  }
  return go( [], l0, l1 )
} )
const nlist = n => {
  let arr = []
  for ( let i = 0; i < n; i++ ){
    arr.push(i)
  }
  return arr
}
const nmap = n => comp( ...list( n, map ) )
const partSum = curry( ( arr, i0, i1 ) => {
  let total = 0
  for ( let i = max( i0, 0 ); i < min( i1, length(arr) ); i++ ) total += arr[i]
  return total
} )
const partSums = arr => mapn( length(arr), memoize( partSum(arr)(0) ) )
const prepend = curry( ( x, arr ) => concat( [x])( arr ) )
const range = curry( ( i0, i1 ) => {
  let arr = Array( i1 - i0 )
  for ( let i = i0; i < i1; i++ ){
    arr[i] = i
  }
  return arr
} )
const remove = curry( ( i, arr ) => {
  let arr0 = []
  for ( let j = 0; j < length( arr ); j++ ){
    if ( j !== i ) arr0.push(arr[j])
  }
  return arr0
} )
const reverse = arr => {
  let arr1 = []
  for( let i = length( arr ) - 1; i >= 0; i-- ) arr1.push( arr[i] )
  return arr1
}
const rmdup = arr => {
  //remove duplicate elements
  let l0 = []
  arr.forEach( x => {
  	if ( !l0.includes(x) ) l0.push(x)
  } )
  return l0
}
const scramble = arr => {
  const n = length(arr)
  let arr0 = nlist(n)
  let arr1 = []
  for ( let i = 0; i < n; i++ ) {
    const rm = randInt(0,length(arr0)-1)
    arr1.push( arr[ fst( arr0.splice(rm,1) ) ] )
  }
  return arr1
}
const setElement = ( arr, i, value ) =>
  arr.slice( 0, i ).concat( [ value ].concat( arr.slice( i + 1 ) ) )
const slice = curry( ( i0, i1, arr ) => arr.slice( i0, i1 ) )
const sort = ( arr ) => {
  const arr0 = cloneL(arr).sort( ( a, b ) => a < b ? -1 : ( a > b ? 1 : 0 ) )
  return arr0
}
const sortBy = prop => arr => sortWith( arr, ( x0, x1 ) =>
  x0[prop] < x1[prop] ? -1 : ( x0[prop] === x1[prop] ? 0 : 1 ) )
const sortWith = ( arr, compare ) => {
  const arr0 = cloneL(arr).sort( compare )
  return arr0
}
const sum = arr => fold( add )( arr )
const tail = slice( 1, Infinity )
const transpose = arr => {
  return genList2( length( fst( arr ) ), length( arr ), ( x, y ) => arr[y][x] )
}
const zip = curry( ( arr0, arr1 ) => map2( listify, arr0, arr1 ) )
const zipn = ( ...arrs ) => mapN( listify, ...arrs )

//Object Operations
const merge = curry( ( obj0, obj1 ) => {
  let obj = {}
  for ( let prp in obj0 ) {
    if ( hasProp( prp, obj1 ) ) obj[prp] = obj1[prp]
    else obj[prp] = obj0[prp]
  }
  forEach( prp => obj[prp] = obj1[prp],
    filter( x => !hasProp( x, obj0 ), Object.getOwnPropertyNames( obj1 ) ) )
  return obj
} )
const mergeWith = f => curry( ( obj0, obj1 ) => {
  let obj = {}
  for ( let prp in obj0 ) {
    if ( hasProp( prp, obj1 ) ) obj[prp] = f( obj0[prp], obj1[prp] )
    else obj[prp] = obj0[prp]
  }
  forEach( prp => obj[prp] = obj1[prp],
    filter( x => !hasProp( x, obj0 ), Object.getOwnPropertyNames( obj1 ) ) )
  return obj
} )
const hasProp = curry( ( prp, obj ) => obj.hasOwnProperty(prp) )
const prop = curry( ( prp, obj ) => {
  return obj[prp]
} )
const rprop = curry( ( obj, prp ) => obj[prp] )
const pluck = curry( ( prp, objs ) => map( obj => prop( prp, obj ), objs ) )
const mapObj = curry( ( f, obj ) => {
  let obj1 = {}
  for ( let prp in obj ) {
    obj1[prp] = f( obj[prp] )
  }
  return obj1
} )
const setProp = curry( ( prp, obj, val ) => {
  let obj1 = clone(obj)
  obj1[prp] = val
  return obj1
} )
const forEachObj = curry( ( f, obj ) => {
  for ( let key in obj ) {
    f( obj[key], key, obj )
  }
} )
const pick = props => obj => {
  let obj1 = {}
  forEach( p => obj1[p] = obj[p], props )
  return obj1
}
const clone = obj => mapObj( id, obj )

//Function Operations
const comp = ( ...fns ) => fold( ( F, f ) => comp2( F, f ) )( fns )
const comp2 = curry( ( f0, f1 ) => ( ...args ) => f0( f1( ...args ) ) )
const pipe = ( ...fns ) => foldR( ( F, f ) => comp2( F, f ) )( fns )
const pipe2 = curry( ( f0, f1 ) => ( ...args ) => f1( f0( ...args ) ) )
const tfmArg =  curry( ( f, tfm, x ) => f( tfm(x) ) )
const maxf = curry( ( dom, dx, f ) => {
  let fmax  = f( dom[0] )
  for ( let x = dom[0] + dx; x <= dom[1]; x += dx ) {
    const val = f(x)
    if ( val > fmax ) fmax = val
  }
  return fmax
} )
const minf = curry( ( dom, dx, f ) => {
  let fmin  = f( dom[0] )
  for ( let x = dom[0] + dx; x <= dom[1]; x += dx ) {
    const val = f(x)
    if ( val < fmin ) fmin = val
  }
  return fmin
} )
const call = f => ( ...args ) => f( ...args )
const apply = ( ...args ) => f => f(...args)
const part = ( f, ...args0 ) => ( ...args1 ) => f( ...args0, ...args1 )
const expRange = ( scale, shift ) => f => comp( add(shift), multiply(scale), f )
const exp2 = expRange( 2, -1 )
const exp1 = expRange( 0.5, 0.5 )
const rargs = f => ( ...args ) => f( ...args.reverse() )
const iterate = f => n => ival => {
	let x = f(ival)
	repeat( n - 1, () => x = f(x) )
	return x
}

//Math
const {
  abs,
  acos,
  asin,
  atan,
  ceil,
  cos,
  floor,
  log,
  log10,
  log2,
  PI: pi,
  sign,
  sin,
  sqrt,
  trunc
} = Math
const sec = x => 1 / Math.cos(x)
const tau = 2 * Math.PI
const max = curry( Math.max )
const min = curry( Math.min )
const pow = curry( Math.pow )
const rpow = curry( ( e, b ) => b ** e )
const square = x => x * x
const logb = curry( ( base, x ) => Math.log(x) / Math.log(base) )
const ln = log
const round = ( x, precision = 0 ) => {
  const tenp = pow( 10, precision )
  return divide( Math.round(  multiply( x, tenp ) ), tenp )
}
const add = curry( ( a, b ) => a + b )
const subtract = curry( ( a, b ) => a - b )
const rsubtract = curry( ( b, a ) => a - b )
const negate = x => -x
const multiply = curry( ( a, b ) => a * b )
const divide = curry( ( a, b ) => a / b )
const divBy = curry( ( b, a ) => a / b )
const reciprocal = x => 1 / x
const inv = reciprocal
const fpart = x => x - Math.trunc(x)
const ipart = x => Math.trunc(x)
const isInt = x => fpart(x) === 0
const mod = curry( ( a, b ) => a === 0 ? ( b === 0 ? undefined : 0 ) :
  a + b * ( 1 - trunc( a / b ) ) - ( sign(a) > 0 ? b : 0 ) )
const angleTo = ( x, y ) => {
  if ( !x && !y ) return 0
  if ( !isNot(x[0]) ) return angleTo(x[0], x[1])
  const theta = acos( x / sqrt( x*x + y*y ) )
  return y > 0 ? theta : tau - theta
}
const equals = curry( ( a, b ) => a === b )
const lessThan = b => a => a < b
const greaterThan = b => a => a > b
const leq = b => a => a >= b
const geq = b => a => a <= b
const mag = vec => comp( sqrt, sum, map(square) )(vec)
const mag2 = vec => comp( sum, map(square) )(vec)
const magn2 = ( x, y ) => x**2 + y**2
const dist = ( pt0, pt1 ) => mag( map2( sub, pt1, pt0 ) )
const sumn = ( ...nums ) => sum(nums)
const magn = curry( ( x, y ) => sqrt( x*x + y*y ) )
const distn = curry( ( x0, y0, x1, y1 ) => magn( x0 - x1, y0 - y1 ) )
const intercept = ( m0, x0, y0 ) => ( m1, x1, y1 ) => {
  // ( real, dis, dis ) => ( real, dis, dis ) => [ dis, dis ]
  //Return the intercept point of the lines: y=m0(x-x0)+y0 and y=m1(x-x1)+y1
  if (m0 === m1) return undefined
  const x = ( m0 === Infinity ? x0 : ( m1 === Infinity ? x1 :
    ( m0*x0 - m1*x1 - y0 + y1 ) / ( m0 - m1 ) ) )
  const [m2,x2,y2] = m0 !== Infinity ? [m0,x0,y0] : [m1,x1,y1]
  return [x,m2*(x-x2)+y2]
}
const distToEdge = ( x, y ) => edge => {
  // ( dis, dis ) -> [ [ dis, dis ], [ dis, dis ] ] -> dis
  const m0 = slope( ...edge[0], ...edge[1] )
  const m1 = -inv(m0)
  const int = intercept( m0, ...edge[0] )( m1, x, y )
  return ptInEdge(edge)(...int) ?
    magn( x - int[0], y - int[1] ) :
    min( magn2( x - edge[0][0], y - edge[0][1] ),
      magn2( x - edge[1][0], y - edge[1][1] )
    ) ** 0.5
}
const ptInEdge = edge => ( x, y ) => {
  // [ [ dis, dis ], [ dis, dis ] ] -> ( dis, dis ) -> bool
  const tedge = transpose(edge)
  return ( x <= maxL( tedge[0] ) && x >= minL( tedge[0] ) ) &&
    ( y <= maxL( tedge[1] ) && y >= minL( tedge[1] ) ) &&
    ( abs( slope( ...flatten(edge) ) -
      slope( x, y, ...edge[0] ) ) < 0.0001 )
}
const slope = ( x0, y0, x1, y1 ) => ( y0 - y1 ) / ( x0 - x1 )
const midpt = ( pt0, pt1 ) => map( multiply(0.5), map2( add, pt0, pt1 ) )
const inPFunc = curry( ( pf, x, y ) => pf( angleTo( x, y ) ) >= magn( x, y ) )
const bin = dec => {
  const go = ( num, arr ) => {
    if ( num === 0 ) return prepend( 0, arr )
    if ( num === 1 ) return prepend( 1, arr )
    return go( floor(num/2), prepend( num % 2, arr ) )
  }
  return go( dec, [] )
}
const flip = ogn => x => 2*ogn - x
const offset = f => ( dx, dy ) => ( x, y ) => f( x - dx, y - dy )
const nang = theta => {
  // normal angle
  if (theta === 0) return 0
  return theta > 0 ? theta % tau : theta % tau + tau
}
const tobase = base => dec => {
  const go = n => {
    if ( n <= base ) return [n]
    return ppd( mod( n, base ), go( floor(n/base) ) )
  }
  return go(dec)
}
const sigma = ( f, k0, k1 ) => sum( mapn( k1 - k0 ), i => f( k0 + i ) )
const mathGlobals = {
  add,
  angleTo,
  angto: angleTo,
  abs,
  ceil,
  cos,
  cost: x => cos( tau * x ),
  div: divide,
  floor,
  flr: floor,
  inv,
  log,
  log10,
  log2,
  mult: multiply,
  pi,
  rdiv: divBy,
  rsub: rsubtract,
  sign,
  sin,
  sint: x => sin( tau * x ),
  sqrt,
  sub: subtract,
  tau,
  trunc
}

//Logic Gates
const AND = curry( ( a, b ) => a && b )
const OR = curry( ( a, b ) => a || b )
const XOR = curry( ( a, b ) => ( a && !b ) || ( !a && b ) )
const NOT = a => !a
const NAND = comp2( NOT, AND )
const NOR = comp2( NOT, OR )
const XNOR = comp2( NOT, XOR )
const THRU = a => a ? 1 : 0

//Utility Functions
const minL = arr => fold(min)(arr)
const maxL = arr => fold(max)(arr)
const minBy = f => ( a, b ) => f(a) <= f(b) ? a : b
const maxBy = f => ( a, b ) => f(a) > f(b) ? a : b
const minByProp = curry( ( p, a, b ) =>  minBy( prop(p), a, b ) )
const maxByProp = curry( ( p, a, b ) =>  maxBy( prop(p), a, b ) )
const isNot = x => x !== 0 && !x
const isDef = x => x !== undefined
const ifdef = (val,alt) => isDef(val) ? val : alt
const exists = comp( NOT, isNot )
const btw = ( a, b ) => x => x <= b && x >= a
const abtw = ( theta0, theta1 ) => {
  const op = ( theta0 > theta1 ) ? OR : AND
  return theta => {
    const theta2 = nang(theta)
    return op( theta2 >= theta0, theta2 <= theta1 )
  }
}
const repeat = curry( ( n, f, acc = null ) => {
  for( let i = 0; i < n; i++ ) {
    acc = f( i, acc )
  }
} )
const makeObjGlobal = ( obj, name ) => {
  if (name) setGlobal( name, obj )
  for ( let key in obj ){
    const val = obj[key]
    setGlobal( key, val )
  }
}
const overwriteProps = obj0 => obj1 => {
  for ( let prop in obj1 ) obj0[prop] = obj1[prop]
  return obj0
}
const setGlobal = ( name, val ) => {
  if ( typeof global !== 'undefined' )  global[ name ] = val
  else window[ name ] = val
}

//Destructive and In-Place Functions
const drmv = curry( ( arr, i ) => arr.splice(i,1)[0] )
const ifilter = arr => {
  for ( let i = 0; i < length( arr ); i++ ){
    if ( !f( arr[i] ) ) drmv( arr, i )
  }
  return arr
}
const imap = curry( ( f, arr ) => {
  for( let i = 0; i < length( arr ); i++ ) arr[i] = f(arr[i])
  return arr
} )
const imerge = obj0 => obj1 => {
  for ( let prop in obj1 ) {
    obj0[prop] = obj1[prop]
  }
  return obj0
}
const swap = curry( ( arr, i0, i1 ) => {
  [ arr[i1], arr[i0] ] = [ arr[i0], arr[i1] ]
  return arr
} )
const irvs = arr => {
  let i0 = 0, i1 = lasti( arr )
  while ( i1 >= i0 ) {
    [ arr[i1], arr[i0] ] = [ arr[i0], arr[i1] ]
    i0++
    i1--
  }
  return arr
}

//PRNG
const rand = Math.random
const rand2 = exp2(rand)
const rdint = ( lo, hi ) =>
  comp( add(lo), floor, mult(rand()), sub( add(1)(hi) ) )( lo )
const rdreal = ( lo, hi ) =>
  comp( add(lo), mult(rand()), sub(hi) )( lo )
const rdnat = hi => rdint( 0, hi )

//Miscellaneous
const id = x => x
const conf = x => () => x
const zerof = conf(0)
const clamp = curry( ( lo, hi, x ) => x < lo ? lo : ( x > hi ? hi : x ) )
const clampLo = curry( ( lo, x ) => x < lo ? lo : x )
const clampHi = curry( ( hi, x ) => x > hi ? hi : x )
const rgba = clr =>
  'rgba(' + clr[0] + ',' + clr[1] + ',' + clr[2] + ',' + clr[3] + ')'
const rgb = clr =>
  'rgb(' + clr[0] + ',' + clr[1] + ',' + clr[2] + ')'
const randInt = ( a, b ) => a <= b ? Math.round( a + (b-a)*Math.random() ) :
  Math.round( b + (a-b)*Math.random() )
const now = () => performance.now()
const setTimer = () => {
  const t0 = now()
  return () => ( now() - t0 ) / 1000
}
const animate = ( f, stopCondition = t => false ) => {
  // ( f: t => action, stopCondition?: t => bool ) => () => () //stop loop
  let start
  let stop = false
  const step = timestamp => {
    if (!start) start = timestamp
    const t = timestamp - start
    f(t)
    if ( stopCondition(t) || stop ) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
  return () => stop = true
}

const findTrue = bools => {
  // [ bool ] -> bool
  for( let b of bools ) {
    if (b) return true
  }
  return false
}

const functions = {
  abtw,
  btw,
  curry,
  distn,
  div: divide,
  divBy,
  divide,
  equals,
  exp1,
  exp2,
  expRange,
  findTrue,
  fpart,
  geq,
  greaterThan,
  has,
  hasProp,
  id,
  inv,
  ipart,
  isDef,
  isInt,
  isNot,
  iterate,
  leq,
  lessThan,
  ln,
  log,
  log10,
  log2,
  logb,
  magn,
  makeObjGlobal,
  mapObj,
  max,
  maxBy,
  maxByProp,
  maxf,
  merge,
  min,
  minBy,
  minByProp,
  minf,
  mod,
  mrg: merge,
  mult: multiply,
  multiply,
  negate,
  ngt: negate,
  nlist,
  nlst: nlist,
  now,
  overwriteProps,
  part,
  pipe,
  pipe2,
  plck: pluck,
  pluck,
  pow,
  prop,
  rand,
  rand2,
  rargs,
  rcurry,
  rdiv: divBy,
  rdint,
  rdnat,
  rdreal,
  reciprocal,
  repeat,
  rgb,
  rgba,
  rprop,
  rnd: round,
  round,
  rpow,
  rsub: rsubtract,
  rsubtract,
  set: setElement,
  setElement,
  setTimer,
  sign,
  sin,
  sqrt,
  sub: subtract,
  subtract,
  sumn,
  tau,
  tfmArg,
  trunc,
  zerof,
  zf: zerof
}
const functionOperations = {
  apply,
  C: comp,
  call,
  comp,
  comp2,
}
const listOperations = {
  addl,
  apd: append,
  append,
  at,
  binMask,
  comb,
  cat: concat,
  cloneL,
  concat,
  countby,
  dup: duplicate,
  duplicate,
  filter,
  filter2,
  filterByI,
  filtern,
  filterRng,
  flatten,
  flt: filter,
  flt2: filter2,
  fltn: filtern,
  fltrng: filterRng,
  fold,
  foldR,
  foldTo,
  forEach,
  forEach2,
  forEachN,
  forEachObj,
  forEachR,
  fst,
  genList,
  genList2,
  head,
  isarr,
  last,
  lasti,
  leftpad,
  len: length,
  length,
  list,
  listify,
  lng: length,
  lst: last,
  lsti: lasti,
  map,
  map2,
  mapi,
  mapn,
  mapN,
  maxL,
  mergeL,
  minL,
  mrgl: mergeL,
  nmap,
  partSum,
  partSums,
  ppd: prepend,
  prepend,
  range,
  remove,
  reverse,
  rmdup,
  rmv: remove,
  rng: range,
  rvs: reverse,
  scramble,
  slice,
  sort,
  sortBy,
  sortWith,
  sum,
  tail,
  tnps: transpose,
  transpose,
  zip,
  zipn
}
const logicGates = {
  AND,
  NAND,
  NOR,
  NOT,
  OR,
  THRU,
  XNOR,
  XOR
}
const mathFunctions = {
  abs,
  add,
  angleTo,
  bin,
  ceil,
  cos,
  dist,
  distToEdge,
  flip,
  floor,
  flr: floor,
  inPFunc,
  intercept,
  mag,
  mag2,
  magn2,
  midpt,
  nang,
  offset,
  ptInEdge,
  sec,
  sigma,
  slope,
  tobase
}
const miscFunctions = {
  animate,
  clamp,
  clampHi,
  clampLo,
  conf,
  constf: conf,
}
const mutabilityFunctions = {
  drmv,
  ifilter,
  imap,
  imerge,
  irvs,
  swap
}
const objectOperations = {
  clone,
  mergeWith,
  pick,
  setProp,
}
const utilityFunctions = {
  exists,
  ifdef,
}

makeObjGlobal( fold( merge )( [
  functions,
  functionOperations,
  listOperations,
  logicGates,
  mathFunctions,
  miscFunctions,
  mutabilityFunctions,
  objectOperations,
  utilityFunctions
] ) )
