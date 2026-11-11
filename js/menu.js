/*
 * Menú adaptable de Dulce Shirley.
 * - Los eventos se registran con addEventListener (sin onclick en el HTML).
 * - El botón actualiza aria-expanded al abrir y cerrar (WAI-ARIA 1.2).
 * - La tecla Esc cierra el menú y devuelve el foco al botón (WCAG 2.1.1).
 * - Si este archivo no carga, el menú se ve completo: mejora progresiva.
 */
(function () {
    'use strict';

    document.documentElement.classList.add('js');

    document.addEventListener('DOMContentLoaded', function () {
        var boton = document.querySelector('.menu-boton');
        var menu = document.getElementById('menu-principal');

        if (!boton || !menu) {
            return;
        }

        boton.hidden = false;

        function abrir() {
            menu.classList.add('menu--abierto');
            boton.setAttribute('aria-expanded', 'true');
            boton.textContent = 'Cerrar menú';
        }

        function cerrar(devolverFoco) {
            menu.classList.remove('menu--abierto');
            boton.setAttribute('aria-expanded', 'false');
            boton.textContent = 'Menú';
            if (devolverFoco) {
                boton.focus();
            }
        }

        boton.addEventListener('click', function () {
            if (boton.getAttribute('aria-expanded') === 'true') {
                cerrar(false);
            } else {
                abrir();
            }
        });

        document.addEventListener('keydown', function (evento) {
            if (evento.key === 'Escape' && boton.getAttribute('aria-expanded') === 'true') {
                cerrar(true);
            }
        });
    });
}());
