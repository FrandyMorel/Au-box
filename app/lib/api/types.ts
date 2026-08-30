export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    name: string;
    department: string;
    password: string;
}

export interface AuthResponse {
    id: number;
    name: string;
    email: string;
    department: string;
    token: string;
}