'use strict';

const REFERENCE_FREQ = 440; // 基準ピッチ A4
const OCTAVE_LAYERS = 9;    // 1音を重ねる倍音レイヤー数
const MAX_GAIN = 0.1;

// 音名 → A4(440Hz) からの半音数。G#0 は基準 A の半音下。
const SEMITONES = {
  'G#0': -1,
  A: 0, 'A#': 1, B: 2, C: 3, 'C#': 4, D: 5, 'D#': 6, E: 7, F: 8, 'F#': 9, G: 10, 'G#': 11,
  A2: 12, 'A2#': 13, B2: 14, C2: 15, 'C2#': 16, D2: 17, 'D2#': 18, E2: 19, F2: 20, 'F2#': 21, G2: 22, 'G2#': 23,
  A3: 24, 'A3#': 25, B3: 26, C3: 27, 'C3#': 28,
};

// キー → 音名(MacBook US配列)。上段と下段でオクターブが重なり無限音階になる。
const keyToNote = new Map([
  // 上段: アルファベット段が白鍵、数字段が黒鍵
  ['1', 'G#0'],
  ['q', 'A'], ['2', 'A#'], ['w', 'B'], ['e', 'C'], ['4', 'C#'], ['r', 'D'], ['5', 'D#'], ['t', 'E'],
  ['y', 'F'], ['7', 'F#'], ['u', 'G'], ['8', 'G#'], ['i', 'A2'], ['9', 'A2#'], ['o', 'B2'], ['p', 'C2'],
  ['-', 'C2#'], ['[', 'D2'], ['=', 'D2#'], [']', 'E2'], ['\\', 'F2'],
  // 下段: 上段とオクターブが重なる
  ['a', 'G#'],
  ['z', 'A2'], ['s', 'A2#'], ['x', 'B2'], ['c', 'C2'], ['f', 'C2#'], ['v', 'D2'], ['g', 'D2#'], ['b', 'E2'],
  ['n', 'F2'], ['j', 'F2#'], ['m', 'G2'], ['k', 'G2#'], [',', 'A3'], ['l', 'A3#'], ['.', 'B3'], ['/', 'C3'], ["'", 'C3#'],
]);

// 音名から基準周波数を求める(平均律)
const noteFrequency = (note) => REFERENCE_FREQ * 2 ** (SEMITONES[note] / 12);

// 440Hz から離れるほど小さくなる釣鐘状のゲイン(シェパードトーン)
const layerGain = (freq) => 2 ** -Math.abs(Math.log2(freq / REFERENCE_FREQ)) * MAX_GAIN;

// 音名 → 各レイヤーの { gain, level }。最初のクリックまでは null。
let voices = null;

// 最初のクリックで一度だけ AudioContext と全オシレータを用意する
const start = () => {
  const ctx = new AudioContext();
  voices = new Map();

  for (const note of new Set(keyToNote.values())) {
    const freq = noteFrequency(note);
    const layers = [];
    for (let layer = 0; layer < OCTAVE_LAYERS; layer++) {
      const frequency = (freq * 4 ** layer) / 16;
      const gain = new GainNode(ctx, { gain: 0 });
      const osc = new OscillatorNode(ctx, { frequency });
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      layers.push({ gain, level: layerGain(frequency) });
    }
    voices.set(note, layers);
  }
};

const setVoiceActive = (note, active) => {
  const layers = voices?.get(note);
  if (!layers) return;
  for (const { gain, level } of layers) {
    gain.gain.value = active ? level : 0;
  }
};

const onKey = (active) => (e) => {
  const note = keyToNote.get(e.key);
  if (!note) return;
  e.preventDefault();
  setVoiceActive(note, active);
};

document.addEventListener('keydown', onKey(true));
document.addEventListener('keyup', onKey(false));
document.addEventListener('mousedown', start, { once: true });
