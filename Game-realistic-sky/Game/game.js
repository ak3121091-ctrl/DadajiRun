const canvas = document.getElementById("game-canvas");
const loadingScreen = document.getElementById("loading-screen");
const startBtn = document.getElementById("start-btn");
const progressText = document.getElementById("loader-prog");

let scene;
let camera;
let renderer;
let dadaji;
let dadajiParts;
let teacher;
let teacherParts = {};
let started = false;
let walkTime = 0;
let lastTime = performance.now();
let sky;
let sunVector;
let mainDirLight;
let hemiLight;

const skinColor = 0xe0ac69;
const whiteColor = 0xffffff;
const stickColor = 0x8b5a2b;
const bagColor = 0xff3d00;
const lineColor = 0xffeb3b;
const riverColor = 0x00a8ff;
const mudColor = 0x795548;
const buffaloColor = 0x212121;
const hornColor = 0xfff9c4;

const DIALOGUE = {
  start: "आज तो पक्का टाइम पर पहुँचूँगा… बस रास्ते में दुनिया खत्म न हो जाए!",
  buffalo: "हमारे ज़माने में भैंस भी ट्रैफिक नियम मानती थी… शायद!",
  river: "नदी पार करनी है या स्कूल में स्विमिंग का मेडल लेना है?!",
  puddle: "बेटा, होमवर्क तो बह गया… अब टीचर को भी बहा दूँ क्या?!",
  bridge: "ये पुल है या मेरी कमर का फाइनल टेस्ट?!",
  level1: "पहला पड़ाव—जंगल! स्कूल कम, जंगल सफारी ज़्यादा लग रही है!",
  level2: "अब नदी और कीचड़! जूते गए, इज़्ज़त गई… बस स्कूल बाकी है!",
  level3: "अब पहाड़ भी चढ़ना है?! स्कूल है या एवरेस्ट का इंटरव्यू?!",
  hit1: "हे राम! ये रास्ता है या मुसीबतों की दुकान?!",
  hit2: "मेरी कमर ने इस्तीफ़ा दे दिया!",
  hit3: "स्कूल पहुँचूँगा या ओलंपिक में देश का नाम करूँगा?!",
  hit4: "अरे मेरा चश्मा! अब भैंस भी टीचर दिख रही है!",
  "Hey Ram!": "हे राम!",
  "Meri kamar!": "मेरी कमर!",
  "Yeh toh Olympics hai!": "ये तो ओलंपिक है!",
  "Mera chashma!": "मेरा चश्मा!",
  "हे राम!": "हे राम!",
  "मेरी कमर!": "मेरी कमर!",
  "ये तो ओलंपिक है!": "ये तो ओलंपिक है!",
  "मेरा चश्मा!": "मेरा चश्मा!",
  hitLines: [
    "hit1",
    "hit2",
    "hit3",
    "hit4"
  ],
  papaWin: "मैं तो साइकिल से आया था… और फिर भी घंटी से आख़िरी सेकंड पर बचा!",
  "Main toh cycle se aaya tha!": "मैं तो साइकिल से आया था!",
  "मैं तो साइकिल से आया था!": "मैं तो साइकिल से आया था!",
  papaStart: "घंटी बजने से पहले पहुँचना है—पैडल मार, दर्शन बाद में करना!",
  papaBag: "बस्ता भी बचा लिया! अब बस होमवर्क का भूत न आ जाए! +5 सिक्के!",
  papaBuffalo: "हटो भैंस जी, साइकिल की घंटी है—डीजे नहीं!",
  chai: "वाह! चाय मिली—अब जान में जान आई! ☕ +1 लाइफ़",
  "Chai pi li! ☕ +1 life": "चाय पी ली! ☕ +1 जान",
  "चाय पी ली! ☕ +1 जान": "चाय पी ली! ☕ +1 जान",
  teacherWarning: "बेटा, होमवर्क कहाँ है?! बहाना मत देना—मैं भी कभी स्टूडेंट था!",
  "बेटा, होमवर्क कहाँ है?!": "बेटा, होमवर्क कहाँ है?!"
};
const GROUND_Y = 0.45;
let RUN_SPEED = 14;
const LANE_SPEED = 10;
const GRAVITY = -30;
const JUMP_FORCE = 11;
const SWIPE_MIN = 50;
let OBSTACLE_SPEED = 14;
const SPAWN_INTERVAL = 2.2;
const SPAWN_Z_AHEAD = -110;
const RECYCLE_Z = 16;
const LANE_X = [-2.4, 0, 2.4];

const LEVEL_SECONDS = 25;
const LEVEL_COUNT = 3;
// weights are [buffalo, low_bar, mud, bus, bridge]
const LEVEL_THEMES = [
  {
    ground: 0x388e3c,
    sky: 0xffb74d,
    weights: [0.75, 0.25, 0.0, 0.0, 0.0],
    msg: "लेवल 1 पूरा! जंगल पार हो गया!",
    sunElevation: 14,
    sunAzimuth: 150,
    turbidity: 6,
    rayleigh: 2.2,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.8,
    lightColor: 0xfff8e7,
    lightIntensity: 1.25,
    hemiSky: 0x81d4fa,
    hemiGround: 0x2e7d32,
    hemiIntensity: 0.75,
    fogColor: 0xffd54f,
    fogDensity: 0.006
  },
  {
    ground: 0xf39c12,
    sky: 0x29b6f6,
    weights: [0.25, 0.15, 0.35, 0.25, 0.0],
    msg: "लेवल 2 पूरा! अब नदी और पहाड़!",
    sunElevation: 68,
    sunAzimuth: 120,
    turbidity: 2.5,
    rayleigh: 1.1,
    mieCoefficient: 0.003,
    mieDirectionalG: 0.85,
    lightColor: 0xffffff,
    lightIntensity: 1.35,
    hemiSky: 0x4fc3f7,
    hemiGround: 0xb7791f,
    hemiIntensity: 0.8,
    fogColor: 0x4fc3f7,
    fogDensity: 0.005
  },
  {
    ground: 0xe67e22,
    sky: 0xff5722,
    weights: [0.10, 0.10, 0.0, 0.50, 0.30],
    msg: "लेवल 3 पूरा! स्कूल पहुँच गए!",
    sunElevation: 6,
    sunAzimuth: 175,
    turbidity: 8,
    rayleigh: 3.5,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.75,
    lightColor: 0xff8a50,
    lightIntensity: 1.4,
    hemiSky: 0xff7043,
    hemiGround: 0xd35400,
    hemiIntensity: 0.7,
    fogColor: 0xff7043,
    fogDensity: 0.007
  }
];

const PAPA_THEME = {
  ground: 0x607d8b,
  sunElevation: 42,
  sunAzimuth: 140,
  turbidity: 4,
  rayleigh: 1.5,
  mieCoefficient: 0.004,
  mieDirectionalG: 0.8,
  lightColor: 0xfff6eb,
  lightIntensity: 1.2,
  hemiSky: 0xbfe3ff,
  hemiGround: 0x4a6572,
  hemiIntensity: 0.7,
  fogColor: 0x7fc0e9,
  fogDensity: 0.0065
};

function updateSkyAndLighting(th) {
  if (!th) return;
  const phi = THREE.MathUtils.degToRad(90 - th.sunElevation);
  const theta = THREE.MathUtils.degToRad(th.sunAzimuth);
  if (sunVector) {
    sunVector.setFromSphericalCoords(1, phi, theta);
  }
  if (sky && sky.material && sky.material.uniforms) {
    const u = sky.material.uniforms;
    if (u.turbidity) u.turbidity.value = th.turbidity;
    if (u.rayleigh) u.rayleigh.value = th.rayleigh;
    if (u.mieCoefficient) u.mieCoefficient.value = th.mieCoefficient;
    if (u.mieDirectionalG) u.mieDirectionalG.value = th.mieDirectionalG;
    if (u.sunPosition) u.sunPosition.value.copy(sunVector);
  }
  if (mainDirLight) {
    if (mainDirLight.color && mainDirLight.color.setHex) mainDirLight.color.setHex(th.lightColor);
    mainDirLight.intensity = th.lightIntensity;
  }
  if (hemiLight) {
    if (hemiLight.color && hemiLight.color.setHex) hemiLight.color.setHex(th.hemiSky);
    if (hemiLight.groundColor && hemiLight.groundColor.setHex) hemiLight.groundColor.setHex(th.hemiGround);
    hemiLight.intensity = th.hemiIntensity;
  }
  if (scene && scene.fog) {
    if (scene.fog.color && scene.fog.color.setHex) scene.fog.color.setHex(th.fogColor);
    if (th.fogDensity !== undefined) scene.fog.density = th.fogDensity;
  }
  if (!sky && scene && scene.background && scene.background.setHex) scene.background.setHex(th.fogColor);
}

function currentTheme() {
  return LEVEL_THEMES[Math.min(currentLevel - 1, LEVEL_THEMES.length - 1)];
}

let lane = 1;
let lives = 3;
let coins = 0;
let bestDistance = 0;
let bestCoins = 0;
let lastStatsSaveAt = 0;

function readSavedStat(key, fallback = 0) {
  try { const value = Number(window.localStorage.getItem(key)); return Number.isFinite(value) && value >= 0 ? value : fallback; } catch (e) { return fallback; }
}
function savePlayerStats(force = false) {
  const distance = Math.floor(score || 0);
  const totalCoins = Math.floor(coins || 0);
  const changed = distance > bestDistance || totalCoins > bestCoins;
  if (!changed && !force) return;
  bestDistance = Math.max(bestDistance, distance);
  bestCoins = Math.max(bestCoins, totalCoins);
  try {
    window.localStorage.setItem("dadaji-best-distance", String(bestDistance));
    window.localStorage.setItem("dadaji-best-coins", String(bestCoins));
  } catch (e) { /* Private browsing or storage-disabled mode: keep session stats. */ }
  const distanceEl = document.getElementById("best-distance");
  const coinsEl = document.getElementById("best-coins");
  if (distanceEl) distanceEl.textContent = bestDistance.toLocaleString() + " m";
  if (coinsEl) coinsEl.textContent = bestCoins.toLocaleString();
}

let timeLeft = LEVEL_SECONDS;
let coinMeshes = [];
let targetX = LANE_X[1];
let currentX = LANE_X[1];
let velocityY = 0;
let isJumping = false;
let isSliding = false;
let slideTimer = 0;
const SLIDE_DURATION = 0.7;
let playerCollisionHeight = 1.6;

let groundSegments = [];
let hudEl;
let barEl;
let pauseEl;
let pauseBtn;
let paused = false;
let invulnTimer = 0;
let jumpBuffer = 0;
let dustTimer = 0;
const dust = [];
let scenery = [];
let clouds = [];
let laneLines = [];
let roadDashes = [];
let buildings = [];
let obstacles = [];
let touchStartX = 0;
let touchStartY = 0;

const TOTAL_DISTANCE = 4000;
let winState = "playing";
let gateMesh = null;
let rewardEl = null;
let gameOverEl = null;
let score = 0;
let shakeTime = 0;
let shakeIntensity = 0;
let gameOver = false;
let nextSpawn = SPAWN_INTERVAL;
let audioCtx = null;
let muted = false;
let isSpeaking = false;
let hiVoice = null;
let fallbackSpeechTimer = 0;
let hitReactionTimer = 0;
let coinHopTimer = 0;
let coinSmileTimer = 0;
let fallAngle = 0;
const COIN_HOP_DURATION = 0.35;
const COIN_SMILE_DURATION = 0.6;
let currentChapter = 1;
let papaCycle = null;
let papaParts = null;
let papaTimer = 30;
const PAPA_LEVEL_SECONDS = 30;

let currentLevel = 1;
let levelTimeLeft = LEVEL_SECONDS;
let levelTransitioning = false;
let levelTransitionTimer = 0;
let levelDialogueShown = false;
function ensureAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
function tone(freq, dur, type="sine", vol=0.15, slide=0) {
  if (muted || !audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, audioCtx.currentTime);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(1, freq+slide), audioCtx.currentTime+dur);
  g.gain.setValueAtTime(vol, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+dur);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(); o.stop(audioCtx.currentTime+dur);
}
function soundCoin(){ tone(880,0.12,"sine",0.15,440); }
function soundJump(){ tone(330,0.18,"triangle",0.15,220); }
function soundHit(){ tone(180,0.2,"square",0.18,-80); }
function soundWin(){ [523,659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,0.18,"sine",0.15),i*150)); }
function soundGameOver(){ tone(392,0.25,"sawtooth",0.18,-200); setTimeout(()=>tone(261,0.4,"sawtooth",0.18,-150),250); }
function soundSchoolBell(){ if (muted || !audioCtx) return; [1046,1318,1046,1318].forEach((f,i)=>setTimeout(()=>tone(f,0.08,"sine",0.2),i*110)); }
let livesEl;
let scoreEl;
let coinEl;
let timerEl;
let msgEl;
let bubbleEl;
let bubbleTimer = 0;

function createDadaji() {
  const group = new THREE.Group();
  group.position.set(0, GROUND_Y, 0);
  group.rotation.y = Math.PI;

  const parts = {};

  const headGeo = new THREE.SphereGeometry(0.3, 16, 16);
  const headMat = new THREE.MeshStandardMaterial({ color: skinColor });
  parts.head = new THREE.Mesh(headGeo, headMat);
  parts.head.position.y = 1.25;
  parts.head.castShadow = true;
  group.add(parts.head);

  const moustacheGeo = new THREE.BoxGeometry(0.42, 0.06, 0.04);
  const moustacheMat = new THREE.MeshStandardMaterial({ color: whiteColor });
  parts.moustache = new THREE.Mesh(moustacheGeo, moustacheMat);
  parts.moustache.position.set(0, -0.02, 0.28);
  parts.moustache.rotation.x = -0.2;
  parts.head.add(parts.moustache);

  const noseGeo = new THREE.BoxGeometry(0.08, 0.08, 0.12);
  const noseMat = new THREE.MeshStandardMaterial({ color: skinColor });
  parts.nose = new THREE.Mesh(noseGeo, noseMat);
  parts.nose.position.set(0, -0.04, 0.4);
  parts.head.add(parts.nose);

  // 1) Face: Two white eyes with black pupils
  const eyeGeo = new THREE.SphereGeometry(0.055, 12, 12);
  const eyeMat = new THREE.MeshStandardMaterial({ color: whiteColor });
  parts.leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  parts.leftEye.position.set(-0.11, 0.09, 0.26);
  parts.leftEye.castShadow = true;
  parts.head.add(parts.leftEye);

  const pupilGeo = new THREE.SphereGeometry(0.025, 8, 8);
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
  parts.leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
  parts.leftPupil.position.set(0, 0, 0.042);
  parts.leftEye.add(parts.leftPupil);

  parts.rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  parts.rightEye.position.set(0.11, 0.09, 0.26);
  parts.rightEye.castShadow = true;
  parts.head.add(parts.rightEye);

  parts.rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
  parts.rightPupil.position.set(0, 0, 0.042);
  parts.rightEye.add(parts.rightPupil);

  // Thick white eyebrows
  const browGeo = new THREE.BoxGeometry(0.12, 0.045, 0.04);
  const browMat = new THREE.MeshStandardMaterial({ color: whiteColor });
  parts.leftEyebrow = new THREE.Mesh(browGeo, browMat);
  parts.leftEyebrow.position.set(-0.11, 0.17, 0.25);
  parts.leftEyebrow.rotation.z = -0.15;
  parts.leftEyebrow.castShadow = true;
  parts.head.add(parts.leftEyebrow);

  parts.rightEyebrow = new THREE.Mesh(browGeo, browMat);
  parts.rightEyebrow.position.set(0.11, 0.17, 0.25);
  parts.rightEyebrow.rotation.z = 0.15;
  parts.rightEyebrow.castShadow = true;
  parts.head.add(parts.rightEyebrow);

  // Smiling mouth (small dark curved torus)
  const mouthGeo = new THREE.TorusGeometry(0.065, 0.02, 8, 16, Math.PI);
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f });
  parts.mouth = new THREE.Mesh(mouthGeo, mouthMat);
  parts.mouth.position.set(0, -0.14, 0.26);
  parts.mouth.rotation.z = Math.PI;
  parts.mouth.rotation.x = 0.35;
  parts.mouth.castShadow = true;
  parts.head.add(parts.mouth);

  const dhotiGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.7, 12);
  const dhotiMat = new THREE.MeshStandardMaterial({ color: whiteColor });
  parts.dhoti = new THREE.Mesh(dhotiGeo, dhotiMat);
  parts.dhoti.position.set(0, 0.55, 0);
  parts.dhoti.castShadow = true;
  group.add(parts.dhoti);

  const kurtaGeo = new THREE.BoxGeometry(0.5, 0.55, 0.35);
  const kurtaMat = new THREE.MeshStandardMaterial({ color: whiteColor });
  parts.kurta = new THREE.Mesh(kurtaGeo, kurtaMat);
  parts.kurta.position.set(0, 0.95, 0);
  parts.kurta.castShadow = true;
  group.add(parts.kurta);

  const leftLegGeo = new THREE.CylinderGeometry(0.13, 0.1, 0.55, 10);
  const legMat = new THREE.MeshStandardMaterial({ color: skinColor });
  parts.leftLeg = new THREE.Mesh(leftLegGeo, legMat);
  parts.leftLeg.position.set(-0.16, 0.28, 0);
  parts.leftLeg.rotation.z = -0.15;
  parts.leftLeg.castShadow = true;
  group.add(parts.leftLeg);

  const rightLegGeo = new THREE.CylinderGeometry(0.13, 0.1, 0.55, 10);
  parts.rightLeg = new THREE.Mesh(rightLegGeo, legMat);
  parts.rightLeg.position.set(0.16, 0.28, 0);
  parts.rightLeg.rotation.z = 0.15;
  parts.rightLeg.castShadow = true;
  group.add(parts.rightLeg);

  const leftArmGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.5, 10);
  const armMat = new THREE.MeshStandardMaterial({ color: skinColor });
  parts.leftArm = new THREE.Mesh(leftArmGeo, armMat);
  parts.leftArm.position.set(-0.28, 0.98, 0);
  parts.leftArm.rotation.z = -0.3;
  parts.leftArm.castShadow = true;
  group.add(parts.leftArm);

  const rightArmGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.5, 10);
  parts.rightArm = new THREE.Mesh(rightArmGeo, armMat);
  parts.rightArm.position.set(0.28, 0.98, 0);
  parts.rightArm.rotation.z = 0.3;
  parts.rightArm.castShadow = true;
  group.add(parts.rightArm);

  const stickGeo = new THREE.CylinderGeometry(0.035, 0.02, 0.9, 8);
  const stickMat = new THREE.MeshStandardMaterial({ color: stickColor });
  parts.stick = new THREE.Mesh(stickGeo, stickMat);
  parts.stick.position.set(0.38, 0.75, 0.05);
  parts.stick.rotation.z = 0.5;
  parts.stick.castShadow = true;
  parts.rightArm.add(parts.stick);

  const bagGeo = new THREE.BoxGeometry(0.32, 0.45, 0.22);
  const bagMat = new THREE.MeshStandardMaterial({ color: bagColor });
  parts.bag = new THREE.Mesh(bagGeo, bagMat);
  parts.bag.position.set(0, 0.95, -0.28);
  parts.bag.castShadow = true;
  group.add(parts.bag);

  dadajiParts = parts;
  dadaji = group;
  scene.add(group);
}

function getActivePlayer() {
  return (currentChapter === 2 && papaCycle) ? papaCycle : dadaji;
}

function createPapaCycle() {
  const group = new THREE.Group();
  group.position.set(0, GROUND_Y, 0);
  group.rotation.y = Math.PI;

  const parts = {};

  // 1. Two Torus Wheels
  const wheelGeo = new THREE.TorusGeometry(0.35, 0.045, 12, 24);
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
  const spokeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });

  // Front wheel (local +Z is forward)
  const frontWheelGroup = new THREE.Group();
  const frontTire = new THREE.Mesh(wheelGeo, tireMat);
  frontTire.rotation.y = Math.PI / 2;
  frontTire.castShadow = true;
  frontWheelGroup.add(frontTire);
  for (let a = 0; a < 3; a++) {
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.68, 6), spokeMat);
    spoke.rotation.z = (a * Math.PI) / 3;
    spoke.rotation.y = Math.PI / 2;
    frontWheelGroup.add(spoke);
  }
  frontWheelGroup.position.set(0, 0.35, 0.7);
  group.add(frontWheelGroup);
  parts.frontWheel = frontWheelGroup;

  // Rear wheel (local -Z is back)
  const rearWheelGroup = new THREE.Group();
  const rearTire = new THREE.Mesh(wheelGeo, tireMat);
  rearTire.rotation.y = Math.PI / 2;
  rearTire.castShadow = true;
  rearWheelGroup.add(rearTire);
  for (let a = 0; a < 3; a++) {
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.68, 6), spokeMat);
    spoke.rotation.z = (a * Math.PI) / 3;
    spoke.rotation.y = Math.PI / 2;
    rearWheelGroup.add(spoke);
  }
  rearWheelGroup.position.set(0, 0.35, -0.7);
  group.add(rearWheelGroup);
  parts.rearWheel = rearWheelGroup;

  // 2. Bicycle Frame
  const frameColor = 0x00bcd4;
  const frameMat = new THREE.MeshStandardMaterial({ color: frameColor, roughness: 0.4, metalness: 0.3 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.85, roughness: 0.2 });

  const chainstay = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8), frameMat);
  chainstay.rotation.x = Math.PI / 2;
  chainstay.position.set(0, 0.35, -0.35);
  chainstay.castShadow = true;
  group.add(chainstay);

  const seatTube = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.65, 8), frameMat);
  seatTube.position.set(0, 0.62, -0.1);
  seatTube.rotation.x = -0.35;
  seatTube.castShadow = true;
  group.add(seatTube);

  const seatStay = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.75, 8), frameMat);
  seatStay.position.set(0, 0.62, -0.45);
  seatStay.rotation.x = 0.75;
  seatStay.castShadow = true;
  group.add(seatStay);

  const downTube = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.8, 8), frameMat);
  downTube.position.set(0, 0.65, 0.25);
  downTube.rotation.x = 0.68;
  downTube.castShadow = true;
  group.add(downTube);

  const topTube = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.72, 8), frameMat);
  topTube.position.set(0, 0.92, 0.15);
  topTube.rotation.x = Math.PI / 2 - 0.07;
  topTube.castShadow = true;
  group.add(topTube);

  const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.65, 8), chromeMat);
  fork.position.set(0, 0.65, 0.6);
  fork.rotation.x = -0.32;
  fork.castShadow = true;
  group.add(fork);

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.22, 8), chromeMat);
  stem.position.set(0, 1.05, 0.5);
  group.add(stem);

  const handlebar = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.04, 0.04), chromeMat);
  handlebar.position.set(0, 1.15, 0.5);
  handlebar.castShadow = true;
  group.add(handlebar);

  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 }));
  bell.position.set(-0.2, 1.2, 0.5);
  group.add(bell);

  const saddleGeo = new THREE.BoxGeometry(0.24, 0.06, 0.32);
  const saddleMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
  const saddle = new THREE.Mesh(saddleGeo, saddleMat);
  saddle.position.set(0, 0.95, -0.2);
  saddle.castShadow = true;
  group.add(saddle);

  const pedalGeo = new THREE.BoxGeometry(0.12, 0.04, 0.08);
  const pedalMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const pedalLeft = new THREE.Mesh(pedalGeo, pedalMat);
  pedalLeft.position.set(-0.16, 0.35, 0);
  group.add(pedalLeft);
  const pedalRight = new THREE.Mesh(pedalGeo, pedalMat);
  pedalRight.position.set(0.16, 0.35, 0);
  group.add(pedalRight);
  parts.pedalLeft = pedalLeft;
  parts.pedalRight = pedalRight;

  // 3. Boy Figure (Young Papa)
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0x1976d2 });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.48, 0.28), shirtMat);
  torso.position.set(0, 1.3, -0.05);
  torso.rotation.x = 0.25;
  torso.castShadow = true;
  group.add(torso);
  parts.torso = torso;

  const boyHead = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), new THREE.MeshStandardMaterial({ color: skinColor }));
  boyHead.position.set(0, 1.7, 0.05);
  boyHead.castShadow = true;
  group.add(boyHead);
  parts.boyHead = boyHead;

  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
  hair.position.set(0, 1.74, 0.04);
  hair.rotation.x = -0.2;
  group.add(hair);

  const bEyeGeo = new THREE.SphereGeometry(0.045, 10, 10);
  const bEyeMat = new THREE.MeshStandardMaterial({ color: whiteColor });
  const bPupilGeo = new THREE.SphereGeometry(0.02, 8, 8);
  const bPupilMat = new THREE.MeshStandardMaterial({ color: 0x000000 });

  const bEyeL = new THREE.Mesh(bEyeGeo, bEyeMat);
  bEyeL.position.set(-0.09, 0.06, 0.21);
  const bPupilL = new THREE.Mesh(bPupilGeo, bPupilMat);
  bPupilL.position.set(0, 0, 0.035);
  bEyeL.add(bPupilL);
  boyHead.add(bEyeL);
  parts.boyEyeL = bEyeL;

  const bEyeR = new THREE.Mesh(bEyeGeo, bEyeMat);
  bEyeR.position.set(0.09, 0.06, 0.21);
  const bPupilR = new THREE.Mesh(bPupilGeo, bPupilMat);
  bPupilR.position.set(0, 0, 0.035);
  bEyeR.add(bPupilR);
  boyHead.add(bEyeR);
  parts.boyEyeR = bEyeR;

  const bBrowGeo = new THREE.BoxGeometry(0.08, 0.03, 0.03);
  const bBrowMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
  const bBrowL = new THREE.Mesh(bBrowGeo, bBrowMat);
  bBrowL.position.set(-0.09, 0.13, 0.21);
  bBrowL.rotation.z = -0.1;
  boyHead.add(bBrowL);
  const bBrowR = new THREE.Mesh(bBrowGeo, bBrowMat);
  bBrowR.position.set(0.09, 0.13, 0.21);
  bBrowR.rotation.z = 0.1;
  boyHead.add(bBrowR);

  const bMouthGeo = new THREE.TorusGeometry(0.05, 0.015, 8, 16, Math.PI);
  const bMouthMat = new THREE.MeshStandardMaterial({ color: 0x221111 });
  const bMouth = new THREE.Mesh(bMouthGeo, bMouthMat);
  bMouth.position.set(0, -0.1, 0.21);
  bMouth.rotation.z = Math.PI;
  bMouth.rotation.x = 0.3;
  boyHead.add(bMouth);
  parts.boyMouth = bMouth;

  const armMat = new THREE.MeshStandardMaterial({ color: skinColor });
  const armGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.5, 8);

  const leftArm = new THREE.Mesh(armGeo, armMat);
  leftArm.position.set(-0.25, 1.25, 0.2);
  leftArm.rotation.set(-1.1, 0, -0.4);
  leftArm.castShadow = true;
  group.add(leftArm);
  parts.boyArmL = leftArm;

  const rightArm = new THREE.Mesh(armGeo, armMat);
  rightArm.position.set(0.25, 1.25, 0.2);
  rightArm.rotation.set(-1.1, 0, 0.4);
  rightArm.castShadow = true;
  group.add(rightArm);
  parts.boyArmR = rightArm;

  const shortsMat = new THREE.MeshStandardMaterial({ color: 0x0d47a1 });
  const legGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.55, 8);

  const leftLeg = new THREE.Mesh(legGeo, shortsMat);
  leftLeg.position.set(-0.16, 0.72, -0.05);
  leftLeg.rotation.set(-0.35, 0, -0.15);
  leftLeg.castShadow = true;
  group.add(leftLeg);
  parts.boyLegL = leftLeg;

  const rightLeg = new THREE.Mesh(legGeo, shortsMat);
  rightLeg.position.set(0.16, 0.72, -0.05);
  rightLeg.rotation.set(0.35, 0, 0.15);
  rightLeg.castShadow = true;
  group.add(rightLeg);
  parts.boyLegR = rightLeg;

  const pBagGeo = new THREE.BoxGeometry(0.35, 0.45, 0.22);
  const pBagMat = new THREE.MeshStandardMaterial({ color: 0xef6c00 });
  const boyBag = new THREE.Mesh(pBagGeo, pBagMat);
  boyBag.position.set(0, 0.8, -0.55);
  boyBag.castShadow = true;
  group.add(boyBag);

  papaParts = parts;
  papaCycle = group;
  papaCycle.visible = false;
  scene.add(group);
}

function createTeacher() {
  const group = new THREE.Group();
  group.position.set(0, GROUND_Y, 6.0);
  group.rotation.y = Math.PI;

  teacherParts = {};

  const maroonColor = 0x800020;
  const blouseColor = 0x660018;
  const sareeMat = new THREE.MeshStandardMaterial({ color: maroonColor, roughness: 0.6 });
  const blouseMat = new THREE.MeshStandardMaterial({ color: blouseColor, roughness: 0.5 });
  const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.5 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });

  // 1. Lower saree (skirt)
  const skirtGeo = new THREE.CylinderGeometry(0.28, 0.38, 0.75, 12);
  const skirt = new THREE.Mesh(skirtGeo, sareeMat);
  skirt.position.y = 0.48;
  skirt.castShadow = true;
  group.add(skirt);

  // Legs inside for animation
  const legGeo = new THREE.BoxGeometry(0.12, 0.45, 0.12);
  const leftLeg = new THREE.Mesh(legGeo, blouseMat);
  leftLeg.position.set(-0.14, 0.22, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);
  teacherParts.leftLeg = leftLeg;

  const rightLeg = new THREE.Mesh(legGeo, blouseMat);
  rightLeg.position.set(0.14, 0.22, 0);
  rightLeg.castShadow = true;
  group.add(rightLeg);
  teacherParts.rightLeg = rightLeg;

  // 2. Torso (maroon saree body)
  const torsoGeo = new THREE.BoxGeometry(0.52, 0.5, 0.3);
  const torso = new THREE.Mesh(torsoGeo, sareeMat);
  torso.position.y = 1.05;
  torso.castShadow = true;
  group.add(torso);

  // Saree pallu drape across chest
  const palluGeo = new THREE.BoxGeometry(0.26, 0.52, 0.32);
  const palluMat = new THREE.MeshStandardMaterial({ color: 0xa31535, roughness: 0.5 });
  const pallu = new THREE.Mesh(palluGeo, palluMat);
  pallu.position.set(-0.06, 1.05, 0.02);
  pallu.rotation.z = -0.25;
  group.add(pallu);

  // 3. Round head
  const headGeo = new THREE.SphereGeometry(0.26, 16, 16);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 1.48;
  head.castShadow = true;
  group.add(head);
  teacherParts.head = head;

  // 4. Black hair & hair bun
  const hairBaseGeo = new THREE.SphereGeometry(0.27, 16, 16);
  const hairBase = new THREE.Mesh(hairBaseGeo, hairMat);
  hairBase.position.set(0, 1.52, -0.04);
  hairBase.scale.set(1.02, 1.02, 1.04);
  group.add(hairBase);

  const bunGeo = new THREE.SphereGeometry(0.14, 12, 12);
  const bun = new THREE.Mesh(bunGeo, hairMat);
  bun.position.set(0, 1.56, -0.26);
  bun.castShadow = true;
  group.add(bun);

  const bindiGeo = new THREE.BoxGeometry(0.04, 0.04, 0.02);
  const bindiMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const bindi = new THREE.Mesh(bindiGeo, bindiMat);
  bindi.position.set(0, 1.55, 0.25);
  group.add(bindi);

  // 5. Glasses & angry eyebrows
  const glassesGroup = new THREE.Group();
  const frameGeo = new THREE.BoxGeometry(0.12, 0.09, 0.02);
  const frameMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const fLeft = new THREE.Mesh(frameGeo, frameMat);
  fLeft.position.set(-0.1, 1.48, 0.25);
  glassesGroup.add(fLeft);
  const fRight = new THREE.Mesh(frameGeo, frameMat);
  fRight.position.set(0.1, 1.48, 0.25);
  glassesGroup.add(fRight);
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.02), frameMat);
  bridge.position.set(0, 1.48, 0.25);
  glassesGroup.add(bridge);

  const browGeo = new THREE.BoxGeometry(0.13, 0.03, 0.02);
  const browL = new THREE.Mesh(browGeo, frameMat);
  browL.position.set(-0.1, 1.56, 0.25);
  browL.rotation.z = -0.3;
  glassesGroup.add(browL);
  const browR = new THREE.Mesh(browGeo, frameMat);
  browR.position.set(0.1, 1.56, 0.25);
  browR.rotation.z = 0.3;
  glassesGroup.add(browR);
  group.add(glassesGroup);

  // 6. Left Arm
  const armGeo = new THREE.BoxGeometry(0.11, 0.45, 0.11);
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.32, 1.22, 0);
  const leftArm = new THREE.Mesh(armGeo, sareeMat);
  leftArm.position.y = -0.18;
  leftArm.castShadow = true;
  leftArmGroup.add(leftArm);
  group.add(leftArmGroup);
  teacherParts.leftArm = leftArmGroup;

  // 7. Right Arm holding wooden ruler
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.32, 1.22, 0);
  const rightArm = new THREE.Mesh(armGeo, sareeMat);
  rightArm.position.y = -0.18;
  rightArm.castShadow = true;
  rightArmGroup.add(rightArm);

  const rulerGeo = new THREE.BoxGeometry(0.06, 0.55, 0.02);
  const rulerMat = new THREE.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.4 });
  const ruler = new THREE.Mesh(rulerGeo, rulerMat);
  ruler.position.set(0, -0.36, 0.16);
  ruler.rotation.x = 0.4;
  ruler.castShadow = true;
  rightArmGroup.add(ruler);

  group.add(rightArmGroup);
  teacherParts.rightArm = rightArmGroup;

  scene.add(group);
  teacher = group;
}

function getTeacherTargetZ() {
  if (lives >= 3) return 6.0;
  if (lives === 2) return 4.6;
  if (lives === 1) return 3.2;
  return 1.2;
}

function updateTeacher(dt) {
  if (!teacher) return;
  const player = getActivePlayer();
  if (!player) return;

  const targetZ = getTeacherTargetZ();
  teacher.position.z += (targetZ - teacher.position.z) * Math.min(1, dt * 3.5);
  teacher.position.x += (player.position.x - teacher.position.x) * Math.min(1, dt * 2.8);
  teacher.position.y = GROUND_Y;

  if (started && !paused) {
    const swing = Math.sin(walkTime * 9) * 0.45;
    if (teacherParts.leftLeg) teacherParts.leftLeg.rotation.x = swing;
    if (teacherParts.rightLeg) teacherParts.rightLeg.rotation.x = -swing;
    if (teacherParts.leftArm) teacherParts.leftArm.rotation.x = -swing;
    if (lives > 0) {
      if (teacherParts.rightArm) teacherParts.rightArm.rotation.x = swing * 0.7;
    }
  }

  if (lives <= 0) {
    if (teacherParts.rightArm) {
      teacherParts.rightArm.position.y = 1.35;
      teacherParts.rightArm.rotation.set(-2.2, 0, 0.3);
    }
  }
}

function createGround() {
  const segCount = 12;
  const segLen = 30;
  const segGeo = new THREE.PlaneGeometry(24, segLen);
  const segMat = new THREE.MeshStandardMaterial({ color: 0x426b3d, roughness: 0.96 });
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x343b3d, roughness: 0.94, metalness: 0.02 });
  const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x8c7655, roughness: 0.92 });
  const curbEdgeMat = new THREE.MeshStandardMaterial({ color: 0xe8d9a8, roughness: 0.7 });

  for (let i = 0; i < segCount; i++) {
    const seg = new THREE.Mesh(segGeo, segMat);
    seg.rotation.x = -Math.PI / 2;
    seg.position.y = 0;
    seg.position.z = 4 - i * segLen;
    seg.receiveShadow = true;

    // Dark road surface in center
    const road = new THREE.Mesh(new THREE.PlaneGeometry(7.8, segLen), roadMat);
    road.position.z = 0.01;
    road.receiveShadow = true;
    seg.add(road);

    // Colored sidewalk strips on both sides
    const swL = new THREE.Mesh(new THREE.PlaneGeometry(1.6, segLen), sidewalkMat);
    swL.position.set(-4.7, 0, 0.02);
    swL.receiveShadow = true;
    seg.add(swL);

    const swR = new THREE.Mesh(new THREE.PlaneGeometry(1.6, segLen), sidewalkMat);
    swR.position.set(4.7, 0, 0.02);
    swR.receiveShadow = true;
    seg.add(swR);

    // Painted curb edge strips
    const curbL = new THREE.Mesh(new THREE.PlaneGeometry(0.18, segLen), curbEdgeMat);
    curbL.position.set(-3.9, 0, 0.03);
    seg.add(curbL);

    const curbR = new THREE.Mesh(new THREE.PlaneGeometry(0.18, segLen), curbEdgeMat);
    curbR.position.set(3.9, 0, 0.03);
    seg.add(curbR);

    scene.add(seg);
    groundSegments.push(seg);
  }

  // Subtle continuous lane guides sit beneath the brighter dashed markings.
  const lineGeo = new THREE.BoxGeometry(0.045, 0.025, segLen * segCount);
  const lineMat = new THREE.MeshStandardMaterial({ color: 0xb8b9a7, roughness: 0.8 });
  for (const lx of [-1.2, 1.2]) {
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.position.set(lx, 0.02, 0);
    line.receiveShadow = true;
    scene.add(line);
    laneLines.push(line);
  }

  // Painted dashed lines (small boxes that scroll and recycle)
  const dashGeo = new THREE.BoxGeometry(0.10, 0.035, 2.0);
  const dashMat = new THREE.MeshStandardMaterial({ color: 0xf2e5b2, roughness: 0.55, emissive: 0x272313, emissiveIntensity: 0.08 });
  for (let z = 10; z >= -350; z -= 5.5) {
    for (const lx of [-1.2, 1.2]) {
      const dash = new THREE.Mesh(dashGeo, dashMat);
      dash.position.set(lx, 0.03, z);
      dash.receiveShadow = true;
      scene.add(dash);
      roadDashes.push(dash);
    }
  }
}

function createBuildingGroup(side, z) {
  const group = new THREE.Group();
  const palette = [0xc98568, 0x789b8c, 0xd8b978, 0x9ba8a0, 0xc7a6a0, 0x7d9bb0, 0xd3a16f, 0x9b8eb4];
  const color = palette[Math.floor(Math.random() * palette.length)];

  const bWidth = 3.8;
  const bHeight = 4.0 + (Math.abs(Math.sin(z * 0.1)) * 2.2);
  const bDepth = 4.4;

  const bMat = new THREE.MeshStandardMaterial({ color, roughness: 0.82 });
  const bMesh = new THREE.Mesh(new THREE.BoxGeometry(bWidth, bHeight, bDepth), bMat);
  bMesh.position.y = bHeight / 2;
  bMesh.castShadow = true;
  bMesh.receiveShadow = true;
  group.add(bMesh);

  const winMat = new THREE.MeshStandardMaterial({ color: 0x263b39, roughness: 0.36, metalness: 0.08, emissive: 0x101c1a, emissiveIntensity: 0.15 });
  const innerX = side < 0 ? (bWidth / 2 + 0.02) : -(bWidth / 2 + 0.02);

  const shopWin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.4, 2.4), winMat);
  shopWin.position.set(innerX, 0.9, 0);
  group.add(shopWin);

  const upperWin1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.8, 1.0), winMat);
  upperWin1.position.set(innerX, 2.6, -1.0);
  group.add(upperWin1);
  const upperWin2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.8, 1.0), winMat);
  upperWin2.position.set(innerX, 2.6, 1.0);
  group.add(upperWin2);

  const awningColor = palette[(palette.indexOf(color) + 2) % palette.length];
  const awningMat = new THREE.MeshStandardMaterial({ color: awningColor, roughness: 0.4 });
  const awning = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.08, 2.7), awningMat);
  awning.position.set(innerX + (side < 0 ? 0.35 : -0.35), 1.7, 0);
  awning.rotation.z = side < 0 ? -0.28 : 0.28;
  awning.castShadow = true;
  group.add(awning);

  const xPos = side * (6.6 + Math.abs(Math.cos(z * 0.1)) * 0.8);
  group.position.set(xPos, 0, z);
  return group;
}

function createBuildings() {
  const count = 22; // at most 30 meshes
  for (let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const z = - (Math.floor(i / 2) * 32 + (i % 3) * 3);
    const mesh = createBuildingGroup(side, z);
    scene.add(mesh);
    buildings.push({ mesh, z, baseY: 0 });
  }
}

function createScenery() {
  for (let i = 0; i < 12; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (6 + Math.random() * 2);
    const z = -Math.random() * 360;
    let mesh;
    if (i % 3 === 0) {
      const g = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.2,1.2,8), new THREE.MeshStandardMaterial({color:0x6b4226}));
      trunk.position.y = 0.6; g.add(trunk);
      const leafMat = new THREE.MeshStandardMaterial({color:0x326b3c, roughness:0.92});
      const leaves = new THREE.Mesh(new THREE.SphereGeometry(0.9,10,8), leafMat);
      leaves.position.y = 1.6; leaves.castShadow = true; g.add(leaves);
      const crownL = new THREE.Mesh(new THREE.SphereGeometry(0.58,8,7), new THREE.MeshStandardMaterial({color:0x3f8045, roughness:0.95}));
      crownL.position.set(-0.42,1.75,0.08); crownL.castShadow = true; g.add(crownL);
      const crownR = new THREE.Mesh(new THREE.SphereGeometry(0.55,8,7), new THREE.MeshStandardMaterial({color:0x285b35, roughness:0.95}));
      crownR.position.set(0.4,1.8,-0.05); crownR.castShadow = true; g.add(crownR);
      mesh = g;
    } else {
      const g = new THREE.Group();
      const hut = new THREE.Mesh(new THREE.BoxGeometry(1.4,1.2,1.4), new THREE.MeshStandardMaterial({color:0xb87333}));
      hut.position.y = 0.6; g.add(hut);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.1,0.8,4), new THREE.MeshStandardMaterial({color:0x8b5a2b}));
      roof.position.y = 1.6; roof.rotation.y = Math.PI/4; roof.castShadow = true; g.add(roof);
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.32,0.68,0.035), new THREE.MeshStandardMaterial({color:0x4b2d20, roughness:0.95}));
      door.position.set(0,0.34,0.72); g.add(door);
      const windowMat = new THREE.MeshStandardMaterial({color:0x9fc7c8, roughness:0.45, emissive:0x243e3e, emissiveIntensity:0.12});
      const windowMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32,0.28,0.035), windowMat);
      windowMesh.position.set(-0.42,0.78,0.72); g.add(windowMesh);
      mesh = g;
    }
    mesh.position.set(x,0,z);
    scene.add(mesh);
    scenery.push({mesh, z, baseY: 0});
  }
  for (let i=0;i<5;i++){
    const cloud = new THREE.Mesh(new THREE.SphereGeometry(1.2,8,8), new THREE.MeshBasicMaterial({color:0xffffff}));
    cloud.position.set((Math.random()-0.5)*20, 8+Math.random()*2, -Math.random()*120);
    scene.add(cloud);
    clouds.push(cloud);
  }
}

function createSchoolGate() {
  const group = new THREE.Group();
  const pillarGeo = new THREE.BoxGeometry(0.6, 4, 0.6);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c });
  const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
  leftPillar.position.set(-2.4, 2, 0);
  leftPillar.castShadow = true;
  group.add(leftPillar);
  const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
  rightPillar.position.set(2.4, 2, 0);
  rightPillar.castShadow = true;
  group.add(rightPillar);
  const archGeo = new THREE.BoxGeometry(5.4, 0.6, 0.6);
  const arch = new THREE.Mesh(archGeo, pillarMat);
  arch.position.set(0, 4.3, 0);
  arch.castShadow = true;
  group.add(arch);
  const signCanvas = document.createElement("canvas");
  signCanvas.width = 512;
  signCanvas.height = 128;
  const ctx = signCanvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0,0,512,128);
  ctx.fillStyle = "#000";
  ctx.font = "bold 48px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SCHOOL CLOSED: SUNDAY", 256, 64);
  const signTex = new THREE.CanvasTexture(signCanvas);
  const signGeo = new THREE.PlaneGeometry(4, 1.2);
  const signMat = new THREE.MeshBasicMaterial({ map: signTex });
  const sign = new THREE.Mesh(signGeo, signMat);
  sign.position.set(0, 3.2, 0.31);
  group.add(sign);
  group.position.set(0, 0, -70);
  scene.add(group);
  gateMesh = group;
}

function createRewardScreen() {
  rewardEl = document.createElement("div");
  rewardEl.className = "reward-screen";
  Object.assign(rewardEl.style, {
    position: "fixed", inset: "0", display: "none", flexDirection: "column",
    alignItems: "center", justifyContent: "center", background: "rgba(5,16,12,.88)",
    color: "#fff", zIndex: "80", fontFamily: "'DM Sans', system-ui, sans-serif",
    textAlign: "center", padding: "20px", backdropFilter: "blur(12px)"
  });
  rewardEl.innerHTML =
    '<section class="reward-card" role="dialog" aria-modal="true" aria-labelledby="reward-title">' +
    '<div style="font-size:3rem;margin-bottom:8px" aria-hidden="true">🏆 🎒</div>' +
    '<h2 id="reward-title">Dadaji reached school!</h2>' +
    '<p class="reward-coins">+100 Comedy Coins 🪙</p>' +
    '<p>Miracle of miracles: the school gate is right there. Unfortunately, it may be Sunday.</p>' +
    '<p><strong>Chapter unlocked:</strong> Papa’s Bicycle Challenge 🚲</p>' +
    '<div class="reward-actions">' +
    '<button id="play-papa-btn" type="button">Ride with Papa →</button>' +
    '<button class="secondary" id="play-again-btn" type="button">Replay Dadaji</button>' +
    '</div></section>';
  document.body.appendChild(rewardEl);
  document.getElementById("play-again-btn").addEventListener("click", () => location.reload());
  document.getElementById("play-papa-btn").addEventListener("click", () => startPapaLevel());
}
function startPapaLevel() {
  if (gameOverEl) gameOverEl.style.display = "none";
  if (pauseEl) pauseEl.style.display = "none";
  paused = false;
  currentChapter = 2;
  RUN_SPEED = 24;
  OBSTACLE_SPEED = 24;
  papaTimer = PAPA_LEVEL_SECONDS;
  lives = 3;
  gameOver = false;
  started = true;
  winState = "playing";
  isJumping = false;
  isSliding = false;
  slideTimer = 0;
  playerCollisionHeight = 1.6;
  if (dadaji) dadaji.scale.y = 1.0;
  if (papaCycle) papaCycle.scale.y = 1.0;
  velocityY = 0;
  fallAngle = 0;
  shakeTime = 0;
  hitReactionTimer = 0;
  coinHopTimer = 0;
  coinSmileTimer = 0;

  lane = 1;
  targetX = LANE_X[1];
  currentX = LANE_X[1];

  if (rewardEl) rewardEl.style.display = "none";
  if (gateMesh) {
    scene.remove(gateMesh);
    gateMesh = null;
  }
  clearWorld();

  if (dadaji) dadaji.visible = false;
  if (!papaCycle) createPapaCycle();
  papaCycle.visible = true;
  papaCycle.position.set(currentX, GROUND_Y, 0);
  papaCycle.rotation.set(0, Math.PI, 0);

  if (teacher) {
    teacher.visible = true;
    teacher.position.set(currentX, GROUND_Y, 6.0);
    if (teacherParts.rightArm) {
      teacherParts.rightArm.position.y = 1.22;
      teacherParts.rightArm.rotation.set(0, 0, 0);
    }
    if (teacherParts.leftArm) teacherParts.leftArm.rotation.set(0, 0, 0);
    if (teacherParts.leftLeg) teacherParts.leftLeg.rotation.set(0, 0, 0);
    if (teacherParts.rightLeg) teacherParts.rightLeg.rotation.set(0, 0, 0);
  }

  updateSkyAndLighting(PAPA_THEME);
  if (groundSegments[0]) groundSegments.forEach(s => { if (s.material && s.material.color && s.material.color.setHex) s.material.color.setHex(PAPA_THEME.ground); });

  showMessage("Chapter 2: Papa's Cycle Level! 🚲");
  setTimeout(hideMessage, 1500);
  showDialogue("papaStart");

  for (let i = 0; i < 4; i++) {
    spawnObstacle();
    if (obstacles.length > 0) {
      obstacles[obstacles.length - 1].z = SPAWN_Z_AHEAD - (i + 1) * 35;
      obstacles[obstacles.length - 1].mesh.position.z = obstacles[obstacles.length - 1].z;
    }
  }
  for (let i = 0; i < 3; i++) spawnCoin();
  updateHUD();
}

function finishPapaLevel() {
  savePlayerStats(true);
  clearWorld();
  winState = "papaWin";
  soundWin();
  soundSchoolBell();
  showDialogue("papaWin");
  showMessage("🔔 Tring Tring! School Reached! 🔔");
  createSchoolGate();
  if (gateMesh) gateMesh.position.z = 2;

  setTimeout(() => {
    hideMessage();
    createPapaRewardScreen();
  }, 2200);
}

function createPapaRewardScreen() {
  if (!rewardEl) return;
  rewardEl.innerHTML =
    '<section class="reward-card" role="dialog" aria-modal="true" aria-labelledby="reward-title">' +
    '<div style="font-size:3rem;margin-bottom:8px" aria-hidden="true">🚲 🔔 🏆</div>' +
    '<h2 id="reward-title">Papa beat the school bell!</h2>' +
    '<p class="reward-coins">+200 Legend Coins 🪙</p>' +
    '<p class="dialogue-quote">Papa: “मैं तो साइकिल से आया था!”</p>' +
    '<p>Dadaji walked through history. Papa just rang the bell and cycled through chaos.</p>' +
    '<div class="reward-actions">' +
    '<button id="replay-papa-btn" type="button">Replay Papa’s Level ↻</button>' +
    '<button class="secondary" id="play-all-again-btn" type="button">Restart the whole story</button>' +
    '</div></section>';
  rewardEl.style.display = "flex";
  document.getElementById("replay-papa-btn").addEventListener("click", () => startPapaLevel());
  document.getElementById("play-all-again-btn").addEventListener("click", () => location.reload());
}
function hudDiv(cls, text, parent) {
  const d = document.createElement("div");
  d.className = cls;
  if (text) d.textContent = text;
  (parent || document.body).appendChild(d);
  return d;
}

function hudButton(label, label2, fn) {
  const b = document.createElement("button");
  b.textContent = label;
  b.setAttribute("aria-label", label2);
  b.addEventListener("click", fn);
  return b;
}

function createHUD() {
  hudEl = hudDiv("hud");
  livesEl = hudDiv("pill hearts", "♥♥♥", hudEl);
  coinEl = hudDiv("pill gold", "🪙 0", hudEl);
  const mid = hudDiv("pill grow", "", hudEl);
  timerEl = hudDiv("timer", "", mid);
  barEl = hudDiv("fill", "", hudDiv("bar", "", mid));
  scoreEl = hudDiv("pill", "15.0 km", hudEl);
  msgEl = hudDiv("msg");
  bubbleEl = hudDiv("bubble");

  const btns = hudDiv("btns");
  const muteBtn = hudButton(muted ? "🔇" : "🔊", muted ? "Unmute" : "Mute", () => {
    muted = !muted;
    muteBtn.textContent = muted ? "🔇" : "🔊";
    muteBtn.setAttribute("aria-label", muted ? "Unmute" : "Mute");
    try { window.localStorage.setItem("dadaji-muted", muted ? "1" : "0"); } catch (e) {}
    if (muted && typeof window !== "undefined" && "speechSynthesis" in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
      isSpeaking = false;
    }
  });
  pauseBtn = hudButton("⏸", "Pause", () => togglePause());
  btns.appendChild(pauseBtn);
  btns.appendChild(muteBtn);

  pauseEl = hudDiv("pause", "⏸ Paused");
  hudDiv("", "Tap anywhere to resume", pauseEl).style.fontSize = "1rem";
  pauseEl.addEventListener("click", () => togglePause(false));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) togglePause(true);
  });

  // Clear, explicit touch controls complement swipe gestures on phones.
  const bindTouchButton = (id, action) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (started && !paused && !gameOver) action();
    });
  };
  bindTouchButton("touch-left", () => changeLane(-1));
  bindTouchButton("touch-right", () => changeLane(1));
  bindTouchButton("touch-jump", () => jump());
  bindTouchButton("touch-slide", () => slide());

  gameOverEl = document.createElement("div");
  gameOverEl.className = "gameover-overlay";
  gameOverEl.style.display = "none";
  gameOverEl.innerHTML =
    '<section class="reward-card" role="dialog" aria-modal="true" aria-labelledby="gameover-title">' +
    '<div class="gameover-icon" aria-hidden="true">💥</div>' +
    '<h2 id="gameover-title">Arre, kya ho gaya?</h2>' +
    '<p id="gameover-copy">Dadaji met one obstacle too many.</p>' +
    '<div class="reward-actions"><button id="retry-chapter-btn" type="button">Try again ↻</button><button id="restart-story-btn" class="secondary" type="button">Restart story</button></div>' +
    '</section>';
  Object.assign(gameOverEl.style, {
    position: "fixed", inset: "0", zIndex: "96", alignItems: "center", justifyContent: "center",
    padding: "20px", background: "rgba(5,16,12,.86)", backdropFilter: "blur(12px)", textAlign: "center"
  });
  document.body.appendChild(gameOverEl);
  document.getElementById("retry-chapter-btn").addEventListener("click", () => {
    gameOverEl.style.display = "none";
    if (currentChapter === 2) startPapaLevel();
    else location.reload();
  });
  document.getElementById("restart-story-btn").addEventListener("click", () => location.reload());
}

function showGameOverScreen() {
  if (!gameOverEl) return;
  savePlayerStats(true);
  const title = document.getElementById("gameover-title");
  const copy = document.getElementById("gameover-copy");
  const retry = document.getElementById("retry-chapter-btn");
  const icon = gameOverEl.querySelector(".gameover-icon");
  if (currentChapter === 2) {
    title.textContent = "Papa missed the bell!";
    copy.textContent = "Even a bicycle cannot outrun every buffalo. Best Dadaji distance: " + bestDistance.toLocaleString() + " m. Give it another go.";
    retry.textContent = "Retry Papa’s ride ↻";
    icon.textContent = "🚲💥";
  } else {
    title.textContent = "Dadaji got delayed!";
    copy.textContent = "Distance covered: " + Math.floor(score) + " m. Personal best: " + bestDistance.toLocaleString() + " m. The school bell is still judging you.";
    retry.textContent = "Retry Dadaji ↻";
    icon.textContent = "👴💥";
  }
  gameOverEl.style.display = "flex";
}

function togglePause(force) {
  if (!started || gameOver) return;
  paused = force !== undefined ? force : !paused;
  pauseEl.style.display = paused ? "flex" : "none";
  pauseBtn.textContent = paused ? "▶" : "⏸";
  if (paused && typeof window !== "undefined" && "speechSynthesis" in window) {
    try { window.speechSynthesis.cancel(); } catch (e) {}
    isSpeaking = false;
  }
  if (!paused) lastTime = performance.now();
}

function updateHUD() {
  savePlayerStats();
  livesEl.textContent = lives > 0 ? "♥".repeat(lives) : "♡";
  coinEl.textContent = "🪙 " + coins;
  if (currentChapter === 2) {
    scoreEl.textContent = "🚲 24 km/h";
    timerEl.textContent = "🔔 School bell: " + Math.max(0, Math.ceil(papaTimer)) + "s";
    barEl.style.width = 100 * (1 - papaTimer / PAPA_LEVEL_SECONDS) + "%";
    return;
  }
  const elapsed = (currentLevel - 1) * LEVEL_SECONDS + (LEVEL_SECONDS - levelTimeLeft);
  const frac = Math.min(1, Math.max(0, elapsed / (LEVEL_COUNT * LEVEL_SECONDS)));
  scoreEl.textContent = ((1 - frac) * 15).toFixed(1) + " km";
  timerEl.textContent = "Level " + currentLevel + "/" + LEVEL_COUNT + " · " + Math.max(0, Math.floor(levelTimeLeft)) + "s";
  barEl.style.width = frac * 100 + "%";
}

function showMessage(text) {
  msgEl.textContent = text;
  msgEl.setAttribute("role", "status");
  msgEl.setAttribute("aria-live", "polite");
  msgEl.style.display = "block";
}

function hideMessage() {
  msgEl.style.display = "none";
}

function updateHindiVoice() {
  try {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const voices = window.speechSynthesis.getVoices();
    hiVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("hi")) || null;
  } catch (e) {}
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  try {
    updateHindiVoice();
    window.speechSynthesis.addEventListener("voiceschanged", updateHindiVoice);
  } catch (e) {}
}

function speak(text) {
  try {
    if (muted) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      fallbackSpeechTimer = 2.0;
      return;
    }
    window.speechSynthesis.cancel();
    isSpeaking = false;
    const cleanText = text ? text.replace(/\p{Extended_Pictographic}/gu, "").trim() : "";
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "hi-IN";
    utterance.pitch = 0.6;
    utterance.rate = 0.85;
    if (!hiVoice) updateHindiVoice();
    if (hiVoice) utterance.voice = hiVoice;

    utterance.onstart = () => { isSpeaking = true; };
    utterance.onend = () => { isSpeaking = false; };
    utterance.onerror = () => { isSpeaking = false; };

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    isSpeaking = false;
    fallbackSpeechTimer = 2.0;
  }
}

function showDialogue(key) {
  const text = DIALOGUE[key] || (typeof key === "string" ? key : "");
  if (!text || !bubbleEl) return;

  const isTeacher = key === "teacherWarning" || text.includes("होमवर्क कहाँ है");
  const isPapa = currentChapter === 2 || ["papaWin", "papaStart", "papaBag", "papaBuffalo"].includes(key);
  const speaker = isTeacher ? "Masterji" : (isPapa ? "Papa" : "Dadaji");
  const avatar = isTeacher ? "👨‍🏫" : (isPapa ? "🚲" : "👴");
  bubbleEl.replaceChildren();

  const avatarEl = document.createElement("span");
  avatarEl.className = "dialogue-avatar";
  avatarEl.textContent = avatar;
  avatarEl.setAttribute("aria-hidden", "true");

  const copy = document.createElement("span");
  copy.className = "dialogue-copy";
  const speakerEl = document.createElement("span");
  speakerEl.className = "dialogue-speaker";
  speakerEl.textContent = speaker + " says";
  const textEl = document.createElement("span");
  textEl.className = "dialogue-text";
  textEl.textContent = text;
  copy.append(speakerEl, textEl);
  bubbleEl.append(avatarEl, copy);
  bubbleEl.setAttribute("role", "status");
  bubbleEl.setAttribute("aria-live", "polite");
  bubbleEl.style.display = "flex";
  bubbleTimer = Math.min(5.8, Math.max(2.8, text.length * 0.075));
  speak(text);
}

function updateBubble(dt) {
  if (bubbleTimer > 0) {
    bubbleTimer -= dt;
    if (bubbleTimer <= 0) {
      bubbleTimer = 0;
      bubbleEl.style.display = "none";
    }
  }
}

function spawnCoin() {
  const laneIndex = Math.floor(Math.random() * 3);
  const x = LANE_X[laneIndex];
  const z = SPAWN_Z_AHEAD - Math.random() * 60;
  const isChai = lives < 3 && Math.random() < 0.25;
  let mesh;
  if (isChai) {
    mesh = new THREE.Group();
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.15, 0.3, 12),
      new THREE.MeshStandardMaterial({ color: 0xb5651d, roughness: 0.6 })
    );
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.04, 12),
      new THREE.MeshStandardMaterial({ color: 0xf1d8a8 })
    );
    top.position.y = 0.15;
    cup.castShadow = true;
    mesh.add(cup);
    mesh.add(top);
  } else {
    const geo = new THREE.CylinderGeometry(0.25, 0.25, 0.12, 16);
    geo.rotateX(Math.PI / 2);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2, emissive: 0x553d00 });
    mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
  }
  mesh.position.set(x, 1.0, z);
  scene.add(mesh);
  coinMeshes.push({ mesh, lane: laneIndex, z, collected: false, kind: isChai ? "chai" : "coin" });
}

function createBuffaloMesh() {
  const group = new THREE.Group();

  const bodyGeo = new THREE.BoxGeometry(1.1, 0.9, 1.6);
  const bodyMat = new THREE.MeshStandardMaterial({ color: buffaloColor });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.set(0, 0.85, 0);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const headGeo = new THREE.BoxGeometry(0.7, 0.55, 0.7);
  const head = new THREE.Mesh(headGeo, bodyMat);
  head.position.set(0, 1.3, 0.95);
  head.castShadow = true;
  group.add(head);

  const hornGeo = new THREE.BoxGeometry(0.14, 0.3, 0.14);
  const hornMat = new THREE.MeshStandardMaterial({ color: hornColor });
  const hornL = new THREE.Mesh(hornGeo, hornMat);
  hornL.position.set(-0.22, 1.5, 1.15);
  hornL.rotation.z = -0.4;
  hornL.castShadow = true;
  group.add(hornL);

  const hornR = new THREE.Mesh(hornGeo, hornMat);
  hornR.position.set(0.22, 1.5, 1.15);
  hornR.rotation.z = 0.4;
  hornR.castShadow = true;
  group.add(hornR);

  const legGeo = new THREE.BoxGeometry(0.16, 0.85, 0.16);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
  for (const lx of [-0.4, 0.4]) {
    for (const lz of [0.4, 1.15]) {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, 0.4, lz);
      leg.castShadow = true;
      group.add(leg);
    }
  }
  return group;
}

function createBusMesh() {
  const group = new THREE.Group();

  const busColors = [0xff5722, 0xe91e63, 0x00bcd4, 0xff9800];
  const bodyColor = busColors[Math.floor(Math.random() * busColors.length)];
  const stripeColor = 0xffeb3b;

  const bodyGeo = new THREE.BoxGeometry(1.9, 2.3, 5.4);
  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.35, metalness: 0.1 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.set(0, 1.5, 0);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const stripeGeo = new THREE.BoxGeometry(1.92, 0.22, 5.42);
  const stripeMat = new THREE.MeshStandardMaterial({ color: stripeColor, roughness: 0.4 });
  const stripe1 = new THREE.Mesh(stripeGeo, stripeMat);
  stripe1.position.set(0, 1.15, 0);
  group.add(stripe1);
  const stripe2 = new THREE.Mesh(stripeGeo, stripeMat);
  stripe2.position.set(0, 1.85, 0);
  group.add(stripe2);

  const windowGeo = new THREE.BoxGeometry(1.94, 0.55, 4.4);
  const windowMat = new THREE.MeshStandardMaterial({ color: 0x1a2634, roughness: 0.2, metalness: 0.3 });
  const windows = new THREE.Mesh(windowGeo, windowMat);
  windows.position.set(0, 1.95, -0.2);
  group.add(windows);

  const windshieldGeo = new THREE.BoxGeometry(1.7, 0.75, 0.1);
  const windshield = new THREE.Mesh(windshieldGeo, windowMat);
  windshield.position.set(0, 1.85, 2.71);
  group.add(windshield);

  const lightGeo = new THREE.SphereGeometry(0.16, 10, 10);
  const lightMat = new THREE.MeshStandardMaterial({ color: 0xfff9a6, emissive: 0xffeb3b, emissiveIntensity: 0.8 });
  const hlLeft = new THREE.Mesh(lightGeo, lightMat);
  hlLeft.position.set(-0.65, 0.65, 2.72);
  group.add(hlLeft);
  const hlRight = new THREE.Mesh(lightGeo, lightMat);
  hlRight.position.set(0.65, 0.65, 2.72);
  group.add(hlRight);

  const bumperGeo = new THREE.BoxGeometry(1.95, 0.25, 0.2);
  const bumperMat = new THREE.MeshStandardMaterial({ color: 0xdcdde1, metalness: 0.7, roughness: 0.3 });
  const bumper = new THREE.Mesh(bumperGeo, bumperMat);
  bumper.position.set(0, 0.45, 2.72);
  group.add(bumper);

  const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 16);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e272e, roughness: 0.8 });
  const wheelPositions = [
    [-0.92, 0.42, 1.6],
    [0.92, 0.42, 1.6],
    [-0.92, 0.42, -1.6],
    [0.92, 0.42, -1.6]
  ];
  for (let wp of wheelPositions) {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.set(wp[0], wp[1], wp[2]);
    wheel.castShadow = true;
    group.add(wheel);
  }

  return group;
}

function createLowBarMesh() {
  const group = new THREE.Group();

  const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8);
  const postMat = new THREE.MeshStandardMaterial({ color: 0x57606f, metalness: 0.5, roughness: 0.4 });

  const leftPost = new THREE.Mesh(postGeo, postMat);
  leftPost.position.set(-1.05, 0.7, 0);
  leftPost.castShadow = true;
  group.add(leftPost);

  const rightPost = new THREE.Mesh(postGeo, postMat);
  rightPost.position.set(1.05, 0.7, 0);
  rightPost.castShadow = true;
  group.add(rightPost);

  const barGeo = new THREE.BoxGeometry(2.26, 0.16, 0.16);
  const barMat = new THREE.MeshStandardMaterial({ color: 0xff3838, roughness: 0.4 });
  const bar = new THREE.Mesh(barGeo, barMat);
  bar.position.set(0, 1.1, 0);
  bar.castShadow = true;
  group.add(bar);

  const stripeGeo = new THREE.BoxGeometry(0.24, 0.17, 0.17);
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffeb3b });
  for (let sx of [-0.8, -0.4, 0, 0.4, 0.8]) {
    const s = new THREE.Mesh(stripeGeo, stripeMat);
    s.position.set(sx, 1.1, 0);
    group.add(s);
  }

  return group;
}

function spawnObstacle() {
  let type;
  let laneIndex = Math.floor(Math.random() * 3);
  let x = LANE_X[laneIndex];
  const z = SPAWN_Z_AHEAD - Math.random() * 40;

  if (currentChapter === 2) {
    const pr = Math.random();
    if (pr < 0.35) {
      type = "crossing_buffalo";
    } else if (pr < 0.65) {
      type = "runaway_bag";
    } else if (pr < 0.85) {
      type = "buffalo";
    } else {
      type = "bus";
    }
  } else {
    const w = currentTheme().weights;
    const r = Math.random();
    const types = ["buffalo", "low_bar", "mud", "bus", "bridge"];
    let cum = 0;
    type = "buffalo";
    for (let ti = 0; ti < types.length; ti++) {
      cum += (w[ti] || 0);
      if (r < cum) {
        type = types[ti];
        break;
      }
    }
    if (type === "bridge") laneIndex = 1;
    x = LANE_X[laneIndex];
  }

  if (type === "bus") {
    const busyLanes = new Set();
    for (let k = 0; k < obstacles.length; k++) {
      const o = obstacles[k];
      if (Math.abs(o.z - z) < 14) {
        busyLanes.add(o.lane);
      }
    }
    if (busyLanes.size >= 2) {
      type = "low_bar";
    } else {
      const freeLanes = [0, 1, 2].filter((l) => !busyLanes.has(l));
      if (freeLanes.length > 0) {
        laneIndex = freeLanes[Math.floor(Math.random() * freeLanes.length)];
        x = LANE_X[laneIndex];
      }
    }
  }

  const obstacle = { type, lane: laneIndex, mesh: null, active: true, passed: false, z, baseY: 0 };

  if (type === "buffalo") {
    obstacle.mesh = createBuffaloMesh();
    obstacle.hitHeight = 1.5;
  } else if (type === "bus") {
    obstacle.mesh = createBusMesh();
    obstacle.hitHeight = 3.2;
  } else if (type === "low_bar") {
    obstacle.mesh = createLowBarMesh();
    obstacle.hitHeight = 1.1;
  } else if (type === "crossing_buffalo") {
    const group = createBuffaloMesh();
    const fromLeft = Math.random() < 0.5;
    x = fromLeft ? -3.8 : 3.8;
    group.rotation.y = fromLeft ? Math.PI / 2 : -Math.PI / 2;
    obstacle.x = x;
    obstacle.crossDir = fromLeft ? 1 : -1;
    obstacle.crossSpeed = 2.4 + Math.random() * 1.5;
    obstacle.mesh = group;
    obstacle.hitHeight = 1.5;
  } else if (type === "runaway_bag") {
    const bagGroup = new THREE.Group();
    const mainBag = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.32), new THREE.MeshStandardMaterial({ color: 0xff3d00, roughness: 0.4 }));
    mainBag.position.y = 0.3;
    mainBag.castShadow = true;
    bagGroup.add(mainBag);

    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.26, 0.12), new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3 }));
    pocket.position.set(0, 0.25, 0.18);
    pocket.castShadow = true;
    bagGroup.add(pocket);

    const strap = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 8), new THREE.MeshStandardMaterial({ color: 0x222222 }));
    strap.rotation.z = Math.PI / 2;
    strap.position.set(0, 0.54, 0);
    bagGroup.add(strap);

    obstacle.mesh = bagGroup;
    obstacle.bounce = Math.random() * Math.PI;
    obstacle.collected = false;
  } else if (type === "mud") {
    const geo = new THREE.CylinderGeometry(1.6, 1.6, 0.12, 24);
    const mat = new THREE.MeshStandardMaterial({ color: mudColor });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, 0.06, 0);
    mesh.receiveShadow = true;
    obstacle.mesh = mesh;
    obstacle.hitHeight = 0.9;
  } else {
    const gapGeo = new THREE.PlaneGeometry(200, 6);
    const gapMat = new THREE.MeshStandardMaterial({ color: 0x3a7bd5 });
    const gap = new THREE.Mesh(gapGeo, gapMat);
    gap.rotation.x = -Math.PI / 2;
    gap.position.set(0, 0.02, 0);
    obstacle.mesh = gap;
    obstacle.hitHeight = 0.5;
  }

  obstacle.mesh.position.set(x, 0, z);
  scene.add(obstacle.mesh);
  obstacles.push(obstacle);
}

function createObstacles() {
  for (let i = 0; i < 5; i++) {
    spawnObstacle();
    obstacles[obstacles.length - 1].z = SPAWN_Z_AHEAD - (i + 1) * 45 - Math.random() * 30;
    obstacles[obstacles.length - 1].mesh.position.z = obstacles[obstacles.length - 1].z;
  }
}

function hitObstacle(obstacle) {
  if (!obstacle.active || invulnTimer > 0) return;
  obstacle.active = false;
  invulnTimer = 1.3;
  lives--;
  updateHUD();
  soundHit();
  shakeTime = 0.5;
  shakeIntensity = 0.35;
  if (lives === 1) {
    showDialogue("बेटा, होमवर्क कहाँ है?!");
  } else {
    const hitLine = DIALOGUE.hitLines[Math.floor(Math.random() * DIALOGUE.hitLines.length)];
    showDialogue(hitLine);
  }

  if (lives <= 0) {
    if (teacher) {
      teacher.position.z = 1.2;
      const pl = getActivePlayer();
      if (pl) teacher.position.x = pl.position.x;
      if (teacherParts.rightArm) {
        teacherParts.rightArm.position.y = 1.35;
        teacherParts.rightArm.rotation.set(-2.2, 0, 0.3);
      }
    }
    gameOver = true;
    started = false;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    isSpeaking = false;
    isJumping = false;
    isSliding = false;
    slideTimer = 0;
    playerCollisionHeight = 1.6;
    const pl = getActivePlayer();
    if (pl) pl.scale.y = 1.0;
    velocityY = 0;
    fallAngle = 0;
    soundGameOver();
    hideMessage();
    if (pauseEl) pauseEl.style.display = "none";
    if (gameOverEl) showGameOverScreen();
    return;
  }

  const msgs = ["अरे राम! ये भैंस कहाँ से आई?!", "हाय मेरी कमर!", "स्कूल है या ओलंपिक?!", "अरे! मेरा चश्मा!"];
  showMessage(msgs[Math.floor(Math.random() * msgs.length)]);
  setTimeout(hideMessage, 1250);
}

function updateObstacles(dt) {
  let nearest = null;
  const player = getActivePlayer();
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.z += OBSTACLE_SPEED * dt;
    obs.mesh.position.z = obs.z;
    const curve = obs.z < -20 ? obs.z * obs.z * 0.0004 : 0;

    if (obs.type === "crossing_buffalo") {
      obs.x += obs.crossDir * obs.crossSpeed * dt;
      obs.mesh.position.x = obs.x;
      obs.mesh.position.y = (obs.baseY || 0) - curve;
      if (Math.abs(obs.x) > 4.0) {
        obs.crossDir *= -1;
        obs.mesh.rotation.y = obs.crossDir > 0 ? Math.PI / 2 : -Math.PI / 2;
      }
    } else if (obs.type === "runaway_bag") {
      obs.bounce = (obs.bounce || 0) + dt * 8;
      obs.mesh.position.y = (0.2 + Math.abs(Math.sin(obs.bounce)) * 0.4) - curve;
      obs.mesh.rotation.y += dt * 3.5;
      obs.mesh.rotation.z = Math.sin(obs.bounce) * 0.2;
    } else {
      obs.mesh.position.x = LANE_X[obs.lane];
      obs.mesh.position.y = (obs.baseY || 0) - curve;
    }

    if (obs.z > RECYCLE_Z) {
      scene.remove(obs.mesh);
      obstacles.splice(i, 1);
      spawnObstacle();
      continue;
    }

    if (!obs.passed && obs.z > 2) {
      obs.passed = true;
      score += 10;
      updateHUD();
      if (obs.type === "bridge") showDialogue("river");
    }

    const dx = Math.abs(player.position.x - obs.mesh.position.x);
    const dz = Math.abs(player.position.z - obs.mesh.position.z);
    const dy = player.position.y - obs.mesh.position.y;

    if (obs.type === "runaway_bag") {
      if (dx < 1.2 && dz < 1.6 && !obs.collected) {
        obs.collected = true;
        coins += 5;
        scene.remove(obs.mesh);
        obstacles.splice(i, 1);
        soundCoin();
        updateHUD();
        showMessage("+5 Coins! Schoolbag Caught! 🎒");
        setTimeout(hideMessage, 1000);
        showDialogue("papaBag");
        continue;
      }
      continue;
    }

    const isBridge = obs.type === "bridge";
    const isBus = obs.type === "bus";
    const laneTol = isBridge ? 999 : 1.1;
    const zTol = isBridge ? 2.6 : (isBus ? 2.7 : 1.5);

    if (dx < laneTol && dz < zTol) {
      let hit = false;
      if (obs.type === "buffalo" || obs.type === "crossing_buffalo") {
        hit = dy < obs.hitHeight;
      } else if (obs.type === "mud") {
        hit = player.position.y < obs.hitHeight;
      } else if (obs.type === "bus") {
        hit = true; // cannot be jumped over; player must change lane
      } else if (obs.type === "low_bar") {
        hit = !isSliding || (player.position.y > GROUND_Y + 0.1); // hurts unless isSliding is true. Jumping hits it.
      } else {
        hit = player.position.y < obs.hitHeight;
      }
      if (hit) hitObstacle(obs);
    }
  }

  nextSpawn -= dt;
  if (nextSpawn <= 0 && obstacles.length < 6) {
    spawnObstacle();
    nextSpawn = SPAWN_INTERVAL + Math.random() * 1.5;
  }
}

function updateCoins(dt) {
  const player = getActivePlayer();
  for (let i = coinMeshes.length - 1; i >= 0; i--) {
    const c = coinMeshes[i];
    c.z += OBSTACLE_SPEED * dt;
    c.mesh.position.z = c.z;
    c.mesh.rotation.y += dt * 4;
    c.mesh.position.y = 1.0 + Math.sin(walkTime * 5 + c.z) * 0.12;
    if (c.z > RECYCLE_Z) {
      scene.remove(c.mesh);
      coinMeshes.splice(i, 1);
      continue;
    }
    const dx = Math.abs(player.position.x - c.mesh.position.x);
    const dz = Math.abs(player.position.z - c.mesh.position.z);
    if (dx < 1.2 && dz < 1.6 && !c.collected) {
      c.collected = true;
      if (c.kind === "chai") {
        lives = Math.min(3, lives + 1);
        showDialogue("chai");
      } else {
        coins++;
      }
      scene.remove(c.mesh);
      coinMeshes.splice(i, 1);
      soundCoin();
      updateHUD();
      coinHopTimer = COIN_HOP_DURATION;
      coinSmileTimer = COIN_SMILE_DURATION;
    }
  }
  if (Math.random() < 0.005 && coinMeshes.length < 4) spawnCoin();
}

function updateShake(dt) {
  if (shakeTime > 0) {
    shakeTime -= dt;
    const rx = (Math.random() - 0.5) * shakeIntensity;
    const ry = (Math.random() - 0.5) * shakeIntensity;
    const player = getActivePlayer();
    player.position.x = currentX + rx;
    player.position.y = GROUND_Y + ry;
    if (shakeTime <= 0) {
      shakeTime = 0;
      player.position.x = currentX;
      player.position.y = GROUND_Y;
    }
  }
}

function updateWalkAnimation(dt) {
  walkTime += dt;
  if (currentChapter === 2 && papaParts) {
    if (papaParts.frontWheel) papaParts.frontWheel.rotation.x += dt * RUN_SPEED * 2.5;
    if (papaParts.rearWheel) papaParts.rearWheel.rotation.x += dt * RUN_SPEED * 2.5;
    const pedalAngle = Math.sin(walkTime * 14) * 0.45;
    if (papaParts.boyLegL) papaParts.boyLegL.rotation.x = -0.35 + pedalAngle;
    if (papaParts.boyLegR) papaParts.boyLegR.rotation.x = 0.35 - pedalAngle;
    const lean = (targetX - currentX) * -0.15;
    if (papaCycle) papaCycle.rotation.z = lean + Math.sin(walkTime * 7) * 0.02;
    return;
  }
  if (!dadajiParts) return;
  const speed = 7;
  const swing = 0.55;
  const legSwing = Math.sin(walkTime * speed) * swing;
  const armSwing = -Math.sin(walkTime * speed) * swing;
  dadajiParts.leftLeg.rotation.z = -0.15 + legSwing;
  dadajiParts.rightLeg.rotation.z = 0.15 - legSwing;
  dadajiParts.leftArm.rotation.z = -0.3 + armSwing;
  dadajiParts.rightArm.rotation.z = 0.3 - armSwing;
}

function changeLane(dir) {
  if (gameOver) return;
  lane = Math.max(0, Math.min(2, lane + dir));
  targetX = LANE_X[lane];
}

function jump() {
  if (gameOver) return;
  if (isJumping) { jumpBuffer = 0.14; return; }
  isJumping = true;
  velocityY = JUMP_FORCE;
  soundJump();
}

function slide() {
  if (gameOver || paused || !started) return;
  isSliding = true;
  slideTimer = SLIDE_DURATION;
  playerCollisionHeight = 0.8;
  const p = getActivePlayer();
  if (p) p.scale.y = 0.5;
  if (isJumping || (p && p.position.y > GROUND_Y + 0.05)) {
    velocityY = -18;
  }
}

function initDust() {
  const g = new THREE.SphereGeometry(0.12, 6, 6);
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xd9c9a3, transparent: true, opacity: 0 }));
    m.visible = false;
    scene.add(m);
    dust.push({ mesh: m, life: 0 });
  }
}

function updateDust(dt, player) {
  dustTimer -= dt;
  if (dustTimer <= 0 && player.position.y <= GROUND_Y + 0.05 && winState === "playing") {
    dustTimer = 0.08;
    const d = dust.find((p) => p.life <= 0);
    if (d) {
      d.life = 0.5;
      d.mesh.position.set(player.position.x + (Math.random() - 0.5) * 0.4, 0.15, player.position.z + 0.5);
      d.mesh.visible = true;
    }
  }
  dust.forEach((p) => {
    if (p.life <= 0) return;
    p.life -= dt;
    p.mesh.position.z += RUN_SPEED * dt;
    p.mesh.position.y += dt * 1.2;
    const k = Math.max(0, p.life / 0.5);
    p.mesh.material.opacity = 0.6 * k;
    const sz = 0.6 + (1 - k);
    p.mesh.scale.set(sz, sz, sz);
    if (p.life <= 0) p.mesh.visible = false;
  });
}

function update(dt) {
  if (gameOver) return;

  // Camera follows the player a little and widens with speed.
  const cp = getActivePlayer();
  camera.position.x += (cp.position.x * 0.4 - camera.position.x) * Math.min(1, dt * 5);
  const targetFov = 45 + (RUN_SPEED - 14) * 0.45;
  if (Math.abs(camera.fov - targetFov) > 0.05) {
    camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 3);
    camera.updateProjectionMatrix();
  }
  camera.lookAt(camera.position.x * 0.6, 0.6, -10);

  if (winState === "gate") {
    if (gateMesh) {
      gateMesh.position.z += RUN_SPEED * dt;
      if (gateMesh.position.z > 4) {
        winState = "sign";
        gateMesh.position.z = 4;
        soundWin();
        showMessage("SCHOOL CLOSED: SUNDAY");
        setTimeout(() => {
          hideMessage();
          showMessage("आज रविवार है?! 😱");
        }, 1500);
        setTimeout(() => {
          hideMessage();
          rewardEl.style.display = "flex";
        }, 3200);
      }
    }
  }

  const player = getActivePlayer();
  jumpBuffer = Math.max(0, jumpBuffer - dt);
  if (isSliding) {
    slideTimer -= dt;
    if (slideTimer <= 0) {
      isSliding = false;
      slideTimer = 0;
      playerCollisionHeight = 1.6;
      if (player) player.scale.y = 1.0;
    }
  }
  if (invulnTimer > 0) {
    invulnTimer -= dt;
    player.visible = invulnTimer <= 0 || Math.floor(invulnTimer * 14) % 2 === 0;
  }
  updateDust(dt, player);

  if (hitReactionTimer > 0) {
    hitReactionTimer -= dt;
    if (hitReactionTimer < 0) hitReactionTimer = 0;
    if (currentChapter === 2 && papaParts) {
      if (papaParts.boyEyeL) papaParts.boyEyeL.scale.set(1.6, 1.6, 1.6);
      if (papaParts.boyEyeR) papaParts.boyEyeR.scale.set(1.6, 1.6, 1.6);
      if (papaParts.boyMouth) papaParts.boyMouth.scale.set(1.4, 1.6, 1.2);
      if (papaParts.boyArmL) papaParts.boyArmL.rotation.z = -0.8;
      if (papaParts.boyArmR) papaParts.boyArmR.rotation.z = 0.8;
    } else if (dadajiParts) {
      if (dadajiParts.leftEye) dadajiParts.leftEye.scale.set(1.6, 1.6, 1.6);
      if (dadajiParts.rightEye) dadajiParts.rightEye.scale.set(1.6, 1.6, 1.6);
      if (dadajiParts.leftEyebrow) dadajiParts.leftEyebrow.position.y = 0.20;
      if (dadajiParts.rightEyebrow) dadajiParts.rightEyebrow.position.y = 0.20;
      if (dadajiParts.mouth) dadajiParts.mouth.scale.set(1.4, 1.6, 1.2);
      if (dadajiParts.leftArm) {
        dadajiParts.leftArm.position.y = 1.25;
        dadajiParts.leftArm.rotation.set(-0.2, 0, -2.4);
      }
      if (dadajiParts.rightArm) {
        dadajiParts.rightArm.position.y = 1.25;
        dadajiParts.rightArm.rotation.set(-0.2, 0, 2.4);
      }
      walkTime += dt;
      const speed = 7;
      const swing = 0.55;
      const legSwing = Math.sin(walkTime * speed) * swing;
      dadajiParts.leftLeg.rotation.z = -0.15 + legSwing;
      dadajiParts.rightLeg.rotation.z = 0.15 - legSwing;
    }
  } else {
    if (currentChapter === 2 && papaParts) {
      if (papaParts.boyEyeL) papaParts.boyEyeL.scale.set(1, 1, 1);
      if (papaParts.boyEyeR) papaParts.boyEyeR.scale.set(1, 1, 1);
      if (papaParts.boyArmL) papaParts.boyArmL.rotation.set(-1.1, 0, -0.4);
      if (papaParts.boyArmR) papaParts.boyArmR.rotation.set(-1.1, 0, 0.4);
    } else if (dadajiParts) {
      if (dadajiParts.leftEye) dadajiParts.leftEye.scale.set(1, 1, 1);
      if (dadajiParts.rightEye) dadajiParts.rightEye.scale.set(1, 1, 1);
      if (dadajiParts.leftEyebrow) dadajiParts.leftEyebrow.position.y = 0.17;
      if (dadajiParts.rightEyebrow) dadajiParts.rightEyebrow.position.y = 0.17;
      if (dadajiParts.leftArm) {
        dadajiParts.leftArm.position.y = 0.98;
        dadajiParts.leftArm.rotation.x = 0;
        dadajiParts.leftArm.rotation.y = 0;
      }
      if (dadajiParts.rightArm) {
        dadajiParts.rightArm.position.y = 0.98;
        dadajiParts.rightArm.rotation.x = 0;
        dadajiParts.rightArm.rotation.y = 0;
      }
    }
    updateWalkAnimation(dt);
  }

  updateTeacher(dt);
  updateShake(dt);
  updateBubble(dt);

  if (fallbackSpeechTimer > 0) {
    fallbackSpeechTimer -= dt;
    if (fallbackSpeechTimer < 0) fallbackSpeechTimer = 0;
  }

  const speakingNow = (isSpeaking || fallbackSpeechTimer > 0) && hitReactionTimer <= 0 && coinSmileTimer <= 0;

  if (hitReactionTimer <= 0) {
    if (coinSmileTimer > 0) {
      coinSmileTimer -= dt;
      if (coinSmileTimer < 0) coinSmileTimer = 0;
      if (currentChapter === 2 && papaParts && papaParts.boyMouth) {
        papaParts.boyMouth.scale.set(1.9, 1.5, 1.2);
      } else if (dadajiParts && dadajiParts.mouth) {
        dadajiParts.mouth.scale.set(1.9, 1.5, 1.2);
      }
    } else if (speakingNow) {
      const mouthScale = 1.1 + Math.sin(performance.now() * 0.02) * 0.5;
      if (currentChapter === 2 && papaParts && papaParts.boyMouth) {
        papaParts.boyMouth.scale.set(1.4, mouthScale, 1.2);
      } else if (dadajiParts && dadajiParts.mouth) {
        dadajiParts.mouth.scale.set(1.4, mouthScale, 1.2);
      }
    } else {
      if (currentChapter === 2 && papaParts && papaParts.boyMouth) {
        papaParts.boyMouth.scale.set(1, 1, 1);
      } else if (dadajiParts && dadajiParts.mouth) {
        dadajiParts.mouth.scale.set(1, 1, 1);
      }
    }
  }

  // Show the face to the camera during reactions or speech
  const showFace = hitReactionTimer > 0 || coinSmileTimer > 0 || speakingNow;
  if (currentChapter === 2 && papaParts && papaParts.boyHead) papaParts.boyHead.rotation.y = showFace ? Math.PI : 0;
  else if (dadajiParts && dadajiParts.head) dadajiParts.head.rotation.y = showFace ? Math.PI : 0;

  let hopOffset = 0;
  if (coinHopTimer > 0) {
    coinHopTimer -= dt;
    if (coinHopTimer < 0) coinHopTimer = 0;
    const progress = 1 - (coinHopTimer / COIN_HOP_DURATION);
    hopOffset = Math.sin(progress * Math.PI) * 0.45;
  }

  groundSegments.forEach((seg) => {
    seg.position.z += RUN_SPEED * dt;
    if (seg.position.z > 14) seg.position.z = -330;
  });

  roadDashes.forEach((dash) => {
    dash.position.z += RUN_SPEED * dt;
    if (dash.position.z > 14) dash.position.z -= 360;
  });

  buildings.forEach((b) => {
    b.z += RUN_SPEED * dt;
    if (b.z > 14) b.z -= 360;
    b.mesh.position.z = b.z;
    const curve = b.z < -20 ? b.z * b.z * 0.0004 : 0;
    b.mesh.position.y = (b.baseY || 0) - curve;
  });

  scenery.forEach((s) => {
    s.z += RUN_SPEED * dt;
    if (s.z > 14) s.z -= 360;
    s.mesh.position.z = s.z;
    const curve = s.z < -20 ? s.z * s.z * 0.0004 : 0;
    s.mesh.position.y = (s.baseY || 0) - curve;
  });

  clouds.forEach((c) => {
    c.position.z += RUN_SPEED * dt * 0.3;
    if (c.position.z > 20) c.position.z = -120;
  });

  laneLines.forEach((line) => {
    line.position.z += RUN_SPEED * dt;
    if (line.position.z > 14) line.position.z = -330;
  });

  if (shakeTime <= 0 && winState !== "sign" && winState !== "reward" && winState !== "papaWin") {
    currentX += (targetX - currentX) * LANE_SPEED * dt;
    if (Math.abs(targetX - currentX) < 0.01) currentX = targetX;
    player.position.x = currentX;
  }

  if (isJumping) {
    velocityY += GRAVITY * dt;
    player.position.y += velocityY * dt;
    if (currentChapter === 2 && papaCycle) {
      papaCycle.rotation.x = -0.18;
    }
    if (player.position.y <= GROUND_Y) {
      player.position.y = GROUND_Y;
      if (currentChapter === 2 && papaCycle) papaCycle.rotation.x = 0;
      velocityY = 0;
      isJumping = false;
      if (jumpBuffer > 0) { jumpBuffer = 0; jump(); }
    }
  } else if (shakeTime <= 0) {
    player.position.y = GROUND_Y + hopOffset;
    if (currentChapter === 2 && papaCycle) papaCycle.rotation.x = 0;
  }

  if (winState === "playing") {
    if (currentChapter === 2) {
      score += RUN_SPEED * dt;
      papaTimer -= dt;
      updateHUD();
      updateObstacles(dt);
      updateCoins(dt);
      if (!gameOver && papaTimer <= 0) {
        papaTimer = 0;
        finishPapaLevel();
      }
    } else if (levelTransitioning) {
      levelTransitionTimer -= dt;
      if (levelTransitionTimer <= 0) startNextLevel();
    } else {
      score += RUN_SPEED * dt;
      levelTimeLeft -= dt;
      updateHUD();
      updateObstacles(dt);
      updateCoins(dt);
      if (!gameOver && levelTimeLeft <= 0) {
        levelTimeLeft = 0;
        finishLevel();
      }
    }
  }
}

function clearWorld() {
  obstacles.forEach((o) => scene.remove(o.mesh));
  obstacles.length = 0;
  coinMeshes.forEach((c) => scene.remove(c.mesh));
  coinMeshes.length = 0;
}

function applyLevel(showLine) {
  const th = currentTheme();
  const mult = Math.pow(1.1, currentLevel - 1);
  RUN_SPEED = 14 * mult;
  OBSTACLE_SPEED = 14 * mult;
  if (groundSegments[0]) groundSegments[0].material.color.setHex(th.ground);
  updateSkyAndLighting(th);
  levelTimeLeft = LEVEL_SECONDS;
  if (showLine) showDialogue("level" + currentLevel);
  updateHUD();
}

function finishLevel() {
  clearWorld();
  if (currentLevel >= LEVEL_COUNT) {
    winState = "gate";
    createSchoolGate();
    return;
  }
  levelTransitioning = true;
  levelTransitionTimer = 2;
  soundCoin();
  showMessage(currentTheme().msg);
}

function startNextLevel() {
  currentLevel++;
  levelTransitioning = false;
  hideMessage();
  applyLevel(true);
  createObstacles();
  for (let i = 0; i < 3; i++) spawnCoin();
}

function updateGameOver(dt) {
  const gp = getActivePlayer();
  if (gp) gp.visible = true;
  if (currentChapter === 2) {
    if (!papaCycle) return;
    if (fallAngle < Math.PI / 2) {
      fallAngle = Math.min(Math.PI / 2, fallAngle + dt * 4.5);
      papaCycle.rotation.z = fallAngle;
      papaCycle.position.y = Math.max(0.18, GROUND_Y - (fallAngle / (Math.PI / 2)) * 0.27);
    } else {
      papaCycle.rotation.z = Math.PI / 2;
      papaCycle.position.y = 0.18;
    }
    if (papaParts && papaParts.boyHead) papaParts.boyHead.rotation.y = Math.PI;
    if (papaParts && papaParts.boyEyeL && papaParts.boyEyeR) {
      papaParts.boyEyeL.scale.set(1.6, 1.6, 1.6);
      papaParts.boyEyeR.scale.set(1.6, 1.6, 1.6);
    }
    if (teacher) {
      teacher.position.z += (1.2 - teacher.position.z) * Math.min(1, dt * 5);
      if (teacherParts.rightArm) {
        teacherParts.rightArm.position.y = 1.35;
        teacherParts.rightArm.rotation.set(-2.2, 0, 0.3);
      }
    }
    updateBubble(dt);
    return;
  }
  if (!dadaji) return;
  if (fallAngle < Math.PI / 2) {
    fallAngle = Math.min(Math.PI / 2, fallAngle + dt * 4.5);
    dadaji.rotation.x = fallAngle;
    dadaji.position.y = Math.max(0.18, GROUND_Y - (fallAngle / (Math.PI / 2)) * 0.27);
  } else {
    dadaji.rotation.x = Math.PI / 2;
    dadaji.position.y = 0.18;
  }
  if (dadajiParts) {
    if (dadajiParts.head) dadajiParts.head.rotation.y = Math.PI;
    if (dadajiParts.leftEye) dadajiParts.leftEye.scale.set(1.6, 1.6, 1.6);
    if (dadajiParts.rightEye) dadajiParts.rightEye.scale.set(1.6, 1.6, 1.6);
    if (dadajiParts.leftEyebrow) dadajiParts.leftEyebrow.position.y = 0.20;
    if (dadajiParts.rightEyebrow) dadajiParts.rightEyebrow.position.y = 0.20;
    if (dadajiParts.leftArm) {
      dadajiParts.leftArm.position.y = 1.25;
      dadajiParts.leftArm.rotation.set(-0.2, 0, -2.4);
    }
    if (dadajiParts.rightArm) {
      dadajiParts.rightArm.position.y = 1.25;
      dadajiParts.rightArm.rotation.set(-0.2, 0, 2.4);
    }
  }
  if (teacher) {
    teacher.position.z += (1.2 - teacher.position.z) * Math.min(1, dt * 5);
    if (teacherParts.rightArm) {
      teacherParts.rightArm.position.y = 1.35;
      teacherParts.rightArm.rotation.set(-2.2, 0, 0.3);
    }
  }
  updateBubble(dt);
}

function initThree() {
  scene = new THREE.Scene();
  scene.background = null;
  scene.fog = new THREE.FogExp2(0xd9b48f, 0.0085);

  camera = new THREE.PerspectiveCamera(
    45,
    canvas.clientWidth / canvas.clientHeight || 16 / 9,
    0.1,
    2500
  );
  camera.position.set(0, 4, 8);
  camera.lookAt(0, 0, -10);

  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  createDadaji();
  createPapaCycle();
  createTeacher();
  createGround();
  createBuildings();
  createScenery();
  createHUD();
  createRewardScreen();

  const hemi = new THREE.HemisphereLight(0xdff3ff, 0x4e5737, 0.9);
  hemiLight = hemi;
  scene.add(hemi);

  const dirLight = new THREE.DirectionalLight(0xfff0d1, 1.25);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(1024, 1024);
  dirLight.shadow.bias = -0.0005;
  const sc = dirLight.shadow.camera;
  sc.left = -8; sc.right = 8; sc.top = 10; sc.bottom = -10; sc.near = 1; sc.far = 80;
  scene.add(dirLight);
  scene.add(dirLight.target);
  mainDirLight = dirLight;

  sunVector = new THREE.Vector3();
  if (typeof THREE.Sky === "function") {
    sky = new THREE.Sky();
    sky.scale.setScalar(2000);
    scene.add(sky);
  } else {
    // Sky.js failed to load: fall back to a plain sky color
    scene.background = new THREE.Color(0x87ceeb);
  }

  updateSkyAndLighting(LEVEL_THEMES[0]);
  initDust();

  window.addEventListener("resize", onResize);
  window.addEventListener("keydown", onKeyDown);
  canvas.addEventListener("touchstart", onTouchStart, { passive: false });
  canvas.addEventListener("touchmove", onTouchMove, { passive: false });
  canvas.addEventListener("touchend", onTouchEnd, { passive: false });

  function animateLoop() {
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    if (started && !gameOver && !paused) {
      update(dt);
    } else if (gameOver) {
      updateGameOver(dt);
    }
    const p = getActivePlayer();
    if (mainDirLight && p && sunVector) {
      mainDirLight.target.position.set(p.position.x, GROUND_Y, p.position.z);
      mainDirLight.target.updateMatrixWorld();
      mainDirLight.position.set(
        p.position.x + sunVector.x * 40,
        GROUND_Y + Math.max(6, sunVector.y * 40),
        p.position.z + sunVector.z * 40
      );
    }
    if (sky && camera) {
      sky.position.copy(camera.position);
    }
    requestAnimationFrame(animateLoop);
    renderer.render(scene, camera);
  }
  animateLoop();
}

function onResize() {
  if (!camera || !renderer) return;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(width, height);
}

function onKeyDown(e) {
  if (!started) return;
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key)) e.preventDefault();
  if (e.key === "p" || e.key === "P" || e.key === "Escape") { togglePause(); return; }
  if (paused) return;
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") changeLane(-1);
  else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") changeLane(1);
  else if (e.key === "ArrowUp" || e.key === " " || e.key === "w" || e.key === "W") jump();
  else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") slide();
}

let swipeDone = false;
function onTouchStart(e) {
  if (!started || paused) return;
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
  swipeDone = false;
}

// Swipes react immediately while the finger moves, not only when it lifts.
function onTouchMove(e) {
  if (!started || paused || swipeDone) return;
  const t = e.touches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 28) return;
  swipeDone = true;
  if (Math.abs(dx) > Math.abs(dy)) changeLane(dx > 0 ? 1 : -1);
  else if (dy < 0) jump();
  else if (dy > 0) slide();
}

// A short tap also jumps.
function onTouchEnd(e) {
  if (!started || paused || swipeDone) return;
  const t = e.changedTouches[0];
  if (Math.hypot(t.clientX - touchStartX, t.clientY - touchStartY) < 15) jump();
}

bestDistance = readSavedStat("dadaji-best-distance");
bestCoins = readSavedStat("dadaji-best-coins");
muted = readSavedStat("dadaji-muted", 0) === 1;
savePlayerStats(true);

startBtn.addEventListener("click", () => {
  ensureAudio();
  try {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const unlock = new SpeechSynthesisUtterance("");
      window.speechSynthesis.speak(unlock);
    }
  } catch (e) {}
  started = true;
  if (gameOverEl) gameOverEl.style.display = "none";
  if (pauseEl) pauseEl.style.display = "none";
  paused = false;
  isSliding = false;
  slideTimer = 0;
  playerCollisionHeight = 1.6;
  loadingScreen.classList.add("hidden");
  if (teacher) {
    teacher.visible = true;
    teacher.position.set(0, GROUND_Y, 6.0);
    if (teacherParts.rightArm) {
      teacherParts.rightArm.position.y = 1.22;
      teacherParts.rightArm.rotation.set(0, 0, 0);
    }
  }
  applyLevel(false);
  createObstacles();
  for (let i = 0; i < 3; i++) spawnCoin();
  showDialogue("start");
  setTimeout(() => showDialogue("level1"), 4500);
});

try {
  initThree();
} catch (error) {
  console.error("3D game initialization failed:", error);
  if (progressText) progressText.textContent = "3D graphics could not start. Try Chrome/Edge with WebGL enabled.";
  if (startBtn) { startBtn.disabled = true; startBtn.textContent = "3D graphics unavailable"; }
}

if (
  typeof screen !== "undefined" &&
  screen.orientation &&
  typeof screen.orientation.lock === "function"
) {
  screen.orientation.lock("portrait").catch(() => {});
}
