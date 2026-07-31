import LoginForm from './LoginForm';

export const metadata = {
  title: 'Admin Login - MUSKOM',
  description: 'Authentication portal for MUSKOM Administrators',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">MUSKOM</h1>
          <p className="text-slate-500 mt-2">Musyawarah KOMITKABE</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
