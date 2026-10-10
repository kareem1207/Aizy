import { useUserStore } from "@/store/userStore";
import { request } from "@/lib/api";
import { TOKEN_KEY } from "@/lib/token";

jest.mock("@/lib/api", () => ({ request: jest.fn() }));

const ok = (data) => ({ ok: true, status: 200, data, message: data.message || "" });
const bad = (message, data = {}) => ({ ok: false, status: 400, data, message });

beforeEach(() => {
  request.mockReset();
  useUserStore.setState({ user: null, users: [], bannedUsers: [] });
});

describe("userStore", () => {
  test("loginUser stores the session token and the user", async () => {
    request.mockResolvedValue(ok({ success: true, message: "Login successful", data: { id: 1, name: "A" }, token: "tok" }));
    const events = jest.fn();
    window.addEventListener("aizy-auth", events);

    const res = await useUserStore.getState().loginUser({ email: "a@b.co", password: "x", userType: "customer" });

    expect(res.success).toBe(true);
    expect(localStorage.getItem(TOKEN_KEY)).toBe("tok");
    expect(useUserStore.getState().user).toEqual({ id: 1, name: "A" });
    expect(events).toHaveBeenCalled();
    expect(request).toHaveBeenCalledWith("/auth/login", expect.objectContaining({ method: "POST", body: { email: "a@b.co", password: "x", role: "customer" } }));
    window.removeEventListener("aizy-auth", events);
  });

  test("loginUser surfaces the server message and ban details", async () => {
    request.mockResolvedValue(bad("Your account has been banned", { reason: "spam", bannedUntil: null }));
    const res = await useUserStore.getState().loginUser({ email: "a@b.co", password: "x" });
    expect(res).toMatchObject({ success: false, message: "Your account has been banned", reason: "spam" });
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  test("createUser validates locally and forwards the email proof", async () => {
    expect((await useUserStore.getState().createUser({ email: "a@b.co" })).success).toBe(false);
    expect(request).not.toHaveBeenCalled();

    request.mockResolvedValue(ok({ success: true, data: { id: 2 }, token: "t2" }));
    const res = await useUserStore.getState().createUser({ name: "N", email: "n@b.co", password: "longenough", userType: "seller", proof: "pf" });
    expect(res.success).toBe(true);
    expect(request.mock.calls[0][1].body).toMatchObject({ role: "seller", proof: "pf" });
    expect(localStorage.getItem(TOKEN_KEY)).toBe("t2");
  });

  test("logoutUser clears the token and state", () => {
    localStorage.setItem(TOKEN_KEY, "tok");
    useUserStore.setState({ user: { id: 1 } });
    useUserStore.getState().logoutUser();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(useUserStore.getState().user).toBeNull();
  });

  test("OTP helpers return the dev/demo code and the verification proof", async () => {
    request.mockResolvedValueOnce(ok({ success: true, demoOtp: "123456" }));
    expect(await useUserStore.getState().generateOtp("a@b.co")).toMatchObject({ success: true, demoOtp: "123456" });
    request.mockResolvedValueOnce(ok({ success: true, devOtp: "654321" }));
    expect((await useUserStore.getState().generateOtp("a@b.co")).demoOtp).toBe("654321");
    request.mockResolvedValueOnce(ok({ success: true, proof: "pp" }));
    expect(await useUserStore.getState().verifyOtp("a@b.co", "123456")).toEqual({ success: true, proof: "pp" });
    request.mockResolvedValueOnce(bad("Invalid OTP!"));
    expect(await useUserStore.getState().verifyOtp("a@b.co", "000000")).toEqual({ success: false, message: "Invalid OTP!" });
  });

  test("admin calls require a stored token", async () => {
    request.mockResolvedValue({ ok: false, status: 401, data: {}, message: "Authentication required" });
    const res = await useUserStore.getState().getAllUsers();
    expect(res).toEqual({ success: false, message: "Authentication required" });
  });

  test("banUser refreshes the banned list afterwards", async () => {
    request.mockResolvedValueOnce(ok({ success: true, message: "User banned successfully" }));
    request.mockResolvedValueOnce(ok({ success: true, data: [{ id: 1, userId: 5 }] }));
    const res = await useUserStore.getState().banUser(5, "spam", 7);
    expect(res.success).toBe(true);
    expect(useUserStore.getState().bannedUsers).toHaveLength(1);
  });
});
