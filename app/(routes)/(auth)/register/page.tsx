import Image from "next/image";
import RegisterForm from "@/app/components/RegisterForms";
import vuoLogo from "@/public/vuo.png";

export default function RegisterPage() {
    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md">
                {/* Logo and Title */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <Image
                        src={vuoLogo}
                        alt="VUO Partners Logo"
                        width={120}
                        height={50}
                        priority
                    />
                    <span className="text-2xl font-bold text-[#6B4071]">
                        x
                    </span>
                    <span className="text-xl font-bold text-[#171717]">
                        Au-box
                    </span>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-center">
                        Crear cuenta
                    </h1>

                    <p className="mt-2 text-center text-gray-600">
                        Regístrate para comenzar.
                    </p>
                </div>

                <RegisterForm />
            </div>
        </main>
    );
}