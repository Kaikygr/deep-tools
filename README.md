# Deep Tools

[![versão npm](https://badge.fury.io/js/deep-tools.svg)](https://badge.fury.io/js/@kaikygr/deep-tools-ts) <!-- Substitua 'deep-tools' se o nome do seu pacote npm for diferente -->
[![Status de Build](https://travis-ci.org/kaikygr/deep-tools.svg?branch=main)](https://travis-ci.org/kaikygr/deep-tools) <!-- Substitua com seu serviço/link de CI -->
[![Cobertura de Testes](https://coveralls.io/repos/github/kaikygr/deep-tools/badge.svg?branch=main)](https://coveralls.io/github/kaikygr/deep-tools?branch=main) <!-- Substitua com seu serviço/link de cobertura -->
[![Licença: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Uma robusta biblioteca utilitária TypeScript para acessar e pesquisar com segurança dentro de objetos e arrays profundamente aninhados em JavaScript.

## Características

- **Deep Get (`deepGet`)**: Recupera valores com segurança de objetos/arrays aninhados usando notação de caminho por ponto ou array. Alimentado por `lodash.get` para confiabilidade e flexibilidade. Suporta valores padrão.
- **Deep Find by Key (`deepFindByKey`)**: Encontra o valor da _primeira_ ocorrência de uma chave específica dentro de uma estrutura aninhada usando Busca em Largura (BFS).
- **Deep Find by Value (`deepFindByValue`)**: Encontra _todos_ os caminhos onde um valor específico ocorre dentro de uma estrutura aninhada usando Busca em Profundidade (DFS). Suporta funções de comparação personalizadas.
- **Robusto**: Lida graciosamente com entradas nulas/indefinidas, caminhos inexistentes e referências circulares.
- **Seguro para Tipos**: Escrito em TypeScript com definições de tipo incluídas. Usa `unknown` para encorajar uso mais seguro.
- **Bem Testado**: Inclui uma suíte de testes Jest abrangente.
- **Documentado**: Fornece comentários TypeDoc claros para documentação da API.

## Instalação

```bash
npm install deep-tools
```

## Funcionalidades

### deepGet

Acessa propriedades aninhadas de objetos de forma segura usando path em string ou array.

```typescript
import { deepGet } from 'deep-tools';

const obj = {
  a: {
    b: [
      { c: 1 }
    ]
  }
};

// Usando path string
const value1 = deepGet(obj, 'a.b[0].c'); // retorna 1

// Usando array path
const value2 = deepGet(obj, ['a', 'b', 0, 'c']); // retorna 1

// Com valor default
const value3 = deepGet(obj, 'x.y.z', 'default'); // retorna 'default'
```

### deepFindByValue

Procura recursivamente por um valor dentro de um objeto e retorna o caminho completo até ele.

```typescript
import { deepFindByValue } from 'deep-tools';

const obj = {
  a: {
    b: [
      { c: 123 },
      { d: 456 }
    ]
  }
};

const path = deepFindByValue(obj, 456); // retorna 'a.b[1].d'
```

## API

### deepGet(obj, path, defaultValue?)

Recupera o valor em um caminho específico dentro de um objeto.

- `obj`: O objeto a ser consultado
- `path`: O caminho para a propriedade (string ou array)
- `defaultValue`: Valor retornado se o caminho não existir
- **Retorna**: O valor encontrado ou o defaultValue

### deepFindByValue(obj, value, compareFn?)

Encontra um valor em um objeto e retorna seu caminho.

- `obj`: O objeto a ser pesquisado
- `value`: O valor a ser encontrado
- `compareFn`: Função opcional de comparação customizada
- **Retorna**: O caminho como string ou undefined se não encontrado

## TypeScript

A biblioteca é totalmente escrita em TypeScript e inclui definições de tipo.

```typescript
import { deepGet } from 'deep-tools';

interface MyType {
  prop: {
    nested: string;
  }
}

const obj: MyType = {
  prop: {
    nested: "value"
  }
};

const value = deepGet<string>(obj, 'prop.nested');
```

## Desenvolvimento

1. Clone o repositório

```bash
git clone https://github.com/kaikygr/deep-tools.git
```

2. Instale as dependências

```bash
npm install
```

3. Execute os testes

```bash
npm test
```

4. Build

```bash
npm run build
```

## Scripts Disponíveis

- `npm run build` - Compila o código TypeScript
- `npm test` - Executa os testes
- `npm run test:watch` - Executa os testes em modo watch

## Dependências

- lodash: ^4.17.21

## Dependências de Desenvolvimento

- @types/jest: ^29.5.0
- @types/lodash: ^4.17.16
- jest: ^29.5.0
- ts-jest: ^29.1.0
- typedoc: ^0.28.2
- typescript: ^5.0.0

## Licença

Este projeto está sob licença MIT.

## Contribuindo

1. Faça o fork do projeto
2. Crie sua feature branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## Autor

Seu Nome - [github.com/kaikygr](https://github.com/kaikygr)

## Agradecimentos

- Lodash pelos utilitários
- Toda a comunidade open source
