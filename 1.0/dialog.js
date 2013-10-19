KISSY.add(function(S, Overlay, DD){

  var drag;
  var dialog = new S.Dialog({
      width: '100%',
      elCls: 'albums-dialog'
  });

  var contentEl;
  //禁止滚动事件和隐藏滚轮
  dialog.on('beforeVisibleChange', function(e){

    if(e.prevVal) return;
    winBox = {}

    S.Event.on(document, 'mousewheel', function(e){
      var id = dialog.get('album-id');
      if (S.all(e.target).hasClass('.J_img')) {
        dialog.fire('wheel:' + id, { wheel: [e.deltaX || 0, e.deltaY || 0] });
        //e.halt();
      }
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
