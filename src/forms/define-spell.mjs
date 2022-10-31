import { CASTLE_FALKENSTEIN } from "../config.mjs";
import CastleFalkenstein from "../castle-falkenstein.mjs";

// A form for initiating a spell
export default class CastleFalkensteinDefineSpell extends FormApplication {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "castle-falkenstein-define-spell",
      title: game.i18n.localize("castle-falkenstein.sorcery.defineSpell"),
      template: "./systems/castle-falkenstein/src/forms/define-spell.hbs",
      classes: ["castle-falkenstein castle-falkenstein-define-spell", "sheet"],
      width: 400,
      height: "auto",
      closeOnSubmit: true,
      submitOnClose: false,
      resizable: true
    });
  }

  /**
   * @override
   */
  constructor(spell, options = {}) {
    super(spell, options);
    this.spell = spell;
    this.character = spell.actor;

    this.spellBeingCast = {
      actorItemId: this.spell.id,
      definitions: {}
    };

    for (const [key, value] of Object.entries(CASTLE_FALKENSTEIN.spellDefinitions)) {
      this.spellBeingCast.definitions[key] = 0
    }
  }
  
  computeTotal() {
    let total = this.spell.system.level - CASTLE_FALKENSTEIN.abilityLevels[this.character.sorceryAbility.system.level].value;

    for (const [key, value] of Object.entries(this.spellBeingCast.definitions)) {
      total += value;
    }

    return total > 0 ? total : 0;
  }

  /**
   * @override
   */
  async getData() {
    return {
      sorceryLevelAsSentenceHtml: CastleFalkenstein.abilityLevelAsSentenceHtml(this.character.sorceryAbility, false),
      spell: this.spell,
      spellSuitSymbol: CASTLE_FALKENSTEIN.cardSuitsSymbols[this.spell.system.suit],
      spellBeingCast: this.spellBeingCast,
      spellDefinitions: CASTLE_FALKENSTEIN.spellDefinitions,
      total: this.computeTotal()
    }
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find('.spell-definition-select').change(event => this._onSelectChange(event));
  }

  _onSelectChange(event) {
    this.spellBeingCast.definitions[event.currentTarget.name] = parseInt(event.currentTarget.value);
    this.render();
  }

  /**
   * @override
   */
  async _updateObject(event, formData) {
    
    //
    // produce chat message
    //

    const flavor = `[${game.i18n.localize("castle-falkenstein.sorcery.defineSpell")}]`;

    const suitSymbol = CASTLE_FALKENSTEIN.cardSuitsSymbols[this.spell.system.suit];
    let content = `<b>${this.spell.name}</b> [<span class="suit-symbol-${this.spell.system.suit}">${suitSymbol}</span>]<br/>`;
    content += `${game.i18n.localize("castle-falkenstein.spell.thaumicLevel")}: ${this.spell.system.level}`;
    content += '<hr/><div class="spell-definitions">';

    for (const [key, value] of Object.entries(CASTLE_FALKENSTEIN.spellDefinitions)) {
      content += `${game.i18n.localize(value.label)}: <b>${game.i18n.localize(value.levels[this.spellBeingCast.definitions[key]])}</b><br/>`;
    }

    content += '</div><hr/>';
    content += CastleFalkenstein.abilityLevelAsSentenceHtml(this.character.sorceryAbility, false);
    const total = this.computeTotal();
    content += `<div class="define-spell-total">${total}</div>`;

    let hand = await this.character.hand("sorcery");
    await hand.defineSpell(this.spellBeingCast);

    // Post message to chat
    CastleFalkenstein.createChatMessage(this.character, flavor, content);

    // rerenders the FormApp with the new data (will disappear soon though)
    this.render();

    // rerenders the hand to update buttons (disabled buttons such as 'Gather Power' will no longer be disabled)
    hand.sheet.render(true, { focus: true });
  }

}