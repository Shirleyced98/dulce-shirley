/*
 * Carrusel de imágenes de la portada.
 * - Las diapositivas pasan solas cada 5 segundos.
 * - El botón Pausar / Reproducir detiene o reanuda el avance automático
 *   (WCAG 2.2.2: el contenido que se mueve solo se puede pausar).
 * - Los botones Anterior, Siguiente y los puntos cambian de diapositiva y
 *   reinician el conteo de los 5 segundos.
 * - La diapositiva activa se marca con aria-hidden="false"; las demás, con "true".
 * - El punto activo usa aria-current="true".
 * - El contador es una región viva (aria-live) que anuncia "2 de 5".
 * - Las flechas del teclado (← y →) también cambian de diapositiva.
 * - Si el sistema pide menos movimiento, no arranca solo: se queda en la primera
 *   imagen hasta que la persona presione Reproducir.
 * - Si este archivo no carga, se ve la primera imagen y los controles no aparecen:
 *   el contenido sigue siendo legible (mejora progresiva).
 */
(function () {
    'use strict';

    var ESPERA = 5000; // milisegundos entre diapositiva y diapositiva

    function iniciar(carrusel) {
        var pista = carrusel.querySelector('.carrusel__pista');
        var diapositivas = carrusel.querySelectorAll('.carrusel__diapositiva');
        var puntos = carrusel.querySelectorAll('.carrusel__punto');
        var contador = carrusel.querySelector('.carrusel__contador');
        var anterior = carrusel.querySelector('[data-carrusel="anterior"]');
        var siguiente = carrusel.querySelector('[data-carrusel="siguiente"]');
        var pausa = carrusel.querySelector('[data-carrusel="pausa"]');
        var total = diapositivas.length;
        var actual = 0;
        var temporizador = null;
        var menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');
        var enMarcha = !menosMovimiento.matches;

        if (!pista || total === 0 || !anterior || !siguiente) {
            return;
        }

        function mostrar(indice) {
            if (indice < 0) {
                indice = total - 1;
            }
            if (indice >= total) {
                indice = 0;
            }
            actual = indice;

            pista.style.transform = 'translateX(' + (-100 * indice) + '%)';

            Array.prototype.forEach.call(diapositivas, function (diapositiva, i) {
                diapositiva.setAttribute('aria-hidden', i === indice ? 'false' : 'true');
            });

            Array.prototype.forEach.call(puntos, function (punto, i) {
                if (i === indice) {
                    punto.setAttribute('aria-current', 'true');
                } else {
                    punto.removeAttribute('aria-current');
                }
            });

            if (contador) {
                contador.textContent = (indice + 1) + ' de ' + total;
            }
        }

        function detener() {
            if (temporizador !== null) {
                window.clearInterval(temporizador);
                temporizador = null;
            }
        }

        function arrancar() {
            detener();
            if (enMarcha && !document.hidden) {
                temporizador = window.setInterval(function () {
                    mostrar(actual + 1);
                }, ESPERA);
            }
        }

        function actualizarBoton() {
            if (pausa) {
                pausa.textContent = enMarcha ? 'Pausar' : 'Reproducir';
            }
        }

        anterior.addEventListener('click', function () {
            mostrar(actual - 1);
            arrancar();
        });

        siguiente.addEventListener('click', function () {
            mostrar(actual + 1);
            arrancar();
        });

        Array.prototype.forEach.call(puntos, function (punto, i) {
            punto.addEventListener('click', function () {
                mostrar(i);
                arrancar();
            });
        });

        carrusel.addEventListener('keydown', function (evento) {
            if (evento.key === 'ArrowLeft') {
                evento.preventDefault();
                mostrar(actual - 1);
                arrancar();
            } else if (evento.key === 'ArrowRight') {
                evento.preventDefault();
                mostrar(actual + 1);
                arrancar();
            }
        });

        if (pausa) {
            pausa.addEventListener('click', function () {
                enMarcha = !enMarcha;
                actualizarBoton();
                arrancar();
            });
        }

        // Si la pestaña queda en segundo plano, se detiene; al volver, sigue.
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                detener();
            } else {
                arrancar();
            }
        });

        if (menosMovimiento.addEventListener) {
            menosMovimiento.addEventListener('change', function (evento) {
                enMarcha = !evento.matches;
                actualizarBoton();
                arrancar();
            });
        }

        mostrar(0);
        actualizarBoton();
        arrancar();
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.forEach.call(document.querySelectorAll('.carrusel'), iniciar);
    });
}());
