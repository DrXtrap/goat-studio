const grid = document.querySelector('#clipes .videos-grid');
const itens = document.querySelectorAll('.video-item');
const setaDireita = document.querySelector('.seta-direita');
const setaEsquerda = document.querySelector('.seta-esquerda');
let indexAtual = 0;

// Animação suave manual
function scrollSuave(destino) {
  const inicio = grid.scrollLeft;
  const distancia = destino - inicio;
  const duracao = 600;
  let startTime = null;

  function animar(timestamp) {
    if (!startTime) startTime = timestamp;
    const progresso = timestamp - startTime;
    const porcentagem = Math.min(progresso / duracao, 1);
    const ease = 1 - Math.pow(1 - porcentagem, 3);
    grid.scrollLeft = inicio + distancia * ease;
    if (progresso < duracao) requestAnimationFrame(animar);
  }

  requestAnimationFrame(animar);
}

// Arrastar com clique
let isDragging = false;
let startX;
let scrollStart;

grid.addEventListener('mousedown', function(e) {
  isDragging = true;
  startX = e.pageX - grid.offsetLeft;
  scrollStart = grid.scrollLeft;
  grid.style.cursor = 'grabbing';
});

document.addEventListener('mouseup', function() {
  if (!isDragging) return;
  isDragging = false;
  grid.style.cursor = 'grab';

  const itemMaisProximo = [...itens].reduce(function(prev, curr) {
    const distPrev = Math.abs(prev.offsetLeft - grid.scrollLeft);
    const distCurr = Math.abs(curr.offsetLeft - grid.scrollLeft);
    return distCurr < distPrev ? curr : prev;
  });

  indexAtual = [...itens].indexOf(itemMaisProximo);
  scrollSuave(itemMaisProximo.offsetLeft);
  atualizarSetas();
});

document.addEventListener('mousemove', function(e) {
  if (!isDragging) return;
  e.preventDefault();
  const x = e.pageX - grid.offsetLeft;
  const walk = (x - startX) * 2;
  grid.scrollLeft = scrollStart - walk;
});

// Setas
setaDireita.addEventListener('click', function() {
  if (indexAtual < itens.length - 1) indexAtual++;
  scrollSuave(itens[indexAtual].offsetLeft);
  atualizarSetas();
});

setaEsquerda.addEventListener('click', function() {
  if (indexAtual > 0) indexAtual--;
  scrollSuave(itens[indexAtual].offsetLeft);
  atualizarSetas();
});

// Esconde setas
function atualizarSetas() {
  const noInicio = indexAtual === 0;
  const noFim = indexAtual === itens.length - 1;

  setaEsquerda.style.opacity = noInicio ? '0' : '1';
  setaEsquerda.style.pointerEvents = noInicio ? 'none' : 'all';

  setaDireita.style.opacity = noFim ? '0' : '1';
  setaDireita.style.pointerEvents = noFim ? 'none' : 'all';
}

grid.addEventListener('scroll', atualizarSetas);
atualizarSetas();

// Carrossel de artistas
const gridArtistas = document.querySelector('.artistas-carrossel');
const itensArtistas = document.querySelectorAll('.artista-card');
const setaMusicaDireita = document.querySelector('.seta-musica-direita');
const setaMusicaEsquerda = document.querySelector('.seta-musica-esquerda');
let indexArtista = 0;

function scrollSuaveArtistas(destino) {
  const inicio = gridArtistas.scrollLeft;
  const distancia = destino - inicio;
  const duracao = 600;
  let startTime = null;

  function animar(timestamp) {
    if (!startTime) startTime = timestamp;
    const progresso = timestamp - startTime;
    const ease = 1 - Math.pow(1 - Math.min(progresso / duracao, 1), 3);
    gridArtistas.scrollLeft = inicio + distancia * ease;
    if (progresso < duracao) requestAnimationFrame(animar);
  }

  requestAnimationFrame(animar);
}

// Drag artistas
let isDraggingArtistas = false;
let startXArtistas;
let scrollStartArtistas;

gridArtistas.addEventListener('mousedown', function(e) {
  isDraggingArtistas = true;
  startXArtistas = e.pageX - gridArtistas.offsetLeft;
  scrollStartArtistas = gridArtistas.scrollLeft;
  gridArtistas.style.cursor = 'grabbing';
});

document.addEventListener('mouseup', function() {
  if (!isDraggingArtistas) return;
  isDraggingArtistas = false;
  gridArtistas.style.cursor = 'grab';

  const itemMaisProximo = [...itensArtistas].reduce(function(prev, curr) {
    return Math.abs(curr.offsetLeft - gridArtistas.scrollLeft) < Math.abs(prev.offsetLeft - gridArtistas.scrollLeft) ? curr : prev;
  });

  indexArtista = [...itensArtistas].indexOf(itemMaisProximo);
  scrollSuaveArtistas(itemMaisProximo.offsetLeft);
  atualizarSetasArtistas();
});

document.addEventListener('mousemove', function(e) {
  if (!isDraggingArtistas) return;
  e.preventDefault();
  gridArtistas.scrollLeft = scrollStartArtistas - (e.pageX - gridArtistas.offsetLeft - startXArtistas) * 2;
});

setaMusicaDireita.addEventListener('click', function() {
  if (indexArtista < itensArtistas.length - 1) indexArtista++;
  scrollSuaveArtistas(itensArtistas[indexArtista].offsetLeft);
  atualizarSetasArtistas();
});

setaMusicaEsquerda.addEventListener('click', function() {
  if (indexArtista > 0) indexArtista--;
  scrollSuaveArtistas(itensArtistas[indexArtista].offsetLeft);
  atualizarSetasArtistas();
});

function atualizarSetasArtistas() {
  setaMusicaEsquerda.style.opacity = indexArtista === 0 ? '0' : '1';
  setaMusicaEsquerda.style.pointerEvents = indexArtista === 0 ? 'none' : 'all';
  setaMusicaDireita.style.opacity = indexArtista === itensArtistas.length - 1 ? '0' : '1';
  setaMusicaDireita.style.pointerEvents = indexArtista === itensArtistas.length - 1 ? 'none' : 'all';
}

atualizarSetasArtistas();