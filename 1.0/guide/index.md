## 综述

图片查看器

## 组件快速使用

```html
<div class="albums-content">
  <img class="J_ImgDD" data-original-url="http://img01.daily.taobaocdn.net/refund/T1EBOzXn0dXXb1upjX.jpg" src="http://img03.daily.taobaocdn.net/refund/T1EBOzXn0dXXb1upjX_120x120.jpg" data-desc="hello world">
  <img class="J_ImgDD" data-original-url="http://img08.daily.taobaocdn.net/refund/T1NCuzXa0gXXb1upjX.jpg" src="http://img02.daily.taobaocdn.net/refund/T1NCuzXa0gXXb1upjX_120x120.jpg">
  <img class="J_ImgDD" data-original-url="http://img07.daily.taobaocdn.net/refund/T109KzXiBdXXb1upjX.jpg" src="http://img03.daily.taobaocdn.net/refund/T109KzXiBdXXb1upjX_120x120.jpg">
  <img class="J_ImgDD" data-original-url="http://img04.daily.taobaocdn.net/refund/T1FCuzXXpfXXb1upjX.jpg" src="http://img05.daily.taobaocdn.net/refund/T1FCuzXXpfXXb1upjX_120x120.jpg">
  <img class="J_ImgDD" data-original-url="http://img03.daily.taobaocdn.net/refund/T1Z6CzXn4hXXb1upjX.jpg" src="http://img03.daily.taobaocdn.net/refund/T1Z6CzXn4hXXb1upjX_120x120.jpg">
  <img class="J_ImgDD" data-original-url="http://img08.daily.taobaocdn.net/refund/T1M95zXhFaXXb1upjX.jpg" src="http://img08.daily.taobaocdn.net/refund/T1M95zXhFaXXb1upjX_120x120.jpg">
  <img class="J_ImgDD" data-original-url="http://img03.daily.taobaocdn.net/refund/T1WRCzXjtdXXb1upjX.jpg" src="http://img01.daily.taobaocdn.net/refund/T1WRCzXjtdXXb1upjX_120x120.jpg">
</div>
```

```js
KISSY.use('gallery/albums/1.0/index', function (S, Albums) {
  var albums = new Albums({
    baseEl: '.albums-content'
  });
})
```
