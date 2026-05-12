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

function encontrarMaisProximo(container, itens) {
  return [...itens].reduce((p, c) =>
    Math.abs(c.offsetLeft - container.scrollLeft) < Math.abs(p.offsetLeft - container.scrollLeft) ? c : p
  );
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
    irPara([...itens].indexOf(encontrarMaisProximo(container, itens)));
  });

  document.addEventListener('mousemove', (e) => {
    if (!arrastando) return;
    e.preventDefault();
    container.scrollLeft = scrollInicial - (e.pageX - container.offsetLeft - origemX) * 2;
  });

  setaDir.addEventListener('click', () => irPara(indexAtual + 1));
  setaEsq.addEventListener('click', () => irPara(indexAtual - 1));

  container.addEventListener('scroll', () => {
    indexAtual = [...itens].indexOf(encontrarMaisProximo(container, itens));
    setSeta(setaEsq, indexAtual > 0);
    setSeta(setaDir, indexAtual < itens.length - 1);
  });

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
  const src = iframe.src;
  iframe.src = '';
  requestAnimationFrame(() => { iframe.src = src; });
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
  const youtubeComecou =
    (data.event === 'infoDelivery' && data.info?.playerState === 1) ||
    (data.event === 'onStateChange' && data.info === 1);

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

// ─── LAZY LOAD ───

// Artista capas: carrega background-image só quando entra na tela
const observadorBg = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (!entrada.isIntersecting) return;
    const el = entrada.target;
    const url = el.dataset.bg;
    if (!url) return;

    const img = new Image();
    img.onload = () => {
      el.style.backgroundImage = `url('${url}')`;
      el.classList.add('loaded');

      if (typeof smartcrop !== 'undefined') {
        smartcrop.crop(img, { width: 100, height: 160 })
          .then((resultado) => {
            const c = resultado.topCrop;
            const x = ((c.x + c.width / 2) / img.naturalWidth) * 100;
            const y = ((c.y + c.height / 2) / img.naturalHeight) * 100;
            el.style.backgroundPosition = `${x.toFixed(1)}% ${y.toFixed(1)}%`;
          })
          .catch(() => {});
      }
    };
    img.src = url;

    observadorBg.unobserve(el);
  });
}, { rootMargin: '200px' });

document.querySelectorAll('.skeleton-bg[data-bg]').forEach((el) => {
  observadorBg.observe(el);
});

// Imagens normais com .img-fade: adiciona classe "loaded" ao carregar
document.querySelectorAll('.img-fade').forEach((img) => {
  if (img.complete && img.naturalWidth > 0) {
    img.classList.add('loaded');
  } else {
    img.addEventListener('load', () => img.classList.add('loaded'));
  }
});
