KISSY.add(function(S){

  var $ = S.all;

  describe('点击图片，弹窗窗口', function(){

    it('text should equal data in the model', function(){
      var img = $('#rain-img-0');
      var dialog = album.dialog;
      expect(dialog.get('visible')).to.be(false);

      img.fire('click');
      expect(dialog.get('visible')).to.be(true);
      expect(dialog.get('album-id')).to.be(album.get('id'));
    })

  });
})
