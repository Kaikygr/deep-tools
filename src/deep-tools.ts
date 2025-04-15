import get from "lodash/get"; // Usa importação específica para potencialmente reduzir bundles quando usando bundlers

/**
 * Representa um caminho dentro de um objeto, que pode ser uma string separada por pontos,
 * ou um array de chaves e índices.
 *
 * @example
 * 'a.b.c'
 * ['a', 'b', 0, 'c']
 * 'a.b[0].c' // Suportado pelo deepGet via lodash
 */
type ObjectPath = string | (string | number)[];

/**
 * Recupera com segurança o valor em um caminho específico dentro de um objeto ou array aninhado.
 * Utiliza `lodash.get` para resolução robusta de caminhos, suportando várias sintaxes de caminho
 * (ex: 'a.b[0].c', ['a', 'b', 0, 'c']). Lida graciosamente com objetos e caminhos nulos/indefinidos.
 *
 * @template T O tipo esperado do valor retornado se encontrado ou o tipo do valorPadrao.
 * @param {unknown} obj - O objeto ou array a ser consultado. Usando `unknown` encoraja verificação de tipo pelo chamador.
 * @param {ObjectPath | null | undefined} path - O caminho da propriedade a ser recuperada. Pode ser uma string separada por pontos,
 *   um array de chaves/índices, nulo ou indefinido.
 * @param {T} [valorPadrao] - O valor retornado se o caminho não for encontrado, o valor resolvido for `undefined`,
 *   ou o `obj` de entrada for nulo/indefinido.
 * @returns {T | undefined} O valor encontrado no caminho especificado, o `valorPadrao` se fornecido e o caminho
 *   não for resolvido, ou `undefined` caso contrário. O tipo de retorno é inferido do `valorPadrao` se fornecido.
 *
 * @example
 * const meuObj = { a: { b: [ { c: 1 } ] } };
 * deepGet(meuObj, 'a.b[0].c'); // Retorna 1
 * deepGet(meuObj, ['a', 'b', 0, 'c']); // Retorna 1
 * deepGet(meuObj, 'a.x.y'); // Retorna undefined
 * deepGet(meuObj, 'a.x.y', 'padrao'); // Retorna 'padrao'
 * deepGet(null, 'a.b', 'padrao'); // Retorna 'padrao'
 */
export function deepGet<T = unknown>(
  obj: unknown,
  path: ObjectPath | null | undefined,
  defaultValue?: T
): T | undefined {
  // lodash/get lida com obj nulo/indefinido, caminho nulo/indefinido,
  // vários formatos de caminho e padrões graciosamente
  return get(obj, path ?? [], defaultValue) as T | undefined;
}

/**
 * Procura iterativamente em um objeto ou array pela *primeira* ocorrência de uma determinada chave
 * e retorna seu valor correspondente. Usa estratégia de Busca em Largura (BFS)
 * para encontrar primeiro a ocorrência mais rasa. Inclui detecção de ciclos para evitar loops infinitos.
 *
 * @param {unknown} obj - O objeto ou array para pesquisar. Usando `unknown` encoraja verificação de tipo.
 * @param {string} chaveAlvo - A chave a ser procurada. Deve ser uma string não vazia.
 * @returns {unknown} O valor associado à primeira chave encontrada, ou `undefined` se a chave não for encontrada,
 *   o `obj` de entrada não for pesquisável (nulo, primitivo), ou a `chaveAlvo` for inválida.
 * @throws {TypeError} Se `chaveAlvo` não for uma string não vazia.
 *
 * @example
 * const meuObj = { a: 1, b: { c: 2, d: [{ c: 3 }] } };
 * deepFindByKey(meuObj, 'c'); // Retorna 2 (encontrado em 'b.c' antes de 'b.d[0].c')
 * deepFindByKey(meuObj, 'a'); // Retorna 1
 * deepFindByKey(meuObj, 'x'); // Retorna undefined
 * deepFindByKey(null, 'a'); // Retorna undefined
 * try {
 *   deepFindByKey(meuObj, '');
 * } catch (e) {
 *   console.error(e); // TypeError: deepFindByKey: chaveAlvo deve ser uma string não vazia.
 * }
 */
export function deepFindByKey(obj: unknown, targetKey: string): unknown {
  if (typeof targetKey !== "string" || targetKey.trim() === "") {
    throw new TypeError(
      "deepFindByKey: chaveAlvo deve ser uma string não vazia."
    );
  }

  if (obj === null || typeof obj !== "object") {
    return undefined; // Não é possível pesquisar em não-objetos/arrays ou nulo
  }

  // Use uma fila para BFS iterativo
  const queue: unknown[] = [obj];
  const visited = new Set<object>(); // Evitar loops infinitos em estruturas circulares

  while (queue.length > 0) {
    const current = queue.shift();

    // Garantir que current é um objeto/array e não nulo
    if (current === null || typeof current !== "object") {
      continue;
    }

    // Prevenir ciclos
    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    // Verificar se o objeto/array atual tem a chave alvo diretamente
    if (Object.prototype.hasOwnProperty.call(current, targetKey)) {
      return (current as Record<string, unknown>)[targetKey];
    }

    // Adicionar objetos/arrays aninhados à fila para pesquisa adicional
    for (const [, value] of Object.entries(current)) {
      if (value !== null && typeof value === "object") {
        queue.push(value);
      }
    }
  }

  return undefined; // Chave não encontrada
}

/**
 * Procura iterativamente em um objeto ou array por todas as ocorrências de um valor correspondente a um valor alvo,
 * usando uma função de comparação fornecida. Retorna um array de caminhos onde as correspondências foram encontradas.
 * Usa estratégia de Busca em Profundidade (DFS). Inclui detecção de ciclos.
 * Caminhos usam notação de ponto para propriedades de objeto e notação de colchetes para índices de array (ex: 'a.b[0].c').
 *
 * @param {unknown} obj - O objeto ou array para pesquisar. Usando `unknown` encoraja verificação de tipo.
 * @param {unknown} valorAlvo - O valor a ser procurado.
 * @param {(a: unknown, b: unknown) => boolean} [funcaoComparacao=(a, b) => a === b] - Uma função para comparar valores.
 *   Padrão para igualdade estrita (`===`). Recebe o valor atual (`a`) e o `valorAlvo` (`b`).
 * @returns {string[]} Um array de caminhos em string indicando onde o `valorAlvo` foi encontrado de acordo com a `funcaoComparacao`.
 *   Retorna um array vazio se nenhuma correspondência for encontrada ou se o `obj` de entrada não for pesquisável (nulo, primitivo).
 * @throws {TypeError} Se `funcaoComparacao` for fornecida mas não for uma função.
 *
 * @example
 * const meuObj = { a: 1, b: { c: 2, d: [{ e: 3 }, { e: 3 }] }, f: 3 };
 * deepFindByValue(meuObj, 3); // Retorna ['b.d[0].e', 'b.d[1].e', 'f'] (ordem pode variar devido ao DFS)
 * deepFindByValue(meuObj, 'ola'); // Retorna []
 * deepFindByValue(meuObj, { e: 3 }, (a, b) => JSON.stringify(a) === JSON.stringify(b)); // Retorna ['b.d[0]', 'b.d[1]']
 * deepFindByValue(null, 3); // Retorna []
 * try {
 *   deepFindByValue(meuObj, 1, {} as any);
 * } catch (e) {
 *   console.error(e); // TypeError: deepFindByValue: funcaoComparacao deve ser uma função se fornecida.
 * }
 */
export function deepFindByValue(
  obj: unknown,
  targetValue: unknown,
  compareFn: (a: unknown, b: unknown) => boolean = (a, b) => a === b
): string[] {
  if (compareFn !== undefined && typeof compareFn !== "function") {
    throw new TypeError(
      "deepFindByValue: funcaoComparacao deve ser uma função se fornecida."
    );
  }

  const foundPaths: string[] = [];

  if (obj === null || typeof obj !== "object") {
    return foundPaths; // Não é possível pesquisar em não-objetos/arrays ou nulo
  }

  // Use uma pilha para DFS iterativo: armazena [valor, caminhoString]
  const stack: [unknown, string][] = [[obj, ""]];
  const visited = new Set<object>(); // Evitar loops infinitos em estruturas circulares

  while (stack.length > 0) {
    const [currentObj, currentPath] = stack.pop()!; // A asserção de não-nulo é ok devido à condição while

    // Garantir que currentObj é um objeto/array e não nulo
    if (currentObj === null || typeof currentObj !== "object") {
      continue;
    }

    // Prevenir ciclos - verificar antes de processar filhos
    if (visited.has(currentObj)) {
      continue;
    }
    visited.add(currentObj);

    // Iterar sobre chaves/índices
    for (const key in currentObj) {
      if (Object.prototype.hasOwnProperty.call(currentObj, key)) {
        const value = (currentObj as Record<string | number, unknown>)[key];

        // Construir o novo segmento de caminho
        let newPath: string;
        if (currentPath === "") {
          // Nível raiz
          newPath = String(key); // Garantir que a chave é string para o caminho
        } else if (Array.isArray(currentObj)) {
          // Usar notação de colchetes para índices de array
          newPath = `${currentPath}[${key}]`;
        } else {
          // Usar notação de ponto para propriedades de objeto
          // Lidar com chaves numéricas em objetos se necessário, embora menos comum
          newPath = `${currentPath}.${key}`;
        }

        // Verificar se o valor corresponde usando a função de comparação
        try {
          if (compareFn(value, targetValue)) {
            foundPaths.push(newPath);
          }
        } catch (error) {
          // Registrar ou lidar com erros de comparação se necessário
          console.warn(
            `[deepFindByValue] Erro durante comparação no caminho "${newPath}": ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }

        // Se o valor for um objeto ou array, adicioná-lo à pilha para pesquisar mais profundamente
        if (value !== null && typeof value === "object") {
          stack.push([value, newPath]);
        }
      }
    }
  }

  // Como o DFS empurra filhos para a pilha e os processa por último, primeiro a ordem de descoberta
  // pode aparecer em ordem inversa em relação aos irmãos.
  // Muitas vezes, a ordem exata não é crítica, mas se necessário, pode ser ordenada.
  return foundPaths;
}
