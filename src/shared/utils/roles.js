export const ROLES = Object.freeze(["ADMIN", "ANALYST", "USER"]);

const roleScopes = Object.freeze({
  ADMIN: [
    "read:financial-records",
    "write:financial-records",
    "update:financial-records",
    "delete:financial-records",

    "read:financial-records-categories",
    "write:financial-records-categories",
    "update:financial-records-categories",
    "delete:financial-records-categories",

    "read:users",
    "write:users",
    "update:users",
    "delete:users",

    "read:budgets",
    "write:budgets",
    "update:budgets",
    "delete:budgets",

    "promote:role:user",

    "read:analytics",
    "read:insight",

    "read:audit-logs"

  ],
  ANALYST: [
    "read:financial-records-categories",
    "read:financial-records",
    "read:analytics",
    "read:insight"

  ],
  USER: [
    "read:analytics",
  ]
});
class Roles
{
  constructor()
  {
    this.roles = roleScopes;
  }
  getPermissionOf = (role) =>
  {
    return this.roles[role];
  }
}

export default new Roles();
