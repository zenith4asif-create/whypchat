export interface StudioSendOptions {
  file: File;
  kind: 'photo' | 'video' | 'gif';
  caption: string;
  viewOnce: boolean;
  sendToChat: boolean;
  sendToStatus: boolean;
  trimStart: number;
  trimEnd: number;
  vidDuration: number;
  vidMuted: boolean;
}

export interface MediaStudioDeps {
  $: <T extends HTMLElement = HTMLElement>(s: string) => T | null;
  toast: (msg: string) => void;
  getPeerInfo: () => { peerUid: string | null; peerName: string };
  openFileReplace: () => void;
  onCropRequest: (currentFile: File, cb: (croppedFile: File) => void) => void;
  onSend: (opts: StudioSendOptions) => Promise<void>;
}

interface BrushStroke {
  color: string;
  size: number;
  points: { x: number; y: number }[];
}

interface CanvasOverlay {
  id: string;
  kind: 'text' | 'sticker';
  text: string;
  x: number; // normalized 0..1
  y: number; // normalized 0..1
  color: string;
  bgStyle: 'none' | 'dark' | 'accent';
  scale: number;
}

const STUDIO_FILTERS: Record<string, string> = {
  none: 'none',
  pop: 'saturate(1.42) contrast(1.12) brightness(1.03)',
  warm: 'sepia(0.28) saturate(1.32) brightness(1.04)',
  cool: 'hue-rotate(14deg) saturate(1.15) contrast(1.06)',
  chrome: 'contrast(1.28) saturate(1.22) brightness(0.98)',
  bw: 'grayscale(1) contrast(1.18)',
  vintage: 'sepia(0.52) contrast(1.06) brightness(0.96)',
  night: 'brightness(1.16) contrast(1.14) saturate(1.18)',
};

const STAMP_EMOJIS = [
  '❤️', '🔥', '😂', '😍', '🥳', '✨', '💯', '🙌',
  '😎', '🤩', '🫶', '⚡', '🎉', '🌟', '💎', '🦋',
  '🍕', '☕', '🚀', '🌈', '👑', '💬', '👀', '💚',
];

export function transformCloudinaryVideoUrl(
  secureUrl: string,
  trimStart: number,
  trimEnd: number,
  vidDuration: number,
  muted: boolean
): string {
  if (!secureUrl || !secureUrl.includes('/upload/')) return secureUrl;
  const parts: string[] = [];
  const s = Math.max(0, Number(trimStart.toFixed(1)));
  const e = Number(trimEnd.toFixed(1));
  if (s > 0.2) parts.push(`so_${s}`);
  if (vidDuration > 0 && e > s && e < vidDuration - 0.3) parts.push(`eo_${e}`);
  if (muted) parts.push('ac_none');
  if (!parts.length) return secureUrl;
  return secureUrl.replace('/upload/', `/upload/${parts.join(',')}/`);
}

export function createMediaStudio(deps: MediaStudioDeps) {
  const { $, toast } = deps;

  let currentFile: File | null = null;
  let isVideo = false;
  let viewOnce = false;
  let hdMode = false;
  let sendToChat = true;
  let sendToStatus = false;
  let busy = false;

  // Image editor state
  let baseImg: HTMLImageElement | null = null;
  let imgUrl = '';
  let rot = 0; // 0, 90, 180, 270
  let flipX = false;
  let activeFilter = 'none';
  let drawMode = false;
  let brushColor = '#00A884';
  let brushSize = 8;
  let strokes: BrushStroke[] = [];
  let overlays: CanvasOverlay[] = [];
  let undoStack: ('stroke' | 'overlay')[] = [];

  // Text editor temp state
  let textColor = '#FFFFFF';
  let textBgStyle: 'none' | 'dark' | 'accent' = 'dark';
  let editingOverlayId: string | null = null;

  // Video editor state
  let vidUrl = '';
  let vidDuration = 0;
  let trimStart = 0;
  let trimEnd = 0;
  let vidMuted = false;
  let vidAsGif = false;

  // Pointer interaction on canvas
  let activeStroke: BrushStroke | null = null;
  let dragOverlay: { ov: CanvasOverlay; dx: number; dy: number; moved: boolean } | null = null;

  const cv = $('#msCanvas') as HTMLCanvasElement | null;
  const vid = $('#msVideo') as HTMLVideoElement | null;

  function fmtSec(s: number) {
    const sec = Math.max(0, Math.round(s || 0));
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }

  document.querySelectorAll<HTMLElement>('.ms-swatch[data-col]').forEach(el => {
    if (el.dataset.col) el.style.background = el.dataset.col;
  });
  document.querySelectorAll<HTMLElement>('.ms-bsize[data-sz]').forEach(el => {
    const dot = el.querySelector('i') as HTMLElement | null;
    if (dot && el.dataset.sz) {
      const px = Math.min(18, Math.max(5, Number(el.dataset.sz) + 2)) + 'px';
      dot.style.width = px;
      dot.style.height = px;
    }
  });

  function buildStickerTray() {
    const tray = $('#msStickerTray');
    if (!tray || tray.dataset.built) return;
    tray.dataset.built = '1';
    STAMP_EMOJIS.forEach(em => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ms-stamp-btn';
      b.textContent = em;
      b.addEventListener('click', () => {
        overlays.push({
          id: 'ov_' + Date.now() + Math.random().toString(36).slice(2, 6),
          kind: 'sticker',
          text: em,
          x: 0.5 + (Math.random() - 0.5) * 0.16,
          y: 0.5 + (Math.random() - 0.5) * 0.16,
          color: '#FFFFFF',
          bgStyle: 'none',
          scale: 1,
        });
        undoStack.push('overlay');
        hideSubbars();
        syncUndoBtn();
        renderCanvas();
        toast('Drag emoji anywhere on the photo');
      });
      tray.appendChild(b);
    });
  }

  function hideSubbars() {
    drawMode = false;
    $('#msToolDraw')?.classList.remove('on');
    $('#msToolSticker')?.classList.remove('on');
    if ($('#msDrawBar')) $('#msDrawBar')!.hidden = true;
    if ($('#msStickerBar')) $('#msStickerBar')!.hidden = true;
  }

  function syncUndoBtn() {
    const btn = $('#msUndoBtn') as HTMLButtonElement | null;
    if (!btn) return;
    btn.hidden = isVideo || (strokes.length === 0 && overlays.length === 0);
  }

  function syncDestChips() {
    const { peerUid } = deps.getPeerInfo();
    const chatChip = $('#msDestChat');
    const statusChip = $('#msDestStatus');
    if (chatChip) {
      chatChip.hidden = !peerUid;
      chatChip.classList.toggle('on', sendToChat && !!peerUid);
      const lbl = chatChip.querySelector('span');
      if (lbl) lbl.textContent = deps.getPeerInfo().peerName || 'Chat';
    }
    if (statusChip) {
      statusChip.classList.toggle('on', sendToStatus);
    }
  }

  function renderCanvas(targetCanvas?: HTMLCanvasElement, exportScale = 1) {
    const c = targetCanvas || cv;
    if (!c || !baseImg) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const swapped = rot === 90 || rot === 270;
    const srcW = swapped ? baseImg.naturalHeight : baseImg.naturalWidth;
    const srcH = swapped ? baseImg.naturalWidth : baseImg.naturalHeight;
    const maxDim = targetCanvas ? (hdMode ? 2048 : 1360) : 1100;
    const scale = Math.min(1, maxDim / Math.max(srcW || 1, srcH || 1)) * exportScale;
    const W = Math.max(1, Math.round(srcW * scale));
    const H = Math.max(1, Math.round(srcH * scale));

    if (c.width !== W || c.height !== H) {
      c.width = W;
      c.height = H;
    }

    ctx.save();
    ctx.clearRect(0, 0, W, H);
    ctx.filter = STUDIO_FILTERS[activeFilter] || 'none';
    ctx.translate(W / 2, H / 2);
    ctx.rotate((rot * Math.PI) / 180);
    if (flipX) ctx.scale(-1, 1);

    const drawW = swapped ? H : W;
    const drawH = swapped ? W : H;
    ctx.drawImage(baseImg, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Draw brush strokes (stored in normalized 0..1 coordinates)
    const minSide = Math.min(W, H);
    strokes.forEach(st => {
      if (!st.points.length) return;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = st.color;
      ctx.lineWidth = (st.size / 640) * minSide;
      ctx.beginPath();
      const p0 = st.points[0];
      ctx.moveTo(p0.x * W, p0.y * H);
      for (let i = 1; i < st.points.length; i++) {
        const prev = st.points[i - 1];
        const cur = st.points[i];
        const mx = ((prev.x + cur.x) / 2) * W;
        const my = ((prev.y + cur.y) / 2) * H;
        ctx.quadraticCurveTo(prev.x * W, prev.y * H, mx, my);
      }
      if (st.points.length === 1) {
        ctx.lineTo(p0.x * W + 0.5, p0.y * H + 0.5);
      }
      ctx.stroke();
      ctx.restore();
    });

    // Draw draggable stickers & text overlays
    overlays.forEach(ov => {
      ctx.save();
      const cx = ov.x * W;
      const cy = ov.y * H;
      ctx.translate(cx, cy);
      if (ov.kind === 'sticker') {
        const fsz = Math.round(minSide * 0.13 * (ov.scale || 1));
        ctx.font = `${fsz}px "Plus Jakarta Sans", "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ov.text, 0, 0);
      } else {
        const fsz = Math.max(18, Math.round(minSide * 0.056 * (ov.scale || 1)));
        ctx.font = `700 ${fsz}px "Plus Jakarta Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const lines = ov.text.split('\n').slice(0, 4);
        const lh = fsz * 1.24;
        const totalH = lines.length * lh;
        let maxW = 0;
        lines.forEach(ln => {
          maxW = Math.max(maxW, ctx.measureText(ln).width);
        });
        if (ov.bgStyle !== 'none') {
          const padX = fsz * 0.55;
          const padY = fsz * 0.32;
          const rx = -maxW / 2 - padX;
          const ry = -totalH / 2 - padY;
          const rw = maxW + padX * 2;
          const rh = totalH + padY * 2;
          const rad = Math.min(16, rh / 2);
          ctx.fillStyle =
            ov.bgStyle === 'accent' ? 'rgba(0, 168, 132, 0.92)' : 'rgba(11, 20, 26, 0.78)';
          ctx.beginPath();
          ctx.roundRect(rx, ry, rw, rh, rad);
          ctx.fill();
        } else {
          ctx.shadowColor = 'rgba(0,0,0,0.68)';
          ctx.shadowBlur = 10;
        }
        ctx.fillStyle = ov.color || '#FFFFFF';
        lines.forEach((ln, idx) => {
          const ly = -totalH / 2 + lh * (idx + 0.5);
          ctx.fillText(ln, 0, ly);
        });
      }
      ctx.restore();
    });
  }

  function hitTestOverlay(nx: number, ny: number): CanvasOverlay | null {
    for (let i = overlays.length - 1; i >= 0; i--) {
      const ov = overlays[i];
      const hitR = ov.kind === 'sticker' ? 0.09 : 0.14;
      if (Math.abs(nx - ov.x) < hitR && Math.abs(ny - ov.y) < 0.085) {
        return ov;
      }
    }
    return null;
  }

  function normCoords(e: PointerEvent): { x: number; y: number } {
    if (!cv) return { x: 0.5, y: 0.5 };
    const r = cv.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - r.left) / (r.width || 1))),
      y: Math.max(0, Math.min(1, (e.clientY - r.top) / (r.height || 1))),
    };
  }

  if (cv) {
    cv.addEventListener('pointerdown', e => {
      if (isVideo || !baseImg) return;
      const pt = normCoords(e);
      if (drawMode) {
        cv.setPointerCapture(e.pointerId);
        activeStroke = { color: brushColor, size: brushSize, points: [pt] };
        strokes.push(activeStroke);
        undoStack.push('stroke');
        syncUndoBtn();
        renderCanvas();
        return;
      }
      const hit = hitTestOverlay(pt.x, pt.y);
      if (hit) {
        cv.setPointerCapture(e.pointerId);
        dragOverlay = { ov: hit, dx: pt.x - hit.x, dy: pt.y - hit.y, moved: false };
      }
    });

    cv.addEventListener('pointermove', e => {
      if (activeStroke) {
        activeStroke.points.push(normCoords(e));
        renderCanvas();
      } else if (dragOverlay) {
        const pt = normCoords(e);
        const nx = Math.max(0.06, Math.min(0.94, pt.x - dragOverlay.dx));
        const ny = Math.max(0.06, Math.min(0.94, pt.y - dragOverlay.dy));
        if (Math.hypot(nx - dragOverlay.ov.x, ny - dragOverlay.ov.y) > 0.008) {
          dragOverlay.moved = true;
        }
        dragOverlay.ov.x = nx;
        dragOverlay.ov.y = ny;
        renderCanvas();
      }
    });

    const endPtr = () => {
      if (dragOverlay && !dragOverlay.moved && dragOverlay.ov.kind === 'text') {
        openTextEditor(dragOverlay.ov);
      }
      activeStroke = null;
      dragOverlay = null;
    };
    cv.addEventListener('pointerup', endPtr);
    cv.addEventListener('pointercancel', endPtr);
  }

  function openTextEditor(existing?: CanvasOverlay) {
    hideSubbars();
    const modal = $('#msTextEditor');
    const inp = $('#msTextInput') as HTMLTextAreaElement | null;
    if (!modal || !inp) return;
    editingOverlayId = existing ? existing.id : null;
    inp.value = existing ? existing.text : '';
    textColor = existing ? existing.color : '#FFFFFF';
    textBgStyle = existing ? existing.bgStyle : 'dark';
    syncTextEditorPreview();
    modal.hidden = false;
    setTimeout(() => inp.focus(), 40);
  }

  function syncTextEditorPreview() {
    const inp = $('#msTextInput') as HTMLTextAreaElement | null;
    if (!inp) return;
    inp.style.color = textColor;
    inp.style.background =
      textBgStyle === 'accent'
        ? 'rgba(0, 168, 132, 0.88)'
        : textBgStyle === 'dark'
        ? 'rgba(15, 25, 32, 0.82)'
        : 'transparent';
    document.querySelectorAll('#msTextColors .ms-swatch').forEach(sw => {
      sw.classList.toggle('on', (sw as HTMLElement).dataset.col === textColor);
    });
  }

  function closeTextEditor(commit: boolean) {
    const modal = $('#msTextEditor');
    const inp = $('#msTextInput') as HTMLTextAreaElement | null;
    if (!modal || !inp) return;
    const val = inp.value.trim();
    if (commit) {
      if (editingOverlayId) {
        const idx = overlays.findIndex(x => x.id === editingOverlayId);
        if (idx >= 0) {
          if (!val) overlays.splice(idx, 1);
          else {
            overlays[idx].text = val;
            overlays[idx].color = textColor;
            overlays[idx].bgStyle = textBgStyle;
          }
        }
      } else if (val) {
        overlays.push({
          id: 'ov_' + Date.now(),
          kind: 'text',
          text: val,
          x: 0.5,
          y: 0.45,
          color: textColor,
          bgStyle: textBgStyle,
          scale: 1,
        });
        undoStack.push('overlay');
      }
      syncUndoBtn();
      renderCanvas();
    }
    editingOverlayId = null;
    modal.hidden = true;
  }

  async function exportFinalFile(): Promise<{ file: File; kind: 'photo' | 'video' | 'gif' }> {
    if (!currentFile) throw new Error('No media selected');
    if (isVideo) {
      return {
        file: currentFile,
        kind: vidAsGif ? 'gif' : 'video',
      };
    }
    const hasEdits =
      rot !== 0 ||
      flipX ||
      activeFilter !== 'none' ||
      strokes.length > 0 ||
      overlays.length > 0 ||
      hdMode;

    if (!hasEdits || !baseImg) {
      return { file: currentFile, kind: 'photo' };
    }

    const outCv = document.createElement('canvas');
    renderCanvas(outCv, 1);
    const quality = hdMode ? 0.94 : 0.85;
    const blob = await new Promise<Blob | null>(res => outCv.toBlob(res, 'image/jpeg', quality));
    if (!blob) return { file: currentFile, kind: 'photo' };
    const edited = new File([blob], 'studio_' + Date.now() + '.jpg', { type: 'image/jpeg' });
    return { file: edited, kind: 'photo' };
  }

  function updateTrimUI() {
    const lbl = $('#msTrimLabel');
    const durEl = $('#msTrimDur');
    const clipLen = Math.max(0.5, trimEnd - trimStart);
    if (lbl) lbl.textContent = `${fmtSec(trimStart)} – ${fmtSec(trimEnd)}`;
    if (durEl) {
      durEl.textContent = `${clipLen.toFixed(1)}s${vidAsGif ? ' · GIF Loop' : vidMuted ? ' · Muted' : ''}`;
    }
    const gifBtn = $('#msGifModeBtn');
    if (gifBtn) {
      gifBtn.hidden = !isVideo || clipLen > 12;
      if (clipLen > 12 && vidAsGif) {
        vidAsGif = false;
        gifBtn.classList.remove('on');
      }
    }
  }

  function open(file: File, target: 'chat' | 'status' = 'chat') {
    currentFile = file;
    isVideo = file.type.startsWith('video');
    viewOnce = false;
    hdMode = false;
    rot = 0;
    flipX = false;
    activeFilter = 'none';
    strokes = [];
    overlays = [];
    undoStack = [];
    vidMuted = false;
    vidAsGif = false;

    const { peerUid } = deps.getPeerInfo();
    sendToChat = target === 'chat' && !!peerUid;
    sendToStatus = target === 'status' || !peerUid;

    hideSubbars();
    buildStickerTray();

    $('#voT')?.classList.remove('on');
    if ($('#voT')) $('#voT')!.hidden = !sendToChat;
    $('#msHdBtn')?.classList.remove('on');
    $('#msMuteVidBtn')?.classList.remove('on');
    $('#msGifModeBtn')?.classList.remove('on');
    $('#msToolFilter')?.classList.remove('on');

    document.querySelectorAll('#msFilterStrip .ms-filter-chip').forEach(c => {
      c.classList.toggle('on', (c as HTMLElement).dataset.filter === 'none');
    });

    const cap = $('#csCap') as HTMLInputElement | null;
    if (cap) cap.value = '';
    if ($('#csName')) {
      $('#csName')!.textContent =
        `${file.name.slice(0, 24)} · ${(file.size / 1048576).toFixed(1)} MB`;
    }
    if ($('#csProg')) $('#csProg')!.hidden = true;
    if ($('#csBar')) $('#csBar')!.style.width = '0%';
    if ($('#csSend')) ($('#csSend') as HTMLButtonElement).disabled = false;

    // Show/hide image vs video tools
    ['#msToolCrop', '#msRotateBtn', '#msFlipBtn', '#msToolSticker', '#msToolText', '#msToolDraw', '#msHdBtn'].forEach(sel => {
      const el = $(sel);
      if (el) el.hidden = isVideo;
    });
    if ($('#msMuteVidBtn')) $('#msMuteVidBtn')!.hidden = !isVideo;
    if ($('#msGifModeBtn')) $('#msGifModeBtn')!.hidden = !isVideo;
    if ($('#msVideoTrim')) $('#msVideoTrim')!.hidden = !isVideo;
    if ($('#msFilterStrip')) $('#msFilterStrip')!.hidden = false;

    syncUndoBtn();
    syncDestChips();

    if (imgUrl) {
      URL.revokeObjectURL(imgUrl);
      imgUrl = '';
    }
    if (vidUrl) {
      URL.revokeObjectURL(vidUrl);
      vidUrl = '';
    }

    if (isVideo) {
      if (cv) cv.hidden = true;
      if (vid) {
        vid.hidden = false;
        vidUrl = URL.createObjectURL(file);
        vid.src = vidUrl;
        vid.muted = false;
        vid.style.filter = 'none';
        vid.onloadedmetadata = () => {
          vidDuration = Math.max(1, vid.duration || 1);
          trimStart = 0;
          trimEnd = vidDuration;
          const sIn = $('#msTrimStart') as HTMLInputElement | null;
          const eIn = $('#msTrimEnd') as HTMLInputElement | null;
          if (sIn && eIn) {
            sIn.min = '0';
            sIn.max = vidDuration.toFixed(1);
            sIn.step = '0.1';
            sIn.value = '0';
            eIn.min = '0.5';
            eIn.max = vidDuration.toFixed(1);
            eIn.step = '0.1';
            eIn.value = vidDuration.toFixed(1);
          }
          updateTrimUI();
          vid.play().catch(() => {});
        };
        vid.ontimeupdate = () => {
          if (trimEnd > trimStart && vid.currentTime >= trimEnd) {
            vid.currentTime = trimStart;
            vid.play().catch(() => {});
          }
        };
      }
    } else {
      if (vid) {
        vid.pause();
        vid.removeAttribute('src');
        vid.hidden = true;
      }
      if (cv) cv.hidden = false;
      imgUrl = URL.createObjectURL(file);
      const im = new Image();
      im.onload = () => {
        baseImg = im;
        renderCanvas();
      };
      im.onerror = () => toast('Unable to preview image');
      im.src = imgUrl;
    }

    if ($('#csheet')) $('#csheet')!.hidden = false;
  }

  function close() {
    hideSubbars();
    if ($('#msTextEditor')) $('#msTextEditor')!.hidden = true;
    if (vid) {
      try {
        vid.pause();
      } catch (_) {}
      vid.removeAttribute('src');
    }
    if ($('#csheet')) $('#csheet')!.hidden = true;
    currentFile = null;
    baseImg = null;
  }

  // Wire toolbar buttons
  $('#csX')?.addEventListener('click', close);
  $('#csRe')?.addEventListener('click', () => {
    close();
    deps.openFileReplace();
  });

  $('#voT')?.addEventListener('click', () => {
    viewOnce = !viewOnce;
    $('#voT')?.classList.toggle('on', viewOnce);
    toast(viewOnce ? 'View-once enabled — locks after 1 view' : 'Standard disappearing media');
  });

  $('#msHdBtn')?.addEventListener('click', () => {
    hdMode = !hdMode;
    $('#msHdBtn')?.classList.toggle('on', hdMode);
    toast(hdMode ? 'HD photo quality enabled' : 'Standard fast upload quality');
  });

  $('#msRotateBtn')?.addEventListener('click', () => {
    rot = (rot + 90) % 360;
    renderCanvas();
  });

  $('#msFlipBtn')?.addEventListener('click', () => {
    flipX = !flipX;
    $('#msFlipBtn')?.classList.toggle('on', flipX);
    renderCanvas();
  });

  $('#msToolCrop')?.addEventListener('click', () => {
    if (!currentFile || isVideo) return;
    const targetMode = sendToStatus && !sendToChat ? 'status' : 'chat';
    deps.onCropRequest(currentFile, croppedFile => {
      open(croppedFile, targetMode);
    });
  });

  $('#msToolFilter')?.addEventListener('click', () => {
    const strip = $('#msFilterStrip');
    if (!strip) return;
    strip.hidden = !strip.hidden;
    $('#msToolFilter')?.classList.toggle('on', !strip.hidden);
  });

  $('#msFilterStrip')?.addEventListener('click', e => {
    const chip = (e.target as HTMLElement).closest('.ms-filter-chip') as HTMLElement | null;
    if (!chip || !chip.dataset.filter) return;
    activeFilter = chip.dataset.filter;
    document.querySelectorAll('#msFilterStrip .ms-filter-chip').forEach(c => {
      c.classList.toggle('on', c === chip);
    });
    if (isVideo && vid) {
      vid.style.filter = STUDIO_FILTERS[activeFilter] || 'none';
    } else {
      renderCanvas();
    }
  });

  $('#msToolDraw')?.addEventListener('click', () => {
    const next = !drawMode;
    hideSubbars();
    drawMode = next;
    $('#msToolDraw')?.classList.toggle('on', drawMode);
    if ($('#msDrawBar')) $('#msDrawBar')!.hidden = !drawMode;
  });

  $('#msDrawColors')?.addEventListener('click', e => {
    const sw = (e.target as HTMLElement).closest('.ms-swatch') as HTMLElement | null;
    if (!sw || !sw.dataset.col) return;
    brushColor = sw.dataset.col;
    document.querySelectorAll('#msDrawColors .ms-swatch').forEach(x => x.classList.toggle('on', x === sw));
  });

  $('#msBrushSizes')?.addEventListener('click', e => {
    const b = (e.target as HTMLElement).closest('.ms-bsize') as HTMLElement | null;
    if (!b || !b.dataset.sz) return;
    brushSize = Number(b.dataset.sz) || 8;
    document.querySelectorAll('#msBrushSizes .ms-bsize').forEach(x => x.classList.toggle('on', x === b));
  });

  $('#msClearDrawBtn')?.addEventListener('click', () => {
    strokes = [];
    undoStack = undoStack.filter(x => x !== 'stroke');
    syncUndoBtn();
    renderCanvas();
  });

  $('#msToolSticker')?.addEventListener('click', () => {
    const bar = $('#msStickerBar');
    if (!bar) return;
    const willOpen = !!bar.hidden;
    hideSubbars();
    bar.hidden = !willOpen;
    $('#msToolSticker')?.classList.toggle('on', willOpen);
  });

  $('#msToolText')?.addEventListener('click', () => openTextEditor());

  $('#msTextColors')?.addEventListener('click', e => {
    const sw = (e.target as HTMLElement).closest('.ms-swatch') as HTMLElement | null;
    if (!sw || !sw.dataset.col) return;
    textColor = sw.dataset.col;
    syncTextEditorPreview();
  });

  $('#msTextBgBtn')?.addEventListener('click', () => {
    textBgStyle = textBgStyle === 'dark' ? 'accent' : textBgStyle === 'accent' ? 'none' : 'dark';
    syncTextEditorPreview();
  });

  $('#msTextCancel')?.addEventListener('click', () => closeTextEditor(false));
  $('#msTextDone')?.addEventListener('click', () => closeTextEditor(true));

  $('#msUndoBtn')?.addEventListener('click', () => {
    const last = undoStack.pop();
    if (last === 'stroke') strokes.pop();
    else if (last === 'overlay') overlays.pop();
    else if (strokes.length) strokes.pop();
    else if (overlays.length) overlays.pop();
    syncUndoBtn();
    renderCanvas();
  });

  // Video controls
  $('#msTrimStart')?.addEventListener('input', e => {
    const v = Number((e.target as HTMLInputElement).value);
    trimStart = Math.min(v, Math.max(0, trimEnd - 0.5));
    (e.target as HTMLInputElement).value = trimStart.toFixed(1);
    if (vid) vid.currentTime = trimStart;
    updateTrimUI();
  });

  $('#msTrimEnd')?.addEventListener('input', e => {
    const v = Number((e.target as HTMLInputElement).value);
    trimEnd = Math.max(v, Math.min(vidDuration, trimStart + 0.5));
    (e.target as HTMLInputElement).value = trimEnd.toFixed(1);
    if (vid) vid.currentTime = Math.max(trimStart, trimEnd - 0.4);
    updateTrimUI();
  });

  $('#msMuteVidBtn')?.addEventListener('click', () => {
    vidMuted = !vidMuted;
    if (vid) vid.muted = vidMuted;
    $('#msMuteVidBtn')?.classList.toggle('on', vidMuted);
    updateTrimUI();
    toast(vidMuted ? 'Video audio muted' : 'Video audio active');
  });

  $('#msGifModeBtn')?.addEventListener('click', () => {
    vidAsGif = !vidAsGif;
    if (vidAsGif) {
      vidMuted = true;
      if (vid) vid.muted = true;
      $('#msMuteVidBtn')?.classList.add('on');
    }
    $('#msGifModeBtn')?.classList.toggle('on', vidAsGif);
    updateTrimUI();
    toast(vidAsGif ? 'Video will send as looping GIF' : 'Sending as standard video');
  });

  // Destination selectors (Chat / Status / Both)
  $('#msDestChat')?.addEventListener('click', () => {
    const { peerUid } = deps.getPeerInfo();
    if (!peerUid) return;
    if (sendToChat && !sendToStatus) {
      sendToChat = false;
      sendToStatus = true;
    } else {
      sendToChat = !sendToChat;
    }
    if ($('#voT')) $('#voT')!.hidden = !sendToChat;
    syncDestChips();
  });

  $('#msDestStatus')?.addEventListener('click', () => {
    const { peerUid } = deps.getPeerInfo();
    if (sendToStatus && (!sendToChat || !peerUid)) {
      if (peerUid) {
        sendToStatus = false;
        sendToChat = true;
      } else {
        toast('Select a conversation first to send to chat');
        return;
      }
    } else {
      sendToStatus = !sendToStatus;
    }
    if ($('#voT')) $('#voT')!.hidden = !sendToChat;
    syncDestChips();
  });

  // Final Send / Publish
  $('#csSend')?.addEventListener('click', async () => {
    if (!currentFile || busy) return;
    if (!sendToChat && !sendToStatus) {
      toast('Choose a destination (Chat or My Status)');
      return;
    }
    busy = true;
    const sendBtn = $('#csSend') as HTMLButtonElement | null;
    if (sendBtn) sendBtn.disabled = true;
    const caption = (($('#csCap') as HTMLInputElement | null)?.value || '').trim().slice(0, 300);

    try {
      const exported = await exportFinalFile();
      const opts: StudioSendOptions = {
        file: exported.file,
        kind: exported.kind,
        caption,
        viewOnce: sendToChat ? viewOnce : false,
        sendToChat,
        sendToStatus,
        trimStart,
        trimEnd,
        vidDuration,
        vidMuted: vidMuted || vidAsGif,
      };
      close();
      await deps.onSend(opts);
    } catch (err: any) {
      toast('Media preparation failed: ' + (err?.message || ''));
      if (sendBtn) sendBtn.disabled = false;
    } finally {
      busy = false;
    }
  });

  return {
    open,
    close,
    isTextEditorOpen: () => {
      const m = $('#msTextEditor');
      return !!m && !m.hidden;
    },
    closeTextEditor: () => closeTextEditor(false),
  };
}
