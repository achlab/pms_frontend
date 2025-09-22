export interface StaticLogin {
  role: "super_admin" | "landlord" | "caretaker" | "tenant"
  email: string
  password: string
}


const staticLoginsTyped = require("../static-logins.json") as StaticLogin[];

export function validateStaticLogin(email: string, password: string): StaticLogin | null {
  return (staticLoginsTyped.find(
    (login) => login.email === email && login.password === password
  ) as StaticLogin | undefined) || null;
}
