//****** GAME LOOP ********//

var time = new Date();
var deltaTime = 0;
var juegoIniciado = false; // Variable para verificar si el juego ha iniciado
var esReinicio = false; // Variable para verificar si es un reinicio
const backgroundMusic = document.getElementById("background-music");
var jumpSound = new Audio("jump.mp3");
var pointSound = new Audio("point.mp3");
var dieSound = new Audio("die.mp3");


if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  setTimeout(Init, 1);
} else {
  document.addEventListener("DOMContentLoaded", Init);
}

function Init() {
  time = new Date();
  Start();
  Loop();
  document.querySelector(".reiniciar-img").addEventListener("click", () => {
    if (parado) {
      jumpSound.play()
      ReiniciarJuego();
    }
  });
}

function Loop() {
  deltaTime = (new Date() - time) / 1000;
  time = new Date();

  if (juegoIniciado) {
    // Solo actualiza el juego si ha iniciado
    Update();
  }

  requestAnimationFrame(Loop);
}

//****** GAME LOGICA ********//

var sueloY = 22;
var velY = 0;
var impulso = 900;
var gravedad = 2500;

var dinoPosX = 42;
var dinoPosY = sueloY;

var sueloX = 0;
var velEscenario = 1280 / 3;
var gameVel = 1;
var score = 0;

var parado = false;
var saltando = false;

var tiempoHastaObstaculo = 2;
var tiempoObstaculoMin = 0.7;
var tiempoObstaculoMax = 1.8;
var obstaculoPosY = 16;
var obstaculos = [];

var tiempoHastaNube = 0.5;
var tiempoNubeMin = 0.7;
var tiempoNubeMax = 2.7;
var maxNubeY = 270;
var minNubeY = 100;
var nubes = [];
var velNube = 0.5;

var contenedor;
var dino;
var textoScore;
var suelo;
var gameOver;

function Start() {
  gameOver = document.querySelector(".game-over");
  suelo = document.querySelector(".suelo");
  contenedor = document.querySelector(".contenedor");
  textoScore = document.querySelector(".score");
  dino = document.querySelector(".dino");

  // Escucha para el evento keydown
  document.addEventListener("keydown", HandleKeyDown);
}

function Update() {
  if (parado) return;

  MoverDinosaurio();
  MoverSuelo();
  DecidirCrearObstaculos();
  DecidirCrearNubes();
  MoverObstaculos();
  MoverNubes();
  DetectarColision();

  velY -= gravedad * deltaTime;
}

function HandleKeyDown(ev) {
  if (ev.keyCode === 13) {
    jumpSound.play();
    // Tecla Enter
    if (!juegoIniciado && !parado) {
      // Si el juego no ha iniciado, comenzamos el juego por primera vez
      juegoIniciado = true;
      backgroundMusic.play();
      document.querySelector(".start-screen").style.display = "none"; // Ocultar pantalla de inicio
    } else if (parado) {
      // Si el juego está en estado de "Game Over", reiniciamos el juego
      ReiniciarJuego();
    }
  } else if (ev.keyCode === 32 && juegoIniciado) {
    // Saltar con Espacio
    Saltar();
  }
}

function ReiniciarJuego() {
 
  // Restaurar los valores iniciales de las variables
  dinoPosY = sueloY;
  velY = 0;
  sueloX = 0;
  gameVel = 1;
  score = 0;
  parado = false;
  saltando = false;

  // Vaciar los obstáculos y nubes del contenedor
  obstaculos.forEach((obstaculo) => obstaculo.remove());
  nubes.forEach((nube) => nube.remove());
  obstaculos = [];
  nubes = [];

  // Restablecer clases y estilos de elementos en el contenedor
  dino.classList.remove("dino-estrellado");
  dino.classList.add("dino-corriendo");
  textoScore.innerText = score;
  gameOver.style.display = "none"; // Ocultar mensaje de Game Over
  document.querySelector(".start-screen").style.display = "none"; // Ocultar pantalla de inicio

  //Reiniciar el desplazamiento del suelo
  suelo.style.left = "0px";

  // Restablecer clases y estilos del contenedor (como el fondo)
  contenedor.classList.remove("mediodia", "tarde", "noche");
  // Reiniciar la música
  backgroundMusic.currentTime = 0;
  backgroundMusic.play();

  // Reiniciar el juego
  juegoIniciado = true;
}
function Saltar() {
  if (dinoPosY === sueloY) {
    saltando = true;
    velY = impulso;
    dino.classList.remove("dino-corriendo");
    // Reproduce el sonido de salto
    jumpSound.play();
  }
}

function MoverDinosaurio() {
  dinoPosY += velY * deltaTime;
  if (dinoPosY < sueloY) {
    TocarSuelo();
  }
  dino.style.bottom = dinoPosY + "px";
}

function TocarSuelo() {
  dinoPosY = sueloY;
  velY = 0;
  if (saltando) {
    dino.classList.add("dino-corriendo");
  }
  saltando = false;
}

function MoverSuelo() {
  sueloX += CalcularDesplazamiento();
  suelo.style.left = -(sueloX % contenedor.clientWidth) + "px";
}

function CalcularDesplazamiento() {
  return velEscenario * deltaTime * gameVel;
}

function Estrellarse() {
  dino.classList.remove("dino-corriendo");
  dino.classList.add("dino-estrellado");
  parado = true;
}

function DecidirCrearObstaculos() {
  tiempoHastaObstaculo -= deltaTime;
  if (tiempoHastaObstaculo <= 0) {
    CrearObstaculo();
  }
}

function DecidirCrearNubes() {
  tiempoHastaNube -= deltaTime;
  if (tiempoHastaNube <= 0) {
    CrearNube();
  }
}

function CrearObstaculo() {
  var obstaculo = document.createElement("div");
  contenedor.appendChild(obstaculo);
  obstaculo.classList.add("cactus");
  if (Math.random() > 0.5) obstaculo.classList.add("cactus2");
  obstaculo.posX = contenedor.clientWidth;
  obstaculo.style.left = contenedor.clientWidth + "px";

  obstaculos.push(obstaculo);
  tiempoHastaObstaculo =
    tiempoObstaculoMin +
    (Math.random() * (tiempoObstaculoMax - tiempoObstaculoMin)) / gameVel;
}

function CrearNube() {
  var nube = document.createElement("div");
  contenedor.appendChild(nube);
  nube.classList.add("nube");
  nube.posX = contenedor.clientWidth;
  nube.style.left = contenedor.clientWidth + "px";
  nube.style.bottom = minNubeY + Math.random() * (maxNubeY - minNubeY) + "px";

  nubes.push(nube);
  tiempoHastaNube =
    tiempoNubeMin + (Math.random() * (tiempoNubeMax - tiempoNubeMin)) / gameVel;
}

function MoverObstaculos() {
  for (var i = obstaculos.length - 1; i >= 0; i--) {
    if (obstaculos[i].posX < -obstaculos[i].clientWidth) {
      obstaculos[i].parentNode.removeChild(obstaculos[i]);
      obstaculos.splice(i, 1);
      ActualizarVelocidadYFondo();
    } else {
      obstaculos[i].posX -= CalcularDesplazamiento();
      obstaculos[i].style.left = obstaculos[i].posX + "px";
    }
  }
}

function MoverNubes() {
  for (var i = nubes.length - 1; i >= 0; i--) {
    if (nubes[i].posX < -nubes[i].clientWidth) {
      nubes[i].parentNode.removeChild(nubes[i]);
      nubes.splice(i, 1);
    } else {
      nubes[i].posX -= CalcularDesplazamiento() * velNube;
      nubes[i].style.left = nubes[i].posX + "px";
    }
  }
}

function ActualizarVelocidadYFondo() {
    // Incrementa el puntaje al evadir un obstáculo
    score++;
    textoScore.innerText = score;
    if (score % 10 === 0) {
        pointSound.play();
    }
    // Ajusta la velocidad y el fondo según el puntaje
    if (score >= 50) {
        // Reiniciar a día cada 50 puntos
        contenedor.className = "contenedor dia";
    } else if (score % 50 >= 10 && score % 50 < 20) {
        gameVel = 1.5;
        contenedor.className = "contenedor mediodia";
    } else if (score % 50 >= 20 && score % 50 < 30) {
        gameVel = 2;
        contenedor.className = "contenedor tarde";
    } else if (score % 50 >= 30 && score % 50 < 50) {
        gameVel = 3;
        contenedor.className = "contenedor noche";
    }

    // Ajusta la duración de la animación del suelo
    suelo.style.animationDuration = (3 / gameVel) + "s";
}


function GameOver() {
  Estrellarse();
  gameOver.style.display = "block";
  // Reproduce el sonido de perder
  dieSound.play();
  backgroundMusic.pause(); // Pausar la música
  juegoIniciado = false;
  parado = true; // Indica que el juego ha terminado

  // Deshabilitar el evento keydown temporalmente
  document.removeEventListener("keydown", HandleKeyDown);

  // Establece esReinicio como verdadero para que el mensaje cambie
  esReinicio = true;

  // Espera 2 segundos y muestra el mensaje de inicio
  setTimeout(() => {
    gameOver.style.display = "none";
    const startScreen = document.querySelector(".start-screen");
    const reiniciarImg = document.querySelector(".reiniciar-img");
    const reiniciarText = document.querySelector(".reiniciar-text");

    startScreen.style.display = "block";

    // Mostrar la imagen de reinicio si es un reinicio
    if (esReinicio) {
        reiniciarImg.style.display = "block";
        reiniciarText.style.display = "none";
    } else {
        reiniciarImg.style.display = "none";
        reiniciarText.style.display = "block";
    }

    document.addEventListener("keydown", HandleKeyDown);
}, 1000);
}

function DetectarColision() {
  for (var i = 0; i < obstaculos.length; i++) {
    if (obstaculos[i].posX > dinoPosX + dino.clientWidth) {
      //EVADE
      break; //al estar en orden, no puede chocar con mas
    } else {
      if (IsCollision(dino, obstaculos[i], 15, 17, 17, 15)) {
        GameOver();
      }
    }
  }
}

function IsCollision(
  a,
  b,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft
) {
  var aRect = a.getBoundingClientRect();
  var bRect = b.getBoundingClientRect();

  return !(
    aRect.top + aRect.height - paddingBottom < bRect.top ||
    aRect.top + paddingTop > bRect.top + bRect.height ||
    aRect.left + aRect.width - paddingRight < bRect.left ||
    aRect.left + paddingLeft > bRect.left + bRect.width
  );
}
