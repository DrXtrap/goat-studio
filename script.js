const DURACAO_SCROLL = 600;

function animarScroll(container, destino) {
  const inicio = container.scrollLeft;
  const distancia = destino - inicio;
  let startTime = null;

  function passo(timestamp) {
    if (!startTime) startTime = timestamp;
    const progresso = Math.min((timestamp - startTime) / DURACAO_SCROLL, 1);
    container.scrollLeft = inicio + distancia * (1 - Math.pow(1 - progresso, 3));
    if (progresso < 1) requestAnimationFrame(passo);
  }

  requestAnimationFrame(passo);
}

function criarCarrossel({ container, itens, setaEsq, setaDir }) {
  let indexAtual = 0;

  function setSeta(seta, visivel) {
    seta.style.opacity = visivel ? '1' : '0';
    seta.style.pointerEvents = visivel ? 'all' : 'none';
  }

  function irPara(index) {
    indexAtual = Math.max(0, Math.min(index, itens.length - 1));
    animarScroll(container, itens[indexAtual].offsetLeft);
    setSeta(setaEsq, indexAtual > 0);
    setSeta(setaDir, indexAtual < itens.length - 1);
  }

  let arrastando = false, origemX, scrollInicial;

  container.addEventListener('mousedown', (e) => {
    arrastando = true;
    origemX = e.pageX - container.offsetLeft;
    scrollInicial = container.scrollLeft;
    container.style.cursor = 'grabbing';
  });

  document.addEventListener('mouseup', () => {
    if (!arrastando) return;
    arrastando = false;
    container.style.cursor = 'grab';
    const maisProximo = [...itens].reduce((p, c) =>
      Math.abs(c.offsetLeft - container.scrollLeft) < Math.abs(p.offsetLeft - container.scrollLeft) ? c : p
    );
    irPara([...itens].indexOf(maisProximo));
  });

  document.addEventListener('mousemove', (e) => {
    if (!arrastando) return;
    e.preventDefault();
    container.scrollLeft = scrollInicial - (e.pageX - container.offsetLeft - origemX) * 2;
  });

  setaDir.addEventListener('click', () => irPara(indexAtual + 1));
  setaEsq.addEventListener('click', () => irPara(indexAtual - 1));

  irPara(0);
}

criarCarrossel({
  container: document.querySelector('#clipes .videos-grid'),
  itens: document.querySelectorAll('.video-item'),
  setaEsq: document.querySelector('.seta-esquerda'),
  setaDir: document.querySelector('.seta-direita'),
});

criarCarrossel({
  container: document.querySelector('.artistas-carrossel'),
  itens: document.querySelectorAll('.artista-card'),
  setaEsq: document.querySelector('.seta-musica-esquerda'),
  setaDir: document.querySelector('.seta-musica-direita'),
});

// Controle de mídia: só uma fonte toca por vez

function iframesYouTube() {
  return [...document.querySelectorAll('iframe[src*="youtube"]')];
}

function iframesSpotify() {
  return [...document.querySelectorAll('iframe[src*="spotify"]')];
}

function enviarPauseYouTube(iframe) {
  iframe.contentWindow.postMessage(
    JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }), '*'
  );
}

function recarregarIframe(iframe) {
  iframe.src = iframe.src;
}

function pausarOutrosYouTube(janelaTocando) {
  iframesYouTube().filter(i => i.contentWindow !== janelaTocando).forEach(enviarPauseYouTube);
}

function pausarTodosYouTube() {
  iframesYouTube().forEach(enviarPauseYouTube);
}

function pararOutrosSpotify(janelaTocando) {
  iframesSpotify().filter(i => i.contentWindow !== janelaTocando).forEach(recarregarIframe);
}

function pararTodosSpotify() {
  iframesSpotify().forEach(recarregarIframe);
}

window.addEventListener('message', (e) => {
  let data;
  try { data = JSON.parse(e.data); } catch { return; }

  const spotifyComecou = data.type === 'playback_update' && data.payload && !data.payload.isPaused;
  const youtubeComecou = data.event === 'infoDelivery' && data.info?.playerState === 1;

  if (spotifyComecou) {
    pararOutrosSpotify(e.source);
    pausarTodosYouTube();
  }

  if (youtubeComecou) {
    pausarOutrosYouTube(e.source);
    pararTodosSpotify();
  }
});

// Menu hambúrguer

const menuToggle = document.getElementById('menu-toggle');
const menu = document.getElementById('menu');

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  menu.classList.toggle('active');
});

document.querySelectorAll('nav a').forEach((link) => {
  link.addEventListener('click', () => {
    menu.classList.remove('active');
    menuToggle.classList.remove('active');
  });
});
