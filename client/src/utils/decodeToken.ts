// src/utils/decodeToken.ts
export const decodeToken = (token: string) => {
    if (!token) return null;

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const decoded = JSON.parse(jsonPayload);
        console.log('Decoded JWT:', decoded); // Add debug log
        return decoded;
    } catch (e) {
        console.error('Invalid token', e);
        return null;
    }
};
