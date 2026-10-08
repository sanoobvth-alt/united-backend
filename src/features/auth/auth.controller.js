import { authService } from "./auth.service.js";
export const authController = {
  async adminLogin(req, res) {
    const data = await authService.adminLogin(req.body);
    res.json({
      success: true,
      message: "Admin signed in successfully",
      data,
    });
  },
  async branchLogin(req, res) {
    const data = await authService.branchLogin(req.body);
    res.json({
      success: true,
      message: "Branch signed in successfully",
      data,
    });
  },
};
