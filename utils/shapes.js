'use strict'

const rotn = theta => {
  // ang -> ( dis, dis ) -> [ dis, dis ]
	const c = cos(theta)
	const s = sin(theta)
	return ( x, y ) =>
		[ x * c - y * s, x * s + y * c ]
}
const rect = ( w, h ) => ( cx, cy, theta, anchorx, anchory ) => {
  // ( dis, dis ) -> ( dis, dis, ang ) -> shape
  const rot = rotn(-theta)
	const tfm = ( x, y ) => rot( x - cx, y - cy )
  const ax = isNot(anchorx) ? w*0.5 : anchorx*w
  const ay = isNot(anchory) ? h*0.5 : anchory*h
	return ( x, y ) => {
		const [ xp, yp ] = tfm( x, y )
    if ( btw( -ax, w - ax )(xp) && btw( -ay, h - ay )(yp) ) return true
		return false
	}
}
const circle = ( cx, cy, rd, theta0 = 0, theta1 = tau ) =>  {
  // ( dis, dis, dis ) -> shape
  return ( x, y ) => {
    if ( !btw( theta0, theta1 )( angleTo( x - cx, y - cy ) ) ) return false
    return ( mag( [ x - cx, y - cy ] ) <= rd )
  }
}
const circEdgeDist = ( rd, theta0 = 0, theta1 = tau ) => {
  // ( rd, theta0, theta1 ) -> ( cx, cy ) -> ( x, y ) -> distance
  const cedR = ( cx, cy ) => {
    const ends = [ [ rd * cos(theta0) + cx, rd * sin(theta0) + cy ],
      [ rd * cos(theta1) + cx, rd * sin(theta1) + cy ] ]
    if ( isarr(cx) ) return cedR( cx[0], cx[1] )
    const ced = ( _x, _y ) => {
      if ( isarr(_x) ) return ced( _x[0], _x[1] )
      else {
        const x = _x - cx
        const y = _y - cy
        if( inOrder( theta0, angleTo(x,y), theta1 ) )
          return abs( magn( x, y ) - rd )
        else return min(
          magn( _x - ends[0][0], _y - ends[0][1] ),
          magn( _x - ends[1][0], _y - ends[1][1] )
        )
      }
    }
    return ced
  }
  return cedR
}
