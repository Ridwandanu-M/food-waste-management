import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="relative w-full max-w-sm">
        <LoginForm />
        <div className="absolute blur-3xl -top-32 -right-48 h-64 w-64 bg-emerald-200 rounded-full"></div>
        <div className="absolute blur-3xl -bottom-32 -left-48 h-64 w-64 bg-emerald-300/30 rounded-full"></div>
      </div>
    </div>
  );
}
