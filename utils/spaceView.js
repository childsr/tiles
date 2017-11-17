'use strict'

const {
  pvec,
  rot: rotv,
  rotab,
  sub: subv
} = V

/**/let createView = function(options) {
  let Max = 10,
      id = 'view',
      font = 'Arial',
      fontSize = 15,
      fontColor,
      wRatio,
      hRatio,
      offLeftRatio,
      offTopRatio
  const opts = options || {}
  if (typeof opts === 'string') {
    id = opts
  }
  else if (typeof opts === 'number'){
    Max = opts
  }
  id = opts.id || id
  Max = opts.Max || Max
  font = opts.font || font
  fontSize = opts.fontSize || fontSize
  fontColor = opts.fontColor
  wRatio = opts.wRatio || 1
  hRatio = opts.hRatio || 1
  offLeftRatio = opts.offLeftRatio || 0
  offTopRatio = opts.offTopRatio || 0

  const usingCustomCanvas = opts.canvas ? true : false

  let canvas = opts.canvas || document.getElementById(id),
    context = canvas.getContext('2d'),
    w,
    h,
    xmax,
    ymax,
    xmin,
    ymin,
    scale, //scale is pixels per unit (ie px/m)
    pxSize, //pixel size
    MAX = Max,
    offx = 0,
    offy = 0,
    zoom,
    zFactor = 1.05,
    ratio,
    background,
    buffer,
    color

  init()

  function init() {
    canvas.width = isNot( opts.width ) ?
      Math.round( window.innerWidth * wRatio ) : opts.width
    canvas.height = isNot( opts.height ) ?
      Math.round( window.innerHeight * hRatio ) : opts.height
    canvas.position = 'absolute'
    ;(w = canvas.width), (h = canvas.height)
    canvas.style.left = `${window.innerWidth * offLeftRatio}px`
    canvas.style.top = `${window.innerHeight * offTopRatio}px`
    canvas.style.position = 'absolute'
    context.font = font
    if ( opts.pxMode ){
      setZoom( 2 * Max / w )
      shift( w / 2, h / 2 )
    } else setZoom(1)
    setColor(0, 0, 0, 1)
    window.addEventListener('resize', onWindowResize)
  }
  function onWindowResize() {
    let imageData = context.getImageData(0, 0, w, h)
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    w = canvas.width
    h = canvas.height
    context.font = '15px Arial'
    setZoom(zoom)
    context.putImageData(imageData, 0, 0)
  }

  let imgs = []
  let imgsLoaded = []

  //Transformations
  function ctp( X, Y ) {
    //Transform from cartesian coordinates to pixel (display) coordinates.
    if ( Array.isArray(X) ) {
      return ctp( ...X )
    }

    if ( opts.pxMode ) return [ X, Y ]
    return [
      round(X * scale + w / 2 - offx * scale),
      round(h / 2 - Y * scale + offy * scale)
    ]
  }
  function ptc( X, Y ) {
    //Transform from pixel (display) coordinates to cartesian coordinates.
    if ( Array.isArray(X) ) return ptc(X[0],X[1],true)
    if ( opts.pxMode ) return [ X, Y ]
    return [1 / scale * (X - w / 2) + offx, offy - 1 / scale * (Y - h / 2)]
  }
  function _utp(units) {
    //Convert units to pixels.
    return Math.round( units * scale )
  }
  function _ptu(pixels) {
    //Convert pixels to units.
    return pixels * pxSize
  }
  const utp = opts.pxMode ? R.identity : _utp
  const ptu = opts.pxMode ? R.identity : _ptu

  const addImg = ( path, callback ) => {
    let img = document.createElement('img')
    const i = len(imgs)
    img.src = path
    img.onload = ( ...args ) =>{
      if (callback) callback( ...args )
      imgsLoaded[i] = true
    }
    imgs.push(img)
    imgsLoaded.push(false)
  }
  const addImgs = ( paths, callback ) => {
    const n = len(paths)
    forEach( path => addImg( path,
      ( ...args ) => {
        if ( len(imgs) === n && findTrue(imgsLoaded) )
          callback( ...args )
      } ), paths
    )
  }
  const arrow = ( p0, p1, lw, color ) => {
    const w = lw || 2

    const d = dist( p1, p0 )
    const a = ptu( 5 * w )

    const theta = angleTo( subv( p1, p0 ) )
    const tfm = C( addv(p0), rotv(theta) )

    const pts = map(tfm)( [
      [ d - a, a ],
      [ d - a, -a ],
      [ d, 0 ],
      [ d - a, 0 ]
    ] )

    view.setColor(color)
    fillPolygon(pts.slice(0,3))
    line( p0, pts[3], w )
  }
  function centerAt(x, y) {
    if ( typeof x === 'object' ) return centerAt( x[0],x[1] )
    offx = x
    offy = y
    setZoom(zoom)
    return [ x, y ]
  }
  const circle = ( center, radius, theta0, theta1 ) => {
    drawCircle( center[0], center[1], radius, null, null, theta0, theta1 )
  }
  function clearAll() {
    context.clearRect(0, 0, w, h)
  }
  const clear = clearAll
  const clickZone = shape => f => {
    setonclick( e => {
      if ( shape( e.clientX, e.clientY ) ) f(e)
    } )
  }
  function drawCircle(cx, cy, radius, thickness, color, theta0, theta1) {
    if (Array.isArray(cx)) return drawCircle(cx[0],cx[1],cy,radius, thickness, color, theta0)
    if (thickness) context.lineWidth = thickness
    if (color) setColor(color)
    const t0 = theta0 || 0
    const t1 = theta1 || tau
    let C = ctp(cx, cy)
    context.beginPath()
    context.arc(C, C[1], utp(radius), -t1, -t0)
    context.stroke()
  }
  function drawfunc(f, x, max, dx) {
    if (x > max) return
    var p1 = ctp(x, f(x))
    context.lineTo(p1[0], p1[1])
    drawfunc(f, x + dx, max, dx)
  }
  const drawImg = ( img, ax = 0, ay = 0 ) => ( x, y ) => {
    const draw = () => {
      const [ px, py ] = V.sub( ctp(x,y), [ ax * img.width, ay * img.height ] )
      context.drawImage( img, px, py )
    }
    if ( img.complete ) draw()
    else img.onload = () => draw()
  }
  function drawLine(x1, y1, x2, y2, lw, stroke = true) {
    //Draw a line from (x1,y1) to (x2,y2).
    const p1 = ctp(x1, y1)
    const p2 = ctp(x2, y2)
    setLineWidth(lw)
    context.beginPath()
    context.moveTo(p1[0], p1[1])
    context.lineTo(p2[0], p2[1])
    if (stroke) context.stroke()
  }
  function drawLineEquation( y, domain ) {
    //Draw a straight line from (x0,y(x0)) to (x1,y(x1))
    const [ x0, x1 ] = Array.isArray(domain) ? domain : [ xmin, xmax ]
    drawLine(x0,y(x0),x1,y(x1))
  }
  function drawPolygon(points, x0 = 0, y0 = 0) {
    if (x0 || y0) {
      makeClosedPath(points.map(p => [p[0] + x0, p[1] + y0]))
    } else makeClosedPath(points)
    context.stroke()
  }
  function drawVector(vec, vec0 = [0, 0] ) {
    drawLine(vec0[0],vec0[1],vec[0] + vec0[0],vec[1] + vec0[1])
  }
  function fillAll( r, g, b, a = 1 ) {
    //Fill whole canvas with given color
    setColor(r, g, b, a)
    context.fillRect(0, 0, w, h)
  }
  function fillCircle(cx, cy, radius, theta0 = 0, theta1 = tau, grd = 0) {
    //Tested. Fill a circle centered at (x,y) with the given color
    if (Array.isArray(cx)) return fillCircle(cx[0],cx[1],cy,radius)
    if (grd != 0) context.fillStyle = grd
    var C = ctp(cx, cy)
    var R = radius * ( opts.pxMode ? 1 : scale )
    context.beginPath()
    context.moveTo(C[0], C[1])
    context.lineTo( C[0] + radius * cos(theta0), C[1] + radius * sin(theta0) )
    context.arc(C[0], C[1], R, theta0, theta1)
    context.closePath()
    context.fill()
    //context.lineWidth = 5
    //context.stroke()
  }
  function fillPolygon(points) {
    makeClosedPath(points)
    context.fill()
  }
  function fillRect(x1, y1, width, height) {
    //Fill rectangle with upper-left corner located at (x,y) with give w and h
    var C = ctp(x1, y1)
    context.fillRect(C[0], C[1], utp(width), utp(height))
  }
  function fillTriangle(vertices) {
    makeClosedPath(vertices)
    context.fill()
  }
  const graphFunction = (f, options) => {
    const opts = options || {}
    const domainMin = opts.domainMin || xmin
    const domainMax = opts.domainMax || xmax
    const dx = opts.dx || pxSize
    const w = opts.w || 2
    const color = opts.color || [0, 0, 0, 1]
    setColor(color)
    context.lineWidth = w
    context.beginPath()
    context.moveTo(domainMin, f(domainMin))
    drawfunc(f, domainMin + dx, domainMax, dx)
    context.stroke()
  }
  const horizontal = y => drawLine( xmax, y, xmin, y )
  const line = ( pt0, pt1 , lw ) => {
    const p1 = ctp(pt0)
    const p2 = ctp(pt1)
    setLineWidth(lw)
    context.beginPath()
    context.moveTo(p1[0], p1[1])
    context.lineTo(p2[0], p2[1])
    context.stroke()
  }
  function makeClosedPath(points) {
    let s = points.length
    if (s <= 2) {
      console.log('ERROR: CANNOT MAKE CLOSED PATH WITH ' + s + ' POINTS')
      return
    }
    context.beginPath()
    let p = Array.isArray(points[0])
      ? ctp(points[0][0], points[0][1])
      : ctp(points[0][0], points[0][1])
    context.moveTo(p[0], p[1])
    for (let i = 0; i < s; i++) {
      let p1 = Array.isArray(points[i])
        ? ctp(points[i][0], points[i][1])
        : ctp(points[i][0], points[i][1])
      context.lineTo(p1[0], p1[1])
    }
    context.closePath()
  }
  function pixel(x, y, r, g, b, a) {
    //Draw pixel at (x,y) with the color rgba(r,g,b,a); a defaults to 1 (opaque).
    setColor(r, g, b, a)
    var coor = ctp(x, y)
    context.fillRect(coor[0], coor[1], 1, 1)
  }
  const plot = (f,x,dx,max) => {
    //f returns a vector for the point to be moved to
    if (x >= max) return
    const pt = ctp(f(x))
    context.lineTo(pt[0], pt[1])
    return plot(f,x+dx,dx,max)
  }
  const plotPolar = (r,options) => {
    const opts = options || {}
    const dom = opts.domain || opts.dom || [0,tau]
    const n = opts.n || 100
    const dx = tau/n
    const p0 = ctp( V.pvec( r( dom[0] ),dom[0] ) )
    context.beginPath()
    context.moveTo(p0[0],p0[1])
    const f = theta => V.pvec( r(theta), theta )
    plot(f,dom[0],dx,dom[1])
    context.stroke()
  }
  function point( x, y, pxRadius, color ) {
    if ( Array.isArray(x) ) {
      return point(x[0],x[1],y,pxRadius)
    }
    if ( typeof x === 'object' ) {
      return point(x[0],x[1],y,pxRadius)
    }
    const radius = pxRadius || 3
    if (color === 1) setColor(255,0,0,1)
    else setColor(color)
    const a = alpha()
    seta( a*0.2 )
    fillCircle( x, y, ptu(radius+1) )
    seta( a )
    fillCircle( x, y, ptu(radius) )
  }
  const ptlbl = ( x, y, pxRadius = 3, color ) => {
    if ( Array.isArray(x) ) {
      return point(x[0],x[1],y,pxRadius)
    }
    point( x, y, pxRadius, color )
    const p = ctp( x, y )
    text(
      '( ' + x.toFixed(0) + ', ' + y.toFixed(0) + ' )',
      p[0] + pxRadius, p[1]
    )
  }
  const randColor = seed => {
    if (seed) randSeed(seed)
    return [ 255*rand(), 255*rand(), 255*rand(), 1 ]
  }
  function seta(a) {
    context.globalAlpha = a < 0 ? 0 : ( a > 1 ? 1 : a )
  }
  function setColor(r, g, b, a) {
    //If given an rgb(a) value, set the fill and stroke styles to it. Otherwise do nothing.
    if (Array.isArray(r)) {
      setColor(r[0],r[1],r[2],r[3])
      return
    }
    if (r !== 0 && !r) return
    if (a !== 0 && !a) a = 1
    color = [r,g,b,a]
    context.fillStyle =
      'rgba(' +
      Math.floor(r) +
      ',' +
      Math.floor(g) +
      ',' +
      Math.floor(b) +
      ',' +
      a +
      ')'
    context.strokeStyle =
      'rgba(' +
      Math.floor(r) +
      ',' +
      Math.floor(g) +
      ',' +
      Math.floor(b) +
      ',' +
      a +
      ')'
    seta(a)
  }
  function setFont(_font,size,color) {
    if (color) fontColor = color
    context.font = `${size||fontSize}px ${_font}`
  }
  function setFontColor(color) {
    fontColor = color
  }
  function setFontSize(size) {
    setFont(font,size)
  }
  function setLineWidth(lw) {
    if(lw) context.lineWidth = lw
  }
  const setonclick = f => canvas.onclick = f
  function setZoom(z) {
    zoom = z
    let max = MAX / zoom
    ratio = h / w
    scale = w / 2 / max
    xmax = max + offx
    ymax = max * ratio + offy
    xmin = xmax - 2 * max
    ymin = ymax - 2 * max * ratio
    pxSize = 1 / scale
  }
  function shift(x, y) {
    offx += x
    offy += y
    setZoom(zoom)
  }
  const showCursor = show => canvas.style.cursor = ( show ? '' : 'none' )
  function text(str, xPx, yPx) {
    setColor(fontColor)
    context.fillText(str, xPx, yPx)
  }
  const vertical = x => drawLine( x, ymax, x, ymin )
  function zoomIn(factor) {
    setZoom(zoom * (factor || zFactor))
  }
  function zoomOut(factor) {
    setZoom(zoom / (factor || zFactor))
  }

  return {
    addImg,
    addImgs,
    arrow,
    centerAt,
    circle,
    clear,
    clearAll,
    ctp,
    drawCircle,
    drawImg,
    drawLine,
    drawLineEquation,
    drawPolygon,
    drawVector,
    fillAll,
    fillCircle,
    fillPolygon,
    fillRect,
    fillTriangle,
    graphFunction,
    horizontal,
    line,
    makeClosedPath,
    pixel,
    plot,
    plotFunc: graphFunction,
    plotPolar,
    point,
    ptc,
    ptlbl,
    ptu,
    randColor,
    seta,
    setColor,
    setFont,
    setFontColor,
    setFontSize,
    setLineWidth,
    setZoom,
    showCursor,
    shift,
    text,
    vertical,
    utp,
    zoomIn,
    zoomOut,
    get scale() {
      return scale
    },
    get pxSize() {
      return pxSize
    },
    get xmin() {
      return xmin
    },
    get xmax() {
      return xmax
    },
    get ymin() {
      return ymin
    },
    get ymax() {
      return ymax
    },
    get center() {
      return [(xmax + xmin) / 2, (ymax + ymin) / 2]
    },
    get w() {
      return w
    },
    get h() {
      return h
    },
    get width() {
      return xmax - xmin
    },
    get height() {
      return ymax - ymin
    },

    get zoom() {
      return zoom
    },
    get context() {
      return context
    },
    get canvas() {
      return canvas
    },
    get aspectRatio() {
      return w / h
    },
    get alpha() {
      return context.globalAlpha
    },
    get qlength() {
      return qlength
    },
    get screenData() {
      return context.getImage
    },
    get color() {
      return color
    },
    font,
    fontSize,
    imgs,
    zFactor
  }
}
