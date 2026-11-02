// ========================================
// My Workout Log
// 筋トレ記録アプリ
// ========================================

// HTMLの要素を取得
const workoutForm = document.getElementById("workoutForm");
const workoutList = document.getElementById("workoutList");
const dateInput = document.getElementById("date");
const submitButton = workoutForm.querySelector('button[type="submit"]');

// 現在編集中の記録ID
let editingId = null;

// 保存済みのトレーニング記録を読み込む
let workouts = [];

try {
    const savedWorkouts = JSON.parse(localStorage.getItem("workouts"));
    workouts = Array.isArray(savedWorkouts) ? savedWorkouts : [];
} catch (error) {
    console.error("記録の読み込みに失敗しました", error);
}

// ========================================
// 日付の初期設定
// ========================================

// 今日の日付を取得する関数
function getTodayDate() {
    const today = new Date();

    return new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().split("T")[0];
}

// 日付の初期値を今日に設定
dateInput.value = getTodayDate();


// ========================================
// データ保存
// ========================================

// 記録をlocalStorageに保存する関数
function saveWorkouts() {
    try {
        localStorage.setItem("workouts", JSON.stringify(workouts));
        return true;
    } catch (error) {
        console.error("記録の保存に失敗しました", error);
        alert("記録を保存できませんでした。ブラウザの保存容量などを確認してください。");
        return false;
    }
}


// ========================================
// 編集モードの終了
// ========================================

function resetEditMode() {

    // 編集対象を解除
    editingId = null;

    // ボタンの文字を元に戻す
    submitButton.textContent = "記録する";

    // フォームをリセット
    workoutForm.reset();

    // 日付を今日に戻す
    dateInput.value = getTodayDate();
}


// ========================================
// 記録一覧の表示
// ========================================

function displayWorkouts() {

    // 一覧を初期化
    workoutList.innerHTML = "";

    // 記録がない場合
    if (workouts.length === 0) {

        const message = document.createElement("p");
        message.textContent = "まだ記録がありません。";

        workoutList.appendChild(message);
        return;
    }

    // 日付の新しい順に並べる
    const sortedWorkouts = [...workouts].sort((a, b) =>
        b.date.localeCompare(a.date)
    );

    // 記録を1件ずつ表示
    sortedWorkouts.forEach((workout) => {

        // 記録カードを作成
        const card = document.createElement("div");
        card.className = "workout-card";

        // 記録情報
        const info = document.createElement("div");
        info.className = "workout-info";

        // 種目名
        const title = document.createElement("h3");
        title.textContent = workout.exercise;

        // 記録の詳細
        const details = document.createElement("p");
        details.textContent =
            `${workout.date} ｜ ${workout.weight}kg × ${workout.reps}回`;

        info.appendChild(title);
        info.appendChild(details);


        // ========================================
        // ボタングループ
        // ========================================

        const buttonGroup = document.createElement("div");
        buttonGroup.className = "button-group";


        // ========================================
        // 編集ボタン
        // ========================================

        const editButton = document.createElement("button");
        editButton.className = "edit-btn";
        editButton.textContent = "編集";

        editButton.addEventListener("click", () => {

            // 記録されている部位を取得
const bodyPart = workout.bodyPart ||
    Object.keys(exerciseData).find(part =>
        exerciseData[part].includes(workout.exercise)
    ) || "";

// 部位を選択
bodyPartSelect.value = bodyPart;

// 部位に対応する種目を表示
updateExerciseOptions(workout.exercise);
            document.getElementById("weight").value = workout.weight;
            document.getElementById("reps").value = workout.reps;
            dateInput.value = workout.date;

            // 編集対象のIDを保存
            editingId = workout.id;

            // ボタンの文字を変更
            submitButton.textContent = "変更を保存";

            // 入力フォームまでスクロール
            workoutForm.scrollIntoView({
                behavior: "smooth"
            });
        });


        // ========================================
        // 削除ボタン
        // ========================================

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "削除";

        deleteButton.addEventListener("click", () => {

            // 削除確認
            const confirmed = confirm("この記録を削除しますか？");

            if (!confirmed) return;

            // 削除後の記録を作成
            const updatedWorkouts = workouts.filter(
                item => item.id !== workout.id
            );

            // 保存前の状態を保持
            const previousWorkouts = workouts;

            // 記録を削除
            workouts = updatedWorkouts;

            // 保存に失敗したら元に戻す
            if (!saveWorkouts()) {
                workouts = previousWorkouts;
                return;
            }

            // 編集中の記録を削除した場合
            if (editingId === workout.id) {
                resetEditMode();
            }

            // 一覧とグラフを更新
            displayWorkouts();
            updateChart();
        });


        // ========================================
        // カードに要素を追加
        // ========================================

        buttonGroup.appendChild(editButton);
        buttonGroup.appendChild(deleteButton);

        card.appendChild(info);
        card.appendChild(buttonGroup);

        workoutList.appendChild(card);
    });
}


// ========================================
// 記録ボタンを押したときの処理
// ========================================

workoutForm.addEventListener("submit", (event) => {

    // ページの再読み込みを防ぐ
    event.preventDefault();

    // 入力された値を取得
    const exercise = document.getElementById("exercise").value;
    const bodyPart = bodyPartSelect.value;
    const weightValue = document.getElementById("weight").value;
    const repsValue = document.getElementById("reps").value;

    const weight = Number(weightValue);
    const reps = Number(repsValue);
    const date = dateInput.value;

    // ========================================
    // 入力チェック
    // ========================================

    if (
        !exercise ||
        !date ||
        weightValue === "" ||
        repsValue === "" ||
        !Number.isFinite(weight) ||
        weight < 0 ||
        !Number.isInteger(reps) ||
        reps < 1
    ) {
        alert("入力内容を確認してください。");
        return;
    }


    // ========================================
    // 編集モードの場合
    // ========================================

    if (editingId !== null) {

        // 編集対象の記録を探す
        const workoutIndex = workouts.findIndex(
            item => item.id === editingId
        );

        // 対象が見つからない場合
        if (workoutIndex === -1) {
            alert("編集対象の記録が見つかりません。");
            resetEditMode();
            
            // 一覧とグラフを更新
            displayWorkouts();
            updateChart();
            return;
        }

// 更新後の記録一覧を作成
const updatedWorkouts = workouts.map((item, index) => {

    if (index === workoutIndex) {
        return {
            ...item,
            bodyPart: bodyPart,  // ← ここを追加！
            exercise: exercise,
            weight: weight,
            reps: reps,
            date: date
        };
    }

    return item;
});

        const previousWorkouts = workouts;
        workouts = updatedWorkouts;

        // 保存
        if (!saveWorkouts()) {
            workouts = previousWorkouts;
            return;
        }

    } else {

        // ========================================
        // 新規登録の場合
        // ========================================

const newWorkout = {
    id: crypto.randomUUID(),
    bodyPart: bodyPart,
    exercise: exercise,
    weight: weight,
    reps: reps,
    date: date
};

        // 新しい記録一覧を作成
        const previousWorkouts = workouts;

        workouts = [...workouts, newWorkout];

        // 保存
        if (!saveWorkouts()) {
            workouts = previousWorkouts;
            return;
        }
    }


    // ========================================
    // 保存後の処理
    // ========================================

    // 編集モードを終了
    resetEditMode();

    // 一覧を更新
    displayWorkouts();
});


// ========================================
// ページ読み込み時の処理
// ========================================

// 保存済みの記録を表示
displayWorkouts();

// ========================================
// 筋トレ成長グラフ
// ========================================

// HTML要素を取得
const chartExercise = document.getElementById("chartExercise");
const chartMessage = document.getElementById("chartMessage");
const chartCanvas = document.getElementById("workoutChart");

// グラフを管理する変数
let workoutChart = null;


// ========================================
// グラフを更新する関数
// ========================================

function updateChart() {

    // 選択された種目を取得
    const selectedExercise = chartExercise.value;

    // 選択された種目の記録を取得
    const filteredWorkouts = workouts.filter(
        workout => workout.exercise === selectedExercise
    );

    // 日付の古い順に並べる
    filteredWorkouts.sort((a, b) =>
        a.date.localeCompare(b.date)
    );

    // 日付と重量を取得
    const labels = filteredWorkouts.map(workout => workout.date);
    const weights = filteredWorkouts.map(workout => workout.weight);

    // 既存のグラフを削除
    if (workoutChart !== null) {
        workoutChart.destroy();
        workoutChart = null;
    }

    // 記録がない場合
    if (filteredWorkouts.length === 0) {
        chartMessage.textContent = "この種目の記録はまだありません。";
        return;
    }

    // メッセージを消す
    chartMessage.textContent = "";

    // Chart.jsが読み込めていない場合
    if (typeof Chart === "undefined") {
        chartMessage.textContent = "グラフを読み込めませんでした。";
        return;
    }

    // 折れ線グラフを作成
    workoutChart = new Chart(chartCanvas, {

        type: "line",

        data: {
            labels: labels,

            datasets: [{
                label: selectedExercise + "（kg）",
                data: weights,
                borderColor: "#2563eb",
                backgroundColor: "rgba(37, 99, 235, 0.1)",
                borderWidth: 3,
                tension: 0.3,
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: true
                }
            },

            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "重量（kg）"
                    }
                },

                x: {
                    title: {
                        display: true,
                        text: "日付"
                    }
                }
            }
        }
    });
}


// ========================================
// 種目を変更したとき
// ========================================

chartExercise.addEventListener("change", updateChart);


// ========================================
// グラフの初期表示
// ========================================

updateChart();

// ========================================
// 部位別トレーニング種目
// ========================================

// 部位ごとの種目一覧
const exerciseData = {

    "胸": [
        "ベンチプレス",
        "ダンベルベンチプレス",
        "インクラインベンチプレス",
        "ダンベルフライ",
        "チェストプレス",
        "ペックフライ"
    ],

    "背中": [
        "デッドリフト",
        "ラットプルダウン",
        "シーテッドローイング",
        "ベントオーバーロウ",
        "懸垂",
        "ダンベルローイング"
    ],

    "脚": [
        "スクワット",
        "レッグプレス",
        "レッグカール",
        "レッグエクステンション",
        "ブルガリアンスクワット",
        "カーフレイズ"
    ],

    "肩": [
        "ショルダープレス",
        "サイドレイズ",
        "フロントレイズ",
        "リアレイズ",
        "アーノルドプレス"
    ],

    "腕": [
        "ダンベルカール",
        "バーベルカール",
        "ハンマーカール",
        "インクラインカール",
        "プレスダウン"
    ],

    "腹筋": [
        "クランチ",
        "レッグレイズ",
        "プランク",
        "アブローラー",
        "ケーブルクランチ"
    ],

    "お尻": [
        "ヒップスラスト",
        "グルートブリッジ",
        "ヒップアブダクション",
        "ケーブルキックバック"
    ]
};


// HTML要素を取得
const bodyPartSelect = document.getElementById("bodyPart");
const exerciseSelect = document.getElementById("exercise");


// ========================================
// 部位に応じて種目を変更
// ========================================

function updateExerciseOptions(selectedExercise = "") {

    const selectedBodyPart = bodyPartSelect.value;

    // 種目一覧を初期化
    exerciseSelect.innerHTML = "";

    // 最初の選択肢
    const defaultOption = document.createElement("option");
    defaultOption.value = "";

    if (!selectedBodyPart) {
        defaultOption.textContent = "先に部位を選択してください";
        exerciseSelect.disabled = true;
    } else {
        defaultOption.textContent = "種目を選択してください";
        exerciseSelect.disabled = false;
    }

    exerciseSelect.appendChild(defaultOption);

    // 部位が選択されていない場合
    if (!selectedBodyPart) return;

    // 対象の種目を追加
    const exercises = exerciseData[selectedBodyPart] || [];

    exercises.forEach((exercise) => {

        const option = document.createElement("option");

        option.value = exercise;
        option.textContent = exercise;

        exerciseSelect.appendChild(option);
    });

    // 編集時などに既存の種目を選択する
    if (selectedExercise) {

        // 一覧にない既存種目も編集できるようにする
        if (!exercises.includes(selectedExercise)) {
            const option = document.createElement("option");
            option.value = selectedExercise;
            option.textContent = selectedExercise;
            exerciseSelect.appendChild(option);
        }

        exerciseSelect.value = selectedExercise;
    }
}


// ========================================
// 部位が変更されたとき
// ========================================

bodyPartSelect.addEventListener("change", () => {
    updateExerciseOptions();
});


