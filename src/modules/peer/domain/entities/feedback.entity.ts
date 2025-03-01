import { Message } from "../value-objects/message.vo";
import { Peer } from "./peer.entity";

export class Feedback {
  constructor(
    public readonly id: string,
    public readonly FromMember: Peer,
    public readonly ToMember: Peer,
    public readonly message: Message,
    public readonly createdAt: Date,
  ) {}
}
