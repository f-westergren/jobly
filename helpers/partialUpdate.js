/**
 * Generate a selective update query based on a request body:
 *
 * - table: where to make the query
 * - items: an object with keys of columns you want to update and values with
 *          updated values
 * - key: the column that we query by (e.g. username, handle, id)
 * - id: current record ID
 *
 * Returns object containing a DB query as a string, and array of
 * string values to be updated
 *
 */

function sqlForPartialUpdate(table, items, key, id, returnAll=true) {
  // keep track of item indexes
  // store all the columns we want to update and associate with vals

  let idx = 1;
  let columns = [];
  let itemArray = []

  // filter out keys that start with "_" -- we don't want these in DB
  for (let key in items) {
    if (key.startsWith("_")) {
      delete items[key];
    }
  }

  for (let column in items) {
    itemArray.push(column)
    columns.push(`${column}=$${idx}`);
    idx += 1;
  }

  // return * or updated columns
  let returning = returnAll ? "*" : itemArray.join(", ")
  console.log("RETURNING", returning)

  // build query
  let cols = columns.join(", ");
  let query = `UPDATE ${table} SET ${cols} WHERE ${key}=$${idx} RETURNING ${returning}`;

  let values = Object.values(items);
  values.push(id);

  return { query, values };
}

module.exports = sqlForPartialUpdate;
