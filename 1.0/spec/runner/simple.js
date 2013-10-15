KISSY.add(function(S){

  var $ = S.all;

  describe('图片位置计算应该准确', function(){

    it('点击图片，图片查看器展示', function(){
      var img = $('#rain-img-0');
      var dialog = album.dialog;
      expect(dialog.get('visible')).to.be(false);

      img.fire('click');
      expect(dialog.get('visible')).to.be(true);
      expect(dialog.get('album-id')).to.be(album.get('id'));

      var dialogImg = dialog.get('contentEl').all('.J_img');
      expect(dialogImg.attr('src')).to.be(img.attr('data-original-url'));
      dialog.hide();
    })

    it('图片在查看器中，适应窗口宽度', function(){
    })

  });
})
