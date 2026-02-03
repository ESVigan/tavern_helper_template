/**
 * 打开滚动新消息不滚动
 *
 * 功能：
 * - 刚打开一个角色卡时，自动滚动到最新的楼层
 * - 后续接收到新消息时，不会自动滚动，保持用户当前浏览位置
 *
 * 使用前提：
 * - 请在酒馆设置中关闭"自动滚动到新消息"选项
 * - 本脚本会接管滚动行为，只在打开角色卡时滚动一次
 */

// 标记是否刚打开聊天（初次加载状态）
let isInitialLoad = true;

// 监听聊天切换事件 - 当用户打开新角色卡或切换聊天时触发
eventOn(tavern_events.CHAT_CHANGED, () => {
  // 重置为初次加载状态，允许下次滚动
  isInitialLoad = true;
  console.log('[打开滚动新消息不滚动] 检测到聊天切换，准备在消息加载完成后滚动到底部');
});

// 监听消息渲染事件 - 只在首次加载时滚动到底部
eventOn(tavern_events.CHARACTER_MESSAGE_RENDERED, () => {
  if (isInitialLoad) {
    // 延迟一点确保所有消息都渲染完成
    setTimeout(() => {
      const $chat = $('#chat');
      if ($chat.length && $chat[0]) {
        $chat.scrollTop($chat[0].scrollHeight);
        console.log('[打开滚动新消息不滚动] 已滚动到聊天底部');
        // 标记初次加载完成，后续不再自动滚动
        isInitialLoad = false;
      }
    }, 150);
  }
});

// 监听用户消息渲染事件 - 首次加载时也要滚动
eventOn(tavern_events.USER_MESSAGE_RENDERED, () => {
  if (isInitialLoad) {
    setTimeout(() => {
      const $chat = $('#chat');
      if ($chat.length && $chat[0]) {
        $chat.scrollTop($chat[0].scrollHeight);
        console.log('[打开滚动新消息不滚动] 已滚动到聊天底部');
        // 标记初次加载完成
        isInitialLoad = false;
      }
    }, 150);
  }
});

// 脚本加载 - 仅记录日志，不显示提示
$(() => {
  console.log('[打开滚动新消息不滚动] 脚本已加载');
});

// 脚本卸载提示
$(window).on('pagehide', () => {
  console.log('[打开滚动新消息不滚动] 脚本已卸载');
});
