import Link from "next/link";

import { Container } from "@/components/ui/container";

const columns = [
  {
    title: "La carrera",
    links: [
      { href: "/plan", label: "Plan de estudios" },
      { href: "/sobre", label: "Sobre la carrera" },
      { href: "/recursos", label: "Recursos" },
    ],
  },
  {
    title: "El sitio",
    links: [
      { href: "/contacto", label: "Contacto" },
      { href: "/plan", label: "Empezar a leer" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-panel">
      <Container className="grid gap-10 py-16 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <p className="flex items-center gap-2 text-body-sm font-semibold text-cream">
            <span aria-hidden="true" className="size-2 rounded-full bg-brand" />
            OpenComputerScience
          </p>
          <p className="mt-4 text-body-sm text-muted">
            La carrera de Ciencias de la Computación, clase por clase. Abierta,
            gratuita y sin inscripción.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-caption text-muted">{column.title}</p>
            <ul className="mt-4 flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.label + link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-cream/80 transition-colors duration-150 hover:text-cream"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-hairline">
        <Container className="flex flex-col gap-2 py-6 text-caption text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Contenido abierto. Se puede leer, copiar y compartir.</p>
          <p>Hecho en Argentina.</p>
        </Container>
      </div>
    </footer>
  );
}
