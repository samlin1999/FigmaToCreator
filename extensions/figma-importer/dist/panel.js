'use strict';

exports.template = `
<div class="panel">
  <h2>Figma 匯入</h2>
  <p class="desc">將 Figma Plugin 匯出的 IR JSON 與 PNG 放入 <code>assets/figma-import/</code> 後，選擇 JSON 產生 Prefab（產生時會依 MD5 自動合併重複貼圖並更新 IR）。</p>
  <ui-button class="btn-pick">選擇 IR JSON</ui-button>
  <div class="log"></div>
</div>
`;

exports.style = `
.panel { padding: 12px; }
h2 { font-size: 14px; margin-bottom: 8px; }
.desc { font-size: 12px; color: #888; margin-bottom: 12px; line-height: 1.5; }
ui-button { margin-right: 8px; margin-bottom: 8px; }
.log { margin-top: 12px; font-size: 11px; color: #666; white-space: pre-wrap; max-height: 200px; overflow: auto; }
`;

exports.$ = {
  btnPick: '.btn-pick',
  log: '.log',
};

exports.methods = {
  appendLog(text) {
    if (!this.$.log) return;
    this.$.log.innerHTML += text + '\\n';
  },
};

exports.ready = function () {
  if (!this.$.btnPick) {
    console.error('[figma-importer] Panel 元素初始化失敗');
    return;
  }

  this.$.btnPick.addEventListener('confirm', () => {
    Editor.Message.send('figma-importer', 'import-ir');
  });
};

exports.close = function () {};
