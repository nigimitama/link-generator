// set default setting
var defaultFormats = [
  { name: 'Markdown', format: '[%title%](%url%)' }
];

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ formats: defaultFormats });
});
