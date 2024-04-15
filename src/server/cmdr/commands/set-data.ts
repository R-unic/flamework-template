import type { CommandDefinition } from "@rbxts/cmdr";

export = identity<CommandDefinition>({
  Name: "set-data",
  Aliases: ["data-set"],
  Description: "Set the data at the given directory to the given value",
  Group: "Dev",
  Args: [
    {
      Type: "string",
      Name: "Directory",
      Description: "Directory of the data being set",
    },
    {
      Type: "any",
      Name: "Value",
      Description: "The value to set the data at the given directory to",
    }
  ],
});