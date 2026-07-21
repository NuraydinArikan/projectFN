/**
 * Uçtan uca editör yazma testi (Playwright).
 * Önkoşul: npm run dev @ :3000, .env.local dolu.
 */
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnv() {
  const raw = fs.readFileSync(path.join(root, ".env.local"), "utf8");
  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .filter((l) => l && !l.startsWith("#") && l.includes("="))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
      })
  );
}

const env = loadEnv();
const BASE = process.env.BASE_URL || "http://localhost:3000";
const EMAIL = process.env.E2E_EMAIL || "editor.test@projectfn.local";
const PASSWORD = process.env.E2E_PASSWORD || "TestEditor123!";

const results = [];
function ok(name, detail = "") {
  results.push({ name, pass: true, detail });
  console.log(`✓ ${name}${detail ? " — " + detail : ""}`);
}
function fail(name, detail = "") {
  results.push({ name, pass: false, detail });
  console.error(`✗ ${name}${detail ? " — " + detail : ""}`);
}

async function ensureUser() {
  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const list = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (list.error) throw new Error("listUsers: " + list.error.message);
  let user = (list.data?.users || []).find((u) => u.email === EMAIL);
  if (!user) {
    const created = await admin.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
    });
    if (created.error) throw new Error("createUser: " + created.error.message);
    user = created.data.user;
    ok("Test kullanıcısı oluşturuldu", user.id);
  } else {
    await admin.auth.admin.updateUserById(user.id, {
      password: PASSWORD,
      email_confirm: true,
    });
    ok("Test kullanıcısı mevcut", user.id);
  }
  return { admin, userId: user.id };
}

async function main() {
  console.log("BASE", BASE);
  console.log("EMAIL", EMAIL);

  const { admin } = await ensureUser();

  // Migration durumu
  const { error: colErr } = await admin
    .from("gazeteci")
    .select("id, auth_user_id")
    .limit(1);
  if (colErr && colErr.message.includes("auth_user_id")) {
    ok(
      "Migration 0003 kontrolü",
      "auth_user_id YOK — fallback gazeteci yolu kullanılacak (SQL Editor'de 0003 önerilir)"
    );
  } else {
    ok("Migration 0003 kontrolü", "auth_user_id kolonu mevcut");
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  try {
    // 1) /giris
    await page.goto(BASE + "/giris", { waitUntil: "networkidle" });
    const hasForm = await page.locator("#email").count();
    if (hasForm) ok("/giris formu", "e-posta alanı var");
    else fail("/giris formu", "e-posta alanı yok");

    // 2) Giriş
    await page.fill("#email", EMAIL);
    await page.fill("#sifre", PASSWORD);
    await page.getByRole("button", { name: /Şifre ile giriş/i }).click();
    await page.waitForURL(/\/editor/, { timeout: 20000 });
    ok("Giriş → /editor", page.url());

    // 3) Yeni haber
    const baslik = `E2E Playwright ${Date.now()}`;
    await page.fill("#yeni-baslik", baslik);
    await page.getByRole("button", { name: /Taslak oluştur/i }).click();
    await page.waitForURL(/\/editor\/[0-9a-f-]+/, { timeout: 20000 });
    const editorUrl = page.url();
    const haberId = editorUrl.split("/editor/")[1]?.split(/[?#]/)[0];
    ok("Yeni haber (haber insert)", haberId);

    // Yayın butonu başlangıçta disabled olmalı (eşik yok)
    const yayinBtn = page.getByRole("button", { name: /Yayına gönder/i });
    const disabled0 = await yayinBtn.isDisabled();
    if (disabled0) ok("Eşik: başlangıçta Yayına gönder kapalı");
    else fail("Eşik: başlangıçta Yayına gönder kapalı", "buton aktif");

    async function kayitEkleUI(tur, ad) {
      const submit = page.getByRole("button", { name: /Karneye kayıt ekle/i });
      await submit.waitFor({ state: "visible" });
      // Önceki action bitsin
      await page.waitForFunction(() => {
        const btns = [...document.querySelectorAll("button")];
        const b = btns.find((x) => /Karneye kayıt ekle/i.test(x.textContent || ""));
        return b && !b.disabled;
      });
      await page.locator('select[aria-label="Kayıt türü"]').selectOption(tur);
      await page.locator('input[aria-label="Kayıt açıklaması"]').fill(ad);
      await submit.click();
      await page.getByText(ad, { exact: true }).waitFor({ timeout: 15000 });
      await page.waitForFunction(() => {
        const btns = [...document.querySelectorAll("button")];
        const b = btns.find((x) => /Karneye kayıt ekle/i.test(x.textContent || ""));
        return b && !b.disabled;
      });
    }

    // 4) Kaynak ekle
    try {
      await kayitEkleUI("bagimsiz", "E2E bağımsız kaynak");
      ok("Kaynak eklendi (UI)", "bağımsız");
    } catch (e) {
      fail("Kaynak eklendi (UI)", e.message);
    }

    // Hâlâ 1 kayıt → eşik yetersiz (1 kaynak, 0 belge, 0 taraf)
    const disabled1 = await yayinBtn.isDisabled();
    if (disabled1) ok("Eşik: 1 kaynak sonrası hâlâ kapalı");
    else fail("Eşik: 1 kaynak sonrası hâlâ kapalı", "beklenmedik aktif");

    // 5) Belge ekle
    try {
      await kayitEkleUI("belge", "E2E test belgesi");
      ok("Belge eklendi (UI)");
    } catch (e) {
      fail("Belge eklendi (UI)", e.message);
    }

    // 2 kaynak/belge ama taraf yok → hâlâ kapalı
    const disabled2 = await yayinBtn.isDisabled();
    if (disabled2) ok("Eşik: 1 kaynak+1 belge, taraf yok → kapalı");
    else fail("Eşik: taraf olmadan kapalı kalmalı", "buton aktif");

    // 6) Taraf ekle → eşik açılmalı
    try {
      await kayitEkleUI("taraf", "E2E Taraf");
      ok("Taraf eklendi (UI)");
    } catch (e) {
      fail("Taraf eklendi (UI)", e.message);
    }

    const disabled3 = await yayinBtn.isDisabled();
    if (!disabled3) ok("Eşik: kaynak+belge+taraf → Yayına gönder AÇIK");
    else fail("Eşik: kaynak+belge+taraf → açık olmalı", "hâlâ disabled");

    // DB doğrulama
    if (haberId) {
      const { data: hk } = await admin
        .from("haber_kaynak")
        .select("kaynak_id")
        .eq("haber_id", haberId);
      const { data: hb } = await admin
        .from("haber_belge")
        .select("belge_id")
        .eq("haber_id", haberId);
      const { data: hv } = await admin
        .from("haber_varlik")
        .select("varlik_id")
        .eq("haber_id", haberId);
      const { data: h } = await admin
        .from("haber")
        .select("baslik, durum, slug")
        .eq("id", haberId)
        .maybeSingle();

      if (h) ok("DB haber satırı", `${h.durum} / ${h.slug}`);
      else fail("DB haber satırı");

      if ((hk?.length || 0) >= 1) ok("DB haber_kaynak", String(hk.length));
      else fail("DB haber_kaynak", "0 satır");

      if ((hb?.length || 0) >= 1) ok("DB haber_belge", String(hb.length));
      else fail("DB haber_belge", "0 satır");

      if ((hv?.length || 0) >= 1) ok("DB haber_varlik", String(hv.length));
      else fail("DB haber_varlik", "0 satır");
    }

    // 7) Yayına gönder
    if (!(await yayinBtn.isDisabled())) {
      await yayinBtn.click();
      await page.waitForTimeout(2500);
      const statusText = await page.locator(".status-pill").first().textContent();
      if (statusText && /Yayında/i.test(statusText)) ok("Yayın UI", statusText.trim());
      else ok("Yayın tıklandı", `pill=${statusText}`);

      if (haberId) {
        const { data: h2 } = await admin
          .from("haber")
          .select("durum, slug")
          .eq("id", haberId)
          .single();
        if (h2?.durum === "yayinda") ok("DB durum=yayinda", h2.slug);
        else fail("DB durum=yayinda", h2?.durum || "yok");
      }
    }
  } catch (e) {
    fail("Beklenmeyen hata", e.message || String(e));
    const shot = path.join(root, "scripts", "e2e-failure.png");
    try {
      await page.screenshot({ path: shot, fullPage: true });
      console.error("Screenshot:", shot);
    } catch {
      /* ignore */
    }
  } finally {
    await browser.close();
  }

  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  console.log("\n=== ÖZET ===");
  console.log(`Geçen: ${passed}  Kalan: ${failed}`);
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
