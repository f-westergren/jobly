const sqlForPartialUpdate = require('../../helpers/partialUpdate')

describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
    function () {
      let testObj = {'apples': 5}
      const testUpdate = sqlForPartialUpdate('testTable', testObj, 'fruitbasket', '22')
      expect(testUpdate.query).toEqual(
        'UPDATE testTable SET apples=$1 WHERE fruitbasket=$2 RETURNING *'
      );
    });

  it("should generate a proper partial update query with multiple fields",
    function () {
      let testObj = {'apples': 5, 'oranges': 10, 'pears': 2}
      const testUpdate = sqlForPartialUpdate('testTable', testObj, 'fruitbasket', '22')
      expect(testUpdate.query).toEqual(
        'UPDATE testTable SET apples=$1, oranges=$2, pears=$3 WHERE fruitbasket=$4 RETURNING *'
      );
    })
});
