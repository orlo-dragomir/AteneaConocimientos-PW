import { Locator, Page } from '@playwright/test';

export class PaginaAdminDashboard {
    readonly page: Page;
    readonly tituloPanel: Locator;
    readonly botonCerrarSesion: Locator;

    constructor(page: Page) {
        this.page = page;
        this.tituloPanel = page.getByRole('heading', { name: 'Panel de Administración' });
        this.botonCerrarSesion = page.getByRole('button', { name: 'Cerrar Sesión' });
    }

    async esperarDashboardVisible() {
        await this.tituloPanel.waitFor({ state: 'visible' });
    }

    async cerrarSesion() {
        await this.botonCerrarSesion.click();
    }
}
