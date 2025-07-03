"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
require("./globals.css");
var google_1 = require("next/font/google");
var inter = (0, google_1.Inter)({ subsets: ['latin'] });
exports.metadata = {
    title: 'Aurora - Analisador de Apostas',
    description: 'Verificador de probabilidade para apostas de futebol com cálculo de valor esperado',
};
function RootLayout(_a) {
    var children = _a.children;
    return (<html lang="pt-BR">
            <body className={inter.className}>
                <div className="min-h-screen bg-gray-50">
                    {children}
                </div>
            </body>
        </html>);
}
