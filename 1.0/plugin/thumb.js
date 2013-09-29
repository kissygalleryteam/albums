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
      var pos = { left: e.left, top: e.top };

      var left = e.left * zoom;
      var top = e.top * zoom;
      var preview = {
        left: this.preview.left,
        top: this.preview.top
      }
      preview.left -= left;
      preview.top -= top;

      var boundary = this.boundary;

      var outBoundary = false;

      if (preview.left > boundary.left[1]){
        // left值减去超过的边界，比例是zoom
        pos.left += (preview.left - boundary.left[1]) / zoom;
        preview.left = boundary.left[1];
        outBoundary = true;
      } else if (preview.left < boundary.left[0]) {
        pos.left += (preview.left - boundary.left[0]) / zoom;
        preview.left = boundary.left[0];
        outBoundary = true;
      } 

      if (preview.top > boundary.top[1]) {
        pos.top += (preview.top - boundary.top[1]) / zoom;
        preview.top = boundary.top[1];
        outBoundary = true;
      } else if (preview.top < boundary.top[0]) {
        pos.top += (preview.top - boundary.top[0]) / zoom;
        preview.top = boundary.top[0];
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

        //this._getPreviewBox(thumbW, thumbH);
        css.top = (viewH - thumbH) / 2;

      }

      var boundary = {
        left: [ -150 + css.left ],
        top: [ -150 + css.top ]
      };

      preview = {
        width: zoom * box.view[0] / host.get('scale'),
        height: zoom * box.view[1] / host.get('scale')
      };

      preview.left = boundary.left[0] + (thumbW - preview.width) / 2 ;
      preview.top = boundary.top[0] + (thumbH - preview.height) / 2;

      boundary.left[1] = boundary.left[0] + thumbW - preview.width;
      boundary.top[1] = boundary.top[0] + thumbH - preview.height;


      this.boundary = boundary;
      console.log(boundary);

      var contentEl = this.dialog.get('contentEl');
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
