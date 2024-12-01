import type {
  ClientReceiver as ClientEventReceiver,
  ClientSender as ClientEventSender,
  ServerSender as ServerEventSender,
  ServerReceiver as ServerEventReceiver
} from "@flamework/networking/out/events/types";
import type { Serializer } from "@rbxts/flamework-binary-serializer";
import { Players, ServerScriptService } from "@rbxts/services";

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
  protected readonly useReplicationOptions: ClientEventSender<[options: ReplicationOptions]>;

  public constructor(
    receiver: ClientEventReceiver<I>,
    protected readonly sender: ClientEventSender<I>
  ) {
    super();
    const { Events } = require<typeof import("client/network")>(Players.LocalPlayer.WaitForChild("PlayerScripts").WaitForChild("TS").WaitForChild<ModuleScript>("network"));
    this.useReplicationOptions = Events.useReplicationOptions;
    this.janitor.Add(receiver.connect((...args) => this.replicate(...args)));
  }

  protected abstract replicate(...args: I): void;

  protected requestReplication(replicationOptions = DEFAULT_REPLICATION_OPTIONS, ...args: I): void {
    this.useReplicationOptions(replicationOptions);
    this.sender(...args);
    this.replicate(...args);
  }
}

/** Replicates to client */
export class Replicator<I extends unknown[]> extends Destroyable {
  public constructor(receiver: ServerEventReceiver<I>, sender: ServerEventSender<I>) {
    super();

    const { Events } = require<typeof import("server/network")>(ServerScriptService.WaitForChild("TS").WaitForChild<ModuleScript>("network"));
    let replicationOptions = DEFAULT_REPLICATION_OPTIONS;
    this.janitor.Add(Events.useReplicationOptions.connect((_, options) => replicationOptions = options));

    this.janitor.Add(receiver.connect((player, ...args) => {
      const players = LazyIterator.fromArray(Players.GetPlayers())
        .filter(p => p !== player);

      if (replicationOptions.range !== undefined)
        players.filter(player => {
          const character = <Maybe<CharacterModel>>player.Character;
          if (character === undefined) return false;

          const distance = character.HumanoidRootPart.Position.sub(replicationOptions.rangeOrigin!).Magnitude;
          return distance < replicationOptions.range!;
        });

      sender(players.collect(), ...args);
    }));
  }
}

/** The replicable to create on the client */
export abstract class SerializedReplicable<Packet extends object = object> extends Replicable<[packet: SerializedPacket | Packet]> {
  public constructor(
    receiver: ClientEventReceiver<[packet: SerializedPacket]>,
    sender: ClientEventSender<[packet: SerializedPacket]>,
    private readonly serializer: Serializer<Packet>
  ) {
    super(receiver, <ClientEventSender<[packet: SerializedPacket | Packet]>>sender);
  }

  protected abstract replicate(packet: Packet): void;

  protected override requestReplication(packet: Packet, replicationOptions = DEFAULT_REPLICATION_OPTIONS): void {
    const serialized = this.serializer.serialize(packet);
    this.useReplicationOptions(replicationOptions);
    this.sender(serialized);
    this.replicate(packet);
  }
}

/** Replicates to client */
export class SerializedReplicator extends Replicator<[packet: SerializedPacket]> {

}