Feature: Operações do Carrinho

  Scenario: Adicionar um novo item ao carrinho
    Given que o produto "PROD-1" existe com preço 50
    And o cliente inicia uma sessão "sessao-123"
    When o cliente adiciona 2 unidades do produto "PROD-1" ao carrinho
    Then o carrinho deve ter o valor total de 100

  Scenario: Buscar um carrinho existente
    Given que existe um carrinho para a sessão "sessao-456" com 1 item
    When o cliente solicita os detalhes do carrinho "sessao-456"
    Then o sistema retorna o carrinho com 1 item