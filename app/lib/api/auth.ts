import { apiClient } from "./client";

import type {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
} from "./types";


export async function login(
    credentials: LoginRequest,
): Promise<AuthResponse> {

    return apiClient<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
    });
}


export async function register(
    credentials: RegisterRequest,
): Promise<AuthResponse> {

    return apiClient<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(credentials),
    });
}