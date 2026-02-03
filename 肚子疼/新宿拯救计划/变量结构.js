import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';

export const Schema = z.object({
  世界信息: z.object({
    时间: z.string()
      .regex(/^\d{4}年\d{1,2}月\d{1,2}日(星期[一二三四五六日])?\s*(上午|下午|晚上|凌晨)?\s*\d{1,2}:\d{2}$/, 
        "时间格式应为：YYYY年MM月DD日星期X 上午/下午 HH:MM"),
    
    地点: z.string()
      .min(1, "地点不能为空")
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
  })
  .transform(data => {
    data.好感度 = _.clamp(data.好感度, 0, 400);
    data.信赖度 = _.clamp(data.信赖度, 0, 400);
    if (data.好感度 < 80) data.关系阶段 = "査定の対象";
    else if (data.好感度 < 180) data.关系阶段 = "有利な取引";
    else if (data.好感度 < 280) data.关系阶段 = "予定外の時间";
    else if (data.好感度 < 360) data.关系阶段 = "特別への渇望";
    else data.关系阶段 = "唯一の選択";

    // 受孕逻辑：只有当 AI 尝试将状态设为 true 时，才进行 1d100 判定
    // 判定不通过（< 96）则强制重置为 false。注：判定在每次 AI 发起更新指令时触发。
    if (data.受孕状态) {
      if ((Math.random() * 100 + 1) < 96) {
        data.受孕状态 = false;
        data.受孕日期 = "";
      }
    } else {
      // 联动逻辑：受孕状态为 false 时，同步清空受孕日期
      data.受孕日期 = "";
    }

    return data;
  }),

  月宫绾音: z.object({
    好感度: z.coerce.number(),
    信赖度: z.coerce.number(),
    心情: z.string().prefault("平静"),
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
  })
  .transform(data => {
    data.好感度 = _.clamp(data.好感度, 0, 400);
    data.信赖度 = _.clamp(data.信赖度, 0, 400);
    data.粉丝数 = Math.max(0, data.粉丝数);
    if (data.好感度 < 80) data.关系阶段 = "礼貌客套期";
    else if (data.好感度 < 180) data.关系阶段 = "朋友界限期";
    else if (data.好感度 < 300) data.关系阶段 = "情感模糊期";
    else data.关系阶段 = "确认关系期";

    // 受孕逻辑：只有当 AI 尝试将状态设为 true 时，才进行 1d100 判定
    // 判定不通过（< 96）则强制重置为 false。注：判定在每次 AI 发起更新指令时触发。
    if (data.受孕状态) {
      if ((Math.random() * 100 + 1) < 96) {
        data.受孕状态 = false;
        data.受孕日期 = "";
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
  }).prefault({}),

  $新闻速报: z.object({
    速报列表: z.record(
      z.enum(["新闻1", "新闻2", "新闻3"]),
      z.object({
        来源: z.string().min(1, "新闻来源不能为空"),
        标题: z.string().min(1, "新闻标题不能为空").max(50, "新闻标题不得超过50字")
      })
    )
  })
  .prefault({
    速报列表: {
      "新闻1": { 来源: "TBS新闻", 标题: "新宿歌舞伎町今晚将加强夜间巡逻" },
      "新闻2": { 来源: "《ViVi》", 标题: "秋季约会妆容特辑：清透底妆是关键" },
      "新闻3": { 来源: "Yahoo!ニュース", 标题: "租借服务市场持续升温，业界呼吁规范" }
    }
  }),
});

$(() => {
  registerMvuSchema(Schema);
});
