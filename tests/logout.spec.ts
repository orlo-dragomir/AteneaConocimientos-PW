import dotenv from 'dotenv';
import { test, expect } from '@playwright/test';
import { PaginaLogin } from '@pages/paginaLogin';
import { PaginaDashboard } from '@pages/paginaDashboard';
import { PaginaHome } from '@pages/paginaHome';
import { PaginaAdminLogin } from '@pages/paginaAdminLogin';
import { PaginaAdminDashboard } from '@pages/paginaAdminDashboard';
import { Helpers } from '@utils/helpers';

dotenv.config();

const emailEstudiante = process.env.E2E_USER;
const passwordEstudiante = process.env.E2E_PASS;
const usuarioAdmin = process.env.E2E_ADMIN_USER;
const passwordAdmin = process.env.E2E_ADMIN_PASS;

test.describe('TC-9: Logout (estudiante y administrador)', () => {
    test.describe('Estudiante', () => {
        test.skip(
            !emailEstudiante || !passwordEstudiante,
            'E2E_USER y E2E_PASS son obligatorios para este test.',
        );

        let paginaLogin: PaginaLogin;
        let paginaDashboard: PaginaDashboard;
        let helpers: Helpers;

        test.beforeEach(async ({ page }) => {
            paginaLogin = new PaginaLogin(page);
            paginaDashboard = new PaginaDashboard(page);
            helpers = new Helpers(page);

            await paginaLogin.navegarALogin();
            await paginaLogin.iniciarSesion(emailEstudiante!, passwordEstudiante!);
            await helpers.esperarPorRespuestaAPI('/api/students/login', 'POST', 200);
            await paginaDashboard.esperarDashboardVisible();
        });

        test('Logout de estudiante limpia sesión y protege rutas', async ({ page }) => {
            const estadoAntes = await page.evaluate(() => ({
                token: window.localStorage.getItem('token'),
                user: window.localStorage.getItem('user'),
            }));
            expect(estadoAntes.token).not.toBeNull();

            await paginaDashboard.cerrarSesionDesdeMenu();

            await expect(page).toHaveURL(/\/login$/);

            const estadoDespues = await page.evaluate(() => ({
                token: window.localStorage.getItem('token'),
                user: window.localStorage.getItem('user'),
            }));
            expect(estadoDespues.token).toBeNull();
            expect(estadoDespues.user).toBeNull();

            const paginaHome = new PaginaHome(page);
            await paginaHome.navegarAHome();
            await expect(paginaHome.botonCrearCuenta).toBeVisible();

            await page.goto('/dashboard');
            await expect(page).toHaveURL(/\/login$/);
        });
    });

    test.describe('Administrador', () => {
        test.skip(
            !usuarioAdmin || !passwordAdmin,
            'E2E_ADMIN_USER y E2E_ADMIN_PASS son obligatorios para este test.',
        );

        let paginaAdminLogin: PaginaAdminLogin;
        let paginaAdminDashboard: PaginaAdminDashboard;
        let helpers: Helpers;

        test.beforeEach(async ({ page }) => {
            paginaAdminLogin = new PaginaAdminLogin(page);
            paginaAdminDashboard = new PaginaAdminDashboard(page);
            helpers = new Helpers(page);

            await paginaAdminLogin.navegarALogin();
            await paginaAdminLogin.iniciarSesion(usuarioAdmin!, passwordAdmin!);
            await helpers.esperarPorRespuestaAPI('/api/admin/login', 'POST', 200);
            await paginaAdminDashboard.esperarDashboardVisible();
        });

        test('Logout de administrador limpia sesión y protege rutas', async ({ page }) => {
            const estadoAntes = await page.evaluate(() => ({
                token: window.localStorage.getItem('token'),
                user: window.localStorage.getItem('user'),
            }));
            expect(estadoAntes.token).not.toBeNull();

            await paginaAdminDashboard.cerrarSesion();

            await expect(page).toHaveURL(/\/admin\/login$/);

            const estadoDespues = await page.evaluate(() => ({
                token: window.localStorage.getItem('token'),
                user: window.localStorage.getItem('user'),
            }));
            expect(estadoDespues.token).toBeNull();
            expect(estadoDespues.user).toBeNull();

            const paginaHome = new PaginaHome(page);
            await paginaHome.navegarAHome();
            await expect(paginaHome.botonCrearCuenta).toBeVisible();

            await page.goto('/admin/dashboard');
            await expect(page).toHaveURL(/\/admin\/login$/);
        });
    });
});
