import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';

export const Schema = z.object({
  主角: z.object({
    位阶: z.coerce.number().transform(v => _.clamp(v, 1, 9)).prefault(1),
    掌控度: z.coerce.number().transform(v => _.clamp(v, 0, 100)).prefault(0),
    附身状态: z.boolean().prefault(false),
    战后性欲: z.coerce.number()
      .transform(v => _.clamp(v, 0, 100))
      .prefault(0),
    能力列表: z.record(
      z.string().describe('能力名'),
      z.object({
        类型: z.string().prefault("通用"),
        描述: z.string()
      })
    ).prefault({
      "色孽感官": { 类型: "权柄", 描述: "感知周围的情绪与欲望流动，侦测灵异气息" },
    }),
    驾驭的鬼: z.record(
      z.string().describe('鬼名'),
      z.object({
        类型: z.string(),
        能力: z.string(),
        简介: z.string(),
        实力: z.string()
      })
    ).prefault({}),
    物品栏: z.record(
      z.string().describe('物品名'),
      z.object({
        功能: z.string(),
        数量: z.coerce.number().prefault(1)
      })
    )
    .transform(data => _.pickBy(data, ({ 数量 }) => 数量 > 0))
    .prefault({})
  }).transform(data => {
    // 自动修复：根据位阶限制掌控度上限
    let maxAuthority = 0;
    if (data.位阶 === 3) {
      maxAuthority = 10;
    } else if (data.位阶 > 3) {
      // 位阶 4-9 解锁上限，(位阶-3)*15 + 10
      maxAuthority = Math.min(100, (data.位阶 - 3) * 15 + 10);
    }
    data.掌控度 = Math.min(data.掌控度, maxAuthority);

    // 自动修复：限制驾驭鬼的数量不得超过位阶
    const ghostKeys = Object.keys(data.驾驭的鬼);
    if (ghostKeys.length > data.位阶) {
      // 保留前N个鬼，N=位阶
      const allowedKeys = ghostKeys.slice(0, data.位阶);
      data.驾驭的鬼 = _.pick(data.驾驭的鬼, allowedKeys);
    }
    
    return data;
  }).prefault({}),
  世界: z.object({
    时间: z.string().prefault("2026年1月30日 下午 14:00"),
    地点: z.string().prefault("大江市·某待拆迁公寓"),
    当前灵异事件: z.string().prefault("凶宅逃生"),
    危险等级: z.string().prefault("C")
  }).prefault({})
});

$(() => {
  registerMvuSchema(Schema);
})
