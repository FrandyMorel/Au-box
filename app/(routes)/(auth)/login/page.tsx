import LoginForm from "@/app/components/LoginForms";


export default function LoginPage() {
    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md">
                <h1 className="text-3xl font-bold mb-6">
                    Iniciar sesión
                </h1>

                <LoginForm />
            </div>
        </main>
    );
}