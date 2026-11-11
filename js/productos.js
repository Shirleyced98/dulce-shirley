(function () {
    'use strict';

    function sinTildes(texto) {
        return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ').trim();
    }

    document.addEventListener('DOMContentLoaded', function () {
        var lista = document.getElementById('lista-productos');
        if (!lista) {
            return;
        }

        var tarjetas = lista.querySelectorAll('li[data-categoria]');
        var botones = document.querySelectorAll('[data-filtro]');
        var buscador = document.getElementById('buscador');
        var contador = document.getElementById('contador');
        var vacio = document.getElementById('sin-resultados');
        var categoriaActiva = 'todas';

        function aplicarFiltros() {
            var texto = sinTildes(buscador.value);
            var visibles = 0;

            Array.prototype.forEach.call(tarjetas, function (tarjeta) {
                var categoria = tarjeta.getAttribute('data-categoria');
                var nombre = sinTildes(tarjeta.getAttribute('data-nombre'));
                var coincideCategoria = categoriaActiva === 'todas' || categoria === categoriaActiva;
                var coincideTexto = texto === '' || nombre.indexOf(texto) !== -1;
                var mostrar = coincideCategoria && coincideTexto;

                tarjeta.hidden = !mostrar;
                if (mostrar) {
                    visibles += 1;
                }
            });

            contador.textContent = visibles === 1
                ? '1 producto disponible'
                : visibles + ' productos disponibles';
            vacio.hidden = visibles !== 0;
        }

        Array.prototype.forEach.call(botones, function (boton) {
            boton.addEventListener('click', function () {
                categoriaActiva = boton.getAttribute('data-filtro');
                Array.prototype.forEach.call(botones, function (otro) {
                    otro.setAttribute('aria-pressed', otro === boton ? 'true' : 'false');
                });
                aplicarFiltros();
            });
        });

        buscador.addEventListener('input', aplicarFiltros);
        aplicarFiltros();
    });
}());
