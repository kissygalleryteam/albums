功能强大的图片查看器，通过一个浮出层，来完整的展示图片的组件。整体运行过程是，
用户点击图片，图片查看器出现，控制整个窗口，自动根据浏览器窗口显示图片，用户可以
对图片进行放大选择拖拽等行为操作。

[![Build Status](https://travis-ci.org/shepherdwind/albums.png?branch=master)](https://travis-ci.org/shepherdwind/albums), [spec](http://gallery.kissyui.com/albums/1.0/spec/index.html)

- Version 1.0
- Author 翰文
- Require KISSY 1.3+
- Support ie6+

<script src="http://a.tbcdn.cn/s/kissy/1.3.0/seed.js" charset="utf-8"></script>

首先看一个demo: 
<div id="sun-box"></div>
<br>

仿微博主题：
<div id="weibo-box"></div>

<style type="text/css">
.albums-dialog .headline .num {
  background-color: transparent;
  color: #333;
}
#weibo-box img,
#sun-box img {
  padding-right: 4px;
}
</style>

<script>

  var S = KISSY;
  if (S.Config.debug) {
    var srcPath = "../../../";
    S.config({
      packages:[
        {
          name: "gallery",
          path: srcPath,
          charset: "utf-8",
          ignorePackageNameInUri: true
        }
      ]
    });
  }

  function getPics(callback){
    var url = 'http://api.flickr.com/services/rest/';
    var data = {
      method: 'flickr.photos.search',
      api_key: 'f0540914e6dbc6634166ded6e46e0beb',
      tags: 'rain',
      per_page: 20,
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

  function getHtml(photos){

    var html = '';
    var tpl = 'http://farm{farm}.staticflickr.com/{server}/{id}_{secret}_{size}.jpg"';

    S.each(photos, function(photo){

      photo.size = 's';
      var src = S.substitute(tpl, photo);
      photo.size = 'b';
      var original = S.substitute(tpl, photo);

      html += S.substitute('<img src="{src}" data-original-url="{original}" data-desc="{title}"/>', {
        src: src,
        original: original,
        title: photo.title
      });

    });
    return html;
  }
KISSY.use('gallery/albums/1.0/index, ajax, gallery/albums/1.0/theme/weibo', function(S, Albums, io){
    getPics(function(err, json){
      if (err) {
        S.all('#sun-box').html(err.message || 'error happend, flickr get picture fail!');
        return;
      }

      if (json.photo && json.photo.length) {

        var html1 = getHtml(json.photo.slice(0, 10));
        S.all('#sun-box').html(html1);
        var albums = new Albums({baseEl: '#sun-box', img: 'img'});

        var html2 = getHtml(json.photo.slice(10));
        S.all('#weibo-box').html(html2);
        var albums = new Albums({
          baseEl: '#weibo-box',
          theme: 'gallery/albums/1.0/theme/weibo'
        });

      }

    });

});
</script>

## 使用方式

引入kissy seed
```html
<script src="http://a.tbcdn.cn/??s/kissy/1.3.0/seed-min.js"></script>
```

调用
```js
KISSY.use('gallery/albums/1.0/index', function (S, Albums) {
  var albums = new Albums({
    baseEl: '.albums-content'
  });
})
```

html结构如下
```html
<div class="albums-content">
  <img data-original-url="http://img01.daily.taobaocdn.net/refund/T1EBOzXn0dXXb1upjX.jpg" src="http://img03.daily.taobaocdn.net/refund/T1EBOzXn0dXXb1upjX_120x120.jpg" data-desc="hello world">
  <img data-original-url="http://img08.daily.taobaocdn.net/refund/T1NCuzXa0gXXb1upjX.jpg" src="http://img02.daily.taobaocdn.net/refund/T1NCuzXa0gXXb1upjX_120x120.jpg">
  <img data-original-url="http://img07.daily.taobaocdn.net/refund/T109KzXiBdXXb1upjX.jpg" src="http://img03.daily.taobaocdn.net/refund/T109KzXiBdXXb1upjX_120x120.jpg">
</div>
```

Albums继承自`KISSY.Base`，参数配置和大部分KISSY的组件配置方式保持一致。其中， 必
填的配置是`baseEl`，这个决定了图片查看器作用范围，其他参数都是选填的。上面的 例
子中，使用到了两个默认配置：

1. `img` 图片选择器，默认是选择baseEl下面所有的img，也可以传入其他比如：class选
   择器 对于albums而言，对html结构，不关心图片直接的组织关系，只关心有哪些图片，
   并且， 这些图片是可以动态变化的。点击图片显示图片查看器，点击通过代理到baseEl
   上实现。
2. `origin: data-original-url` 图片原始地址。通常情况下，图片首先看到的是一个小
   图， 图片查看器所看到的是另外一个大图，这个通过img的data-original-url属性来定
   位，这个 属性如果为空，则显示图片的src。

<hr class="smooth large" />

## API

构造器第一个参数用于配置参数: `new Albums(cfg)`

### 参数列表

*baseEl* (String|HTMLElement|KISSY.Node) 必选

根节点，决定图片集合的范围。同时事件绑定代理到baseEl上。

*img* (String) 

默认值`img`，图片选择器，通过这个选择器在baseEl中查找所有需要查看的图片。

*origin* (String)

默认值`data-original-url`。img节点的属性，决定了图片查看时显示的真实的地址(一般
情况下，html中首先展示的是缩略图)。如果origin所对应的属性不存在，使用图片本身的
src来定位。

*theme* (String)

主题配置，默认值`gallery/albums/1.0/plugin/theme`。如果需要写一个自己的主题，
可以配置这个参数，theme是一个KISSY的一个模块地址，需要能够通过`S.require(theme)`
来获取到对象。

### 对外方法

*show(imgEl, callback)*

参数:
1. imgEl, 必须 需要显示的图片，默认情况下，点击图片显示图片查看器，如果出发点不是图片
   本身，比如图片本遮盖了或者图片上一个放大的icon，可以通过show方法来某个图片。
2. callback 选填 回调方法

*go(step, callback)* 

参数：
1. `step` (Number)，向前或者向后几步，向后为负数。
2. `callback` (function) 回调函数，图片渲染完成后执行

### 事件

*switch* 图片切换事件

swicht事件对象返回切换前的index `from` 和切换后的index `to`

## 自定义主题

需要自定义主题，参考源码中的仿微博的主题。主题主要由3部分组成，以微博主题为例，
主要是3个文件：

1. theme/weibo.js 这个对象为入口文件，引用模板和样式
2. theme/weibo-tpl.html 这个是模板，模板最后需要打包成一个js文件
3. theme/css/weibo.less 只是样式文件，生成一个css

本页首页的微博主题初始化如下：

```js
KISSY.use('gallery/albums/1.0/index, gallery/albums/1.0/theme/weibo', function(Albums){
  new Albums({
    baseEl: '#weibo-box',
    theme: 'gallery/albums/1.0/theme/weibo'
  });
});
```

通过theme参数配置主题的包路径，需要注意的是，首先必须use(或者requires) theme对应的包。

### 主题模板

模板最外层是主题名，比如默认主题`default`，主题对应的最外层class名就是
`theme-default`。 并且这个样式名能够完全控制整个图片查看器的样式，这样也为了避免
多个主题同时存在的时候，样式冲突的问题。

通常情况下，使用box-main来放图片的容器，box-aside作为边栏图片相关信息。此外，
一个class为`action`的dom的点击事件，可以在主题中获取到，比如，图片放大的按钮：

```html
<a class="album-big action" data-action="zoom" href="#nowhere"></a>
```

主题js捕获事件如下：

```js
// 主题对象的host对象就是Album对象
var host = this.host;
var id = host.get('id');
// 鼠标点击出发事件
host.dialog.on('action:' + id, this._action, this);
```

获取到的是`action`事件，不过因为多个Album对象公用一个dialog，所以，当前激活的 只
有一个Album，这个Album的实例的id和dialog的album-id相等。action事件需要增加 一个
id在边上。

模板可以随意写，最好参考weibo-tpl或者default-tpl，唯一的约定是，图片必须 有一个
`J_img`的class。

### 主题对象

主题对象继承自Base，必须实现的两个方法是getZoom和html方法。

getZoom返回图片相对于图片容器的缩放比例和位置，需要注意的是，这里计算可能很复杂
，计算的时候使用的css3的scale来进行缩放，在高级浏览器中，scale缩放是以图片 中心
点缩放的，缩放会导致图片的位置偏移。而函数返回的offset是相对于图片容器(0, 0)位置
计算的，缩放后图片会相对于容易偏移一定的位置，这部分需要被减去。

html方法返回dialog对应的一段html代码，这个在点击图片，页面resize的时候，都会 执
行一遍。

### 主题样式

样式参考已有的改改就行。
