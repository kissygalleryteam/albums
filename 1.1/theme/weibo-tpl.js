/**
 * Generated By grunt-kissy-template
 */
KISSY.add(function(){
    return {"html":"<div class=\"theme-box {{theme}}\">\n  <div class=\"theme-wrap\" style=\"height: {{h}}px\">\n    <div class=\"handers\">\n      {{#if len!==1}}\n      <span class=\"prev album-prev hander\">&lt;</span>   \n      <span class=\"next album-next hander\">&gt;</span>   \n      {{/if}}\n    </div>\n    <div class=\"box\">   \n\n      <div class=\"box-main album-loading\" style=\"min-height: {{h}}px; {{#if w}}width: {{w}}px; {{/if}}\">  \n        <img class=\"{{imgCls}}\" src=\"{{src}}\" style=\"display: none\" alt=\"\" />\n      </div>   \n\n      <div class=\"box-aside\">   \n        <div class=\"aside-wrap\">  \n          <div class=\"headline\">\n            <em class=\"J_num num\">{{index+1}}/{{len}}</em>{{title}} <a class=\"close action\" data-action=\"close\" href=\"#nowhere\">&times;</a>\n          </div>  \n          {{#if desc}}\n          <p class=\"J_desc desc\">{{prefix}}: {{{desc}}}</p>  \n          {{/if}}\n        </div>   \n      </div>   \n\n    </div>\n  </div>\n</div>\n"};
});