import { Locator, Page } from '@playwright/test';

export class PaginaDashboard {
    readonly page: Page;
    readonly linkMisTalleres: Locator;
    readonly botonMenuUsuario: Locator;
    readonly opcionCerrarSesion: Locator;
    readonly headingTalleresDisponibles: Locator;

    constructor(page: Page) {
        this.page = page;
        this.linkMisTalleres = page.getByRole('tab', { name: 'Mis Talleres' });
        this.botonMenuUsuario = page.getByRole('button', { name: /account of current user/i });
        this.opcionCerrarSesion = page.getByRole('menuitem', { name: 'Cerrar Sesión' });
        this.headingTalleresDisponibles = page.getByRole('heading', {
            name: 'Comienza aquí: elige un taller y crea tu camino de aprendizaje.',
        });
    }

    async navegarADashboard() {
        await this.page.goto('/dashboard');
    }

    async esperarDashboardVisible() {
        await this.linkMisTalleres.waitFor({ state: 'visible' });
    }

    async abrirMenuUsuario() {
        await this.botonMenuUsuario.click();
        await this.opcionCerrarSesion.waitFor({ state: 'visible' });
    }

    async cerrarSesionDesdeMenu() {
        await this.abrirMenuUsuario();
        await this.opcionCerrarSesion.click();
    }

    async accederATallerGratis(nombreTaller: string) {
        await this.headingTalleresDisponibles.waitFor({ state: 'visible' });
        const tarjeta = this.obtenerTarjetaDeTaller(nombreTaller);
        const botonAcceder = tarjeta.getByRole('button', { name: /Acceder gratis/i });
        await botonAcceder.waitFor({ state: 'visible' });
        await Promise.all([this.page.waitForURL(/\/workshops\//), botonAcceder.click()]);
    }

    private obtenerTarjetaDeTaller(nombreTaller: string) {
        const heading = this.page.getByRole('heading', {
            name: new RegExp(`^${this.escapeRegex(nombreTaller)}$`, 'i'),
        });
        return heading.locator('..').locator('..');
    }

    private escapeRegex(valor: string) {
        return valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
