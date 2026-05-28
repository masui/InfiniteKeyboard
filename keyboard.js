'use strict';

// 物理キーと音名の対応。同じ音名を複数のキーが共有することで、
// 高いオクターブと低いオクターブが滑らかに繋がる(無限音階)。
const KEYS = [
  'q', '2', 'w', 'e', '4', 'r', '5', 't', 'y', '7', 'u', '8', 'i', '9', 'o', 'p',
  'z', 's', 'x', 'c', 'f', 'v', 'g', 'b', 'n', 'j', 'm', 'k', ',', 'l', '.', '/',
];

const NOTES = [
  'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A2', 'A2#', 'B2', 'C2',
  'A2', 'A2#', 'B2', 'C2', 'C2#', 'D2', 'D2#', 'E2', 'F2', 'F2#', 'G2', 'G2#', 'A3', 'A3#', 'B3', 'C3', 'C3#',
];

const REFERENCE_FREQ = 440; // 基準ピッチ A4
const OCTAVE_LAYERS = 9;    // 1音を重ねる倍音レイヤー数
const MAX_GAIN = 0.1;

// 音名のインデックスから基準周波数を求める(平均律)
const noteFrequency = (index) =>
  index < 16
    ? REFERENCE_FREQ * 2 ** (index / 12)
    : REFERENCE_FREQ * 2 ** ((index - 4) / 12);

// キー文字 → 音名
const keyToNote = new Map(KEYS.map((key, i) => [key, NOTES[i]]));

// 440Hz から離れるほど小さくなる釣鐘状のゲイン(シェパードトーン)
const layerGain = (freq) => 2 ** -Math.abs(Math.log2(freq / REFERENCE_FREQ)) * MAX_GAIN;

// 音名 → 各レイヤーの { gain, level }。最初のクリックまでは null。
let voices = null;

// 最初のクリックで一度だけ AudioContext と全オシレータを用意する
const start = () => {
  const ctx = new AudioContext();
  voices = new Map();

  NOTES.forEach((note, index) => {
    if (voices.has(note)) return; // 重複する音名は一度だけ生成

    const freq = noteFrequency(index);
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
  });
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
