# Runic's Flamework Template

This is my own pre-configured template you can use for your Roblox TypeScript projects that use [Flamework](https://flamework.fireboltofdeath.dev/docs/).
It aims to be decently simple and lightweight but still provide as many reusable things as possible to create any type of game. React/Roact is not included, you'll have to install that yourself if you want it. ESLint and Prettier are also not included.

## Libraries
- `@rbxts/firebase`
- `@rbxts/ez-log`
- `@rbxts/lazy`
- `@rbxts/lazy-iterator`
- `@rbxts/flamework-meta-utils`
- `@rbxts/array-utils`
- `@rbxts/instance-utility`
- `@rbxts/wave`
- `@rbxts/runit`
  - Test files are located in `src/tests`
- `@rbxts/flamework-binary-serializer`
  - This package serializes tables and instances into buffers (list of bytes) which reduces the size of the data massively. It is useful for optimizing networking
  - Includes serializers which are created & exported in `shared/network.ts`
  - You can skip manually deserializing arguments from remotes by using the `@LinkSerializedRemote` decorator

## Features
- Snippets:
  - Flamework controller
  - Flamework service
  - Flamework component
  - Flamework UI component
  - rUnit test
- Frontend:
  - Custom mouse controller
  - `ReplicaController` which stores a copy of the local player's data
  - Procedural animation system for cameras or models with these animations included (just delete it if you don't want it):
    - Landing
    - Mouse sway
    - Walk cycle
  - `CharacterController` for easily retrieving character, root, & humanoid
  - Custom camera controller to switch between cameras on the fly with these camera components included (but optional):
    - Default (default roblox cam)
    - FirstPerson (default roblox cam locked to 1P)
    - Aerial
    - Fixed
    - FlyOnTheWall
    - FirstPersonAnimated (uses procedural animation system)
  - UI:
    - Customizable control panel made with Iris
      - Performance stats, movement system, and camera system mods already included
      - For common classes rendered in your control panel, use the `WithControlPanelSettings` class to define a `renderControlPanelSettings` method that renders the class' settings in control panel
    - Animation components (Gradient, Rotation, Transparency, Scale, SpringScale)
    - Effect controller (such as fading black in/out)
- Backend:
  - Cmdr for custom commands
  - Graceful Firebase API instead of DataStoreService
  - Product/gamepass transaction handler
  - Automatic audio replication
- Tons of utility functions and classes (comma format, abbreviation, repr, array shuffle/flatten/reverse, springs, sin/cos waves, bitfields, string builder, etc.)
- Tons of utility decorators
  - Method decorators
    - `@Cooldown(length: number)` - Only allows the function to be executed once every `length` seconds
    - `@Memoize()` - Cache the first result the function returns and return the cached result from then on out
    - `@StudioOnly()` - Only allows the function to be executed in studio
    - `@LogBenchmark(formatter)` - Logs how long the function took to execute, use `formatter` callback to customize message
    - `@OnInput(binding: RawActionEntry | RawActionEntry[], actionName?: string, options?: ActionOptions)` - Binds an input to the function, with an optional action name to bind a function to the input's release
    - `@OnAxisInput(binding: AxisActionEntry, actionName?: string)` - Binds an axis input to the function, with an optional action name to bind a function to the input's release
    - `@OnInputRelease(actionName: string)` - Binds an input releasing to the function given the same action name provided to `@OnInput`
    - `@Retry(times: number, delay?: number, retryCondition?: (fn: () => void) => boolean` - Retries the function every time `retryCondition` returns true, `times` times, with `delay` seconds in between
    - `@ValidateReturn(validator: (returnValue: unknown) => boolean, whenInvalid?: (returnValue: unknown) => void)` - Calls `whenInvalid` when `validator` returns false
    - `@SpawnTask()` - Wraps the method in a `task.spawn`
    - `@LinkRemote(remote: ClientReceiver)` - Binds a method to a remote being fired
    - `@LinkSerializedRemote(remote: ClientReceiver, deserializer: Serializer)` - Binds a method to a remote being fired and automatically deserializes arguments
- Custom lifecycle hooks:
  - OnCharacterAdd/OnCharacterRemove
  - OnPlayerJoin/OnPlayerLeave
  - OnDataLoad/OnDataUpdate
  - LogStart (logs when a singleton/component is started)

## Usage

First, create the folder on your computer where you want your project to be stored.
Then, open a terminal at that directory and run the following commands:

```bash
npx degit R-unic/flamework-template
npm i
```

That's it! The template has been installed. For further information on how to use Flamework in your project, please see [here](https://flamework.fireboltofdeath.dev/).

## Setup

### Firebase
You need a `FIREBASE_URL` and `FIREBASE_AUTH` value inside of a DataStore named `EnvironmentInfo`. You can get `FIREBASE_URL` by simply creating a Real-Time Database on Firebase, then copying this link.
![copy-link-ui-on-firebase](https://github.com/R-unic/flamework-template/assets/49625808/c4866db0-f05d-4da3-8856-11365c843fa6)

To get `FIREBASE_AUTH` you need to first click the settings icon next to "Project Overview", Click "Project settings", then click "Service accounts". Click the "Database secrets" tab under the text "Legacy credentials", then copy the secret that should be there by default. If there is no secret there, press "Add secret".

You can easily set these values by running this in your Roblox command bar:
```lua
game:GetService("DataStoreService"):GetDataStore("EnvironmentInfo"):SetAsync("FIREBASE_URL", "https://database-name-default-rtdb.firebaseio.com/")
game:GetService("DataStoreService"):GetDataStore("EnvironmentInfo"):SetAsync("FIREBASE_AUTH", "tHiSisAveRYrEaLFiRebAsEAuTHkeY")
```

### Creator/Developer Permissions
Add your user ID to the [`DevID`](https://github.com/R-unic/flamework-template/blob/master/src/shared/constants.ts#L4) enum.
This is fairly important because this is what a few systems use to detect whether or not the player has developer permissions.

### Automatically Index Children
This is taken directly from the Roblox TS website because I think it's worth knowing about. What if you wanted to access something you're currently storing inside of the Workspace service in Studio? Well, Roblox TS would have no clue of that thing existing inside of there. Luckily, you can solve this issue extremely easily.

It uses the [io-serve](https://www.npmjs.com/package/io-serve) package (optional, but quite useful) and the [rbxts-object-to-tree
](https://create.roblox.com/store/asset/3379119778/rbxtsobjecttotree?externalSource=www) Roblox Studio plugin.

You can find the full guide [here](https://roblox-ts.com/docs/guides/indexing-children#rbxts-object-to-tree-plugin-by-validark).
