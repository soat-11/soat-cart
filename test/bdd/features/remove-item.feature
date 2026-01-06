Feature: Remoção de itens do carrinho

  Scenario: Remover um produto com sucesso
    Given que o cliente possui um carrinho com o produto "SKU-99"
    When o cliente solicita a remoção do produto "SKU-99"
    Then o sistema deve processar a remoção com sucesso
    And o carrinho resultante não deve conter o produto "SKU-99"