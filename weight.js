// ========================================
// MY WORKOUT LOG
// 体重管理ページ
// ========================================

// ----------------------------------------
// 1. 保存キー
// ----------------------------------------

const WEIGHT_STORAGE_KEY = "bodyWeights";
const TARGET_STORAGE_KEY = "targetBodyWeight";

// ----------------------------------------
// 2. HTML要素
// ----------------------------------------

const weightForm = document.getElementById("weightForm");
const weightValue = document.getElementById("weightValue");
const weightDate = document.getElementById("weightDate");
const weightMessage = document.getElementById("weightMessage");

const latestWeight = document.getElementById("latestWeight");
const weightStartDifference = document.getElementById("weightStartDifference");

const targetWeightForm = document.getElementById("targetWeightForm");
const targetWeightInput = document.getElementById("targetWeightInput");
const targetWeightDisplay = document.getElementById("targetWeightDisplay");
const targetWeightMessage = document.getElementById("targetWeightMessage");
const weightToGoal = document.getElementById("weightToGoal");

const weightHistory = document.getElementById("weightHistory");
const chartMessage = document.getElementById("chartMessage");

const periodButtons = document.querySelectorAll(".weight-period-btn");

let weightChart = null;
let currentPeriod = "month";
let editingDate = null;

// ----------------------------------------
// 3. 日付
// ----------------------------------------

function getToday() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

weightDate.value = getToday();

// ----------------------------------------
// 4. データ読み込み・保存
// ----------------------------------------

function loadWeights() {
    try {
        const data = JSON.parse(
            localStorage.getItem(WEIGHT_STORAGE_KEY) || "[]"
        );

        if (!Array.isArray(data)) {
            return [];
        }

        return data.filter(item =>
            item &&
            typeof item.date === "string" &&
            Number.isFinite(Number(item.weight)) &&
            Number(item.weight) >= 1 &&
            Number(item.weight) <= 500
        );

    } catch (error) {
        console.error("体重データの読み込みエラー:", error);
        return [];
    }
}

function saveWeights(weights) {
    localStorage.setItem(
        WEIGHT_STORAGE_KEY,
        JSON.stringify(weights)
    );
}

function sortWeights(weights) {
    return [...weights].sort((a, b) =>
        a.date.localeCompare(b.date)
    );
}

function loadTargetWeight() {
    const saved = localStorage.getItem(TARGET_STORAGE_KEY);

    if (saved === null) {
        return null;
    }

    const value = Number(saved);

    if (!Number.isFinite(value) || value < 1 || value > 500) {
        return null;
    }

    return value;
}

// ----------------------------------------
// 5. 数字の表示
// ----------------------------------------

function formatWeight(value) {
    return Number(value).toFixed(1);
}

function formatDifference(value) {
    const rounded = Math.round(value * 10) / 10;

    if (rounded > 0) {
        return `+${formatWeight(rounded)} kg`;
    }

    return `${formatWeight(rounded)} kg`;
}

// ----------------------------------------
// 6. 体重の保存・編集
// ----------------------------------------

weightForm.addEventListener("submit", event => {
    event.preventDefault();

    const weight = Number(weightValue.value);
    const date = weightDate.value;

    if (
        weightValue.value === "" ||
        !Number.isFinite(weight) ||
        weight < 1 ||
        weight > 500 ||
        !date
    ) {
        weightMessage.textContent =
            "正しい体重と日付を入力してください。";
        return;
    }

    const weights = loadWeights();

    // 編集中に日付が変更された場合
    if (editingDate && editingDate !== date) {
        const originalIndex = weights.findIndex(
            item => item.date === editingDate
        );

        if (originalIndex !== -1) {
            weights.splice(originalIndex, 1);
        }
    }

    // 同じ日付の記録があれば更新
    const existing = weights.find(
        item => item.date === date
    );

    if (existing) {
        existing.weight = weight;
    } else {
        weights.push({
            id: typeof crypto.randomUUID === "function"
                ? crypto.randomUUID()
                : `weight-${Date.now()}`,
            date,
            weight
        });
    }

    try {
        saveWeights(weights);

        weightMessage.textContent = editingDate
            ? "体重記録を更新しました！"
            : "体重を保存しました！💪";

        resetWeightForm();
        updateWeightDisplay();

    } catch (error) {
        console.error(error);

        weightMessage.textContent =
            "保存に失敗しました。";
    }
});

// 入力フォームを初期状態に戻す
function resetWeightForm() {
    editingDate = null;

    weightForm.reset();

    weightDate.value = getToday();

    const submitButton = weightForm.querySelector(
        'button[type="submit"]'
    );

    submitButton.textContent = "体重を保存する";

    const cancelButton = document.getElementById(
        "cancelWeightEdit"
    );

    if (cancelButton) {
        cancelButton.remove();
    }
}

// 記録の編集
function editWeightRecord(item) {
    editingDate = item.date;

    weightValue.value = item.weight;
    weightDate.value = item.date;

    const submitButton = weightForm.querySelector(
        'button[type="submit"]'
    );

    submitButton.textContent = "変更を保存する";

    weightMessage.textContent =
        `${item.date} の記録を編集中です。`;

    // キャンセルボタン
    let cancelButton = document.getElementById(
        "cancelWeightEdit"
    );

    if (!cancelButton) {
        cancelButton = document.createElement("button");

        cancelButton.type = "button";
        cancelButton.id = "cancelWeightEdit";
        cancelButton.className = "weight-cancel-btn";
        cancelButton.textContent = "編集をキャンセル";

        cancelButton.addEventListener("click", () => {
            resetWeightForm();

            weightMessage.textContent =
                "編集をキャンセルしました。";
        });

        weightForm.appendChild(cancelButton);
    }

    weightForm.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    weightValue.focus({
        preventScroll: true
    });
}

// ----------------------------------------
// 7. 目標体重の保存
// ----------------------------------------

targetWeightForm.addEventListener("submit", event => {
    event.preventDefault();

    const target = Number(targetWeightInput.value);

    if (
        targetWeightInput.value === "" ||
        !Number.isFinite(target) ||
        target < 1 ||
        target > 500
    ) {
        targetWeightMessage.textContent =
            "正しい目標体重を入力してください。";
        return;
    }

    try {
        localStorage.setItem(
            TARGET_STORAGE_KEY,
            String(target)
        );

        targetWeightMessage.textContent =
            "目標体重を設定しました！🎯";

        updateWeightDisplay();

    } catch (error) {
        console.error(error);

        targetWeightMessage.textContent =
            "目標体重の保存に失敗しました。";
    }
});

// ----------------------------------------
// 8. 体重サマリー
// ----------------------------------------

function updateWeightSummary(weights) {
    const target = loadTargetWeight();

    // 目標体重
    if (target === null) {
        targetWeightDisplay.textContent = "未設定";
    } else {
        targetWeightDisplay.textContent =
            `${formatWeight(target)} kg`;

        targetWeightInput.value = target;
    }

    // 記録がない場合
    if (weights.length === 0) {
        latestWeight.textContent = "-- kg";
        weightStartDifference.textContent = "-- kg";
        weightToGoal.textContent = "-- kg";
        return;
    }

    const first = weights[0];
    const latest = weights[weights.length - 1];

    // 現在の体重
    latestWeight.textContent =
        `${formatWeight(latest.weight)} kg`;

    // 開始時からの変化
    const difference =
        Number(latest.weight) - Number(first.weight);

    weightStartDifference.textContent =
        formatDifference(difference);

    // 目標との差
    if (target !== null) {
        const remaining = Math.abs(
            target - Number(latest.weight)
        );

        weightToGoal.textContent =
            `${formatWeight(remaining)} kg`;
    } else {
        weightToGoal.textContent = "-- kg";
    }
}

// ----------------------------------------
// 9. グラフの表示期間
// ----------------------------------------

function getFilteredWeights(weights) {
    if (currentPeriod === "all") {
        return weights;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);

    if (currentPeriod === "week") {
        startDate.setDate(
            startDate.getDate() - 6
        );
    }

    if (currentPeriod === "month") {
        startDate.setMonth(
            startDate.getMonth() - 1
        );
    }

    if (currentPeriod === "threeMonths") {
        startDate.setMonth(
            startDate.getMonth() - 3
        );
    }

    const year = startDate.getFullYear();
    const month = String(
        startDate.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        startDate.getDate()
    ).padStart(2, "0");

    const startString = `${year}-${month}-${day}`;

    return weights.filter(
        item => item.date >= startString
    );
}

// 期間切り替えボタン
periodButtons.forEach(button => {
    button.addEventListener("click", () => {
        currentPeriod = button.dataset.period;

        periodButtons.forEach(btn => {
            btn.classList.toggle(
                "is-active",
                btn === button
            );
        });

        updateWeightChart(
            sortWeights(loadWeights())
        );
    });
});

// ----------------------------------------
// 10. 体重推移グラフ
// ----------------------------------------

function updateWeightChart(weights) {
    const filtered = getFilteredWeights(weights);

    if (weightChart) {
        weightChart.destroy();
        weightChart = null;
    }

    if (filtered.length === 0) {
        chartMessage.textContent =
            weights.length === 0
                ? "体重を記録するとグラフが表示されます。"
                : "この期間の体重記録はありません。";

        return;
    }

    if (typeof Chart === "undefined") {
        chartMessage.textContent =
            "グラフを読み込めませんでした。インターネット接続を確認してください。";
        return;
    }

    chartMessage.textContent = "";

    const labels = filtered.map(
        item => item.date
    );

    const values = filtered.map(
        item => Number(item.weight)
    );

    const canvas = document.getElementById(
        "weightChart"
    );

    weightChart = new Chart(canvas, {
        type: "line",

        data: {
            labels,

            datasets: [{
                label: "体重（kg）",
                data: values,

                borderColor: "#b9ff52",
                backgroundColor: "rgba(185,255,82,0.12)",

                borderWidth: 3,
                tension: 0.35,

                fill: true,

                pointRadius: 5,
                pointHoverRadius: 7,

                pointBackgroundColor: "#b9ff52",
                pointBorderColor: "#111111",
                pointBorderWidth: 2
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                intersect: false,
                mode: "index"
            },

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    backgroundColor: "#222222",
                    titleColor: "#ffffff",
                    bodyColor: "#b9ff52",
                    padding: 12,

                    callbacks: {
                        label(context) {
                            return `体重：${context.parsed.y} kg`;
                        }
                    }
                }
            },

            scales: {
                x: {
                    ticks: {
                        color: "#aaaaaa",
                        maxTicksLimit: 7
                    },

                    grid: {
                        color: "rgba(255,255,255,0.05)"
                    }
                },

                y: {
                    ticks: {
                        color: "#aaaaaa",

                        callback(value) {
                            return `${value} kg`;
                        }
                    },

                    grid: {
                        color: "rgba(255,255,255,0.08)"
                    }
                }
            }
        }
    });
}

// ----------------------------------------
// 11. 体重履歴
// ----------------------------------------

function updateWeightHistory(weights) {
    weightHistory.innerHTML = "";

    if (weights.length === 0) {
        const empty = document.createElement("p");

        empty.className = "weight-empty-message";
        empty.textContent =
            "まだ体重の記録がありません。";

        weightHistory.appendChild(empty);
        return;
    }

    // 新しい順
    [...weights].reverse().forEach(item => {
        const row = document.createElement("div");
        row.className = "weight-history-item";

        const info = document.createElement("div");
        info.className = "weight-history-info";

        const date = document.createElement("span");
        date.className = "weight-history-date";
        date.textContent = item.date;

        const value = document.createElement("strong");
        value.className = "weight-history-value";
        value.textContent =
            `${formatWeight(item.weight)} kg`;

        info.appendChild(date);
        info.appendChild(value);

        const actions = document.createElement("div");
        actions.className = "weight-history-actions";

        // 編集
        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.className = "weight-edit-btn";
        editButton.textContent = "編集";

        editButton.addEventListener("click", () => {
            editWeightRecord(item);
        });

        // 削除
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "weight-delete-btn";
        deleteButton.textContent = "削除";

        deleteButton.addEventListener("click", () => {
            const confirmed = confirm(
                `${item.date} の体重記録を削除しますか？`
            );

            if (!confirmed) {
                return;
            }

            const updated = loadWeights().filter(
                record => record.date !== item.date
            );

            try {
                saveWeights(updated);

                if (editingDate === item.date) {
                    resetWeightForm();
                }

                weightMessage.textContent =
                    "体重記録を削除しました。";

                updateWeightDisplay();

            } catch (error) {
                console.error(error);

                weightMessage.textContent =
                    "削除に失敗しました。";
            }
        });

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        row.appendChild(info);
        row.appendChild(actions);

        weightHistory.appendChild(row);
    });
}

// ----------------------------------------
// 12. 画面全体の更新
// ----------------------------------------

function updateWeightDisplay() {
    const weights = sortWeights(loadWeights());

    updateWeightSummary(weights);
    updateWeightHistory(weights);
    updateWeightChart(weights);
}

// ----------------------------------------
// 13. 初期表示
// ----------------------------------------

updateWeightDisplay();