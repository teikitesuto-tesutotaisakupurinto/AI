import express from "express";
import crypto from "crypto";

const app = express();

const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Renderの環境変数で変更可能
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
<meta name="viewport"
      content="width=device-width,initial-scale=1,viewport-fit=cover">

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
  height:100%;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Noto Sans JP",
    "Yu Gothic",
    sans-serif;
  background:#f7f7f8;
  color:#222;
}

button,
textarea{
  font:inherit;
}

button{
  cursor:pointer;
}

.screen{
  display:none;
  min-height:100dvh;
}

.screen.active{
  display:flex;
}

/* =========================
   START
========================= */

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
  background:white;
  font-size:20px;
  font-weight:600;
}

.mode-button:active{
  transform:scale(.98);
  background:#f0f0f0;
}

/* =========================
   SUBJECT
========================= */

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

/* =========================
   CHAT
========================= */

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

/* =========================
   ATTACHMENT
========================= */

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

/* =========================
   MESSAGES
========================= */

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

/* =========================
   POYO POYO
========================= */

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

.dot:nth-child(2){
  animation-delay:.15s;
}

.dot:nth-child(3){
  animation-delay:.30s;
}

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

/* =========================
   INPUT
========================= */

.composer{
  position:fixed;
  left:0;
  right:0;
  bottom:0;
  z-index:20;
  padding:
    9px
    10px
    calc(9px + env(safe-area-inset-bottom));
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

/* =========================
   CROP
========================= */

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
  margin:0 0:12px;
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

@media(max-width:600px){

  .logo{
    font-size:27px;
  }

  .bubble{
    max-width:92%;
  }

}

</style>
</head>

<body>

<!-- =====================================================
     START
===================================================== -->

<section id="start" class="screen active">

  <div class="start-box">

    <div class="logo">
      AI学習チャット
    </div>

    <div class="mode-list">

      <button
        class="mode-button"
        data-mode="添削">
        添削
      </button>

      <button
        class="mode-button"
        data-mode="質問">
        質問
      </button>

    </div>

  </div>

</section>


<!-- =====================================================
     SUBJECT
===================================================== -->

<section id="subjects" class="screen">

  <button
    class="back"
    id="subjectBack">
    ←
  </button>

  <div class="subject-box">

    <h1
      class="page-title"
      id="subjectTitle">
    </h1>

    <div class="subject-list">

      <button
        class="subject-button"
        data-subject="国語">
        国語
      </button>

      <button
        class="subject-button"
        data-subject="数学">
        数学
      </button>

      <button
        class="subject-button"
        data-subject="社会">
        社会
      </button>

      <button
        class="subject-button"
        data-subject="理科">
        理科
      </button>

      <button
        class="subject-button"
        data-subject="英語">
        英語
      </button>

    </div>

  </div>

</section>


<!-- =====================================================
     CHAT
===================================================== -->

<section id="chat" class="screen">

  <header class="chat-header">

    <button
      class="chat-back"
      id="chatBack">
      ←
    </button>

    <div class="chat-info">

      <div class="chat-title">
        AI学習チャット
      </div>

      <div
        class="chat-sub"
        id="chatSub">
      </div>

    </div>

  </header>


  <!-- 写真添付：上 -->

  <div class="attach-area">

    <div class="attach-inner">

      <div
        class="photo-preview"
        id="photoPreview">

        <img
          id="previewImage"
          alt="添付画像">

        <button
          class="remove-photo"
          id="removePhoto">
          写真を外す
        </button>

      </div>


      <div class="attach-buttons">

        <button
          class="attach-button"
          id="takePhoto">
          写真を撮る
        </button>

        <button
          class="attach-button"
          id="selectPhoto">
          写真を選択
        </button>

        <input
          id="cameraInput"
          type="file"
          accept="image/*"
          capture="environment"
          hidden>

        <input
          id="fileInput"
          type="file"
          accept="image/*"
          hidden>

      </div>

    </div>

  </div>


  <!-- チャット -->

  <div
    class="chat-body"
    id="chatBody">

    <div
      class="messages"
      id="messages">
    </div>

  </div>


  <!-- 質問入力：下 -->

  <div class="composer">

    <div class="composer-inner">

      <textarea
        id="input"
        rows="2"
        placeholder="質問を入力…"></textarea>

      <button
        id="send">
        送信
      </button>

    </div>

  </div>

</section>


<!-- =====================================================
     CROP
===================================================== -->

<div id="cropModal">

  <div class="crop-box">

    <h2 class="crop-title">
      写真を切り取る
    </h2>

    <div class="crop-stage">

      <canvas id="cropCanvas"></canvas>

    </div>

    <div class="crop-buttons">

      <button
        class="crop-cancel"
        id="cropCancel">
        キャンセル
      </button>

      <button
        class="crop-use"
        id="cropUse">
        この範囲を使う
      </button>

    </div>

  </div>

</div>


<script>

/* =========================================================
   状態
========================================================= */

const state = {

  mode: null,

  subject: null,

  step: 1,

  messages: [],

  imageData: null,

  answerIds: [],

  waiting: false

};


/* =========================================================
   要素
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
   画面
========================================================= */

function showScreen(screen){

  document
    .querySelectorAll(".screen")
    .forEach(x=>{
      x.classList.remove("active");
    });

  screen.classList.add("active");

}


/* =========================================================
   添削 / 質問
========================================================= */

document
  .querySelectorAll("[data-mode]")
  .forEach(button=>{

    button.addEventListener("click",()=>{

      state.mode =
        button.dataset.mode;

      subjectTitle.textContent =
        state.mode;

      showScreen(subjects);

    });

  });


/* =========================================================
   戻る
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
   教科
========================================================= */

document
  .querySelectorAll("[data-subject]")
  .forEach(button=>{

    button.addEventListener("click",()=>{

      state.subject =
        button.dataset.subject;

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
   メッセージ
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

  return addMessage(
    text,
    "ai"
  );

}


function addUser(text){

  return addMessage(
    text,
    "user"
  );

}


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
   写真
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
  e=>{

    handleImage(
      e.target.files[0]
    );

  };


fileInput.onchange =
  e=>{

    handleImage(
      e.target.files[0]
    );

  };


let cropImage =
  new Image();

let cropSource =
  null;

let cropRect =
  null;

let dragging =
  false;

let dragStart =
  null;


/* =========================================================
   画像選択
========================================================= */

function handleImage(file){

  if(!file){

    return;

  }


  if(!file.type.startsWith("image/")){

    alert(
      "画像を選択してください。"
    );

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
   簡易トリミング
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


  let w =
    maxW;

  let h =
    w / ratio;


  if(h > maxH){

    h =
      maxH;

    w =
      h * ratio;

  }


  cropCanvas.width =
    Math.round(w);

  cropCanvas.height =
    Math.round(h);


  cropRect = {

    x: w * .08,

    y: h * .08,

    width: w * .84,

    height: h * .84

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


  /* 暗い外側 */

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


  ctx.fill(
    "evenodd"
  );


  /* 枠 */

  ctx.strokeStyle =
    "#fff";

  ctx.lineWidth =
    2;

  ctx.strokeRect(
    cropRect.x,
    cropRect.y,
    cropRect.width,
    cropRect.height
  );

}


/* =========================================================
   トリミング操作
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


  const point =
    event.touches
      ? event.touches[0]
      : event;


  return {

    x:
      (point.clientX -
       rect.left) *
      scaleX,

    y:
      (point.clientY -
       rect.top) *
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

        x:
          p.x -
          cropRect.x,

        y:
          p.y -
          cropRect.y

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
      p.x -
      dragStart.x;


    let y =
      p.y -
      dragStart.y;


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


    cropRect.x =
      x;

    cropRect.y =
      y;


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
   切り取り確定
========================================================= */

document
  .getElementById("cropUse")
  .onclick=()=>{

    const output =
      document.createElement("canvas");


    const sourceW =
      cropImage.naturalWidth;

    const sourceH =
      cropImage.naturalHeight;


    const scaleX =
      sourceW /
      cropCanvas.width;


    const scaleY =
      sourceH /
      cropCanvas.height;


    output.width =
      Math.min(
        1600,
        Math.round(
          cropRect.width *
          scaleX
        )
      );


    output.height =
      Math.min(
        1600,
        Math.round(
          cropRect.height *
          scaleY
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


    document
      .getElementById("photoPreview")
      .classList.add("show");


    cropModal.classList.remove(
      "show"
    );


    cropSource = null;


    /*
     * 質問入力は絶対に変更しない。
     */

    input.focus();

  };


/* =========================================================
   切り取りキャンセル
========================================================= */

document
  .getElementById("cropCancel")
  .onclick=()=>{

    cropModal.classList.remove(
      "show"
    );

    cropSource = null;

  };


/* =========================================================
   写真削除
========================================================= */

document
  .getElementById("removePhoto")
  .onclick=clearPhoto;


function clearPhoto(){

  state.imageData =
    null;

  previewImage.removeAttribute(
    "src"
  );

  document
    .getElementById("photoPreview")
    .classList.remove("show");

  cameraInput.value = "";

  fileInput.value = "";

}


/* =========================================================
   送信
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


  /*
   * 会話をブラウザのメモリに一時保持。
   *
   * localStorageには保存しない。
   * sessionStorageにも保存しない。
   */

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
                state.mode,

              subject:
                state.subject,

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


    /*
     * 回答IDは一時保持。
     * 永続保存しない。
     */

    if(data.id){

      state.answerIds.push(
        data.id
      );

    }


    /*
     * 最低3段階
     *
     * 1 = ヒント
     * 2 = 解説
     * 3 = 答え
     *
     * 3の後は練習問題フェーズ。
     */

    if(state.step < 3){

      state.step++;

    }


    /*
     * AIへの送信が終わったら
     * 添付画像だけ解除。
     *
     * 質問入力はすでに送信済み。
     */

    clearPhoto();


  }catch(error){

    console.error(error);

    thinking.remove();


    addAI(
      "ごめん、うまくつながらなかったみたい。\\nもう一度送ってみて。"
    );

  }finally{

    state.waiting =
      false;

    send.disabled =
      false;

    input.focus();

  }

}


/* =========================================================
   セッションリセット
========================================================= */

function resetSession(){

  state.mode = null;

  state.subject = null;

  state.step = 1;

  state.messages = [];

  state.imageData = null;

  state.answerIds = [];

  state.waiting = false;

  messages.innerHTML = "";

  input.value = "";

  clearPhoto();

}


/*
 * ページを閉じたら、
 * JavaScriptメモリ上のセッションも終了。
 *
 * localStorage等には一切保存していない。
 */

window.addEventListener(
  "pagehide",
  resetSession
);

</script>

</body>
</html>`;


/* =========================================================
   AI SYSTEM PROMPT
========================================================= */

const SYSTEM_PROMPT = `
あなたは「AI学習チャット」の中学生向けAI先生です。

【基本方針】
・中学生が自然に話せる、やさしく落ち着いた話し方。
・上から目線にしない。
・子ども扱いしない。
・「こんなの簡単」「なんで分からないの」などは禁止。
・説明を長くしすぎない。
・間違いを責めない。
・生徒が分からなければ、別の言い方に変える。
・生徒が理解できる速度に合わせる。

【重要：段階指導】
問題を最初から全部解説してはいけません。

基本は最低3回に分けます。

STEP 1
ヒントだけ。
答えを出さない。
生徒が自分で考えられるようにする。

STEP 2
解説。
STEP1より具体的に説明する。
途中式や考え方を示してよい。
ただし最終的な答えはまだ出さない。

STEP 3
答え。
正しい答えと、どうしてそうなるのかを整理する。

STEP3まで、1回の返答でまとめて出してはいけません。

【STEP3の後】
必ず同じ内容を使った練習問題を1問出してください。

【練習問題】
生徒が回答したら理解度を確認してください。

正解なら、
・短く正解を伝える
・理解できたことを確認
・必要なら次の少し難しい問題へ

不正解または理解不足なら、
1. 要点をもう一度説明
2. 確認テストを出す
3. 再挑戦させる

確認テストでも分からなければ、さらに簡単な説明に変えてください。

【添削モード】
写真が答案・ノート・作文などの場合、
・合っているところ
・間違っているところ
・直すポイント
を確認してください。

ただし最初から答えを全部出さず、
まずヒントから始めてください。

【画像】
画像が添付されている場合は、画像の内容をよく確認してください。
数学の問題、答案、英作文、国語の記述などを読み取ってください。
読めない部分は勝手に推測しないでください。

【重要】
今回の返答だけで全部説明しないでください。
現在のSTEPだけを返してください。
`;


/* =========================================================
   API
========================================================= */

app.post("/api/chat", async (req,res)=>{

  try{

    if(!GROQ_API_KEY){

      return res.status(500).json({

        error:
          "GROQ_API_KEY がRenderに設定されていません。"

      });

    }


    const {
      mode,
      subject,
      step,
      messages,
      imageData
    } = req.body;


    const allowedSubjects =
      [
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

        error:"教科が正しくありません。"

      });

    }


    if(
      mode !== "質問" &&
      mode !== "添削"
    ){

      return res.status(400).json({

        error:"モードが正しくありません。"

      });

    }


    /*
     * ブラウザから受け取った会話。
     *
     * 永続保存しない。
     */

    const history =
      Array.isArray(messages)
        ? messages.slice(-14)
        : [];


    const groqMessages = [

      {

        role:"system",

        content:
          SYSTEM_PROMPT +
          "\\n\\n現在の教科：" +
          subject +
          "\\n現在のモード：" +
          mode +
          "\\n現在の段階：" +
          (
            Number(step) <= 1
              ? "STEP 1：ヒント"
              : Number(step) === 2
                ? "STEP 2：解説"
                : "STEP 3：答え・その後は練習問題"
          )

      }

    ];


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
     * 画像がある場合、
     * 最後のuserメッセージを
     * Vision形式に変更。
     */

    if(
      imageData &&
      typeof imageData === "string" &&
      imageData.startsWith("data:image/")
    ){

      for(
        let i =
          groqMessages.length - 1;
        i >= 0;
        i--
      ){

        if(
          groqMessages[i].role === "user"
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


    const data =
      await groqResponse.json();


    if(!groqResponse.ok){

      console.error(
        "Groq error:",
        data
      );


      return res.status(
        groqResponse.status
      ).json({

        error:
          data?.error?.message ||
          "Groq APIでエラーが発生しました。"

      });

    }


    const answer =
      data
        ?.choices?.[0]
        ?.message
        ?.content ||
      "うまく回答を作れませんでした。";


    /*
     * 回答ID。
     *
     * GroqのIDそのものを
     * 永続保存するわけではない。
     *
     * 今回の学習セッションで
     * 参照するためのID。
     */

    const answerId =
      data.id ||
      crypto.randomUUID();


    res.json({

      id:
        answerId,

      answer:
        answer

    });


  }catch(error){

    console.error(
      error
    );


    res.status(500).json({

      error:
        "サーバー側でエラーが発生しました。"

    });

  }

});


/* =========================================================
   HTML配信
========================================================= */

app.get("*", (req,res)=>{

  res.type("html");

  res.send(HTML);

});


/* =========================================================
   START
========================================================= */

app.listen(
  PORT,
  ()=>{

    console.log(
      "AI学習チャット running on port " +
      PORT
    );

    console.log(
      "Groq model: " +
      GROQ_MODEL
    );

  }
);
