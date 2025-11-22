import { expect, Locator, Page } from '@playwright/test';

export class PaginaTaller {
    readonly page: Page;
    readonly botonAbrirAyuda: Locator;
    readonly botonCerrarGuia: Locator;
    readonly botonMarcarComoCompletada: Locator;
    readonly botonLeccionCompletada: Locator;
    readonly textoProgreso: Locator;
    readonly headingTemario: Locator;
    readonly tituloNotificacionLogro: Locator;

    constructor(page: Page) {
        this.page = page;
        this.botonAbrirAyuda = page.getByRole('button', { name: 'Ayuda y atajos de teclado' });
        this.botonCerrarGuia = page.getByRole('button', { name: '¡Entendido, comenzar!' });
        this.botonMarcarComoCompletada = page.getByRole('button', {
            name: 'Marcar como Completada',
        });
        this.botonLeccionCompletada = page.getByRole('button', { name: '✓ Lección Completada' });
        this.textoProgreso = page.getByRole('heading', { name: /Progreso:/i });
        this.headingTemario = page.getByRole('heading', { name: 'Temario del Taller' });
        this.tituloNotificacionLogro = page.getByRole('heading', {
            name: '¡Logro Desbloqueado!',
        });
    }

    async esperarVistaCargada() {
        await this.headingTemario.waitFor({ state: 'visible' });
    }

    async ignorarGuiaInicial() {
        const visible = await this.botonCerrarGuia.isVisible().catch(() => false);
        if (visible) {
            await this.botonCerrarGuia.click();
        }
    }

    async expandirModulo(nombreModulo: string) {
        const botonModulo = this.obtenerBotonModulo(nombreModulo);
        await botonModulo.waitFor({ state: 'visible' });
        const expandido = await botonModulo.getAttribute('aria-expanded');
        if (expandido !== 'true') {
            await botonModulo.click();
        }
        await this.obtenerRegionModulo(nombreModulo).waitFor({ state: 'visible' });
    }

    async abrirLeccion(nombreModulo: string, leccion: string) {
        const fila = this.obtenerFilaLeccion(nombreModulo, leccion);
        await fila.locator('p').first().click();
        await this.botonMarcarComoCompletada.waitFor({ state: 'visible' });
    }

    async abrirPrimeraLeccionPendiente(nombreModulo: string): Promise<string> {
        const region = this.obtenerRegionModulo(nombreModulo);
        const checkboxPendiente = region.locator('input[type="checkbox"]:not(:checked)').first();
        if ((await checkboxPendiente.count()) === 0) {
            throw new Error(`No hay lecciones pendientes en el módulo ${nombreModulo}.`);
        }

        const fila = checkboxPendiente.locator('..').locator('..');
        const etiqueta = (await fila.locator('p').first().innerText()).trim();
        await fila.locator('p').first().click();
        await this.botonMarcarComoCompletada.waitFor({ state: 'visible' });
        return etiqueta;
    }

    async marcarLeccionComoCompletada() {
        await this.botonMarcarComoCompletada.click();
    }

    async validarLeccionCompletada() {
        await expect(this.botonLeccionCompletada).toBeVisible();
    }

    async validarLeccionMarcadaEnTemario(nombreModulo: string, leccion: string) {
        const checkbox = this.obtenerCheckboxLeccion(nombreModulo, leccion);
        await expect(checkbox).toBeChecked();
    }

    async validarNotificacionLogro(nombreLogro: string, puntosObtenidos: number) {
        await expect(this.tituloNotificacionLogro).toBeVisible({ timeout: 15000 });
        await expect(
            this.page.getByRole('heading', { name: this.crearRegexDesdeTexto(nombreLogro) }),
        ).toBeVisible();
        await expect(this.page.getByText(`+${puntosObtenidos}`)).toBeVisible();
    }

    async obtenerProgresoActual(): Promise<number> {
        const texto = (await this.textoProgreso.innerText()).trim();
        const match = texto.match(/(\d+)%/);
        return match ? Number(match[1]) : 0;
    }

    private obtenerBotonModulo(nombreModulo: string): Locator {
        return this.page.getByRole('button', { name: this.crearRegexDesdeTexto(nombreModulo) });
    }

    private obtenerRegionModulo(nombreModulo: string): Locator {
        return this.page.getByRole('region', { name: this.crearRegexDesdeTexto(nombreModulo) });
    }

    private obtenerFilaLeccion(nombreModulo: string, leccion: string): Locator {
        return this.obtenerRegionModulo(nombreModulo)
            .getByText(leccion, { exact: true })
            .first()
            .locator('..')
            .locator('..');
    }

    private obtenerCheckboxLeccion(nombreModulo: string, leccion: string): Locator {
        return this.obtenerFilaLeccion(nombreModulo, leccion).locator('input[type="checkbox"]');
    }

    private crearRegexDesdeTexto(valor: string) {
        const texto = valor.trim();
        const escaped = texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`^${escaped}`, 'i');
    }
}
