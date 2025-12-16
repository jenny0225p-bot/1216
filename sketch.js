let stopSheet;
let walkSheet;
let attackSheet;
let questionBank; // 儲存從 CSV 載入的題庫
let questionBank2; // 新增：儲存給小露的第二個題庫
let askSheet;
let runSheet2;
let fallDownSheet2;
let stopSheet3; // 角色3的圖片精靈
let bgImage; // 新增：背景圖片
let imagesLoaded = false;

let leaves = []; // 新增：用來儲存所有葉子物件的陣列
const numLeaves = 100; // 新增：葉子的數量

let charX, charY; // 用來儲存角色的位置
let char2X, char2Y; // 新增角色的位置
let char3X, char3Y; // 角色3的位置
let facingDirection = 1; // 角色面向的方向：1 是右邊, -1 是左邊 
let char2FacingDirection = 1; // 角色2的面向：1 是右邊, -1 是左邊
let bgX = 0; // 新增：背景的 X 座標
let char3FacingDirection = 1; // 角色3的面向，設為圖片原始方向 (朝右)
let charState = 'idle'; // 角色狀態: 'idle', 'walking', 'attacking'
let attackFrameCounter = 0; // 攻擊動畫的計數器
let char2State = 'idle'; // 角色2的狀態: 'idle', 'running'
let hit2FrameCounter = 0; // 角色2受擊動畫的計數器

let nameInput; // 用來儲存 p5.dom 的輸入框元素
let retryButton; // 答錯時顯示的「再作答一次」按鈕
let acceptChallengeButton; // 接受小露考驗的按鈕
let declineChallengeButton; // 拒絕小露考驗的按鈕
let dialogueState = 'none'; // 對話狀態: 'none', 'asking', 'answered', 'battle', 'victory_question', 'quiz_wait', 'quiz_question', 'quiz_feedback', 'quiz_retry', 'challenge_小露', 'quiz_success_final'
let challengeMessageFrame = 0; // 用來計時挑戰失敗訊息的顯示
let playerName = ''; // 用來儲存玩家輸入的名字
let char2MaxHealth = 5; // 角色二的最大血量
let char2CurrentHealth = 5; // 角色二的當前血量
let hasHitThisAttack = false; // 用來防止單次攻擊重複計分
let answeredFrame = 0; // 用來計時對話框的顯示
let victoryFrame = 0; // 用來計時勝利訊息的顯示，以觸發問答
let feedbackFrame = 0; // 用來計時問答回饋的顯示
let textBoxText = ''; // 將 textBoxText 提升為全域變數
let currentQuestion; // 儲存當前抽到的題目物件
let currentQuestion2; // 新增：儲存從小露題庫抽到的題目

const moveSpeed = 4; // 角色移動速度


// 站立動畫的設定
const stopSpriteWidth = 880; // 站立圖片精靈的總寬度
const stopTotalFrames = 10;
const stopFrameH = 160; // 單一影格的高度

// 走路動畫的設定 (517px / 3 frames = 172.33px)
const walkTotalFrames = 3;
const walkSpriteWidth = 517; // 走路圖片精靈的總寬度
const walkFrameH = 156; // 走路動畫單一影格的高度

// 攻擊動畫的設定 (5275px / 12 frames)
const attackTotalFrames =15;
const attackSpriteWidth = 5275;
const attackFrameH = 198;

// 新增角色(ask)動畫的設定
const askTotalFrames = 12;
const askSpriteWidth = 2260;
const askFrameH = 175;

// 角色2(run)動畫的設定 - 請根據您的 run.png 檔案修改這些值
const run2TotalFrames = 4;
const run2SpriteWidth = 737;
const run2FrameH = 142;

// 角色2(fall-down)動畫的設定
const fallDown2TotalFrames = 5;
const fallDown2SpriteWidth = 1005;
const fallDown2FrameH = 223;

// 角色3(stop)動畫的設定
const stop3TotalFrames = 5;
const stop3SpriteWidth = 235;
const stop3FrameH = 61;

const scaleFactor = 2; // 放大倍率，可依喜好調整
const animSpeed = 4; // 動畫速度，數字越小動畫越快 (每 4 個 draw() 迴圈換一幀)
const animSpeed3 = 10; // 角色3的動畫速度，數字越大越慢

// --- 新增：葉子粒子類別 ---
class Leaf {
  constructor() {
    // 初始化葉子的隨機位置和屬性
    this.x = random(width);
    this.y = random(-height, 0); // 從畫面上方開始
    this.size = random(5, 15);
    this.speedY = random(1, 3); // 垂直速度
    this.speedX = random(-0.5, 0.5); // 水平飄移速度
    this.rotation = random(TWO_PI); // 初始旋轉角度
    this.rotationSpeed = random(-0.02, 0.02); // 旋轉速度
    // 葉子的顏色 (棕色、橘色、黃色系)
    this.color = color(random(150, 220), random(50, 120), 20, 200); 
  }

  // 更新葉子位置和旋轉
  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.rotation += this.rotationSpeed;

    // 如果葉子飄出畫面底部，則重置到頂部
    if (this.y > height + this.size) {
      this.reset();
    }
  }

  // 繪製葉子
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    noStroke();
    fill(this.color);
    ellipse(0, 0, this.size, this.size / 2); // 用橢圓形模擬葉片
    pop();
  }

  // 重置葉子到畫面上方
  reset() {
    this.y = random(-100, 0);
    this.x = random(width);
  }
}

function preload() {
  // 載入題庫 CSV，並指定有 header
  questionBank = loadTable(
    'questions.csv', 'csv', 'header',
    () => { checkAllImagesLoaded(); },
    (err) => { console.error('載入 questions.csv 失敗，請確認路徑與檔案是否存在：', err); }
  );
  // 新增：載入小露的題庫
  questionBank2 = loadTable(
    'questions2.csv', 'csv', 'header',
    () => { checkAllImagesLoaded(); },
    (err) => { console.error('載入 questions2.csv 失敗，請確認路徑與檔案是否存在：', err); }
  );
  // 使用載入成功/失敗回呼並把回傳的 img 指定回全域變數，確保取得正確的寬度/高度
  stopSheet = loadImage(
    '1/stop/stop.png',
    (img) => { stopSheet = img; checkAllImagesLoaded(); },
    (err) => { console.error('載入 stop.png 失敗，請確認路徑：', '1/stop/stop.png', err); }
  );
  walkSheet = loadImage(
    '1/walk/walk.png',
    (img) => { walkSheet = img; checkAllImagesLoaded(); },
    (err) => { console.error('載入 walk.png 失敗，請確認路徑：', '1/walk/walk.png', err); }
  );
  attackSheet = loadImage(
    '1/attrack/attrack.png',
    (img) => { attackSheet = img; checkAllImagesLoaded(); },
    (err) => { console.error('載入 attrack.png 失敗，請確認路徑：', '1/attrack/attrack.png', err); }
  );
  askSheet = loadImage(
    '2/ask/ask.png',
    (img) => { askSheet = img; checkAllImagesLoaded(); },
    (err) => { console.error('載入 ask.png 失敗，請確認路徑：', '2/ask/ask.png', err); }
  );
  runSheet2 = loadImage(
    '2/run/run.png',
    (img) => { runSheet2 = img; checkAllImagesLoaded(); },
    (err) => { console.error('載入 run.png 失敗，請確認路徑：', '2/run/run.png', err); }
  );
  fallDownSheet2 = loadImage(
    '2/fall-down/fall-down.png',
    (img) => { fallDownSheet2 = img; checkAllImagesLoaded(); },
    (err) => { console.error('載入 fall-down.png 失敗，請確認路徑：', '2/fall-down/fall-down.png', err); }
  );
  stopSheet3 = loadImage(
    '3/stop/stop.png',
    (img) => { stopSheet3 = img; checkAllImagesLoaded(); },
    (err) => { console.error('載入 stop.png (角色3) 失敗，請確認路徑：', '3/stop/stop.png', err); }
  );
  // 新增：載入背景圖片
  bgImage = loadImage(
    'background_1.png',
    (img) => { bgImage = img; checkAllImagesLoaded(); },
    (err) => { console.error('載入 background_1.png 失敗，請確認路徑：', 'background_1.png', err); }
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);  
  imageMode(CENTER);
  noSmooth(); // 讓像素風格的圖片放大後保持清晰，不會模糊
  charX = width / 2; // 角色初始 X 位置 (固定在畫面中央)
  charY = height / 2; // 角色初始 Y 位置
  char2X = width * 0.33; // 新角色初始 X 位置
  char2Y = height / 2; // 新角色初始 Y 位置
  char3X = width * 0.85; // 角色3初始 X 位置 (畫布右方)
  char3Y = height / 2; // 角色3初始 Y 位置

  // 創建輸入框並在初始時隱藏
  nameInput = createInput();
  nameInput.position(-width, -height); // 先移出畫面避免閃爍
  nameInput.size(150);
  nameInput.hide();

  // 創建「再作答一次」按鈕並在初始時隱藏
  retryButton = createButton('再作答一次');
  retryButton.position(-width, -height);
  retryButton.mousePressed(retryQuestion); // 綁定點擊事件
  retryButton.hide();

  // 創建小露的考驗按鈕
  acceptChallengeButton = createButton('沒問題');
  acceptChallengeButton.position(-width, -height);
  acceptChallengeButton.mousePressed(acceptChallenge);
  acceptChallengeButton.hide();

  declineChallengeButton = createButton('嗯...我再想想');
  declineChallengeButton.position(-width, -height);
  declineChallengeButton.mousePressed(declineChallenge);
  declineChallengeButton.hide();

  // --- 新增：初始化葉子 ---
  for (let i = 0; i < numLeaves; i++) {
    leaves.push(new Leaf());
  }
}

function checkAllImagesLoaded() {
  if (stopSheet?.width && walkSheet?.width && attackSheet?.width && askSheet?.width && runSheet2?.width && fallDownSheet2?.width && stopSheet3?.width && questionBank?.columns && questionBank2?.columns && bgImage?.width) imagesLoaded = true;
}

function draw() {
  // --- 繪製連續捲動背景 ---
  // 計算縮放後的背景寬高，使其填滿畫布高度
  const bgScaledHeight = height;
  const bgScale = bgScaledHeight / bgImage.height;
  const bgScaledWidth = floor(bgImage.width * bgScale); // 使用 floor() 將寬度取為整數，避免浮點數誤差

  // 使用取餘數 (%) 的方式來實現無限循環捲動，效果更平滑
  // offsetX 會在 0 到 bgScaledWidth 之間循環
  // 修正負數取餘數的問題，確保 offsetX 永遠是正數，避免捲動時產生 1px 的縫隙
  let offsetX = bgX % bgScaledWidth;
  if (offsetX < 0) { offsetX += bgScaledWidth; }

  // 繪製三張圖片：中間、左邊、右邊
  image(bgImage, offsetX, height / 2, bgScaledWidth, bgScaledHeight);
  image(bgImage, offsetX - bgScaledWidth, height / 2, bgScaledWidth, bgScaledHeight);
  image(bgImage, offsetX + bgScaledWidth, height / 2, bgScaledWidth, bgScaledHeight);
  // --- 背景繪製結束 ---

  // --- 新增：繪製並更新落葉 ---
  for (let leaf of leaves) {
    leaf.update();
    leaf.display();
  }
  // --- 落葉繪製結束 ---

  if (!imagesLoaded) {
    push();
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(18);
    text('圖片尚未載入或路徑錯誤。請檢查 Console 的 404/Network。', width/2, height/2);
    pop();
    return;
  }

  // --- 角色1狀態管理 ---
  let currentSheet, frameW, frameH, totalFrames;

  // 如果正在攻擊，就不能被走路中斷
  if (charState !== 'attacking') {
    if (keyIsDown(RIGHT_ARROW) && !keyIsDown(LEFT_ARROW)) {
      charState = 'walking';
    } else if (keyIsDown(LEFT_ARROW) && !keyIsDown(RIGHT_ARROW)) {
      charState = 'walking';
    } else {
      charState = 'idle';
    }
  }

  // 根據狀態設定動畫和行為
  if (charState === 'attacking') {
    currentSheet = attackSheet;
    frameW = Math.floor(attackSpriteWidth / attackTotalFrames);
    frameH = attackFrameH;
    totalFrames = attackTotalFrames;

    // 當動畫播放完畢
    if (attackFrameCounter >= totalFrames * animSpeed) {
      attackFrameCounter = 0; // 重置計數器給下一個動畫
      charState = 'idle'; // ***攻擊結束後，回到站立狀態***
    } else {
      attackFrameCounter++;
    }
  } else if (charState === 'walking') {
    if (keyIsDown(RIGHT_ARROW)) {
      currentSheet = walkSheet;
      frameW = Math.floor(walkSpriteWidth / walkTotalFrames);
      frameH = walkFrameH;
      totalFrames = walkTotalFrames;
      bgX -= moveSpeed; // 背景向左移動
      facingDirection = 1;
    } else if (keyIsDown(LEFT_ARROW)) {
      currentSheet = walkSheet;
      frameW = Math.floor(walkSpriteWidth / walkTotalFrames);
      frameH = walkFrameH;
      totalFrames = walkTotalFrames;
      bgX += moveSpeed; // 背景向右移動
      facingDirection = -1;
    }
  } else { // idle
    currentSheet = stopSheet;
    frameW = Math.floor(stopSpriteWidth / stopTotalFrames);
    frameH = stopFrameH;
    totalFrames = stopTotalFrames;
  }

  // --- 角色2狀態管理 (位置會受背景移動影響) ---
  // 'hit' 狀態有最高優先級，動畫播放完前不能被打斷
  if (char2State === 'hit') {
    if (hit2FrameCounter >= fallDown2TotalFrames * animSpeed) {
      hit2FrameCounter = 0;
      char2State = 'idle'; // 受擊動畫結束後，回到待機狀態
    } else {
      hit2FrameCounter++;
    }
  } else { // 只有在非受擊狀態下，才能移動或待機
    if (keyIsDown(68) && !keyIsDown(65)) { // 'D' key
      char2State = 'running';
      char2FacingDirection = 1; // 角色2的移動不受背景影響，保持獨立
      char2X += moveSpeed;
    } else if (keyIsDown(65) && !keyIsDown(68)) { // 'A' key
      char2State = 'running';
      char2FacingDirection = -1; // 角色2的移動不受背景影響，保持獨立
      char2X -= moveSpeed;
    } else {
      char2State = 'idle';
    }
  }

  // --- 繪製左邊的新角色 ---
  let char2Sheet, char2FrameW, char2TotalFrames, char2FrameH;
  let char2CurrentFrame;

  if (char2State === 'hit') {
    char2Sheet = fallDownSheet2;
    char2FrameW = Math.floor(fallDown2SpriteWidth / fallDown2TotalFrames);
    char2TotalFrames = fallDown2TotalFrames;
    char2FrameH = fallDown2FrameH;
    char2CurrentFrame = floor(hit2FrameCounter / animSpeed);
  } else if (char2State === 'running') {
    char2Sheet = runSheet2;
    char2FrameW = Math.floor(run2SpriteWidth / run2TotalFrames);
    char2TotalFrames = run2TotalFrames;
    char2FrameH = run2FrameH;
  } else {
    char2Sheet = askSheet;
    char2FrameW = Math.floor(askSpriteWidth / askTotalFrames);
    char2TotalFrames = askTotalFrames;
    char2FrameH = askFrameH;

    // 只有在待機時，才根據角色1的位置自動轉向
    if (charX < char2X) {
      char2FacingDirection = -1; // 角色1在左邊，角色2朝左
    } else {
      char2FacingDirection = 1; // 角色1在右邊，角色2朝右 (恢復原狀)
    }
  }

  // 如果不是受擊狀態，則使用通用的循環動畫計算方式
  if (char2State !== 'hit') {
    char2CurrentFrame = floor(frameCount / animSpeed) % char2TotalFrames;
  }
  const char2Sx = char2CurrentFrame * char2FrameW;
  const char2Sy = 0;

  push();
  translate(char2X + bgX, char2Y); // 角色2的位置需要加上背景的偏移量
  scale(char2FacingDirection, 1); // 根據面向翻轉角色2
  image(
    char2Sheet,
    0, 0, // 因為已經 translate，所以在新原點 (0,0) 繪製
    char2FrameW * scaleFactor,
    char2FrameH * scaleFactor,
    char2Sx, char2Sy,
    char2FrameW, char2FrameH
  );
  pop();
  // --- 新角色繪製結束 ---

  // --- 繪製角色3 (位置會受背景移動影響) ---
  const char3Sheet = stopSheet3;
  const char3FrameW = Math.floor(stop3SpriteWidth / stop3TotalFrames);
  const char3FrameH = stop3FrameH;
  const char3CurrentFrame = floor(frameCount / animSpeed3) % stop3TotalFrames;
  const char3Sx = char3CurrentFrame * char3FrameW;
  const char3Sy = 0;

  push();
  translate(char3X + bgX, char3Y); // 角色3的位置需要加上背景的偏移量
  scale(char3FacingDirection, 1); // 直接使用 scale 翻轉
  image(
    char3Sheet,
    0, 0, // 因為是 CENTER 模式，在原點繪製即可
    char3FrameW * scaleFactor,
    char3FrameH * scaleFactor,
    char3Sx, char3Sy,
    char3FrameW, char3FrameH
  );
  pop();
  // --- 角色3繪製結束 ---

  // --- 繪製角色3的名稱 (位置會受背景移動影響) ---
  push();
  // 計算文字應該在的位置 (角色3頭頂上方)
  const nameYOffset = - (char3FrameH * scaleFactor) / 2 - 20;

  // 設定文字樣式
  textSize(22);
  textAlign(CENTER, CENTER);
  stroke(0);       // 黑色外框
  strokeWeight(4); // 外框粗細

  // 使用 HSB 色彩模式來產生彩虹效果
  colorMode(HSB, 360, 100, 100);
  const hue = frameCount % 360; // 色相隨時間變化 (0-360)
  fill(hue, 90, 100); // 設定飽和度和亮度都較高的顏色

  // 在角色3頭上繪製文字
  text('小露', char3X + bgX, char3Y + nameYOffset);
  pop(); // 恢復原本的繪圖設定 (包含色彩模式會變回 RGB)
  // --- 角色3名稱繪製結束 ---


  // --- 檢查距離並顯示對話框 ---
  const proximityThreshold2 = 200; // 觸發與角色2對話框的距離
  const distance2 = abs(charX - (char2X + bgX)); // 計算距離時要考慮背景位移

  // 勝利條件檢查
  if (dialogueState === 'battle' && char2CurrentHealth <= 0) { 
    dialogueState = 'victory_question';
  }
  // --- 與角色2的互動邏輯 ---
  if (distance2 < proximityThreshold2) {
    // 如果當前對話狀態是屬於角色3(小露)的，但玩家靠近了角色2，則重置狀態
    if (dialogueState.startsWith('challenge_') || dialogueState.startsWith('quiz2_')) {
      dialogueState = 'none';
      textBoxText = '';
    }

    if (dialogueState === 'none') {
      dialogueState = 'asking';
    }

    if (dialogueState === 'asking') {
      textBoxText = '你叫什麼名字';
      // 顯示並定位輸入框在角色1頭上
      nameInput.position(charX - nameInput.width / 2, charY - (frameH * scaleFactor) / 2 - 40);
      nameInput.show();
    } else if (dialogueState === 'answered') {
      textBoxText = `${playerName}，久仰大名，來戰鬥吧!`;
      nameInput.hide(); // 確保輸入框被隱藏

      // 在顯示完回答後，等待約3秒 (180幀) 後進入戰鬥狀態
      if (frameCount > answeredFrame + 180) {
        dialogueState = 'battle';
        char2CurrentHealth = char2MaxHealth; // 進入戰鬥時，重置血量
        textBoxText = ''; // 切換到戰鬥時，清空文字框內容
      }
    } else if (dialogueState === 'victory_question') {
      // 血量歸零後，顯示訊息，等待幾秒後再提問
      textBoxText = '接下來考考你頭腦如何';
      nameInput.hide(); // 確保此階段輸入框是隱藏的

      // 如果這是第一次進入此狀態，記錄當前幀數
      if (victoryFrame === 0) {
        victoryFrame = frameCount;
      }

      // 等待 4 秒 (240 幀) 後，再切換到提問狀態
      if (frameCount > victoryFrame + 240) {
        dialogueState = 'quiz_question';
        // 從題庫隨機抽一題
        const questionIndex = floor(random(questionBank.getRowCount()));
        currentQuestion = questionBank.getRow(questionIndex);
      }
    } else if (dialogueState === 'quiz_question') {
      textBoxText = currentQuestion.getString('題目');
      nameInput.position(charX - nameInput.width / 2, charY - (frameH * scaleFactor) / 2 - 40);
      nameInput.show();
    } else if (dialogueState === 'quiz_feedback') {
      // textBoxText 已經在 keyPressed() 中被設定為回饋文字
      nameInput.hide(); // 在顯示回饋時隱藏輸入框
      // 顯示答對回饋 3 秒 (180 幀) 後，進入最終訊息狀態
      if (frameCount > feedbackFrame + 180) {
        dialogueState = 'quiz_success_final';
        textBoxText = '你就是小露要找的人，快前進吧';
        feedbackFrame = frameCount; // 重置計時器給下一個狀態使用
      }
    } else if (dialogueState === 'quiz_success_final') {
      // 顯示最終訊息 3 秒後，結束對話
      if (frameCount > feedbackFrame + 180) {
        dialogueState = 'none';
        victoryFrame = 0; // 重置勝利計時器，為下一次戰鬥做準備
        textBoxText = '';
      }
    } else if (dialogueState === 'quiz_retry') {
      // 在此狀態下，textBoxText 已被設為答錯回饋
      // 按鈕的位置和顯示將在繪製對話框後處理
      nameInput.hide();
    } else if (dialogueState === 'battle') {
      // --- 繪製血量條 ---
      const healthBarWidth = 80;
      const healthBarHeight = 10;
      const healthBarYOffset = - (char2FrameH * scaleFactor) / 2 - 20; // 在角色2頭頂上方
      const currentHealthWidth = (healthBarWidth * char2CurrentHealth) / char2MaxHealth;

      push();
      translate(char2X + bgX, char2Y); // 血量條跟隨角色2移動
      
      // 繪製血條背景 (紅色)
      fill(255, 0, 0);
      noStroke();
      rect(-healthBarWidth / 2, healthBarYOffset, healthBarWidth, healthBarHeight, 4);

      // 繪製當前血量 (綠色)
      fill(0, 255, 0);
      rect(-healthBarWidth / 2, healthBarYOffset, currentHealthWidth, healthBarHeight, 4);

      pop();
    }
    // 根據狀態繪製對話框
    if (textBoxText) {
      // 對話框Y軸偏移量，使其出現在角色2頭頂上方
      const textYOffset = - (char2FrameH * scaleFactor) / 2 - 30; 
      
      push();
      translate(char2X + bgX, char2Y); // 對話框位置也要加上背景位移
      
      textSize(18);
      textAlign(CENTER, CENTER);
      const textW = textWidth(textBoxText);
      const boxPadding = 10;
      const boxW = textW + boxPadding * 2;
      const boxH = 35;

      fill(255, 255, 255, 220);
      stroke(0);
      rect(-boxW / 2, textYOffset - boxH / 2, boxW, boxH, 8);
      fill(0);
      noStroke();
      text(textBoxText, 0, textYOffset);
      pop();

      // 如果是答錯重試狀態，在文字框上方顯示按鈕
      if (dialogueState === 'quiz_retry') {
        const buttonX = (char2X + bgX) - retryButton.width / 2;
        const buttonY = char2Y + textYOffset - boxH / 2 - 35;
        retryButton.position(buttonX, buttonY);
        retryButton.show();
      }
    }

  // --- 與角色3的互動邏輯 ---
  } else if (dialogueState.startsWith('quiz2_')) {
      // 處理小露的問答流程
      const textYOffset = - (char3FrameH * scaleFactor) / 2 - 100; // 將問答UI再往上移
      drawTextBox(textBoxText, char3X + bgX, char3Y, textYOffset); // 對話框位置也要加上背景位移

      if (dialogueState === 'quiz2_question') {
        nameInput.position((char3X + bgX) - nameInput.width / 2, char3Y + textYOffset + 40);
        nameInput.show();
      } else if (dialogueState === 'quiz2_feedback') {
        if (frameCount > feedbackFrame + 180) {
          declineChallenge(); // 結束對話
        }
      } else if (dialogueState === 'quiz2_retry') {
        const buttonX = (char3X + bgX) - retryButton.width / 2;
        const buttonY = char3Y + textYOffset - 35 - 10;
        retryButton.position(buttonX, buttonY);
        retryButton.show();
      }
  } else if (dialogueState === 'challenge_declined') {
      const textYOffset = - (char3FrameH * scaleFactor) / 2 - 100; // 將問答UI再往上移
      drawTextBox(textBoxText, char3X + bgX, char3Y, textYOffset); // 對話框位置也要加上背景位移
      // 顯示訊息 3 秒後重置
      if (frameCount > challengeMessageFrame + 180) {
        declineChallenge();
      }
  // --- 與角色3的互動邏輯 ---
  } else if (dialogueState === 'challenge_小露' || (abs(charX - (char3X + bgX)) < 150 && dialogueState === 'none')) {
    const proximityThreshold3 = 150;
    const distance3 = abs(charX - (char3X + bgX)); // 計算距離時要考慮背景位移

    if (distance3 < proximityThreshold3 && dialogueState === 'none') { // 觸發條件
      dialogueState = 'challenge_小露';
    } else if (distance3 >= proximityThreshold3 && dialogueState === 'challenge_小露') {
      // 如果玩家在選擇時離開，則重置狀態
      declineChallenge();
    }

    if (dialogueState === 'challenge_小露') {
      // 當狀態為 'challenge_小露' 時，顯示初始提問文字
      const textYOffset = - (char3FrameH * scaleFactor) / 2 - 100;
      drawTextBox('準備好接受考驗了嗎?', char3X + bgX, char3Y, textYOffset);

      // 在角色1下方顯示按鈕
      acceptChallengeButton.position(charX - acceptChallengeButton.width - 5, charY + (frameH * scaleFactor) / 2 + 10);
      declineChallengeButton.position(charX + 5, charY + (frameH * scaleFactor) / 2 + 10);
      acceptChallengeButton.show();
      declineChallengeButton.show();
    }

  } else if (dialogueState !== 'battle') { // 如果不靠近任何可互動角色，且不在戰鬥中，則重置狀態
    // 隱藏所有可能顯示的UI元素
    nameInput.hide();
    retryButton.hide();
    retryButton.mousePressed(retryQuestion); // 將按鈕事件綁定回原本的問答
    acceptChallengeButton.hide();
    declineChallengeButton.hide();
    textBoxText = ''; // 清空對話框

    // 將遊戲狀態重設為初始狀態
    dialogueState = 'none';
    char2CurrentHealth = char2MaxHealth; // 重置血量
    playerName = '';
  }

  // 將繪製文字框的邏輯抽出來變成一個函式，方便重複使用
  function drawTextBox(txt, x, y, yOffset) {
      if (!txt) return;
      push();
      translate(x, y);
      textSize(18);
      textAlign(CENTER, CENTER);
      const textW = textWidth(txt);
      const boxPadding = 10;
      const boxW = textW + boxPadding * 2;
      const boxH = 35;

      fill(255, 255, 255, 220);
      stroke(0);
      rect(-boxW / 2, yOffset - boxH / 2, boxW, boxH, 8);
      fill(0);
      noStroke();
      text(txt, 0, yOffset);
      pop();
  }
  // 計算當前影格
  let currentFrame;
  if (charState === 'attacking') {
    // 讓攻擊動畫的每一幀都按順序播放，這樣角色和技能特效會一起出現並成長
    currentFrame = floor(attackFrameCounter / animSpeed);
  } else {
    currentFrame = floor(frameCount / animSpeed) % totalFrames;
  }
  const sx = currentFrame * frameW;
  const sy = 0;

  // 計算攻擊時的 Y 軸位移
  let yOffset = 0;
  if (charState === 'attacking') {
    // 使用 sin 函式製造一個從 0 -> 峰值 -> 0 的平滑上下移動曲線
    const currentAttackFrame = floor(attackFrameCounter / animSpeed);

    // 當動畫在第 9 幀到第 15 幀時 (索引 8 到 14)，讓角色移動
    if (currentAttackFrame >= 8 && currentAttackFrame < 15) {
      const attackMoveSpeed = moveSpeed * 1.5; // 攻擊時的移動速度可以快一點
      const halfCharWidth = (frameW * scaleFactor) / 2;

      if (facingDirection === 1 && charX < width - halfCharWidth) { // 向右移動
        charX += attackMoveSpeed;
      } else if (facingDirection === -1 && charX > halfCharWidth) { // 向左移動
        charX -= attackMoveSpeed;
      }

      // 在攻擊有效幀內進行碰撞檢測
      const hitDistance = abs(charX - (char2X + bgX)); // 碰撞檢測也要考慮背景位移
      const hitThreshold = (frameW * scaleFactor) / 2 + (char2FrameW * scaleFactor) / 2; // 兩個角色寬度的一半
      
      if (hitDistance < hitThreshold && !hasHitThisAttack && dialogueState === 'battle') {
        char2CurrentHealth = max(0, char2CurrentHealth - 1); // 扣除血量，並確保不低於0
        char2State = 'hit'; // 將角色2狀態設為受擊
        hit2FrameCounter = 0; // 重置受擊動畫計數器
        hasHitThisAttack = true; // 標記本次攻擊已計分
      }
    }

    const attackProgress = (attackFrameCounter / (totalFrames * animSpeed)); // 0.0 ~ 1.0
    yOffset = -sin(attackProgress * PI) * 30; // 向上移動最多 30 像素
  }

  // --- 繪製角色1 ---
  push();
  translate(charX, charY + yOffset);
  scale(facingDirection, 1);

  image(
    currentSheet,
    0, 0,
    frameW * scaleFactor,
    frameH * scaleFactor,
    sx, sy,
    frameW, frameH
  );

  pop();
  // --- 角色1繪製結束 ---
}

function keyPressed() {
  // 當按下空白鍵且角色不在攻擊狀態時，開始攻擊
  if (key === ' ' && charState !== 'attacking') {
    charState = 'attacking';
    attackFrameCounter = 0; // 重置攻擊動畫計數器
    hasHitThisAttack = false; // 重置攻擊計分標記
  }

  // 當玩家在輸入框中按下 Enter 鍵
  if (keyCode === ENTER && dialogueState === 'asking') {
    playerName = nameInput.value();
    if (playerName.trim() !== '') { // 確保玩家有輸入內容
      dialogueState = 'answered';
      answeredFrame = frameCount; // 記錄當前幀數
      nameInput.value(''); // 清空輸入框
    }
  } else if (keyCode === ENTER && dialogueState === 'quiz_question') {
    const userAnswer = nameInput.value().trim();
    const correctAnswer = currentQuestion.getString('答案');

    if (userAnswer === correctAnswer) {
      // 答對了，進入回饋狀態
      textBoxText = currentQuestion.getString('答對回饋');
      dialogueState = 'quiz_feedback';
      feedbackFrame = frameCount;
    } else {
      // 答錯了，進入重試狀態
      textBoxText = `${currentQuestion.getString('答錯回饋')} ${currentQuestion.getString('提示')}`;
      dialogueState = 'quiz_retry';
    }

    nameInput.value(''); 
    nameInput.hide(); 
  } else if (keyCode === ENTER && dialogueState === 'quiz2_question') {
    const userAnswer = nameInput.value().trim();
    const correctAnswer = currentQuestion2.getString('答案');

    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
      textBoxText = currentQuestion2.getString('答對回饋');
      dialogueState = 'quiz2_feedback';
      feedbackFrame = frameCount;
    } else {
      textBoxText = `${currentQuestion2.getString('答錯回饋')} ${currentQuestion2.getString('提示')}`;
      dialogueState = 'quiz2_retry';
      // 將重試按鈕的事件重新綁定到小露的問答
      retryButton.mousePressed(retryChallengeQuestion);
    }

    nameInput.value('');
    nameInput.hide();
  }
}

function retryQuestion() {
  // 當「再作答一次」按鈕被點擊時觸發
  dialogueState = 'quiz_question'; // 將狀態切換回提問狀態
  retryButton.hide(); // 隱藏按鈕
  // textBoxText 會在下一個 draw() 循環中自動更新為題目
}

function retryChallengeQuestion() {
  // 小露問答的重試邏輯
  dialogueState = 'quiz2_question';
  textBoxText = currentQuestion2.getString('題目');
  retryButton.hide();
}

function acceptChallenge() {
  // 點擊「沒問題」後的行為
  dialogueState = 'quiz2_question';
  const questionIndex = floor(random(questionBank2.getRowCount()));
  currentQuestion2 = questionBank2.getRow(questionIndex);
  textBoxText = currentQuestion2.getString('題目');

  acceptChallengeButton.hide();
  declineChallengeButton.hide();
}

function declineChallenge() {
  // 點擊「嗯...我再想想」或玩家遠離時的行為
  if (dialogueState === 'challenge_小露') {
    // 這是第一次點擊按鈕，切換到顯示訊息的狀態
    dialogueState = 'challenge_declined';
    textBoxText = '機會是留給準備好的人';
    challengeMessageFrame = frameCount;
  } else {
    // 這是訊息顯示完畢後或玩家遠離時的重置行為
    dialogueState = 'none';
    textBoxText = ''; // 清空文字
  }
  acceptChallengeButton.hide();
  declineChallengeButton.hide();
}


function windowResized() {
  // 當瀏覽器視窗大小改變時，自動調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
  // 同時重置葉子的位置，避免它們集中在舊的畫布範圍內
  for (let leaf of leaves) {
    leaf.x = random(width);
    leaf.y = random(height);
  }
  // 避免角色在視窗縮放後位置跑掉，可以選擇是否要重置位置
  // charX = width / 2;
}
