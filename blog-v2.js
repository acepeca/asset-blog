/*!
 * blog.js untuk aceppp.net (Carpe diem)
 * Dipanggil dari template Blogger lewat jsDelivr:
 *   https://cdn.jsdelivr.net/gh/acepeca/asset-blog/blog-v2.js
 * Isi: tabel "|", link $TICKER ke TradingView, pewarnaan kode.
 * TETAP di template: penanda widget berlatar (*), Previous Posts,
 *      urutan sidebar, widget lipat di HP.
 */

/* Tabel: baris diawali | (ditulis di Compose) atau pre.tabel jadi tabel; baris pertama = judul kolom */
(function tabelFn() {
  var NUM = /^[+\-−]?(Rp\s?|\$)?[\d.,]+\s?(%|[KkMmBbTt]|jt|rb)?$/;
  var SEP = /^\|?[\s:|-]+\|?$/;
  var BLOCK = /^(P|DIV|UL|OL|LI|TABLE|PRE|H[1-6]|BLOCKQUOTE|HR|IMG|IFRAME)$/;
  function clean(t) { return (t || '').replace(/ /g, ' ').trim(); }
  function isRow(t) { t = clean(t); return t.charAt(0) === '|' && t.length > 1; }
  function build(lines) {
    var rows = [];
    for (var j = 0; j < lines.length; j++) {
      var line = clean(lines[j]);
      if (!line || (SEP.test(line) && line.indexOf('-') >= 0)) continue;
      line = line.replace(/^\|/, '').replace(/\|$/, '');
      var cells = line.split('|');
      for (var k = 0; k < cells.length; k++) cells[k] = cells[k].trim();
      rows.push(cells);
    }
    if (!rows.length) return null;
    var cols = 0;
    for (var j = 0; j < rows.length; j++) cols = Math.max(cols, rows[j].length);
    var num = [];
    for (var c = 0; c < cols; c++) {
      var any = false, all = true;
      for (var r = 1; r < rows.length; r++) {
        var v = rows[r][c] || '';
        if (!v) continue;
        any = true;
        if (!NUM.test(v)) all = false;
      }
      num[c] = any && all;
    }
    var table = document.createElement('table');
    table.className = 'tabel';
    var thead = document.createElement('thead'), tbody = document.createElement('tbody');
    for (var r = 0; r < rows.length; r++) {
      var tr = document.createElement('tr');
      for (var c = 0; c < cols; c++) {
        var cell = document.createElement(r === 0 ? 'th' : 'td');
        cell.textContent = rows[r][c] || '';
        if (num[c]) cell.className = 'num';
        tr.appendChild(cell);
      }
      (r === 0 ? thead : tbody).appendChild(tr);
    }
    table.appendChild(thead);
    if (rows.length > 1) table.appendChild(tbody);
    var wrap = document.createElement('div');
    wrap.className = 'tabel-wrap';
    wrap.appendChild(table);
    return wrap;
  }
  function skip(el) { return el.closest && el.closest('pre, table, .tabel-wrap, code'); }

  var bodies = document.querySelectorAll('.post-body');
  for (var b = 0; b < bodies.length; b++) {
    var body = bodies[b];

    var pres = body.querySelectorAll('pre.tabel, pre.table');
    for (var i = 0; i < pres.length; i++) {
      var pre = pres[i];
      var brs = pre.querySelectorAll('br');
      for (var j = 0; j < brs.length; j++) brs[j].parentNode.replaceChild(document.createTextNode('\n'), brs[j]);
      var w = build(pre.textContent.split('\n'));
      if (w) pre.parentNode.replaceChild(w, pre);
    }

    var conts = [body].concat(Array.prototype.slice.call(body.querySelectorAll('p, div')));
    for (var i = 0; i < conts.length; i++) {
      var box = conts[i];
      if (box !== body && skip(box)) continue;
      var lines = [], cur = { nodes: [], text: '' };
      var kids = Array.prototype.slice.call(box.childNodes);
      for (var j = 0; j < kids.length; j++) {
        var n = kids[j];
        if (n.nodeType === 1 && n.tagName === 'BR') { cur.nodes.push(n); lines.push(cur); cur = { nodes: [], text: '' }; }
        else if (n.nodeType === 1 && BLOCK.test(n.tagName)) { lines.push(cur); lines.push(null); cur = { nodes: [], text: '' }; }
        else { cur.nodes.push(n); cur.text += n.textContent; }
      }
      lines.push(cur);
      var run = [];
      var flush = function () {
        if (run.length >= 2) {
          var texts = [];
          for (var q = 0; q < run.length; q++) texts.push(run[q].text);
          var w = build(texts);
          if (w) {
            var first = run[0].nodes[0];
            first.parentNode.insertBefore(w, first);
            for (var q = 0; q < run.length; q++)
              for (var z = 0; z < run[q].nodes.length; z++) {
                var nd = run[q].nodes[z];
                if (nd.parentNode) nd.parentNode.removeChild(nd);
              }
          }
        }
        run = [];
      };
      for (var j = 0; j < lines.length; j++) {
        var L = lines[j];
        if (L && isRow(L.text)) run.push(L);
        else if (L && !clean(L.text) && run.length && !L.nodes.some(function (x) { return x.nodeType === 1 && x.tagName !== 'BR'; })) continue;
        else flush();
      }
      flush();
    }

    var blocks = body.querySelectorAll('p, div');
    var done = [];
    for (var i = 0; i < blocks.length; i++) {
      var el = blocks[i];
      if (done.indexOf(el) >= 0 || skip(el) || el.querySelector('p, div, br') || !isRow(el.textContent)) continue;
      var group = [el], nx = el.nextElementSibling;
      while (nx && /^(P|DIV)$/.test(nx.tagName) && !nx.querySelector('p, div') && isRow(nx.textContent)) { group.push(nx); nx = nx.nextElementSibling; }
      if (group.length < 2) continue;
      var texts = [];
      for (var q = 0; q < group.length; q++) { texts.push(group[q].textContent); done.push(group[q]); }
      var w = build(texts);
      if (!w) continue;
      group[0].parentNode.insertBefore(w, group[0]);
      for (var q = 0; q < group.length; q++) group[q].parentNode.removeChild(group[q]);
    }
  }
})();

/* Simbol: $INDF, $EURUSD, $NASDAQ:AAPL jadi link chart TradingView (4 huruf = IDX) */
(function tickerFn() {
  var RE = /(^|[^\w$])\$((?:[A-Z][A-Z0-9_]{1,11}:)?[A-Z][A-Z0-9.!]{0,10}[A-Z0-9])(?![\w])/g;
  function target(sym) {
    if (sym.indexOf(':') >= 0) return sym;
    if (/^[A-Z]{4}$/.test(sym)) return 'IDX:' + sym;
    return sym;
  }
  var bodies = document.querySelectorAll('.post-body');
  for (var b = 0; b < bodies.length; b++) {
    var walker = document.createTreeWalker(bodies[b], NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (n.nodeValue.indexOf('$') < 0) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode;
        if (p.closest && p.closest('a, pre, code, script, style, textarea')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    for (var i = 0; i < nodes.length; i++) {
      var text = nodes[i].nodeValue, last = 0, m, frag = null;
      RE.lastIndex = 0;
      while ((m = RE.exec(text))) {
        if (!frag) frag = document.createDocumentFragment();
        var start = m.index + m[1].length;
        frag.appendChild(document.createTextNode(text.slice(last, start)));
        var a = document.createElement('a');
        a.className = 'ticker';
        a.href = 'https://www.tradingview.com/chart/?symbol=' + encodeURIComponent(target(m[2]));
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = '$' + m[2];
        frag.appendChild(a);
        last = start + 1 + m[2].length;
      }
      if (frag) {
        frag.appendChild(document.createTextNode(text.slice(last)));
        nodes[i].parentNode.replaceChild(frag, nodes[i]);
      }
    }
  }
})();

/* Pewarnaan kode: highlight.js dimuat hanya jika ada <pre> di postingan */
(function () {
  var blocks = document.querySelectorAll('.post-body pre');
  if (!blocks.length) return;
  for (var i = 0; i < blocks.length; i++) {
    var pre = blocks[i];
    var el = pre.querySelector('code') || pre;
    /* editor Blogger kadang memakai <br> untuk baris baru */
    var brs = el.querySelectorAll('br');
    for (var j = 0; j < brs.length; j++) brs[j].parentNode.replaceChild(document.createTextNode('\n'), brs[j]);
    el.textContent = el.textContent.replace(/\s+$/, '');
    /* tanpa nama bahasa: anggap C++ (MQL/Pine mirip C) */
    var lang = /(?:language|lang)-([\w+#-]+)/.exec(el.className + ' ' + pre.className);
    if (el !== pre) el.className = 'language-' + (lang ? lang[1] : 'cpp');
    else if (!lang) pre.classList.add('language-cpp');
  }
  var s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
  s.onload = function () {
    if (!window.hljs) return;
    hljs.configure({ ignoreUnescapedHTML: true });
    for (var i = 0; i < blocks.length; i++) {
      hljs.highlightElement(blocks[i].querySelector('code') || blocks[i]);
    }
  };
  document.body.appendChild(s);
})();
