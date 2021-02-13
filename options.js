function showVersion() {
  // TODO: manifest.jsonからversionを取得する
  const version = 0.1;
  let versionInfo = document.getElementById("versionInfo");
  versionInfo.innerText = `version ${version}`
}

function main() {
  let settingsDiv = document.getElementById("settingsDiv");
  showVersion();
}

main();