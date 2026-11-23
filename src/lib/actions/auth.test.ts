import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  user: null as { id: string } | null,
  updateUser: vi.fn(),
  redirect: vi.fn((to: string) => {
    throw new Error(`NEXT_REDIRECT:${to}`);
  }),
}));

vi.mock("next/navigation", () => ({ redirect: m.redirect }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: m.user } }),
      updateUser: m.updateUser,
    },
  }),
}));

import { resetPassword } from "./auth";

const form = (password: string, confirm = password) => {
  const f = new FormData();
  f.set("password", password);
  f.set("confirm_password", confirm);
  return f;
};

describe("resetPassword", () => {
  beforeEach(() => {
    m.user = { id: "u1" };
    m.updateUser.mockReset().mockResolvedValue({ error: null });
  });

  it("should update the password and redirect to the account page", async () => {
    await expect(resetPassword(undefined, form("newpass123"))).rejects.toThrow("NEXT_REDIRECT:/account");

    expect(m.updateUser).toHaveBeenCalledWith({ password: "newpass123" });
  });

  it("should return an error when the passwords do not match", async () => {
    const res = await resetPassword(undefined, form("newpass123", "different1"));

    expect(res).toMatchObject({ success: false, errors: { confirm_password: ["Passwords do not match."] } });
    expect(m.updateUser).not.toHaveBeenCalled();
  });

  it.each([
    ["is too short", "abc1"],
    ["has no number", "onlyletters"],
    ["has no letter", "12345678"],
  ])("should return a validation error when the password %s", async (_name, password) => {
    const res = await resetPassword(undefined, form(password));

    expect(res).toMatchObject({ success: false, errors: { password: expect.any(Array) } });
    expect(m.updateUser).not.toHaveBeenCalled();
  });

  it("should return an error when there is no session (expired or invalid link)", async () => {
    m.user = null;

    const res = await resetPassword(undefined, form("newpass123"));

    expect(res).toMatchObject({ success: false, message: expect.stringMatching(/expired/i) });
    expect(m.updateUser).not.toHaveBeenCalled();
  });

  it("should return the Supabase error when the update fails", async () => {
    m.updateUser.mockResolvedValue({ error: { message: "New password should be different." } });

    const res = await resetPassword(undefined, form("newpass123"));

    expect(res).toEqual({ success: false, message: "New password should be different." });
  });
});
