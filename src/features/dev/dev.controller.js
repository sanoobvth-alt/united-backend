import { devService } from "./dev.service.js";

export const devController = {
  async listBranches(_req, res) {
    const branches = await devService.listBranches();
    res.json({
      success: true,
      data: branches,
      message:
        "Branch passwords are stored as hashes and cannot be retrieved. Use the branch password reset flow to set a new password.",
    });
  },
};
