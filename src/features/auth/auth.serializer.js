export const serializeSession = ({ user, token, userType }) => ({
  token,
  user: {
    id: user.id,
    name: user.name,
    userType,
    ...(userType === "BRANCH" ? { branchId: user.id, code: user.code } : {}),
  },
});
