import RegisterForm from "@/app/components/RegisterForms";

export default function RegisterPage() {
    return (
        <main className="min-h-screen flex items-center justify-center">

            <div className="w-full max-w-md">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold">
                        Crear cuenta
                    </h1>

                    <p className="mt-2">
                        Regístrate para comenzar.
                    </p>
                </div>

                <RegisterForm />

            </div>

        </main>
    );
}