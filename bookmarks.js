import {STORAGE} from './config.js';
function read(){try{const x=JSON.parse(localStorage.getItem(STORAGE.bookmarks)||'[]');return Array.isArray(x)?x:[]}catch{return []}}
function write(items){localStorage.setItem(STORAGE.bookmarks,JSON.stringify(items))}
export function getBookmarks(){return read()}
export function isBookmarked(surah,verse){return read().some(x=>x.surah===surah&&x.verse===verse)}
export function toggleBookmark(item){const items=read();const i=items.findIndex(x=>x.surah===item.surah&&x.verse===item.verse);if(i>=0){items.splice(i,1);write(items);return false}items.unshift(item);write(items);return true}
