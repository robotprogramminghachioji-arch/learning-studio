import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {chromium} from 'playwright';
const root=fileURLToPath(new URL('../',import.meta.url));
const course=JSON.parse(await readFile(path.join(root,'assets/web-course.json'),'utf8'));
const plans=JSON.parse(await readFile(path.join(root,'assets/web-course-visuals.json'),'utf8'));
const out=path.join(root,'assets/web-course-visuals');await mkdir(out,{recursive:true});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const color={blue:'#204578',ink:'#233956',muted:'#60758d',line:'#cfdfed',pale:'#f0f6fc',gold:'#ffdc76',green:'#197961'};
function wrap(value,units){
 const lines=[];for(const part of String(value).split('\n')){let line='',n=0;for(const char of part){const w=/[\x00-\x7f]/.test(char)?.55:1;if(n+w>units&&line){lines.push(line);line='';n=0;}line+=char;n+=w;}lines.push(line);}return lines;
}
const text=(value,x,y,size=22,fill=color.ink,units=28,anchor='start')=>`<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" text-anchor="${anchor}">${wrap(value,units).map((l,i)=>`<tspan x="${x}" dy="${i?size*1.4:0}">${esc(l)}</tspan>`).join('')}</text>`;
const rect=(x,y,w,h,fill=color.pale,stroke=color.line,r=14)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
const arrow=(x1,y1,x2,y2)=>`<path d="M${x1} ${y1} L${x2} ${y2}" fill="none" stroke="#4387b9" stroke-width="3" marker-end="url(#arrow)"/>`;
const base=(title,content,height=440)=>`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="${height}" viewBox="0 0 640 ${height}" role="img" aria-label="${esc(title)}"><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10" fill="#4387b9"/></marker></defs><rect width="640" height="${height}" rx="16" fill="white"/><g font-family="'Noto Sans CJK JP','Noto Sans JP',sans-serif">${rect(16,16,608,58,color.blue,color.blue,12)}${text(title,32,53,25,'white',23)}${content}</g></svg>`;
function cards(nodes,arrows=true){return nodes.map((n,i)=>rect(20+i*213,145,174,172,i===1?'#fff5d3':color.pale)+`<circle cx="${48+i*213}" cy="177" r="15" fill="${color.blue}"/>`+text(i+1,48+i*213,184,18,'white',4,'middle')+text(n,107+i*213,221,22,color.ink,7,'middle')+(arrows&&i<2?arrow(200+i*213,235,226+i*213,235):'')).join('');}
function diagram(l,p){let art='';const k=p.kind;
 if(k==='box'){
  art=rect(52,111,536,274,'#fff4cf','#dfbf69')+text('margin：外側の余白',75,144,22)+rect(96,163,448,194,'#dbeafb','#4387b9')+text('border：枠',115,195,22)+rect(140,215,360,114,'white','#9cb7d3')+text('padding：内側の余白',160,246,22)+rect(228,267,184,44,color.blue,color.blue,8)+text('ボタンの内容',320,297,21,'white',12,'middle');
 }else if(['coordinates','walls'].includes(k)){
  art=text('x →',288,104,20,color.muted)+text('y ↓',91,241,20,color.muted);
  for(let y=0;y<5;y++)for(let x=0;x<5;x++){
   const wall=k==='walls'&&x===2&&y<2,player=x===0&&y===0,gem=x===4&&y===2;
   art+=rect(166+x*54,120+y*54,52,52,wall?'#526474':player?color.blue:gem?color.gold:color.pale,'#c5d5df',3);
   if(player||gem||wall)art+=text(player?'自':gem?'宝':'壁',192+x*54,154+y*54,22,player||wall?'white':color.ink,2,'middle');
  }
  for(let i=0;i<5;i++)art+=text(i,192+i*54,115,17,color.muted,2,'middle')+text(i,152,154+i*54,17,color.muted,2,'middle');
  art+=text('(0,0)',48,169,20)+text('(4,2)',466,277,20)+text(k==='walls'?'壁のない経路を選ぶ':'横と縦の両方が一致すると得点',320,422,21,color.blue,26,'middle');
 }else if(k==='mole'){
  for(let i=0;i<9;i++){const x=145+(i%3)*120,y=97+Math.floor(i/3)*96;art+=rect(x,y,110,86,i===4?color.gold:color.pale)+text(i===4?'もぐら':`穴 ${i}`,x+55,y+53,22,color.ink,6,'middle');}
  art+=text('図の例：active = 4 → 真ん中の穴だけ加点',320,418,20,color.blue,30,'middle');
 }else if(k==='responsive'){
  for(let mode=0;mode<2;mode++){const x=20+mode*310,cols=mode?2:3;art+=rect(x,105,290,282)+rect(x,105,290,43,color.blue,color.blue,12)+text(mode?'480px以下：2列':'広い画面：3列',x+145,135,20,'white',15,'middle');
   for(let i=0;i<6;i++){const w=mode?118:77;art+=rect(x+15+(i%cols)*(w+10),168+Math.floor(i/cols)*65,w,53,i===1?color.gold:'#dde9f5')+text(`箱${i+1}`,x+15+(i%cols)*(w+10)+w/2,201+Math.floor(i/cols)*65,20,color.ink,5,'middle');}}
  art+=text('同じ内容を、画面の幅に合わせて並べ直す',320,424,20,color.blue,27,'middle');
 }else if(k==='grid'){
  art=text('3等分 ＋ gap（間隔）',320,123,24,color.blue,22,'middle');
  for(let i=0;i<3;i++)art+=rect(28+i*210,166,164,147,i===1?color.gold:color.pale)+text(`箱 ${i+1}`,110+i*210,242,25,color.ink,7,'middle');
  art+=text('← gap →',214,349,20,color.blue,12,'middle')+text('宝は見本では箱2',320,400,22,color.ink,20,'middle');
 }else if(k==='flex'){
  art=text('広いとき：順番に横へ',24,116,22,color.blue);
  for(let i=0;i<3;i++)art+=rect(24+i*205,136,182,72)+text(`説明 ${i+1}`,115+i*205,181,22,color.ink,8,'middle');
  art+=text('狭いとき：はみ出す分を次の行へ',24,253,22,color.blue);
  for(let i=0;i<3;i++)art+=rect(24+(i%2)*205,270+Math.floor(i/2)*77,182,64,i===2?'#fff5d3':color.pale)+text(`説明 ${i+1}`,115+(i%2)*205,311+Math.floor(i/2)*77,22,color.ink,8,'middle');
 }else if(k==='branch'){
  art=rect(190,104,260,68,color.blue,color.blue)+text(k==='branch'?'自分と相手の手':'入力した値を確認',320,147,24,'white',14,'middle');
  for(let i=0;i<3;i++)art+=arrow(320,180,107+i*213,244)+rect(20+i*213,256,174,133,i===1?'#fff5d3':color.pale)+text(p.nodes[i],107+i*213,299,21,color.ink,7,'middle');
 }else if(k==='array'||k==='history'){
  const count=k==='array'?3:5,w=k==='array'?174:110,step=k==='array'?213:122;
  for(let i=0;i<count;i++)art+=text(`[${i}]`,20+i*step+w/2,144,22,color.blue,6,'middle')+rect(20+i*step,166,w,134,i===1?color.gold:color.pale)+text(k==='array'?`${i+1}問目`:`記録${i+1}`,20+i*step+w/2,240,24,color.ink,6,'middle');
  art+=text(k==='array'?'index = 1 → 2問目を取り出す':'追加で5件を超えたら、先頭の古い1件を外す',320,360,23,color.blue,25,'middle');
 }else if(k==='timeline'){
  art+=rect(45,144,550,80,'#e5f4e9','#c3dfcd')+text('得点できる時間',320,194,26,'#216a50',20,'middle')+arrow(64,262,581,262);
  [0,5,10].forEach((n,i)=>{const x=68+i*250;art+=`<path d="M${x} 248 V278" stroke="${color.blue}" stroke-width="3"/>`+text(`${n}秒`,x,316,24,color.ink,5,'middle');});
  art+=text('開始',68,360,22,color.blue,5,'middle')+text('終了：以後は加点しない',430,360,22,color.blue,15,'middle');
 }else if(k==='image'){
  art=rect(30,110,235,276,color.pale)+`<path d="M148 141 L173 210 L245 214 L189 258 L209 333 L148 287 L88 333 L108 258 L52 214 L123 210Z" fill="#ffc83d"/>`;
  ['src：埋め込んだ星の画像','alt：黄色い星','width・height：100'].forEach((n,i)=>{art+=rect(306,125+i*88,310,72)+text(n,322,167+i*88,21,color.ink,13);});
 }else if(k==='layers'){
  art=rect(30,110,580,286,color.pale)+text('body：画面に見える内容',52,148,24,color.blue);
  p.nodes.forEach((n,i)=>{art+=rect(58,170+i*69,524,58,i===2?'#fff4cf':'white')+text(n.replace('\n','：'),78,207+i*69,21,color.ink,23);});
 }else if(k==='theme'){
  for(let i=0;i<2;i++){const x=24+i*308;art+=rect(x,115,284,253,i?'#1f3253':'#f4f8ff')+text(i?'night：夜':'day：明るい',x+142,159,24,i?'white':color.ink,12,'middle')+text('星を集めよう',x+142,218,24,i?'white':color.ink,11,'middle')+rect(x+39,250,206,65,i?'#b8d4ff':color.blue,'none')+text('星を集める',x+142,292,23,i?color.ink:'white',12,'middle');}
  art+=text('見た目が変わっても、得点のルールは同じ',320,416,21,color.blue,27,'middle');
 }else if(k==='test'){
  const rows=[['操作','期待する結果'],['4点','まだ押せる'],['5点','クリア・止まる'],['クリア後','得点が増えない']];
  rows.forEach((r,i)=>{art+=rect(36,106+i*72,568,64,i?'#f3f8fc':color.blue);art+=text(r[0],56,147+i*72,23,i?color.ink:'white',11)+text(r[1],275,147+i*72,23,i?color.ink:'white',13);});
 }else if(k==='variable'){
  art=cards(p.nodes)+text('0 → 2 → 4 → 6 → 8 → 10',320,380,28,color.blue,30,'middle');
 }else{
  // Topic-specific labels carry the diagram; storage is intentionally not a flow.
  art=cards(p.nodes,k!=='storage'&&k!=='access'&&k!=='difficulty');
  const footer={validation:'検証してから、大小と正解を判定する',state:'状態が変わったら、表示と操作もそろえる',storage:'保存先と目的を区別しよう',access:'色・入力方法・動きに配慮する',difficulty:'同じ制限時間で、出現の速さだけを比べる',plan:'完成条件を「確かめられる言葉」にする',publish:'公開後のURLから、版と動作を再確認',function:'入力 → 判定の戻り値 → 表示',flow:'書く → 動かす → 確かめる'}[k]||'コードの役割と画面の変化を結び付ける';
  art+=text(footer,320,382,21,color.blue,27,'middle');
 }
 return base(p.headline,art);
}
function codeCard(p){
 const c=p.change, panel=(label,code,y,fill)=>rect(24,y,592,139,fill)+text(label,42,y+31,19,color.blue)+`<g font-family="Consolas,monospace">${text(code,42,y+69,20,color.ink,25)}</g>`;
 return base(`${c.language}｜変える場所`,panel('変更前（見本）',c.before,96,color.pale)+arrow(320,240,320,268)+panel(c.before===c.after?'処理を見つけて動作を確認':'変更後（ここだけ変える）',c.after,281,'#fff6d9'),446);
}
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:700,height:1400},deviceScaleFactor:1.5});
const manifest={};
try{
 for(const l of course.lessons){
  const p=plans[l.id];if(!p)throw Error(`Missing illustration plan: ${l.id}`);
  const lang={HTML:'starterHtml',CSS:'starterCss',JavaScript:'starterJs'}[p.change.language];
  if(!l[lang].includes(p.change.before))throw Error(`Example snippet no longer matches ${l.id}`);
  await writeFile(path.join(out,l.id+'-diagram.svg'),diagram(l,p));await writeFile(path.join(out,l.id+'-code.svg'),codeCard(p));
  await page.setContent('<iframe id="preview" sandbox="allow-scripts" style="border:0;width:640px;height:1300px"></iframe>');
  const html=l.starterHtml.replace('</head>',`<style>${l.starterCss}</style></head>`).replace('</body>',`<script>${l.starterJs}</script></body>`);
  await page.locator('iframe').evaluate((el,source)=>el.srcdoc=source,html);
  const frame=page.frameLocator('iframe');await frame.locator('main[data-game]').waitFor();
  await frame.locator('body').evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
  await frame.locator('body').evaluate(()=>{Math.random=()=>.45;const now=Date.now();Date.now=()=>now;});
  if(l.level===4&&await frame.locator('#start').count())await frame.locator('#start').click();
  await frame.locator('main').evaluate((main,labels)=>{
   main.style.position='relative';const root=main.getBoundingClientRect();
   labels.forEach(([selector],index)=>{const el=main.querySelector(selector);if(!el)return;const rect=el.getBoundingClientRect(),badge=document.createElement('span');badge.textContent=String(index+1);badge.setAttribute('aria-hidden','true');
    Object.assign(badge.style,{position:'absolute',left:Math.min(root.width-30,Math.max(2,rect.left-root.left-14))+'px',top:Math.max(2,rect.top-root.top-12)+'px',width:'26px',height:'26px',borderRadius:'50%',background:'#ffdd70',border:'2px solid #fff',boxShadow:'0 1px 5px #23395650',color:'#183d75',font:'bold 17px/23px sans-serif',textAlign:'center',zIndex:100});main.append(badge);
   });
  },p.lookFor);
  const bounds=await frame.locator('main').boundingBox();
  await frame.locator('main').screenshot({path:path.join(out,l.id+'-preview.webp'),type:'jpeg',quality:90}).then(async bytes=>{
   // Playwright writes JPEG bytes; convert through Chromium's canvas to an actual WebP.
   const encoded=bytes.toString('base64');const data=await page.evaluate(async b64=>{const image=new Image();image.src='data:image/jpeg;base64,'+b64;await image.decode();const c=document.createElement('canvas');c.width=image.width;c.height=image.height;c.getContext('2d').drawImage(image,0,0);return c.toDataURL('image/webp',.9).split(',')[1];},encoded);
   await writeFile(path.join(out,l.id+'-preview.webp'),Buffer.from(data,'base64'));
  });
  manifest[l.id]={sourceHash:createHash('sha256').update(JSON.stringify([l.starterHtml,l.starterCss,l.starterJs,p])).digest('hex').slice(0,12),width:Math.round(bounds.width),height:Math.round(bounds.height)};
 }
 await writeFile(path.join(root,'assets/web-visual-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log(`Generated ${course.lessons.length} screenshots and ${course.lessons.length*2} SVG teaching images.`);
}finally{await browser.close();}
