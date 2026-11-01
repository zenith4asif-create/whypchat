export interface StickerDecoration {
  emoji: string;
  delay: number;
  size: number;
  left: number;
  top: number;
  anim: 'up' | 'spark' | 'fall';
}

export interface StickerDef {
  m: string;
  fx: string;
  d: [string, number, number, number, number, 'up' | 'spark' | 'fall'][];
}

export const PALETTE = [
  '#2563EB',
  '#7C3AED',
  '#0891B2',
  '#4F46E5',
  '#DB2777',
  '#059669',
  '#D97706',
];

export const REACTS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export const TTL_OPTIONS = [
  { s: 10, l: '10s' },
  { s: 30, l: '30s' },
  { s: 40, l: '40s' },
  { s: 60, l: '1m' },
  { s: 300, l: '5m' },
];

export const ST_BGS = [
  'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #7C3AED 100%)',
  'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
  'linear-gradient(135deg, #4C1D95 0%, #7C3AED 55%, #EC4899 100%)',
  'linear-gradient(135deg, #064E3B 0%, #059669 55%, #10B981 100%)',
  'linear-gradient(135deg, #7C2D12 0%, #EA580C 55%, #F59E0B 100%)',
  'linear-gradient(135deg, #831843 0%, #DB2777 55%, #F43F5E 100%)',
  'linear-gradient(135deg, #164E63 0%, #0891B2 55%, #22D3EE 100%)',
  'linear-gradient(135deg, #312E81 0%, #4F46E5 55%, #818CF8 100%)',
];

export const REPLY_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14l-5-5 5-5"/><path d="M4 9h10a6 6 0 0 1 6 6v4"/></svg>';
export const SMILE_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5s1.2 1.8 3.5 1.8 3.5-1.8 3.5-1.8"/><circle cx="9" cy="9.5" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="9.5" r="1" fill="currentColor" stroke="none"/></svg>';
export const DOTS_SVG =
  '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="12" cy="19" r="1.9"/></svg>';
export const EYE_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg>';
export const BLOCK_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M5.5 5.5l13 13"/></svg>';
export const TRASH_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7l1 13h10l1-13"/></svg>';
export const MSG_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-8 8H4l2.5-2.5A8 8 0 1 1 21 12z"/></svg>';
export const PLAY_SVG =
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
export const PAUSE_SVG =
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';
export const DL_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 21h16"/></svg>';
export const RE_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>';
export const FLAG_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4"/><path d="M5 4h13l-3 4 3 4H5"/></svg>';
export const PLUS_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';

export const STICKERS: Record<string, StickerDef> = {
  love: { m: '❤️', fx: 'sBeat', d: [['❤️', 0, 22, 4, 2, 'up'], ['💕', 0.5, 18, 64, 6, 'up'], ['💖', 1, 16, 72, 44, 'up']] },
  laugh: { m: '😂', fx: 'sShake', d: [['💦', 0, 20, 6, 50, 'up'], ['💦', 0.4, 18, 76, 54, 'up'], ['💦', 0.8, 16, 42, 66, 'up']] },
  fire: { m: '🔥', fx: 'sFlick', d: [['✨', 0, 20, 6, 8, 'spark'], ['⚡', 0.5, 20, 76, 10, 'spark'], ['✨', 1, 16, 80, 56, 'spark']] },
  rocket: { m: '🚀', fx: 'sFly', d: [['💨', 0, 22, 62, 60, 'up'], ['⭐', 0.4, 18, 10, 8, 'spark'], ['✨', 0.9, 16, 78, 30, 'spark']] },
  party: { m: '🥳', fx: 'sWiggle', d: [['🎉', 0, 22, 6, 4, 'fall'], ['🎊', 0.3, 20, 74, 6, 'fall'], ['🎈', 0.6, 22, 8, 56, 'up']] },
  cool: { m: '😎', fx: 'sBob', d: [['✨', 0, 18, 10, 12, 'spark'], ['💫', 0.5, 20, 70, 4, 'spark']] },
  cry: { m: '😭', fx: 'sShake', d: [['💧', 0, 18, 14, 56, 'up'], ['💧', 0.4, 18, 66, 60, 'up'], ['💧', 0.8, 16, 42, 68, 'up']] },
  thumb: { m: '👍', fx: 'sBounce', d: [['✨', 0, 18, 10, 16, 'spark'], ['💯', 0.5, 22, 64, 6, 'spark']] },
  clap: { m: '👏', fx: 'sClap', d: [['✨', 0, 18, 8, 10, 'spark'], ['🌟', 0.4, 20, 72, 8, 'spark'], ['💫', 0.8, 18, 10, 54, 'spark']] },
  sleep: { m: '😴', fx: 'sBreathe', d: [['💤', 0, 20, 54, 0, 'up'], ['💤', 0.5, 22, 66, 16, 'up'], ['💤', 1, 24, 76, 34, 'up']] },
  star: { m: '🌟', fx: 'sSpinSlow', d: [['✨', 0, 18, 8, 14, 'spark'], ['⭐', 0.5, 20, 74, 8, 'spark'], ['⭐', 1.5, 16, 6, 56, 'spark']] },
  wow: { m: '🤯', fx: 'sShake', d: [['💥', 0, 22, 6, 4, 'spark'], ['🧠', 0.5, 20, 72, 2, 'up']] },
};

export const EMOJI_PACKS = [
  { n: 'Faces', e: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','😴','🤤','😪','😵','🥴','🤢','🤮','🥶','🥵','🤯','🥳','😎','🤓','🧐'] },
  { n: 'Hearts', e: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','♥️','😢','😭','🥺','😔','😞','😟','🙁','☹️','😣','😖','😫','😩','🥱','😤','😠','😡','🤬','😈','👿','💀','💩','🤡','👻','👽','🤖'] },
  { n: 'People', e: ['👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🧠','👀','👁️','👅','👄','🫶','🫰','🫡','🫢','🫂','👣'] },
  { n: 'Animals', e: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🕷️','🦂','🐢','🐍','🦎','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈'] },
  { n: 'Food', e: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🌽','🥕','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🧀','🥚','🍳','🧇','🥞','🧈','🍗','🍖','🌭','🍔','🍟','🍕','🥪','🌮','🌯','🥗','🍝','🍜','🍲','🍣','🍱','🍛','🍚','🍥','🥟','🍦','🍰','🎂','🧁','🥧','🍫','🍬','🍭','🍩','🍪','☕','🍵','🧋','🥤','🍺','🍻','🥂','🍷'] },
  { n: 'Travel', e: ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🛴','🚲','🛵','🏍️','✈️','🛫','🛬','🚀','🛸','🚁','⛵','🚤','🛳️','⛴️','🚢','⚓','🚉','🚂','🚆','🗺️','🧭','🏔️','⛰️','🌋','🗻','🏕️','🏖️','🏜️','🏝️','🏟️','🏛️','🏗️','🏠','🏡','🏢','🏰','🎡','🎢','🎠','⛲','⛱️'] },
  { n: 'Symbols', e: ['❤️‍🔥','⭐','🌟','✨','⚡','🔥','💥','☄️','☀️','🌤️','⛅','🌧️','⛈️','❄️','🌈','☁️','💧','🌊','🎉','🎊','🎈','🎁','🏆','🥇','🎯','🎮','🕹️','🎲','🎨','🎧','🎤','🎸','🥁','🎹','🎵','🎶','📻','💡','🔦','🏮','📱','💻','⌚','📷','🔍','🔒','🔑','💎','⏳','⌛','⏰','🧿','🔮','🌙','🌍','♾️','✅','❌','💯','🆗','🔝'] },
];

export const GIF_ACTIONS = [
  { id: 'hug', label: 'Hug' },
  { id: 'kiss', label: 'Kiss' },
  { id: 'pat', label: 'Pat' },
  { id: 'cuddle', label: 'Cuddle' },
  { id: 'slap', label: 'Slap' },
  { id: 'tickle', label: 'Tickle' },
  { id: 'feed', label: 'Feed' },
  { id: 'neko', label: 'Neko' },
  { id: 'waifu', label: 'Waifu' },
  { id: 'smug', label: 'Smug' },
];

export const EMOJI_DATA = {
  cats: [
    { id: 'smileys', n: 'Smileys', i: '😀', e: '😀 😁 😂 🤣 😃 😄 😅 😆 😉 😊 😋 😎 😍 😘 🥰 😗 😙 😚 ☺️ 🙂 🤗 🤩 🤔 🤨 😐 😑 😶 🙄 😏 😣 😥 😮 🤐 😯 😪 😫 🥱 😴 😌 😛 😜 😝 🤤 😒 😓 😔 😕 🙃 🤑 😲 ☹️ 🙁 😖 😞 😟 😤 😢 😭 😦 😧 😨 😩 🤯 😬 😰 😱 🥵 🥶 😳 🤪 😵 🥴 😠 😡 🤬 😷 🤒 🤕 🤢 🤮 🤧 😇 🥳 🥺 🤠 🤡 🤥 🤫 🤭 🧐 🤓 😈 👿 👹 👺 💀 ☠️ 👻 👽 👾 🤖 💩 ❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 💯 💢 💥 💫 💦 💨 💬 💭 💤 🥹 🫠 🫡 🫢 🫣 🫤 🫥 🫦 🫧 🫨 ❤️‍🔥 ❤️‍🩹' },
    { id: 'people', n: 'People', i: '👋', e: '👋 🤚 🖐️ ✋ 🖖 👌 🤌 🤏 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 🖕 👇 ☝️ 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 👐 🤲 🤝 🙏 ✍️ 💅 🤳 💪 🦾 🦵 🦶 👂 🦻 👃 🧠 🫀 🫁 🦷 🦴 👀 👁️ 👅 👄 🫰 🫱 🫲 🫳 🫴 🫵 🫶 🫷 🫸 👶 🧒 👦 👧 🧑 👱 👨 🧔 👩 🧓 👴 👵 🙍 🙎 🙅 🙆 💁 🙋 🧏 🙇 🤦 🤷 🧑‍💻 👨‍🚀 👩‍🎨 🧑‍🔬 🦸 🦹 🧙 🧚 🧛 🧜 🧝 💃 🕺 🏃 🚶 🧘 🫂' },
    { id: 'animals', n: 'Nature', i: '🐻', e: '🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐻‍❄️ 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🙈 🙉 🙊 🐒 🐔 🐧 🐦 🐤 🐣 🐥 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🐛 🦋 🐌 🐞 🐜 🦟 🦗 🕷️ 🦂 🐢 🐍 🦎 🦖 🦕 🐙 🦑 🦐 🦞 🦀 🐡 🐠 🐟 🐬 🐳 🐋 🦈 🐊 🐅 🐆 🦓 🦍 🦧 🐘 🦛 🦏 🐪 🐫 🦒 🦘 🐃 🐂 🐄 🐎 🐖 🐏 🐑 🦙 🐐 🦌 🐕 🐩 🦮 🐈 🐈‍⬛ 🪶 🐓 🦃 🦤 🦚 🦜 🦢 🦩 🕊️ 🐇 🦝 🦨 🦡 🦫 🦦 🦥 🐁 🐀 🐿️ 🦔 🌵 🎄 🌲 🌳 🌴 🌱 🌿 ☘️ 🍀 🎍 🎋 🍃 🍂 🍁 🍄 🐚 🌾 💐 🌷 🌹 🥀 🌺 🌸 🌼 🌻 🌞 🌝 🌛 🌜 🌚 🌕 🌖 🌗 🌘 🌑 🌒 🌓 🌔 🌙 🌎 🌍 🌏 🪐 💫 ⭐ 🌟 ✨ ⚡ ☄️ 💥 🔥 🌪️ 🌈 ☀️ 🌤️ ⛅ 🌥️ ☁️ 🌦️ 🌧️ ⛈️ 🌩️ 🌨️ ❄️ ☃️ ⛄ 🌬️ 💨 💧 💦 ☔ ☂️ 🌊 🌫️' },
    { id: 'food', n: 'Food', i: '🍔', e: '🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🍆 🥑 🥦 🥬 🥒 🌶️ 🫑 🌽 🥕 🫒 🧄 🧅 🥔 🍠 🥐 🥯 🍞 🥖 🥨 🧀 🥚 🍳 🧈 🥞 🧇 🥓 🥩 🍗 🍖 🦴 🌭 🍔 🍟 🍕 🫓 🥪 🥙 🧆 🌮 🌯 🫔 🥗 🥘 🫕 🥫 🍝 🍜 🍲 🍛 🍣 🍱 🥟 🦪 🍤 🍙 🍚 🍘 🍥 🥠 🥮 🍢 🍡 🍧 🍨 🍦 🥧 🧁 🍰 🎂 🍮 🍭 🍬 🍫 🍿 🍩 🍪 🌰 🥜 🍯 🥛 🍼 ☕ 🫖 🍵 🧃 🥤 🧋 🍶 🍺 🍻 🥂 🍷 🥃 🍸 🍹 🧉 🍾 🧊 🥄 🍴 🍽️ 🥣 🥡 🥢 🧂' },
    { id: 'activities', n: 'Activity', i: '⚽', e: '⚽ 🏀 🏈 ⚾ 🥎 🎾 🏐 🏉 🥏 🎱 🪀 🏓 🏸 🏒 🏑 🥍 🏏 🪃 🥅 ⛳ 🪁 🏹 🎣 🤿 🥊 🥋 🎽 🛹 🛼 🛷 ⛸️ 🥌 🎿 ⛷️ 🏂 🪂 🏋️ 🤼 🤸 ⛹️ 🤺 🤾 🏌️ 🏇 🧘 🏄 🏊 🤽 🚣 🧗 🚵 🚴 🏆 🥇 🥈 🥉 🏅 🎖️ 🏵️ 🎗️ 🎫 🎟️ 🎪 🤹 🎭 🩰 🎨 🎬 🎤 🎧 🎼 🎹 🥁 🪘 🎷 🎺 🪗 🎸 🪕 🎻 🎲 ♟️ 🎯 🎳 🎮 🕹️ 🎰 🧩' },
    { id: 'travel', n: 'Travel', i: '🚗', e: '🚗 🚕 🚙 🚌 🚎 🏎️ 🚓 🚑 🚒 🚐 🛻 🚚 🚛 🚜 🦯 🦽 🦼 🛴 🚲 🛵 🏍️ 🛺 🚨 🚔 🚍 🚘 🚖 🚡 🚠 🚟 🚃 🚋 🚞 🚝 🚄 🚅 🚈 🚂 🚆 🚇 🚊 🚉 ✈️ 🛫 🛬 🛩️ 💺 🛰️ 🚀 🛸 🚁 🛶 ⛵ 🚤 🛥️ 🛳️ ⛴️ 🚢 ⚓ 🪝 ⛽ 🚧 🚦 🚥 🚏 🗺️ 🗿 🗽 🗼 🏰 🏯 🏟️ 🎡 🎢 🎠 ⛲ ⛱️ 🏖️ 🏝️ 🏜️ 🌋 ⛰️ 🏔️ 🗻 🏕️ ⛺ 🛖 🏠 🏡 🏘️ 🏚️ 🏗️ 🏭 🏢 🏬 🏣 🏤 🏥 🏦 🏨 🏪 🏫 🏩 💒 🏛️ ⛪ 🕌 🕍 🛕 🕋 ⛩️ 🛤️ 🛣️ 🗾 🎑 🏞️ 🌅 🌄 🌠 🎇 🎆 🌇 🌆 🏙️ 🌃 🌌 🌉 🌁' },
    { id: 'objects', n: 'Objects', i: '💡', e: '⌚ 📱 📲 💻 ⌨️ 🖥️ 🖨️ 🖱️ 🖲️ 🕹️ 🗜️ 💽 💾 💿 📀 📼 📷 📸 📹 🎥 📽️ 🎞️ 📞 ☎️ 📟 📠 📺 📻 🎙️ 🎚️ 🎛️ 🧭 ⏱️ ⏲️ ⏰ 🕰️ ⌛ ⏳ 📡 🔋 🔌 💡 🔦 🕯️ 🪔 🧯 🛢️ 💸 💵 💴 💶 💷 🪙 💰 💳 💎 ⚖️ 🪜 🧰 🪛 🔧 🔨 ⚒️ 🛠️ ⛏️ 🪚 🔩 ⚙️ 🪤 🧱 ⛓️ 🧲 🔫 💣 🧨 🪓 🔪 🗡️ ⚔️ 🛡️ 🚬 ⚰️ 🪦 ⚱️ 🏺 🔮 📿 🧿 💈 ⚗️ 🔭 🔬 🕳️ 🩹 🩺 💊 💉 🩸 🧬 🦠 🧫 🧪 🌡️ 🧹 🪠 🧺 🧻 🚽 🚰 🚿 🛁 🛀 🧼 🪥 🪒 🧽 🪣 🧴 🛎️ 🔑 🗝️ 🚪 🪑 🛋️ 🛏️ 🛌 🧸 🪆 🖼️ 🪞 🪟 🛍️ 🛒 🎁 🎈 🎏 🎀 🪄 🪅 🎊 🎉 🎎 🏮 🎐 🧧 ✉️ 📩 📨 📧 💌 📥 📤 📦 🏷️ 🪧 📪 📫📬 📭 📮 📯 📜 📃 📄 📑 🧾 📊 📈 📉 🗒️ 🗓️ 📆 📅 🗑️ 📇 🗃️ 🗳️ 🗄️ 📋 📁 📂 🗂️ 🗞️ newspaper 📓 📔 📒 📕 📗 📘 📙 📚 📖 🔖 🧷 🔗 📎 🖇️ 📐 📏 🧮 📌 📍 ✂️ 🖊️ 🖋️ ✒️ 🖌️ 🖍️ 📝 ✏️ 🔍 🔎 🔏 🔐 🔒 🔓' },
    { id: 'symbols', n: 'Symbols', i: '✨', e: '❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 ☮️ ✝️ ☪️ 🕉️ ☸️ ✡️ 🔯 🕎 ☯️ ☦️ 🛐 ⛎ ♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓ 🆔 ⚛️ 🉑 ☢️ ☣️ 📴 📳 🈶 🈚 🈸 🈺 🈷️ ✴️ 🆚 💮 🉐 ㊙️ ㊗️ 🈴 🈵 🈹 🈲 🅰️ 🅱️ 🆎 🆑 🅾️ 🆘 ❌ ⭕ 🛑 ⛔ 📛 🚫 💯 💢 ♨️ 🚷 🚯 🚳 🚱 🔞 📵 🚭 ❗ ❕ ❓ ❔ ‼️ ⁉️ 🔅 🔆 〽️ ⚠️ 🚸 🔱 ⚜️ 🔰 ♻️ ✅ 🈯 💹 ❇️ ✳️ ❎ 🌐 💠 Ⓜ️ 🌀 💤 🏧 🚾 ♿ 🅿️ 🛗 🈳 🈂️ 🛂 🛃 🛄 🛅 🚹 🚺 🚼 ⚧️ 🚻 🚮 🎦 📶 🈁 🔣 ℹ️ 🔤 🔡 🔠 🆖 🆗 🆙 🆒 🆕 🆓 0️⃣ 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟 🔢 #️⃣ *️⃣ ⏏️ ▶️ ⏸️ ⏯️ ⏹️ ⏺️ ⏭️ ⏮️ ⏩ ⏪ ⏫ ⏬ ◀️ 🔼 🔽 ➡️ ⬅️ ⬆️ ⬇️ ↗️ ↘️ ↙️ ↖️ ↕️ ↔️ ↪️ ↩️ ⤴️ ⤵️ 🔀 🔁 🔂 🔄 🔃 🎵 🎶 ➕ ➖ ➗ ✖️ ♾️ 💲 💱 ™️ ©️ ®️ 〰️ ➰ ➿ 🔚 🔙 🔛 🔝 🔜 ✔️ ☑ 🔘 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪ 🟤 🔺 🔻 🔸 🔹 🔶 🔷 🔳 🔲 ▪ ▫ ◾ ◽ ◼ ◻ 🟥 🟧 🟨 🟩 🟦 🟪 ⬛ ⬜ 🟫 🔈 🔇 🔉 🔊 🔔 🔕 📣 📢 💬 💭 🗯️ ♠️ ♣️ ♥️ ♦️ 🃏 🎴 🀄' },
    { id: 'flags', n: 'Flags', i: '🏁', e: '🏁 🚩 🎌 🏴 🏳️ 🏳️‍🌈 🏳️‍⚧️ 🏴‍☠️ 🇺🇳 🇺🇸 🇬🇧 🇮🇳 🇨🇦 🇦🇺 🇩🇪 🇫🇷 🇯🇵 🇰🇷 🇧🇷 🇮🇹 🇪🇸 🇲🇽 🇳🇱 🇸🇪 🇨🇭 🇸🇬 🇦🇪 🇸🇦 🇿🇦 🇳🇿 🇮🇪 🇳🇴 🇩🇰 🇫🇮 🇵🇱 🇵🇹 🇹🇷 🇮🇩 🇹🇭 🇻🇳 🇵🇭 🇲🇾' },
  ],
  mb: '☝⛹✊✋✌✍🎅🏂🏃🏄🏇🏊🏋🏌👂👃👆👇👈👉👊👋👌👍👎👏👐👦👧👨👩👪👫👬👭👮👯👰👱👲👳👴👵👶👷👸👼💁💂💃💅💆💇💏💑💪🕴🕵🕺🖐🖕🖖🙅🙆🙇🙋🙌🙍🙎🙏🚣🚴🚵🚶🛀🛌🤌🤏🤘🤙🤚🤛🤜🤝🤞🤟🤦🤰🤱🤲🤳🤴🤵🤶🤷🤸🤹🤼🤽🤾🥷🦵🦶🦸🦹🦻🧍🧎🧏🧑🧒🧓🧔🧕🧖🧗🧘🧙🧚🧛🧜🧝🫃🫄🫅🫰🫱🫲🫳🫴🫵🫶🫷🫸',
};
