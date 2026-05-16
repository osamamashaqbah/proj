import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card text-center py-12">
      <div className="text-5xl">🎮</div>
      <h1 className="section-title mt-4">404</h1>
      <p className="muted mt-2">This page doesn't exist.</p>
      <Link href="/" className="btn-primary mt-6 inline-block">Home</Link>
    </div>
  );
}
