const { Tabuleiro } = require('../src/tabuleiro');
const {
  MINAS_NO_FUNDO_EM_QUE_O_PRIMEIRO_CLIQUE_VENCE,
  MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO,
  MINAS_QUE_CERCAM_A_CELULA_6_8,
} = require('./helpers/tabuleiros');

describe('Tabuleiro: fixtures de teste', () => {
  test.each([
    ['MINAS_NO_FUNDO_EM_QUE_O_PRIMEIRO_CLIQUE_VENCE', MINAS_NO_FUNDO_EM_QUE_O_PRIMEIRO_CLIQUE_VENCE],
    ['MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO', MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO],
    ['MINAS_QUE_CERCAM_A_CELULA_6_8', MINAS_QUE_CERCAM_A_CELULA_6_8],
  ])('%s é um tabuleiro válido de 40 minas', (_nome, minas) => {
    expect(() => new Tabuleiro(minas)).not.toThrow();
  });
});

describe('Tabuleiro.temMina', () => {
  const tabuleiro = new Tabuleiro(MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO);

  test.each([
    [{ linha: 0, coluna: 1 }, true],
    [{ linha: 13, coluna: 17 }, true],
    [{ linha: 0, coluna: 0 }, false],
    [{ linha: 11, coluna: 16 }, false],
  ])('a posição %o tem mina? %s', (posicao, esperado) => {
    expect(tabuleiro.temMina(posicao)).toBe(esperado);
  });

  test.each([
    ['fora do tabuleiro', { linha: 0, coluna: 18 }, new RangeError('A posição (0, 18) está fora do tabuleiro 14 x 18.')],
    ['sem coordenadas inteiras', null, new TypeError('A posição deve ter linha e coluna inteiras.')],
  ])('valida a posição consultada (%s)', (_descricao, posicao, erroEsperado) => {
    expect(() => tabuleiro.temMina(posicao)).toThrow(erroEsperado);
  });
});

describe('Tabuleiro.contarMinasVizinhas', () => {
  const tabuleiro = new Tabuleiro(MINAS_QUE_CERCAM_A_CELULA_6_8);

  test.each([
    ['cercada por minas por todos os lados', { linha: 6, coluna: 8 }, 8],
    ['acima de três minas', { linha: 4, coluna: 8 }, 3],
    ['na diagonal de duas minas', { linha: 4, coluna: 7 }, 2],
    ['na diagonal de uma única mina', { linha: 4, coluna: 6 }, 1],
    ['longe de qualquer mina', { linha: 0, coluna: 0 }, 0],
    ['na borda, acima de duas minas', { linha: 11, coluna: 0 }, 2],
    ['no fim do bloco de minas', { linha: 11, coluna: 16 }, 1],
    ['no canto, ao lado de minas', { linha: 13, coluna: 16 }, 2],
    ['que é ela própria uma mina', { linha: 5, coluna: 7 }, 2],
  ])('conta as minas vizinhas de uma célula %s', (_descricao, posicao, esperado) => {
    expect(tabuleiro.contarMinasVizinhas(posicao)).toBe(esperado);
  });

  test.each([
    ['fora do tabuleiro', { linha: -1, coluna: 0 }, new RangeError('A posição (-1, 0) está fora do tabuleiro 14 x 18.')],
    ['sem coordenadas inteiras', { linha: 'x', coluna: 0 }, new TypeError('A posição deve ter linha e coluna inteiras.')],
  ])('valida a posição consultada (%s)', (_descricao, posicao, erroEsperado) => {
    expect(() => tabuleiro.contarMinasVizinhas(posicao)).toThrow(erroEsperado);
  });
});

describe('Tabuleiro: validação das minas recebidas', () => {
  test('lança TypeError quando as minas não vêm em uma lista', () => {
    expect(() => new Tabuleiro('minas')).toThrow(
      new TypeError('As posições das minas devem ser informadas em uma lista.'),
    );
  });

  test.each([
    ['39', MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO.slice(1)],
    ['41', [...MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO, { linha: 5, coluna: 5 }]],
  ])('lança RangeError com %s minas em vez de 40', (quantidade, minas) => {
    expect(() => new Tabuleiro(minas)).toThrow(
      new RangeError(`O tabuleiro deve ter exatamente 40 minas; recebeu ${quantidade}.`),
    );
  });

  test('lança RangeError quando há duas minas na mesma posição', () => {
    const minasComRepeticao = [
      ...MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO.slice(1),
      { linha: 1, coluna: 0 },
    ];

    expect(() => new Tabuleiro(minasComRepeticao)).toThrow(
      new RangeError('Há mais de uma mina na mesma posição.'),
    );
  });

  test.each([
    ['fora do tabuleiro', { linha: 14, coluna: 0 }, new RangeError('A posição (14, 0) está fora do tabuleiro 14 x 18.')],
    ['sem coordenadas inteiras', { linha: 'x', coluna: 0 }, new TypeError('A posição deve ter linha e coluna inteiras.')],
  ])('rejeita uma mina %s', (_descricao, minaInvalida, erroEsperado) => {
    const minas = [...MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO.slice(1), minaInvalida];

    expect(() => new Tabuleiro(minas)).toThrow(erroEsperado);
  });

  test('alterar a lista ou os objetos de posição depois de criar o tabuleiro não muda as minas', () => {
    const minas = MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO.map((posicao) => ({ ...posicao }));
    const tabuleiro = new Tabuleiro(minas);

    minas[0].linha = 5;
    minas[0].coluna = 5;
    minas[1] = { linha: 0, coluna: 0 };

    expect(tabuleiro.temMina({ linha: 0, coluna: 1 })).toBe(true);
    expect(tabuleiro.temMina({ linha: 1, coluna: 0 })).toBe(true);
    expect(tabuleiro.temMina({ linha: 5, coluna: 5 })).toBe(false);
    expect(tabuleiro.temMina({ linha: 0, coluna: 0 })).toBe(false);
  });
});
