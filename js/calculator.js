/**
 * Calculadora de Plusvalía Municipal
 * Post-reforma RDL 26/2021
 *
 * El contribuyente puede elegir el método que le resulte más favorable:
 * - Método objetivo: Valor catastral suelo × Coeficiente
 * - Método real: Incremento real de valor (proporción suelo)
 */

(function () {
  'use strict';

  // ============================================
  // Lógica de cálculo
  // ============================================

  /**
   * Calcula los años completos entre dos fechas
   */
  function calcularAnos(fechaAdquisicion, fechaTransmision) {
    const diff = fechaTransmision.getTime() - fechaAdquisicion.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  /**
   * Método Objetivo
   * Base imponible = Valor catastral del suelo × Coeficiente (según años)
   * Cuota = Base imponible × Tipo impositivo
   */
  function calcularMetodoObjetivo(valorCatastralSuelo, anos, coeficientes, tipoImpositivo) {
    if (anos < 1) {
      return { aplicable: false, motivo: 'Debe haber transcurrido al menos 1 año.' };
    }

    var anosAplicables = Math.min(Math.max(anos, 1), 20);
    var coeficiente = coeficientes[anosAplicables];

    if (!coeficiente) {
      return { aplicable: false, motivo: 'No se encontró coeficiente para el periodo.' };
    }

    var baseImponible = valorCatastralSuelo * coeficiente;
    var cuota = baseImponible * (tipoImpositivo / 100);

    return {
      aplicable: true,
      metodo: 'objetivo',
      valorCatastralSuelo: valorCatastralSuelo,
      anos: anosAplicables,
      coeficiente: coeficiente,
      baseImponible: redondear(baseImponible),
      tipoImpositivo: tipoImpositivo,
      cuota: redondear(cuota)
    };
  }

  /**
   * Método Real
   * Base imponible = (Valor transmisión - Valor adquisición) × (Valor catastral suelo / Valor catastral total)
   * Si no se conoce el catastral total, se usa la proporción valor suelo como 100%
   * Cuota = Base imponible × Tipo impositivo
   */
  function calcularMetodoReal(valorAdquisicion, valorTransmision, valorCatastralSuelo, valorCatastralTotal, tipoImpositivo) {
    var incrementoTotal = valorTransmision - valorAdquisicion;

    if (incrementoTotal <= 0) {
      return {
        aplicable: true,
        hayPlusvalia: false,
        metodo: 'real',
        motivo: 'No hay incremento de valor. No se genera plusvalía.',
        cuota: 0
      };
    }

    // Proporción del suelo sobre el valor catastral total
    var proporcionSuelo = 1;
    if (valorCatastralTotal && valorCatastralTotal > 0 && valorCatastralSuelo > 0) {
      proporcionSuelo = valorCatastralSuelo / valorCatastralTotal;
    }

    var baseImponible = incrementoTotal * proporcionSuelo;
    var cuota = baseImponible * (tipoImpositivo / 100);

    return {
      aplicable: true,
      hayPlusvalia: true,
      metodo: 'real',
      incrementoTotal: redondear(incrementoTotal),
      proporcionSuelo: redondear(proporcionSuelo * 100),
      baseImponible: redondear(baseImponible),
      tipoImpositivo: tipoImpositivo,
      cuota: redondear(cuota)
    };
  }

  /**
   * Aplica bonificación sobre la cuota
   */
  function aplicarBonificacion(cuota, porcentajeBonificacion) {
    if (!porcentajeBonificacion || porcentajeBonificacion <= 0) return cuota;
    var descuento = cuota * (porcentajeBonificacion / 100);
    return redondear(cuota - descuento);
  }

  function redondear(valor) {
    return Math.round(valor * 100) / 100;
  }

  function formatearMoneda(valor) {
    return valor.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' \u20AC';
  }

  // ============================================
  // Interacción con el DOM
  // ============================================

  var form = document.getElementById('calculator-form');
  var resultCard = document.getElementById('result-card');

  if (!form) return;

  // Obtener datos de la ciudad desde el atributo data-city
  var citySlug = form.getAttribute('data-city');
  var cityData = CITIES_DATA[citySlug];

  if (!cityData) {
    console.error('No se encontraron datos para la ciudad:', citySlug);
    return;
  }

  // Mostrar/ocultar campos según tipo de transmisión
  var tipoTransmision = document.getElementById('tipo-transmision');
  var bonificacionesGroup = document.getElementById('bonificaciones-group');

  if (tipoTransmision) {
    tipoTransmision.addEventListener('change', function () {
      if (bonificacionesGroup) {
        bonificacionesGroup.style.display = this.value === 'herencia' ? 'block' : 'none';
      }
    });
  }

  // Manejar envío del formulario
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    calcular();
  });

  function calcular() {
    // Recoger valores
    var tipo = document.getElementById('tipo-transmision').value;
    var valorAdquisicion = parseFloat(document.getElementById('valor-adquisicion').value);
    var valorTransmision = parseFloat(document.getElementById('valor-transmision').value);
    var fechaAdquisicion = new Date(document.getElementById('fecha-adquisicion').value);
    var fechaTransmision = new Date(document.getElementById('fecha-transmision').value);
    var valorCatastralSuelo = parseFloat(document.getElementById('valor-catastral-suelo').value) || 0;
    var valorCatastralTotal = parseFloat(document.getElementById('valor-catastral-total').value) || 0;

    // Validaciones
    if (!valorAdquisicion || valorAdquisicion <= 0) {
      mostrarError('Introduce el valor de adquisición.');
      return;
    }
    if (!valorTransmision || valorTransmision <= 0) {
      mostrarError('Introduce el valor de transmisión (venta).');
      return;
    }
    if (isNaN(fechaAdquisicion.getTime())) {
      mostrarError('Introduce la fecha de adquisición.');
      return;
    }
    if (isNaN(fechaTransmision.getTime())) {
      mostrarError('Introduce la fecha de transmisión.');
      return;
    }
    if (fechaTransmision <= fechaAdquisicion) {
      mostrarError('La fecha de transmisión debe ser posterior a la de adquisición.');
      return;
    }

    var anos = calcularAnos(fechaAdquisicion, fechaTransmision);

    if (anos < 1) {
      mostrarSinPlusvalia('No se ha completado un año desde la adquisición. No se devenga el impuesto.');
      return;
    }

    if (anos > 20) {
      anos = 20;
    }

    // Calcular ambos métodos
    var resultadoObjetivo = null;
    var resultadoReal = null;

    // Método objetivo (requiere valor catastral del suelo)
    if (valorCatastralSuelo > 0) {
      resultadoObjetivo = calcularMetodoObjetivo(
        valorCatastralSuelo, anos, cityData.coeficientes, cityData.tipoImpositivo
      );
    }

    // Método real
    resultadoReal = calcularMetodoReal(
      valorAdquisicion, valorTransmision, valorCatastralSuelo, valorCatastralTotal, cityData.tipoImpositivo
    );

    // Si no hay incremento real, no hay plusvalía
    if (resultadoReal.aplicable && !resultadoReal.hayPlusvalia) {
      mostrarSinPlusvalia('No existe incremento de valor. Según la legislación vigente, no se genera plusvalía municipal y no hay obligación de pago.');
      return;
    }

    // Determinar bonificación aplicable
    var bonificacionPct = 0;
    if (tipo === 'herencia') {
      var esConyuge = document.getElementById('bonif-conyuge');
      var esDescendiente = document.getElementById('bonif-descendiente');
      var esViviendaHab = document.getElementById('bonif-vivienda');

      if (esConyuge && esConyuge.checked && cityData.bonificaciones.herenciaConyuge.aplicable) {
        bonificacionPct = Math.max(bonificacionPct, cityData.bonificaciones.herenciaConyuge.porcentaje);
      }
      if (esDescendiente && esDescendiente.checked && cityData.bonificaciones.herenciaDescendientes.aplicable) {
        bonificacionPct = Math.max(bonificacionPct, cityData.bonificaciones.herenciaDescendientes.porcentaje);
      }
      if (esViviendaHab && esViviendaHab.checked && cityData.bonificaciones.viviendaHabitual.aplicable) {
        bonificacionPct = Math.max(bonificacionPct, cityData.bonificaciones.viviendaHabitual.porcentaje);
      }
    }

    // Elegir el método más favorable (menor cuota)
    var cuotaObjetivo = null;
    var cuotaReal = null;
    var metodoElegido = null;

    if (resultadoObjetivo && resultadoObjetivo.aplicable) {
      cuotaObjetivo = resultadoObjetivo.cuota;
    }

    if (resultadoReal && resultadoReal.aplicable && resultadoReal.hayPlusvalia) {
      cuotaReal = resultadoReal.cuota;
    }

    if (cuotaObjetivo !== null && cuotaReal !== null) {
      metodoElegido = cuotaObjetivo <= cuotaReal ? 'objetivo' : 'real';
    } else if (cuotaObjetivo !== null) {
      metodoElegido = 'objetivo';
    } else if (cuotaReal !== null) {
      metodoElegido = 'real';
    } else {
      mostrarError('No se pudo calcular. Revisa los datos introducidos.');
      return;
    }

    var cuotaFinal = metodoElegido === 'objetivo' ? cuotaObjetivo : cuotaReal;
    var resultadoFinal = metodoElegido === 'objetivo' ? resultadoObjetivo : resultadoReal;

    // Aplicar bonificación
    var cuotaBonificada = aplicarBonificacion(cuotaFinal, bonificacionPct);

    // Mostrar resultado
    mostrarResultado({
      metodoElegido: metodoElegido,
      resultadoObjetivo: resultadoObjetivo,
      resultadoReal: resultadoReal,
      cuotaObjetivo: cuotaObjetivo,
      cuotaReal: cuotaReal,
      cuotaFinal: cuotaFinal,
      cuotaBonificada: cuotaBonificada,
      bonificacionPct: bonificacionPct,
      anos: anos,
      tipo: tipo,
      resultadoDetalle: resultadoFinal
    });

    // Tracking
    if (typeof gtag === 'function') {
      gtag('event', 'calculate', {
        event_category: 'calculator',
        event_label: citySlug,
        value: Math.round(cuotaBonificada)
      });
    }
  }

  function mostrarResultado(datos) {
    var html = '';

    // Header
    html += '<div class="result-header"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#28a745"/><path d="M6 10l3 3 5-5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><h3>Resultado del cálculo</h3></div>';

    // Importe principal
    html += '<div class="result-amount">';
    html += '<div class="amount">' + formatearMoneda(datos.cuotaBonificada) + '</div>';
    html += '<div class="amount-label">Plusvalía municipal estimada</div>';
    html += '</div>';

    // Comparación de métodos (si ambos disponibles)
    if (datos.cuotaObjetivo !== null && datos.cuotaReal !== null) {
      html += '<div class="method-comparison">';
      html += '<div class="method-box' + (datos.metodoElegido === 'objetivo' ? ' selected' : '') + '">';
      html += '<div class="method-name">M. Objetivo</div>';
      html += '<div class="method-amount">' + formatearMoneda(datos.cuotaObjetivo) + '</div>';
      if (datos.metodoElegido === 'objetivo') html += '<span class="method-tag">Más favorable</span>';
      html += '</div>';
      html += '<div class="method-box' + (datos.metodoElegido === 'real' ? ' selected' : '') + '">';
      html += '<div class="method-name">M. Real</div>';
      html += '<div class="method-amount">' + formatearMoneda(datos.cuotaReal) + '</div>';
      if (datos.metodoElegido === 'real') html += '<span class="method-tag">Más favorable</span>';
      html += '</div>';
      html += '</div>';
    }

    // Desglose
    html += '<div class="result-breakdown"><h4>Desglose (' + (datos.metodoElegido === 'objetivo' ? 'Método Objetivo' : 'Método Real') + ')</h4>';

    if (datos.metodoElegido === 'objetivo' && datos.resultadoObjetivo) {
      html += fila('Valor catastral del suelo', formatearMoneda(datos.resultadoObjetivo.valorCatastralSuelo));
      html += fila('Años transcurridos', datos.resultadoObjetivo.anos);
      html += fila('Coeficiente aplicable', datos.resultadoObjetivo.coeficiente);
      html += fila('Base imponible', formatearMoneda(datos.resultadoObjetivo.baseImponible));
    } else if (datos.resultadoReal) {
      html += fila('Incremento de valor', formatearMoneda(datos.resultadoReal.incrementoTotal));
      if (datos.resultadoReal.proporcionSuelo < 100) {
        html += fila('Proporción suelo', datos.resultadoReal.proporcionSuelo + '%');
      }
      html += fila('Base imponible', formatearMoneda(datos.resultadoReal.baseImponible));
    }

    html += fila('Tipo impositivo', cityData.tipoImpositivo + '%');

    if (datos.bonificacionPct > 0) {
      html += fila('Cuota antes de bonificación', formatearMoneda(datos.cuotaFinal));
      html += fila('Bonificación aplicada', datos.bonificacionPct + '%');
    }

    html += '<div class="breakdown-row total"><span class="label">Cuota a pagar</span><span class="value">' + formatearMoneda(datos.cuotaBonificada) + '</span></div>';
    html += '</div>';

    // Aviso de plazo
    var plazoTexto = datos.tipo === 'herencia'
      ? 'Dispone de <strong>' + cityData.plazoVoluntario.herencia + ' meses</strong> desde el fallecimiento para presentar la autoliquidación.'
      : 'Dispone de <strong>' + cityData.plazoVoluntario.compraventa + ' días hábiles</strong> desde la transmisión para presentar la autoliquidación.';

    html += '<div class="result-notice"><svg width="18" height="18" viewBox="0 0 20 20" fill="#ffc107"><path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"/></svg><span>' + plazoTexto + '</span></div>';

    // Enlace al ayuntamiento
    html += '<a href="' + cityData.urlAyuntamiento + '" target="_blank" rel="noopener" class="result-link">Información del Ayuntamiento de ' + cityData.nombre + ' &rarr;</a>';

    resultCard.innerHTML = html;
    resultCard.classList.add('visible');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function mostrarSinPlusvalia(mensaje) {
    var html = '';
    html += '<div class="result-header no-plusvalia"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#28a745"/><path d="M6 10l3 3 5-5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><h3>Resultado del cálculo</h3></div>';
    html += '<div class="result-no-tax"><p>' + mensaje + '</p></div>';

    resultCard.innerHTML = html;
    resultCard.classList.add('visible');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function mostrarError(mensaje) {
    var html = '';
    html += '<div class="result-header" style="border-bottom-color:var(--danger)"><svg width="20" height="20" viewBox="0 0 20 20" fill="#dc3545"><path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"/></svg><h3>Error</h3></div>';
    html += '<div style="padding:1rem;background:var(--danger-light);border-radius:var(--radius);text-align:center;color:var(--danger);font-weight:500;">' + mensaje + '</div>';

    resultCard.innerHTML = html;
    resultCard.classList.add('visible');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function fila(label, valor) {
    return '<div class="breakdown-row"><span class="label">' + label + '</span><span class="value">' + valor + '</span></div>';
  }

  // ============================================
  // Nav toggle (móvil)
  // ============================================
  var navToggle = document.getElementById('nav-toggle');
  var siteNav = document.getElementById('site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      siteNav.classList.toggle('active');
    });
  }

  // ============================================
  // Cookie banner
  // ============================================
  var cookieBanner = document.getElementById('cookie-banner');
  var btnAccept = document.getElementById('cookie-accept');
  var btnReject = document.getElementById('cookie-reject');

  if (cookieBanner && !localStorage.getItem('cookies_accepted')) {
    cookieBanner.classList.add('visible');
  }

  if (btnAccept) {
    btnAccept.addEventListener('click', function () {
      localStorage.setItem('cookies_accepted', 'true');
      cookieBanner.classList.remove('visible');
    });
  }

  if (btnReject) {
    btnReject.addEventListener('click', function () {
      localStorage.setItem('cookies_accepted', 'false');
      cookieBanner.classList.remove('visible');
    });
  }

  // ============================================
  // FAQ accordion
  // ============================================
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var btn = item.querySelector('.faq-question');
    if (btn) {
      btn.addEventListener('click', function () {
        item.classList.toggle('active');
      });
    }
  });

})();
