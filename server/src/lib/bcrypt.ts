import bcrypt from "bcrypt";

export const bcryptFunc = {
  hashPassword: async (inputPassword: string) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(inputPassword, saltRounds);
    return hashedPassword;
  },

  comparePassword: async (inputPassword: string, storedPassword: string) => {
    const comparedPassword = await bcrypt.compare(
      inputPassword,
      storedPassword,
    );
    return comparedPassword;
  },
};
