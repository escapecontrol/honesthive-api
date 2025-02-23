import { HttpException, HttpStatus } from '@nestjs/common';

export class Message {
  constructor(private readonly message: string) {
    console.log('Message created:', message);
    if (!this.isValidMessage(message)) {
      throw new HttpException('Invalid message - it can\'t be empty and must have at least 3 words', HttpStatus.BAD_REQUEST);
    }
  }

  private isValidMessage(message: string): boolean {
    // Check if the message is not empty, contains valid characters, and has at least 3 words
    const wordCount = message.trim().split(/\s+/).length;
    return message.length > 0 && /^[a-zA-Z0-9\s.,!?'"-]+$/.test(message) && wordCount >= 3;
  }

  public getMessage(): string {
    return this.message;
  }
}
