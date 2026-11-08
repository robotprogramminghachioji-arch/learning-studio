import {pageKey,requiredTask,pageRequirementsMet,learningState,unlockedThrough,pageStatus,mergeHistory} from './html-level1-progress.js';
import {mountFloatingEditor} from './floating-editor.js';
import {mountPageNavigation} from './page-navigation.js';
import {doc,getDoc,setDoc,serverTimestamp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

// Questions follow the actual twelve pages of HTML_Level1_Guide.pdf.
// Questions are for formative practice, not a tamper-proof examination.
const q=(text, options, correct, why)=>({type:'choice',text,options,correct,why});
const c=(text)=>({type:'check',text});
const t=(text, hint='自分の言葉で短く書こう。')=>({type:'text',text,hint});
const e=(text, test, hint)=>({type:'code',text,test,hint});

const HTML_SKELETON = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>はじめてのWebページ</title>
</head>
<body>
  <h1>こんにちは！</h1>
  <p>わたしはHTMLを勉強しています。</p>
</body>
</html>`;
const PROFILE_HTML = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>わたしの自己紹介</title>
</head>
<body>
  <h1>わたしの自己紹介</h1>
  <p>こんにちは！ わたしは○○です。</p>
  <h2>好きなもの</h2>
  <ul>
    <li>ゲーム</li>
    <li>音楽</li>
    <li>ねこ</li>
  </ul>
  <p>好きなサイトはこちらです。</p>
  <a href="https://example.com/">サイトを見る</a>
</body>
</html>`;
const IMAGE_HTML = `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><title>好きな動物</title></head>
<body>
  <h1>好きな動物</h1>
  <p>わたしはねこが好きです。</p>
  <img src="images/cat.svg" alt="草原で休むねこ" width="300">
</body>
</html>`;

const PAGES=[
  {title:'教材の使い方とHTMLの基礎',mode:'introduction',intro:'まずは教材の進め方を読み、HTMLでどのような学習をするか確認しましょう。',editorHint:'実習のページでは、HTMLエディターにコードを入力して表示を確認します。今は教材と画面の使い方を確認しましょう。',sample:'',tasks:[]},
  {title:'Webページが見えるしくみ・ブラウザ',intro:'「書く → HTMLファイル → ブラウザで見る」という流れと、ブラウザの操作を覚えよう。',editorHint:'HTMLタブでコードを修正すると、右側のプレビューに新しい表示が出ます。',sample:'',tasks:[
    q('HTMLコードを書く道具は？',['ブラウザ','エディター','アドレスバー'],1,'エディターはコードを書いたり直したりする道具です。'),
    q('HTMLをWebページとして表示する道具は？',['ブラウザ','フォルダー','メモ帳だけ'],0,'ChromeやEdgeなどがブラウザです。'),
    q('今のページをもう一度読み込むボタンは？',['← 戻る','↻ 更新','→ 進む'],1,'更新は現在のページを読み直します。'),
    q('URLを入力する場所は？',['見出し','アドレスバー','タイトルタグ'],1,'アドレスバーにページの場所を入力します。'),
    q('「file:///」から始まるアドレスは？',['自分のPC内のファイルのことが多い','必ず世界に公開済み','必ず動画サイト'],0,'自分の端末のファイルをブラウザで開いている例です。'),
    c('PDFのブラウザ図で「戻る」「進む」「更新」を指さして言えた'),
    t('エディターとブラウザの役割の違いを説明しよう'),
    t('URLとファイル名はどう違うと思う？','Web上の場所と、ファイルの名前を比べよう。')
  ]},
  {title:'HTML・CSS・JavaScriptとエディター',intro:'3つの技術の役割を知り、Learning Studioのボタンを使ってみよう。',editorHint:'フローティングエディターで「HTML」を選び、コードを変更して「プレビューを更新」を押そう。',sample:`<h1>こんにちは！</h1>\n<p>HTMLの練習中です。</p>`,tasks:[
    q('HTMLが主に担当するものは？',['Webページの内容と構造','文字の色だけ','クリック後の動作だけ'],0,'HTMLは見出しや文章などの構造を表します。'),
    q('CSSが主に担当するものは？',['ページの保存先','色や文字サイズなど見た目','HTMLファイルの拡張子'],1,'CSSは見た目を整える技術です。'),
    q('JavaScriptが主に担当するものは？',['ページに動きを付ける','PDFを印刷する','HTMLの代わりに文字を入力する'],0,'ボタンなどに動作を加えられます。'),
    q('コードを変更した後、表示を確かめるボタンは？',['学習内容を保存','プレビューを更新','ログアウト'],1,'「プレビューを更新」で変更を表示します。'),
    q('Firebaseに学習中のコードを記録するボタンは？',['学習内容を保存','HTMLを保存（ダウンロード）','最初に戻す'],0,'クラウド保存と .html のダウンロードは別です。'),
    e('エディターに見出し <h1> を入れてみよう','heading','HTMLタブに <h1>こんにちは！</h1> などを書こう。'),
    c('HTMLタブとプレビューの場所を確認した'),
    t('「HTMLを保存」と「学習内容を保存」の違いを説明しよう')
  ]},
  {title:'.html拡張子・保存とブラウザで開く',intro:'index.html を保存して開くまでの手順を理解しよう。',editorHint:'エディターの「HTMLを保存」を使うと、ブラウザで開ける .html ファイルがダウンロードされます。',sample:HTML_SKELETON,tasks:[
    q('HTMLファイルとして適切な名前は？',['index.html','index.html.txt','index.png'],0,'.html がファイル名の末尾になります。'),
    q('index.html.txt は何のファイル？',['HTML','拡張子が .txt のテキスト','画像'],1,'末尾の拡張子を確認しましょう。'),
    q('Windowsで保存したHTMLを開く例は？',['右クリック→プログラムから開く→Chrome/Edge','電卓を起動する','PDFに変換しないと開けない'],0,'ブラウザからローカルファイルとして開けます。'),
    q('HTMLを直した後、ブラウザで表示を確認する操作は？',['Ctrl+R（更新）','Ctrl+P（印刷）','Alt+F4（終了）'],0,'エディターで保存した後に更新します。'),
    q('ローカルのHTMLを開いただけでインターネットに公開される？',['公開される','公開されない','必ずURLがhttpsになる'],1,'PC内で表示できても公開されたことにはなりません。'),
    c('「HTMLを保存」で .html ファイルを作ってみた'),
    c('ダウンロードした .html ファイルをブラウザで開いてみた'),
    t('メモ帳で文字化けを防ぐときに確認する文字コードは？','PDFの保存手順を見て答えよう。')
  ]},
  {title:'HTML文書全体の構造',intro:'DOCTYPE・html・head・bodyがどうつながるか理解しよう。',editorHint:'「このページの見本コードを読み込む」を押したら、headとbodyを探してみよう。',sample:HTML_SKELETON,tasks:[
    q('ページ内の見出しや文章を入れるのは？',['<head>','<body>','<!DOCTYPE html>'],1,'実際に見える主な内容はbodyに書きます。'),
    q('ブラウザのタブに付く名前を書くタグは？',['<title>','<h1>','<p>'],0,'titleはhead内に書くのが基本です。'),
    q('日本語を正しく扱う文字コードの指定は？',['charset="UTF-8"','href="index.html"','alt="写真"'],0,'<meta charset="UTF-8"> をhead内に書きます。'),
    q('<!DOCTYPE html> の役割は？',['HTML文書であることの宣言','画像の指定','色の指定'],0,'HTML文書の先頭に書く宣言です。'),
    q('<html lang="ja"> の ja の意味は？',['日本語','JavaScript','画像'],0,'文書の言語が日本語であることを示します。'),
    e('エディターに <head> と </head> がある状態にしよう','head','見本のHTML文書全体を読み込むと確認できます。'),
    e('エディターに <body> と </body> がある状態にしよう','body','bodyの中に見出しと文章を書こう。'),
    t('<title> と <h1> の表示場所の違いを説明しよう')
  ]},
  {title:'タグ・要素・属性を読む',intro:'開始タグと終了タグ、入れ子、属性の役割を学ぼう。',editorHint:'タグを追加したら「プレビューを更新」でどう変わったか確かめましょう。',sample:HTML_SKELETON,tasks:[
    q('<h1>こんにちは</h1> の「こんにちは」は？',['開始タグ','内容（テキスト）','終了タグ'],1,'タグで囲まれた部分が内容です。'),
    q('終了タグとして正しいのは？',['<h1>','</h1>','<h/1>'],1,'終了タグには / が付きます。'),
    q('リンク先URLを指定する属性は？',['href','src','alt'],0,'a要素のhref属性です。'),
    q('画像ファイルの場所を指定する属性は？',['alt','src','lang'],1,'img要素のsrc属性を使います。'),
    q('終了タグがないのはどれ？',['<p>','<img>','<h1>'],1,'imgやbrには終了タグがありません。'),
    q('箇条書きの項目に使うタグは？',['<li>','<title>','<head>'],0,'ulの中にliを並べます。'),
    e('エディターに段落 <p> を書いてみよう','paragraph','<p>文章</p> を入れてみよう。'),
    t('「属性」とは何か、hrefかsrcを例に説明しよう')
  ]},
  {title:'実習① HTMLの骨組みを入力',intro:'PDFのコードをエディターに入力して、表示を確かめよう。',editorHint:'初めは何も見ずに入力に挑戦してもOK。困ったら「このページの見本コードを読み込む」を利用できます。',sample:HTML_SKELETON,tasks:[
    e('HTML文書の先頭にDOCTYPEを入れよう','doctype','先頭の <!DOCTYPE html> を確認しよう。'),
    e('<html lang="ja"> を入れよう','html','HTML文書全体の開始・終了を書こう。'),
    e('headの中にページタイトルを入れよう','title','<title>はじめてのWebページ</title>'),
    e('body内に大きな見出しを入れよう','heading','<h1>こんにちは！</h1>'),
    e('body内に文章を入れよう','paragraph','<p>わたしはHTMLを勉強しています。</p>'),
    q('見出しや文章を入れる場所は？',['head','body','DOCTYPE'],1,'表示内容はbodyに入れます。'),
    c('「プレビューを更新」を押し、見出しが表示された'),
    c('「学習内容を保存」を押して保存した')
  ]},
  {title:'実習② 自己紹介ページに発展',intro:'見出し、文章、箇条書き、リンクをつないで自己紹介ページを作ろう。',editorHint:'フローティングHTMLエディターを使って自分の自己紹介を作ろう。3つの好きなものとリンクも入れます。',sample:PROFILE_HTML,tasks:[
    e('<h1>で自己紹介のタイトルを表示しよう','heading','<h1>わたしの自己紹介</h1>'),
    e('<p>で自己紹介文を表示しよう','paragraph','<p>こんにちは！ わたしは○○です。</p>'),
    e('<h2>で「好きなもの」の見出しを作ろう','h2','<h2>好きなもの</h2>'),
    e('<ul>と<li>で3項目のリストを作ろう','list3','li要素を3つ入れよう。'),
    e('<a>を使ってリンクを作ろう','link','<a href="https://example.com/">サイトを見る</a>'),
    q('リンク先の指定に使う属性は？',['alt','href','charset'],1,'a要素にhref属性を付けます。'),
    c('プレビューで自分の自己紹介を確認した'),
    t('自分のページに入れた好きなものを3つ書こう')
  ]},
  {title:'画像の表示・ファイルとパス',intro:'画像タグを学び、画像の置き場所とHTMLの関係を考えよう。',editorHint:'画像タグの書き方は試せますが、Learning Studioの安全なプレビューではローカル画像は表示されません。PDFのフォルダー図を見て理解しよう。',sample:IMAGE_HTML,tasks:[
    q('画像を表示するHTMLタグは？',['<img>','<p>','<a>'],0,'画像にはimgを使います。'),
    q('画像ファイルを指定する属性は？',['src','alt','href'],0,'srcで画像の場所を指定します。'),
    q('画像の内容を文字で説明する属性は？',['title','alt','lang'],1,'altは画像の代替テキストです。'),
    q('images/cat.svg が意味するのは？',['HTMLの隣のimages内にあるcat.svg','必ずネットのトップページ','PDFのファイル名'],0,'相対パスはHTMLファイルからの位置を示します。'),
    q('画像が表示されないときの確認として正しいのは？',['名前・拡張子・フォルダーの位置','マウスの色','画面の明るさだけ'],0,'ファイルの存在とパスが一致するか確認します。'),
    e('<img>にsrcとaltを付けてみよう','image','<img src="images/cat.svg" alt="草原で休むねこ">'),
    c('PDFでindex.htmlとimages/cat.svgの場所を確認した'),
    t('Learning Studioのプレビューに画像が出ないことがあるのはなぜ？','PDFの注意書きを参考に説明しよう。')
  ]},
  {title:'自分で考えて改善・デバッグ',intro:'一か所ずつ変更し、表示を確認しながら自分のページを改善しよう。',editorHint:'7〜8ページで作ったHTMLを使い、好きなテーマに変更してみましょう。',sample:PROFILE_HTML,tasks:[
    e('大きな見出しの文字を自分らしく変えよう','customHeading','「こんにちは！」以外の自分の見出しにしよう。'),
    e('自己紹介文を自分の言葉に変えよう','customParagraph','初期の「わたしはHTMLを勉強しています。」から変更しよう。'),
    e('好きなものを3つリストにしよう','list3','<li>を3つ以上入れよう。'),
    q('<h1>こんにちは！ の問題点は？',['終了タグがない','タグが英語','文字が短い'],0,'</h1>を忘れずに書きます。'),
    q('<ul><li>ねこ</li><li>ゲーム</ul> の問題点は？',['<li>の閉じタグが足りない','<ul>は使えない','見出しがない'],0,'後半のliを先に閉じてからulを閉じます。'),
    q('表示がおかしいときに最初に行うべきことは？',['一か所ずつ直して確認','全コードを消す','適当にタグを増やす'],0,'動いていた状態から少しずつ変更すると原因を探しやすいです。'),
    c('問題Aと問題Bの誤りをPDFで見つけた'),
    t('改善したところと、工夫した理由を書こう')
  ]},
  {title:'確認テスト（10問）',intro:'PDFの10問をシステム上でも確かめよう。選択問題はその場で答え合わせできます。',editorHint:'最後に作ったHTMLを確認し、必要ならプレビューを更新しよう。',sample:'',tasks:[
    q('Webページを表示するソフトはどれ？',['ブラウザ','エディター','電卓'],0,'Webページを表示するのはブラウザです。'),
    q('HTMLファイルとして正しい名前は？',['index.txt','index.html','index.html.txt'],1,'拡張子は .html です。'),
    q('HTMLコードを書いたり編集したりする道具は？',['ブラウザ','エディター','カメラ'],1,'コードを書く道具はエディターです。'),
    q('ページに表示する見出しや文章を入れる場所は？',['head','body','title'],1,'見出しや文章などはbodyに入れます。'),
    q('ブラウザのタブ名を書くタグは？',['<h1>','<title>','<p>'],1,'titleはhead内で使います。'),
    q('見出しを書くタグは？',['<h1>','<p>','<img>'],0,'h1はページの見出しです。'),
    q('ほかのページへのリンクのタグは？',['<a>','<br>','<body>'],0,'リンクはa要素で作ります。'),
    q('HTML変更後にブラウザで更新する操作は？',['更新','印刷','戻る'],0,'更新で新しい表示を確認します。'),
    t('<head>と<body>の役割の違いを書こう','headはページ情報、bodyは見える内容。'),
    t('自分のPC内のindex.htmlをブラウザで開く方法を書こう')
  ]},
  {title:'完成チェック・振り返り',intro:'ここまでできたことをチェックして、次のCSS学習につなげよう。',editorHint:'作品を最後に確認し、「学習内容を保存」を押そう。「HTMLを保存」でPCに持ち帰ることもできます。',sample:'',tasks:[
    c('HTMLタブにコードを入力できた'),
    c('プレビューを更新し、表示を確認できた'),
    c('headとbodyの違いが説明できる'),
    c('h1とpの文字を変更できた'),
    c('liを使ったリストを追加できた'),
    c('学習内容を保存した'),
    c('.htmlという拡張子の意味を説明できる'),
    c('HTMLファイルをブラウザで開く方法を説明できる'),
    t('今日、できるようになったことは？'),
    t('まだ難しいこと・先生に質問したいことは？'),
    t('次に作ってみたいWebページは？')
  ]}
];

const escapeHtml = s => String(s??'').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const pad = n => String(n).padStart(2,'0');
function codeCheck(which,code){
  const html=String(code||'');
  const parsed=new DOMParser().parseFromString(html,'text/html');
  const sel=s=>parsed.querySelector(s);
  const text=s=>(sel(s)?.textContent||'').trim();
  switch(which){
    case 'doctype':return /^\s*<!doctype\s+html\s*>/i.test(html);
    case 'html':return /<html\b[^>]*\blang\s*=\s*["']ja["'][^>]*>/i.test(html)&&/<\/html\s*>/i.test(html);
    case 'head':return /<head\b[^>]*>/i.test(html)&&/<\/head\s*>/i.test(html);
    case 'body':return /<body\b[^>]*>/i.test(html)&&/<\/body\s*>/i.test(html);
    case 'title':return Boolean(text('title'));
    case 'heading':return Boolean(text('h1'));
    case 'paragraph':return Boolean(text('p'));
    case 'h2':return Boolean(text('h2'));
    case 'list3':return parsed.querySelectorAll('ul > li').length>=3;
    case 'link':return [...parsed.querySelectorAll('a[href]')].some(a=>a.getAttribute('href')?.startsWith('https://'));
    case 'image':return [...parsed.querySelectorAll('img')].some(im=>im.getAttribute('src')&&im.getAttribute('alt'));
    case 'customHeading':return Boolean(text('h1'))&&!['こんにちは！','こんにちは',''].includes(text('h1'));
    case 'customParagraph':return Boolean(text('p'))&&!['HTMLを勉強中です。','わたしはHTMLを勉強しています。',''].includes(text('p'));
    default:return false;
  }
}

export async function mountHtmlLevel1Companion({container,lesson,pdfUrl,db,student,uid,mountWebWorkspace,students=[],onProgressChange=()=>{}}){
  if(!container)return;
  const isStudent=Boolean(student),maxPage=PAGES.length;
  const draftKey=`ls-html-level1-pages:${uid}:${lesson.id}`,syncKey=`${draftKey}:sync`;
  const workspaceRef=isStudent?doc(db,'web_workspaces',`${uid}__${lesson.id}`):null;
  let progress={},pending=false;
  try{
    progress=JSON.parse(localStorage.getItem(draftKey)||'{}')||{};
    const sync=JSON.parse(localStorage.getItem(syncKey)||'null');
    pending=sync?sync.pending===true:Object.keys(progress).length>0;
  }catch{progress={};}
  let state=learningState(progress,PAGES),page=state.currentPage,saveTimer=null,editorApi=null;
  let revision=0,remoteReady=!isStudent,reading=false,saving=false,navigated=false;
  progress._learning=state;state.visited[pageKey(page)]=true;
  const getRecord=()=>{
    const record=progress[pageKey(page)]||(progress[pageKey(page)]={});
    record.answers||={};record.results||={};return record;
  };
  const allowed=n=>!isStudent||n<=unlockedThrough(state);
  const persistLocal=()=>{
    try{localStorage.setItem(draftKey,JSON.stringify(progress));localStorage.setItem(syncKey,JSON.stringify({pending}));return true;}
    catch(err){console.warn('学習記録のローカル保存に失敗',err);return false;}
  };
  container.innerHTML=`<div class="hl1-heading"><h2>HTML入門 レベル1｜全12ページ</h2><p class="muted">左の教材ページを進めると、右の説明・問題が同じページに切り替わります。コードはフローティングエディターで実行できます。ウィンドウの見出しをドラッグすると移動できます。</p></div>
    <details class="hl1-directory"><summary>ページ一覧（全12ページ）</summary><div id="hl1PageList" class="hl1-page-list"></div><p class="muted tiny">学習済み・学習中・未学習・ロック中を表示します。必須を完了してチェックすると次のページに進めます。</p></details>
    ${!isStudent?`<details class="hl1-teacher-panel"><summary>先生用：生徒の学習進度を調整</summary><p class="muted small">全ページをプレビューできます。生徒の回答・コードを残したまま、学習済み扱いの範囲を変更します。</p><label>生徒<select id="hl1TeacherStudent"><option value="">生徒を選択</option>${students.filter(s=>s.activeUid).map(s=>`<option value="${escapeHtml(s.id)}">${escapeHtml(s.id)}：${escapeHtml(s.displayName)}</option>`).join('')}</select></label><button type="button" id="hl1TeacherLoad" class="ghost">進度を読み込む</button><label>学習済み扱いの範囲<select id="hl1TeacherThrough">${Array.from({length:13},(_,n)=>`<option value="${n}">${n===0?'未完了（第1ページから）':`第1〜${n}ページ${n>=11?'（テスト提出済み扱い）':''}`}</option>`).join('')}</select></label><button type="button" id="hl1TeacherApply" disabled>進度調整を保存</button><p id="hl1TeacherStatus" aria-live="polite"></p></details>`:''}
    <div class="hl1-mobile-switch" role="group" aria-label="スマートフォン用表示切り替え"><button type="button" data-show="pdf" class="hl1-selected">📖 教材</button><button type="button" data-show="practice" class="ghost">💻 実習・問題</button></div>
    <nav class="hl1-page-navigation" aria-label="HTML入門レベル1のページ送り"><div class="hl1-navigation-summary"><strong>HTML入門 レベル1｜全12ページ</strong><output id="hl1Number" aria-label="現在のページ" aria-live="polite">1 / 12</output></div><button type="button" id="hl1Prev" class="ghost" aria-label="前のページ"><span aria-hidden="true">←</span><span class="hl1-control-label"> 前のページ</span></button><select id="hl1PageSelect" aria-label="教材ページを選択">${PAGES.map((p,i)=>`<option value="${i+1}">${i+1}. ${escapeHtml(p.title)}</option>`).join('')}</select><button type="button" id="hl1Next" class="ghost" aria-label="次のページ"><span class="hl1-control-label">次へ </span><span aria-hidden="true">→</span></button><div class="hl1-overall"><progress id="hl1OverallProgress" max="12" value="0" aria-label="12ページ全体の学習進捗"></progress><span id="hl1OverallStatus"></span></div></nav>
    <div class="hl1-grid">
      <aside class="hl1-reader" aria-label="教材のページ">
        <div class="hl1-reader-bar"><strong>📘 HTML入門 レベル1</strong><span class="pill">全12ページ</span></div>
        <div class="hl1-zoom-controls"><label for="hl1Scale">表示倍率</label><select id="hl1Scale"><option value="50">50%</option><option value="75">75%</option><option value="90">90%</option><option value="100" selected>幅に合わせる（100%）</option><option value="125">125%</option><option value="150">150%</option><option value="200">200%</option></select><span class="muted tiny">拡大後は教材内をスクロールできます</span></div>
        <div id="hl1PageViewport" class="hl1-page-viewport" tabindex="0" role="region" aria-label="PDF教材（拡大時は縦横にスクロール）"><img id="hl1Image" src="assets/pdf-pages/html-level1-01.webp" alt="HTML教材の1ページ目"></div>
        <div class="hl1-pdf-actions"><a class="btn ghost small" href="${escapeHtml(pdfUrl)}" target="_blank" rel="noopener noreferrer">原本PDFを開く・印刷</a></div>
        <p class="muted tiny">表示しているのは、PDFの各ページを画像化したものです。印刷は「原本PDF」からできます。</p>
      </aside>
      <div class="hl1-practice" tabindex="0" role="region" aria-label="このページのミッション・確認問題">
        <div class="hl1-page-info"><span class="pill" id="hl1Current">PDF 1ページ</span><h3 id="hl1SectionHeading">このページの学習・進捗チェック</h3><p class="hl1-theme">学習テーマ：<span id="hl1Title"></span></p><p id="hl1Intro"></p></div>
        <div class="hl1-exercises"><h3 id="hl1ExercisesHeading">✏️ このページのミッション・確認問題</h3><div id="hl1Questions"></div><div class="hl1-check-actions"><button type="button" id="hl1Check">✅ 回答とコードをチェック</button><button type="button" class="ghost" id="hl1Save">☁ このページを保存</button></div><div id="hl1Result" aria-live="polite"></div><p id="hl1GateStatus" class="hl1-gate-status" aria-live="polite"></p><div class="hl1-progress"><div id="hl1ProgressBar"></div></div><p class="muted small" id="hl1Progress"></p><p class="muted small" id="hl1AnswerStatus"></p><p class="muted small" id="hl1SaveStatus" aria-live="polite"></p></div>
      </div>
    </div>
    <button type="button" id="hl1EditorOpen" class="hl1-editor-open" aria-controls="hl1EditorWindow" aria-expanded="true">💻 エディターを表示</button>
    <section id="hl1EditorWindow" class="hl1-editor-window" aria-labelledby="hl1WindowTitle">
      <div class="hl1-window-bar" data-window-move tabindex="0" role="group" aria-label="エディターを移動（ドラッグまたは矢印キー）" aria-describedby="hl1WindowHelp">
        <strong id="hl1WindowTitle">💻 HTMLエディター</strong><div class="hl1-window-actions"><button type="button" class="ghost small" data-window-reset>位置を戻す</button><button type="button" class="ghost small" data-window-minimize aria-label="エディターを最小化">− 最小化</button></div>
      </div>
      <div class="hl1-window-content hl1-editor-area">
        <details class="muted tiny"><summary>ウィンドウの操作方法</summary><p id="hl1WindowHelp">見出しで移動、右下の ↘ でサイズ変更（矢印キーでも操作可）。Escで最小化。入力はそのまま残ります。</p></details>
        <p class="muted" id="hl1EditorHint"></p><div id="hl1SampleBox"><button type="button" id="hl1LoadSample" class="ghost">📋 このページの見本コードを読み込む</button><p class="muted tiny">入力済みのHTMLは確認後に上書きします。CSS・JavaScriptは残ります。</p></div><div id="webWorkspace"></div>
      </div>
      <button type="button" class="hl1-window-resize" data-window-resize aria-label="エディターのサイズを変更（ドラッグまたは矢印キー）">↘</button>
    </section>`;

  const navigation=container.querySelector('.hl1-page-navigation');
  // Page controls now live in the shared header, while exercises remain in the lesson.
  const $=selector=>container.querySelector(selector)||navigation.querySelector(selector);
  const setSaveStatus=text=>{$('#hl1SaveStatus').textContent=text;};
  const header=mountPageNavigation({container,navigation});
  const floatingEditor=mountFloatingEditor({container,windowEl:$('#hl1EditorWindow'),openButton:$('#hl1EditorOpen'),header});
  const mobileShow=panel=>{
    container.classList.toggle('hl1-mobile-practice',panel==='practice');
    container.querySelectorAll('[data-show]').forEach(b=>{
      b.classList.toggle('hl1-selected',b.dataset.show===panel);b.classList.toggle('ghost',b.dataset.show!==panel);
      b.setAttribute('aria-pressed',String(b.dataset.show===panel));
    });
  };
  container.querySelectorAll('[data-show]').forEach(b=>b.addEventListener('click',()=>mobileShow(b.dataset.show)));
  function updateOverview(){
    const done=PAGES.filter((_,i)=>pageStatus(state,i+1)==='学習済み').length;
    $('#hl1OverallProgress').value=done;
    $('#hl1OverallStatus').textContent=`学習済み ${done} / ${maxPage}ページ`;
    $('#hl1Number').textContent=`${page} / ${maxPage}`;
    for(const option of $('#hl1PageSelect').options){
      const n=Number(option.value),status=pageStatus(state,n);
      option.textContent=`${n}. ${PAGES[n-1].title}［${status}］`;option.disabled=!allowed(n);
    }
    $('#hl1PageSelect').value=String(page);
    $('#hl1Prev').disabled=page===1;
    $('#hl1Next').disabled=page===maxPage||(PAGES[page-1].mode!=='introduction'&&!allowed(page+1));
    $('#hl1PageList').innerHTML=PAGES.map((data,index)=>{
      const n=index+1,status=pageStatus(state,n);
      return `<button type="button" data-page="${n}" class="ghost hl1-page-item" data-state="${status}" ${!allowed(n)?'disabled':''} ${n===page?'aria-current="page"':''}><strong>${n}. ${escapeHtml(data.title)}</strong><span>${status}</span></button>`;
    }).join('');
    onProgressChange({testSubmitted:state.testSubmitted,completedPages:done,currentPage:page,unlockedThrough:unlockedThrough(state)});
  }
  function updateProgress(){
    const record=getRecord(),tasks=PAGES[page-1].tasks;
    if(PAGES[page-1].mode==='introduction'){
      $('#hl1ProgressBar').style.width=state.completed.p01?'100%':'0%';
      $('#hl1GateStatus').textContent='内容を確認したら「次へ」で2ページ目へ進みましょう。このページに確認問題はありません。';
      updateOverview();return;
    }
    const required=tasks.filter((task,i)=>requiredTask(task,page,i));
    const done=tasks.filter((task,i)=>requiredTask(task,page,i)&&record.results[i]===true).length;
    const answered=tasks.filter((task,i)=>{
      const answer=record.answers[i];
      return task.type==='choice'?Number.isInteger(Number(answer))&&answer!==undefined&&answer!==''&&Number(answer)>=0&&Number(answer)<task.options.length:
        task.type==='text'?String(answer||'').trim().length>=2:task.type==='check'?answer===true:record.results[i]===true;
    }).length;
    $('#hl1Progress').textContent=`必須ミッション達成 ${done} / ${required.length} ・ 任意 ${tasks.length-required.length}問`;
    $('#hl1AnswerStatus').textContent=`回答・確認済み ${answered} / ${tasks.length}項目${page===11&&state.testSubmitted?' ／ テスト提出済み':''}`;
    $('#hl1ProgressBar').style.width=`${Math.round(done/required.length*100)}%`;
    $('#hl1GateStatus').textContent=page===11?(state.testSubmitted?'テスト提出済みです。第12ページの振り返りに進めます。':'全10問に回答して「テストを提出する」を押してください。正誤にかかわらず提出後に第12ページを解放します。'):
      state.completed[pageKey(page)]?'このページは学習済みです。任意問題は後から取り組めます。':
      '「必須」を完了して「回答とコードをチェック」を押すと、次のページを解放します。任意問題は進級条件に含みません。';
    updateOverview();
  }
  function scheduleSave(){
    revision++;pending=true;state.updatedAt=Date.now();state.currentPage=page;progress._learning=state;
    const cached=persistLocal();setSaveStatus(cached?'変更があります（端末に保存済み）':'端末への保存に失敗しました。Firebaseへの保存を確認してください。');
    if(isStudent&&remoteReady){clearTimeout(saveTimer);saveTimer=setTimeout(()=>storeRemote(),1400);}
  }
  async function storeRemote(){
    clearTimeout(saveTimer);persistLocal();
    if(!isStudent){setSaveStatus('先生プレビュー（この端末に一時保存）');return;}
    if(!remoteReady){
      if(!reading)await loadHistory();
      if(!remoteReady){setSaveStatus('Firebase履歴を取得できていません。端末の回答を保持しています。読み込み後に再保存してください。');return;}
    }
    if(saving)return;
    const savedRevision=revision,payload=JSON.parse(JSON.stringify(progress));saving=true;
    // Only the teacher writes this immutable adjustment snapshot. A stale student
    // autosave must not replace a teacher's newer instruction.
    delete payload._learning.teacherAdjustment;
    try{
      setSaveStatus('進捗をFirebaseへ保存中…');
      await setDoc(workspaceRef,{ownerUid:uid,studentId:student.id,lessonId:lesson.id,pageWork:payload,pageWorkUpdatedAt:serverTimestamp()},{merge:true});
      if(savedRevision===revision){pending=false;persistLocal();setSaveStatus('回答・学習位置・解放状態を保存しました');}
      else setSaveStatus('新しい変更があります（端末に保存済み）');
    }catch(err){setSaveStatus(`Firebase保存に失敗しました（端末には保存済み）：${err.code||err.message}`);}
    finally{
      saving=false;
      if(container.isConnected&&savedRevision!==revision){clearTimeout(saveTimer);saveTimer=setTimeout(()=>storeRemote(),1400);}
    }
  }
  function renderTasks(){
    const entry=getRecord(),data=PAGES[page-1];
    if(data.mode==='introduction'){
      $('#hl1Questions').innerHTML=`<div class="hl1-introduction"><section><h4>この教材の進め方</h4><ol class="hl1-learning-flow"><li><strong>Input（インプット）</strong>：教材を読んだり先生の説明を聞いたりして、知識を取り入れる。</li><li><strong>Output（アウトプット）</strong>：学んだことを使ってコードを書き、実際に動かしてみる。</li><li><strong>Check（確認）</strong>：表示が教材の見本や自分のねらいに合っているかを確かめる。</li><li><strong>Reflect（振り返り）</strong>：できたこと・できなかったことを振り返り、次の学習につなげる。</li></ol><p>必要に応じて教材に戻り、コードを直してもう一度確認しましょう。</p><p>左の説明や図を読みながら、分からない言葉は先生に聞こう。</p></section><section><h4>HTMLのはじめの一歩</h4><p>HTMLは、Webページの内容や構造を表すために使う言葉です。この教材で、コードが画面に表示されるしくみを学びます。</p></section><section><h4>画面の使い方</h4><ul><li>上の「前のページ」「次へ」で教材を進めます。</li><li>教材の「表示倍率」で文字や図を読みやすい大きさにします。</li><li>実習では「エディターを開く」からコードを入力し、表示を確認します。</li></ul></section></div>`;
      updateProgress();return;
    }
    $('#hl1Questions').innerHTML=data.tasks.map((task,i)=>{
      const saved=entry.answers[i]??'',status=entry.results[i],required=requiredTask(task,page,i);
      const badge=status===true?'<span class="hl1-good">✓ 達成</span>':status===false?'<span class="hl1-notyet">再確認</span>':'';
      let field='';
      if(task.type==='choice')field=`<div class="hl1-options">${task.options.map((opt,n)=>`<label><input type="radio" name="hl1q${i}" value="${n}" ${String(saved)===String(n)?'checked':''}>${escapeHtml(opt)}</label>`).join('')}</div>`;
      if(task.type==='check')field=`<label class="hl1-self"><input type="checkbox" data-index="${i}" ${saved===true?'checked':''}>できた！</label>`;
      if(task.type==='text')field=`<textarea data-index="${i}" rows="2" maxlength="220" aria-label="${escapeHtml(task.text)}" placeholder="${escapeHtml(task.hint||'自分の言葉で答えよう')}">${escapeHtml(saved)}</textarea>`;
      if(task.type==='code')field=`<p class="hl1-hint">コードのチェック項目：${escapeHtml(task.hint||'フローティングエディターで試そう')}</p>`;
      return `<article class="hl1-task" data-required="${required}" data-task="${i}"><div class="hl1-task-header"><strong><span class="hl1-task-kind">${required?'必須':'任意・応用'}</span> ${i+1}. ${escapeHtml(task.text)}</strong><span id="hl1Status${i}">${badge}</span></div>${field}<div class="hl1-why" id="hl1Why${i}" ${status!==true?'hidden':''}>${task.type==='choice'?escapeHtml(task.why):'確認しました。'}</div></article>`;
    }).join('');
    $('#hl1Questions').querySelectorAll('input,textarea').forEach(input=>{
      input.addEventListener(input.type==='radio'||input.type==='checkbox'?'change':'input',()=>{
        if(!allowed(page))return;
        const i=input.type==='radio'?Number(input.name.replace('hl1q','')):Number(input.dataset.index);
        const record=getRecord();record.answers[i]=input.type==='checkbox'?input.checked:input.value;
        record.results[i]=input.type==='checkbox'?input.checked:input.tagName==='TEXTAREA'?input.value.trim().length>=2:false;
        $(`#hl1Status${i}`).textContent='未チェック';$(`#hl1Why${i}`).hidden=true;
        scheduleSave();updateProgress();
      });
    });
    updateProgress();
  }
  function renderPage(){
    const data=PAGES[page-1];
    $('#hl1Image').src=`assets/pdf-pages/html-level1-${pad(page)}.webp`;
    $('#hl1Image').alt=`HTML入門レベル1 PDFの${page}ページ目：${data.title}`;
    $('#hl1Current').textContent=`PDF ${page}ページ`;$('#hl1Title').textContent=data.title;
    const introduction=data.mode==='introduction';
    $('.hl1-practice').setAttribute('aria-label',introduction?'教材の使い方とHTMLの基礎':'このページのミッション・確認問題');
    $('#hl1SectionHeading').textContent=introduction?'はじめに：この教材の使い方':page===11?'最終確認テスト':'このページの学習・進捗チェック';
    $('#hl1ExercisesHeading').textContent=introduction?'教材と画面の使い方':'✏️ このページのミッション・確認問題';
    for(const selector of ['.hl1-progress','#hl1Progress','#hl1AnswerStatus','#hl1Result'])$(selector).hidden=introduction;
    $('#hl1Intro').textContent=data.intro;$('#hl1EditorHint').textContent=data.editorHint;
    $('#hl1SampleBox').hidden=!data.sample;
    $('#hl1Check').textContent=introduction?'使い方を確認して次へ':page===11?'テストを提出する':'✅ 回答とコードをチェック';
    $('#hl1Result').textContent='';$('#hl1Result').className='';
    renderTasks();
  }
  function changePage(newPage){
    const n=Number(newPage);
    if(!Number.isInteger(n)||n<1||n>maxPage)return;
    if(!allowed(n)){
      $('#hl1PageSelect').value=String(page);
      $('#hl1GateStatus').textContent=`第${n}ページはロック中です。前のページの必須学習を完了してください。`;return;
    }
    navigated=true;page=n;state.currentPage=n;state.visited[pageKey(n)]=true;
    renderPage();scheduleSave();
    $('#hl1PageViewport').scrollTo(0,0);$('.hl1-practice').scrollTo(0,0);
    mobileShow('pdf');$('.hl1-grid').scrollIntoView({block:'start',behavior:'instant'});
  }
  $('#hl1Scale').addEventListener('change',()=>{$('#hl1Image').style.width=`${$('#hl1Scale').value}%`;});
  function advanceIntroduction(){
    getRecord().introRead=true;state.completed.p01=true;
    changePage(2);
  }
  $('#hl1Prev').addEventListener('click',()=>changePage(page-1));
  $('#hl1Next').addEventListener('click',()=>PAGES[page-1].mode==='introduction'?advanceIntroduction():changePage(page+1));
  $('#hl1PageSelect').addEventListener('change',ev=>changePage(ev.target.value));
  $('#hl1PageList').addEventListener('click',ev=>{const button=ev.target.closest('[data-page]');if(button)changePage(button.dataset.page);});
  $('#hl1Check').addEventListener('click',async()=>{
    if(!allowed(page))return;
    const record=getRecord(),data=PAGES[page-1];
    if(data.mode==='introduction'){advanceIntroduction();return;}
    if(page===11&&!data.tasks.every((task,i)=>task.type==='choice'?
      record.answers[i]!==undefined&&record.answers[i]!==''&&Number.isInteger(Number(record.answers[i]))&&Number(record.answers[i])>=0&&Number(record.answers[i])<task.options.length:
      String(record.answers[i]||'').trim().length>=2)){
      $('#hl1Result').textContent='未回答の必須問題があります。全10問に回答してから提出してください。';return;
    }
    data.tasks.forEach((task,i)=>{
      const answer=record.answers[i];
      record.results[i]=task.type==='choice'?String(answer)===String(task.correct):task.type==='check'?answer===true:
        task.type==='text'?String(answer??'').trim().length>=2:codeCheck(task.test,editorApi?.getCode()?.html||'');
    });
    if(page===11){state.testSubmitted=true;state.completed.p11=true;}
    else if(pageRequirementsMet(record,data,page))state.completed[pageKey(page)]=true;
    renderTasks();
    const done=data.tasks.filter((_,i)=>record.results[i]===true).length;
    $('#hl1Result').textContent=page===11?`テストを提出しました。確認結果 ${done} / ${data.tasks.length}。第12ページを解放しました。`:
      `このページ：${done} / ${data.tasks.length}項目を達成。${state.completed[pageKey(page)]?'必須学習が完了しました。':'未達成の必須を確認してください。'}`;
    $('#hl1Result').className='hl1-feedback';scheduleSave();
    // A submission records answers and gates in the same merged document write.
    if(page===11)await storeRemote();
  });
  $('#hl1Save').addEventListener('click',()=>storeRemote());
  $('#hl1LoadSample').addEventListener('click',()=>{
    if(!allowed(page)||!PAGES[page-1].sample||!editorApi)return;
    if(editorApi.setHtml(PAGES[page-1].sample))floatingEditor.show();
  });

  async function loadHistory(){
    if(reading)return false;reading=true;
    try{
      const snap=await getDoc(workspaceRef);
      if(!container.isConnected)return false;
      const cloud=snap.exists()&&snap.data().pageWork||{};
      // Normalize legacy completion/test evidence before combining it with a new local draft.
      cloud._learning=learningState(cloud,PAGES);
      progress=mergeHistory(progress,cloud,pending);
      state=learningState(progress,PAGES);progress._learning=state;
      if(!navigated)page=state.currentPage;
      if(!allowed(page))page=unlockedThrough(state);
      state.currentPage=page;state.visited[pageKey(page)]=true;
      remoteReady=true;persistLocal();renderPage();
      setSaveStatus(pending?'端末の変更を復元しました（Firebaseへ未保存）':'学習位置・回答・解放状態を読み込みました');
      if(pending){clearTimeout(saveTimer);saveTimer=setTimeout(()=>storeRemote(),1400);}
      return true;
    }catch(err){setSaveStatus(`Firebase履歴を取得できません（端末の入力は保持）：${err.code||err.message}`);return false;}
    finally{reading=false;}
  }
  if(!isStudent){
    let loadedStudent=null,loadVersion=0;
    $('#hl1TeacherStudent').addEventListener('change',()=>{loadVersion++;loadedStudent=null;$('#hl1TeacherApply').disabled=true;});
    $('#hl1TeacherLoad').addEventListener('click',async()=>{
      const target=students.find(s=>s.id===$('#hl1TeacherStudent').value),version=++loadVersion;
      if(!target?.activeUid)return;
      $('#hl1TeacherApply').disabled=true;$('#hl1TeacherStatus').textContent='生徒の進度を読み込み中…';
      try{
        const snap=await getDoc(doc(db,'web_workspaces',`${target.activeUid}__${lesson.id}`));
        if(version!==loadVersion||!container.isConnected)return;
        loadedStudent=target;
        const targetState=learningState(snap.exists()?snap.data().pageWork||{}:{},PAGES);
        $('#hl1TeacherThrough').value=String(unlockedThrough(targetState)===12?(targetState.completed.p12?12:11):unlockedThrough(targetState)-1);
        $('#hl1TeacherApply').disabled=false;$('#hl1TeacherStatus').textContent=`${target.id}：第${targetState.currentPage}ページから再開、学習済み ${Object.values(targetState.completed).filter(Boolean).length} / 12`;
      }catch(err){$('#hl1TeacherStatus').textContent=`読み込みに失敗：${err.code||err.message}`;}
    });
    $('#hl1TeacherApply').addEventListener('click',async()=>{
      const target=loadedStudent;
      if(!target||target.id!==$('#hl1TeacherStudent').value)return;
      const through=Number($('#hl1TeacherThrough').value);
      if(!Number.isInteger(through)||through<0||through>12)return;
      if(!confirm(`${target.id}の第${through}ページまでを学習済み扱いにします。以降のページは再学習になります。回答とコードは削除しません。よろしいですか？`))return;
      $('#hl1TeacherApply').disabled=true;
      try{
        const completed=Object.fromEntries(PAGES.map((_,i)=>[pageKey(i+1),i<through]));
        const adjustment={version:1,completed,visited:{},currentPage:Math.min(through+1,12),testSubmitted:through>=11,
          revision:crypto.randomUUID(),adjustedBy:uid,updatedAt:Date.now()};
        await setDoc(doc(db,'web_workspaces',`${target.activeUid}__${lesson.id}`),{
          ownerUid:target.activeUid,studentId:target.id,lessonId:lesson.id,
          pageWork:{_learning:{teacherAdjustment:adjustment}},pageWorkUpdatedAt:serverTimestamp()
        },{merge:true});
        $('#hl1TeacherStatus').textContent=`${target.id}の進度調整を保存しました。生徒の次回ログイン・教材再表示時に反映します。`;
      }catch(err){$('#hl1TeacherStatus').textContent=`保存に失敗しました（権限・通信状態を確認）：${err.code||err.message}`;}
      finally{if(target.id===$('#hl1TeacherStudent').value)$('#hl1TeacherApply').disabled=false;}
    });
  }
  mobileShow('pdf');renderPage();
  const lifecycle=new MutationObserver(()=>{if(!container.isConnected){clearTimeout(saveTimer);lifecycle.disconnect();}});
  lifecycle.observe(document.getElementById('app'),{childList:true,subtree:true});
  const editorReady=mountWebWorkspace({container:$('#webWorkspace'),lesson,db,student,uid,linkedWorkbook:true})
    .then(api=>{editorApi=api;})
    .catch(err=>{$('#webWorkspace').innerHTML=`<p class="message error">エディターを読み込めません：${escapeHtml(err.message)}</p>`;});
  if(isStudent)loadHistory();else setSaveStatus('先生プレビュー：全ページを確認できます。');
  await editorReady;
}
