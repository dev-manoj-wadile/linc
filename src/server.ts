import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { on } from 'node:events';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * 1. YOUR API HANDLER (The "Splat" Route)
 * This must be defined BEFORE the Angular SSR handler.
 * In Express 5 (standard for v20), wildcards are often defined as {*splat} 
 * or using '/*' depending on your exact routing preference.
 */
// app.get('/api/{*splat}', (req, res) => {
//   const splatValue = req.params['splat']; // Access the captured wildcard path
//   res.json({
//     message: `API splat caught: ${splatValue}`,
//     success: true,
//     timestamp: new Date().toISOString()
//   });
//   console.log(res);
// });

/**
 * Proxy configuration to inject API Key
 */
app.use('/api/{*splat}', createProxyMiddleware({
    target: 'https://wnts-apim-swa-dev-ci-001.azure-api.net/api/weatherforecast',
    changeOrigin: true,
    on:{
      proxyReq: (proxyReq, req, res) => { 
        // Inject the API key from environment variables into headers
        console.log("Inject x-api-key from process environment variable");
        proxyReq.setHeader('x-api-key', process.env['MY_SECRET_API_KEY'] || 'manojwadileEnvVar');
      },
      proxyRes: (proxyRes, req, res) => { 
        console.log("===RAJ=====")
      },
      error: (err, req, res) => { 
        console.log("===RAM=====", err)
      }
    }
  }));



// 1. CONFIGURE PROXY MIDDLEWARE
// Place this BEFORE the Angular rendering routes to ensure API calls are caught first
// app.use(
//   '/api/{*splat}',
//   createProxyMiddleware({
//     target: 'https://wnts-apim-swa-dev-ci-001.azure-api.net/api',
//     on:{
//       proxyReq: (proxyReq, req, res) => {console.log("=== (R => REQ) =====", req) },
//       proxyRes: (proxyRes, req, res) => { console.log("=== (R => RES) =====")},
//       error: (err, req, res) => {console.log("=== (E => ERR) =====", err) }
//     }
//   })
// );

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
// app.use((req, res, next) => {
//   angularApp
//     .handle(req)
//     .then((response) => 
//       response ? writeResponseToNodeResponse(response, res) : next(),
//     )
//     .catch(next);
// });

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => {
      // Log the response object here
      console.log('Angular Response Handle Other Calls :', response);

      return response ? writeResponseToNodeResponse(response, res) : next();
    })
    .catch((err) => {
      console.error('Angular Error:', err);
      next(err);
    });
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
