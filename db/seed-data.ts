import type { JSONContent } from "@tiptap/core";

import type { SubjectArea } from "./schema";

/* ------------------------------------------------------------------ */
/* Constructores de contenido Tiptap                                   */
/* ------------------------------------------------------------------ */

const text = (value: string, ...marks: string[]): JSONContent => ({
  type: "text",
  text: value,
  ...(marks.length ? { marks: marks.map((type) => ({ type })) } : {}),
});

const p = (...children: JSONContent[]): JSONContent => ({
  type: "paragraph",
  content: children,
});

const h2 = (value: string): JSONContent => ({
  type: "heading",
  attrs: { level: 2 },
  content: [text(value)],
});

const h3 = (value: string): JSONContent => ({
  type: "heading",
  attrs: { level: 3 },
  content: [text(value)],
});

const ul = (...items: string[]): JSONContent => ({
  type: "bulletList",
  content: items.map((item) => ({
    type: "listItem",
    content: [p(text(item))],
  })),
});

const code = (language: string, value: string): JSONContent => ({
  type: "codeBlock",
  attrs: { language },
  content: [text(value)],
});

const quote = (value: string): JSONContent => ({
  type: "blockquote",
  content: [p(text(value))],
});

const doc = (...content: JSONContent[]): JSONContent => ({
  type: "doc",
  content,
});

/* ------------------------------------------------------------------ */
/* Tipos del seed                                                      */
/* ------------------------------------------------------------------ */

export type SeedLesson = {
  slug: string;
  title: string;
  excerpt: string;
  content: JSONContent;
};

export type SeedUnit = {
  slug: string;
  title: string;
  description?: string;
  lessons?: SeedLesson[];
};

export type SeedSubject = {
  slug: string;
  name: string;
  area: SubjectArea;
  year: number;
  credits: number;
  description: string;
  units: SeedUnit[];
};

/* ------------------------------------------------------------------ */
/* Clases                                                              */
/* ------------------------------------------------------------------ */

const queEsProgramar: SeedLesson = {
  slug: "que-es-programar",
  title: "Qué es programar",
  excerpt:
    "Un programa es una secuencia de instrucciones. El resto es aprender a escribirlas sin ambigüedad.",
  content: doc(
    p(
      text(
        "Programar es escribir instrucciones que una computadora pueda ejecutar. Nada más, y nada menos. La dificultad no está en el vocabulario: está en la precisión.",
      ),
    ),
    h2("Un programa es una receta"),
    p(
      text(
        "Una receta de cocina tiene pasos ordenados, cantidades y condiciones. Un programa también, pero no tolera la ambigüedad. Si la receta dice «sal a gusto», un humano se arregla; una computadora no.",
      ),
    ),
    ul(
      "Entrada: los datos que recibe.",
      "Proceso: las operaciones que hace con esos datos.",
      "Salida: el resultado que devuelve.",
    ),
    h2("Tu primer programa"),
    p(text("En Python, el programa más chico que hace algo visible es este:")),
    code("python", 'print("Hola, mundo")'),
    p(
      text(
        "Imprime un texto en la pantalla y termina. Ejecutalo, cambiá el texto, rompelo a propósito. La mejor forma de entender qué hace una línea es ver qué pasa cuando la sacás.",
      ),
    ),
    quote(
      "Si el programa no hace lo que esperabas, leé el error. El error no es un castigo: es información.",
    ),
  ),
};

const variablesYTipos: SeedLesson = {
  slug: "variables-y-tipos",
  title: "Variables y tipos",
  excerpt:
    "Un nombre para un dato, y un tipo que define qué se puede hacer con él.",
  content: doc(
    p(
      text(
        "Una variable es un nombre que apunta a un valor. Sirve para no repetir datos y para que el programa se lea como una idea y no como una lista de números sueltos.",
      ),
    ),
    h2("Darle nombre a los datos"),
    code(
      "python",
      'edad = 19\nnombre = "Ana"\naprobado = True\n\nprint(nombre, "tiene", edad, "años")',
    ),
    p(
      text(
        "Cada valor tiene un tipo. En Python no lo declarás: lo deduce del valor que asignás.",
      ),
    ),
    h2("Los tipos importan"),
    ul(
      "int: números enteros, como 19.",
      "float: números con decimales, como 19.5.",
      'str: texto, como "Ana".',
      "bool: verdadero o falso.",
    ),
    p(
      text(
        "El tipo define qué operaciones tienen sentido. Sumar dos números funciona; sumar un número y un texto, no:",
      ),
    ),
    code("python", 'edad = "19"\nprint(edad + 1)  # TypeError'),
    p(
      text(
        "El error no dice que el programa esté mal escrito: dice que la operación no existe para esos tipos. Convertir es explícito:",
      ),
    ),
    code("python", 'edad = "19"\nprint(int(edad) + 1)  # 20'),
  ),
};

const condicionales: SeedLesson = {
  slug: "condicionales",
  title: "Condicionales",
  excerpt:
    "La primera herramienta para que un programa haga cosas distintas según la situación.",
  content: doc(
    p(
      text(
        "Hasta acá el programa hace siempre lo mismo, en el mismo orden. Un condicional permite elegir un camino según una condición.",
      ),
    ),
    h2("Tomar decisiones"),
    code(
      "python",
      'nota = 7\n\nif nota >= 6:\n    print("Aprobado")\nelse:\n    print("A recuperar")',
    ),
    p(
      text(
        "La condición se evalúa una vez. Si es verdadera se ejecuta el bloque del if; si no, el del else. La indentación no es decorativa: define qué líneas pertenecen a cada bloque.",
      ),
    ),
    h3("Comparar no es asignar"),
    p(
      text(
        "Un error clásico es confundir = con ==. El primero guarda un valor; el segundo pregunta si dos valores son iguales.",
      ),
    ),
    code(
      "python",
      "edad = 18        # asigna\nedad == 18       # compara, devuelve True",
    ),
    p(
      text(
        "Los condicionales se pueden encadenar con elif cuando hay más de dos casos posibles.",
      ),
    ),
    code(
      "python",
      'if nota >= 8:\n    print("Promocionado")\nelif nota >= 6:\n    print("Aprobado")\nelse:\n    print("A recuperar")',
    ),
  ),
};

const complejidadTemporal: SeedLesson = {
  slug: "complejidad-temporal",
  title: "Complejidad temporal",
  excerpt:
    "Cómo comparar dos algoritmos sin cronometrarlos, contando cómo crece el trabajo con el tamaño de la entrada.",
  content: doc(
    p(
      text(
        "Dos algoritmos que resuelven lo mismo pueden tardar muy distinto cuando la entrada crece. La complejidad temporal describe ese crecimiento, no los segundos.",
      ),
    ),
    h2("Contar operaciones"),
    p(
      text(
        "Mirá estos dos fragmentos. El primero recorre la lista una vez; el segundo, una vez por cada elemento.",
      ),
    ),
    code(
      "python",
      "def hay_duplicados(lista):\n    vistos = set()\n    for x in lista:\n        if x in vistos:\n            return True\n        vistos.add(x)\n    return False",
    ),
    code(
      "python",
      "def hay_duplicados_lento(lista):\n    for i in range(len(lista)):\n        for j in range(i + 1, len(lista)):\n            if lista[i] == lista[j]:\n                return True\n    return False",
    ),
    p(
      text(
        "El primero hace una cantidad de trabajo proporcional a n. El segundo, proporcional a n². Con 10 elementos la diferencia es chica; con un millón, es la diferencia entre un segundo y once días.",
      ),
    ),
    ul(
      "O(1): el trabajo no depende de la entrada.",
      "O(n): crece en proporción directa.",
      "O(n²): crece con el cuadrado.",
      "O(log n): cada paso descarta una fracción del problema.",
    ),
    quote(
      "La notación O grande ignora constantes y términos menores porque, cuando n crece, son ellos los que dejan de importar.",
    ),
  ),
};

const estructurasLineales: SeedLesson = {
  slug: "estructuras-lineales",
  title: "Estructuras lineales",
  excerpt:
    "Pilas y colas: dos formas de ordenar el acceso a los datos que aparecen en todos lados.",
  content: doc(
    p(
      text(
        "Una estructura de datos es una forma de organizar la información para que ciertas operaciones sean baratas. Las lineales mantienen un orden entre los elementos.",
      ),
    ),
    h2("Pilas y colas"),
    ul(
      "Pila (stack): el último que entra es el primero que sale. Como una pila de platos.",
      "Cola (queue): el primero que entra es el primero que sale. Como la fila del banco.",
    ),
    p(
      text(
        "Las pilas aparecen en el deshacer de un editor y en la pila de llamadas. Las colas, en los schedulers y en el procesamiento de eventos.",
      ),
    ),
    code(
      "python",
      'pila = []\npila.append("a")\npila.append("b")\nprint(pila.pop())  # b\n\nfrom collections import deque\ncola = deque(["a", "b"])\nprint(cola.popleft())  # a',
    ),
    p(
      text(
        "Con una lista, agregar y sacar del final es O(1). Sacar del principio es O(n), porque hay que correr todo. Por eso la cola usa deque.",
      ),
    ),
  ),
};

const automatasFinitos: SeedLesson = {
  slug: "automatas-finitos",
  title: "Autómatas finitos",
  excerpt:
    "El modelo más simple de cómputo: un conjunto finito de estados y reglas para pasar de uno a otro.",
  content: doc(
    p(
      text(
        "Un autómata finito lee una cadena símbolo por símbolo y cambia de estado. No tiene memoria más allá del estado en el que está, y aun así reconoce una familia enorme de lenguajes.",
      ),
    ),
    h2("Máquinas de estados"),
    ul(
      "Un conjunto finito de estados.",
      "Un estado inicial.",
      "Uno o más estados de aceptación.",
      "Una función de transición: dado un estado y un símbolo, a qué estado va.",
    ),
    p(
      text(
        "El autómata acepta la cadena si, después de leerla entera, termina en un estado de aceptación.",
      ),
    ),
    code(
      "text",
      "Estados: q0, q1\nInicial: q0\nAceptación: q1\n\nq0 --a--> q1\nq1 --a--> q0",
    ),
    p(
      text(
        "Este autómata acepta las cadenas con una cantidad impar de letras a. Es la definición de paridad más chica que existe.",
      ),
    ),
    quote(
      "Los autómatas finitos son el escalón más bajo de la jerarquía de Chomsky. Todo lo que sigue agrega memoria.",
    ),
  ),
};

/* ------------------------------------------------------------------ */
/* Plan de estudios provisorio                                         */
/* ------------------------------------------------------------------ */

export const seedSubjects: SeedSubject[] = [
  {
    slug: "introduccion-a-la-programacion",
    name: "Introducción a la Programación",
    area: "software",
    year: 1,
    credits: 8,
    description:
      "El primer contacto con el código: resolver problemas chicos con un lenguaje de programación.",
    units: [
      {
        slug: "primeros-pasos",
        title: "Primeros pasos",
        description: "Qué es un programa y cómo se ejecuta.",
        lessons: [queEsProgramar, variablesYTipos, condicionales],
      },
      {
        slug: "repeticion-y-funciones",
        title: "Repetición y funciones",
        description: "Bucles, funciones y descomposición de problemas.",
      },
    ],
  },
  {
    slug: "algebra-y-geometria-analitica",
    name: "Álgebra y Geometría Analítica",
    area: "teoria",
    year: 1,
    credits: 8,
    description:
      "Matrices, sistemas de ecuaciones y geometría del plano y del espacio.",
    units: [
      { slug: "matrices-y-sistemas", title: "Matrices y sistemas" },
      { slug: "espacios-vectoriales", title: "Espacios vectoriales" },
    ],
  },
  {
    slug: "analisis-matematico-i",
    name: "Análisis Matemático I",
    area: "teoria",
    year: 1,
    credits: 8,
    description:
      "Límites, continuidad y derivadas, con aplicación a problemas de optimización.",
    units: [
      { slug: "limites-y-continuidad", title: "Límites y continuidad" },
      { slug: "derivadas", title: "Derivadas" },
    ],
  },
  {
    slug: "logica-y-estructuras-discretas",
    name: "Lógica y Estructuras Discretas",
    area: "teoria",
    year: 1,
    credits: 8,
    description:
      "Lógica proposicional, conjuntos, relaciones, inducción y combinatoria.",
    units: [
      { slug: "logica-proposicional", title: "Lógica proposicional" },
      { slug: "conjuntos-y-relaciones", title: "Conjuntos y relaciones" },
    ],
  },
  {
    slug: "introduccion-a-las-ciencias-de-la-computacion",
    name: "Introducción a las Ciencias de la Computación",
    area: "software",
    year: 1,
    credits: 6,
    description:
      "Qué estudia la disciplina, de dónde viene y qué problemas resuelve.",
    units: [
      { slug: "que-es-una-computadora", title: "Qué es una computadora" },
      { slug: "historia-y-alcance", title: "Historia y alcance" },
    ],
  },
  {
    slug: "programacion-orientada-a-objetos",
    name: "Programación Orientada a Objetos",
    area: "software",
    year: 2,
    credits: 8,
    description:
      "Modelar software con objetos, clases, interfaces y composición.",
    units: [
      { slug: "objetos-y-clases", title: "Objetos y clases" },
      { slug: "herencia-y-composicion", title: "Herencia y composición" },
    ],
  },
  {
    slug: "estructuras-de-datos-y-algoritmos",
    name: "Estructuras de Datos y Algoritmos",
    area: "software",
    year: 2,
    credits: 10,
    description: "Cómo organizar datos y medir el costo de las operaciones.",
    units: [
      {
        slug: "complejidad-y-analisis",
        title: "Complejidad y análisis",
        description: "Cómo comparar algoritmos antes de implementarlos.",
        lessons: [complejidadTemporal, estructurasLineales],
      },
      { slug: "arboles-y-grafos", title: "Árboles y grafos" },
      { slug: "ordenamiento-y-busqueda", title: "Ordenamiento y búsqueda" },
    ],
  },
  {
    slug: "analisis-matematico-ii",
    name: "Análisis Matemático II",
    area: "teoria",
    year: 2,
    credits: 8,
    description:
      "Integrales, sucesiones y series, con aplicaciones al cálculo numérico.",
    units: [
      { slug: "integrales", title: "Integrales" },
      { slug: "sucesiones-y-series", title: "Sucesiones y series" },
    ],
  },
  {
    slug: "arquitectura-de-computadoras",
    name: "Arquitectura de Computadoras",
    area: "sistemas",
    year: 2,
    credits: 8,
    description:
      "Cómo una máquina ejecuta instrucciones: representación, CPU, memoria y periféricos.",
    units: [
      { slug: "representacion-de-datos", title: "Representación de datos" },
      { slug: "cpu-y-memoria", title: "CPU y memoria" },
    ],
  },
  {
    slug: "probabilidad-y-estadistica",
    name: "Probabilidad y Estadística",
    area: "datos",
    year: 2,
    credits: 8,
    description:
      "Modelos aleatorios y herramientas para describir e inferir a partir de datos.",
    units: [
      { slug: "probabilidad-discreta", title: "Probabilidad discreta" },
      { slug: "inferencia", title: "Inferencia" },
    ],
  },
  {
    slug: "sistemas-operativos",
    name: "Sistemas Operativos",
    area: "sistemas",
    year: 3,
    credits: 10,
    description:
      "Procesos, scheduling, memoria virtual y sistemas de archivos.",
    units: [
      { slug: "procesos", title: "Procesos" },
      { slug: "memoria-y-archivos", title: "Memoria y archivos" },
    ],
  },
  {
    slug: "bases-de-datos",
    name: "Bases de Datos",
    area: "datos",
    year: 3,
    credits: 8,
    description: "Modelo relacional, SQL, normalización y transacciones.",
    units: [
      { slug: "modelo-relacional", title: "Modelo relacional" },
      { slug: "sql-y-transacciones", title: "SQL y transacciones" },
    ],
  },
  {
    slug: "redes-de-computadoras",
    name: "Redes de Computadoras",
    area: "sistemas",
    year: 3,
    credits: 8,
    description:
      "Cómo viajan los datos: capas, protocolos y arquitecturas de red.",
    units: [
      { slug: "capas-y-protocolos", title: "Capas y protocolos" },
      { slug: "tcp-ip", title: "TCP/IP" },
    ],
  },
  {
    slug: "teoria-de-la-computacion",
    name: "Teoría de la Computación",
    area: "teoria",
    year: 3,
    credits: 8,
    description:
      "Autómatas, gramáticas y los límites de lo que se puede computar.",
    units: [
      {
        slug: "automatas",
        title: "Autómatas",
        description: "Modelos formales de cómputo.",
        lessons: [automatasFinitos],
      },
      { slug: "computabilidad", title: "Computabilidad" },
    ],
  },
  {
    slug: "ingenieria-de-software-i",
    name: "Ingeniería de Software I",
    area: "software",
    year: 3,
    credits: 8,
    description: "Del pedido del cliente al diseño: requerimientos y modelado.",
    units: [
      { slug: "requerimientos", title: "Requerimientos" },
      { slug: "diseno", title: "Diseño" },
    ],
  },
  {
    slug: "compiladores",
    name: "Compiladores",
    area: "software",
    year: 4,
    credits: 8,
    description:
      "Cómo se traduce un lenguaje de alto nivel a instrucciones de máquina.",
    units: [
      {
        slug: "analisis-lexico-y-sintactico",
        title: "Análisis léxico y sintáctico",
      },
      { slug: "generacion-de-codigo", title: "Generación de código" },
    ],
  },
  {
    slug: "inteligencia-artificial",
    name: "Inteligencia Artificial",
    area: "datos",
    year: 4,
    credits: 8,
    description: "Búsqueda, representación del conocimiento y agentes.",
    units: [
      { slug: "busqueda", title: "Búsqueda" },
      {
        slug: "representacion-del-conocimiento",
        title: "Representación del conocimiento",
      },
    ],
  },
  {
    slug: "sistemas-distribuidos",
    name: "Sistemas Distribuidos",
    area: "sistemas",
    year: 4,
    credits: 8,
    description: "Varios procesos coordinándose sobre una red que falla.",
    units: [
      { slug: "consistencia", title: "Consistencia" },
      { slug: "tolerancia-a-fallas", title: "Tolerancia a fallas" },
    ],
  },
  {
    slug: "ingenieria-de-software-ii",
    name: "Ingeniería de Software II",
    area: "software",
    year: 4,
    credits: 8,
    description: "Arquitectura, testing y mantenimiento de sistemas grandes.",
    units: [
      { slug: "arquitectura-de-software", title: "Arquitectura de software" },
      { slug: "calidad", title: "Calidad" },
    ],
  },
  {
    slug: "seguridad-informatica",
    name: "Seguridad Informática",
    area: "sistemas",
    year: 4,
    credits: 8,
    description:
      "Criptografía aplicada, modelos de amenaza y vulnerabilidades comunes.",
    units: [
      { slug: "criptografia", title: "Criptografía" },
      { slug: "vulnerabilidades", title: "Vulnerabilidades" },
    ],
  },
  {
    slug: "aprendizaje-automatico",
    name: "Aprendizaje Automático",
    area: "datos",
    year: 5,
    credits: 8,
    description: "Modelos que aprenden de datos, y cómo saber si funcionan.",
    units: [
      { slug: "aprendizaje-supervisado", title: "Aprendizaje supervisado" },
      { slug: "evaluacion-de-modelos", title: "Evaluación de modelos" },
    ],
  },
  {
    slug: "proyecto-final-de-carrera",
    name: "Proyecto Final de Carrera",
    area: "software",
    year: 5,
    credits: 12,
    description: "Un sistema completo, desde la idea hasta la defensa.",
    units: [
      { slug: "definicion", title: "Definición" },
      { slug: "desarrollo-y-defensa", title: "Desarrollo y defensa" },
    ],
  },
  {
    slug: "etica-y-legislacion-informatica",
    name: "Ética y Legislación Informática",
    area: "electivas",
    year: 5,
    credits: 6,
    description:
      "El impacto social de la tecnología y el marco legal del ejercicio profesional.",
    units: [
      { slug: "impacto-social", title: "Impacto social" },
      { slug: "marco-legal", title: "Marco legal" },
    ],
  },
  {
    slug: "optativa-i",
    name: "Optativa I",
    area: "electivas",
    year: 5,
    credits: 6,
    description: "Seminario electivo de la orientación elegida.",
    units: [{ slug: "seminario", title: "Seminario" }],
  },
  {
    slug: "optativa-ii",
    name: "Optativa II",
    area: "electivas",
    year: 5,
    credits: 6,
    description: "Segundo seminario electivo.",
    units: [{ slug: "seminario", title: "Seminario" }],
  },
];
