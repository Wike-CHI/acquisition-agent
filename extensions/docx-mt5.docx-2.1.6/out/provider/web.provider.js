"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebProvider = void 0;
class WebProvider {
    constructor(url) {
        this.url = url;
    }
    async getDocumentations() {
        const htmlContent = this.generateWebviewHtml(this.url);
        return [
            {
                type: '.html',
                name: this.url,
                content: htmlContent,
                path: this.url,
            },
        ];
    }
    generateWebviewHtml(url) {
        return `
          <!DOCTYPE html>
          <html lang="en">

          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="Content-Security-Policy" content="default-src 'none'; frame-src *; img-src https:; script-src 'nonce-<RANDOM_NONCE>'; style-src 'unsafe-inline';">
              <title>Webview</title>
              <style>
                  html, body {
                      height: 100%;
                      width: 100%;
                      margin: 0;
                      padding: 0;
                      overflow: hidden;
                  }

                  iframe {
                      position: absolute;
                      top: 0;
                      left: 0;
                      width: 100%;
                      height: 100%;
                      border: none;
                  }
              </style>
          </head>

          <body>
              <iframe src="${url}" id="iframe"></iframe>
          </body>

          </html>
    `;
    }
}
exports.WebProvider = WebProvider;
//# sourceMappingURL=web.provider.js.map