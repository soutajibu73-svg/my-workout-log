// ========================================
// My Workout Log - 記録画面
// ========================================

const exerciseData = {

    // 胸
    "胸": [
        "ベンチプレス",
        "インクラインベンチプレス",
        "デクラインベンチプレス",
        "ダンベルベンチプレス",
        "インクラインダンベルプレス",
        "ダンベルフライ",
        "インクラインダンベルフライ",
        "チェストプレス",
        "インクラインチェストプレス",
        "ペックフライ",
        "ケーブルクロスオーバー",
        "ディップス",
        "腕立て伏せ"
    ],

    // 背中
    "背中": [
        "デッドリフト",
        "ラットプルダウン",
        "シーテッドローイング",
        "ベントオーバーロウ",
        "懸垂",
        "ワンハンドダンベルロー",
        "Tバーロー",
        "ケーブルロー",
        "ストレートアームプルダウン",
        "チンニング（逆手）",
        "バックエクステンション"
    ],

    // 脚
    "脚": [
        "スクワット",
        "フロントスクワット",
        "スミスマシンスクワット",
        "レッグプレス",
        "レッグカール",
        "レッグエクステンション",
        "ブルガリアンスクワット",
        "ランジ",
        "ルーマニアンデッドリフト",
        "カーフレイズ",
        "シーテッドカーフレイズ",
        "ハックスクワット"
    ],

    // 肩
    "肩": [
        "ショルダープレス",
        "ダンベルショルダープレス",
        "スミスマシンショルダープレス",
        "サイドレイズ",
        "ケーブルサイドレイズ",
        "フロントレイズ",
        "リアレイズ",
        "リアデルトフライ",
        "フェイスプル",
        "アップライトロー",
        "アーノルドプレス"
    ],

    // 腕
    "腕": [
        "ダンベルカール",
        "バーベルカール",
        "ハンマーカール",
        "プリーチャーカール",
        "インクラインダンベルカール",
        "ケーブルカール",
        "コンセントレーションカール",
        "プレスダウン",
        "ケーブルプレスダウン",
        "スカルクラッシャー",
        "フレンチプレス",
        "トライセプスエクステンション",
        "ナローベンチプレス"
    ],

    // 腹筋
    "腹筋": [
        "クランチ",
        "レッグレイズ",
        "プランク",
        "アブローラー",
        "ケーブルクランチ",
        "ハンギングレッグレイズ",
        "リバースクランチ",
        "ロシアンツイスト",
        "サイドプランク",
        "アブドミナルクランチ"
    ],

    // お尻
    "お尻": [
        "ヒップスラスト",
        "グルートブリッジ",
        "ヒップアブダクション",
        "ヒップアダクション",
        "ケーブルキックバック",
        "ドンキーキック",
        "ステップアップ",
        "スミスマシンヒップスラスト"
    ]

};


// ========================================
// オリジナル種目の読み込み
// ========================================

function loadCustomExercises() {
    try {
        const data = JSON.parse(
            localStorage.getItem("customExercises") || "{}"
        );

        return data && typeof data === "object" && !Array.isArray(data)
            ? data
            : {};

    } catch (error) {
        console.error(error);
        return {};
    }
}


// 保存済みのオリジナル種目を読み込む
const customExercises = loadCustomExercises();

Object.keys(exerciseData).forEach(bodyPart => {

    const savedExercises = customExercises[bodyPart];

    if (!Array.isArray(savedExercises)) return;

    savedExercises.forEach(exercise => {

        if (
            typeof exercise === "string" &&
            !exerciseData[bodyPart].includes(exercise)
        ) {
            exerciseData[bodyPart].push(exercise);
        }

    });

});


// ========================================
// HTML要素の取得
// ========================================

const form = document.getElementById("workoutForm");

const bodyPartSelect = document.getElementById("bodyPart");
const exerciseSelect = document.getElementById("exercise");
const copyButton = document.getElementById("copyPrevious");
const dateInput = document.getElementById("date");
const saveMessage = document.getElementById("saveMessage");


// ========================================
// トレーニング記録の読み込み
// ========================================

function loadWorkouts() {
    try {
        const data = JSON.parse(
            localStorage.getItem("workouts") || "[]"
        );

        return Array.isArray(data) ? data : [];

    } catch (error) {
        console.error(error);
        return [];
    }
}


// ========================================
// 今日の日付を取得
// ========================================

function todayString() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

dateInput.value = todayString();


// ========================================
// オリジナル種目の登録
// ========================================

const customExerciseInput = document.getElementById("customExercise");
const addExerciseButton = document.getElementById("addExercise");
const exerciseMessage = document.getElementById("exerciseMessage");

addExerciseButton.addEventListener("click", () => {

    const bodyPart = bodyPartSelect.value;
    const exerciseName = customExerciseInput.value.trim();

    // 部位が未選択
    if (!bodyPart) {
        exerciseMessage.textContent =
            "先に鍛える部位を選択してください。";
        return;
    }

    // 種目名が未入力
    if (!exerciseName) {
        exerciseMessage.textContent =
            "追加する種目名を入力してください。";
        return;
    }

    // 重複チェック
    if (exerciseData[bodyPart].includes(exerciseName)) {
        exerciseMessage.textContent =
            "この種目はすでに登録されています。";
        return;
    }

    const savedExercises = loadCustomExercises();

    if (!Array.isArray(savedExercises[bodyPart])) {
        savedExercises[bodyPart] = [];
    }

    savedExercises[bodyPart].push(exerciseName);

    try {
        localStorage.setItem(
            "customExercises",
            JSON.stringify(savedExercises)
        );

    } catch (error) {
        console.error(error);

        exerciseMessage.textContent =
            "種目を保存できませんでした。";

        return;
    }

    // 種目一覧に追加
    exerciseData[bodyPart].push(exerciseName);

    const option = document.createElement("option");

    option.value = exerciseName;
    option.textContent = exerciseName;

    exerciseSelect.appendChild(option);
    exerciseSelect.disabled = false;

    // 追加した種目を自動選択
    exerciseSelect.value = exerciseName;
    exerciseSelect.dispatchEvent(new Event("change"));

    customExerciseInput.value = "";

    exerciseMessage.textContent =
        `「${exerciseName}」を追加しました！💪`;

    // 管理一覧を更新
    renderCustomExerciseList();
});


// ========================================
// オリジナル種目の一覧表示
// ========================================

const customExerciseList =
    document.getElementById("customExerciseList");

function renderCustomExerciseList() {

    const bodyPart = bodyPartSelect.value;

    customExerciseList.replaceChildren();

    // 部位が未選択
    if (!bodyPart) {

        const item = document.createElement("li");

        item.className = "record-custom-empty";
        item.textContent =
            "まず鍛える部位を選択してください。";

        customExerciseList.appendChild(item);

        return;
    }

    const savedExercises = loadCustomExercises();

    const names = Array.isArray(savedExercises[bodyPart])
        ? savedExercises[bodyPart].filter(
            name => typeof name === "string"
        )
        : [];

    // オリジナル種目がない場合
    if (names.length === 0) {

        const item = document.createElement("li");

        item.className = "record-custom-empty";
        item.textContent =
            "この部位に追加した種目はまだありません。";

        customExerciseList.appendChild(item);

        return;
    }

    // 登録済みの種目を表示
    names.forEach(name => {

        const item = document.createElement("li");
        item.className = "record-custom-item";

        const title = document.createElement("span");
        title.textContent = name;

        const removeButton = document.createElement("button");

        removeButton.type = "button";
        removeButton.className = "record-remove-exercise";
        removeButton.textContent = "削除";

        removeButton.setAttribute(
            "aria-label",
            `${name}を削除`
        );

        removeButton.addEventListener("click", () => {
            removeCustomExercise(bodyPart, name);
        });

        item.append(title, removeButton);

        customExerciseList.appendChild(item);
    });
}


// ========================================
// オリジナル種目の削除
// ========================================

function removeCustomExercise(bodyPart, name) {

    // 削除前の確認
    const confirmed = window.confirm(
        `「${name}」を種目一覧から削除しますか？\n` +
        "※過去のトレーニング記録は残ります。"
    );

    if (!confirmed) return;

    const savedExercises = loadCustomExercises();

    if (
        !Array.isArray(savedExercises[bodyPart]) ||
        !savedExercises[bodyPart].includes(name)
    ) {
        renderCustomExerciseList();
        return;
    }

    // localStorageから削除
    savedExercises[bodyPart] =
        savedExercises[bodyPart].filter(
            item => item !== name
        );

    if (savedExercises[bodyPart].length === 0) {
        delete savedExercises[bodyPart];
    }

    try {
        localStorage.setItem(
            "customExercises",
            JSON.stringify(savedExercises)
        );

    } catch (error) {
        console.error(error);

        exerciseMessage.textContent =
            "種目を削除できませんでした。";

        return;
    }

    // 種目の選択肢からも削除
    exerciseData[bodyPart] =
        exerciseData[bodyPart].filter(
            item => item !== name
        );

    if (bodyPartSelect.value === bodyPart) {

        const selected = exerciseSelect.value;

        const option = Array.from(
            exerciseSelect.options
        ).find(item => item.value === name);

        if (option) {
            option.remove();
        }

        // 削除した種目を選択中だった場合
        if (selected === name) {

            exerciseSelect.value = "";

            exerciseSelect.dispatchEvent(
                new Event("change")
            );
        }
    }

    // 一覧を更新
    renderCustomExerciseList();

    exerciseMessage.textContent =
        `「${name}」を削除しました。過去の記録は残っています。`;
}


// 初回表示
renderCustomExerciseList();


// ========================================
// 部位を選択したとき
// ========================================

bodyPartSelect.addEventListener("change", () => {

    exerciseSelect.innerHTML =
        '<option value="">種目を選択してください</option>';

    const exercises =
        exerciseData[bodyPartSelect.value] || [];

    exercises.forEach(exercise => {

        const option = document.createElement("option");

        option.value = exercise;
        option.textContent = exercise;

        exerciseSelect.appendChild(option);
    });

    exerciseSelect.disabled = exercises.length === 0;
    copyButton.disabled = true;

    renderCustomExerciseList();
});


// ========================================
// 前回のトレーニング記録
// ========================================

const previousWorkout =
    document.getElementById("previousWorkout");

const previousDate =
    document.getElementById("previousDate");

const previousWeight =
    document.getElementById("previousWeight");

const previousReps =
    document.getElementById("previousReps");

const previousSets =
    document.getElementById("previousSets");


// 前回の記録を表示
function showPreviousWorkout() {

    const previous = findPreviousWorkout();

    if (!previous) {

        previousWorkout.hidden = true;
        copyButton.disabled = true;

        return;
    }

    previousWorkout.hidden = false;
    copyButton.disabled = false;

    const today =
        new Date(`${todayString()}T00:00:00`);

    const workoutDate =
        new Date(`${previous.date}T00:00:00`);

    const daysAgo = Math.round(
        (today - workoutDate) / (1000 * 60 * 60 * 24)
    );

    let dateText = previous.date;

    if (daysAgo === 0) {
        dateText += "（今日）";

    } else if (daysAgo > 0) {
        dateText += `（${daysAgo}日前）`;
    }

    previousDate.textContent =
        `📅 前回：${dateText}`;

    previousWeight.textContent =
        `🏋️ 重量：${previous.weight}kg`;

    previousReps.textContent =
        `💪 回数：${previous.reps}回`;

    previousSets.textContent =
        `🔄 セット数：${previous.sets || 1}セット`;
}


// 種目変更時
exerciseSelect.addEventListener(
    "change",
    showPreviousWorkout
);

// 日付変更時
dateInput.addEventListener(
    "change",
    showPreviousWorkout
);


// 前回の同じ種目を探す
function findPreviousWorkout() {

    const exercise = exerciseSelect.value;

    if (!exercise) return null;

    return loadWorkouts()
        .filter(item => item.exercise === exercise)
        .sort((a, b) =>
            b.date.localeCompare(a.date)
        )[0] || null;
}


// ========================================
// 前回との比較機能
// ========================================

const workoutComparison =
    document.getElementById("workoutComparison");

const weightComparison =
    document.getElementById("weightComparison");

const repsComparison =
    document.getElementById("repsComparison");

const setsComparison =
    document.getElementById("setsComparison");

const weightInput =
    document.getElementById("weight");

const repsInput =
    document.getElementById("reps");

const setsInput =
    document.getElementById("sets");


// 比較結果の更新
function updateComparison() {

    const previous = findPreviousWorkout();

    if (!previous) {
        workoutComparison.hidden = true;
        return;
    }

    if (
        weightInput.value === "" ||
        repsInput.value === "" ||
        setsInput.value === ""
    ) {
        workoutComparison.hidden = true;
        return;
    }

    const weight = Number(weightInput.value);
    const reps = Number(repsInput.value);
    const sets = Number(setsInput.value);

    if (
        !Number.isFinite(weight) || weight < 0 ||
        !Number.isInteger(reps) || reps < 1 ||
        !Number.isInteger(sets) || sets < 1
    ) {
        workoutComparison.hidden = true;
        return;
    }

    const weightDiff =
        weight - Number(previous.weight);

    const repsDiff =
        reps - Number(previous.reps);

    const setsDiff =
        sets - Number(previous.sets || 1);

    function formatDifference(diff, unit) {

        if (diff > 0) {
            return `🟢 +${diff}${unit}`;
        }

        if (diff < 0) {
            return `🔵 ${diff}${unit}`;
        }

        return "➖ 変化なし";
    }

    weightComparison.textContent =
        `🏋️ 重量：${formatDifference(weightDiff, "kg")}`;

    repsComparison.textContent =
        `💪 回数：${formatDifference(repsDiff, "回")}`;

    setsComparison.textContent =
        `🔄 セット数：${formatDifference(setsDiff, "セット")}`;

    workoutComparison.hidden = false;
}


// 入力変更時に比較
weightInput.addEventListener(
    "input",
    updateComparison
);

repsInput.addEventListener(
    "input",
    updateComparison
);

setsInput.addEventListener(
    "input",
    updateComparison
);

exerciseSelect.addEventListener(
    "change",
    updateComparison
);

copyButton.addEventListener(
    "click",
    updateComparison
);

bodyPartSelect.addEventListener("change", () => {
    workoutComparison.hidden = true;
});


// ========================================
// 前回の記録をコピー
// ========================================

copyButton.addEventListener("click", () => {

    const previous = findPreviousWorkout();

    if (!previous) return;

    weightInput.value = previous.weight;
    repsInput.value = previous.reps;
    setsInput.value = previous.sets || 1;

    saveMessage.textContent =
        "前回の記録を入力しました！";
});


// ========================================
// トレーニング記録の保存
// ========================================

form.addEventListener("submit", event => {

    event.preventDefault();

    const bodyPart = bodyPartSelect.value;
    const exercise = exerciseSelect.value;

    const weight = Number(weightInput.value);
    const reps = Number(repsInput.value);
    const sets = Number(setsInput.value);

    const date = dateInput.value;

    const memo =
        document.getElementById("memo").value.trim();

    if (
        !bodyPart ||
        !exercise ||
        !date ||
        !Number.isFinite(weight) ||
        weight < 0 ||
        !Number.isInteger(reps) ||
        reps < 1 ||
        !Number.isInteger(sets) ||
        sets < 1
    ) {
        alert("入力内容を確認してください。");
        return;
    }

    const workouts = loadWorkouts();

    workouts.push({
        id: crypto.randomUUID(),
        bodyPart,
        exercise,
        weight,
        reps,
        sets,
        date,
        memo
    });

    try {
        localStorage.setItem(
            "workouts",
            JSON.stringify(workouts)
        );

    } catch (error) {
        console.error(error);

        alert("記録を保存できませんでした。");

        return;
    }

    form.reset();

    dateInput.value = todayString();

    exerciseSelect.innerHTML =
        '<option value="">先に部位を選択してください</option>';

    exerciseSelect.disabled = true;
    copyButton.disabled = true;

    previousWorkout.hidden = true;
    workoutComparison.hidden = true;

    saveMessage.textContent =
        "トレーニングを保存しました！💪";
});