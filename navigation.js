// ==========================================
// MY WORKOUT LOG
// 全ページ共通ナビゲーション
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // 現在開いているページを取得
    const currentPage =
        window.location.pathname.split("/").pop() || "index.html";

    // ヘッダーを取得
    const header = document.querySelector(
        ".home-header, .record-header, .history-header, .progress-header"
    );

    if (!header) return;

    // 全ページ共通メニュー
    const menuItems = [
        { name: "ホーム", url: "index.html" },
        { name: "記録する", url: "record.html" },
        { name: "履歴", url: "history.html" },
        { name: "成長", url: "progress.html" },
        { name: "体重管理", url: "weight.html" },
        { name: "初心者メニュー", url: "beginner.html" }
    ];

    // メニューHTMLを生成
    const navigationLinks = menuItems.map(item => {

        const isCurrent = currentPage === item.url;

        return `
            <a href="${item.url}"
               ${isCurrent ? 'aria-current="page"' : ""}>
                ${item.name}
            </a>
        `;

    }).join("");

    // 共通ヘッダーを設定
    header.className = "home-header unified-header";

    header.innerHTML = `
        <a class="home-brand"
           href="index.html"
           aria-label="MY WORKOUT LOG ホーム">

            <span class="brand-mark">MW</span>

            <span class="brand-name">
                MY WORKOUT <b>LOG</b>
            </span>

        </a>

        <nav class="home-desktop-nav"
             aria-label="メインメニュー">

            ${navigationLinks}

        </nav>

        <a class="home-header-cta"
           href="record.html">

            ＋ 記録する

        </a>
    `;

});