const STORAGE_KEY = "agendaLinhaDoTempoV2";
const CATEGORIES_STORAGE_KEY = "agendaLinhaDoTempoCategoriesV2";
const LEGACY_STORAGE_KEYS = [
	"agendaLinhaDoTempoV1",
	"agendaLinhaDoTempoCategoriesV1",
];

let subcategories = {
	EBSERH: [
		{ value: "ebserh-cleber", label: "Reunião — Cléber" },
		{ value: "ebserh-mattioli", label: "Reunião — Mattioli" },
		{ value: "ebserh-equipe", label: "Reunião — Equipe" },
		{ value: "ebserh-geral", label: "Reunião — Geral" },
		{ value: "ebserh-task", label: "Task" },
	],
	UFU: [
		{
			value: "ufu-modelagem",
			label: "Modelagem de Domínio",
			discipline: true,
		},
		{
			value: "ufu-algebra",
			label: "Álgebra Linear",
			discipline: true,
		},
		{
			value: "ufu-ciencia-dados",
			label: "Ciência de Dados",
			discipline: true,
		},
		{
			value: "ufu-web-ii",
			label: "Programação para Internet II",
			discipline: true,
		},
		{
			value: "ufu-redes",
			label: "Redes de Computadores",
			discipline: true,
		},
		{
			value: "ufu-matematica-financeira",
			label: "Matemática Financeira",
			discipline: true,
		},
		{
			value: "ufu-iniciacao-cientifica",
			label: "Iniciação Científica",
			discipline: true,
		},
	],
	TCC: [
		{ value: "tcc-reuniao", label: "Reunião" },
		{ value: "tcc-task", label: "Atividade de TCC" },
	],
	OUTROS: [
		{ value: "outros", label: "Compromisso geral" },
		{ value: "outros-robotica", label: "Robótica — JP" },
	],
};

let categoryNames = Object.fromEntries(
	Object.keys(subcategories).map((key) => [
		key,
		key === "OUTROS" ? "Outros" : key,
	]),
);
let categoryIcons = Object.fromEntries(
	Object.keys(categoryNames).map((key) => [key, "bookmark"]),
);
let categoryColors = Object.fromEntries(
	Object.keys(categoryNames).map((key) => [key, "#667085"]),
);
try {
	const savedCategories = JSON.parse(
		localStorage.getItem(CATEGORIES_STORAGE_KEY) || "null",
	);
	if (
		savedCategories &&
		savedCategories.names &&
		savedCategories.subcategories
	) {
		categoryNames = savedCategories.names;
		subcategories = savedCategories.subcategories;
		categoryIcons = {
			...Object.fromEntries(
				Object.keys(categoryNames).map((key) => [key, "bookmark"]),
			),
			...(savedCategories.icons || {}),
		};
		categoryColors = {
			...Object.fromEntries(Object.keys(categoryNames).map((key) => [key, "#667085"])),
			...(savedCategories.colors || {}),
		};
	}
} catch (error) {
	console.warn("Não foi possível carregar as categorias salvas.", error);
}

Object.values(subcategories).forEach((items) => {
	items.forEach((item) => {
		if (!item.icon) item.icon = "label";
	});
});
const timeline = document.getElementById("timeline");
const appLogo = document.getElementById("appLogo");
const appBrand = document.getElementById("appBrand");
const dateFilter = document.getElementById("dateFilter");
const periodFilter = document.getElementById("periodFilter");
const categoryFilter = document.getElementById("categoryFilter");
const subcategoryFilter = document.getElementById("subcategoryFilter");
const clearFiltersButton = document.getElementById("clearFiltersButton");
const timelineSummary = document.getElementById("timelineSummary");
const exportBackupButton = document.getElementById("exportBackupButton");
const importBackupButton = document.getElementById("importBackupButton");
const importBackupInput = document.getElementById("importBackupInput");
const newAppointmentButton = document.getElementById("newAppointmentButton");
const appointmentDialog = document.getElementById("appointmentDialog");
const appointmentForm = document.getElementById("appointmentForm");
const dialogTitle = document.getElementById("dialogTitle");
const appointmentId = document.getElementById("appointmentId");
const appointmentTitle = document.getElementById("appointmentTitle");
const appointmentDate = document.getElementById("appointmentDate");
const appointmentStartTime = document.getElementById("appointmentStartTime");
const appointmentEndTime = document.getElementById("appointmentEndTime");
const appointmentArea = document.getElementById("appointmentArea");
const appointmentSubcategory = document.getElementById(
	"appointmentSubcategory",
);
const appointmentScoreField = document.getElementById("appointmentScoreField");
const appointmentScore = document.getElementById("appointmentScore");
const appointmentDescription = document.getElementById("appointmentDescription");
const saveAppointmentButton = document.getElementById("saveAppointmentButton");
const saveAppointmentIcon = document.getElementById("saveAppointmentIcon");
const saveAppointmentLabel = document.getElementById("saveAppointmentLabel");
const closeDialogButton = document.getElementById("closeDialogButton");
const cancelDialogButton = document.getElementById("cancelDialogButton");
const categoriesDialog = document.getElementById("categoriesDialog");
const manageCategoriesButton = document.getElementById(
	"manageCategoriesButton",
);
const closeCategoriesButton = document.getElementById("closeCategoriesButton");
const managedCategorySelect = document.getElementById("managedCategorySelect");
const managedCategoryList = document.getElementById("managedCategoryList");
const selectedCategorySection = document.getElementById(
	"selectedCategorySection",
);
const categoryEditView = document.getElementById("categoryEditView");
const categoryListView = document.getElementById("categoryListView");
const categoryCreateView = document.getElementById("categoryCreateView");
const categoryDetailView = document.getElementById("categoryDetailView");
const selectedCategoryName = document.getElementById("selectedCategoryName");
const showNewCategoryButton = document.getElementById("showNewCategoryButton");
const managedSubcategorySelect = document.getElementById(
	"managedSubcategorySelect",
);
const managedSubcategoryList = document.getElementById(
	"managedSubcategoryList",
);
const subcategoryListView = document.getElementById("subcategoryListView");
const subcategoryCreateView = document.getElementById("subcategoryCreateView");
const subcategoryDetailView = document.getElementById("subcategoryDetailView");
const subcategorySearch = document.getElementById("subcategorySearch");
const categorySearch = document.getElementById("categorySearch");
const newCategoryName = document.getElementById("newCategoryName");
const newSubcategoryName = document.getElementById("newSubcategoryName");
const managedCategoryIcon = document.getElementById("managedCategoryIcon");
const managedSubcategoryIcon = document.getElementById(
	"managedSubcategoryIcon",
);
const managedSubcategoryName = document.getElementById(
	"managedSubcategoryName",
);
const managedCategoryIconPreview = document.getElementById(
	"managedCategoryIconPreview",
);
const managedSubcategoryIconPreview = document.getElementById(
	"managedSubcategoryIconPreview",
);

let appointments = loadAppointments();
let shouldPositionTimeline = true;
let draggedAppointmentId = null;
const customSelectInstances = new WeakMap();
let activeCustomSelect = null;
let panning = false;
let panStartX = 0;
let panStartScrollLeft = 0;
let panMoved = false;
let activePanPointerId = null;

// Activity persistence.
function localISODate(date = new Date()) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function addDays(baseDate, amount) {
	const date = new Date(baseDate);
	date.setHours(12, 0, 0, 0);
	date.setDate(date.getDate() + amount);
	return localISODate(date);
}

function normalizeAppointment(item) {
	const area =
		Object.hasOwn(categoryNames, item.area) &&
		Object.hasOwn(subcategories, item.area)
			? item.area
			: Object.keys(subcategories)[0] || "OUTROS";

	const allowedSubcategories = subcategories[area] || [];
	const subcategory = allowedSubcategories.some(
		(option) => option.value === item.subcategory,
	)
		? item.subcategory
		: allowedSubcategories[0]?.value || "";

	return {
		id: String(item.id || crypto.randomUUID()),
		title: String(item.title || "Compromisso sem título"),
		date: String(item.date || localISODate()),
		startTime: String(item.startTime ?? item.time ?? ""),
		endTime: String(item.endTime ?? ""),
		area,
		subcategory,
		score: area === "UFU" ? (item.score ?? "") : "",
		status: item.status === "done" ? "done" : "pending",
		description: String(item.description || ""),
	};
}

function loadAppointments() {
	try {
		const saved = localStorage.getItem(STORAGE_KEY);

		if (saved) {
			return parseAgendaPayload(JSON.parse(saved));
		}
	} catch (error) {
		console.warn(
			"Não foi possível carregar os dados salvos no navegador.",
			error,
		);
	}

	return [];
}

function createAgendaPayload(items = appointments) {
	return {
		format: "agenda-linha-do-tempo",
		version: 1,
		updatedAt: new Date().toISOString(),
		categories: {
			names: categoryNames,
			icons: categoryIcons,
			colors: categoryColors,
			subcategories,
		},
		appointments: items,
	};
}

function parseAgendaPayload(data) {
	const source = Array.isArray(data)
		? data
		: Array.isArray(data.appointments)
			? data.appointments
			: Array.isArray(data.events)
				? data.events
				: null;

	if (!source) {
		throw new Error(
			"O arquivo não contém uma lista válida de compromissos.",
		);
	}

	return source.map(normalizeAppointment);
}

function saveAppointments(items) {
	const previousCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
	try {
		persistCategories();
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify(createAgendaPayload(items)),
		);
		appointments = items;
		return true;
	} catch (error) {
		try {
			if (previousCategories === null) localStorage.removeItem(CATEGORIES_STORAGE_KEY);
			else localStorage.setItem(CATEGORIES_STORAGE_KEY, previousCategories);
		} catch (rollbackError) {
			console.error("Falha ao restaurar as categorias anteriores.", rollbackError);
		}
		console.error("N?o foi poss?vel salvar os dados no navegador.", error);
		window.alert("N?o foi poss?vel salvar a atividade. Os dados anteriores foram preservados. Tente novamente ou exporte um backup.");
		return false;
	}
}

async function exportBackup() {
	exportBackupButton.disabled = true;
	try {
		const payload = createAgendaPayload();
		const content = JSON.stringify(payload, null, 2);
		const blob = new Blob([content], {
			type: "application/json;charset=utf-8",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");

		link.href = url;
		link.download = `agenda-${localISODate()}.json`;
		document.body.appendChild(link);
		link.click();
		link.remove();
		window.setTimeout(() => URL.revokeObjectURL(url), 1000);
	} catch (error) {
		console.error("Falha ao exportar o backup.", error);
		window.alert(
			`Não foi possível exportar o backup completo. ${error.message}`,
		);
	} finally {
		exportBackupButton.disabled = false;
	}
}

async function importBackup(file) {
	const backup = JSON.parse(await file.text());
	const backupItems = Array.isArray(backup)
		? backup
		: backup.appointments || backup.events || [];

	const confirmed = window.confirm(
		`Importar ${backupItems.length} compromissos? Os dados atuais deste navegador serão substituídos.`,
	);

	if (!confirmed) return;

	const previousCategories = {
		names: categoryNames,
		icons: categoryIcons,
		colors: categoryColors,
		subcategories,
	};
	let importedCategories;
	let importedAppointments;
	try {
		if (backup.categories?.names && backup.categories?.subcategories) {
			categoryNames = backup.categories.names;
			subcategories = backup.categories.subcategories;
			categoryIcons = {
				...Object.fromEntries(
					Object.keys(categoryNames).map((key) => [key, "bookmark"]),
				),
				...(backup.categories.icons || {}),
			};
			categoryColors = {
				...Object.fromEntries(Object.keys(categoryNames).map((key) => [key, "#667085"])),
				...(backup.categories.colors || {}),
			};
			Object.values(subcategories).forEach((items) => {
				items.forEach((item) => {
					if (!item.icon) item.icon = "label";
				});
			});
		}
		importedAppointments = parseAgendaPayload(backup);
		importedCategories = {
			names: categoryNames,
			icons: categoryIcons,
			colors: categoryColors,
			subcategories,
		};
	} finally {
		categoryNames = previousCategories.names;
		categoryIcons = previousCategories.icons;
		categoryColors = previousCategories.colors;
		subcategories = previousCategories.subcategories;
	}
	categoryNames = importedCategories.names;
	categoryIcons = importedCategories.icons;
	categoryColors = importedCategories.colors;
	subcategories = importedCategories.subcategories;
	appointments = importedAppointments;
	populateCategoryOptions();

	dateFilter.value = "";
	periodFilter.value = getCurrentPeriod();
	syncCustomSelect(periodFilter);
	categoryFilter.value = "";
	subcategoryFilter.value = "";
	shouldPositionTimeline = true;
	updateSubcategoryFilter();
	renderTimeline();
	window.alert("Backup importado com sucesso.");
}

function initializeAgenda() {
	periodFilter.value = getCurrentPeriod();
	syncCustomSelect(periodFilter);
	populateCategoryOptions();
	populateSubcategories();
	updateSubcategoryFilter();
	renderTimeline();
}

// Category and subcategory management.
function escapeHTML(value) {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}

function getSubcategory(area, value) {
	return (
		(subcategories[area] || []).find((item) => item.value === value) || {
			label: "",
		}
	);
}

function validColor(color, fallback = "#667085") {
	return /^#[0-9a-f]{6}$/i.test(String(color || "")) ? color : fallback;
}

function getCategoryColor(categoryId) {
	return validColor(categoryColors[categoryId]);
}

function getSubcategoryColor(categoryId, item) {
	return validColor(item?.color, getCategoryColor(categoryId));
}

function googleIconMarkup(name, fallback = "") {
	const icon = String(name || fallback).trim();
	return icon
		? `<span class="material-symbols-rounded category-icon" aria-hidden="true">${escapeHTML(icon)}</span>`
		: "";
}

function persistCategories() {
	localStorage.setItem(
		CATEGORIES_STORAGE_KEY,
		JSON.stringify({
			names: categoryNames,
			icons: categoryIcons,
			colors: categoryColors,
			subcategories,
		}),
	);
}

function updateManagedCategories(update) {
	const previous = JSON.parse(
		JSON.stringify({
			names: categoryNames,
			icons: categoryIcons,
			colors: categoryColors,
			subcategories,
		}),
	);

	try {
		update();
		persistCategories();
		return true;
	} catch (error) {
		categoryNames = previous.names;
		categoryIcons = previous.icons;
		categoryColors = previous.colors;
		subcategories = previous.subcategories;
		console.error("Não foi possível salvar as categorias.", error);
		try {
			populateCategoryOptions();
			updateSubcategoryFilter();
			renderTimeline();
		} catch (refreshError) {
			console.error("Não foi possível atualizar as categorias exibidas.", refreshError);
		}
		window.alert("Não foi possível salvar as categorias neste navegador. As alterações foram desfeitas.");
		return false;
	}
}

function populateCategoryOptions() {
	const selectedFilter = categoryFilter.value;
	const selectedAppointment = appointmentArea.value;
	const selectedManagedCategory = managedCategorySelect.value;
	const options = Object.entries(categoryNames);
	categoryFilter.innerHTML = '<option value="">Todas as categorias</option>';
	appointmentArea.innerHTML =
		'<option value="">Selecione uma categoria</option>';
	managedCategorySelect.innerHTML =
		'<option value="">Selecione uma categoria</option>';
	options.forEach(([key, label]) => {
		[categoryFilter, appointmentArea, managedCategorySelect].forEach(
			(select) => {
				const option = document.createElement("option");
				option.value = key;
				option.textContent = label;
				select.appendChild(option);
			},
		);
	});
	categoryFilter.value = options.some(([key]) => key === selectedFilter)
		? selectedFilter
		: "";
	appointmentArea.value = options.some(([key]) => key === selectedAppointment)
		? selectedAppointment
		: "";
	managedCategorySelect.value = options.some(
		([key]) => key === selectedManagedCategory,
	)
		? selectedManagedCategory
		: "";
	renderManagedCategoryList();
	updateManagedIconFields();
	populateManagedSubcategories();
	syncCustomSelect(categoryFilter);
	syncCustomSelect(appointmentArea);
}

function renderManagedCategoryList() {
	managedCategoryList.replaceChildren();
	const query = categorySearch.value.trim().toLocaleLowerCase();
	const entries = Object.entries(categoryNames).filter(([, name]) =>
		name.toLocaleLowerCase().includes(query),
	);
	document.getElementById("categoryCount").textContent =
		`${entries.length} ${entries.length === 1 ? "categoria" : "categorias"}`;
	entries.forEach(([key, name]) => {
		const count = (subcategories[key] || []).length;
		const card = document.createElement("div");
		card.className = "manager-category-card";
		card.style.setProperty("--manager-item-color", getCategoryColor(key));
		card.innerHTML = `${googleIconMarkup(categoryIcons[key], "bookmark")}<span class="manager-category-copy"><strong>${escapeHTML(name)}</strong><small>${count} ${count === 1 ? "subcategoria" : "subcategorias"}</small></span>`;
		const actions = document.createElement("div");
		actions.className = "manager-card-actions";
		const remove = document.createElement("button");
		remove.type = "button";
		remove.className = "manager-card-action manager-card-delete";
		remove.dataset.deleteCategory = key;
		remove.setAttribute("aria-label", `Excluir categoria ${name}`);
		remove.title = "Excluir categoria";
		remove.innerHTML =
			'<span class="material-symbols-rounded" aria-hidden="true">delete</span>';
		const edit = document.createElement("button");
		edit.type = "button";
		edit.className = "manager-card-action manager-card-edit";
		edit.dataset.editCategory = key;
		edit.setAttribute("aria-label", `Editar categoria ${name}`);
		edit.title = "Editar categoria";
		edit.innerHTML =
			'<span class="material-symbols-rounded" aria-hidden="true">edit</span>';
		const open = document.createElement("button");
		open.type = "button";
		open.className = "manager-card-action manager-card-open";
		open.dataset.openCategory = key;
		open.setAttribute("aria-label", `Abrir categoria ${name}`);
		open.title = "Abrir categoria";
		open.innerHTML =
			'<span class="material-symbols-rounded" aria-hidden="true">chevron_right</span>';
		actions.append(edit, remove, open);
		card.appendChild(actions);
		managedCategoryList.appendChild(card);
	});
}

function openCategoryDetail(categoryId) {
	managedCategorySelect.value = categoryId;
	categoryListView.hidden = true;
	categoryCreateView.hidden = true;
	categoryDetailView.hidden = false;
	categoryEditView.hidden = true;
	managedSubcategorySelect.value = "";
	subcategoryListView.hidden = false;
	subcategoryCreateView.hidden = true;
	subcategoryDetailView.hidden = true;
	populateManagedSubcategories();
}

function openCategoryEdit(categoryId) {
	managedCategorySelect.value = categoryId;
	categoryListView.hidden = true;
	categoryCreateView.hidden = true;
	categoryDetailView.hidden = false;
	categoryEditView.hidden = false;
	selectedCategorySection.hidden = true;
	document.getElementById("subcategoryManagerSection").hidden = true;
	updateManagedIconFields();
	document.getElementById("managedCategoryName").focus();
}

function openCategoryList() {
	managedCategorySelect.value = "";
	categoryListView.hidden = false;
	categoryCreateView.hidden = true;
	categoryDetailView.hidden = true;
	categoryEditView.hidden = true;
	populateManagedSubcategories();
}

function openSubcategoryList() {
	managedSubcategorySelect.value = "";
	subcategoryListView.hidden = false;
	subcategoryCreateView.hidden = true;
	subcategoryDetailView.hidden = true;
	updateManagedIconFields();
	renderManagedSubcategoryList();
}

function openSubcategoryDetail(subcategoryId) {
	managedSubcategorySelect.value = subcategoryId;
	subcategoryListView.hidden = true;
	subcategoryCreateView.hidden = true;
	subcategoryDetailView.hidden = false;
	updateManagedIconFields();
	managedSubcategoryName.focus();
}

function deleteManagedCategory(categoryId) {
	if (!categoryId) return;
	if (Object.keys(categoryNames).length <= 1) {
		window.alert("Mantenha pelo menos uma categoria cadastrada.");
		return;
	}
	if (appointments.some((item) => item.area === categoryId)) {
		window.alert(
			"Esta categoria está vinculada a compromissos. Remova ou reclassifique esses compromissos antes de excluí-la.",
		);
		return;
	}
	if (
		!window.confirm(
			`Excluir a categoria “${categoryNames[categoryId]}” e suas subcategorias?`,
		)
	)
		return;
	if (!updateManagedCategories(() => {
		delete categoryNames[categoryId];
		delete categoryIcons[categoryId];
		delete categoryColors[categoryId];
		delete subcategories[categoryId];
	})) return;
	populateCategoryOptions();
	updateSubcategoryFilter();
	renderTimeline();
}

function deleteManagedSubcategory(categoryId, subcategoryId) {
	if (!categoryId || !subcategoryId) return;
	if (
		appointments.some(
			(item) =>
				item.area === categoryId && item.subcategory === subcategoryId,
		)
	) {
		window.alert(
			"Esta subcategoria está vinculada a compromissos. Reclassifique esses compromissos antes de excluí-la.",
		);
		return;
	}
	const item = (subcategories[categoryId] || []).find(
		(entry) => entry.value === subcategoryId,
	);
	if (!item || !window.confirm(`Excluir a subcategoria “${item.label}”?`))
		return;
	if (!updateManagedCategories(() => {
		subcategories[categoryId] = subcategories[categoryId].filter(
			(entry) => entry.value !== subcategoryId,
		);
	})) return;
	populateManagedSubcategories();
	openSubcategoryList();
	populateSubcategories();
	updateSubcategoryFilter();
	renderTimeline();
}

function populateManagedSubcategories() {
	const selectedValue = managedSubcategorySelect.value;
	const selectedCategory = managedCategorySelect.value;
	const entries = selectedCategory
		? subcategories[selectedCategory] || []
		: [];
	document.getElementById("subcategoryManagerSection").hidden =
		!selectedCategory;
	managedSubcategorySelect.innerHTML = "";
	if (!selectedCategory) {
		const placeholder = document.createElement("option");
		placeholder.value = "";
		placeholder.textContent = "Selecione uma categoria primeiro";
		managedSubcategorySelect.appendChild(placeholder);
	}
	entries.forEach((item) => {
		const option = document.createElement("option");
		option.value = item.value;
		option.textContent = item.icon
			? `${item.icon} · ${item.label}`
			: item.label;
		managedSubcategorySelect.appendChild(option);
	});
	if (entries.some((item) => item.value === selectedValue))
		managedSubcategorySelect.value = selectedValue;
	renderManagedSubcategoryList(entries);
	managedSubcategorySelect.disabled =
		!selectedCategory || entries.length === 0;
	document.getElementById("saveSubcategoryIconButton").disabled =
		entries.length === 0;
	updateManagedIconFields();
	syncCustomSelect(managedSubcategorySelect);
}

function renderManagedSubcategoryList(
	entries = subcategories[managedCategorySelect.value] || [],
) {
	managedSubcategoryList.replaceChildren();
	const query = subcategorySearch.value.trim().toLocaleLowerCase();
	const filtered = entries.filter((item) =>
		item.label.toLocaleLowerCase().includes(query),
	);
	document.getElementById("subcategoryCount").textContent =
		`${filtered.length} ${filtered.length === 1 ? "subcategoria" : "subcategorias"}`;
	filtered.forEach((item) => {
		const card = document.createElement("div");
		card.className = "manager-category-card";
		card.style.setProperty("--manager-item-color", getSubcategoryColor(managedCategorySelect.value, item));
		card.innerHTML = `${googleIconMarkup(item.icon, "label")}<span class="manager-category-copy"><strong>${escapeHTML(item.label)}</strong><small>Subcategoria</small></span>`;
		const actions = document.createElement("div");
		actions.className = "manager-card-actions";
		const remove = document.createElement("button");
		remove.type = "button";
		remove.className = "manager-card-action manager-card-delete";
		remove.dataset.deleteSubcategory = item.value;
		remove.setAttribute("aria-label", `Excluir subcategoria ${item.label}`);
		remove.title = "Excluir subcategoria";
		remove.innerHTML =
			'<span class="material-symbols-rounded" aria-hidden="true">delete</span>';
		const edit = document.createElement("button");
		edit.type = "button";
		edit.className = "manager-card-action manager-card-edit";
		edit.dataset.editSubcategory = item.value;
		edit.setAttribute("aria-label", `Editar subcategoria ${item.label}`);
		edit.title = "Editar subcategoria";
		edit.innerHTML =
			'<span class="material-symbols-rounded" aria-hidden="true">edit</span>';
		const open = document.createElement("button");
		open.type = "button";
		open.className = "manager-card-action manager-card-open";
		open.dataset.openSubcategory = item.value;
		open.setAttribute("aria-label", `Abrir subcategoria ${item.label}`);
		open.title = "Abrir subcategoria";
		open.innerHTML =
			'<span class="material-symbols-rounded" aria-hidden="true">chevron_right</span>';
		actions.append(edit, remove, open);
		card.appendChild(actions);
		managedSubcategoryList.appendChild(card);
	});
}

function updateManagedIconFields() {
	const selectedCategory = managedCategorySelect.value;
	const editingSubcategory = !subcategoryDetailView.hidden;
	const editingCategory = !categoryEditView.hidden;
	selectedCategorySection.hidden =
		!selectedCategory || editingSubcategory || editingCategory;
	categoryDetailView.hidden = !selectedCategory;
	categoryListView.hidden =
		Boolean(selectedCategory) || !categoryCreateView.hidden;
	selectedCategoryName.textContent =
		categoryNames[selectedCategory] || "Categoria";
	renderManagedCategoryList();
	const categoryIcon = categoryIcons[selectedCategory] || "bookmark";
	document.getElementById("managedCategoryColor").value = getCategoryColor(selectedCategory);
	document.getElementById("selectedCategoryHeaderIcon").textContent =
		categoryIcon;
	document.getElementById("editCategoryHeaderIcon").textContent =
		categoryIcon;
	document.getElementById("createSubcategoryHeaderIcon").textContent =
		categoryIcon;
	document.getElementById("managedCategoryName").value =
		categoryNames[selectedCategory] || "";
	managedCategoryIcon.value = selectedCategory ? categoryIcon : "";
	managedCategoryIconPreview.textContent = categoryIcon;
	document.getElementById("saveCategoryButton").disabled = !selectedCategory;
	const selectedSubcategory = (subcategories[selectedCategory] || []).find(
		(item) => item.value === managedSubcategorySelect.value,
	);
	document.getElementById("selectedSubcategoryName").textContent =
		selectedSubcategory?.label || "Subcategoria";
	document.getElementById("selectedSubcategoryHeaderIcon").textContent =
		selectedSubcategory?.icon || "label";
	document.getElementById("managedSubcategoryName").value =
		selectedSubcategory?.label || "";
	managedSubcategoryIcon.value = selectedSubcategory?.icon || "label";
	managedSubcategoryIconPreview.textContent =
		selectedSubcategory?.icon || "label";
	document.getElementById("managedSubcategoryColor").value = getSubcategoryColor(selectedCategory, selectedSubcategory);
	document.getElementById("saveSubcategoryIconButton").disabled =
		!selectedSubcategory;
}

function makeCategoryId(label) {
	const base =
		label
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "") || "categoria";
	return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

// Custom select controls.
function syncCustomSelect(select) {
	const instance = customSelectInstances.get(select);
	if (!instance) return;
	const selectedOption = select.selectedOptions[0];
	if (select === appointmentArea || select === categoryFilter) {
		const selectedSubcategory = select === appointmentArea
			? (subcategories[select.value] || []).find(
				(item) => item.value === appointmentSubcategory.value,
			)
			: (subcategories[select.value] || []).find(
				(item) => item.value === subcategoryFilter.value,
			);
		const categoryLabel = selectedOption?.textContent || select.dataset.placeholder || "Selecione uma categoria";
		instance.value.textContent = selectedSubcategory
			? `${categoryLabel} \u00b7 ${selectedSubcategory.label}`
			: categoryLabel;
	} else {
		instance.value.textContent = selectedOption?.value
			? selectedOption.textContent
			: select.dataset.placeholder ||
				selectedOption?.textContent ||
				"Selecione uma op\u00e7\u00e3o";
	}
	instance.trigger.disabled = select.disabled;
	instance.trigger.setAttribute(
		"aria-invalid",
		select.dataset.invalid === "true" ? "true" : "false",
	);
	if (instance.menu) renderCustomSelectOptions(instance);
}

function selectNestedCategory(
	instance,
	categoryId,
	subcategoryId = "",
	finalizeCategory = false,
) {
	const { select } = instance;
	select.value = categoryId;
	select.dataset.invalid = "false";
	const expandCategory = Boolean(categoryId && !subcategoryId && !finalizeCategory);
	instance.activeCategoryId = expandCategory ? categoryId : null;

	if (select === categoryFilter) {
		subcategoryFilter.value = "";
		updateSubcategoryFilter();
		subcategoryFilter.value = subcategoryId;
		select.dispatchEvent(new Event("change", { bubbles: true }));
	} else {
		appointmentSubcategory.value = "";
		select.dispatchEvent(new Event("change", { bubbles: true }));
		populateSubcategories(subcategoryId);
	}

	syncCustomSelect(select);
	if (expandCategory) {
		(
			instance.menu?.querySelector('[aria-selected="true"]') ||
			instance.menu?.querySelector('[role="option"]')
		)?.focus();
		return;
	}
	closeCustomSelect();
	instance.trigger.focus();
}

function renderNestedCategoryOptions(instance) {
	const { select, menu } = instance;
	const isFilter = select === categoryFilter;
	menu.replaceChildren();
	const activeCategoryId = categoryNames[instance.activeCategoryId]
		? instance.activeCategoryId
		: null;

	if (activeCategoryId) {
		const back = document.createElement("button");
		back.type = "button";
		back.className = "custom-select-back";
		back.innerHTML = '<span class="material-symbols-rounded" aria-hidden="true">arrow_back</span><span>Voltar às categorias</span>';
		back.addEventListener("click", () => {
			instance.activeCategoryId = null;
			renderNestedCategoryOptions(instance);
			instance.menu.querySelector('[role="option"]')?.focus();
		});
		menu.appendChild(back);
	}

	if (isFilter && !activeCategoryId) {
		const allCategories = document.createElement("button");
		allCategories.type = "button";
		allCategories.className = "custom-select-option custom-select-category-option";
		allCategories.setAttribute("role", "option");
		allCategories.setAttribute(
			"aria-selected",
			!categoryFilter.value && !subcategoryFilter.value ? "true" : "false",
		);
		allCategories.textContent = "Todas as categorias";
		allCategories.addEventListener("click", () =>
			selectNestedCategory(instance, ""),
		);
		menu.appendChild(allCategories);
	}

	const categoryEntries = activeCategoryId
		? [[activeCategoryId, categoryNames[activeCategoryId]]]
		: Object.entries(categoryNames);
	categoryEntries.forEach(([categoryId, categoryName]) => {
		const group = document.createElement("div");
		group.className = "custom-select-group";
		group.setAttribute("role", "group");
		group.setAttribute("aria-label", categoryName);

		const selectedCategoryOnly =
			select.value === categoryId &&
			(isFilter ? !subcategoryFilter.value : !appointmentSubcategory.value);
		let heading;
		if (activeCategoryId) {
			heading = document.createElement("div");
			heading.className = "custom-select-group-heading";
			heading.innerHTML = `${googleIconMarkup(categoryIcons[categoryId], "bookmark")}<span>${escapeHTML(categoryName)}</span>`;
		} else {
			heading = document.createElement("button");
			heading.type = "button";
			heading.className = "custom-select-option custom-select-category-option";
			heading.setAttribute("role", "option");
			heading.setAttribute(
				"aria-selected",
				selectedCategoryOnly ? "true" : "false",
			);
			heading.innerHTML = `${googleIconMarkup(categoryIcons[categoryId], "bookmark")}<span>${escapeHTML(categoryName)}</span>`;
			heading.addEventListener("click", () => {
				selectNestedCategory(instance, categoryId);
			});
		}
		group.appendChild(heading);

		const items = subcategories[categoryId] || [];
		if (activeCategoryId && isFilter) {
			const allSubcategories = document.createElement("button");
			allSubcategories.type = "button";
			allSubcategories.className = "custom-select-option subcategory-option";
			allSubcategories.setAttribute("role", "option");
			allSubcategories.setAttribute(
				"aria-selected",
				subcategoryFilter.value ? "false" : "true",
			);
			allSubcategories.textContent = "Todas";
			allSubcategories.addEventListener("click", () =>
				selectNestedCategory(instance, categoryId, "", true),
			);
			group.appendChild(allSubcategories);
		}

		if (activeCategoryId && items.length) {
			items.forEach((item) => {
				const option = document.createElement("button");
				option.type = "button";
				option.className = "custom-select-option subcategory-option";
				option.setAttribute("role", "option");
				const isSelected = isFilter
					? categoryFilter.value === categoryId &&
						subcategoryFilter.value === item.value
					: appointmentArea.value === categoryId &&
						appointmentSubcategory.value === item.value;
				option.setAttribute("aria-selected", isSelected ? "true" : "false");
				option.innerHTML = `${googleIconMarkup(item.icon, "label")}<span>${escapeHTML(item.label)}</span>`;
				option.addEventListener("click", () =>
					selectNestedCategory(instance, categoryId, item.value),
				);
				group.appendChild(option);
			});
		} else if (activeCategoryId) {
			const empty = document.createElement("div");
			empty.className = "custom-select-option custom-select-empty-option subcategory-option";
			empty.textContent = "Nenhuma subcategoria cadastrada";
			group.appendChild(empty);
		}
		menu.appendChild(group);
	});

	if (!menu.children.length) {
		const empty = document.createElement("div");
		empty.className = "custom-select-option custom-select-empty-option";
		empty.textContent = "Nenhuma categoria cadastrada";
		menu.appendChild(empty);
	}
}

function renderCustomSelectOptions(instance) {
	const { select, menu } = instance;
	if (select === appointmentArea || select === categoryFilter) {
		renderNestedCategoryOptions(instance);
		return;
	}
	menu.innerHTML = "";
	[...select.options]
		.filter((option) => option.value && !option.disabled)
		.forEach((option) => {
			const card = document.createElement("button");
			card.type = "button";
			card.className = "custom-select-option";
			card.setAttribute("role", "option");
			card.setAttribute(
				"aria-selected",
				option.value === select.value ? "true" : "false",
			);
			card.textContent = option.textContent;
			card.addEventListener("click", () => {
				select.value = option.value;
				select.dataset.invalid = "false";
				select.dispatchEvent(new Event("change", { bubbles: true }));
				syncCustomSelect(select);
				closeCustomSelect();
				instance.trigger.focus();
			});
			menu.appendChild(card);
		});
	if (!menu.children.length) {
		const emptyCard = document.createElement("div");
		emptyCard.className = "custom-select-option";
		emptyCard.textContent = "Nenhuma opção disponível";
		menu.appendChild(emptyCard);
	}
}

function positionCustomSelectMenu(instance) {
	const rect = instance.trigger.getBoundingClientRect();
	const margin = 10;
	const roomBelow = window.innerHeight - rect.bottom - margin;
	const roomAbove = rect.top - margin;
	const placeAbove = roomBelow < 180 && roomAbove > roomBelow;
	const availableHeight = Math.max(
		100,
		Math.min(320, placeAbove ? roomAbove : roomBelow),
	);
	const width = Math.min(rect.width, window.innerWidth - margin * 2);
	const left = Math.max(
		margin,
		Math.min(rect.left, window.innerWidth - width - margin),
	);
	instance.menu.style.width = `${width}px`;
	instance.menu.style.maxHeight = `${availableHeight}px`;
	instance.menu.style.left = `${left}px`;
	instance.menu.style.top = placeAbove ? "auto" : `${rect.bottom + 6}px`;
	instance.menu.style.bottom = placeAbove
		? `${window.innerHeight - rect.top + 6}px`
		: "auto";
}

function closeCustomSelect() {
	if (!activeCustomSelect) return;
	activeCustomSelect.menu?.remove();
	activeCustomSelect.menu = null;
	activeCustomSelect.trigger.setAttribute("aria-expanded", "false");
	activeCustomSelect = null;
}

function openCustomSelect(instance) {
	closeCustomSelect();
	if (instance.select === appointmentArea || instance.select === categoryFilter) {
		instance.activeCategoryId = instance.select.value || null;
	}
	instance.menu = document.createElement("div");
	instance.menu.className = "custom-select-menu";
	instance.menu.setAttribute("role", "listbox");
	instance.menu.setAttribute(
		"aria-label",
		instance.trigger.getAttribute("aria-label") || "Opções",
	);
	const topLayer = instance.select.closest("dialog");
	(topLayer || document.body).appendChild(instance.menu);
	instance.trigger.setAttribute("aria-expanded", "true");
	activeCustomSelect = instance;
	renderCustomSelectOptions(instance);
	positionCustomSelectMenu(instance);
	(
		instance.menu.querySelector('[aria-selected="true"]') ||
		instance.menu.querySelector('[role="option"]')
	)?.focus();
}

function enhanceSelect(select) {
	if (customSelectInstances.has(select)) return;
	const wrapper = document.createElement("div");
	wrapper.className = "custom-select-wrapper";
	const trigger = document.createElement("button");
	trigger.type = "button";
	trigger.className = "custom-select-trigger";
	trigger.id = `${select.id}CustomTrigger`;
	trigger.setAttribute("aria-haspopup", "listbox");
	trigger.setAttribute("aria-expanded", "false");
	const value = document.createElement("span");
	value.className = "custom-select-value";
	const arrow = document.createElement("span");
	arrow.className = "material-symbols-rounded custom-select-arrow";
	arrow.setAttribute("aria-hidden", "true");
	arrow.textContent = "expand_more";
	trigger.append(value, arrow);

	const label = select
		.closest(".field")
		?.querySelector(`label[for="${select.id}"]`);
	if (label) {
		trigger.setAttribute("aria-label", label.textContent.trim());
		label.htmlFor = trigger.id;
	}

	select.classList.add("custom-select-source");
	select.tabIndex = -1;
	select.setAttribute("aria-hidden", "true");
	select.parentNode.insertBefore(wrapper, select);
	wrapper.append(select, trigger);

	const instance = {
		select,
		wrapper,
		trigger,
		value,
		menu: null,
	};
	customSelectInstances.set(select, instance);
	trigger.addEventListener("click", () => {
		if (instance.menu) closeCustomSelect();
		else openCustomSelect(instance);
	});
	select.addEventListener("change", () => {
		select.dataset.invalid = "false";
		syncCustomSelect(select);
	});
	const observer = new MutationObserver(() => syncCustomSelect(select));
	observer.observe(select, {
		childList: true,
		subtree: true,
		attributes: true,
	});
	syncCustomSelect(select);
}

function enhanceSelectFields() {
	document.querySelectorAll("select:not([hidden])").forEach(enhanceSelect);
}

function invalidateCustomSelect(select) {
	select.dataset.invalid = "true";
	syncCustomSelect(select);
	customSelectInstances.get(select)?.trigger.focus();
}

// Timeline filters, labels, and rendering.
function daysFromToday(dateString) {
	const today = new Date(`${localISODate()}T12:00:00`);
	const date = new Date(`${dateString}T12:00:00`);
	return Math.round((date - today) / 86400000);
}

function formatLongDate(dateString) {
	const date = new Date(`${dateString}T12:00:00`);
	return new Intl.DateTimeFormat("pt-BR", {
		weekday: "long",
		day: "2-digit",
		month: "long",
	}).format(date);
}

function formatShortDate(dateString) {
	const date = new Date(`${dateString}T12:00:00`);
	return new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(date);
}

function relativeDateLabel(dateString) {
	const difference = daysFromToday(dateString);
	if (difference === 0) return "Hoje";
	if (difference === 1) return "Amanhã";
	if (difference === -1) return "Ontem";
	if (difference > 1) return `Em ${difference} dias`;
	return `Há ${Math.abs(difference)} dias`;
}

function deadlineBadgeText(dateString) {
	const difference = daysFromToday(dateString);
	if (difference === 0) return "HOJE";
	if (difference === 1) return "1 DIA";
	if (difference > 1) return `${difference} DIAS`;
	if (difference === -1) return "ONTEM";
	return `${Math.abs(difference)} DIAS ATRÁS`;
}

function urgencyOpacity(days) {
	if (days < 0 || days > 7) return 0;
	return (0.055 + (7 - days) * 0.0175).toFixed(3);
}

function updateSubcategoryFilter() {
	const selectedValue = subcategoryFilter.value;
	const selectedCategory = categoryFilter.value;
	const availableItems = selectedCategory
		? subcategories[selectedCategory] || []
		: Object.values(subcategories).flat();

	const uniqueItems = [
		...new Map(availableItems.map((item) => [item.value, item])).values(),
	];

	subcategoryFilter.innerHTML =
		'<option value="">Todas</option>';

	uniqueItems.forEach((item) => {
		const option = document.createElement("option");
		option.value = item.value;
		option.textContent = item.label;
		subcategoryFilter.appendChild(option);
	});

	subcategoryFilter.value = uniqueItems.some(
		(item) => item.value === selectedValue,
	)
		? selectedValue
		: "";
	syncCustomSelect(subcategoryFilter);
	syncCustomSelect(categoryFilter);
}

function getFilteredAppointments() {
	return appointments.filter((item) => {
		const matchesDate = !dateFilter.value || item.date === dateFilter.value;
		const monthDay = item.date.slice(5);
		const matchesPeriod =
			!periodFilter.value ||
			(periodFilter.value === "5" &&
				monthDay >= "01-01" &&
				monthDay <= "08-08") ||
			(periodFilter.value === "6" &&
				monthDay >= "08-31" &&
				monthDay <= "12-19");
		const matchesCategory =
			!categoryFilter.value || item.area === categoryFilter.value;
		const matchesSubcategory =
			!subcategoryFilter.value ||
			item.subcategory === subcategoryFilter.value;
		return (
			matchesDate &&
			matchesPeriod &&
			matchesCategory &&
			matchesSubcategory
		);
	});
}

function getCurrentPeriod() {
	const today = localISODate().slice(5);
	if (today >= "08-31" && today <= "12-19") return "6";
	if (today >= "01-01" && today <= "08-08") return "5";
	return "";
}

function formatTimeRange(item) {
	const start = item.startTime || item.time || "";
	const end = item.endTime || "";
	let range = "N\u00e3o definido";

	if (start && end) {
		range = `Das <strong>${escapeHTML(start)}</strong><span class="card-time-separator">at\u00e9</span><strong>${escapeHTML(end)}</strong>`;
	} else if (start) {
		range = `A partir das <strong>${escapeHTML(start)}</strong>`;
	} else if (end) {
		range = `At\u00e9 <strong>${escapeHTML(end)}</strong>`;
	}

	return `
		<span class="card-time-label">Hor\u00e1rio</span>
		<span class="card-time-range">${range}</span>
	`;
}

function renderDescription(item) {
	if (!item.description) return "";
	return `<p class="card-description">${escapeHTML(item.description)}</p>`;
}

function renderTimeline(options = {}) {
	const preserveScroll = Boolean(options.preserveScroll);
	const scrollBeforeRender = timeline.scrollLeft;
	const focusDate = options.focusDate || null;

	const filtered = getFilteredAppointments().sort((a, b) => {
		const byDate = a.date.localeCompare(b.date);
		if (byDate !== 0) return byDate;
		return (a.startTime || a.time || "23:59").localeCompare(
			b.startTime || b.time || "23:59",
		);
	});

	const grouped = filtered.reduce((groups, item) => {
		if (!groups[item.date]) groups[item.date] = [];
		groups[item.date].push(item);
		return groups;
	}, {});

	const dates = Object.keys(grouped).sort();
	timeline.innerHTML = "";

	const completedCount = filtered.filter(
		(item) => item.status === "done",
	).length;
	const remainingCount = filtered.length - completedCount;
	const completedText =
		completedCount === 1 ? "1 realizado" : `${completedCount} realizados`;
	const remainingText =
		remainingCount === 1 ? "1 restante" : `${remainingCount} restantes`;
	timelineSummary.textContent = `${completedText} · ${remainingText}`;

	if (!dates.length) {
		timeline.innerHTML = `
          <div class="empty-state">
            <div>
              <strong>Nenhum compromisso encontrado</strong>
              Ajuste os filtros ou adicione um novo compromisso.
            </div>
          </div>
        `;
		return;
	}

	dates.forEach((date) => {
		const difference = daysFromToday(date);
		const column = document.createElement("article");
		column.className = "day-column";
		column.dataset.date = date;
		column.style.setProperty(
			"--urgency-opacity",
			urgencyOpacity(difference),
		);

		if (difference < 0) column.classList.add("is-past");
		if (difference === 0) column.classList.add("is-today");
		if (difference >= 0 && difference <= 7)
			column.classList.add("is-urgent");

		const dayAppointments = grouped[date];
		const cards = dayAppointments
			.map((item) => {
				const subcategory = getSubcategory(item.area, item.subcategory);
				const areaLabel = categoryNames[item.area] || item.area;

				return `
            <article
			  class="appointment-card ${item.status === "done" ? "is-completed" : ""}"
			  style="--category-color: ${escapeHTML(getCategoryColor(item.area))}; --subcategory-color: ${escapeHTML(getSubcategoryColor(item.area, subcategory))}"
              data-area="${escapeHTML(item.area)}"
              data-id="${escapeHTML(item.id)}"
              draggable="true"
              title="Arraste para alterar a data"
            >
              <div class="card-actions">
                <button
                  class="status-button"
                  type="button"
                  draggable="false"
                  data-action="toggle-status"
                  data-id="${escapeHTML(item.id)}"
                  aria-label="${item.status === "done" ? "Marcar como pendente" : "Marcar como concluído"}"
                  title="${item.status === "done" ? "Marcar como pendente" : "Marcar como concluído"}"
                >${item.status === "done" ? "✓" : "○"}</button>
                <button class="icon-button" type="button" draggable="false" data-action="edit" data-id="${escapeHTML(item.id)}" aria-label="Editar compromisso">✎</button>
                <button class="icon-button delete" type="button" draggable="false" data-action="delete" data-id="${escapeHTML(item.id)}" aria-label="Excluir compromisso">×</button>
              </div>

				<div class="card-category">${googleIconMarkup(categoryIcons[item.area], "bookmark")}<span>${escapeHTML(areaLabel)}</span></div>
              <div class="card-subcategory">${googleIconMarkup(subcategory.icon, "label")}<span>${escapeHTML(subcategory.label)}</span></div>

              <div class="card-time">
                ${formatTimeRange(item)}
              </div>

              <h3>${escapeHTML(item.title)}</h3>
              ${
					item.area === "UFU" &&
					item.score !== "" &&
					item.score !== null &&
					item.score !== undefined
						? `
                <div class="score-badge">
                  <span>Pontuação</span>
                  <strong>${escapeHTML(item.score)}</strong>
                </div>
              `
						: ""
				}
              ${renderDescription(item)}
            </article>
          `;
			})
			.join("");

		column.innerHTML = `
          <header class="day-heading">
            <div class="day-heading-row">
              <div>
                <h2>${escapeHTML(formatLongDate(date))}</h2>
                <p>${escapeHTML(formatShortDate(date))} · ${dayAppointments.length} ${dayAppointments.length === 1 ? "compromisso" : "compromissos"}</p>
              </div>
              <span class="deadline-badge">${escapeHTML(deadlineBadgeText(date))}</span>
            </div>
          </header>
          <div class="cards">${cards}</div>
        `;

		timeline.appendChild(column);
	});

	requestAnimationFrame(() => {
		if (focusDate) {
			const target = timeline.querySelector(
				`.day-column[data-date="${CSS.escape(focusDate)}"]`,
			);
			if (target) {
				timeline.scrollLeft = target.offsetLeft;
				return;
			}
		}

		if (preserveScroll) {
			timeline.scrollLeft = scrollBeforeRender;
			return;
		}

		if (shouldPositionTimeline) {
			positionTimelineAtCurrentDate();
			shouldPositionTimeline = false;
		}
	});
}

function positionTimelineAtCurrentDate() {
	const columns = [...timeline.querySelectorAll(".day-column")];
	if (!columns.length) return;

	const today = localISODate();
	const target =
		columns.find((column) => column.dataset.date >= today) ||
		columns[columns.length - 1];
	timeline.scrollLeft = target.offsetLeft;
}

// Activity form controls.
function updateScoreField() {
	const isUFU = appointmentArea.value === "UFU";
	appointmentScoreField.hidden = !isUFU;
	appointmentScore.disabled = !isUFU;

	if (!isUFU) {
		appointmentScore.value = "";
	}
}

function populateSubcategories(selectedValue = "") {
	const area = appointmentArea.value;
	const options = subcategories[area] || [];
	appointmentSubcategory.innerHTML = "";
	const placeholder = document.createElement("option");
	placeholder.value = "";
	placeholder.textContent = area
		? options.length
			? "Selecione uma subcategoria"
			: "Nenhuma subcategoria cadastrada"
		: "Selecione uma categoria primeiro";
	appointmentSubcategory.appendChild(placeholder);
	appointmentSubcategory.disabled = !area || options.length === 0;

	options.forEach((item) => {
		const option = document.createElement("option");
		option.value = item.value;
		option.textContent = item.label;
		appointmentSubcategory.appendChild(option);
	});

	if (selectedValue && options.some((item) => item.value === selectedValue)) {
		appointmentSubcategory.value = selectedValue;
	}

	updateScoreField();
	syncCustomSelect(appointmentSubcategory);
	syncCustomSelect(appointmentArea);
}

function openNewAppointment() {
	appointmentForm.reset();
	appointmentId.value = "";
	appointmentDate.value = localISODate();
	appointmentArea.value = "";
	appointmentScore.value = "";
	populateSubcategories();
	syncCustomSelect(appointmentArea);
	dialogTitle.textContent = "Novo compromisso";
	appointmentDialog.showModal();
	requestAnimationFrame(() => appointmentTitle.focus());
}

function openEditAppointment(id) {
	const item = appointments.find((appointment) => appointment.id === id);
	if (!item) return;

	appointmentId.value = item.id;
	appointmentTitle.value = item.title;
	appointmentDescription.value = item.description || "";
	appointmentDate.value = item.date;
	appointmentStartTime.value = item.startTime || item.time || "";
	appointmentEndTime.value = item.endTime || "";
	appointmentArea.value = item.area;
	syncCustomSelect(appointmentArea);
	appointmentScore.value = item.area === "UFU" ? (item.score ?? "") : "";
	populateSubcategories(item.subcategory);
	dialogTitle.textContent = "Editar compromisso";
	appointmentDialog.showModal();
	requestAnimationFrame(() => appointmentTitle.focus());
}

function deleteAppointment(id) {
	const item = appointments.find((appointment) => appointment.id === id);
	if (!item) return;

	const confirmed = window.confirm(`Excluir o compromisso "${item.title}"?`);
	if (!confirmed) return;

	appointments = appointments.filter((appointment) => appointment.id !== id);
	updateSubcategoryFilter();
	renderTimeline({ preserveScroll: true });
}

function moveAppointment(id, targetDate) {
	const item = appointments.find((appointment) => appointment.id === id);
	if (!item || item.date === targetDate) return false;

	const originalDate = item.date;
	const confirmed = window.confirm(
		`Mover "${item.title}" de ${formatShortDate(originalDate)} para ${formatShortDate(targetDate)}?`,
	);

	if (!confirmed) {
		renderTimeline({ focusDate: originalDate });
		return false;
	}

	item.date = targetDate;
	updateSubcategoryFilter();
	renderTimeline({ focusDate: targetDate });
	return true;
}

function toggleAppointmentStatus(id) {
	const item = appointments.find((appointment) => appointment.id === id);
	if (!item) return;

	item.status = item.status === "done" ? "pending" : "done";
	renderTimeline({ preserveScroll: true });
}

function clearDropTargets() {
	timeline
		.querySelectorAll(".drop-target")
		.forEach((column) => column.classList.remove("drop-target"));
}

function closeDialog() {
	closeCustomSelect();
	appointmentDialog.close();
}

// App event handlers.
exportBackupButton.addEventListener("click", exportBackup);

importBackupButton.addEventListener("click", () => {
	importBackupInput.click();
});

importBackupInput.addEventListener("change", async () => {
	const [file] = importBackupInput.files;
	importBackupInput.value = "";
	if (!file) return;

	try {
		await importBackup(file);
	} catch (error) {
		console.error(error);
		window.alert("O arquivo selecionado não é um backup válido da agenda.");
	}
});

appLogo.addEventListener("load", () => {
	appBrand.hidden = false;
});
appLogo.addEventListener("error", () => {
	appBrand.hidden = true;
});
if (appLogo.complete) appBrand.hidden = appLogo.naturalWidth === 0;

newAppointmentButton.addEventListener("click", openNewAppointment);
manageCategoriesButton.addEventListener("click", () => {
	openCategoryList();
	populateCategoryOptions();
	categoriesDialog.showModal();
});
showNewCategoryButton.addEventListener("click", () => {
	categoryListView.hidden = true;
	categoryCreateView.hidden = false;
	newCategoryName.focus();
});
document
	.getElementById("backFromCreateCategoryButton")
	.addEventListener("click", openCategoryList);
document
	.getElementById("backFromCategoryEditButton")
	.addEventListener("click", openCategoryList);
document
	.getElementById("backToCategoriesButton")
	.addEventListener("click", openCategoryList);
managedCategoryList.addEventListener("click", (event) => {
	const edit = event.target.closest("[data-edit-category]");
	if (edit) {
		openCategoryEdit(edit.dataset.editCategory);
		return;
	}
	const remove = event.target.closest("[data-delete-category]");
	if (remove) {
		deleteManagedCategory(remove.dataset.deleteCategory);
		return;
	}
	const open = event.target.closest("[data-open-category]");
	if (open) openCategoryDetail(open.dataset.openCategory);
});
managedSubcategoryList.addEventListener("click", (event) => {
	const edit = event.target.closest("[data-edit-subcategory]");
	if (edit) {
		openSubcategoryDetail(edit.dataset.editSubcategory);
		return;
	}
	const remove = event.target.closest("[data-delete-subcategory]");
	if (remove) {
		deleteManagedSubcategory(
			managedCategorySelect.value,
			remove.dataset.deleteSubcategory,
		);
		return;
	}
	const open = event.target.closest("[data-open-subcategory]");
	if (open) openSubcategoryDetail(open.dataset.openSubcategory);
});
categorySearch.addEventListener("input", renderManagedCategoryList);
subcategorySearch.addEventListener("input", () =>
	renderManagedSubcategoryList(),
);
document
	.getElementById("showNewSubcategoryButton")
	.addEventListener("click", () => {
		subcategoryListView.hidden = true;
		subcategoryCreateView.hidden = false;
		document.getElementById("createSubcategoryHeaderIcon").textContent =
			categoryIcons[managedCategorySelect.value] || "bookmark";
		newSubcategoryName.focus();
	});
document
	.getElementById("backFromSubcategoryCreateButton")
	.addEventListener("click", openSubcategoryList);
document
	.getElementById("backFromSubcategoryDetailButton")
	.addEventListener("click", openSubcategoryList);
closeCategoriesButton.addEventListener("click", () => categoriesDialog.close());
managedCategorySelect.addEventListener("change", populateManagedSubcategories);
managedSubcategorySelect.addEventListener("change", updateManagedIconFields);
managedCategoryIcon.addEventListener("input", () => {
	managedCategoryIconPreview.textContent =
		managedCategoryIcon.value.trim() || "bookmark";
	document.getElementById("editCategoryHeaderIcon").textContent =
		managedCategoryIcon.value.trim() || "bookmark";
});
managedSubcategoryIcon.addEventListener("input", () => {
	managedSubcategoryIconPreview.textContent =
		managedSubcategoryIcon.value.trim() || "label";
	document.getElementById("selectedSubcategoryHeaderIcon").textContent =
		managedSubcategoryIcon.value.trim() || "label";
});
document
	.getElementById("managedSubcategoryName")
	.addEventListener("input", (event) => {
		document.getElementById("selectedSubcategoryName").textContent =
			event.target.value.trim() || "Subcategoria";
	});
document.getElementById("saveCategoryButton").addEventListener("click", () => {
	const key = managedCategorySelect.value;
	if (!key) return;
	const label = document.getElementById("managedCategoryName").value.trim();
	if (!label) {
		window.alert("Informe o nome da categoria.");
		document.getElementById("managedCategoryName").focus();
		return;
	}
	if (
		Object.entries(categoryNames).some(
			([otherKey, name]) =>
				otherKey !== key &&
				name.toLocaleLowerCase() === label.toLocaleLowerCase(),
		)
	) {
		window.alert("Já existe uma categoria com esse nome.");
		return;
	}
	if (!updateManagedCategories(() => {
		categoryNames[key] = label;
		const icon = managedCategoryIcon.value.trim();
		categoryIcons[key] = icon || "bookmark";
		categoryColors[key] = validColor(document.getElementById("managedCategoryColor").value);
	})) return;
	populateCategoryOptions();
	openCategoryDetail(key);
	renderTimeline();
});
document
	.getElementById("saveSubcategoryIconButton")
	.addEventListener("click", () => {
		const key = managedCategorySelect.value;
		const item = (subcategories[key] || []).find(
			(entry) => entry.value === managedSubcategorySelect.value,
		);
		if (!item) return;
		const label = document
			.getElementById("managedSubcategoryName")
			.value.trim();
		if (!label) {
			window.alert("Informe o nome da subcategoria.");
			document.getElementById("managedSubcategoryName").focus();
			return;
		}
		if (
			subcategories[key].some(
				(entry) =>
					entry.value !== item.value &&
					entry.label.toLocaleLowerCase() ===
						label.toLocaleLowerCase(),
			)
		) {
			window.alert(
				"Já existe uma subcategoria com esse nome nesta categoria.",
			);
			return;
		}
		if (!updateManagedCategories(() => {
			item.label = label;
			const icon = managedSubcategoryIcon.value.trim();
			item.icon = icon || "label";
			item.color = validColor(document.getElementById("managedSubcategoryColor").value, getCategoryColor(key));
		})) return;
		updateManagedIconFields();
		renderManagedSubcategoryList();
		renderTimeline();
	});
document.getElementById("addCategoryButton").addEventListener("click", () => {
	const label = newCategoryName.value.trim();
	if (!label) return;
	if (
		Object.values(categoryNames).some(
			(name) => name.toLocaleLowerCase() === label.toLocaleLowerCase(),
		)
	) {
		window.alert("Já existe uma categoria com esse nome.");
		return;
	}
	const key = makeCategoryId(label);
	if (!updateManagedCategories(() => {
		categoryNames[key] = label;
		categoryIcons[key] = "bookmark";
		categoryColors[key] = "#667085";
		subcategories[key] = [];
	})) return;
	newCategoryName.value = "";
	populateCategoryOptions();
	openCategoryDetail(key);
});
document
	.getElementById("addSubcategoryButton")
	.addEventListener("click", () => {
		const key = managedCategorySelect.value;
		const label = newSubcategoryName.value.trim();
		if (!key || !label) return;
		const items = subcategories[key];
		if (
			items.some(
				(item) =>
					item.label.toLocaleLowerCase() ===
					label.toLocaleLowerCase(),
			)
		) {
			window.alert(
				"Já existe uma subcategoria com esse nome nesta categoria.",
			);
			return;
		}
		if (!updateManagedCategories(() => {
			items.push({
				value: `sub-${crypto.randomUUID()}`,
				label,
				icon: "label",
				color: getCategoryColor(key),
			});
		})) return;
		newSubcategoryName.value = "";
		populateManagedSubcategories();
		openSubcategoryList();
		populateSubcategories();
		updateSubcategoryFilter();
	});
closeDialogButton.addEventListener("click", closeDialog);
cancelDialogButton.addEventListener("click", closeDialog);
appointmentArea.addEventListener("change", () => {
	populateSubcategories(appointmentSubcategory.value);
	updateScoreField();
});

appointmentForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	if (!appointmentArea.value) {
		invalidateCustomSelect(appointmentArea);
		return;
	}
	if (!appointmentSubcategory.value) {
		invalidateCustomSelect(appointmentArea);
		return;
	}
	saveAppointmentButton.disabled = true;
	saveAppointmentIcon.textContent = "progress_activity";
	saveAppointmentLabel.textContent = "Salvando...";

	const id = appointmentId.value || crypto.randomUUID();
	const existingIndex = appointments.findIndex((item) => item.id === id);
	const existingItem =
		existingIndex >= 0 ? appointments[existingIndex] : null;

	try {

		const data = {
			id,
			title: appointmentTitle.value.trim(),
			date: appointmentDate.value,
			startTime: appointmentStartTime.value,
			endTime: appointmentEndTime.value,
			area: appointmentArea.value,
			subcategory: appointmentSubcategory.value,
			score:
				appointmentArea.value === "UFU" ? appointmentScore.value : "",
			status: existingItem?.status || "pending",
			description: appointmentDescription.value.trim(),
		};

		if (!data.title || !data.date) return;

		const nextAppointments = [...appointments];
		if (existingIndex >= 0) nextAppointments[existingIndex] = data;
		else nextAppointments.push(data);

		if (!saveAppointments(nextAppointments)) return;
		updateSubcategoryFilter();
		shouldPositionTimeline = false;
		renderTimeline({ focusDate: data.date });
		closeDialog();
	} catch (error) {
		console.error(error);
		window.alert("Não foi possível preparar o compromisso ou seus anexos.");
	} finally {
		saveAppointmentButton.disabled = false;
		saveAppointmentIcon.textContent = "save";
		saveAppointmentLabel.textContent = "Salvar";
	}
});

timeline.addEventListener("click", (event) => {
	if (panMoved) {
		panMoved = false;
		return;
	}

	const button = event.target.closest("[data-action]");
	if (!button) return;

	const { action, id } = button.dataset;
	if (action === "toggle-status") toggleAppointmentStatus(id);
	if (action === "edit") openEditAppointment(id);
	if (action === "delete") deleteAppointment(id);
});

timeline.addEventListener("dragstart", (event) => {
	if (event.target.closest("button, a")) {
		event.preventDefault();
		return;
	}

	const card = event.target.closest(".appointment-card");
	if (!card) return;

	draggedAppointmentId = card.dataset.id;
	card.classList.add("dragging");
	event.dataTransfer.effectAllowed = "move";
	event.dataTransfer.setData("text/plain", draggedAppointmentId);
});

timeline.addEventListener("dragover", (event) => {
	const column = event.target.closest(".day-column");
	if (!column || !draggedAppointmentId) return;

	event.preventDefault();
	event.dataTransfer.dropEffect = "move";
	clearDropTargets();
	column.classList.add("drop-target");

	const rect = timeline.getBoundingClientRect();
	const edgeSize = 70;

	if (event.clientX < rect.left + edgeSize) {
		timeline.scrollLeft -= 18;
	} else if (event.clientX > rect.right - edgeSize) {
		timeline.scrollLeft += 18;
	}
});

timeline.addEventListener("dragleave", (event) => {
	const column = event.target.closest(".day-column");
	if (!column) return;

	const related = event.relatedTarget;
	if (!related || !column.contains(related)) {
		column.classList.remove("drop-target");
	}
});

timeline.addEventListener("drop", (event) => {
	const column = event.target.closest(".day-column");
	if (!column) return;

	event.preventDefault();
	const id = event.dataTransfer.getData("text/plain") || draggedAppointmentId;
	const targetDate = column.dataset.date;

	clearDropTargets();
	moveAppointment(id, targetDate);
	draggedAppointmentId = null;
});

timeline.addEventListener("dragend", (event) => {
	const card = event.target.closest(".appointment-card");
	if (card) card.classList.remove("dragging");
	clearDropTargets();
	draggedAppointmentId = null;
});

timeline.addEventListener("pointerdown", (event) => {
	const column = event.target.closest(".day-column");
	if (!column) return;
	if (event.target.closest(".appointment-card, button, input, select, a"))
		return;
	if (event.button !== 0) return;

	panning = true;
	panMoved = false;
	activePanPointerId = event.pointerId;
	panStartX = event.clientX;
	panStartScrollLeft = timeline.scrollLeft;
	timeline.classList.add("is-panning");
	timeline.setPointerCapture(event.pointerId);
});

timeline.addEventListener("pointermove", (event) => {
	if (!panning || event.pointerId !== activePanPointerId) return;

	const distance = event.clientX - panStartX;
	if (Math.abs(distance) > 4) panMoved = true;
	timeline.scrollLeft = panStartScrollLeft - distance;
});

function finishPanning(event) {
	if (!panning || event.pointerId !== activePanPointerId) return;

	panning = false;
	activePanPointerId = null;
	timeline.classList.remove("is-panning");

	if (timeline.hasPointerCapture(event.pointerId)) {
		timeline.releasePointerCapture(event.pointerId);
	}

	window.setTimeout(() => {
		panMoved = false;
	}, 0);
}

timeline.addEventListener("pointerup", finishPanning);
timeline.addEventListener("pointercancel", finishPanning);

dateFilter.addEventListener("change", () => {
	shouldPositionTimeline = true;
	renderTimeline();
});

periodFilter.addEventListener("change", () => {
	shouldPositionTimeline = true;
	renderTimeline();
});

categoryFilter.addEventListener("change", () => {
	updateSubcategoryFilter();
	shouldPositionTimeline = true;
	renderTimeline();
});

subcategoryFilter.addEventListener("change", () => {
	shouldPositionTimeline = true;
	renderTimeline();
});

clearFiltersButton.addEventListener("click", () => {
	dateFilter.value = "";
	periodFilter.value = getCurrentPeriod();
	syncCustomSelect(periodFilter);
	categoryFilter.value = "";
	subcategoryFilter.value = "";
	updateSubcategoryFilter();
	syncCustomSelect(categoryFilter);
	shouldPositionTimeline = true;
	renderTimeline();
});

timeline.addEventListener(
	"wheel",
	(event) => {
		const cardsContainer = event.target.closest(".cards");
		const isVerticalScroll =
			Math.abs(event.deltaY) >= Math.abs(event.deltaX);

		if (cardsContainer && isVerticalScroll && !event.shiftKey) {
			return;
		}

		if (Math.abs(event.deltaX) > 0 || event.shiftKey) {
			event.preventDefault();
		}
	},
	{ passive: false },
);

appointmentDialog.addEventListener("click", (event) => {
	if (event.target === appointmentDialog) closeDialog();
});

categoriesDialog.addEventListener("click", (event) => {
	if (event.target === categoriesDialog) {
		closeCustomSelect();
		categoriesDialog.close();
	}
});

document.addEventListener("pointerdown", (event) => {
	if (!activeCustomSelect) return;
	if (
		activeCustomSelect.wrapper.contains(event.target) ||
		activeCustomSelect.menu?.contains(event.target)
	)
		return;
	closeCustomSelect();
});
document.addEventListener("keydown", (event) => {
	if (event.key === "Escape" && activeCustomSelect) closeCustomSelect();
});
window.addEventListener("resize", closeCustomSelect);
[appointmentDialog, categoriesDialog].forEach((dialog) => {
	dialog.addEventListener(
		"scroll",
		(event) => {
			if (event.target.classList?.contains("appointment-form"))
				closeCustomSelect();
		},
		true,
	);
});

enhanceSelectFields();
const appRoot = document.querySelector(".app");
appRoot.inert = true;
appRoot.setAttribute("aria-busy", "true");
for (const key of LEGACY_STORAGE_KEYS) {
	try {
		localStorage.removeItem(key);
	} catch (error) {
		console.warn(
			"Não foi possível remover os dados antigos da agenda.",
			error,
		);
	}
}
try {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(createAgendaPayload(appointments)));
} catch (error) {
	console.warn("N?o foi poss?vel remover os metadados de anexos antigos.", error);
}
try {
	const deletion = indexedDB.deleteDatabase("schedlaunch-attachments-v2");
	deletion.onerror = () => console.warn("N?o foi poss?vel apagar os arquivos anexados antigos.");
} catch (error) {
	console.warn("N?o foi poss?vel apagar o banco antigo de anexos.", error);
}
initializeAgenda();
appRoot.inert = false;
appRoot.removeAttribute("aria-busy");

