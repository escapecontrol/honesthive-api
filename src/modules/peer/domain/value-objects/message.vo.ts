import { HttpException, HttpStatus } from '@nestjs/common';

export class Message {
  constructor(private readonly message: string) {
    console.log('Message created:', message);
    if (!this.isValidMessage(message)) {
      throw new HttpException('Invalid message - it can\'t be empty and must have at least 3 words', HttpStatus.BAD_REQUEST);
    }
  }

  private isValidMessage(message: string): boolean {
    // Check if the message is not empty, contains valid characters, and has at least 3 words or emojis
    const wordCount = this.countWordsAndEmojis(message);
    return message.length > 0 && /^[a-zA-Z0-9\s.,!?'"-]+$/.test(message) && wordCount >= 3;
  }

  private countWordsAndEmojis(message: string): number {
    // Match words and emojis separately
    const wordsAndEmojis = message.match(/(\p{L}+|\p{N}+|[\p{Emoji_Presentation}\p{Emoji}\uFE0F])/gu);
    return wordsAndEmojis ? wordsAndEmojis.length : 0;
  }

  public getMessage(): string {
    return this.message;
  }
}
