import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { account } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Check if a repository is a React project (but NOT Next.js)
async function isReactProject(repo: any, accessToken: string): Promise<boolean> {
  // Only check JS/TS repositories
  if (!repo.language || !["JavaScript", "TypeScript"].includes(repo.language)) {
    return false;
  }

  try {
    const packageResponse = await fetch(
      `https://api.github.com/repos/${repo.full_name}/contents/package.json`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "EzDeploy-App",
        },
      }
    );

    if (!packageResponse.ok) {
      return false;
    }

    const packageData = await packageResponse.json();
    const packageContent = JSON.parse(
      Buffer.from(packageData.content, "base64").toString("utf-8")
    );

    const dependencies = {
      ...packageContent.dependencies,
      ...packageContent.devDependencies,
    };    // Exclude Next.js projects
    if (dependencies.next || dependencies["@next/core"]) {
      return false;
    }

    // Check if it's a React project
    return !!(
      dependencies.react ||
      dependencies["@types/react"] ||
      dependencies["create-react-app"] ||
      (dependencies.vite && (dependencies["@vitejs/plugin-react"] || dependencies["@vitejs/plugin-react-swc"]))
    );
  } catch (error) {
    console.log(`Could not check package.json for ${repo.full_name}:`, error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the GitHub access token
    const gitHubAccount = await db
      .select()
      .from(account)
      .where(
        and(
          eq(account.userId, session.user.id),
          eq(account.providerId, "github")
        )
      )
      .limit(1);

    if (!gitHubAccount.length || !gitHubAccount[0].accessToken) {
      return NextResponse.json(
        {
          error: "GitHub access token not found. Please connect your GitHub account.",
        },
        { status: 404 }
      );
    }

    const accessToken = gitHubAccount[0].accessToken;

    // Fetch repositories from GitHub API
    const response = await fetch(
      "https://api.github.com/user/repos?sort=updated&per_page=100",
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "EzDeploy-App",
        },
      }
    );

    if (!response.ok) {
      console.error("GitHub API error:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Failed to fetch repositories from GitHub" },
        { status: response.status }
      );
    }

    const repos = await response.json();

    // Filter for React projects (excluding Next.js)
    const reactRepos = [];
    for (const repo of repos) {
      if (await isReactProject(repo, accessToken)) {
        reactRepos.push({
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          html_url: repo.html_url,
          clone_url: repo.clone_url,
          ssh_url: repo.ssh_url,
          private: repo.private,
          fork: repo.fork,
          language: repo.language,
          stargazers_count: repo.stargazers_count,
          updated_at: repo.updated_at,
          pushed_at: repo.pushed_at,
          default_branch: repo.default_branch,
          owner: {
            login: repo.owner.login,
            avatar_url: repo.owner.avatar_url,
          },
        });
      }
    }

    return NextResponse.json({ repositories: reactRepos });
  } catch (error) {
    console.error("Error fetching GitHub repositories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
