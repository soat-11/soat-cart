import { AllExceptionsFilter } from "./http-exception.filter";
import { HttpException, HttpStatus } from "@nestjs/common";

describe("AllExceptionsFilter", () => {
  let filter: AllExceptionsFilter;
  let mockResponse: any;
  let mockArgumentsHost: any;

  beforeEach(() => {
    filter = new AllExceptionsFilter();

    // Mock do Response do Express
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock do Contexto do NestJS
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnThis(),
      getResponse: jest.fn().mockReturnValue(mockResponse),
    };
  });

  it("deve tratar uma HttpException (erro conhecido)", () => {
    const status = HttpStatus.BAD_REQUEST;
    const message = "Erro de validação";
    const exception = new HttpException(message, status);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(status);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: message,
      })
    );
  });

  it("deve tratar um erro genérico como 500 (Internal Server Error)", () => {
    const message = "Erro explosivo";
    const exception = new Error(message);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: message,
      })
    );
  });

  it("deve tratar uma exceção desconhecida que não é instância de Error", () => {
    const exception = "Algo muito estranho aconteceu";

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: "Internal server error",
      })
    );
  });
});
