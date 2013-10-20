KISSY.add(function(S, Node, Base, TPL, XTemplate){

  var HTML_BODY = new XTemplate(TPL.html);
  var dialog;
  var $ = Node.all;

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
      dialog.on('turn:' + id, function(){
        host.go(1);
      });

      host.on('resize', this._resize, this);
    },

    _resize: function(){

      var padding = this.get('padding');
      var viewH = dialog.getWinHeight() - padding[0] - padding[2];
      dialog.get('contentEl').all('.theme-wrap').height(viewH);
      dialog.get('contentEl').all('.box-main').css('min-height', viewH);

    },

    _action: function(e){
      //var target = e.el;
      //var action = $(target).attr('data-action');
    },

    /**
     * 获取合适的对比比例，比较图片大小和可视区域大小，如果可视区域小于窗口 大小
     * ，根据高宽比，对图片进行缩放，返回图片缩放比例和图片位置，相对于可视 窗口
     * 的相对位置
     * @param {number} w 图片宽度
     * @param {number} h 图片高度
     * @param {number} viewW 图片框宽度度
     * @param {number} viewH 图片框宽高度
     * @return {object}
     *  zoom {number} 缩放比例
     *  offset {object} 图片相对位置
     *    left {number} 左边位置
     *    top {number} 上边位置
     */
    getZoom: function(w, h, viewW, viewH){

      var offset = { top: 0, left: 0 };
      //适合缩放比例
      var zoom = 1;
      var ie = S.UA.ie;

      // 如果图片宽度大于视窗宽度
      if (w > viewW) {
        zoom = viewW / w;
        offset.left = - (w - viewW) / 2;
        offset.top = (h * zoom > viewH) ? (- h * ( 1 - zoom) / 2 ): 0;
      }  else {
        offset.left = (viewW - w * zoom) / 2;
      }

      if (h < viewH) {
        offset.top = (viewH - h) / 2;
      } else {
        offset.left -= 5;
      }

      if (zoom < 1) {
        dialog.get('contentEl').all('.box-main').css('height', h * zoom);
      }

      return {
        zoom: zoom,
        offset: offset
      };

    },

    /**
     * @param {Node|HTMLElement} target 当前查看的图片
     * @param {object} cfg 配置参数
     */
    html: function(target, index){

      var data = this.get('data');

      var host = this.host;

      var viewH = dialog.getWinHeight();
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
        theme: 'theme-' + this.get('name'),
        download: download
      };

      S.mix(obj, data);
      return this.get('template').render(obj);
    }

  }, { ATTRS: {

    // 边距，和css的padding顺序一致，上左下右
    padding: { value: [ 20, 20 + 230, 20, 20 ] },

    name: { value: 'weibo' },

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
    './weibo-tpl',
    'xtemplate',
    './css/weibo.css'
  ]
});
