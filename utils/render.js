'use strict'

const clamp8 = clamp( 0, 255 )

const perlin = seed => new Perlin( ifdef( seed, rand() ) )
const noise_ = n => seed => {
  const p = perlin( ifdef( seed, rand() ) )
  if ( n === 1 ) return x => p.noise( x - 1000 )
  if ( n === 2 ) return ( x, y ) => p.noise( x - 1000, y - 1000 )
  if ( n === 3 ) return ( x, y, z ) => p.noise( x - 1000, y - 1000, z - 1000 )
}
const noise1 = noise_(1)
const noise2 = noise_(2)
const noise3 = noise_(3)

//virtual ImageData
const vImgData = imageData => {
  const w = imageData.width
  const h = imageData.height
  const length = w*h
  const rawLength = length*4
  const data = imageData.data
  const set = ( x, y ) => clr => {
    const i = index( y, x )
    data[i] = clamp8( clr[0] )
    data[i+1] = clamp8( clr[1] )
    data[i+2] = clamp8( clr[2] )
    data[i+3] = clamp8( clr[3] )
  }
  const grid = ( c, r ) => {
    const _c = ( c < 0 ) ? 0 : ( c >= w ? w - 1 : c )
    const _r = ( r < 0 ) ? 0 : ( r >= h ? h - 1 : r )
    const i = ( ( _r * imageData.width ) + _c ) * 4
    return [ data[i], data[i+1], data[i+2], data[i+3] ]
  }
  const index = ( r, c ) => 4 * ( ( r * imageData.width ) + c ) // + 1 )
  const row = i => floor( floor(i/4) / w )
  const col = i => floor(i/4) % w
  const map = shader => {
    let id = imgData( w, h )
    let data = id.data
    for( let i = 0; i < rawLength; i += 4) {
      let color = [ data[i], data[i+1], data[i+2], data[i+3] ]
      let info = shader( col(i), row(i), color, grid )
      data[i] = clamp8( info[0] )
      data[i+1] = clamp8( info[1] )
      data[i+2] = clamp8( info[2] )
      data[i+3] = clamp8( info[3] )
    }
    return id
  }
  const ipmap = ( x0=0, y0=0, x1=w, y1=h ) => shader => {
    for( let x = x0; x <= x1; x++ ) {
      for( let y = y0; y <= y1; y++ ) {
        const i = index( y, x )
        let color = [ data[i], data[i+1], data[i+2], data[i+3] ]
        let info = shader( col(i), row(i), color, grid )
        data[i] = clamp8( info[0] )
        data[i+1] = clamp8( info[1] )
        data[i+2] = clamp8( info[2] )
        data[i+3] = clamp8( info[3] )
      }
    }
  }
  return {
    data,
    grid,
    map,
    ipmap,
    row,
    col,
    index,
    set,

    w,
    h,
    length,
    rawLength
  }
}

const newCtx = ( w, h ) => {
  // ( num, num ) => context
  const cnv = document.createElement('canvas')
  const ctx = cnv.getContext('2d')
  cnv.width = w || window.innerWidth
  cnv.height = h || window.innerHeight
  return ctx
}
const imgData = ( width, height ) =>
  // ( num, num ) => ImageData
  new ImageData( width, height )

//generators
const generateCtx = ( width, height ) =>
  //( num, num ) => shader => context
  compose( imgDataToCtx, generateImgData( width, height ) )
const generateImgData = ( width, height ) => shader => {
  // ( num, num ) => shader => ImageData
  return vImgData( imgData( width, height ) ).map( shader )
}
const generateImg = ( width, height ) =>
  //( num, num ) => shader => Image
  pipe( generateImgData( width, height ), imgDataToImg )

//filterers
const filterCtx = curry( ( ctx, _filter ) => {
  // ( context, filter ) => context
  return generateCtx( ctx.canvas.width, ctx.canvas.height )
    ( _filter( ctxShader( ctx ) ) )
} )
const filterImgData = curry( ( imagedata, _filter ) => {
  // ( ImageData, shader ) => ImageData
  return generateImgData( imagedata.width, imagedata.height )
    ( _filter( imgDataShader( imagedata ) ) )
} )
const filterImg = curry( ( img, _filter ) => {
  // Image => Image
  return generateImg( img.width, img.height )
    ( _filter( imgShader( img ) ) )
} )

//bitmap conversions
const ctxToImgData = ctx =>
  // context => ImageData
  ctx.getImageData( 0, 0, ctx.canvas.width, ctx.canvas.height )
const imgDataToCtx = imagedata => {
  // ImageData => context
  const ctx = newCtx( imagedata.width, imagedata.height )
  ctx.putImageData( imagedata, 0, 0 )
  return ctx
}
const imgToCtx = img => {
  const ctx = newCtx( img.width, img.height )
  ctx.drawImage( img, 0, 0 )
  return ctx
}
const imgToImgData = pipe( imgToCtx, ctxToImgData )
const imgDataToImg = imagedata => {
  // ImageData => Image
  const ctx = imgDataToCtx( imagedata )
  const image = new Image()
  image.src = ctx.canvas.toDataURL('image/png')
  return image
}
const ctxToImg = pipe( ctxToImgData, imgDataToImg )

//shaders from bitmaps
const imgDataShader = imgdata => {
  const vid = vImgData( imgdata )
  return ( x, y, clr ) => vid.grid( x, y )
}
const ctxShader = pipe( ctxToImgData, imgDataShader )
const imgShader = pipe( imgToImgData, imgDataShader )

const drawClip = ctx => {
  // context -> shader -> ( x, y ) -> draw to canvas
  const vid = vImgData( ctx.getImageData(
    0, 0, ctx.canvas.width, ctx.canvas.height
  ) )
  return ( clip, w, h, ax = 0, ay = 0 ) => ( x, y ) => {
    const [ offx, offy ] = [ ax * w, ay * h ]
    const [ x0, y0 ] = [ x - offx, y - offy ]
    vid.ipmap( x0, y0, x0 + w, y0 + h )( tnslt( x, y )(clip) )
    const id = new ImageData( vid.data, vid.w, vid.h )
    ctx.putImageData( id, 0, 0 )
  }
}

//filters
const only = shape => shader => ( x, y, clr, grid ) =>
  shape( x, y ) ? shader( x, y, clr, grid ) : clr

//misc shaders
const fill = color => ( x, y, clr ) => color
const nfill = color => ( x, y, clr ) => maprgb( add(1*rand2()), color )

//color functions
const cdiv = map2( divide )
const cmult = map2( multiply )
const cadd = addl
const csub = map2( subtract )
const setrgb = curry( ( r, g, b, clr ) =>
  // ( num, num, num, color ) => color
  [ r, g, b, clr[3] ] )
const maprgb = curry( ( f, clr ) =>
  // ( ( color => color ), color ) => color
  [ f(clr[0]), f(clr[1]), f(clr[2]), clr[3] ] )
const addrgb = curry( ( clr0, clr1 ) =>
  [ clr0[0] + clr1[0], clr0[1] + clr1[1], clr0[2] + clr1[2], clr0[3] ] )
const scalergb = curry( ( x, clr ) => maprgb( multiply(x), clr ) )
const seta = curry( ( clr, a ) =>
  // ( color, num ) => color
  setElement( clr, 3, a ) )
const scalea = curry( ( clr, x ) =>
  // ( color, num ) => color
  setElement( clr, 3, x * clr[3] ) )
const brightness = curry( ( x, clr ) => maprgb( add(x), clr ) )
const saturate = curry( ( x, clr ) => maprgb( add(-x), clr ) )
const fade = curry( ( x, clr ) => maprgb( multiply(x), clr ) )
const colorStr = col => fold( (acc,x) => acc + x.toString() + ' ', '[ ' )(col) + ']'
const invert = maprgb( subtract( 255 ) )
const terpClr = curry( ( terp, clr0, clr1, ratio ) => {
  return map2( R.curry( terp )( R.__, R.__, ratio ), clr0, clr1 )
} )
const slrgb = slice(0,3)
