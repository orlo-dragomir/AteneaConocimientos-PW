import { test, expect } from '@tests/fixtures/autenticado';
import { PaginaHeader } from '@pages/paginaHeader';
import { PaginaTicketsComunidad } from '@pages/paginaTicketsComunidad';
import { Helpers } from '@utils/helpers';

let paginaHeader: PaginaHeader;
let paginaTicketsComunidad: PaginaTicketsComunidad;
let helpers: Helpers;

test.beforeEach(({ page, sesionActiva }) => {
    void sesionActiva;
    paginaHeader = new PaginaHeader(page);
    paginaTicketsComunidad = new PaginaTicketsComunidad(page);
    helpers = new Helpers(page);
});

test('TC-20: Consultar reportes públicos', async () => {
    const esperarTickets = helpers.esperarPorRespuestaAPI('/tickets/community', 'GET', 200);
    await paginaTicketsComunidad.abrirDesdeHeader(paginaHeader);
    await esperarTickets;

    await expect(paginaTicketsComunidad.campoBusqueda).toBeVisible();
    await paginaTicketsComunidad.validarListadoConEstadoYPrioridad();
    await paginaTicketsComunidad.validarFiltroAceptados();
    await paginaTicketsComunidad.validarSinAlertasDeError();
});
