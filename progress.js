// ========================================
// MY WORKOUT LOG
// 成長記録ページ
// ========================================

// HTML要素
const totalDays = document.getElementById("totalDays");
const totalRecords = document.getElementById("totalRecords");
const totalExercises = document.getElementById("totalExercises");

const bestExercise = document.getElementById("bestExercise");
const personalBest = document.getElementById("personalBest");
const previousBest = document.getElementById("previousBest");
const bestChange = document.getElementById("bestChange");

const chartExercise = document.getElementById("chartExercise");
const chartMessage = document.getElementById("chartMessage");
const chartCanvas = document.getElementById("workoutChart");

const periodButtons = document.querySelectorAll(
    ".progress-period-btn"
);

let workoutChart = null;
let selectedPeriod = "all";


// ========================================
// ① LocalStorageから記録を取得
// ========================================

function loadWorkouts() {
    try {
        const data = JSON.parse(
            localStorage.getItem("workouts") || "[]"
        );

        return Array.isArray(data) ? data : [];

    } catch (error) {
        console.error("記録の読み込みに失敗しました", error);
        return [];
    }
}

const workouts = loadWorkouts();


// ========================================
// ② データを整理
// ========================================

// 日付の確認
function isValidDate(date) {
    if (typeof date !== "string") return false;

    const match = date.match(
        /^(\d{4})-(\d{2})-(\d{2})$/
    );

    if (!match) return false;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const parsed = new Date(year, month - 1, day);

    return (
        parsed.getFullYear() === year &&
        parsed.getMonth() === month - 1 &&
        parsed.getDate() === day
    );
}

// 重量の確認
function getWeight(workout) {
    if (
        workout.weight === "" ||
        workout.weight === null ||
        workout.weight === undefined
    ) {
        return null;
    }

    const weight = Number(workout.weight);

    return Number.isFinite(weight) && weight >= 0
        ? weight
        : null;
}

// 有効な記録
const validWorkouts = workouts.filter(workout => {
    return (
        workout &&
        typeof workout.exercise === "string" &&
        workout.exercise.trim() !== "" &&
        isValidDate(workout.date) &&
        getWeight(workout) !== null
    );
});


// ========================================
// ③ 成長サマリー
// ========================================

// トレーニング日数
const uniqueDates = new Set(
    workouts
        .filter(workout =>
            workout && isValidDate(workout.date)
        )
        .map(workout => workout.date)
);

// 種目一覧
const exercises = [
    ...new Set(
        workouts
            .filter(workout =>
                workout &&
                typeof workout.exercise === "string"
            )
            .map(workout => workout.exercise.trim())
            .filter(Boolean)
    )
].sort((a, b) => a.localeCompare(b, "ja"));

// 数字を表示
if (totalDays) {
    totalDays.textContent = uniqueDates.size;
}

if (totalRecords) {
    totalRecords.textContent = workouts.length;
}

if (totalExercises) {
    totalExercises.textContent = exercises.length;
}


// ========================================
// ④ 種目選択欄
// ========================================

exercises.forEach(exercise => {

    const bestOption = document.createElement("option");
    bestOption.value = exercise;
    bestOption.textContent = exercise;

    bestExercise.appendChild(bestOption);

    const chartOption = document.createElement("option");
    chartOption.value = exercise;
    chartOption.textContent = exercise;

    chartExercise.appendChild(chartOption);
});


// ========================================
// ⑤ 日別最高重量
// ========================================

function getDailyBestRecords(exercise) {

    const dailyRecords = new Map();

    validWorkouts
        .filter(workout =>
            workout.exercise.trim() === exercise
        )
        .forEach(workout => {

            const date = workout.date;
            const weight = getWeight(workout);

            const previous = dailyRecords.get(date);

            if (
                previous === undefined ||
                weight > previous
            ) {
                dailyRecords.set(date, weight);
            }
        });

    return [...dailyRecords.entries()]
        .map(([date, weight]) => ({
            date,
            weight
        }))
        .sort((a, b) =>
            a.date.localeCompare(b.date)
        );
}


// ========================================
// ⑥ 重量の表示形式
// ========================================

function formatWeight(value) {
    return Number(value.toFixed(2));
}


// ========================================
// ⑦ 自己ベスト・前回比較
// ========================================

function updatePersonalBest() {

    const selectedExercise = bestExercise.value;

    if (!selectedExercise) {
        personalBest.textContent = "-- kg";
        previousBest.textContent = "-- kg";
        bestChange.textContent = "種目を選択してください";
        return;
    }

    const records = getDailyBestRecords(selectedExercise);

    if (records.length === 0) {
        personalBest.textContent = "-- kg";
        previousBest.textContent = "-- kg";
        bestChange.textContent = "記録がありません";
        return;
    }

    // 全期間の自己ベスト
    const maxWeight = Math.max(
        ...records.map(record => record.weight)
    );

    personalBest.textContent =
        `${formatWeight(maxWeight)} kg`;

    // 1日分しかない場合
    if (records.length === 1) {
        previousBest.textContent = "-- kg";
        bestChange.textContent =
            "最初の記録です！次回の成長が楽しみですね！";
        return;
    }

    // 最新の記録
    const latestRecord = records[records.length - 1];

    // 前回の記録
    const previousRecord = records[records.length - 2];

    // 最新日より前の自己ベスト
    const pastBest = Math.max(
        ...records
            .slice(0, -1)
            .map(record => record.weight)
    );

    // 前回との差
    const difference =
        latestRecord.weight - previousRecord.weight;

    previousBest.textContent =
        `${formatWeight(previousRecord.weight)} kg`;

    // 自己ベスト更新判定
    if (latestRecord.weight > pastBest) {

        const bestDifference =
            latestRecord.weight - pastBest;

        bestChange.textContent =
            `🏆 自己ベスト更新！ +${formatWeight(bestDifference)} kg`;

    } else if (difference > 0) {

        bestChange.textContent =
            `前回より +${formatWeight(difference)} kg UP！`;

    } else if (difference < 0) {

        bestChange.textContent =
            `前回比 ${formatWeight(difference)} kg`;

    } else {

        bestChange.textContent =
            "前回と同じ重量です";
    }
}


// ========================================
// ⑧ 期間でデータを絞り込む
// ========================================

function filterRecordsByPeriod(records) {

    if (selectedPeriod === "all") {
        return records;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);

    // 直近7日間（今日を含む）
    if (selectedPeriod === "1w") {

        startDate.setDate(
            startDate.getDate() - 6
        );

    } else if (selectedPeriod === "1m") {

        startDate.setMonth(
            startDate.getMonth() - 1
        );

    } else if (selectedPeriod === "3m") {

        startDate.setMonth(
            startDate.getMonth() - 3
        );

    } else {

        return records;
    }

    return records.filter(record => {

        const [year, month, day] =
            record.date.split("-").map(Number);

        const recordDate = new Date(
            year,
            month - 1,
            day
        );

        return (
            recordDate >= startDate &&
            recordDate <= today
        );
    });
}


// ========================================
// ⑨ 成長グラフ
// ========================================

function updateChart() {

    const selectedExercise = chartExercise.value;

    // 古いグラフを削除
    if (workoutChart !== null) {
        workoutChart.destroy();
        workoutChart = null;
    }

    if (!selectedExercise) {
        chartMessage.textContent =
            "種目を選択すると、成長グラフが表示されます。";
        return;
    }

    // 種目の全記録
    const allRecords =
        getDailyBestRecords(selectedExercise);

    // 期間で絞り込み
    const records =
        filterRecordsByPeriod(allRecords);

    // 記録がない場合
    if (records.length === 0) {

        chartMessage.textContent =
            "選択した期間の記録はありません。";

        return;
    }

    // Chart.jsの読み込み確認
    if (typeof Chart === "undefined") {

        chartMessage.textContent =
            "グラフを読み込めませんでした。インターネット接続を確認してください。";

        return;
    }

    // 日付は YYYY-MM-DD のまま
    const labels = records.map(record => record.date);

    const weights = records.map(record => record.weight);

    // 記録が1日しかない場合
    if (records.length === 1) {

        chartMessage.textContent =
            "📈 あと1日記録すると、重量の変化を確認できます！";

    } else {

        chartMessage.textContent = "";
    }

    // グラフ作成
    workoutChart = new Chart(chartCanvas, {

        type: "line",

        data: {

            labels,

            datasets: [{

                label: `${selectedExercise}（kg）`,

                data: weights,

                borderColor: "#b9ff52",

                backgroundColor:
                    "rgba(185, 255, 82, 0.12)",

                borderWidth: 3,

                tension: 0.3,

                fill: true,

                pointRadius: records.length === 1 ? 6 : 4,

                pointHoverRadius: 7,

                pointBackgroundColor: "#b9ff52",

                pointBorderColor: "#161b17",

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

                    backgroundColor: "#202720",

                    titleColor: "#ffffff",

                    bodyColor: "#b9ff52",

                    borderColor: "#394339",

                    borderWidth: 1,

                    callbacks: {

                        label: context =>
                            `最高重量：${context.parsed.y} kg`
                    }
                }
            },

            scales: {

                x: {

                    ticks: {

                        color: "#a3ada3",

                        maxRotation: 0,

                        autoSkip: true,

                        maxTicksLimit: 7
                    },

                    grid: {
                        color: "rgba(255,255,255,0.04)"
                    },

                    border: {
                        color: "#394339"
                    }
                },

                y: {

                    beginAtZero: false,

                    ticks: {

                        color: "#a3ada3",

                        callback: value => `${value} kg`
                    },

                    grid: {
                        color: "rgba(255,255,255,0.06)"
                    },

                    border: {
                        color: "#394339"
                    }
                }
            }
        }
    });
}


// ========================================
// ⑩ 期間切り替え
// ========================================

periodButtons.forEach(button => {

    button.addEventListener("click", () => {

        selectedPeriod = button.dataset.period;

        periodButtons.forEach(btn => {

            const isActive =
                btn.dataset.period === selectedPeriod;

            btn.classList.toggle(
                "is-active",
                isActive
            );

            btn.setAttribute(
                "aria-pressed",
                String(isActive)
            );
        });

        updateChart();
    });
});


// ========================================
// ⑪ 種目変更イベント
// ========================================

bestExercise.addEventListener(
    "change",
    updatePersonalBest
);

chartExercise.addEventListener(
    "change",
    updateChart
);


// ========================================
// ⑫ 初期表示
// ========================================

if (exercises.length > 0) {

    bestExercise.value = exercises[0];

    chartExercise.value = exercises[0];
}

updatePersonalBest();

updateChart();