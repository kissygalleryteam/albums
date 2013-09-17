KISSY.add(function(S){

  function rotate(degree, scale){

    var css = {};

    if (scale === undefined) scale = 1;

    if (S.UA.ie && S.UA.ie < 9) {
      css = cssIE(degree);
    } else {
      css = cssRotate(degree, scale);
    }

    return css;

  }

  function cssIE(degree){
    degree = degree / 180 * Math.PI;
    var costheta = Math.cos(degree);
    var sintheta = Math.sin(degree);
    var sinthetaN = - Math.sin(degree);
    var filter = "progid:DXImageTransform.Microsoft.Matrix(M11={costheta},M12={sinthetaN},M21={sintheta},M22={costheta},SizingMethod='auto expand')";
    filter = S.substitute(filter, { costheta: costheta, sintheta: sintheta, sinthetaN: sinthetaN });
    return { filter: filter };
  }

  function cssRotate(degree, scale){

    var css = { 
      '-moz-transform': "rotate({degree}deg) scale({scale})",
      '-webkit-transform': "rotate({degree}deg) scale({scale})",
      '-ms-transform': "rotate({degree}deg) scale({scale})",
      '-o-transform':  "rotate({degree}deg) scale({scale})",
      'transform': "rotate({degree}deg) scale({scale})"
    };

    S.each(css, function(text, key){
      css[key] = S.substitute(text, { degree: degree, scale: scale });
    });

    return css;

  }

  return rotate;
});
