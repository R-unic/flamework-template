import { Cmdr } from "@rbxts/cmdr";

const parent = <Folder>script.Parent;
Cmdr.RegisterDefaultCommands();
Cmdr.RegisterCommandsIn(parent.WaitForChild<Folder>("commands"));
Cmdr.RegisterTypesIn(parent.WaitForChild<Folder>("types"));
Cmdr.RegisterHooksIn(parent.WaitForChild<Folder>("hooks"))