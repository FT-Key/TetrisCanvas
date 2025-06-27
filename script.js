// Obtener datos del HTML
const puntos = document.querySelector('#puntos');
const titulo = document.querySelector('#titulo');

titulo.addEventListener('click', iniciarJuego, { once: true });

// Obtener el canvas y su contexto 2D
const canvas = document.getElementById('tablero');
const ctx = canvas.getContext('2d');

// Definir el tamaño de cada cuadro y el número de cuadros en ancho y alto
const numCuadrosAncho = 20;
const numCuadrosAlto = 30;
const tamañoCuadro = 20;  // Tamaño de cada cuadro en píxeles

// Asignar el ancho y alto del canvas basado en el número de cuadros y el tamaño de cada cuadro
canvas.width = numCuadrosAncho * tamañoCuadro;
canvas.height = numCuadrosAlto * tamañoCuadro;

// definir velocidad de animación
const velocidad = 250;

// Variable para controlar si el juego ha terminado
let juegoTerminado = false;

// Audio de tetris
const audio = new window.Audio('./Tetris.mp3');

// Inicializar el estado del tablero
let tablero = Array.from({ length: numCuadrosAlto }, () => Array(numCuadrosAncho).fill(0));

// Definir las piezas sin versiones invertidas
const PIEZAS = [
    [[1, 1], [1, 1]],       // Cuadrado
    [[1, 1, 0], [0, 1, 1]], // Z
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [0, 0, 1]], // L
    [[1, 0, 0], [1, 1, 1]], // L (inversa)
    [[1, 1, 0], [0, 1, 1]], // Z (inversa)
    [[1, 0], [1, 0], [1, 1]], // L
    [[1], [1], [1], [1]]   // Línea
];

// Array de colores para las piezas
const COLORES = ['#1E90FF', '#FF4500', '#FFA500', '#32CD32', '#800080', '#FF69B4', '#00CED1', '#A9A9A9'];


// Seleccionar una pieza aleatoria
let piezaActual = obtenerPiezaAleatoria();
let colorPieza = obtenerColorAleatorio();

// Posición inicial de la pieza
let xPos = (numCuadrosAncho / 2) - 2;
let yPos = 0;

// Contador de puntos

let puntaje = 0;

// Ajustar la función iniciarJuego para que reinicie correctamente
function iniciarJuego() {
    // Reiniciar el estado del tablero
    tablero = Array.from({ length: numCuadrosAlto }, () => Array(numCuadrosAncho).fill(0));

    // Reiniciar la posición de la pieza
    xPos = (numCuadrosAncho / 2) - 2;
    yPos = 0;

    // Seleccionar una nueva pieza aleatoria
    piezaActual = obtenerPiezaAleatoria();
    colorPieza = obtenerColorAleatorio();

    // Reiniciar el puntaje
    puntaje = 0;
    puntos.textContent = `Puntos: ${puntaje}`;

    // Marcar que el juego no ha terminado
    juegoTerminado = false;

    // Iniciar audio
    audio.currentTime = 0;
    audio.loop = true;
    audio.volume = 0.2;
    audio.play();

    // Iniciar la animación
    detenerAnimacion();
    animar();

    // Actualizar el canvas
    actualizarCanvas();

    titulo.textContent = `Tetris`;
    titulo.classList.remove('pointer');

    document.addEventListener('keydown', manejarTeclaPresionada);
}

// Dibujar el tablero
function dibujarTablero() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let fila = 0; fila < numCuadrosAlto; fila++) {
        for (let columna = 0; columna < numCuadrosAncho; columna++) {
            // Calcular la posición x e y de cada cuadro
            const x = columna * tamañoCuadro;
            const y = fila * tamañoCuadro;

            // Dibujar el cuadro (rectángulo)
            ctx.strokeRect(x, y, tamañoCuadro, tamañoCuadro);

            // Rellenar el cuadro si está ocupado
            if (tablero[fila][columna] === 1) {
                ctx.fillStyle = 'yellow';
                ctx.fillRect(x, y, tamañoCuadro, tamañoCuadro);
            }
        }
    }
}

// Dibujar una pieza en una posición específica
function dibujarPieza(pieza, xInicial, yInicial, color) {
    ctx.fillStyle = color;

    for (let fila = 0; fila < pieza.length; fila++) {
        for (let columna = 0; columna < pieza[fila].length; columna++) {
            if (pieza[fila][columna] === 1) {
                const x = (xInicial + columna) * tamañoCuadro;
                const y = (yInicial + fila) * tamañoCuadro;
                ctx.fillRect(x, y, tamañoCuadro, tamañoCuadro);
                // Dibujar el cuadro (rectángulo)
                ctx.strokeRect(x, y, tamañoCuadro, tamañoCuadro);
            }
        }
    }
}

// Función para actualizar el tablero y la pieza
function actualizarCanvas() {
    dibujarTablero();
    dibujarPieza(piezaActual, xPos, yPos, colorPieza);
}

// Mover la pieza según la tecla presionada
function manejarTeclaPresionada(event) {
    const key = event.key;

    switch (key) {
        case 'ArrowLeft':
            if (xPos > 0 && !colisiona(xPos - 1, yPos)) {
                xPos--;
            }
            break;
        case 'ArrowRight':
            if (xPos < numCuadrosAncho - piezaActual[0].length && !colisiona(xPos + 1, yPos)) {
                xPos++;
            }
            break;
        case 'ArrowDown':
            moverPiezaHaciaAbajo();
            break;
        case 'ArrowUp':
            girarPieza();
            break;
    }

    actualizarCanvas();
}

// Comprobar colisión con el tablero
function colisiona(x, y, pieza = piezaActual) {
    for (let fila = 0; fila < pieza.length; fila++) {
        for (let columna = 0; columna < pieza[fila].length; columna++) {
            if (pieza[fila][columna] === 1) {
                if (y + fila >= numCuadrosAlto || tablero[y + fila][x + columna] === 1) {
                    return true;
                }
            }
        }
    }
    return false;
}

function saleDelTablero(x, pieza = piezaActual) {
    for (let fila = 0; fila < pieza.length; fila++) {
        for (let columna = 0; columna < pieza[fila].length; columna++) {
            if (pieza[fila][columna] === 1) {
                if (x + columna >= numCuadrosAncho) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Fijar la pieza en el tablero
function fijarPieza() {
    for (let fila = 0; fila < piezaActual.length; fila++) {
        for (let columna = 0; columna < piezaActual[fila].length; columna++) {
            if (piezaActual[fila][columna] === 1) {
                tablero[yPos + fila][xPos + columna] = 1;
            }
        }
    }

    eliminarLineasCompletas();
}

// Eliminar líneas completas y desplazar las demás hacia abajo
function eliminarLineasCompletas() {
    for (let fila = numCuadrosAlto - 1; fila >= 0; fila--) {
        if (tablero[fila].every(cuadro => cuadro === 1)) {
            tablero.splice(fila, 1);
            tablero.unshift(Array(numCuadrosAncho).fill(0));
            fila++; // Revisa la misma fila nuevamente ya que las líneas se han desplazado hacia abajo
            puntaje += 10;
            puntos.textContent = `Puntos: ${puntaje}`;
        }
    }
}

// Función para crear una nueva pieza en la posición inicial
function crearNuevaPieza() {
    xPos = (numCuadrosAncho / 2) - 2;
    yPos = 0;
    piezaActual = obtenerPiezaAleatoria();
    colorPieza = obtenerColorAleatorio();
}


// Función para obtener una pieza aleatoria
function obtenerPiezaAleatoria() {
    return PIEZAS[Math.floor(Math.random() * PIEZAS.length)];
}

// Función para obtener un color aleatorio
function obtenerColorAleatorio() {
    return COLORES[Math.floor(Math.random() * COLORES.length)];
}

// Función para mover la pieza hacia abajo
function moverPiezaHaciaAbajo() {
    if (yPos < numCuadrosAlto - piezaActual.length && !colisiona(xPos, yPos + 1)) {
        yPos++;
    } else {
        // Colisión con el borde inferior o con otra pieza
        fijarPieza();
        crearNuevaPieza();

        // Verificar si no hay espacio para la nueva pieza
        if (colisiona(xPos, yPos)) {
            // Detener la animación y desactivar el listener de teclado
            detenerAnimacion();
            document.removeEventListener('keydown', manejarTeclaPresionada);
            dibujarTablero(); // Dibujar el tablero una última vez
            alert('¡Fin de juego!');
            juegoTerminado = true; // Marcar el juego como terminado
            audio.pause();
            audio.currentTime = 0;
            titulo.textContent = `Restart`;
            titulo.classList.add('pointer');
            titulo.addEventListener('click', iniciarJuego, { once: true });
            return; // Detener la ejecución
        }
    }

    // Actualizar el canvas si el juego no ha terminado
    if (!juegoTerminado) {
        actualizarCanvas();
    }
}

// Función para girar la pieza
function girarPieza() {
    const piezaGirada = [];
    const tamañoOriginal = piezaActual.length;
    const tamañoNuevo = piezaActual[0].length;

    for (let columna = 0; columna < tamañoNuevo; columna++) {
        piezaGirada[columna] = [];
        for (let fila = tamañoOriginal - 1; fila >= 0; fila--) {
            piezaGirada[columna].push(piezaActual[fila][columna]);
        }
    }

    // Verificar si la pieza girada cabe en el tablero sin colisionar
    if (!colisiona(xPos, yPos, piezaGirada) && !saleDelTablero(xPos, piezaGirada)) {
        piezaActual = piezaGirada;
    }
}

// Función para animar el descenso de la pieza
let timeoutId;

function animar() {
    moverPiezaHaciaAbajo();

    // Verificar si el juego ha terminado
    if (!juegoTerminado) {
        timeoutId = setTimeout(() => {
            animar();
        }, velocidad);
    }
}

// Función para detener la animación
function detenerAnimacion() {
    clearTimeout(timeoutId); // Cancela la animación actual
    //console.log("Animación detenida");
}

// Controles móviles
document.getElementById('btn-izquierda').addEventListener('click', () => {
    if (xPos > 0 && !colisiona(xPos - 1, yPos)) {
        xPos--;
        actualizarCanvas();
    }
});

document.getElementById('btn-derecha').addEventListener('click', () => {
    if (xPos < numCuadrosAncho - piezaActual[0].length && !colisiona(xPos + 1, yPos)) {
        xPos++;
        actualizarCanvas();
    }
});

document.getElementById('btn-abajo').addEventListener('click', () => {
    moverPiezaHaciaAbajo();
});

document.getElementById('btn-rotar').addEventListener('click', () => {
    girarPieza();
    actualizarCanvas();
});

// Escalado de canvas
