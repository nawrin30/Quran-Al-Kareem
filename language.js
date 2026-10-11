import {UI} from './config.js';
export function getLanguage(){return localStorage.getItem('qak-language')||'bn'}
export function getTranslationLanguage(){const saved=localStorage.getItem('qak-translation-edition');if(saved==='bn'||saved==='en')return saved;const lang=getLanguage();const edition=lang==='bn'?'bn':'en';localStorage.setItem('qak-translation-edition',edition);return edition}
export function setInterfaceLanguage(lang){localStorage.setItem('qak-language',lang);if(lang==='bn'||lang==='en')localStorage.setItem('qak-translation-edition',lang)}
export function t(key){const lang=getLanguage();return UI[lang]?.[key]??UI.en[key]??key}
export function applyLanguage(lang){document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';document.querySelectorAll('[data-i18n]').forEach(el=>{const key=el.dataset.i18n;if(UI[lang]?.[key])el.textContent=UI[lang][key]});document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{const key=el.dataset.i18nPlaceholder;if(UI[lang]?.[key])el.placeholder=UI[lang][key]});}
export function surahName(surah,lang=getLanguage()){if(lang==='bn')return surah.nameBn||surah.englishName; if(lang==='ar')return surah.name||surah.englishName;return surah.englishName}
