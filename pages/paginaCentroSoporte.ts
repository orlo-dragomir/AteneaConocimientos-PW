import { expect, Locator, Page } from '@playwright/test';

export type DatosTicketSoporte = {
    titulo: string;
    descripcion: string;
    categoria?: string;
    prioridad: 'Baja' | 'Media' | 'Alta' | 'Urgente';
    entorno: string;
    pasos: string;
    resultadoEsperado: string;
    evidenciaUrl?: string;
};

export class PaginaCentroSoporte {
    readonly page: Page;
    readonly botonAbrirCentroSoporte: Locator;
    readonly botonCerrarCentroSoporte: Locator;
    readonly botonCrearNuevoTicket: Locator;
    readonly dialogoCrearTicket: Locator;
    readonly inputTitulo: Locator;
    readonly inputDescripcion: Locator;
    readonly inputCategoria: Locator;
    readonly selectorPrioridad: Locator;
    readonly inputEntorno: Locator;
    readonly inputPasos: Locator;
    readonly inputResultadoEsperado: Locator;
    readonly inputEvidenciaUrl: Locator;
    readonly botonAgregarEvidenciaUrl: Locator;
    readonly botonCrearTicket: Locator;
    readonly alertaExito: Locator;
    readonly titulosTicket: Locator;

    constructor(page: Page) {
        this.page = page;
        this.botonAbrirCentroSoporte = page.getByRole('button', {
            name: 'Abrir centro de soporte',
        });
        this.botonCerrarCentroSoporte = page.getByRole('button', {
            name: 'Cerrar centro de soporte',
        });
        this.botonCrearNuevoTicket = page.getByRole('button', { name: 'Crear nuevo ticket' });
        this.dialogoCrearTicket = page.getByRole('dialog', { name: 'Crear nuevo ticket' });
        this.inputTitulo = page.getByLabel('Título', { exact: false });
        this.inputDescripcion = page.getByLabel('Descripción', { exact: false });
        this.inputCategoria = page.getByLabel('Categoría', { exact: false });
        this.selectorPrioridad = page.getByLabel('Prioridad', { exact: false });
        this.inputEntorno = page.getByLabel('Entorno (browser, dispositivo, etc.)', {
            exact: false,
        });
        this.inputPasos = page.getByLabel('Pasos para reproducir', { exact: false });
        this.inputResultadoEsperado = page.getByLabel('Resultado esperado', { exact: false });
        this.inputEvidenciaUrl = page.getByLabel('Agregar evidencia mediante URL', {
            exact: false,
        });
        this.botonAgregarEvidenciaUrl = page.getByRole('button', { name: 'Agregar enlace' });
        this.botonCrearTicket = page.getByRole('button', { name: 'Crear ticket' });
        this.alertaExito = page.getByText('¡Al parecer encontraste un defecto nuevo!', {
            exact: false,
        });
        this.titulosTicket = page
            .getByRole('heading', { level: 6 })
            .filter({ hasText: /^Ticket/i });
    }

    async navegarAPerfil() {
        await this.page.goto('/perfil');
    }

    async abrirCentroDeSoporte() {
        if (await this.botonCerrarCentroSoporte.isVisible()) {
            return;
        }
        await this.botonAbrirCentroSoporte.click();
        await expect(this.botonCerrarCentroSoporte).toBeVisible();
        await expect(this.botonCrearNuevoTicket).toBeVisible();
    }

    async abrirModalCrearTicket() {
        await this.botonCrearNuevoTicket.click();
        await expect(this.dialogoCrearTicket).toBeVisible();
    }

    async registrarTicket(ticket: DatosTicketSoporte) {
        await this.abrirModalCrearTicket();
        await this.completarFormulario(ticket);
        await this.crearTicket();
    }

    async completarFormulario(ticket: DatosTicketSoporte) {
        await this.inputTitulo.fill(ticket.titulo);
        await this.inputDescripcion.fill(ticket.descripcion);
        if (ticket.categoria) {
            await this.inputCategoria.fill(ticket.categoria);
        }
        await this.seleccionarPrioridad(ticket.prioridad);
        await this.inputEntorno.fill(ticket.entorno);
        await this.inputPasos.fill(ticket.pasos);
        await this.inputResultadoEsperado.fill(ticket.resultadoEsperado);
        if (ticket.evidenciaUrl) {
            await this.agregarEvidenciaDesdeUrl(ticket.evidenciaUrl);
        }
    }

    private async seleccionarPrioridad(prioridad: DatosTicketSoporte['prioridad']) {
        await this.selectorPrioridad.click();
        await this.page.getByRole('option', { name: prioridad }).click();
    }

    async agregarEvidenciaDesdeUrl(url: string) {
        await this.inputEvidenciaUrl.fill(url);
        await expect(this.botonAgregarEvidenciaUrl).toBeEnabled();
        await this.botonAgregarEvidenciaUrl.click();
    }

    async crearTicket() {
        await this.botonCrearTicket.click();
        await expect(this.dialogoCrearTicket).toBeHidden();
    }

    async validarNotificacionDeExito() {
        await expect(this.alertaExito).toBeVisible({ timeout: 15000 });
    }

    async validarTicketEnGrilla(titulo: string) {
        await expect(this.titulosTicket.first()).toContainText(titulo);
    }
}
