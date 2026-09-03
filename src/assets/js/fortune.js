/* fortune.js — 線上求籤（六十甲子籤）。需先載入 lunar.js；showToast 來自 site.js。 */
const FORTUNE_STICKS = [{"no": 1, "gz": "甲子", "poem": ["日出便見風雲散", "光明清淨照世間", "一向前途通大道", "萬事清吉保平安"], "level": "上", "note": "大吉之兆，撥雲見日，凡事順遂，可放心前行。"}, {"no": 2, "gz": "甲寅", "poem": ["於今此景正當時", "看看欲吐百花魁", "若能遇得春色到", "一洒清吉脫塵埃"], "level": "上", "note": "春回大地，機運漸開，把握眼前時機可得吉慶。"}, {"no": 3, "gz": "甲辰", "poem": ["勸君把定心莫虛", "天註衣祿自有餘", "和合重重常吉慶", "時來終遇得明珠"], "level": "上", "note": "心誠意堅，衣食自有餘裕，貴人自來成全好事。"}, {"no": 4, "gz": "甲午", "poem": ["風恬浪靜可行舟", "恰是中秋月一輪", "凡事不須多憂慮", "福祿自有慶家門"], "level": "上", "note": "風平浪靜，諸事穩妥，不必過度憂慮，福祿自來。"}, {"no": 5, "gz": "甲申", "poem": ["只恐前途命有變", "勸君作急可宜先", "且守長江無大事", "命逢太白守身邊"], "level": "中", "note": "事有變數，宜謹慎行事，安守本分方能無虞。"}, {"no": 6, "gz": "甲戌", "poem": ["風雲致雨落洋洋", "天災時氣必有傷", "命內此事難和合", "更逢一足出外鄉"], "level": "下", "note": "恐有意外波折，行事宜多加防範，暫緩躁進。"}, {"no": 7, "gz": "乙丑", "poem": ["雲開月出正分明", "不須進退問前程", "婚姻皆由天註定", "和合清吉萬事成"], "level": "上", "note": "婚姻前程自有天定，不必猶疑，終能圓滿。"}, {"no": 8, "gz": "乙卯", "poem": ["禾稻看看結成完", "此事必定兩相全", "回到家中寬心坐", "妻兒鼓舞樂團圓"], "level": "上", "note": "所求之事可望圓滿，家庭和樂，苦盡甘來。"}, {"no": 9, "gz": "乙巳", "poem": ["龍虎相隨在深山", "君爾何須背後看", "不知此去相愛愉", "他日與我卻無干"], "level": "中", "note": "兩人緣分恐難長久，看淡得失，順其自然即可。"}, {"no": 10, "gz": "乙未", "poem": ["花開結子一半枯", "可惜今年汝虛度", "漸漸日落西山去", "勸君不用向前途"], "level": "下", "note": "運勢稍歇，今年宜守成，不宜躁進強求。"}, {"no": 11, "gz": "乙酉", "poem": ["靈雞漸漸見分明", "凡事且看子丑寅", "雲開月出照天下", "郎君即便見太平"], "level": "中", "note": "事情逐漸明朗，耐心等待，終見天日。"}, {"no": 12, "gz": "乙亥", "poem": ["長江風浪漸漸靜", "于今得進可安寧", "必有貴人相扶助", "凶事脫出見太平"], "level": "上", "note": "風浪漸息，安穩可期，貴人相助化險為夷。"}, {"no": 13, "gz": "丙子", "poem": ["命中正逢羅孛關", "用盡心機總未休", "作福問神難得過", "恰是行舟上高灘"], "level": "下", "note": "諸事阻滯難行，強求無益，宜靜待時機。"}, {"no": 14, "gz": "丙寅", "poem": ["財中漸漸見分明", "花開花謝結子成", "寬心且看月中桂", "郎君即便見太平"], "level": "中", "note": "財運漸露曙光，寬心靜待，好事自然來到。"}, {"no": 15, "gz": "丙辰", "poem": ["八十原來是太公", "看看晚景遇文王", "目下緊事休相問", "勸君且守待運通"], "level": "中", "note": "時機未到，宜韜光養晦，靜待時來運轉。"}, {"no": 16, "gz": "丙午", "poem": ["不須作福不須求", "用盡心機總未休", "陽世不知陰世事", "官法如爐不自由"], "level": "下", "note": "諸事難成，強求無用，宜順其自然。"}, {"no": 17, "gz": "丙申", "poem": ["舊恨重重未改為", "家中禍患不臨身", "須當謹防宜作福", "龍蛇交會得和合"], "level": "中", "note": "家中宜多留意，謹慎行事、廣行善事可保平安。"}, {"no": 18, "gz": "丙戌", "poem": ["君問中間此言因", "看看祿馬拱前程", "若得貴人多得利", "和合自有兩分明"], "level": "中", "note": "貴人扶持在望，事情將逐漸明朗有利。"}, {"no": 19, "gz": "丁丑", "poem": ["富貴由命天註定", "心高必然誤君期", "不然且回依舊路", "雲開月出自分明"], "level": "中", "note": "富貴自有定數，切莫心高氣傲，安守本分為宜。"}, {"no": 20, "gz": "丁卯", "poem": ["前途功名未得意", "只恐命內有交加", "兩家必定防損失", "勸君且退莫咨嗟"], "level": "下", "note": "功名尚未如意，宜謹慎行事，暫且退讓觀望。"}, {"no": 21, "gz": "丁巳", "poem": ["十方佛法有靈通", "大難禍患不相同", "紅日當空常照耀", "還有貴人到家堂"], "level": "上", "note": "佛法庇佑，大難化小，貴人將至家中相助。"}, {"no": 22, "gz": "丁未", "poem": ["太公家業八十成", "月出光輝四海明", "命內自然逢大吉", "茅屋中間百事亨"], "level": "上", "note": "家業有成，光明在望，諸事皆能順遂亨通。"}, {"no": 23, "gz": "丁酉", "poem": ["欲去長江水闊茫", "前途未遂運未通", "如今絲綸常在手", "只恐魚水不相逢"], "level": "下", "note": "前路茫然運勢未通，宜守成待時，勿躁進強求。"}, {"no": 24, "gz": "丁亥", "poem": ["月出光輝四海明", "前途祿位見太平", "浮雲掃退終無事", "可保禍患不臨身"], "level": "上", "note": "光明普照前程可期，浮雲散去，禍患不侵。"}, {"no": 25, "gz": "戊子", "poem": ["總是前途莫心勞", "求神問聖枉是多", "但看雞犬日過後", "不須作福事如何"], "level": "中", "note": "徒勞心力無益，宜順其自然，靜待時機轉變。"}, {"no": 26, "gz": "戊寅", "poem": ["選出牡丹第一枝", "勸君折取莫遲疑", "世間若問相知處", "萬事逢春正及時"], "level": "上", "note": "良機當前，勿再遲疑，把握時機正逢其時。"}, {"no": 27, "gz": "戊辰", "poem": ["君爾寬心且自由", "門庭清吉家無憂", "財寶自然終吉利", "凡事無傷不用求"], "level": "上", "note": "心可寬放，家門清吉無憂，財利自然而來。"}, {"no": 28, "gz": "戊午", "poem": ["於今莫作此當時", "虎落平陽被犬欺", "世間凡事何難定", "千山萬水也遲疑"], "level": "下", "note": "時運不濟，恐受人欺，凡事宜多加考量。"}, {"no": 29, "gz": "戊申", "poem": ["枯木可惜未逢春", "如今反在暗中藏", "寬心且守風霜退", "還君依舊作乾坤"], "level": "中", "note": "時機未到宜靜待，寬心守候終能否極泰來。"}, {"no": 30, "gz": "戊戌", "poem": ["漸漸看此月中和", "過後須防未得高", "改變顏色前途去", "凡事必定見重勞"], "level": "下", "note": "前路漸見起色，然仍須提防辛勞，不可鬆懈。"}, {"no": 31, "gz": "己丑", "poem": ["綠柳蒼蒼正當時", "任君此去作乾坤", "花果結實無殘謝", "福祿自有慶家門"], "level": "上", "note": "生機蓬勃，正是耕耘時機，福祿自然隨之而來。"}, {"no": 32, "gz": "己卯", "poem": ["龍虎相交在門前", "此事必定兩相連", "黃金忽然變成鐵", "何用作福問神仙"], "level": "下", "note": "情勢反覆不定，不必強求，順其自然為佳。"}, {"no": 33, "gz": "己巳", "poem": ["欲去長江水闊茫", "行舟把定未遭風", "戶內用心再作福", "看看魚水得相逢"], "level": "中", "note": "前途茫然但用心經營，終能如願以償。"}, {"no": 34, "gz": "己未", "poem": ["危險高山行過盡", "莫嫌此路有重重", "若見蘭桂漸漸發", "長蛇反轉變成龍"], "level": "中", "note": "難關已過，漸見曙光，否極泰來指日可待。"}, {"no": 35, "gz": "己酉", "poem": ["此事何須用心機", "前途變怪自然知", "看看此去得和合", "漸漸脫出見太平"], "level": "中", "note": "不必多費心機，事情終將和合，撥雲見日。"}, {"no": 36, "gz": "己亥", "poem": ["福如東海壽如山", "君爾何須嘆苦難", "命內自然逢大吉", "祈保分明自平安"], "level": "上", "note": "福壽雙全，大吉之兆，凡事皆能平安順遂。"}, {"no": 37, "gz": "庚子", "poem": ["運逢得意身顯變", "君爾身中皆有益", "一向前途無難事", "決意之中保清吉"], "level": "上", "note": "時來運轉顯達在望，前途一片清吉無礙。"}, {"no": 38, "gz": "庚寅", "poem": ["名顯有意在中央", "不須祈禱心自安", "看看早晚日過後", "即時得意在其間"], "level": "上", "note": "心安理得，時機一到便能如願得意。"}, {"no": 39, "gz": "庚辰", "poem": ["意中若問神仙路", "勸爾且退望高樓", "寬心且守寬心坐", "必然遇得貴人扶"], "level": "中", "note": "宜暫緩腳步耐心等候，終將遇貴人相助。"}, {"no": 40, "gz": "庚午", "poem": ["平生富貴成祿位", "君家門戶定光輝", "此中必定無損失", "夫妻百歲喜相隨"], "level": "上", "note": "富貴祿位穩固，家門光輝，夫妻和睦到老。"}, {"no": 41, "gz": "庚申", "poem": ["今行到此實難推", "歌歌暢飲自徘徊", "雞犬相聞消息近", "婚姻夙世結成雙"], "level": "中", "note": "婚姻姻緣天注定，佳訊將至，宜寬心以待。"}, {"no": 42, "gz": "庚戌", "poem": ["一重江水一重山", "誰知此去路又難", "任他改求終不過", "是非終久未得安"], "level": "下", "note": "前路重重阻礙，是非糾纏難解，宜謹慎應對。"}, {"no": 43, "gz": "辛丑", "poem": ["一年作事急如飛", "君爾寬心莫遲疑", "貴人還在千里外", "音信月中漸漸知"], "level": "中", "note": "事情進展雖急，宜寬心稍待，貴人音訊將至。"}, {"no": 44, "gz": "辛卯", "poem": ["客到前途多得利", "君爾何故兩相疑", "雖是中間逢進退", "月出光輝得運時"], "level": "中", "note": "財利可期，雖有猶疑進退，終能時來運轉。"}, {"no": 45, "gz": "辛巳", "poem": ["花開今已結成果", "富貴榮華終到老", "君子小人相會合", "萬事清吉莫煩惱"], "level": "上", "note": "修成正果富貴到老，萬事清吉不必憂煩。"}, {"no": 46, "gz": "辛未", "poem": ["功名得意與君顯", "前途富貴喜安然", "若遇一輪明月照", "十五團圓光滿天"], "level": "上", "note": "功名顯達前途光明，如圓月當空指日可期。"}, {"no": 47, "gz": "辛酉", "poem": ["君爾何須問聖跡", "自己心中皆有益", "於今且看月中旬", "凶事脫出化成吉"], "level": "中", "note": "答案早在心中，凶事終將化解為吉祥。"}, {"no": 48, "gz": "辛亥", "poem": ["陽世作事未和同", "雲遮月色正朦朧", "心中意欲前途去", "只恐命內運未通"], "level": "下", "note": "前路朦朧尚未明朗，行事宜靜待時運轉開。"}, {"no": 49, "gz": "壬子", "poem": ["言語雖多不可從", "風雲靜處未行龍", "暗中終得明消息", "君爾何須問重重"], "level": "中", "note": "他人言語紛擾不必輕信，佳音終將暗中傳來。"}, {"no": 50, "gz": "壬寅", "poem": ["佛前發誓無異心", "且看前途得好音", "此物原來本是鐵", "也能變化得成金"], "level": "中", "note": "誠心不變終見好音，逆境亦能轉化為佳境。"}, {"no": 51, "gz": "壬辰", "poem": ["東西南北不堪行", "前途此事正可當", "勸君把定莫煩惱", "家門自有保安康"], "level": "中", "note": "行止宜謹慎沉穩，安守本分自得家門康泰。"}, {"no": 52, "gz": "壬午", "poem": ["功名事業本由天", "不須掛念意懸懸", "若問中間遲與速", "風雲際會在眼前"], "level": "中", "note": "功名自有天定，不必掛心，時機將至眼前。"}, {"no": 53, "gz": "壬申", "poem": ["看君來問心中事", "積善之家慶有餘", "運亨財子雙雙至", "指日喜氣溢門閭"], "level": "上", "note": "積善之家福澤深厚，財子雙全喜氣盈門。"}, {"no": 54, "gz": "壬戌", "poem": ["孤燈寂寂夜沉沉", "萬事清吉萬事成", "若逢陰中有善果", "燒得好香達神明"], "level": "中", "note": "靜心行善終有所成，誠心敬神可保平安。"}, {"no": 55, "gz": "癸丑", "poem": ["須知進退總言虛", "看看發暗未必全", "珠玉深藏還未變", "心中但得枉徒然"], "level": "下", "note": "表面看似難全，實則珠玉暗藏，徒憂無益。"}, {"no": 56, "gz": "癸卯", "poem": ["病中若得苦心勞", "到底完全總未遭", "去後不須回頭問", "心中事務盡消磨"], "level": "下", "note": "病中辛勞漸消，不必回頭掛念，寬心靜養。"}, {"no": 57, "gz": "癸巳", "poem": ["勸君把定心莫虛", "前途清吉得運時", "到底中間無大事", "又遇神仙守安居"], "level": "上", "note": "心誠意堅前路清吉，終得神明庇佑安居樂業。"}, {"no": 58, "gz": "癸未", "poem": ["蛇身意欲變成龍", "只恐命內運未通", "久病且作寬心坐", "言語雖多不可從"], "level": "中", "note": "蛻變在望但時運未通，宜寬心靜候，勿聽妄言。"}, {"no": 59, "gz": "癸酉", "poem": ["有心作福莫遲疑", "求名清吉正當時", "此事必能成會合", "財寶自然喜相隨"], "level": "上", "note": "誠心行善把握良機，財利姻緣皆能如願。"}, {"no": 60, "gz": "癸亥", "poem": ["月出光輝本清吉", "浮雲總是蔽陰色", "戶內用心再作福", "當官分理便有益"], "level": "中", "note": "清吉光明終將顯現，浮雲遮蔽只是一時，用心行善可保平安。"}];

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

function showFortuneResult(){
  fortuneShowStep('fortuneResultStep');
  document.getElementById('resultForWhom').textContent = fortuneUserName + '　誠心所求：' + fortuneMatterLabel;
  document.getElementById('resultNo').textContent = '第 ' + currentStick.no + ' 籤　' + currentStick.gz;
  const levelEl = document.getElementById('resultLevel');
  levelEl.textContent = currentStick.level + '籤';
  levelEl.className = 'level-badge level-' + currentStick.level;
  document.getElementById('resultPoem').innerHTML = currentStick.poem.map(l => '<span>' + l + '</span>').join('');
  document.getElementById('resultNote').textContent = currentStick.note;

  const now = new Date();
  const solarStr = now.getFullYear() + '年' + (now.getMonth()+1) + '月' + now.getDate() + '日';
  document.getElementById('slipDate').textContent = '求籤日期：西元' + solarStr + '　農曆' + getTodayLunarText();

  setTimeout(()=> spawnGoldDust(document.getElementById('fortuneSlip')), 150);
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
