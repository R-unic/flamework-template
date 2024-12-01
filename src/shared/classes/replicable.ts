import {
  ClientReceiver as ClientEventReceiver,
  ClientSender as ClientEventSender,
  ServerSender as ServerEventSender,
  ServerReceiver as ServerEventReceiver
} from "@flamework/networking/out/events/types";
import { Players } from "@rbxts/services";

import LazyIterator from "./lazy-iterator";
import Destroyable from "./destroyable";

interface WithRange {
  readonly rangeOrigin: Vector3;
  readonly range: number;
}

interface WithoutRange {
  readonly rangeOrigin?: undefined;
  readonly range?: undefined;
}

interface BaseReplicationOptions { }

export type ReplicationOptions = BaseReplicationOptions
  & (WithRange | WithoutRange);

const DEFAULT_REPLICATION_OPTIONS: ReplicationOptions = {};

/** The replicable to create on the client */
export abstract class Replicable<I extends unknown[]> extends Destroyable {
  public constructor(
    receiver: ClientEventReceiver<I>,
    private readonly sender: ClientEventSender<I>
  ) {
    super();
    this.janitor.Add(receiver.connect((...args) => this.replicate(...args)));
  }

  protected abstract replicate(...args: I): void;

  protected requestReplication(...args: I): void {
    this.sender(...args);
    this.replicate(...args);
  }
}

/** Replicates to client */
export class Replicator<I extends unknown[]> extends Destroyable {
  public constructor(receiver: ServerEventReceiver<I>, sender: ServerEventSender<I>, options = DEFAULT_REPLICATION_OPTIONS) {
    super();
    this.janitor.Add(receiver.connect((player, ...args) => {
      const players = LazyIterator.fromArray(Players.GetPlayers())
        .filter(p => p !== player);

      if (options.range !== undefined)
        players.filter(player => {
          const character = <Maybe<CharacterModel>>player.Character;
          return character !== undefined && character.HumanoidRootPart.Position.sub(options.rangeOrigin).Magnitude < options.range;
        });

      sender(players.collect(), ...args);
    }));
  }
}