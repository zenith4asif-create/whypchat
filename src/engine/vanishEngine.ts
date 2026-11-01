import {
  BLOCK_SVG,
  DL_SVG,
  DOTS_SVG,
  EMOJI_DATA,
  EMOJI_PACKS,
  EYE_SVG,
  FLAG_SVG,
  GIF_ACTIONS,
  MSG_SVG,
  PALETTE,
  PAUSE_SVG,
  PLAY_SVG,
  PLUS_SVG,
  REACTS,
  REPLY_SVG,
  RE_SVG,
  SMILE_SVG,
  STICKERS,
  ST_BGS,
  TRASH_SVG,
  TTL_OPTIONS,
} from '../data/emojiData';
import { createMediaStudio, transformCloudinaryVideoUrl } from './mediaStudio';
import { createProfileExperience } from './profileCard';

declare global {
  interface Window {
    firebase: any;
    VanishAndroid?: any;
    EMOJI_DATA?: any;
    VCMotion?: any;
    VCPush?: any;
    vcSwipeSens?: number;
    openCustomize?: () => void;
    openAvatarCrop?: (file: File, cb: (blob: Blob) => void) => void;
    openPhotoCrop?: (file: File, cb: (newFile: File) => void) => void;
    directSendMedia?: (f: File, kind?: string) => void;
    applyAmbient?: (el: HTMLElement, ch: string, ampK?: number, durK?: number) => void;
    __notifyPermResult?: (ok: boolean) => void;
    __openFromNotify?: (uid: string) => void;
    __onNativeGif?: (b64: string, mime?: string) => void;
    __onKeyboardMedia?: (dataUrl: string) => void;
    __pollKeyboardGif?: () => void;
    __openNativeGifPicker?: () => void;
    __openAttach?: () => void;
    __openEmoji?: () => void;
    __startVoice?: () => void;
    __nativeSendText?: (text: string) => void;
    __openGifLibrary?: () => void;
    __handleBack?: () => boolean;
  }
}

let engineBooted = false;

export function initVanishEngine(): void {
  if (engineBooted) return;
  engineBooted = true;

  window.EMOJI_DATA = EMOJI_DATA;

  const firebase = window.firebase;
  const NATIVE =
    typeof window.VanishAndroid !== 'undefined' ||
    String(navigator.userAgent).indexOf('VanishChats/') !== -1;
  if (NATIVE) document.documentElement.classList.add('native-app');

  const $ = <T extends HTMLElement = HTMLElement>(s: string): T | null =>
    document.querySelector(s) as T | null;

  const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

  const firebaseConfig = {
    apiKey: 'AIzaSyACl9gSrNtkr5O0oLfYQeCIV8OaXbsRrh0',
    authDomain: 'thio-82063.firebaseapp.com',
    databaseURL: 'https://thio-82063-default-rtdb.firebaseio.com',
    projectId: 'thio-82063',
    storageBucket: 'thio-82063.firebasestorage.app',
    messagingSenderId: '458356046416',
    appId: '1:458356046416:web:fb5539ac71cb4de875af55',
    measurementId: 'G-6YD9BSMSYY',
  };
  const CLOUD = 'ewh6rlvy';
  const UPLOAD_PRESET = 'vanish_unsigned';
  const MAX_MB = 60;

  const TTL = 40000;
  const MIN_TTL = 10000;
  const ST_TTL = 12 * 3600 * 1000;
  const RING_C = 2 * Math.PI * 6;
  const DEFAULT_BIO = 'I am using Vanish Chats';

  let db: any = null;
  let auth: any = null;
  let serverOffset = 0;
  let myUid: string | null = null;
  let myProfile: { uid: string; name: string; email: string; bio: string; photoURL?: string } | null = null;
  let usersMap: Record<string, any> = {};
  let usersLoaded = false;
  let peerUid: string | null = null;
  let peerName = '';
  let chatId: string | null = null;
  let msgQuery: any = null;
  let msgBase: any = null;
  let searchQ = '';
  let activeFilter: 'all' | 'online' | 'unread' = 'all';
  let lastTs = 0;
  let lastBubbleFrom: string | null = null;
  let lastBubbleTime = 0;
  let replyTarget: { id: string; n: string; t: string } | null = null;
  let reactKey: string | null = null;
  let profUid: string | null = null;
  let sideTab: 'chats' | 'explore' = 'chats';
  let typingT: any = null;
  let headTick: any = null;
  let statuses: Record<string, any> = {};
  let seenMap: Record<string, any> = {};
  let lbList: [string | null, any][] = [];
  let lbIdx = 0;
  let lbZoom = 1;
  let lbTx = 0;
  let lbTy = 0;
  const vpSpeeds = [1, 1.5, 1.75, 2, 3];
  let storyOwner: string | null = null;
  let storyIds: any[] = [];
  let storyIdx = 0;
  let stTimer: any = null;
  let stPaused = false;
  let stVid: HTMLVideoElement | null = null;
  let mediaStudio: ReturnType<typeof createMediaStudio> | null = null;
  let profileUI: ReturnType<typeof createProfileExperience> | null = null;
  let rec: any = null;
  let recChunks: BlobPart[] = [];
  let recT0 = 0;
  let recTimer: any = null;
  let recStream: MediaStream | null = null;
  let shieldEnabled = true;
  try {
    shieldEnabled = localStorage.getItem('vc_shield') !== 'off';
  } catch (_) {}

  const live = new Map<string, any>();
  const audioPool = new Set<HTMLAudioElement>();
  const unreadCounts: Record<string, number> = {};
  try {
    Object.assign(unreadCounts, JSON.parse(localStorage.getItem('vc_unread') || '{}'));
  } catch (_) {}

  function saveUnread() {
    try {
      localStorage.setItem('vc_unread', JSON.stringify(unreadCounts));
    } catch (_) {}
  }

  let hadSession = false;
  try {
    hadSession =
      localStorage.getItem('vanishSession') === '1' ||
      localStorage.getItem('vanishSeen') === '1';
  } catch (_) {}
  if (hadSession) document.documentElement.classList.add('returning');

  function persistSession(on: boolean) {
    try {
      if (on) {
        localStorage.setItem('vanishSession', '1');
        localStorage.setItem('vanishSeen', '1');
        document.documentElement.classList.add('returning');
      } else {
        localStorage.removeItem('vanishSession');
      }
    } catch (_) {}
  }

  function show(id: string) {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.toggle('active', s.id === id);
    });
  }

  function showAuth() {
    try {
      if (localStorage.getItem('vanishSeen') === '1') {
        document.documentElement.classList.add('returning');
      }
    } catch (_) {}
    show('authScreen');
  }

  setTimeout(() => {
    const boot = $('#bootScreen');
    if (!myUid && boot && boot.classList.contains('active')) showAuth();
  }, 3800);

  const now = () => Date.now() + serverOffset;
  const myTTL = () => (((usersMap[myUid || ''] || {}).selfDestruct) || 40) * 1000;
  function fmtTTL(s: number) {
    if (s < 60) return s + 's';
    if (s % 3600 === 0) return s / 3600 + 'h';
    if (s % 60 === 0) return s / 60 + 'm';
    return s + 's';
  }
  const initial = (n?: string) => (String(n || '?').trim()[0] || '?').toUpperCase();
  const firstName = (n?: string) => String(n || '').split(' ')[0] || 'User';

  function hashColor(s: string) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h * 31) + s.charCodeAt(i)) >>> 0;
    return PALETTE[h % PALETTE.length];
  }

  function hashStr(s: string) {
    let h = 7;
    for (const c of String(s)) h = ((h * 131) + c.charCodeAt(0)) >>> 0;
    return h;
  }

  function paintAv(el: HTMLElement | null, uid: string | null, name?: string) {
    if (!el) return;
    const u = (uid && usersMap[uid]) || (uid === myUid && myProfile) || {};
    const photo = u.photoURL || '';
    [...el.childNodes].forEach(n => {
      if (n.nodeType === 3) n.remove();
    });
    if (photo) {
      el.classList.add('hasimg');
      el.style.backgroundImage = `url(${photo})`;
      el.style.backgroundColor = '';
    } else {
      el.classList.remove('hasimg');
      el.style.backgroundImage = '';
      el.style.background = hashColor((name || '?') + (uid || ''));
      el.insertBefore(document.createTextNode(initial(name)), el.firstChild);
    }
  }

  const fmtTime = (t: number) =>
    new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  function fmtDate(t?: number) {
    return t
      ? new Date(t).toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : '—';
  }
  function fmtShort(t: number) {
    const d = new Date(t);
    const td = new Date();
    return d.toDateString() === td.toDateString()
      ? fmtTime(t)
      : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  }
  function fmtDur(sec: number) {
    sec = Math.round(sec || 0);
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }
  function fmtAgo(t: number) {
    const d = now() - t;
    if (d < 60e3) return 'just now';
    if (d < 3600e3) return Math.floor(d / 60e3) + 'm ago';
    return Math.floor(d / 36e5) + 'h ago';
  }
  function fmtSeen(t?: number) {
    if (!t) return 'offline';
    const d = Date.now() - t;
    if (d < 60e3) return 'last seen just now';
    if (d < 3600e3) return 'last seen ' + Math.floor(d / 60e3) + 'm ago';
    if (d < 86400e3) return 'last seen ' + Math.floor(d / 36e5) + 'h ago';
    return 'last seen ' + new Date(t).toLocaleDateString();
  }
  function maskEmail(e?: string) {
    if (!e) return 'Private account';
    const at = e.indexOf('@');
    if (at < 1) return '•••••';
    return e[0] + '•••••' + e.slice(at);
  }

  let toastTimer: any = null;
  function toast(m: string) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = m;
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('on'), 2700);
  }

  /* Custom Glass Confirm Modal (avoids window.confirm in iframe) */
  function askConfirm(
    title: string,
    message: string,
    confirmLabel = 'Confirm',
    danger = false
  ): Promise<boolean> {
    return new Promise(resolve => {
      const modal = $('#confirmModal');
      const titleEl = $('#confirmTitle');
      const msgEl = $('#confirmMsg');
      const okBtn = $('#confirmOk');
      const cancelBtn = $('#confirmCancel');
      if (!modal || !titleEl || !msgEl || !okBtn || !cancelBtn) {
        resolve(true);
        return;
      }
      titleEl.textContent = title;
      msgEl.textContent = message;
      okBtn.textContent = confirmLabel;
      okBtn.classList.toggle('danger', danger);
      modal.hidden = false;

      const cleanup = (val: boolean) => {
        modal.hidden = true;
        okBtn.onclick = null;
        cancelBtn.onclick = null;
        modal.onclick = null;
        resolve(val);
      };
      okBtn.onclick = () => cleanup(true);
      cancelBtn.onclick = () => cleanup(false);
      modal.onclick = e => {
        if (e.target === modal) cleanup(false);
      };
    });
  }

  function ticksSVG(st: string) {
    const dbl =
      '<path d="M2 9.5l4.4 4.4L15.6 5"/><path d="M11.2 13.6l1.5 1.5L22 5.5"/>';
    if (st === 'read')
      return (
        '<svg class="tk read" viewBox="0 0 26 18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' +
        dbl +
        '</svg>'
      );
    if (st === 'delivered')
      return (
        '<svg class="tk" viewBox="0 0 26 18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' +
        dbl +
        '</svg>'
      );
    return '<svg class="tk" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.8l4.2 4.2L15.4 4.6"/></svg>';
  }

  function mediaLabel(v: any) {
    if (v.type === 'photo') return '📷 Photo';
    if (v.type === 'video') return '🎬 Video';
    if (v.type === 'gif') return '🎞️ GIF';
    if (v.type === 'voice') return '🎤 Voice message';
    if (v.type === 'sticker') return ((STICKERS[v.code] || {}).m || '🏷️') + ' Sticker';
    if (v.type === 'emoji') return (v.e || '😀') + ' Emoji';
    return String(v.text || '');
  }

  /* Live Emoji Motion Engine */
  const R = (a: number, b: number) => (c: number) => c >= a && c <= b;
  const motionRules: [string, (c: number) => boolean][] = [
    ['beat', c => R(0x1f493, 0x1f49f)(c) || [0x2764, 0x1f90d, 0x1f90e, 0x1f9e1, 0x1f5a4, 0x2763, 0x1f48b, 0x1f48c, 0x1f60d, 0x1f970, 0x1f618, 0x1f63b, 0x1f929, 0x1f498, 0x1faf6].includes(c)],
    ['flick', c => [0x1f525, 0x1f4a5, 0x1f9e8, 0x2728].includes(c)],
    ['zap', c => [0x26a1, 0x1f4a2, 0x1f52e].includes(c)],
    ['spin', c => [0x2600, 0x1f31e, 0x1f31f, 0x2b50, 0x1f320, 0x1f4ab, 0x1f300, 0x2699, 0x1f3a1, 0x1f6de, 0x1f4bf, 0x1f4c0].includes(c)],
    ['wave', c => [0x1f44b, 0x1f91a, 0x1f590, 0x270b, 0x1f44f, 0x1f64c, 0x1f450, 0x1f91d, 0x1f596].includes(c)],
    ['nod', c => [0x1f44d, 0x1f44e, 0x1f44c, 0x270c, 0x1f91e, 0x1f91f, 0x1f918, 0x1f44a, 0x270a, 0x1f4aa, 0x1f446, 0x1f447, 0x1f448, 0x1f449, 0x261d, 0x1f64f].includes(c)],
    ['shake', c => [0x1f602, 0x1f923, 0x1f606, 0x1f639, 0x1f605, 0x1f604, 0x1f601, 0x23f0, 0x1f514, 0x1f515, 0x1f4f3, 0x1f4f1, 0x1f62c].includes(c)],
    ['rage', c => [0x1f621, 0x1f620, 0x1f92c, 0x1f608, 0x1f47f, 0x1f624, 0x1f4a3].includes(c)],
    ['drip', c => [0x1f622, 0x1f62d, 0x1f625, 0x1f613, 0x1f4a7, 0x1f4a6, 0x1f327, 0x2614, 0x1f302, 0x1f30a, 0x1f6bf].includes(c)],
    ['float', c => [0x1f47b, 0x1f480, 0x2620, 0x1f634, 0x1f4a4, 0x1f388, 0x1f38a, 0x1f389, 0x1f47d, 0x1f47e, 0x1f31b, 0x1f319, 0x2601, 0x1f32b, 0x1fa81, 0x1f54a].includes(c)],
    ['swim', c => R(0x1f41f, 0x1f421)(c) || [0x1f988, 0x1f42c, 0x1f433, 0x1f40b, 0x1f419, 0x1f991, 0x1f990, 0x1f980, 0x1f422, 0x1f40a].includes(c)],
    ['flutter', c => [0x1f98b, 0x1f41d, 0x1f41e, 0x1f41b, 0x1f997, 0x1f99f, 0x1f426, 0x1f54a, 0x1f985, 0x1f989, 0x1f9a2, 0x1f9a9, 0x1f427, 0x1fab6, 0x1fab0].includes(c)],
    ['hop', c => R(0x1f400, 0x1f43f)(c) || R(0x1f980, 0x1f9ae)(c) || [0x1f412, 0x1f435, 0x1f648, 0x1f649, 0x1f64a].includes(c)],
    ['sway', c => (R(0x1f330, 0x1f344)(c) && !R(0x1f345, 0x1f37f)(c)) || [0x1f490, 0x1f33e, 0x1f33f, 0x2618, 0x1f332, 0x1f333, 0x1f334, 0x1f335, 0x1f38b, 0x1f38d, 0x1f343, 0x1f342, 0x1f341, 0x1f940].includes(c)],
    ['launch', c => [0x1f680, 0x1f6f8, 0x1f6f0, 0x2708, 0x1f6e9, 0x1f6eb, 0x1f6ec, 0x1fa82, 0x1f681].includes(c)],
    ['drive', c => R(0x1f680, 0x1f6ff)(c) || R(0x1f690, 0x1f69f)(c)],
    ['bounce', c => [0x26bd, 0x1f3c0, 0x1f3c8, 0x26be, 0x1f3d0, 0x1f3d1, 0x1f3d2, 0x1f3d3, 0x1f3be, 0x1f94e, 0x1f3b1, 0x1f3b3, 0x1f3c9, 0x1fa80, 0x1f9f8].includes(c)],
    ['groove', c => R(0x1f3b5, 0x1f3bc)(c) || [0x1f3a4, 0x1f3a7, 0x1f941, 0x1f483, 0x1f57a, 0x1f4fb, 0x1f50a].includes(c)],
    ['clink', c => [0x1f37a, 0x1f37b, 0x1f942, 0x1f943, 0x1f377, 0x1f378, 0x1f379, 0x1f37e, 0x1f964, 0x1f9cb, 0x2615, 0x1f375].includes(c)],
    ['jiggle', c => R(0x1f345, 0x1f37f)(c) || R(0x1f950, 0x1f96f)(c) || R(0x1f9c0, 0x1f9cb)(c) || [0x1f4a9].includes(c)],
    ['flip', c => [0x1f4b0, 0x1f4b5, 0x1fa99, 0x1f48e, 0x1f3c6, 0x1f947, 0x1f948, 0x1f949, 0x1f451].includes(c)],
    ['wobble', c => [0x1f381, 0x1f380, 0x1f382, 0x1f3ad, 0x1f921, 0x1f9e9, 0x1f3af].includes(c)],
    ['flag', c => c === 0x1f3f4 || c === 0x1f3c1 || c === 0x1f6a9 || c === 0x1f3f3 || R(0x1f1e6, 0x1f1ff)(c)],
    ['tilt', c => R(0x1f466, 0x1f487)(c) || R(0x1f9d1, 0x1f9df)(c) || R(0x1f645, 0x1f64f)(c)],
    ['bob', c => R(0x1f600, 0x1f64f)(c) || R(0x1f910, 0x1f97a)(c) || R(0x1fae0, 0x1fae8)(c)],
  ];
  const MOTION_TIME: Record<string, number> = {
    beat: 1.1, flick: 0.9, zap: 0.7, spin: 5, wave: 1.4, nod: 1.6, shake: 1.2,
    rage: 0.55, drip: 2.2, float: 3.4, swim: 3, flutter: 1.8, hop: 1.9, sway: 3.2,
    launch: 2.6, drive: 2.4, bounce: 1.3, groove: 1.1, clink: 2, jiggle: 1.7,
    flip: 2.4, wobble: 2.2, flag: 2, tilt: 3.2, bob: 2.6,
  };
  const MOTION_FALL = ['bob', 'sway', 'tilt', 'float', 'wobble', 'hop'];

  const emojiIO =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          es => {
            es.forEach(e => e.target.classList.toggle('on', e.isIntersecting));
          },
          { rootMargin: '40px' }
        )
      : null;

  function applyAmbient(el: HTMLElement, ch: string, ampK = 1, durK = 1) {
    const c = (ch || 'x').codePointAt(0) || 120;
    const h = hashStr(ch || 'x');
    let m = '';
    for (let i = 0; i < motionRules.length; i++) {
      if (motionRules[i][1](c)) {
        m = motionRules[i][0];
        break;
      }
    }
    if (!m) m = MOTION_FALL[h % MOTION_FALL.length];
    el.classList.add('amb', 'em', 'mv-' + m);
    const t = (MOTION_TIME[m] || 2) * (0.85 + (h % 30) / 100) * durK;
    el.style.setProperty('--t', t.toFixed(2) + 's');
    el.style.setProperty('--dl', (-(((h >> 5) % 100) / 100) * t).toFixed(2) + 's');
    el.style.setProperty('--a', String(Math.min(2.2, ampK * (0.9 + ((h >> 9) % 20) / 100))));
    if (emojiIO) emojiIO.observe(el);
    else el.classList.add('on');
  }
  window.applyAmbient = applyAmbient;

  /* Tap emoji particle burst */
  document.addEventListener('click', e => {
    const t = (e.target as HTMLElement | null)?.closest?.('.em') as HTMLElement | null;
    if (!t || t.closest('#epGrid')) return;
    const r = t.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      const p = document.createElement('i');
      p.className = 'emp';
      p.textContent = t.textContent || '✨';
      const a = (Math.PI * 2 * i) / 6 + Math.random() * 0.5;
      const d = 32 + Math.random() * 24;
      p.style.left = r.left + r.width / 2 + 'px';
      p.style.top = r.top + r.height / 2 + 'px';
      p.style.setProperty('--x', Math.cos(a) * d + 'px');
      p.style.setProperty('--y', Math.sin(a) * d + 'px');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 800);
    }
  });

  function countEmoji(s: string) {
    return (String(s).match(/\p{Extended_Pictographic}/gu) || []).length;
  }
  function isEmojiOnly(s: string) {
    const t = s.replace(/\s/g, '');
    if (!t || t.length > 12) return false;
    return [...t].every(
      ch => /\p{Extended_Pictographic}/u.test(ch) || /[\uFE0F\u200D\p{Emoji_Modifier}]/u.test(ch)
    );
  }
  const URL_RE = /((?:https?:\/\/|www\.)[^\s<]+)/gi;
  function addTextLinks(el: HTMLElement, txt: string) {
    String(txt)
      .split(URL_RE)
      .forEach(part => {
        if (!part) return;
        if (/^(https?:\/\/|www\.)/i.test(part)) {
          const a = document.createElement('a');
          a.href = /^https?:\/\//i.test(part) ? part : 'https://' + part;
          a.textContent = part;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          el.appendChild(a);
        } else {
          el.appendChild(document.createTextNode(part));
        }
      });
  }
  function emojify(el: HTMLElement, text: string) {
    el.textContent = '';
    const re = /(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic}|\p{Emoji_Modifier})*)/gu;
    String(text || '')
      .split(re)
      .forEach(p => {
        if (!p) return;
        if (/\p{Extended_Pictographic}/u.test(p)) {
          const s = document.createElement('span');
          s.className = 'jemoji';
          s.textContent = p;
          applyAmbient(s, p, 0.45, 1.35);
          el.appendChild(s);
        } else {
          addTextLinks(el, p);
        }
      });
  }

  /* Theme Switching */
  function applyTheme(t: 'dark' | 'light', animate = false) {
    const isDark = t === 'dark';
    if (animate) {
      document.documentElement.classList.add('theme-switching');
      setTimeout(() => document.documentElement.classList.remove('theme-switching'), 380);
    }
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', isDark ? '#071013' : '#E8F0EE');
    try {
      localStorage.setItem('vanishTheme', t);
    } catch (_) {}
    $('#themeDarkBtn')?.classList.toggle('on', isDark);
    $('#themeLightBtn')?.classList.toggle('on', !isDark);
  }
  try {
    const saved = localStorage.getItem('vanishTheme') as 'dark' | 'light' | null;
    applyTheme(saved || 'dark', false);
  } catch (_) {
    applyTheme('dark', false);
  }

  /* Recent Conversations Cache */
  let recent: Record<string, any> = {};
  try {
    recent = JSON.parse(localStorage.getItem('vanishChats') || '{}');
  } catch (_) {
    recent = {};
  }
  function saveRecent() {
    try {
      localStorage.setItem('vanishChats', JSON.stringify(recent));
    } catch (_) {}
  }
  function setRecent(uid: string, patch: any) {
    const r = recent[uid] || {};
    if (patch.cat && r.cat && patch.cat <= r.cat && !patch.force) return;
    recent[uid] = Object.assign({}, r, patch);
    saveRecent();
    renderList();
  }
  function dropRecent(uid: string) {
    delete recent[uid];
    delete unreadCounts[uid];
    saveRecent();
    saveUnread();
    renderList();
  }

  const myBlocks = () => (usersMap[myUid || ''] || {}).blocked || {};
  const iBlocked = (uid: string) => !!myBlocks()[uid];
  const blockedMe = (uid: string) => !!(((usersMap[uid] || {}).blocked) || {})[myUid || ''];

  /* Initialize Firebase */
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.database();
    auth = firebase.auth();
  } catch (e: any) {
    toast('Firebase initialization error: ' + (e?.message || ''));
  }
  try {
    auth?.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
  } catch (_) {}
  db?.ref('.info/serverTimeOffset').on('value', (s: any) => {
    serverOffset = s.val() || 0;
  });

  /* Auth Screen Logic */
  const AUTH_MSG: Record<string, string> = {
    'auth/invalid-email': "That email address doesn't look right.",
    'auth/email-already-in-use': 'An account with this email already exists — sign in instead.',
    'auth/weak-password': 'Password needs at least 6 characters.',
    'auth/missing-password': 'Enter your password.',
    'auth/user-not-found': 'No account found with that email.',
    'auth/wrong-password': 'Incorrect password — please try again.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/too-many-requests': 'Too many attempts — wait a moment and retry.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/unauthorized-domain': 'Domain not yet authorized in Firebase Console.',
    'auth/operation-not-allowed': 'Sign-in method disabled in Firebase Console.',
    'auth/network-request-failed': 'Network error — check your connection.',
  };

  function showAuthFeedback(msg: string, isSuccess = false) {
    const el = $('#authErr');
    if (!el) return;
    el.textContent = msg;
    el.className = 'auth-msg ' + (isSuccess ? 'ok' : 'err');
    el.hidden = false;
  }
  function clearAuthErr() {
    const el = $('#authErr');
    if (!el) return;
    el.textContent = '';
    el.hidden = true;
  }

  const tabInd = $('#tabInd');
  document.querySelectorAll<HTMLButtonElement>('#authScreen .tab').forEach((t, i) => {
    t.addEventListener('click', () => {
      document.querySelectorAll('#authScreen .tab').forEach(x => x.classList.toggle('active', x === t));
      if (tabInd) tabInd.style.transform = i === 1 ? 'translateX(100%)' : 'translateX(0)';
      const isLogin = t.dataset.tab === 'login';
      const lf = $('#loginForm');
      const sf = $('#signupForm');
      if (lf) lf.hidden = !isLogin;
      if (sf) sf.hidden = isLogin;
      const h = $('#authHeading');
      const sub = $('#authSubtitle');
      if (h) h.textContent = isLogin ? 'Welcome back' : 'Create your account';
      if (sub) {
        sub.textContent = isLogin
          ? 'Sign in to continue your private conversations'
          : 'Join Vanish Chats with ephemeral privacy by default';
      }
      clearAuthErr();
    });
  });

  /* Password visibility toggles */
  document.querySelectorAll<HTMLButtonElement>('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      if (!targetId) return;
      const inp = document.getElementById(targetId) as HTMLInputElement | null;
      if (!inp) return;
      const showPw = inp.type === 'password';
      inp.type = showPw ? 'text' : 'password';
      btn.setAttribute('aria-label', showPw ? 'Hide password' : 'Show password');
      btn.innerHTML = showPw
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    });
  });

  /* Forgot password handler */
  $('#forgotBtn')?.addEventListener('click', async () => {
    clearAuthErr();
    const email = ($('#liEmail') as HTMLInputElement | null)?.value.trim() || '';
    if (!email) {
      showAuthFeedback('Enter your email address above first so we can send a reset link.');
      $('#liEmail')?.focus();
      return;
    }
    try {
      await auth.sendPasswordResetEmail(email);
      showAuthFeedback('Password reset link sent — check your inbox.', true);
    } catch (ex: any) {
      showAuthFeedback(AUTH_MSG[ex?.code] || ex?.message || 'Unable to send reset email.');
    }
  });

  $('#loginForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    clearAuthErr();
    const btn = $('#loginSubmitBtn') as HTMLButtonElement | null;
    const orig = btn?.innerHTML || 'Sign in';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="btn-spin"></span><span>Signing in…</span>';
    }
    try {
      const email = ($('#liEmail') as HTMLInputElement)?.value.trim();
      const pass = ($('#liPass') as HTMLInputElement)?.value;
      await auth.signInWithEmailAndPassword(email, pass);
    } catch (ex: any) {
      showAuthFeedback(AUTH_MSG[ex?.code] || ex?.message || 'Sign in failed.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = orig;
      }
    }
  });

  $('#signupForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    clearAuthErr();
    const name = ($('#suName') as HTMLInputElement)?.value.trim();
    const email = ($('#suEmail') as HTMLInputElement)?.value.trim();
    const pass = ($('#suPass') as HTMLInputElement)?.value;
    const passConfirm = ($('#suPassConfirm') as HTMLInputElement)?.value;
    if (name.length < 2) {
      showAuthFeedback('Please enter your name (at least 2 characters).');
      return;
    }
    if (pass.length < 6) {
      showAuthFeedback(AUTH_MSG['auth/weak-password']);
      return;
    }
    if (passConfirm !== undefined && pass !== passConfirm) {
      showAuthFeedback('Passwords do not match — please check both fields.');
      return;
    }
    const btn = $('#signupSubmitBtn') as HTMLButtonElement | null;
    const orig = btn?.innerHTML || 'Create account';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="btn-spin"></span><span>Creating account…</span>';
    }
    try {
      const cred = await auth.createUserWithEmailAndPassword(email, pass);
      await cred.user.updateProfile({ displayName: name });
      await db.ref('users/' + cred.user.uid).set({
        name,
        email,
        bio: DEFAULT_BIO,
        selfDestruct: 40,
        online: true,
        lastSeen: firebase.database.ServerValue.TIMESTAMP,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
      });
    } catch (ex: any) {
      showAuthFeedback(AUTH_MSG[ex?.code] || ex?.message || 'Could not create account.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = orig;
      }
    }
  });

  function finishGoogleUser(u: any) {
    return db
      .ref('users/' + u.uid)
      .once('value')
      .then((s: any) => {
        if (!s.exists()) {
          return db.ref('users/' + u.uid).set({
            name: u.displayName || (u.email || 'friend').split('@')[0],
            email: u.email || '',
            bio: DEFAULT_BIO,
            selfDestruct: 40,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
          });
        }
      });
  }

  auth
    ?.getRedirectResult()
    .then((r: any) => {
      if (r && r.user) return finishGoogleUser(r.user);
    })
    .catch((ex: any) => showAuthFeedback(AUTH_MSG[ex?.code] || ex?.message));

  $('#googleBtn')?.addEventListener('click', async () => {
    clearAuthErr();
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      const r = await auth.signInWithPopup(provider);
      await finishGoogleUser(r.user);
    } catch (ex: any) {
      const code = ex?.code || '';
      const blocked =
        NATIVE ||
        code === 'auth/popup-blocked' ||
        code === 'auth/operation-not-supported-in-this-environment' ||
        /webview|disallowed_useragent|popup/i.test(String(ex?.message || ''));
      if (blocked) {
        try {
          await auth.signInWithRedirect(provider);
          return;
        } catch (_) {
          showAuthFeedback('Google sign-in is restricted in this view. Sign in with email & password.');
          return;
        }
      }
      showAuthFeedback(AUTH_MSG[code] || ex?.message);
    }
  });

  let authFirst = true;
  auth?.onAuthStateChanged(onAuth);

  function onAuth(u: any) {
    if (!u) {
      if (authFirst) {
        authFirst = false;
        let expect = false;
        try {
          expect = localStorage.getItem('vanishSession') === '1';
        } catch (_) {}
        if (expect) {
          setTimeout(() => {
            if (!myUid) {
              try {
                db.ref('users').off();
                db.ref('status').off();
                db.ref('statusSeen').off();
              } catch (_) {}
              unwireInbox();
              closeChat(true);
              closeModals();
              persistSession(false);
              showAuth();
            }
          }, 1500);
          return;
        }
      }
      try {
        db.ref('users').off();
        db.ref('status').off();
        db.ref('statusSeen').off();
      } catch (_) {}
      unwireInbox();
      closeChat(true);
      closeModals();
      persistSession(false);
      myUid = null;
      myProfile = null;
      showAuth();
      return;
    }
    authFirst = false;
    persistSession(true);
    if (myUid === u.uid) {
      if ($('#appScreen') && !$('#appScreen')!.classList.contains('active')) enterArena();
      return;
    }
    myUid = u.uid;
    ensureProfile(u);
  }

  async function ensureProfile(u: any) {
    try {
      const ref = db.ref('users/' + u.uid);
      const snap = await ref.once('value');
      const v = snap.val() || {};
      const name = v.name || u.displayName || (u.email || 'friend').split('@')[0];
      if (!snap.exists()) {
        await ref.set({
          name,
          email: u.email || '',
          bio: DEFAULT_BIO,
          selfDestruct: 40,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
        });
      } else {
        const p: Record<string, any> = {};
        if (!v.name) p.name = name;
        if (!v.bio) p.bio = DEFAULT_BIO;
        if (!v.selfDestruct) p.selfDestruct = 40;
        if (Object.keys(p).length) await ref.update(p);
      }
      myProfile = {
        uid: u.uid,
        name,
        email: u.email || v.email || '',
        bio: v.bio || DEFAULT_BIO,
        photoURL: v.photoURL || '',
      };
      persistSession(true);
      enterArena();
    } catch (e: any) {
      toast('Could not load profile: ' + (e?.message || ''));
    }
  }

  function renderSkeletons() {
    const list = $('#userList');
    if (!list) return;
    list.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const row = document.createElement('div');
      row.className = 'skel-row';
      row.innerHTML =
        '<div class="skel-av"></div><div class="skel-lines"><div class="skel-line" style="width:55%"></div><div class="skel-line" style="width:82%"></div></div>';
      list.appendChild(row);
    }
  }

  function enterArena() {
    if (myProfile) {
      paintAv($('#meAvatar'), myUid, myProfile.name);
      paintAv($('#railMeAvatar'), myUid, myProfile.name);
    }
    if (!usersLoaded) renderSkeletons();
    wirePresence();
    wireUsers();
    wireStatus();
    wireInbox();
    show('appScreen');
    onEnterArenaPushHook();
  }

  function wirePresence() {
    const me = db.ref('users/' + myUid);
    db.ref('.info/connected').on('value', (s: any) => {
      if (!s.val()) return;
      me.child('online').onDisconnect().set(false);
      me.child('lastSeen').onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
      me.update({ online: true, lastSeen: firebase.database.ServerValue.TIMESTAMP });
    });
  }

  function wireUsers() {
    db.ref('users').on('value', (s: any) => {
      usersMap = s.val() || {};
      usersLoaded = true;
      if (myUid && usersMap[myUid]) {
        paintAv($('#meAvatar'), myUid, usersMap[myUid].name || myProfile?.name);
        paintAv($('#railMeAvatar'), myUid, usersMap[myUid].name || myProfile?.name);
      }
      if (myUid) Object.keys(usersMap).forEach(attachInboxFor);
      renderList();
      paintChatHead();
      updateGate();
      updateVdBadge();
      paintTyping();
      renderSBar();
      if ($('#profModal') && !$('#profModal')!.hidden && profUid) fillProfile(profUid);
      profileUI?.fillDrawer();
      if ($('#privModal') && !$('#privModal')!.hidden) renderBlocked();
      if ($('#customizeSheet') && !$('#customizeSheet')!.hidden) renderSettingsState();
    });
  }

  function wireStatus() {
    db.ref('status').on('value', (s: any) => {
      statuses = s.val() || {};
      const t = now();
      if (myUid && statuses[myUid] && statuses[myUid].items) {
        Object.entries(statuses[myUid].items).forEach(([id, it]: [string, any]) => {
          if (it.exp && it.exp < t) {
            db.ref('status/' + myUid + '/items/' + id).remove().catch(() => {});
          }
        });
      }
      renderSBar();
      if ($('#viewersModal') && !$('#viewersModal')!.hidden && storyOwner) refreshViewers();
    });
    db.ref('statusSeen').on('value', (s: any) => {
      seenMap = s.val() || {};
      renderSBar();
    });
  }

  /* Notifications & Background Inbox */
  let inboxSince = 0;
  let notifyOn = true;
  const inboxKids = new Map<string, any>();

  function notifEnabled() {
    try {
      return localStorage.getItem('vanishNotify') !== 'off';
    } catch (_) {
      return true;
    }
  }
  function persistNotif(on: boolean) {
    try {
      localStorage.setItem('vanishNotify', on ? 'on' : 'off');
    } catch (_) {}
    notifyOn = on;
    $('#notifyT')?.classList.toggle('on', on);
    $('#settingsNotifyToggle')?.classList.toggle('on', on);
  }
  function notifPermGranted() {
    if (NATIVE && window.VanishAndroid && typeof window.VanishAndroid.hasNotifications === 'function') {
      try {
        return !!window.VanishAndroid.hasNotifications();
      } catch (_) {}
    }
    return typeof Notification !== 'undefined' && Notification.permission === 'granted';
  }
  function showNotifyBanner() {
    const b = $('#notifyBanner');
    if (!b) return;
    if (!notifEnabled() || notifPermGranted()) {
      b.hidden = true;
      return;
    }
    try {
      if (localStorage.getItem('vanishNotifySkip') === '1') {
        b.hidden = true;
        return;
      }
    } catch (_) {}
    b.hidden = false;
  }
  function enableNotifications(fromUser: boolean) {
    persistNotif(true);
    try {
      localStorage.removeItem('vanishNotifySkip');
    } catch (_) {}
    if (NATIVE && window.VanishAndroid?.requestNotifications) {
      try {
        window.VanishAndroid.requestNotifications();
      } catch (_) {}
      setTimeout(showNotifyBanner, 600);
      return;
    }
    if (typeof Notification === 'undefined') {
      if (fromUser) toast('Notifications are not supported in this browser');
      showNotifyBanner();
      return;
    }
    Notification.requestPermission()
      .then(p => {
        showNotifyBanner();
        renderSettingsState();
        if (p === 'granted') {
          toast('Notifications enabled');
          registerPushToken();
        } else if (fromUser) {
          toast('Notification permission blocked in browser settings');
        }
      })
      .catch(() => showNotifyBanner());
  }

  window.__notifyPermResult = function (ok: boolean) {
    showNotifyBanner();
    if (ok) toast('Notifications enabled');
  };
  window.__openFromNotify = function (uid: string) {
    if (!uid || !myUid) return;
    const name = (usersMap[uid] || {}).name || 'Chat';
    closeModals();
    openChat(uid, name);
  };

  function showMessageNotification(title: string, body: string, uid: string) {
    if (!notifyOn) return;
    const text = String(body || 'New message').slice(0, 140);
    if (NATIVE && window.VanishAndroid?.notify) {
      try {
        window.VanishAndroid.notify(String(title || 'Vanish Chats'), text, String(uid || ''));
      } catch (_) {}
      return;
    }
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    try {
      const n = new Notification(title || 'Vanish Chats', {
        body: text,
        tag: 'vanish-' + (uid || 'x'),
      });
      n.onclick = () => {
        try {
          window.focus();
        } catch (_) {}
        if (uid) window.__openFromNotify?.(uid);
        n.close();
      };
    } catch (_) {}
  }

  function unwireInbox() {
    inboxKids.forEach(ref => {
      try {
        ref.off();
      } catch (_) {}
    });
    inboxKids.clear();
  }

  const makeChatId = (a: string, b: string) => [a, b].sort().join('__');

  function attachInboxFor(uid: string) {
    if (!myUid || !uid || uid === myUid) return;
    const id = makeChatId(myUid, uid);
    if (inboxKids.has(id)) return;
    const ref = db.ref('chats/' + id + '/messages').orderByChild('createdAt').limitToLast(1);
    inboxKids.set(id, ref);
    ref.on('child_added', (snap: any) => {
      const v = snap.val();
      if (!v || v.from === myUid || v.to !== myUid) return;
      if (typeof v.createdAt !== 'number' || v.createdAt < inboxSince) return;
      if (iBlocked(v.from) || blockedMe(v.from)) return;
      setRecent(v.from, {
        n: (usersMap[v.from] || {}).name || 'User',
        t: mediaLabel(v),
        at: v.createdAt,
        cat: v.createdAt,
        from: 'them',
      });
      if (peerUid !== v.from || document.hidden) {
        if (peerUid !== v.from) {
          unreadCounts[v.from] = (unreadCounts[v.from] || 0) + 1;
          saveUnread();
          renderList();
        }
        const name = (usersMap[v.from] || {}).name || 'Someone';
        showMessageNotification(name, mediaLabel(v), v.from);
      }
    });
  }

  function wireInbox() {
    if (!myUid) return;
    notifyOn = notifEnabled();
    inboxSince = now() - 800;
    Object.keys(usersMap || {}).forEach(attachInboxFor);
    if (NATIVE && notifyOn) enableNotifications(false);
    else showNotifyBanner();
  }

  /* Typing Indicator */
  function setTyping(on: boolean) {
    if (!myUid || !chatId) return;
    const ref = db.ref('users/' + myUid + '/typing/' + chatId);
    if (on) {
      ref.set(firebase.database.ServerValue.TIMESTAMP).catch(() => {});
      ref.onDisconnect().remove().catch(() => {});
      clearTimeout(typingT);
      typingT = setTimeout(() => ref.remove().catch(() => {}), 2600);
    } else {
      clearTimeout(typingT);
      ref.remove().catch(() => {});
    }
  }

  function peerTyping() {
    if (!peerUid || !chatId) return false;
    const ts = ((usersMap[peerUid] || {}).typing || {})[chatId];
    return !!(ts && now() - ts < 6000);
  }

  function paintTyping() {
    const msgsEl = $('#msgs');
    if (!msgsEl) return;
    let tb = $('#typingBub');
    const showT = peerTyping();
    if (showT && !tb) {
      tb = document.createElement('div');
      tb.id = 'typingBub';
      tb.className = 'bubble theirs typing-bub';
      tb.innerHTML = '<span class="tydots"><i></i><i></i><i></i></span>';
      msgsEl.appendChild(tb);
      msgsEl.scrollTop = msgsEl.scrollHeight;
    } else if (!showT && tb) {
      tb.remove();
    }
  }

  /* Conversation List & Directory Rendering */
  function matchQ(u: any, q: string) {
    return (
      !q ||
      String(u.name || '').toLowerCase().includes(q) ||
      String(u.email || '').toLowerCase().includes(q)
    );
  }

  function renderList() {
    const list = $('#userList');
    if (!list) return;
    if (!usersLoaded) return;
    const q = searchQ.toLowerCase();
    list.innerHTML = '';

    if (sideTab === 'chats') {
      let ids = Object.keys(recent)
        .filter(uid => usersMap[uid] && matchQ(usersMap[uid], q))
        .sort((a, b) => (recent[b].cat || 0) - (recent[a].cat || 0));

      if (activeFilter === 'online') {
        ids = ids.filter(uid => !!usersMap[uid]?.online);
      } else if (activeFilter === 'unread') {
        ids = ids.filter(uid => (unreadCounts[uid] || 0) > 0);
      }

      const cnt = $('#chatCnt');
      if (cnt) {
        cnt.hidden = ids.length === 0;
        cnt.textContent = String(ids.length);
      }

      const note = $('#sideNote');
      if (!ids.length) {
        if (note) {
          note.hidden = false;
          note.innerHTML =
            activeFilter !== 'all'
              ? `<div>No ${activeFilter} conversations right now.</div>`
              : '<div>No active conversations yet. Start a disappearing chat with anyone in the directory.</div><button type="button" class="snote-cta" id="emptyExploreBtn">Explore Directory</button>';
          $('#emptyExploreBtn')?.addEventListener('click', () => setMainTab('explore'));
        }
      } else if (note) {
        note.hidden = true;
      }

      ids.forEach((uid, i) => list.appendChild(chatRow(uid, i)));
    } else {
      let all = Object.entries(usersMap)
        .filter(([uid]) => uid !== myUid)
        .map(([uid, v]) => Object.assign({ uid }, v))
        .filter(u => matchQ(u, q));

      if (activeFilter === 'online') {
        all = all.filter(u => !!u.online);
      }

      all.sort(
        (a, b) =>
          (b.online ? 1 : 0) - (a.online ? 1 : 0) ||
          String(a.name || '').localeCompare(String(b.name || ''))
      );

      const cnt = $('#chatCnt');
      if (cnt) cnt.hidden = true;

      const note = $('#sideNote');
      if (!all.length) {
        if (note) {
          note.hidden = false;
          note.textContent = searchQ
            ? 'No accounts match your search.'
            : 'No other accounts registered yet. Sign up from another browser or device to test live chat.';
        }
      } else if (note) {
        note.hidden = true;
      }

      let g: string | null = null;
      let i = 0;
      all.forEach(u => {
        const gr = u.online ? 'on' : 'off';
        if (gr !== g) {
          const h = document.createElement('div');
          h.className = 'gl';
          h.textContent = gr === 'on' ? 'Online now' : 'Directory';
          list.appendChild(h);
          g = gr;
        }
        list.appendChild(exploreRow(u, i++));
      });
    }
  }

  function makeRow(uid: string, i: number) {
    const u = usersMap[uid] || {};
    const row = document.createElement('div');
    row.className = 'urow' + (peerUid === uid ? ' active' : '');
    row.style.setProperty('--i', String(Math.min(i, 10)));
    const av = document.createElement('div');
    av.className = 'avatar clickable';
    av.title = 'View profile';
    paintAv(av, uid, u.name);
    const dot = document.createElement('span');
    dot.className = 'dot' + (u.online ? ' on' : '');
    av.appendChild(dot);
    av.addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      openProfile(uid);
    });
    const tx = document.createElement('div');
    tx.className = 'utx';
    const l1 = document.createElement('div');
    l1.className = 'l1';
    const nm = document.createElement('b');
    nm.textContent = u.name || 'Anonymous';
    l1.appendChild(nm);
    tx.appendChild(l1);
    row.append(av, tx);
    return { row, l1, tx };
  }

  function rowMenuBtn(items: { label: string; icon: string; danger?: boolean; fn: () => void }[]) {
    const b = document.createElement('button');
    b.className = 'rowmenu';
    b.type = 'button';
    b.title = 'Options';
    b.innerHTML = DOTS_SVG;
    b.addEventListener('click', ev => {
      ev.stopPropagation();
      const r = b.getBoundingClientRect();
      openCtx(items, Math.min(r.left - 160, innerWidth - 235), r.bottom + 6);
    });
    return b;
  }

  function chatRow(uid: string, i: number) {
    const u = usersMap[uid] || {};
    const r = recent[uid] || {};
    const { row, l1, tx } = makeRow(uid, i);
    const tm = document.createElement('span');
    tm.className = 'tm';
    tm.textContent = fmtShort(r.at || Date.now());
    l1.appendChild(tm);

    const l2 = document.createElement('div');
    l2.className = 'l2';
    const sub = document.createElement('span');
    sub.className = 'sub-txt';
    const blk = iBlocked(uid);

    const renderSubPreview = () => {
      if (blk) {
        sub.textContent = 'Blocked · Unblock to chat';
        return;
      }
      if (r.from === 'me') {
        sub.innerHTML = ticksSVG('read') + ' ';
        sub.appendChild(document.createTextNode(r.t || 'Sent media'));
      } else {
        sub.textContent = r.t || 'Tap to open chat';
      }
    };
    renderSubPreview();
    l2.appendChild(sub);

    const unread = unreadCounts[uid] || 0;
    if (unread > 0 && !blk) {
      row.classList.add('has-unread');
      const badge = document.createElement('span');
      badge.className = 'unread-badge';
      badge.textContent = unread > 99 ? '99+' : String(unread);
      l2.appendChild(badge);
    }
    tx.appendChild(l2);

    if (!blk && myUid) {
      const cid = makeChatId(myUid, uid);
      const tref = db.ref('users/' + uid + '/typing/' + cid);
      const tcb = (s: any) => {
        if (s.exists()) {
          sub.textContent = 'typing…';
          sub.classList.add('typing-now');
        } else {
          sub.classList.remove('typing-now');
          renderSubPreview();
        }
      };
      tref.on('value', tcb);
    }

    row.addEventListener('click', ev => {
      if ((ev.target as HTMLElement)?.closest?.('.avatar')) return;
      openChat(uid, u.name);
    });
    row.appendChild(rowMenuBtn(chatMenuItems(uid)));
    return row;
  }

  function exploreRow(u: any, i: number) {
    const { row, tx } = makeRow(u.uid, i);
    const l2 = document.createElement('div');
    l2.className = 'l2';
    const sub = document.createElement('span');
    sub.className = 'sub-txt';
    const blk = iBlocked(u.uid);
    sub.textContent = blk ? 'Blocked' : u.online ? 'Active now' : fmtSeen(u.lastSeen);
    l2.appendChild(sub);
    tx.appendChild(l2);
    row.addEventListener('click', ev => {
      if ((ev.target as HTMLElement)?.closest?.('.avatar')) return;
      openChat(u.uid, u.name);
    });
    row.appendChild(rowMenuBtn(accountMenuItems(u.uid)));
    return row;
  }

  function chatMenuItems(uid: string) {
    const items = [
      { label: 'View profile', icon: EYE_SVG, fn: () => openProfile(uid) },
      { label: 'Clear conversation', icon: TRASH_SVG, danger: true, fn: () => clearChat(uid) },
    ];
    items.push(
      iBlocked(uid)
        ? { label: 'Unblock account', icon: BLOCK_SVG, fn: () => unblockUser(uid) }
        : { label: 'Block account', icon: BLOCK_SVG, danger: true, fn: () => blockUser(uid) }
    );
    return items;
  }

  function accountMenuItems(uid: string) {
    return iBlocked(uid)
      ? [
          { label: 'Unblock account', icon: BLOCK_SVG, fn: () => unblockUser(uid) },
          { label: 'View profile', icon: EYE_SVG, fn: () => openProfile(uid) },
        ]
      : [
          { label: 'View profile', icon: EYE_SVG, fn: () => openProfile(uid) },
          { label: 'Block account', icon: BLOCK_SVG, danger: true, fn: () => blockUser(uid) },
        ];
  }

  $('#searchInput')?.addEventListener('input', e => {
    searchQ = (e.target as HTMLInputElement).value;
    renderList();
  });

  document.querySelector('.arPills')?.addEventListener('click', e => {
    const b = (e.target as HTMLElement).closest('button');
    if (!b) return;
    document.querySelectorAll('.arPills button').forEach(x => x.classList.toggle('on', x === b));
    activeFilter = (b.dataset.f as 'all' | 'online' | 'unread') || 'all';
    renderList();
  });

  /* Context Menu */
  const ctx = $('#ctxMenu');
  const MENU_TRIGGERS = '.rowmenu,#menuBtn,#chatMenuBtn,#lbDots,#stDots';
  function openCtx(
    items: { label: string; icon: string; danger?: boolean; fn: () => void }[],
    x: number,
    y: number
  ) {
    if (!ctx) return;
    ctx.innerHTML = '';
    items.forEach(it => {
      const b = document.createElement('button');
      b.type = 'button';
      if (it.danger) b.className = 'danger';
      b.innerHTML = it.icon + '<span>' + it.label + '</span>';
      b.addEventListener('click', () => {
        closeCtx();
        it.fn();
      });
      ctx.appendChild(b);
    });
    ctx.style.left = Math.max(8, Math.min(x, innerWidth - 230)) + 'px';
    ctx.style.top = Math.min(Math.max(8, y), innerHeight - 280) + 'px';
    ctx.hidden = false;
  }
  function closeCtx() {
    if (ctx) ctx.hidden = true;
  }
  document.addEventListener('pointerdown', e => {
    if (!ctx || ctx.hidden) return;
    const t = e.target as HTMLElement;
    if (ctx.contains(t)) return;
    if (t.closest && t.closest(MENU_TRIGGERS)) return;
    closeCtx();
  });
  window.addEventListener('blur', closeCtx);

  /* Block / Unblock / Clear / Logout */
  async function blockUser(uid: string) {
    const n = (usersMap[uid] || {}).name || 'Account';
    try {
      await db.ref('users/' + myUid + '/blocked/' + uid).set(true);
      toast(n + ' blocked');
    } catch (_) {
      toast('Unable to block account');
    }
  }
  async function unblockUser(uid: string) {
    const n = (usersMap[uid] || {}).name || 'Account';
    try {
      await db.ref('users/' + myUid + '/blocked/' + uid).remove();
      toast(n + ' unblocked');
    } catch (_) {
      toast('Unable to unblock account');
    }
  }
  async function clearChat(uid: string) {
    const n = (usersMap[uid] || {}).name || 'this user';
    const ok = await askConfirm(
      'Clear conversation?',
      `All active messages with ${n} will dissolve immediately for both sides.`,
      'Clear chat',
      true
    );
    if (!ok) return;
    const cid = makeChatId(myUid!, uid);
    db.ref('chats/' + cid + '/messages').remove().catch(() => {});
    dropRecent(uid);
    if (peerUid === uid) {
      live.forEach(e => e.node.remove());
      live.clear();
      updateNone();
      lastTs = 0;
      paintTyping();
    }
    toast('Conversation cleared');
  }

  $('#menuBtn')?.addEventListener('click', e => {
    e.stopPropagation();
    const r = $('#menuBtn')!.getBoundingClientRect();
    const dark = document.body.classList.contains('dark');
    openCtx(
      [
        {
          label: 'Settings & appearance',
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.77 1.02 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
          fn: () => window.openCustomize?.(),
        },
        {
          label: dark ? 'Switch to Light mode' : 'Switch to Dark mode',
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M19.4 4.6l-1.8 1.8M6.4 17.6l-1.8 1.8"/></svg>',
          fn: () => applyTheme(dark ? 'light' : 'dark', true),
        },
        {
          label: 'Blocked accounts',
          icon: BLOCK_SVG,
          fn: openPrivacy,
        },
        {
          label: 'My profile & vanish timer',
          icon: EYE_SVG,
          fn: () => myUid && openProfile(myUid),
        },
        {
          label: 'Sign out',
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>',
          danger: true,
          fn: () => requestLogout(),
        },
      ],
      Math.min(r.left - 165, innerWidth - 235),
      r.bottom + 6
    );
  });

  $('#chatMenuBtn')?.addEventListener('click', e => {
    e.stopPropagation();
    if (!peerUid) return;
    const r = $('#chatMenuBtn')!.getBoundingClientRect();
    openCtx(chatMenuItems(peerUid), Math.min(r.left - 170, innerWidth - 235), r.bottom + 6);
  });

  async function requestLogout() {
    const ok = await askConfirm('Sign out of Vanish Chats?', 'You can sign back in anytime.', 'Sign out', true);
    if (!ok) return;
    await doLogout();
  }

  async function doLogout() {
    await unregisterPushToken();
    try {
      setTyping(false);
    } catch (_) {}
    try {
      if (myUid) {
        await db.ref('users/' + myUid).update({
          online: false,
          lastSeen: firebase.database.ServerValue.TIMESTAMP,
        });
      }
    } catch (_) {}
    closeChat(true);
    closeModals();
    if ($('#customizeSheet')) $('#customizeSheet')!.hidden = true;
    myUid = null;
    myProfile = null;
    auth.signOut();
  }

  function openPrivacy() {
    renderBlocked();
    const pm = $('#privModal');
    if (pm) pm.hidden = false;
  }

  function renderBlocked() {
    const box = $('#blist');
    if (!box) return;
    box.innerHTML = '';
    const ids = Object.keys(myBlocks()).filter(uid => usersMap[uid]);
    if (!ids.length) {
      box.innerHTML = '<div class="bempty">No blocked accounts.<br>Blocked users cannot message you or see your status.</div>';
      return;
    }
    ids.forEach(uid => {
      const u = usersMap[uid] || {};
      const d = document.createElement('div');
      d.className = 'brow';
      const av = document.createElement('div');
      av.className = 'avatar sm';
      paintAv(av, uid, u.name);
      const tx = document.createElement('div');
      tx.className = 'utx';
      tx.innerHTML = '<b></b><span class="sub-txt"></span>';
      tx.querySelector('b')!.textContent = u.name || 'User';
      tx.querySelector('span')!.textContent = u.online ? 'Online' : fmtSeen(u.lastSeen);
      const b = document.createElement('button');
      b.className = 'unb';
      b.type = 'button';
      b.textContent = 'Unblock';
      b.addEventListener('click', () => unblockUser(uid));
      d.append(av, tx, b);
      box.appendChild(d);
    });
  }
  $('#prClose')?.addEventListener('click', () => {
    if ($('#privModal')) $('#privModal')!.hidden = true;
  });

  /* Cloudinary Upload & Pending Progress Bubble */
  function cloudUpload(file: File, onProg?: (p: number) => void, ctl?: { xhr?: XMLHttpRequest }, publicId?: string): Promise<any> {
    const url = 'https://api.cloudinary.com/v1_1/' + CLOUD + '/auto/upload';
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', UPLOAD_PRESET);
    if (publicId) fd.append('public_id', publicId);
    return new Promise((res, rej) => {
      const x = new XMLHttpRequest();
      x.open('POST', url);
      if (ctl) ctl.xhr = x;
      x.upload.onprogress = e => {
        if (e.lengthComputable && onProg) onProg(e.loaded / e.total);
      };
      x.onload = () => {
        try {
          const j = JSON.parse(x.responseText);
          j.error ? rej(new Error(j.error.message)) : res(j);
        } catch (err) {
          rej(err);
        }
      };
      x.onerror = () => rej(new Error('Network error'));
      x.onabort = () => rej(new Error('cancelled'));
      x.send(fd);
    });
  }

  function pendingBubble(file: File, kind: string) {
    const node = document.createElement('div');
    node.className = 'bubble mine pending new';
    const wrap = document.createElement('div');
    wrap.className = 'pbWrap';
    if (kind === 'video') {
      const v = document.createElement('video');
      v.src = URL.createObjectURL(file);
      v.muted = true;
      v.playsInline = true;
      wrap.appendChild(v);
    } else {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      wrap.appendChild(img);
    }
    const R_RAD = 20;
    const C = 2 * Math.PI * R_RAD;
    wrap.insertAdjacentHTML(
      'beforeend',
      `<div class="pbDim"></div><svg class="pbRing" viewBox="0 0 48 48"><circle class="pbTrk" cx="24" cy="24" r="${R_RAD}"/><circle class="pbArc" cx="24" cy="24" r="${R_RAD}" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}"/></svg><button type="button" class="pbX" title="Cancel">✕</button><span class="pbPct">0%</span>`
    );
    node.appendChild(wrap);
    const arc = wrap.querySelector('.pbArc') as SVGCircleElement;
    const pct = wrap.querySelector('.pbPct') as HTMLElement;
    const ctl: { xhr?: XMLHttpRequest } = {};
    wrap.querySelector('.pbX')?.addEventListener('click', () => {
      try {
        ctl.xhr?.abort();
      } catch (_) {}
      node.remove();
    });
    const msgsEl = $('#msgs');
    if (msgsEl) {
      msgsEl.appendChild(node);
      msgsEl.scrollTo({ top: msgsEl.scrollHeight, behavior: 'smooth' });
    }
    return {
      node,
      ctl,
      setProgress(p: number) {
        const o = C * (1 - p);
        arc.style.strokeDashoffset = o.toFixed(1);
        pct.textContent = Math.round(p * 100) + '%';
      },
      done() {
        node.remove();
      },
      fail(msg?: string) {
        pct.textContent = '!';
        setTimeout(() => node.remove(), 1400);
        toast(msg || 'Upload failed');
      },
    };
  }

  function mimeFromMagic(f: File): Promise<string | null> {
    if (f.type && f.type !== 'application/octet-stream') return Promise.resolve(null);
    return new Promise(res => {
      const r = new FileReader();
      r.onload = () => {
        const b = new Uint8Array(r.result as ArrayBuffer);
        let m = 'image/jpeg';
        if (b[0] === 0x89 && b[1] === 0x50) m = 'image/png';
        else if (b[0] === 0x47 && b[1] === 0x49) m = 'image/gif';
        else if (b[0] === 0xff && b[1] === 0xd8) m = 'image/jpeg';
        else if (b.length > 11 && b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79) m = 'video/mp4';
        else if (b[0] === 0x52 && b[1] === 0x49) m = 'video/webm';
        else if (b[0] === 0x42 && b[1] === 0x4d) m = 'image/bmp';
        res(m);
      };
      r.onerror = () => res('image/jpeg');
      r.readAsArrayBuffer(f.slice(0, 16));
    });
  }
  function extFor(m: string) {
    return (
      ({
        'image/png': 'png',
        'image/gif': 'gif',
        'image/jpeg': 'jpg',
        'image/bmp': 'bmp',
        'video/mp4': 'mp4',
        'video/webm': 'webm',
      } as Record<string, string>)[m] || 'bin'
    );
  }
  function fixMediaFile(f: File): Promise<File> {
    return mimeFromMagic(f).then(sniffed => {
      if (!sniffed) return f;
      return new Promise<File>(res => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            res(
              new File([reader.result as ArrayBuffer], (f.name || 'media') + '.' + extFor(sniffed), {
                type: sniffed,
              })
            );
          } catch (_) {
            res(f);
          }
        };
        reader.onerror = () => res(f);
        reader.readAsArrayBuffer(f);
      });
    });
  }

  /* Queued Direct Media Send (prevents duplicate GIF filename collisions) */
  let sendQueue = Promise.resolve();
  function directSendMedia(f: File, kindHint?: string) {
    if (!peerUid || !chatId) return;
    if (iBlocked(peerUid) || blockedMe(peerUid)) {
      toast('Conversation unavailable');
      return;
    }
    const kind =
      kindHint || (f.type === 'image/gif' ? 'gif' : f.type.startsWith('video') ? 'video' : 'photo');
    const ext = kind === 'gif' ? 'gif' : f.type.includes('png') ? 'png' : 'jpg';
    const uniqId = Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    const nf = new File([f], `vc_${uniqId}.${ext}`, { type: f.type });
    sendQueue = sendQueue
      .then(() => {
        const pb = pendingBubble(nf, kind);
        return cloudUpload(nf, p => pb.setProgress(p), pb.ctl, 'vc_' + uniqId)
          .catch(() => cloudUpload(nf, p => pb.setProgress(p), pb.ctl))
          .then(j => {
            pb.done();
            sendMsg({
              type: kind,
              url: j.secure_url,
              pid: j.public_id || '',
              w: j.width || 0,
              h: j.height || 0,
              caption: '',
              viewOnce: false,
            });
          })
          .catch(e => {
            if (e?.message !== 'cancelled') pb.fail('Media send failed');
            else pb.node.remove();
          });
      })
      .catch(() => {});
  }
  window.directSendMedia = directSendMedia;

  function handleIncomingMediaFile(f: File, source?: string) {
    if (!f || !peerUid || isMsgDisabled()) return;
    toast((source || 'Media') + ' ready');
    fixMediaFile(f).then(cf => {
      if (cf.size > MAX_MB * 1048576) {
        toast(`File exceeds ${MAX_MB} MB limit`);
        return;
      }
      startCompose(cf);
    });
  }

  /* Paste & Drop Media Support */
  document.addEventListener('paste', e => {
    if (!peerUid || isMsgDisabled()) return;
    const items = e.clipboardData?.items;
    if (items) {
      for (const it of items) {
        if (it.type && (it.type.startsWith('image') || it.type === 'image/gif')) {
          e.preventDefault();
          const f = it.getAsFile();
          if (f) handleIncomingMediaFile(f, 'Pasted image');
          return;
        }
      }
    }
    const files = e.clipboardData?.files;
    if (files?.length) {
      for (const f of files) {
        if (f.type && (f.type.startsWith('image') || f.type.startsWith('video'))) {
          e.preventDefault();
          handleIncomingMediaFile(f, 'Pasted media');
          return;
        }
      }
    }
  });

  document.addEventListener('dragover', e => {
    if (peerUid) e.preventDefault();
  });
  document.addEventListener('drop', e => {
    if (!peerUid || isMsgDisabled()) return;
    const files = e.dataTransfer?.files;
    if (!files?.length) return;
    for (const f of files) {
      if (f.type && (f.type.startsWith('image') || f.type.startsWith('video'))) {
        e.preventDefault();
        handleIncomingMediaFile(f, 'Dropped media');
        return;
      }
    }
  });

  /* Contenteditable Message Input Helpers */
  function getMsgText() {
    const el = $('#msgInput');
    if (!el) return '';
    return (el.innerText || el.textContent || '').replace(/\u00a0/g, ' ').trim();
  }
  function setMsgText(t: string) {
    const el = $('#msgInput');
    if (!el) return;
    el.innerText = t || '';
    syncComposerButtons();
  }
  function isMsgDisabled() {
    const el = $('#msgInput');
    return (
      !el ||
      el.getAttribute('aria-disabled') === 'true' ||
      el.getAttribute('contenteditable') === 'false'
    );
  }
  function setMsgDisabled(disabled: boolean) {
    const el = $('#msgInput');
    if (!el) return;
    el.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    el.setAttribute('contenteditable', disabled ? 'false' : 'true');
    if (disabled) el.blur();
  }
  function focusMsg() {
    const el = $('#msgInput');
    if (el && !isMsgDisabled()) {
      el.focus();
      try {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      } catch (_) {}
    }
  }

  function syncComposerButtons() {
    const mi = $('#msgInput');
    const mic = $('#micBtn');
    const snd = $('#sendBtn');
    if (!mi || !mic || !snd) return;
    const has = getMsgText().length > 0;
    mic.style.display = has ? 'none' : 'grid';
    snd.style.display = has ? 'grid' : 'none';
  }

  const msgEl = $('#msgInput');
  if (msgEl) {
    msgEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        $('#composer')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    });
    ['input', 'keyup', 'paste', 'cut'].forEach(ev =>
      msgEl.addEventListener(ev, syncComposerButtons)
    );
    msgEl.addEventListener('input', () => {
      setTyping(true);
      const imgs = msgEl.querySelectorAll('img');
      if (imgs.length) {
        imgs.forEach(async img => {
          try {
            const src = img.src || '';
            img.remove();
            if (src.startsWith('blob:') || src.startsWith('data:')) {
              const res = await fetch(src);
              const blob = await res.blob();
              const isGif = blob.type === 'image/gif' || src.includes('image/gif');
              const ext = isGif ? 'gif' : blob.type === 'image/png' ? 'png' : 'jpg';
              const f = new File([blob], 'keyboard.' + ext, {
                type: isGif ? 'image/gif' : blob.type || 'image/jpeg',
              });
              directSendMedia(f, isGif ? 'gif' : 'photo');
            }
          } catch (_) {}
        });
      }
    });
    syncComposerButtons();
  }

  /* Open & Close Chat */
  let pendingCamFile: File | null = null;

  function openChat(uid: string, name?: string) {
    closeChat(true);
    peerUid = uid;
    peerName = (usersMap[uid] || {}).name || name || 'Chat';
    chatId = makeChatId(myUid!, uid);
    if (unreadCounts[uid]) {
      delete unreadCounts[uid];
      saveUnread();
    }
    if (NATIVE && window.VanishAndroid?.cancelNotify) {
      try {
        window.VanishAndroid.cancelNotify(uid);
      } catch (_) {}
    }
    document.body.classList.add('in-chat');
    if ($('#chatEmpty')) $('#chatEmpty')!.hidden = true;
    if ($('#chatLive')) $('#chatLive')!.hidden = false;
    renderList();
    paintChatHead();
    updateGate();
    updateVdBadge();
    $('#msgs')
      ?.querySelectorAll('.bubble,.daysep')
      .forEach(b => b.remove());
    updateNone();
    lastTs = 0;
    lastBubbleFrom = null;
    lastBubbleTime = 0;
    setMsgDisabled(false);
    if ($('#sendBtn')) ($('#sendBtn') as HTMLButtonElement).disabled = false;
    focusMsg();
    showNativeInput();

    msgBase = db.ref('chats/' + chatId + '/messages');
    msgQuery = msgBase.orderByChild('createdAt').limitToLast(300);
    sweepExpired();
    msgQuery.on('child_added', onChildAdded);
    msgQuery.on('child_changed', onChildChanged);
    msgBase.on('child_removed', onChildRemoved);
    markAllRead();
    paintTyping();
    clearInterval(headTick);
    headTick = setInterval(() => {
      if (peerUid) {
        paintChatHead();
        paintTyping();
      }
    }, 700);

    if (pendingCamFile) {
      const f = pendingCamFile;
      pendingCamFile = null;
      setTimeout(() => startCompose(f, 'chat'), 320);
    }
    profileUI?.fillDrawer();
  }

  function closeChat(silent: boolean) {
    clearInterval(headTick);
    headTick = null;
    if (rec) stopRec(false);
    setTyping(false);
    if (msgQuery) {
      msgQuery.off('child_added', onChildAdded);
      msgQuery.off('child_changed', onChildChanged);
    }
    if (msgBase) msgBase.off('child_removed', onChildRemoved);
    msgQuery = null;
    msgBase = null;
    chatId = null;
    peerUid = null;
    closeReact();
    clearReply();
    closePick();
    closeCompose();
    closeStSheet();
    if (!silent) profileUI?.closeDrawer();
    $('#typingBub')?.remove();
    audioPool.forEach(a => {
      try {
        a.pause();
      } catch (_) {}
    });
    audioPool.clear();
    live.forEach(e => {
      try {
        e.node.remove();
      } catch (_) {}
    });
    live.clear();
    updateNone();
    if ($('#gateBanner')) $('#gateBanner')!.hidden = true;
    $('#scFab')?.classList.remove('on');
    if ($('#upFab')) $('#upFab')!.hidden = true;
    if (!silent) {
      document.body.classList.remove('in-chat');
      if ($('#chatEmpty')) $('#chatEmpty')!.hidden = false;
      if ($('#chatLive')) $('#chatLive')!.hidden = true;
      setMsgDisabled(true);
      if ($('#sendBtn')) ($('#sendBtn') as HTMLButtonElement).disabled = true;
      hideNativeInput();
      renderList();
      if (
        !document.body.classList.contains('tab-updates') &&
        !document.body.classList.contains('tab-explore')
      ) {
        document.body.classList.add('tab-chats');
      }
    }
  }

  $('#backBtn')?.addEventListener('click', () => closeChat(false));

  function updateVdBadge() {
    const t = $('#vdTxt');
    if (t) t.textContent = fmtTTL(((usersMap[myUid || ''] || {}).selfDestruct) || 40);
  }
  $('#vdBadge')?.addEventListener('click', () => {
    if (myUid) openProfile(myUid);
  });

  function updateGate() {
    const g = $('#gateBanner');
    if (!peerUid) {
      if (g) g.hidden = true;
      return;
    }
    const b1 = iBlocked(peerUid);
    const b2 = blockedMe(peerUid);
    setMsgDisabled(b1 || b2);
    if ($('#sendBtn')) ($('#sendBtn') as HTMLButtonElement).disabled = b1 || b2;
    if ($('#micBtn')) ($('#micBtn') as HTMLButtonElement).disabled = b1 || b2;
    if (!g) return;
    if (b1) {
      g.hidden = false;
      $('#gateTxt')!.textContent = 'You blocked this account — unblock from Privacy settings to chat.';
    } else if (b2) {
      g.hidden = false;
      $('#gateTxt')!.textContent = 'This account is currently unavailable.';
    } else {
      g.hidden = true;
    }
  }

  function paintChatHead() {
    if (!peerUid) return;
    const u = usersMap[peerUid] || {};
    const name = u.name || peerName;
    if ($('#chName')) $('#chName')!.textContent = name;
    const st = $('#chState');
    if (st) {
      if (peerTyping()) {
        st.textContent = 'typing…';
        st.className = 'mono typing';
      } else {
        st.textContent = u.online ? 'Active now' : fmtSeen(u.lastSeen);
        st.className = 'mono' + (u.online ? ' on' : '');
      }
    }
    const av = $('#chAvatar');
    paintAv(av, peerUid, name);
    if (av) {
      let dot = av.querySelector('.dot');
      if (!dot) {
        dot = document.createElement('span');
        dot.className = 'dot';
        av.appendChild(dot);
      }
      dot.className = 'dot' + (u.online ? ' on' : '');
    }
  }

  $('#chAvatar')?.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    if (peerUid) openProfile(peerUid);
  });
  $('#chMetaClick')?.addEventListener('click', () => {
    if (!peerUid) return;
    if (window.innerWidth >= 1100) profileUI?.toggleDrawer();
    else openProfile(peerUid);
  });
  $('#chatProfileShortcut')?.addEventListener('click', () => {
    if (!peerUid) return;
    if (window.innerWidth >= 1100) profileUI?.toggleDrawer();
    else openProfile(peerUid);
  });
  $('#cidOpenFullBtn')?.addEventListener('click', () => {
    if (peerUid) openProfile(peerUid);
  });
  $('#meAvatar')?.addEventListener('click', () => myUid && openProfile(myUid));
  $('#railMeAvatar')?.addEventListener('click', () => myUid && openProfile(myUid));

  function sweepExpired() {
    if (!chatId) return;
    db.ref('chats/' + chatId + '/messages')
      .orderByChild('createdAt')
      .endAt(now() - MIN_TTL)
      .limitToLast(150)
      .once('value')
      .then((s: any) => {
        s.forEach((c: any) => {
          const v = c.val();
          if (v && typeof v.createdAt === 'number' && v.createdAt + (v.ttl || TTL) < now()) {
            c.ref.remove();
          }
        });
      })
      .catch(() => {});
  }

  function mediaTile(kind: string, v: any, onOpen: () => void) {
    const t = document.createElement('div');
    t.className = 'mtile';
    if (kind === 'video') {
      const vid = document.createElement('video');
      vid.src = v.url + '#t=0.3';
      vid.preload = 'metadata';
      vid.muted = true;
      t.appendChild(vid);
      const p = document.createElement('div');
      p.className = 'vplay';
      p.innerHTML = '<i>' + PLAY_SVG + '</i>';
      t.appendChild(p);
      if (v.dur) {
        const d = document.createElement('span');
        d.className = 'vdur';
        d.textContent = fmtDur(v.dur);
        t.appendChild(d);
      }
    } else {
      const img = document.createElement('img');
      img.src = v.url;
      img.alt = kind;
      img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      t.appendChild(img);
      if (kind === 'gif') {
        const g = document.createElement('span');
        g.className = 'gtag';
        g.textContent = 'GIF';
        t.appendChild(g);
      }
    }
    t.addEventListener('click', onOpen);
    return t;
  }

  function onChildAdded(s: any) {
    const v = s.val();
    if (!v || typeof v.createdAt !== 'number') return;
    const mt = v.ttl || TTL;
    if (v.createdAt + mt < now() - 400) {
      s.ref.remove();
      return;
    }
    const mine = v.from === myUid;
    if (!mine && peerUid) {
      setRecent(peerUid, {
        n: peerName,
        t: mediaLabel(v),
        at: v.createdAt,
        cat: v.createdAt,
        from: 'them',
      });
    }
    const msgsEl = $('#msgs');
    if (!msgsEl) return;

    const d = new Date(v.createdAt);
    let newDay = false;
    if (d.getDate() !== lastTs) {
      lastTs = d.getDate();
      newDay = true;
      const sep = document.createElement('div');
      sep.className = 'daysep';
      const td = new Date();
      sep.textContent =
        d.toDateString() === td.toDateString()
          ? 'Today'
          : d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
      msgsEl.appendChild(sep);
    }

    const grouped =
      !newDay &&
      lastBubbleFrom === v.from &&
      v.createdAt - lastBubbleTime < 120000;
    lastBubbleFrom = v.from;
    lastBubbleTime = v.createdAt;

    const node = document.createElement('div');
    const kind = v.type || 'text';
    const isPic = kind === 'photo' || kind === 'gif';
    const isVid = kind === 'video';
    node.className =
      'bubble new ' +
      (mine ? 'mine' : 'theirs') +
      (grouped ? ' grouped-prev' : '') +
      ((isPic || isVid) && !v.viewOnce ? ' media' : '') +
      (kind === 'sticker' || kind === 'emoji' ? ' media' : '');

    if (v.reply) {
      const q = document.createElement('div');
      q.className = 'quote';
      const qb = document.createElement('b');
      qb.textContent = v.reply.n || '';
      const qt = document.createElement('span');
      qt.textContent = v.reply.t || '';
      q.append(qb, qt);
      if (v.replyId) {
        q.addEventListener('click', () => {
          const t = live.get(v.replyId);
          if (t && !t.dying) {
            t.node.scrollIntoView({ behavior: 'smooth', block: 'center' });
            t.node.classList.remove('flash');
            void t.node.offsetWidth;
            t.node.classList.add('flash');
          } else {
            toast('Original message has already vanished');
          }
        });
      }
      node.appendChild(q);
    }

    if (v.viewOnce) {
      paintSealed(node, { key: s.key, ref: s.ref, data: v, mine });
    } else if (isPic) {
      node.appendChild(mediaTile(kind, v, () => openViewer(s.key)));
      if (v.caption) {
        const c = document.createElement('div');
        c.className = 'mcap';
        emojify(c, v.caption);
        node.appendChild(c);
      }
    } else if (isVid) {
      node.appendChild(mediaTile('video', v, () => openPlayer(s.key)));
      if (v.caption) {
        const c = document.createElement('div');
        c.className = 'mcap';
        emojify(c, v.caption);
        node.appendChild(c);
      }
    } else if (kind === 'voice') {
      node.appendChild(voiceBubble(v, s.key));
    } else if (kind === 'sticker') {
      node.appendChild(stickerDOM(v.code, 112));
    } else if (kind === 'emoji') {
      node.classList.add('emjb');
      [...String(v.e || '😀')].forEach(ch => {
        if (!/\p{Extended_Pictographic}/u.test(ch)) return;
        const b = document.createElement('span');
        b.className = 'bmj';
        const inner = document.createElement('span');
        inner.textContent = ch;
        applyAmbient(inner, ch, 1, 1);
        b.appendChild(inner);
        node.appendChild(b);
      });
    } else {
      const tx = document.createElement('div');
      tx.className = 'mtext';
      emojify(tx, v.text || '');
      node.appendChild(tx);
    }

    const meta = document.createElement('div');
    meta.className = 'mmeta';
    meta.innerHTML =
      '<svg class="ring" viewBox="0 0 16 16"><circle class="tr" cx="8" cy="8" r="6"/><circle class="pr" cx="8" cy="8" r="6"/></svg>' +
      '<span class="mtime">' +
      fmtTime(v.createdAt) +
      '</span>' +
      (mine ? '<span class="tkwrap">' + ticksSVG(v.status || 'sent') + '</span>' : '');
    node.appendChild(meta);

    const sic = document.createElement('span');
    sic.className = 'swipeic';
    sic.innerHTML = REPLY_SVG;
    node.appendChild(sic);

    const e = { node, data: v, ref: s.ref, dying: false, pr: node.querySelector('.pr') };
    live.set(s.key, e);
    wireBubble(node, s.key);
    renderReacts(e);
    wireMediaMenu(node, s.key);

    const near = msgsEl.scrollHeight - msgsEl.scrollTop - msgsEl.clientHeight < 180;
    msgsEl.appendChild(node);
    const tb = $('#typingBub');
    if (tb) msgsEl.appendChild(tb);
    if (mine || near) {
      requestAnimationFrame(() => {
        msgsEl.scrollTop = msgsEl.scrollHeight;
      });
    } else {
      $('#scFab')?.classList.add('on');
    }
    updateNone();
    if (isPic || isVid) profileUI?.fillDrawer();
    if (!mine && v.to === myUid) {
      advance(s.key, document.hidden ? 'delivered' : 'read');
    }
  }

  function voiceBubble(v: any, key: string) {
    const b = document.createElement('div');
    b.className = 'vbub';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'vmic';
    btn.innerHTML = PLAY_SVG;
    const wave = document.createElement('div');
    wave.className = 'vwave';
    const NB = 22;
    const h = hashStr(v.url || 'v');
    const bars: HTMLElement[] = [];
    for (let i = 0; i < NB; i++) {
      const bar = document.createElement('i');
      bar.style.height = 6 + ((h >> i) % 18) + 'px';
      wave.appendChild(bar);
      bars.push(bar);
    }
    const tm = document.createElement('span');
    tm.className = 'vtime';
    const dur = v.dur || 0;
    tm.textContent = fmtDur(dur);
    b.append(btn, wave, tm);
    let audio: HTMLAudioElement | null = null;
    let playing = false;
    const paint = (frac: number) => {
      const on = Math.round(frac * NB);
      bars.forEach((bar, i) => bar.classList.toggle('on', i < on));
    };
    btn.addEventListener('click', async ev => {
      ev.stopPropagation();
      if (!audio) {
        audio = new Audio(v.url);
        audioPool.add(audio);
        audio.addEventListener('ended', () => {
          playing = false;
          btn.innerHTML = PLAY_SVG;
          paint(0);
          tm.textContent = fmtDur(dur);
        });
        audio.addEventListener('timeupdate', () => {
          if (audio && audio.duration) {
            paint(audio.currentTime / audio.duration);
            tm.textContent = fmtDur(audio.duration - audio.currentTime);
          }
        });
      }
      audioPool.forEach(a => {
        if (a !== audio) {
          try {
            a.pause();
          } catch (_) {}
        }
      });
      if (playing) {
        audio.pause();
        playing = false;
        btn.innerHTML = PLAY_SVG;
      } else {
        try {
          await audio.play();
          playing = true;
          btn.innerHTML = PAUSE_SVG;
          markSeen(key);
        } catch (_) {}
      }
    });
    return b;
  }

  function paintSealed(node: HTMLElement, c: { key: string; ref: any; data: any; mine: boolean }) {
    const mine = c.mine;
    const opened = !!c.data.openedOnce;
    node.querySelectorAll('.vo-seal,.vo-done').forEach(x => x.remove());
    if (mine) {
      const d = document.createElement('div');
      d.className = 'vo-done';
      d.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg><span>View once · ' +
        (opened ? 'Opened' : 'Sent') +
        '</span>';
      node.appendChild(d);
    } else if (opened) {
      const d = document.createElement('div');
      d.className = 'vo-done';
      d.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg><span>Opened</span>';
      node.appendChild(d);
    } else {
      const b = document.createElement('div');
      b.className = 'vo-seal';
      b.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.6"/></svg><span>View once media · Tap to open</span>';
      b.addEventListener('click', () => {
        c.ref.child('openedOnce').set(true).catch(() => {});
        markSeen(c.key);
        if (c.data.type === 'video') openPlayer(null, c.data);
        else {
          lbList = [[null, { data: c.data, ref: null, dying: false }]];
          lbIdx = 0;
          if ($('#lb')) $('#lb')!.hidden = false;
          paintLB(true);
        }
        b.remove();
        const d = document.createElement('div');
        d.className = 'vo-done';
        d.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg><span>Opened</span>';
        node.appendChild(d);
      });
      node.appendChild(b);
    }
  }

  function onChildChanged(s: any) {
    const e = live.get(s.key);
    if (!e) return;
    e.data = s.val();
    const tk = e.node.querySelector('.tkwrap');
    if (tk) tk.innerHTML = ticksSVG(e.data.status || 'sent');
    renderReacts(e);
    if (e.data.viewOnce) {
      paintSealed(e.node, { key: s.key, ref: s.ref, data: e.data, mine: e.data.from === myUid });
    }
  }

  function onChildRemoved(s: any) {
    dissolve(s.key, false);
  }

  const ORDER: Record<string, number> = { sent: 0, delivered: 1, read: 2 };
  function advance(key: string, status: string) {
    const e = live.get(key);
    if (!e || e.dying) return;
    const cur = ORDER[e.data.status || 'sent'] || 0;
    if (ORDER[status] > cur) {
      e.data = Object.assign({}, e.data, { status });
      e.ref.child('status').set(status).catch(() => {});
      const tk = e.node.querySelector('.tkwrap');
      if (tk) tk.innerHTML = ticksSVG(status);
    }
  }

  function markSeen(key: string | null) {
    if (!key) return;
    const e = live.get(key);
    if (!e || e.dying || e.data.from === myUid || e.data.to !== myUid) return;
    advance(key, 'read');
  }

  function markAllRead() {
    if (!peerUid || document.hidden) return;
    live.forEach((e, key) => {
      if (e.data.from === peerUid && e.data.to === myUid) advance(key, 'read');
    });
  }

  function dissolve(key: string, fromDb: boolean) {
    const e = live.get(key);
    if (!e || e.dying) return;
    if (reactKey === key) closeReact();
    if (replyTarget && replyTarget.id === key) clearReply();
    e.dying = true;
    e.node.classList.add('dissolve');
    if (fromDb) e.ref.remove().catch(() => {});
    setTimeout(() => {
      e.node.remove();
      live.delete(key);
      updateNone();
      profileUI?.fillDrawer();
    }, 580);
  }

  function updateNone() {
    const nm = $('#noneMsg');
    if (nm) nm.style.display = $('#msgs')?.querySelector('.bubble') ? 'none' : '';
  }

  function openMediaMenu(key: string, x: number, y: number) {
    const e = live.get(key);
    if (!e || e.dying) return;
    const v = e.data;
    const mine = v.from === myUid;
    const items: { label: string; icon: string; danger?: boolean; fn: () => void }[] = [];
    if (v.type === 'voice') {
      items.push({ label: 'Download audio', icon: DL_SVG, fn: () => saveMedia(v) });
    } else {
      items.push({
        label: v.type === 'video' ? 'Play video' : 'Open full screen',
        icon: EYE_SVG,
        fn: () => (v.type === 'video' ? openPlayer(key) : openViewer(key)),
      });
      items.push({ label: 'Save to device', icon: DL_SVG, fn: () => saveMedia(v) });
      items.push({
        label: 'Forward / Resend',
        icon: RE_SVG,
        fn: () => {
          sendMsg({ type: v.type, url: v.url, pid: v.pid, w: v.w, h: v.h, dur: v.dur });
          toast('Media resent');
        },
      });
      items.push({ label: 'Report media', icon: FLAG_SVG, danger: true, fn: () => toast('Media reported') });
    }
    if (mine) {
      items.push({
        label: 'Delete for everyone',
        icon: TRASH_SVG,
        danger: true,
        fn: () => {
          e.ref.remove();
          toast('Message deleted for both');
        },
      });
    }
    openCtx(items, x, y);
  }

  function wireMediaMenu(node: HTMLElement, key: string) {
    const el = node.querySelector('.mtile') as HTMLElement | null;
    if (!el) return;
    const fire = (x: number, y: number) =>
      openMediaMenu(key, Math.min(x, innerWidth - 235), Math.min(y + 6, innerHeight - 280));
    el.addEventListener('contextmenu', ev => {
      ev.preventDefault();
      fire(ev.clientX, ev.clientY);
    });
    let lp: any = null;
    el.addEventListener('pointerdown', ev => {
      if (ev.pointerType === 'mouse') return;
      lp = setTimeout(() => {
        lp = null;
        try {
          navigator.vibrate?.(10);
        } catch (_) {}
        fire(ev.clientX, ev.clientY);
      }, 450);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev =>
      el.addEventListener(ev, () => {
        if (lp) {
          clearTimeout(lp);
          lp = null;
        }
      })
    );
  }

  /* Reactions & Replies */
  function renderReacts(e: any) {
    const r = e.data.reacts || {};
    const entries = Object.entries(r).filter(([, v]) => v);
    let box = e.node.querySelector('.reacts') as HTMLButtonElement | null;
    if (!entries.length) {
      if (box) box.remove();
      return;
    }
    if (!box) {
      box = document.createElement('button');
      box.type = 'button';
      box.className = 'reacts';
      box.addEventListener('click', () => {
        if ((e.data.reacts || {})[myUid || '']) {
          e.ref.child('reacts/' + myUid).remove().catch(() => {});
        }
      });
      e.node.appendChild(box);
    }
    const uniq = [...new Set(entries.map(([, v]) => v as string))];
    box.textContent = uniq.slice(0, 3).join('') + (entries.length > 1 ? ' ' + entries.length : '');
    box.title = entries
      .map(([uid]) => (uid === myUid ? 'You' : (usersMap[uid] || {}).name || 'User'))
      .join(', ');
  }

  const reactBar = $('#reactBar');
  if (reactBar) {
    reactBar.innerHTML = '';
    REACTS.forEach(em => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = em;
      b.dataset.e = em;
      reactBar.appendChild(b);
    });
    reactBar.addEventListener('click', ev => {
      const b = (ev.target as HTMLElement).closest('button[data-e]') as HTMLButtonElement | null;
      if (!b) return;
      const e = reactKey ? live.get(reactKey) : null;
      if (e && !e.dying) {
        const cur = (e.data.reacts || {})[myUid || ''];
        if (cur === b.dataset.e) e.ref.child('reacts/' + myUid).remove().catch(() => {});
        else e.ref.child('reacts/' + myUid).set(b.dataset.e).catch(() => {});
      }
      closeReact();
    });
  }

  function openReact(key: string) {
    const e = live.get(key);
    if (!e || e.dying || !reactBar) return;
    reactKey = key;
    reactBar.classList.add('on');
    const r = e.node.getBoundingClientRect();
    const bw = reactBar.offsetWidth;
    const bh = reactBar.offsetHeight;
    reactBar.style.left =
      Math.max(10, Math.min(r.left + r.width / 2 - bw / 2, innerWidth - bw - 10)) + 'px';
    reactBar.style.top = (r.top - bh - 10 < 8 ? r.bottom + 10 : r.top - bh - 10) + 'px';
  }
  function closeReact() {
    reactKey = null;
    reactBar?.classList.remove('on');
  }
  document.addEventListener('pointerdown', ev => {
    const t = ev.target as HTMLElement;
    if (reactBar?.classList.contains('on') && !reactBar.contains(t) && !t.closest('.bubble')) {
      closeReact();
    }
  });

  $('#msgs')?.addEventListener(
    'scroll',
    () => {
      closeReact();
      const m = $('#msgs')!;
      $('#scFab')?.classList.toggle('on', m.scrollHeight - m.scrollTop - m.clientHeight > 300);
    },
    { passive: true }
  );
  $('#scFab')?.addEventListener('click', () => {
    $('#msgs')?.scrollTo({ top: $('#msgs')!.scrollHeight, behavior: 'smooth' });
  });

  function setReply(key: string) {
    const e = live.get(key);
    if (!e || e.dying) return;
    const mine = e.data.from === myUid;
    const name = mine
      ? firstName(myProfile ? myProfile.name : 'You')
      : firstName((usersMap[e.data.from] || {}).name || peerName);
    replyTarget = { id: key, n: name, t: mediaLabel(e.data).slice(0, 140) };
    if ($('#rbName')) $('#rbName')!.textContent = 'Replying to ' + name;
    if ($('#rbText')) $('#rbText')!.textContent = replyTarget.t;
    if ($('#replyBar')) $('#replyBar')!.hidden = false;
    focusMsg();
  }
  function clearReply() {
    replyTarget = null;
    if ($('#replyBar')) $('#replyBar')!.hidden = true;
  }
  $('#rbCancel')?.addEventListener('click', clearReply);

  function wireBubble(node: HTMLElement, key: string) {
    const ha = document.createElement('span');
    ha.className = 'hoveracts';
    ha.innerHTML =
      '<button type="button" class="hbtn" data-act="reply" title="Reply">' +
      REPLY_SVG +
      '</button><button type="button" class="hbtn" data-act="react" title="React">' +
      SMILE_SVG +
      '</button>';
    ha.addEventListener('pointerdown', ev => ev.stopPropagation());
    ha.addEventListener('click', ev => {
      const b = (ev.target as HTMLElement).closest('.hbtn') as HTMLButtonElement | null;
      if (!b) return;
      b.dataset.act === 'reply' ? setReply(key) : openReact(key);
    });
    node.appendChild(ha);

    let pid: number | null = null;
    let sx = 0;
    let sy = 0;
    let dx = 0;
    let swiping = false;
    let lpT: any = null;
    const sic = node.querySelector('.swipeic') as HTMLElement;

    node.addEventListener('pointerdown', ev => {
      if (ev.button) return;
      pid = ev.pointerId;
      sx = ev.clientX;
      sy = ev.clientY;
      dx = 0;
      swiping = false;
      clearTimeout(lpT);
      const t = ev.target as HTMLElement;
      if (ev.pointerType !== 'mouse' && !t.closest('.mtile') && !t.closest('.vbub')) {
        lpT = setTimeout(() => {
          lpT = null;
          try {
            navigator.vibrate?.(8);
          } catch (_) {}
          openReact(key);
        }, 450);
      }
    });

    node.addEventListener('pointermove', ev => {
      if (pid !== ev.pointerId) return;
      const mx = ev.clientX - sx;
      const my = ev.clientY - sy;
      if (!swiping) {
        if (Math.abs(mx) > 7 && Math.abs(mx) > Math.abs(my)) {
          swiping = true;
          clearTimeout(lpT);
          lpT = null;
          try {
            node.setPointerCapture(pid);
          } catch (_) {}
        } else if (Math.abs(my) > 8) {
          clearTimeout(lpT);
          lpT = null;
        }
      }
      if (swiping) {
        const raw = Math.max(-130, Math.min(130, mx));
        const T = 54;
        const past = Math.max(0, Math.abs(raw) - T);
        const eased = Math.min(T, Math.abs(raw)) + past * 0.35;
        dx = raw < 0 ? -eased : eased;
        node.style.transform = `translateX(${dx}px)`;
        const prog = Math.min(1, Math.abs(dx) / T);
        sic.style.opacity = String(prog);
        sic.classList.toggle('l', dx > 0);
        sic.classList.toggle('r', dx < 0);
        const armed = Math.abs(dx) >= T;
        sic.classList.toggle('armed', armed);
      }
    });

    const end = (ev: PointerEvent) => {
      if (pid !== ev.pointerId) return;
      clearTimeout(lpT);
      lpT = null;
      pid = null;
      if (swiping) {
        if (Math.abs(dx) >= 54) {
          setReply(key);
          try {
            navigator.vibrate?.(12);
          } catch (_) {}
        }
        node.style.transition = 'transform .22s cubic-bezier(.3,1.4,.4,1)';
        node.style.transform = '';
        sic.style.opacity = '0';
        sic.classList.remove('armed');
        setTimeout(() => {
          node.style.transition = '';
        }, 230);
        swiping = false;
      }
    };
    node.addEventListener('pointerup', end);
    node.addEventListener('pointercancel', end);
  }

  /* Vanish Countdown Ticker */
  (function ticker() {
    live.forEach((e, key) => {
      if (e.dying) return;
      const mt = e.data.ttl || TTL;
      const rem = e.data.createdAt + mt - now();
      if (rem <= 0) {
        dissolve(key, true);
        return;
      }
      if (e.pr) e.pr.style.strokeDashoffset = (RING_C * (1 - rem / mt)).toFixed(2);
      const fadeWin = Math.min(10000, mt * 0.25);
      if (rem <= fadeWin) {
        const k = rem / fadeWin;
        e.node.style.opacity = (0.24 + 0.76 * k).toFixed(3);
        e.node.style.filter = 'blur(' + ((1 - k) * 2).toFixed(2) + 'px)';
        e.node.classList.add('ending');
      } else if (e.node.classList.contains('ending')) {
        e.node.classList.remove('ending');
        e.node.style.opacity = '';
        e.node.style.filter = '';
      }
    });
    requestAnimationFrame(ticker);
  })();

  function stickerDOM(code: string, size = 112) {
    const s = STICKERS[code] || STICKERS.love;
    const box = document.createElement('div');
    box.className = 'stk';
    const px = size / 118;
    box.style.width = box.style.height = size + 'px';
    const main = document.createElement('span');
    main.className = 'stk-m';
    main.textContent = s.m;
    main.style.fontSize = Math.round(80 * px) + 'px';
    main.style.animationName = s.fx;
    box.appendChild(main);
    (s.d || []).forEach(dec => {
      const [em, del, dsz, l, t, anim] = dec;
      const sp = document.createElement('span');
      sp.className = 'stk-d stk-' + (anim || 'spark');
      sp.textContent = em;
      sp.style.fontSize = Math.round(dsz * px) + 'px';
      sp.style.left = l + '%';
      sp.style.top = t + '%';
      sp.style.animationDelay = del + 's';
      box.appendChild(sp);
    });
    return box;
  }

  /* Unified Picker: Emoji + Animated Stickers + GIF Library */
  const pickPanel = $('#pickPanel');
  const emojiBtn = $('#emojiBtn');
  const gifTriggerBtn = $('#gifTriggerBtn');
  let stkBuilt = false;
  let currentGifAction = 'hug';
  let gifLoading = false;

  const TONES = ['', '\u{1F3FB}', '\u{1F3FC}', '\u{1F3FD}', '\u{1F3FE}', '\u{1F3FF}'];
  const TCOL = ['#FFCC33', '#F7DFC7', '#E8C39E', '#C79A6B', '#9A6B45', '#5C3B28'];
  let tone = 0;
  let curEmojiCat = 'smileys';
  const MB = new Set(Array.from(EMOJI_DATA.mb));
  try {
    tone = Number(localStorage.getItem('vc_tone') || 0);
  } catch (_) {}

  function getRecentEmojis(): string[] {
    try {
      return JSON.parse(localStorage.getItem('vc_recent') || '[]');
    } catch (_) {
      return [];
    }
  }
  function addRecentEmoji(e: string) {
    try {
      const r = getRecentEmojis().filter(x => x !== e);
      r.unshift(e);
      localStorage.setItem('vc_recent', JSON.stringify(r.slice(0, 40)));
    } catch (_) {}
  }
  function skinEmoji(e: string) {
    if (!tone) return e;
    const a = Array.from(e);
    if (MB.has(a[0]) && (a.length === 1 || (a.length === 2 && a[1] === '\uFE0F'))) {
      return a[0] + TONES[tone];
    }
    return e;
  }

  function initEmojiTab() {
    const cb = $('#epCats');
    const tb = $('#epTone');
    const gr = $('#epGrid');
    if (!cb || !tb || !gr || cb.dataset.built) return;
    cb.dataset.built = '1';
    const cats = [{ id: 'recent', n: 'Recent', i: '🕘' }, ...EMOJI_DATA.cats];
    cats.forEach(c => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.c = c.id;
      b.textContent = c.i;
      b.title = c.n;
      cb.appendChild(b);
    });
    TONES.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.t = String(i);
      b.style.background = TCOL[i];
      tb.appendChild(b);
    });
    cb.addEventListener('click', e => {
      const b = (e.target as HTMLElement).closest('button');
      if (!b || !b.dataset.c) return;
      curEmojiCat = b.dataset.c;
      fillEmojiGrid();
    });
    tb.addEventListener('click', e => {
      const b = (e.target as HTMLElement).closest('button');
      if (!b || b.dataset.t === undefined) return;
      tone = Number(b.dataset.t);
      try {
        localStorage.setItem('vc_tone', String(tone));
      } catch (_) {}
      fillEmojiGrid();
    });
    gr.addEventListener('click', e => {
      const b = (e.target as HTMLElement).closest('.epb') as HTMLButtonElement | null;
      if (!b || !b.dataset.e) return;
      const em = b.dataset.e;
      addRecentEmoji(em);
      sendMsg({ type: 'emoji', e: em });
      closePick();
    });
  }

  function fillEmojiGrid() {
    const cb = $('#epCats');
    const tb = $('#epTone');
    const gr = $('#epGrid');
    if (!cb || !tb || !gr) return;
    Array.from(cb.children).forEach(b =>
      b.classList.toggle('on', (b as HTMLElement).dataset.c === curEmojiCat)
    );
    Array.from(tb.children).forEach((b, i) => b.classList.toggle('on', i === tone));
    const foundCat = EMOJI_DATA.cats.find(c => c.id === curEmojiCat);
    const list =
      curEmojiCat === 'recent'
        ? getRecentEmojis()
        : foundCat
        ? foundCat.e.split(' ').filter(Boolean)
        : [];
    const f = document.createDocumentFragment();
    if (!list.length) {
      const p = document.createElement('div');
      p.className = 'ep-empty';
      p.textContent = 'Recently sent emojis will appear here.';
      f.appendChild(p);
    } else {
      list.forEach(e => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'epb';
        const s = document.createElement('span');
        s.textContent = curEmojiCat === 'recent' ? e : skinEmoji(e);
        b.appendChild(s);
        b.dataset.e = s.textContent;
        f.appendChild(b);
      });
    }
    gr.innerHTML = '';
    gr.appendChild(f);
    gr.scrollTop = 0;
  }

  function buildStickers() {
    const g = $('#stkGrid');
    if (!g || stkBuilt) return;
    g.innerHTML = '';
    Object.keys(STICKERS).forEach(code => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'stkbtn';
      b.appendChild(stickerDOM(code, 56));
      b.addEventListener('click', () => {
        closePick();
        sendMsg({ type: 'sticker', code });
      });
      g.appendChild(b);
    });
    stkBuilt = true;
  }

  function buildGifCategories() {
    const chips = $('#gifChips');
    if (!chips || chips.dataset.built) return;
    chips.dataset.built = '1';
    GIF_ACTIONS.forEach((a, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'gif-chip' + (i === 0 ? ' on' : '');
      b.textContent = a.label;
      b.addEventListener('click', () => {
        chips.querySelectorAll('.gif-chip').forEach(c => c.classList.remove('on'));
        b.classList.add('on');
        currentGifAction = a.id;
        const s = $('#gifSearch') as HTMLInputElement | null;
        if (s) s.value = '';
        loadGifs();
      });
      chips.appendChild(b);
    });
  }

  async function fetchOneGif(action: string) {
    const bust = Date.now() + Math.random().toString(36).slice(2);
    const urls = [
      'https://nekos.life/api/v2/img/' + encodeURIComponent(action) + '?t=' + bust,
      'https://api.waifu.pics/sfw/' + encodeURIComponent(action),
    ];
    for (const u of urls) {
      try {
        const res = await fetch(u, { method: 'GET', mode: 'cors', cache: 'no-store' });
        if (!res.ok) continue;
        const data = await res.json();
        if (data?.url) {
          return { preview: data.url, full: data.url, title: action };
        }
      } catch (_) {}
    }
    return null;
  }

  async function loadGifs(forceQuery?: string) {
    if (gifLoading) return;
    gifLoading = true;
    const grid = $('#gifGrid');
    const status = $('#gifStatus');
    if (!grid || !status) {
      gifLoading = false;
      return;
    }
    status.hidden = false;
    status.textContent = 'Loading GIFs…';
    grid.innerHTML = '';

    let action = currentGifAction;
    const q = (
      forceQuery ||
      (($('#gifSearch') as HTMLInputElement | null)?.value || '')
    )
      .trim()
      .toLowerCase();
    if (q) {
      const found = GIF_ACTIONS.find(
        a => a.id === q || a.label.toLowerCase() === q || q.includes(a.id)
      );
      action = found ? found.id : q.replace(/\s+/g, '');
    }

    const actionPool = [action];
    const extras = GIF_ACTIONS.map(a => a.id).filter(id => id !== action);
    while (actionPool.length < 5 && extras.length) {
      const idx = Math.floor(Math.random() * extras.length);
      actionPool.push(extras.splice(idx, 1)[0]);
    }

    const promises = Array.from({ length: 12 }, (_, i) =>
      fetchOneGif(actionPool[i % actionPool.length])
    );
    const results = await Promise.all(promises);
    const seen = new Set<string>();
    const unique: { preview: string; full: string; title: string }[] = [];
    for (const g of results) {
      if (g?.full && !seen.has(g.full)) {
        seen.add(g.full);
        unique.push(g);
      }
    }

    if (!unique.length) {
      status.hidden = false;
      status.textContent = 'Unable to load GIFs — check connection and retry.';
      gifLoading = false;
      return;
    }

    status.hidden = true;
    unique.forEach((g, idx) => {
      const item = document.createElement('div');
      item.className = 'gif-item';
      const img = document.createElement('img');
      img.src = g.preview + (g.preview.includes('?') ? '&' : '?') + 'cb=' + Date.now() + idx;
      img.loading = 'lazy';
      img.alt = g.title || 'GIF';
      img.referrerPolicy = 'no-referrer';
      img.onerror = () => {
        item.style.display = 'none';
      };
      item.appendChild(img);
      item.addEventListener('click', () => {
        closePick();
        sendMsg({
          type: 'gif',
          url: g.full,
          pid: '',
          w: 0,
          h: 0,
          caption: '',
          viewOnce: false,
        });
        toast('GIF sent');
      });
      grid.appendChild(item);
    });
    gifLoading = false;
  }

  let gifSearchTimer: any = null;
  $('#gifSearch')?.addEventListener('input', e => {
    clearTimeout(gifSearchTimer);
    const v = (e.target as HTMLInputElement).value.trim();
    gifSearchTimer = setTimeout(() => loadGifs(v || undefined), 400);
  });

  function switchPickTab(tab: 'emoji' | 'stickers' | 'gifs') {
    document.querySelectorAll('#pickPanel .ppt').forEach(b => {
      b.classList.toggle('active', (b as HTMLElement).dataset.pt === tab);
    });
    if ($('#ppEmj')) $('#ppEmj')!.hidden = tab !== 'emoji';
    if ($('#ppStk')) $('#ppStk')!.hidden = tab !== 'stickers';
    if ($('#ppGif')) $('#ppGif')!.hidden = tab !== 'gifs';
    emojiBtn?.classList.toggle('on', tab === 'emoji' && !pickPanel?.hidden);
    gifTriggerBtn?.classList.toggle('on', tab === 'gifs' && !pickPanel?.hidden);
    if (tab === 'emoji') {
      initEmojiTab();
      if (curEmojiCat === 'recent' && !getRecentEmojis().length) curEmojiCat = 'smileys';
      fillEmojiGrid();
    } else if (tab === 'stickers') {
      buildStickers();
    } else if (tab === 'gifs') {
      buildGifCategories();
      loadGifs();
    }
  }

  function openPick(tab: 'emoji' | 'stickers' | 'gifs' = 'emoji') {
    if (!pickPanel) return;
    pickPanel.hidden = false;
    switchPickTab(tab);
  }
  function closePick() {
    if (pickPanel) pickPanel.hidden = true;
    emojiBtn?.classList.remove('on');
    gifTriggerBtn?.classList.remove('on');
  }
  window.__openEmoji = () => openPick('emoji');
  window.__openGifLibrary = () => openPick('gifs');

  $('#pickPanel .pp-tabs')?.addEventListener('click', e => {
    const b = (e.target as HTMLElement).closest('.ppt') as HTMLElement | null;
    if (!b || !b.dataset.pt) return;
    switchPickTab(b.dataset.pt as 'emoji' | 'stickers' | 'gifs');
  });

  emojiBtn?.addEventListener('click', e => {
    e.stopPropagation();
    if (!pickPanel?.hidden && !$('#ppEmj')?.hidden) closePick();
    else openPick('emoji');
  });
  gifTriggerBtn?.addEventListener('click', e => {
    e.stopPropagation();
    if (!pickPanel?.hidden && !$('#ppGif')?.hidden) closePick();
    else openPick('gifs');
  });

  document.addEventListener('pointerdown', e => {
    if (!pickPanel || pickPanel.hidden) return;
    const t = e.target as HTMLElement;
    if (
      pickPanel.contains(t) ||
      emojiBtn?.contains(t) ||
      gifTriggerBtn?.contains(t)
    )
      return;
    closePick();
  });

  /* Attachment Sheet (#attSheet) */
  const attSheet = $('#attSheet');
  $('#pickBtn')?.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    closePick();
    if (attSheet) attSheet.hidden = false;
  });
  attSheet?.addEventListener('click', e => {
    if (e.target === attSheet) attSheet.hidden = true;
  });
  $('#attGallery')?.addEventListener('click', () => {
    if (attSheet) attSheet.hidden = true;
    const inp = $('#fileIn') as HTMLInputElement | null;
    if (inp) {
      inp.accept = 'image/*,image/gif,video/*';
      inp.click();
    }
  });
  $('#attCamera')?.addEventListener('click', () => {
    if (attSheet) attSheet.hidden = true;
    ($('#arCamFile') as HTMLInputElement | null)?.click();
  });
  $('#attGif')?.addEventListener('click', () => {
    if (attSheet) attSheet.hidden = true;
    openPick('gifs');
  });
  $('#attSticker')?.addEventListener('click', () => {
    if (attSheet) attSheet.hidden = true;
    openPick('stickers');
  });
  $('#attStatus')?.addEventListener('click', () => {
    if (attSheet) attSheet.hidden = true;
    ($('#stFileIn') as HTMLInputElement | null)?.click();
  });
  $('#attVoice')?.addEventListener('click', () => {
    if (attSheet) attSheet.hidden = true;
    if (!rec) startRec();
  });

  window.__openAttach = () => {
    if (attSheet) attSheet.hidden = false;
  };

  /* Header & Composer Camera Quick Capture */
  $('#arCamBtn')?.addEventListener('click', () => {
    ($('#arCamFile') as HTMLInputElement | null)?.click();
  });
  $('#composerCamBtn')?.addEventListener('click', () => {
    ($('#fileIn') as HTMLInputElement | null)?.click();
  });
  $('#arCamFile')?.addEventListener('change', e => {
    const inp = e.target as HTMLInputElement;
    const f = inp.files?.[0];
    inp.value = '';
    if (!f) return;
    fixMediaFile(f).then(cf => {
      if (cf.size > MAX_MB * 1048576) {
        toast(`File exceeds ${MAX_MB} MB limit`);
        return;
      }
      if (peerUid) {
        startCompose(cf, 'chat');
      } else {
        startCompose(cf, 'status');
      }
    });
  });

  /* Send Message */
  function pushMsg(payload: any) {
    if (!peerUid || !chatId || !myUid) return;
    const msg: Record<string, any> = Object.assign(
      {
        from: myUid,
        to: peerUid,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        ttl: myTTL(),
        status: 'sent',
      },
      payload
    );
    if (replyTarget) {
      msg.reply = { n: replyTarget.n, t: replyTarget.t };
      msg.replyId = replyTarget.id;
    }
    db.ref('chats/' + chatId + '/messages').push(msg);
    setRecent(peerUid, {
      n: peerName,
      t: mediaLabel(msg),
      at: now(),
      cat: now(),
      from: 'me',
      force: true,
    });
    setTyping(false);
    clearReply();
  }

  function sendMsg(payload: any) {
    if (!peerUid || iBlocked(peerUid) || blockedMe(peerUid)) {
      toast('Conversation is unavailable');
      return;
    }
    pushMsg(payload);
  }

  $('#composer')?.addEventListener('submit', e => {
    e.preventDefault();
    const text = getMsgText();
    if (!text || !peerUid || !chatId) return;
    if (iBlocked(peerUid) || blockedMe(peerUid)) {
      toast('Conversation is unavailable');
      return;
    }
    setMsgText('');
    const sb = $('#sendBtn');
    if (sb) {
      sb.classList.remove('pop');
      void sb.offsetWidth;
      sb.classList.add('pop');
    }
    if (isEmojiOnly(text) && countEmoji(text) <= 3) {
      sendMsg({ type: 'emoji', e: text.replace(/\s/g, '').slice(0, 9) });
      return;
    }
    sendMsg({ text: text.slice(0, 600) });
  });

  /* Native Android WebView Bridges */
  function useNativeComposer() {
    return !!(window.VanishAndroid && typeof window.VanishAndroid.showNativeComposer === 'function');
  }
  function showNativeInput() {
    const c = $('#composer');
    const liveEl = $('#chatLive');
    if (useNativeComposer()) {
      try {
        window.VanishAndroid.showNativeComposer();
        document.body.classList.add('native-composer');
        if (c) c.hidden = false;
        return;
      } catch (_) {}
    }
    if (c) {
      c.style.display = '';
      c.hidden = false;
    }
    if (liveEl) liveEl.style.paddingBottom = '';
    document.body.classList.remove('native-composer');
  }
  function hideNativeInput() {
    if (window.VanishAndroid && typeof window.VanishAndroid.hideNativeComposer === 'function') {
      try {
        window.VanishAndroid.hideNativeComposer();
      } catch (_) {}
    }
    const c = $('#composer');
    const liveEl = $('#chatLive');
    if (c) {
      c.style.display = '';
      c.hidden = false;
    }
    if (liveEl) liveEl.style.paddingBottom = '';
    document.body.classList.remove('native-composer');
  }

  window.__startVoice = () => {
    $('#micBtn')?.click();
  };
  window.__nativeSendText = (text: string) => {
    if (!text || !peerUid || !chatId) return;
    if (iBlocked(peerUid) || blockedMe(peerUid)) {
      toast('Conversation unavailable');
      return;
    }
    const trimmed = String(text).trim();
    if (!trimmed) return;
    if (isEmojiOnly(trimmed) && countEmoji(trimmed) <= 3) {
      sendMsg({ type: 'emoji', e: trimmed.replace(/\s/g, '').slice(0, 9) });
      return;
    }
    sendMsg({ text: trimmed.slice(0, 600) });
  };

  window.__onKeyboardMedia = (dataUrl: string) => {
    if (!dataUrl || !peerUid || isMsgDisabled()) return;
    try {
      const parts = String(dataUrl).split(',');
      const header = parts[0] || '';
      const mimeMatch = header.match(/data:([^;]+)/);
      let mime = mimeMatch?.[1] || 'image/gif';
      if (mime === 'application/octet-stream') mime = 'image/gif';
      const b64 = parts[1] || '';
      if (!b64) return;
      const byteChars = atob(b64);
      const byteArr = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
      const isGif = mime.includes('gif') || (byteArr[0] === 0x47 && byteArr[1] === 0x49);
      const ext = isGif ? 'gif' : mime.includes('png') ? 'png' : 'jpg';
      if (isGif) mime = 'image/gif';
      const f = new File([new Blob([byteArr], { type: mime })], 'keyboard.' + ext, { type: mime });
      if (f.size > MAX_MB * 1048576) {
        toast(`File exceeds ${MAX_MB} MB`);
        return;
      }
      directSendMedia(f, isGif ? 'gif' : 'photo');
    } catch (_) {}
  };
  window.__onNativeGif = (b64: string, mime?: string) => {
    if (!b64) return;
    window.__onKeyboardMedia?.('data:' + (mime || 'image/gif') + ';base64,' + b64);
  };
  window.__openNativeGifPicker = () => document.body.classList.add('nbt');
  window.__pollKeyboardGif = () => {
    let raw = '';
    try {
      raw = window.VanishAndroid?.getKeyboardGif?.() || '';
    } catch (_) {}
    if (!raw || raw.length < 8) {
      document.body.classList.remove('nbt');
      return;
    }
    const p = raw.indexOf('|');
    if (p < 1) return;
    window.__onKeyboardMedia?.('data:' + (raw.substring(0, p) || 'image/gif') + ';base64,' + raw.substring(p + 1));
  };

  /* WhatsApp Media Sharing Studio (#csheet) */
  const fileIn = $('#fileIn') as HTMLInputElement | null;
  fileIn?.addEventListener('change', () => {
    const f = fileIn.files?.[0];
    fileIn.value = '';
    if (!f) return;
    fixMediaFile(f).then(cf => {
      if (cf.size > MAX_MB * 1048576) {
        toast(`File exceeds ${MAX_MB} MB limit`);
        return;
      }
      if (cf.type === 'image/gif' || cf.name.toLowerCase().endsWith('.gif')) {
        directSendMedia(cf, 'gif');
      } else {
        startCompose(cf, 'chat');
      }
    });
  });

  mediaStudio = createMediaStudio({
    $,
    toast,
    getPeerInfo: () => ({ peerUid, peerName }),
    openFileReplace: () => fileIn?.click(),
    onCropRequest: (curFile, cb) => {
      window.openPhotoCrop?.(curFile, cb);
    },
    onSend: async opts => {
      const canChat = opts.sendToChat && !!peerUid && !iBlocked(peerUid) && !blockedMe(peerUid);
      const canStatus = opts.sendToStatus && !!myUid;
      if (!canChat && !canStatus) {
        toast('Unable to share media right now');
        return;
      }

      const pb = canChat ? pendingBubble(opts.file, opts.kind === 'video' ? 'video' : 'photo') : null;
      if (!pb && canStatus) toast('Uploading to Status…');

      try {
        const j = await cloudUpload(
          opts.file,
          p => {
            pb?.setProgress(p);
          },
          pb?.ctl
        );
        pb?.done();

        const isVidUpload = opts.file.type.startsWith('video');
        const finalUrl = isVidUpload
          ? transformCloudinaryVideoUrl(
              j.secure_url,
              opts.trimStart,
              opts.trimEnd,
              opts.vidDuration,
              opts.vidMuted
            )
          : j.secure_url;

        const clippedDur = isVidUpload
          ? Math.max(1, Math.round((opts.trimEnd - opts.trimStart) || j.duration || 0))
          : 0;

        if (canChat) {
          sendMsg({
            type: opts.kind,
            url: finalUrl,
            pid: j.public_id || '',
            w: j.width || 0,
            h: j.height || 0,
            dur: opts.kind === 'video' ? clippedDur : 0,
            caption: opts.caption,
            viewOnce: opts.viewOnce,
          });
        }

        if (canStatus && myUid) {
          const t = now();
          await db.ref('status/' + myUid + '/items').push({
            url: finalUrl,
            type: isVidUpload ? 'video' : 'photo',
            w: j.width || 0,
            h: j.height || 0,
            dur: clippedDur,
            caption: opts.caption.slice(0, 140),
            createdAt: t,
            exp: t + ST_TTL,
          });
          toast(canChat ? 'Sent to chat & published to Status' : 'Published to Status (12h)');
        }
      } catch (err: any) {
        if (pb) {
          if (err?.message !== 'cancelled') pb.fail('Upload failed: ' + (err?.message || ''));
          else pb.node.remove();
        } else {
          toast('Status upload failed: ' + (err?.message || ''));
        }
      }
    },
  });

  function startCompose(f: File, mode: 'chat' | 'status' = 'chat') {
    mediaStudio?.open(f, mode);
  }

  function closeCompose() {
    mediaStudio?.close();
  }

  /* Voice Recording */
  $('#micBtn')?.addEventListener('click', () => {
    if (($('#micBtn') as HTMLButtonElement | null)?.disabled) return;
    if (rec) stopRec(true);
    else startRec();
  });
  $('#recSend')?.addEventListener('click', () => stopRec(true));
  $('#recCancel')?.addEventListener('click', () => stopRec(false));

  async function startRec() {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      toast('Voice recording is not supported in this browser');
      return;
    }
    try {
      recStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch (_) {
      toast('Microphone permission is required for voice notes');
      return;
    }
    const track = recStream.getAudioTracks()[0];
    if (!track || track.readyState !== 'live') {
      toast('Microphone is busy or unavailable');
      recStream.getTracks().forEach(t => t.stop());
      return;
    }
    const CANDIDATES = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4;codecs=mp4a.40.2',
      'audio/mp4',
      'audio/ogg;codecs=opus',
    ];
    const mime =
      CANDIDATES.find(m => window.MediaRecorder.isTypeSupported?.(m)) || '';
    try {
      rec = new MediaRecorder(
        recStream,
        mime ? { mimeType: mime, audioBitsPerSecond: 64000 } : undefined
      );
    } catch (e: any) {
      toast('Could not start recorder');
      recStream.getTracks().forEach(t => t.stop());
      return;
    }
    recChunks = [];
    rec.ondataavailable = (e: any) => {
      if (e.data?.size) recChunks.push(e.data);
    };
    rec.onstop = async () => {
      recStream?.getTracks().forEach(t => t.stop());
      const wasSend = rec?._send;
      const outType = (recChunks[0] as Blob | undefined)?.type || mime || 'audio/webm';
      rec = null;
      if (!wasSend) {
        toast('Voice note cancelled');
        return;
      }
      if (!recChunks.length) return;
      const blob = new Blob(recChunks, { type: outType });
      if (blob.size < 1200) {
        toast('Recording was too short');
        return;
      }
      const dur = Math.max(1, Math.round((Date.now() - recT0) / 1000));
      const ext = outType.includes('mp4') ? 'm4a' : outType.includes('ogg') ? 'ogg' : 'webm';
      const file = new File([blob], 'voice_' + Date.now() + '.' + ext, { type: outType });
      if ($('#upFab')) $('#upFab')!.hidden = false;
      try {
        const j = await cloudUpload(file, p => {
          if ($('#upTxt')) $('#upTxt')!.textContent = 'Sending voice… ' + Math.round(p * 100) + '%';
        });
        if ($('#upFab')) $('#upFab')!.hidden = true;
        sendMsg({ type: 'voice', url: j.secure_url, pid: j.public_id || '', dur });
      } catch (err: any) {
        if ($('#upFab')) $('#upFab')!.hidden = true;
        toast('Voice upload failed');
      }
    };
    rec.start(250);
    recT0 = Date.now();
    if ($('#recBar')) $('#recBar')!.hidden = false;
    $('#micBtn')?.classList.add('rec');
    recTimer = setInterval(() => {
      const sec = (Date.now() - recT0) / 1000;
      if ($('#recTime')) $('#recTime')!.textContent = fmtDur(sec);
      if (sec > 120) stopRec(true);
    }, 200);
  }

  function stopRec(send: boolean) {
    if (!rec) return;
    rec._send = send;
    clearInterval(recTimer);
    if ($('#recBar')) $('#recBar')!.hidden = true;
    $('#micBtn')?.classList.remove('rec');
    try {
      rec.stop();
    } catch (_) {}
  }

  /* Image Lightbox (#lb) */
  function mediaList() {
    return [...live.entries()].filter(
      ([, e]) => !e.dying && (e.data.type === 'photo' || e.data.type === 'gif')
    );
  }
  function openViewer(key: string) {
    lbList = mediaList();
    lbIdx = Math.max(
      0,
      lbList.findIndex(([k]) => k === key)
    );
    if (!lbList.length) return;
    markSeen(key);
    markAllRead();
    if ($('#lb')) $('#lb')!.hidden = false;
    paintLB();
  }
  function paintLB(direct = false) {
    const item = lbList[lbIdx];
    if (!item) {
      closeLB();
      return;
    }
    const v = item[1].data;
    const img = $('#lbImg') as HTMLImageElement | null;
    if (!img) return;
    lbZoom = 1;
    lbTx = 0;
    lbTy = 0;
    img.classList.remove('drag');
    applyZoom();
    img.src = v.url || '';
    if ($('#lbName')) {
      $('#lbName')!.textContent =
        (v.from === myUid ? 'You' : (usersMap[v.from] || {}).name || peerName) +
        (v.type === 'gif' ? ' · GIF' : '');
    }
    if ($('#lbCap')) {
      $('#lbCap')!.textContent = v.caption || '';
      $('#lbCap')!.hidden = !v.caption;
    }
    if ($('#lbCount')) {
      $('#lbCount')!.textContent = direct ? '' : lbIdx + 1 + ' / ' + lbList.length;
    }
    if ($('#lbPrev')) $('#lbPrev')!.hidden = direct || lbIdx === 0;
    if ($('#lbNext')) $('#lbNext')!.hidden = direct || lbIdx === lbList.length - 1;
  }
  function openPhotoDirect(url: string, name?: string) {
    if (!url) return;
    lbList = [];
    lbIdx = 0;
    if ($('#lb')) $('#lb')!.hidden = false;
    const img = $('#lbImg') as HTMLImageElement | null;
    if (!img) return;
    lbZoom = 1;
    lbTx = 0;
    lbTy = 0;
    img.classList.remove('drag');
    applyZoom();
    img.src = url;
    if ($('#lbName')) $('#lbName')!.textContent = name || 'Profile photo';
    if ($('#lbCap')) $('#lbCap')!.hidden = true;
    if ($('#lbCount')) $('#lbCount')!.textContent = '';
    if ($('#lbPrev')) $('#lbPrev')!.hidden = true;
    if ($('#lbNext')) $('#lbNext')!.hidden = true;
  }
  function closeLB() {
    if ($('#lb')) $('#lb')!.hidden = true;
    const img = $('#lbImg') as HTMLImageElement | null;
    if (img) img.src = '';
  }
  function applyZoom() {
    const img = $('#lbImg');
    if (img) img.style.transform = `translate(${lbTx}px,${lbTy}px) scale(${lbZoom})`;
  }
  $('#lbX')?.addEventListener('click', closeLB);
  $('#lb')?.addEventListener('click', e => {
    if ((e.target as HTMLElement).id === 'lbStage' || (e.target as HTMLElement).id === 'lb') {
      closeLB();
    }
  });
  $('#lbPrev')?.addEventListener('click', () => {
    if (lbIdx > 0) {
      lbIdx--;
      paintLB();
      markSeen(lbList[lbIdx]?.[0] || null);
    }
  });
  $('#lbNext')?.addEventListener('click', () => {
    if (lbIdx < lbList.length - 1) {
      lbIdx++;
      paintLB();
      markSeen(lbList[lbIdx]?.[0] || null);
    }
  });
  $('#lbImg')?.addEventListener('dblclick', () => {
    lbZoom = lbZoom > 1 ? 1 : 2.4;
    lbTx = 0;
    lbTy = 0;
    applyZoom();
  });
  $('#lbImg')?.addEventListener(
    'wheel',
    e => {
      e.preventDefault();
      lbZoom = Math.max(1, Math.min(5, lbZoom + (e.deltaY < 0 ? 0.3 : -0.3)));
      if (lbZoom === 1) {
        lbTx = 0;
        lbTy = 0;
      }
      applyZoom();
    },
    { passive: false }
  );

  let tState: any = null;
  const lbStage = $('#lbStage');
  lbStage?.addEventListener(
    'touchstart',
    e => {
      if (e.touches.length === 2) {
        const [a, b] = [e.touches[0], e.touches[1]];
        tState = {
          mode: 'pinch',
          d0: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
          z0: lbZoom,
        };
      } else if (e.touches.length === 1) {
        tState = {
          mode: 'pan',
          x0: e.touches[0].clientX,
          y0: e.touches[0].clientY,
          tx0: lbTx,
          ty0: lbTy,
        };
      }
    },
    { passive: true }
  );
  lbStage?.addEventListener(
    'touchmove',
    e => {
      if (!tState) return;
      if (tState.mode === 'pinch' && e.touches.length === 2) {
        const [a, b] = [e.touches[0], e.touches[1]];
        lbZoom = Math.max(
          1,
          Math.min(5, tState.z0 * (Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / tState.d0))
        );
        applyZoom();
      } else if (tState.mode === 'pan' && e.touches.length === 1) {
        const dx = e.touches[0].clientX - tState.x0;
        const dy = e.touches[0].clientY - tState.y0;
        if (lbZoom > 1) {
          lbTx = tState.tx0 + dx;
          lbTy = tState.ty0 + dy;
          $('#lbImg')?.classList.add('drag');
          applyZoom();
        } else {
          if (dy > 0 && $('#lbImg')) $('#lbImg')!.style.transform = `translateY(${dy * 0.6}px)`;
          if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) tState.hx = dx;
          if (dy > 0) tState.vy = dy;
        }
      }
    },
    { passive: true }
  );
  lbStage?.addEventListener(
    'touchend',
    () => {
      if (!tState) return;
      $('#lbImg')?.classList.remove('drag');
      if (tState.mode === 'pan' && lbZoom === 1) {
        if (tState.vy > 90) closeLB();
        else if (tState.hx && Math.abs(tState.hx) > 60 && lbList.length > 1) {
          if (tState.hx < 0 && lbIdx < lbList.length - 1) {
            lbIdx++;
            paintLB();
            markSeen(lbList[lbIdx]?.[0] || null);
          } else if (tState.hx > 0 && lbIdx > 0) {
            lbIdx--;
            paintLB();
            markSeen(lbList[lbIdx]?.[0] || null);
          } else applyZoom();
        } else applyZoom();
      }
      tState = null;
    },
    { passive: true }
  );

  $('#lbDots')?.addEventListener('click', e => {
    e.stopPropagation();
    const item = lbList[lbIdx];
    const key = item?.[0];
    const v = item?.[1]?.data;
    if (!v) return;
    if (key && live.has(key)) openMediaMenu(key, innerWidth - 240, 70);
    else {
      openCtx(
        [
          { label: 'Save to device', icon: DL_SVG, fn: () => saveMedia(v) },
          {
            label: 'Resend',
            icon: RE_SVG,
            fn: () => {
              sendMsg({ type: v.type, url: v.url, pid: v.pid, w: v.w, h: v.h, dur: v.dur });
              closeLB();
              toast('Resent');
            },
          },
        ],
        innerWidth - 240,
        70
      );
    }
  });

  async function saveMedia(v: any) {
    try {
      toast('Downloading…');
      const res = await fetch(v.url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download =
        v.type === 'gif'
          ? 'vanish.gif'
          : v.type === 'photo'
          ? 'vanish.jpg'
          : v.type === 'voice'
          ? 'vanish.webm'
          : 'vanish.mp4';
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast('Saved to device');
    } catch (_) {
      toast('Download failed');
    }
  }

  /* Video Player (#vp) */
  const vpVid = $('#vpVid') as HTMLVideoElement | null;
  function openPlayer(key: string | null, directV?: any) {
    let v: any;
    if (directV) v = directV;
    else {
      const e = key ? live.get(key) : null;
      if (!e) return;
      v = e.data;
    }
    if (!vpVid) return;
    vpVid.src = v.url;
    if ($('#vpName')) {
      $('#vpName')!.textContent =
        (v.from === myUid ? 'You' : (usersMap[v.from] || {}).name || peerName) + ' · Video';
    }
    if ($('#vpCap')) {
      $('#vpCap')!.textContent = v.caption || '';
      $('#vpCap')!.hidden = !v.caption;
    }
    if ($('#vp')) $('#vp')!.hidden = false;
    buildSpeeds(1);
    markSeen(key);
    markAllRead();
    vpVid.play().catch(() => {});
  }
  function closeVP() {
    if (vpVid) {
      vpVid.pause();
      vpVid.removeAttribute('src');
      vpVid.load();
    }
    if ($('#vp')) $('#vp')!.hidden = true;
  }
  $('#vpX')?.addEventListener('click', closeVP);
  $('#vp')?.addEventListener('click', e => {
    const id = (e.target as HTMLElement).id;
    if (id === 'vpStage' || id === 'vp') closeVP();
  });
  function buildSpeeds(cur: number) {
    const box = $('#vpSpds');
    if (!box || !vpVid) return;
    box.innerHTML = '';
    vpSpeeds.forEach(s => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'spd' + (s === cur ? ' on' : '');
      b.textContent = s + 'x';
      b.addEventListener('click', () => {
        vpVid.playbackRate = s;
        buildSpeeds(s);
      });
      box.appendChild(b);
    });
  }
  if (vpVid) {
    const vpIcon = () => {
      if ($('#vpPlay')) $('#vpPlay')!.innerHTML = vpVid.paused ? PLAY_SVG : PAUSE_SVG;
    };
    $('#vpPlay')?.addEventListener('click', () => (vpVid.paused ? vpVid.play() : vpVid.pause()));
    $('#vpBig')?.addEventListener('click', () => vpVid.play());
    vpVid.addEventListener('play', () => {
      if ($('#vpBig')) $('#vpBig')!.hidden = true;
      vpIcon();
    });
    vpVid.addEventListener('pause', () => {
      if ($('#vp') && !$('#vp')!.hidden) {
        if ($('#vpBig')) $('#vpBig')!.hidden = false;
        vpIcon();
      }
    });
    vpVid.addEventListener('timeupdate', () => {
      if (!vpVid.duration) return;
      const seek = $('#vpSeek') as HTMLInputElement | null;
      if (seek) seek.value = String(Math.round((vpVid.currentTime / vpVid.duration) * 1000));
      if ($('#vpTime')) {
        $('#vpTime')!.textContent = fmtDur(vpVid.currentTime) + ' / ' + fmtDur(vpVid.duration);
      }
    });
    $('#vpSeek')?.addEventListener('input', e => {
      if (vpVid.duration) {
        vpVid.currentTime =
          (Number((e.target as HTMLInputElement).value) / 1000) * vpVid.duration;
      }
    });
  }

  /* Stories / Updates */
  function activeItems(uid: string | null) {
    if (!uid) return [];
    const st = statuses[uid];
    if (!st?.items) return [];
    const t = now();
    return Object.entries(st.items)
      .filter(([, it]: [string, any]) => it.exp && it.exp > t)
      .sort((a: any, b: any) => a[1].createdAt - b[1].createdAt)
      .map(([id, it]: [string, any]) => Object.assign({ id }, it));
  }

  function unseenFor(uid: string) {
    if (uid === myUid) return false;
    const seen = seenMap[uid] || {};
    return activeItems(uid).some(it => !((seen[it.id] || {})[myUid || '']));
  }

  function renderSBar() {
    const bar = $('#sbar');
    if (!bar || !myUid) return;
    bar.innerHTML = '';
    const isUpdatesTab = document.body.classList.contains('tab-updates');
    const mine = activeItems(myUid);
    const reactedItem = mine.find(it => it.reactedBy && Object.keys(it.reactedBy).length);

    if (isUpdatesTab) {
      const secMine = document.createElement('div');
      secMine.className = 'status-sec-label';
      secMine.textContent = 'Status';
      bar.appendChild(secMine);
    }

    const me = document.createElement('div');
    me.className = 'sit';
    const ring = document.createElement('div');
    ring.className =
      'sring' +
      (mine.length ? '' : ' seen') +
      (reactedItem ? ' has-react' : '');
    if (reactedItem) {
      const b = document.createElement('span');
      b.className = 'sReactBadge';
      b.textContent = '💬';
      ring.appendChild(b);
    }
    const av = document.createElement('div');
    av.className = 'avatar';
    paintAv(av, myUid, myProfile?.name);
    ring.appendChild(av);

    const plus = document.createElement('span');
    plus.className = 'splus';
    plus.textContent = '+';
    plus.title = 'Add status update';
    plus.addEventListener('click', ev => {
      ev.stopPropagation();
      openStSheet();
    });
    ring.appendChild(plus);
    me.appendChild(ring);

    if (isUpdatesTab) {
      const meta = document.createElement('div');
      meta.className = 'sit-meta';
      const b = document.createElement('b');
      b.textContent = 'My status';
      const sm = document.createElement('small');
      const lastMine = mine[mine.length - 1];
      sm.textContent = mine.length
        ? `${mine.length} active · ${fmtAgo(lastMine.createdAt)}`
        : 'Tap to add photo, video or text status';
      meta.append(b, sm);
      me.appendChild(meta);
    } else {
      const lbl = document.createElement('span');
      lbl.textContent = mine.length ? `My status (${mine.length})` : 'My status';
      me.appendChild(lbl);
    }

    me.addEventListener('click', e => {
      if ((e.target as HTMLElement).classList.contains('splus')) return;
      if (reactedItem) {
        openStory(myUid!);
        setTimeout(() => {
          const i = storyIds.findIndex(x => x.id === reactedItem.id);
          if (i >= 0) {
            storyIdx = i;
            showStoryItem();
          }
        }, 30);
        return;
      }
      if (mine.length) {
        const r = me.getBoundingClientRect();
        openCtx(
          [
            { label: 'View my status', icon: EYE_SVG, fn: () => openStory(myUid!) },
            {
              label: 'Share photo / video status',
              icon: PLUS_SVG,
              fn: () => ($('#stFileIn') as HTMLInputElement | null)?.click(),
            },
            { label: 'Text or emoji status', icon: SMILE_SVG, fn: () => openStSheet('text') },
            {
              label: 'Delete all status updates',
              icon: TRASH_SVG,
              danger: true,
              fn: async () => {
                const ok = await askConfirm('Delete all status updates?', 'Your active 12h status updates will be removed immediately.', 'Delete all', true);
                if (!ok) return;
                await db.ref('status/' + myUid + '/items').remove().catch(() => {});
                toast('All status updates deleted');
              },
            },
          ],
          Math.min(r.left, innerWidth - 235),
          r.bottom + 8
        );
      } else {
        openStSheet();
      }
    });
    bar.appendChild(me);

    if (isUpdatesTab) {
      const qa = document.createElement('div');
      qa.className = 'status-quick-actions';
      qa.innerHTML =
        '<button type="button" id="sqMediaBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg><span>Photo & Video Studio</span></button>' +
        '<button type="button" id="sqTextBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3l4 4L8 20l-5 1 1-5L17 3z"/></svg><span>Text Status</span></button>';
      bar.appendChild(qa);
      qa.querySelector('#sqMediaBtn')?.addEventListener('click', () => {
        ($('#stFileIn') as HTMLInputElement | null)?.click();
      });
      qa.querySelector('#sqTextBtn')?.addEventListener('click', () => {
        openStSheet('text');
      });
    }

    const peerStatuses = Object.keys(statuses)
      .filter(uid => uid !== myUid && usersMap[uid] && !iBlocked(uid))
      .map(uid => ({ uid, items: activeItems(uid), unseen: unseenFor(uid) }))
      .filter(entry => entry.items.length > 0);

    const makePeerNode = (entry: { uid: string; items: any[]; unseen: boolean }) => {
      const { uid, items, unseen } = entry;
      const d = document.createElement('div');
      d.className = 'sit';
      const r2 = document.createElement('div');
      r2.className = 'sring' + (unseen ? '' : ' seen');
      const av2 = document.createElement('div');
      av2.className = 'avatar';
      const u = usersMap[uid] || {};
      paintAv(av2, uid, u.name);
      r2.appendChild(av2);
      d.appendChild(r2);

      if (isUpdatesTab) {
        const meta = document.createElement('div');
        meta.className = 'sit-meta';
        const b = document.createElement('b');
        b.textContent = u.name || 'User';
        const sm = document.createElement('small');
        const newest = items[items.length - 1];
        sm.textContent = `${fmtAgo(newest.createdAt)} · ${items.length} ${items.length === 1 ? 'update' : 'updates'}`;
        meta.append(b, sm);
        d.appendChild(meta);
      } else {
        const sp = document.createElement('span');
        sp.textContent = firstName(u.name);
        d.appendChild(sp);
      }
      d.addEventListener('click', () => openStory(uid));
      return d;
    };

    if (isUpdatesTab) {
      const recentList = peerStatuses.filter(x => x.unseen);
      const viewedList = peerStatuses.filter(x => !x.unseen);
      if (recentList.length) {
        const lbl = document.createElement('div');
        lbl.className = 'status-sec-label';
        lbl.textContent = 'Recent updates';
        bar.appendChild(lbl);
        recentList.forEach(e => bar.appendChild(makePeerNode(e)));
      }
      if (viewedList.length) {
        const lbl = document.createElement('div');
        lbl.className = 'status-sec-label';
        lbl.textContent = 'Viewed updates';
        bar.appendChild(lbl);
        viewedList.forEach(e => bar.appendChild(makePeerNode(e)));
      }
      if (!recentList.length && !viewedList.length) {
        const empty = document.createElement('div');
        empty.className = 'snote';
        empty.textContent = 'No contact status updates right now. Share a photo, edited video, or text status above!';
        bar.appendChild(empty);
      }
    } else {
      peerStatuses.forEach(e => bar.appendChild(makePeerNode(e)));
    }
  }

  /* Story Creation Studio (#stSheet) */
  let stTab: 'photo' | 'emoji' | 'text' = 'photo';
  let stFile: File | null = null;
  let stEmoji = '😀';
  let stBg = 0;
  let stPackIdx = 0;

  function openStSheet(initialTab: 'photo' | 'emoji' | 'text' = 'photo') {
    stTab = initialTab;
    stFile = null;
    stEmoji = '😀';
    stBg = 0;
    if ($('#stPrev')) {
      $('#stPrev')!.innerHTML =
        '<span class="text-sm font-semibold opacity-80">Open Photo &amp; Video Sharing Studio</span>';
    }
    if ($('#stName2')) $('#stName2')!.textContent = 'Add drawings, text, stickers, filters or trim video';
    if ($('#stCapIn')) ($('#stCapIn') as HTMLInputElement).value = '';
    if ($('#stTxtIn')) ($('#stTxtIn') as HTMLInputElement).value = '';
    if ($('#stEmoPrev')) {
      $('#stEmoPrev')!.textContent = '😀';
      $('#stEmoPrev')!.style.background = ST_BGS[0];
    }
    if ($('#stTxtPrev')) {
      $('#stTxtPrev')!.textContent = 'Type your status below…';
      $('#stTxtPrev')!.style.background = ST_BGS[0];
    }
    setStTab(initialTab);
    buildStBgs();
    buildStEmoji();
    if ($('#stProg')) $('#stProg')!.hidden = true;
    if ($('#stSend')) ($('#stSend') as HTMLButtonElement).disabled = false;
    if ($('#stSheet')) $('#stSheet')!.hidden = false;
  }

  function closeStSheet() {
    if ($('#stSheet')) $('#stSheet')!.hidden = true;
    stFile = null;
  }
  $('#stX')?.addEventListener('click', closeStSheet);
  $('#stSheet')?.addEventListener('click', e => {
    if ((e.target as HTMLElement).id === 'stSheet') closeStSheet();
  });

  function setStTab(t: 'photo' | 'emoji' | 'text') {
    stTab = t;
    document.querySelectorAll('.stab2').forEach(x =>
      x.classList.toggle('on', (x as HTMLElement).dataset.sst === t)
    );
    if ($('#sstPhoto')) $('#sstPhoto')!.hidden = t !== 'photo';
    if ($('#sstEmoji')) $('#sstEmoji')!.hidden = t !== 'emoji';
    if ($('#sstText')) $('#sstText')!.hidden = t !== 'text';
  }
  document.querySelectorAll('.stab2').forEach(b =>
    b.addEventListener('click', () =>
      setStTab(((b as HTMLElement).dataset.sst as 'photo' | 'emoji' | 'text') || 'photo')
    )
  );

  $('#stPrev')?.addEventListener('click', () => ($('#stFileIn') as HTMLInputElement | null)?.click());
  const stFileIn = $('#stFileIn') as HTMLInputElement | null;
  stFileIn?.addEventListener('change', () => {
    const f = stFileIn.files?.[0];
    stFileIn.value = '';
    if (!f) return;
    fixMediaFile(f).then(cf => {
      if (cf.size > MAX_MB * 1048576) {
        toast(`File exceeds ${MAX_MB} MB limit`);
        return;
      }
      closeStSheet();
      startCompose(cf, 'status');
    });
  });

  function buildStBgs() {
    const box = $('#stBgs');
    if (!box) return;
    box.innerHTML = '';
    ST_BGS.forEach((g, i) => {
      const c = document.createElement('div');
      c.className = 'bgc' + (i === stBg ? ' on' : '');
      c.style.background = g;
      c.addEventListener('click', () => {
        stBg = i;
        box.querySelectorAll('.bgc').forEach((x, xi) => x.classList.toggle('on', xi === i));
        if ($('#stTxtPrev')) $('#stTxtPrev')!.style.background = g;
      });
      box.appendChild(c);
    });
  }
  $('#stTxtIn')?.addEventListener('input', e => {
    if ($('#stTxtPrev')) {
      $('#stTxtPrev')!.textContent =
        (e.target as HTMLInputElement).value.trim() || 'Type your story below…';
    }
  });

  function buildStEmoji() {
    const chips = $('#packChipsS');
    const g = $('#emjGridS');
    if (!chips || !g) return;
    chips.innerHTML = '';
    EMOJI_PACKS.forEach((p, i) => {
      const c = document.createElement('button');
      c.type = 'button';
      c.className = 'pkc' + (i === stPackIdx ? ' on' : '');
      c.textContent = p.n;
      c.addEventListener('click', () => {
        stPackIdx = i;
        buildStEmoji();
      });
      chips.appendChild(c);
    });
    g.innerHTML = '';
    EMOJI_PACKS[stPackIdx].e.slice(0, 32).forEach(em => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'emjbtn';
      const s = document.createElement('span');
      s.textContent = em;
      applyAmbient(s, em, 0.5, 1.25);
      b.appendChild(s);
      b.addEventListener('click', () => {
        stEmoji = em;
        const pv = $('#stEmoPrev');
        if (pv) {
          pv.textContent = em;
          pv.style.background = ST_BGS[Math.floor(Math.random() * ST_BGS.length)];
        }
      });
      g.appendChild(b);
    });
  }

  $('#stSend')?.addEventListener('click', async () => {
    if (!myUid) return;
    const t = now();
    try {
      if (stTab === 'photo') {
        if (!stFile) {
          toast('Choose a photo or video first');
          return;
        }
        ($('#stSend') as HTMLButtonElement).disabled = true;
        if ($('#stProg')) $('#stProg')!.hidden = false;
        const j = await cloudUpload(stFile, p => {
          if ($('#stProg')) $('#stProg')!.hidden = false;
          if ($('#stBar')) $('#stBar')!.style.width = Math.round(p * 100) + '%';
        });
        await db.ref('status/' + myUid + '/items').push({
          url: j.secure_url,
          type: stFile.type.startsWith('video') ? 'video' : 'photo',
          w: j.width || 0,
          h: j.height || 0,
          dur: Math.round(j.duration || 0),
          caption: (($('#stCapIn') as HTMLInputElement | null)?.value || '').trim().slice(0, 120),
          createdAt: t,
          exp: t + ST_TTL,
        });
      } else if (stTab === 'emoji') {
        await db.ref('status/' + myUid + '/items').push({
          type: 'emoji',
          e: stEmoji,
          createdAt: t,
          exp: t + ST_TTL,
        });
      } else {
        const txt = (($('#stTxtIn') as HTMLInputElement | null)?.value || '').trim();
        if (!txt) {
          toast('Enter some story text first');
          return;
        }
        await db.ref('status/' + myUid + '/items').push({
          type: 'text',
          text: txt.slice(0, 140),
          bg: ST_BGS[stBg],
          createdAt: t,
          exp: t + ST_TTL,
        });
      }
      closeStSheet();
      toast('Story published (expires in 12h)');
    } catch (err: any) {
      toast('Failed to publish story: ' + (err?.message || ''));
      if ($('#stSend')) ($('#stSend') as HTMLButtonElement).disabled = false;
    }
  });

  /* Story Viewer (#story) */
  function openStory(uid: string) {
    const items = activeItems(uid);
    if (!items.length) return;
    storyOwner = uid;
    storyIds = items;
    storyIdx = 0;
    stPaused = false;
    if ($('#story')) $('#story')!.hidden = false;
    showStoryItem();
  }
  function closeStory() {
    clearTimeout(stTimer);
    if (stVid) {
      try {
        stVid.pause();
      } catch (_) {}
      stVid = null;
    }
    $('#stStage')
      ?.querySelectorAll('img,video,#stText,#stBig')
      .forEach(x => x.remove());
    if ($('#story')) $('#story')!.hidden = true;
    storyOwner = null;
  }
  $('#stClose')?.addEventListener('click', closeStory);

  function showStoryItem() {
    clearTimeout(stTimer);
    stPaused = false;
    const it = storyIds[storyIdx];
    if (!it || !storyOwner) {
      closeStory();
      return;
    }
    const st = $('#stStage')!;
    st.querySelectorAll('img,video,#stText,#stBig').forEach(x => x.remove());
    stVid = null;
    if ($('#stName')) {
      $('#stName')!.textContent =
        storyOwner === myUid ? 'My story' : (usersMap[storyOwner] || {}).name || 'User';
    }
    if ($('#stTime')) $('#stTime')!.textContent = fmtAgo(it.createdAt) + ' · 12h ephemeral';
    paintAv($('#stAv'), storyOwner, storyOwner === myUid ? myProfile?.name : usersMap[storyOwner]?.name);
    if ($('#stCap')) {
      $('#stCap')!.textContent =
        it.type === 'text' || it.type === 'emoji' ? '' : it.caption || '';
    }
    const bars = $('#stBars')!;
    bars.innerHTML = '';
    storyIds.forEach((_, i) => {
      const seg = document.createElement('i');
      const f = document.createElement('b');
      if (i < storyIdx) f.style.transform = 'scaleX(1)';
      seg.appendChild(f);
      bars.appendChild(seg);
    });
    const curBar = bars.children[storyIdx]?.firstChild as HTMLElement | null;

    if ($('#stViewBtn')) {
      $('#stViewBtn')!.hidden = storyOwner !== myUid;
      $('#stViewBtn')!.onclick = () => {
        pauseStory();
        showViewers(it.id);
      };
    }
    if ($('#stReplyBar')) $('#stReplyBar')!.hidden = storyOwner === myUid;
    if ($('#stDots')) {
      $('#stDots')!.hidden = storyOwner !== myUid;
      $('#stDots')!.onclick = e => {
        e.stopPropagation();
        if (storyOwner !== myUid) return;
        const r = $('#stDots')!.getBoundingClientRect();
        openCtx(
          [
            {
              label: 'Story viewers',
              icon: EYE_SVG,
              fn: () => {
                pauseStory();
                showViewers(it.id);
              },
            },
            {
              label: 'Delete this story',
              icon: TRASH_SVG,
              danger: true,
              fn: async () => {
                await db.ref('status/' + myUid + '/items/' + it.id).remove().catch(() => {});
                storyIds = storyIds.filter(x => x.id !== it.id);
                if (!storyIds.length) {
                  closeStory();
                  toast('Story deleted');
                  return;
                }
                if (storyIdx >= storyIds.length) storyIdx = storyIds.length - 1;
                showStoryItem();
                toast('Story deleted');
              },
            },
          ],
          Math.min(r.left - 180, innerWidth - 235),
          r.bottom + 8
        );
      };
    }

    if (it.type === 'text') {
      const d = document.createElement('div');
      d.id = 'stText';
      d.style.background = it.bg || ST_BGS[0];
      d.textContent = it.text || '';
      st.appendChild(d);
      requestAnimationFrame(() => {
        if (curBar) curBar.style.transition = 'transform 4500ms linear';
        requestAnimationFrame(() => {
          if (curBar) curBar.style.transform = 'scaleX(1)';
        });
      });
      stTimer = setTimeout(nextStory, 4500);
    } else if (it.type === 'emoji') {
      const e = document.createElement('div');
      e.id = 'stBig';
      e.textContent = it.e || '😀';
      applyAmbient(e, it.e || '😀', 1.4, 1);
      st.appendChild(e);
      requestAnimationFrame(() => {
        if (curBar) curBar.style.transition = 'transform 4500ms linear';
        requestAnimationFrame(() => {
          if (curBar) curBar.style.transform = 'scaleX(1)';
        });
      });
      stTimer = setTimeout(nextStory, 4500);
    } else if (it.type === 'video') {
      const v = document.createElement('video');
      v.src = it.url;
      v.autoplay = true;
      v.playsInline = true;
      v.addEventListener('ended', nextStory);
      st.appendChild(v);
      stVid = v;
      if (curBar) {
        curBar.style.transition = 'transform ' + ((it.dur * 1000) || 8000) + 'ms linear';
        requestAnimationFrame(() => {
          curBar.style.transform = 'scaleX(1)';
        });
      }
    } else {
      const img = document.createElement('img');
      img.src = it.url;
      img.referrerPolicy = 'no-referrer';
      st.appendChild(img);
      requestAnimationFrame(() => {
        if (curBar) curBar.style.transition = 'transform 4500ms linear';
        requestAnimationFrame(() => {
          if (curBar) curBar.style.transform = 'scaleX(1)';
        });
      });
      stTimer = setTimeout(nextStory, 4500);
    }

    if (storyOwner !== myUid && myUid) {
      db.ref('statusSeen/' + storyOwner + '/' + it.id + '/' + myUid)
        .set({ n: firstName(myProfile?.name), at: now() })
        .catch(() => {});
    }
  }

  function pauseStory() {
    if (stPaused) return;
    stPaused = true;
    clearTimeout(stTimer);
    if (stVid) {
      try {
        stVid.pause();
      } catch (_) {}
    }
  }
  function resumeStory() {
    if (!stPaused) return;
    stPaused = false;
    const it = storyIds[storyIdx];
    if (!it) return;
    if (stVid) {
      try {
        stVid.play();
      } catch (_) {}
    } else {
      stTimer = setTimeout(nextStory, 1800);
    }
  }
  function nextStory() {
    if (storyIdx < storyIds.length - 1) {
      storyIdx++;
      showStoryItem();
    } else closeStory();
  }
  function prevStory() {
    if (storyIdx > 0) {
      storyIdx--;
      showStoryItem();
    }
  }
  $('#stNavR')?.addEventListener('click', () => {
    if (!stPaused) nextStory();
  });
  $('#stNavL')?.addEventListener('click', () => {
    if (!stPaused) prevStory();
  });

  /* Story Reply & Quick Emoji Reactions */
  const stReplyIn = $('#stReplyIn') as HTMLInputElement | null;
  function sendStoryReply(text: string) {
    const uid = storyOwner;
    if (!uid || !text || !myUid) return;
    const it = storyIds[storyIdx];
    if (it?.id) {
      db.ref('status/' + uid + '/items/' + it.id + '/reactedBy/' + myUid)
        .set({
          text: text.slice(0, 40),
          at: firebase.database.ServerValue.TIMESTAMP,
        })
        .catch(() => {});
    }
    if (chatId && peerUid === uid) {
      sendMsg({ text: 'Replied to story: ' + text.slice(0, 500) });
    } else {
      const targetUid = uid;
      const targetName = (usersMap[uid] || {}).name || 'User';
      closeStory();
      openChat(targetUid, targetName);
      setTimeout(() => {
        sendMsg({ text: 'Replied to story: ' + text.slice(0, 500) });
      }, 350);
    }
  }
  stReplyIn?.addEventListener('focus', pauseStory);
  stReplyIn?.addEventListener('blur', () => {
    setTimeout(() => {
      if (document.activeElement?.id !== 'stReplyIn') resumeStory();
    }, 150);
  });
  $('#stReplyForm')?.addEventListener('submit', e => {
    e.preventDefault();
    if (!stReplyIn) return;
    const t = stReplyIn.value.trim();
    if (!t) return;
    stReplyIn.value = '';
    stReplyIn.blur();
    sendStoryReply(t);
    toast('Story reply sent');
  });
  $('#stReacts')?.addEventListener('click', e => {
    const b = (e.target as HTMLElement).closest('button') as HTMLButtonElement | null;
    if (!b || !b.dataset.e) return;
    pauseStory();
    sendStoryReply(b.dataset.e);
    toast('Reaction sent ' + b.dataset.e);
  });

  function refreshViewers() {
    const it = storyIds[storyIdx];
    if (it) fillViewers(it.id);
  }
  function fillViewers(itemId: string) {
    const box = $('#vlist');
    if (!box || !storyOwner) return;
    box.innerHTML = '';
    const views = (seenMap[storyOwner] || {})[itemId] || {};
    const ids = Object.keys(views);
    if ($('#vCount')) {
      $('#vCount')!.textContent = ids.length
        ? ids.length + (ids.length === 1 ? ' viewer' : ' viewers')
        : '';
    }
    if (!ids.length) {
      box.innerHTML = '<div class="bempty">No views on this story yet.</div>';
      return;
    }
    ids
      .sort((a, b) => (views[b].at || 0) - (views[a].at || 0))
      .forEach(uid => {
        const u = usersMap[uid] || {};
        const d = document.createElement('div');
        d.className = 'vrow';
        const av = document.createElement('div');
        av.className = 'avatar sm';
        paintAv(av, uid, u.name);
        const b = document.createElement('b');
        b.textContent = views[uid].n || u.name || 'User';
        const s = document.createElement('span');
        s.textContent = fmtAgo(views[uid].at || now());
        d.append(av, b, s);
        box.appendChild(d);
      });
  }
  function showViewers(itemId: string) {
    fillViewers(itemId);
    if ($('#viewersModal')) $('#viewersModal')!.hidden = false;
  }
  $('#vClose')?.addEventListener('click', () => {
    if ($('#viewersModal')) $('#viewersModal')!.hidden = true;
    resumeStory();
  });
  $('#viewersModal')?.addEventListener('click', e => {
    if ((e.target as HTMLElement).id === 'viewersModal') {
      $('#viewersModal')!.hidden = true;
      resumeStory();
    }
  });

  /* Profile Sheet / Dialog (#profModal) */
  const profModal = $('#profModal');
  const privModal = $('#privModal');

  function closeModals() {
    if (profModal) profModal.hidden = true;
    if (privModal) privModal.hidden = true;
    profUid = null;
  }
  function openProfile(uid: string) {
    profUid = uid;
    fillProfile(uid);
    if (profModal) profModal.hidden = false;
    if ($('#pBioInput')) $('#pBioInput')!.style.display = 'none';
    if ($('#pBio')) $('#pBio')!.style.display = '';
  }
  function closeProfile() {
    if (!profModal) return;
    profModal.classList.add('closing');
    setTimeout(() => {
      profModal.hidden = true;
      profModal.classList.remove('closing');
    }, 200);
    profUid = null;
  }
  $('#pClose')?.addEventListener('click', closeProfile);
  profModal?.addEventListener('click', e => {
    if (e.target === profModal) closeProfile();
  });
  privModal?.addEventListener('click', e => {
    if (e.target === privModal) privModal.hidden = true;
  });

  $('#pAv')?.addEventListener('click', e => {
    if ((e.target as HTMLElement).closest('#pAvEdit')) return;
    const url = $('#pAv')?.dataset.photo;
    if (url) {
      e.stopPropagation();
      openPhotoDirect(url, $('#pAv')?.dataset.name);
    }
  });
  $('#pAvEdit')?.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    ($('#pAvFile') as HTMLInputElement | null)?.click();
  });
  $('#pAvFile')?.addEventListener('change', e => {
    const inp = e.target as HTMLInputElement;
    const f = inp.files?.[0];
    inp.value = '';
    if (!f || !myUid || typeof window.openAvatarCrop !== 'function') return;
    window.openAvatarCrop(f, async blob => {
      toast('Uploading profile photo…');
      try {
        const j = await cloudUpload(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }));
        await db.ref('users/' + myUid + '/photoURL').set(j.secure_url);
        if (myProfile) myProfile.photoURL = j.secure_url;
        usersMap[myUid!] = Object.assign({}, usersMap[myUid!] || {}, { photoURL: j.secure_url });
        paintAv($('#meAvatar'), myUid, myProfile?.name);
        paintAv($('#railMeAvatar'), myUid, myProfile?.name);
        if (profUid === myUid) fillProfile(myUid!);
        toast('Profile photo updated');
      } catch (err: any) {
        toast('Photo upload failed');
      }
    });
  });

  function startBioEdit() {
    if (!profUid || profUid !== myUid) return;
    const inp = $('#pBioInput') as HTMLInputElement | null;
    const span = $('#pBio');
    if (!inp || !span) return;
    inp.value = (usersMap[profUid] || {}).bio || DEFAULT_BIO;
    span.style.display = 'none';
    inp.style.display = 'block';
    inp.focus();
    const commit = () => {
      inp.style.display = 'none';
      span.style.display = '';
      const val = inp.value.trim() || DEFAULT_BIO;
      if (profUid && usersMap[profUid] && val !== usersMap[profUid].bio) {
        db.ref('users/' + profUid + '/bio')
          .set(val)
          .then(() => toast('Bio updated'))
          .catch(() => toast('Could not save bio'));
      }
      span.textContent = val;
    };
    inp.onblur = commit;
    inp.onkeydown = ev => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        inp.blur();
      }
      if (ev.key === 'Escape') {
        inp.value = (usersMap[profUid || ''] || {}).bio || DEFAULT_BIO;
        inp.blur();
      }
    };
  }
  $('#pEdit')?.addEventListener('click', startBioEdit);

  $('#notifyAllow')?.addEventListener('click', e => {
    e.preventDefault();
    enableNotifications(true);
  });
  $('#notifySkip')?.addEventListener('click', e => {
    e.preventDefault();
    try {
      localStorage.setItem('vanishNotifySkip', '1');
    } catch (_) {}
    if ($('#notifyBanner')) $('#notifyBanner')!.hidden = true;
  });
  $('#notifyT')?.addEventListener('click', () => {
    if (notifEnabled() && notifPermGranted()) {
      persistNotif(false);
      toast('Notifications muted');
      showNotifyBanner();
    } else {
      enableNotifications(true);
    }
  });

  profileUI = createProfileExperience({
    $,
    toast,
    getMyUid: () => myUid,
    getMyProfile: () => myProfile,
    getPeerUid: () => peerUid,
    getUsersMap: () => usersMap,
    getLiveMessages: () => live,
    paintAv,
    hashColor,
    fmtSeen,
    fmtDate,
    fmtTTL,
    maskEmail,
    defaultBio: DEFAULT_BIO,
    iBlocked,
    blockUser,
    unblockUser,
    clearChat,
    openChat,
    openCustomize: () => window.openCustomize?.(),
    openMediaPickerForChat: () => fileIn?.click(),
    openViewer,
    openPlayer,
    notifActive: () => notifEnabled() && notifPermGranted(),
    toggleNotifications: () => {
      if (notifEnabled() && notifPermGranted()) {
        persistNotif(false);
        toast('Notifications muted');
        showNotifyBanner();
      } else {
        enableNotifications(true);
      }
      if (profUid) fillProfile(profUid);
    },
    setSelfDestruct: (seconds, label) => {
      if (!myUid) return;
      db.ref('users/' + myUid + '/selfDestruct')
        .set(seconds)
        .then(() => {
          toast('Vanish timer set to ' + label);
          updateVdBadge();
          if (myUid) fillProfile(myUid);
          profileUI?.fillDrawer();
        })
        .catch(() => toast('Could not update timer'));
    },
    startBioEdit,
    closeProfileModal: closeProfile,
  });

  function fillProfile(uid: string) {
    profileUI?.fillProfileModal(uid);
  }

  /* Categorized Settings & Appearance (#customizeSheet) */
  const ACCENT_THEMES: [string, string][] = [
    ['#00A884', '#10B981'],
    ['#06B6D4', '#00A884'],
    ['#3B82F6', '#8B5CF6'],
    ['#6366F1', '#EC4899'],
    ['#F43F5E', '#FB923C'],
    ['#8B5CF6', '#D946EF'],
  ];
  const WALLS = [
    '',
    'radial-gradient(circle at 20% 20%, rgba(0,168,132,0.18), transparent 60%), radial-gradient(circle at 80% 80%, rgba(6,182,212,0.16), transparent 60%)',
    'linear-gradient(135deg, rgba(6,44,38,0.45), rgba(7,16,19,0.42))',
    'radial-gradient(circle at 30% 20%, rgba(16,185,129,0.18), transparent 65%)',
    'radial-gradient(circle at 75% 25%, rgba(59,130,246,0.16), transparent 65%)',
    'linear-gradient(160deg, rgba(14,165,233,0.15), rgba(139,92,246,0.14))',
  ];

  function loadCuzPrefs(): Record<string, any> {
    try {
      return JSON.parse(localStorage.getItem('vc_customize') || '{}');
    } catch (_) {
      return {};
    }
  }
  function saveCuzPrefs(p: Record<string, any>) {
    try {
      localStorage.setItem('vc_customize', JSON.stringify(p));
    } catch (_) {}
  }
  function applyAccentColors(c1: string, c2: string) {
    const isDefault = c1.toLowerCase() === '#00a884' && c2.toLowerCase() === '#10b981';
    document.documentElement.classList.toggle('custom-accent', !isDefault);
    document.documentElement.style.setProperty('--acc', c1);
    document.documentElement.style.setProperty('--acc2', c2);
    document.documentElement.style.setProperty('--grad', `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`);
    if (isDefault) {
      document.documentElement.style.removeProperty('--mine-grad');
    } else {
      document.documentElement.style.setProperty('--mine-grad', `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`);
    }
  }
  function applyWallpaper(val: string) {
    if (!val) {
      document.documentElement.style.setProperty('--wallpaper', 'none');
      return;
    }
    const isImg = /^data:|^https?:/.test(val);
    document.documentElement.style.setProperty('--wallpaper', isImg ? `url(${val})` : val);
  }

  window.vcSwipeSens = 70;
  (function bootPrefs() {
    const p = loadCuzPrefs();
    if (p.c1 && p.c2) applyAccentColors(p.c1, p.c2);
    if (p.wall !== undefined) applyWallpaper(p.wall);
    window.vcSwipeSens = p.sens || 70;
  })();

  function renderSettingsState() {
    const p = loadCuzPrefs();
    const isDark = document.body.classList.contains('dark');
    $('#themeDarkBtn')?.classList.toggle('on', isDark);
    $('#themeLightBtn')?.classList.toggle('on', !isDark);

    const sw = $('#cuzSwatches');
    if (sw) {
      sw.innerHTML = '';
      ACCENT_THEMES.forEach(t => {
        const b = document.createElement('button');
        b.type = 'button';
        b.style.background = `linear-gradient(135deg, ${t[0]}, ${t[1]})`;
        if ((p.c1 || '#00A884') === t[0] && (p.c2 || '#10B981') === t[1]) b.classList.add('on');
        b.addEventListener('click', () => {
          applyAccentColors(t[0], t[1]);
          const np = loadCuzPrefs();
          np.c1 = t[0];
          np.c2 = t[1];
          saveCuzPrefs(np);
          renderSettingsState();
        });
        sw.appendChild(b);
      });
    }

    const wg = $('#cuzWallGrid');
    if (wg) {
      wg.innerHTML = '';
      WALLS.forEach(w => {
        const b = document.createElement('button');
        b.type = 'button';
        if (!w) {
          b.className = 'none';
          b.textContent = 'Default';
        } else {
          b.style.background = w;
        }
        if ((p.wall || '') === w) b.classList.add('on');
        b.addEventListener('click', () => {
          applyWallpaper(w);
          const np = loadCuzPrefs();
          np.wall = w;
          saveCuzPrefs(np);
          renderSettingsState();
        });
        wg.appendChild(b);
      });
    }

    const sens = $('#cuzSwipeSens') as HTMLSelectElement | null;
    if (sens) sens.value = String(p.sens || 70);

    $('#settingsNotifyToggle')?.classList.toggle('on', notifEnabled() && notifPermGranted());
    $('#settingsShieldToggle')?.classList.toggle('on', shieldEnabled);

    const ttlBox = $('#settingsTtlChips');
    if (ttlBox && myUid) {
      const cur = ((usersMap[myUid] || {}).selfDestruct) || 40;
      ttlBox.innerHTML = '';
      TTL_OPTIONS.forEach(o => {
        const c = document.createElement('button');
        c.type = 'button';
        c.className = 'tchip' + (cur === o.s ? ' on' : '');
        c.textContent = o.l;
        c.addEventListener('click', () => {
          if (cur === o.s || !myUid) return;
          db.ref('users/' + myUid + '/selfDestruct')
            .set(o.s)
            .then(() => {
              toast('Auto-delete timer set to ' + o.l);
              updateVdBadge();
              renderSettingsState();
            })
            .catch(() => toast('Could not save timer'));
        });
        ttlBox.appendChild(c);
      });
    }

    const blkCnt = Object.keys(myBlocks()).filter(uid => usersMap[uid]).length;
    if ($('#settingsBlockedCount')) {
      $('#settingsBlockedCount')!.textContent = blkCnt ? `${blkCnt} blocked` : 'None';
    }
  }

  window.openCustomize = () => {
    renderSettingsState();
    if ($('#customizeSheet')) $('#customizeSheet')!.hidden = false;
  };

  $('#cuzClose')?.addEventListener('click', () => {
    if ($('#customizeSheet')) $('#customizeSheet')!.hidden = true;
  });
  $('#customizeSheet')?.addEventListener('click', e => {
    if ((e.target as HTMLElement).id === 'customizeSheet') {
      $('#customizeSheet')!.hidden = true;
    }
  });
  $('#themeDarkBtn')?.addEventListener('click', () => applyTheme('dark', true));
  $('#themeLightBtn')?.addEventListener('click', () => applyTheme('light', true));
  $('#railThemeBtn')?.addEventListener('click', () => {
    const dark = document.body.classList.contains('dark');
    applyTheme(dark ? 'light' : 'dark', true);
  });

  $('#cuzHexApply')?.addEventListener('click', () => {
    const c1 = ($('#cuzHex1') as HTMLInputElement)?.value || '#3B82F6';
    const c2 = ($('#cuzHex2') as HTMLInputElement)?.value || '#8B5CF6';
    applyAccentColors(c1, c2);
    const p = loadCuzPrefs();
    p.c1 = c1;
    p.c2 = c2;
    saveCuzPrefs(p);
    renderSettingsState();
    toast('Custom accent applied');
  });

  $('#cuzWallUpload')?.addEventListener('click', () =>
    ($('#cuzWallFile') as HTMLInputElement | null)?.click()
  );
  $('#cuzWallFile')?.addEventListener('change', e => {
    const inp = e.target as HTMLInputElement;
    const f = inp.files?.[0];
    inp.value = '';
    if (!f) return;
    const im = new Image();
    im.onload = () => {
      const m = 1280;
      const k = Math.min(1, m / Math.max(im.naturalWidth, im.naturalHeight));
      const c = document.createElement('canvas');
      c.width = im.naturalWidth * k;
      c.height = im.naturalHeight * k;
      c.getContext('2d')?.drawImage(im, 0, 0, c.width, c.height);
      const durl = c.toDataURL('image/jpeg', 0.82);
      applyWallpaper(durl);
      const p = loadCuzPrefs();
      p.wall = durl;
      saveCuzPrefs(p);
      renderSettingsState();
      toast('Custom wallpaper applied');
    };
    im.src = URL.createObjectURL(f);
  });

  $('#cuzSwipeSens')?.addEventListener('change', e => {
    const v = Number((e.target as HTMLSelectElement).value);
    window.vcSwipeSens = v;
    const p = loadCuzPrefs();
    p.sens = v;
    saveCuzPrefs(p);
  });

  $('#settingsNotifyToggle')?.addEventListener('click', () => {
    if (notifEnabled() && notifPermGranted()) {
      persistNotif(false);
      renderSettingsState();
      toast('Notifications muted');
    } else {
      enableNotifications(true);
    }
  });

  $('#settingsShieldToggle')?.addEventListener('click', () => {
    shieldEnabled = !shieldEnabled;
    try {
      localStorage.setItem('vc_shield', shieldEnabled ? 'on' : 'off');
    } catch (_) {}
    renderSettingsState();
    toast(shieldEnabled ? 'Privacy shield enabled' : 'Privacy shield paused');
  });

  $('#settingsOpenBlocked')?.addEventListener('click', () => {
    if ($('#customizeSheet')) $('#customizeSheet')!.hidden = true;
    openPrivacy();
  });

  $('#settingsOpenProfile')?.addEventListener('click', () => {
    if ($('#customizeSheet')) $('#customizeSheet')!.hidden = true;
    if (myUid) openProfile(myUid);
  });

  $('#cuzReset')?.addEventListener('click', () => {
    saveCuzPrefs({});
    document.documentElement.classList.remove('custom-accent');
    document.documentElement.style.removeProperty('--acc');
    document.documentElement.style.removeProperty('--acc2');
    document.documentElement.style.removeProperty('--grad');
    document.documentElement.style.removeProperty('--mine-grad');
    applyWallpaper('');
    window.vcSwipeSens = 70;
    renderSettingsState();
    toast('Appearance reset to WhatsApp Emerald Glass');
  });

  $('#cuzLogoutBtn')?.addEventListener('click', () => {
    requestLogout();
  });

  /* Circular Avatar Cropper (#avCrop) & Photo Cropper (#cropper) */
  function setupCanvasCropper(
    modalId: string,
    canvasId: string,
    zoomId: string,
    cancelId: string,
    okId: string
  ) {
    const SIZE = 800;
    const box = document.getElementById(modalId);
    const cv = document.getElementById(canvasId) as HTMLCanvasElement | null;
    const zoomIn = document.getElementById(zoomId) as HTMLInputElement | null;
    const cancelBtn = document.getElementById(cancelId);
    const okBtn = document.getElementById(okId);
    if (!box || !cv || !zoomIn || !cancelBtn || !okBtn) return null;
    const cx = cv.getContext('2d')!;
    let img: HTMLImageElement | null = null;
    let base = 1;
    let zoom = 1;
    let ox = 0;
    let oy = 0;
    let drag: { x: number; y: number; ox: number; oy: number } | null = null;
    let onDone: ((b: Blob) => void) | null = null;

    function clamp() {
      if (!img) return;
      const s = base * zoom;
      const w = img.width * s;
      const h = img.height * s;
      const maxX = Math.max(0, (w - SIZE) / 2);
      const maxY = Math.max(0, (h - SIZE) / 2);
      ox = Math.max(-maxX, Math.min(maxX, ox));
      oy = Math.max(-maxY, Math.min(maxY, oy));
    }
    function draw() {
      if (!img) return;
      cx.fillStyle = '#000';
      cx.fillRect(0, 0, SIZE, SIZE);
      const s = base * zoom;
      const w = img.width * s;
      const h = img.height * s;
      cx.drawImage(img, SIZE / 2 - w / 2 + ox, SIZE / 2 - h / 2 + oy, w, h);
    }
    cv.addEventListener('pointerdown', e => {
      drag = { x: e.clientX, y: e.clientY, ox, oy };
      cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener('pointermove', e => {
      if (!drag) return;
      const r = cv.getBoundingClientRect();
      const k = SIZE / r.width;
      ox = drag.ox + (e.clientX - drag.x) * k;
      oy = drag.oy + (e.clientY - drag.y) * k;
      clamp();
      draw();
    });
    ['pointerup', 'pointercancel'].forEach(n => cv.addEventListener(n, () => (drag = null)));
    cv.addEventListener(
      'wheel',
      e => {
        e.preventDefault();
        zoom = Math.max(1, Math.min(3, zoom - e.deltaY * 0.0015));
        zoomIn.value = String(Math.round(zoom * 100));
        clamp();
        draw();
      },
      { passive: false }
    );
    zoomIn.addEventListener('input', () => {
      zoom = Number(zoomIn.value) / 100;
      clamp();
      draw();
    });
    cancelBtn.addEventListener('click', () => {
      box.hidden = true;
      onDone = null;
    });
    okBtn.addEventListener('click', () => {
      const out = document.createElement('canvas');
      out.width = SIZE;
      out.height = SIZE;
      out.getContext('2d')?.drawImage(cv, 0, 0);
      out.toBlob(
        b => {
          box.hidden = true;
          if (onDone && b) onDone(b);
          onDone = null;
        },
        'image/jpeg',
        0.92
      );
    });
    return (file: File, cb: (b: Blob) => void) => {
      const im = new Image();
      im.onload = () => {
        img = im;
        base = Math.max(SIZE / im.width, SIZE / im.height);
        zoom = 1;
        ox = 0;
        oy = 0;
        zoomIn.value = '100';
        onDone = cb;
        box.hidden = false;
        draw();
      };
      im.onerror = () => toast('Failed to load image');
      im.src = URL.createObjectURL(file);
    };
  }

  const avCropFn = setupCanvasCropper('avCrop', 'avCv', 'avZoomR', 'avcCancel', 'avcOk');
  if (avCropFn) window.openAvatarCrop = avCropFn;

  const photoCropFn = setupCanvasCropper('cropper', 'crCv', 'crZoomR', 'crCancel', 'crOk');
  if (photoCropFn) {
    window.openPhotoCrop = (file: File, cb: (nf: File) => void) => {
      photoCropFn(file, blob => {
        cb(new File([blob], 'cropped_' + Date.now() + '.jpg', { type: 'image/jpeg' }));
      });
    };
  }

  /* Navigation Tabs (Desktop Rail + Mobile Tabbar + Swipe Gestures) */
  function isOpen(el: HTMLElement | null) {
    return !!el && !el.hidden && el.style.display !== 'none';
  }

  function setMainTab(tab: string) {
    if (tab === 'you') {
      if (myUid) openProfile(myUid);
      return;
    }
    if (tab === 'settings') {
      window.openCustomize?.();
      return;
    }
    document.body.classList.remove('tab-chats', 'tab-updates', 'tab-explore', 'tab-you');
    if (tab === 'updates') {
      sideTab = 'chats';
      document.body.classList.add('tab-updates');
    } else if (tab === 'explore') {
      sideTab = 'explore';
      document.body.classList.add('tab-explore');
    } else {
      sideTab = 'chats';
      document.body.classList.add('tab-chats');
    }

    document.querySelectorAll<HTMLElement>('#tabbar .tbtn').forEach(b => {
      b.classList.toggle('on', b.dataset.tab === tab);
    });
    document.querySelectorAll<HTMLElement>('#navRail .rail-nav-btn').forEach(b => {
      b.classList.toggle('on', b.dataset.tab === tab);
    });

    const title = $('#headTitle');
    if (title) {
      title.textContent =
        tab === 'updates' ? 'Updates' : tab === 'explore' ? 'Contacts' : 'Vanish Chats';
    }
    const fabEl = $('#fab');
    if (fabEl) fabEl.hidden = tab === 'updates';

    if (tab === 'updates') renderSBar();
    else renderList();
  }

  $('#tabbar')?.addEventListener('click', e => {
    const b = (e.target as HTMLElement).closest('.tbtn') as HTMLElement | null;
    if (b?.dataset.tab) setMainTab(b.dataset.tab);
  });
  $('#navRail')?.addEventListener('click', e => {
    const b = (e.target as HTMLElement).closest('.rail-nav-btn') as HTMLElement | null;
    if (b?.dataset.tab) setMainTab(b.dataset.tab);
  });
  $('#fab')?.addEventListener('click', () => {
    if (document.body.classList.contains('tab-explore')) setMainTab('chats');
    else setMainTab('explore');
  });
  document.body.classList.add('tab-chats');

  /* Swipe between Chats & Updates on Mobile Sidebar */
  let swSx = 0;
  let swSy = 0;
  let swTracking = false;
  let swStartPane = 'chats';
  function swipeOk(target: EventTarget | null) {
    const t = target as HTMLElement | null;
    if (!t) return false;
    if (
      t.closest(
        '.bubble,.tabbar,.composer,#chatLive,input,textarea,button,a,.modal,#profModal,.sbar'
      )
    )
      return false;
    if (document.body.classList.contains('in-chat')) return false;
    return !!$('#appScreen')?.classList.contains('active');
  }
  document.addEventListener(
    'touchstart',
    e => {
      const t = e.touches[0];
      if (!t || !swipeOk(e.target)) return;
      swSx = t.clientX;
      swSy = t.clientY;
      swTracking = true;
      swStartPane = document.body.classList.contains('tab-updates') ? 'updates' : 'chats';
    },
    { passive: true }
  );
  document.addEventListener(
    'touchend',
    e => {
      if (!swTracking) return;
      swTracking = false;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - swSx;
      const dy = t.clientY - swSy;
      const sens = window.vcSwipeSens || 70;
      if (Math.abs(dx) < sens || Math.abs(dx) < Math.abs(dy) * 1.3) return;
      if (dx < 0 && swStartPane === 'chats') setMainTab('updates');
      else if (dx > 0 && swStartPane === 'updates') setMainTab('chats');
    },
    { passive: true }
  );

  /* Back Navigation Stack & Escape Key */
  window.__handleBack = function () {
    try {
      if (isOpen($('#confirmModal'))) {
        $('#confirmCancel')?.click();
        return true;
      }
      if (ctx && !ctx.hidden) {
        closeCtx();
        return true;
      }
      if (reactBar?.classList.contains('on')) {
        closeReact();
        return true;
      }
      if ($('#shield')?.classList.contains('on')) {
        $('#shield')!.classList.remove('on');
        return true;
      }
      if (isOpen($('#avCrop'))) {
        $('#avCrop')!.hidden = true;
        return true;
      }
      if (isOpen($('#cropper'))) {
        $('#cropper')!.hidden = true;
        return true;
      }
      if (isOpen($('#viewersModal'))) {
        $('#viewersModal')!.hidden = true;
        resumeStory();
        return true;
      }
      if (isOpen($('#stSheet'))) {
        closeStSheet();
        return true;
      }
      if (isOpen($('#attSheet'))) {
        $('#attSheet')!.hidden = true;
        return true;
      }
      if (isOpen($('#customizeSheet'))) {
        $('#customizeSheet')!.hidden = true;
        return true;
      }
      if (isOpen($('#privModal'))) {
        $('#privModal')!.hidden = true;
        return true;
      }
      if (isOpen($('#profModal'))) {
        closeProfile();
        return true;
      }
      if (isOpen($('#vp'))) {
        closeVP();
        return true;
      }
      if (isOpen($('#lb'))) {
        closeLB();
        return true;
      }
      if (isOpen($('#story'))) {
        closeStory();
        return true;
      }
      if (mediaStudio?.isTextEditorOpen()) {
        mediaStudio.closeTextEditor();
        return true;
      }
      if (isOpen($('#csheet'))) {
        closeCompose();
        return true;
      }
      if (isOpen($('#pickPanel'))) {
        closePick();
        return true;
      }
      if (isOpen($('#recBar'))) {
        stopRec(false);
        return true;
      }
      if (profileUI?.isDrawerOpen()) {
        profileUI.closeDrawer();
        return true;
      }
      if (document.body.classList.contains('in-chat') && isOpen($('#chatLive'))) {
        closeChat(false);
        return true;
      }
      if (document.body.classList.contains('tab-explore') || sideTab === 'explore') {
        setMainTab('chats');
        return true;
      }
      if (document.body.classList.contains('tab-updates')) {
        setMainTab('chats');
        return true;
      }
    } catch (_) {}
    return false;
  };

  window.addEventListener('popstate', () => {
    window.__handleBack?.();
    try {
      history.pushState({ vc: 'app' }, '');
    } catch (_) {}
  });
  try {
    history.pushState({ vc: 'app' }, '');
  } catch (_) {}

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      window.__handleBack?.();
    }
    if ($('#vp') && !$('#vp')!.hidden && e.key === ' ' && vpVid) {
      e.preventDefault();
      vpVid.paused ? vpVid.play() : vpVid.pause();
    }
  });

  /* Privacy Shield & Screenshot Deterrence */
  const shieldEl = $('#shield');
  shieldEl?.addEventListener('click', () => shieldEl.classList.remove('on'));
  if (!NATIVE) {
    window.addEventListener('blur', () => {
      if (shieldEnabled && myUid) shieldEl?.classList.add('on');
    });
    window.addEventListener('focus', () => {
      shieldEl?.classList.remove('on');
      if (peerUid) markAllRead();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && shieldEnabled && myUid) shieldEl?.classList.add('on');
      else {
        shieldEl?.classList.remove('on');
        if (peerUid) markAllRead();
      }
    });
  } else {
    window.addEventListener('focus', () => {
      if (peerUid) markAllRead();
    });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && peerUid) markAllRead();
    });
  }
  document.addEventListener('keyup', e => {
    if (e.key === 'PrintScreen') {
      try {
        navigator.clipboard?.writeText('[Vanish] Screenshots are blocked.').catch(() => {});
      } catch (_) {}
      shieldEl?.classList.add('on');
      toast('Screenshot blocked — privacy shield engaged');
    }
  });
  document.addEventListener('keydown', e => {
    const k = (e.key || '').toLowerCase();
    if (e.key === 'PrintScreen' || ((e.ctrlKey || e.metaKey) && (k === 'p' || k === 's'))) {
      e.preventDefault();
      toast('Screen capture & printing are disabled');
    }
  });

  /* Motion Ripple Micro-Interactions */
  document.addEventListener(
    'pointerdown',
    e => {
      const t = (e.target as HTMLElement | null)?.closest?.(
        '.urow, .btn, .tab, .fab, .rail-btn, .pact'
      ) as HTMLElement | null;
      if (!t) return;
      const r = t.getBoundingClientRect();
      const s = Math.max(r.width, r.height) * 2;
      const d = document.createElement('span');
      d.className = 'vcRip';
      d.style.width = s + 'px';
      d.style.height = s + 'px';
      d.style.left = e.clientX - r.left - s / 2 + 'px';
      d.style.top = e.clientY - r.top - s / 2 + 'px';
      if (getComputedStyle(t).position === 'static') t.style.position = 'relative';
      t.style.overflow = 'hidden';
      t.appendChild(d);
      setTimeout(() => d.remove(), 560);
    },
    { passive: true }
  );

  /* Auth Showcase Live Dissolving Demo Bubble */
  const DEMO_LINES = [
    'Hey… read this before it dissolves.',
    'Every message vanishes on your timer.',
    'No permanent history. Pure presence.',
    'Voice, photos, stories — ephemeral by design.',
  ];
  (async function runAuthDemo() {
    const b = $('#demoB');
    const tx = $('#demoTx');
    const tm = $('#demoTm');
    const pr = $('#demoPr');
    if (!b || !tx || !tm || !pr) return;
    let i = 0;
    for (;;) {
      tx.textContent = DEMO_LINES[i++ % DEMO_LINES.length];
      pr.style.strokeDashoffset = '0';
      b.classList.add('show');
      const D = 5600;
      const t0 = performance.now();
      await new Promise<void>(res => {
        (function f(t: number) {
          const r = 1 - (t - t0) / D;
          if (r <= 0) return res();
          pr.style.strokeDashoffset = (RING_C * (1 - r)).toFixed(2);
          tm.textContent = Math.ceil((r * D) / 1000) + 's';
          requestAnimationFrame(f);
        })(t0);
      });
      b.classList.add('out');
      await wait(550);
      b.classList.remove('show', 'out');
      tm.textContent = '';
      await wait(400);
    }
  })();

  /* Native Android Composer Cosmetic Overlay & Auto-Hide */
  if (window.VanishAndroid && typeof window.VanishAndroid.showNativeComposer === 'function') {
    document.documentElement.style.setProperty('--u', 1 / (window.devicePixelRatio || 1) + 'px');
    const I = (p: string) =>
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
    const bar = document.createElement('div');
    bar.id = 'nbBar';
    bar.innerHTML =
      '<div class="nbPill">' +
      '<span class="nbI nbEmo">' +
      I('<circle cx="12" cy="12" r="9.2"/><path d="M8 14.2s1.6 2.3 4 2.3 4-2.3 4-2.3"/><path d="M9 9.5h.01M15 9.5h.01"/>') +
      '</span>' +
      '<span class="nbI nbMic">' +
      I('<rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5v3.5"/><path d="M9 21h6"/>') +
      '</span>' +
      '<span class="nbI nbPlus">' +
      I('<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M21 15l-5-5-9 9"/>') +
      '</span>' +
      '<span class="nbGo">' +
      I('<path d="M5 12h13"/><path d="M13 6l6 6-6 6"/>') +
      '</span></div>';
    document.body.appendChild(bar);
    bar.querySelector('.nbEmo')?.addEventListener('click', () => window.__openEmoji?.());
    bar.querySelector('.nbPlus')?.addEventListener('click', () => window.__openAttach?.());
    bar.querySelector('.nbMic')?.addEventListener('click', () => window.__startVoice?.());

    const OVERLAY_SELECTORS = [
      '#lb', '#vp', '#story', '#csheet', '#cropper', '#attSheet',
      '#stSheet', '#profModal', '#viewersModal', '#pickPanel',
      '#avCrop', '#customizeSheet', '#recBar', '#confirmModal',
    ];
    let lastOvl: boolean | null = null;
    setInterval(() => {
      const o = OVERLAY_SELECTORS.some(s => isOpen($(s)));
      if (o === lastOvl) return;
      lastOvl = o;
      document.body.classList.toggle('ovl', o);
      if (!document.body.classList.contains('native-composer')) return;
      try {
        o ? window.VanishAndroid.hideNativeComposer() : window.VanishAndroid.showNativeComposer();
      } catch (_) {}
    }, 180);
  }

  /* Web Push (FCM) Client Integration */
  const VAPID_KEY = 'PASTE_YOUR_WEB_PUSH_VAPID_PUBLIC_KEY_HERE';
  const SW_URL = '/firebase-messaging-sw.js';
  const TOKEN_PATH = 'userTokens';
  const PUSH_LS = 'vc_push_token';
  const secureOrigin = location.protocol === 'https:' || location.hostname === 'localhost';
  const pushSupported =
    !NATIVE &&
    secureOrigin &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    !!firebase?.messaging;
  const pushConfigured = !VAPID_KEY.startsWith('PASTE_');
  let fcmMessaging: any = null;
  let pushBusy = false;

  async function sha256Short(s: string) {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return Array.from(new Uint8Array(b))
      .map(x => x.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 40);
  }

  async function registerPushToken() {
    if (!pushSupported || pushBusy || !pushConfigured || !myUid || Notification.permission !== 'granted') return;
    pushBusy = true;
    try {
      const reg = await navigator.serviceWorker.register(SW_URL);
      await navigator.serviceWorker.ready;
      fcmMessaging = fcmMessaging || firebase.messaging();
      const token = await fcmMessaging.getToken({ vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });
      if (!token) return;
      const id = await sha256Short(token);
      const ref = db.ref(`${TOKEN_PATH}/${myUid}/${id}`);
      const snap = await ref.once('value');
      if (snap.exists()) {
        await ref.update({ lastSeen: firebase.database.ServerValue.TIMESTAMP });
      } else {
        await ref.set({
          token,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          lastSeen: firebase.database.ServerValue.TIMESTAMP,
          platform: String(navigator.platform || '').slice(0, 40),
          ua: String(navigator.userAgent || '').slice(0, 300),
        });
      }
      localStorage.setItem(PUSH_LS, JSON.stringify({ uid: myUid, id }));
    } catch (_) {
    } finally {
      pushBusy = false;
    }
  }

  async function unregisterPushToken() {
    if (!pushSupported) return;
    try {
      const prev = JSON.parse(localStorage.getItem(PUSH_LS) || 'null');
      if (prev?.uid && prev?.id) {
        await db.ref(`${TOKEN_PATH}/${prev.uid}/${prev.id}`).remove();
      }
      if (fcmMessaging) await fcmMessaging.deleteToken();
      localStorage.removeItem(PUSH_LS);
    } catch (_) {}
  }

  function onEnterArenaPushHook() {
    setTimeout(registerPushToken, 1200);
    try {
      const q = new URLSearchParams(location.search).get('openChat');
      if (q) {
        history.replaceState(null, '', location.pathname + location.hash);
        setTimeout(() => window.__openFromNotify?.(q), 800);
      }
    } catch (_) {}
  }

  window.VCPush = {
    supported: pushSupported,
    configured: pushConfigured,
    register: registerPushToken,
    unregister: unregisterPushToken,
  };
}
