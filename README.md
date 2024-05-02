# My Flamework Template

This is my own pre-configured template you can use for your Roblox TypeScript projects that use [Flamework](https://fireboltofdeath.dev/docs/flamework/).
It aims to be decently simple and lightweight but still provide as many reusable things as possible to create any type of game. React/Roact is not included, you'll have to install that yourself if you want it.


## Features
- Frontend:
  - Custom movement system (optional)
  - Custom mouse controller
  - Procedural animation system for cameras or models with these animations included:
    - Landing
    - Mouse sway
    - Walk cycle
  - `CharacterController` for easily retrieving character, root, & humanoid
  - Custom camera controller to switch between cams on the fly with these cam components included:
    - Default (default roblox cam)
    - FirstPerson (default roblox cam locked to 1P)
    - Aerial
    - Fixed
    - FlyOnTheWall
    - FirstPersonAnimated (uses procedural animation system)
  - UI:
    - Customizable control panel made with Iris
      - Movement and camera system mods already included
    - Animation components (Gradient, Rotation, Transparency, Scale, SpringScale)
    - Effect controller (such as fading black in/out)
- Backend:
  - Cmdr for custom commands
  - Graceful Firebase API instead of DataStoreService
  - Discord webhook logger
  - Product/gamepass transaction handler
  - Roblox API service
  - GitHub info service
  - Scheduling service (execute a fn on a loop with a cooldown, e.x. `scheduling.every.second.Connect(...)`)
- Tons of utility functions and classes (comma format, abbreviation, repr, array shuffle/flatten/reverse, springs, sin/cos waves, bitfields, etc.)
- Included logger
- Custom lifecycle hooks:
  - OnPlayerJoin/OnPlayerLeave
  - OnDataUpdate
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

You need to create a `.env` file in your repository.

### Firebase
You need a `FIREBASE_URL` and `FIREBASE_AUTH` value in your `.env`. You can get `FIREBASE_URL` by simply creating a Real-Time Database on Firebase, then copying this link.
![CopyLinkUIOnFirebase](https://github.com/R-unic/flamework-template/assets/49625808/c4866db0-f05d-4da3-8856-11365c843fa6)

To get `FIREBASE_AUTH` you need to first click the settings icon next to "Project Overview", Click "Project settings", then click "Service accounts". Click the "Database secrets" tab under the text "Legacy credentials", then copy the secret that should be there by default. If there is no secret there, press "Add secret".

Your `.env` file should now look something like this:
```env
FIREBASE_URL=https://database-name-default-rtdb.firebaseio.com/
FIREBASE_AUTH=tHiSisAfaKEFiRebAsEAuTHkeY
```

### Discord Webhook
There is a service to log messages to Discord via a webhook. However, it needs a `DISCORD_WEBHOOK` value in the `.env`.
To get your `DISCORD_WEBHOOK` value: Create a Discord webhook and replace "discord.com" with "hooks.hyra.io"

### Creator/Developer Permissions
If you created the game, you need to replace the user ID given to [`CREATOR_ID`](https://github.com/R-unic/flamework-template/blob/master/src/shared/constants.ts#L1) with your own.
Otherwise you need to add your user ID to the [`DEVELOPERS`](https://github.com/R-unic/flamework-template/blob/master/src/shared/constants.ts#L2) array.
This is relatively important because this is what a handful of systems use to detect whether or not the player has developer permissions.

### Automatically Index Children
This is taken directly from the Roblox TS website because I think it's worth knowing about. What if you wanted to access something you're currently storing inside of the Workspace service in Studio? Well, Roblox TS would have no clue of that thing existing inside of there. Luckily, you can solve this issue extremely easily.

It uses the [io-serve](https://www.npmjs.com/package/io-serve) package (optional, but quite useful) and the [rbxts-object-to-tree
](https://create.roblox.com/store/asset/3379119778/rbxtsobjecttotree?externalSource=www) Roblox Studio plugin.

You can find the full guide [here](https://roblox-ts.com/docs/guides/indexing-children#rbxts-object-to-tree-plugin-by-validark).
