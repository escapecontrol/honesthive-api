import { Injectable, Logger } from '@nestjs/common';
import fetch from 'node-fetch';

@Injectable()
export class EdenAIService {
  private readonly logger = new Logger(EdenAIService.name);

  /**
   * Classifies a message using the EdenAI API.
   *
   * @param text - The text to classify.
   * @param categories - The collection of classification categories.
   * @returns A promise that resolves with the classification result.
   */
  async classifyMessageAsync(
    text: string,
    categories: string[],
  ): Promise<string> {
    const apiKey = process.env.EDENAI_API_KEY; // Replace with your EdenAI API key
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    const url = 'https://api.edenai.run/v2/text/custom_classification';
    const body = JSON.stringify({
      "providers": "openai",
      "texts": [text],
      "labels": categories,
      "examples": [
        ["I want to improve how we talk to each other and make sure we're always on the same page.", "Communication"],
        ["Let's work on expressing our feelings more openly and honestly.", "Communication"],
        ["Active listening is key to making our conversations more meaningful.", "Communication"],
        
        ["I'm always here for you, no matter what happens.", "Support"],
        ["Let me know if you need anything—I want to help however I can.", "Support"],
        ["You're not alone in this; we'll figure it out together.", "Support"],
        
        ["I love how we always decorate the house together for the holidays.", "Traditions"],
        ["Sunday family dinners are a tradition I never want to break.", "Traditions"],
        ["Every year, we take a trip to the same beach—it's our special tradition.", "Traditions"],
        
        ["I want to become a better person and keep learning from my experiences.", "Growth"],
        ["Let's set goals together and push each other to reach them.", "Growth"],
        ["I've been working on improving my mindset and handling challenges better.", "Growth"],
        
        ["Let's plan a weekend getaway so we can spend some uninterrupted time together.", "Quality Time"],
        ["I love just sitting and talking with you for hours.", "Quality Time"],
        ["Game nights are my favorite because we get to enjoy each other's company.", "Quality Time"],
      ]      
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
      });

      if (!response.ok) {
        throw new Error(
          `EdenAI API request failed with status ${response.status}`,
        );
      }

      const result = await response.json();
      this.logger.log(`EdenAI API response: ${JSON.stringify(result)}`);

      // Extract the classification result from the response
      const classification = result.openai.classifications[0].label;
      const classificationConfidence = result.openai.classifications[0].confidence;

      this.logger.log(`Classification confidence: ${classificationConfidence}`);
      this.logger.log(`Classification result: ${classification}`);
      
      return classification || 'Unknown';
    } catch (error) {
      this.logger.error('Error classifying message with EdenAI:', error);
      throw new Error('Failed to classify message.');
    }
  }
}
