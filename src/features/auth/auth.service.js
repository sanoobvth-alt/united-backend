import bcrypt from "bcryptjs";
import { ApiError } from "../../utils/ApiError.js";
import { generateToken } from "../../utils/generateToken.js";
import { authModel } from "./auth.model.js";
import { serializeSession } from "./auth.serializer.js";

async function login(user, userType, password) {
  if (
    !user ||
    user.status !== "ACTIVE" ||
    !(await bcrypt.compare(password, user.passwordHash))
  )
    throw new ApiError(401, "Invalid credentials");
  return serializeSession({
    user,
    userType,
    token: generateToken({
      id: user.id,
      userType,
      branchId: userType === "BRANCH" ? user.id : null,
    }),
  });
}
export const authService = {
  async adminLogin(data) {
    return login(await authModel.findAdmin(data.email), "ADMIN", data.password);
  },
  async branchLogin(data) {
    return login(
      await authModel.findBranch(data.username),
      "BRANCH",
      data.password,
    );
  },
};
