import { expect, Locator, Page } from '@playwright/test';

export class PaginaNotificaciones {
    readonly page: Page;
    readonly botonMostrarNotificaciones: Locator;
    readonly headingPanelNotificaciones: Locator;
    readonly panelNotificaciones: Locator;

    constructor(page: Page) {
        this.page = page;
        this.botonMostrarNotificaciones = page.getByRole('button', {
            name: 'Mostrar notificaciones',
        });
        this.headingPanelNotificaciones = page.getByRole('heading', { name: 'Notificaciones' });
        this.panelNotificaciones = page
            .getByRole('tooltip')
            .filter({ has: this.headingPanelNotificaciones });
    }

    async abrirPanel() {
        await this.botonMostrarNotificaciones.click();
        await expect(this.headingPanelNotificaciones).toBeVisible();
    }

    async validarLogroRegistrado(nombreLogro: string) {
        const logroEnLista = this.panelNotificaciones
            .getByRole('button', { name: this.crearRegexDesdeTexto(nombreLogro) })
            .first();
        await expect(logroEnLista).toBeVisible();
    }

    private crearRegexDesdeTexto(valor: string) {
        const texto = valor.trim();
        const escaped = texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(escaped, 'i');
    }
}
