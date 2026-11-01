import Link from "next/link";

import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <Container className="flex flex-1 flex-col justify-center py-24">
      <p className="text-body-sm text-muted">{"{ 404 }"}</p>
      <h1 className="mt-6 text-heading-sm text-cream md:text-heading">
        Esta página no existe.
      </h1>
      <p className="mt-4 max-w-xl text-body-lg text-cream/70">
        Puede que el enlace esté mal escrito o que la clase todavía no esté
        publicada. El plan sigue estando donde siempre.
      </p>
      <div className="mt-8">
        <Link
          href="/plan"
          className="inline-flex items-center justify-center rounded-pill border border-cream/70 px-6 py-[15px] text-body-sm font-semibold text-cream transition-colors duration-150 hover:border-cream"
        >
          Ir al plan de estudios
        </Link>
      </div>
    </Container>
  );
}
