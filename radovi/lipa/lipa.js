/* Lipa — QR meni: tri jezika, pretraga, filter alergena, lepljive kategorije sa praćenjem skrola, Wi-Fi lozinka. */
(function () {
  'use strict';
  var IMG = '../../assets/img/lipa/';
  var UI = {
    sr: { jezik: 'Jezik', otvoreno: 'Otvoreno · do ', zatvoreno: 'Zatvoreno · otvaramo u ', trazi: 'Pretražite meni…', preporuka: 'Preporuka kuće', nema: 'Nema stavki za ovu pretragu.',
      bezg: 'Bez glutena', bezl: 'Bez laktoze', vegan: 'Vegansko', wifi: 'Wi-Fi lozinka', kopirano: 'Kopirano ✓', alergeni: 'Alergeni: G gluten · M mleko · J jaja · O orašasti plodovi. Pitajte osoblje za sastav.',
      cene: 'Cene su u dinarima, sa PDV-om.', sati: 'Pon–pet 07–23 · sub–ned 08–24', doruc: 'Služi se do 12h', rezultati: 'rezultata' },
    en: { jezik: 'Language', otvoreno: 'Open · until ', zatvoreno: 'Closed · opens at ', trazi: 'Search the menu…', preporuka: 'House favourites', nema: 'Nothing matches your search.',
      bezg: 'Gluten-free', bezl: 'Lactose-free', vegan: 'Vegan', wifi: 'Wi-Fi password', kopirano: 'Copied ✓', alergeni: 'Allergens: G gluten · M milk · J eggs · O nuts. Ask the staff for ingredients.',
      cene: 'Prices in Serbian dinars (RSD), VAT included.', sati: 'Mon–Fri 07–23 · Sat–Sun 08–24', doruc: 'Served until 12:00', rezultati: 'results' },
    de: { jezik: 'Sprache', otvoreno: 'Geöffnet · bis ', zatvoreno: 'Geschlossen · öffnet um ', trazi: 'Menü durchsuchen…', preporuka: 'Empfehlungen des Hauses', nema: 'Keine Treffer.',
      bezg: 'Glutenfrei', bezl: 'Laktosefrei', vegan: 'Vegan', wifi: 'WLAN-Passwort', kopirano: 'Kopiert ✓', alergeni: 'Allergene: G Gluten · M Milch · J Eier · O Nüsse. Fragen Sie unser Personal.',
      cene: 'Preise in Dinar (RSD), inkl. MwSt.', sati: 'Mo–Fr 07–23 · Sa–So 08–24', doruc: 'Bis 12 Uhr', rezultati: 'Treffer' }
  };
  // [id, {sr,en,de} naziv, {sr,en,de} opis, cena, alergeni, vegan, slika]
  var MENI = [
    { id: 'kafa', ime: { sr: 'Kafa', en: 'Coffee', de: 'Kaffee' }, s: [
      [{ sr: 'Espreso', en: 'Espresso', de: 'Espresso' }, null, 160, '', 1],
      [{ sr: 'Dupli espreso', en: 'Double espresso', de: 'Doppelter Espresso' }, null, 220, '', 1],
      [{ sr: 'Makijato', en: 'Macchiato', de: 'Macchiato' }, null, 190, 'M'],
      [{ sr: 'Kapućino', en: 'Cappuccino', de: 'Cappuccino' }, { sr: 'Dupli espreso, mleko iz Svrljiga', en: 'Double shot, milk from a local farm', de: 'Doppelter Espresso, Milch vom Bauernhof' }, 230, 'M', 0, 'kapucino'],
      [{ sr: 'Kafa late', en: 'Caffè latte', de: 'Milchkaffee' }, null, 250, 'M', 0, 'makijato'],
      [{ sr: 'Flet vajt', en: 'Flat white', de: 'Flat White' }, null, 270, 'M'],
      [{ sr: 'Domaća kafa', en: 'Turkish-style coffee', de: 'Türkischer Kaffee' }, { sr: 'Kuvana u džezvi, uz ratluk', en: 'Brewed in a džezva, served with Turkish delight', de: 'In der Džezva gekocht, mit Lokum' }, 150, '', 1]] },
    { id: 'topli', ime: { sr: 'Topli napici', en: 'Hot drinks', de: 'Heißgetränke' }, s: [
      [{ sr: 'Čaj od lipe', en: 'Linden tea', de: 'Lindenblütentee' }, { sr: 'Cvet iz naše bašte, sa medom', en: 'Blossoms from our garden, with honey', de: 'Blüten aus unserem Garten, mit Honig' }, 200, '', 0],
      [{ sr: 'Čaj po izboru', en: 'Tea of your choice', de: 'Tee nach Wahl' }, null, 180, '', 1],
      [{ sr: 'Topla čokolada', en: 'Hot chocolate', de: 'Heiße Schokolade' }, { sr: 'Tamna čokolada 70%, šlag', en: '70% dark chocolate, whipped cream', de: '70% Zartbitter, Sahne' }, 260, 'M']] },
    { id: 'hladni', ime: { sr: 'Hladni napici', en: 'Cold drinks', de: 'Kalte Getränke' }, s: [
      [{ sr: 'Domaća limunada', en: 'Homemade lemonade', de: 'Hausgemachte Limonade' }, { sr: 'Sveži limun, bez sirupa', en: 'Fresh lemons, no syrup', de: 'Frische Zitronen, ohne Sirup' }, 280, '', 1, 'limunada'],
      [{ sr: 'Limunada sa nanom', en: 'Mint lemonade', de: 'Minz-Limonade' }, null, 300, '', 1, 'limunada-2'],
      [{ sr: 'Ceđena pomorandža', en: 'Fresh orange juice', de: 'Frisch gepresster Orangensaft' }, null, 320, '', 1, 'sok'],
      [{ sr: 'Ledena kafa', en: 'Iced coffee', de: 'Eiskaffee' }, { sr: 'Espreso, mleko, sladoled od vanile', en: 'Espresso, milk, vanilla ice cream', de: 'Espresso, Milch, Vanilleeis' }, 290, 'M'],
      [{ sr: 'Kisela voda 0,25', en: 'Sparkling water 0.25', de: 'Mineralwasser 0,25' }, null, 150, '', 1]] },
    { id: 'dorucak', ime: { sr: 'Doručak', en: 'Breakfast', de: 'Frühstück' }, napomena: 'doruc', s: [
      [{ sr: 'Kroasan sa džemom', en: 'Croissant with jam', de: 'Croissant mit Marmelade' }, { sr: 'Pečen ujutru, domaći džem od kajsije', en: 'Baked this morning, apricot jam', de: 'Morgens gebacken, Aprikosenmarmelade' }, 260, 'GMJ', 0, 'kroasan'],
      [{ sr: 'Doručak Lipa', en: 'Lipa breakfast', de: 'Lipa-Frühstück' }, { sr: 'Jaja, pršuta, sir, domaći hleb, sok', en: 'Eggs, prosciutto, cheese, bread, juice', de: 'Eier, Schinken, Käse, Brot, Saft' }, 690, 'GMJ', 0, 'dorucak'],
      [{ sr: 'Omlet sa sirom', en: 'Cheese omelette', de: 'Käse-Omelett' }, null, 420, 'MJ'],
      [{ sr: 'Palačinke sa voćem', en: 'Pancakes with fruit', de: 'Pfannkuchen mit Obst' }, { sr: 'Tri palačinke, sezonsko voće, med', en: 'Three pancakes, seasonal fruit, honey', de: 'Drei Pfannkuchen, Obst der Saison, Honig' }, 480, 'GMJ', 0, 'palacinke'],
      [{ sr: 'Ovsena kaša', en: 'Porridge', de: 'Haferbrei' }, { sr: 'Na biljnom mleku, borovnice, banana', en: 'Plant milk, blueberries, banana', de: 'Mit Pflanzenmilch, Heidelbeeren, Banane' }, 390, 'G', 1, 'ovsena']] },
    { id: 'kolaci', ime: { sr: 'Kolači', en: 'Cakes', de: 'Kuchen' }, s: [
      [{ sr: 'Čizkejk sa malinama', en: 'Raspberry cheesecake', de: 'Himbeer-Käsekuchen' }, null, 380, 'GMJ', 0, 'maline'],
      [{ sr: 'Kolač dana', en: 'Cake of the day', de: 'Kuchen des Tages' }, { sr: 'Pitajte konobara', en: 'Ask your waiter', de: 'Fragen Sie den Kellner' }, 330, 'GMJO', 0, 'kolaci'],
      [{ sr: 'Brauni bez brašna', en: 'Flourless brownie', de: 'Brownie ohne Mehl' }, null, 320, 'MJO']] },
    { id: 'pice', ime: { sr: 'Pivo i vino', en: 'Beer & wine', de: 'Bier & Wein' }, s: [
      [{ sr: 'Točeno pivo 0,5', en: 'Draught beer 0.5', de: 'Fassbier 0,5' }, null, 330, 'G', 1],
      [{ sr: 'Kraft IPA 0,33', en: 'Craft IPA 0.33', de: 'Craft IPA 0,33' }, { sr: 'Niška pivara', en: 'Local brewery', de: 'Lokale Brauerei' }, 420, 'G', 1],
      [{ sr: 'Belo vino, čaša', en: 'White wine, glass', de: 'Weißwein, Glas' }, { sr: 'Tamjanika, Župa', en: 'Tamjanika, Župa region', de: 'Tamjanika, Župa' }, 390, '', 1],
      [{ sr: 'Crno vino, čaša', en: 'Red wine, glass', de: 'Rotwein, Glas' }, { sr: 'Prokupac', en: 'Prokupac', de: 'Prokupac' }, 410, '', 1]] }
  ];
  var PREPORUKA = [['kafa', 3], ['dorucak', 0], ['dorucak', 1], ['hladni', 0], ['kolaci', 0]];

  var $ = function (s) { return document.querySelector(s); };
  var jez = (function () { try { return localStorage.getItem('lipa-jezik'); } catch (e) { return null; } })() || ((navigator.language || 'sr').slice(0, 2) === 'de' ? 'de' : 'sr');
  if (!UI[jez]) jez = 'sr';
  var filt = { q: '', g: false, l: false, v: false };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var cena = function (n) { return n.toLocaleString('sr-RS'); };
  var norm = function (s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'dj'); };
  var prolazi = function (x) {
    if (filt.g && x[3].indexOf('G') > -1) return false;
    if (filt.l && x[3].indexOf('M') > -1) return false;
    if (filt.v && !(x[4] === 1)) return false;
    if (filt.q) {
      var t = norm(x[0][jez] + ' ' + (x[1] ? x[1][jez] : '') + ' ' + x[0].sr);
      if (t.indexOf(norm(filt.q)) === -1) return false;
    }
    return true;
  };
  var oznake = function (x) {
    var o = x[3].split('').filter(Boolean).map(function (a) { return '<abbr class="al" title="' + { G: 'gluten', M: 'mleko', J: 'jaja', O: 'orašasti' }[a] + '">' + a + '</abbr>'; }).join('');
    if (x[4] === 1) o += '<span class="veg" title="' + UI[jez].vegan + '">V</span>';
    return o;
  };

  function crtaj() {
    var u = UI[jez];
    document.documentElement.lang = jez === 'sr' ? 'sr' : jez;
    document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = u[el.dataset.t]; });
    $('#trazi').placeholder = u.trazi;
    document.querySelectorAll('#jezik button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.j === jez)); });
    $('#kategorije').innerHTML = MENI.map(function (k) { return '<a href="#k-' + k.id + '" data-k="' + k.id + '">' + k.ime[jez] + '</a>'; }).join('');
    $('#preporuka').innerHTML = PREPORUKA.map(function (p) {
      var x = MENI.filter(function (k) { return k.id === p[0]; })[0].s[p[1]];
      return '<article class="prep"><img src="' + IMG + x[5] + '.webp" alt="" width="480" height="360" loading="lazy"><div><b>' + esc(x[0][jez]) + '</b><span>' + cena(x[2]) + ' din</span></div></article>';
    }).join('');
    var ukupno = 0;
    $('#meni').innerHTML = MENI.map(function (k) {
      var stavke = k.s.filter(prolazi); ukupno += stavke.length;
      if (!stavke.length) return '';
      return '<section class="grupa" id="k-' + k.id + '" aria-labelledby="h-' + k.id + '"><h2 id="h-' + k.id + '">' + k.ime[jez] + '</h2>' + (k.napomena ? '<p class="nap">' + u[k.napomena] + '</p>' : '') +
        '<ul>' + stavke.map(function (x) {
          return '<li class="stavka' + (x[5] ? ' sa-slikom' : '') + '">' + (x[5] ? '<img src="' + IMG + x[5] + '.webp" alt="" width="96" height="96" loading="lazy">' : '') +
            '<div class="tx"><b>' + esc(x[0][jez]) + '</b>' + (x[1] ? '<small>' + esc(x[1][jez]) + '</small>' : '') + '<span class="oznake">' + oznake(x) + '</span></div>' +
            '<span class="c">' + cena(x[2]) + '</span></li>';
        }).join('') + '</ul></section>';
    }).join('') || '<p class="nema">' + u.nema + '</p>';
    $('#broj').textContent = (filt.q || filt.g || filt.l || filt.v) ? ukupno + ' ' + u.rezultati : '';
    status();
    spy();
  }

  /* radno vreme */
  function status() {
    var d = new Date(), dan = d.getDay(), h = d.getHours() + d.getMinutes() / 60;
    var r = (dan === 0 || dan === 6) ? [8, 24] : [7, 23], u = UI[jez], el = $('#status');
    var otv = h >= r[0] && h < r[1];
    el.classList.toggle('otvoreno', otv);
    el.querySelector('span').textContent = otv ? u.otvoreno + (r[1] === 24 ? '00' : r[1]) + ':00' : u.zatvoreno + String(r[0]).padStart(2, '0') + ':00';
  }

  /* praćenje kategorije dok se lista */
  var io = null;
  function spy() {
    if (io) io.disconnect();
    if (!('IntersectionObserver' in window)) return;
    var linkovi = document.querySelectorAll('#kategorije a');
    io = new IntersectionObserver(function (u) {
      u.forEach(function (e) {
        if (!e.isIntersecting) return;
        linkovi.forEach(function (a) {
          var da = a.dataset.k === e.target.id.slice(2);
          a.classList.toggle('aktivna', da);
          if (da) { var kat = $('#kategorije'); kat.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' }); }
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('.grupa').forEach(function (g) { io.observe(g); });
  }

  $('#jezik').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    jez = b.dataset.j; try { localStorage.setItem('lipa-jezik', jez); } catch (er) {}
    crtaj();
  });
  $('#trazi').addEventListener('input', function (e) { filt.q = e.target.value.trim(); crtaj(); });
  document.querySelectorAll('.filteri button').forEach(function (b) {
    b.addEventListener('click', function () { filt[b.dataset.f] = !filt[b.dataset.f]; b.setAttribute('aria-pressed', String(filt[b.dataset.f])); crtaj(); });
  });
  $('#kategorije').addEventListener('click', function (e) {
    var a = e.target.closest('a'); if (!a) return;
    e.preventDefault();
    var t = document.getElementById('k-' + a.dataset.k); if (!t) return;
    var y = t.getBoundingClientRect().top + window.scrollY - document.querySelector('.alati').offsetHeight - 6;
    window.scrollTo({ top: y, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
  $('#wifi').addEventListener('click', function () {
    var b = this, l = b.dataset.lozinka;
    var ok = function () { var s = b.querySelector('[data-t=wifi]'), st = s.textContent; s.textContent = UI[jez].kopirano; setTimeout(function () { s.textContent = st; }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(l).then(ok, ok); else ok();
  });
  crtaj();
})();
