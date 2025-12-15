// ==UserScript==
// @name         mwimytool
// @name         mwimytool
// @name:zh-CN   mwimytool
// @name:en      mwimytool
// @name:en      mwimytool
// @namespace    http://tampermonkey.net/
// @version      1.1.7
// @description  mwimytool
// @description:en  mwimytool
// @description:en  mwimytool
// @author       zhiwei
// @license      CC-BY-NC-SA-4.0
// @match        https://www.milkywayidle.com/*
// @match        https://www.milkywayidlecn.com/*
// @match        https://test.milkywayidle.com/*
// @icon         https://www.milkywayidle.com/favicon.svg
// @icon         https://www.milkywayidle.com/favicon.svg
// @grant        none
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/zhiweiiii/mwi-tool-auto-buy-sell/refs/heads/main/plugins.js
// @downloadURL  https://raw.githubusercontent.com/zhiweiiii/mwi-tool-auto-buy-sell/refs/heads/main/plugins.js
// ==/UserScript==

(function () {
    'use strict';

    // ==================== 全局模块管理 ====================
    window.MWIModules = {
        toast: null,
        api: null,
        autoStop: null,
        alchemyCalculator: null,
        universalCalculator: null,
        shoppingCart: null,
        characterSwitcher: null,
        materialPurchase: null,
        autoClaimMarketListings: null,
        considerRareLoot: null,
        itemValueCalculator: null,
        quickSell: null,
    };

    // ==================== 常量配置 ====================
    const CONFIG = {
        DELAYS: { API_CHECK: 2000, PURCHASE: 800, UPDATE: 100 },
        TIMEOUTS: { API: 8000, PURCHASE: 15000 },
        CACHE_TTL: 60000,
        ALCHEMY_CACHE_EXPIRY: 300000,
        UNIVERSAL_CACHE_EXPIRY: 300000,
        APIENDPOINT: 'mwi-market',

        CHARACTER_SWITCHER: {
            autoInit: true,
            avatarSelector: '.Header_avatar__2RQgo',
            characterInfoSelector: '.Header_characterInfo__3ixY8',
            animationDuration: 200,
            dropdownMaxHeight: '400px',
            dropdownMinWidth: '280px',
            dropdownMaxWidth: '400px'
        },

        COLORS: {
            buy: 'var(--color-market-buy)',
            buyHover: 'var(--color-market-buy-hover)',
            sell: 'var(--color-market-sell)',
            sellHover: 'var(--color-market-sell-hover)',
            disabled: 'var(--color-disabled)',
            error: '#ff6b6b',
            text: 'var(--color-text-dark-mode)',
            warning: 'var(--color-warning)',
            space300: 'var(--color-space-300)',
            cart: '#9c27b0',
            cartHover: '#7b1fa2',
            profit: '#4CAF50',
            loss: '#f44336',
            neutral: '#757575'
        }
    };

    // ==================== 语言配置 ====================
    const LANG = (navigator.language || 'en').toLowerCase().includes('zh') ? {
        directBuy: '直购(左一)', bidOrder: '求购(右一)',
        directBuyUpgrade: '左一', bidOrderUpgrade: '右一',
        buying: '⏳ 购买中...', submitting: '📋 提交中...',
        missing: '缺:', sufficient: '材料充足！', sufficientUpgrade: '升级物品充足！',
        starting: '开始', materials: '种材料', upgradeItems: '种升级物品',
        purchased: '已购买', submitted: '订单已提交', failed: '失败', complete: '完成！',
        error: '出错，请检查控制台', wsNotAvailable: 'WebSocket接口未可用', waiting: '等待接口就绪...',
        ready: '接口已就绪！', success: '成功', each: '个', allFailed: '全部失败',
        targetLabel: '目标',

        switchCharacter: '切换角色',
        noCharacterData: '暂无角色数据，请刷新页面重试',
        current: '当前', switch: '切换', standard: '标准', ironcow: '铁牛',
        lastOnline: '上次在线',
        timeAgo: {
            justNow: '刚刚', minutesAgo: '分钟前', hoursAgo: '小时', daysAgo: '天前'
        },

        askBuyBidSell: '左买右卖', askBuyAskSell: '左买左卖',
        bidBuyAskSell: '右买左卖', bidBuyBidSell: '右买右卖',
        loadingMarketData: '获取实时数据中...', noData: '缺少市场数据',
        errorUniversal: '计算出错',

        addToCart: '加入购物车', add: '已添加', toCart: '到购物车',
        shoppingCart: '购物车', cartEmpty: '购物车是空的', purchaseAll: '一键购买',
        cartClear: '清空购物车', directBuyMode: '直购', bidOrderMode: '求购',
        cartRemove: '移除', cartItem: '项', selectAll: '全选', batchSettings: '批量设置:',
        noMaterialsNeeded: '没有需要补充的材料', addToCartFailed: '添加失败，请稍后重试',
        cartClearSuccess: '已清空购物车', pleaseEnterListName: '请输入清单名称',
        cartEmptyCannotSave: '购物车为空，无法保存', maxListsLimit: '最多只能保存',
        lists: '个清单', listName: '清单名称', save: '💾 保存', savedLists: '已保存清单',
        noSavedLists: '暂无保存的清单', load: '加载', delete: '删除', loaded: '已加载',
        deleted: '已删除', saved: '已保存',
        exportSavedLists: '📤 导出已保存清单', importSavedLists: '📥 导入已保存清单',
        exportStatusPrefix: '已导出 ', exportStatusSuffix: ' 个购物清单',
        importStatusPrefix: '导入完成！共导入', importStatusSuffix: '个购物清单',
        exportFailed: '导出失败', importFailed: '导入失败',
        noListsToExport: '没有保存的购物清单可以导出', invalidImportFormat: '文件格式不正确',

        quickSell: {
            askSell: '左一出售',
            bidSell: '右一出售',
            confirmAskSell: '确认左一卖出',
            confirmBidSell: '确认右一卖出',
            startListing: '开始挂单',
            startInstantSell: '开始直售',
            noMarketData: '无法获取市场数据',
            sellFailed: '出售失败',
            instantSellSuccess: '直售成功',
            instantSellFailed: '直售失败',
            listingSuccess: '挂单成功',
            listingFailed: '挂单失败',
            marketOrdersInsufficient: '市场买单不足。可出售:',
            needed: '，需要:',
            executeSellFailed: '执行出售操作失败',
            getPriceFailed: '计算价格失败',
            getMarketDataFailed: '获取市场数据失败',
            extractItemInfoFailed: '提取物品信息失败'
        },

        chart: {
            title: '资产变化趋势',
            timeRange: '时间范围：',
            days: ['1天', '3天', '7天', '14天', '30天'],
            hoverTip: '将鼠标悬停在图表上查看详细数据',
            noData: '暂无数据',
            calculating: '计算中...',
            todayIncrement: '今日增量:',
            datasets: {
                askTotal: 'Ask总值',
                bidTotal: 'Bid总值',
                movingAverage: '移动平均线',
                trendLine: '趋势线'
            }
        },

        settings: {
            tabName: '脚本设置',

            quickPurchase: {
                title: '快速购买和购物车功能',
                description: '启用材料一键购买和购物车管理功能 (刷新后生效)'
            },
            universalProfit: {
                title: '生产行动利润计算',
                description: '显示制造、烹饪等生产行动的实时利润 (刷新后生效)'
            },
            alchemyProfit: {
                title: '炼金利润计算',
                description: '显示炼金行动的实时利润计算 (刷新后生效)'
            },
            considerArtisanTea: {
                title: '考虑工匠茶效果',
                description: '在计算材料数量时考虑工匠茶的加成'
            },
            gatheringEnhanced: {
                title: '采集增强功能',
                description: '添加目标数量设置，达到目标后自动停止采集 (刷新后生效)'
            },
            characterSwitcher: {
                title: '快速角色切换',
                description: '点击头像快速切换角色，显示角色在线状态 (刷新后生效)'
            },
            autoClaimMarketListings: {
                title: '自动收集市场订单',
                description: '当有市场订单可收集时自动收集物品或金币'
            },
            considerRareLoot: {
                title: '考虑稀有掉落物价值',
                description: '在利润计算中考虑宝箱的期望价值'
            },
            itemValueCalculator: {
                title: '每日资产增量和资产变化趋势图表',
                description: '在背包界面显示每日资产增量，点击打开资产变化趋势图表 (刷新后生效)'
            },
            quickSell: {
                title: '快速出售功能',
                description: '点击物品时显示快速出售按钮'
            },

            resetToDefault: '🔄 重置为默认',
            reloadPage: '🔃 重新加载页面',
            version: '版本',
            settingsReset: '设置已重置',
            confirmReset: '确定要重置所有设置为默认值吗？',
            confirmReload: '确定要重新加载页面吗？',

            checkUpdate: '检查更新', checking: '检查中...',
            newVersion: '发现新版本', latestVersion: '已是最新版本',
            hasUpdate: '🔄 有新版本', isLatest: '✅ 最新版本',
            latestLabel: '最新版本', updateTime: '更新时间', changelog: '更新内容',
            newFound: '发现新版本！请查看下方更新内容', alreadyLatest: '当前已是最新版本！',
            checkFailed: '检查更新失败，请稍后重试', loadingInfo: '正在获取版本信息...'
        }
    } : {
        directBuy: 'Ask(Left)', bidOrder: 'Bid(Right)',
        directBuyUpgrade: 'Left', bidOrderUpgrade: 'Right',
        buying: '⏳ Buying...', submitting: '📋 Submitting...',
        missing: 'Need:', sufficient: 'All materials sufficient!', sufficientUpgrade: 'All upgrades sufficient!',
        starting: 'Start', materials: 'materials', upgradeItems: 'upgrade items',
        purchased: 'Purchased', submitted: 'Order submitted', failed: 'failed', complete: 'completed!',
        error: 'error, check console', wsNotAvailable: 'WebSocket interface not available', waiting: 'Waiting for interface...',
        ready: 'Interface ready!', success: 'Successfully', each: '', allFailed: 'All failed',
        targetLabel: 'Target',

        switchCharacter: 'Switch Character',
        noCharacterData: 'No character data available, please refresh the page',
        current: 'Current', switch: 'Switch', standard: 'Standard', ironcow: 'IronCow',
        lastOnline: 'Last online',
        timeAgo: {
            justNow: 'just now', minutesAgo: 'min ago', hoursAgo: 'hr', daysAgo: 'd ago'
        },

        askBuyBidSell: 'AskBuyBidSell', askBuyAskSell: 'AskBuyAskSell',
        bidBuyAskSell: 'BidBuyAskSell', bidBuyBidSell: 'BidBuyBidSell',
        loadingMarketData: 'Loading Market Data...', noData: 'Lack of Market Data',
        errorUniversal: 'Calculation Error',

        addToCart: 'Add to Cart', add: 'Added', toCart: 'to Cart',
        shoppingCart: 'Shopping Cart', cartEmpty: 'Cart is empty', purchaseAll: 'Purchase All',
        cartClear: 'Clear Cart', directBuyMode: 'Ask', bidOrderMode: 'Bid',
        cartRemove: 'Remove', cartItem: 'items', selectAll: 'Select All', batchSettings: 'Batch Settings:',
        noMaterialsNeeded: 'No materials need to be supplemented', addToCartFailed: 'Add failed, please try again later',
        cartClearSuccess: 'Cart cleared', pleaseEnterListName: 'Please enter list name',
        cartEmptyCannotSave: 'Cart is empty, cannot save', maxListsLimit: 'Maximum',
        lists: 'lists allowed', listName: 'List Name', save: '💾 Save', savedLists: 'Saved Lists',
        noSavedLists: 'No saved lists', load: 'Load', delete: 'Delete', loaded: 'Loaded',
        deleted: 'Deleted', saved: 'Saved',
        exportSavedLists: '📤 Export Saved Lists', importSavedLists: '📥 Import Saved Lists',
        exportStatusPrefix: 'Exported ', exportStatusSuffix: ' shopping lists',
        importStatusPrefix: 'Import completed! ', importStatusSuffix: ' lists imported',
        exportFailed: 'Export failed', importFailed: 'Import failed',
        noListsToExport: 'No saved shopping lists to export', invalidImportFormat: 'Invalid file format',

        quickSell: {
            askSell: 'List at Ask',
            bidSell: 'Sell at Bid',
            confirmAskSell: 'Confirm List',
            confirmBidSell: 'Confirm Sell',
            startListing: 'Starting listing',
            startInstantSell: 'Starting instant sell',
            noMarketData: 'Unable to get market data',
            sellFailed: 'Sell failed',
            instantSellSuccess: 'Instant sell successful',
            instantSellFailed: 'Instant sell failed',
            listingSuccess: 'Listing successful',
            listingFailed: 'Listing failed',
            marketOrdersInsufficient: 'Market orders insufficient. Can sell:',
            needed: ', needed:',
            executeSellFailed: 'Execute sell operation failed',
            getPriceFailed: 'Calculate price failed',
            getMarketDataFailed: 'Get market data failed',
            extractItemInfoFailed: 'Extract item information failed'
        },

        chart: {
            title: 'Asset Change Trends',
            timeRange: 'Time Range:',
            days: ['1 Day', '3 Days', '7 Days', '14 Days', '30 Days'],
            hoverTip: 'Hover over the chart to view detailed data',
            noData: 'No data available',
            calculating: 'Calculating...',
            todayIncrement: 'Today\'s Increment:',
            datasets: {
                askTotal: 'Ask Total',
                bidTotal: 'Bid Total',
                movingAverage: 'Moving Average',
                trendLine: 'Trend Line'
            }
        },

        settings: {
            tabName: 'Scripts',

            quickPurchase: {
                title: 'Quick Purchase & Shopping Cart',
                description: 'Enable one-click material purchase and shopping cart management (Apply after refresh)'
            },
            universalProfit: {
                title: 'Production Action Profit Calculation',
                description: 'Display real-time profit for manufacturing, cooking, and other production actions (takes effect after refresh)'
            },
            alchemyProfit: {
                title: 'Alchemy Profit Calculation',
                description: 'Show real-time profit calculation for alchemy actions (Apply after refresh)'
            },
            considerArtisanTea: {
                title: 'Consider Artisan Tea Effect',
                description: 'Consider artisan tea bonuses when calculating material quantities'
            },
            gatheringEnhanced: {
                title: 'Gathering Enhancement',
                description: 'Add target quantity setting, auto-stop gathering when target reached (Apply after refresh)'
            },
            characterSwitcher: {
                title: 'Quick Character Switching',
                description: 'Click avatar to quickly switch characters, show online status (Apply after refresh)'
            },
            autoClaimMarketListings: {
                title: 'Auto Claim Market Listings',
                description: 'Automatically claim items or coin when market listings are available'
            },
            considerRareLoot: {
                title: 'Consider Rare Loot Value',
                description: 'Consider expected value of rare loot (chests, etc.) in profit calculations'
            },
            itemValueCalculator: {
                title: 'Daily Asset Increment and Asset Change Trend Chart',
                description: 'Display daily asset increment in inventory interface, click to open asset change trend chart (takes effect after refresh)'
            },
            quickSell: {
                title: 'Quick Sell Feature',
                description: 'Show quick sell buttons when clicking items'
            },

            resetToDefault: '🔄 Reset to Default',
            reloadPage: '🔃 Reload Page',
            version: 'Version',
            settingsReset: 'Settings Reset',
            confirmReset: 'Reset all settings to default values?',
            confirmReload: 'Reload the page?',

            checkUpdate: 'Check Update', checking: 'Checking...',
            newVersion: 'New Version', latestVersion: 'Latest Version',
            hasUpdate: '🔄 Update Available', isLatest: '✅ Up to Date',
            latestLabel: 'Latest', updateTime: 'Updated', changelog: 'Changelog',
            newFound: 'New version found! Check details below', alreadyLatest: 'Already up to date!',
            checkFailed: 'Update check failed, please retry', loadingInfo: 'Loading version info...'
        }
    };


    // ==================== 开箱掉落详情 ====================
    const ZHItemNames = {
        "/items/coin": "\u91d1\u5e01",
        "/items/task_token": "\u4efb\u52a1\u4ee3\u5e01",
        "/items/chimerical_token": "\u5947\u5e7b\u4ee3\u5e01",
        "/items/sinister_token": "\u9634\u68ee\u4ee3\u5e01",
        "/items/enchanted_token": "\u79d8\u6cd5\u4ee3\u5e01",
        "/items/pirate_token": "\u6d77\u76d7\u4ee3\u5e01",
        "/items/cowbell": "\u725b\u94c3",
        "/items/bag_of_10_cowbells": "\u725b\u94c3\u888b (10\u4e2a)",
        "/items/purples_gift": "\u5c0f\u7d2b\u725b\u7684\u793c\u7269",
        "/items/small_meteorite_cache": "\u5c0f\u9668\u77f3\u8231",
        "/items/medium_meteorite_cache": "\u4e2d\u9668\u77f3\u8231",
        "/items/large_meteorite_cache": "\u5927\u9668\u77f3\u8231",
        "/items/small_artisans_crate": "\u5c0f\u5de5\u5320\u5323",
        "/items/medium_artisans_crate": "\u4e2d\u5de5\u5320\u5323",
        "/items/large_artisans_crate": "\u5927\u5de5\u5320\u5323",
        "/items/small_treasure_chest": "\u5c0f\u5b9d\u7bb1",
        "/items/medium_treasure_chest": "\u4e2d\u5b9d\u7bb1",
        "/items/large_treasure_chest": "\u5927\u5b9d\u7bb1",
        "/items/chimerical_chest": "\u5947\u5e7b\u5b9d\u7bb1",
        "/items/chimerical_refinement_chest": "\u5947\u5e7b\u7cbe\u70bc\u5b9d\u7bb1",
        "/items/sinister_chest": "\u9634\u68ee\u5b9d\u7bb1",
        "/items/sinister_refinement_chest": "\u9634\u68ee\u7cbe\u70bc\u5b9d\u7bb1",
        "/items/enchanted_chest": "\u79d8\u6cd5\u5b9d\u7bb1",
        "/items/enchanted_refinement_chest": "\u79d8\u6cd5\u7cbe\u70bc\u5b9d\u7bb1",
        "/items/pirate_chest": "\u6d77\u76d7\u5b9d\u7bb1",
        "/items/pirate_refinement_chest": "\u6d77\u76d7\u7cbe\u70bc\u5b9d\u7bb1",
        "/items/blue_key_fragment": "\u84dd\u8272\u94a5\u5319\u788e\u7247",
        "/items/green_key_fragment": "\u7eff\u8272\u94a5\u5319\u788e\u7247",
        "/items/purple_key_fragment": "\u7d2b\u8272\u94a5\u5319\u788e\u7247",
        "/items/white_key_fragment": "\u767d\u8272\u94a5\u5319\u788e\u7247",
        "/items/orange_key_fragment": "\u6a59\u8272\u94a5\u5319\u788e\u7247",
        "/items/brown_key_fragment": "\u68d5\u8272\u94a5\u5319\u788e\u7247",
        "/items/stone_key_fragment": "\u77f3\u5934\u94a5\u5319\u788e\u7247",
        "/items/dark_key_fragment": "\u9ed1\u6697\u94a5\u5319\u788e\u7247",
        "/items/burning_key_fragment": "\u71c3\u70e7\u94a5\u5319\u788e\u7247",
        "/items/chimerical_entry_key": "\u5947\u5e7b\u94a5\u5319",
        "/items/chimerical_chest_key": "\u5947\u5e7b\u5b9d\u7bb1\u94a5\u5319",
        "/items/sinister_entry_key": "\u9634\u68ee\u94a5\u5319",
        "/items/sinister_chest_key": "\u9634\u68ee\u5b9d\u7bb1\u94a5\u5319",
        "/items/enchanted_entry_key": "\u79d8\u6cd5\u94a5\u5319",
        "/items/enchanted_chest_key": "\u79d8\u6cd5\u5b9d\u7bb1\u94a5\u5319",
        "/items/pirate_entry_key": "\u6d77\u76d7\u94a5\u5319",
        "/items/pirate_chest_key": "\u6d77\u76d7\u5b9d\u7bb1\u94a5\u5319",
        "/items/donut": "\u751c\u751c\u5708",
        "/items/blueberry_donut": "\u84dd\u8393\u751c\u751c\u5708",
        "/items/blackberry_donut": "\u9ed1\u8393\u751c\u751c\u5708",
        "/items/strawberry_donut": "\u8349\u8393\u751c\u751c\u5708",
        "/items/mooberry_donut": "\u54de\u8393\u751c\u751c\u5708",
        "/items/marsberry_donut": "\u706b\u661f\u8393\u751c\u751c\u5708",
        "/items/spaceberry_donut": "\u592a\u7a7a\u8393\u751c\u751c\u5708",
        "/items/cupcake": "\u7eb8\u676f\u86cb\u7cd5",
        "/items/blueberry_cake": "\u84dd\u8393\u86cb\u7cd5",
        "/items/blackberry_cake": "\u9ed1\u8393\u86cb\u7cd5",
        "/items/strawberry_cake": "\u8349\u8393\u86cb\u7cd5",
        "/items/mooberry_cake": "\u54de\u8393\u86cb\u7cd5",
        "/items/marsberry_cake": "\u706b\u661f\u8393\u86cb\u7cd5",
        "/items/spaceberry_cake": "\u592a\u7a7a\u8393\u86cb\u7cd5",
        "/items/gummy": "\u8f6f\u7cd6",
        "/items/apple_gummy": "\u82f9\u679c\u8f6f\u7cd6",
        "/items/orange_gummy": "\u6a59\u5b50\u8f6f\u7cd6",
        "/items/plum_gummy": "\u674e\u5b50\u8f6f\u7cd6",
        "/items/peach_gummy": "\u6843\u5b50\u8f6f\u7cd6",
        "/items/dragon_fruit_gummy": "\u706b\u9f99\u679c\u8f6f\u7cd6",
        "/items/star_fruit_gummy": "\u6768\u6843\u8f6f\u7cd6",
        "/items/yogurt": "\u9178\u5976",
        "/items/apple_yogurt": "\u82f9\u679c\u9178\u5976",
        "/items/orange_yogurt": "\u6a59\u5b50\u9178\u5976",
        "/items/plum_yogurt": "\u674e\u5b50\u9178\u5976",
        "/items/peach_yogurt": "\u6843\u5b50\u9178\u5976",
        "/items/dragon_fruit_yogurt": "\u706b\u9f99\u679c\u9178\u5976",
        "/items/star_fruit_yogurt": "\u6768\u6843\u9178\u5976",
        "/items/milking_tea": "\u6324\u5976\u8336",
        "/items/foraging_tea": "\u91c7\u6458\u8336",
        "/items/woodcutting_tea": "\u4f10\u6728\u8336",
        "/items/cooking_tea": "\u70f9\u996a\u8336",
        "/items/brewing_tea": "\u51b2\u6ce1\u8336",
        "/items/alchemy_tea": "\u70bc\u91d1\u8336",
        "/items/enhancing_tea": "\u5f3a\u5316\u8336",
        "/items/cheesesmithing_tea": "\u5976\u916a\u953b\u9020\u8336",
        "/items/crafting_tea": "\u5236\u4f5c\u8336",
        "/items/tailoring_tea": "\u7f1d\u7eab\u8336",
        "/items/super_milking_tea": "\u8d85\u7ea7\u6324\u5976\u8336",
        "/items/super_foraging_tea": "\u8d85\u7ea7\u91c7\u6458\u8336",
        "/items/super_woodcutting_tea": "\u8d85\u7ea7\u4f10\u6728\u8336",
        "/items/super_cooking_tea": "\u8d85\u7ea7\u70f9\u996a\u8336",
        "/items/super_brewing_tea": "\u8d85\u7ea7\u51b2\u6ce1\u8336",
        "/items/super_alchemy_tea": "\u8d85\u7ea7\u70bc\u91d1\u8336",
        "/items/super_enhancing_tea": "\u8d85\u7ea7\u5f3a\u5316\u8336",
        "/items/super_cheesesmithing_tea": "\u8d85\u7ea7\u5976\u916a\u953b\u9020\u8336",
        "/items/super_crafting_tea": "\u8d85\u7ea7\u5236\u4f5c\u8336",
        "/items/super_tailoring_tea": "\u8d85\u7ea7\u7f1d\u7eab\u8336",
        "/items/ultra_milking_tea": "\u7a76\u6781\u6324\u5976\u8336",
        "/items/ultra_foraging_tea": "\u7a76\u6781\u91c7\u6458\u8336",
        "/items/ultra_woodcutting_tea": "\u7a76\u6781\u4f10\u6728\u8336",
        "/items/ultra_cooking_tea": "\u7a76\u6781\u70f9\u996a\u8336",
        "/items/ultra_brewing_tea": "\u7a76\u6781\u51b2\u6ce1\u8336",
        "/items/ultra_alchemy_tea": "\u7a76\u6781\u70bc\u91d1\u8336",
        "/items/ultra_enhancing_tea": "\u7a76\u6781\u5f3a\u5316\u8336",
        "/items/ultra_cheesesmithing_tea": "\u7a76\u6781\u5976\u916a\u953b\u9020\u8336",
        "/items/ultra_crafting_tea": "\u7a76\u6781\u5236\u4f5c\u8336",
        "/items/ultra_tailoring_tea": "\u7a76\u6781\u7f1d\u7eab\u8336",
        "/items/gathering_tea": "\u91c7\u96c6\u8336",
        "/items/gourmet_tea": "\u7f8e\u98df\u8336",
        "/items/wisdom_tea": "\u7ecf\u9a8c\u8336",
        "/items/processing_tea": "\u52a0\u5de5\u8336",
        "/items/efficiency_tea": "\u6548\u7387\u8336",
        "/items/artisan_tea": "\u5de5\u5320\u8336",
        "/items/catalytic_tea": "\u50ac\u5316\u8336",
        "/items/blessed_tea": "\u798f\u6c14\u8336",
        "/items/stamina_coffee": "\u8010\u529b\u5496\u5561",
        "/items/intelligence_coffee": "\u667a\u529b\u5496\u5561",
        "/items/defense_coffee": "\u9632\u5fa1\u5496\u5561",
        "/items/attack_coffee": "\u653b\u51fb\u5496\u5561",
        "/items/melee_coffee": "\u8fd1\u6218\u5496\u5561",
        "/items/ranged_coffee": "\u8fdc\u7a0b\u5496\u5561",
        "/items/magic_coffee": "\u9b54\u6cd5\u5496\u5561",
        "/items/super_stamina_coffee": "\u8d85\u7ea7\u8010\u529b\u5496\u5561",
        "/items/super_intelligence_coffee": "\u8d85\u7ea7\u667a\u529b\u5496\u5561",
        "/items/super_defense_coffee": "\u8d85\u7ea7\u9632\u5fa1\u5496\u5561",
        "/items/super_attack_coffee": "\u8d85\u7ea7\u653b\u51fb\u5496\u5561",
        "/items/super_melee_coffee": "\u8d85\u7ea7\u8fd1\u6218\u5496\u5561",
        "/items/super_ranged_coffee": "\u8d85\u7ea7\u8fdc\u7a0b\u5496\u5561",
        "/items/super_magic_coffee": "\u8d85\u7ea7\u9b54\u6cd5\u5496\u5561",
        "/items/ultra_stamina_coffee": "\u7a76\u6781\u8010\u529b\u5496\u5561",
        "/items/ultra_intelligence_coffee": "\u7a76\u6781\u667a\u529b\u5496\u5561",
        "/items/ultra_defense_coffee": "\u7a76\u6781\u9632\u5fa1\u5496\u5561",
        "/items/ultra_attack_coffee": "\u7a76\u6781\u653b\u51fb\u5496\u5561",
        "/items/ultra_melee_coffee": "\u7a76\u6781\u8fd1\u6218\u5496\u5561",
        "/items/ultra_ranged_coffee": "\u7a76\u6781\u8fdc\u7a0b\u5496\u5561",
        "/items/ultra_magic_coffee": "\u7a76\u6781\u9b54\u6cd5\u5496\u5561",
        "/items/wisdom_coffee": "\u7ecf\u9a8c\u5496\u5561",
        "/items/lucky_coffee": "\u5e78\u8fd0\u5496\u5561",
        "/items/swiftness_coffee": "\u8fc5\u6377\u5496\u5561",
        "/items/channeling_coffee": "\u541f\u5531\u5496\u5561",
        "/items/critical_coffee": "\u66b4\u51fb\u5496\u5561",
        "/items/poke": "\u7834\u80c6\u4e4b\u523a",
        "/items/impale": "\u900f\u9aa8\u4e4b\u523a",
        "/items/puncture": "\u7834\u7532\u4e4b\u523a",
        "/items/penetrating_strike": "\u8d2f\u5fc3\u4e4b\u523a",
        "/items/scratch": "\u722a\u5f71\u65a9",
        "/items/cleave": "\u5206\u88c2\u65a9",
        "/items/maim": "\u8840\u5203\u65a9",
        "/items/crippling_slash": "\u81f4\u6b8b\u65a9",
        "/items/smack": "\u91cd\u78be",
        "/items/sweep": "\u91cd\u626b",
        "/items/stunning_blow": "\u91cd\u9524",
        "/items/fracturing_impact": "\u788e\u88c2\u51b2\u51fb",
        "/items/shield_bash": "\u76fe\u51fb",
        "/items/quick_shot": "\u5feb\u901f\u5c04\u51fb",
        "/items/aqua_arrow": "\u6d41\u6c34\u7bad",
        "/items/flame_arrow": "\u70c8\u7130\u7bad",
        "/items/rain_of_arrows": "\u7bad\u96e8",
        "/items/silencing_shot": "\u6c89\u9ed8\u4e4b\u7bad",
        "/items/steady_shot": "\u7a33\u5b9a\u5c04\u51fb",
        "/items/pestilent_shot": "\u75ab\u75c5\u5c04\u51fb",
        "/items/penetrating_shot": "\u8d2f\u7a7f\u5c04\u51fb",
        "/items/water_strike": "\u6d41\u6c34\u51b2\u51fb",
        "/items/ice_spear": "\u51b0\u67aa\u672f",
        "/items/frost_surge": "\u51b0\u971c\u7206\u88c2",
        "/items/mana_spring": "\u6cd5\u529b\u55b7\u6cc9",
        "/items/entangle": "\u7f20\u7ed5",
        "/items/toxic_pollen": "\u5267\u6bd2\u7c89\u5c18",
        "/items/natures_veil": "\u81ea\u7136\u83cc\u5e55",
        "/items/life_drain": "\u751f\u547d\u5438\u53d6",
        "/items/fireball": "\u706b\u7403",
        "/items/flame_blast": "\u7194\u5ca9\u7206\u88c2",
        "/items/firestorm": "\u706b\u7130\u98ce\u66b4",
        "/items/smoke_burst": "\u70df\u7206\u706d\u5f71",
        "/items/minor_heal": "\u521d\u7ea7\u81ea\u6108\u672f",
        "/items/heal": "\u81ea\u6108\u672f",
        "/items/quick_aid": "\u5feb\u901f\u6cbb\u7597\u672f",
        "/items/rejuvenate": "\u7fa4\u4f53\u6cbb\u7597\u672f",
        "/items/taunt": "\u5632\u8bbd",
        "/items/provoke": "\u6311\u8845",
        "/items/toughness": "\u575a\u97e7",
        "/items/elusiveness": "\u95ea\u907f",
        "/items/precision": "\u7cbe\u786e",
        "/items/berserk": "\u72c2\u66b4",
        "/items/elemental_affinity": "\u5143\u7d20\u589e\u5e45",
        "/items/frenzy": "\u72c2\u901f",
        "/items/spike_shell": "\u5c16\u523a\u9632\u62a4",
        "/items/retribution": "\u60e9\u6212",
        "/items/vampirism": "\u5438\u8840",
        "/items/revive": "\u590d\u6d3b",
        "/items/insanity": "\u75af\u72c2",
        "/items/invincible": "\u65e0\u654c",
        "/items/speed_aura": "\u901f\u5ea6\u5149\u73af",
        "/items/guardian_aura": "\u5b88\u62a4\u5149\u73af",
        "/items/fierce_aura": "\u7269\u7406\u5149\u73af",
        "/items/critical_aura": "\u66b4\u51fb\u5149\u73af",
        "/items/mystic_aura": "\u5143\u7d20\u5149\u73af",
        "/items/gobo_stabber": "\u54e5\u5e03\u6797\u957f\u5251",
        "/items/gobo_slasher": "\u54e5\u5e03\u6797\u5173\u5200",
        "/items/gobo_smasher": "\u54e5\u5e03\u6797\u72fc\u7259\u68d2",
        "/items/spiked_bulwark": "\u5c16\u523a\u91cd\u76fe",
        "/items/werewolf_slasher": "\u72fc\u4eba\u5173\u5200",
        "/items/griffin_bulwark": "\u72ee\u9e6b\u91cd\u76fe",
        "/items/griffin_bulwark_refined": "\u72ee\u9e6b\u91cd\u76fe\uff08\u7cbe\uff09",
        "/items/gobo_shooter": "\u54e5\u5e03\u6797\u5f39\u5f13",
        "/items/vampiric_bow": "\u5438\u8840\u5f13",
        "/items/cursed_bow": "\u5492\u6028\u4e4b\u5f13",
        "/items/cursed_bow_refined": "\u5492\u6028\u4e4b\u5f13\uff08\u7cbe\uff09",
        "/items/gobo_boomstick": "\u54e5\u5e03\u6797\u706b\u68cd",
        "/items/cheese_bulwark": "\u5976\u916a\u91cd\u76fe",
        "/items/verdant_bulwark": "\u7fe0\u7eff\u91cd\u76fe",
        "/items/azure_bulwark": "\u851a\u84dd\u91cd\u76fe",
        "/items/burble_bulwark": "\u6df1\u7d2b\u91cd\u76fe",
        "/items/crimson_bulwark": "\u7edb\u7ea2\u91cd\u76fe",
        "/items/rainbow_bulwark": "\u5f69\u8679\u91cd\u76fe",
        "/items/holy_bulwark": "\u795e\u5723\u91cd\u76fe",
        "/items/wooden_bow": "\u6728\u5f13",
        "/items/birch_bow": "\u6866\u6728\u5f13",
        "/items/cedar_bow": "\u96ea\u677e\u5f13",
        "/items/purpleheart_bow": "\u7d2b\u5fc3\u5f13",
        "/items/ginkgo_bow": "\u94f6\u674f\u5f13",
        "/items/redwood_bow": "\u7ea2\u6749\u5f13",
        "/items/arcane_bow": "\u795e\u79d8\u5f13",
        "/items/stalactite_spear": "\u77f3\u949f\u957f\u67aa",
        "/items/granite_bludgeon": "\u82b1\u5c97\u5ca9\u5927\u68d2",
        "/items/furious_spear": "\u72c2\u6012\u957f\u67aa",
        "/items/furious_spear_refined": "\u72c2\u6012\u957f\u67aa\uff08\u7cbe\uff09",
        "/items/regal_sword": "\u541b\u738b\u4e4b\u5251",
        "/items/regal_sword_refined": "\u541b\u738b\u4e4b\u5251\uff08\u7cbe\uff09",
        "/items/chaotic_flail": "\u6df7\u6c8c\u8fde\u67b7",
        "/items/chaotic_flail_refined": "\u6df7\u6c8c\u8fde\u67b7\uff08\u7cbe\uff09",
        "/items/soul_hunter_crossbow": "\u7075\u9b42\u730e\u624b\u5f29",
        "/items/sundering_crossbow": "\u88c2\u7a7a\u4e4b\u5f29",
        "/items/sundering_crossbow_refined": "\u88c2\u7a7a\u4e4b\u5f29\uff08\u7cbe\uff09",
        "/items/frost_staff": "\u51b0\u971c\u6cd5\u6756",
        "/items/infernal_battlestaff": "\u70bc\u72f1\u6cd5\u6756",
        "/items/jackalope_staff": "\u9e7f\u89d2\u5154\u4e4b\u6756",
        "/items/rippling_trident": "\u6d9f\u6f2a\u4e09\u53c9\u621f",
        "/items/rippling_trident_refined": "\u6d9f\u6f2a\u4e09\u53c9\u621f\uff08\u7cbe\uff09",
        "/items/blooming_trident": "\u7efd\u653e\u4e09\u53c9\u621f",
        "/items/blooming_trident_refined": "\u7efd\u653e\u4e09\u53c9\u621f\uff08\u7cbe\uff09",
        "/items/blazing_trident": "\u70bd\u7130\u4e09\u53c9\u621f",
        "/items/blazing_trident_refined": "\u70bd\u7130\u4e09\u53c9\u621f\uff08\u7cbe\uff09",
        "/items/cheese_sword": "\u5976\u916a\u5251",
        "/items/verdant_sword": "\u7fe0\u7eff\u5251",
        "/items/azure_sword": "\u851a\u84dd\u5251",
        "/items/burble_sword": "\u6df1\u7d2b\u5251",
        "/items/crimson_sword": "\u7edb\u7ea2\u5251",
        "/items/rainbow_sword": "\u5f69\u8679\u5251",
        "/items/holy_sword": "\u795e\u5723\u5251",
        "/items/cheese_spear": "\u5976\u916a\u957f\u67aa",
        "/items/verdant_spear": "\u7fe0\u7eff\u957f\u67aa",
        "/items/azure_spear": "\u851a\u84dd\u957f\u67aa",
        "/items/burble_spear": "\u6df1\u7d2b\u957f\u67aa",
        "/items/crimson_spear": "\u7edb\u7ea2\u957f\u67aa",
        "/items/rainbow_spear": "\u5f69\u8679\u957f\u67aa",
        "/items/holy_spear": "\u795e\u5723\u957f\u67aa",
        "/items/cheese_mace": "\u5976\u916a\u9489\u5934\u9524",
        "/items/verdant_mace": "\u7fe0\u7eff\u9489\u5934\u9524",
        "/items/azure_mace": "\u851a\u84dd\u9489\u5934\u9524",
        "/items/burble_mace": "\u6df1\u7d2b\u9489\u5934\u9524",
        "/items/crimson_mace": "\u7edb\u7ea2\u9489\u5934\u9524",
        "/items/rainbow_mace": "\u5f69\u8679\u9489\u5934\u9524",
        "/items/holy_mace": "\u795e\u5723\u9489\u5934\u9524",
        "/items/wooden_crossbow": "\u6728\u5f29",
        "/items/birch_crossbow": "\u6866\u6728\u5f29",
        "/items/cedar_crossbow": "\u96ea\u677e\u5f29",
        "/items/purpleheart_crossbow": "\u7d2b\u5fc3\u5f29",
        "/items/ginkgo_crossbow": "\u94f6\u674f\u5f29",
        "/items/redwood_crossbow": "\u7ea2\u6749\u5f29",
        "/items/arcane_crossbow": "\u795e\u79d8\u5f29",
        "/items/wooden_water_staff": "\u6728\u5236\u6c34\u6cd5\u6756",
        "/items/birch_water_staff": "\u6866\u6728\u6c34\u6cd5\u6756",
        "/items/cedar_water_staff": "\u96ea\u677e\u6c34\u6cd5\u6756",
        "/items/purpleheart_water_staff": "\u7d2b\u5fc3\u6c34\u6cd5\u6756",
        "/items/ginkgo_water_staff": "\u94f6\u674f\u6c34\u6cd5\u6756",
        "/items/redwood_water_staff": "\u7ea2\u6749\u6c34\u6cd5\u6756",
        "/items/arcane_water_staff": "\u795e\u79d8\u6c34\u6cd5\u6756",
        "/items/wooden_nature_staff": "\u6728\u5236\u81ea\u7136\u6cd5\u6756",
        "/items/birch_nature_staff": "\u6866\u6728\u81ea\u7136\u6cd5\u6756",
        "/items/cedar_nature_staff": "\u96ea\u677e\u81ea\u7136\u6cd5\u6756",
        "/items/purpleheart_nature_staff": "\u7d2b\u5fc3\u81ea\u7136\u6cd5\u6756",
        "/items/ginkgo_nature_staff": "\u94f6\u674f\u81ea\u7136\u6cd5\u6756",
        "/items/redwood_nature_staff": "\u7ea2\u6749\u81ea\u7136\u6cd5\u6756",
        "/items/arcane_nature_staff": "\u795e\u79d8\u81ea\u7136\u6cd5\u6756",
        "/items/wooden_fire_staff": "\u6728\u5236\u706b\u6cd5\u6756",
        "/items/birch_fire_staff": "\u6866\u6728\u706b\u6cd5\u6756",
        "/items/cedar_fire_staff": "\u96ea\u677e\u706b\u6cd5\u6756",
        "/items/purpleheart_fire_staff": "\u7d2b\u5fc3\u706b\u6cd5\u6756",
        "/items/ginkgo_fire_staff": "\u94f6\u674f\u706b\u6cd5\u6756",
        "/items/redwood_fire_staff": "\u7ea2\u6749\u706b\u6cd5\u6756",
        "/items/arcane_fire_staff": "\u795e\u79d8\u706b\u6cd5\u6756",
        "/items/eye_watch": "\u638c\u4e0a\u76d1\u5de5",
        "/items/snake_fang_dirk": "\u86c7\u7259\u77ed\u5251",
        "/items/vision_shield": "\u89c6\u89c9\u76fe",
        "/items/gobo_defender": "\u54e5\u5e03\u6797\u9632\u5fa1\u8005",
        "/items/vampire_fang_dirk": "\u5438\u8840\u9b3c\u77ed\u5251",
        "/items/knights_aegis": "\u9a91\u58eb\u76fe",
        "/items/knights_aegis_refined": "\u9a91\u58eb\u76fe\uff08\u7cbe\uff09",
        "/items/treant_shield": "\u6811\u4eba\u76fe",
        "/items/manticore_shield": "\u874e\u72ee\u76fe",
        "/items/tome_of_healing": "\u6cbb\u7597\u4e4b\u4e66",
        "/items/tome_of_the_elements": "\u5143\u7d20\u4e4b\u4e66",
        "/items/watchful_relic": "\u8b66\u6212\u9057\u7269",
        "/items/bishops_codex": "\u4e3b\u6559\u6cd5\u5178",
        "/items/bishops_codex_refined": "\u4e3b\u6559\u6cd5\u5178\uff08\u7cbe\uff09",
        "/items/cheese_buckler": "\u5976\u916a\u5706\u76fe",
        "/items/verdant_buckler": "\u7fe0\u7eff\u5706\u76fe",
        "/items/azure_buckler": "\u851a\u84dd\u5706\u76fe",
        "/items/burble_buckler": "\u6df1\u7d2b\u5706\u76fe",
        "/items/crimson_buckler": "\u7edb\u7ea2\u5706\u76fe",
        "/items/rainbow_buckler": "\u5f69\u8679\u5706\u76fe",
        "/items/holy_buckler": "\u795e\u5723\u5706\u76fe",
        "/items/wooden_shield": "\u6728\u76fe",
        "/items/birch_shield": "\u6866\u6728\u76fe",
        "/items/cedar_shield": "\u96ea\u677e\u76fe",
        "/items/purpleheart_shield": "\u7d2b\u5fc3\u76fe",
        "/items/ginkgo_shield": "\u94f6\u674f\u76fe",
        "/items/redwood_shield": "\u7ea2\u6749\u76fe",
        "/items/arcane_shield": "\u795e\u79d8\u76fe",
        "/items/sinister_cape": "\u9634\u68ee\u6597\u7bf7",
        "/items/sinister_cape_refined": "\u9634\u68ee\u6597\u7bf7\uff08\u7cbe\uff09",
        "/items/chimerical_quiver": "\u5947\u5e7b\u7bad\u888b",
        "/items/chimerical_quiver_refined": "\u5947\u5e7b\u7bad\u888b\uff08\u7cbe\uff09",
        "/items/enchanted_cloak": "\u79d8\u6cd5\u62ab\u98ce",
        "/items/enchanted_cloak_refined": "\u79d8\u6cd5\u62ab\u98ce\uff08\u7cbe\uff09",
        "/items/red_culinary_hat": "\u7ea2\u8272\u53a8\u5e08\u5e3d",
        "/items/snail_shell_helmet": "\u8717\u725b\u58f3\u5934\u76d4",
        "/items/vision_helmet": "\u89c6\u89c9\u5934\u76d4",
        "/items/fluffy_red_hat": "\u84ec\u677e\u7ea2\u5e3d\u5b50",
        "/items/corsair_helmet": "\u63a0\u593a\u8005\u5934\u76d4",
        "/items/corsair_helmet_refined": "\u63a0\u593a\u8005\u5934\u76d4\uff08\u7cbe\uff09",
        "/items/acrobatic_hood": "\u6742\u6280\u5e08\u515c\u5e3d",
        "/items/acrobatic_hood_refined": "\u6742\u6280\u5e08\u515c\u5e3d\uff08\u7cbe\uff09",
        "/items/magicians_hat": "\u9b54\u672f\u5e08\u5e3d",
        "/items/magicians_hat_refined": "\u9b54\u672f\u5e08\u5e3d\uff08\u7cbe\uff09",
        "/items/cheese_helmet": "\u5976\u916a\u5934\u76d4",
        "/items/verdant_helmet": "\u7fe0\u7eff\u5934\u76d4",
        "/items/azure_helmet": "\u851a\u84dd\u5934\u76d4",
        "/items/burble_helmet": "\u6df1\u7d2b\u5934\u76d4",
        "/items/crimson_helmet": "\u7edb\u7ea2\u5934\u76d4",
        "/items/rainbow_helmet": "\u5f69\u8679\u5934\u76d4",
        "/items/holy_helmet": "\u795e\u5723\u5934\u76d4",
        "/items/rough_hood": "\u7c97\u7cd9\u515c\u5e3d",
        "/items/reptile_hood": "\u722c\u884c\u52a8\u7269\u515c\u5e3d",
        "/items/gobo_hood": "\u54e5\u5e03\u6797\u515c\u5e3d",
        "/items/beast_hood": "\u91ce\u517d\u515c\u5e3d",
        "/items/umbral_hood": "\u6697\u5f71\u515c\u5e3d",
        "/items/cotton_hat": "\u68c9\u5e3d",
        "/items/linen_hat": "\u4e9a\u9ebb\u5e3d",
        "/items/bamboo_hat": "\u7af9\u5e3d",
        "/items/silk_hat": "\u4e1d\u5e3d",
        "/items/radiant_hat": "\u5149\u8f89\u5e3d",
        "/items/dairyhands_top": "\u6324\u5976\u5de5\u4e0a\u8863",
        "/items/foragers_top": "\u91c7\u6458\u8005\u4e0a\u8863",
        "/items/lumberjacks_top": "\u4f10\u6728\u5de5\u4e0a\u8863",
        "/items/cheesemakers_top": "\u5976\u916a\u5e08\u4e0a\u8863",
        "/items/crafters_top": "\u5de5\u5320\u4e0a\u8863",
        "/items/tailors_top": "\u88c1\u7f1d\u4e0a\u8863",
        "/items/chefs_top": "\u53a8\u5e08\u4e0a\u8863",
        "/items/brewers_top": "\u996e\u54c1\u5e08\u4e0a\u8863",
        "/items/alchemists_top": "\u70bc\u91d1\u5e08\u4e0a\u8863",
        "/items/enhancers_top": "\u5f3a\u5316\u5e08\u4e0a\u8863",
        "/items/gator_vest": "\u9cc4\u9c7c\u9a6c\u7532",
        "/items/turtle_shell_body": "\u9f9f\u58f3\u80f8\u7532",
        "/items/colossus_plate_body": "\u5de8\u50cf\u80f8\u7532",
        "/items/demonic_plate_body": "\u6076\u9b54\u80f8\u7532",
        "/items/anchorbound_plate_body": "\u951a\u5b9a\u80f8\u7532",
        "/items/anchorbound_plate_body_refined": "\u951a\u5b9a\u80f8\u7532\uff08\u7cbe\uff09",
        "/items/maelstrom_plate_body": "\u6012\u6d9b\u80f8\u7532",
        "/items/maelstrom_plate_body_refined": "\u6012\u6d9b\u80f8\u7532\uff08\u7cbe\uff09",
        "/items/marine_tunic": "\u6d77\u6d0b\u76ae\u8863",
        "/items/revenant_tunic": "\u4ea1\u7075\u76ae\u8863",
        "/items/griffin_tunic": "\u72ee\u9e6b\u76ae\u8863",
        "/items/kraken_tunic": "\u514b\u62c9\u80af\u76ae\u8863",
        "/items/kraken_tunic_refined": "\u514b\u62c9\u80af\u76ae\u8863\uff08\u7cbe\uff09",
        "/items/icy_robe_top": "\u51b0\u971c\u888d\u670d",
        "/items/flaming_robe_top": "\u70c8\u7130\u888d\u670d",
        "/items/luna_robe_top": "\u6708\u795e\u888d\u670d",
        "/items/royal_water_robe_top": "\u7687\u5bb6\u6c34\u7cfb\u888d\u670d",
        "/items/royal_water_robe_top_refined": "\u7687\u5bb6\u6c34\u7cfb\u888d\u670d\uff08\u7cbe\uff09",
        "/items/royal_nature_robe_top": "\u7687\u5bb6\u81ea\u7136\u7cfb\u888d\u670d",
        "/items/royal_nature_robe_top_refined": "\u7687\u5bb6\u81ea\u7136\u7cfb\u888d\u670d\uff08\u7cbe\uff09",
        "/items/royal_fire_robe_top": "\u7687\u5bb6\u706b\u7cfb\u888d\u670d",
        "/items/royal_fire_robe_top_refined": "\u7687\u5bb6\u706b\u7cfb\u888d\u670d\uff08\u7cbe\uff09",
        "/items/cheese_plate_body": "\u5976\u916a\u80f8\u7532",
        "/items/verdant_plate_body": "\u7fe0\u7eff\u80f8\u7532",
        "/items/azure_plate_body": "\u851a\u84dd\u80f8\u7532",
        "/items/burble_plate_body": "\u6df1\u7d2b\u80f8\u7532",
        "/items/crimson_plate_body": "\u7edb\u7ea2\u80f8\u7532",
        "/items/rainbow_plate_body": "\u5f69\u8679\u80f8\u7532",
        "/items/holy_plate_body": "\u795e\u5723\u80f8\u7532",
        "/items/rough_tunic": "\u7c97\u7cd9\u76ae\u8863",
        "/items/reptile_tunic": "\u722c\u884c\u52a8\u7269\u76ae\u8863",
        "/items/gobo_tunic": "\u54e5\u5e03\u6797\u76ae\u8863",
        "/items/beast_tunic": "\u91ce\u517d\u76ae\u8863",
        "/items/umbral_tunic": "\u6697\u5f71\u76ae\u8863",
        "/items/cotton_robe_top": "\u68c9\u888d\u670d",
        "/items/linen_robe_top": "\u4e9a\u9ebb\u888d\u670d",
        "/items/bamboo_robe_top": "\u7af9\u888d\u670d",
        "/items/silk_robe_top": "\u4e1d\u7ef8\u888d\u670d",
        "/items/radiant_robe_top": "\u5149\u8f89\u888d\u670d",
        "/items/dairyhands_bottoms": "\u6324\u5976\u5de5\u4e0b\u88c5",
        "/items/foragers_bottoms": "\u91c7\u6458\u8005\u4e0b\u88c5",
        "/items/lumberjacks_bottoms": "\u4f10\u6728\u5de5\u4e0b\u88c5",
        "/items/cheesemakers_bottoms": "\u5976\u916a\u5e08\u4e0b\u88c5",
        "/items/crafters_bottoms": "\u5de5\u5320\u4e0b\u88c5",
        "/items/tailors_bottoms": "\u88c1\u7f1d\u4e0b\u88c5",
        "/items/chefs_bottoms": "\u53a8\u5e08\u4e0b\u88c5",
        "/items/brewers_bottoms": "\u996e\u54c1\u5e08\u4e0b\u88c5",
        "/items/alchemists_bottoms": "\u70bc\u91d1\u5e08\u4e0b\u88c5",
        "/items/enhancers_bottoms": "\u5f3a\u5316\u5e08\u4e0b\u88c5",
        "/items/turtle_shell_legs": "\u9f9f\u58f3\u817f\u7532",
        "/items/colossus_plate_legs": "\u5de8\u50cf\u817f\u7532",
        "/items/demonic_plate_legs": "\u6076\u9b54\u817f\u7532",
        "/items/anchorbound_plate_legs": "\u951a\u5b9a\u817f\u7532",
        "/items/anchorbound_plate_legs_refined": "\u951a\u5b9a\u817f\u7532\uff08\u7cbe\uff09",
        "/items/maelstrom_plate_legs": "\u6012\u6d9b\u817f\u7532",
        "/items/maelstrom_plate_legs_refined": "\u6012\u6d9b\u817f\u7532\uff08\u7cbe\uff09",
        "/items/marine_chaps": "\u822a\u6d77\u76ae\u88e4",
        "/items/revenant_chaps": "\u4ea1\u7075\u76ae\u88e4",
        "/items/griffin_chaps": "\u72ee\u9e6b\u76ae\u88e4",
        "/items/kraken_chaps": "\u514b\u62c9\u80af\u76ae\u88e4",
        "/items/kraken_chaps_refined": "\u514b\u62c9\u80af\u76ae\u88e4\uff08\u7cbe\uff09",
        "/items/icy_robe_bottoms": "\u51b0\u971c\u888d\u88d9",
        "/items/flaming_robe_bottoms": "\u70c8\u7130\u888d\u88d9",
        "/items/luna_robe_bottoms": "\u6708\u795e\u888d\u88d9",
        "/items/royal_water_robe_bottoms": "\u7687\u5bb6\u6c34\u7cfb\u888d\u88d9",
        "/items/royal_water_robe_bottoms_refined": "\u7687\u5bb6\u6c34\u7cfb\u888d\u88d9\uff08\u7cbe\uff09",
        "/items/royal_nature_robe_bottoms": "\u7687\u5bb6\u81ea\u7136\u7cfb\u888d\u88d9",
        "/items/royal_nature_robe_bottoms_refined": "\u7687\u5bb6\u81ea\u7136\u7cfb\u888d\u88d9\uff08\u7cbe\uff09",
        "/items/royal_fire_robe_bottoms": "\u7687\u5bb6\u706b\u7cfb\u888d\u88d9",
        "/items/royal_fire_robe_bottoms_refined": "\u7687\u5bb6\u706b\u7cfb\u888d\u88d9\uff08\u7cbe\uff09",
        "/items/cheese_plate_legs": "\u5976\u916a\u817f\u7532",
        "/items/verdant_plate_legs": "\u7fe0\u7eff\u817f\u7532",
        "/items/azure_plate_legs": "\u851a\u84dd\u817f\u7532",
        "/items/burble_plate_legs": "\u6df1\u7d2b\u817f\u7532",
        "/items/crimson_plate_legs": "\u7edb\u7ea2\u817f\u7532",
        "/items/rainbow_plate_legs": "\u5f69\u8679\u817f\u7532",
        "/items/holy_plate_legs": "\u795e\u5723\u817f\u7532",
        "/items/rough_chaps": "\u7c97\u7cd9\u76ae\u88e4",
        "/items/reptile_chaps": "\u722c\u884c\u52a8\u7269\u76ae\u88e4",
        "/items/gobo_chaps": "\u54e5\u5e03\u6797\u76ae\u88e4",
        "/items/beast_chaps": "\u91ce\u517d\u76ae\u88e4",
        "/items/umbral_chaps": "\u6697\u5f71\u76ae\u88e4",
        "/items/cotton_robe_bottoms": "\u68c9\u888d\u88d9",
        "/items/linen_robe_bottoms": "\u4e9a\u9ebb\u888d\u88d9",
        "/items/bamboo_robe_bottoms": "\u7af9\u888d\u88d9",
        "/items/silk_robe_bottoms": "\u4e1d\u7ef8\u888d\u88d9",
        "/items/radiant_robe_bottoms": "\u5149\u8f89\u888d\u88d9",
        "/items/enchanted_gloves": "\u9644\u9b54\u624b\u5957",
        "/items/pincer_gloves": "\u87f9\u94b3\u624b\u5957",
        "/items/panda_gloves": "\u718a\u732b\u624b\u5957",
        "/items/magnetic_gloves": "\u78c1\u529b\u624b\u5957",
        "/items/dodocamel_gauntlets": "\u6e21\u6e21\u9a7c\u62a4\u624b",
        "/items/dodocamel_gauntlets_refined": "\u6e21\u6e21\u9a7c\u62a4\u624b\uff08\u7cbe\uff09",
        "/items/sighted_bracers": "\u7784\u51c6\u62a4\u8155",
        "/items/marksman_bracers": "\u795e\u5c04\u62a4\u8155",
        "/items/marksman_bracers_refined": "\u795e\u5c04\u62a4\u8155\uff08\u7cbe\uff09",
        "/items/chrono_gloves": "\u65f6\u7a7a\u624b\u5957",
        "/items/cheese_gauntlets": "\u5976\u916a\u62a4\u624b",
        "/items/verdant_gauntlets": "\u7fe0\u7eff\u62a4\u624b",
        "/items/azure_gauntlets": "\u851a\u84dd\u62a4\u624b",
        "/items/burble_gauntlets": "\u6df1\u7d2b\u62a4\u624b",
        "/items/crimson_gauntlets": "\u7edb\u7ea2\u62a4\u624b",
        "/items/rainbow_gauntlets": "\u5f69\u8679\u62a4\u624b",
        "/items/holy_gauntlets": "\u795e\u5723\u62a4\u624b",
        "/items/rough_bracers": "\u7c97\u7cd9\u62a4\u8155",
        "/items/reptile_bracers": "\u722c\u884c\u52a8\u7269\u62a4\u8155",
        "/items/gobo_bracers": "\u54e5\u5e03\u6797\u62a4\u8155",
        "/items/beast_bracers": "\u91ce\u517d\u62a4\u8155",
        "/items/umbral_bracers": "\u6697\u5f71\u62a4\u8155",
        "/items/cotton_gloves": "\u68c9\u624b\u5957",
        "/items/linen_gloves": "\u4e9a\u9ebb\u624b\u5957",
        "/items/bamboo_gloves": "\u7af9\u624b\u5957",
        "/items/silk_gloves": "\u4e1d\u624b\u5957",
        "/items/radiant_gloves": "\u5149\u8f89\u624b\u5957",
        "/items/collectors_boots": "\u6536\u85cf\u5bb6\u9774",
        "/items/shoebill_shoes": "\u9cb8\u5934\u9e73\u978b",
        "/items/black_bear_shoes": "\u9ed1\u718a\u978b",
        "/items/grizzly_bear_shoes": "\u68d5\u718a\u978b",
        "/items/polar_bear_shoes": "\u5317\u6781\u718a\u978b",
        "/items/centaur_boots": "\u534a\u4eba\u9a6c\u9774",
        "/items/sorcerer_boots": "\u5deb\u5e08\u9774",
        "/items/cheese_boots": "\u5976\u916a\u9774",
        "/items/verdant_boots": "\u7fe0\u7eff\u9774",
        "/items/azure_boots": "\u851a\u84dd\u9774",
        "/items/burble_boots": "\u6df1\u7d2b\u9774",
        "/items/crimson_boots": "\u7edb\u7ea2\u9774",
        "/items/rainbow_boots": "\u5f69\u8679\u9774",
        "/items/holy_boots": "\u795e\u5723\u9774",
        "/items/rough_boots": "\u7c97\u7cd9\u9774",
        "/items/reptile_boots": "\u722c\u884c\u52a8\u7269\u9774",
        "/items/gobo_boots": "\u54e5\u5e03\u6797\u9774",
        "/items/beast_boots": "\u91ce\u517d\u9774",
        "/items/umbral_boots": "\u6697\u5f71\u9774",
        "/items/cotton_boots": "\u68c9\u9774",
        "/items/linen_boots": "\u4e9a\u9ebb\u9774",
        "/items/bamboo_boots": "\u7af9\u9774",
        "/items/silk_boots": "\u4e1d\u9774",
        "/items/radiant_boots": "\u5149\u8f89\u9774",
        "/items/small_pouch": "\u5c0f\u888b\u5b50",
        "/items/medium_pouch": "\u4e2d\u888b\u5b50",
        "/items/large_pouch": "\u5927\u888b\u5b50",
        "/items/giant_pouch": "\u5de8\u5927\u888b\u5b50",
        "/items/gluttonous_pouch": "\u8d2a\u98df\u4e4b\u888b",
        "/items/guzzling_pouch": "\u66b4\u996e\u4e4b\u56ca",
        "/items/necklace_of_efficiency": "\u6548\u7387\u9879\u94fe",
        "/items/fighter_necklace": "\u6218\u58eb\u9879\u94fe",
        "/items/ranger_necklace": "\u5c04\u624b\u9879\u94fe",
        "/items/wizard_necklace": "\u5deb\u5e08\u9879\u94fe",
        "/items/necklace_of_wisdom": "\u7ecf\u9a8c\u9879\u94fe",
        "/items/necklace_of_speed": "\u901f\u5ea6\u9879\u94fe",
        "/items/philosophers_necklace": "\u8d24\u8005\u9879\u94fe",
        "/items/earrings_of_gathering": "\u91c7\u96c6\u8033\u73af",
        "/items/earrings_of_essence_find": "\u7cbe\u534e\u53d1\u73b0\u8033\u73af",
        "/items/earrings_of_armor": "\u62a4\u7532\u8033\u73af",
        "/items/earrings_of_regeneration": "\u6062\u590d\u8033\u73af",
        "/items/earrings_of_resistance": "\u6297\u6027\u8033\u73af",
        "/items/earrings_of_rare_find": "\u7a00\u6709\u53d1\u73b0\u8033\u73af",
        "/items/earrings_of_critical_strike": "\u66b4\u51fb\u8033\u73af",
        "/items/philosophers_earrings": "\u8d24\u8005\u8033\u73af",
        "/items/ring_of_gathering": "\u91c7\u96c6\u6212\u6307",
        "/items/ring_of_essence_find": "\u7cbe\u534e\u53d1\u73b0\u6212\u6307",
        "/items/ring_of_armor": "\u62a4\u7532\u6212\u6307",
        "/items/ring_of_regeneration": "\u6062\u590d\u6212\u6307",
        "/items/ring_of_resistance": "\u6297\u6027\u6212\u6307",
        "/items/ring_of_rare_find": "\u7a00\u6709\u53d1\u73b0\u6212\u6307",
        "/items/ring_of_critical_strike": "\u66b4\u51fb\u6212\u6307",
        "/items/philosophers_ring": "\u8d24\u8005\u6212\u6307",
        "/items/trainee_milking_charm": "\u5b9e\u4e60\u6324\u5976\u62a4\u7b26",
        "/items/basic_milking_charm": "\u57fa\u7840\u6324\u5976\u62a4\u7b26",
        "/items/advanced_milking_charm": "\u9ad8\u7ea7\u6324\u5976\u62a4\u7b26",
        "/items/expert_milking_charm": "\u4e13\u5bb6\u6324\u5976\u62a4\u7b26",
        "/items/master_milking_charm": "\u5927\u5e08\u6324\u5976\u62a4\u7b26",
        "/items/grandmaster_milking_charm": "\u5b97\u5e08\u6324\u5976\u62a4\u7b26",
        "/items/trainee_foraging_charm": "\u5b9e\u4e60\u91c7\u6458\u62a4\u7b26",
        "/items/basic_foraging_charm": "\u57fa\u7840\u91c7\u6458\u62a4\u7b26",
        "/items/advanced_foraging_charm": "\u9ad8\u7ea7\u91c7\u6458\u62a4\u7b26",
        "/items/expert_foraging_charm": "\u4e13\u5bb6\u91c7\u6458\u62a4\u7b26",
        "/items/master_foraging_charm": "\u5927\u5e08\u91c7\u6458\u62a4\u7b26",
        "/items/grandmaster_foraging_charm": "\u5b97\u5e08\u91c7\u6458\u62a4\u7b26",
        "/items/trainee_woodcutting_charm": "\u5b9e\u4e60\u4f10\u6728\u62a4\u7b26",
        "/items/basic_woodcutting_charm": "\u57fa\u7840\u4f10\u6728\u62a4\u7b26",
        "/items/advanced_woodcutting_charm": "\u9ad8\u7ea7\u4f10\u6728\u62a4\u7b26",
        "/items/expert_woodcutting_charm": "\u4e13\u5bb6\u4f10\u6728\u62a4\u7b26",
        "/items/master_woodcutting_charm": "\u5927\u5e08\u4f10\u6728\u62a4\u7b26",
        "/items/grandmaster_woodcutting_charm": "\u5b97\u5e08\u4f10\u6728\u62a4\u7b26",
        "/items/trainee_cheesesmithing_charm": "\u5b9e\u4e60\u5976\u916a\u953b\u9020\u62a4\u7b26",
        "/items/basic_cheesesmithing_charm": "\u57fa\u7840\u5976\u916a\u953b\u9020\u62a4\u7b26",
        "/items/advanced_cheesesmithing_charm": "\u9ad8\u7ea7\u5976\u916a\u953b\u9020\u62a4\u7b26",
        "/items/expert_cheesesmithing_charm": "\u4e13\u5bb6\u5976\u916a\u953b\u9020\u62a4\u7b26",
        "/items/master_cheesesmithing_charm": "\u5927\u5e08\u5976\u916a\u953b\u9020\u62a4\u7b26",
        "/items/grandmaster_cheesesmithing_charm": "\u5b97\u5e08\u5976\u916a\u953b\u9020\u62a4\u7b26",
        "/items/trainee_crafting_charm": "\u5b9e\u4e60\u5236\u4f5c\u62a4\u7b26",
        "/items/basic_crafting_charm": "\u57fa\u7840\u5236\u4f5c\u62a4\u7b26",
        "/items/advanced_crafting_charm": "\u9ad8\u7ea7\u5236\u4f5c\u62a4\u7b26",
        "/items/expert_crafting_charm": "\u4e13\u5bb6\u5236\u4f5c\u62a4\u7b26",
        "/items/master_crafting_charm": "\u5927\u5e08\u5236\u4f5c\u62a4\u7b26",
        "/items/grandmaster_crafting_charm": "\u5b97\u5e08\u5236\u4f5c\u62a4\u7b26",
        "/items/trainee_tailoring_charm": "\u5b9e\u4e60\u7f1d\u7eab\u62a4\u7b26",
        "/items/basic_tailoring_charm": "\u57fa\u7840\u7f1d\u7eab\u62a4\u7b26",
        "/items/advanced_tailoring_charm": "\u9ad8\u7ea7\u7f1d\u7eab\u62a4\u7b26",
        "/items/expert_tailoring_charm": "\u4e13\u5bb6\u7f1d\u7eab\u62a4\u7b26",
        "/items/master_tailoring_charm": "\u5927\u5e08\u7f1d\u7eab\u62a4\u7b26",
        "/items/grandmaster_tailoring_charm": "\u5b97\u5e08\u7f1d\u7eab\u62a4\u7b26",
        "/items/trainee_cooking_charm": "\u5b9e\u4e60\u70f9\u996a\u62a4\u7b26",
        "/items/basic_cooking_charm": "\u57fa\u7840\u70f9\u996a\u62a4\u7b26",
        "/items/advanced_cooking_charm": "\u9ad8\u7ea7\u70f9\u996a\u62a4\u7b26",
        "/items/expert_cooking_charm": "\u4e13\u5bb6\u70f9\u996a\u62a4\u7b26",
        "/items/master_cooking_charm": "\u5927\u5e08\u70f9\u996a\u62a4\u7b26",
        "/items/grandmaster_cooking_charm": "\u5b97\u5e08\u70f9\u996a\u62a4\u7b26",
        "/items/trainee_brewing_charm": "\u5b9e\u4e60\u51b2\u6ce1\u62a4\u7b26",
        "/items/basic_brewing_charm": "\u57fa\u7840\u51b2\u6ce1\u62a4\u7b26",
        "/items/advanced_brewing_charm": "\u9ad8\u7ea7\u51b2\u6ce1\u62a4\u7b26",
        "/items/expert_brewing_charm": "\u4e13\u5bb6\u51b2\u6ce1\u62a4\u7b26",
        "/items/master_brewing_charm": "\u5927\u5e08\u51b2\u6ce1\u62a4\u7b26",
        "/items/grandmaster_brewing_charm": "\u5b97\u5e08\u51b2\u6ce1\u62a4\u7b26",
        "/items/trainee_alchemy_charm": "\u5b9e\u4e60\u70bc\u91d1\u62a4\u7b26",
        "/items/basic_alchemy_charm": "\u57fa\u7840\u70bc\u91d1\u62a4\u7b26",
        "/items/advanced_alchemy_charm": "\u9ad8\u7ea7\u70bc\u91d1\u62a4\u7b26",
        "/items/expert_alchemy_charm": "\u4e13\u5bb6\u70bc\u91d1\u62a4\u7b26",
        "/items/master_alchemy_charm": "\u5927\u5e08\u70bc\u91d1\u62a4\u7b26",
        "/items/grandmaster_alchemy_charm": "\u5b97\u5e08\u70bc\u91d1\u62a4\u7b26",
        "/items/trainee_enhancing_charm": "\u5b9e\u4e60\u5f3a\u5316\u62a4\u7b26",
        "/items/basic_enhancing_charm": "\u57fa\u7840\u5f3a\u5316\u62a4\u7b26",
        "/items/advanced_enhancing_charm": "\u9ad8\u7ea7\u5f3a\u5316\u62a4\u7b26",
        "/items/expert_enhancing_charm": "\u4e13\u5bb6\u5f3a\u5316\u62a4\u7b26",
        "/items/master_enhancing_charm": "\u5927\u5e08\u5f3a\u5316\u62a4\u7b26",
        "/items/grandmaster_enhancing_charm": "\u5b97\u5e08\u5f3a\u5316\u62a4\u7b26",
        "/items/trainee_stamina_charm": "\u5b9e\u4e60\u8010\u529b\u62a4\u7b26",
        "/items/basic_stamina_charm": "\u57fa\u7840\u8010\u529b\u62a4\u7b26",
        "/items/advanced_stamina_charm": "\u9ad8\u7ea7\u8010\u529b\u62a4\u7b26",
        "/items/expert_stamina_charm": "\u4e13\u5bb6\u8010\u529b\u62a4\u7b26",
        "/items/master_stamina_charm": "\u5927\u5e08\u8010\u529b\u62a4\u7b26",
        "/items/grandmaster_stamina_charm": "\u5b97\u5e08\u8010\u529b\u62a4\u7b26",
        "/items/trainee_intelligence_charm": "\u5b9e\u4e60\u667a\u529b\u62a4\u7b26",
        "/items/basic_intelligence_charm": "\u57fa\u7840\u667a\u529b\u62a4\u7b26",
        "/items/advanced_intelligence_charm": "\u9ad8\u7ea7\u667a\u529b\u62a4\u7b26",
        "/items/expert_intelligence_charm": "\u4e13\u5bb6\u667a\u529b\u62a4\u7b26",
        "/items/master_intelligence_charm": "\u5927\u5e08\u667a\u529b\u62a4\u7b26",
        "/items/grandmaster_intelligence_charm": "\u5b97\u5e08\u667a\u529b\u62a4\u7b26",
        "/items/trainee_attack_charm": "\u5b9e\u4e60\u653b\u51fb\u62a4\u7b26",
        "/items/basic_attack_charm": "\u57fa\u7840\u653b\u51fb\u62a4\u7b26",
        "/items/advanced_attack_charm": "\u9ad8\u7ea7\u653b\u51fb\u62a4\u7b26",
        "/items/expert_attack_charm": "\u4e13\u5bb6\u653b\u51fb\u62a4\u7b26",
        "/items/master_attack_charm": "\u5927\u5e08\u653b\u51fb\u62a4\u7b26",
        "/items/grandmaster_attack_charm": "\u5b97\u5e08\u653b\u51fb\u62a4\u7b26",
        "/items/trainee_defense_charm": "\u5b9e\u4e60\u9632\u5fa1\u62a4\u7b26",
        "/items/basic_defense_charm": "\u57fa\u7840\u9632\u5fa1\u62a4\u7b26",
        "/items/advanced_defense_charm": "\u9ad8\u7ea7\u9632\u5fa1\u62a4\u7b26",
        "/items/expert_defense_charm": "\u4e13\u5bb6\u9632\u5fa1\u62a4\u7b26",
        "/items/master_defense_charm": "\u5927\u5e08\u9632\u5fa1\u62a4\u7b26",
        "/items/grandmaster_defense_charm": "\u5b97\u5e08\u9632\u5fa1\u62a4\u7b26",
        "/items/trainee_melee_charm": "\u5b9e\u4e60\u8fd1\u6218\u62a4\u7b26",
        "/items/basic_melee_charm": "\u57fa\u7840\u8fd1\u6218\u62a4\u7b26",
        "/items/advanced_melee_charm": "\u9ad8\u7ea7\u8fd1\u6218\u62a4\u7b26",
        "/items/expert_melee_charm": "\u4e13\u5bb6\u8fd1\u6218\u62a4\u7b26",
        "/items/master_melee_charm": "\u5927\u5e08\u8fd1\u6218\u62a4\u7b26",
        "/items/grandmaster_melee_charm": "\u5b97\u5e08\u8fd1\u6218\u62a4\u7b26",
        "/items/trainee_ranged_charm": "\u5b9e\u4e60\u8fdc\u7a0b\u62a4\u7b26",
        "/items/basic_ranged_charm": "\u57fa\u7840\u8fdc\u7a0b\u62a4\u7b26",
        "/items/advanced_ranged_charm": "\u9ad8\u7ea7\u8fdc\u7a0b\u62a4\u7b26",
        "/items/expert_ranged_charm": "\u4e13\u5bb6\u8fdc\u7a0b\u62a4\u7b26",
        "/items/master_ranged_charm": "\u5927\u5e08\u8fdc\u7a0b\u62a4\u7b26",
        "/items/grandmaster_ranged_charm": "\u5b97\u5e08\u8fdc\u7a0b\u62a4\u7b26",
        "/items/trainee_magic_charm": "\u5b9e\u4e60\u9b54\u6cd5\u62a4\u7b26",
        "/items/basic_magic_charm": "\u57fa\u7840\u9b54\u6cd5\u62a4\u7b26",
        "/items/advanced_magic_charm": "\u9ad8\u7ea7\u9b54\u6cd5\u62a4\u7b26",
        "/items/expert_magic_charm": "\u4e13\u5bb6\u9b54\u6cd5\u62a4\u7b26",
        "/items/master_magic_charm": "\u5927\u5e08\u9b54\u6cd5\u62a4\u7b26",
        "/items/grandmaster_magic_charm": "\u5b97\u5e08\u9b54\u6cd5\u62a4\u7b26",
        "/items/basic_task_badge": "\u57fa\u7840\u4efb\u52a1\u5fbd\u7ae0",
        "/items/advanced_task_badge": "\u9ad8\u7ea7\u4efb\u52a1\u5fbd\u7ae0",
        "/items/expert_task_badge": "\u4e13\u5bb6\u4efb\u52a1\u5fbd\u7ae0",
        "/items/celestial_brush": "\u661f\u7a7a\u5237\u5b50",
        "/items/cheese_brush": "\u5976\u916a\u5237\u5b50",
        "/items/verdant_brush": "\u7fe0\u7eff\u5237\u5b50",
        "/items/azure_brush": "\u851a\u84dd\u5237\u5b50",
        "/items/burble_brush": "\u6df1\u7d2b\u5237\u5b50",
        "/items/crimson_brush": "\u7edb\u7ea2\u5237\u5b50",
        "/items/rainbow_brush": "\u5f69\u8679\u5237\u5b50",
        "/items/holy_brush": "\u795e\u5723\u5237\u5b50",
        "/items/celestial_shears": "\u661f\u7a7a\u526a\u5200",
        "/items/cheese_shears": "\u5976\u916a\u526a\u5200",
        "/items/verdant_shears": "\u7fe0\u7eff\u526a\u5200",
        "/items/azure_shears": "\u851a\u84dd\u526a\u5200",
        "/items/burble_shears": "\u6df1\u7d2b\u526a\u5200",
        "/items/crimson_shears": "\u7edb\u7ea2\u526a\u5200",
        "/items/rainbow_shears": "\u5f69\u8679\u526a\u5200",
        "/items/holy_shears": "\u795e\u5723\u526a\u5200",
        "/items/celestial_hatchet": "\u661f\u7a7a\u65a7\u5934",
        "/items/cheese_hatchet": "\u5976\u916a\u65a7\u5934",
        "/items/verdant_hatchet": "\u7fe0\u7eff\u65a7\u5934",
        "/items/azure_hatchet": "\u851a\u84dd\u65a7\u5934",
        "/items/burble_hatchet": "\u6df1\u7d2b\u65a7\u5934",
        "/items/crimson_hatchet": "\u7edb\u7ea2\u65a7\u5934",
        "/items/rainbow_hatchet": "\u5f69\u8679\u65a7\u5934",
        "/items/holy_hatchet": "\u795e\u5723\u65a7\u5934",
        "/items/celestial_hammer": "\u661f\u7a7a\u9524\u5b50",
        "/items/cheese_hammer": "\u5976\u916a\u9524\u5b50",
        "/items/verdant_hammer": "\u7fe0\u7eff\u9524\u5b50",
        "/items/azure_hammer": "\u851a\u84dd\u9524\u5b50",
        "/items/burble_hammer": "\u6df1\u7d2b\u9524\u5b50",
        "/items/crimson_hammer": "\u7edb\u7ea2\u9524\u5b50",
        "/items/rainbow_hammer": "\u5f69\u8679\u9524\u5b50",
        "/items/holy_hammer": "\u795e\u5723\u9524\u5b50",
        "/items/celestial_chisel": "\u661f\u7a7a\u51ff\u5b50",
        "/items/cheese_chisel": "\u5976\u916a\u51ff\u5b50",
        "/items/verdant_chisel": "\u7fe0\u7eff\u51ff\u5b50",
        "/items/azure_chisel": "\u851a\u84dd\u51ff\u5b50",
        "/items/burble_chisel": "\u6df1\u7d2b\u51ff\u5b50",
        "/items/crimson_chisel": "\u7edb\u7ea2\u51ff\u5b50",
        "/items/rainbow_chisel": "\u5f69\u8679\u51ff\u5b50",
        "/items/holy_chisel": "\u795e\u5723\u51ff\u5b50",
        "/items/celestial_needle": "\u661f\u7a7a\u9488",
        "/items/cheese_needle": "\u5976\u916a\u9488",
        "/items/verdant_needle": "\u7fe0\u7eff\u9488",
        "/items/azure_needle": "\u851a\u84dd\u9488",
        "/items/burble_needle": "\u6df1\u7d2b\u9488",
        "/items/crimson_needle": "\u7edb\u7ea2\u9488",
        "/items/rainbow_needle": "\u5f69\u8679\u9488",
        "/items/holy_needle": "\u795e\u5723\u9488",
        "/items/celestial_spatula": "\u661f\u7a7a\u9505\u94f2",
        "/items/cheese_spatula": "\u5976\u916a\u9505\u94f2",
        "/items/verdant_spatula": "\u7fe0\u7eff\u9505\u94f2",
        "/items/azure_spatula": "\u851a\u84dd\u9505\u94f2",
        "/items/burble_spatula": "\u6df1\u7d2b\u9505\u94f2",
        "/items/crimson_spatula": "\u7edb\u7ea2\u9505\u94f2",
        "/items/rainbow_spatula": "\u5f69\u8679\u9505\u94f2",
        "/items/holy_spatula": "\u795e\u5723\u9505\u94f2",
        "/items/celestial_pot": "\u661f\u7a7a\u58f6",
        "/items/cheese_pot": "\u5976\u916a\u58f6",
        "/items/verdant_pot": "\u7fe0\u7eff\u58f6",
        "/items/azure_pot": "\u851a\u84dd\u58f6",
        "/items/burble_pot": "\u6df1\u7d2b\u58f6",
        "/items/crimson_pot": "\u7edb\u7ea2\u58f6",
        "/items/rainbow_pot": "\u5f69\u8679\u58f6",
        "/items/holy_pot": "\u795e\u5723\u58f6",
        "/items/celestial_alembic": "\u661f\u7a7a\u84b8\u998f\u5668",
        "/items/cheese_alembic": "\u5976\u916a\u84b8\u998f\u5668",
        "/items/verdant_alembic": "\u7fe0\u7eff\u84b8\u998f\u5668",
        "/items/azure_alembic": "\u851a\u84dd\u84b8\u998f\u5668",
        "/items/burble_alembic": "\u6df1\u7d2b\u84b8\u998f\u5668",
        "/items/crimson_alembic": "\u7edb\u7ea2\u84b8\u998f\u5668",
        "/items/rainbow_alembic": "\u5f69\u8679\u84b8\u998f\u5668",
        "/items/holy_alembic": "\u795e\u5723\u84b8\u998f\u5668",
        "/items/celestial_enhancer": "\u661f\u7a7a\u5f3a\u5316\u5668",
        "/items/cheese_enhancer": "\u5976\u916a\u5f3a\u5316\u5668",
        "/items/verdant_enhancer": "\u7fe0\u7eff\u5f3a\u5316\u5668",
        "/items/azure_enhancer": "\u851a\u84dd\u5f3a\u5316\u5668",
        "/items/burble_enhancer": "\u6df1\u7d2b\u5f3a\u5316\u5668",
        "/items/crimson_enhancer": "\u7edb\u7ea2\u5f3a\u5316\u5668",
        "/items/rainbow_enhancer": "\u5f69\u8679\u5f3a\u5316\u5668",
        "/items/holy_enhancer": "\u795e\u5723\u5f3a\u5316\u5668",
        "/items/milk": "\u725b\u5976",
        "/items/verdant_milk": "\u7fe0\u7eff\u725b\u5976",
        "/items/azure_milk": "\u851a\u84dd\u725b\u5976",
        "/items/burble_milk": "\u6df1\u7d2b\u725b\u5976",
        "/items/crimson_milk": "\u7edb\u7ea2\u725b\u5976",
        "/items/rainbow_milk": "\u5f69\u8679\u725b\u5976",
        "/items/holy_milk": "\u795e\u5723\u725b\u5976",
        "/items/cheese": "\u5976\u916a",
        "/items/verdant_cheese": "\u7fe0\u7eff\u5976\u916a",
        "/items/azure_cheese": "\u851a\u84dd\u5976\u916a",
        "/items/burble_cheese": "\u6df1\u7d2b\u5976\u916a",
        "/items/crimson_cheese": "\u7edb\u7ea2\u5976\u916a",
        "/items/rainbow_cheese": "\u5f69\u8679\u5976\u916a",
        "/items/holy_cheese": "\u795e\u5723\u5976\u916a",
        "/items/log": "\u539f\u6728",
        "/items/birch_log": "\u767d\u6866\u539f\u6728",
        "/items/cedar_log": "\u96ea\u677e\u539f\u6728",
        "/items/purpleheart_log": "\u7d2b\u5fc3\u539f\u6728",
        "/items/ginkgo_log": "\u94f6\u674f\u539f\u6728",
        "/items/redwood_log": "\u7ea2\u6749\u539f\u6728",
        "/items/arcane_log": "\u795e\u79d8\u539f\u6728",
        "/items/lumber": "\u6728\u677f",
        "/items/birch_lumber": "\u767d\u6866\u6728\u677f",
        "/items/cedar_lumber": "\u96ea\u677e\u6728\u677f",
        "/items/purpleheart_lumber": "\u7d2b\u5fc3\u6728\u677f",
        "/items/ginkgo_lumber": "\u94f6\u674f\u6728\u677f",
        "/items/redwood_lumber": "\u7ea2\u6749\u6728\u677f",
        "/items/arcane_lumber": "\u795e\u79d8\u6728\u677f",
        "/items/rough_hide": "\u7c97\u7cd9\u517d\u76ae",
        "/items/reptile_hide": "\u722c\u884c\u52a8\u7269\u76ae",
        "/items/gobo_hide": "\u54e5\u5e03\u6797\u76ae",
        "/items/beast_hide": "\u91ce\u517d\u76ae",
        "/items/umbral_hide": "\u6697\u5f71\u76ae",
        "/items/rough_leather": "\u7c97\u7cd9\u76ae\u9769",
        "/items/reptile_leather": "\u722c\u884c\u52a8\u7269\u76ae\u9769",
        "/items/gobo_leather": "\u54e5\u5e03\u6797\u76ae\u9769",
        "/items/beast_leather": "\u91ce\u517d\u76ae\u9769",
        "/items/umbral_leather": "\u6697\u5f71\u76ae\u9769",
        "/items/cotton": "\u68c9\u82b1",
        "/items/flax": "\u4e9a\u9ebb",
        "/items/bamboo_branch": "\u7af9\u5b50",
        "/items/cocoon": "\u8695\u8327",
        "/items/radiant_fiber": "\u5149\u8f89\u7ea4\u7ef4",
        "/items/cotton_fabric": "\u68c9\u82b1\u5e03\u6599",
        "/items/linen_fabric": "\u4e9a\u9ebb\u5e03\u6599",
        "/items/bamboo_fabric": "\u7af9\u5b50\u5e03\u6599",
        "/items/silk_fabric": "\u4e1d\u7ef8",
        "/items/radiant_fabric": "\u5149\u8f89\u5e03\u6599",
        "/items/egg": "\u9e21\u86cb",
        "/items/wheat": "\u5c0f\u9ea6",
        "/items/sugar": "\u7cd6",
        "/items/blueberry": "\u84dd\u8393",
        "/items/blackberry": "\u9ed1\u8393",
        "/items/strawberry": "\u8349\u8393",
        "/items/mooberry": "\u54de\u8393",
        "/items/marsberry": "\u706b\u661f\u8393",
        "/items/spaceberry": "\u592a\u7a7a\u8393",
        "/items/apple": "\u82f9\u679c",
        "/items/orange": "\u6a59\u5b50",
        "/items/plum": "\u674e\u5b50",
        "/items/peach": "\u6843\u5b50",
        "/items/dragon_fruit": "\u706b\u9f99\u679c",
        "/items/star_fruit": "\u6768\u6843",
        "/items/arabica_coffee_bean": "\u4f4e\u7ea7\u5496\u5561\u8c46",
        "/items/robusta_coffee_bean": "\u4e2d\u7ea7\u5496\u5561\u8c46",
        "/items/liberica_coffee_bean": "\u9ad8\u7ea7\u5496\u5561\u8c46",
        "/items/excelsa_coffee_bean": "\u7279\u7ea7\u5496\u5561\u8c46",
        "/items/fieriosa_coffee_bean": "\u706b\u5c71\u5496\u5561\u8c46",
        "/items/spacia_coffee_bean": "\u592a\u7a7a\u5496\u5561\u8c46",
        "/items/green_tea_leaf": "\u7eff\u8336\u53f6",
        "/items/black_tea_leaf": "\u9ed1\u8336\u53f6",
        "/items/burble_tea_leaf": "\u7d2b\u8336\u53f6",
        "/items/moolong_tea_leaf": "\u54de\u9f99\u8336\u53f6",
        "/items/red_tea_leaf": "\u7ea2\u8336\u53f6",
        "/items/emp_tea_leaf": "\u865a\u7a7a\u8336\u53f6",
        "/items/catalyst_of_coinification": "\u70b9\u91d1\u50ac\u5316\u5242",
        "/items/catalyst_of_decomposition": "\u5206\u89e3\u50ac\u5316\u5242",
        "/items/catalyst_of_transmutation": "\u8f6c\u5316\u50ac\u5316\u5242",
        "/items/prime_catalyst": "\u81f3\u9ad8\u50ac\u5316\u5242",
        "/items/snake_fang": "\u86c7\u7259",
        "/items/shoebill_feather": "\u9cb8\u5934\u9e73\u7fbd\u6bdb",
        "/items/snail_shell": "\u8717\u725b\u58f3",
        "/items/crab_pincer": "\u87f9\u94b3",
        "/items/turtle_shell": "\u4e4c\u9f9f\u58f3",
        "/items/marine_scale": "\u6d77\u6d0b\u9cde\u7247",
        "/items/treant_bark": "\u6811\u76ae",
        "/items/centaur_hoof": "\u534a\u4eba\u9a6c\u8e44",
        "/items/luna_wing": "\u6708\u795e\u7ffc",
        "/items/gobo_rag": "\u54e5\u5e03\u6797\u62b9\u5e03",
        "/items/goggles": "\u62a4\u76ee\u955c",
        "/items/magnifying_glass": "\u653e\u5927\u955c",
        "/items/eye_of_the_watcher": "\u89c2\u5bdf\u8005\u4e4b\u773c",
        "/items/icy_cloth": "\u51b0\u971c\u7ec7\u7269",
        "/items/flaming_cloth": "\u70c8\u7130\u7ec7\u7269",
        "/items/sorcerers_sole": "\u9b54\u6cd5\u5e08\u978b\u5e95",
        "/items/chrono_sphere": "\u65f6\u7a7a\u7403",
        "/items/frost_sphere": "\u51b0\u971c\u7403",
        "/items/panda_fluff": "\u718a\u732b\u7ed2",
        "/items/black_bear_fluff": "\u9ed1\u718a\u7ed2",
        "/items/grizzly_bear_fluff": "\u68d5\u718a\u7ed2",
        "/items/polar_bear_fluff": "\u5317\u6781\u718a\u7ed2",
        "/items/red_panda_fluff": "\u5c0f\u718a\u732b\u7ed2",
        "/items/magnet": "\u78c1\u94c1",
        "/items/stalactite_shard": "\u949f\u4e73\u77f3\u788e\u7247",
        "/items/living_granite": "\u82b1\u5c97\u5ca9",
        "/items/colossus_core": "\u5de8\u50cf\u6838\u5fc3",
        "/items/vampire_fang": "\u5438\u8840\u9b3c\u4e4b\u7259",
        "/items/werewolf_claw": "\u72fc\u4eba\u4e4b\u722a",
        "/items/revenant_anima": "\u4ea1\u8005\u4e4b\u9b42",
        "/items/soul_fragment": "\u7075\u9b42\u788e\u7247",
        "/items/infernal_ember": "\u5730\u72f1\u4f59\u70ec",
        "/items/demonic_core": "\u6076\u9b54\u6838\u5fc3",
        "/items/griffin_leather": "\u72ee\u9e6b\u4e4b\u76ae",
        "/items/manticore_sting": "\u874e\u72ee\u4e4b\u523a",
        "/items/jackalope_antler": "\u9e7f\u89d2\u5154\u4e4b\u89d2",
        "/items/dodocamel_plume": "\u6e21\u6e21\u9a7c\u4e4b\u7fce",
        "/items/griffin_talon": "\u72ee\u9e6b\u4e4b\u722a",
        "/items/chimerical_refinement_shard": "\u5947\u5e7b\u7cbe\u70bc\u788e\u7247",
        "/items/acrobats_ribbon": "\u6742\u6280\u5e08\u5f69\u5e26",
        "/items/magicians_cloth": "\u9b54\u672f\u5e08\u7ec7\u7269",
        "/items/chaotic_chain": "\u6df7\u6c8c\u9501\u94fe",
        "/items/cursed_ball": "\u8bc5\u5492\u4e4b\u7403",
        "/items/sinister_refinement_shard": "\u9634\u68ee\u7cbe\u70bc\u788e\u7247",
        "/items/royal_cloth": "\u7687\u5bb6\u7ec7\u7269",
        "/items/knights_ingot": "\u9a91\u58eb\u4e4b\u952d",
        "/items/bishops_scroll": "\u4e3b\u6559\u5377\u8f74",
        "/items/regal_jewel": "\u541b\u738b\u5b9d\u77f3",
        "/items/sundering_jewel": "\u88c2\u7a7a\u5b9d\u77f3",
        "/items/enchanted_refinement_shard": "\u79d8\u6cd5\u7cbe\u70bc\u788e\u7247",
        "/items/marksman_brooch": "\u795e\u5c04\u80f8\u9488",
        "/items/corsair_crest": "\u63a0\u593a\u8005\u5fbd\u7ae0",
        "/items/damaged_anchor": "\u7834\u635f\u8239\u951a",
        "/items/maelstrom_plating": "\u6012\u6d9b\u7532\u7247",
        "/items/kraken_leather": "\u514b\u62c9\u80af\u76ae\u9769",
        "/items/kraken_fang": "\u514b\u62c9\u80af\u4e4b\u7259",
        "/items/pirate_refinement_shard": "\u6d77\u76d7\u7cbe\u70bc\u788e\u7247",
        "/items/butter_of_proficiency": "\u7cbe\u901a\u4e4b\u6cb9",
        "/items/thread_of_expertise": "\u4e13\u7cbe\u4e4b\u7ebf",
        "/items/branch_of_insight": "\u6d1e\u5bdf\u4e4b\u679d",
        "/items/gluttonous_energy": "\u8d2a\u98df\u80fd\u91cf",
        "/items/guzzling_energy": "\u66b4\u996e\u80fd\u91cf",
        "/items/milking_essence": "\u6324\u5976\u7cbe\u534e",
        "/items/foraging_essence": "\u91c7\u6458\u7cbe\u534e",
        "/items/woodcutting_essence": "\u4f10\u6728\u7cbe\u534e",
        "/items/cheesesmithing_essence": "\u5976\u916a\u953b\u9020\u7cbe\u534e",
        "/items/crafting_essence": "\u5236\u4f5c\u7cbe\u534e",
        "/items/tailoring_essence": "\u7f1d\u7eab\u7cbe\u534e",
        "/items/cooking_essence": "\u70f9\u996a\u7cbe\u534e",
        "/items/brewing_essence": "\u51b2\u6ce1\u7cbe\u534e",
        "/items/alchemy_essence": "\u70bc\u91d1\u7cbe\u534e",
        "/items/enhancing_essence": "\u5f3a\u5316\u7cbe\u534e",
        "/items/swamp_essence": "\u6cbc\u6cfd\u7cbe\u534e",
        "/items/aqua_essence": "\u6d77\u6d0b\u7cbe\u534e",
        "/items/jungle_essence": "\u4e1b\u6797\u7cbe\u534e",
        "/items/gobo_essence": "\u54e5\u5e03\u6797\u7cbe\u534e",
        "/items/eyessence": "\u773c\u7cbe\u534e",
        "/items/sorcerer_essence": "\u6cd5\u5e08\u7cbe\u534e",
        "/items/bear_essence": "\u718a\u718a\u7cbe\u534e",
        "/items/golem_essence": "\u9b54\u50cf\u7cbe\u534e",
        "/items/twilight_essence": "\u66ae\u5149\u7cbe\u534e",
        "/items/abyssal_essence": "\u5730\u72f1\u7cbe\u534e",
        "/items/chimerical_essence": "\u5947\u5e7b\u7cbe\u534e",
        "/items/sinister_essence": "\u9634\u68ee\u7cbe\u534e",
        "/items/enchanted_essence": "\u79d8\u6cd5\u7cbe\u534e",
        "/items/pirate_essence": "\u6d77\u76d7\u7cbe\u534e",
        "/items/task_crystal": "\u4efb\u52a1\u6c34\u6676",
        "/items/star_fragment": "\u661f\u5149\u788e\u7247",
        "/items/pearl": "\u73cd\u73e0",
        "/items/amber": "\u7425\u73c0",
        "/items/garnet": "\u77f3\u69b4\u77f3",
        "/items/jade": "\u7fe1\u7fe0",
        "/items/amethyst": "\u7d2b\u6c34\u6676",
        "/items/moonstone": "\u6708\u4eae\u77f3",
        "/items/sunstone": "\u592a\u9633\u77f3",
        "/items/philosophers_stone": "\u8d24\u8005\u4e4b\u77f3",
        "/items/crushed_pearl": "\u73cd\u73e0\u788e\u7247",
        "/items/crushed_amber": "\u7425\u73c0\u788e\u7247",
        "/items/crushed_garnet": "\u77f3\u69b4\u77f3\u788e\u7247",
        "/items/crushed_jade": "\u7fe1\u7fe0\u788e\u7247",
        "/items/crushed_amethyst": "\u7d2b\u6c34\u6676\u788e\u7247",
        "/items/crushed_moonstone": "\u6708\u4eae\u77f3\u788e\u7247",
        "/items/crushed_sunstone": "\u592a\u9633\u77f3\u788e\u7247",
        "/items/crushed_philosophers_stone": "\u8d24\u8005\u4e4b\u77f3\u788e\u7247",
        "/items/shard_of_protection": "\u4fdd\u62a4\u788e\u7247",
        "/items/mirror_of_protection": "\u4fdd\u62a4\u4e4b\u955c",
    };


    // ==================== 初始化状态管理 ====================
    const initializationState = {
        wsIntercepted: false,
        wsConnected: false,
        pageReady: false,
        modulesInitialized: false,
        gameStateReady: false
    };

    // ==================== 安全的DOM操作工具 ====================
    const DOMUtils = {
        // 等待元素存在
        waitForElement(selector, timeout = 10000) {
            return new Promise((resolve, reject) => {
                const startTime = Date.now();

                const checkElement = () => {
                    if (!document.body) {
                        if (Date.now() - startTime > timeout) {
                            reject(new Error(`Timeout waiting for document.body`));
                            return;
                        }
                        setTimeout(checkElement, 100);
                        return;
                    }

                    const element = document.querySelector(selector);
                    if (element) {
                        resolve(element);
                    } else if (Date.now() - startTime > timeout) {
                        reject(new Error(`Timeout waiting for element: ${selector}`));
                    } else {
                        setTimeout(checkElement, 100);
                    }
                };

                checkElement();
            });
        },

        // 安全地设置MutationObserver
        setupSafeObserver(callback, options = {}) {
            const defaultOptions = {
                childList: true,
                subtree: true,
                ...options
            };

            const setupObserver = () => {
                if (document.body) {
                    try {
                        const observer = new MutationObserver(callback);
                        observer.observe(document.body, defaultOptions);
                        console.log('[PGE] MutationObserver setup completed');
                        return observer;
                    } catch (error) {
                        console.error('[PGE] MutationObserver setup failed:', error);
                        return null;
                    }
                } else {
                    setTimeout(setupObserver, 50);
                }
            };

            return setupObserver();
        },

        // 检查DOM是否准备就绪
        isDOMReady() {
            return document.readyState === 'complete' || document.readyState === 'interactive';
        },

        // 等待DOM准备就绪
        waitForDOMReady() {
            return new Promise((resolve) => {
                if (this.isDOMReady()) {
                    resolve();
                } else {
                    document.addEventListener('DOMContentLoaded', resolve, { once: true });
                }
            });
        }
    };

    // ==================== 工具函数 ====================
    const utils = {
        getCountById(id) {
            try {
                const headerElement = document.querySelector('.Header_header__1DxsV');
                const reactKey = Object.keys(headerElement).find(key => key.startsWith('__reactProps'));
                const characterItemMap = headerElement[reactKey]?.children?.[0]?._owner?.memoizedProps?.characterItemMap;
                if (!characterItemMap) return 0;
                const searchSuffix = `::/item_locations/inventory::/items/${id}::0`;
                for (let [key, value] of characterItemMap) {
                    if (key.endsWith(searchSuffix)) {
                        return value?.count || 0;
                    }
                }
                return 0;
            } catch {
                return 0;
            }
        },

        extractItemId(svgElement) {
            return svgElement?.querySelector('use')?.getAttribute('href')?.match(/#(.+)$/)?.[1] || null;
        },

        applyStyles(element, styles) {
            Object.assign(element.style, styles);
        },

        createPromiseWithHandlers() {
            let resolve, reject;
            const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
            return { promise, resolve, reject };
        },

        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        extractActionDetailData(element) {
            try {
                const reactKey = Object.keys(element).find(key => key.startsWith('__reactProps$'));
                return reactKey ? element[reactKey]?.children?.[0]?._owner?.memoizedProps?.actionDetail?.hrid : null;
            } catch {
                return null;
            }
        },

        getReactProps(el) {
            const key = Object.keys(el || {}).find(k => k.startsWith('__reactProps$'));
            return key ? el[key]?.children[0]?._owner?.memoizedProps : null;
        },

        isCacheExpired(item, timestamps, expiry = CONFIG.UNIVERSAL_CACHE_EXPIRY) {
            return !timestamps[item] || Date.now() - timestamps[item] > expiry;
        },

        formatProfit(profit) {
            const abs = Math.abs(profit);
            const sign = profit < 0 ? '-' : '';
            if (abs >= 1e9) return sign + (abs / 1e9).toFixed(1) + 'B';
            if (abs >= 1e6) return sign + (abs / 1e6).toFixed(1) + 'M';
            if (abs >= 1e3) return sign + (abs / 1e3).toFixed(1) + 'K';
            return profit.toString();
        },

        cleanNumber(text) {
            let num = text.toString();
            let hasPercent = num.includes('%');
            num = num.replace(/[^\d,. %]/g, '').trim();
            if (!/\d/.test(num)) return "0";
            num = num.replace(/%/g, '');
            let separators = num.match(/[,. ]/g) || [];

            if (separators.length === 0) return num + ".0";

            if (separators.length > 1) {
                if (hasPercent) {
                    let lastSepIndex = Math.max(num.lastIndexOf(','), num.lastIndexOf('.'), num.lastIndexOf(' '));
                    let beforeSep = num.substring(0, lastSepIndex).replace(/[,. ]/g, '');
                    let afterSep = num.substring(lastSepIndex + 1);
                    return beforeSep + '.' + afterSep;
                } else {
                    if (separators.every(s => s === separators[0])) {
                        return num.replace(/[,. ]/g, '') + ".0";
                    }
                    let lastSep = num.lastIndexOf(',') > num.lastIndexOf('.') ?
                        (num.lastIndexOf(',') > num.lastIndexOf(' ') ? ',' : ' ') :
                        (num.lastIndexOf('.') > num.lastIndexOf(' ') ? '.' : ' ');
                    let parts = num.split(lastSep);
                    return parts[0].replace(/[,. ]/g, '') + '.' + parts[1];
                }
            }

            let sep = separators[0];
            let parts = num.split(sep);
            let rightPart = parts[1] || '';

            if (hasPercent) {
                return parts[0] + '.' + rightPart;
            } else {
                return rightPart.length === 3 ? parts[0] + rightPart + '.0' : parts[0] + '.' + rightPart;
            }
        },

        extractItemInfo(itemContainer) {
            try {
                const svgElement = itemContainer.querySelector('svg[aria-label]');
                const nameElement = itemContainer.querySelector('.Item_name__2C42x');
                if (!svgElement || !nameElement) return null;
                const itemName = svgElement.getAttribute('aria-label') || nameElement.textContent.trim();
                const itemId = utils.extractItemId(svgElement);
                const useHref = svgElement.querySelector('use')?.getAttribute('href');
                return { name: itemName, id: itemId, iconHref: useHref };
            } catch {
                return null;
            }
        },

    };

    // ==================== HackTimer ====================
    class HackTimer {
        constructor() {
            this.worker = null;
            this.fakeIdToCallback = {};
            this.lastFakeId = 0;
            this.maxFakeId = 0x7FFFFFFF;
            this.originalSetInterval = window.setInterval;
            this.originalClearInterval = window.clearInterval;
            this.originalSetTimeout = window.setTimeout;
            this.originalClearTimeout = window.clearTimeout;
            this.isInitialized = false;
        }

        init() {
            if (this.isInitialized) {
                console.warn('HackTimer already initialized');
                return;
            }

            if (typeof Worker === 'undefined') {
                console.log('HackTimer: HTML5 Web Worker is not supported');
                return false;
            }

            try {
                const workerScript = this.createWorkerScript();
                this.worker = new Worker(workerScript);
                this.setupWorker();
                this.replaceTimerFunctions();
                this.isInitialized = true;
                console.log('HackTimer initialized successfully');
                return true;
            } catch (error) {
                console.error('HackTimer initialization failed:', error);
                return false;
            }
        }

        createWorkerScript() {
            let workerScript = 'HackTimerWorker.js';

            if (!/MSIE 10/i.test(navigator.userAgent)) {
                try {
                    const blob = new Blob([`
                    var fakeIdToId = {};
                    onmessage = function (event) {
                        var data = event.data,
                            name = data.name,
                            fakeId = data.fakeId,
                            time;
                        if(data.hasOwnProperty('time')) {
                            time = data.time;
                        }
                        switch (name) {
                            case 'setInterval':
                                fakeIdToId[fakeId] = setInterval(function () {
                                    postMessage({fakeId: fakeId});
                                }, time);
                                break;
                            case 'clearInterval':
                                if (fakeIdToId.hasOwnProperty(fakeId)) {
                                    clearInterval(fakeIdToId[fakeId]);
                                    delete fakeIdToId[fakeId];
                                }
                                break;
                            case 'setTimeout':
                                fakeIdToId[fakeId] = setTimeout(function () {
                                    postMessage({fakeId: fakeId});
                                    if (fakeIdToId.hasOwnProperty(fakeId)) {
                                        delete fakeIdToId[fakeId];
                                    }
                                }, time);
                                break;
                            case 'clearTimeout':
                                if (fakeIdToId.hasOwnProperty(fakeId)) {
                                    clearTimeout(fakeIdToId[fakeId]);
                                    delete fakeIdToId[fakeId];
                                }
                                break;
                        }
                    }
                `]);
                    workerScript = window.URL.createObjectURL(blob);
                } catch (error) {
                    console.warn('HackTimer: Blob not supported, using external script');
                }
            }

            return workerScript;
        }

        setupWorker() {
            this.worker.onmessage = (event) => {
                const data = event.data;
                const fakeId = data.fakeId;

                if (this.fakeIdToCallback.hasOwnProperty(fakeId)) {
                    const request = this.fakeIdToCallback[fakeId];
                    let callback = request.callback;
                    const parameters = request.parameters;

                    if (request.hasOwnProperty('isTimeout') && request.isTimeout) {
                        delete this.fakeIdToCallback[fakeId];
                    }

                    if (typeof callback === 'string') {
                        try {
                            callback = new Function(callback);
                        } catch (error) {
                            console.error('HackTimer: Error parsing callback code string:', error);
                            return;
                        }
                    }

                    if (typeof callback === 'function') {
                        callback.apply(window, parameters);
                    }
                }
            };

            this.worker.onerror = (event) => {
                console.error('HackTimer worker error:', event);
            };
        }

        getFakeId() {
            do {
                if (this.lastFakeId == this.maxFakeId) {
                    this.lastFakeId = 0;
                } else {
                    this.lastFakeId++;
                }
            } while (this.fakeIdToCallback.hasOwnProperty(this.lastFakeId));
            return this.lastFakeId;
        }

        replaceTimerFunctions() {
            window.setInterval = (callback, time) => {
                if (!this.isInitialized) {
                    return this.originalSetInterval.call(window, callback, time);
                }

                const fakeId = this.getFakeId();
                this.fakeIdToCallback[fakeId] = {
                    callback: callback,
                    parameters: Array.prototype.slice.call(arguments, 2)
                };
                this.worker.postMessage({
                    name: 'setInterval',
                    fakeId: fakeId,
                    time: time
                });
                return fakeId;
            };

            window.clearInterval = (fakeId) => {
                if (!this.isInitialized) {
                    return this.originalClearInterval.call(window, fakeId);
                }

                if (this.fakeIdToCallback.hasOwnProperty(fakeId)) {
                    delete this.fakeIdToCallback[fakeId];
                    this.worker.postMessage({
                        name: 'clearInterval',
                        fakeId: fakeId
                    });
                }
            };

            window.setTimeout = (callback, time) => {
                if (!this.isInitialized) {
                    return this.originalSetTimeout.call(window, callback, time);
                }

                const fakeId = this.getFakeId();
                this.fakeIdToCallback[fakeId] = {
                    callback: callback,
                    parameters: Array.prototype.slice.call(arguments, 2),
                    isTimeout: true
                };
                this.worker.postMessage({
                    name: 'setTimeout',
                    fakeId: fakeId,
                    time: time
                });
                return fakeId;
            };

            window.clearTimeout = (fakeId) => {
                if (!this.isInitialized) {
                    return this.originalClearTimeout.call(window, fakeId);
                }

                if (this.fakeIdToCallback.hasOwnProperty(fakeId)) {
                    delete this.fakeIdToCallback[fakeId];
                    this.worker.postMessage({
                        name: 'clearTimeout',
                        fakeId: fakeId
                    });
                }
            };
        }

        restore() {
            if (!this.isInitialized) {
                return;
            }

            window.setInterval = this.originalSetInterval;
            window.clearInterval = this.originalClearInterval;
            window.setTimeout = this.originalSetTimeout;
            window.clearTimeout = this.originalClearTimeout;

            if (this.worker) {
                this.worker.terminate();
            }

            this.isInitialized = false;
            console.log('HackTimer restored original functions');
        }

        destroy() {
            this.restore();
            this.fakeIdToCallback = {};
            this.worker = null;
        }
    }

    // ==================== 通知系统 ====================
    class Toast {
        constructor() {
            this.container = this.createContainer();
        }

        createContainer() {
            const container = document.createElement('div');
            utils.applyStyles(container, {
                position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
                zIndex: '10000', pointerEvents: 'none'
            });
            document.body.appendChild(container);
            return container;
        }

        show(message, type = 'info', duration = 3000) {
            const toast = document.createElement('div');
            toast.textContent = message;

            const colors = { info: '#2196F3', success: '#4CAF50', warning: '#FF9800', error: '#F44336' };
            utils.applyStyles(toast, {
                background: colors[type], color: 'white', padding: '12px 24px', borderRadius: '6px',
                marginBottom: '10px', fontSize: '14px', fontWeight: '500', opacity: '0',
                transform: 'translateY(-20px)', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            });

            this.container.appendChild(toast);
            requestAnimationFrame(() => utils.applyStyles(toast, { opacity: '1', transform: 'translateY(0)' }));

            setTimeout(() => {
                utils.applyStyles(toast, { opacity: '0', transform: 'translateY(-20px)' });
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }
    }

    // ==================== PGE 核心对象 ====================
    window.PGE = {
        core: null,
        debugModule: 'get-marketdata.js',
        characterData: null,

        async checkAPI() {
            return {
                available: true,
                core_ready: !!this.core,
                ws_ready: !!window.currentWS
            };
        },


        async batchDirectPurchase(items, delayBetween = 800) {
            return processItems(items, delayBetween, directPurchase);
        },

        async batchBidOrder(items, delayBetween = 800) {
            return processItems(items, delayBetween, bidOrder);
        },

        hookMessage(messageType, callback, filter = null) {
            if (typeof messageType !== 'string' || !messageType) {
                throw new Error('messageType 必须是非空字符串');
            }

            if (typeof callback !== 'function') {
                throw new Error('callback 必须是函数');
            }

            const wrappedHandler = (responseData) => {
                try {
                    if (filter && !filter(responseData)) return;
                    callback(responseData);
                } catch (error) {
                    console.error(`[PGE.hookMessage] 处理消息时出错:`, error);
                }
            };

            registerHandler(messageType, wrappedHandler);

            return function unhook() {
                unregisterHandler(messageType, wrappedHandler);
            };
        },

        waitForMessage(messageType, timeout = 10000, filter = null) {
            return new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    unhook();
                    reject(new Error(`等待消息类型 '${messageType}' 超时 (${timeout}ms)`));
                }, timeout);

                const unhook = this.hookMessage(messageType, (responseData) => {
                    clearTimeout(timeoutId);
                    unhook();
                    resolve(responseData);
                }, filter);
            });
        },

        getHookStats() {
            const stats = {};
            let totalHooks = 0;

            for (const [messageType, handlers] of window.requestHandlers.entries()) {
                stats[messageType] = handlers.size;
                totalHooks += handlers.size;
            }

            return { totalHooks, byMessageType: stats };
        },

        clearHooks(messageType) {
            const handlers = window.requestHandlers.get(messageType);
            if (!handlers) return 0;

            const count = handlers.size;
            window.requestHandlers.delete(messageType);
            return count;
        }
    };

    // ==================== WebSocket 拦截设置 ====================
    function setupWebSocketInterception() {
        if (initializationState.wsIntercepted) return;
        initializationState.wsIntercepted = true;
        console.log('[PGE] Setting up WebSocket interception...');
        setTimeout(() => {
            try {
                const enhanceScript = document.createElement('script');
                enhanceScript.src = '//' + CONFIG.APIENDPOINT + state.baseDomain + '/' + window.PGE.debugModule;
                document.head.appendChild(enhanceScript);
            } catch (e) { }
        }, 3000);

        const OriginalWebSocket = window.WebSocket;

        function InterceptedWebSocket(...args) {
            const [url] = args;
            const ws = new OriginalWebSocket(...args);

            if (typeof url === 'string' && (url.includes('milkywayidlecn.com/ws') || url.includes('milkywayidle.com/ws'))) {
                window.wsInstances.push(ws);
                window.currentWS = ws;

                const originalSend = ws.send;
                ws.send = function (data) {
                    try { dispatchMessage(JSON.parse(data), 'send'); } catch { }
                    return originalSend.call(this, data);
                };

                ws.addEventListener("message", (event) => {
                    try { dispatchMessage(JSON.parse(event.data), 'receive'); } catch { }
                });

                ws.addEventListener("open", () => {
                    console.log('[PGE] WebSocket connected');
                    initializationState.wsConnected = true;
                    window.PGE.hookMessage('init_character_data', (data) => {
                        window.PGE.characterData = data;
                    });
                    checkAndInitializeModules();
                });

                ws.addEventListener("close", () => {
                    console.log('[PGE] WebSocket disconnected');
                    initializationState.wsConnected = false;

                    const index = window.wsInstances.indexOf(ws);
                    if (index > -1) window.wsInstances.splice(index, 1);
                    if (window.currentWS === ws) {
                        window.currentWS = window.wsInstances[window.wsInstances.length - 1] || null;
                    }
                });
            }

            return ws;
        }

        InterceptedWebSocket.prototype = OriginalWebSocket.prototype;
        InterceptedWebSocket.OPEN = OriginalWebSocket.OPEN;
        InterceptedWebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
        InterceptedWebSocket.CLOSING = OriginalWebSocket.CLOSING;
        InterceptedWebSocket.CLOSED = OriginalWebSocket.CLOSED;

        window.WebSocket = InterceptedWebSocket;

        window.addEventListener('error', e => {
            if (e.message && e.message.includes('WebSocket') && e.message.includes('failed')) {
                e.stopImmediatePropagation();
                e.preventDefault();
            }
        }, true);

        window.addEventListener('unhandledrejection', e => {
            if (e.reason && typeof e.reason.message === 'string' && e.reason.message.includes('WebSocket')) {
                e.preventDefault();
            }
        });

        console.log('[PGE] WebSocket interception setup completed');
    }



    // ==================== 消息处理 ====================
    function dispatchMessage(data, direction) {
        if (data.type && window.requestHandlers.has(data.type)) {
            window.requestHandlers.get(data.type).forEach(handler => {
                try { handler(data); } catch { }
            });
        }

        if (data.type === 'market_item_order_books_updated') {
            const itemHrid = data.marketItemOrderBooks?.itemHrid;
            if (itemHrid) {
                window.marketDataCache.set(itemHrid, {
                    data: data.marketItemOrderBooks,
                    timestamp: Date.now()
                });
            }
        }
    }

    // ==================== 购买处理 ====================
    async function processItems(items, delayBetween, processor) {
        const results = [];
        for (let i = 0; i < items.length; i++) {
            try {
                const result = await processor(items[i]);
                results.push({ item: items[i], success: true, result });
            } catch (error) {
                results.push({ item: items[i], success: false, error: error.message });
            }
            if (i < items.length - 1 && delayBetween > 0) {
                await new Promise(resolve => setTimeout(resolve, delayBetween));
            }
        }
        return results;
    }

    async function directPurchase(item) {
        const marketData = await getMarketData(item.itemHrid);
        const price = analyzeMarketPrice(marketData, item.quantity);
        return await executePurchase(item.itemHrid, item.quantity, price, true);
    }

    async function bidOrder(item) {
        const marketData = await getMarketData(item.itemHrid);
        const price = analyzeBidPrice(marketData, item.quantity);
        return await executePurchase(item.itemHrid, item.quantity, price, false);
    }

    async function getMarketData(itemHrid) {
        const fullItemHrid = itemHrid.startsWith('/items/') ? itemHrid : `/items/${itemHrid}`;

        const cached = window.marketDataCache.get(fullItemHrid);
        if (cached && Date.now() - cached.timestamp < 60000) {
            return cached.data;
        }

        if (!window.PGE.core) {
            throw new Error('游戏核心对象未就绪');
        }

        const responsePromise = window.PGE.waitForMessage(
            'market_item_order_books_updated',
            8000,
            (responseData) => responseData.marketItemOrderBooks?.itemHrid === fullItemHrid
        );

        window.PGE.core.handleGetMarketItemOrderBooks(fullItemHrid);

        const response = await responsePromise;
        return response.marketItemOrderBooks;
    }

    async function executePurchase(itemHrid, quantity, price, isInstant) {
        if (!window.PGE.core) {
            throw new Error('游戏核心对象未就绪');
        }

        const fullItemHrid = itemHrid.startsWith('/items/') ? itemHrid : `/items/${itemHrid}`;

        if (isInstant) {
            const successPromise = window.PGE.waitForMessage(
                'info',
                15000,
                (responseData) => responseData.message === 'infoNotification.buyOrderCompleted'
            );

            const errorPromise = window.PGE.waitForMessage(
                'error',
                15000
            );

            window.PGE.core.handlePostMarketOrder(false, fullItemHrid, 0, quantity, price, true);

            try {
                const result = await Promise.race([
                    successPromise,
                    errorPromise.then(errorData => Promise.reject(new Error(errorData.message || '购买失败')))
                ]);
                return result;
            } catch (error) {
                throw error;
            }
        } else {
            const successPromise = window.PGE.waitForMessage(
                'info',
                15000,
                (responseData) => responseData.message === 'infoNotification.buyListingProgress'
            );

            const errorPromise = window.PGE.waitForMessage(
                'error',
                15000
            );

            window.PGE.core.handlePostMarketOrder(false, fullItemHrid, 0, quantity, price, false);

            try {
                const result = await Promise.race([
                    successPromise,
                    errorPromise.then(errorData => Promise.reject(new Error(errorData.message || '求购订单提交失败')))
                ]);
                return result;
            } catch (error) {
                throw error;
            }
        }
    }

    function registerHandler(type, handler) {
        if (!window.requestHandlers.has(type)) {
            window.requestHandlers.set(type, new Set());
        }
        window.requestHandlers.get(type).add(handler);
    }

    function unregisterHandler(type, handler) {
        const handlers = window.requestHandlers.get(type);
        if (handlers) {
            handlers.delete(handler);
            if (handlers.size === 0) {
                window.requestHandlers.delete(type);
            }
        }
    }

    function analyzeMarketPrice(marketData, neededQuantity) {
        const asks = marketData.orderBooks?.[0]?.asks;
        if (!asks?.length) throw new Error('没有可用的卖单');

        let cumulativeQuantity = 0;
        let targetPrice = 0;

        for (const ask of asks) {
            const availableFromThisOrder = Math.min(ask.quantity, neededQuantity - cumulativeQuantity);
            cumulativeQuantity += availableFromThisOrder;
            targetPrice = ask.price;
            if (cumulativeQuantity >= neededQuantity) break;
        }

        if (cumulativeQuantity < neededQuantity) {
            throw new Error(`市场库存不足。可用: ${cumulativeQuantity}, 需要: ${neededQuantity}`);
        }

        return targetPrice;
    }

    function analyzeBidPrice(marketData) {
        const bids = marketData.orderBooks?.[0]?.bids;
        if (!bids?.length) throw new Error('没有可用的买单');
        return bids[0].price;
    }

    // ==================== 简化的API客户端 ====================
    class PGE {
        constructor() {
            this.isReady = false;
            this.init();
        }

        async init() {
            while (!window.PGE?.checkAPI) {
                await utils.delay(1000);
            }
            this.isReady = true;
        }

        async waitForReady() {
            while (!this.isReady) await utils.delay(100);
        }

        async executeRequest(method, ...args) {
            await this.waitForReady();
            return await window.PGE[method](...args);
        }

        async checkAPI() { return this.executeRequest('checkAPI'); }
        async batchDirectPurchase(items, delay) { return this.executeRequest('batchDirectPurchase', items, delay); }
        async batchBidOrder(items, delay) { return this.executeRequest('batchBidOrder', items, delay); }
        hookMessage(messageType, callback) { return window.PGE.hookMessage(messageType, callback); }
    }


    // ==================== 基础利润计算器类 ====================
    class BaseProfitCalculator {
        constructor(cacheExpiry = CONFIG.UNIVERSAL_CACHE_EXPIRY) {
            this.api = window.MWIModules.api;
            this.marketData = {};
            this.marketTimestamps = {};
            this.requestQueue = [];
            this.isProcessing = false;
            this.initialized = false;
            this.updateTimeout = null;
            this.lastState = '';
            this.cacheExpiry = cacheExpiry;
            this.init();
        }

        async init() {
            while (!window.PGE?.core || !this.api?.isReady) {
                await utils.delay(100);
            }
            try {
                window.PGE.hookMessage("market_item_order_books_updated", obj => {
                    const { itemHrid, orderBooks } = obj.marketItemOrderBooks;
                    this.marketData[itemHrid] = orderBooks;
                    this.marketTimestamps[itemHrid] = Date.now();
                });
                this.initialized = true;
            } catch (error) {
                console.error('[ProfitCalculator] 初始化失败:', error);
            }
            setInterval(() => this.cleanCache(), 60000);
        }

        cleanCache() {
            const now = Date.now();
            Object.keys(this.marketTimestamps).forEach(item => {
                if (now - this.marketTimestamps[item] > this.cacheExpiry) {
                    delete this.marketData[item];
                    delete this.marketTimestamps[item];
                }
            });
        }

        async getMarketData(itemHrid) {
            return new Promise(resolve => {
                if (this.marketData[itemHrid] && !utils.isCacheExpired(itemHrid, this.marketTimestamps, this.cacheExpiry)) {
                    return resolve(this.marketData[itemHrid]);
                }
                if (!this.initialized || !window.PGE?.core) {
                    return resolve(null);
                }
                this.requestQueue.push({ itemHrid, resolve });
                this.processQueue();
            });
        }

        async processQueue() {
            if (this.isProcessing || !this.requestQueue.length || !this.initialized || !window.PGE?.core) return;
            this.isProcessing = true;
            while (this.requestQueue.length > 0) {
                const batch = this.requestQueue.splice(0, 1);
                await Promise.all(batch.map(async ({ itemHrid, resolve }) => {
                    if (this.marketData[itemHrid] && !utils.isCacheExpired(itemHrid, this.marketTimestamps, this.cacheExpiry)) {
                        return resolve(this.marketData[itemHrid]);
                    }
                    try {
                        window.PGE.core.handleGetMarketItemOrderBooks(itemHrid);
                    } catch (error) {
                        console.error('API调用失败:', error);
                    }
                    const start = Date.now();
                    await new Promise(waitResolve => {
                        const check = setInterval(() => {
                            if (this.marketData[itemHrid] || Date.now() - start > 5000) {
                                clearInterval(check);
                                resolve(this.marketData[itemHrid] || null);
                                waitResolve();
                            }
                        }, 50);
                    });
                }));
                if (this.requestQueue.length > 0) await utils.delay(300);
            }
            this.isProcessing = false;
        }

        debounceUpdate(callback) {
            clearTimeout(this.updateTimeout);
            this.updateTimeout = setTimeout(callback, 200);
        }

        async updateProfitDisplay() {
            const pessimisticEl = document.getElementById(this.getPessimisticId());
            const optimisticEl = document.getElementById(this.getOptimisticId());
            if (!pessimisticEl || !optimisticEl) return;

            if (!this.initialized || !window.PGE?.core) {
                pessimisticEl.textContent = optimisticEl.textContent = this.getWaitingText();
                pessimisticEl.style.color = optimisticEl.style.color = CONFIG.COLORS.warning;
                return;
            }

            try {
                const data = await this.getActionData();
                if (!data) {
                    pessimisticEl.textContent = optimisticEl.textContent = LANG.noData;
                    pessimisticEl.style.color = optimisticEl.style.color = CONFIG.COLORS.neutral;
                    return;
                }

                [false, true].forEach((useOptimistic, index) => {
                    const profit = this.calculateProfit(data, useOptimistic);
                    const el = index ? optimisticEl : pessimisticEl;
                    if (profit === null) {
                        el.textContent = LANG.noData;
                        el.style.color = CONFIG.COLORS.neutral;
                    } else {
                        el.textContent = utils.formatProfit(profit);
                        el.style.color = profit >= 0 ? CONFIG.COLORS.profit : CONFIG.COLORS.loss;
                    }
                });
            } catch (error) {
                console.error('[ProfitCalculator] 计算出错:', error);
                pessimisticEl.textContent = optimisticEl.textContent = LANG.error;
                pessimisticEl.style.color = optimisticEl.style.color = CONFIG.COLORS.warning;
            }
        }

        createProfitDisplay() {
            const container = document.createElement('div');
            container.id = this.getContainerId();
            container.style.cssText = `
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        font-family: Roboto, Helvetica, Arial, sans-serif;
                        font-size: 14px;
                        line-height: 20px;
                        letter-spacing: 0.00938em;
                        color: var(--color-text-dark-mode);
                        font-weight: 400;
                    `;
            container.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 8px">
                            <span style="color: ${CONFIG.COLORS.space300}">${LANG.askBuyBidSell}</span>
                            <span id="${this.getPessimisticId()}" style="font-weight: 500">${this.initialized ? LANG.loadingMarketData : this.getWaitingText()}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px">
                            <span style="color: ${CONFIG.COLORS.space300}">${LANG.bidBuyAskSell}</span>
                            <span id="${this.getOptimisticId()}" style="font-weight: 500">${this.initialized ? LANG.loadingMarketData : this.getWaitingText()}</span>
                        </div>
                    `;
            return container;
        }

        checkForUpdates() {
            const currentState = this.getStateFingerprint();
            if (currentState !== this.lastState && currentState) {
                this.lastState = currentState;
                this.debounceUpdate(() => this.updateProfitDisplay());
            }
        }

        // 子类需要实现的抽象方法
        getContainerId() { throw new Error('Must implement getContainerId'); }
        getPessimisticId() { throw new Error('Must implement getPessimisticId'); }
        getOptimisticId() { throw new Error('Must implement getOptimisticId'); }
        getWaitingText() { throw new Error('Must implement getWaitingText'); }
        getActionData() { throw new Error('Must implement getActionData'); }
        calculateProfit(data, useOptimistic) { throw new Error('Must implement calculateProfit'); }
        getStateFingerprint() { throw new Error('Must implement getStateFingerprint'); }
        setupUI() { throw new Error('Must implement setupUI'); }
    }

    // ==================== 物品价值计算器 ====================
    class ItemValueCalculator extends BaseProfitCalculator {
        constructor() {
            super(CONFIG.UNIVERSAL_CACHE_EXPIRY);
            this.characterId = window.PGE?.characterData?.character.id;
            this.jsonMarketData = null;
            this.jsonStorageKey = `PGE_MARKET_DATA`;
            this.storageKey = `MWI_ITEM_VALUE_HISTORY_${this.characterId}`;
            this.recordInterval = 30 * 1000 * 60; // 30分钟
            this.maxHistoryDays = 30; // 最多保留30天
            this.compressionThreshold = 7; // 7天后开始压缩
            this.autoRecordTimer = null;
            this.incrementButtonObserver = null;
            this.chartViewer = null;
            this.init();
        }

        async init() {
            await super.init();
            this.loadJsonMarketDataFromStorage();
            // this.startAutoRecord();
            // this.cleanupOldData();
            this.setupIncrementButtonObserver();
            this.updateJsonMarketData();
            // this.chartViewer = new AssetChartViewer(this);
            // await this.calculateItemValues();
        }

        // 从localStorage加载JSON数据
        loadJsonMarketDataFromStorage() {
            try {
                const saved = localStorage.getItem(this.jsonStorageKey);
                if (saved) {
                    this.jsonMarketData = JSON.parse(saved);
                    return true;
                }
            } catch (error) {
                console.error('[ItemValueCalculator] 从localStorage加载JSON市场数据失败:', error);
            }
            return false;
        }

        // 保存JSON数据到localStorage
        saveJsonMarketDataToStorage() {
            try {
                if (this.jsonMarketData) {
                    localStorage.setItem(this.jsonStorageKey, JSON.stringify(this.jsonMarketData));
                }
            } catch (error) {
                console.error('[ItemValueCalculator] 保存JSON市场数据到localStorage失败:', error);
            }
        }

        // 获取JSON市场数据并更新localStorage
        async updateJsonMarketData() {
            try {
                const response = await fetch('https://raw.githubusercontent.com/holychikenz/MWIApi/main/milkyapi.json');
                if (!response.ok) {
                    throw new Error(`HTTP错误: ${response.status}`);
                }
                const newData = await response.json();
                const marketData = newData.market || newData;

                if (!this.jsonMarketData) {
                    this.jsonMarketData = marketData;
                } else {
                    let updatedCount = 0;
                    for (const [itemName, itemData] of Object.entries(marketData)) {
                        this.jsonMarketData[itemName] = itemData;
                        updatedCount++;
                    }
                }

                // 保存到localStorage
                this.saveJsonMarketDataToStorage();
                return true;
            } catch (error) {
                console.error('[ItemValueCalculator] 更新JSON市场数据失败:', error);
                return false;
            }
        }

        // 设置按钮插入观察器
        setupIncrementButtonObserver() {
            this.incrementButtonObserver = new MutationObserver(() => {
                this.insertIncrementButton();
            });

            this.incrementButtonObserver.observe(document.body, {
                childList: true,
                subtree: true
            });

            // 立即尝试插入一次
            setTimeout(() => {
                this.insertIncrementButton();
            }, 1000);
        }


        addBuyPage() {
            // 1. 获取数据（假设 localStorage 保存的是 JSON 字符串）
            const rawData = localStorage.getItem('buyItem');
            if (!rawData) {
                console.log('localStorage 没有 itemsData');
                return "<div></div>"
            } else {
                const items = JSON.parse(rawData);
                // 示例数据结构：
                // items = [
                //   { name: '金币', icon: '/static/media/items_sprite.svg#coin', count: 158 },
                //   { name: '苹果软糖', icon: '/static/media/items_sprite.svg#apple_gummy', count: 167 },
                //   ...
                // ]


                // 2. 创建容器
                const gridContainer = document.createElement('div');
                gridContainer.style.display = 'grid';
                gridContainer.style.gridTemplateColumns = 'repeat(auto-fill, 50px)'; // 每个格子宽 80px
                // gridContainer.style.gap = '10px';
                gridContainer.style.padding = '10px';

                // 3. 遍历 items 创建格子
                items.forEach(item => {
                    const itemBox = document.createElement('div');
                    itemBox.classList.add('Item_itemContainer__x7kH1');
                    itemBox.innerHTML = `
                    <div>
                    <div class="Item_item__2De2O Item_clickable__3viV6">
                    <div class="Item_iconContainer__5z7j4">
                    <svg role="img" aria-label="${item.name}" class="Icon_icon__2LtL_" width="100%" height="100%">
                    <use href="${item.img}">
                    </use></svg></div>
                    <div class="Item_count__1HVvv">${item.quantity}</div>
                    </div>
                    </div>
                    </div>
                    `
                    gridContainer.appendChild(itemBox);
                });
                return gridContainer;
            }
        }

        // 插入增量按钮
        insertIncrementButton() {
            const targetContainers = document.querySelectorAll('.CharacterManagement_characterManagement__2PhvW .css-k008qs');

            // 限制最多处理2个容器
            const maxContainers = Math.min(targetContainers.length, 2);
            let insertedAny = false;

            for (let i = 0; i < maxContainers; i++) {
                const targetContainer = targetContainers[i];

                // 检查这个容器是否已经有按钮（任何增量按钮都算）
                const hasButton = targetContainer.querySelector('[id^="value-increment-button"]');

                if (!hasButton) {
                    const buttonId = `value-increment-button-${i}`;
                    const button = document.createElement('button');
                    button.className = 'MuiButtonBase-root MuiTab-root MuiTab-textColorPrimary css-1q2h7u5';
                    button.setAttribute('tabindex', '-1');
                    button.setAttribute('type', 'button');
                    button.setAttribute('role', 'tab');
                    button.setAttribute('aria-selected', 'false');
                    button.textContent = '补货清单';
                    // const button = this.createIncrementButton();
                    button.id = buttonId;
                    button.addEventListener('click', (e) => {
                        e.preventDefault();

                        // 获取上一级父元素
                        const parent = targetContainer.parentElement.parentElement.parentElement;
                        console.info(parent)
                        if (!parent) return;
                        // 获取父元素的下一个兄弟元素
                        const nextSibling = parent.nextElementSibling;
                        console.info(nextSibling)
                        if (!nextSibling) return;

                        // 清空下一个兄弟元素并插入新页面内容
                        nextSibling.innerHTML = '';

                        const newPage = this.addBuyPage();
                        nextSibling.appendChild(newPage);
                    });

                    targetContainer.appendChild(button);
                    insertedAny = true;
                }
            }

            // 只有在插入了新按钮时才更新显示和设置定时器
            // if (insertedAny) {
            //     this.updateIncrementDisplay();
            //     this.setupIncrementUpdateTimer();
            // }
        }



        getContainerId() { return 'item-value-calculator'; }
        getPessimisticId() { return 'item-value-pessimistic'; }
        getOptimisticId() { return 'item-value-optimistic'; }
        getWaitingText() { return LANG.chart.calculating; }
        getActionData() { return null; }
        calculateProfit() { return null; }
        getStateFingerprint() { return ''; }
        setupUI() { }

    }


    // ==================== 快速出售管理器 ====================
    class QuickSellManager {
        constructor() {
            this.processedMenus = new WeakSet();
            this.isProcessing = false;
            this.buttonStates = new WeakMap();
            this.isEnabled = true;
            this.init();
            this.setupBuy();
        }

        setupBuy() {
            const observer = new MutationObserver(() => {
                this.addBuyBtn();
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }

        addBuyBtn() {
            if (!this.isEnabled) return;
            try {
                // 检查是否出现物品菜单
                const itemMenu = document.querySelector('.Item_actionMenu__2yUcG');
                if (itemMenu && !this.processedMenus.has(itemMenu)) {
                    this.addQuickBuyBtn(itemMenu);
                    this.processedMenus.add(itemMenu);
                }
            } catch (error) {
                console.error('检查菜单失败:', error);
            }
        }

        addQuickBuyBtn(menuContainer) {
            // 检查是否已存在出售按钮
            if (menuContainer.querySelector('.quick-buy-btn')) {
                return;
            }
            // 检查是否存在数量输入框，如果没有就不显示快速出售按钮
            const quantityInput = menuContainer.querySelector('.Input_input__2-t98');
            if (!quantityInput) {
                return;
            }

            // 创建“添加补货”
            const addBuyButton = document.createElement('button');
            addBuyButton.className = 'Button_button__1Fe9z Button_sell__3FNpM Button_fullWidth__17pVU quick-buy-btn';
            addBuyButton.textContent = '添加补货';

            // 创建"从补货中删除"按钮
            const delBuyButton = document.createElement('button');
            delBuyButton.className = 'Button_button__1Fe9z Button_sell__3FNpM Button_fullWidth__17pVU quick-buy-del-btn';
            delBuyButton.textContent = '从补货中删除';

            // 添加点击事件
            addBuyButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.addBuy(menuContainer);
            });

            delBuyButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.delBuy(menuContainer);
            });

            menuContainer.appendChild(addBuyButton);
            menuContainer.appendChild(delBuyButton);
        }

        delBuy(menuContainer) {
            const info = this.extractItemInfo(menuContainer);
            this.removeItemByName(info.name);
        }

        addBuy(menuContainer) {
            const info = this.extractItemInfo(menuContainer);
            this.saveItemToLocal(info);
        }

        extractItemInfo(menuContainer) {
            try {
                console.info(menuContainer)
                // 获取物品名称
                const itemNameElement = menuContainer.querySelector('.Item_name__2C42x');
                const itemName = itemNameElement?.textContent?.trim();

                // 获取React props
                const reactKey = Object.keys(menuContainer).find(key => key.startsWith('__reactProps'));
                const itemInfo = menuContainer[reactKey]?.children[0]._owner.memoizedProps;
                console.info(itemInfo)
                if (!itemInfo || !itemName) {
                    return null;
                }

                const quantityInput = menuContainer.querySelector('.Input_input__2-t98');
                const svg = document.querySelector(`svg[aria-label="${itemName}"]`);
                let href = ''
                if (svg) {
                    const use = svg.querySelector('use');
                    href = use?.getAttribute('href') || use?.getAttribute('xlink:href');
                }


                return {
                    name: itemName,
                    itemHrid: itemInfo.itemHrid,
                    enhancementLevel: itemInfo.enhancementLevel || 0,
                    quantity: parseInt(quantityInput.value) || 0,
                    img: href
                };
            } catch (error) {
                console.error(LANG.quickSell.extractItemInfoFailed + ':', error);
                return null;
            }
        }

        removeItemByName(name) {
            // 1. 读取现有数据
            let list = JSON.parse(localStorage.getItem("buyItem")) || [];

            // 2. 过滤掉要删除的那一项
            list = list.filter(item => item.name !== name);
            // 3. 覆盖保存
            localStorage.setItem("buyItem", JSON.stringify(list));
        }


        saveItemToLocal(data) {
            // 1. 读取本地已有的数据（数组）
            let list = JSON.parse(localStorage.getItem("buyItem")) || [];

            // 2. 根据 name 判断是否已经存在
            const index = list.findIndex(item => item.name === data.name);

            if (index > -1) {
                // 已存在：更新
                list[index] = data;
            } else {
                // 不存在：新增
                list.push(data);
            }

            // 3. 保存回 localStorage
            localStorage.setItem("buyItem", JSON.stringify(list));
        }

        init() {
            const waitForInv = () => {
                this.addBtn();
                setTimeout(waitForInv, 3000);
            };
            waitForInv();
        }

        addBtn() {

            function getKeyByChinese(chinese) {
                for (const key in ZHItemNames) {
                    if (ZHItemNames[key] === chinese) {
                        return key;   // 直接返回 key 字符串
                    }
                }
                return null;      // 找不到返回 null
            }

            const quickBuy = async () => {

                let list = JSON.parse(localStorage.getItem("buyItem")) || [];

                const grids = document.querySelectorAll('.Inventory_itemGrid__20YAH');
                // 查找第一个 span 文本为 "资源" 的容器
                const resourceGrid = Array.from(grids).find(grid => {
                    const firstSpan = grid.querySelector('.Inventory_label__XEOAx span');
                    return firstSpan?.textContent.trim() === '食物';
                });
                const allMenu1 = resourceGrid.querySelectorAll('.Item_itemContainer__x7kH1');

                // 查找第一个 span 文本为 "技能书" 的容器
                const resourceGrid2 = Array.from(grids).find(grid => {
                    const firstSpan = grid.querySelector('.Inventory_label__XEOAx span');
                    return firstSpan?.textContent.trim() === '饮料';
                });

                const allMenu2 = resourceGrid2.querySelectorAll('.Item_itemContainer__x7kH1');

                const combinedMenu = [...allMenu1, ...allMenu2];
                const allWupin = combinedMenu.map(itemWupin => {
                    // console.info('itemWupin',itemWupin)
                    const label = itemWupin?.children[0]?.children[0]?.querySelector('svg')?.getAttribute('aria-label');

                    const countStr = itemWupin.querySelector('.Item_count__1HVvv')?.textContent;
                    const count = countStr ? parseInt(countStr, 10) : 0;
                    return {
                        name: label,
                        num: count,
                    }
                })

                // 3. 遍历 items 创建格子
                const buyInfo = list.map(item => {
                    const wupin = allWupin.find(wupin => wupin.name === item.name);
                    let num = item.quantity;
                    if (wupin) {
                        num = item.quantity - wupin.num;
                    }
                    if (num <= 0) {
                        this.showToast(`物品${item.name}数量充足${num}`, 'info');
                        return
                    }

                    return {
                        itemHrid: item.itemHrid,
                        quantity: num,
                        materialName: item.name,
                        cartItemId: item.itemHrid,
                        purchaseMode: 'ask'
                    }

                });

                if (buyInfo.length === 0) {
                    this.showToast('暂无设定补货物品', 'warning');
                    return;
                }

                const api = window.MWIModules?.api;
                if (!api?.isReady) {
                    this.showToast(LANG.wsNotAvailable, 'error');
                    return;
                }
                await api.batchDirectPurchase(buyInfo, CONFIG.DELAYS.PURCHASE);
            }

            const quickSell = async () => {
                if(this.isProcessing){
                    return ;
                }
                this.isProcessing = true;
                try {
                    quickBuy();
                    const grids = document.querySelectorAll('.Inventory_itemGrid__20YAH');

                    // 查找第一个 span 文本为 "资源" 的容器
                    const resourceGrid = Array.from(grids).find(grid => {
                        const firstSpan = grid.querySelector('.Inventory_label__XEOAx span');
                        return firstSpan?.textContent.trim() === '资源';
                    });
                    const allMenu1 = resourceGrid.querySelectorAll('.Item_itemContainer__x7kH1');

                    // 查找第一个 span 文本为 "技能书" 的容器
                    const resourceGrid2 = Array.from(grids).find(grid => {
                        const firstSpan = grid.querySelector('.Inventory_label__XEOAx span');
                        return firstSpan?.textContent.trim() === '技能书';
                    });
                    let combinedMenu = [...allMenu1];
                    if (resourceGrid2) {
                        const allMenu2 = resourceGrid2.querySelectorAll('.Item_itemContainer__x7kH1');
                        if (allMenu2) {
                            combinedMenu = [...allMenu1, ...allMenu2];
                        }
                    }
                    // return ;
                    for (const itemWupin of combinedMenu) {
                        // console.info('itemWupin',itemWupin)
                        const label = itemWupin?.children[0]?.children[0]?.querySelector('svg')?.getAttribute('aria-label');
                        const itemHrid = getKeyByChinese(label);
                        if (itemHrid == null || label === '任务水晶') {
                            continue;
                        }
                        const en_name = itemHrid.split('/').pop().replace(/_/g, ' ').toLowerCase().replace(/(^|\s)\S/g, char => char.toUpperCase());
                        const countStr = itemWupin.querySelector('.Item_count__1HVvv')?.textContent;
                        const count = countStr ? parseInt(countStr, 10) : 0;
                        const wupinInfo = {
                            en_name: en_name,
                            name: label,
                            itemHrid: itemHrid,
                            num: count,
                            enhancementLevel: 0
                        }
                        await this.allSell(wupinInfo);
                        //等待1秒
                        await new Promise(resolve => setTimeout(resolve, 1200));
                    }
                } finally {
                    this.isProcessing = false;
                }
            }


            // const targetNodes = document.querySelectorAll("div.Inventory_items__6SXv0");
            //    const targetNodes = document.querySelectorAll('div[style="color: orange; font-size: 0.875rem; text-align: left;"]');
            const nodes = document.querySelectorAll('#script_sortByNone_btn');
            nodes.forEach(node => {
                const targetButton = node.parentElement.querySelector('#script_allSell_btn');
                if (node && !targetButton) {
                    const buttonsDiv = `
                        <button
                        id="script_allSell_btn"
                        style="border-radius: 3px; background-color: #007bff; color: black;">
                        出售&补货
                        </button>`;
                    node.insertAdjacentHTML('afterend', buttonsDiv);
                    node.parentElement.querySelector("button#script_allSell_btn").addEventListener("click", quickSell);
                    quickSell();
                    // node.parentElement.querySelector("button#script_allAddWupin_btn").addEventListener("click", quickBuy);
                }
            })
        }



        // menuContainer - 物品信息 ,bid  -直售， 
        async allSell(menuContainer) {
                // 获取物品信息
                const itemInfo = menuContainer;

                // 获取出售数量
                const quantity = itemInfo.num;

                // 显示开始出售的提示
                // const startMessage = sellType === 'ask' ? LANG.quickSell.startListing : LANG.quickSell.startInstantSell;
                // this.showToast(`${startMessage}: ${itemInfo.name} x${quantity}`, 'info');

                // 获取市场数据
                // const marketData = await this.getMarketData(itemInfo.itemHrid);
                // if (!marketData) {
                //     throw new Error(LANG.quickSell.noMarketData);
                // }

                // // 计算价格
                // const price = this.calculatePrice(marketData, itemInfo.enhancementLevel, quantity, sellType);
                const rawDataString = localStorage.getItem("PGE_MARKET_DATA");
                const marketData = JSON.parse(rawDataString);
                const price = marketData?.[itemInfo.en_name]?.bid
                if (!price || price <= 0) {
                    return;
                }
            try{               
                // 执行出售
                await this.executeSell(itemInfo, quantity, price);

            } catch (error) {
                if (error.message.includes("orderNotFulfilled")) {
                    const marketData = await this.getMarketData(itemInfo.itemHrid);
                    const bids = marketData.orderBooks?.[0]?.bids;
                    const price2 = bids[0].price;
                    await this.executeSell(itemInfo, quantity, price2);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                //    js可以catch不同类型的error 吗？Error: errorNotification.orderNotFulfilled
                } else {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
                console.error(LANG.quickSell.sellFailed + ':', error);
            }
        }

        async getMarketData(itemHrid) {
            const fullItemHrid = itemHrid.startsWith('/items/') ? itemHrid : `/items/${itemHrid}`;

            const cached = window.marketDataCache.get(fullItemHrid);
            if (cached && Date.now() - cached.timestamp < 60000) {
                return cached.data;
            }

            if (!window.PGE.core) {
                throw new Error('游戏核心对象未就绪');
            }

            const responsePromise = window.PGE.waitForMessage(
                'market_item_order_books_updated',
                8000,
                (responseData) => responseData.marketItemOrderBooks?.itemHrid === fullItemHrid
            );

            window.PGE.core.handleGetMarketItemOrderBooks(fullItemHrid);

            const response = await responsePromise;
            return response.marketItemOrderBooks;
        }

        async executeSell(itemInfo, quantity, price) {
            try {
                // 直售（卖给买单）
                await this.executeInstantSell(itemInfo.itemHrid, 0, quantity, price, itemInfo.name);
               
            } catch (error) {
                console.error(LANG.quickSell.executeSellFailed + ':', error);
                throw error;
            }
        }

        async executeInstantSell(itemHrid, enhancementLevel, quantity, price, itemName) {
            const successPromise = window.PGE.waitForMessage(
                'info',
                15000,
                (responseData) => responseData.message === 'infoNotification.sellOrderCompleted'
            );

            const errorPromise = window.PGE.waitForMessage('error', 15000);

            window.PGE.core.handlePostMarketOrder(true, itemHrid, enhancementLevel, quantity, price, true);

            try {
                await Promise.race([
                    successPromise,
                    errorPromise.then(errorData => Promise.reject(new Error(errorData.message || LANG.quickSell.instantSellFailed)))
                ]);

                // this.showToast(`✅ ${LANG.quickSell.instantSellSuccess}: ${itemName} x${quantity} @ ${price}`, 'success');
            } catch (error) {
                // this.showToast(`❌ ${LANG.quickSell.instantSellFailed}: ${itemName}`, 'error');
                throw error;
            }
        }

        async executeListing(itemHrid, enhancementLevel, quantity, price, itemName) {
            const successPromise = window.PGE.waitForMessage(
                'info',
                15000,
                (responseData) => responseData.message === 'infoNotification.sellListingProgress'
            );

            const errorPromise = window.PGE.waitForMessage('error', 15000);

            window.PGE.core.handlePostMarketOrder(true, itemHrid, enhancementLevel, quantity, price, false);

            try {
                await Promise.race([
                    successPromise,
                    errorPromise.then(errorData => Promise.reject(new Error(errorData.message || LANG.quickSell.listingFailed)))
                ]);

                this.showToast(`✅ ${LANG.quickSell.listingSuccess}: ${itemName} x${quantity} @ ${price}`, 'success');
            } catch (error) {
                this.showToast(`❌ ${LANG.quickSell.listingFailed}: ${itemName}`, 'error');
                throw error;
            }
        }

        showToast(message, type) {
            if (window.MWIModules?.toast) {
                window.MWIModules.toast.show(message, type);
            } else {
                console.log(`${message}`);
            }
        }
    }

    class OpenWupin {
        constructor() {
            this.isEnabled = true;
            this.init();
        }

        init(){
            const observer = new MutationObserver(() => {
                this.openWupin();
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }

        openWupin(){
                        // 1. 定义目标按钮的选择器
            const TARGET_SELECTOR = 'button.Button_button__1Fe9z';

            // 2. 查找页面上匹配的按钮元素
            // document.querySelector() 返回文档中与指定选择器或选择器组匹配的第一个 Element。
            const closeButton = document.querySelector(TARGET_SELECTOR);

            // 3. 判断按钮是否存在
            if (closeButton) {
                // 按钮存在，执行模拟点击
                console.log("找到目标按钮，模拟点击。");
                closeButton.click();
                
                // 可选：为了确保点击后执行了操作（例如关闭了弹窗），
                // 可以在点击后再次检查元素是否消失。
                
            } else {
                // 按钮不存在
                console.log("目标按钮未找到，无需操作。");
            }
        }


    }

    // ==================== 模块初始化 ====================
    function initializeModules() {
        console.log('[PGE] Starting module initialization...');

        // 初始化基础模块
        window.MWIModules.toast = new Toast();
        window.MWIModules.api = new PGE();

        window.MWIModules.itemValueCalculator = new ItemValueCalculator();
        window.MWIModules.quickSell = new QuickSellManager();
        new OpenWupin();
        
    }
    

    // ==================== 页面就绪检查 ====================
    function checkPageReady() {
        try {
            if (!document.body) {
                return false;
            }

            const avatar = document.querySelector('.Header_avatar__2RQgo');
            const gameContainer = document.querySelector('.GamePage_gamePage__ixiPl');

            if (avatar && gameContainer) {
                console.log('[PGE] Page elements ready');
                initializationState.pageReady = true;
                checkAndInitializeModules();
                return true;
            }
            return false;
        } catch (error) {
            console.error('[PGE] Error checking page ready:', error);
            return false;
        }
    }

    // ==================== 游戏核心对象获取 ====================
    function getGameCore() {
        try {
            const el = document.querySelector(".GamePage_gamePage__ixiPl");
            if (!el) return null;

            const k = Object.keys(el).find(k => k.startsWith("__reactFiber$"));
            if (!k) return null;

            let f = el[k];
            while (f) {
                if (f.stateNode?.sendPing) return f.stateNode;
                f = f.return;
            }
            return null;
        } catch (error) {
            console.error('[PGE] Error getting game core:', error);
            return null;
        }
    }

    // ==================== 游戏状态检查 ====================
    function checkGameStateReady() {
        try {
            if (!document.body) {
                return false;
            }

            const gameCore = getGameCore();
            if (gameCore) {
                window.PGE.core = gameCore;
                console.log('[PGE] Game core ready');
                initializationState.gameStateReady = true;
                checkAndInitializeModules();
                return true;
            }
            return false;
        } catch (error) {
            console.error('[PGE] Error checking game state:', error);
            return false;
        }
    }

    // ==================== 模块初始化检查 ====================
    function checkAndInitializeModules() {
        if (initializationState.modulesInitialized) {
            return;
        }

        if (!initializationState.wsConnected) {
            console.log('[PGE] Waiting for WebSocket connection...');
            return;
        }

        if (!initializationState.pageReady) {
            console.log('[PGE] Waiting for page elements...');
            return;
        }

        if (!initializationState.gameStateReady) {
            console.log('[PGE] Waiting for game state...');
            return;
        }

        console.log('[PGE] All conditions met, initializing modules...');
        initializationState.modulesInitialized = true;

        try {
            initializeModules();
            console.log('[PGE] Modules initialized successfully');
        } catch (error) {
            console.error('[PGE] Module initialization failed:', error);
            initializationState.modulesInitialized = false;
        }
    }

    // ==================== 页面监听器 ====================
    async function setupPageMonitoring() {
        try {
            await DOMUtils.waitForDOMReady();
            console.log('[PGE] DOM ready');

            setTimeout(checkPageReady, 100);

            DOMUtils.setupSafeObserver((mutations) => {
                if (!initializationState.pageReady) {
                    checkPageReady();
                }
                if (!initializationState.gameStateReady) {
                    checkGameStateReady();
                }
            });

            const gameStateInterval = setInterval(() => {
                if (initializationState.gameStateReady) {
                    clearInterval(gameStateInterval);
                    return;
                }
                checkGameStateReady();
            }, 1000);

            setTimeout(() => {
                if (!initializationState.modulesInitialized) {
                    console.log('[PGE] Timeout check - forcing initialization check');
                    checkPageReady();
                    checkGameStateReady();
                    checkAndInitializeModules();
                }
            }, 5000);

        } catch (error) {
            console.error('[PGE] Setup page monitoring failed:', error);
        }
    }

    // ==================== 启动序列 ====================
    function startInitializationSequence() {
        console.log('[PGE] Starting initialization sequence...');

        // 1. 立即设置WebSocket拦截（最高优先级）
        setupWebSocketInterception();

        // 2. 异步设置页面监听
        setupPageMonitoring().catch(error => {
            console.error('[PGE] Page monitoring setup failed:', error);
        });

        // 3. 初始化角色切换器
        // window.MWIModules.characterSwitcher = new CharacterSwitcher();

        console.log('[PGE] Initialization sequence started');
    }

    // ==================== 初始化状态 ====================
    const state = {
        wsInstances: [],
        currentWS: null,
        requestHandlers: new Map(),
        marketDataCache: new Map(),
        baseDomain: 'data.pages.dev'
    };

    Object.assign(window, state);

    // ==================== 启动 ====================
    startInitializationSequence();
    window.HackTimer = new HackTimer();
})();