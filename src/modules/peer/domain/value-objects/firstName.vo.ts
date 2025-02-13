import { HttpException, HttpStatus } from '@nestjs/common';

export class FirstName {
  constructor(private readonly firstName: string) {
    if (!this.isValidName(firstName)) {
      throw new HttpException('Invalid first name', HttpStatus.BAD_REQUEST);
    }
  }

  private isValidName(name: string): boolean {
    return name.length > 0 && /^[a-zA-Z]+$/.test(name);
  }

  public getFirstName(): string {
    return this.firstName;
  }
}
