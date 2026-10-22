/* All dashboard data below is illustrative SAMPLE data generated for this portfolio. */
const $ = s => document.querySelector(s);
const C = {navy:'#0B1B3A', blue:'#2563EB', sky:'#60A5FA', teal:'#14B8A6', slate:'#CBD5E1', amber:'#F59E0B', red:'#EF4444', grid:'#E8EDF5'};
Chart.defaults.font.family = "Inter, sans-serif";
Chart.defaults.color = '#5B6B86';
Chart.defaults.plugins.legend.position = 'bottom';
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.boxWidth = 8;

const charts = {};
function draw(id, cfg){
  if(charts[id]) charts[id].destroy();
  cfg.options = Object.assign({responsive:true, maintainAspectRatio:false}, cfg.options || {});
  charts[id] = new Chart(document.getElementById(id), cfg);
}
const rng = seed => () => (seed = seed * 16807 % 2147483647) / 2147483647;
const sum = a => a.reduce((x, y) => x + y, 0);
const fill = (id, opts) => { $(id).innerHTML = opts.map(o => `<option>${o}</option>`).join(''); };
function seg(id, cb){
  const el = $(id);
  el.addEventListener('click', e => {
    const b = e.target.closest('button'); if(!b) return;
    el.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    cb(b.dataset.v);
  });
}
const yAxis = (extra = {}) => ({beginAtZero:true, grid:{color:C.grid}, ...extra});
const xAxis = (extra = {}) => ({grid:{display:false}, ...extra});
const kpi = (l, v, d, cls = 'flat') => `<div class="kpi"><span>${l}</span><b>${v}</b>${d ? `<em class="${cls}">${d}</em>` : ''}</div>`;
const sgn = (n, dp = 1) => (n >= 0 ? '+' : '') + n.toFixed(dp);
const cls = n => n > 0 ? 'up' : n < 0 ? 'down' : 'flat';
const pill = (t, k) => `<span class="pill ${k}">${t}</span>`;
const MON = ['Apr','May','Jun','Jul','Aug','Sep'];

/* ===== Project 1: Retail store performance ===== */
(function(){
  const regions = ['Chennai','Bangalore','Coimbatore','Hyderabad','Mumbai','Pune'];
  const brands = ['HP','Samsung','Ray-Ban'];
  const r = rng(42);
  const stores = Array.from({length:16}, (_, i) => {
    const target = Math.round(40 + r() * 60), ach = .72 + r() * .5;
    const months = MON.map((_, m) => Math.round(target * (.82 + r() * .3) * (1 + (ach - 1) * m / 5)));
    return {name:'Store ' + String(i + 1).padStart(2, '0'), region:regions[i % 6], brand:brands[Math.floor(r() * 3)],
      target, sales:months[5], months, rating:+(3.3 + r() * 1.6).toFixed(1), leads:Math.round(60 + r() * 140), conv:+(.18 + r() * .3).toFixed(2)};
  });
  const status = s => { const a = s.sales / s.target;
    if(a >= 1.05 && s.rating >= 4.2) return ['High performer','good'];
    if(a < .9 || s.rating < 3.8) return ['Needs attention','bad'];
    return ['On track','blue']; };
  fill('#p1Region', ['All regions', ...regions]); fill('#p1Brand', ['All brands', ...brands]);
  let mode = 'all';
  function render(){
    const reg = $('#p1Region').value, br = $('#p1Brand').value;
    const d = stores.filter(s => (reg === 'All regions' || s.region === reg) && (br === 'All brands' || s.brand === br));
    if(!d.length){
      $('#p1Kpis').innerHTML = '<div class="kpi"><span>No stores</span><b>—</b><em class="flat">Try another filter</em></div>';
      ['p1Sales','p1Trend','p1Leads','p1Rating'].forEach(id => draw(id, {type:'bar', data:{labels:[], datasets:[]}}));
      $('#p1Table').innerHTML = ''; return;
    }
    const tS = sum(d.map(s => s.sales)), tT = sum(d.map(s => s.target)), leads = sum(d.map(s => s.leads));
    const conv = sum(d.map(s => s.leads * s.conv)) / leads, rat = sum(d.map(s => s.rating)) / d.length;
    const ach = tS / tT * 100;
    $('#p1Kpis').innerHTML =
      kpi('Total sales', '₹' + tS + ' L', 'Target ₹' + tT + ' L') +
      kpi('Target achievement', ach.toFixed(1) + '%', sgn(ach - 100) + ' pts vs target', cls(ach - 100)) +
      kpi('Avg customer rating', rat.toFixed(2) + ' / 5', d.filter(s => s.rating < 3.8).length + ' stores below 3.8', d.some(s => s.rating < 3.8) ? 'down' : 'up') +
      kpi('Leads generated', leads, 'Conversion ' + (conv * 100).toFixed(0) + '%') +
      kpi('Stores needing attention', d.filter(s => status(s)[1] === 'bad').length, 'of ' + d.length + ' stores', 'down');
    const byAch = [...d].sort((a, b) => b.sales / b.target - a.sales / a.target);
    draw('p1Sales', {type:'bar', data:{labels:byAch.map(s => s.name), datasets:[
      {label:'Sales', data:byAch.map(s => s.sales), backgroundColor:byAch.map(s => s.sales >= s.target ? C.blue : C.amber), borderRadius:4},
      {label:'Target', data:byAch.map(s => s.target), backgroundColor:C.slate, borderRadius:4}]},
      options:{scales:{y:yAxis(), x:xAxis()}}});
    draw('p1Trend', {type:'line', data:{labels:MON, datasets:[
      {label:'Sales', data:MON.map((_, m) => sum(d.map(s => s.months[m]))), borderColor:C.blue, backgroundColor:'rgba(37,99,235,.12)', fill:true, tension:.35},
      {label:'Target', data:MON.map(() => tT), borderColor:C.teal, borderDash:[6, 5], pointRadius:0}]},
      options:{scales:{y:yAxis(), x:xAxis()}}});
    draw('p1Leads', {type:'bar', data:{labels:d.map(s => s.name), datasets:[
      {label:'Leads', data:d.map(s => s.leads), backgroundColor:C.sky, borderRadius:4},
      {label:'Converted', data:d.map(s => Math.round(s.leads * s.conv)), backgroundColor:C.navy, borderRadius:4}]},
      options:{scales:{y:yAxis(), x:xAxis()}}});
    draw('p1Rating', {type:'bar', data:{labels:d.map(s => s.name), datasets:[{label:'Rating', data:d.map(s => s.rating),
      backgroundColor:d.map(s => s.rating >= 4.2 ? C.teal : s.rating < 3.8 ? C.red : C.blue), borderRadius:4}]},
      options:{plugins:{legend:{display:false}}, scales:{y:yAxis({max:5}), x:xAxis()}}});
    const rows = byAch.filter(s => mode === 'all' || (mode === 'bad' ? status(s)[1] === 'bad' : status(s)[1] === 'good'));
    $('#p1Table').innerHTML = '<tr><th>Store</th><th>Region</th><th>Brand</th><th>Sales (₹ L)</th><th>Achievement</th><th>Rating</th><th>Leads</th><th>Status</th></tr>' +
      (rows.map(s => { const a = s.sales / s.target * 100, st = status(s);
        return `<tr><td><b>${s.name}</b></td><td>${s.region}</td><td>${s.brand}</td><td>${s.sales}</td><td class="${cls(a - 100)}">${a.toFixed(0)}%</td><td>${s.rating}</td><td>${s.leads}</td><td>${pill(st[0], st[1])}</td></tr>`; }).join('')
      || '<tr><td colspan="8">No stores in this view.</td></tr>');
  }
  $('#p1Region').onchange = $('#p1Brand').onchange = render;
  seg('#p1Seg', v => { mode = v; render(); });
  render();
})();

/* ===== Project 2: Bolna feedback calling ===== */
(function(){
  const brands = ['HP','Samsung','Ray-Ban'];
  const r = rng(7), base = {HP:420, Samsung:300, 'Ray-Ban':75};
  const data = {};
  brands.forEach(b => data[b] = MON.map((_, i) => {
    const el = Math.round(base[b] * (.9 + r() * .25)), con = Math.round(el * (.62 + r() * .16) + i * 2);
    const fb = Math.round(con * (.78 + r() * .14)), low = Math.round(fb * (.06 + r() * .08));
    return {el, con, fb, low, esc:Math.round(low * (.45 + r() * .25)), rating:+(4 + r() * .55).toFixed(2)};
  }));
  fill('#p2Month', ['All months', ...MON]); fill('#p2Brand', ['All brands', ...brands]);
  function agg(bs, idx){
    const rows = bs.flatMap(b => idx.map(i => data[b][i]));
    const t = k => sum(rows.map(x => x[k]));
    return {el:t('el'), con:t('con'), fb:t('fb'), low:t('low'), esc:t('esc'), rating:sum(rows.map(x => x.rating * x.fb)) / (t('fb') || 1)};
  }
  const pct = (a, b) => b ? (a / b * 100).toFixed(0) + '%' : '—';
  function render(){
    const m = $('#p2Month').value, bsel = $('#p2Brand').value;
    const bs = bsel === 'All brands' ? brands : [bsel], idx = m === 'All months' ? MON.map((_, i) => i) : [MON.indexOf(m)];
    const a = agg(bs, idx), max = a.el || 1;
    const row = (lab, v, conv, red) => `<div class="row"><div class="lab">${lab}</div><div class="track"><div class="bar ${red ? 'red' : ''}" style="width:${Math.max(v / max * 100, 7)}%">${v}</div></div><div class="conv">${conv}</div></div>`;
    $('#p2Funnel').innerHTML =
      `<div class="kpis"><div class="kpi"><span>Overall customer rating</span><b>${a.rating.toFixed(2)} / 5</b><em class="flat">Across captured feedback</em></div></div>` +
      row('Eligible invoices', a.el, 'Called') +
      row('Customers connected', a.con, pct(a.con, a.el) + ' of eligible') +
      row('Feedback captured', a.fb, pct(a.fb, a.con) + ' of connected') +
      row('Low ratings', a.low, pct(a.low, a.fb) + ' of feedback', true) +
      row('Escalations', a.esc, pct(a.esc, a.low) + ' of low ratings', true);
    const mm = MON.map((_, i) => agg(bs, [i]));
    draw('p2Rates', {type:'line', data:{labels:MON, datasets:[
      {label:'Connection rate %', data:mm.map(x => +(x.con / x.el * 100).toFixed(1)), borderColor:C.blue, tension:.3},
      {label:'Feedback capture %', data:mm.map(x => +(x.fb / x.con * 100).toFixed(1)), borderColor:C.teal, tension:.3},
      {label:'Rating (right)', data:mm.map(x => +x.rating.toFixed(2)), borderColor:C.navy, borderDash:[5, 4], yAxisID:'y2', tension:.3}]},
      options:{scales:{y:yAxis({max:100}), y2:{position:'right', min:3, max:5, grid:{display:false}}, x:xAxis()}}});
    draw('p2Low', {type:'bar', data:{labels:MON, datasets:[
      {label:'Low ratings', data:mm.map(x => x.low), backgroundColor:C.amber, borderRadius:4},
      {label:'Escalations', data:mm.map(x => x.esc), backgroundColor:C.red, borderRadius:4}]},
      options:{scales:{y:yAxis(), x:xAxis()}}});
    $('#p2Brands').innerHTML = brands.map(b => { const x = agg([b], idx);
      return `<div class="brand-card"><h6>${b}</h6><dl><dt>Customer rating</dt><dd>${x.rating.toFixed(2)} / 5</dd><dt>Feedback captured</dt><dd>${x.fb}</dd><dt>Low ratings</dt><dd>${x.low} (${pct(x.low, x.fb)})</dd><dt>Escalations</dt><dd>${x.esc}</dd></dl></div>`; }).join('');
  }
  $('#p2Month').onchange = $('#p2Brand').onchange = render;
  render();

  const esc = [
    ['ESC-021','HP','Store 03','Product defect reported after purchase','Captured','High','Store manager to call customer and arrange replacement check','Open'],
    ['ESC-020','Samsung','Store 07','Delay in delivery / installation','Captured','High','Delivery lead to confirm new date with customer','In progress'],
    ['ESC-019','Ray-Ban','Store 02','Billing mismatch','Captured','Medium','Accounts to verify invoice and confirm to customer','Open'],
    ['ESC-018','HP','Store 11','Staff behaviour at counter','Captured','Medium','Regional manager to review and call back','Open'],
    ['ESC-017','Samsung','Store 04','Warranty clarification needed','Captured','Low','Share warranty details on a call','In progress'],
    ['ESC-016','HP','Store 09','Service centre delay','Captured','High','Escalate to service head for ETA','Open'],
    ['ESC-015','Ray-Ban','Store 05','Lens fitting not as expected','Captured','Medium','Store to re-fit and confirm satisfaction','In progress'],
    ['ESC-014','Samsung','Store 01','Accessory missing from box','Captured','Low','Dispatch accessory and close','Open']];
  const pk = {High:'bad', Medium:'warn', Low:'blue'}, sk = {Open:'warn', 'In progress':'blue'};
  function renderEsc(f){
    $('#p2Esc').innerHTML = '<tr><th>ID</th><th>Brand</th><th>Store</th><th>Issue</th><th>Feedback</th><th>Priority</th><th>Next action</th><th>Status</th></tr>' +
      esc.filter(x => f === 'all' || x[5] === f).map(x => `<tr><td><b>${x[0]}</b></td><td>${x[1]}</td><td>${x[2]}</td><td>${x[3]}</td><td>${x[4]}</td><td>${pill(x[5], pk[x[5]])}</td><td>${x[6]}</td><td>${pill(x[7], sk[x[7]])}</td></tr>`).join('');
  }
  seg('#p2Seg', renderEsc); renderEsc('all');
  const cb = [
    ['CB-044','HP','Store 03','2','Not answered','Evening','Medium','Retry after 6 PM'],
    ['CB-043','Samsung','Store 06','1','Asked to call later','Morning','High','Call tomorrow 10 AM'],
    ['CB-042','HP','Store 10','3','Line busy','Afternoon','Medium','Try WhatsApp message first'],
    ['CB-041','Ray-Ban','Store 02','1','Asked to call later','Evening','Low','Call this weekend'],
    ['CB-040','Samsung','Store 04','2','Not answered','Any time','Medium','Retry on next working day'],
    ['CB-039','HP','Store 08','2','Switched off','Evening','Low','Retry and then mark unreachable']];
  $('#p2Cb').innerHTML = '<tr><th>ID</th><th>Brand</th><th>Store</th><th>Attempts</th><th>Last outcome</th><th>Preferred time</th><th>Priority</th><th>Next action</th></tr>' +
    cb.map(x => `<tr><td><b>${x[0]}</b></td><td>${x[1]}</td><td>${x[2]}</td><td>${x[3]}</td><td>${x[4]}</td><td>${x[5]}</td><td>${pill(x[6], pk[x[6]])}</td><td>${x[7]}</td></tr>`).join('');
})();

/* ===== Project 3: P&L ===== */
(function(){
  const S = {
    Retail:{rev:[520,548,505,590,612,640], tgt:[530,540,545,570,600,620], gm:[17.5,17.8,17.2,18.1,18.4,18.0], opx:[58,60,59,62,63,64]},
    Service:{rev:[140,146,150,158,163,171], tgt:[135,142,150,155,160,165], gm:[46,47,45.5,48,48.5,49], opx:[38,39,40,41,42,43]}};
  fill('#p3Period', ['Latest month (Sep)', 'Year to date (Apr–Sep)']);
  let segSel = 'All';
  const names = () => segSel === 'All' ? ['Retail','Service'] : [segSel];
  const calc = (ns, idx) => { const t = f => sum(ns.flatMap(n => idx.map(i => f(S[n], i))));
    const rev = t((s, i) => s.rev[i]), tgt = t((s, i) => s.tgt[i]), gp = t((s, i) => s.rev[i] * s.gm[i] / 100), opx = t((s, i) => s.opx[i]);
    return {rev, tgt, gp, opx, np:gp - opx, gm:gp / rev * 100}; };
  function render(){
    const ns = names(), ytd = $('#p3Period').selectedIndex === 1;
    const idx = ytd ? [0,1,2,3,4,5] : [5], cur = calc(ns, idx), prev = ytd ? null : calc(ns, [4]);
    const vr = (cur.rev - cur.tgt) / cur.tgt * 100;
    $('#p3Kpis').innerHTML =
      kpi('Revenue', '₹' + cur.rev + ' L', prev ? sgn((cur.rev - prev.rev) / prev.rev * 100) + '% vs last month' : 'Year to date', prev ? cls(cur.rev - prev.rev) : 'flat') +
      kpi('Vs target', sgn(vr) + '%', '₹' + sgn(cur.rev - cur.tgt, 0) + ' L variance', cls(vr)) +
      kpi('Gross profit', '₹' + cur.gp.toFixed(1) + ' L', prev ? sgn((cur.gp - prev.gp) / prev.gp * 100) + '% vs last month' : '', prev ? cls(cur.gp - prev.gp) : 'flat') +
      kpi('Gross margin', cur.gm.toFixed(1) + '%', prev ? sgn(cur.gm - prev.gm) + ' pts vs last month' : '', prev ? cls(cur.gm - prev.gm) : 'flat') +
      kpi('Net profit', '₹' + cur.np.toFixed(1) + ' L', 'Net margin ' + (cur.np / cur.rev * 100).toFixed(1) + '%');
    const act = MON.map((_, i) => calc(ns, [i]));
    draw('p3Rev', {type:'bar', data:{labels:MON, datasets:[
      {label:'Actual', data:act.map(x => x.rev), backgroundColor:act.map(x => x.rev >= x.tgt ? C.blue : C.amber), borderRadius:5},
      {label:'Target', type:'line', data:act.map(x => x.tgt), borderColor:C.navy, borderDash:[6, 5], pointRadius:3, tension:.25}]},
      options:{scales:{y:yAxis(), x:xAxis()}}});
    const mix = ['Retail','Service'].map(n => calc([n], idx).rev);
    draw('p3Mix', {type:'doughnut', data:{labels:['Retail','Service'], datasets:[{data:mix, backgroundColor:[C.blue, C.teal], borderWidth:0}]}, options:{cutout:'62%'}});
    draw('p3Gm', {type:'line', data:{labels:MON, datasets:ns.map((n, i) => ({label:n, data:S[n].gm, borderColor:n === 'Retail' ? C.blue : C.teal, tension:.3}))},
      options:{scales:{y:yAxis({beginAtZero:false, ticks:{callback:v => v + '%'}}), x:xAxis()}}});
    $('#p3Var').innerHTML = '<tr><th>Month</th><th>Actual</th><th>Target</th><th>Variance</th><th>Var %</th></tr>' +
      act.map((x, i) => { const v = x.rev - x.tgt;
        return `<tr><td>${MON[i]}</td><td>${x.rev}</td><td>${x.tgt}</td><td class="${cls(v)}">${sgn(v, 0)}</td><td class="${cls(v)}">${sgn(v / x.tgt * 100)}%</td></tr>`; }).join('');
    const all = calc(['Retail','Service'], idx), sv = calc(['Service'], idx), rt = calc(['Retail'], idx);
    $('#p3Insight').innerHTML = '<h6>Management insights (auto-generated from the sample data)</h6><ul style="margin-top:8px;padding-left:18px;list-style:disc;color:#334155;font-size:.9rem;line-height:1.8">' +
      `<li>Revenue is ${Math.abs(vr).toFixed(1)}% ${vr >= 0 ? 'above' : 'below'} target for the selected period.</li>` +
      `<li>Service is ${(sv.rev / all.rev * 100).toFixed(0)}% of revenue but ${(sv.gp / all.gp * 100).toFixed(0)}% of gross profit, so it carries the margin.</li>` +
      `<li>Retail gross margin is ${rt.gm.toFixed(1)}% against ${sv.gm.toFixed(1)}% for Service, so retail profit depends on volume.</li></ul>`;
  }
  seg('#p3Seg', v => { segSel = v; render(); });
  $('#p3Period').onchange = render;
  render();
})();

/* ===== Project 4: HR manpower & payroll ===== */
(function(){
  const regions = ['Chennai','Bangalore','Hyderabad','Coimbatore','Mumbai','Pune'], bus = ['HP','Samsung','Ray-Ban'];
  const r = rng(99), pm = ['Apr','May','Jun','Jul','Aug'];
  const locs = Array.from({length:22}, (_, i) => {
    const sb = Math.round(4 + r() * 12), vb = Math.round(2 + r() * 8);
    return {name:regions[i % 6].slice(0, 3).toUpperCase() + '-' + String(i + 1).padStart(2, '0'), region:regions[i % 6], bu:bus[Math.floor(r() * 3)],
      sb, sp:sb + Math.round(r() * 6 - 3), vb, vp:vb + Math.round(r() * 4 - 2)};
  });
  const net = [138, 131, 126, 149, 144], buShare = {HP:.52, Samsung:.22, Corporate:.2, 'Ray-Ban':.06}, regShare = {Chennai:.33, Bangalore:.22, Hyderabad:.14, Coimbatore:.13, Mumbai:.08, Pune:.1};
  fill('#p4Month', pm); $('#p4Month').selectedIndex = 4; fill('#p4Bu', ['All BUs', ...bus]); fill('#p4Region', ['All regions', ...regions]);
  let tab = 'total';
  const bud = l => tab === 'sales' ? l.sb : tab === 'service' ? l.vb : l.sb + l.vb;
  const pres = l => tab === 'sales' ? l.sp : tab === 'service' ? l.vp : l.sp + l.vp;
  const grp = (arr, key, keys) => keys.map(k => { const g = arr.filter(l => l[key] === k); return {k, b:sum(g.map(bud)), p:sum(g.map(pres))}; });
  const pairs = (g) => [{label:'Budget', data:g.map(x => x.b), backgroundColor:C.slate, borderRadius:4}, {label:'Present', data:g.map(x => x.p), backgroundColor:C.blue, borderRadius:4}];
  function render(){
    const bu = $('#p4Bu').value, rg = $('#p4Region').value, mi = $('#p4Month').selectedIndex;
    const d = locs.filter(l => (bu === 'All BUs' || l.bu === bu) && (rg === 'All regions' || l.region === rg));
    const B = sum(d.map(bud)), P = sum(d.map(pres)), vac = sum(d.map(l => Math.max(bud(l) - pres(l), 0))), exc = sum(d.map(l => Math.max(pres(l) - bud(l), 0)));
    $('#p4Kpis').innerHTML = kpi('Budget', B) + kpi('Current', P) + kpi('Vacancy', vac, '', vac ? 'down' : 'up') + kpi('Excess', exc, '', exc ? 'down' : 'up') +
      kpi('Fill rate', B ? (P / B * 100).toFixed(0) + '%' : '—') + kpi('Sales–Service gap', sum(d.map(l => l.sp)) - sum(d.map(l => l.vp)), 'Current sales minus service');
    draw('p4Bu2', {type:'bar', data:{labels:bus, datasets:pairs(grp(d, 'bu', bus))}, options:{scales:{y:yAxis(), x:xAxis()}}});
    draw('p4Reg', {type:'bar', data:{labels:regions, datasets:pairs(grp(d, 'region', regions))}, options:{scales:{y:yAxis(), x:xAxis()}}});
    const top = [...d].sort((a, b) => Math.abs(pres(b) - bud(b)) - Math.abs(pres(a) - bud(a))).filter(l => pres(l) !== bud(l)).slice(0, 8);
    $('#p4Loc').innerHTML = '<tr><th>Region</th><th>Store</th><th>BU</th><th>Vacancy</th><th>Excess</th></tr>' +
      (top.map(l => { const g = bud(l) - pres(l);
        return `<tr><td>${l.region}</td><td><b>${l.name}</b></td><td>${l.bu}</td><td>${g > 0 ? pill(g, 'warn') : ''}</td><td>${g < 0 ? pill(-g, 'blue') : ''}</td></tr>`; }).join('') || '<tr><td colspan="5">No gaps for this selection.</td></tr>');
    draw('p4Gap', {type:'bar', data:{labels:regions, datasets:[
      {label:'To hire: sales', data:regions.map(x => sum(d.filter(l => l.region === x).map(l => l.sb - l.sp))), backgroundColor:C.amber, borderRadius:4},
      {label:'To hire: service', data:regions.map(x => sum(d.filter(l => l.region === x).map(l => l.vb - l.vp))), backgroundColor:C.teal, borderRadius:4}]},
      options:{scales:{y:{grid:{color:C.grid}}, x:xAxis()}}});

    const bs = bu === 'All BUs' ? 1 : buShare[bu], rs = rg === 'All regions' ? 1 : regShare[rg], sc = bs * rs;
    const vals = net.slice(0, mi + 1).map(v => v * sc), cur = vals[mi], prv = mi ? vals[mi - 1] : null;
    const hi = vals.indexOf(Math.max(...vals)), lo = vals.indexOf(Math.min(...vals));
    $('#p4PayKpis').innerHTML = kpi('Total net salary', sum(vals).toFixed(1), 'Apr to ' + pm[mi] + ' · ₹ lakh') + kpi('Avg net per month', (sum(vals) / vals.length).toFixed(1)) +
      kpi('Highest month', pm[hi], vals[hi].toFixed(1)) + kpi('Lowest month', pm[lo], vals[lo].toFixed(1)) +
      kpi('MoM change', prv ? sgn(cur - prv) : '—', prv ? 'vs ' + pm[mi - 1] : '', prv ? cls(cur - prv) : 'flat');
    const gross = cur * 1.16;
    draw('p4Donut', {type:'doughnut', data:{labels:Object.keys(buShare), datasets:[{data:Object.values(buShare).map(s => +(net[mi] * 1.16 * rs * s).toFixed(1)), backgroundColor:[C.blue, C.teal, C.navy, C.sky], borderWidth:0}]}, options:{cutout:'60%'}});
    draw('p4Trend', {type:'line', data:{labels:pm.slice(0, mi + 1), datasets:[{label:'Net salary', data:vals.map(v => +v.toFixed(1)), borderColor:C.blue, backgroundColor:'rgba(37,99,235,.12)', fill:true, tension:.35}]},
      options:{plugins:{legend:{display:false}}, scales:{y:yAxis(), x:xAxis()}}});
    const dept = [['Sales',410],['Service',352],['Accounts',26],['Logistics',27],['SME',19],['Process',14],['Admin',14],['Support',13],['IT',12],['HR',11],['Other',18]];
    draw('p4Dept', {type:'bar', data:{labels:dept.map(x => x[0]), datasets:[{label:'Headcount', data:dept.map(x => Math.round(x[1] * sc)), backgroundColor:C.navy, borderRadius:4}]},
      options:{indexAxis:'y', plugins:{legend:{display:false}}, scales:{x:yAxis(), y:{grid:{display:false}}}}});
    draw('p4Pay', {type:'bar', data:{labels:regions, datasets:[
      {label:'Total gross', data:regions.map(x => +(net[mi] * 1.16 * regShare[x] * bs).toFixed(1)), backgroundColor:C.blue, borderRadius:4},
      {label:'Net salary', data:regions.map(x => +(net[mi] * regShare[x] * bs).toFixed(1)), backgroundColor:C.teal, borderRadius:4}]},
      options:{scales:{y:yAxis(), x:xAxis()}}});
    const sal = [.8, 10.4, .6, 12.9, 6.2, 1.4], lbl = ['HP Sales','HP Service','SA Sales','SA Service','RB Sales','SME'];
    draw('p4Share', {type:'bar', data:{labels:lbl, datasets:[
      {label:'Sales %', data:sal.map(s => +(100 - s).toFixed(1)), backgroundColor:C.blue},
      {label:'Salary %', data:sal, backgroundColor:C.amber}]},
      options:{scales:{x:{stacked:true, grid:{display:false}}, y:{stacked:true, max:100, grid:{color:C.grid}, ticks:{callback:v => v + '%'}}}}});
  }
  ['#p4Month', '#p4Bu', '#p4Region'].forEach(s => $(s).onchange = render);
  seg('#p4Seg', v => { tab = v; render(); });
  render();
})();

/* ===== page behaviour ===== */
$('#yr').textContent = new Date().getFullYear();
$('#navToggle').onclick = () => $('#navLinks').classList.toggle('open');
document.querySelectorAll('#navLinks a').forEach(a => a.onclick = () => $('#navLinks').classList.remove('open'));
$('#copyEmail').onclick = e => { navigator.clipboard && navigator.clipboard.writeText('nicksondarwin05@gmail.com'); e.target.textContent = 'Copied!'; setTimeout(() => e.target.textContent = 'Copy email', 1800); };
const io = new IntersectionObserver(es => es.forEach(x => { if(x.isIntersecting){ x.target.classList.add('in'); io.unobserve(x.target); } }), {threshold:.08});
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
const links = [...document.querySelectorAll('#navLinks a')], secs = links.map(a => document.querySelector(a.getAttribute('href')));
addEventListener('scroll', () => { let cur = 0; secs.forEach((s, i) => { if(s && s.getBoundingClientRect().top < 120) cur = i; }); links.forEach((a, i) => a.classList.toggle('on', i === cur)); });

/* ===== case study popups ===== */
(function(){
  let openEl = null, lastFocus = null;
  function open(id){
    const m = document.getElementById(id); if(!m) return;
    lastFocus = document.activeElement; openEl = m;
    m.classList.add('open'); m.setAttribute('aria-hidden', 'false'); m.scrollTop = 0;
    document.body.classList.add('lock');
    requestAnimationFrame(() => Object.values(Chart.instances).forEach(c => c.resize()));
  }
  function close(){
    if(!openEl) return;
    openEl.classList.remove('open'); openEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lock'); openEl = null;
    if(lastFocus) lastFocus.focus({preventScroll:true});
  }
  document.querySelectorAll('[data-open]').forEach(c => {
    c.addEventListener('click', () => open(c.dataset.open));
    c.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(c.dataset.open); } });
  });
  document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', e => { if(e.target === m || e.target.closest('.modal-close')) close(); });
  });
  addEventListener('keydown', e => { if(e.key === 'Escape') close(); });
})();

/* ===== solar orbit tool stack (logos) ===== */
(function(){
  const si = n => `https://cdn.simpleicons.org/${n}`;
  const svg = x => 'data:image/svg+xml;utf8,' + encodeURIComponent(x);
  const bolna = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="#0B1B3A"/><g fill="#14B8A6"><rect x="9" y="20" width="4" height="8" rx="2"/><rect x="16" y="14" width="4" height="20" rx="2"/><rect x="23" y="9" width="4" height="30" rx="2"/><rect x="30" y="14" width="4" height="20" rx="2"/><rect x="37" y="20" width="4" height="8" rx="2"/></g></svg>');
  const pa = svg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M8 8h18c3 0 5 2 7 4l9 9c2 2 2 4 0 6l-9 9c-2 2-4 4-7 4H8l14-14z" fill="#0066FF"/><path d="M8 8l14 14L8 36z" fill="#0A3EB5"/></svg>');
  const rings = [
    {r:105, t:44, rev:false, nodes:[
      ['https://api.iconify.design/logos/oracle.svg','Oracle SQL','Data modelling and reporting queries behind the sales, P&L and HR dashboards.','#14B8A6'],
      [si('metabase'),'Metabase','Management dashboards with filters for retail, finance and HR views.','#14B8A6'],
      ['https://api.iconify.design/logos/microsoft-power-bi.svg','Power BI','KPI dashboards and executive reporting.','#14B8A6']]},
    {r:170, t:64, rev:true, nodes:[
      ['https://api.iconify.design/vscode-icons/file-type-excel.svg','Advanced Excel','Analysis, reconciliation and sales incentive calculations.','#2563EB'],
      [si('python'),'Python','Data cleaning and analysis scripts.','#2563EB'],
      [pa,'Power Automate','Scheduled, error-free reporting workflows that replace manual effort.','#2563EB'],
      [si('googlesheets'),'Google Sheets','Lightweight reporting and data capture.','#2563EB'],
      [si('javascript'),'JavaScript','Web-based service data application.','#2563EB']]},
    {r:235, t:90, rev:false, nodes:[
      [si('googleappsscript'),'Google Apps Script','Triggers feedback calls and passes customer and purchase details to Bolna.','#60A5FA'],
      [bolna,'Bolna','AI voice agent that calls customers for feedback and ratings.','#60A5FA'],
      [si('whatsapp'),'WhatsApp API','Automated production reports and customer chatbots.','#60A5FA']]}
  ];
  const orbit = document.getElementById('orbit'), info = document.getElementById('orbitInfo');
  if(!orbit) return;
  rings.forEach(g => {
    const ring = document.createElement('div');
    ring.className = 'ring' + (g.rev ? ' rev' : '');
    ring.style.cssText = `--t:${g.t}s;--r:${g.r}px`;
    ring.innerHTML = '<i></i>';
    g.nodes.forEach((n, i) => {
      const node = document.createElement('div'), a = Math.round(360 / g.nodes.length * i + (g.r % 7) * 6);
      node.className = 'node'; node.style.cssText = `--a:${a}deg;--r:${g.r}px`;
      node.innerHTML = `<div class="nb" style="--c:${n[3]};--t:${g.t}s" tabindex="0" role="button" aria-label="${n[1]}" title="${n[1]}"><img src="${n[0]}" alt="${n[1]} logo"></div>`;
      const show = () => { orbit.querySelectorAll('.nb.on').forEach(x => x.classList.remove('on')); node.firstChild.classList.add('on');
        info.innerHTML = `<b>${n[1]}</b><span>${n[2]}</span>`; };
      node.firstChild.addEventListener('pointerenter', show); node.firstChild.addEventListener('focus', show);
      ring.appendChild(node);
    });
    orbit.appendChild(ring);
  });
  const reset = () => { orbit.querySelectorAll('.nb.on').forEach(x => x.classList.remove('on')); info.innerHTML = '<b>Select a tool</b><span>Hover over any tool to see how I use it.</span>'; };
  orbit.addEventListener('pointerleave', reset);
  reset();
})();

/* ===== career trajectory tabs ===== */
(function(){
  const tr = document.getElementById('trail'); if(!tr) return;
  tr.addEventListener('click', e => {
    const b = e.target.closest('.tr'); if(!b) return;
    tr.querySelectorAll('.tr').forEach(x => x.classList.toggle('on', x === b));
    document.querySelectorAll('.pane').forEach(p => p.classList.toggle('on', p.id === b.dataset.p));
  });
})();
