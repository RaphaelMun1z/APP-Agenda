/* Binary attachment storage. Agenda records keep only file metadata and storageId. */
class AttachmentStore {
	constructor() {
		this.databasePromise = null;
	}

	static deleteDatabase(name) {
		return new Promise((resolve, reject) => {
			try {
				const request = indexedDB.deleteDatabase(name);
				request.onsuccess = () => resolve();
				request.onerror = () => reject(request.error);
				request.onblocked = () =>
					reject(
						new Error(
							"Feche abas antigas do app para concluir a limpeza.",
						),
					);
			} catch (error) {
				reject(error);
			}
		});
	}

	open() {
		if (!this.databasePromise) {
			this.databasePromise = new Promise((resolve, reject) => {
				const request = indexedDB.open("schedlaunch-attachments-v2", 1);
				let blocked = false;
				request.onupgradeneeded = () => {
					request.result.createObjectStore("files");
				};
				request.onerror = () => reject(request.error);
				request.onblocked = () => {
					blocked = true;
					reject(
						new Error(
							"Feche outras abas do app e tente novamente.",
						),
					);
				};
				request.onsuccess = () => {
					const database = request.result;
					if (blocked) {
						database.close();
						return;
					}
					database.onversionchange = () => {
						database.close();
						this.databasePromise = null;
					};
					resolve(database);
				};
			}).catch((error) => {
				this.databasePromise = null;
				throw error;
			});
		}
		return this.databasePromise;
	}

	async transaction(mode, work) {
		const database = await this.open();
		return new Promise((resolve, reject) => {
			const transaction = database.transaction("files", mode);
			let result;
			transaction.oncomplete = () => resolve(result);
			transaction.onabort = () =>
				reject(
					transaction.error ||
						new Error("Falha ao gravar os anexos."),
				);
			transaction.onerror = () =>
				reject(
					transaction.error ||
						new Error("Falha ao acessar os anexos."),
				);
			try {
				work(transaction.objectStore("files"), (value) => {
					result = value;
				});
			} catch (error) {
				transaction.abort();
				reject(error);
			}
		});
	}

	async blobFor(attachment) {
		if (attachment.blob instanceof Blob) return attachment.blob;
		if (attachment.dataUrl) {
			if (!attachment.dataUrl.startsWith("data:"))
				throw new Error("Conteúdo de anexo inválido.");
			const response = await fetch(attachment.dataUrl);
			return response.blob();
		}
		if (attachment.storageId) {
			return this.transaction("readonly", (store, done) => {
				const request = store.get(attachment.storageId);
				request.onsuccess = () => done(request.result);
			});
		}
		return null;
	}

	async prepare(appointments) {
		const files = [];
		const prepared = [];
		for (const appointment of appointments) {
			const attachments = [];
			for (const attachment of appointment.attachments || []) {
				const { blob, dataUrl, ...metadata } = attachment;
				if (blob instanceof Blob || dataUrl) {
					const content = await this.blobFor(attachment);
					metadata.storageId = crypto.randomUUID();
					metadata.size = content.size;
					files.push({ id: metadata.storageId, blob: content });
				}
				attachments.push(metadata);
			}
			prepared.push({ ...appointment, attachments });
		}
		return { appointments: prepared, files };
	}

	async write(files) {
		if (!files.length) return;
		await this.transaction("readwrite", (store) => {
			for (const file of files) store.put(file.blob, file.id);
		});
	}

	async removeUnused(appointments) {
		const retained = new Set(
			appointments.flatMap((item) =>
				(item.attachments || [])
					.map((attachment) => attachment.storageId)
					.filter(Boolean),
			),
		);
		await this.transaction("readwrite", (store) => {
			const request = store.openKeyCursor();
			request.onsuccess = () => {
				const cursor = request.result;
				if (!cursor) return;
				if (!retained.has(cursor.key)) store.delete(cursor.key);
				cursor.continue();
			};
		});
	}

	async portableAppointments(appointments, encode) {
		const portable = [];
		for (const appointment of appointments) {
			const attachments = [];
			for (const attachment of appointment.attachments || []) {
				const { blob, storageId, dataUrl, ...metadata } = attachment;
				const content = await this.blobFor(attachment);
				if (!content)
					throw new Error(
						`O arquivo “${attachment.name}” não está disponível.`,
					);
				attachments.push({
					...metadata,
					dataUrl: await encode(content),
				});
			}
			portable.push({ ...appointment, attachments });
		}
		return portable;
	}

	async stageImport(appointments) {
		const staged = [];
		for (const appointment of appointments) {
			const attachments = [];
			for (const attachment of appointment.attachments || []) {
				const { dataUrl, storageId, ...metadata } = attachment;
				// Backups must carry their own content, never depend on another browser's keys.
				if (storageId && !dataUrl)
					throw new Error(
						`O backup não contém o arquivo “${attachment.name}”.`,
					);
				if (dataUrl) metadata.blob = await this.blobFor(attachment);
				attachments.push(metadata);
			}
			staged.push({ ...appointment, attachments });
		}
		return staged;
	}
}
