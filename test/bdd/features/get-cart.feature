Feature: Consultar o carrinho

  Scenario: Buscar um carrinho existente com itens
    Given que existe um carrinho ativo para a sessão "sessao-consulta-123"
    And este carrinho contém 2 itens
    When o cliente solicita a visualização do carrinho "sessao-consulta-123"
    Then o sistema deve retornar os dados do carrinho com sucesso
    And o total de itens deve ser 2