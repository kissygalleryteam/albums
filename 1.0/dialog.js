KISSY.add(function(S, Overlay, DD){

  var drag;
  var dialog = new S.Dialog({
      width: '100%',
      height: '100%',
      elCls: 'albums-dialog'
  });

  var contentEl;
  //禁止滚动事件和隐藏滚轮
  dialog.on('show', function(){

    S.Event.on(window, 'mousewheel', function(e){
      e.halt();
    })
    S.all('html').css('overflow-y', 'hidden')

    renderDD();

  });

  function renderDD(){

    drag && drag.destroy();

    drag = new DD.Draggable({
      node: contentEl.all('.J_img'),
      move: true
    });

  }

  //恢复滚动和滚轮
  dialog.on('hide', function(){

    S.Event.detach(window, 'mousewheel');
    S.all('html').css('overflow-y', 'auto')

  });

  dialog.on('change:step', renderDD);

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

  //dom渲染完成后
  dialog.on('afterRenderUI', function(){

    contentEl = dialog.get('contentEl');

    contentEl.delegate('click', '.hander', distribution('hander'));

    contentEl.delegate('click', '.action', distribution('action'));

    var hander;

    S.Event.on(window, 'resize', function(){
        if (dialog.get('visible')) {
          hander && hander.cancel();

          hander = S.later(function(){
            winBox = {};
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


  });

  return dialog;

}, {
  requires: [ 'overlay', 'dd' ]
});
