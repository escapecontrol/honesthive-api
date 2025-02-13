import { HttpException, HttpStatus } from '@nestjs/common';

export class InviteSlug {
  constructor(private readonly slug: string) {
    if (!this.isValidSlug(slug)) {
      throw new HttpException('Invalid invitation slug', HttpStatus.BAD_REQUEST);
    }
  }

  private isValidSlug(value: string): boolean {
    return true;
    return value.length > 0 && value.length <= 24 && /^[a-zA-Z]+$/.test(value);
  }

  public getInviteSlug(): string {
    return this.slug;
  }
}
