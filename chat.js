const config = window.AI_CONFIG;

if (!config) {
  throw new Error("AI_CONFIGが設定されていません。");
}


/* =========================================================
   セッション状態
========================================================= */

let learningState = "hint";
let messages = [];
let answerIds = [];
let imageData = null;
let waiting = false;


/* =========================================================
   画面
========================================================= */

document.getElementById("app").innerHTML = `

<style>

*{
  box-sizing:border-box;
  -webkit-tap-highlight-color:transparent;
}

html,
body{
  margin:0;
  padding:0;
  width:100%;
  height:100%;
  overflow:hidden;

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


/* =========================================================
   CHAT
========================================================= */

.chat{
  width:100%;
  height:100dvh;

  display:flex;
  flex-direction:column;

  background:#f7f7f8;
}


/* =========================================================
   HEADER
========================================================= */

.header{
  height:64px;
  min-height:64px;

  flex:none;

  display:flex;
  align-items:center;

  padding:8px 12px;

  background:#fff;

  border-bottom:1px solid #e5e5e5;

  z-index:10;
}

.back{
  width:42px;
  height:42px;

  flex:none;

  border:0;

  background:transparent;

  font-size:24px;
}

.header-info{
  min-width:0;
  margin-left:5px;
}

.title{
  font-size:16px;
  font-weight:700;
}

.subtitle{
  margin-top:2px;

  font-size:12px;

  color:#777;

  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}


/* =========================================================
   PHOTO
========================================================= */

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

.attach-button:active{
  background:#f1f1f1;
}

.preview{
  display:none;

  margin-bottom:9px;
}

.preview.show{
  display:block;
}

.preview img{
  display:block;

  max-width:100%;
  max-height:180px;

  border-radius:12px;

  border:1px solid #ddd;
}

.remove{
  margin-top:6px;

  border:0;

  border-radius:8px;

  padding:7px 10px;

  background:#eee;

  font-size:12px;
}


/* =========================================================
   SCROLL AREA
========================================================= */

.body{
  flex:1;

  min-height:0;

  height:0;

  overflow-y:scroll;

  overflow-x:hidden;

  padding:
    16px
    10px
    170px;

  -webkit-overflow-scrolling:touch;

  overscroll-behavior-y:contain;

  scroll-behavior:smooth;
}

.messages{
  width:min(760px,100%);

  margin:0 auto;

  display:flex;

  flex-direction:column;
}


/* =========================================================
   MESSAGE
========================================================= */

.message{
  display:flex;

  flex:none;

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

  color:#222;

  border:1px solid #e4e4e4;

  border-bottom-left-radius:5px;
}


/* =========================================================
   THINKING
========================================================= */

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

  0%,
  70%,
  100%{
    transform:scale(.6);
    opacity:.35;
  }

  35%{
    transform:scale(1.5);
    opacity:1;
  }

}


/* =========================================================
   INPUT
========================================================= */

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

  color:#222;

  line-height:1.5;
}

#input:focus{
  border-color:#999;
}

#send{
  width:64px;

  height:47px;

  flex:none;

  border:0;

  border-radius:14px;

  background:#222;

  color:#fff;

  font-weight:600;
}

#send:disabled{
  opacity:.45;
}


/* =========================================================
   CROP
========================================================= */

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
  margin:0 0 12px;

  font-size:18px;
}

.crop-stage{
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


/* =========================================================
   MOBILE
========================================================= */

@media(max-width:600px){

  .bubble{
    max-width:92%;
  }

  .body{
    padding-left:8px;
    padding-right:8px;
  }

}

</style>


<section class="chat">


<header class="header">

  <button
    class="back"
    id="back"
    type="button"
  >
    ←
  </button>


  <div class="header-info">

    <div class="title">
      AI学習チャット
    </div>

    <div class="subtitle">
      ${
        config.mode === "question"
          ? "質問"
          : "添削"
      }
      ・
      ${config.subjectName}
    </div>

  </div>

</header>


<!-- =====================================================
     PHOTO
===================================================== -->

<div class="attach-area">

  <div class="attach-inner">

    <div
      class="preview"
      id="preview"
    >

      <img
        id="previewImage"
        alt="添付画像"
      >

      <button
        class="remove"
        id="remove"
        type="button"
      >
        写真を外す
      </button>

    </div>


    <div class="attach-buttons">

      <button
        class="attach-button"
        id="camera"
        type="button"
      >
        写真を撮る
      </button>

      <button
        class="attach-button"
        id="select"
        type="button"
      >
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


<!-- =====================================================
     CHAT
===================================================== -->

<div
  class="body"
  id="body"
>

  <div
    class="messages"
    id="messages"
  >

    <div class="message ai">

      <div class="bubble">
        問題や質問を送ってね。
      </div>

    </div>

  </div>

</div>


<!-- =====================================================
     INPUT
===================================================== -->

<div class="composer">

  <div class="composer-inner">

    <textarea
      id="input"
      rows="2"
      placeholder="質問を入力…"
    ></textarea>

    <button
      id="send"
      type="button"
    >
      送信
    </button>

  </div>

</div>


</section>


<!-- =====================================================
     CROP
===================================================== -->

<div
  id="cropModal"
>

  <div class="crop-box">

    <h2 class="crop-title">
      写真を切り取る
    </h2>

    <div class="crop-stage">

      <canvas
        id="cropCanvas"
      ></canvas>

    </div>

    <div class="crop-buttons">

      <button
        class="crop-cancel"
        id="cropCancel"
        type="button"
      >
        キャンセル
      </button>

      <button
        class="crop-use"
        id="cropUse"
        type="button"
      >
        この範囲を使う
      </button>

    </div>

  </div>

</div>
`;


/* =========================================================
   ELEMENTS
========================================================= */

const input =
  document.getElementById(
    "input"
  );

const send =
  document.getElementById(
    "send"
  );

const body =
  document.getElementById(
    "body"
  );

const messagesElement =
  document.getElementById(
    "messages"
  );

const preview =
  document.getElementById(
    "preview"
  );

const previewImage =
  document.getElementById(
    "previewImage"
  );

const cameraInput =
  document.getElementById(
    "cameraInput"
  );

const fileInput =
  document.getElementById(
    "fileInput"
  );

const cropModal =
  document.getElementById(
    "cropModal"
  );

const cropCanvas =
  document.getElementById(
    "cropCanvas"
  );


/* =========================================================
   強制スクロール
========================================================= */

function forceScrollBottom(){

  /*
   * まず即時に一番下へ。
   */

  body.scrollTop =
    body.scrollHeight;


  /*
   * scrollToでも指定。
   */

  body.scrollTo({
    top:body.scrollHeight,
    behavior:"smooth"
  });


  /*
   * ブラウザのレイアウト更新後。
   */

  requestAnimationFrame(() => {

    body.scrollTop =
      body.scrollHeight;

  });


  /*
   * 長い回答などで高さが変わった場合。
   */

  setTimeout(() => {

    body.scrollTop =
      body.scrollHeight;

  },50);


  setTimeout(() => {

    body.scrollTop =
      body.scrollHeight;

  },150);


  setTimeout(() => {

    body.scrollTop =
      body.scrollHeight;

  },350);


  setTimeout(() => {

    body.scrollTop =
      body.scrollHeight;

  },700);

}


/* =========================================================
   MESSAGE
========================================================= */

function addMessage(
  text,
  type
){

  const row =
    document.createElement(
      "div"
    );

  row.className =
    "message " +
    type;


  const bubble =
    document.createElement(
      "div"
    );

  bubble.className =
    "bubble";


  bubble.textContent =
    text;


  row.appendChild(
    bubble
  );


  messagesElement.appendChild(
    row
  );


  /*
   * メッセージ追加直後に
   * 強制的に下へ。
   */

  forceScrollBottom();


  return row;

}


function addAI(
  text
){

  return addMessage(
    text,
    "ai"
  );

}


function addUser(
  text
){

  return addMessage(
    text,
    "user"
  );

}


/* =========================================================
   THINKING
========================================================= */

function showThinking(){

  const row =
    document.createElement(
      "div"
    );

  row.className =
    "message ai";


  const bubble =
    document.createElement(
      "div"
    );

  bubble.className =
    "bubble typing";


  for(
    let i = 0;
    i < 3;
    i++
  ){

    const dot =
      document.createElement(
        "span"
      );


    dot.className =
      "dot";


    bubble.appendChild(
      dot
    );

  }


  row.appendChild(
    bubble
  );


  messagesElement.appendChild(
    row
  );


  /*
   * ぽわぽわを表示した瞬間に下へ。
   */

  forceScrollBottom();


  return row;

}


/* =========================================================
   BACK
========================================================= */

document
  .getElementById(
    "back"
  )
  .onclick = () => {

    location.href =
      config.mode === "question"
        ? "/question.html"
        : "/correction.html";

  };


/* =========================================================
   PHOTO
========================================================= */

document
  .getElementById(
    "camera"
  )
  .onclick = () => {

    cameraInput.click();

  };


document
  .getElementById(
    "select"
  )
  .onclick = () => {

    fileInput.click();

  };


cameraInput.onchange =
  event => {

    handleFile(
      event.target.files[0]
    );

  };


fileInput.onchange =
  event => {

    handleFile(
      event.target.files[0]
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
   FILE
========================================================= */

function handleFile(
  file
){

  if(!file){
    return;
  }


  if(
    !file.type.startsWith(
      "image/"
    )
  ){

    alert(
      "画像を選択してください。"
    );

    return;

  }


  const reader =
    new FileReader();


  reader.onload =
    () => {

      cropSource =
        reader.result;


      cropImage =
        new Image();


      cropImage.onload =
        () => {

          openCrop();

        };


      cropImage.src =
        cropSource;

    };


  reader.readAsDataURL(
    file
  );

}


/* =========================================================
   CROP
========================================================= */

function openCrop(){

  cropModal.classList.add(
    "show"
  );

  setupCrop();

}


function setupCrop(){

  const maxWidth =
    Math.min(
      window.innerWidth - 40,
      680
    );


  const maxHeight =
    Math.min(
      window.innerHeight * 0.62,
      520
    );


  const ratio =
    cropImage.naturalWidth /
    cropImage.naturalHeight;


  let width =
    maxWidth;


  let height =
    width / ratio;


  if(
    height > maxHeight
  ){

    height =
      maxHeight;


    width =
      height * ratio;

  }


  cropCanvas.width =
    Math.round(
      width
    );


  cropCanvas.height =
    Math.round(
      height
    );


  cropRect = {

    x:
      width * 0.08,

    y:
      height * 0.08,

    width:
      width * 0.84,

    height:
      height * 0.84

  };


  drawCrop();

}


/* =========================================================
   DRAW
========================================================= */

function drawCrop(){

  const ctx =
    cropCanvas.getContext(
      "2d"
    );


  const width =
    cropCanvas.width;


  const height =
    cropCanvas.height;


  ctx.clearRect(
    0,
    0,
    width,
    height
  );


  ctx.drawImage(
    cropImage,
    0,
    0,
    width,
    height
  );


  ctx.fillStyle =
    "rgba(0,0,0,.48)";


  ctx.beginPath();


  ctx.rect(
    0,
    0,
    width,
    height
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
   POINTER
========================================================= */

function pointerPosition(
  event
){

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
      (
        event.clientX -
        rect.left
      ) *
      scaleX,

    y:
      (
        event.clientY -
        rect.top
      ) *
      scaleY

  };

}


cropCanvas.addEventListener(
  "pointerdown",
  event => {

    const point =
      pointerPosition(
        event
      );


    if(
      point.x >= cropRect.x &&
      point.x <=
        cropRect.x +
        cropRect.width &&
      point.y >= cropRect.y &&
      point.y <=
        cropRect.y +
        cropRect.height
    ){

      dragging =
        true;


      dragStart = {

        x:
          point.x -
          cropRect.x,

        y:
          point.y -
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
  event => {

    if(!dragging){
      return;
    }


    const point =
      pointerPosition(
        event
      );


    let x =
      point.x -
      dragStart.x;


    let y =
      point.y -
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
  () => {

    dragging =
      false;

  }
);


/* =========================================================
   CROP USE
========================================================= */

document
  .getElementById(
    "cropUse"
  )
  .onclick = () => {

    const output =
      document.createElement(
        "canvas"
      );


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
      output.getContext(
        "2d"
      );


    ctx.drawImage(

      cropImage,

      cropRect.x *
        scaleX,

      cropRect.y *
        scaleY,

      cropRect.width *
        scaleX,

      cropRect.height *
        scaleY,

      0,
      0,

      output.width,
      output.height

    );


    imageData =
      output.toDataURL(
        "image/jpeg",
        0.82
      );


    previewImage.src =
      imageData;


    preview.classList.add(
      "show"
    );


    cropModal.classList.remove(
      "show"
    );


    cropSource =
      null;


    /*
     * 入力中の文章はそのまま。
     */

    input.focus();

  };


/* =========================================================
   CROP CANCEL
========================================================= */

document
  .getElementById(
    "cropCancel"
  )
  .onclick = () => {

    cropModal.classList.remove(
      "show"
    );


    cropSource =
      null;

  };


/* =========================================================
   REMOVE PHOTO
========================================================= */

document
  .getElementById(
    "remove"
  )
  .onclick = () => {

    clearPhoto();

  };


function clearPhoto(){

  imageData =
    null;


  previewImage
    .removeAttribute(
      "src"
    );


  preview
    .classList
    .remove(
      "show"
    );


  cameraInput.value =
    "";


  fileInput.value =
    "";

}


/* =========================================================
   SEND
========================================================= */

send.onclick =
  sendMessage;


input.addEventListener(
  "keydown",
  event => {

    if(
      event.key === "Enter" &&
      !event.shiftKey
    ){

      event.preventDefault();

      sendMessage();

    }

  }
);


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage(){

  if(waiting){
    return;
  }


  const text =
    input.value.trim();


  if(
    !text &&
    !imageData
  ){

    return;
  }


  /*
   * 生徒メッセージを追加。
   */

  let displayText =
    text;


  if(imageData){

    displayText =
      displayText
        ? displayText +
          "\n\n[写真を添付]"
        : "[写真を添付]";

  }


  const userRow =
    addUser(
      displayText
    );


  /*
   * AIへ渡す履歴。
   */

  messages.push({

    role:
      "user",

    content:
      text ||
      "添付した写真を確認してください。"

  });


  /*
   * 送信後は入力欄を空にする。
   */

  input.value =
    "";


  waiting =
    true;


  send.disabled =
    true;


  /*
   * 生徒メッセージを強制的に下へ。
   */

  forceScrollBottom();


  /*
   * 待機表示。
   */

  const thinking =
    showThinking();


  try{

    const response =
      await fetch(
        "/api/chat",
        {

          method:
            "POST",

          headers:{

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify({

              mode:
                config.mode,

              subject:
                config.subject,

              learningState,

              messages,

              imageData

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


    /*
     * ぽわぽわ削除。
     */

    thinking.remove();


    /*
     * AI回答。
     */

    const aiRow =
      addAI(
        data.answer
      );


    /*
     * 会話履歴。
     */

    messages.push({

      role:
        "assistant",

      content:
        data.answer

    });


    /*
     * 回答ID。
     */

    if(data.id){

      answerIds.push(
        data.id
      );

    }


    /*
     * AIが判断した状態。
     */

    if(
      data.nextState
    ){

      learningState =
        data.nextState;

    }


    /*
     * AI回答追加後も強制スクロール。
     */

    forceScrollBottom();


    /*
     * レイアウト確定後にも再度。
     */

    setTimeout(
      () => {

        forceScrollBottom();

      },
      100
    );


    setTimeout(
      () => {

        forceScrollBottom();

      },
      350
    );


    setTimeout(
      () => {

        forceScrollBottom();

      },
      700
    );


    /*
     * 送信済み画像を解除。
     */

    clearPhoto();

  }
  catch(error){

    /*
     * ぽわぽわ削除。
     */

    thinking.remove();


    /*
     * エラー。
     */

    addAI(
      "AIとの接続でエラーが発生しました。"
    );


    addAI(
      "エラー詳細：\n" +
      (
        error.message ||
        "不明なエラー"
      )
    );


    forceScrollBottom();

  }
  finally{

    waiting =
      false;


    send.disabled =
      false;


    input.focus();

  }

}


/* =========================================================
   ページを離れたらセッション破棄
========================================================= */

window.addEventListener(
  "pagehide",
  () => {

    messages =
      [];

    answerIds =
      [];

    imageData =
      null;

  }
);
