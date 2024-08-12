import { CastleFalkenstein } from "../castle-falkenstein.mjs";

/**
 * @extends {Item}
 */
export class CastleFalkensteinItem extends Item {

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   */
   getRollData() {
    if ( !this.actor ) return null;
    const rollData = this.actor.getRollData();
    rollData.item = foundry.utils.deepClone(this.system);

    return rollData;
  }

  get rollType() {
    const ret = {};

    if (this.type == 'ability') {
      ret.i18nLabel = `[${game.i18n.localize('castle-falkenstein.feat.perform')}]`;
      ret.rollFunc = (item) => item.actor?.performFeat(item);
    } else if (this.type == 'spell') {
      ret.i18nLabel = `[${game.i18n.localize('castle-falkenstein.sorcery.defineSpell')}]`;
      ret.rollFunc = (item) => item.actor?.defineSpell(item);
    } else { // other item types
      ret.i18nLabel = `[${game.i18n.localize('castle-falkenstein.item.sendToChat')}]`;
      ret.rollFunc = (item) => item.sendToChat();
    }

    return ret;
  }

  /**
   * Handle rolls.
   */
  async roll() {
    await this.rollType.rollFunc(this);
  }

  /**
   * Show the item in chat.
   */
  async sendToChat() {

    let flavor = `[${game.i18n.localize('castle-falkenstein.item.sendToChat')}`;
    let content = `${this.name}<hr/>`
                + `${this.system.description}`;

    // change label based on item type
    if (this.type == 'ability') {
      flavor += ` - ${game.i18n.localize('castle-falkenstein.ability.ability')}]`;
      content = CastleFalkenstein.abilityLevelAsSentenceHtml(this);
    } else if (this.type == 'weapon') {
      flavor += ` - ${game.i18n.localize('castle-falkenstein.weapon.weapon')}]`;
      content = `${this.name}<hr/>`
              + (this.system.effectiveRange == "" ? `` : `${game.i18n.localize("castle-falkenstein.weapon.effectiveRange")}: ${this.system.effectiveRange}<br/>`)
              + (this.system.ammunition == null && this.system.ammunition_max == null ? `` : `${game.i18n.localize("castle-falkenstein.weapon.ammunition")}: ${this.system.ammunition} / ${this.system.ammunition_max}<br/>`)
              + `${game.i18n.localize("castle-falkenstein.weapon.wounds")}: ${this.system.woundsPartial ?? 0} / ${this.system.woundsFull ?? 0} / ${this.system.woundsHigh ?? 0}<br/>`
              + `${this.system.description}`;
    } else if (this.type == 'possession') {
      flavor += ` - ${game.i18n.localize('castle-falkenstein.possession.possession')}]`;
      // default content
    } else if (this.type == 'spell') {
      flavor += ` - ${game.i18n.localize('castle-falkenstein.spell.spell')}]`;
      content = `${this.name} ` + CastleFalkenstein.cardSuitHTML(this.system.suit) + `<hr/>`
              + `${game.i18n.localize("castle-falkenstein.spell.thaumicLevel")}: ${this.system.level}<br/>`
              + `${this.system.description}`;
    } else {
      flavor += `]`;
      CastleFalkenstein.log.warn(`[Function not supported] Attempting to 'show in chat' an item of type '${this.type}'`);
    }
 
     // Post message to chat
    CastleFalkenstein.createChatMessage(this.actor, flavor, content, false);
  }

}