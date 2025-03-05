export class ClassificationDTO {
  constructor(
    public readonly category: string,
    public readonly confidenceScore: number,
  ) {}
}