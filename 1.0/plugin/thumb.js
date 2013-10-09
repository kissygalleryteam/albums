KISSY.add(function(S, $, Base){

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
        distance: [0, 0],
        viewTop: scrollTop
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
      boundary.viewTop += padding[0];
      boundary.viewBottom = boundary.viewTop - (imgH - box.view[1]);

      //如果预览窗口高度大于缩略图高度
      if (preview.height > thumbH) {

        // top保持不变
        boundary.viewTop += (box.view[1] - imgH) / 2 + padding[0];
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
