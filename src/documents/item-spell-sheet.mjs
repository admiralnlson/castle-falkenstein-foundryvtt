import { CASTLE_FALKENSTEIN } from "../config.mjs";
import CastleFalkenstein from "../castle-falkenstein.mjs";

/**
 * Sheet for the 'spell' item type.
 * @extends {ItemSheet}
 */
export class CastleFalkensteinSpellSheet extends ItemSheet {

  /**
   * @override
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: [CastleFalkenstein.id, "sheet", "item"],
      template: "systems/castle-falkenstein/src/documents/item-spell-sheet.hbs",
      width: 460,
      height: 300,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  async getData(options) {
    const context = super.getData(options);
    context.system = context.item.system;
    context.enrichedDescription = await TextEditor.enrichHTML(context.system.description, {async: true});
    context.CASTLE_FALKENSTEIN = CASTLE_FALKENSTEIN;
    return context;
  }

}
