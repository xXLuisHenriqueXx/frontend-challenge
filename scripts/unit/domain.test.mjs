import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createServer } from "vite";
import { AxiosError } from "axios";

const vite = await createServer({
  configFile: false,
  resolve: { tsconfigPaths: true },
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, hmr: false, ws: false },
  appType: "custom",
});
after(() => vite.close());
const load = (p) => vite.ssrLoadModule(`/src/${p}`);
const money = await load("shared/lib/money.ts");
const validation = await load("shared/lib/validation.ts");
const errors = await load("shared/lib/errors.ts");
const { parseSearch } = await load("features/catalog/api/search.ts");
const { queryKeys } = await load("shared/api/query-keys.ts");
const { eventGate } = await load("features/realtime/api/event-gate.ts");
const { receiptState } = await load("features/orders/lib/receipt-state.ts");

for (const [value, expected] of [
  ["0", 0n],
  ["1", 1000000000000000000n],
  ["0.000000000000000001", 1n],
  ["1.206", 1206000000000000000n],
]) {
  test(`ETH units preserve ${value}`, () =>
    assert.equal(money.units(value), expected));
}
test("ETH round trip at 18 decimal places", () =>
  assert.equal(
    money.decimal(money.units("123456789.123456789012345678")),
    "123456789.123456789012345678",
  ));
test("decimal formatting removes fractional trailing zeroes", () =>
  assert.equal(money.decimal(1206000000000000000n), "1.206"));
test("quantity multiplication does not round binary floats", () =>
  assert.equal(money.multiply("0.1", 3), "0.3"));
test("quote arithmetic retains exact fee", () =>
  assert.equal(
    money.decimal(money.units("1.19") + money.units("0.016")),
    "1.206",
  ));
test("multiplication by zero", () =>
  assert.equal(money.multiply("1.19", 0), "0"));
test("password mismatch preserves the existing error", () =>
  assert.throws(
    () => validation.requireMatchingPasswords("a", "b"),
    /As senhas devem coincidir/,
  ));
test("matching passwords pass", () =>
  assert.doesNotThrow(() => validation.requireMatchingPasswords("a", "a")));
for (const type of ["image/png", "image/jpeg", "image/webp"]) {
  test(`avatar allows ${type} at the byte limit`, () =>
    assert.ok(validation.isValidAvatar({ size: 1000000, type })));
}
test("avatar rejects oversized files", () =>
  assert.equal(
    validation.isValidAvatar({ size: 1000001, type: "image/png" }),
    false,
  ));
test("avatar rejects SVG", () =>
  assert.equal(
    validation.isValidAvatar({ size: 100, type: "image/svg+xml" }),
    false,
  ));
const validity = {
  valueMissing: false,
  typeMismatch: false,
  tooShort: false,
  patternMismatch: false,
};
test("required message takes priority", () =>
  assert.equal(
    validation.validationMessage(
      { ...validity, valueMissing: true, typeMismatch: true },
      8,
      "fallback",
    ),
    "Preencha este campo.",
  ));
test("minimum length message uses the field constraint", () =>
  assert.equal(
    validation.validationMessage(
      { ...validity, tooShort: true },
      8,
      "fallback",
    ),
    "Use pelo menos 8 caracteres.",
  ));
test("native validity fallback is preserved", () =>
  assert.equal(validation.validationMessage(validity, 0, "native"), "native"));
test("API errors retain code, fields and status", () => {
  const error = new AxiosError(
    "Request failed",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    {
      status: 422,
      data: {
        code: "VALIDATION",
        message: "Revise os campos",
        fields: { email: "Inválido" },
      },
    },
  );
  assert.deepEqual(errors.normalizeError(error), {
    kind: "api",
    status: 422,
    code: "VALIDATION",
    message: "Revise os campos",
    fields: { email: "Inválido" },
  });
  assert.deepEqual(errors.errorsFor(error), { email: "Inválido" });
});
test("network errors remain distinguishable", () =>
  assert.deepEqual(errors.normalizeError(new AxiosError("Network Error")), {
    kind: "network",
    message: "Falha de conexão. Tente novamente.",
  }));
test("unexpected Error keeps its message", () =>
  assert.equal(errors.message(new Error("Falha local")), "Falha local"));
test("unknown error has no field errors", () =>
  assert.deepEqual(errors.errorsFor(null), {}));
test("search sanitizes pagination and sort", () =>
  assert.deepEqual(
    {
      page: parseSearch({ page: -1 }).page,
      sort: parseSearch({ sort: "invalid" }).sort,
    },
    { page: 1, sort: "recent" },
  ));
test("search keeps decimal filters as strings", () =>
  assert.equal(
    parseSearch({ min: "0.000000000000000001" }).min,
    "0.000000000000000001",
  ));
test("query key factory retains public tuples and prefixes", () => {
  const search = parseSearch({});
  assert.deepEqual(queryKeys.session, ["session"]);
  assert.deepEqual(queryKeys.catalog(search), ["nfts", search]);
  assert.deepEqual(queryKeys.nft("1"), ["nft", "1"]);
  assert.deepEqual(queryKeys.private, ["private"]);
  assert.deepEqual(queryKeys.user("ana"), ["private", "ana"]);
  for (const key of ["cart", "quote", "favorites", "wallets", "profile"])
    assert.deepEqual(queryKeys[key]("ana"), ["private", "ana", key]);
  assert.deepEqual(queryKeys.order("ana", "order-1"), [
    "private",
    "ana",
    "order",
    "order-1",
  ]);
});
const event = (
  eventId,
  version,
  status = "pending",
  resourceId = "order-1",
) => ({ eventId, version, resourceId, data: { status } });
test("event gate rejects duplicates and older versions", () => {
  const accept = eventGate();
  assert.equal(accept("order.updated", event("a", 2)), true);
  assert.equal(accept("order.updated", event("a", 3)), false);
  assert.equal(accept("order.updated", event("b", 1)), false);
  assert.equal(accept("order.updated", event("c", 3)), true);
});
test("terminal order never regresses to pending", () => {
  const accept = eventGate();
  assert.equal(accept("order.updated", event("a", 2, "confirmed")), true);
  assert.equal(accept("order.updated", event("b", 3)), false);
  assert.equal(
    accept("order.updated", event("c", 1, "pending", "order-2")),
    true,
  );
});
for (const [status, expected] of [
  ["pending", "pending"],
  ["confirmed", "success"],
  ["refused", "failed"],
]) {
  test(`receipt discriminates ${status}`, () =>
    assert.equal(receiptState({ status }).status, expected));
}
