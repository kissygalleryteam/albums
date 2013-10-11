KISSY.add(function(S, Node, Base, TPL, XTemplate){

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
        dialog.get('contentEl').all('.box-main').css({ width: viewW, height: viewH - 20 });
      } else {
        dialog.get('contentEl').all('.box-main').height(viewH - 20);
      }

      dialog.get('contentEl').all('.box-aside').height(viewH);

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
    padding: { value: [ 47, 47 + 240, 47, 47] },

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
