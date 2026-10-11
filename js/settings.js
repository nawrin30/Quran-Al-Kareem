import {STORAGE} from './config.js';
const DEFAULT_THEME='dark';
export function getTheme(){const saved=localStorage.getItem(STORAGE.theme);return saved==='light'||saved==='dark'?saved:DEFAULT_THEME}
export function setTheme(theme=getTheme()){
 const next=theme==='light'?'light':'dark';
 document.documentElement.dataset.theme=next;
 document.documentElement.style.colorScheme=next;
 localStorage.setItem(STORAGE.theme,next);
 const icon=document.getElementById('themeIcon');
 if(icon) icon.textContent=next==='dark'?'☀':'☾';
 const button=document.getElementById('themeToggle');
 if(button){button.setAttribute('aria-pressed',String(next==='dark'));button.setAttribute('aria-label',next==='dark'?'লাইট মোড চালু করুন':'ডার্ক মোড চালু করুন');button.title=button.getAttribute('aria-label')}
 return next;
}
export function getTranslationVisible(){return localStorage.getItem(STORAGE.translation)!=='false'}
export function setTranslationVisible(visible){localStorage.setItem(STORAGE.translation,String(visible));const btn=document.getElementById('translationToggle');btn?.classList.toggle('active',visible);btn?.setAttribute('aria-pressed',String(visible));document.querySelectorAll('.translation-block').forEach(el=>el.hidden=!visible)}
export function getFontSize(){const n=Number(localStorage.getItem(STORAGE.fontSize)||32);return Math.max(22,Math.min(48,n))}
export function setFontSize(n){const size=Math.max(22,Math.min(48,n));document.documentElement.style.setProperty('--arabic-size',`${size/16}rem`);localStorage.setItem(STORAGE.fontSize,String(size));return size}
