
type HttpStatusCode = 200 | 201 | 400 | 401 | 403 | 404 | 500;

export class ErrorResponse extends Error {
  public statusCode: HttpStatusCode;
  value: any;
  code: any;
  errors:any

  constructor(message: string, statusCode: HttpStatusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}
