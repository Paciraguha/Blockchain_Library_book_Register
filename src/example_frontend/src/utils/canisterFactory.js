import { HttpAgent, Actor } from "@dfinity/agent";
import { idlFactory as backendIDL } from "../../../declarations/example_backend/example_backend.did.js";
// import { idlFactory as ledgerIDL } from "../../../declarations/ledger_canister/ledger_canister.did.js";

const BACKEND_CANISTER = "bkyz2-fmaaa-aaaaa-qaaaq-cai";
const HOST = "http://localhost:4943";

// PROBABLY NEED TO ADJUST CANISTERIDS
export async function getBackendCanister() {
    return await getCanister(BACKEND_CANISTER, backendIDL);
}

async function getCanister(canisterId, idl) {
    const authClient = window.auth.client;
    const agent = new HttpAgent({
        host: HOST,
        identity: authClient.getIdentity()
    });
    await agent.fetchRootKey(); // this line is needed for the local env only
    return Actor.createActor(idl, {
        agent,
        canisterId,
    });
}