import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted">The page you are looking for does not exist.</p>
      <Link href="/" className="btn btn-primary mt-6">
        Back to the directory
      </Link>
    </div>
  );
}
