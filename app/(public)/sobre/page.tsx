import type { Metadata } from "next";

import { Section } from "@/components/layout/section";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Sobre la carrera",
  description:
    "Qué estudia Ciencias de la Computación, cómo está organizado el plan y por qué este sitio es abierto.",
};

export default function AboutPage() {
  return (
    <>
      <Container className="pt-14 pb-12 md:pt-20">
        <PageHeader
          eyebrow="Sobre la carrera"
          title="Ciencias de la Computación no es solo programar."
          description="Programar es una herramienta. La carrera estudia qué se puede computar, cómo hacerlo bien y qué consecuencias tiene hacerlo a escala."
        />
      </Container>

      <Section
        eyebrow="Qué se estudia"
        title="Cuatro preguntas que atraviesan toda la carrera."
      >
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="text-body-lg text-cream">¿Qué es computable?</h3>
            <p className="mt-3 text-body text-cream/70">
              La teoría de la computación pone límites: hay problemas que
              ninguna máquina puede resolver, por más tiempo y memoria que
              tenga. Saber cuáles son evita perseguir soluciones imposibles.
            </p>
          </div>
          <div>
            <h3 className="text-body-lg text-cream">
              ¿Cómo se organiza el software?
            </h3>
            <p className="mt-3 text-body text-cream/70">
              Algoritmos, estructuras de datos, arquitectura e ingeniería. Un
              programa que funciona hoy y no se puede mantener mañana no es una
              solución: es deuda.
            </p>
          </div>
          <div>
            <h3 className="text-body-lg text-cream">
              ¿Cómo funciona la máquina?
            </h3>
            <p className="mt-3 text-body text-cream/70">
              Del transistor al sistema operativo y de ahí a la red. Entender
              las capas de abajo explica por qué las de arriba fallan como
              fallan.
            </p>
          </div>
          <div>
            <h3 className="text-body-lg text-cream">
              ¿Qué se puede aprender de los datos?
            </h3>
            <p className="mt-3 text-body text-cream/70">
              Estadística, bases de datos y aprendizaje automático. Los datos no
              hablan solos: hay que hacerles las preguntas correctas y
              desconfiar de las respuestas fáciles.
            </p>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Cómo leer"
        title="El plan es una ruta, no una obligación."
      >
        <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <div className="text-body text-cream/70">
            <p>
              El sitio está organizado en cuatro niveles: plan, materia, unidad
              y clase. Cada clase es una lectura corta y autocontenida, con
              código, ejemplos y preguntas para verificar que se entendió.
            </p>
          </div>
          <div className="text-body text-cream/70">
            <p>
              Podés seguir el orden propuesto o entrar por el tema que te
              interese. Las materias de un mismo año se complementan, pero no
              hay correlatividades: si una clase menciona algo que no viste, el
              enlace a la materia está a un clic.
            </p>
            <p className="mt-4">
              No hay cuentas, entregas ni certificados. El objetivo es que leer
              la carrera sea tan simple como abrir una página.
            </p>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Por qué abierto"
        title="El conocimiento no debería tener puerta."
      >
        <p className="max-w-3xl text-body-lg text-cream/80">
          Este sitio existe porque encontrar un plan de estudios completo,
          ordenado y en español no debería depender de una inscripción. El
          contenido es gratuito, se puede compartir y se corrige cuando algo
          está mal.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/plan" variant="gradient">
            Abrir el plan
          </ButtonLink>
          <ButtonLink href="/contacto">Escribir</ButtonLink>
        </div>
      </Section>
    </>
  );
}
