import { assertedEnvVar } from "~/utils/environment.server";

export async function getGhSponsors(): Promise<
    | {
          node: {
              id: string;
              name: string;
              url: string;
              avatarUrl: string;
          };
      }[]
    | null
> {
    const response = await fetch(`https://api.github.com/graphql`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `token ${assertedEnvVar("GITHUB_TOKEN")}`,
        },
        body: JSON.stringify({
            query: `query SponsorQuery {
        viewer {
          login
          sponsors(first: 100) {
            edges {
              node {
                ... on User {
                  id
                  name
                  url
                  avatarUrl
                }
                ... on Organization {
                  id
                  name
                  url
                  avatarUrl
                }
              }
            }
          }
        }
      }`,
        }),
    });
    if (response?.ok) {
        const data = await response.json();
        return data.data.viewer.sponsors.edges;
    }
    return null;
}
