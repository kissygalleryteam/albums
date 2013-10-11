功能强大的图片查看器，通过一个浮出层，来完整的展示图片的组件。整体运行过程是，
用户点击图片，图片查看器出现，控制整个窗口，自动根据浏览器窗口显示图片，用户可以
对图片进行放大选择拖拽等行为操作。

- Version 1.0
- Author 翰文
- KISSY 1.3+
- Update 2013-10-11

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

*go(step)* `step` (Number)，向前或者向后几步，向后为负数。

### 事件

*switch* 图片切换事件

swicht事件对象返回切换前的index `from` 和切换后的index `to`

## 自定义主题

需要自定义主题，首先需要了解Albums的整体设计。文档后面再补上。
