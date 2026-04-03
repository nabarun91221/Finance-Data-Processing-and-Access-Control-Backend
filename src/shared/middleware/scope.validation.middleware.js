import Roles from "../utils/roles.js";

export const scopeValidation = (...requiredScopes) => {
  return (req, res, next) => {
    const userScopes = Roles.getPermissionOf(req.user.role) || [];

    const allowed = requiredScopes.every(scope =>
      userScopes.includes(scope)
    );

    if (!allowed) {
      return res.status(403).json({
          success: false,
          message:"insufficient scope resource access denied"
      });
    }

    next();
  };
};
export default scopeValidation
