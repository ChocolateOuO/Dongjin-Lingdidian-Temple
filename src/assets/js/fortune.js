/* fortune.js — 線上求籤（六十甲子籤）。需先載入 lunar.js；showToast 來自 site.js。 */
const FORTUNE_DATA = (window.__FORTUNE_STICKS__ || {sticks:[],aspectKeys:[]});
const FORTUNE_STICKS = FORTUNE_DATA.sticks;
const ASPECT_KEYS = FORTUNE_DATA.aspectKeys || ["求財","婚姻","功名","疾病","家運","行人","失物","訴訟"];

let currentStick = null;

function fortuneShowStep(id){
  document.querySelectorAll('.fortune-step').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

let selectedMatterValue = null;
let fortuneUserName = '';
let fortuneMatterLabel = '';

const MATTER_LABELS = {
  '事業':'事業／工作','感情':'感情／婚姻','健康':'健康','財運':'財運',
  '家運':'家運／平安','學業':'學業／考試'
};

function selectMatter(el){
  document.querySelectorAll('.matter-chip').forEach(c=>c.classList.remove('selected'));
  el.classList.add('selected');
  selectedMatterValue = el.dataset.value;
  const otherWrap = document.getElementById('otherMatterWrap');
  if(selectedMatterValue === '其他'){
    otherWrap.style.display = '';
    document.getElementById('otherMatterInput').focus();
  }else{
    otherWrap.style.display = 'none';
    clearFieldError('otherMatterInput');
  }
  const grid = document.getElementById('matterGrid');
  grid.classList.remove('invalid-pulse');
}

function clearFieldError(fieldId){
  const input = document.getElementById(fieldId);
  const errorId = fieldId === 'fortuneName' ? 'fortuneNameError' : 'otherMatterError';
  input.classList.remove('invalid');
  document.getElementById(errorId).classList.remove('show');
}

function fortuneStart(){
  let valid = true;

  const nameInput = document.getElementById('fortuneName');
  const name = nameInput.value.trim();
  if(!name){
    nameInput.classList.add('invalid');
    document.getElementById('fortuneNameError').classList.add('show');
    valid = false;
  }else{
    nameInput.classList.remove('invalid');
    document.getElementById('fortuneNameError').classList.remove('show');
  }

  if(!selectedMatterValue){
    const grid = document.getElementById('matterGrid');
    grid.classList.remove('invalid-pulse');
    void grid.offsetWidth;
    grid.classList.add('invalid-pulse');
    valid = false;
  }

  let otherText = '';
  if(selectedMatterValue === '其他'){
    const otherInput = document.getElementById('otherMatterInput');
    otherText = otherInput.value.trim();
    if(!otherText){
      otherInput.classList.add('invalid');
      document.getElementById('otherMatterError').classList.add('show');
      valid = false;
    }else{
      otherInput.classList.remove('invalid');
      document.getElementById('otherMatterError').classList.remove('show');
    }
  }

  if(!valid){
    if(!name) nameInput.focus();
    return;
  }

  fortuneUserName = name;
  fortuneMatterLabel = selectedMatterValue === '其他' ? otherText : MATTER_LABELS[selectedMatterValue];

  const hint = document.getElementById('fortuneDrawHint');
  hint.textContent = fortuneUserName + '，請誠心默念「' + fortuneMatterLabel + '」之事，接著點選籤筒抽籤。';
  fortuneShowStep('fortuneDrawStep');
}

function spawnSparkles(container, count){
  const rect = container.getBoundingClientRect();
  const originX = rect.width / 2;
  const originY = rect.height * 0.32;
  for(let i=0;i<count;i++){
    const s = document.createElement('div');
    s.className = 'spark';
    const angle = Math.random() * Math.PI * 2;
    const dist = 26 + Math.random() * 46;
    s.style.left = originX + 'px';
    s.style.top = originY + 'px';
    s.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
    s.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
    s.style.animationDelay = (Math.random() * 0.15) + 's';
    container.appendChild(s);
    setTimeout(()=> s.remove(), 900);
  }
}

function drawStick(){
  const bucket = document.getElementById('stickBucket');
  const btn = document.getElementById('drawStickBtn');
  if(bucket.classList.contains('shaking')) return;
  bucket.classList.add('shaking');
  btn.disabled = true;
  spawnSparkles(bucket, 6);
  const midSpark = setTimeout(()=> spawnSparkles(bucket, 5), 600);

  setTimeout(()=>{
    clearTimeout(midSpark);
    bucket.classList.remove('shaking');
    spawnSparkles(bucket, 14);
    const flying = document.getElementById('flyingStick');
    flying.classList.remove('launch');
    void flying.offsetWidth; // 重新觸發動畫
    flying.classList.add('launch');

    setTimeout(()=>{
      btn.disabled = false;
      currentStick = FORTUNE_STICKS[Math.floor(Math.random()*FORTUNE_STICKS.length)];
      document.getElementById('drawnNumber').textContent = '第 ' + currentStick.no + ' 籤　' + currentStick.gz;
      document.getElementById('jiaoResultText').textContent = '';
      document.getElementById('jiaoResultText').className = 'jiao-result';
      document.getElementById('retryFortuneBtn').style.display = 'none';
      jiaoLocked = false;
      document.getElementById('throwJiaoBtn').disabled = false;
      document.getElementById('jiaoRow').classList.remove('disabled');
      const j1 = document.getElementById('jiao1'), j2 = document.getElementById('jiao2');
      j1.classList.remove('tossing'); j2.classList.remove('tossing');
      j1.querySelector('.jiao-inner').style.transform = 'rotateX(0deg)';
      j2.querySelector('.jiao-inner').style.transform = 'rotateX(0deg)';
      document.getElementById('jiaoStage').className = 'jiao-stage';
      fortuneShowStep('fortuneConfirmStep');
    }, 550);
  }, 1500);
}

function spawnJiaoImpact(stage, color){
  const rect = stage.getBoundingClientRect();
  for(let i=0;i<8;i++){
    const s = document.createElement('div');
    s.className = 'jiao-impact';
    s.style.background = color;
    const angle = Math.random() * Math.PI * 2;
    const dist = 20 + Math.random() * 34;
    s.style.left = (rect.width/2) + 'px';
    s.style.bottom = '18px';
    s.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
    s.style.setProperty('--ty', Math.sin(angle) * dist * 0.5 + 'px');
    stage.appendChild(s);
    setTimeout(()=> s.remove(), 750);
  }
}

let isTossingJiao = false;
let jiaoLocked = false;

function throwJiao(){
  if(isTossingJiao || jiaoLocked) return;
  isTossingJiao = true;
  const btn = document.getElementById('throwJiaoBtn');
  btn.disabled = true;
  document.getElementById('retryFortuneBtn').style.display = 'none';

  const stage = document.getElementById('jiaoStage');
  stage.className = 'jiao-stage';
  const j1 = document.getElementById('jiao1'), j2 = document.getElementById('jiao2');
  const inner1 = j1.querySelector('.jiao-inner'), inner2 = j2.querySelector('.jiao-inner');

  const up1 = Math.random() < 0.5;
  const up2 = Math.random() < 0.5;
  // 多轉幾圈製造拋擲感，最後停在對應的正反面
  inner1.style.transform = 'rotateX(' + (720 + (up1 ? 0 : 180)) + 'deg)';
  inner2.style.transform = 'rotateX(' + (1080 + (up2 ? 0 : 180)) + 'deg)';
  j1.classList.add('tossing'); j2.classList.add('tossing');

  const resultEl = document.getElementById('jiaoResultText');
  resultEl.textContent = '擲筊中…';
  resultEl.className = 'jiao-result';

  setTimeout(()=>{
    j1.classList.remove('tossing'); j2.classList.remove('tossing');
    isTossingJiao = false;

    let colorVar;
    if(up1 !== up2){
      btn.disabled = false;
      resultEl.textContent = '聖筊－ 神明應允，正在為您展開籤詩…';
      resultEl.className = 'jiao-result sheng pop';
      stage.className = 'jiao-stage result-sheng';
      colorVar = getComputedStyle(document.documentElement).getPropertyValue('--jade') || '#4a8c63';
      spawnJiaoImpact(stage, colorVar);
      setTimeout(()=> showFortuneResult(), 1000);
    } else if(up1 && up2){
      jiaoLocked = true;
      btn.disabled = true;
      document.getElementById('jiaoRow').classList.add('disabled');
      resultEl.textContent = '笑筊 － 神明微笑示意，題意未明，請重新誠心求籤。';
      resultEl.className = 'jiao-result xiao pop';
      stage.className = 'jiao-stage result-xiao';
      colorVar = getComputedStyle(document.documentElement).getPropertyValue('--gold') || '#d4a636';
      spawnJiaoImpact(stage, colorVar);
      document.getElementById('retryFortuneBtn').style.display = 'inline-flex';
    } else {
      jiaoLocked = true;
      btn.disabled = true;
      document.getElementById('jiaoRow').classList.add('disabled');
      resultEl.textContent = '陰筊 － 尚未獲得應允，請重新誠心求籤。';
      resultEl.className = 'jiao-result yin pop';
      stage.className = 'jiao-stage result-yin';
      colorVar = getComputedStyle(document.documentElement).getPropertyValue('--red-2') || '#9b2a2a';
      spawnJiaoImpact(stage, colorVar);
      document.getElementById('retryFortuneBtn').style.display = 'inline-flex';
    }
  }, 950);
}

function retryFortune(){
  jiaoLocked = false;
  document.getElementById('jiaoRow').classList.remove('disabled');
  currentStick = null;
  fortuneShowStep('fortuneDrawStep');
}

/* 將一支籤渲染到籤詩卡（求籤結果與籤號查詢共用） */
function renderStickInto(stick, els){
  els.no.textContent = '第 ' + stick.no + ' 籤　' + stick.gz;
  els.level.textContent = stick.level + '籤';
  els.level.className = 'level-badge level-' + stick.level;
  els.poem.innerHTML = stick.poem.map(l => '<span>' + l + '</span>').join('');
  if(els.holy) els.holy.textContent = stick.holy || '';
  if(els.explain) els.explain.textContent = stick.explain || '';
  if(els.plain) els.plain.textContent = stick.plain || '';
  if(els.aspects){
    els.aspects.innerHTML = ASPECT_KEYS
      .filter(k => stick.aspects && stick.aspects[k])
      .map(k => '<div class="aspect"><span class="a-k">' + k + '</span><span class="a-v">' + stick.aspects[k] + '</span></div>')
      .join('');
  }
}

function showFortuneResult(){
  fortuneShowStep('fortuneResultStep');
  document.getElementById('resultForWhom').textContent = fortuneUserName + '　誠心所求：' + fortuneMatterLabel;
  renderStickInto(currentStick, {
    no: document.getElementById('resultNo'),
    level: document.getElementById('resultLevel'),
    poem: document.getElementById('resultPoem'),
    holy: document.getElementById('resultHoly'),
    explain: document.getElementById('resultExplain'),
    plain: document.getElementById('resultNote'),
    aspects: document.getElementById('resultAspects'),
  });

  const now = new Date();
  const solarStr = now.getFullYear() + '年' + (now.getMonth()+1) + '月' + now.getDate() + '日';
  document.getElementById('slipDate').textContent = '求籤日期：西元' + solarStr + '　農曆' + getTodayLunarText();

  setTimeout(()=> spawnGoldDust(document.getElementById('fortuneSlip')), 150);
}

/* ---------------- 籤號查詢（不抽籤，直接查全文） ---------------- */
function lookupStick(){
  const input = document.getElementById('lookupInput');
  const box = document.getElementById('lookupResult');
  const n = parseInt(input.value, 10);
  if(!(n >= 1 && n <= 60)){
    box.innerHTML = '<p class="lookup-hint">請輸入 1 到 60 之間的籤號。</p>';
    box.classList.add('show');
    return;
  }
  const stick = FORTUNE_STICKS.find(s => s.no === n);
  if(!stick){ box.innerHTML = '<p class="lookup-hint">查無此籤。</p>'; box.classList.add('show'); return; }
  box.innerHTML =
    '<div class="lookup-head"><span class="lookup-no">第 ' + stick.no + ' 籤　' + stick.gz + '</span>' +
    '<span class="level-badge level-' + stick.level + '">' + stick.level + '籤</span></div>' +
    '<div class="poem-lines" id="lk-poem"></div>' +
    '<div class="slip-field"><b>聖意</b><span id="lk-holy"></span></div>' +
    '<div class="slip-field"><b>解曰</b><span id="lk-explain"></span></div>' +
    '<div class="slip-field"><b>白話參考</b><span id="lk-plain"></span></div>' +
    '<div class="aspect-grid" id="lk-aspects"></div>';
  box.classList.add('show');
  renderStickInto(stick, {
    no: { textContent: '' }, level: { textContent: '', className: '' },
    poem: document.getElementById('lk-poem'),
    holy: document.getElementById('lk-holy'),
    explain: document.getElementById('lk-explain'),
    plain: document.getElementById('lk-plain'),
    aspects: document.getElementById('lk-aspects'),
  });
}

function spawnGoldDust(container){
  if(!container || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer = document.createElement('div');
  layer.className = 'gold-dust-layer';
  const count = 26;
  for(let i=0;i<count;i++){
    const p = document.createElement('span');
    p.className = 'gold-dust';
    const size = 3 + Math.random()*3;
    p.style.left = (Math.random()*100) + '%';
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.setProperty('--delay', (Math.random()*0.6) + 's');
    p.style.setProperty('--dur', (1.8 + Math.random()*1.2) + 's');
    layer.appendChild(p);
  }
  container.appendChild(layer);
  setTimeout(()=> layer.remove(), 3200);
}

function printFortuneSlip(){
  window.print();
}

function saveFortuneImage(){
  const slip = document.getElementById('fortuneSlip');
  if(typeof html2canvas === 'undefined'){
    showToast('圖片功能載入中，請稍後再試一次');
    return;
  }
  html2canvas(slip, { backgroundColor: '#fbf3e2', scale: 2 }).then(canvas => {
    const link = document.createElement('a');
    link.download = '第' + (currentStick ? currentStick.no : '') + '籤_東津代天府靈帝殿.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }).catch(()=>{
    showToast('儲存圖片失敗，請改用「列印籤詩」');
  });
}

function resetFortune(){
  currentStick = null;
  selectedMatterValue = null;
  fortuneUserName = '';
  fortuneMatterLabel = '';
  document.getElementById('fortuneName').value = '';
  document.getElementById('otherMatterInput').value = '';
  document.getElementById('otherMatterWrap').style.display = 'none';
  document.querySelectorAll('.matter-chip').forEach(c=>c.classList.remove('selected'));
  clearFieldError('fortuneName');
  clearFieldError('otherMatterInput');
  fortuneShowStep('fortuneFormStep');
}

/* 頁面載入時，於求籤卡片頂部顯示今日西曆／農曆日期 */
(function initFortuneDateBar(){
  const bar = document.getElementById('fortuneDateBar');
  if(!bar) return;
  const now = new Date();
  const solarStr = now.getFullYear() + '年' + (now.getMonth()+1) + '月' + now.getDate() + '日';
  bar.textContent = '今日西曆 ' + solarStr + '　｜　農曆 ' + getTodayLunarText();
})();
