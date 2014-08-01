/**
 * Generated By grunt-kissy-template
 */
KISSY.add(function(){
    return {"html":"<div class=\"theme-box {{theme}}\">\r\n  <div class=\"theme-wrap\" style=\"height: {{h}}px\">\r\n    <div class=\"handers\">\r\n      {{#if len !== 1}}\r\n      <span class=\"prev album-prev hander\">&lt;</span>   \r\n      <span class=\"next album-next hander\">&gt;</span>   \r\n      {{/if}}\r\n    </div>\r\n    <div class=\"box\">   \r\n\r\n      <div class=\"box-main album-loading\" style=\"min-height: {{h}}px; {{#if w}}width: {{w}}px; {{/if}}\">  \r\n        <img class=\"{{imgCls}}\" src=\"{{src}}\" style=\"display: none\" alt=\"\" />\r\n      </div>   \r\n\r\n      <div class=\"box-aside\">   \r\n        <div class=\"aside-wrap\">  \r\n          <div class=\"headline\">\r\n            <em class=\"J_num num\">{{index + 1}}/{{len}}</em>{{title}} <a class=\"close action\" data-action=\"close\" href=\"#nowhere\">&times;</a>\r\n          </div>  \r\n          {{#if desc}}\r\n          <p class=\"J_desc desc\">{{prefix}}: {{{desc}}}</p>  \r\n          {{/if}}\r\n        </div>   \r\n      </div>   \r\n\r\n    </div>\r\n  </div>\r\n</div>\r\n"};
});