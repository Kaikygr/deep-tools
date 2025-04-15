import { deepGet, deepFindByKey, deepFindByValue } from "../deep-tools";
import { isEqual } from "lodash"; // Usando lodash isEqual para comparações profundas nos testes

/**
 * Objeto de teste principal contendo diferentes tipos de dados e estruturas aninhadas
 * para validar as funções de manipulação profunda de objetos.
 *
 * @example
 * {
 *   a: 1,
 *   b: { c: "hello", ... },
 *   ...
 * }
 */
const testObj = {
  a: 1,
  b: {
    c: "hello",
    d: [
      { e: 3, f: true, nested: { g: "deep" } }, // Objeto profundamente aninhado
      { e: 4, f: false }, // Objeto com valores diferentes
      null, // Elemento nulo para testar tratamento de nulos
      { e: 3, f: true }, // Objeto duplicado para testar busca de valores
    ],
    h: null,
  },
  i: undefined, // Propriedade explicitamente indefinida
  "key with.dot": "dot-value", // Chave com caracteres especiais (ponto)
  "key with[bracket]": "bracket-value", // Chave com caracteres especiais (colchetes)
  j: [10, 20, 30], // Array simples
  k: 3, // Valor duplicado em nível diferente
};

/**
 * Objetos de teste para casos especiais
 *
 * @remarks
 * Utilizados para testar comportamentos com tipos primitivos,
 * valores nulos, indefinidos e estruturas vazias
 */
const primitiveObj = 123; // Valor primitivo para testar tratamento de não-objetos
const nullObj = null; // Valor nulo para testar validações
const undefinedObj = undefined; // Valor indefinido para testar validações
const emptyObj = {}; // Objeto vazio para testar casos limite
const emptyArr: unknown[] = []; // Array vazio para testar casos limite

// Objeto com referência circular para testes específicos
const circularObj: any = { prop: "value", arr: [1] };
circularObj.self = circularObj;
circularObj.arr.push(circularObj);

// --- Suítes de Teste ---

describe("deepGet", () => {
  it("deve obter propriedades de nível superior", () => {
    expect(deepGet(testObj, "a")).toBe(1);
    expect(deepGet(testObj, ["i"])).toBeUndefined(); // Explicitamente indefinido
    expect(deepGet(testObj, "k")).toBe(3);
  });

  it("deve obter propriedades aninhadas usando notação de ponto", () => {
    expect(deepGet(testObj, "b.c")).toBe("hello");
    expect(deepGet(testObj, "b.d[0].e")).toBe(3);
    expect(deepGet(testObj, "b.d[1].f")).toBe(false);
    expect(deepGet(testObj, "b.d[0].nested.g")).toBe("deep");
  });

  it("deve obter propriedades aninhadas usando notação de array", () => {
    expect(deepGet(testObj, ["b", "c"])).toBe("hello");
    expect(deepGet(testObj, ["b", "d", 0, "e"])).toBe(3);
    expect(deepGet(testObj, ["b", "d", 1, "f"])).toBe(false);
    expect(deepGet(testObj, ["b", "d", "0", "nested", "g"])).toBe("deep"); // Índice de string
  });

  it("deve lidar com chaves com caracteres especiais se usar notação de array", () => {
    expect(deepGet(testObj, ["key with.dot"])).toBe("dot-value");
    expect(deepGet(testObj, ["key with[bracket]"])).toBe("bracket-value");
  });

  it("deve lidar com notação de caminho lodash para arrays", () => {
    expect(deepGet(testObj, "b.d.0.e")).toBe(3); // Lodash permite isso
    expect(deepGet(testObj, "j.1")).toBe(20);
  });

  it("deve retornar indefinido para caminhos inexistentes", () => {
    expect(deepGet(testObj, "x")).toBeUndefined();
    expect(deepGet(testObj, "a.x")).toBeUndefined();
    expect(deepGet(testObj, "b.d[5]")).toBeUndefined();
    expect(deepGet(testObj, "b.d[0].nonexistent")).toBeUndefined();
    expect(deepGet(testObj, ["b", "d", 0, "nonexistent"])).toBeUndefined();
  });

  it("deve retornar defaultValue para caminhos inexistentes quando fornecido", () => {
    const defaultVal = "default";
    expect(deepGet(testObj, "x", defaultVal)).toBe(defaultVal);
    expect(deepGet(testObj, "a.x", defaultVal)).toBe(defaultVal);
    expect(deepGet(testObj, "b.d[5]", defaultVal)).toBe(defaultVal);
    expect(deepGet(testObj, ["b", "d", 0, "nonexistent"], defaultVal)).toBe(
      defaultVal
    );
  });

  it("deve retornar defaultValue se o valor resolvido for indefinido", () => {
    const defaultVal = "default";
    expect(deepGet(testObj, "i", defaultVal)).toBe(defaultVal); // Caminho 'i' existe, mas o valor é indefinido
  });

  it("deve retornar defaultValue para objetos nulos ou indefinidos", () => {
    const defaultVal = "default";
    expect(deepGet(nullObj, "a.b", defaultVal)).toBe(defaultVal);
    expect(deepGet(undefinedObj, "a.b", defaultVal)).toBe(defaultVal);
    expect(deepGet(nullObj, "a.b")).toBeUndefined();
    expect(deepGet(undefinedObj, "a.b")).toBeUndefined();
  });

  it("deve retornar defaultValue para objetos primitivos", () => {
    const defaultVal = "default";
    expect(deepGet(primitiveObj, "a.b", defaultVal)).toBe(defaultVal);
    expect(deepGet(primitiveObj, "a.b")).toBeUndefined();
  });

  it("deve retornar defaultValue se o caminho for nulo ou indefinido", () => {
    const defaultVal = "default";
    expect(deepGet(testObj, null, defaultVal)).toBe(defaultVal);
    expect(deepGet(testObj, undefined, defaultVal)).toBe(defaultVal);
    expect(deepGet(testObj, null)).toBeUndefined();
    expect(deepGet(testObj, undefined)).toBeUndefined();
  });

  it("deve lidar com caminhos que resolvem para nulo", () => {
    expect(deepGet(testObj, "b.h")).toBeNull();
    expect(deepGet(testObj, "b.d[2]")).toBeNull();
  });

  it("deve inferir o tipo de retorno a partir de defaultValue", () => {
    const numDefault = 123;
    const strDefault = "abc";
    const objDefault = { x: 1 };

    const numResult: number | undefined = deepGet(
      testObj,
      "nonexistent",
      numDefault
    );
    const strResult: string | undefined = deepGet(
      testObj,
      "nonexistent",
      strDefault
    );
    const objResult: { x: number } | undefined = deepGet(
      testObj,
      "nonexistent",
      objDefault
    );

    expect(numResult).toBe(numDefault);
    expect(strResult).toBe(strDefault);
    expect(objResult).toEqual(objDefault);

    // Sem default, deve ser unknown | undefined
    const unknownResult: unknown | undefined = deepGet(testObj, "a");
    expect(unknownResult).toBe(1);
  });
});

// === Suíte de Testes deepFindByKey ===

describe("deepFindByKey", () => {
  it("deve encontrar o valor da primeira chave encontrada (BFS)", () => {
    // 'e' existe em b.d[0] e b.d[3] - deve encontrar primeiro em b.d[0]
    expect(deepFindByKey(testObj, "e")).toBe(3);
    expect(deepFindByKey(testObj, "f")).toBe(true); // Encontra em b.d[0] antes de b.d[1]
    expect(deepFindByKey(testObj, "a")).toBe(1);
    expect(deepFindByKey(testObj, "c")).toBe("hello");
    expect(deepFindByKey(testObj, "g")).toBe("deep");
    expect(deepFindByKey(testObj, "h")).toBeNull();
    expect(deepFindByKey(testObj, "i")).toBeUndefined(); // Encontra a chave 'i' cujo valor é indefinido
  });

  it("deve retornar indefinido se a chave não for encontrada", () => {
    expect(deepFindByKey(testObj, "nonexistent")).toBeUndefined();
    expect(deepFindByKey(testObj, "z")).toBeUndefined();
  });

  it("deve retornar indefinido para entradas nulas, indefinidas ou primitivas", () => {
    expect(deepFindByKey(nullObj, "a")).toBeUndefined();
    expect(deepFindByKey(undefinedObj, "a")).toBeUndefined();
    expect(deepFindByKey(primitiveObj, "a")).toBeUndefined();
  });

  it("deve retornar indefinido para objetos ou arrays vazios", () => {
    expect(deepFindByKey(emptyObj, "a")).toBeUndefined();
    expect(deepFindByKey(emptyArr, "a")).toBeUndefined();
  });

  it("deve lançar TypeError para targetKey inválido", () => {
    expect(() => deepFindByKey(testObj, "")).toThrow(TypeError);
    expect(() => deepFindByKey(testObj, "   ")).toThrow(TypeError);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => deepFindByKey(testObj, null as any)).toThrow(TypeError);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => deepFindByKey(testObj, 123 as any)).toThrow(TypeError);
  });

  it("deve lidar com referências circulares", () => {
    expect(deepFindByKey(circularObj, "prop")).toBe("value");
    expect(deepFindByKey(circularObj, "self")).toBe(circularObj); // Encontra a chave 'self'
    expect(deepFindByKey(circularObj, "arr")).toEqual([1, circularObj]); // Encontra a chave 'arr'
    expect(deepFindByKey(circularObj, "nonexistent")).toBeUndefined();
  });
});

// === Suíte de Testes deepFindByValue ===

describe("deepFindByValue", () => {
  it("deve encontrar caminhos para valores primitivos usando comparação === padrão", () => {
    expect(deepFindByValue(testObj, 1)).toEqual(["a"]);
    expect(deepFindByValue(testObj, "hello")).toEqual(["b.c"]);
    expect(deepFindByValue(testObj, false)).toEqual(["b.d[1].f"]);
    expect(deepFindByValue(testObj, "deep")).toEqual(["b.d[0].nested.g"]);
    expect(deepFindByValue(testObj, 20)).toEqual(["j[1]"]);
  });

  it("deve encontrar múltiplos caminhos para o mesmo valor", () => {
    const pathsFor3 = deepFindByValue(testObj, 3);
    expect(pathsFor3).toHaveLength(3);
    expect(pathsFor3).toEqual(
      expect.arrayContaining(["b.d[0].e", "b.d[3].e", "k"])
    );

    const pathsForTrue = deepFindByValue(testObj, true);
    expect(pathsForTrue).toHaveLength(2);
    expect(pathsForTrue).toEqual(
      expect.arrayContaining(["b.d[0].f", "b.d[3].f"])
    );
  });

  it("deve encontrar caminhos para valores nulos e indefinidos", () => {
    expect(deepFindByValue(testObj, null)).toEqual(
      expect.arrayContaining(["b.h", "b.d[2]"])
    );
    expect(deepFindByValue(testObj, undefined)).toEqual(["i"]);
  });

  it("deve retornar um array vazio se o valor não for encontrado", () => {
    expect(deepFindByValue(testObj, 999)).toEqual([]);
    expect(deepFindByValue(testObj, "not here")).toEqual([]);
  });

  it("deve retornar um array vazio para entradas nulas, indefinidas ou primitivas", () => {
    expect(deepFindByValue(nullObj, "a")).toEqual([]);
    expect(deepFindByValue(undefinedObj, "a")).toEqual([]);
    expect(deepFindByValue(primitiveObj, 123)).toEqual([]); // Não pode buscar em primitivos
  });

  it("deve retornar um array vazio para objetos ou arrays vazios", () => {
    expect(deepFindByValue(emptyObj, "a")).toEqual([]);
    expect(deepFindByValue(emptyArr, "a")).toEqual([]);
  });

  it("deve usar compareFn personalizada", () => {
    // Busca sem considerar maiúsculas/minúsculas
    const compareIgnoreCase = (a: unknown, b: unknown) =>
      typeof a === "string" &&
      typeof b === "string" &&
      a.toLowerCase() === b.toLowerCase();
    expect(deepFindByValue(testObj, "HELLO", compareIgnoreCase)).toEqual([
      "b.c",
    ]);
    expect(deepFindByValue(testObj, "Deep", compareIgnoreCase)).toEqual([
      "b.d[0].nested.g",
    ]);

    // Encontrar objetos com valor específico de propriedade
    const compareByE = (a: unknown, b: unknown) =>
      typeof a === "object" && a !== null && (a as any).e === b;
    expect(deepFindByValue(testObj, 3, compareByE)).toEqual(
      expect.arrayContaining(["b.d[0]", "b.d[3]"])
    );

    // Igualdade profunda para objetos (usando lodash isEqual)
    const targetObj = { e: 3, f: true, nested: { g: "deep" } };
    expect(deepFindByValue(testObj, targetObj, isEqual)).toEqual(["b.d[0]"]);
  });

  it("deve lançar TypeError se compareFn for fornecida, mas não for uma função", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => deepFindByValue(testObj, 1, null as any)).toThrow(TypeError);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => deepFindByValue(testObj, 1, {} as any)).toThrow(TypeError);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => deepFindByValue(testObj, 1, 123 as any)).toThrow(TypeError);
  });

  it("deve lidar com referências circulares", () => {
    const pathsForValue = deepFindByValue(circularObj, "value");
    expect(pathsForValue).toEqual(["prop"]);

    const pathsFor1 = deepFindByValue(circularObj, 1);
    expect(pathsFor1).toEqual(["arr[0]"]);

    // Buscando o próprio objeto circular
    const pathsForSelf = deepFindByValue(circularObj, circularObj);
    expect(pathsForSelf).toHaveLength(2);
    expect(pathsForSelf).toEqual(expect.arrayContaining(["self", "arr[1]"]));
  });

  it("deve gerar notação de caminho correta (ponto vs colchete)", () => {
    const complexPaths = deepFindByValue(testObj, 3);
    expect(complexPaths).toEqual(
      expect.arrayContaining([
        "b.d[0].e", // Aninhado em objeto dentro de array
        "b.d[3].e", // Aninhado em objeto dentro de array
        "k", // Nível superior
      ])
    );
    expect(deepFindByValue(testObj, 20)).toEqual(["j[1]"]); // Valor direto do array
    expect(deepFindByValue(testObj, "deep")).toEqual(["b.d[0].nested.g"]); // Objeto profundamente aninhado
  });
  // Opcional: Teste do log de aviso se compareFn lançar erro (difícil de testar de forma confiável)
  // it('deve lidar com erros dentro de compareFn de forma segura', () => {
  //   const faultyCompare = (a: unknown, b: unknown) => {
  //     if (typeof a === 'object' && a !== null) {
  //       // @ts-ignore Erro intencional: acessando propriedade em um tipo possivelmente incorreto
  //       return a.nonExistent.prop === b;
  //     }
  //     return a === b;
  //   };
  //   const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  //   // Espera-se que não quebre e encontre valores antes do erro, se possível
  //   expect(() => deepFindByValue(testObj, 'someValue', faultyCompare)).not.toThrow();
  //   // Verifica se console.warn foi chamado (pode ser frágil)
  //   expect(consoleWarnSpy).toHaveBeenCalled();
  //   consoleWarnSpy.mockRestore();
  // });
});
