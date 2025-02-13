import { HttpException, HttpStatus } from '@nestjs/common';

export class ProfileUrl {
  constructor(private readonly profileUrl?: string) {
    if (!this.isValidUrl(profileUrl)) {
      throw new HttpException('Invalid profile URL', HttpStatus.BAD_REQUEST);
    }
  }

  private isValidUrl(url?: string): boolean {
    // If no URL is provided, it is considered valid
    if (!url) {
      return true;
    }

    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  }

  public getProfileUrl(): string | undefined {
    return this.profileUrl;
  }
}
