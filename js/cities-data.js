/**
 * Datos de ciudades para la Calculadora de Plusvalía Municipal
 *
 * Coeficientes basados en los máximos nacionales post-RDL 26/2021.
 * Cada municipio puede fijar coeficientes iguales o inferiores.
 * Tipo impositivo máximo legal: 30%.
 *
 * NOTA: Los coeficientes se actualizan anualmente mediante los
 * Presupuestos Generales del Estado. Última revisión: 2025.
 */

const COEFICIENTES_MAXIMOS_2025 = {
  1: 0.14,
  2: 0.13,
  3: 0.15,
  4: 0.15,
  5: 0.17,
  6: 0.17,
  7: 0.17,
  8: 0.12,
  9: 0.11,
  10: 0.10,
  11: 0.09,
  12: 0.09,
  13: 0.09,
  14: 0.09,
  15: 0.09,
  16: 0.09,
  17: 0.08,
  18: 0.08,
  19: 0.08,
  20: 0.08
};

const CITIES_DATA = {
  "talavera-de-la-reina": {
    nombre: "Talavera de la Reina",
    slug: "talavera-de-la-reina",
    provincia: "Toledo",
    comunidad: "Castilla-La Mancha",
    poblacion: 83000,

    coeficientes: { ...COEFICIENTES_MAXIMOS_2025 },
    tipoImpositivo: 30,

    bonificaciones: {
      herenciaConyuge: {
        aplicable: true,
        porcentaje: 50,
        descripcion: "Herencia al cónyuge de vivienda habitual"
      },
      herenciaDescendientes: {
        aplicable: true,
        porcentaje: 50,
        descripcion: "Herencia a hijos o nietos de vivienda habitual"
      },
      viviendaHabitual: {
        aplicable: true,
        porcentaje: 50,
        descripcion: "Transmisión mortis causa de vivienda habitual"
      }
    },

    plazoVoluntario: {
      compraventa: 30,
      herencia: 6
    },

    urlAyuntamiento: "https://www.talavera.es/",
    direccionAyuntamiento: "Plaza del Pan, 1 - 45600 Talavera de la Reina (Toledo)",
    telefonoAyuntamiento: "925 72 00 00",
    ultimaActualizacion: "2025"
  },

  "ponferrada": {
    nombre: "Ponferrada",
    slug: "ponferrada",
    provincia: "León",
    comunidad: "Castilla y León",
    poblacion: 65000,

    coeficientes: { ...COEFICIENTES_MAXIMOS_2025 },
    tipoImpositivo: 30,

    bonificaciones: {
      herenciaConyuge: {
        aplicable: true,
        porcentaje: 50,
        descripcion: "Herencia al cónyuge de vivienda habitual"
      },
      herenciaDescendientes: {
        aplicable: true,
        porcentaje: 50,
        descripcion: "Herencia a hijos o nietos de vivienda habitual"
      },
      viviendaHabitual: {
        aplicable: true,
        porcentaje: 50,
        descripcion: "Transmisión mortis causa de vivienda habitual"
      }
    },

    plazoVoluntario: {
      compraventa: 30,
      herencia: 6
    },

    urlAyuntamiento: "https://www.ponferrada.org/",
    direccionAyuntamiento: "Plaza del Ayuntamiento, 1 - 24400 Ponferrada (León)",
    telefonoAyuntamiento: "987 44 48 00",
    ultimaActualizacion: "2025"
  },

  "motril": {
    nombre: "Motril",
    slug: "motril",
    provincia: "Granada",
    comunidad: "Andalucía",
    poblacion: 60000,

    coeficientes: { ...COEFICIENTES_MAXIMOS_2025 },
    tipoImpositivo: 30,

    bonificaciones: {
      herenciaConyuge: {
        aplicable: true,
        porcentaje: 50,
        descripcion: "Herencia al cónyuge de vivienda habitual"
      },
      herenciaDescendientes: {
        aplicable: true,
        porcentaje: 50,
        descripcion: "Herencia a hijos o nietos de vivienda habitual"
      },
      viviendaHabitual: {
        aplicable: true,
        porcentaje: 50,
        descripcion: "Transmisión mortis causa de vivienda habitual"
      }
    },

    plazoVoluntario: {
      compraventa: 30,
      herencia: 6
    },

    urlAyuntamiento: "https://www.motril.es/",
    direccionAyuntamiento: "Plaza de España, 1 - 18600 Motril (Granada)",
    telefonoAyuntamiento: "958 83 83 00",
    ultimaActualizacion: "2025"
  },

  "alcoy": {
    nombre: "Alcoy / Alcoi",
    slug: "alcoy",
    provincia: "Alicante",
    comunidad: "Comunidad Valenciana",
    poblacion: 59000,

    coeficientes: { ...COEFICIENTES_MAXIMOS_2025 },
    tipoImpositivo: 30,

    bonificaciones: {
      herenciaConyuge: {
        aplicable: true,
        porcentaje: 50,
        descripcion: "Herencia al cónyuge de vivienda habitual"
      },
      herenciaDescendientes: {
        aplicable: true,
        porcentaje: 50,
        descripcion: "Herencia a hijos o nietos de vivienda habitual"
      },
      viviendaHabitual: {
        aplicable: true,
        porcentaje: 50,
        descripcion: "Transmisión mortis causa de vivienda habitual"
      }
    },

    plazoVoluntario: {
      compraventa: 30,
      herencia: 6
    },

    urlAyuntamiento: "https://www.alcoi.org/",
    direccionAyuntamiento: "Plaça d'Espanya, 1 - 03801 Alcoi (Alicante)",
    telefonoAyuntamiento: "965 53 71 00",
    ultimaActualizacion: "2025"
  },

  "linares": {
    nombre: "Linares",
    slug: "linares",
    provincia: "Jaén",
    comunidad: "Andalucía",
    poblacion: 54000,

    coeficientes: { ...COEFICIENTES_MAXIMOS_2025 },
    tipoImpositivo: 30,

    bonificaciones: {
      herenciaConyuge: {
        aplicable: true,
        porcentaje: 50,
        descripcion: "Herencia al cónyuge de vivienda habitual"
      },
      herenciaDescendientes: {
        aplicable: true,
        porcentaje: 50,
        descripcion: "Herencia a hijos o nietos de vivienda habitual"
      },
      viviendaHabitual: {
        aplicable: true,
        porcentaje: 50,
        descripcion: "Transmisión mortis causa de vivienda habitual"
      }
    },

    plazoVoluntario: {
      compraventa: 30,
      herencia: 6
    },

    urlAyuntamiento: "https://www.linares.es/",
    direccionAyuntamiento: "Calle Corredera de San Marcos, 1 - 23700 Linares (Jaén)",
    telefonoAyuntamiento: "953 64 90 00",
    ultimaActualizacion: "2025"
  }
};

// Lista ordenada de ciudades para el selector
const CITIES_LIST = Object.keys(CITIES_DATA).map(slug => ({
  slug: slug,
  nombre: CITIES_DATA[slug].nombre,
  provincia: CITIES_DATA[slug].provincia
})).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
