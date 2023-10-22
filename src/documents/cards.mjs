import CastleFalkenstein from "../castle-falkenstein.mjs";

/**
 * @extends {Cards}
 */
export class CastleFalkensteinCards extends Cards {

  async shuffleBackToDeck(idsOfCardsPlayed) {
    const type = this.getFlag(CastleFalkenstein.id, "type");
    if (type) {
      const deck = CastleFalkenstein.deck(type);
      await this.pass(deck, idsOfCardsPlayed, {chatNotification: false});
      await deck.shuffle({ chatNotification: false });
    }
  }

  // "spellBeingCast" flag object structure = {
  //    actorItemId: <id of the item within the actor>,
  //    definitions: {
  //      <enum of properties is documented in config.mjs>
  //    }
  //  }

  get spellBeingCast() {
    if (this.type === "hand" &&
        this.getFlag(CastleFalkenstein.id, "type") === "sorcery") {
      return this.getFlag(CastleFalkenstein.id, "spellBeingCast");
    }
  }

  async defineSpell(spellBeingCast) {
    await this.unsetFlag(CastleFalkenstein.id, 'spellBeingCast');
    await this.setFlag(CastleFalkenstein.id, 'spellBeingCast', spellBeingCast);
  }

  async stopCasting() {
    await this.unsetFlag(CastleFalkenstein.id, 'spellBeingCast');
  }

}
