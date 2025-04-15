/**
 * Analisa uma string de caminho em um array de chaves. Suporta múltiplos formatos de caminho
 * incluindo notação de ponto e colchetes com strings ou números.
 *
 * @description
 * Esta função é capaz de processar os seguintes formatos de caminho:
 * - Notação de ponto simples: 'user.name'
 * - Notação de colchetes com números: 'users[0].name'
 * - Notação de colchetes com strings: "users['name']" ou 'users["name"]'
 * - Combinações: 'users[0].addresses["home"].street'
 *
 * @param {string | null | undefined} pathString - A string de caminho para analisar.
 *   Pode ser uma string contendo o caminho, null, ou undefined.
 *
 * @returns {string[]} Um array contendo todas as chaves encontradas no caminho.
 *   Retorna um array vazio se pathString for inválido (null, undefined, ou string vazia).
 *
 * @example
 * parsePath('user.name')               // ['user', 'name']
 * parsePath('users[0].address')        // ['users', '0', 'address']
 * parsePath('data["key-name"]')        // ['data', 'key-name']
 * parsePath(null)                      // []
 * parsePath('single')                  // ['single']
 */
export function parsePath(pathString: string | null | undefined): string[] {
  // Validação inicial da string de entrada
  if (typeof pathString !== "string" || pathString.trim() === "") {
    return [];
  }

  const keys: string[] = [];
  // Regex complexa que captura diferentes formatos de caminho:
  // - Grupo 1 e 2: Capturam chaves entre aspas: ['chave'] ou ["chave"]
  // - Grupo 3: Captura índices numéricos: [0]
  // - Grupo 4: Captura nomes simples de propriedades: usuario.nome
  const segmentRegex = /\.?(?:\[(['"])(.*?)\1\]|\[(\d+)\]|([^.\[\]]+))/g;
  let match;

  while ((match = segmentRegex.exec(pathString)) !== null) {
    // Processa chaves entre aspas (simples ou duplas)
    if (match[2] !== undefined) {
      keys.push(match[2]);
    }
    // Processa índices numéricos
    else if (match[3] !== undefined) {
      keys.push(match[3]);
    }
    // Processa nomes simples de propriedades
    else if (match[4] !== undefined) {
      keys.push(match[4]);
    }

    // Proteção contra loops infinitos do regex
    if (match.index === segmentRegex.lastIndex) {
      segmentRegex.lastIndex++;
      console.warn(
        `[parsePath] Regex pode ter entrado em loop em path: "${pathString}". Avançando manualmente.`
      );
    }
  }

  if (keys.length === 0 && pathString && !/[.\[\]]/.test(pathString)) {
    keys.push(pathString);
  }

  return keys;
}
