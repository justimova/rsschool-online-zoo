
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    // plugins: [{
    //     name: 'redirect-root-to-landing',
    //     configureServer(server) {
    //         server.middlewares.use((req, res, next): void => {
    //             if (req.url === '/') {
    //                 res.statusCode = 302;
    //                 res.setHeader('Location', '/online-zoo/pages/landing/index.html');
    //                 res.end();
    //                 return;
    //             }

    //             next();
    //         });
    //     }
    // }],
    base: './',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                index: fileURLToPath(new URL('./index.html', import.meta.url)),
                landing: fileURLToPath(new URL('./online-zoo/pages/landing/index.html', import.meta.url)),
                contact: fileURLToPath(new URL('./online-zoo/pages/contact/index.html', import.meta.url)),
                map: fileURLToPath(new URL('./online-zoo/pages/map/index.html', import.meta.url)),
                zoos: fileURLToPath(new URL('./online-zoo/pages/zoos/index.html', import.meta.url)),
                eagle: fileURLToPath(new URL('./online-zoo/pages/zoos/eagle.html', import.meta.url)),
                gorillas: fileURLToPath(new URL('./online-zoo/pages/zoos/gorillas.html', import.meta.url)),
                lemurs: fileURLToPath(new URL('./online-zoo/pages/zoos/lemurs.html', import.meta.url)),
                signin: fileURLToPath(new URL('./online-zoo/pages/auth/signin.html', import.meta.url)),
                registration: fileURLToPath(new URL('./online-zoo/pages/auth/registration.html', import.meta.url)),
            }
        }
    }
});
