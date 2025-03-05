import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';

@Injectable()
export class OpenAIService {
  private readonly openai: OpenAI;
  private readonly logger = new Logger(OpenAIService.name);

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || ``,
    });
  }

  /**
   * Classifies text based on a collection of classification values.
   * As a senior classification assistant.
   *
   * @param text - The text to classify.
   * @param classificationValues - The collection of classification values.
   * @returns A promise that resolves with the classification result.
   */
  async classifyFamilyAsync(
    text: string,
    classificationValues: string[],
  ): Promise<string> {
    const prompt = `Classify the following text into one of the following categories: ${classificationValues.join(', ')}.\n\nText: "${text}"`;

    this.logger.debug(`Classifying prompt: ${prompt}`);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a senior classification assistant.' },
          { role: 'user', content: prompt },
        ],
      });

      const classification = response.choices[0].message?.content.trim();
      this.logger.log('Classification choices', response.choices);
      this.logger.log(`Classification result: ${classification}`);

      return classification || 'Unknown';
    } catch (error) {
      this.logger.error('Error using OpenAI: ', error);
      throw new Error('Failed to classify text.');
    }
  }
}
