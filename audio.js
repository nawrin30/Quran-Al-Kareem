import { API_BASE } from './config.js';
import { t } from './language.js';

let currentAudio = null;
let currentButton = null;
let generation = 0;
let playlist = [];
let playlistIndex = 0;
let currentSurahNumber = null;
let loading = false;

function setButton(button, playing) {
  if (!button) return;
  button.classList.toggle('is-playing', playing);
  button.dataset.playing = String(playing);
  button.textContent = playing ? 'Ⅱ বিরতি' : (button.dataset.idleText || '▶ শুনুন');
  button.setAttribute('aria-pressed', String(playing));
  button.setAttribute('aria-label', playing ? 'অডিও বিরতি দিন' : 'অডিও চালান');
}
function resetButton() {
  if (currentButton) setButton(currentButton, false);
  currentButton = null;
}
function stopCurrentAudio() {
  generation++;
  if (currentAudio) {
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio.pause();
    try { currentAudio.removeAttribute('src'); currentAudio.load(); } catch {}
  }
  currentAudio = null;
  playlist = [];
  playlistIndex = 0;
  currentSurahNumber = null;
  loading = false;
  resetButton();
}
export function stopAudio() { stopCurrentAudio(); }

async function fetchSurahAudioList(number) {
  const response = await fetch(`${API_BASE}/surah/${number}/ar.alafasy`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Audio list unavailable');
  const data = await response.json();
  const ayahs = data?.data?.ayahs;
  if (!Array.isArray(ayahs) || !ayahs.length || ayahs.some(a => !a.audio)) throw new Error('Audio list unavailable');
  return ayahs.map(a => a.audio);
}
function audioError() {
  window.dispatchEvent(new CustomEvent('quran-audio-error', { detail: t('audioError') }));
}
function playPlaylistItem(token) {
  if (token !== generation || !playlist.length) return;
  if (playlistIndex >= playlist.length) {
    currentAudio = null; playlist = []; currentSurahNumber = null; loading = false; resetButton(); return;
  }
  const audio = new Audio();
  audio.preload = 'auto';
  audio.src = playlist[playlistIndex];
  currentAudio = audio;
  audio.onended = () => {
    if (token !== generation) return;
    playlistIndex++;
    playPlaylistItem(token);
  };
  audio.onerror = () => {
    if (token !== generation) return;
    currentAudio = null; playlist = []; currentSurahNumber = null; loading = false; resetButton(); audioError();
  };
  audio.play().then(() => {
    if (token === generation) { loading = false; setButton(currentButton, true); }
  }).catch(() => {
    if (token !== generation) return;
    currentAudio = null; playlist = []; currentSurahNumber = null; loading = false; resetButton(); audioError();
  });
}

export async function playSurahAudio(number, button) {
  number = Number(number);
  if (!Number.isInteger(number) || number < 1 || number > 114) throw new Error(t('audioError'));
 
  if (currentButton === button && currentSurahNumber === number) {
    if (loading) { stopCurrentAudio(); return; }
    if (currentAudio) {
      if (currentAudio.paused) {
        try { await currentAudio.play(); setButton(button, true); }
        catch { throw new Error(t('audioError')); }
      } else { currentAudio.pause(); setButton(button, false); }
      return;
    }
  }
  stopCurrentAudio();
  const token = generation;
  currentButton = button;
  currentButton.dataset.idleText = currentButton.dataset.idleText || '▶ শুনুন';
  currentSurahNumber = number;
  loading = true;
  currentButton.textContent = 'লোড হচ্ছে…';
  currentButton.setAttribute('aria-label', 'অডিও লোড হচ্ছে');
  try {
    
    const list = await fetchSurahAudioList(number);
    if (token !== generation) return;
    playlist = list;
    playlistIndex = 0;
    loading = false;
    playPlaylistItem(token);
  } catch {
    if (token !== generation) return;
    loading = false; currentSurahNumber = null; resetButton();
    throw new Error(t('audioError'));
  }
}

export async function toggleAudio(url, button) {
  if (!url) throw new Error(t('audioUnavailable'));
  if (currentButton === button && currentAudio) {
    if (currentAudio.paused) {
      try { await currentAudio.play(); setButton(button, true); }
      catch { throw new Error(t('audioError')); }
    } else { currentAudio.pause(); setButton(button, false); }
    return;
  }
  stopCurrentAudio();
  currentButton = button;
  currentButton.dataset.idleText = currentButton.dataset.idleText || '▶';
  const token = generation;
  const audio = new Audio(url);
  currentAudio = audio;
  audio.onended = () => { if (token === generation) { currentAudio = null; resetButton(); } };
  audio.onerror = () => { if (token === generation) { currentAudio = null; resetButton(); audioError(); } };
  try { await audio.play(); setButton(button, true); }
  catch { if (token === generation) { currentAudio = null; resetButton(); } throw new Error(t('audioError')); }
}
