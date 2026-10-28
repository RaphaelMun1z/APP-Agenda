const assert = require("node:assert/strict");
const { readFile } = require("node:fs/promises");
const { createServer } = require("node:http");
const path = require("node:path");
const { after, before, test } = require("node:test");
const { chromium } = require("playwright");

const STORAGE_KEY = "agendaLinhaDoTempoV2";
const CATEGORIES_KEY = "agendaLinhaDoTempoCategoriesV2";
const root = path.resolve(__dirname, "..");
let browser;
let server;
let origin;

before(async () => {
	server = createServer(async (request, response) => {
		const pathname = new URL(request.url, "http://localhost").pathname;
		const file = path.join(root, pathname === "/" ? "index.html" : pathname);
		if (!file.startsWith(`${root}${path.sep}`)) {
			response.writeHead(403).end();
			return;
		}
		try {
			const content = await readFile(file);
			const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml" };
			response.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
			response.end(content);
		} catch {
			response.writeHead(404).end();
		}
	});
	await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
	origin = `http://127.0.0.1:${server.address().port}`;
	browser = await chromium.launch({
		headless: true,
		...(process.env.TEST_BROWSER_CHANNEL ? { channel: process.env.TEST_BROWSER_CHANNEL } : {}),
	});
});

after(async () => {
	await browser?.close();
	if (server) await new Promise((resolve) => server.close(resolve));
});

async function withAgenda(run) {
	const context = await browser.newContext({ timezoneId: "America/Sao_Paulo" });
	try {
		const page = await context.newPage();
		const errors = [];
		page.on("pageerror", (error) => errors.push(error.message));
		page.on("dialog", (dialog) => dialog.accept());
		await page.route("**/*", (route) =>
			new URL(route.request().url()).origin === origin ? route.continue() : route.abort(),
		);
		await page.goto(origin);
		const item = await page.evaluate((key) => {
			const now = new Date();
			const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
			const item = {
				id: "regression-card", title: "Compromisso original", date,
				startTime: "09:00", endTime: "10:00", area: "OUTROS", subcategory: "outros",
				score: "", status: "pending", description: "Descrição original",
			};
			localStorage.setItem(key, JSON.stringify({ appointments: [item] }));
			return item;
		}, STORAGE_KEY);
		await page.reload();
		await run(page, item);
		assert.deepEqual(errors, [], "A página não deve lançar erros sem tratamento");
	} finally {
		await context.close();
	}
}

function storedItems(page) {
	return page.evaluate((key) => JSON.parse(localStorage.getItem(key)).appointments, STORAGE_KEY);
}

function card(page) {
	return page.locator('.appointment-card[data-id="regression-card"]');
}

async function failStorage(page, method = "setItem") {
	await page.evaluate(({ key, method }) => {
		const original = Storage.prototype[method];
		Storage.prototype[method] = function (name, ...args) {
			if (method === "getItem" || name === key) {
				throw new DOMException("Falha simulada de armazenamento", "QuotaExceededError");
			}
			return original.call(this, name, ...args);
		};
	}, { key: STORAGE_KEY, method });
}

const importedCategories = {
	names: { TESTE: "Categoria importada" },
	icons: { TESTE: "event" },
	colors: { TESTE: "#123456" },
	subcategories: { TESTE: [{ value: "teste-sub", label: "Subcategoria importada", icon: "label" }] },
};

async function importFixture(page, item, categories = importedCategories) {
	const backup = { categories, appointments: [{ ...item, title: "Compromisso importado", area: "TESTE", subcategory: "teste-sub", status: "done" }] };
	const result = page.waitForEvent("dialog", { predicate: (dialog) => dialog.type() === "alert" });
	await page.locator("#importBackupInput").setInputFiles({
		name: "agenda-teste.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(backup)),
	});
	return (await result).message();
}

test("concluir e reabrir um card permanece após recarregar", () => withAgenda(async (page) => {
	for (const status of ["done", "pending"]) {
		await card(page).locator('[data-action="toggle-status"]').click();
		await page.reload();
		assert.equal((await storedItems(page))[0].status, status);
		assert.equal(await card(page).evaluate((element) => element.classList.contains("is-completed")), status === "done");
	}
}));

test("editar o formulário permanece após recarregar", () => withAgenda(async (page, item) => {
	await card(page).locator('[data-action="edit"]').click();
	await page.locator("#appointmentTitle").fill("Compromisso atualizado");
	await page.locator("#appointmentDescription").fill("Descrição atualizada");
	await page.locator("#appointmentStartTime").fill("14:30");
	await page.locator("#appointmentEndTime").fill("15:30");
	await page.locator("#saveAppointmentButton").click();
	await page.reload();
	assert.deepEqual(await storedItems(page), [{ ...item, title: "Compromisso atualizado", description: "Descrição atualizada", startTime: "14:30", endTime: "15:30" }]);
	assert.equal(await card(page).locator("h3").textContent(), "Compromisso atualizado");
}));

test("mover um card permanece após recarregar", () => withAgenda(async (page, item) => {
	const targetDate = `${item.date.slice(0, 8)}${item.date.endsWith("01") ? "02" : "01"}`;
	assert.equal(await page.evaluate(({ id, date }) => moveAppointment(id, date), { id: item.id, date: targetDate }), true);
	await page.reload();
	assert.equal((await storedItems(page))[0].date, targetDate);
	assert.equal(await card(page).evaluate((element) => element.closest(".day-column").dataset.date), targetDate);
}));

test("excluir um card permanece após recarregar", () => withAgenda(async (page) => {
	await card(page).locator('[data-action="delete"]').click();
	await page.reload();
	assert.deepEqual(await storedItems(page), []);
	assert.equal(await card(page).count(), 0);
}));

test("importar backup persiste compromissos e categorias após recarregar", () => withAgenda(async (page) => {
	const item = (await storedItems(page))[0];
	assert.equal(await importFixture(page, item), "Backup importado com sucesso.");
	await page.reload();
	assert.deepEqual(await storedItems(page), [{ ...item, title: "Compromisso importado", area: "TESTE", subcategory: "teste-sub", status: "done" }]);
	assert.deepEqual(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), CATEGORIES_KEY), importedCategories);
	assert.match(await card(page).textContent(), /Categoria importada/);
	assert.match(await card(page).textContent(), /Subcategoria importada/);
}));

for (const action of ["status", "move", "delete", "import"]) {
	test(`falha ao salvar ${action} preserva os dados anteriores`, () => withAgenda(async (page, item) => {
		const categoriesBefore = await page.evaluate((key) => localStorage.getItem(key), CATEGORIES_KEY);
		await failStorage(page);
		if (action === "status") await card(page).locator('[data-action="toggle-status"]').click();
		if (action === "move") assert.equal(await page.evaluate((id) => moveAppointment(id, "2026-11-01"), item.id), false);
		if (action === "delete") await card(page).locator('[data-action="delete"]').click();
		if (action === "import") assert.match(await importFixture(page, item), /Não foi possível salvar/);
		assert.deepEqual(await page.evaluate(() => createAgendaPayload().appointments), [item]);
		assert.deepEqual(await storedItems(page), [item]);
		assert.equal(await page.evaluate((key) => localStorage.getItem(key), CATEGORIES_KEY), categoriesBefore);
		assert.equal(await card(page).evaluate((element) => element.classList.contains("is-completed")), false);
		assert.match(await card(page).textContent(), /Outros/);
		await page.reload();
		assert.deepEqual(await storedItems(page), [item]);
	}));
}

test("armazenamento indisponível informa a falha sem alterar o card", () => withAgenda(async (page, item) => {
	await failStorage(page, "getItem");
	const alert = page.waitForEvent("dialog");
	await card(page).locator('[data-action="toggle-status"]').click();
	assert.match((await alert).message(), /Não foi possível salvar/);
	assert.deepEqual(await page.evaluate(() => createAgendaPayload().appointments), [item]);
	await page.reload();
	assert.deepEqual(await storedItems(page), [item]);
}));

test("recarregar não regrava o conteúdo salvo nem apaga dados ilegíveis", () => withAgenda(async (page) => {
	const saved = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
	await page.reload();
	assert.equal(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY), saved);
	await page.evaluate((key) => localStorage.setItem(key, '{"appointments":'), STORAGE_KEY);
	await page.reload();
	assert.equal(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY), '{"appointments":');
}));
