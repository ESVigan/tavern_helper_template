import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';

// --- 新结构定义 (当前正在使用的结构) ---
const NewSchema = z.object({
  世界信息: z.object({
    时间: z.string()
      .regex(/^\d{4}年\d{1,2}月\d{1,2}日(星期[一二三四五六日])?\s*(上午|下午|晚上|凌晨)?\s*\d{1,2}:\d{2}$/,
        "时间格式应为：YYYY年MM月DD日星期X 上午/下午 HH:MM"),

    地点: z.string()
      .min(1, "地点不能为空")
  }).strict(),

  绘里奈: z.object({
    年龄: z.coerce.number().prefault(17),
    好感度: z.coerce.number(),
    信赖度: z.coerce.number(),
    心情: z.enum(["平静", "开心", "兴奋", "害羞", "困惑", "生气", "悲伤", "疲惫", "焦虑", "感动", "冷淡", "狡黠", "温柔"]).prefault("平静"),
    拥有联系方式: z.boolean(),
    关系阶段: z.string(),
    恋爱状态: z.boolean(),
    $表心声: z.string().prefault(""),
    $里心声: z.string().prefault(""),
    $消息记录: z.record(
      z.string().describe("发送时间 (格式: YYYY-MM-DD HH:MM_序号)"),
      z.object({
        发送者: z.enum(["绘里奈", "user"]),
        文字内容: z.string().describe("消息正文或媒体内容描述"),
        类型: z.enum(["文字消息", "图片", "语音", "视频", "语音通话", "视频通话"]),
        时长: z.coerce.number().optional().describe("时长 (单位: 秒，仅语音/视频/通话类型需要)")
      })
    ).prefault({}),
    受孕状态: z.boolean().prefault(false),
    受孕日期: z.string().prefault("").describe("受孕日期 (格式: YYYY年MM月DD日)"),
    $社交动态: z.record(
      z.string().describe("发布时间 (YYYY-MM-DD HH:MM)"),
      z.object({
        动态内容: z.string().min(1, "动态内容不能为空"),
        发布地点: z.string().min(1, "发布地点不能为空"),
        评论数量: z.coerce.number().min(0, "评论数量不能为负数"),
        评论列表: z.record(
          z.string().describe("评论人姓名"),
          z.string().describe("评论内容")
        ).prefault({})
      })
    ).prefault({})
  }).strict()
  .transform(data => {
    data.好感度 = _.clamp(data.好感度, 0, 400);
    data.信赖度 = _.clamp(data.信赖度, 0, 400);
    if (data.好感度 < 80) data.关系阶段 = "査定の対象";
    else if (data.好感度 < 180) data.关系阶段 = "有利な取引";
    else if (data.好感度 < 280) data.关系阶段 = "予定外の時間";
    else if (data.好感度 < 360) data.关系阶段 = "特別への渇望";
    else data.关系阶段 = "唯一の選択";

    // 受孕逻辑：只有当 AI 尝试将状态设为 true 时，才进行 1d100 判定
    // 判定不通过（< 71）则强制重置为 false（30% 成功率）。注：判定在每次 AI 发起更新指令时触发。
    if (data.受孕状态) {
      if (!data.受孕日期) {
        if ((Math.random() * 100 + 1) < 71) {
          data.受孕状态 = false;
          data.受孕日期 = "";
        } else {
          const now = new Date();
          data.受孕日期 = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
        }
      }
    } else {
      // 联动逻辑：受孕状态为 false 时，同步清空受孕日期
      data.受孕日期 = "";
    }

    return data;
  }),

  月宫绾音: z.object({
    年龄: z.coerce.number().prefault(19),
    好感度: z.coerce.number(),
    信赖度: z.coerce.number(),
    心情: z.enum(["平静", "开心", "兴奋", "害羞", "困惑", "生气", "悲伤", "疲惫", "焦虑", "感动", "冷淡", "狡黠", "温柔"]).prefault("平静"),
    拥有联系方式: z.boolean(),
    关系阶段: z.string(),
    恋爱状态: z.boolean(),
    透露真名: z.boolean(),
    CV学习进度: z.string().min(1, "CV学习进度不能为空"),
    粉丝数: z.coerce.number(),
    $表心声: z.string().prefault(""),
    $里心声: z.string().prefault(""),
    $消息记录: z.record(
      z.string().describe("发送时间 (格式: YYYY-MM-DD HH:MM_序号)"),
      z.object({
        发送者: z.enum(["林绛", "user"]),
        文字内容: z.string().describe("消息正文或媒体内容描述"),
        类型: z.enum(["文字消息", "图片",  "语音", "视频", "语音通话", "视频通话"]),
        时长: z.coerce.number().optional().describe("时长 (单位: 秒，仅语音/视频/通话类型需要)")
      })
    ).prefault({}),
    受孕状态: z.boolean().prefault(false),
    受孕日期: z.string().prefault("").describe("受孕日期 (格式: YYYY年MM月DD日)"),
    $社交动态: z.record(
      z.string().describe("发布时间 (YYYY-MM-DD HH:MM)"),
      z.object({
        动态内容: z.string().min(1, "动态内容不能为空"),
        发布地点: z.string().min(1, "发布地点不能为空"),
        评论数量: z.coerce.number().min(0, "评论数量不能为负数"),
        评论列表: z.record(
          z.string().describe("评论人姓名"),
          z.string().describe("评论内容")
        ).prefault({})
      })
    ).prefault({})
  }).strict()
  .transform(data => {
    data.好感度 = _.clamp(data.好感度, 0, 400);
    data.信赖度 = _.clamp(data.信赖度, 0, 400);
    data.粉丝数 = Math.max(0, data.粉丝数);
    if (data.好感度 < 80) data.关系阶段 = "礼貌的な距離";
    else if (data.好感度 < 180) data.关系阶段 = "友達の境界線";
    else if (data.好感度 < 300) data.关系阶段 = "曖昧な感情";
    else data.关系阶段 = "最後の決断";

    // 受孕逻辑：只有当 AI 尝试将状态设为 true 时，才进行 1d100 判定
    // 判定不通过（< 71）则强制重置为 false（30% 成功率）。注：判定在每次 AI 发起更新指令时触发。
    if (data.受孕状态) {
      if (!data.受孕日期) {
        if ((Math.random() * 100 + 1) < 71) {
          data.受孕状态 = false;
          data.受孕日期 = "";
        } else {
          const now = new Date();
          data.受孕日期 = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
        }
      }
    } else {
      // 联动逻辑：受孕状态为 false 时，同步清空受孕日期
      data.受孕日期 = "";
    }

    return data;
  }),

  $三人群组: z.object({
    群名: z.string().prefault("新宿拯救计划讨论组"),
    消息记录: z.record(
      z.string().describe("发送时间 (格式: YYYY-MM-DD HH:MM_序号)"),
      z.object({
        发送者: z.enum(["绘里奈", "林绛", "user"]),
        文字内容: z.string().describe("消息正文或媒体内容描述"),
        类型: z.enum(["文字消息", "图片", "语音", "视频", "语音通话", "视频通话"]),
        时长: z.coerce.number().optional().describe("时长 (单位: 秒，仅语音/视频/通话类型需要)")
      })
    ).prefault({})
  }).strict().prefault({}),

  $新闻速报: z.object({
    速报列表: z.record(
      z.enum(["新闻1", "新闻2", "新闻3"]),
      z.object({
        来源: z.string().min(1, "新闻来源不能为空"),
        标题: z.string().min(1, "新闻标题不能为空"),
        正文: z.string().optional().describe("新闻正文内容")
      })
    )
  }).strict()
  .prefault({
    速报列表: {
      "新闻1": { 来源: "TBS新闻", 标题: "新宿歌舞伎町今晚将加强夜间巡逻", 正文: "由于近期深夜骚乱频发，警视厅决定从今日起在歌舞伎町一番街及周边区域增派警力，重点盘查可疑人员。请各位市民及游客注意安全，随身携带身份证件。" },
      "新闻2": { 来源: "《ViVi》", 标题: "秋季约会妆容特辑：清透底妆是关键", 正文: "本季最流行的'微醺感'妆容教程大公开！只需三步，就能打造出让男朋友怦然心动的温柔氛围。重点在于腮红的晕染范围和唇釉的水光感哦。" },
      "新闻3": { 来源: "Yahoo!ニュース", 标题: "租借服务市场持续升温，业界呼吁规范", 正文: "最新的市场调查报告显示，'情感陪伴'类服务的需求量在过去一个季度增长了 300%。专家分析认为，现代都市人的孤独感是推动这一产业爆发的主要原因。" }
    }
  }),
}).strict().transform(data => {
  // 年龄更新逻辑
  // 基于初始设定推导出生年份：
  // 当前时间基准: 2025年10月12日
  // 绘里奈: 初始17岁, 生日11月11日 (未过生日) -> 出生年份 = 2025 - 17 - 1 = 2007
  // 月宫绾音: 初始19岁, 生日3月2日 (已过生日) -> 出生年份 = 2025 - 19 = 2006
  const ERINA_BIRTH_YEAR = 2007;
  const WANYIN_BIRTH_YEAR = 2006;

  try {
    const timeStr = data.世界信息.时间;
    const match = timeStr.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日/);

    if (match) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]);
      const day = parseInt(match[3]);

      // 绘里奈年龄计算
      let erinaAge = year - ERINA_BIRTH_YEAR;
      // 如果还没到生日(11月11日)，年龄减1
      if (month < 11 || (month === 11 && day < 11)) {
        erinaAge--;
      }
      data.绘里奈.年龄 = erinaAge;

      // 月宫绾音(林绛)年龄计算
      let linJiangAge = year - WANYIN_BIRTH_YEAR;
      // 如果还没到生日(3月2日)，年龄减1
      if (month < 3 || (month === 3 && day < 2)) {
        linJiangAge--;
      }
      data.月宫绾音.年龄 = linJiangAge;
    }
  } catch (e) {
    console.error("年龄计算出错", e);
  }

  return data;
});

// --- 旧结构定义 (用于迁移) ---
const OldSchema = z.object({
  世界信息: z.object({
    时间: z.string(),
    地点: z.string()
  }),

  绘里奈: z.object({
    好感度: z.coerce.number(),
    信赖度: z.coerce.number(),
    心情: z.string().prefault("平静"),
    拥有联系方式: z.boolean(),
    关系阶段: z.string(),
    恋爱状态: z.boolean(),
    $表心声: z.string().prefault(""),
    $里心声: z.string().prefault(""),
    $消息记录: z.record(
      z.string(),
      z.object({
        发送者: z.enum(["绘里奈", "user"]),
        文字内容: z.string(),
        类型: z.enum(["文字消息", "图片", "语音", "视频", "语音通话", "视频通话"]),
        时长: z.coerce.number().optional()
      })
    ).prefault({}),
    受孕状态: z.boolean().prefault(false),
    受孕日期: z.string().prefault(""),
    $社交动态: z.record(
      z.string(),
      z.object({
        动态内容: z.string(),
        发布地点: z.string(),
        评论数量: z.coerce.number(),
        评论列表: z.record(z.string(), z.string()).prefault({})
      })
    ).prefault({})
  }),

  月宫绾音: z.object({
    好感度: z.coerce.number(),
    信赖度: z.coerce.number(),
    心情: z.string().prefault("平静"),
    拥有联系方式: z.boolean(),
    关系阶段: z.string(),
    恋爱状态: z.boolean(),
    透露真名: z.boolean(),
    CV学习进度: z.string(),
    粉丝数: z.coerce.number(),
    $表心声: z.string().prefault(""),
    $里心声: z.string().prefault(""),
    $消息记录: z.record(
      z.string(),
      z.object({
        发送者: z.enum(["林绛", "user"]),
        文字内容: z.string(),
        类型: z.enum(["文字消息", "图片",  "语音", "视频", "语音通话", "视频通话"]),
        时长: z.coerce.number().optional()
      })
    ).prefault({}),
    受孕状态: z.boolean().prefault(false),
    受孕日期: z.string().prefault(""),
    $社交动态: z.record(
      z.string(),
      z.object({
        动态内容: z.string(),
        发布地点: z.string(),
        评论数量: z.coerce.number(),
        评论列表: z.record(z.string(), z.string()).prefault({})
      })
    ).prefault({})
  }),

  $三人群组: z.object({
    群名: z.string().prefault("新宿拯救计划讨论组"),
    消息记录: z.record(
      z.string(),
      z.object({
        发送者: z.enum(["绘里奈", "林绛", "user"]),
        文字内容: z.string(),
        类型: z.enum(["文字消息", "图片", "语音", "视频", "语音通话", "视频通话"]),
        时长: z.coerce.number().optional()
      })
    ).prefault({})
  }).prefault({}),

  $新闻速报: z.object({
    速报列表: z.record(
      z.enum(["新闻1", "新闻2", "新闻3"]),
      z.object({
        来源: z.string(),
        标题: z.string()
      })
    )
  }).prefault({})
}).transform(oldData => {
  // 转换逻辑: 旧结构 -> 新结构
  return {
    世界信息: {
      时间: oldData.世界信息.时间,
      地点: oldData.世界信息.地点
    },
    绘里奈: {
      ...oldData.绘里奈,
      年龄: 17, // 默认初始年龄
      心情: ["平静", "开心", "兴奋", "害羞", "困惑", "生气", "悲伤", "疲惫", "焦虑", "感动", "冷淡", "狡黠", "温柔"].includes(oldData.绘里奈.心情) ? oldData.绘里奈.心情 : "平静"
    },
    月宫绾音: {
      ...oldData.月宫绾音,
      年龄: 19, // 默认初始年龄
      心情: ["平静", "开心", "兴奋", "害羞", "困惑", "生气", "悲伤", "疲惫", "焦虑", "感动", "冷淡", "狡黠", "温柔"].includes(oldData.月宫绾音.心情) ? oldData.月宫绾音.心情 : "平静"
    },
    $三人群组: oldData.$三人群组,
    $新闻速报: {
      速报列表: Object.entries(oldData.$新闻速报.速报列表).reduce((acc, [key, val]) => {
        acc[key] = {
          来源: val.来源,
          标题: val.标题,
          正文: "（旧数据迁移：暂无正文内容）" // 为旧数据补充默认正文
        };
        return acc;
      }, {})
    }
  };
});

// --- 最终导出 ---
// 优先尝试匹配 NewSchema (严格模式)，如果失败则尝试 OldSchema (旧数据) 并自动转换
export const Schema = z.union([NewSchema, OldSchema]);

$(() => {
  registerMvuSchema(Schema);
});
