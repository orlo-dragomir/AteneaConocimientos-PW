import { Locator, Page } from '@playwright/test';

export class PaginaAdminLogin {
    readonly page: Page;
    readonly inputUsuario: Locator;
    readonly inputPassword: Locator;
    readonly botonIngresar: Locator;

    constructor(page: Page) {
        this.page = page;
        this.inputUsuario = page.getByRole('textbox', { name: 'Usuario' });
        this.inputPassword = page.getByRole('textbox', { name: 'Contraseña' });
        this.botonIngresar = page.getByRole('button', { name: 'Ingresar' });
    }

    async navegarALogin() {
        await this.page.goto('/admin/login');
    }

    async iniciarSesion(usuario: string, password: string) {
        await this.inputUsuario.fill(usuario);
        await this.inputPassword.fill(password);
        await this.botonIngresar.click();
    }
}
