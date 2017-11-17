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
