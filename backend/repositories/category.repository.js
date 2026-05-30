const { query } = require('../config/database');

const primaryGroupCodes = new Set(['needs', 'wants', 'savings', 'investment', 'other']);

const groupAliases = new Map([
  ['needs', 'needs'],
  ['need', 'needs'],
  ['kebutuhan', 'needs'],
  ['wants', 'wants'],
  ['want', 'wants'],
  ['keinginan', 'wants'],
  ['savings', 'savings'],
  ['saving', 'savings'],
  ['tabungan', 'savings'],
  ['investment', 'investment'],
  ['investasi', 'investment'],
  ['invest', 'investment'],
  ['other', 'other'],
  ['lainnya', 'other'],
]);

const detailAliases = new Map([
  ['belanja_bulanan', 'groceries'],
  ['grocery', 'groceries'],
  ['groceries', 'groceries'],
  ['minimarket', 'groceries'],
  ['supermarket', 'groceries'],
  ['food', 'food'],
  ['food_beverage', 'food'],
  ['food_and_beverage', 'food'],
  ['food_dining', 'food'],
  ['food_and_dining', 'food'],
  ['makan', 'food'],
  ['makanan', 'food'],
  ['makanan_minuman', 'food'],
  ['transportation', 'transport'],
  ['transportasi', 'transport'],
  ['transport', 'transport'],
  ['bills', 'utilities'],
  ['bills_utilities', 'utilities'],
  ['bills_and_utilities', 'utilities'],
  ['tagihan', 'utilities'],
  ['utilitas', 'utilities'],
  ['utilities', 'utilities'],
  ['healthcare', 'health'],
  ['kesehatan', 'health'],
  ['health', 'health'],
  ['shopping', 'shopping'],
  ['belanja', 'shopping'],
  ['education', 'education'],
  ['pendidikan', 'education'],
  ['entertainment', 'entertainment'],
  ['hiburan', 'entertainment'],
  ['self_care', 'self_care'],
  ['perawatan_diri', 'self_care'],
  ['travel', 'travel'],
  ['savings', 'savings'],
  ['saving', 'savings'],
  ['tabungan', 'savings'],
  ['investment', 'investment'],
  ['investasi', 'investment'],
  ['invest', 'investment'],
  ['other', 'other'],
  ['lainnya', 'other'],
]);

const toKey = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '');

const mapCategoryGroup = (row) => ({
  categoryGroupId: row.category_group_id,
  code: row.group_code,
  name: row.group_name,
  description: row.group_description,
  sortOrder: row.group_sort_order,
});

const mapCategoryDetail = (row) => ({
  categoryDetailId: row.category_detail_id,
  code: row.detail_code,
  name: row.detail_name,
  description: row.detail_description,
  sortOrder: row.detail_sort_order,
});

class CategoryRepository {
  async findAll() {
    const result = await query(
      `SELECT
         cg.category_group_id,
         cg.code AS group_code,
         cg.name AS group_name,
         cg.description AS group_description,
         cg.sort_order AS group_sort_order,
         cd.category_detail_id,
         cd.code AS detail_code,
         cd.name AS detail_name,
         cd.description AS detail_description,
         cd.sort_order AS detail_sort_order
       FROM category_groups cg
       LEFT JOIN category_details cd
         ON cd.category_group_id = cg.category_group_id
        AND cd.is_active = TRUE
       WHERE cg.is_active = TRUE
       ORDER BY cg.sort_order ASC, cd.sort_order ASC`
    );

    const groups = new Map();

    for (const row of result.rows) {
      if (!groups.has(row.category_group_id)) {
        groups.set(row.category_group_id, {
          ...mapCategoryGroup(row),
          details: [],
        });
      }

      if (row.category_detail_id) {
        groups.get(row.category_group_id).details.push(mapCategoryDetail(row));
      }
    }

    return Array.from(groups.values());
  }

  async resolveCategory({ categoryGroup, categoryDetail } = {}) {
    const groupKey = toKey(categoryGroup);
    const detailKey = toKey(categoryDetail);
    const groupCode = groupAliases.get(groupKey) || (primaryGroupCodes.has(groupKey) ? groupKey : null);
    const preferredDetailKey = detailKey || (!groupCode ? groupKey : '');
    const detailCode = detailAliases.get(preferredDetailKey) || preferredDetailKey || null;

    if (detailCode) {
      const detail = await this.findDetailByCode(detailCode);
      if (detail) return detail;
    }

    if (groupCode) {
      const group = await this.findGroupByCode(groupCode);
      if (group) {
        return {
          categoryGroupId: group.categoryGroupId,
          categoryDetailId: null,
          categoryGroup: group.name,
          categoryDetail: null,
        };
      }
    }

    const fallback = await this.findDetailByCode('other');
    if (fallback) return fallback;

    return {
      categoryGroupId: null,
      categoryDetailId: null,
      categoryGroup: categoryGroup || null,
      categoryDetail: categoryDetail || null,
    };
  }

  async findDetailByCode(code) {
    const result = await query(
      `SELECT
         cg.category_group_id,
         cg.name AS category_group,
         cd.category_detail_id,
         cd.code AS category_detail
       FROM category_details cd
       JOIN category_groups cg
         ON cg.category_group_id = cd.category_group_id
       WHERE cd.code = $1
         AND cd.is_active = TRUE
         AND cg.is_active = TRUE
       LIMIT 1`,
      [code]
    );

    const row = result.rows[0];
    if (!row) return null;

    return {
      categoryGroupId: row.category_group_id,
      categoryDetailId: row.category_detail_id,
      categoryGroup: row.category_group,
      categoryDetail: row.category_detail,
    };
  }

  async findGroupByCode(code) {
    const result = await query(
      `SELECT
         category_group_id,
         code,
         name
       FROM category_groups
       WHERE code = $1
         AND is_active = TRUE
       LIMIT 1`,
      [code]
    );

    const row = result.rows[0];
    if (!row) return null;

    return {
      categoryGroupId: row.category_group_id,
      code: row.code,
      name: row.name,
    };
  }
}

module.exports = new CategoryRepository();
