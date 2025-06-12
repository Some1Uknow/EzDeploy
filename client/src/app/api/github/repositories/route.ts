import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { account } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Cache for repository data (in production, consider Redis or similar)
const repoCache = new Map<string, { data: any[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to check if a repository is likely a React project based on basic info
function isLikelyReactProject(repo: any): boolean {
  // Basic filtering before making API calls
  if (!repo.language || !['JavaScript', 'TypeScript'].includes(repo.language)) {
    return false;
  }
  
  // Check repository name and description for React indicators
  const nameAndDesc = `${repo.name} ${repo.description || ''}`.toLowerCase();
  const hasReactKeywords = nameAndDesc.includes('react') || 
                          nameAndDesc.includes('next') || 
                          nameAndDesc.includes('jsx') ||
                          nameAndDesc.includes('tsx') ||
                          nameAndDesc.includes('frontend') ||
                          nameAndDesc.includes('webapp') ||
                          nameAndDesc.includes('website');
  
  return hasReactKeywords;
}

// Helper function to process repositories in batches
async function processRepositoriesInBatches(
  repos: any[], 
  accessToken: string, 
  batchSize: number = 5
): Promise<any[]> {
  const reactRepos: any[] = [];
  
  // First, filter repositories that are likely React projects
  const candidateRepos = repos.filter(isLikelyReactProject);
  
  // If no likely candidates and we have JS/TS repos, check a subset of all JS/TS repos
  const jstsRepos = candidateRepos.length === 0 
    ? repos.filter(repo => repo.language && ['JavaScript', 'TypeScript'].includes(repo.language)).slice(0, 20)
    : candidateRepos;
  
  // Process in batches to avoid overwhelming the GitHub API
  for (let i = 0; i < jstsRepos.length; i += batchSize) {
    const batch = jstsRepos.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (repo) => {
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

        if (packageResponse.ok) {
          const packageData = await packageResponse.json();
          const packageContent = JSON.parse(
            Buffer.from(packageData.content, 'base64').toString('utf-8')
          );

          // Check if it's a React project
          const dependencies = {
            ...packageContent.dependencies,
            ...packageContent.devDependencies,
          };

          const isReactProject = 
            dependencies.react ||
            dependencies['@types/react'] ||
            dependencies['create-react-app'] ||
            dependencies.vite ||
            (dependencies['@vitejs/plugin-react'] || dependencies['@vitejs/plugin-react-swc']) ||
            packageContent.scripts?.start?.includes('react-scripts') ||
            packageContent.scripts?.dev?.includes('vite') ||
            packageContent.scripts?.build?.includes('react-scripts') ||
            packageContent.scripts?.build?.includes('vite');

          if (isReactProject) {
            return repo;
          }
        }
        return null;
      } catch (error) {
        console.log(`Could not check package.json for ${repo.full_name}:`, error);
        return null;
      }
    });

    // Wait for the current batch to complete
    const batchResults = await Promise.all(batchPromises);
    const validResults = batchResults.filter(result => result !== null);
    reactRepos.push(...validResults);
    
    // Add a small delay between batches to be respectful to GitHub API
    if (i + batchSize < jstsRepos.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return reactRepos;
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

    // Get the GitHub access token directly from the account table
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
          error:
            "GitHub access token not found. Please connect your GitHub account.",
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
    }    const repos = await response.json();

    // Filter for React projects by checking package.json
    const reactRepos = [];
    
    for (const repo of repos) {
      // Skip if not JavaScript/TypeScript or if it's a fork (unless you want forks)
      if (!repo.language || !['JavaScript', 'TypeScript'].includes(repo.language)) {
        continue;
      }

      try {
        // Fetch package.json from the repository
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

        if (packageResponse.ok) {
          const packageData = await packageResponse.json();
          const packageContent = JSON.parse(
            Buffer.from(packageData.content, 'base64').toString('utf-8')
          );

          // Check if it's a React project
          const dependencies = {
            ...packageContent.dependencies,
            ...packageContent.devDependencies,
          };

          const isReactProject = 
            dependencies.react ||
            dependencies['@types/react'] ||
            dependencies['create-react-app'] ||
            dependencies.vite ||
            (dependencies['@vitejs/plugin-react'] || dependencies['@vitejs/plugin-react-swc']) ||
            packageContent.scripts?.start?.includes('react-scripts') ||
            packageContent.scripts?.dev?.includes('vite') ||
            packageContent.scripts?.build?.includes('react-scripts') ||
            packageContent.scripts?.build?.includes('vite');

          if (isReactProject) {
            reactRepos.push(repo);
          }
        }
      } catch (error) {
        // If we can't fetch package.json, skip this repo
        console.log(`Could not check package.json for ${repo.full_name}:`, error);
        continue;
      }
    }

    // Transform the filtered data to include only necessary fields
    const transformedRepos = reactRepos.map((repo: any) => ({
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
    }));

    return NextResponse.json({ repositories: transformedRepos });
  } catch (error) {
    console.error("Error fetching GitHub repositories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
