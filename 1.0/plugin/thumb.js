KISSY.add(function(){

  var Thumb = {

    pluginId: 'thumb',

    pluginInitializer: function(host){
      this.host = host;
      this.dialog = host.dialog;
      this.contentEl = host.dialog.get('contentEl');

      this._bind();
    },

    _bind: function(){
      var host = this.host;
      host.on('afterScaleChange', function(e){
        if(host.get('zoom') < e.newVal) {
          this._position();
          var dd = this.dialog.startDD();
          dd.on('dragalign', this._proxy, this);

        } else {
          this._hide();
        }
      }, this);
    },

    // 拖拽代理手动实现
    _proxy: function(e){

      var zoom = this.zoom;
      //目标地址
      var pos = { left: e.left, top: e.top };

      var preview = {
        left: - 150 + (30 + 7 + 10 - pos.left) * zoom,
        top: - 150 + (30 + 7 + 10 - pos.top) * zoom,
      };

      var boundary = this.boundary;

      var outBoundary = false;

      if (pos.left < boundary.viewRight){
        pos.left = boundary.viewRight;
        preview.left = -150 + (30 + 7 + 10 - pos.left) * zoom;
        outBoundary = true;
      } else if (pos.left >= boundary.viewLeft) {
        pos.left = boundary.viewLeft;
        preview.left = -150;
        outBoundary = true;
      } 

      if (pos.top < boundary.viewBottom) {
        pos.top = boundary.viewBottom;
        //preview.top = boundary.top[1];
        preview.top = -150 + (30 + 7 + 10 - pos.top) * zoom;
        outBoundary = true;
      } else if (pos.top > boundary.viewTop) {
        pos.top = boundary.viewTop;
        //preview.top = boundary.top[0];
        preview.top = -150;
        outBoundary = true;
      }

      if ( outBoundary ) {
        e.drag.setInternal('actualPos', pos);
      }

      this.contentEl.all('.album-thumb').css(preview);
    },

    _hide: function(){
      var contentEl = this.dialog.get('contentEl');
      contentEl.all('.album-preview-box').css('visibility', 'hidden');
    },

    _position: function(box){

      var viewH = 150, viewW = 150;
      var host = this.host;
      var box = host.get('box');
      var contentEl = this.dialog.get('contentEl');

      //图片实际大小
      var imgW = box.img[0], imgH = box.img[1];
      //缩略图大小
      var thumbW, thumbH;

      var css = { top: 0, left: 0 };
      var zoom, preview;

      if (imgH / viewH > imgW / viewW) {

        thumbH = viewH;
        zoom = thumbH / imgH;
        thumbW = zoom * imgW;

        css.left = (viewW - thumbW) / 2;


      } else {

        thumbW = viewW;
        zoom = thumbW / imgW;
        thumbH = zoom * imgH;

        css.top = (viewH - thumbH) / 2;

      }

      var boundary = {
        left: [ -150 + css.left ],
        top: [ -150 + css.top ],
        distance: [0, 0]
      };

      preview = {
        width: zoom * box.view[0] / host.get('scale'),
        height: zoom * box.view[1] / host.get('scale')
      };
      
      var position = host.get('position');

      //如果预览窗口高度大于缩略图高度
      if (preview.height > thumbH) {

        // top保持不变
        boundary.viewTop = position[1] + 30 + 7 + 10;
        boundary.viewBottom = boundary.viewTop;

        boundary.viewLeft = 30 + 7 + 10;
        boundary.viewRight = boundary.viewLeft - (imgW - box.view[0]);

        boundary.distance[1] = (preview.height - thumbH);
        preview.top += boundary.distance[1] / 2;
        preview.height = thumbH;
      }

      //如果预览窗口宽度大于缩略图宽度
      if (preview.width > thumbW) {

        // left保持不变
        boundary.viewLeft = (box.view[0] - imgW * host.get('scale')) / 2 + 30 + 7 + 10;
        boundary.viewRight = boundary.viewLeft;

        // top offset
        boundary.viewTop = 30 + 7 + 10;
        boundary.viewBottom = boundary.viewTop - (imgH * host.get('scale') - box.view[1]);

        boundary.distance[0] = (preview.width - thumbW);
        preview.top += boundary.distance[0] / 2;
        preview.width = thumbW;
      }

      preview.left = boundary.left[0] + (thumbW - preview.width) / 2 ;
      preview.top = boundary.top[0] + (thumbH - preview.height) / 2;

      boundary.left[1] = boundary.left[0] + thumbW - preview.width;
      boundary.top[1] = boundary.top[0] + thumbH - preview.height;


      this.boundary = boundary;
      console.log(boundary);

      contentEl.all('.J_preivew_img').css(css);
      contentEl.all('.album-thumb').css(preview);
      contentEl.all('.album-preview-box').css('visibility', 'visible');
      this.preview = preview;
      this.zoom = zoom;

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
