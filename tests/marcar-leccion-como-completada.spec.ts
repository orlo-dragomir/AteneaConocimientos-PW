import { test, expect } from '@tests/fixtures/usuarios';
import { PaginaDashboard } from '@pages/paginaDashboard';
import { PaginaLogin } from '@pages/paginaLogin';
import { PaginaTaller } from '@pages/paginaTaller';
import { Helpers } from '@utils/helpers';

const workshopName = process.env.E2E_WORKSHOP_NAME ?? 'test';
const moduleName = process.env.E2E_WORKSHOP_MODULE_NAME ?? 'asdasd';

let paginaLogin: PaginaLogin;
let paginaDashboard: PaginaDashboard;
let paginaTaller: PaginaTaller;
let helpers: Helpers;

test.beforeEach(async ({ page, usuarioNuevo }) => {
    paginaLogin = new PaginaLogin(page);
    paginaDashboard = new PaginaDashboard(page);
    paginaTaller = new PaginaTaller(page);
    helpers = new Helpers(page);

    await paginaLogin.navegarALogin();
    await paginaLogin.iniciarSesion(usuarioNuevo.email, usuarioNuevo.password);
    await paginaDashboard.esperarDashboardVisible();
    await paginaDashboard.accederATallerGratis(workshopName);
    await paginaTaller.esperarVistaCargada();
    await paginaTaller.ignorarGuiaInicial();
    await paginaTaller.expandirModulo(moduleName);
});

test('TC-10: Marcar lección como completada', { tag: '@smoke' }, async () => {
    const leccionPendiente = await paginaTaller.abrirPrimeraLeccionPendiente(moduleName);
    const progresoInicial = await paginaTaller.obtenerProgresoActual();

    const esperarCompletado = helpers.esperarPorRespuestaAPI('/v2/student/lessons/', 'POST', 200);

    await paginaTaller.marcarLeccionComoCompletada();
    await esperarCompletado;

    await paginaTaller.validarLeccionCompletada();
    await paginaTaller.validarLeccionMarcadaEnTemario(moduleName, leccionPendiente);
    const progresoFinal = await paginaTaller.obtenerProgresoActual();

    expect(progresoFinal).toBeGreaterThan(progresoInicial);
});
