import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { GameType } from "../../../core/game/Game";
import { GameView } from "../../../core/game/GameView";
import { Layer } from "./Layer";

@customElement("balance-panel")
export class BalancePanel extends LitElement implements Layer {
  public game: GameView;

  @state()
  private isCollapsed: boolean = true;

  @state()
  private attackModifier: number = 1.0;

  @state()
  private defenseModifier: number = 1.0;

  @state()
  private troopGenerationModifier: number = 1.0;

  @state()
  private goldGenerationModifier: number = 1.0;

  @state()
  private gameSpeedModifier: number = 1.0;

  init() {
    // Load initial values from game config
    if (this.game && this.isSingleplayer()) {
      const config = this.game.config().gameConfig();
      this.attackModifier = config.attackModifier ?? 1.0;
      this.defenseModifier = config.defenseModifier ?? 1.0;
      this.troopGenerationModifier = config.troopGenerationModifier ?? 1.0;
      this.goldGenerationModifier = config.goldGenerationModifier ?? 1.0;
      this.gameSpeedModifier = config.gameSpeedModifier ?? 1.0;
    }
  }

  private isSingleplayer(): boolean {
    if (!this.game) return false;
    const gameType = this.game.config().gameConfig().gameType;
    return gameType === GameType.Singleplayer;
  }

  createRenderRoot() {
    return this;
  }

  tick() {}

  private toggleCollapsed() {
    this.isCollapsed = !this.isCollapsed;
    this.requestUpdate();
  }

  private onAttackModifierChange(event: Event) {
    this.attackModifier = parseFloat((event.target as HTMLInputElement).value);
    this.applyBalanceModifiers();
    this.requestUpdate();
  }

  private onDefenseModifierChange(event: Event) {
    this.defenseModifier = parseFloat((event.target as HTMLInputElement).value);
    this.applyBalanceModifiers();
    this.requestUpdate();
  }

  private onTroopGenerationModifierChange(event: Event) {
    this.troopGenerationModifier = parseFloat(
      (event.target as HTMLInputElement).value,
    );
    this.applyBalanceModifiers();
    this.requestUpdate();
  }

  private onGoldGenerationModifierChange(event: Event) {
    this.goldGenerationModifier = parseFloat(
      (event.target as HTMLInputElement).value,
    );
    this.applyBalanceModifiers();
    this.requestUpdate();
  }

  private onGameSpeedModifierChange(event: Event) {
    this.gameSpeedModifier = parseFloat(
      (event.target as HTMLInputElement).value,
    );
    this.applyBalanceModifiers();
    this.requestUpdate();
  }

  private applyBalanceModifiers() {
    if (!this.game) return;
    this.game.config().updateGameConfig({
      attackModifier: this.attackModifier,
      defenseModifier: this.defenseModifier,
      troopGenerationModifier: this.troopGenerationModifier,
      goldGenerationModifier: this.goldGenerationModifier,
      gameSpeedModifier: this.gameSpeedModifier,
    });
  }

  private resetBalanceModifiers() {
    this.attackModifier = 1.0;
    this.defenseModifier = 1.0;
    this.troopGenerationModifier = 1.0;
    this.goldGenerationModifier = 1.0;
    this.gameSpeedModifier = 1.0;
    this.applyBalanceModifiers();
    this.requestUpdate();
  }

  render() {
    // Only show for singleplayer games
    if (!this.isSingleplayer()) {
      return null;
    }

    if (this.isCollapsed) {
      return html`
        <div
          class="fixed bottom-4 left-4 z-[1000] bg-slate-800/90 border border-slate-600 rounded-lg shadow-xl cursor-pointer hover:bg-slate-700/90 transition-colors"
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
        class="fixed bottom-4 left-4 z-[1000] bg-slate-800/95 border border-slate-600 rounded-lg shadow-xl"
        style="width: 280px;"
      >
        <div
          class="p-2 px-3 border-b border-slate-600 cursor-pointer hover:bg-slate-700/50 flex items-center justify-between"
          @click="${this.toggleCollapsed}"
        >
          <span class="text-white text-sm font-medium">Game Balance</span>
          <span class="text-slate-400">▼</span>
        </div>

        <div class="p-3 space-y-2">
          <div class="flex items-center gap-2">
            <div class="text-xs text-slate-300 w-16">Attack</div>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              .value=${this.attackModifier.toString()}
              @input=${this.onAttackModifierChange}
              class="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
            />
            <div class="text-xs text-slate-400 w-10 text-right">
              ${this.attackModifier.toFixed(1)}x
            </div>
          </div>

          <div class="flex items-center gap-2">
            <div class="text-xs text-slate-300 w-16">Defense</div>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              .value=${this.defenseModifier.toString()}
              @input=${this.onDefenseModifierChange}
              class="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
            />
            <div class="text-xs text-slate-400 w-10 text-right">
              ${this.defenseModifier.toFixed(1)}x
            </div>
          </div>

          <div class="flex items-center gap-2">
            <div class="text-xs text-slate-300 w-16">Troops</div>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              .value=${this.troopGenerationModifier.toString()}
              @input=${this.onTroopGenerationModifierChange}
              class="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
            />
            <div class="text-xs text-slate-400 w-10 text-right">
              ${this.troopGenerationModifier.toFixed(1)}x
            </div>
          </div>

          <div class="flex items-center gap-2">
            <div class="text-xs text-slate-300 w-16">Gold</div>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              .value=${this.goldGenerationModifier.toString()}
              @input=${this.onGoldGenerationModifierChange}
              class="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
            />
            <div class="text-xs text-slate-400 w-10 text-right">
              ${this.goldGenerationModifier.toFixed(1)}x
            </div>
          </div>

          <div class="flex items-center gap-2">
            <div class="text-xs text-slate-300 w-16">Speed</div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              .value=${this.gameSpeedModifier.toString()}
              @input=${this.onGameSpeedModifierChange}
              class="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
            />
            <div class="text-xs text-slate-400 w-10 text-right">
              ${this.gameSpeedModifier.toFixed(1)}x
            </div>
          </div>

          <button
            class="w-full mt-2 p-1.5 bg-slate-600 hover:bg-slate-500 rounded text-white text-xs transition-colors"
            @click="${this.resetBalanceModifiers}"
          >
            Reset
          </button>
        </div>
      </div>
    `;
  }
}
