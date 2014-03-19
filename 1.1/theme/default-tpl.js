/**
 * Generated By grunt-kissy-template
 */
KISSY.add(function(){
    return {"html":"<div class=\"theme-box {{theme}}\">\n  <div class=\"theme-wrap\">\n    <div class=\"handers\">\n      {{#if len!==1}}\n      <span class=\"prev album-prev hander\">&lt;</span>   \n      <span class=\"next album-next hander\">&gt;</span>   \n      {{/if}}\n    </div>\n    <div class=\"box\">   \n\n      <a class=\"close action\" data-action=\"close\" href=\"#nowhere\">&times;</a>\n\n      <div class=\"album-action-bar\">\n        <a class=\"album-big action\" data-action=\"zoom\" href=\"#nowhere\"></a>\n        <a class=\"album-small action\" data-action=\"zoom\" href=\"#nowhere\"></a>\n        <a class=\"rotation-pro action\" data-action=\"rotation-pro\" href=\"#nowhere\"></a>\n        <a class=\"rotation-con action\" data-action=\"rotation-con\" href=\"#nowhere\"></a>\n      </div>\n\n      <div class=\"album-preview-box\">\n        <img class=\"J_preivew_img\" src=\"{{src}}\" alt=\"\" />\n        <div class=\"album-thumb\"></div>\n      </div>\n\n      <div class=\"box-main album-loading\" style=\"height: {{h - 20}}px; {{#if w}}width: {{w}}px; {{/if}}\">\n        {{#if download}}\n          <a href=\"{{download}}\"><img class=\"{{imgCls}}\" src=\"{{src}}\" alt=\"\" /></a>\n        {{else}}\n          <img class=\"{{imgCls}}\" src=\"{{src}}\" style=\"display: none\" alt=\"\" />\n        {{/if}}\n      </div>   \n      <div class=\"box-aside\" style=\"height: {{h}}px\">   \n        <div class=\"aside-wrap\">  \n          <div class=\"headline\"><em class=\"J_num num\">{{index+1}}/{{len}}</em>{{title}}\n            [<a class=\"action\" data-action=\"fullscreen\" href=\"#nowhere\">全屏</a>]\n          </div>  \n          {{#if desc}}\n          <p class=\"J_desc desc\">{{prefix}}: {{{desc}}}</p>  \n          {{/if}}\n        </div>   \n      </div>   \n    </div>\n  </div>\n</div>\n"};
});