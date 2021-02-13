// set default setting
var defaultFormats = [
  { name: 'Markdown', format: '[%title%](%url%)' },
  { name: 'Plain Text', format: '%title%\n%url%' }
];

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ formats: defaultFormats });
});
