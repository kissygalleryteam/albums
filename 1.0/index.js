/**
 * @fileoverview 
 * @author hanwen.sah<hanwen.sah@taobao.com>
 * @module albums
 **/
KISSY.add(function (S, Node, Base, Overlay, Anim, dialog, rotate) {

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

      //this.plug(new Thumb);

      this._loadedImgs = {};

      // 初始化主题
      if (S.isString(theme)) {
        theme = S.require(theme);
        if (!theme) throw( new Error('Theme 没有定义'));
        this.set('theme', new theme(this));
      }

      this.fire('initialized');

    },

    hide: function(){
      dialog.hide();
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
      } else if (action == 'close') {
        dialog.hide();
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
      var theme = this.get('theme');
      var padding = theme.get('padding');

      var viewH = dialog.getWinHeight() - padding[0] - padding[2];
      var viewW = dialog.getWinWidth() - padding[1] - padding[3];
      var h = box.height;
      var w = box.width;

      var zoomAndPos = theme.getZoom(w, h, viewW, viewH);
      var display = noAnim ? 'inline' : 'none';

      var css = S.mix({
        position: 'relative',
        display: display
      }, zoomAndPos.offset);

      var zoom = zoomAndPos.zoom;

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
      if (!len) return;

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
      // add 1px for error possable
      return box.img[0] * scale > box.view[0] + 1|| 
        box.img[1] * scale > box.view[1] + 1;
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

    // 是否开启预览，如果ie 8一下，不开启
    preview: { value: S.UA.ie > 7 || !S.UA.ie },

    theme: { value: 'gallery/albums/1.0/theme/default' }

  }});

  return Albums;

}, {requires:[
  'node', 
  'rich-base', 
  'overlay',
  'anim',
  './dialog',
  './rotate',
  './theme/default'
]});
