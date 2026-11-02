// ========================================
// MY WORKOUT LOG
// HOME DASHBOARD
// ========================================

"use strict";

// ========================================
// ① 共通処理
// ========================================

// localStorageから配列を取得
function readHomeArray(key) {
    try {
        const data = JSON.parse(
            localStorage.getItem(key) || "[]"
        );

        return Array.isArray(data) ? data : [];

    } catch (error) {
        console.error(`${key}の読み込みに失敗しました`, error);
        return [];
    }
}

// HTML要素を取得
function homeElement(id) {
    return document.getElementById(id);
}

// 要素が存在する場合だけ文字を変更
function setHomeText(id, text) {
    const element = homeElement(id);

    if (element) {
        element.textContent = text;
    }
}

// 日付をYYYY-MM-DD形式にする
function formatHomeDate(date) {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// 日付表示をMM/DD形式にする
function shortHomeDate(dateString) {
    return dateString.slice(5).replace("-", "/");
}

// 保存されたデータ
const workouts = readHomeArray("workouts")
    .filter(item => item && typeof item === "object");

const bodyWeights = readHomeArray("bodyWeights")
    .filter(item => item && typeof item === "object");

const today = new Date();


// ========================================
// ② 今月のトレーニング統計
// ========================================

const currentYear = today.getFullYear();

const currentMonth = String(
    today.getMonth() + 1
).padStart(2, "0");

const monthPrefix =
    `${currentYear}-${currentMonth}-`;

const monthlyWorkouts = workouts.filter(item =>
    typeof item.date === "string" &&
    item.date.startsWith(monthPrefix)
);

// 今月のトレーニング日数
const trainingDays = new Set(
    monthlyWorkouts.map(item => item.date)
).size;

// 今月の記録件数
const totalWorkouts = monthlyWorkouts.length;

setHomeText("trainingDays", trainingDays);
setHomeText("totalWorkouts", totalWorkouts);

setHomeText(
    "currentMonthLabel",
    `${currentYear} / ${currentMonth}`
);


// ========================================
// ③ 最近のトレーニング記録
// ========================================

function renderRecentWorkouts() {

    const container = homeElement("recentWorkouts");

    if (!container) return;

    container.innerHTML = "";

    const latestWorkouts = [...workouts]
        .filter(item =>
            typeof item.date === "string"
        )
        .sort((a, b) =>
            b.date.localeCompare(a.date)
        )
        .slice(0, 3);

    // 記録がない場合
    if (latestWorkouts.length === 0) {

        const empty = document.createElement("div");
        empty.className = "home-empty";

        const title = document.createElement("h3");
        title.textContent =
            "最初の一歩を、記録しよう。";

        const description = document.createElement("p");
        description.textContent =
            "トレーニングを記録すると、ここに履歴が表示されます。";

        const link = document.createElement("a");
        link.href = "record.html";
        link.textContent = "最初の記録をつける ↗";

        empty.append(title, description, link);

        container.appendChild(empty);

        return;
    }

    // 最近の記録を表示
    latestWorkouts.forEach((workout, index) => {

        const row = document.createElement("article");
        row.className = "home-activity-row";

        const number = document.createElement("span");
        number.className = "activity-number";

        number.textContent =
            String(index + 1).padStart(2, "0");

        const info = document.createElement("div");
        info.className = "activity-info";

        const title = document.createElement("h3");
        title.textContent =
            workout.exercise || "トレーニング";

        const details = document.createElement("p");

        details.textContent =
            `${workout.weight ?? 0}kg × ` +
            `${workout.reps ?? 0}回 × ` +
            `${workout.sets ?? 1}セット`;

        info.append(title, details);

        if (workout.memo) {

            const memo = document.createElement("p");
            memo.className = "activity-memo";

            memo.textContent = workout.memo;

            info.appendChild(memo);
        }

        const date = document.createElement("time");
        date.className = "activity-date";

        date.dateTime = workout.date;
        date.textContent = shortHomeDate(workout.date);

        row.append(number, info, date);

        container.appendChild(row);
    });
}

renderRecentWorkouts();


// ========================================
// ④ グラフ共通設定
// ========================================

const chartColors = {
    lime: "#b9ff52",
    text: "#b5c2b7",
    grid: "rgba(160, 180, 163, 0.12)"
};

function homeChartOptions(unit) {

    return {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                display: false
            },

            tooltip: {
                callbacks: {
                    label: context =>
                        `${context.parsed.y} ${unit}`
                }
            }
        },

        scales: {
            x: {
                ticks: {
                    color: chartColors.text,
                    maxTicksLimit: 5
                },

                grid: {
                    display: false
                }
            },

            y: {
                ticks: {
                    color: chartColors.text
                },

                grid: {
                    color: chartColors.grid
                }
            }
        }
    };
}

// 折れ線グラフを作成
function createHomeChart(canvasId, labels, values, unit) {

    if (typeof Chart === "undefined") {
        return null;
    }

    const canvas = homeElement(canvasId);

    if (!canvas) {
        return null;
    }

    return new Chart(canvas, {

        type: "line",

        data: {
            labels: labels,

            datasets: [{
                data: values,

                borderColor: chartColors.lime,

                backgroundColor:
                    "rgba(185, 255, 82, 0.09)",

                borderWidth: 2.5,

                pointBackgroundColor:
                    chartColors.lime,

                pointRadius: 3,
                pointHoverRadius: 6,

                tension: 0.3,
                fill: true
            }]
        },

        options: homeChartOptions(unit)
    });
}


// ========================================
// ⑤ 体重推移グラフ
// ========================================

function renderWeightDashboard() {

    const weights = [...bodyWeights]
        .filter(item =>
            typeof item.date === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(item.date) &&
            Number.isFinite(Number(item.weight)) &&
            Number(item.weight) > 0
        )
        .sort((a, b) =>
            a.date.localeCompare(b.date)
        );

    if (weights.length === 0) {

        setHomeText(
            "homeWeightMessage",
            "体重を記録すると、ここに推移が表示されます。"
        );

        return;
    }

    // 最新の体重
    const latest = weights[weights.length - 1];

    setHomeText(
        "homeLatestWeight",
        Number(latest.weight).toLocaleString("ja-JP")
    );

    // 前回との差
    if (weights.length >= 2) {

        const previous = weights[weights.length - 2];

        const difference = Math.round(
            (Number(latest.weight) -
                Number(previous.weight)) * 10
        ) / 10;

        const sign = difference > 0 ? "+" : "";

        setHomeText(
            "homeWeightChange",
            `前回比 ${sign}${difference}kg`
        );
    }

    // 30日前の日付
    const threshold = new Date(today);

    threshold.setHours(0, 0, 0, 0);
    threshold.setDate(threshold.getDate() - 29);

    const startDate = formatHomeDate(threshold);
    const endDate = formatHomeDate(today);

    // 直近30日間の体重記録
    const recentWeights = weights.filter(item =>
        item.date >= startDate &&
        item.date <= endDate
    );

    if (recentWeights.length === 0) {

        setHomeText(
            "homeWeightMessage",
            "直近30日間の体重記録はありません。"
        );

        return;
    }

    const chart = createHomeChart(
        "homeWeightChart",

        recentWeights.map(item =>
            shortHomeDate(item.date)
        ),

        recentWeights.map(item =>
            Number(item.weight)
        ),

        "kg"
    );

    if (!chart) {

        setHomeText(
            "homeWeightMessage",
            "グラフを読み込めませんでした。"
        );

    } else {

        setHomeText("homeWeightMessage", "");
    }
}

renderWeightDashboard();


// ========================================
// ⑥ 筋力成長グラフ
// ========================================

const homeExerciseSelect =
    homeElement("homeExerciseSelect");

let homeStrengthChart = null;

const strengthRecords = workouts.filter(item =>
    typeof item.exercise === "string" &&
    typeof item.date === "string" &&
    Number.isFinite(Number(item.weight)) &&
    Number(item.weight) >= 0
);

// 種目一覧
const exerciseNames = [
    ...new Set(
        strengthRecords.map(item => item.exercise)
    )
]
    .filter(Boolean)
    .sort();

function updateHomeStrength() {

    if (!homeExerciseSelect) return;

    // 前のグラフを削除
    if (homeStrengthChart) {

        homeStrengthChart.destroy();
        homeStrengthChart = null;
    }

    const selectedExercise = homeExerciseSelect.value;

    if (!selectedExercise) {

        setHomeText(
            "homeStrengthMessage",
            "種目を選択すると成長グラフが表示されます。"
        );

        return;
    }

    const records = strengthRecords
        .filter(item =>
            item.exercise === selectedExercise
        )
        .sort((a, b) =>
            a.date.localeCompare(b.date)
        );

    homeStrengthChart = createHomeChart(
        "homeStrengthChart",

        records.map(item =>
            shortHomeDate(item.date)
        ),

        records.map(item =>
            Number(item.weight)
        ),

        "kg"
    );

    if (!homeStrengthChart) {

        setHomeText(
            "homeStrengthMessage",
            "グラフを読み込めませんでした。"
        );

        return;
    }

    setHomeText(
        "homeStrengthMessage",
        `${records.length}件の記録を表示中`
    );
}

// セレクトボックスに種目を追加
if (homeExerciseSelect) {

    exerciseNames.forEach(name => {

        const option = document.createElement("option");

        option.value = name;
        option.textContent = name;

        homeExerciseSelect.appendChild(option);
    });

    if (exerciseNames.length > 0) {

        homeExerciseSelect.value = exerciseNames[0];
    }

    homeExerciseSelect.addEventListener(
        "change",
        updateHomeStrength
    );

    updateHomeStrength();
}


// ========================================
// ⑦ 週間トレーニングカレンダー
// ========================================

const weeklyActivity =
    homeElement("weeklyActivity");

const weeklyCount =
    homeElement("weeklyCount");

const weekNames = [
    "月", "火", "水", "木", "金", "土", "日"
];

// 今週の月曜日
const monday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
);

monday.setDate(
    monday.getDate() -
    ((monday.getDay() + 6) % 7)
);

// トレーニングした日付
const recordedDates = new Set(
    workouts
        .filter(item =>
            typeof item.date === "string"
        )
        .map(item => item.date)
);


// ========================================
// ⑧ 週間詳細エリアを作成
// ========================================

let weeklyDetails = null;
let weeklyDetailsInner = null;

function createWeeklyDetails() {

    if (!weeklyActivity) return;

    weeklyDetails = document.createElement("div");

    weeklyDetails.id = "weeklyDetails";
    weeklyDetails.className = "weekly-details";

    // アニメーション用の内側エリア
    weeklyDetailsInner = document.createElement("div");

    weeklyDetailsInner.className =
        "weekly-details-inner";

    weeklyDetails.appendChild(weeklyDetailsInner);

    weeklyActivity.insertAdjacentElement(
        "afterend",
        weeklyDetails
    );
}


// ========================================
// ⑨ 選択した日の記録を表示
// ========================================

function showWeeklyDetails(dateKey, dayName) {

    if (!weeklyDetailsInner) return;

    weeklyDetailsInner.innerHTML = "";

    // タイトル
    const title = document.createElement("h3");

    title.className = "weekly-details-title";

    title.textContent =
        `${dateKey.replaceAll("-", "/")}（${dayName}）のトレーニング`;

    weeklyDetailsInner.appendChild(title);

    // 選択した日の記録
    const dailyWorkouts = workouts.filter(item =>
        item.date === dateKey
    );

    // 記録がない場合
    if (dailyWorkouts.length === 0) {

        const empty = document.createElement("p");

        empty.className = "weekly-details-empty";

        empty.textContent =
            "この日のトレーニング記録はありません。";

        weeklyDetailsInner.appendChild(empty);

        return;
    }

    // 部位ごとに分類
    const groups = new Map();

    dailyWorkouts.forEach(workout => {

        const bodyPart =
            workout.bodyPart || "その他";

        if (!groups.has(bodyPart)) {

            groups.set(bodyPart, []);
        }

        groups.get(bodyPart).push(workout);
    });

    // 部位ごとに表示
    groups.forEach((records, bodyPart) => {

        const group = document.createElement("div");

        group.className = "weekly-detail-group";

        const groupTitle = document.createElement("h4");

        groupTitle.className = "weekly-group-title";
        groupTitle.textContent = bodyPart;

        group.appendChild(groupTitle);

        records.forEach((workout, index) => {

            const row = document.createElement("div");

            row.className = "weekly-detail-row";

            const number = document.createElement("span");

            number.className = "weekly-detail-number";

            number.textContent =
                String(index + 1).padStart(2, "0");

            const info = document.createElement("div");

            info.className = "weekly-detail-info";

            const exercise = document.createElement("strong");

            exercise.textContent =
                workout.exercise || "トレーニング";

            const detail = document.createElement("p");

            detail.textContent =
                `${workout.weight ?? 0}kg × ` +
                `${workout.reps ?? 0}回 × ` +
                `${workout.sets ?? 1}セット`;

            info.append(exercise, detail);

            // メモ
            if (workout.memo) {

                const memo = document.createElement("p");

                memo.className = "weekly-detail-memo";
                memo.textContent = workout.memo;

                info.appendChild(memo);
            }

            row.append(number, info);

            group.appendChild(row);
        });

        weeklyDetailsInner.appendChild(group);
    });

    // 履歴ページへのリンク
    const historyLink = document.createElement("a");

    historyLink.href = "history.html";

    historyLink.className = "weekly-history-link";

    historyLink.textContent =
        "すべての履歴を見る →";

    weeklyDetailsInner.appendChild(historyLink);
}


// ========================================
// ⑩ 曜日のクリック処理
// ========================================

function renderWeeklyActivity() {

    if (!weeklyActivity) return;

    weeklyActivity.innerHTML = "";

    createWeeklyDetails();

    let activeDays = 0;

    for (let i = 0; i < 7; i++) {

        const date = new Date(monday);

        date.setDate(
            monday.getDate() + i
        );

        const dateKey = formatHomeDate(date);

        const isDone = recordedDates.has(dateKey);

        const isToday =
            dateKey === formatHomeDate(today);

        if (isDone) {
            activeDays++;
        }

        // 曜日ボタン
        const button = document.createElement("button");

        button.type = "button";

        button.className = "weekly-day";

        if (isDone) {
            button.classList.add("is-done");
        }

        if (isToday) {
            button.classList.add("is-today");
        }

        button.setAttribute(
            "aria-label",
            `${dateKey}（${weekNames[i]}）の記録を確認`
        );

        button.setAttribute(
            "aria-pressed",
            "false"
        );

        button.setAttribute(
            "aria-controls",
            "weeklyDetails"
        );

        // 曜日名
        const label = document.createElement("span");

        label.className = "weekly-day-name";

        label.textContent = weekNames[i];

        // 記録マーク
        const dot = document.createElement("span");

        dot.className = "weekly-dot";

        dot.setAttribute("aria-hidden", "true");

        button.append(label, dot);

        // ====================================
        // クリックしたときの処理
        // ====================================

        button.addEventListener("click", () => {

            // すでに選択されているか
            const isSelected =
                button.classList.contains("is-selected");

            // 全曜日の選択を解除
            weeklyActivity
                .querySelectorAll(".weekly-day")
                .forEach(card => {

                    card.classList.remove("is-selected");

                    card.setAttribute(
                        "aria-pressed",
                        "false"
                    );
                });

            // ====================================
            // 同じ曜日なら閉じる
            // ====================================

            if (isSelected) {

                weeklyDetails.classList.remove("is-open");

                return;
            }

            // ====================================
            // 別の曜日なら表示
            // ====================================

            button.classList.add("is-selected");

            button.setAttribute(
                "aria-pressed",
                "true"
            );

            // 記録内容を更新
            showWeeklyDetails(
                dateKey,
                weekNames[i]
            );

            // 開くアニメーション
            weeklyDetails.classList.add("is-open");
        });

        weeklyActivity.appendChild(button);
    }

    setHomeText(
        "weeklyCount",
        `${activeDays} / 7 DAYS`
    );
}

renderWeeklyActivity();