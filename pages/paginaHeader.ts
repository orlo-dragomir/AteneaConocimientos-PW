import { Locator, Page } from '@playwright/test';

export class PaginaHeader {
    readonly page: Page;
    readonly logoAtenea: Locator;
    readonly publicacionesTab: Locator;
    readonly topAteniensesTab: Locator;
    readonly ticketsComunidadTab: Locator;
    readonly cantidadDeVidas: Locator;
    readonly nivelUsuario: Locator;
    readonly puntosUsuario: Locator;
    readonly saludoUsuario: Locator;
    readonly botonNotificaciones: Locator;
    readonly botonPerfilUsuario: Locator;

    constructor(page: Page) {
        this.page = page;
        this.logoAtenea = page.locator('#student-header-logo-image');
        this.publicacionesTab = page.locator('#student-header-link-publicaciones');
        this.topAteniensesTab = page.locator('#student-header-link-top-atenienses');
        this.ticketsComunidadTab = page.locator('#student-header-link-ticketscomunidad');
        this.cantidadDeVidas = page.locator('#student-header-hearts-count');
        this.nivelUsuario = page.locator('#student-header-level-chip');
        this.puntosUsuario = page.locator('#student-header-points-value');
        this.saludoUsuario = page.getByText('Hola,', { exact: false });
        this.botonNotificaciones = page.locator('#student-header-notifications-button');
        this.botonPerfilUsuario = page.locator('#student-header-avatar-button');
    }
}
