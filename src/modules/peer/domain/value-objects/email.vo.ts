import { HttpException, HttpStatus } from '@nestjs/common';

// src/modules/user/domain/value-objects/email.vo.ts
export class Email {
  constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new HttpException('Invalid email address', HttpStatus.BAD_REQUEST);
    }
  }

  private isValid(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  public getValue(): string {
    return this.value;
  }
}
