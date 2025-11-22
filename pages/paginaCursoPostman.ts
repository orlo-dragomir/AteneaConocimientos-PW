import { expect, Locator, Page, APIRequestContext } from '@playwright/test';

export class PaginaCursoPostman {
    readonly page: Page;
    readonly botonInstalarPostman: Locator;
    readonly botonPostmanInstalado: Locator;
    readonly botonVerPasosParaEnviar: Locator;
    readonly botonContinuar: Locator;
    readonly botonEscribirTests: Locator;
    readonly botonConfigurarTest: Locator;
    readonly botonIrAlQuiz: Locator;
    readonly botonComenzarQuiz: Locator;
    readonly botonRevisarLecciones: Locator;
    readonly botonEnviarRelacion: Locator;
    readonly encabezadoQuizCompletado: Locator;
    readonly mensajeSeccionCompletada: Locator;
    readonly headingSinCorazones: Locator;

    constructor(page: Page) {
        this.page = page;
        this.botonInstalarPostman = page.getByRole('button', { name: 'Instalar Postman' });
        this.botonPostmanInstalado = page.getByRole('button', { name: 'Postman instalado' });
        this.botonVerPasosParaEnviar = page.getByRole('button', { name: 'Ver pasos para enviar' });
        this.botonContinuar = page.getByRole('button', { name: 'Continuar' });
        this.botonEscribirTests = page.getByRole('button', { name: 'Escribir tests' });
        this.botonConfigurarTest = page.getByRole('button', { name: 'Configurar el test' });
        this.botonIrAlQuiz = page.getByRole('button', { name: 'Ir al quiz' });
        this.botonComenzarQuiz = page.getByRole('button', { name: 'Comenzar el quiz' });
        this.botonRevisarLecciones = page.getByRole('button', { name: 'Revisar lecciones' });
        this.botonEnviarRelacion = page.getByRole('button', { name: 'Enviar' });
        this.encabezadoQuizCompletado = page.getByRole('heading', { name: '¡Quiz completado!' });
        this.mensajeSeccionCompletada = page.getByRole('heading', { name: '¡Gran trabajo!' });
        this.headingSinCorazones = page.getByRole('heading', { name: 'Sin corazones por hoy' });
    }

    async navegarALeccionIntro() {
        await this.page.goto('/courses/postman/lesson/intro');
    }

    async prepararSeccionParaQuiz() {
        if (await this.esVisible(this.headingSinCorazones)) {
            throw new Error('No hay corazones disponibles para ejecutar el quiz de Postman.');
        }
        if (await this.esVisible(this.botonRevisarLecciones)) {
            await this.botonRevisarLecciones.click();
        }
    }

    async avanzarHastaQuiz() {
        const pasos = [
            this.botonInstalarPostman,
            this.botonPostmanInstalado,
            this.botonVerPasosParaEnviar,
            this.botonContinuar,
            this.botonEscribirTests,
            this.botonConfigurarTest,
            this.botonIrAlQuiz,
        ];

        for (const paso of pasos) {
            await this.clickSiEsVisible(paso);
        }

        await expect(this.botonComenzarQuiz).toBeVisible();
    }

    async iniciarQuiz() {
        await this.botonComenzarQuiz.click();
        await expect(
            this.page.getByRole('heading', { name: /¿Qué hace Postman al presionar/i }),
        ).toBeVisible();
    }

    async completarQuizIntroductorio() {
        await this.responderOpcionMultiple('Envía la request al servidor y espera una respuesta');
        await this.responderOpcionMultiple('En la pestaña Test Results dentro de la respuesta');
        await this.resolverPreguntaRelacion();
        await this.botonEnviarRelacion.click();
        await this.responderOpcionMultiple('la respuesta tenga código HTTP 200');
        await expect(this.encabezadoQuizCompletado).toBeVisible();
    }

    async validarIndicadoresDeExito() {
        await expect(this.mensajeSeccionCompletada).toBeVisible();
        await expect(this.botonRevisarLecciones).toBeVisible();
    }

    async obtenerTokenActual() {
        const token = await this.page.evaluate(() => window.localStorage.getItem('token'));
        return token ?? undefined;
    }

    obtenerApiBaseURL() {
        try {
            const url = new URL(this.page.url());
            return url.origin;
        } catch {
            const raw =
                process.env.API_BASE_URL ??
                process.env.PLAYWRIGHT_TEST_BASE_URL ??
                process.env.BASE_URL ??
                'https://qa.ateneaconocimientos.com';
            return raw.replace(/\/$/, '');
        }
    }

    async consultarPerfil(request: APIRequestContext, token: string) {
        const url = new URL('/api/students/profile', this.obtenerApiBaseURL()).toString();
        return request.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    async consultarHistorialActividades(request: APIRequestContext, token: string) {
        const url = new URL(
            '/api/students/activity-history?limit=10',
            this.obtenerApiBaseURL(),
        ).toString();
        return request.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    private async clickSiEsVisible(locator: Locator) {
        try {
            await locator.waitFor({ state: 'visible', timeout: 2500 });
            await locator.click();
        } catch {
            // El paso no siempre aparece si el estudiante ya avanzó en la misión.
        }
    }

    private async resolverPreguntaRelacion() {
        const parejas: Array<[string, string]> = [
            ['Postman (cliente)', 'Envía la request al servidor'],
            ['Postman Echo (servidor)', 'Procesa la request y devuelve datos'],
            ['Panel Response', 'Muestra la respuesta recibida'],
            ['Script Post-response', 'Valida el resultado con asserts'],
        ];

        for (const [origen, destino] of parejas) {
            await this.page.getByText(origen, { exact: true }).click();
            await this.page.getByText(destino, { exact: true }).click();
        }
    }

    private async responderOpcionMultiple(textoRespuesta: string) {
        const boton = this.page.getByRole('button', {
            name: new RegExp(textoRespuesta, 'i'),
        });
        await boton.waitFor({ state: 'visible' });
        await boton.click();
    }

    private async esVisible(locator: Locator) {
        try {
            return await locator.isVisible({ timeout: 500 });
        } catch {
            return false;
        }
    }
}
