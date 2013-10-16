/*
combined files : 

gallery/albums/1.0/dialog
gallery/albums/1.0/rotate
gallery/albums/1.0/plugin/thumb
gallery/albums/1.0/plugin/album-tpl
gallery/albums/1.0/plugin/theme
gallery/albums/1.0/index

*/
KISSY.add('gallery/albums/1.0/dialog',function(S, Overlay, DD){

  var drag;
  var dialog = new S.Dialog({
      width: '100%',
      height: '100%',
      elCls: 'albums-dialog'
  });

  var contentEl;
  //禁止滚动事件和隐藏滚轮
  dialog.on('show', function(){

    S.Event.on(document, 'mousewheel', function(e){
      var id = dialog.get('album-id');
      dialog.fire('wheel:' + id, { wheel: [e.deltaX || 0, e.deltaY || 0] });
      e.halt();
    });
    S.all('html').css('overflow-y', 'hidden')
    dialog.stopDD();

  });

  var delegate;

  function renderDD(contentEl){

    delegate = new DD.DraggableDelegate({
      container: contentEl,
      selector: '.J_img',
      move: false
    });

  }

  //恢复滚动和滚轮
  dialog.on('hide', function(){

    S.Event.detach(document, 'mousewheel');
    S.all('html').css('overflow-y', 'auto')
    //发布关闭事件
    distribution('close')({});

  });

  function distribution(name){
    return function(e){
      var id = dialog.get('album-id');
      dialog.fire(name + ':' + id, { el: e.currentTarget });
    };
  }

  var winBox = {};

  dialog.getWinHeight = function(){
    if (!winBox.height) {
      winBox.height = S.DOM.viewportHeight();
    }
    return S.DOM.viewportHeight();
  };

  dialog.getWinWidth = function(){
    if (!winBox.width) {
      winBox.width = S.DOM.viewportWidth();
    }
    return winBox.width;
  };

  dialog.startDD = function(){ 
    delegate.set('move', true);  
    return delegate; 
  };

  dialog.stopDD = function(){ delegate.set('move', false); };

  dialog.on('change:step', dialog.stopDD);

  //dom渲染完成后
  dialog.on('afterRenderUI', function(){

    contentEl = dialog.get('contentEl');

    contentEl.delegate('click', '.hander', distribution('hander'));

    contentEl.delegate('click', '.J_img', distribution('turn'));

    contentEl.delegate('click', '.action', distribution('action'));

    var hander;

    S.Event.on(window, 'resize', function(){

        winBox = {};

        if (dialog.get('visible')) {
          hander && hander.cancel();

          hander = S.later(function(){
            var id = dialog.get('album-id');
            dialog.fire('resize:' + id);
          }, 100);

        }
    });

    S.Event.on(document, 'keyup', function(e){
      if (dialog.get('visible')) {
        var id = dialog.get('album-id');
        if (e.keyCode === 39){
          dialog.fire('next:' + id);
        } else if (e.keyCode === 37) {
          dialog.fire('prev:' + id);
        }
      }
    });

    renderDD(contentEl);

  });

  return dialog;

}, {
  requires: [ 'overlay', 'dd' ]
});

KISSY.add('gallery/albums/1.0/rotate',function(S){

  function rotate(degree, scale){

    var css = {};

    if (scale === undefined) scale = 1;

    if (S.UA.ie && S.UA.ie < 9) {
      css = cssIE(degree, scale);
    } else {
      css = cssRotate(degree, scale);
    }

    return css;

  }

  function cssIE(degree, scale){
    degree = degree / 180 * Math.PI;
    var costheta = Math.cos(degree) * scale;
    var sintheta = Math.sin(degree) * scale;
    var sinthetaN = - Math.sin(degree) * scale;
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

KISSY.add('gallery/albums/1.0/plugin/thumb',function(S, $, Base){

  var THUMB_WIDTH = 150;
  var THUMB_HEIGHT = 150;

  function Thumb(cfg){
    Thumb.superclass.constructor.call(this, cfg);
  }

  S.extend(Thumb, Base, {

    pluginId: 'thumb',

    pluginInitializer: function(host){
      this.host = host;
      this.dialog = host.dialog;
      this.contentEl = host.dialog.get('contentEl');

      this._boundary = [null, null];
      this._bind();
    },

    _bind: function(){

      var host = this.host;

      host.on('afterScaleChange', function(e){

        if(this._shouldShowView()) {

          this._position(e.newVal - e.prevVal);
          var dd = this.dialog.startDD();
          dd.on('dragalign', this._proxy, this);
          this.drag = dd;

          this._hide();

        } else {

          this.set('centerOffset', null);
          this.dialog.stopDD();
          this._hide(true);

        }
      }, this);
      
      var id = host.get('id');

      this.dialog.on('wheel:' + id, function(e){
        this._wheel(e.wheel);
      }, this);

      this.dialog.on('close:' + id, function(e){
        this._hide(true);
      }, this);

    },

    _shouldShowView: function(){
      return this.host.isOutBoundary();
    },

    // 滚动控制图片位移
    _wheel: function(wheel){

      if (!this._shouldShowView()) return;

      var offset = { left: 0, top: 0 };
      var _boundary = this._boundary;

      if (_boundary[1] == 'top' || _boundary[1] == 'bottom') {
        offset.left = wheel[1] * - 15;
      } else {
        offset.top = wheel[1] * - 15;
      }

      var pos = this._getPosition();

      offset = { 
        left: pos.left + offset.left, 
        top: pos.top + offset.top
      };

      this._proxy(offset);

      this.contentEl.all('.J_img').offset(this.position);

    },

    _getPosition: function(){

      if (this.position) {
        return this.position;
      }

      var host = this.host;
      var box = host.get('box');
      var padding = host.get('theme').get('padding');
      var scale = host.get('scale');

      var left = padding[3] + (box.view[0] - box.img[0] * scale) / 2;
      var top = padding[0] + (box.view[1] - box.img[1] * scale) / 2;

      return { left: left, top: top };
    },

    // 拖拽代理手动实现
    _proxy: function(e){

      if (!this._shouldShowView()) return;

      var zoom = this.get('zoom');
      //目标地址
      var pos = { left: e.left, top: e.top };

      var outBoundary = this._isOutBoundary(pos);
      var preview = this._posToPreview(pos);

      var centerPos = this.get('centerPosition');
      // 中心偏移量
      this.set('centerOffset', { 
        left: centerPos.left - preview.left,
        top: centerPos.top - preview.top 
      });

      if ( outBoundary ) {
        var drag = e.drag || this.drag;
        drag && drag.setInternal('actualPos', pos);
      } else {
        this._boundaryStack('center');
      }

      this.position = pos;
      this.contentEl.all('.album-thumb').css(preview);

      this._hide();

    },

    _isOutBoundary: function(pos){

      var boundary = this.boundary;
      var outBoundary = false;

      if (pos.left < boundary.viewRight){
        pos.left = boundary.viewRight;
        outBoundary = true;
        this._boundaryStack('right');
      } else if (pos.left >= boundary.viewLeft) {
        pos.left = boundary.viewLeft;
        outBoundary = true;
        this._boundaryStack('left');
      } 

      if (pos.top < boundary.viewBottom) {
        pos.top = boundary.viewBottom;
        outBoundary = true;
        this._boundaryStack('bottom');
      } else if (pos.top > boundary.viewTop) {
        pos.top = boundary.viewTop;
        outBoundary = true;
        this._boundaryStack('top');
      }

      return outBoundary;

    },

    // 通过预览框位置计算图片offset
    _previewToPos: function(preview) {

      var pos = {};

      var host = this.host;
      var padding = host.get('theme').get('padding');
      var boundary = this.boundary;
      var zoom = this.get('zoom');
      var scrollTop = this.scrollTop;

      pos.top = - (preview.top + THUMB_HEIGHT - boundary.distance[1]) / zoom  + padding[0] + scrollTop;
      pos.left = - (preview.left + THUMB_WIDTH - boundary.distance[0]) / zoom  + padding[3] ;

      return pos;

    },

    // 通过图片的offset计算预览框位置
    _posToPreview: function(pos){

      var preview = {};

      var host = this.host;
      var padding = host.get('theme').get('padding');
      var boundary = this.boundary;
      var zoom = this.get('zoom');

      var scrollTop = this.scrollTop;

      preview.top = - THUMB_HEIGHT + (padding[0] - pos.top + scrollTop) * zoom + boundary.distance[1];
      preview.left = - THUMB_WIDTH + (padding[3] - pos.left) * zoom + boundary.distance[0];

      return preview;

    },

    _boundaryStack: function(name){

      if (name == this._boundary[1]) return;

      this._boundary.shift();
      this._boundary.push(name);
    },

    _hide: function(isSync){

      var contentEl = this.contentEl;
      var handle = this.handle;

      if (isSync) {

        contentEl.all('.album-preview-box').css('visibility', 'hidden');

      } else {

        contentEl.all('.album-preview-box').css('visibility', 'visible');
        handle && handle.cancel();
        handle = S.later(function(){
          contentEl.all('.album-preview-box').css('visibility', 'hidden');
        }, 1500);

        this.handle = handle;

      }
    },

    _position: function(scaleDiff){

      scaleDiff = scaleDiff || 0;
      var viewH = THUMB_HEIGHT, viewW = THUMB_WIDTH;
      var host = this.host;
      var box = host.get('box');
      var contentEl = this.dialog.get('contentEl');
      var scale = host.get('scale');
      var padding = host.get('theme').get('padding');

      //图片实际大小
      var imgW = box.img[0] * scale, imgH = box.img[1] * scale;
      //缩略图大小
      var thumbW, thumbH;

      var css = { top: 0, left: 0 };
      var zoom, preview;

      var scrollTop = S.all(document).scrollTop();

      var boundary = {
        distance: [0, 0]
      };

      this.scrollTop = scrollTop;

      if (imgH / viewH > imgW / viewW) {

        thumbH = viewH;
        zoom = thumbH / imgH;
        thumbW = zoom * imgW;

        boundary.distance[0] = (THUMB_WIDTH - thumbW) / 2;
        css.left = (viewW - thumbW) / 2;
        css.height = viewH;

      } else {

        thumbW = viewW;
        zoom = thumbW / imgW;
        thumbH = zoom * imgH;

        boundary.distance[1] = (THUMB_HEIGHT - thumbH) / 2;
        css.top = (viewH - thumbH) / 2;
        css.width = viewW;

      }

      preview = {
        width: zoom * box.view[0],
        height: zoom * box.view[1]
      };
      
      // left
      boundary.viewLeft = padding[3];
      boundary.viewRight = boundary.viewLeft - (imgW - box.view[0]);

      // top offset
      boundary.viewTop = padding[0] + scrollTop;
      boundary.viewBottom = boundary.viewTop - (imgH - box.view[1]);

      //如果预览窗口高度大于缩略图高度
      if (preview.height > thumbH) {

        // top保持不变
        boundary.viewTop = (box.view[1] - imgH) / 2 + padding[0] + scrollTop;
        boundary.viewBottom = boundary.viewTop;

        boundary.distance[1] += (preview.height - thumbH) / 2;
        preview.height = thumbH;

      } else if (preview.width > thumbW) {
        //如果预览窗口宽度大于缩略图宽度 

        // left保持不变
        boundary.viewLeft = (box.view[0] - imgW) / 2 + padding[3];
        boundary.viewRight = boundary.viewLeft;

        boundary.distance[0] += (preview.width - thumbW) / 2;
        preview.width = thumbW;

      }

      preview.left = - THUMB_WIDTH - (box.view[0] - imgW) / 2 * zoom + boundary.distance[0];
      preview.top = - THUMB_HEIGHT - (box.view[1] - imgH) / 2  * zoom + boundary.distance[1];

      // 中心位置
      this.set('centerPosition', {
        left: preview.left,
        top: preview.top
      });

      var centerOffset = this.get('centerOffset');

      // 计算准确的位置偏移量
      if (centerOffset) {
        preview.left -= centerOffset.left ;
        preview.top -= centerOffset.top ;
      }

      this.boundary = boundary;
      //console.log(this.boundary);
      //console.log(preview);

      contentEl.all('.J_preivew_img').css(css);
      contentEl.all('.album-thumb').css(preview);

      this.set('zoom', zoom);
      this.position = null;

      if (centerOffset) {

        var pos = this._previewToPos(preview);
        var isOutBoundary = this._isOutBoundary(pos);

        if (isOutBoundary) {
          contentEl.all('.album-thumb').css(this._posToPreview(pos));
          S.later(function(){
            contentEl.all('.J_img').offset(pos);
          }, 230);
        }

      }

    },

    // 获取预览区域的大小
    _getPreviewBox: function(thumbW, thumbH){

      var host = this.host;
      var box = this.get('box');
      var imgW = box.img[0], imgH = box.img[1];
      var viewW = box.view[0], viewH = box.view[1];

    },

    pluginDestructor: function(){

    }
  }, {
    // 缩放比例，缩略图和图片实际显示比例
    zoom: { value: null },

    preview: { },

    position: {}

  });

  return Thumb;

}, {
  requires: ['node', 'base']
});

/**
 * Generated By grunt-kissy-template
 */
KISSY.add('gallery/albums/1.0/plugin/album-tpl',function(){
    return {"html":"<div class=\"handers\">\n  {{#if len !== 1}}\n  <span class=\"prev album-prev hander\">&lt;</span>   \n  <span class=\"next album-next hander\">&gt;</span>   \n  {{/if}}\n</div>\n<div class=\"box\">   \n\n  <div class=\"album-action-bar\">\n    <a class=\"album-big action\" data-action=\"zoom\" href=\"#nowhere\"></a>\n    <a class=\"album-small action\" data-action=\"zoom\" href=\"#nowhere\"></a>\n    <a class=\"rotation-pro action\" data-action=\"rotation-pro\" href=\"#nowhere\"></a>\n    <a class=\"rotation-con action\" data-action=\"rotation-con\" href=\"#nowhere\"></a>\n  </div>\n\n  <div class=\"album-preview-box\">\n    <img class=\"J_preivew_img\" src=\"{{src}}\" alt=\"\" />\n    <div class=\"album-thumb\"></div>\n  </div>\n\n  <div class=\"box-main album-loading\" style=\"height: {{h - 20}}px; {{#if w}}width: {{w}}px; {{/if}}\">  \n    {{#if download}}\n      <a href=\"{{download}}\"><img class=\"{{imgCls}}\" src=\"{{src}}\" alt=\"\" /></a>\n    {{else}}\n      <img class=\"{{imgCls}}\" src=\"{{src}}\" style=\"display: none\" alt=\"\" />\n    {{/if}}\n  </div>   \n  <div class=\"box-aside\" style=\"height: {{h}}px\">   \n    <div class=\"aside-wrap\">  \n      <div class=\"headline\"><em class=\"J_num num\">{{index + 1}}/{{len}}</em>{{title}} [<a class=\"action\" data-action=\"fullscreen\" href=\"#nowhere\">全屏</a>]\n      </div>  \n      {{#if desc}}\n      <p class=\"J_desc desc\">{{prefix}}: {{{desc}}}</p>  \n      {{/if}}\n    </div>   \n  </div>   \n</div>\n"};
});
KISSY.add('gallery/albums/1.0/plugin/theme',function(S, Node, Base, TPL, XTemplate){

  var HTML_BODY = new XTemplate(TPL.html);
  var dialog;
  var $ = Node.all;

  var Event = S.mix(S.EventTarget, {});

  function fullScreen(close) {
    if (!close && !document.fullscreenElement &&    // alternative standard method
        !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    }
  }

  S.Event.on(document, 'mozfullscreenchange webkitfullscreenchange fullscreenchange', function(){
    if (!document.webkitFullscreenElement && 
        !document.mozFullScreenElement && !document.fullscreenElement) {
      Event.fire('fullscreen:exit');
    }
  });

  function Theme(host, cfg){
    Theme.superclass.constructor.call(this, cfg);
    this.initializer(host);
  }

  S.extend(Theme, Base, {

    initializer: function(host){
      this.host = host;
      dialog = host.dialog;
      this._bind();
    },

    _bind: function(){
      var host = this.host;
      var id = host.get('id');
      // 鼠标点击出发事件
      dialog.on('action:' + id, this._action, this);
      dialog.on('close:' + id, this._exitFullsreen, this);

      host.on('resize', this._resize, this);

      Event.on('fullscreen:exit', function(){
        if (host.get('id') == dialog.get('album-id')){
          this._exitFullsreen();
        }
      }, this);
    },

    _resize: function(){

      var padding = this.get('padding');
      var viewH = dialog.getWinHeight() - padding[0] - padding[2];

      if (S.UA.ie === 6) {
        var viewW = dialog.getWinWidth() - padding[1] - padding[3];
        dialog.get('contentEl').all('.box-main').css({ width: viewW, height: viewH });
      } else {
        dialog.get('contentEl').all('.box-main').height(viewH);
      }

      dialog.get('contentEl').all('.box-aside').height(viewH + 20);

    },

    _action: function(e){
      var target = e.el;
      var action = $(target).attr('data-action');

      if (action === 'fullscreen') {
        this._fullscreen();
      }

    },

    // 推出全屏
    _exitFullsreen: function(){
      if (this._paddingBackup) {
        this.set('padding', this._paddingBackup);
        delete this._paddingBackup;
        dialog.get('el').removeClass('fullscreen');
        // 关闭fullscreen
        fullScreen(true);
      }
    },

    // 全屏查看
    _fullscreen: function(){
      //console.log(dialog);
      dialog.get('el').addClass('fullscreen');
      var padding = this.get('padding');
      var host = this.host;
      // 缓存老的
      this._paddingBackup = padding;
      this.set('padding', [10, 10, 10, 10]);
      fullScreen();
      host.go(0);
    },

    /**
     * @param {Node|HTMLElement} target 当前查看的图片
     * @param {object} cfg 配置参数
     */
    html: function(target, index){

      var data = this.get('data');

      var host = this.host;

      var viewH = dialog.getWinHeight() + 20;
      var viewW = dialog.getWinWidth();
      var padding = this.get('padding');

      var url = $(target).attr(host.get('origin'));
      var download = $(target).attr('data-download');

      if (!url) url = target.src;

      var len = host.get('len');

      var obj = {
        src: url,
        imgCls: 'J_img',
        index: index,
        len: len,
        h: viewH - padding[0] - padding[2],
        w: S.UA.ie === 6 ? viewW - padding[1] - padding[3] : null,
        desc: $(target).attr('data-desc') || '',
        download: download
      };

      S.mix(obj, data);
      return this.get('template').render(obj);
    },

    pluginDestructor: function(){

    }
  }, { ATTRS: {

    // 边距，和css的padding顺序一致，上左下右
    padding: { value: [ 47, 47 + 230, 47, 47] },

    // 模板
    template: { 
      value: HTML_BODY 
    },

    data: {
      value: {
        title: '查看图片',
        prefix: '图片说明'
      }
    }

  }});

  return Theme;

}, {
  requires: [
    'node', 
    'base',
    './album-tpl',
    'xtemplate',
    '../index.css'
  ]
});

/**
 * @fileoverview 
 * @author hanwen.sah<hanwen.sah@taobao.com>
 * @module albums
 **/
KISSY.add('gallery/albums/1.0/index',function (S, Node, Base, Overlay, Anim, dialog, rotate, Thumb) {

  var EMPTY = '';
  var $ = Node.all;

  /**
   * 请修改组件描述
   * @class Albums
   * @constructor
   * @extends Base
   */
  function Albums(comConfig) {
    var self = this;
    //调用父类构造函数
    Albums.superclass.constructor.call(self, comConfig);
    self.init();
  }

  function getNaturlWidth(el){
    if (el.prop('naturalWidth')) {
      return { 
        width: el.prop('naturalWidth'), 
        height: el.prop('naturalHeight') 
      };
    } else {
      var img = new Image();
      img.src = el.attr('src');
      return { 
        width: img.width, 
        height: img.height 
      };
    }
  }

  // @see http://www.sajithmr.me/javascript-check-an-image-is-loaded-or-not
  function isImageOk(img) {
    // During the onload event, IE correctly identifies any images that
    // weren’t downloaded as not complete. Others should too. Gecko-based
    // browsers act like NS4 in that they report this incorrectly.
    if (!img.complete) {
      return false;
    }

    // However, they do have two very useful properties: naturalWidth and
    // naturalHeight. These give the true size of the image. If it failed
    // to load, either of these should be zero.

    if (typeof img.naturalWidth != "undefined" && img.naturalWidth == 0) {
      return false;
    }

    // No other way of checking: assume it’s ok.
    return true;
  }
  

  S.extend(Albums, Base, /** @lends Albums.prototype*/{

    init: function(){

      var baseEl = this.get('baseEl');
      var theme = this.get('theme');

      if (!baseEl.length) return;
      //调用setter，传递一个参数1，本身没有意义，最终id会是通过guid生成的
      this.set('id', 1);

      dialog.render();

      this._bindEvent();
      this.dialog = dialog;

      this.plug(new Thumb);

      this._loadedImgs = {};

      // 初始化主题
      if (S.isString(theme)) {
        theme = S.require(theme);
        if (!theme) throw( new Error('Theme 没有定义'));
        this.set('theme', new theme(this));
      }

    },

    _setEls: function(){
      var baseEl = this.get('baseEl');
      var imgList = $(this.get('img'), baseEl);

      imgList.each(function(el, i){
        el.attr('data-index', i);
      });

      this.set('imgList', imgList);
      this.set('len', imgList.length);
      return imgList;
    },

    _bindEvent: function(){

      var baseEl = this.get('baseEl');
      var evt = this.get('trigger');
      var img = this.get('img');

      S.Event.delegate(baseEl, evt, img, this._show, this);

      var id = this.get('id');
      dialog.on('hander:' + id, this._go, this);
      dialog.on('action:' + id, this._action, this);
      dialog.on('resize:' + id, this._resize, this);
      dialog.on('turn:' + id, this._turn, this);

      var self = this;
      //键盘事件前进后退
      dialog.on('prev:' + id, function(){ self.go(-1); });
      dialog.on('next:' + id, function(){ self.go(1); });

      this.on('switch', this._hander, this);

    },

    /**
     * 放大缩小和旋转功能
     */
    _action: function(e){

      var target = e.el;
      var action = $(target).attr('data-action');

      if (action == 'rotation-con') {
        this._rotation(-90);
      } else if (action == 'rotation-pro') {
        this._rotation(90);
      } else if (action == 'zoom') {
        this._zoom($(target));
      }

    },

    //旋转图片
    _rotation: function(degree){

      var imgEl = dialog.get('contentEl').all('.J_img');
      var rotation = this.get('rotation');
      var scale = this.get('scale');

      rotation += parseInt(degree, 10);

      this.set('rotation', rotation);

      var css = rotate(rotation, scale);

      imgEl.css(css);

    },

    _resize: function(){
      var el = dialog.get('contentEl').all('.J_img');
      this.fire('resize');
      this._position(el, 1);
    },

    // 处理上一个和下一个
    _hander: function(e){

      var contentEl = dialog.get('contentEl');
      var hander = contentEl.all('.hander');

      if (e.from === 0) {
        hander.removeClass('step-start');
      }

      if (e.to === 0) {
        hander.addClass('step-start');
      }

      var len = this.get('len') - 1;
      if (e.to === len) {
        hander.addClass('step-last');
      }

      if (e.from === len) {
        hander.removeClass('step-last');
      }
    },

    _zoom: function(target){

      var el = dialog.get('contentEl').all('.J_img');
      var isBig = target.hasClass('album-big');
      this._zoomOut(el, isBig ? 0.2: -0.2);

    },

    // times 缩放倍数
    _zoomOut: function(el, times){

      var rotation = this.get('rotation');
      var scale = this.get('scale');

      // 获取图片尺寸
      var img = this.get('box').img;
      // 贮存老的缩放比例
      var scaleDiff = this.get('zoom');

      scale += times;

      if (scale < 1 && times > 0) scale = 1;
      if (scale < 1 && times < 0) scale = this.get('zoom');

      scaleDiff = (scale - scaleDiff) / 2;
      var css = rotate(rotation, scale);

      if (S.UA.ie < 9) {
        var position = this.get('position');
        css.left = position[0] - img[0] * scaleDiff;
        css.top = position[1] - img[1] * scaleDiff;
      }

      el.css(css);
      this.set('scale', scale);

      if (scale === this.get('zoom')) this._position(el, true);

    },

    //设置合适屏幕的位置
    _position: function(el, noAnim, callback){

      if (!el.data('loaded')) return;

      var box = getNaturlWidth(el);
      var padding = this.get('theme').get('padding');

      var viewH = dialog.getWinHeight() - padding[0] - padding[2];
      var viewW = dialog.getWinWidth() - padding[1] - padding[3];
      var h = box.height;
      var w = box.width;
      var top = 0, left = 0;
      var display = noAnim ? 'inline' : 'none';
      var css = {
        top: top, 
        left: left,
        position: 'relative',
        display: display
      };

      //适合缩放比例
      var zoom = 1;
      var ie = S.UA.ie;

      if (h > viewH || w > viewW) {

        if (h / viewH > w / viewW) {

          zoom = viewH / h;

          if (ie && ie < 9) {
            css.left = (viewW - w * zoom) / 2;
          } else {
            css.top = - (h - viewH) / 2;
            css.left = (viewW - w ) / 2;
          }

        } else {

          zoom = viewW / w;

          if (ie && ie < 9) {
            css.top = (viewH - h * zoom) / 2;
          } else {
            css.top = (viewH - h) / 2;
            css.left = - (w - viewW) / 2;
          }

        }

      } else {

        css.left = (viewW - w) / 2;
        css.top = (viewH - h) / 2;

      }

      if (!noAnim || noAnim === 1) {
        css = S.mix(rotate(0, zoom), css);
      }

      el.css(css);
      dialog.get('contentEl').all('.album-loading').removeClass('album-loading');
      if (!noAnim) {
        el.fadeIn(0.2, callback);
      }

      this.set('zoom', zoom);
      this.set('box', { view: [viewW, viewH], img: [w, h] } );
      this.set('position', [css.left, css.top]);
      this.set('scale', zoom);

      if (noAnim) callback && callback();
    },

    /**
     * 显示图片
     * @param {Node|string|HTMLElement} el
     */
    show: function(el, callback){
      var base = this.get('baseEl');
      this._show({ target: base.all(el)[0] }, callback);
    },

    //显示图片
    _show: function(evt, callback){

      this.set('rotation', 0);
      var target = evt.target;
      this._setEls();

      var index = $(target).attr('data-index');
      index = parseInt(index, 10);
      this.set('index', index);

      this._preLoadImg(index);

      dialog.set('bodyContent', this.get('theme').html(target, index));
      dialog.show();

      dialog.set('album-id', this.get('id'));

      var el = dialog.get('contentEl').all('.J_img');
      var self = this;

      if(isImageOk(el[0])) {

          el.data('loaded', true);
          self._position(el, null, callback);

      } else {

        el.data('loaded', false);
        el.on('load', function(){
          el.data('loaded', true);
          self._position(el, null, callback);
        });

      }
    },

    /**
     * 自动加载当前图片两边的图片
     */
    _preLoadImg: function(index){

      var imgList = this.get('imgList');
      var len = imgList.length - 1;
      var prev = index ? index - 1: len;
      var next = index == len ? 0 : index + 1;

      var origin = this.get('origin');

      var nowImg = imgList.item(index).attr(origin);
      var prevImg = imgList.item(prev).attr(origin);
      var nextImg = imgList.item(next).attr(origin);

      this._loadedImgs[nowImg] = true;

      this._loadImg(prevImg);
      this._loadImg(nextImg);

    },

    _loadImg: function(url){
      if (url && !this._loadedImgs[url]) {
        var img = new Image();
        img.src = url;
        img = null;
        this._loadedImgs[url] = true;
      }
    },

    /**
     * 移动步数，正数向前，负数向后
     */
    go: function(step, callback){

      step = parseInt(step, 10);
      this._setEls();
      
      var len = this.get('imgList').length;
      var index = this.get('index') + step;

      //边界值检测
      if (index === -1) index = len - 1;
      if (index === len) index = 0;

      if (index < 0 || index > len - 1) {
        return;
      }

      var baseEl = this.get('baseEl');
      var img = this.get('imgList').item(index);

      this._preLoadImg(step);

      this.fire('switch', {from: this.get('index'), to: index});
      this.show(img, function(){
        dialog.fire('change:step');
        callback && callback();
      });

    },

    _go: function(e){

      var target = $(e.el);
      var step = target.hasClass('prev') ? -1 : 1;
      this.go(step);

    },

    // 判断图片是否超出了视窗
    isOutBoundary: function(){
      var box = this.get('box');
      var scale = this.get('scale');
      return box.img[0] * scale > box.view[0] || box.img[1] * scale > box.view[1];
    },

    _turn: function(){
      if (!this.isOutBoundary()) {
        this.go(1);
      }
    }

  }, {ATTRS : /** @lends Albums*/{

    baseEl: {
      setter: function(el){
        return $(el);
      }
    },

    imgList: { value: null },

    // image selector
    img: { value: 'img' },

    len: { value: 0 },

    // trigger event of open imgView
    trigger: { value: 'click' },

    // 原始url地址，为空的情况，使用图片的src地址
    origin: { value: 'data-original-url' },

    index: { value: 0 },

    box: { value: {} },

    id: { setter: function(){ return S.guid(); }},

    //旋转角度
    rotation: { value: 0 },

    scale: { value: 1 },

    theme: { value: 'gallery/albums/1.0/plugin/theme' }

  }});

  return Albums;

}, {requires:[
  'node', 
  'rich-base', 
  'overlay',
  'anim',
  './dialog',
  './rotate',
  './plugin/thumb',
  './plugin/theme'
]});

