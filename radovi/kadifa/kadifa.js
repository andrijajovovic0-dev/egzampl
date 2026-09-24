/* Kadifa — cenovnik po grupama + online zakazivanje (usluga → dan → vreme → podaci → potvrda + .ics). */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var fmt = function (n) { return n.toLocaleString('sr-RS') + ' din'; };

  var GRUPE = [
    { id: 'nokti', ime: 'Nokti', u: [
      ['Klasičan manikir', 45, 1500], ['Gel lak', 60, 2200], ['Gel nadogradnja', 120, 3800], ['Korekcija gela', 90, 2800], ['Pedikir', 60, 2500]] },
    { id: 'trepavice', ime: 'Trepavice i obrve', u: [
      ['Trepavice 1:1', 120, 4500], ['Volumen 2D–3D', 150, 5500], ['Lash lift', 60, 3200], ['Oblikovanje obrva', 30, 900], ['Laminacija obrva', 45, 2400]] },
    { id: 'lice', ime: 'Nega lica', u: [
      ['Tretman čišćenja lica', 75, 4200], ['Hidratacija', 60, 3600], ['Hemijski piling', 45, 4800]] },
    { id: 'sminka', ime: 'Šminka', u: [
      ['Dnevna šminka', 45, 2800], ['Svečana šminka', 75, 4500], ['Mladenačka (proba + dan venčanja)', 180, 9000]] }
  ];
  var SVE = [];
  GRUPE.forEach(function (g) { g.u.forEach(function (x) { SVE.push({ g: g.id, ime: x[0], min: x[1], cena: x[2] }); }); });
  var trajanje = function (m) { return m < 60 ? m + ' min' : (Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : '')); };

  /* ---------- cenovnik sa tabovima ---------- */
  var tabovi = $('#tabovi'), liste = $('#liste');
  if (tabovi && liste) {
    tabovi.innerHTML = GRUPE.map(function (g, i) {
      return '<button type="button" role="tab" id="tab-' + g.id + '" aria-controls="lista-' + g.id + '" aria-selected="' + (i === 0) + '"' + (i ? ' tabindex="-1"' : '') + '>' + g.ime + '</button>';
    }).join('');
    liste.innerHTML = GRUPE.map(function (g, i) {
      return '<div role="tabpanel" id="lista-' + g.id + '" aria-labelledby="tab-' + g.id + '"' + (i ? ' hidden' : '') + '><ul class="lista">' + g.u.map(function (x) {
        return '<li><b>' + x[0] + '</b><small>' + trajanje(x[1]) + '</small><span class="c">' + fmt(x[2]) + '</span><button type="button" data-usluga="' + x[0] + '" aria-label="Zakaži: ' + x[0] + '">Zakaži</button></li>';
      }).join('') + '</ul></div>';
    }).join('');
    var izaberiTab = function (b) {
      tabovi.querySelectorAll('button').forEach(function (t) { var da = t === b; t.setAttribute('aria-selected', String(da)); t.tabIndex = da ? 0 : -1; });
      liste.querySelectorAll('[role=tabpanel]').forEach(function (l) { l.hidden = l.id !== b.getAttribute('aria-controls'); });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    };
    tabovi.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) izaberiTab(b); });
    tabovi.addEventListener('keydown', function (e) {
      var t = [].slice.call(tabovi.children), i = t.indexOf(document.activeElement);
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); var n = t[(i + (e.key === 'ArrowRight' ? 1 : -1) + t.length) % t.length]; n.focus(); izaberiTab(n); }
    });
    liste.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-usluga]'); if (!b) return;
      postaviUslugu(b.dataset.usluga);
      var z = $('#zakazivanje');
      if (window.PM && window.PM.lenis) window.PM.lenis.scrollTo(z, { offset: -80 }); else z.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* ---------- termini ---------- */
  var RADNO = { 0: null, 1: [9, 20], 2: [9, 20], 3: [9, 20], 4: [9, 20], 5: [9, 20], 6: [9, 15] };
  var DANI = ['ned', 'pon', 'uto', 'sre', 'čet', 'pet', 'sub'];
  var MESECI = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];
  var DANI_PUNO = ['nedelja', 'ponedeljak', 'utorak', 'sreda', 'četvrtak', 'petak', 'subota'];
  var hes = function (s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; };
  var kljuc = function (d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  // zauzeti blokovi od 30 min (izmišljeni, ali uvek isti za isti dan)
  var zauzeto = function (d, m) { return hes(kljuc(d) + '|' + m) < 0.33; };
  function slobodni(d, min) {
    var r = RADNO[d.getDay()]; if (!r) return [];
    var sad = new Date(), danas = kljuc(d) === kljuc(sad);
    var granica = danas ? sad.getHours() * 60 + sad.getMinutes() + 60 : -1;
    var out = [];
    for (var t = r[0] * 60; t + min <= r[1] * 60; t += 30) {
      var ok = t > granica;
      for (var x = t; ok && x < t + min; x += 30) if (zauzeto(d, x)) ok = false;
      out.push({ t: t, ok: ok });
    }
    return out;
  }
  var hhmm = function (t) { return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); };
  var dani14 = (function () { var a = [], d = new Date(); d.setHours(0, 0, 0, 0); for (var i = 0; i < 14; i++) { a.push(new Date(d)); d.setDate(d.getDate() + 1); } return a; })();

  /* prvi slobodan termin za 60 min (hero) */
  var prvi = $('#prvi-termin');
  if (prvi) {
    for (var i = 0; i < dani14.length; i++) {
      var s = slobodni(dani14[i], 60).filter(function (x) { return x.ok; })[0];
      if (s) { prvi.textContent = (i === 0 ? 'danas' : i === 1 ? 'sutra' : DANI_PUNO[dani14[i].getDay()]) + ' u ' + hhmm(s.t); break; }
    }
  }

  /* ---------- zakazivanje ---------- */
  var st = { u: null, d: null, t: null };
  var elU = $('#z-usluge'), elD = $('#dani'), elS = $('#satovi'), btn = $('#potvrdi');
  if (!elU) return;
  elU.innerHTML = GRUPE.map(function (g) {
    return g.u.map(function (x) { return '<button type="button" data-usluga="' + x[0] + '" aria-pressed="false">' + x[0] + '<small>' + trajanje(x[1]) + ' · ' + fmt(x[2]) + '</small></button>'; }).join('');
  }).join('');
  elD.innerHTML = dani14.map(function (d, i) {
    var zat = !RADNO[d.getDay()];
    return '<button type="button" data-i="' + i + '" aria-pressed="false"' + (zat ? ' disabled data-zatvoreno="1"' : '') + '><small>' + (i === 0 ? 'danas' : DANI[d.getDay()]) + '</small><b>' + d.getDate() + '</b><span class="sr-only">. ' + MESECI[d.getMonth()] + (zat ? ', zatvoreno' : '') + '</span></button>';
  }).join('');

  // zaključan korak: kontrole su stvarno onemogućene (tastatura, čitači ekrana), ne samo izbledele
  function korak(n, otvoren) {
    var k = $('#z-korak-' + n); if (!k) return;
    k.classList.toggle('zaklj', !otvoren);
    k.querySelectorAll('button:not([data-zatvoreno]):not([data-t]), input, textarea').forEach(function (el) { el.disabled = !otvoren; });
  }
  function crtajSate() {
    if (!st.u || st.d === null) { elS.innerHTML = '<p class="pom">Prvo izaberite uslugu i dan.</p>'; return; }
    var l = slobodni(dani14[st.d], st.u.min);
    if (!l.some(function (x) { return x.ok; })) { elS.innerHTML = '<p class="pom">Za ovaj dan nema slobodnih termina za izabranu uslugu. Izaberite drugi dan.</p>'; return; }
    elS.innerHTML = l.map(function (x) {
      return '<button type="button" data-t="' + x.t + '" aria-pressed="' + (st.t === x.t) + '"' + (x.ok ? '' : ' disabled aria-label="' + hhmm(x.t) + ' zauzeto"') + '>' + hhmm(x.t) + '</button>';
    }).join('');
  }
  function osvezi() {
    elU.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(!!st.u && b.dataset.usluga === st.u.ime)); });
    elD.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.i === st.d)); });
    korak(2, !!st.u); korak(3, !!st.u && st.d !== null); korak(4, st.t !== null);
    var d = st.d !== null ? dani14[st.d] : null;
    $('#s-usluga').textContent = st.u ? st.u.ime : '—';
    $('#s-trajanje').textContent = st.u ? trajanje(st.u.min) : '—';
    $('#s-dan').textContent = d ? DANI_PUNO[d.getDay()] + ', ' + d.getDate() + '. ' + MESECI[d.getMonth()] : '—';
    $('#s-vreme').textContent = st.t !== null ? hhmm(st.t) + ' – ' + hhmm(st.t + st.u.min) : '—';
    $('#s-cena').textContent = st.u ? fmt(st.u.cena) : '—';
    var n = (st.u ? 1 : 0) + (st.d !== null ? 1 : 0) + (st.t !== null ? 1 : 0) + (podaciOk() ? 1 : 0);
    document.querySelectorAll('.koraci-z span').forEach(function (s, i) { s.classList.toggle('gotov', i < n); });
    btn.disabled = n < 4;
  }
  function podaciOk() { return $('#z-ime').value.trim().length > 1 && $('#z-tel').value.replace(/\D/g, '').length >= 8; }
  function postaviUslugu(ime) {
    st.u = SVE.filter(function (x) { return x.ime === ime; })[0] || null;
    st.t = null; crtajSate(); osvezi();
  }
  elU.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) postaviUslugu(b.dataset.usluga); });
  elD.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.disabled) return;
    st.d = +b.dataset.i; st.t = null; crtajSate(); osvezi();
  });
  elS.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.disabled) return;
    st.t = +b.dataset.t; crtajSate(); osvezi();
  });
  ['#z-ime', '#z-tel'].forEach(function (s) { $(s).addEventListener('input', osvezi); });

  btn.addEventListener('click', function () {
    if (btn.disabled) return;
    var d = dani14[st.d], ime = $('#z-ime').value.trim();
    var od = new Date(d); od.setHours(0, st.t, 0, 0);
    var do_ = new Date(od.getTime() + st.u.min * 60000);
    var p = function (x) { return String(x).padStart(2, '0'); };
    var ics = function (x) { return x.getFullYear() + p(x.getMonth() + 1) + p(x.getDate()) + 'T' + p(x.getHours()) + p(x.getMinutes()) + '00'; };
    var sadrzaj = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Kadifa primer//SR', 'BEGIN:VEVENT', 'UID:' + Date.now() + '@kadifa-primer',
      'DTSTAMP:' + ics(new Date()), 'DTSTART:' + ics(od), 'DTEND:' + ics(do_), 'SUMMARY:Kadifa — ' + st.u.ime,
      'LOCATION:Njegoševa 00\\, Beograd', 'DESCRIPTION:Primer termina sa sajta Kadifa (izmišljen salon).', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var url = URL.createObjectURL(new Blob([sadrzaj], { type: 'text/calendar' }));
    var panel = $('#zak-panel');
    panel.innerHTML = '<div class="potvrda" role="status" tabindex="-1">' +
      '<div class="znak"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg></div>' +
      '<h3>Vidimo se, <em>' + ime.split(' ')[0].replace(/[<>&"]/g, '') + '.</em></h3>' +
      '<p>' + st.u.ime + ' — ' + DANI_PUNO[d.getDay()] + ', ' + d.getDate() + '. ' + MESECI[d.getMonth()] + ' u ' + hhmm(st.t) + '. Podsetnik stiže dan ranije.</p>' +
      '<div class="radnje"><a class="dugme" download="kadifa-termin.ics" href="' + url + '">Dodaj u kalendar</a><button type="button" class="dugme obrub" id="novi-termin">Novi termin</button></div>' +
      '<p class="napomena">Ovo je primer — termin se ne šalje. Na pravom sajtu stiže vlasnici na mejl i u Google kalendar, a zauzeti sati se više ne nude.</p></div>';
    btn.disabled = true;
    panel.querySelector('.potvrda').focus();
    $('#novi-termin').addEventListener('click', function () { location.reload(); });
  });
  crtajSate(); osvezi();

  /* današnji dan u radnom vremenu */
  var dd = new Date().getDay(), li = document.querySelector('.sati li[data-d="' + (dd >= 1 && dd <= 5 ? 1 : dd) + '"]'); if (li) li.classList.add('danas');
})();
