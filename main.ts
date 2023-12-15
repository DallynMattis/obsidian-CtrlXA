import { App, Editor, MarkdownView,  Plugin, PluginSettingTab, Setting } from 'obsidian';
import { findCycle } from './cycle';

// Remember to rename these classes and interfaces!

interface CtrlXASettings {
	mySetting: string[][];
}

const DEFAULT_SETTINGS: CtrlXASettings = {
	mySetting: [
		["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
		["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"],
		["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
	]
}

export default class CtrlXAPlugin extends Plugin {
	settings: CtrlXASettings;

	async onload() {
		await this.loadSettings();

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'cycle-up',
			name: 'Cycle up',
			editorCallback: (editor: Editor, _view: MarkdownView) => {
                cycle(editor, 1, this.settings.mySetting);
			}
		});

		this.addCommand({
			id: 'cycle-down',
			name: 'Cycle down',
			editorCallback: (editor: Editor, _view: MarkdownView) => {
                cycle(editor, -1, this.settings.mySetting);
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new CtrlXASettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

function cycle(parEditor: Editor, parDirection: number, parCycles: string[][]) {
	console.log("Line >" + parEditor.getLine(parEditor.getCursor().line) + "<");
	console.log("Word from >" + (parEditor.wordAt(parEditor.getCursor())?.from.ch ?? "") + "<");
	console.log("Word to >" + (parEditor.wordAt(parEditor.getCursor())?.to.ch ?? "") + "<");

	let wordAt = parEditor.wordAt(parEditor.getCursor());
	if (wordAt != null) {
		let wordToReplace = parEditor.getRange(wordAt.from, wordAt.to);
		console.log("Replacing word >" + wordToReplace + "<");
		let wordNew = findCycle(wordToReplace,parDirection, parCycles);
		console.log("New word >" + wordNew + "<");
		parEditor.replaceRange(wordNew, wordAt.from, wordAt.to);
	} else {
		console.log("No word at cursor, doing nothing");
	}
}

class CtrlXASettingTab extends PluginSettingTab {
	plugin: CtrlXAPlugin;

	constructor(app: App, plugin: CtrlXAPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'General Settings' });

		containerEl.createEl('h2', { text: 'Cycle Settings' });

		new Setting(containerEl)
			.setName('Cycle lists 0')
			.setDesc('E.g. : "Monday, Tuesday, Wednesday,...')
			.addText(text => text
				.setPlaceholder('Monday,...')
				.setValue(this.plugin.settings.mySetting[0].join(","))
				.onChange(async (value) => {
					this.plugin.settings.mySetting[0] = value.split(",");
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Cycle lists 1')
			.setDesc('E.g. : "Monday, Tuesday, Wednesday,...')
			.addText(text => text
				.setPlaceholder('Monday,...')
				.setValue(this.plugin.settings.mySetting[1].join(","))
				.onChange(async (value) => {
					this.plugin.settings.mySetting[1] = value.split(",");
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Cycle lists 2')
			.setDesc('E.g. : "Monday, Tuesday, Wednesday,...')
			.addText(text => text
				.setPlaceholder('Monday,...')
				.setValue(this.plugin.settings.mySetting[2].join(","))
				.onChange(async (value) => {
					this.plugin.settings.mySetting[2] = value.split(",");
					await this.plugin.saveSettings();
				}));
	}
}
