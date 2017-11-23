window.Herman=function(t,e){"use strict";const n={SPACE:32,ENTER:13,TAB:9,ESC:27,BACKSPACE:8,SHIFT:16,CTRL:17,ALT:18,CAPS:20,LEFT:37,UP:38,RIGHT:39,DOWN:40,DELETE:46,COMMA:44};t.initializeToggles=function(){const t=e("body");t.on("toggle:close",'[data-toggle="button"]',function(){const t=e(this).attr("aria-controls"),n=e(`[data-target-id="${t}"]`);e(`[data-toggle="button"][aria-controls="${t}"][aria-pressed="true"]`).attr("aria-pressed","false"),n.trigger("target:close")}),t.on("toggle:open",'[data-toggle="button"]',function(){const t=e(this),n=t.attr("aria-controls"),a=e(`[data-target-id="${n}"]`),o=e(`[data-toggle="button"][aria-controls="${n}"]`).not(t);t.data("toggle-synced")?o.filter('[data-toggle-synced="true"]').attr("aria-pressed","true"):o.filter('[aria-pressed="true"]').attr("aria-pressed","false"),t.attr("aria-pressed","true"),a.trigger("target:open")}),t.on("target:close",'[data-toggle="target"]',function(t){const n=e(this);e(t.target).is(n)&&n.attr("aria-expanded","false")});const n=function(t){const n=t.attr("data-target-id"),a=e(`[data-toggle="button"][aria-controls="${n}"][aria-pressed="true"]`);a.length?a.trigger("toggle:close"):t.trigger("target:close")};t.on("target:open",'[data-toggle="target"]',function(t){const n=e(this);e(t.target).is(n)&&n.attr("aria-expanded","true")}),t.on("click",'[data-toggle="button"]',function(t){t.preventDefault();const n=e(this);"true"===n.attr("aria-pressed")?n.trigger("toggle:close"):n.trigger("toggle:open")}),t.on("click",'[data-toggle="close"]',function(t){t.preventDefault();const a=e(`[data-target-id="${e(this).attr("aria-controls")}"]`);n(a)});t.on("click",t=>{e('[data-toggle="target"][aria-expanded="true"][data-auto-closing="true"]').each((a,o)=>{!function(t,e){const a=e.attr("data-target-id"),o=t.closest(`[aria-controls="${a}"]`).length,i=document.contains(t.get(0)),r=!t.closest(e).length,s=e.attr("data-auto-closing-exception"),c=!!s&&t.closest(s).length;!o&&(e.data("auto-closing-on-any-click")||i&&r&&!c)&&n(e)}(e(t.target),e(o))})})},t.initializeTabs=function(){const t=e("body"),a=function(t){const n=t.attr("data-tab-group");return e(`[role="tab"][data-tab-group="${n}"]`)},o=function(t){const n=t.attr("data-tab-group");return e(`[role="tabpanel"][data-tab-group="${n}"]`)},i=function(t){const e=a(t),n=o(t),i=n.filter(`[aria-labelledby="${t.attr("id")}"]`);t.attr({tabindex:0,"aria-selected":!0}),e.not(t).attr("tabindex",-1).removeAttr("aria-selected"),i.removeAttr("aria-hidden").trigger("visible"),n.not(i).attr("aria-hidden",!0),t.trigger("tab:active")};t.on("tabs:close",'[role="tab"]',function(){const t=e(this),n=a(t),i=o(t);n.attr("tabindex",-1).removeAttr("aria-selected"),i.attr("aria-hidden",!0)}),t.on("click",'[role="tab"]',function(t){t.preventDefault(),i(e(this))}),t.on("keydown",'[role="tab"]',function(t){const o=e(this),r=a(o),s=r.index(o);let c=s;switch(t.which){case n.LEFT:c=s>0?s-1:s;break;case n.RIGHT:c=s+1}const l=r.eq(c);s!==c&&l.length&&(i(l),l.focus())})},t.getUrlParams=(()=>window.deparam(window.location.search.substr(1))),t.initializeIframes=function(){const t=function(t){t.contentWindow.document.body&&(t.height=e(t.contentWindow.document).outerHeight(!0))},n=function(){e("iframe").each(function(){t(this)})};n(),e("iframe").on("load",function(){t(this)}),e(window).on("resize",n)};const a=function(t,n){!function(t,n){let a=e();if(t&&t.length)for(const n of t){if(!n.matches||!n.matches.length)return;const t={};for(const e of n.matches)if(e.indices&&e.indices.length){const n=e.indices.map(t=>({start:t[0],length:t[1]-t[0]+1}));t[e.key]=n}if(!t.title&&!t.contents)return;const o={url:`/${n.item.filename}`,title:n.item.title,contents:t.contents?n.item.contents:""},i=e(window.nunjucks.render("search_result.j2",o));if(t.title&&i.find('[data-result-field="title"]').markRanges(t.title),t.contents){const e=i.find('[data-result-field="contents"]');t.contents.sort((t,e)=>t.start-e.start),e.markRanges(t.contents.slice(0,5),{done:()=>{e.get(0).childNodes.forEach(t=>{const e=null!==t.previousSibling,n=null!==t.nextSibling;if("#text"===t.nodeName){const a=t.nodeValue.split(" ");e&&n?a.length>30&&a.splice(15,a.length-30,"…"):n?a.length>15&&a.splice(0,a.length-15,"…"):e&&a.length>15&&a.splice(15,a.length-15,"…"),t.nodeValue=a.join(" ")}})}})}a=a.add(i)}const o=e(window.nunjucks.render("search_results.j2",{term:n,count:a.length}));o.filter(".js-search-results").html(a),e('[data-sassdoc-region="main"]').html(o)}(new window.Fuse(t,{shouldSort:!0,tokenize:!0,matchAllTokens:!0,includeMatches:!0,threshold:.2,location:0,distance:1e3,minMatchCharLength:3,keys:["title","contents"]}).search(n),n)};return t.getSearchData=function(){const e=t.getUrlParams(),n=void 0!==window.Fuse,o=void 0!==window.nunjucks;if(e&&e.q&&n&&o){let t=new XMLHttpRequest;t.open("GET","/search-data.json",!0),t.onreadystatechange=function(){if(4===this.readyState){let t;if(this.status>=200&&this.status<400)try{t=JSON.parse(this.responseText)}catch(t){}a(t,e.q)}},t.send(),t=null}},t}(window.Herman||{},window.jQuery);