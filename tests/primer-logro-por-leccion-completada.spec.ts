import { test, expect } from '@tests/fixtures/usuarios';
import { PaginaDashboard } from '@pages/paginaDashboard';
import { PaginaLogin } from '@pages/paginaLogin';
import { PaginaNotificaciones } from '@pages/paginaNotificaciones';
import { PaginaTaller } from '@pages/paginaTaller';
import { Helpers } from '@utils/helpers';

const workshopName = process.env.E2E_WORKSHOP_NAME ?? 'test';
const moduleName = process.env.E2E_WORKSHOP_MODULE_NAME ?? 'asdasd';

type PerfilEstudiante = {
    achievements?: Array<{
        id: string;
        name: string;
    }>;
};

let paginaLogin: PaginaLogin;
let paginaDashboard: PaginaDashboard;
let paginaTaller: PaginaTaller;
let paginaNotificaciones: PaginaNotificaciones;
let helpers: Helpers;

test.beforeEach(async ({ page, usuarioNuevo }) => {
    paginaLogin = new PaginaLogin(page);
    paginaDashboard = new PaginaDashboard(page);
    paginaTaller = new PaginaTaller(page);
    paginaNotificaciones = new PaginaNotificaciones(page);
    helpers = new Helpers(page);

    await paginaLogin.navegarALogin();
    await paginaLogin.iniciarSesion(usuarioNuevo.email, usuarioNuevo.password);
    await paginaDashboard.esperarDashboardVisible();
    await paginaDashboard.accederATallerGratis(workshopName);
    await paginaTaller.esperarVistaCargada();
    await paginaTaller.ignorarGuiaInicial();
    await paginaTaller.expandirModulo(moduleName);
});

test('TC-11: Primer logro por lección completada', async ({ page }) => {
    const leccionPendiente = await paginaTaller.abrirPrimeraLeccionPendiente(moduleName);

    const esperarCompletado = helpers.esperarPorRespuestaAPI('/v2/student/lessons/', 'POST', 200);
    const perfilActualizado = page.waitForResponse(
        (response) =>
            response.url().includes('/api/students/profile') &&
            response.request().method() === 'GET' &&
            response.status() === 200,
    );

    await paginaTaller.marcarLeccionComoCompletada();

    await esperarCompletado;
    const perfilResponse = await perfilActualizado;
    const perfil = (await perfilResponse.json()) as PerfilEstudiante;

    await paginaTaller.validarLeccionCompletada();
    await paginaTaller.validarLeccionMarcadaEnTemario(moduleName, leccionPendiente);
    await paginaTaller.validarNotificacionLogro('Primeros Pasos', 20);

    await paginaNotificaciones.abrirPanel();
    await paginaNotificaciones.validarLogroRegistrado('Primeros Pasos');

    const logroPrimerosPasos = perfil.achievements?.find(
        (achievement) => achievement.id === 'first_steps',
    );
    expect(logroPrimerosPasos, 'El perfil debe incluir el logro first_steps').toBeTruthy();
});
