import { test } from '@tests/fixtures/autenticado';
import { PaginaCentroSoporte, DatosTicketSoporte } from '@pages/paginaCentroSoporte';
import { Helpers } from '@utils/helpers';

let paginaCentroSoporte: PaginaCentroSoporte;
let helpers: Helpers;

test.beforeEach(async ({ page, sesionActiva }) => {
    void sesionActiva;
    paginaCentroSoporte = new PaginaCentroSoporte(page);
    helpers = new Helpers(page);

    await paginaCentroSoporte.navegarAPerfil();
});

test('TC-19: Crear ticket de soporte', { tag: '@smoke' }, async () => {
    const timestamp = Date.now();
    const datosTicket: DatosTicketSoporte = {
        titulo: `Ticket ${timestamp}`,
        descripcion: `El ${timestamp}`,
        categoria: 'Centro de soporte',
        prioridad: 'Alta',
        entorno: 'Chrome 125 / macOS',
        pasos: `${timestamp}`,
        resultadoEsperado: `${timestamp}`,
        evidenciaUrl: `https://evidencias.atenea/${timestamp}`,
    };

    await Promise.all([
        helpers.esperarPorRespuestaAPI('/tickets/access', 'GET', 200),
        paginaCentroSoporte.abrirCentroDeSoporte(),
    ]);
    const esperarCheckDuplicates = helpers.esperarPorRespuestaAPI(
        '/tickets/check-duplicates',
        'POST',
        200,
    );
    const esperarCreacion = helpers.esperarPorRespuestaAPI('/tickets', 'POST', 201);
    const esperarActualizacion = helpers.esperarPorRespuestaAPI('/tickets/my', 'GET', 200);
    await paginaCentroSoporte.registrarTicket(datosTicket);
    await Promise.all([esperarCheckDuplicates, esperarCreacion, esperarActualizacion]);

    await paginaCentroSoporte.validarNotificacionDeExito();
    await paginaCentroSoporte.validarTicketEnGrilla(datosTicket.titulo);
});
