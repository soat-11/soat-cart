import { Result } from "./result";

describe("Result Class", () => {
  it("deve criar um resultado de sucesso com valor", () => {
    const value = { data: "teste" };
    const result = Result.ok(value);

    expect(result.isSuccess).toBe(true);
    expect(result.isFailure).toBe(false);
    expect(result.getValue()).toBe(value);
    expect(result.error).toBeUndefined();
  });

  it("deve criar um resultado de falha com mensagem de erro", () => {
    const errorMessage = "Erro ocorreu";
    const result = Result.fail(errorMessage);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.error).toBe(errorMessage);
    expect(result.getValue()).toBeUndefined();
  });

  it("deve retornar null no getValueOrNull em caso de falha", () => {
    const result = Result.fail("erro");
    expect(result.getValueOrNull()).toBeNull();
  });

  it("deve retornar o valor no getValueOrNull em caso de sucesso", () => {
    const result = Result.ok("sucesso");
    expect(result.getValueOrNull()).toBe("sucesso");
  });

  describe("combine", () => {
    it("deve retornar sucesso se todos os resultados forem sucesso", () => {
      const results = [Result.ok(), Result.ok()];
      const combined = Result.combine(results);
      expect(combined.isSuccess).toBe(true);
    });

    it("deve retornar a primeira falha encontrada na combinação", () => {
      const results = [
        Result.ok(),
        Result.fail("erro 1"),
        Result.fail("erro 2"),
      ];
      const combined = Result.combine(results);
      expect(combined.isFailure).toBe(true);
      expect(combined.error).toBe("erro 1");
    });
  });

  describe("Garantias do Constructor (Validation)", () => {
    it("deve lançar erro ao tentar criar sucesso com mensagem de erro", () => {
      // @ts-ignore - Forçando erro para testar constructor privado
      expect(() => new Result(true, "erro")).toThrow(
        "InvalidOperation: A result cannot be successful and contain an error"
      );
    });

    it("deve lançar erro ao tentar criar falha sem mensagem de erro", () => {
      // @ts-ignore
      expect(() => new Result(false, undefined)).toThrow(
        "InvalidOperation: A failing result needs to contain an error message"
      );
    });
  });
});
