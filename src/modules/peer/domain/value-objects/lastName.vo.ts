import { HttpException, HttpStatus } from '@nestjs/common';

export class LastName {
  constructor(private readonly lastName: string) {
    if (!this.isValidName(lastName)) {
      throw new HttpException('Invalid last name', HttpStatus.BAD_REQUEST);
    }
  }

  private isValidName(name: string): boolean {
    return name.length > 0 && /^[a-zA-Z]+$/.test(name);
  }

  public getLastName(): string {
    return this.lastName;
  }
}
