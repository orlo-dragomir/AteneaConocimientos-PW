import { test, expect } from '@tests/fixtures/usuarios';
import { PaginaCursoPostman } from '@pages/paginaCursoPostman';
import { PaginaHeader } from '@pages/paginaHeader';
import { PaginaLogin } from '@pages/paginaLogin';

type PerfilEstudiante = {
    total_points?: number;
    level?: number;
};

type QuizPayload = {
    awarded: boolean;
    pointsAwarded: number;
    total_points: number;
    level: number;
};

type HistorialActividades = {
    activities?: Array<{
        activity_type: string;
        points_earned: number;
    }>;
};

let paginaCursoPostman: PaginaCursoPostman;
let paginaHeader: PaginaHeader;
let paginaLogin: PaginaLogin;
let tokenAutenticado: string | undefined;

test.beforeEach(async ({ page, usuarioNuevo }) => {
    paginaLogin = new PaginaLogin(page);
    paginaCursoPostman = new PaginaCursoPostman(page);
    paginaHeader = new PaginaHeader(page);

    await paginaLogin.navegarALogin();
    await paginaLogin.iniciarSesion(usuarioNuevo.email, usuarioNuevo.password);
    await page.waitForURL('**/dashboard');
    await paginaCursoPostman.navegarALeccionIntro();
    await paginaCursoPostman.prepararSeccionParaQuiz();

    tokenAutenticado = await paginaCursoPostman.obtenerTokenActual();
    if (!tokenAutenticado) {
        throw new Error('Token no disponible después de autenticar al estudiante.');
    }
});

test('TC-13: Acreditar XP por quiz de Postman', async ({ page }) => {
    if (!tokenAutenticado) {
        throw new Error('Token no disponible para consultar el perfil del estudiante.');
    }

    const perfilInicialResponse = await paginaCursoPostman.consultarPerfil(
        page.request,
        tokenAutenticado,
    );
    expect(perfilInicialResponse.ok()).toBeTruthy();
    const perfilInicial = (await perfilInicialResponse.json()) as PerfilEstudiante;
    const puntosIniciales = Number(perfilInicial.total_points ?? 0);
    const nivelInicial = Number(perfilInicial.level ?? 1);

    await paginaCursoPostman.avanzarHastaQuiz();
    await paginaCursoPostman.iniciarQuiz();

    const quizCompleteResponse = page.waitForResponse(
        (response) =>
            response.url().includes('/api/students/postman/quiz/complete') &&
            response.request().method() === 'POST',
    );

    await paginaCursoPostman.completarQuizIntroductorio();

    const quizResponse = await quizCompleteResponse;
    const quizPayload = (await quizResponse.json()) as QuizPayload;

    expect(quizPayload.awarded).toBeTruthy();
    expect(quizPayload.pointsAwarded).toBe(10);
    expect(quizPayload.total_points).toBe(puntosIniciales + quizPayload.pointsAwarded);
    expect(quizPayload.level).toBeGreaterThanOrEqual(nivelInicial);

    await paginaCursoPostman.validarIndicadoresDeExito();
    await expect(paginaHeader.puntosUsuario).toHaveText(`${quizPayload.total_points}`);

    const perfilResponse = await paginaCursoPostman.consultarPerfil(page.request, tokenAutenticado);
    expect(perfilResponse.ok()).toBeTruthy();
    const perfil = (await perfilResponse.json()) as PerfilEstudiante;
    expect(perfil.total_points).toBe(quizPayload.total_points);
    expect(perfil.level).toBe(quizPayload.level);

    const activityResponse = await paginaCursoPostman.consultarHistorialActividades(
        page.request,
        tokenAutenticado,
    );
    expect(activityResponse.ok()).toBeTruthy();
    const activityHistory = (await activityResponse.json()) as HistorialActividades;
    const registroQuiz = activityHistory.activities?.find(
        (actividad) => actividad.activity_type === 'postman_quiz_complete',
    );

    expect(registroQuiz).toBeTruthy();
    expect(registroQuiz!.points_earned).toBe(quizPayload.pointsAwarded);
});
