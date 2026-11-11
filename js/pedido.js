(function () {
    'use strict';

    function formatearPrecio(valor) {
        return '$' + valor.toFixed(2).replace('.', ',');
    }

    document.addEventListener('DOMContentLoaded', function () {
        var formulario = document.getElementById('formulario-pedido');
        if (!formulario) {
            return;
        }

        var resumen = document.getElementById('resumen-errores');
        var confirmacion = document.getElementById('confirmacion');
        var totalTexto = document.getElementById('total');
        var selectPastel = document.getElementById('pastel');
        var cantidad = document.getElementById('cantidad');
        var fecha = document.getElementById('fecha');
        var direccion = document.getElementById('direccion');
        var domicilio = document.getElementById('domicilio');
        var retiro = document.getElementById('retiro');
        var acepto = document.getElementById('acepto');

        formulario.setAttribute('novalidate', '');

        var hoy = new Date();
        var iso = hoy.getFullYear() + '-' +
            ('0' + (hoy.getMonth() + 1)).slice(-2) + '-' +
            ('0' + hoy.getDate()).slice(-2);
        fecha.setAttribute('min', iso);

        var parametros = new URLSearchParams(window.location.search);
        var pedido = parametros.get('pastel');
        if (pedido) {
            var opcion = selectPastel.querySelector('option[value="' + pedido + '"]');
            if (opcion) {
                selectPastel.value = pedido;
            }
        }

        function precioDelPastel() {
            var opcion = selectPastel.options[selectPastel.selectedIndex];
            var precio = opcion ? opcion.getAttribute('data-precio') : '';
            return precio ? Number(precio) : 0;
        }

        function esDomicilio() {
            return domicilio.checked;
        }

        function actualizarTotal() {
            var precio = precioDelPastel();
            var unidades = parseInt(cantidad.value, 10);
            if (!isFinite(unidades) || unidades < 1) {
                unidades = 0;
            }
            var envio = precio > 0 && esDomicilio() ? 3 : 0;
            totalTexto.textContent = formatearPrecio(precio * unidades + envio);
        }

        var reglas = [
            {
                id: 'nombre',
                validar: function (campo) {
                    var valor = campo.value.trim();
                    if (valor === '') {
                        return 'Escriba su nombre completo.';
                    }
                    if (valor.length < 3) {
                        return 'El nombre debe tener al menos 3 letras.';
                    }
                    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'.-]+$/.test(valor)) {
                        return 'El nombre solo puede tener letras y espacios.';
                    }
                    return '';
                }
            },
            {
                id: 'correo',
                validar: function (campo) {
                    if (campo.value.trim() === '') {
                        return 'Escriba su correo electrónico.';
                    }
                    if (campo.validity.typeMismatch) {
                        return 'El correo no tiene un formato válido. Ejemplo: nombre@correo.com';
                    }
                    return '';
                }
            },
            {
                id: 'telefono',
                validar: function (campo) {
                    var valor = campo.value.replace(/\s/g, '');
                    if (valor === '') {
                        return 'Escriba su teléfono.';
                    }
                    if (!/^0\d{9}$/.test(valor)) {
                        return 'El teléfono debe tener 10 números y empezar con 0. Ejemplo: 0960606529.';
                    }
                    return '';
                }
            },
            {
                id: 'pastel',
                validar: function (campo) {
                    return campo.value === '' ? 'Seleccione el pastel que desea.' : '';
                }
            },
            {
                id: 'cantidad',
                validar: function (campo) {
                    var numero = Number(campo.value);
                    if (campo.value === '') {
                        return 'Indique la cantidad de pasteles.';
                    }
                    if (!isFinite(numero) || numero % 1 !== 0 || numero < 1 || numero > 10) {
                        return 'La cantidad debe ser un número entero entre 1 y 10.';
                    }
                    return '';
                }
            },
            {
                id: 'fecha',
                validar: function (campo) {
                    if (campo.value === '') {
                        return 'Elija la fecha de entrega o retiro.';
                    }
                    if (campo.value < iso) {
                        return 'La fecha no puede ser anterior a hoy.';
                    }
                    return '';
                }
            },
            {
                id: 'direccion',
                validar: function (campo) {
                    if (esDomicilio() && campo.value.trim().length < 8) {
                        return 'Escriba la dirección completa, con calle y referencia.';
                    }
                    return '';
                }
            },
            {
                id: 'mensaje',
                validar: function (campo) {
                    if (campo.value.length > 40) {
                        return 'El mensaje no puede pasar de 40 caracteres.';
                    }
                    return '';
                }
            }
        ];

        function mostrarError(campo, mensaje) {
            var caja = document.getElementById('error-' + campo.id);
            if (!caja) {
                return;
            }
            if (mensaje) {
                campo.setAttribute('aria-invalid', 'true');
                caja.textContent = 'Error: ' + mensaje;
            } else {
                campo.removeAttribute('aria-invalid');
                caja.textContent = '';
            }
        }

        function validarCampo(regla) {
            var campo = document.getElementById(regla.id);
            var mensaje = regla.validar(campo);
            mostrarError(campo, mensaje);
            return mensaje ? { campo: campo, mensaje: mensaje } : null;
        }

        function validarEntrega() {
            var caja = document.getElementById('error-entrega');
            if (!document.querySelector('input[name="entrega"]:checked')) {
                caja.textContent = 'Error: elija si retira en el local o pide entrega a domicilio.';
                return { campo: retiro, mensaje: 'Elija la forma de entrega.' };
            }
            caja.textContent = '';
            return null;
        }

        function validarAcepto() {
            var caja = document.getElementById('error-acepto');
            if (!acepto.checked) {
                caja.textContent = 'Error: debe aceptar que lo contactemos para confirmar el pedido.';
                acepto.setAttribute('aria-invalid', 'true');
                return { campo: acepto, mensaje: 'Debe aceptar que lo contactemos.' };
            }
            caja.textContent = '';
            acepto.removeAttribute('aria-invalid');
            return null;
        }

        reglas.forEach(function (regla) {
            var campo = document.getElementById(regla.id);
            campo.addEventListener('blur', function () {
                if (campo.getAttribute('aria-invalid') === 'true') {
                    validarCampo(regla);
                }
            });
        });

        selectPastel.addEventListener('change', function () {
            mostrarError(selectPastel, '');
            actualizarTotal();
        });
        cantidad.addEventListener('input', actualizarTotal);
        retiro.addEventListener('change', actualizarTotal);
        domicilio.addEventListener('change', function () {
            actualizarTotal();
            if (!esDomicilio()) {
                mostrarError(direccion, '');
            }
        });

        function agregarDato(lista, etiqueta, valor) {
            var dt = document.createElement('dt');
            dt.textContent = etiqueta;
            var dd = document.createElement('dd');
            dd.textContent = valor;
            lista.appendChild(dt);
            lista.appendChild(dd);
        }

        function mostrarConfirmacion(datos) {
            confirmacion.textContent = '';

            var titulo = document.createElement('h2');
            titulo.textContent = 'Pedido registrado';
            confirmacion.appendChild(titulo);

            var texto = document.createElement('p');
            texto.textContent = 'Gracias, ' + datos.nombre + '. Revisa los datos antes de que te llamemos.';
            confirmacion.appendChild(texto);

            var lista = document.createElement('dl');
            agregarDato(lista, 'Pastel', datos.pastel);
            agregarDato(lista, 'Cantidad', datos.cantidad);
            agregarDato(lista, 'Fecha', datos.fecha);
            agregarDato(lista, 'Entrega', datos.entrega);
            if (datos.direccion) {
                agregarDato(lista, 'Dirección', datos.direccion);
            }
            if (datos.mensaje) {
                agregarDato(lista, 'Mensaje', datos.mensaje);
            }
            agregarDato(lista, 'Total estimado', datos.total);
            confirmacion.appendChild(lista);

            var aviso = document.createElement('p');
            aviso.className = 'ayuda';
            aviso.textContent = 'Este es un proyecto académico: el pedido no se envía a ningún servidor.';
            confirmacion.appendChild(aviso);

            confirmacion.focus();
        }

        formulario.addEventListener('submit', function (evento) {
            evento.preventDefault();
            resumen.textContent = '';
            confirmacion.textContent = '';

            var errores = reglas.map(validarCampo).filter(Boolean);
            var errorEntrega = validarEntrega();
            if (errorEntrega) {
                errores.push(errorEntrega);
            }
            var errorAcepto = validarAcepto();
            if (errorAcepto) {
                errores.push(errorAcepto);
            }

            if (errores.length > 0) {
                var titulo = document.createElement('h2');
                titulo.textContent = 'El formulario tiene ' + errores.length +
                    (errores.length === 1 ? ' error' : ' errores') + ':';
                var lista = document.createElement('ul');
                errores.forEach(function (error) {
                    var item = document.createElement('li');
                    var enlace = document.createElement('a');
                    enlace.href = '#' + error.campo.id;
                    enlace.textContent = error.mensaje;
                    item.appendChild(enlace);
                    lista.appendChild(item);
                });
                resumen.appendChild(titulo);
                resumen.appendChild(lista);
                resumen.focus();
                return;
            }

            var opcion = selectPastel.options[selectPastel.selectedIndex];
            var partes = fecha.value.split('-');
            var datos = {
                nombre: document.getElementById('nombre').value.trim(),
                pastel: opcion.textContent.split(' (')[0],
                cantidad: cantidad.value,
                fecha: partes[2] + '/' + partes[1] + '/' + partes[0],
                entrega: esDomicilio() ? 'Entrega a domicilio' : 'Retiro en el local',
                direccion: esDomicilio() ? direccion.value.trim() : '',
                mensaje: document.getElementById('mensaje').value.trim(),
                total: totalTexto.textContent
            };

            formulario.reset();
            actualizarTotal();
            mostrarConfirmacion(datos);
        });

        formulario.addEventListener('reset', function () {
            reglas.forEach(function (regla) {
                mostrarError(document.getElementById(regla.id), '');
            });
            document.getElementById('error-entrega').textContent = '';
            document.getElementById('error-acepto').textContent = '';
            acepto.removeAttribute('aria-invalid');
            resumen.textContent = '';
            confirmacion.textContent = '';
            setTimeout(actualizarTotal, 0);
        });

        actualizarTotal();
    });
}());
