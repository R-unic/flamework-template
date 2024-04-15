import { type OnInit, Service } from "@flamework/core";
import { HttpService as HTTP } from "@rbxts/services";

import { Functions } from "server/network";
import type { LogStart } from "shared/hooks";
import type { GitHubCommitResponse, GitHubInfo, GitHubTag } from "shared/structs/github";

@Service()
export class GitHubInfoService implements OnInit, LogStart {
  // Put your repo name here! e.g. R-unic/tabletop-lounge
  private readonly repository = "R-unic/tabletop-lounge"
  private readonly baseURL = "https://api.github.com/repos";

  public onInit(): void {
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