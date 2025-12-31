import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { GameType } from "../../../core/game/Game";
import { GameView } from "../../../core/game/GameView";
import { Layer } from "./Layer";

@customElement("balance-panel")
export class BalancePanel extends LitElement implements Layer {
  @state() public game: GameView;

  @state()
  private isCollapsed: boolean = false; // Start expanded so it's visible

  @state()
  private expandedSections: Set<string> = new Set(["combat"]);

  // Combat modifiers
  @state() private attackModifier: number = 1.0;
  @state() private defenseModifier: number = 1.0;
  @state() private troopGenerationModifier: number = 1.0;
  @state() private goldGenerationModifier: number = 1.0;
  @state() private gameSpeedModifier: number = 1.0;
  @state() private maxTroopsModifier: number = 1.0;

  // Cost modifiers
  @state() private buildCostModifier: number = 1.0;
  @state() private nukeCostModifier: number = 1.0;

  // AI modifiers
  @state() private botAggressionModifier: number = 1.0;
  @state() private nationStrengthModifier: number = 1.0;

  // Naval modifiers
  @state() private tradeShipSpawnModifier: number = 1.0;
  @state() private warshipSpawnModifier: number = 1.0;
  @state() private boatCapacityModifier: number = 1.0;
  @state() private warshipHealthModifier: number = 1.0;
  @state() private shellDamageModifier: number = 1.0;
  @state() private warshipRangeModifier: number = 1.0;

  // Nuke modifiers
  @state() private nukeMagnitudeModifier: number = 1.0;
  @state() private nukeSpeedModifier: number = 1.0;
  @state() private samRangeModifier: number = 1.0;

  // Range modifiers
  @state() private defensePostRangeModifier: number = 1.0;

  // Gameplay modifiers
  @state() private spawnImmunityModifier: number = 1.0;
  @state() private allianceDurationModifier: number = 1.0;

  init() {
    if (this.game && this.isSingleplayer()) {
      this.loadFromConfig();
    }
  }

  private loadFromConfig() {
    const config = this.game.config().gameConfig();
    // Combat
    this.attackModifier = config.attackModifier ?? 1.0;
    this.defenseModifier = config.defenseModifier ?? 1.0;
    this.troopGenerationModifier = config.troopGenerationModifier ?? 1.0;
    this.goldGenerationModifier = config.goldGenerationModifier ?? 1.0;
    this.gameSpeedModifier = config.gameSpeedModifier ?? 1.0;
    this.maxTroopsModifier = config.maxTroopsModifier ?? 1.0;
    // Costs
    this.buildCostModifier = config.buildCostModifier ?? 1.0;
    this.nukeCostModifier = config.nukeCostModifier ?? 1.0;
    // AI
    this.botAggressionModifier = config.botAggressionModifier ?? 1.0;
    this.nationStrengthModifier = config.nationStrengthModifier ?? 1.0;
    // Naval
    this.tradeShipSpawnModifier = config.tradeShipSpawnModifier ?? 1.0;
    this.warshipSpawnModifier = config.warshipSpawnModifier ?? 1.0;
    this.boatCapacityModifier = config.boatCapacityModifier ?? 1.0;
    this.warshipHealthModifier = config.warshipHealthModifier ?? 1.0;
    this.shellDamageModifier = config.shellDamageModifier ?? 1.0;
    this.warshipRangeModifier = config.warshipRangeModifier ?? 1.0;
    // Nukes
    this.nukeMagnitudeModifier = config.nukeMagnitudeModifier ?? 1.0;
    this.nukeSpeedModifier = config.nukeSpeedModifier ?? 1.0;
    this.samRangeModifier = config.samRangeModifier ?? 1.0;
    // Ranges
    this.defensePostRangeModifier = config.defensePostRangeModifier ?? 1.0;
    // Gameplay
    this.spawnImmunityModifier = config.spawnImmunityModifier ?? 1.0;
    this.allianceDurationModifier = config.allianceDurationModifier ?? 1.0;
  }

  private isSingleplayer(): boolean {
    if (!this.game) {
      return false;
    }
    // Show for singleplayer or when gameType is not set (assume local game)
    const gameType = this.game.config().gameConfig().gameType;
    return gameType === GameType.Singleplayer || gameType === undefined;
  }

  createRenderRoot() {
    return this;
  }

  tick() {}

  private toggleCollapsed() {
    this.isCollapsed = !this.isCollapsed;
    this.requestUpdate();
  }

  private toggleSection(section: string) {
    if (this.expandedSections.has(section)) {
      this.expandedSections.delete(section);
    } else {
      this.expandedSections.add(section);
    }
    this.expandedSections = new Set(this.expandedSections);
    this.requestUpdate();
  }

  private applyAllModifiers() {
    if (!this.game) return;
    const updates = {
      // Combat
      attackModifier: this.attackModifier,
      defenseModifier: this.defenseModifier,
      troopGenerationModifier: this.troopGenerationModifier,
      goldGenerationModifier: this.goldGenerationModifier,
      gameSpeedModifier: this.gameSpeedModifier,
      maxTroopsModifier: this.maxTroopsModifier,
      // Costs
      buildCostModifier: this.buildCostModifier,
      nukeCostModifier: this.nukeCostModifier,
      // AI
      botAggressionModifier: this.botAggressionModifier,
      nationStrengthModifier: this.nationStrengthModifier,
      // Naval
      tradeShipSpawnModifier: this.tradeShipSpawnModifier,
      warshipSpawnModifier: this.warshipSpawnModifier,
      boatCapacityModifier: this.boatCapacityModifier,
      warshipHealthModifier: this.warshipHealthModifier,
      shellDamageModifier: this.shellDamageModifier,
      warshipRangeModifier: this.warshipRangeModifier,
      // Nukes
      nukeMagnitudeModifier: this.nukeMagnitudeModifier,
      nukeSpeedModifier: this.nukeSpeedModifier,
      samRangeModifier: this.samRangeModifier,
      // Ranges
      defensePostRangeModifier: this.defensePostRangeModifier,
      // Gameplay
      spawnImmunityModifier: this.spawnImmunityModifier,
      allianceDurationModifier: this.allianceDurationModifier,
    };
    // Update local config for display
    this.game.config().updateGameConfig(updates);
    // Send updates to the worker where game simulation runs
    this.game.worker.updateGameConfig(updates);
  }

  private resetAll() {
    // Combat
    this.attackModifier = 1.0;
    this.defenseModifier = 1.0;
    this.troopGenerationModifier = 1.0;
    this.goldGenerationModifier = 1.0;
    this.gameSpeedModifier = 1.0;
    this.maxTroopsModifier = 1.0;
    // Costs
    this.buildCostModifier = 1.0;
    this.nukeCostModifier = 1.0;
    // AI
    this.botAggressionModifier = 1.0;
    this.nationStrengthModifier = 1.0;
    // Naval
    this.tradeShipSpawnModifier = 1.0;
    this.warshipSpawnModifier = 1.0;
    this.boatCapacityModifier = 1.0;
    this.warshipHealthModifier = 1.0;
    this.shellDamageModifier = 1.0;
    this.warshipRangeModifier = 1.0;
    // Nukes
    this.nukeMagnitudeModifier = 1.0;
    this.nukeSpeedModifier = 1.0;
    this.samRangeModifier = 1.0;
    // Ranges
    this.defensePostRangeModifier = 1.0;
    // Gameplay
    this.spawnImmunityModifier = 1.0;
    this.allianceDurationModifier = 1.0;

    this.applyAllModifiers();
    this.requestUpdate();
  }

  private onSliderChange(field: string, event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value);
    (this as unknown as Record<string, number>)[field] = value;
    this.applyAllModifiers();
    this.requestUpdate();
  }

  private renderSlider(
    label: string,
    field: string,
    min: number,
    max: number,
    step: number = 0.1,
  ) {
    const value = (this as unknown as Record<string, number>)[field];
    return html`
      <div class="flex items-center gap-2 py-1">
        <div class="text-xs text-slate-300 w-20 truncate" title="${label}">
          ${label}
        </div>
        <input
          type="range"
          min="${min}"
          max="${max}"
          step="${step}"
          .value=${value.toString()}
          @input=${(e: Event) => this.onSliderChange(field, e)}
          class="flex-1 h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer"
        />
        <div class="text-xs text-slate-400 w-10 text-right">
          ${value.toFixed(1)}x
        </div>
      </div>
    `;
  }

  private renderSection(
    id: string,
    title: string,
    sliders: ReturnType<typeof html>[],
  ) {
    const isExpanded = this.expandedSections.has(id);
    return html`
      <div class="border-b border-slate-700 last:border-0">
        <button
          class="w-full flex items-center justify-between p-2 hover:bg-slate-700/50 text-xs font-medium text-slate-300"
          @click=${() => this.toggleSection(id)}
        >
          <span>${title}</span>
          <span class="text-slate-500">${isExpanded ? "▼" : "▶"}</span>
        </button>
        ${isExpanded ? html`<div class="px-2 pb-2">${sliders}</div>` : ""}
      </div>
    `;
  }

  render() {
    if (!this.isSingleplayer()) {
      return null;
    }

    if (this.isCollapsed) {
      return html`
        <div
          class="fixed top-20 left-4 z-[1000] bg-slate-800/90 border border-slate-600 rounded-lg shadow-xl cursor-pointer hover:bg-slate-700/90 transition-colors"
          @click="${this.toggleCollapsed}"
        >
          <div
            class="p-2 px-3 text-white text-sm font-medium flex items-center gap-2"
          >
            <span>Balance</span>
            <span class="text-slate-400">▶</span>
          </div>
        </div>
      `;
    }

    return html`
      <div
        class="fixed top-20 left-4 z-[1000] bg-slate-800/95 border border-slate-600 rounded-lg shadow-xl"
        style="width: 300px; max-height: 70vh; display: flex; flex-direction: column;"
      >
        <div
          class="p-2 px-3 border-b border-slate-600 cursor-pointer hover:bg-slate-700/50 flex items-center justify-between flex-shrink-0"
          @click="${this.toggleCollapsed}"
        >
          <span class="text-white text-sm font-medium">Game Balance</span>
          <span class="text-slate-400">▼</span>
        </div>

        <div class="overflow-y-auto flex-1">
          ${this.renderSection("combat", "Combat & Economy", [
            this.renderSlider("Attack", "attackModifier", 0.1, 5),
            this.renderSlider("Defense", "defenseModifier", 0.1, 5),
            this.renderSlider("Troops Gen", "troopGenerationModifier", 0.1, 5),
            this.renderSlider("Gold Gen", "goldGenerationModifier", 0.1, 5),
            this.renderSlider("Max Troops", "maxTroopsModifier", 0.1, 5),
            this.renderSlider("Game Speed", "gameSpeedModifier", 0.5, 3),
          ])}
          ${this.renderSection("costs", "Costs", [
            this.renderSlider("Build Cost", "buildCostModifier", 0.1, 5),
            this.renderSlider("Nuke Cost", "nukeCostModifier", 0.1, 5),
          ])}
          ${this.renderSection("nukes", "Nuclear Weapons", [
            this.renderSlider("Blast Radius", "nukeMagnitudeModifier", 0.1, 5),
            this.renderSlider("Nuke Speed", "nukeSpeedModifier", 0.1, 5),
            this.renderSlider("SAM Range", "samRangeModifier", 0.1, 3),
          ])}
          ${this.renderSection("naval", "Naval Combat", [
            this.renderSlider("Trade Ships", "tradeShipSpawnModifier", 0.1, 5),
            this.renderSlider("Warships", "warshipSpawnModifier", 0.1, 5),
            this.renderSlider("Boat Limit", "boatCapacityModifier", 0.5, 5),
            this.renderSlider("Ship Health", "warshipHealthModifier", 0.1, 5),
            this.renderSlider("Shell Damage", "shellDamageModifier", 0.1, 5),
            this.renderSlider("Ship Range", "warshipRangeModifier", 0.1, 3),
          ])}
          ${this.renderSection("ai", "AI Behavior", [
            this.renderSlider(
              "Bot Aggression",
              "botAggressionModifier",
              0.1,
              3,
            ),
            this.renderSlider(
              "Nation Strength",
              "nationStrengthModifier",
              0.1,
              3,
            ),
          ])}
          ${this.renderSection("ranges", "Ranges & Defense", [
            this.renderSlider(
              "Def Post Range",
              "defensePostRangeModifier",
              0.1,
              3,
            ),
          ])}
          ${this.renderSection("gameplay", "Gameplay", [
            this.renderSlider(
              "Spawn Immunity",
              "spawnImmunityModifier",
              0.1,
              5,
            ),
            this.renderSlider(
              "Alliance Time",
              "allianceDurationModifier",
              0.1,
              5,
            ),
          ])}
        </div>

        <div class="p-2 border-t border-slate-600 flex-shrink-0">
          <button
            class="w-full p-1.5 bg-slate-600 hover:bg-slate-500 rounded text-white text-xs transition-colors"
            @click="${this.resetAll}"
          >
            Reset All
          </button>
        </div>
      </div>
    `;
  }
}
