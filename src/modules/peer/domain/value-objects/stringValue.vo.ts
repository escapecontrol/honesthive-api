import { HttpException, HttpStatus } from '@nestjs/common';

export class StringValue {
  constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new HttpException('Invalid value, no empty strings allowed.', HttpStatus.BAD_REQUEST);
    }
  }

  private isValid(value: string): boolean {
    return value.trim().length > 0 && /^[a-zA-Z]+$/.test(value);
  }

  public getValue(): string {
    return this.value;
  }
}
