import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[70vh] flex-col justify-center pt-16">
      <div className="eyebrow mb-4">404</div>
      <h1 className="text-[clamp(2.4rem,6vw,4.5rem)] font-medium tracking-[-0.04em]">Page not found.</h1>
      <p className="mt-4 text-muted">The page you’re looking for doesn’t exist or has moved.</p>
      <Link href="/" className="btn-ghost mt-8 self-start">
        Back to portfolio
      </Link>
    </section>
  );
}
