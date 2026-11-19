const express = require("express");
const crypto = require("crypto");

const app = express();

const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL =
  process.env.GROQ_MODEL ||
  "meta-llama/llama-4-scout-17b-16e-instruct";

app.use(express.json({ limit: "15mb" }));

/* =========================================================
   HTML
========================================================= */

const HTML = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>AI学習チャット</title>

<style>
*{
  box-sizing:border-box;
  -webkit-tap-highlight-color:transparent;
}

html,body{
  margin:0;
  padding:0;
  width:100%;
  min-height:100%;
  font-family:-apple-system,BlinkMacSystemFont,"Noto Sans JP","Yu Gothic",sans-serif;
  background:#f7f7f8;
  color:#222;
}

button,textarea{font:inherit}
button{cursor:pointer}

.screen{
  display:none;
  min-height:100dvh;
}

.screen.active{
  display:flex;
}

/* START */

#start{
  align-items:center;
  justify-content:center;
  padding:25px;
}

.start-box{
  width:min(430px,100%);
  text-align:center;
}

.logo{
  font-size:30px;
  font-weight:700;
  margin-bottom:42px;
}

.mode-list{
  display:flex;
  flex-direction:column;
  gap:15px;
}

.mode-button{
  height:68px;
  border:1px solid #ddd;
  border-radius:18px;
  background:#fff;
  font-size:20px;
  font-weight:600;
}

.mode-button:active{
  transform:scale(.98);
  background:#f0f0f0;
}

/* SUBJECT */

#subjects{
  position:relative;
  align-items:center;
  justify-content:center;
  padding:25px;
}

.subject-box{
  width:min(430px,100%);
}

.page-title{
  text-align:center;
  font-size:25px;
  margin:0 0 28px;
}

.subject-list{
  display:flex;
  flex-direction:column;
  gap:12px;
}

.subject-button{
  height:58px;
  border:1px solid #ddd;
  border-radius:15px;
  background:#fff;
  font-size:18px;
}

.subject-button:active{
  background:#eee;
}

.back{
  position:absolute;
  left:12px;
  top:12px;
  width:44px;
  height:44px;
  border:0;
  border-radius:50%;
  background:transparent;
  font-size:25px;
}

/* CHAT */

#chat{
  flex-direction:column;
  background:#f7f7f8;
}

.chat-header{
  height:64px;
  flex:none;
  display:flex;
  align-items:center;
  padding:8px 12px;
  background:#fff;
  border-bottom:1px solid #e5e5e5;
  position:sticky;
  top:0;
  z-index:10;
}

.chat-back{
  width:42px;
  height:42px;
  border:0;
  background:transparent;
  font-size:24px;
}

.chat-info{
  margin-left:5px;
}

.chat-title{
  font-weight:700;
  font-size:16px;
}

.chat-sub{
  font-size:12px;
  color:#777;
  margin-top:2px;
}

/* PHOTO */

.attach-area{
  flex:none;
  padding:11px;
  background:#fff;
  border-bottom:1px solid #e5e5e5;
}

.attach-inner{
  width:min(760px,100%);
  margin:auto;
}

.attach-buttons{
  display:flex;
  gap:8px;
}

.attach-button{
  flex:1;
  height:43px;
  border:1px solid #ddd;
  border-radius:11px;
  background:#fff;
  font-size:14px;
}

.photo-preview{
  display:none;
  margin-bottom:9px;
}

.photo-preview.show{
  display:block;
}

.photo-preview img{
  display:block;
  max-width:100%;
  max-height:180px;
  border-radius:12px;
  border:1px solid #ddd;
}

.remove-photo{
  margin-top:6px;
  border:0;
  border-radius:8px;
  padding:7px 10px;
  background:#eee;
  font-size:12px;
}

/* CHAT */

.chat-body{
  flex:1;
  overflow-y:auto;
  padding:16px 10px 145px;
}

.messages{
  width:min(760px,100%);
  margin:auto;
}

.message{
  display:flex;
  margin:9px 0;
}

.message.user{
  justify-content:flex-end;
}

.message.ai{
  justify-content:flex-start;
}

.bubble{
  max-width:88%;
  padding:12px 15px;
  border-radius:17px;
  line-height:1.7;
  white-space:pre-wrap;
  word-break:break-word;
  font-size:15px;
}

.user .bubble{
  background:#222;
  color:#fff;
  border-bottom-right-radius:5px;
}

.ai .bubble{
  background:#fff;
  border:1px solid #e4e4e4;
  border-bottom-left-radius:5px;
}

/* THINKING */

.typing{
  height:42px;
  min-width:58px;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:6px;
}

.dot{
  width:8px;
  height:8px;
  border-radius:50%;
  background:#777;
  animation:powa 1.1s infinite ease-in-out;
}

.dot:nth-child(2){animation-delay:.15s}
.dot:nth-child(3){animation-delay:.30s}

@keyframes powa{
  0%,70%,100%{
    transform:scale(.6);
    opacity:.35;
  }
  35%{
    transform:scale(1.5);
    opacity:1;
  }
}

/* INPUT */

.composer{
  position:fixed;
  left:0;
  right:0;
  bottom:0;
  z-index:20;
  padding:9px 10px calc(9px + env(safe-area-inset-bottom));
  background:rgba(255,255,255,.97);
  border-top:1px solid #ddd;
}

.composer-inner{
  width:min(760px,100%);
  margin:auto;
  display:flex;
  gap:8px;
  align-items:flex-end;
}

#input{
  flex:1;
  min-height:47px;
  max-height:140px;
  resize:none;
  border:1px solid #ccc;
  border-radius:14px;
  padding:11px 13px;
  outline:none;
  background:#fff;
  line-height:1.5;
}

#send{
  width:64px;
  height:47px;
  border:0;
  border-radius:14px;
  background:#222;
  color:#fff;
  font-weight:600;
}

#send:disabled{
  opacity:.45;
}

/* CROP */

#cropModal{
  display:none;
  position:fixed;
  inset:0;
  z-index:100;
  background:rgba(0,0,0,.75);
  align-items:center;
  justify-content:center;
  padding:14px;
}

#cropModal.show{
  display:flex;
}

.crop-box{
  width:min(720px,100%);
  background:#fff;
  border-radius:18px;
  padding:15px;
}

.crop-title{
  font-size:18px;
  margin:0 0 12px;
}

.crop-stage{
  position:relative;
  height:min(65dvh,540px);
  background:#111;
  border-radius:12px;
  overflow:hidden;
  display:flex;
  align-items:center;
  justify-content:center;
}

#cropCanvas{
  max-width:100%;
  max-height:100%;
  touch-action:none;
}

.crop-buttons{
  display:flex;
  justify-content:flex-end;
  gap:8px;
  margin-top:12px;
}

.crop-buttons button{
  border:0;
  border-radius:10px;
  padding:11px 14px;
}

.crop-cancel{
  background:#eee;
}

.crop-use{
  background:#222;
  color:#fff;
}

.error-box{
  color:#b00020;
  background:#fff0f2;
  border:1px solid #ffc4cc;
  border-radius:12px;
  padding:11px 13px;
  white-space:pre-wrap;
  font-size:13px;
  line-height:1.6;
}

@media(max-width:600px){
  .logo{font-size:27px}
  .bubble{max-width:92%}
}
</style>
</head>

<body>

<section id="start" class="screen active">
  <div class="start-box">

    <div class="logo">AI学習チャット</div>

    <div class="mode-list">

      <button class="mode-button" data-mode="添削">
        添削
      </button>

      <button class="mode-button" data-mode="質問">
        質問
      </button>

    </div>
  </div>
</section>


<section id="subjects" class="screen">

  <button class="back" id="subjectBack">←</button>

  <div class="subject-box">

    <h1 class="page-title" id="subjectTitle"></h1>

    <div class="subject-list">

      <button class="subject-button" data-subject="国語">
        国語
      </button>

      <button class="subject-button" data-subject="数学">
        数学
      </button>

      <button class="subject-button" data-subject="社会">
        社会
      </button>

      <button class="subject-button" data-subject="理科">
        理科
      </button>

      <button class="subject-button" data-subject="英語">
        英語
      </button>

    </div>

  </div>
</section>


<section id="chat" class="screen">

  <header class="chat-header">

    <button class="chat-back" id="chatBack">
      ←
    </button>

    <div class="chat-info">

      <div class="chat-title">
        AI学習チャット
      </div>

      <div class="chat-sub" id="chatSub"></div>

    </div>

  </header>


  <div class="attach-area">

    <div class="attach-inner">

      <div class="photo-preview" id="photoPreview">

        <img id="previewImage" alt="添付画像">

        <button class="remove-photo" id="removePhoto">
          写真を外す
        </button>

      </div>

      <div class="attach-buttons">

        <button class="attach-button" id="takePhoto">
          写真を撮る
        </button>

        <button class="attach-button" id="selectPhoto">
          写真を選択
        </button>

        <input
          id="cameraInput"
          type="file"
          accept="image/*"
          capture="environment"
          hidden
        >

        <input
          id="fileInput"
          type="file"
          accept="image/*"
          hidden
        >

      </div>

    </div>

  </div>


  <div class="chat-body" id="chatBody">

    <div class="messages" id="messages"></div>

  </div>


  <div class="composer">

    <div class="composer-inner">

      <textarea
        id="input"
        rows="2"
        placeholder="質問を入力…"
      ></textarea>

      <button id="send">
        送信
      </button>

    </div>

  </div>

</section>


<div id="cropModal">

  <div class="crop-box">

    <h2 class="crop-title">
      写真を切り取る
    </h2>

    <div class="crop-stage">

      <canvas id="cropCanvas"></canvas>

    </div>

    <div class="crop-buttons">

      <button class="crop-cancel" id="cropCancel">
        キャンセル
      </button>

      <button class="crop-use" id="cropUse">
        この範囲を使う
      </button>

    </div>

  </div>

</div>


<script>

/* =========================================================
   STATE
========================================================= */

const state = {
  mode: "",
  subject: "",
  step: 1,
  messages: [],
  imageData: null,
  answerIds: [],
  waiting: false
};


/* =========================================================
   ELEMENTS
========================================================= */

const start =
  document.getElementById("start");

const subjects =
  document.getElementById("subjects");

const chat =
  document.getElementById("chat");

const subjectTitle =
  document.getElementById("subjectTitle");

const chatSub =
  document.getElementById("chatSub");

const messages =
  document.getElementById("messages");

const input =
  document.getElementById("input");

const send =
  document.getElementById("send");

const chatBody =
  document.getElementById("chatBody");

const photoPreview =
  document.getElementById("photoPreview");

const previewImage =
  document.getElementById("previewImage");

const cameraInput =
  document.getElementById("cameraInput");

const fileInput =
  document.getElementById("fileInput");

const cropModal =
  document.getElementById("cropModal");

const cropCanvas =
  document.getElementById("cropCanvas");


/* =========================================================
   SCREEN
========================================================= */

function showScreen(screen){

  document
    .querySelectorAll(".screen")
    .forEach(element=>{
      element.classList.remove("active");
    });

  screen.classList.add("active");
}


/* =========================================================
   MODE
========================================================= */

document
  .querySelectorAll("[data-mode]")
  .forEach(button=>{

    button.addEventListener("click",()=>{

      state.mode =
        String(button.dataset.mode || "").trim();

      console.log(
        "選択モード:",
        state.mode
      );

      subjectTitle.textContent =
        state.mode;

      showScreen(subjects);

    });

  });


/* =========================================================
   BACK
========================================================= */

document
  .getElementById("subjectBack")
  .onclick=()=>{

    resetSession();

    showScreen(start);

  };


document
  .getElementById("chatBack")
  .onclick=()=>{

    resetSession();

    showScreen(subjects);

  };


/* =========================================================
   SUBJECT
========================================================= */

document
  .querySelectorAll("[data-subject]")
  .forEach(button=>{

    button.addEventListener("click",()=>{

      state.subject =
        String(
          button.dataset.subject || ""
        ).trim();

      state.step = 1;
      state.messages = [];
      state.imageData = null;
      state.answerIds = [];
      state.waiting = false;

      messages.innerHTML = "";
      input.value = "";

      clearPhoto();

      chatSub.textContent =
        state.subject +
        " ・ " +
        state.mode;

      addAI(
        "問題や質問を送ってね。"
      );

      showScreen(chat);

      input.focus();

    });

  });


/* =========================================================
   MESSAGE
========================================================= */

function addMessage(text,type){

  const row =
    document.createElement("div");

  row.className =
    "message " + type;

  const bubble =
    document.createElement("div");

  bubble.className =
    "bubble";

  bubble.textContent =
    text;

  row.appendChild(bubble);

  messages.appendChild(row);

  scrollBottom();

  return row;
}


function addAI(text){
  return addMessage(text,"ai");
}


function addUser(text){
  return addMessage(text,"user");
}


/* =========================================================
   THINKING
========================================================= */

function showThinking(){

  const row =
    document.createElement("div");

  row.className =
    "message ai";

  const bubble =
    document.createElement("div");

  bubble.className =
    "bubble typing";

  for(let i=0;i<3;i++){

    const dot =
      document.createElement("span");

    dot.className =
      "dot";

    bubble.appendChild(dot);

  }

  row.appendChild(bubble);

  messages.appendChild(row);

  scrollBottom();

  return row;
}


function scrollBottom(){

  requestAnimationFrame(()=>{

    chatBody.scrollTop =
      chatBody.scrollHeight;

  });

}


/* =========================================================
   PHOTO
========================================================= */

document
  .getElementById("takePhoto")
  .onclick=()=>{
    cameraInput.click();
  };


document
  .getElementById("selectPhoto")
  .onclick=()=>{
    fileInput.click();
  };


cameraInput.onchange =
  event=>{
    handleImage(event.target.files[0]);
  };


fileInput.onchange =
  event=>{
    handleImage(event.target.files[0]);
  };


let cropImage = new Image();
let cropSource = null;
let cropRect = null;
let dragging = false;
let dragStart = null;


function handleImage(file){

  if(!file){
    return;
  }

  if(!file.type.startsWith("image/")){

    alert("画像を選択してください。");

    return;
  }

  const reader =
    new FileReader();

  reader.onload=()=>{

    cropSource =
      reader.result;

    cropImage =
      new Image();

    cropImage.onload=()=>{
      openCrop();
    };

    cropImage.src =
      cropSource;

  };

  reader.readAsDataURL(file);
}


/* =========================================================
   CROP
========================================================= */

function openCrop(){

  cropModal.classList.add("show");

  setupCropCanvas();
}


function setupCropCanvas(){

  const maxW =
    Math.min(
      window.innerWidth - 40,
      680
    );

  const maxH =
    Math.min(
      window.innerHeight * .62,
      520
    );

  const ratio =
    cropImage.naturalWidth /
    cropImage.naturalHeight;

  let w = maxW;
  let h = w / ratio;

  if(h > maxH){

    h = maxH;
    w = h * ratio;

  }

  cropCanvas.width =
    Math.round(w);

  cropCanvas.height =
    Math.round(h);

  cropRect = {

    x:w * .08,
    y:h * .08,
    width:w * .84,
    height:h * .84

  };

  drawCrop();
}


function drawCrop(){

  const ctx =
    cropCanvas.getContext("2d");

  const w =
    cropCanvas.width;

  const h =
    cropCanvas.height;

  ctx.clearRect(
    0,
    0,
    w,
    h
  );

  ctx.drawImage(
    cropImage,
    0,
    0,
    w,
    h
  );

  ctx.fillStyle =
    "rgba(0,0,0,.48)";

  ctx.beginPath();

  ctx.rect(
    0,
    0,
    w,
    h
  );

  ctx.rect(
    cropRect.x,
    cropRect.y,
    cropRect.width,
    cropRect.height
  );

  ctx.fill("evenodd");

  ctx.strokeStyle =
    "#fff";

  ctx.lineWidth = 2;

  ctx.strokeRect(
    cropRect.x,
    cropRect.y,
    cropRect.width,
    cropRect.height
  );
}


/* =========================================================
   CROP MOVE
========================================================= */

function pointerPosition(event){

  const rect =
    cropCanvas.getBoundingClientRect();

  const scaleX =
    cropCanvas.width /
    rect.width;

  const scaleY =
    cropCanvas.height /
    rect.height;

  return {

    x:
      (event.clientX - rect.left) *
      scaleX,

    y:
      (event.clientY - rect.top) *
      scaleY

  };
}


cropCanvas.addEventListener(
  "pointerdown",
  event=>{

    const p =
      pointerPosition(event);

    if(
      p.x >= cropRect.x &&
      p.x <= cropRect.x + cropRect.width &&
      p.y >= cropRect.y &&
      p.y <= cropRect.y + cropRect.height
    ){

      dragging = true;

      dragStart = {

        x:p.x - cropRect.x,
        y:p.y - cropRect.y

      };

      cropCanvas.setPointerCapture(
        event.pointerId
      );

    }

  }
);


cropCanvas.addEventListener(
  "pointermove",
  event=>{

    if(!dragging){
      return;
    }

    const p =
      pointerPosition(event);

    let x =
      p.x - dragStart.x;

    let y =
      p.y - dragStart.y;

    x =
      Math.max(
        0,
        Math.min(
          x,
          cropCanvas.width -
          cropRect.width
        )
      );

    y =
      Math.max(
        0,
        Math.min(
          y,
          cropCanvas.height -
          cropRect.height
        )
      );

    cropRect.x = x;
    cropRect.y = y;

    drawCrop();

  }
);


cropCanvas.addEventListener(
  "pointerup",
  ()=>{
    dragging = false;
  }
);


/* =========================================================
   CROP USE
========================================================= */

document
  .getElementById("cropUse")
  .onclick=()=>{

    const output =
      document.createElement("canvas");

    const scaleX =
      cropImage.naturalWidth /
      cropCanvas.width;

    const scaleY =
      cropImage.naturalHeight /
      cropCanvas.height;

    output.width =
      Math.min(
        1600,
        Math.round(
          cropRect.width * scaleX
        )
      );

    output.height =
      Math.min(
        1600,
        Math.round(
          cropRect.height * scaleY
        )
      );

    const ctx =
      output.getContext("2d");

    ctx.drawImage(

      cropImage,

      cropRect.x * scaleX,
      cropRect.y * scaleY,

      cropRect.width * scaleX,
      cropRect.height * scaleY,

      0,
      0,

      output.width,
      output.height

    );

    state.imageData =
      output.toDataURL(
        "image/jpeg",
        .82
      );

    previewImage.src =
      state.imageData;

    photoPreview.classList.add("show");

    cropModal.classList.remove("show");

    cropSource = null;

    /*
     * 質問入力欄は変更しない。
     */

    input.focus();

  };


document
  .getElementById("cropCancel")
  .onclick=()=>{

    cropModal.classList.remove("show");

    cropSource = null;

  };


/* =========================================================
   REMOVE PHOTO
========================================================= */

document
  .getElementById("removePhoto")
  .onclick =
    clearPhoto;


function clearPhoto(){

  state.imageData = null;

  previewImage.removeAttribute("src");

  photoPreview.classList.remove("show");

  cameraInput.value = "";
  fileInput.value = "";

}


/* =========================================================
   SEND
========================================================= */

send.onclick =
  sendMessage;


input.addEventListener(
  "keydown",
  event=>{

    if(
      event.key === "Enter" &&
      !event.shiftKey
    ){

      event.preventDefault();

      sendMessage();

    }

  }
);


async function sendMessage(){

  if(state.waiting){
    return;
  }

  const text =
    input.value.trim();

  if(
    !text &&
    !state.imageData
  ){
    return;
  }


  let display =
    text;


  if(state.imageData){

    if(display){

      display +=
        "\\n\\n[写真を添付]";

    }else{

      display =
        "[写真を添付]";

    }

  }


  addUser(display);


  state.messages.push({

    role:"user",

    content:
      text ||
      "添付した写真を確認してください。"

  });


  input.value = "";

  state.waiting = true;

  send.disabled = true;


  const thinking =
    showThinking();


  /*
   * 送信直前の値をログに出す。
   */

  console.log(
    "送信内容:",
    {
      mode:state.mode,
      subject:state.subject,
      step:state.step,
      hasImage:Boolean(state.imageData)
    }
  );


  try{

    const response =
      await fetch(
        "/api/chat",
        {

          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              mode:
                String(
                  state.mode || ""
                ).trim(),

              subject:
                String(
                  state.subject || ""
                ).trim(),

              step:
                state.step,

              messages:
                state.messages,

              imageData:
                state.imageData

            })

        }
      );


    const data =
      await response.json();


    if(!response.ok){

      throw new Error(
        data.error ||
        "AIとの通信に失敗しました。"
      );

    }


    thinking.remove();

    addAI(
      data.answer
    );


    state.messages.push({

      role:"assistant",

      content:
        data.answer

    });


    if(data.id){

      state.answerIds.push(
        data.id
      );

    }


    if(state.step < 3){

      state.step++;

    }


    clearPhoto();


  }catch(error){

    console.error(error);

    thinking.remove();

    addAI(
      "AIとの接続でエラーが発生しました。"
    );


    const errorRow =
      document.createElement("div");

    errorRow.className =
      "message ai";


    const errorBox =
      document.createElement("div");

    errorBox.className =
      "error-box";


    errorBox.textContent =
      "エラー詳細：\\n" +
      (
        error.message ||
        "不明なエラー"
      );


    errorRow.appendChild(
      errorBox
    );

    messages.appendChild(
      errorRow
    );

    scrollBottom();


  }finally{

    state.waiting = false;

    send.disabled = false;

    input.focus();

  }

}


/* =========================================================
   RESET
========================================================= */

function resetSession(){

  state.mode = "";
  state.subject = "";
  state.step = 1;
  state.messages = [];
  state.imageData = null;
  state.answerIds = [];
  state.waiting = false;

  messages.innerHTML = "";

  input.value = "";

  clearPhoto();

}


window.addEventListener(
  "pagehide",
  resetSession
);

</script>

</body>
</html>`;


/* =========================================================
   SYSTEM PROMPT
========================================================= */

const SYSTEM_PROMPT = `
あなたは中学生向けのAI学習チャットの先生です。

【話し方】
・中学生に自然に伝わる言葉を使う。
・優しいが、子ども扱いしない。
・上から目線にしない。
・「こんなの簡単」「なんで分からない」などと言わない。
・過剰に褒めない。
・短く分かりやすく説明する。
・間違いを責めない。
・分からなければ別の説明方法に変える。

【最低3段階】
一つの回答でヒント・解説・答えを全部出してはいけません。

STEP 1：
ヒントだけ。
答えを出さない。

STEP 2：
解説。
途中式や考え方を示してよい。
最終的な答えはまだ出さない。

STEP 3：
答え。
正しい答えと考え方を整理する。

現在指定されているSTEPだけを返してください。

【STEP3の後】
同じ内容の練習問題を1問出してください。

【練習問題】
正解なら短く確認してください。
不正解なら、

1. 要点をもう一度説明
2. 確認テスト
3. 再挑戦

の順で進めてください。

確認テストでも分からなければ、さらに簡単に説明してください。

【添削】
答案、ノート、作文などの画像を確認してください。
良いところ、間違い、直すポイントを確認してください。
最初から全部答えを出さず、段階的に進めてください。

【画像】
画像の内容を確認してください。
数学の問題、答案、英作文、国語の記述などを読み取ってください。
読めない部分は推測しないでください。
`;


/* =========================================================
   GROQ API
========================================================= */

app.post(
  "/api/chat",
  async (req,res)=>{

    try{

      /*
       * 受信内容をRenderログで確認
       */

      console.log(
        "========== API REQUEST =========="
      );

      console.log(
        "mode:",
        req.body?.mode
      );

      console.log(
        "subject:",
        req.body?.subject
      );

      console.log(
        "step:",
        req.body?.step
      );

      console.log(
        "hasImage:",
        Boolean(req.body?.imageData)
      );

      console.log(
        "================================="
      );


      if(!GROQ_API_KEY){

        return res.status(500).json({

          error:
            "GROQ_API_KEY が設定されていません。RenderのEnvironment Variablesを確認してください。"

        });

      }


      /*
       * modeを明示的に文字列化
       */

      const rawMode =
        req.body?.mode;

      const rawSubject =
        req.body?.subject;


      const mode =
        String(
          rawMode ?? ""
        ).trim();


      const subject =
        String(
          rawSubject ?? ""
        ).trim();


      const step =
        Number(
          req.body?.step || 1
        );


      const messages =
        req.body?.messages;


      const imageData =
        req.body?.imageData;


      console.log(
        "正規化後:",
        {
          mode,
          subject,
          step
        }
      );


      /*
       * mode確認
       */

      if(
        mode !== "質問" &&
        mode !== "添削"
      ){

        return res.status(400).json({

          error:
            "モードが正しくありません。\n" +
            "受信したmode: [" +
            mode +
            "]"

        });

      }


      /*
       * subject確認
       */

      const allowedSubjects = [
        "国語",
        "数学",
        "社会",
        "理科",
        "英語"
      ];


      if(
        !allowedSubjects.includes(
          subject
        )
      ){

        return res.status(400).json({

          error:
            "教科が正しくありません。\n" +
            "受信したsubject: [" +
            subject +
            "]"

        });

      }


      if(!GROQ_API_KEY){

        return res.status(500).json({

          error:
            "GROQ_API_KEYがありません。"

        });

      }


      /*
       * 会話履歴
       *
       * サーバーには保存しない。
       */

      const history =
        Array.isArray(messages)
          ? messages.slice(-14)
          : [];


      let currentStep =
        "STEP 1：ヒント";


      if(step === 2){

        currentStep =
          "STEP 2：解説";

      }
      else if(step >= 3){

        currentStep =
          "STEP 3：答え。その後は練習問題";

      }


      const groqMessages = [

        {

          role:"system",

          content:
            SYSTEM_PROMPT +

            "\n\n現在の教科：" +
            subject +

            "\n現在のモード：" +
            mode +

            "\n現在の段階：" +
            currentStep

        }

      ];


      /*
       * 会話をGroqへ渡す
       */

      for(
        const message
        of history
      ){

        if(
          !message ||
          !message.content
        ){

          continue;

        }


        groqMessages.push({

          role:
            message.role === "assistant"
              ? "assistant"
              : "user",

          content:
            String(
              message.content
            ).slice(
              0,
              12000
            )

        });

      }


      /*
       * 画像
       */

      if(
        imageData &&
        typeof imageData === "string" &&
        imageData.startsWith(
          "data:image/"
        )
      ){

        for(
          let i =
            groqMessages.length - 1;
          i >= 0;
          i--
        ){

          if(
            groqMessages[i].role ===
              "user"
          ){

            const text =
              groqMessages[i].content;


            groqMessages[i].content = [

              {

                type:"text",

                text:
                  text ||
                  "この画像を確認してください。"

              },

              {

                type:"image_url",

                image_url:{
                  url:imageData
                }

              }

            ];


            break;

          }

        }

      }


      console.log(
        "Groqへ送信:",
        {
          model:GROQ_MODEL,
          mode,
          subject,
          step,
          hasImage:Boolean(imageData)
        }
      );


      /*
       * Groq
       */

      const groqResponse =
        await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {

            method:"POST",

            headers:{

              "Authorization":
                "Bearer " +
                GROQ_API_KEY,

              "Content-Type":
                "application/json"

            },

            body:
              JSON.stringify({

                model:
                  GROQ_MODEL,

                messages:
                  groqMessages,

                temperature:
                  0.45,

                max_tokens:
                  1000

              })

          }
        );


      const rawText =
        await groqResponse.text();


      let data;


      try{

        data =
          JSON.parse(
            rawText
          );

      }
      catch{

        data = {
          raw:rawText
        };

      }


      /*
       * Groqエラー
       */

      if(
        !groqResponse.ok
      ){

        console.error(
          "========== GROQ ERROR =========="
        );

        console.error(
          "HTTP:",
          groqResponse.status
        );

        console.error(
          "MODEL:",
          GROQ_MODEL
        );

        console.error(
          "RESPONSE:",
          data
        );

        console.error(
          "================================"
        );


        return res.status(
          groqResponse.status
        ).json({

          error:
            "Groq APIエラー\n" +
            "HTTP " +
            groqResponse.status +
            "\n\n" +
            (
              data?.error?.message ||
              data?.message ||
              data?.raw ||
              "Groqから詳細なエラーが返りませんでした。"
            )

        });

      }


      const answer =
        data?.choices?.[0]?.message?.content;


      if(!answer){

        console.error(
          "回答なし:",
          data
        );


        return res.status(500).json({

          error:
            "Groqから回答が返ってきませんでした。"

        });

      }


      const answerId =
        data.id ||
        crypto.randomUUID();


      res.json({

        id:
          answerId,

        answer:
          answer

      });


    }
    catch(error){

      console.error(
        "========== SERVER ERROR =========="
      );

      console.error(
        error
      );

      console.error(
        "=================================="
      );


      res.status(500).json({

        error:
          error.message ||
          "サーバー側でエラーが発生しました。"

      });

    }

  }
);


/* =========================================================
   HTML
========================================================= */

/*
 * Express 5対応。
 * app.get("*") は使わない。
 */

app.use(
  (req,res)=>{

    res.type("html");

    res.send(
      HTML
    );

  }
);


/* =========================================================
   START
========================================================= */

app.listen(
  PORT,
  ()=>{

    console.log(
      "================================"
    );

    console.log(
      "AI学習チャット起動"
    );

    console.log(
      "PORT:",
      PORT
    );

    console.log(
      "MODEL:",
      GROQ_MODEL
    );

    console.log(
      "API KEY:",
      GROQ_API_KEY
        ? "設定済み"
        : "未設定"
    );

    console.log(
      "================================"
    );

  }
);
