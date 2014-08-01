KISSY.add(function(S){

  var $ = S.all

  var dialog = album.dialog
  afterEach(function(){
    dialog.hide()
  })

  describe('图片位置计算', function(){

    it('点击图片，图片查看器展示', function(){
      var img = $('#rain-img-0')
      expect(dialog.get('visible')).to.be(false)

      img.fire('click')
      expect(dialog.get('visible')).to.be(true)
      expect(dialog.get('album-id')).to.be(album.get('id'))

      var dialogImg = dialog.get('contentEl').all('.J_img')
      expect(dialogImg.attr('src')).to.be(img.attr('data-original-url'))
    })

    function checkPosFix(img, imgBox, done){

      var viewBox = [S.DOM.viewportWidth(), S.DOM.viewportHeight()]

      expect(dialog.get('visible')).to.be(false)

      var padding = album.get('theme').get('padding')
      viewBox = [
        viewBox[0] - padding[1] - padding[3],
        viewBox[1] - padding[0] - padding[2]
      ]

      var left, top, zoom = 1;

      // 图片比可视区域大
      if (imgBox[0] > viewBox[0] || imgBox[1] > viewBox[1]) {
        // 宽度比高低超过更多
        if (imgBox[0] / viewBox[0] > imgBox[1] / viewBox[1]) {
          zoom = viewBox[0] / imgBox[0]
        } else {
          zoom = viewBox[1] / imgBox[1]
        }
      }

      left = (viewBox[0] - imgBox[0] * zoom) / 2 + padding[3]
      top = (viewBox[1] - imgBox[1] * zoom) / 2 + padding[0]

      album.show(img, function(){

        var offset = dialog.get('contentEl').all('.J_img').offset()
        dialog.hide()

        // 1px 之间
        expect(offset.left).within(left - 1, left + 1)
        expect(offset.top).within(top - 1, top + 1)
        expect(album.get('zoom')).to.be(zoom)

        done()
      })
    }

    it('查看第1张图片位置', function(done){
      var img = $('#rain-img-0')
      var imgBox = [1024, 683]
      checkPosFix(img, imgBox, done)
    })

    it('查看第2张图片位置', function(done){
      var img = $('#rain-img-1')
      var imgBox = [683, 1024]
      checkPosFix(img, imgBox, done)
    })

    it('查看第3张图片位置', function(done){
      var img = $('#rain-img-2')
      var imgBox = [900, 599]
      checkPosFix(img, imgBox, done)
    })

    it('查看第4张图片位置', function(done){
      var img = $('#rain-img-3')
      var imgBox = [440, 2869]
      checkPosFix(img, imgBox, done)
    })

  })

  describe('图片切换', function() {

    it('点击图片切换到下一张', function(done){
      var img = $('#rain-img-0')
      var contentEl = dialog.get('contentEl')

      album.show(img, function(){
        expect(album.get('index')).to.be(0)
        contentEl.all('.album-next').fire('click')
        expect(album.get('index')).to.be(1)
        contentEl.all('.album-prev').fire('click')
        expect(album.get('index')).to.be(0)
        done()
      })
    })

    it('album.go(1) 切换到下一张', function(done){
      var img = $('#rain-img-1')
      var contentEl = dialog.get('contentEl')
      album.set('index', 0)

      album.go(1, function(){
        expect(album.get('index')).to.be(1)
        expect(contentEl.all('.J_img').attr('src')).to.be(img.attr('data-original-url'))
        done()
      })

      expect(dialog.get('visible')).to.be(true)
    })

    it('album.go(-1) 切换到上一张', function(done){
      var img = $('#rain-img-7')
      var contentEl = dialog.get('contentEl')
      album.set('index', 0)

      album.go(-1, function(){
        // 跳转到最后一张
        expect(album.get('index')).to.be(7)
        expect(contentEl.all('.J_img').attr('src')).to.be(img.attr('data-original-url'))
        done()
      })

      expect(dialog.get('visible')).to.be(true)
    })

  })

  //describe('图片放大，全屏查看功能', function() {
  //})
})
