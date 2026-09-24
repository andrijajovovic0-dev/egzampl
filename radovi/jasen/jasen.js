/* Jasen — interakcije: skica/gotovo, horizontalni niz radova, upit, galerija sa filterom i lightbox. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- skica / gotovo ---------- */
  document.querySelectorAll('.poredi').forEach(function (p) {
    var r = p.querySelector('input');
    var set = function () { p.style.setProperty('--x', r.value + '%'); };
    r.addEventListener('input', set); set();
  });

  /* ---------- horizontalni niz (desktop, pin dok se skroluje) ---------- */
  var niz = document.querySelector('.niz');
  var sek = document.querySelector('.niz-sek');
  function pinuj() {
    if (!niz || !sek || reduce || !window.gsap || !window.ScrollTrigger) return;
    var mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', function () {
      niz.classList.add('pin');
      var put = function () { return Math.max(0, niz.scrollWidth - niz.parentElement.clientWidth); };
      var tw = gsap.to(niz, { x: function () { return -put(); }, ease: 'none',
        scrollTrigger: { trigger: sek, start: 'center center', end: function () { return '+=' + put(); },
          pin: true, scrub: 0.6, invalidateOnRefresh: true } });
      return function () { niz.classList.remove('pin'); tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); gsap.set(niz, { x: 0 }); };
    });
  }
  if (document.readyState === 'complete') pinuj(); else window.addEventListener('load', pinuj);

  /* ---------- upit: prikaz poruke koja bi stigla vlasniku ---------- */
  var f = document.getElementById('upit-forma');
  if (f) f.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = function (n) { var el = f.elements[n]; return el ? (el.value || '').trim() : ''; };
    var vrsta = (f.querySelector('[name=vrsta]:checked') || {}).value || 'nije izabrano';
    var ime = v('ime'), tel = v('tel');
    var st = document.getElementById('upit-status');
    if (!ime || !tel) { st.textContent = 'Upišite ime i telefon da bismo mogli da vam se javimo.'; st.hidden = false; return; }
    st.hidden = true;
    var poruka = 'Upit sa sajta — Jasen\nŠta: ' + vrsta + (v('mere') ? '\nMere: ' + v('mere') : '') + (v('grad') ? '\nMesto: ' + v('grad') : '') +
      (v('poruka') ? '\nOpis: ' + v('poruka') : '') + '\nIme: ' + ime + '\nTelefon: ' + tel;
    var pr = document.getElementById('pregled');
    pr.querySelector('pre').textContent = poruka;
    pr.classList.add('vidi');
    pr.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  });

  /* ---------- galerija: filter ---------- */
  var filteri = document.querySelector('.filteri');
  var figure = [].slice.call(document.querySelectorAll('.mreza figure'));
  if (filteri) {
    filteri.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      filteri.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      var k = b.dataset.k;
      figure.forEach(function (fg) { fg.hidden = !(k === 'sve' || fg.dataset.k === k); });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
    var h = location.hash.slice(1);
    var pocetni = h && filteri.querySelector('button[data-k="' + h + '"]');
    if (pocetni) pocetni.click();
  }

  /* ---------- lightbox ---------- */
  var sv = document.getElementById('svetlo');
  if (sv && figure.length) {
    var img = sv.querySelector('img'), opis = sv.querySelector('.opis'), br = sv.querySelector('.brojac');
    var vidljive = function () { return figure.filter(function (fg) { return !fg.hidden; }); };
    var tek = 0, povratak = null;
    var pokazi = function (i) {
      var l = vidljive(); if (!l.length) return;
      tek = (i + l.length) % l.length;
      var fg = l[tek], s = fg.querySelector('img');
      img.src = s.getAttribute('src'); img.alt = s.alt;
      opis.innerHTML = fg.querySelector('figcaption').innerHTML;
      br.textContent = (tek + 1) + ' / ' + l.length;
    };
    var otvori = function (fg) {
      povratak = document.activeElement;
      pokazi(vidljive().indexOf(fg));
      sv.hidden = false; document.body.style.overflow = 'hidden';
      sv.querySelector('.zatvori').focus();
    };
    var zatvori = function () { sv.hidden = true; document.body.style.overflow = ''; if (povratak) povratak.focus(); };
    document.querySelector('.mreza').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (b) otvori(b.closest('figure'));
    });
    sv.querySelector('.zatvori').addEventListener('click', zatvori);
    sv.querySelector('.napred').addEventListener('click', function () { pokazi(tek + 1); });
    sv.querySelector('.nazad').addEventListener('click', function () { pokazi(tek - 1); });
    sv.addEventListener('click', function (e) { if (e.target === sv) zatvori(); });
    document.addEventListener('keydown', function (e) {
      if (sv.hidden) return;
      if (e.key === 'Escape') zatvori();
      if (e.key === 'ArrowRight') pokazi(tek + 1);
      if (e.key === 'ArrowLeft') pokazi(tek - 1);
      if (e.key === 'Tab') { // fokus ostaje u prozoru
        var f2 = [].slice.call(sv.querySelectorAll('button')), i = f2.indexOf(document.activeElement);
        e.preventDefault(); f2[(i + (e.shiftKey ? -1 : 1) + f2.length) % f2.length].focus();
      }
    });
    var x0 = null;
    sv.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    sv.addEventListener('touchend', function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) pokazi(tek + (dx < 0 ? 1 : -1));
    });
  }
})();
