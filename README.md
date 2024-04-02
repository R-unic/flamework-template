# My Flamework Template

This is my own pre-configured template you can use for your Roblox TypeScript projects that use [Flamework](https://fireboltofdeath.dev/docs/flamework/).
It includes a few extra utilities.

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
You need a `FIREBASE_URL` and `FIREBASE_AUTH` value. You can get `FIREBASE_URL` by simply creating a Real-Time Database on Firebase, then copying this link. ![CopyLinkUIOnFirebase](https://github.com/R-unic/flamework-template/assets/49625808/c4866db0-f05d-4da3-8856-11365c843fa6)

To get `FIREBASE_AUTH` you need to first click the settings icon next to "Project Overview", Click "Project settings", then click "Service accounts". Click the "Database secrets" tab under the text "Legacy credentials", then copy the secret that should be there by default. If there is no secret there, press "Add secret".

Your `.env` file should now look something like this:
```env
FIREBASE_URL=https://database-name-default-rtdb.firebaseio.com/
FIREBASE_AUTH=tHiSisAfaKEFiRebAsEAuTHkeY
```

### Discord Webhook
There is a service to log messages to Discord via a webhook. However, it needs a `DISCORD_WEBHOOK` value in the `.env`.
To get your `DISCORD_WEBHOOK` value: Create a Discord webhook and replace "discord.com" with "hooks.hyra.io"