import {assetUrl} from './asset-versions.js?v=78ddd5e723c8';
let ready;
const scripts=new Map();
function script(file){
  if(!scripts.has(file))scripts.set(file,new Promise((resolve,reject)=>{
    const el=document.createElement('script');el.src=assetUrl(file);el.onload=resolve;el.onerror=()=>reject(Error('PDF作成用ファイルを読み込めません'));document.head.append(el);
  }));
  return scripts.get(file);
}
async function runtime(){
  if(!ready)ready=(async()=>{
    await Promise.all([script('assets/vendor/pdf-lib.min.js'),script('assets/vendor/fontkit.umd.min.js')]);
    const response=await fetch(assetUrl('assets/fonts/NotoSansJP-Regular.otf'));if(!response.ok)throw Error('日本語フォントを取得できません');
    const bytes=await response.arrayBuffer(),face=new FontFace('WorkbookJP',bytes);await face.load();document.fonts.add(face);
    const doc=await window.PDFLib.PDFDocument.create();doc.registerFontkit(window.fontkit);
    const font=await doc.embedFont(bytes,{subset:true});
    return {bytes,font,characters:new Set(font.getCharacterSet())};
  })().catch(err=>{ready=null;scripts.clear();throw err;});
  return ready;
}
function wrap(text,font,size,width){
  const lines=[];
  for(const paragraph of text.replace(/\r\n?/g,'\n').replace(/\t/g,'  ').split('\n')){
    let line='';for(const char of Array.from(paragraph)){
      if(line&&font.widthOfTextAtSize(line+char,size)>width){lines.push(line);line=char;}else line+=char;
    }lines.push(line);
  }return lines;
}
function layout(document,number,font,characters){
  for(const char of document.title+document.body){
    if(!/\s/.test(char)&&!characters.has(char.codePointAt(0)))throw Error(`PDFで表示できない文字「${char}」があります。別の表現にしてください。`);
  }
  const title=wrap(document.title,font,16,507);if(title.length>2)throw Error('PDFタイトルを短くしてください');
  let size=11,body;
  while(size>=8){body=wrap(document.body,font,size,507);if(body.length*size*1.55<=646)break;size-=.5;}
  if(size<8)throw Error(`第${number}ページの本文が1ページに収まりません。本文を短くしてください。`);
  return [...title.map((text,i)=>({text,x:44,y:59+i*23,size:16,white:true})),
    ...body.map((text,i)=>({text,x:44,y:140+i*size*1.55,size})),{text:`HTML入門 レベル1  |  ${number} / 12`,x:44,y:816,size:9}];
}
export async function validatePdfPages(book){
  if(!book.pages.some(p=>p.document.edited))return;
  const {font,characters}=await runtime();book.pages.forEach((p,i)=>{if(p.document.edited)layout(p.document,i+1,font,characters);});
}
async function documentCanvas(document,number){
  const {font,characters}=await runtime(),commands=layout(document,number,font,characters);
  const canvas=window.document.createElement('canvas');canvas.width=1190;canvas.height=1684;
  const ctx=canvas.getContext('2d');ctx.scale(2,2);ctx.fillStyle='#fff';ctx.fillRect(0,0,595,842);
  ctx.fillStyle='#243B70';ctx.fillRect(28,28,539,84);
  for(const c of commands){ctx.fillStyle=c.white?'#fff':'#22314d';ctx.font=`${c.size}px WorkbookJP`;ctx.fillText(c.text,c.x,c.y);}
  return canvas;
}
export async function renderDocumentPage(document,number){return (await documentCanvas(document,number)).toDataURL('image/webp',.94);}
export async function workbookPdf(book,pdfUrl){
  await runtime();
  const response=await fetch(assetUrl(pdfUrl));if(!response.ok)throw Error('元のPDFを取得できません');
  const pdf=await window.PDFLib.PDFDocument.load(await response.arrayBuffer());
  if(pdf.getPageCount()!==12)throw Error('全12ページの原本PDFを指定してください');
  for(let i=0;i<12;i++){
    const document=book.pages[i].document;if(!document.edited)continue;
    // Use the same browser-rendered page as the preview: CJK glyphs remain
    // identical in every PDF reader, including readers with limited font support.
    const canvas=await documentCanvas(document,i+1),image=await pdf.embedPng(canvas.toDataURL('image/png'));
    pdf.removePage(i);const page=pdf.insertPage(i,[595,842]);page.drawImage(image,{x:0,y:0,width:595,height:842});
  }
  return pdf.save();
}
export async function downloadWorkbookPdf(book,pdfUrl){
  const bytes=await workbookPdf(book,pdfUrl),url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
  const a=document.createElement('a');a.href=url;a.download='HTML_Level1_Guide_edited.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
