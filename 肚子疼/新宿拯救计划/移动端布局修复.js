/**
 * 移动端状态栏留空问题修复
 * 针对SillyTavern内嵌环境的特殊处理
 */

(function() {
    'use strict';

    // 检测是否为移动端
    function isMobile() {
        return window.innerWidth <= 600 ||
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // 检测是否为SillyTavern内嵌环境
    function isSillyTavernEmbedded() {
        return window.parent !== window ||
               document.referrer.includes('sillytavern') ||
               location.href.includes('sillytavern');
    }

    // 修复移动端布局
    function fixMobileLayout() {
        if (!isMobile()) return;

        // 获取必要的元素
        const body = document.body;
        const mainContainer = document.querySelector('.main-container');
        const tabContents = document.querySelectorAll('.tab-content');
        const dockNav = document.querySelector('.dock-nav');

        if (!mainContainer || !dockNav) return;

        // 1. 设置正确的视口高度
        const setViewportHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);

            // 针对iOS Safari的特殊处理
            if (mainContainer) {
                mainContainer.style.height = `${window.innerHeight}px`;
            }
        };

        // 2. 修复底部导航栏定位
        const fixDockNav = () => {
            if (isSillyTavernEmbedded()) {
                // SillyTavern内嵌环境使用sticky定位
                dockNav.style.position = 'sticky';
                dockNav.style.bottom = '0';
                dockNav.style.left = '0';
                dockNav.style.transform = 'none';
                dockNav.style.width = '100%';
                dockNav.style.zIndex = '1000';

                // 添加安全区域适配
                const safeAreaBottom = getComputedStyle(document.documentElement)
                    .getPropertyValue('--safe-area-inset-bottom') || '0px';
                dockNav.style.paddingBottom = `max(0px, ${safeAreaBottom})`;
            } else {
                // 普通移动端浏览器使用fixed定位
                dockNav.style.position = 'fixed';
                dockNav.style.bottom = '0';
                dockNav.style.left = '0';
                dockNav.style.transform = 'none';
                dockNav.style.width = '100%';
                dockNav.style.zIndex = '1000';
            }
        };

        // 3. 修复内容区域的内边距
        const fixTabContent = () => {
            tabContents.forEach(tabContent => {
                if (tabContent) {
                    // 移除原有的底部内边距
                    tabContent.style.paddingBottom = '0';
                    // 添加底部边距以避免内容被导航栏遮挡
                    tabContent.style.marginBottom = `${dockNav.offsetHeight}px`;
                }
            });
        };

        // 4. 处理软键盘弹出（主要针对Android）
        const handleKeyboard = () => {
            let originalHeight = window.innerHeight;

            window.addEventListener('resize', () => {
                const currentHeight = window.innerHeight;
                const isKeyboardOpen = currentHeight < originalHeight * 0.8;

                if (isKeyboardOpen) {
                    // 键盘弹出时隐藏底部导航栏
                    dockNav.style.display = 'none';
                } else {
                    // 键盘收起时显示底部导航栏
                    dockNav.style.display = 'flex';
                    // 重新计算布局
                    setTimeout(fixTabContent, 100);
                }
            });
        };

        // 5. 监听方向变化
        const handleOrientationChange = () => {
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    setViewportHeight();
                    fixDockNav();
                    fixTabContent();
                }, 300);
            });
        };

        // 初始化修复
        const init = () => {
            setViewportHeight();
            fixDockNav();
            fixTabContent();
            handleKeyboard();
            handleOrientationChange();

            // 监听窗口大小变化
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    setViewportHeight();
                    fixTabContent();
                }, 250);
            });

            // 监听DOM变化（针对动态内容）
            const observer = new MutationObserver(() => {
                fixTabContent();
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true
            });
        };

        // 页面加载完成后执行修复
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }

        // 针对SillyTavern的特殊处理
        if (isSillyTavernEmbedded()) {
            // 监听SillyTavern的窗口变化事件
            window.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'sillytavern-resize') {
                    setTimeout(() => {
                        setViewportHeight();
                        fixTabContent();
                    }, 100);
                }
            });
        }
    }

    // 添加CSS样式
    function addMobileStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* 移动端优化样式 */
            @media (max-width: 600px) {
                /* 修复100vh在移动端的计算问题 */
                .main-container {
                    height: calc(var(--vh, 1vh) * 100);
                }

                /* 修复内容区域滚动 */
                .tab-content {
                    -webkit-overflow-scrolling: touch;
                    overscroll-behavior: contain;
                }

                /* 修复底部导航栏在SillyTavern中的显示 */
                .sillytavern-embedded .dock-nav {
                    position: sticky !important;
                    bottom: 0 !important;
                }

                /* 修复iOS Safari的底部安全区域 */
                @supports (padding-bottom: env(safe-area-inset-bottom)) {
                    .dock-nav {
                        padding-bottom: env(safe-area-inset-bottom);
                    }
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 初始化
    addMobileStyles();
    fixMobileLayout();

    // 暴露全局函数供外部调用
    window.MobileLayoutFix = {
        refresh: fixMobileLayout,
        isMobile: isMobile,
        isSillyTavernEmbedded: isSillyTavernEmbedded
    };

})();
