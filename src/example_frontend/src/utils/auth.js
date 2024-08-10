import { AuthClient } from "@dfinity/auth-client";

// that is the url of the webapp for the internet identity. 
export const IDENTITY_PROVIDER = "http://be2us-64aaa-aaaaa-qaabq-cai.localhost:4943#authorize";
export async function getAuthClient() {
    return await AuthClient.create();
}


export async function logout() {
    const authClient = window.auth.client;
    authClient.logout();
    window.location.reload();
}