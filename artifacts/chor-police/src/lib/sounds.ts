import { Howl } from "howler";

export const sounds = {
  cardFlip: new Howl({ src: ["https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3"], volume: 0.7 }),
  correct:  new Howl({ src: ["https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3"], volume: 0.8 }),
  wrong:    new Howl({ src: ["https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3"], volume: 0.8 }),
  join:     new Howl({ src: ["https://assets.mixkit.co/active_storage/sfx/2207/2207-preview.mp3"], volume: 0.6 }),
  win:      new Howl({ src: ["https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3"], volume: 0.9 }),
  chat:     new Howl({ src: ["https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3"], volume: 0.5 }),
  tick:     new Howl({ src: ["https://assets.mixkit.co/active_storage/sfx/2073/2073-preview.mp3"], volume: 0.4 }),
};

export function playSound(name: keyof typeof sounds) {
  try { sounds[name].play(); } catch {}
}
