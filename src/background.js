// set default setting
const defaultFormats = [
  { name: 'HTML (rendered)', format: null },
  { name: 'Markdown', format: '[%title%](%url%)' },
  { name: 'Plain Text', format: '%title%\n%url%' }
];

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ formats: defaultFormats });
});
