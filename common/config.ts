export const ROOT_PATH = '/' + getBasePath().replace(window.location.origin, '').slice(1, -1) + '/';

function getBasePath() {
  console.log(document.getElementsByTagName('base')[0].href);
  return document.getElementsByTagName('base')[0].href;
}
