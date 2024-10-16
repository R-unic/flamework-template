import { type OnInit, Service } from "@flamework/core";
import { HttpService as HTTP } from "@rbxts/services";
import { $package } from "rbxts-transform-debug";

import type { LogStart } from "shared/hooks";
import { Functions } from "server/network";
import type { GitHubCommitResponse, GitHubInfo, GitHubTag } from "shared/structs/github";

@Service()
export class GitHubInfoService implements OnInit, LogStart {
  // Set your repository link in your package.json or this will not work
  private readonly repository: string;
  private readonly baseURL = "https://api.github.com/repos";

  public constructor() {
    const pieces = $package.repository!.url!.split("/");
    const name = pieces.pop()?.gsub(".git", "")[0]!;
    const author = pieces.pop()!;
    this.repository = `${author}/${name}`;
  }

  public onInit(): void {
    if (this.repository === undefined)
      error("Issue fetching data from GitHub: No repository URL was provided in package.json");

    const repeatTryGet = (): GitHubInfo => {
      const [success, info] = pcall(() => this.retrieve());
      if (!success) {
        task.wait();
        return repeatTryGet();
      }
      return info;
    };

    Functions.github.getInfo.setCallback(repeatTryGet);
  }

  public retrieve(): GitHubInfo {
    const tags = this.request<GitHubTag[]>("tags");
    const commits = this.request<GitHubCommitResponse[]>("commits").map(res => {
      res.commit.tree.sha = res.sha;
      return res.commit;
    });
    return { tags, commits };
  }

  private request<T>(path: string): T {
    return <T>HTTP.JSONDecode(HTTP.GetAsync(`${this.baseURL}/${this.repository}/${path}`, true));
  }
}