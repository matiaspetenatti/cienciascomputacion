import type { Metadata } from "next";

import { Section } from "@/components/layout/section";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Cómo escribir para corregir un error, sugerir una clase o proponer un recurso.",
};

const EMAIL = "contacto@opencomputerscience.dev";

export default function ContactPage() {
  return (
    <>
      <Container className="pt-14 pb-12 md:pt-20">
        <PageHeader
          eyebrow="Contacto"
          title="Un solo buzón, leído por una persona."
          description="No hay formulario ni ticket. Si encontraste un error, querés proponer una clase o tenés una duda sobre el contenido, escribí un mail."
        >
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center justify-center rounded-pill border border-cream/70 px-6 py-[15px] text-body-sm font-semibold text-cream transition-colors duration-150 hover:border-cream"
          >
            {EMAIL}
          </a>
        </PageHeader>
      </Container>

      <Section
        eyebrow="Antes de escribir"
        title="Tres cosas que ayudan a responder mejor."
      >
        <ul className="grid gap-8 md:grid-cols-3">
          <li>
            <h3 className="text-body-lg text-cream">El enlace exacto</h3>
            <p className="mt-3 text-body-sm text-cream/70">
              Si el problema está en una clase, pegá la URL. Con la materia y la
              unidad alcanza para encontrarla.
            </p>
          </li>
          <li>
            <h3 className="text-body-lg text-cream">Qué esperabas</h3>
            <p className="mt-3 text-body-sm text-cream/70">
              Describí qué buscabas y qué encontraste. La diferencia entre las
              dos cosas es el bug.
            </p>
          </li>
          <li>
            <h3 className="text-body-lg text-cream">La fuente</h3>
            <p className="mt-3 text-body-sm text-cream/70">
              Si la corrección viene de un libro o una documentación, mandá el
              enlace. Hace que el cambio sea más rápido de revisar.
            </p>
          </li>
        </ul>
      </Section>

      <Section eyebrow="Alcance" title="Lo que este sitio no hace.">
        <p className="max-w-3xl text-body text-cream/70">
          No se emiten certificados, no se corrigen trabajos prácticos y no hay
          soporte académico oficial. Es un material de estudio abierto, no una
          institución educativa.
        </p>
      </Section>
    </>
  );
}
