KISSY.add(function(){

  var THUMB_WIDTH = 150;
  var THUMB_HEIGHT = 150;
  var Thumb = {

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

        if(host.get('zoom') < e.newVal) {

          this._position();
          var dd = this.dialog.startDD();
          dd.on('dragalign', this._proxy, this);
          this.drag = dd;

          this._hide();

        } else {

          this._hide(true);

        }
      }, this);
      
      var id = host.get('id');

      this.dialog.on('wheel:' + id, function(e){
        this._wheel(e.wheel);
      }, this);

    },

    // 滚动控制图片位移
    _wheel: function(wheel){

      if (this.host.get('scale') < 1) return;

      var offset = { left: 0, top: 0 };
      var _boundary = this._boundary;

      if (_boundary[1] == 'top' || _boundary[1] == 'bottom') {
        offset.left = wheel[1] * - 10;
      } else {
        offset.top = wheel[1] * - 10;
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
      var padding = host.get('padding');
      var scale = host.get('scale');

      var left = padding[3] + (box.view[0] - box.img[0] * scale) / 2;
      var top = padding[0] + (box.view[1] - box.img[1] * scale) / 2;

      return { left: left, top: top };
    },

    // 拖拽代理手动实现
    _proxy: function(e){

      var zoom = this.zoom;
      //目标地址
      var pos = { left: e.left, top: e.top };

      var boundary = this.boundary;

      var preview = {};
      var padding = this.host.get('padding');

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

      preview.top = - THUMB_HEIGHT + (padding[0] - pos.top) * zoom + boundary.distance[1];
      preview.left = - THUMB_WIDTH + (padding[3] - pos.left) * zoom + boundary.distance[0];

      if ( outBoundary ) {
        var drag = e.drag || this.drag;
        drag.setInternal('actualPos', pos);
      } else {
        this._boundaryStack('center');
      }

      this.position = pos;
      this.contentEl.all('.album-thumb').css(preview);

      this._hide();

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
        }, 2000);

        this.handle = handle;

      }
    },

    _position: function(box){

      var viewH = THUMB_HEIGHT, viewW = THUMB_WIDTH;
      var host = this.host;
      var box = host.get('box');
      var contentEl = this.dialog.get('contentEl');
      var scale = host.get('scale');
      var padding = host.get('padding');

      //图片实际大小
      var imgW = box.img[0] * scale, imgH = box.img[1] * scale;
      //缩略图大小
      var thumbW, thumbH;

      var css = { top: 0, left: 0 };
      var zoom, preview;

      var boundary = {
        distance: [0, 0]
      };

      if (imgH / viewH > imgW / viewW) {

        thumbH = viewH;
        zoom = thumbH / imgH;
        thumbW = zoom * imgW;

        boundary.distance[0] = (THUMB_WIDTH - thumbW) / 2;
        css.left = (viewW - thumbW) / 2;

      } else {

        thumbW = viewW;
        zoom = thumbW / imgW;
        thumbH = zoom * imgH;

        boundary.distance[1] = (THUMB_HEIGHT - thumbH) / 2;
        css.top = (viewH - thumbH) / 2;

      }


      preview = {
        width: zoom * box.view[0],
        height: zoom * box.view[1]
      };
      
      // left
      boundary.viewLeft = padding[3];
      boundary.viewRight = boundary.viewLeft - (imgW - box.view[0]);

      // top offset
      boundary.viewTop = padding[0];
      boundary.viewBottom = boundary.viewTop - (imgH - box.view[1]);

      //如果预览窗口高度大于缩略图高度
      if (preview.height > thumbH) {

        // top保持不变
        boundary.viewTop = (box.view[1] - imgH) / 2 + padding[0];
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

      this.boundary = boundary;
      //console.log(this.boundary);
      //console.log(preview);

      contentEl.all('.J_preivew_img').css(css);
      contentEl.all('.album-thumb').css(preview);
      this.preview = preview;
      this.zoom = zoom;
      this.position = null;

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
  };

  return Thumb;
});
