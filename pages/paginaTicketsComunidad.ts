import { expect, Locator, Page } from '@playwright/test';
import { PaginaHeader } from '@pages/paginaHeader';

export class PaginaTicketsComunidad {
    readonly page: Page;
    readonly tituloPagina: Locator;
    readonly campoBusqueda: Locator;
    readonly filtroTodos: Locator;
    readonly filtroAceptados: Locator;
    readonly filtroEnProgreso: Locator;
    readonly tarjetas: Locator;
    readonly titulosTickets: Locator;
    readonly chipsEstado: Locator;
    readonly chipsPrioridad: Locator;
    readonly alertasDeError: Locator;

    constructor(page: Page) {
        this.page = page;
        this.tituloPagina = page.getByRole('heading', { name: 'Tickets de la comunidad' });
        this.campoBusqueda = page.getByRole('textbox', {
            name: /Buscar por título, descripción o categoría/i,
        });
        this.filtroTodos = page.getByRole('button', { name: 'Todos' });
        this.filtroAceptados = page.getByRole('button', { name: 'Aceptados' });
        this.filtroEnProgreso = page.getByRole('button', { name: 'En progreso' });
        this.tarjetas = page.locator('div.MuiCard-root');
        this.titulosTickets = page.getByRole('heading', { level: 6 });
        this.chipsEstado = page
            .locator('span.MuiChip-label')
            .filter({ hasText: /Aceptado|En progreso|Resuelto/i });
        this.chipsPrioridad = page
            .locator('span.MuiChip-label')
            .filter({ hasText: /Prioridad:/i });
        this.alertasDeError = page.getByRole('alert').filter({
            hasText: /error|fallo|fall\u00f3|ocurri\u00f3/i,
        });
    }

    async abrirDesdeHeader(header: PaginaHeader) {
        await this.page.goto('/dashboard');
        await header.ticketsComunidadTab.click();
        await expect(this.tituloPagina).toBeVisible();
    }

    async validarListadoConEstadoYPrioridad() {
        const cantidadTarjetas = await this.tarjetas.count();
        expect(cantidadTarjetas).toBeGreaterThan(0);

        for (let index = 0; index < cantidadTarjetas; index += 1) {
            const tarjeta = this.tarjetas.nth(index);
            const estado = await this.obtenerEstadoDesdeTarjeta(tarjeta);
            expect(['Aceptado', 'En progreso', 'Resuelto']).toContain(estado);
            await expect(tarjeta.locator('span.MuiChip-label:has-text("Prioridad")')).toBeVisible();
            await expect(tarjeta.getByText('ID:', { exact: false })).toBeVisible();
        }
    }

    async validarFiltroAceptados() {
        await this.filtroAceptados.click();
        await expect(this.filtroAceptados).toHaveAttribute('aria-pressed', 'true');
        const cantidadTarjetas = await this.tarjetas.count();
        expect(cantidadTarjetas).toBeGreaterThan(0);

        for (let index = 0; index < cantidadTarjetas; index += 1) {
            const estado = await this.obtenerEstadoDesdeTarjeta(this.tarjetas.nth(index));
            expect(estado).toBe('Aceptado');
        }
    }

    async validarSinAlertasDeError() {
        await expect(this.alertasDeError).toHaveCount(0);
    }

    private async obtenerEstadoDesdeTarjeta(tarjeta: Locator) {
        const chipEstado = tarjeta
            .locator('span.MuiChip-label')
            .filter({ hasText: /Aceptado|En progreso|Resuelto/i })
            .first();
        await expect(chipEstado).toBeVisible();
        return chipEstado.innerText();
    }
}
