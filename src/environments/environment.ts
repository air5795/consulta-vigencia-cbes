// src/environments/environment.ts (EN EL NUEVO PROYECTO)
export const environment = {
    production: false,
    sistema: 47, // ID de tu sistema de cotizaciones
    urlMSAuth: 'http://10.0.10.217:3000/api/auth/get-session',
    urlMSAuthToken: 'http://10.0.10.217:3000/api/auth',
    urlMSAuthRefreshToken: 'http://10.0.10.217:3000/api/',
    login: 'http://10.0.10.200:4300/', // A donde te bota si caduca la sesión

    // Puedes traerte las demás variables de la API si ya las vas a usar:
    url: "http://10.0.0.152:4002/api/v1/",
    url_seguridad: "http://10.0.0.152:3009/api/v1/"
};
