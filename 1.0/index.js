/**
 * @fileoverview 
 * @author hanwen.sah<hanwen.sah@taobao.com>
 * @module albums
 **/
KISSY.add(function (S, Node, Base, Overlay, Anim, TPL, XTemplate, dialog, rotate) {

  var EMPTY = '';
  var $ = Node.all;

  var HTML_BODY = new XTemplate(TPL.html);

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

  S.extend(Albums, Base, /** @lends Albums.prototype*/{

    init: function(){

      var baseEl = this.get('baseEl');

      if (!baseEl.length) return;
      //调用setter，传递一个参数1，本身没有意义，最终id会是通过guid生成的
      this.set('id', 1);

      dialog.render();

      this._bindEvent();

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
      }
    },

    //旋转图片
    _rotation: function(degree){

      var imgEl = dialog.get('contentEl').all('.J_img');
      var rotation = this.get('rotation');
      var scale = this.get('scale');

      rotation += parseInt(degree, 10);
      //rotation = rotation % 360;

      this.set('rotation', rotation);

      var css = rotate(rotation, scale);

      imgEl.css(css);

    },

    _resize: function(){
      var el = dialog.get('contentEl').all('.J_img');
      var viewH = dialog.getWinHeight() - 74 - 20;
      dialog.get('contentEl').all('.box-main').height(viewH - 20);
      dialog.get('contentEl').all('.box-aside').height(viewH);
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

      if (isBig) {

        this._zoomOut(el);

      } else {

        var rotation = this.get('rotation');
        var zoomFit = this.get('zoomFit');
        var css = rotate(rotation, zoomFit);
        el.css(css);

        this.set('scale', zoomFit);
        this._position(el, true);

      }

    },

    _zoomOut: function(el){
      var rotation = this.get('rotation');
      var scale = this.get('scale');
      scale += 0.2;
      if (scale < 1) scale = 1;
      var css = rotate(rotation, scale);
      el.css(css);
      this.set('scale', scale);
    },

    //设置合适屏幕的位置
    _position: function(el, noAnim){

      if (!el.data('loaded')) return;

      var box = getNaturlWidth(el);

      var viewH = dialog.getWinHeight() - 74 - 20;
      var viewW = dialog.getWinWidth() - 74 - 235 - 20;
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
      var zoomFit = 1;

      if (h > viewH || w > viewW) {

        if (h / viewH > w / viewW) {
          zoomFit = viewH / h;
          css.top = - (h - viewH) / 2;
          css.left = (viewW - w ) / 2;
          //css.left = (viewW - w * zoomFit) / 2;
        } else {
          zoomFit = viewW / w;
          css.top = (viewH - h) / 2;
          css.left = - (w - viewW) / 2;
        }

      } else {

        css.left = (viewW - w) / 2;
        css.top = (viewH - h) / 2;

      }

      if (!noAnim || noAnim === 1) {
        css = S.mix(rotate(0, zoomFit), css);
      }

      el.css(css);
      dialog.get('contentEl').all('.album-loading').removeClass('album-loading');
      if (!noAnim) {
        el.fadeIn();
      }

      this.set('zoomFit', zoomFit);
      this.set('scale', zoomFit);
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
      var url = $(target).attr('data-original-url');

      var download = $(target).attr('data-download');

      if (!url) url = target.src;

      this._setEls();

      var index = $(target).attr('data-index');
      this.set('index', parseInt(index, 10));

      var len = this.get('len');
      var pos = + index + 1;

      var viewH = dialog.getWinHeight();
      var viewW = dialog.getWinWidth();

      var obj = {
        src: url,
        imgCls: 'J_img',
        index: +index,
        len: len,
        h: viewH - 74,
        desc: $(target).attr('data-desc') || '',
        download: download,
        title: this.get('title')
      };

      var html = this.get('template').render(S.mix(obj, this.get('datas')));

      dialog.set('bodyContent', html);
      dialog.show();

      dialog.set('album-id', this.get('id'));

      var el = dialog.get('contentEl').all('.J_img');
      var self = this;
      el.data('loaded', false);

      el.on('load', function(){
        el.data('loaded', true);
        self._position(el);
        callback && callback();
      });

    },

    next: function(){
    },

    /**
     * 移动步数，正数向前，负数向后
     */
    go: function(step){

      step = parseInt(step, 10);
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

      this.fire('switch', {from: this.get('index'), to: index});
      this.show(img, function(){
        dialog.fire('change:step');
      });
    },

    _go: function(e){

      var target = $(e.el);
      var step = target.hasClass('prev') ? -1 : 1;
      this.go(step);

    }

  }, {ATTRS : /** @lends Albums*/{

    baseEl: {
      setter: function(el){
        return $(el);
      }
    },

    imgList: { value: null },
    // image selector
    img: { value: '.J_ImgDD' },

    len: { value: 0},

    // trigger event of open imgView
    trigger: { value: 'click' },

    title: { value: '查看图片' },

    index: { value: 0 },

    datas: { 
      value: { prefix: "图片说明" }
    },

    template: { value: HTML_BODY },

    id: { setter: function(){ return S.guid(); }},

    //旋转角度
    rotation: { value: 0 },

    scale: { value: 1 }

  }});

  return Albums;

}, {requires:[
  'node', 
  'base', 
  'overlay',
  'anim',
  './album-tpl',
  'xtemplate',
  './dialog',
  './rotate',
  './index.css'
]});
