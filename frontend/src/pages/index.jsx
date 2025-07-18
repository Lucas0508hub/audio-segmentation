import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl mb-4">Welcome</h1>
      <Link href="/login"><a className="text-blue-600">Go to Login</a></Link>
    </div>
  );
}
