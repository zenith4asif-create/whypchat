import { BLOCK_SVG, MSG_SVG, TTL_OPTIONS } from '../data/emojiData';

export interface ProfileCardDeps {
  $: <T extends HTMLElement = HTMLElement>(s: string) => T | null;
  toast: (msg: string) => void;
  getMyUid: () => string | null;
  getMyProfile: () => { uid: string; name: string; email: string; bio: string; photoURL?: string } | null;
  getPeerUid: () => string | null;
  getUsersMap: () => Record<string, any>;
  getLiveMessages: () => Map<string, any>;
  paintAv: (el: HTMLElement | null, uid: string | null, name?: string) => void;
  hashColor: (s: string) => string;
  fmtSeen: (t?: number) => string;
  fmtDate: (t?: number) => string;
  fmtTTL: (s: number) => string;
  maskEmail: (e?: string) => string;
  defaultBio: string;
  iBlocked: (uid: string) => boolean;
  blockUser: (uid: string) => void;
  unblockUser: (uid: string) => void;
  clearChat: (uid: string) => void;
  openChat: (uid: string, name?: string) => void;
  openCustomize: () => void;
  openMediaPickerForChat: () => void;
  openViewer: (key: string) => void;
  openPlayer: (key: string) => void;
  notifActive: () => boolean;
  toggleNotifications: () => void;
  setSelfDestruct: (seconds: number, label: string) => void;
  startBioEdit: () => void;
  closeProfileModal: () => void;
}

const SHARE_MEDIA_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M21 15l-5-5-9 9"/></svg>';
const TIMER_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
const BELL_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
const EDIT_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3l4 4L8 20l-5 1 1-5L17 3z"/></svg>';
const GEAR_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.77 1.02 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
const TRASH_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>';

function makeHandle(name: string, uid: string): string {
  const slug = String(name || 'user')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 12) || 'user';
  return `@${slug}.${String(uid || '').slice(0, 4).toLowerCase()}`;
}

export function createProfileExperience(deps: ProfileCardDeps) {
  const { $ } = deps;

  function renderSharedMediaInto(gridEl: HTMLElement | null, countEl: HTMLElement | null, targetUid: string, onSelect?: () => void) {
    if (!gridEl) return;
    gridEl.innerHTML = '';
    const peerUid = deps.getPeerUid();
    const myUid = deps.getMyUid();
    if (!peerUid || (targetUid !== peerUid && targetUid !== myUid)) {
      if (countEl) countEl.textContent = '0 items';
      gridEl.innerHTML = '<div class="pmedia-empty">Open a chat to view active disappearing media</div>';
      return;
    }

    const items = [...deps.getLiveMessages().entries()].filter(([, e]) => {
      if (e.dying || e.data.viewOnce) return false;
      const t = e.data.type;
      return t === 'photo' || t === 'gif' || t === 'video';
    });

    if (countEl) countEl.textContent = `${items.length} active`;
    if (!items.length) {
      gridEl.innerHTML = '<div class="pmedia-empty">No active photos or videos in this chat right now</div>';
      return;
    }

    items.slice(-8).reverse().forEach(([key, e]) => {
      const cell = document.createElement('div');
      cell.className = 'pmedia-thumb';
      if (e.data.type === 'video') {
        const v = document.createElement('video');
        v.src = e.data.url + '#t=0.2';
        v.muted = true;
        v.preload = 'metadata';
        cell.appendChild(v);
      } else {
        const im = document.createElement('img');
        im.src = e.data.url;
        im.loading = 'lazy';
        im.alt = 'Shared media';
        im.referrerPolicy = 'no-referrer';
        cell.appendChild(im);
      }
      cell.addEventListener('click', () => {
        onSelect?.();
        if (e.data.type === 'video') deps.openPlayer(key);
        else deps.openViewer(key);
      });
      gridEl.appendChild(cell);
    });
  }

  function buildQuickDock(container: HTMLElement | null, uid: string, name: string, fromModal: boolean) {
    if (!container) return;
    container.innerHTML = '';
    const myUid = deps.getMyUid();
    const own = uid === myUid;

    const addTile = (cls: string, icon: string, label: string, fn: () => void) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = ('pq-btn ' + cls).trim();
      b.innerHTML = `${icon}<span>${label}</span>`;
      b.addEventListener('click', fn);
      container.appendChild(b);
    };

    if (own) {
      addTile('accent', EDIT_SVG, 'Edit Bio', () => {
        if (!fromModal) return;
        deps.startBioEdit();
      });
      addTile('', TIMER_SVG, 'Timer', () => {
        const row = $('#pTimerRow');
        row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      addTile('', BELL_SVG, deps.notifActive() ? 'Alerts On' : 'Alerts Off', () => {
        deps.toggleNotifications();
      });
      addTile('', GEAR_SVG, 'Settings', () => {
        if (fromModal) deps.closeProfileModal();
        deps.openCustomize();
      });
    } else {
      addTile('accent', MSG_SVG, 'Message', () => {
        if (fromModal) deps.closeProfileModal();
        closeDrawer();
        deps.openChat(uid, name);
      });
      addTile('', SHARE_MEDIA_SVG, 'Send Media', () => {
        if (fromModal) deps.closeProfileModal();
        closeDrawer();
        if (deps.getPeerUid() !== uid) deps.openChat(uid, name);
        setTimeout(() => deps.openMediaPickerForChat(), 140);
      });
      addTile('', TIMER_SVG, 'Vanish', () => {
        if (fromModal) deps.closeProfileModal();
        deps.openCustomize();
      });
      const blocked = deps.iBlocked(uid);
      addTile(blocked ? '' : 'danger', BLOCK_SVG, blocked ? 'Unblock' : 'Block', () => {
        if (blocked) deps.unblockUser(uid);
        else deps.blockUser(uid);
      });
    }
  }

  function fillProfileModal(uid: string) {
    const usersMap = deps.getUsersMap();
    const myUid = deps.getMyUid();
    const myProfile = deps.getMyProfile();
    let u = usersMap[uid];
    if (!u && uid === myUid && myProfile) {
      u = {
        name: myProfile.name,
        email: myProfile.email,
        bio: myProfile.bio,
        photoURL: myProfile.photoURL,
        selfDestruct: 40,
        createdAt: Date.now(),
        online: true,
      };
    }
    if (!u) return;

    const own = uid === myUid;
    const name = u.name || 'User';
    const handle = makeHandle(name, uid);

    deps.paintAv($('#pAv'), uid, name);
    const aura = $('#pAura');
    if (aura) {
      if (u.photoURL) {
        aura.style.backgroundImage = `url(${u.photoURL})`;
      } else {
        aura.style.backgroundImage = `linear-gradient(135deg, ${deps.hashColor(name + uid)}, #00A884)`;
      }
    }

    if ($('#pAvEdit')) $('#pAvEdit')!.hidden = !own;
    if ($('#pAv')) {
      $('#pAv')!.dataset.photo = u.photoURL || '';
      $('#pAv')!.dataset.name = name;
    }
    if ($('#pCardTag')) $('#pCardTag')!.textContent = own ? 'My Identity Card' : 'Contact Card';
    if ($('#pDot')) $('#pDot')!.className = 'dot' + (u.online ? ' on' : '');
    if ($('#pName')) $('#pName')!.textContent = name;
    if ($('#pBadge')) {
      $('#pBadge')!.innerHTML = u.online
        ? '<span class="on"><i></i>Online</span>'
        : '<span><i></i>' + deps.fmtSeen(u.lastSeen) + '</span>';
    }

    const copyBtn = $('#pCopyHandle');
    if (copyBtn) {
      const span = copyBtn.querySelector('span');
      if (span) span.textContent = handle;
      copyBtn.onclick = () => {
        navigator.clipboard?.writeText(handle).catch(() => {});
        deps.toast('Copied handle ' + handle);
      };
    }

    buildQuickDock($('#pQuickDock'), uid, name, true);

    if ($('#pBio')) $('#pBio')!.textContent = u.bio || deps.defaultBio;
    if ($('#pEdit')) $('#pEdit')!.hidden = !own;
    if ($('#stDays')) {
      $('#stDays')!.textContent = String(
        u.createdAt ? Math.max(1, Math.floor((Date.now() - u.createdAt) / 864e5)) : 1
      );
    }
    if ($('#stStatus')) $('#stStatus')!.textContent = u.online ? 'Active' : 'Away';
    if ($('#stTtl')) $('#stTtl')!.textContent = deps.fmtTTL(u.selfDestruct || 40);
    if ($('#pEmail')) $('#pEmail')!.textContent = own ? (u.email || 'Private account') : deps.maskEmail(u.email);
    if ($('#pSince')) $('#pSince')!.textContent = 'Joined ' + deps.fmtDate(u.createdAt);
    if ($('#pLast')) {
      $('#pLast')!.textContent = u.online
        ? 'Currently active'
        : deps.fmtSeen(u.lastSeen).replace(/^l/, 'L');
    }

    // Shared media section (visible when viewing active chat peer)
    const mediaSec = $('#pMediaSec');
    if (mediaSec) {
      const showMedia = !own && deps.getPeerUid() === uid;
      mediaSec.hidden = !showMedia;
      if (showMedia) {
        renderSharedMediaInto($('#pMediaGrid'), $('#pMediaCount'), uid, () => deps.closeProfileModal());
      }
    }

    if ($('#pTimerRow')) $('#pTimerRow')!.hidden = !own;
    if ($('#pNotifyRow')) $('#pNotifyRow')!.hidden = !own;

    if (own) {
      $('#notifyT')?.classList.toggle('on', deps.notifActive());
      const cur = u.selfDestruct || 40;
      const box = $('#tChips');
      if (box) {
        box.innerHTML = '';
        TTL_OPTIONS.forEach(o => {
          const c = document.createElement('button');
          c.type = 'button';
          c.className = 'tchip' + (cur === o.s ? ' on' : '');
          c.textContent = o.l;
          c.addEventListener('click', () => {
            if (cur === o.s) return;
            deps.setSelfDestruct(o.s, o.l);
          });
          box.appendChild(c);
        });
      }
    }

    const acts = $('#pActs');
    if (acts) {
      acts.innerHTML = '';
      const mk = (cls: string, icon: string, label: string, fn: () => void) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'pact ' + cls;
        b.innerHTML = icon + '<span>' + label + '</span>';
        b.addEventListener('click', fn);
        acts.appendChild(b);
      };
      if (own) {
        mk('primary', EDIT_SVG, 'Edit Bio', deps.startBioEdit);
        mk('ghost', GEAR_SVG, 'Appearance & Settings', () => {
          deps.closeProfileModal();
          deps.openCustomize();
        });
      } else {
        mk('primary', MSG_SVG, 'Send Message', () => {
          deps.closeProfileModal();
          deps.openChat(uid, name);
        });
        if (deps.iBlocked(uid)) {
          mk('ghost', BLOCK_SVG, 'Unblock Contact', () => deps.unblockUser(uid));
        } else {
          mk('danger', BLOCK_SVG, 'Block Contact', () => deps.blockUser(uid));
        }
      }
    }
  }

  function fillDrawer() {
    const drawer = $('#chatInfoDrawer');
    const peerUid = deps.getPeerUid();
    if (!drawer || drawer.hidden || !peerUid) return;
    const u = deps.getUsersMap()[peerUid] || {};
    const name = u.name || 'Contact';
    const handle = makeHandle(name, peerUid);

    deps.paintAv($('#cidAvatar'), peerUid, name);
    if ($('#cidDot')) $('#cidDot')!.className = 'dot' + (u.online ? ' on' : '');
    if ($('#cidName')) $('#cidName')!.textContent = name;
    if ($('#cidState')) {
      $('#cidState')!.innerHTML = u.online
        ? '<span class="on"><i></i>Online now</span>'
        : '<span><i></i>' + deps.fmtSeen(u.lastSeen) + '</span>';
    }
    const copyBtn = $('#cidHandleCopy');
    if (copyBtn) {
      const sp = copyBtn.querySelector('span');
      if (sp) sp.textContent = handle;
      copyBtn.onclick = () => {
        navigator.clipboard?.writeText(handle).catch(() => {});
        deps.toast('Copied handle ' + handle);
      };
    }

    buildQuickDock($('#cidQuickDock'), peerUid, name, false);

    if ($('#cidBio')) $('#cidBio')!.textContent = u.bio || deps.defaultBio;
    if ($('#cidTtlVal')) {
      const myTtl = (deps.getUsersMap()[deps.getMyUid() || ''] || {}).selfDestruct || 40;
      $('#cidTtlVal')!.textContent = `Messages auto-dissolve after ${deps.fmtTTL(myTtl)}`;
    }
    if ($('#cidJoined')) $('#cidJoined')!.textContent = 'Joined ' + deps.fmtDate(u.createdAt);

    renderSharedMediaInto($('#cidMediaGrid'), $('#cidMediaCount'), peerUid);

    const acts = $('#cidActions');
    if (acts) {
      acts.innerHTML = '';
      const mk = (cls: string, icon: string, label: string, fn: () => void) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'pact ' + cls;
        b.innerHTML = icon + '<span>' + label + '</span>';
        b.addEventListener('click', fn);
        acts.appendChild(b);
      };
      mk('ghost', TRASH_SVG, 'Clear Chat', () => deps.clearChat(peerUid));
      if (deps.iBlocked(peerUid)) {
        mk('ghost', BLOCK_SVG, 'Unblock', () => deps.unblockUser(peerUid));
      } else {
        mk('danger', BLOCK_SVG, 'Block', () => deps.blockUser(peerUid));
      }
    }
  }

  function toggleDrawer() {
    const drawer = $('#chatInfoDrawer');
    if (!drawer || !deps.getPeerUid()) return;
    drawer.hidden = !drawer.hidden;
    if (!drawer.hidden) fillDrawer();
  }

  function closeDrawer() {
    const drawer = $('#chatInfoDrawer');
    if (drawer) drawer.hidden = true;
  }

  $('#cidClose')?.addEventListener('click', closeDrawer);

  return {
    fillProfileModal,
    fillDrawer,
    toggleDrawer,
    closeDrawer,
    isDrawerOpen: () => {
      const d = $('#chatInfoDrawer');
      return !!d && !d.hidden;
    },
  };
}
