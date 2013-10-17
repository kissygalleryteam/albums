KISSY.add(function(S, Albums){

  function getPics(callback){
    var url = 'http://api.flickr.com/services/rest/';
    var data = {
      method: 'flickr.photos.search',
      api_key: 'f0540914e6dbc6634166ded6e46e0beb',
      tags: 'rain',
      per_page: 8,
      format: 'json'
    };

    S.io({
      url: url,
      data: data,
      dataType: 'jsonp',
      jsonpCallback: 'jsonFlickrApi'
    }).then(function(argv){
      var ret = argv[0];
      if (ret.stat == 'fail') {
        callback(ret);
      } else {
        callback(null, ret.photos);
      }
    }).fail(function(e){
      callback(e, {});
    });
  }

  //getPics(function(err, json){

    //if (err) {
      //S.all('#sun-box').html(err.message || 'error happend, flickr get picture fail!');
      //return;
    //}

    //var html = '';
    //var tpl = 'http://farm{farm}.staticflickr.com/{server}/{id}_{secret}_{size}.jpg"';

    //S.each(json.photo, function(photo, i){

      //photo.size = 's';
      //var src = S.substitute(tpl, photo);
      //photo.size = 'b';
      //var original = S.substitute(tpl, photo);

      //html += S.substitute('<img id="rain-img-{index}" width=75 height=75 src="{src}" data-original-url="{original}" data-desc="{title}"/>', {
        //src: src,
        //original: original,
        //title: photo.title,
        //index: i
      //});

    //});

    //S.all('#rain-tag').html(html);
  //});
  var albums = new Albums({baseEl: '#rain-tag', img: 'img'});
  S.all('img', '#rain-tag').each(function(img){
    var imgEl = new Image()
    imgEl.src = img.attr('data-original-url')
    imgEl = null
  })

  // 等待5s，加载图片
  S.later(function(){
    window['album'] = albums;
    S.use('gallery/albums/1.0/spec/runner');
  }, 5000)

}, {
  requires: [
    '../index',
    'ajax'
  ]
})
