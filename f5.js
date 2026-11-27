/*!
 * footnote.js untuk aceppp.net (Carpe diem)
 * Dipanggil dari template Blogger lewat jsDelivr:
 *   https://cdn.jsdelivr.net/gh/acepeca/asset-blog/f5.js
 *
 * Cara menulis di Compose:
 *   Kalimat biasa[f]Isi catatan kaki.[/f] lalu kalimat berlanjut.
 *
 * Hasil: angka kecil (1, 2, 3, ...) di teks, daftar catatan di akhir
 * postingan, dan tanda ↩ untuk kembali ke kalimat semula.
 * Isi di dalam <pre> (blok kode) tidak diubah.
 */
(function () {
  var css =
    '.post-body sup.fn-ref{font-size:.7em;line-height:0;vertical-align:super;margin-left:1px}' +
    '.post-body sup.fn-ref a,.post-body sup.fn-ref a:visited{color:#0000EE;text-decoration:none}' +
    '.post-body sup.fn-ref a:hover{text-decoration:underline}' +
    '.post-body .footnotes{margin-top:2.5em;font-size:1em;line-height:1.6;color:#000}' +
    '.post-body .footnotes .fn-title{margin:0 0 .6em;font-weight:bold}' +
    '.post-body .footnotes ol{margin:0;padding-left:1.6em}' +
    '.post-body .footnotes li{margin:0 0 .4em;color:#000}' +
    '.post-body .footnotes li::marker{color:#000}' +
    '.post-body .footnotes a.fn-back,.post-body .footnotes a.fn-back:visited{color:#0000EE;text-decoration:underline;margin-left:4px}' +
    '@keyframes fnfade{0%{background:#E6E6E6}100%{background:transparent}}' +
    '.post-body .footnotes li:target,.post-body sup.fn-ref:target{animation:fnfade 2s ease-out}';
  var st = document.createElement('style');
  st.appendChild(document.createTextNode(css));
  document.head.appendChild(st);

  var re = /\[f\]([\s\S]*?)\[\/f\]/gi;
  var bodies = document.querySelectorAll('.post-body');
  for (var p = 0; p < bodies.length; p++) {
    var body = bodies[p];
    if (!/\[f\]/i.test(body.innerHTML)) continue;

    var notes = [];
    var id = 'p' + (p + 1);
    // pisahkan blok <pre>...</pre> agar tidak ikut diproses
    var parts = body.innerHTML.split(/(<pre[\s\S]*?<\/pre>)/i);
    for (var k = 0; k < parts.length; k++) {
      if (/^<pre/i.test(parts[k])) continue;
      parts[k] = parts[k].replace(re, function (m, isi) {
        var n = notes.length + 1;
        notes.push(isi.trim());
        return '<sup class="fn-ref" id="fnref-' + id + '-' + n + '">' +
          '<a href="#fn-' + id + '-' + n + '">[' + n + ']</a></sup>';
      });
    }
    if (!notes.length) continue;

    var html = '<div class="footnotes"><p class="fn-title">Footnotes:</p><ol>';
    for (var i = 0; i < notes.length; i++) {
      var n2 = i + 1;
      html += '<li id="fn-' + id + '-' + n2 + '">' + notes[i] +
        ' <a class="fn-back" href="#fnref-' + id + '-' + n2 + '" title="Kembali">↩︎</a></li>';
    }
    html += '</ol></div>';
    body.innerHTML = parts.join('') + html;
  }
})();
