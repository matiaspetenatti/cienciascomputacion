import Link from "next/link";

import { Container } from "@/components/ui/container";

const links = [
  { href: "/plan", label: "Plan de estudios", short: "Plan" },
  { href: "/recursos", label: "Recursos", short: "Recursos" },
  { href: "/sobre", label: "Sobre la carrera", short: "Sobre" },
  { href: "/contacto", label: "Contacto", short: "Contacto" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas">
      <Container className="flex flex-col gap-2 py-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-0">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-body-sm font-semibold tracking-[-0.01em] text-cream transition-opacity duration-150 hover:opacity-80"
        >
          <span aria-hidden="true" className="size-2 rounded-full bg-brand" />
          OpenComputerScience
        </Link>

        <nav
          aria-label="Principal"
          className="-mx-1 overflow-x-auto sm:mx-0 sm:overflow-visible"
        >
          <ul className="flex items-center gap-4 px-1 sm:gap-6">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-body-sm whitespace-nowrap text-cream/80 transition-colors duration-150 hover:text-cream"
                >
                  <span className="sm:hidden">{link.short}</span>
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </header>
  );
}
