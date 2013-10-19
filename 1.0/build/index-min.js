/*! albums - v1.0 - 2013-10-17 7:22:58 PM
* Copyright (c) 2013 hanwen.sah; Licensed  */
KISSY.add("gallery/albums/1.0/dialog",function(a,b,c){function d(a){h=new c.DraggableDelegate({container:a,selector:".J_img",move:!1})}function e(a){return function(b){var c=g.get("album-id");g.fire(a+":"+c,{el:b.currentTarget})}}var f,g=new a.Dialog({width:"100%",height:"100%",elCls:"albums-dialog"});g.on("beforeVisibleChange",function(b){b.prevVal||(i={},a.Event.on(document,"mousewheel",function(b){var c=g.get("album-id");a.all(b.target).hasClass(".J_img")&&(g.fire("wheel:"+c,{wheel:[b.deltaX||0,b.deltaY||0]}),b.halt())}),a.all("html").css("overflow-y","hidden"),g.stopDD())});var h;g.on("hide",function(){a.Event.detach(document,"mousewheel"),a.all("html").css("overflow-y","auto"),e("close")({})});var i={};return g.getWinHeight=function(){return i.height||(i.height=a.DOM.viewportHeight()),a.DOM.viewportHeight()},g.getWinWidth=function(){return i.width||(i.width=a.DOM.viewportWidth()),i.width},g.startDD=function(){return h.set("move",!0),h},g.stopDD=function(){h.set("move",!1)},g.on("change:step",g.stopDD),g.on("afterRenderUI",function(){f=g.get("contentEl"),f.delegate("click",".hander",e("hander")),f.delegate("click",".J_img",e("turn")),f.delegate("click",".action",e("action"));var b;a.Event.on(window,"resize",function(){i={},g.get("visible")&&(b&&b.cancel(),b=a.later(function(){var a=g.get("album-id");g.fire("resize:"+a)},100))}),a.Event.on(document,"keyup",function(a){if(g.get("visible")){var b=g.get("album-id");39===a.keyCode?g.fire("next:"+b):37===a.keyCode&&g.fire("prev:"+b)}}),d(f)}),g},{requires:["overlay","dd"]}),KISSY.add("gallery/albums/1.0/rotate",function(a){function b(b,e){var f={};return void 0===e&&(e=1),f=a.UA.ie&&a.UA.ie<9?c(b,e):d(b,e)}function c(b,c){b=b/180*Math.PI;var d=Math.cos(b)*c,e=Math.sin(b)*c,f=-Math.sin(b)*c,g="progid:DXImageTransform.Microsoft.Matrix(M11={costheta},M12={sinthetaN},M21={sintheta},M22={costheta},SizingMethod='auto expand')";return g=a.substitute(g,{costheta:d,sintheta:e,sinthetaN:f}),{filter:g}}function d(b,c){var d={"-moz-transform":"rotate({degree}deg) scale({scale})","-webkit-transform":"rotate({degree}deg) scale({scale})","-ms-transform":"rotate({degree}deg) scale({scale})","-o-transform":"rotate({degree}deg) scale({scale})",transform:"rotate({degree}deg) scale({scale})"};return a.each(d,function(e,f){d[f]=a.substitute(e,{degree:b,scale:c})}),d}return b}),KISSY.add("gallery/albums/1.0/plugin/thumb",function(a,b,c){function d(a){d.superclass.constructor.call(this,a)}var e=150,f=150;return a.extend(d,c,{pluginId:"thumb",pluginInitializer:function(a){this.host=a,this.dialog=a.dialog,this.contentEl=a.dialog.get("contentEl"),this._boundary=[null,null],this._bind()},_bind:function(){var a=this.host;a.on("afterScaleChange",function(a){if(this._shouldShowView()){this._position(a.newVal-a.prevVal);var b=this.dialog.startDD();b.on("dragalign",this._proxy,this),this.drag=b,this._hide()}else this.set("centerOffset",null),this.dialog.stopDD(),this._hide(!0)},this);var b=a.get("id");this.dialog.on("wheel:"+b,function(a){this._wheel(a.wheel)},this),this.dialog.on("close:"+b,function(){this._hide(!0)},this)},_shouldShowView:function(){return this.host.isOutBoundary()},_wheel:function(a){if(this._shouldShowView()){var b={left:0,top:0},c=this._boundary;"top"==c[1]||"bottom"==c[1]?b.left=-15*a[1]:b.top=-15*a[1];var d=this._getPosition();b={left:d.left+b.left,top:d.top+b.top},this._proxy(b),this.contentEl.all(".J_img").offset(this.position)}},_getPosition:function(){if(this.position)return this.position;var a=this.host,b=a.get("box"),c=a.get("theme").get("padding"),d=a.get("scale"),e=c[3]+(b.view[0]-b.img[0]*d)/2,f=c[0]+(b.view[1]-b.img[1]*d)/2;return{left:e,top:f}},_proxy:function(a){if(this._shouldShowView()){this.get("zoom");var b={left:a.left,top:a.top},c=this._isOutBoundary(b),d=this._posToPreview(b),e=this.get("centerPosition");if(this.set("centerOffset",{left:e.left-d.left,top:e.top-d.top}),c){var f=a.drag||this.drag;f&&f.setInternal("actualPos",b)}else this._boundaryStack("center");this.position=b,this.contentEl.all(".album-thumb").css(d),this._hide()}},_isOutBoundary:function(a){var b=this.boundary,c=!1;return a.left<b.viewRight?(a.left=b.viewRight,c=!0,this._boundaryStack("right")):a.left>=b.viewLeft&&(a.left=b.viewLeft,c=!0,this._boundaryStack("left")),a.top<b.viewBottom?(a.top=b.viewBottom,c=!0,this._boundaryStack("bottom")):a.top>b.viewTop&&(a.top=b.viewTop,c=!0,this._boundaryStack("top")),c},_previewToPos:function(a){var b={},c=this.host,d=c.get("theme").get("padding"),g=this.boundary,h=this.get("zoom"),i=this.scrollTop;return b.top=-(a.top+f-g.distance[1])/h+d[0]+i,b.left=-(a.left+e-g.distance[0])/h+d[3],b},_posToPreview:function(a){var b={},c=this.host,d=c.get("theme").get("padding"),g=this.boundary,h=this.get("zoom"),i=this.scrollTop;return b.top=-f+(d[0]-a.top+i)*h+g.distance[1],b.left=-e+(d[3]-a.left)*h+g.distance[0],b},_boundaryStack:function(a){a!=this._boundary[1]&&(this._boundary.shift(),this._boundary.push(a))},_hide:function(b){var c=this.contentEl,d=this.handle;b?c.all(".album-preview-box").css("visibility","hidden"):(c.all(".album-preview-box").css("visibility","visible"),d&&d.cancel(),d=a.later(function(){c.all(".album-preview-box").css("visibility","hidden")},1500),this.handle=d)},_position:function(b){b=b||0;var c,d,g,h,i=f,j=e,k=this.host,l=k.get("box"),m=this.dialog.get("contentEl"),n=k.get("scale"),o=k.get("theme").get("padding"),p=l.img[0]*n,q=l.img[1]*n,r={top:0,left:0},s=a.all(document).scrollTop(),t={distance:[0,0]};this.scrollTop=s,q/i>p/j?(d=i,g=d/q,c=g*p,t.distance[0]=(e-c)/2,r.left=(j-c)/2,r.height=i):(c=j,g=c/p,d=g*q,t.distance[1]=(f-d)/2,r.top=(i-d)/2,r.width=j),h={width:g*l.view[0],height:g*l.view[1]},t.viewLeft=o[3],t.viewRight=t.viewLeft-(p-l.view[0]),t.viewTop=o[0]+s,t.viewBottom=t.viewTop-(q-l.view[1]),h.height>d?(t.viewTop=(l.view[1]-q)/2+o[0]+s,t.viewBottom=t.viewTop,t.distance[1]+=(h.height-d)/2,h.height=d):h.width>c&&(t.viewLeft=(l.view[0]-p)/2+o[3],t.viewRight=t.viewLeft,t.distance[0]+=(h.width-c)/2,h.width=c),h.left=-e-(l.view[0]-p)/2*g+t.distance[0],h.top=-f-(l.view[1]-q)/2*g+t.distance[1],this.set("centerPosition",{left:h.left,top:h.top});var u=this.get("centerOffset");if(u&&(h.left-=u.left,h.top-=u.top),this.boundary=t,m.all(".J_preivew_img").css(r),m.all(".album-thumb").css(h),this.set("zoom",g),this.position=null,u){var v=this._previewToPos(h),w=this._isOutBoundary(v);w&&(m.all(".album-thumb").css(this._posToPreview(v)),a.later(function(){m.all(".J_img").offset(v)},230))}},_getPreviewBox:function(){this.host;var a=this.get("box");a.img[0],a.img[1],a.view[0],a.view[1]},pluginDestructor:function(){}},{zoom:{value:null},preview:{},position:{}}),d},{requires:["node","base"]}),KISSY.add("gallery/albums/1.0/theme/album-tpl",function(){return{html:'<div class="theme-box {{theme}}">\n  <div class="handers">\n    {{#if len !== 1}}\n    <span class="prev album-prev hander">&lt;</span>   \n    <span class="next album-next hander">&gt;</span>   \n    {{/if}}\n  </div>\n  <div class="box">   \n\n    <div class="album-action-bar">\n      <a class="album-big action" data-action="zoom" href="#nowhere"></a>\n      <a class="album-small action" data-action="zoom" href="#nowhere"></a>\n      <a class="rotation-pro action" data-action="rotation-pro" href="#nowhere"></a>\n      <a class="rotation-con action" data-action="rotation-con" href="#nowhere"></a>\n    </div>\n\n    <div class="album-preview-box">\n      <img class="J_preivew_img" src="{{src}}" alt="" />\n      <div class="album-thumb"></div>\n    </div>\n\n    <div class="box-main album-loading" style="height: {{h - 20}}px; {{#if w}}width: {{w}}px; {{/if}}">  \n      {{#if download}}\n        <a href="{{download}}"><img class="{{imgCls}}" src="{{src}}" alt="" /></a>\n      {{else}}\n        <img class="{{imgCls}}" src="{{src}}" style="display: none" alt="" />\n      {{/if}}\n    </div>   \n    <div class="box-aside" style="height: {{h}}px">   \n      <div class="aside-wrap">  \n        <div class="headline"><em class="J_num num">{{index + 1}}/{{len}}</em>{{title}} [<a class="action" data-action="fullscreen" href="#nowhere">\u5168\u5c4f</a>]\n        </div>  \n        {{#if desc}}\n        <p class="J_desc desc">{{prefix}}: {{{desc}}}</p>  \n        {{/if}}\n      </div>   \n    </div>   \n  </div>\n</div>\n'}}),KISSY.add("gallery/albums/1.0/theme/default",function(a,b,c,d,e){function f(a){a||document.fullscreenElement||document.mozFullScreenElement||document.webkitFullscreenElement?document.cancelFullScreen?document.cancelFullScreen():document.mozCancelFullScreen?document.mozCancelFullScreen():document.webkitCancelFullScreen&&document.webkitCancelFullScreen():document.documentElement.requestFullscreen?document.documentElement.requestFullscreen():document.documentElement.mozRequestFullScreen?document.documentElement.mozRequestFullScreen():document.documentElement.webkitRequestFullscreen&&document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)}function g(a,b){g.superclass.constructor.call(this,b),this.initializer(a)}var h,i=new e(d.html),j=b.all,k=a.mix(a.EventTarget,{});return a.Event.on(document,"mozfullscreenchange webkitfullscreenchange fullscreenchange",function(){document.webkitFullscreenElement||document.mozFullScreenElement||document.fullscreenElement||k.fire("fullscreen:exit")}),a.extend(g,c,{initializer:function(a){this.host=a,h=a.dialog,this._bind()},_bind:function(){var a=this.host,b=a.get("id");h.on("action:"+b,this._action,this),h.on("close:"+b,this._exitFullsreen,this),a.on("resize",this._resize,this),k.on("fullscreen:exit",function(){a.get("id")==h.get("album-id")&&this._exitFullsreen()},this)},_resize:function(){var b=this.get("padding"),c=h.getWinHeight()-b[0]-b[2];if(6===a.UA.ie){var d=h.getWinWidth()-b[1]-b[3];h.get("contentEl").all(".box-main").css({width:d,height:c})}else h.get("contentEl").all(".box-main").height(c);h.get("contentEl").all(".box-aside").height(c+20)},_action:function(a){var b=a.el,c=j(b).attr("data-action");"fullscreen"===c&&this._fullscreen()},_exitFullsreen:function(){this._paddingBackup&&(this.set("padding",this._paddingBackup),delete this._paddingBackup,h.get("el").removeClass("fullscreen"),f(!0))},_fullscreen:function(){h.get("el").addClass("fullscreen");var a=this.get("padding"),b=this.host;this._paddingBackup=a,this.set("padding",[10,10,10,10]),f(),b.go(0)},html:function(b,c){var d=this.get("data"),e=this.host,f=h.getWinHeight()+20,g=h.getWinWidth(),i=this.get("padding"),k=j(b).attr(e.get("origin")),l=j(b).attr("data-download");k||(k=b.src);var m=e.get("len"),n={src:k,imgCls:"J_img",index:c,len:m,h:f-i[0]-i[2],w:6===a.UA.ie?g-i[1]-i[3]:null,desc:j(b).attr("data-desc")||"",download:l};return a.mix(n,d),this.get("template").render(n)},pluginDestructor:function(){}},{ATTRS:{padding:{value:[47,277,47,47]},name:{value:"default"},template:{value:i},data:{value:{title:"\u67e5\u770b\u56fe\u7247",prefix:"\u56fe\u7247\u8bf4\u660e"}}}}),g},{requires:["node","base","./album-tpl","xtemplate","../index.css"]}),KISSY.add("gallery/albums/1.0/index",function(a,b,c,d,e,f,g,h){function i(a){var b=this;i.superclass.constructor.call(b,a),b.init()}function j(a){if(a.prop("naturalWidth"))return{width:a.prop("naturalWidth"),height:a.prop("naturalHeight")};var b=new Image;return b.src=a.attr("src"),{width:b.width,height:b.height}}function k(a){return a.complete?"undefined"!=typeof a.naturalWidth&&0==a.naturalWidth?!1:!0:!1}var l=b.all;return a.extend(i,c,{init:function(){var b=this.get("baseEl"),c=this.get("theme");if(b.length&&(this.set("id",1),f.render(),this._bindEvent(),this.dialog=f,this.plug(new h),this._loadedImgs={},a.isString(c))){if(c=a.require(c),!c)throw new Error("Theme \u6ca1\u6709\u5b9a\u4e49");this.set("theme",new c(this))}},_setEls:function(){var a=this.get("baseEl"),b=l(this.get("img"),a);return b.each(function(a,b){a.attr("data-index",b)}),this.set("imgList",b),this.set("len",b.length),b},_bindEvent:function(){var b=this.get("baseEl"),c=this.get("trigger"),d=this.get("img");a.Event.delegate(b,c,d,this._show,this);var e=this.get("id");f.on("hander:"+e,this._go,this),f.on("action:"+e,this._action,this),f.on("resize:"+e,this._resize,this),f.on("turn:"+e,this._turn,this);var g=this;f.on("prev:"+e,function(){g.go(-1)}),f.on("next:"+e,function(){g.go(1)}),this.on("switch",this._hander,this)},_action:function(a){var b=a.el,c=l(b).attr("data-action");"rotation-con"==c?this._rotation(-90):"rotation-pro"==c?this._rotation(90):"zoom"==c&&this._zoom(l(b))},_rotation:function(a){var b=f.get("contentEl").all(".J_img"),c=this.get("rotation"),d=this.get("scale");c+=parseInt(a,10),this.set("rotation",c);var e=g(c,d);b.css(e)},_resize:function(){var a=f.get("contentEl").all(".J_img");this.fire("resize"),this._position(a,1)},_hander:function(a){var b=f.get("contentEl"),c=b.all(".hander");0===a.from&&c.removeClass("step-start"),0===a.to&&c.addClass("step-start");var d=this.get("len")-1;a.to===d&&c.addClass("step-last"),a.from===d&&c.removeClass("step-last")},_zoom:function(a){var b=f.get("contentEl").all(".J_img"),c=a.hasClass("album-big");this._zoomOut(b,c?.2:-.2)},_zoomOut:function(b,c){var d=this.get("rotation"),e=this.get("scale"),f=this.get("box").img,h=this.get("zoom");e+=c,1>e&&c>0&&(e=1),1>e&&0>c&&(e=this.get("zoom")),h=(e-h)/2;var i=g(d,e);if(a.UA.ie<9){var j=this.get("position");i.left=j[0]-f[0]*h,i.top=j[1]-f[1]*h}b.css(i),this.set("scale",e),e===this.get("zoom")&&this._position(b,!0)},_position:function(b,c,d){if(b.data("loaded")){var e=j(b),h=this.get("theme").get("padding"),i=f.getWinHeight()-h[0]-h[2],k=f.getWinWidth()-h[1]-h[3],l=e.height,m=e.width,n=0,o=0,p=c?"inline":"none",q={top:n,left:o,position:"relative",display:p},r=1,s=a.UA.ie;l>i||m>k?l/i>m/k?(r=i/l,s&&9>s?q.left=(k-m*r)/2:(q.top=-(l-i)/2,q.left=(k-m)/2)):(r=k/m,s&&9>s?q.top=(i-l*r)/2:(q.top=(i-l)/2,q.left=-(m-k)/2)):(q.left=(k-m)/2,q.top=(i-l)/2),c&&1!==c||(q=a.mix(g(0,r),q)),b.css(q),f.get("contentEl").all(".album-loading").removeClass("album-loading"),c||b.fadeIn(.2,d),this.set("zoom",r),this.set("box",{view:[k,i],img:[m,l]}),this.set("position",[q.left,q.top]),this.set("scale",r),c&&d&&d()}},show:function(a,b){var c=this.get("baseEl");this._show({target:c.all(a)[0]},b)},_show:function(a,b){this.set("rotation",0);var c=a.target;this._setEls();var d=l(c).attr("data-index");d=parseInt(d,10),this.set("index",d),this._preLoadImg(d),f.set("bodyContent",this.get("theme").html(c,d)),f.show(),f.set("album-id",this.get("id"));var e=f.get("contentEl").all(".J_img"),g=this;k(e[0])?(e.data("loaded",!0),g._position(e,null,b)):(e.data("loaded",!1),e.on("load",function(){e.data("loaded",!0),g._position(e,null,b)}))},_preLoadImg:function(a){var b=this.get("imgList"),c=b.length-1,d=a?a-1:c,e=a==c?0:a+1,f=this.get("origin"),g=b.item(a).attr(f),h=b.item(d).attr(f),i=b.item(e).attr(f);this._loadedImgs[g]=!0,this._loadImg(h),this._loadImg(i)},_loadImg:function(a){if(a&&!this._loadedImgs[a]){var b=new Image;b.src=a,b=null,this._loadedImgs[a]=!0}},go:function(a,b){a=parseInt(a,10),this._setEls();var c=this.get("imgList").length,d=this.get("index")+a;if(-1===d&&(d=c-1),d===c&&(d=0),!(0>d||d>c-1)){this.get("baseEl");var e=this.get("imgList").item(d);this._preLoadImg(a),this.fire("switch",{from:this.get("index"),to:d}),this.show(e,function(){f.fire("change:step"),b&&b()})}},_go:function(a){var b=l(a.el),c=b.hasClass("prev")?-1:1;this.go(c)},isOutBoundary:function(){var a=this.get("box"),b=this.get("scale");return a.img[0]*b>a.view[0]||a.img[1]*b>a.view[1]},_turn:function(){this.isOutBoundary()||this.go(1)}},{ATTRS:{baseEl:{setter:function(a){return l(a)}},imgList:{value:null},img:{value:"img"},len:{value:0},trigger:{value:"click"},origin:{value:"data-original-url"},index:{value:0},box:{value:{}},id:{setter:function(){return a.guid()}},rotation:{value:0},scale:{value:1},preview:{value:a.UA.ie>7||!a.UA.ie},theme:{value:"gallery/albums/1.0/theme/default"}}}),i},{requires:["node","rich-base","overlay","anim","./dialog","./rotate","./plugin/thumb","./theme/default"]});