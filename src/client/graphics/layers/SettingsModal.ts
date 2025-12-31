import { html, LitElement } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { EventBus } from "../../../core/EventBus";
import { GameType } from "../../../core/game/Game";
import { GameView } from "../../../core/game/GameView";
import { UserSettings } from "../../../core/game/UserSettings";
import { AlternateViewEvent, RefreshGraphicsEvent } from "../../InputHandler";
import { PauseGameIntentEvent } from "../../Transport";
import { translateText } from "../../Utils";
import SoundManager from "../../sound/SoundManager";
import { Layer } from "./Layer";
import structureIcon from "/images/CityIconWhite.svg?url";
import cursorPriceIcon from "/images/CursorPriceIconWhite.svg?url";
import darkModeIcon from "/images/DarkModeIconWhite.svg?url";
import emojiIcon from "/images/EmojiIconWhite.svg?url";
import exitIcon from "/images/ExitIconWhite.svg?url";
import explosionIcon from "/images/ExplosionIconWhite.svg?url";
import mouseIcon from "/images/MouseIconWhite.svg?url";
import ninjaIcon from "/images/NinjaIconWhite.svg?url";
import {
  default as settingsIcon,
  default as slidersIcon,
} from "/images/SettingIconWhite.svg?url";
import sirenIcon from "/images/SirenIconWhite.svg?url";
import treeIcon from "/images/TreeIconWhite.svg?url";
import musicIcon from "/images/music.svg?url";

export class ShowSettingsModalEvent {
  constructor(
    public readonly isVisible: boolean = true,
    public readonly shouldPause: boolean = false,
    public readonly isPaused: boolean = false,
  ) {}
}

@customElement("settings-modal")
export class SettingsModal extends LitElement implements Layer {
  public eventBus: EventBus;
  public userSettings: UserSettings;
  public game: GameView;

  @state()
  private isVisible: boolean = false;

  @state()
  private alternateView: boolean = false;

  @state()
  private showBalanceSettings: boolean = false;

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

  @query(".modal-overlay")
  private modalOverlay!: HTMLElement;

  @property({ type: Boolean })
  shouldPause = false;

  @property({ type: Boolean })
  wasPausedWhenOpened = false;

  init() {
    SoundManager.setBackgroundMusicVolume(
      this.userSettings.backgroundMusicVolume(),
    );
    SoundManager.setSoundEffectsVolume(this.userSettings.soundEffectsVolume());
    this.eventBus.on(ShowSettingsModalEvent, (event) => {
      this.isVisible = event.isVisible;
      this.shouldPause = event.shouldPause;
      this.wasPausedWhenOpened = event.isPaused;
      this.pauseGame(true);
      // Load current modifier values from game config
      if (this.game && this.isSingleplayer()) {
        const config = this.game.config().gameConfig();
        this.attackModifier = config.attackModifier ?? 1.0;
        this.defenseModifier = config.defenseModifier ?? 1.0;
        this.troopGenerationModifier = config.troopGenerationModifier ?? 1.0;
        this.goldGenerationModifier = config.goldGenerationModifier ?? 1.0;
        this.gameSpeedModifier = config.gameSpeedModifier ?? 1.0;
      }
    });
  }

  private isSingleplayer(): boolean {
    if (!this.game) return false;
    const gameType = this.game.config().gameConfig().gameType;
    return gameType === GameType.Singleplayer;
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("click", this.handleOutsideClick, true);
    window.addEventListener("keydown", this.handleKeyDown);
  }

  disconnectedCallback() {
    window.removeEventListener("click", this.handleOutsideClick, true);
    window.removeEventListener("keydown", this.handleKeyDown);
    super.disconnectedCallback();
  }

  private handleOutsideClick = (event: MouseEvent) => {
    if (
      this.isVisible &&
      this.modalOverlay &&
      event.target === this.modalOverlay
    ) {
      this.closeModal();
    }
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (this.isVisible && event.key === "Escape") {
      this.closeModal();
    }
  };

  public openModal() {
    this.isVisible = true;
    document.body.style.overflow = "hidden";
    this.requestUpdate();
  }

  public closeModal() {
    this.isVisible = false;
    document.body.style.overflow = "";
    this.requestUpdate();
    this.pauseGame(false);
  }

  private pauseGame(pause: boolean) {
    if (this.shouldPause && !this.wasPausedWhenOpened)
      this.eventBus.emit(new PauseGameIntentEvent(pause));
  }

  private onTerrainButtonClick() {
    this.alternateView = !this.alternateView;
    this.eventBus.emit(new AlternateViewEvent(this.alternateView));
    this.requestUpdate();
  }

  private onToggleEmojisButtonClick() {
    this.userSettings.toggleEmojis();
    this.requestUpdate();
  }

  private onToggleStructureSpritesButtonClick() {
    this.userSettings.toggleStructureSprites();
    this.requestUpdate();
  }

  private onToggleSpecialEffectsButtonClick() {
    this.userSettings.toggleFxLayer();
    this.requestUpdate();
  }

  private onToggleAlertFrameButtonClick() {
    this.userSettings.toggleAlertFrame();
    this.requestUpdate();
  }

  private onToggleDarkModeButtonClick() {
    this.userSettings.toggleDarkMode();
    this.eventBus.emit(new RefreshGraphicsEvent());
    this.requestUpdate();
  }

  private onToggleRandomNameModeButtonClick() {
    this.userSettings.toggleRandomName();
    this.requestUpdate();
  }

  private onToggleLeftClickOpensMenu() {
    this.userSettings.toggleLeftClickOpenMenu();
    this.requestUpdate();
  }

  private onToggleCursorCostLabelButtonClick() {
    this.userSettings.toggleCursorCostLabel();
    this.requestUpdate();
  }

  private onTogglePerformanceOverlayButtonClick() {
    this.userSettings.togglePerformanceOverlay();
    this.requestUpdate();
  }

  private onExitButtonClick() {
    // redirect to the home page
    window.location.href = "/";
  }

  private onVolumeChange(event: Event) {
    const volume = parseFloat((event.target as HTMLInputElement).value) / 100;
    this.userSettings.setBackgroundMusicVolume(volume);
    SoundManager.setBackgroundMusicVolume(volume);
    this.requestUpdate();
  }

  private onSoundEffectsVolumeChange(event: Event) {
    const volume = parseFloat((event.target as HTMLInputElement).value) / 100;
    this.userSettings.setSoundEffectsVolume(volume);
    SoundManager.setSoundEffectsVolume(volume);
    this.requestUpdate();
  }

  private onToggleBalanceSettings() {
    this.showBalanceSettings = !this.showBalanceSettings;
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

  private renderBalanceSettings() {
    return html`
      <div class="border-t border-slate-600 pt-3 mt-4">
        <button
          class="flex gap-3 items-center w-full text-left p-3 hover:bg-slate-700 rounded text-white transition-colors"
          @click="${this.onToggleBalanceSettings}"
        >
          <img src=${slidersIcon} alt="balance" width="20" height="20" />
          <div class="flex-1">
            <div class="font-medium">Game Balance (Advanced)</div>
            <div class="text-sm text-slate-400">
              Adjust game mechanics in real-time
            </div>
          </div>
          <div class="text-sm text-slate-400">
            ${this.showBalanceSettings ? "▼" : "▶"}
          </div>
        </button>

        ${this.showBalanceSettings
          ? html`
              <div class="ml-8 mt-2 space-y-3">
                <div
                  class="flex gap-3 items-center w-full text-left p-3 bg-slate-700/50 rounded text-white"
                >
                  <div class="flex-1">
                    <div class="font-medium text-sm">Attack Power</div>
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      .value=${this.attackModifier.toString()}
                      @input=${this.onAttackModifierChange}
                      class="w-full border border-slate-500 rounded-lg"
                    />
                  </div>
                  <div class="text-sm text-slate-400 w-12 text-right">
                    ${this.attackModifier.toFixed(1)}x
                  </div>
                </div>

                <div
                  class="flex gap-3 items-center w-full text-left p-3 bg-slate-700/50 rounded text-white"
                >
                  <div class="flex-1">
                    <div class="font-medium text-sm">Defense Power</div>
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      .value=${this.defenseModifier.toString()}
                      @input=${this.onDefenseModifierChange}
                      class="w-full border border-slate-500 rounded-lg"
                    />
                  </div>
                  <div class="text-sm text-slate-400 w-12 text-right">
                    ${this.defenseModifier.toFixed(1)}x
                  </div>
                </div>

                <div
                  class="flex gap-3 items-center w-full text-left p-3 bg-slate-700/50 rounded text-white"
                >
                  <div class="flex-1">
                    <div class="font-medium text-sm">Troop Generation</div>
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      .value=${this.troopGenerationModifier.toString()}
                      @input=${this.onTroopGenerationModifierChange}
                      class="w-full border border-slate-500 rounded-lg"
                    />
                  </div>
                  <div class="text-sm text-slate-400 w-12 text-right">
                    ${this.troopGenerationModifier.toFixed(1)}x
                  </div>
                </div>

                <div
                  class="flex gap-3 items-center w-full text-left p-3 bg-slate-700/50 rounded text-white"
                >
                  <div class="flex-1">
                    <div class="font-medium text-sm">Gold Generation</div>
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      .value=${this.goldGenerationModifier.toString()}
                      @input=${this.onGoldGenerationModifierChange}
                      class="w-full border border-slate-500 rounded-lg"
                    />
                  </div>
                  <div class="text-sm text-slate-400 w-12 text-right">
                    ${this.goldGenerationModifier.toFixed(1)}x
                  </div>
                </div>

                <div
                  class="flex gap-3 items-center w-full text-left p-3 bg-slate-700/50 rounded text-white"
                >
                  <div class="flex-1">
                    <div class="font-medium text-sm">Game Speed</div>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      .value=${this.gameSpeedModifier.toString()}
                      @input=${this.onGameSpeedModifierChange}
                      class="w-full border border-slate-500 rounded-lg"
                    />
                  </div>
                  <div class="text-sm text-slate-400 w-12 text-right">
                    ${this.gameSpeedModifier.toFixed(1)}x
                  </div>
                </div>

                <button
                  class="w-full p-2 bg-slate-600 hover:bg-slate-500 rounded text-white text-sm transition-colors"
                  @click="${this.resetBalanceModifiers}"
                >
                  Reset to Defaults
                </button>
              </div>
            `
          : ""}
      </div>
    `;
  }

  render() {
    if (!this.isVisible) {
      return null;
    }

    return html`
      <div
        class="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4"
        @contextmenu=${(e: Event) => e.preventDefault()}
      >
        <div
          class="bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
        >
          <div
            class="flex items-center justify-between p-4 border-b border-slate-600"
          >
            <div class="flex items-center gap-2">
              <img
                src=${settingsIcon}
                alt="settings"
                width="24"
                height="24"
                style="vertical-align: middle;"
              />
              <h2 class="text-xl font-semibold text-white">
                ${translateText("user_setting.tab_basic")}
              </h2>
            </div>
            <button
              class="text-slate-400 hover:text-white text-2xl font-bold leading-none"
              @click=${this.closeModal}
            >
              ×
            </button>
          </div>

          <div class="p-4 space-y-3">
            <div
              class="flex gap-3 items-center w-full text-left p-3 hover:bg-slate-700 rounded text-white transition-colors"
            >
              <img src=${musicIcon} alt="musicIcon" width="20" height="20" />
              <div class="flex-1">
                <div class="font-medium">
                  ${translateText("user_setting.background_music_volume")}
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  .value=${this.userSettings.backgroundMusicVolume() * 100}
                  @input=${this.onVolumeChange}
                  class="w-full border border-slate-500 rounded-lg"
                />
              </div>
              <div class="text-sm text-slate-400">
                ${Math.round(this.userSettings.backgroundMusicVolume() * 100)}%
              </div>
            </div>

            <div
              class="flex gap-3 items-center w-full text-left p-3 hover:bg-slate-700 rounded text-white transition-colors"
            >
              <img
                src=${musicIcon}
                alt="soundEffectsIcon"
                width="20"
                height="20"
              />
              <div class="flex-1">
                <div class="font-medium">
                  ${translateText("user_setting.sound_effects_volume")}
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  .value=${this.userSettings.soundEffectsVolume() * 100}
                  @input=${this.onSoundEffectsVolumeChange}
                  class="w-full border border-slate-500 rounded-lg"
                />
              </div>
              <div class="text-sm text-slate-400">
                ${Math.round(this.userSettings.soundEffectsVolume() * 100)}%
              </div>
            </div>

            <button
              class="flex gap-3 items-center w-full text-left p-3 hover:bg-slate-700 rounded text-white transition-colors"
              @click="${this.onTerrainButtonClick}"
            >
              <img src=${treeIcon} alt="treeIcon" width="20" height="20" />
              <div class="flex-1">
                <div class="font-medium">
                  ${translateText("user_setting.toggle_terrain")}
                </div>
                <div class="text-sm text-slate-400">
                  ${translateText("user_setting.toggle_view_desc")}
                </div>
              </div>
              <div class="text-sm text-slate-400">
                ${this.alternateView
                  ? translateText("user_setting.on")
                  : translateText("user_setting.off")}
              </div>
            </button>

            <button
              class="flex gap-3 items-center w-full text-left p-3 hover:bg-slate-700 rounded text-white transition-colors"
              @click="${this.onToggleEmojisButtonClick}"
            >
              <img src=${emojiIcon} alt="emojiIcon" width="20" height="20" />
              <div class="flex-1">
                <div class="font-medium">
                  ${translateText("user_setting.emojis_label")}
                </div>
                <div class="text-sm text-slate-400">
                  ${translateText("user_setting.emojis_desc")}
                </div>
              </div>
              <div class="text-sm text-slate-400">
                ${this.userSettings.emojis()
                  ? translateText("user_setting.on")
                  : translateText("user_setting.off")}
              </div>
            </button>

            <button
              class="flex gap-3 items-center w-full text-left p-3 hover:bg-slate-700 rounded text-white transition-colors"
              @click="${this.onToggleDarkModeButtonClick}"
            >
              <img
                src=${darkModeIcon}
                alt="darkModeIcon"
                width="20"
                height="20"
              />
              <div class="flex-1">
                <div class="font-medium">
                  ${translateText("user_setting.dark_mode_label")}
                </div>
                <div class="text-sm text-slate-400">
                  ${translateText("user_setting.dark_mode_desc")}
                </div>
              </div>
              <div class="text-sm text-slate-400">
                ${this.userSettings.darkMode()
                  ? translateText("user_setting.on")
                  : translateText("user_setting.off")}
              </div>
            </button>

            <button
              class="flex gap-3 items-center w-full text-left p-3 hover:bg-slate-700 rounded text-white transition-colors"
              @click="${this.onToggleSpecialEffectsButtonClick}"
            >
              <img
                src=${explosionIcon}
                alt="specialEffects"
                width="20"
                height="20"
              />
              <div class="flex-1">
                <div class="font-medium">
                  ${translateText("user_setting.special_effects_label")}
                </div>
                <div class="text-sm text-slate-400">
                  ${translateText("user_setting.special_effects_desc")}
                </div>
              </div>
              <div class="text-sm text-slate-400">
                ${this.userSettings.fxLayer()
                  ? translateText("user_setting.on")
                  : translateText("user_setting.off")}
              </div>
            </button>

            <button
              class="flex gap-3 items-center w-full text-left p-3 hover:bg-slate-700 rounded text-white transition-colors"
              @click="${this.onToggleAlertFrameButtonClick}"
            >
              <img src=${sirenIcon} alt="alertFrame" width="20" height="20" />
              <div class="flex-1">
                <div class="font-medium">
                  ${translateText("user_setting.alert_frame_label")}
                </div>
                <div class="text-sm text-slate-400">
                  ${translateText("user_setting.alert_frame_desc")}
                </div>
              </div>
              <div class="text-sm text-slate-400">
                ${this.userSettings.alertFrame()
                  ? translateText("user_setting.on")
                  : translateText("user_setting.off")}
              </div>
            </button>

            <button
              class="flex gap-3 items-center w-full text-left p-3 hover:bg-slate-700 rounded text-white transition-colors"
              @click="${this.onToggleStructureSpritesButtonClick}"
            >
              <img
                src=${structureIcon}
                alt="structureSprites"
                width="20"
                height="20"
              />
              <div class="flex-1">
                <div class="font-medium">
                  ${translateText("user_setting.structure_sprites_label")}
                </div>
                <div class="text-sm text-slate-400">
                  ${translateText("user_setting.structure_sprites_desc")}
                </div>
              </div>
              <div class="text-sm text-slate-400">
                ${this.userSettings.structureSprites()
                  ? translateText("user_setting.on")
                  : translateText("user_setting.off")}
              </div>
            </button>

            <button
              class="flex gap-3 items-center w-full text-left p-3 hover:bg-slate-700 rounded text-white transition-colors"
              @click="${this.onToggleCursorCostLabelButtonClick}"
            >
              <img
                src=${cursorPriceIcon}
                alt="cursorCostLabel"
                width="20"
                height="20"
              />
              <div class="flex-1">
                <div class="font-medium">
                  ${translateText("user_setting.cursor_cost_label_label")}
                </div>
                <div class="text-sm text-slate-400">
                  ${translateText("user_setting.cursor_cost_label_desc")}
                </div>
              </div>
              <div class="text-sm text-slate-400">
                ${this.userSettings.cursorCostLabel()
                  ? translateText("user_setting.on")
                  : translateText("user_setting.off")}
              </div>
            </button>

            <button
              class="flex gap-3 items-center w-full text-left p-3 hover:bg-slate-700 rounded text-white transition-colors"
              @click="${this.onToggleRandomNameModeButtonClick}"
            >
              <img src=${ninjaIcon} alt="ninjaIcon" width="20" height="20" />
              <div class="flex-1">
                <div class="font-medium">
                  ${translateText("user_setting.anonymous_names_label")}
                </div>
                <div class="text-sm text-slate-400">
                  ${translateText("user_setting.anonymous_names_desc")}
                </div>
              </div>
              <div class="text-sm text-slate-400">
                ${this.userSettings.anonymousNames()
                  ? translateText("user_setting.on")
                  : translateText("user_setting.off")}
              </div>
            </button>

            <button
              class="flex gap-3 items-center w-full text-left p-3 hover:bg-slate-700 rounded text-white transition-colors"
              @click="${this.onToggleLeftClickOpensMenu}"
            >
              <img src=${mouseIcon} alt="mouseIcon" width="20" height="20" />
              <div class="flex-1">
                <div class="font-medium">
                  ${translateText("user_setting.left_click_menu")}
                </div>
                <div class="text-sm text-slate-400">
                  ${translateText("user_setting.left_click_desc")}
                </div>
              </div>
              <div class="text-sm text-slate-400">
                ${this.userSettings.leftClickOpensMenu()
                  ? translateText("user_setting.on")
                  : translateText("user_setting.off")}
              </div>
            </button>

            <button
              class="flex gap-3 items-center w-full text-left p-3 hover:bg-slate-700 rounded text-white transition-colors"
              @click="${this.onTogglePerformanceOverlayButtonClick}"
            >
              <img
                src=${settingsIcon}
                alt="performanceIcon"
                width="20"
                height="20"
              />
              <div class="flex-1">
                <div class="font-medium">
                  ${translateText("user_setting.performance_overlay_label")}
                </div>
                <div class="text-sm text-slate-400">
                  ${translateText("user_setting.performance_overlay_desc")}
                </div>
              </div>
              <div class="text-sm text-slate-400">
                ${this.userSettings.performanceOverlay()
                  ? translateText("user_setting.on")
                  : translateText("user_setting.off")}
              </div>
            </button>

            ${this.isSingleplayer() ? this.renderBalanceSettings() : ""}

            <div class="border-t border-slate-600 pt-3 mt-4">
              <button
                class="flex gap-3 items-center w-full text-left p-3 hover:bg-red-600/20 rounded text-red-400 transition-colors"
                @click="${this.onExitButtonClick}"
              >
                <img src=${exitIcon} alt="exitIcon" width="20" height="20" />
                <div class="flex-1">
                  <div class="font-medium">
                    ${translateText("user_setting.exit_game_label")}
                  </div>
                  <div class="text-sm text-slate-400">
                    ${translateText("user_setting.exit_game_info")}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
