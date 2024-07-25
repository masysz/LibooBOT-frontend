import { initPlasmicLoader } from "@plasmicapp/loader-react";
export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: "fX43sfRHZW14jeUVCZQ9pg",  // ID of a project you are using
      token: "NNa8Kt9Tu25bxmAQYPtJLegoHrHVJaslQQ0IKa6WpRgzUaYrj3rHhk0pokUMDJQhK2bqxfldhzb8eCkLzDA"  // API token for that project
    }
  ],
  // Fetches the latest revisions, whether or not they were unpublished!
  // Disable for production to ensure you render only published changes.
  preview: true,
})