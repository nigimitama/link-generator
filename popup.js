
/*
TODO:
- storage.syncに設定したformatsを保存できる
- rendered HTMLもformatsに入れる
*/ 

// get current tab when this extension is clicked
window.onload = async function onLoad() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  init(tab.url, tab.title);
}


function init(url, title) {
  renderPopup(url, title);
  let updateButton = document.getElementById("updateButton");
  updateButton.addEventListener("click", function(){ updatePopup() });
}


// popup handler---------------------------------------------------
function updatePopup() {
  let currentUrl = document.getElementById("currentUrl");
  let currentTitle = document.getElementById("currentTitle");
  resetPopup();
  renderPopup(currentUrl.value, currentTitle.value);
}

function renderPopup(url, title) {
  showLinks(url, title);
  showCurrent(url, title);
}

function resetPopup() {
  var linksDiv = document.getElementById("linksDiv");
  var child;
  while (linksDiv.children.length > 0) {
    child = linksDiv.children[0];
    linksDiv.removeChild(child);
  }
}
// ---------------------------------------------------------------


function showCurrent(url, title) {
  let currentUrl = document.getElementById("currentUrl");
  let currentTitle = document.getElementById("currentTitle");
  currentUrl.value = url;
  currentTitle.value = title;
}


// show links on popup.html
function showLinks(url, title) {
  let linksDiv = document.getElementById("linksDiv");
  generateLinkHtml(linksDiv, url, title);
  generateLinkTexts(linksDiv, url, title);
}


// show link as rendered HTML
function generateLinkHtml(linksDiv, url, title) {
  let linkDiv = createContentDiv();
  let containerDiv = linkDiv.querySelector('.container');
  linkDiv.removeChild(containerDiv);
  // add header
  const name = 'HTML (rendered)';
  header = linkDiv.querySelector('.lg-header');
  header.innerText = name;
  // add a-tag
  let a = document.createElement('a');
  a.href = url;
  a.innerText = title;
  linkDiv.appendChild(a);
  linksDiv.appendChild(linkDiv);
}


// show link as text
function generateLinkTexts(linksDiv, url, title) {
  chrome.storage.sync.get(['formats'], (storage) => {
    var formats = storage.formats;
    for (let format of formats) {
      let name = format['name'];
      let link = formatLinkText(format['format'], url, title);
      // create new div
      let linkDiv = createContentDiv();
      // add header
      let header = linkDiv.querySelector('.lg-header');
      header.innerText = name;
      // add link text
      let linkText = linkDiv.querySelector('.lg-link-text');
      linkText.value = link;
      linkText.id = name;
      // add copy button
      let button = linkDiv.querySelector('.lg-copy-button');
      button.addEventListener("click", function(){ copyToClipboard(name) });
      // NOTE: CSPの関係上onclickは許可されないが、addEventListenerは許可される

      linksDiv.appendChild(linkDiv);
    }
  });
}

function formatLinkText(format, url, title) {
  const link = format.replace('%title%', title).replace('%url%', url);
  return link;
}


function createContentDiv() {
  let contentDiv = document.getElementById('contentTemplate').cloneNode(true);
  contentDiv.removeAttribute("id");
  contentDiv.hidden = false;
  return contentDiv
}


function copyToClipboard(name) {
  let target = document.getElementById(name);
  target.select();
  document.execCommand("copy");
}
