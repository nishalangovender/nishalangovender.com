/**
 * Layout of the desk's mechanical keyboard: a 60% board, five rows of keys
 * in key units (1u = one alphanumeric key), each row 15u wide. Pure data,
 * so the layout is tested; `DeskGear` builds the meshes from it.
 */

/** Key widths per row, left to right, in key units. */
export const ROWS: readonly (readonly number[])[] = [
  [...Array(13).fill(1), 2], // Esc … =, Backspace
  [1.5, ...Array(12).fill(1), 1.5], // Tab … ], \
  [1.75, ...Array(11).fill(1), 2.25], // Caps … ', Enter
  [2.25, ...Array(10).fill(1), 2.75], // Shift … /, Shift
  [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25], // Ctrl, Super, Alt, Space, Alt, Fn, Menu, Ctrl
];

/** Row width in key units. */
export const ROW_UNITS = 15;

export interface Key {
  /** Centre across the board and down it, in key units from the top-left corner. */
  x: number;
  row: number;
  width: number;
  /** Modifiers take the darker of the two greys. */
  modifier: boolean;
}

/** Every key with its centre, row and width. */
export function keyLayout(): Key[] {
  return ROWS.flatMap((widths, row) => {
    let left = 0;
    return widths.map((width) => {
      const key = { x: left + width / 2, row, width, modifier: width !== 1 };
      left += width;
      return key;
    });
  });
}
