// ========================================
// MY WORKOUT LOG
// トレーニング履歴ページ
// ========================================

const STORAGE_KEY = "workouts";

const historyList = document.getElementById("historyList");
const historyCount = document.getElementById("historyCount");

const filterBodyPart = document.getElementById("filterBodyPart");
const sortOrder = document.getElementById("sortOrder");

const weeklyHistoryBtn = document.getElementById("weeklyHistoryBtn");
const allHistoryBtn = document.getElementById("allHistoryBtn");

const historySectionTitle =
    document.getElementById("historySectionTitle");

const loadMoreHistoryBtn =
    document.getElementById("loadMoreHistoryBtn");

const prevWeekBtn = document.getElementById("prevWeekBtn");
const nextWeekBtn = document.getElementById("nextWeekBtn");
const currentWeekBtn = document.getElementById("currentWeekBtn");

const weekRange = document.getElementById("weekRange");
const weeklyCalendar = document.getElementById("weeklyCalendar");

const weeklyTrainingDays =
    document.getElementById("weeklyTrainingDays");

const weeklyWorkoutCount =
    document.getElementById("weeklyWorkoutCount");

const editDialog = document.getElementById("editDialog");
const editForm = document.getElementById("editForm");

const editExerciseName =
    document.getElementById("editExerciseName");

const editWeight = document.getElementById("editWeight");
const editReps = document.getElementById("editReps");
const editSets = document.getElementById("editSets");
const editMemo = document.getElementById("editMemo");

const cancelEdit = document.getElementById("cancelEdit");


// ========================================
// ① 状態管理
// ========================================

let workouts = [];

let currentView = "weekly";

let currentWeekStart = getStartOfWeek(new Date());

let visibleCount = 20;

const PAGE_SIZE = 20;

let editingIndex = null;


// ========================================
// ② データの読み込み
// ========================================

function loadWorkouts() {

    try {

        const data = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        return Array.isArray(data) ? data : [];

    } catch (error) {

        console.error("記録の読み込みに失敗しました", error);

        return [];
    }
}


// ========================================
// ③ データの保存
// ========================================

function saveWorkouts() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(workouts)
        );

        return true;

    } catch (error) {

        console.error("記録の保存に失敗しました", error);

        alert("記録を保存できませんでした。");

        return false;
    }
}


// ========================================
// ④ 日付関連
// ========================================

function formatDate(date) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function parseDate(dateString) {

    if (
        typeof dateString !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
    ) {
        return null;
    }

    const [year, month, day] =
        dateString.split("-").map(Number);

    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;
}


function getStartOfWeek(date) {

    const result = new Date(date);

    result.setHours(0, 0, 0, 0);

    // 月曜日始まり
    const day = result.getDay();

    const difference = day === 0 ? -6 : 1 - day;

    result.setDate(result.getDate() + difference);

    return result;
}


function addDays(date, days) {

    const result = new Date(date);

    result.setDate(result.getDate() + days);

    return result;
}


// ========================================
// ⑤ 記録の整理
// ========================================

function getWorkoutBodyPart(workout) {

    return (
        workout.bodyPart ||
        workout.part ||
        workout.muscle ||
        ""
    );
}


function normalizeBodyPart(part) {

    if (part === "腹") {
        return "腹筋";
    }

    return part;
}


function getWorkoutReps(workout) {

    return workout.reps ?? workout.rep ?? 0;
}


function getWorkoutSets(workout) {

    return workout.sets ?? workout.set ?? 0;
}


function getWorkoutMemo(workout) {

    return workout.memo ?? "";
}


function getIndexedWorkouts() {

    return workouts
        .map((workout, index) => ({
            workout,
            index
        }))
        .filter(item => {

            return (
                item.workout &&
                typeof item.workout === "object" &&
                parseDate(item.workout.date) !== null
            );
        });
}


// ========================================
// ⑥ 週間データ
// ========================================

function getWeeklyWorkouts() {

    const weekEnd = addDays(currentWeekStart, 6);

    return getIndexedWorkouts().filter(item => {

        const date = parseDate(item.workout.date);

        return (
            date >= currentWeekStart &&
            date <= weekEnd
        );
    });
}


// ========================================
// ⑦ 週間カレンダー
// ========================================

function renderWeeklyCalendar() {

    weeklyCalendar.innerHTML = "";

    const days = [
        "月", "火", "水", "木", "金", "土", "日"
    ];

    const weeklyRecords = getWeeklyWorkouts();

    const trainedDates = new Set(
        weeklyRecords.map(item => item.workout.date)
    );

    days.forEach((day, index) => {

        const date = addDays(currentWeekStart, index);

        const dateString = formatDate(date);

        const dayElement = document.createElement("div");

        dayElement.className = "history-calendar-day";

        if (trainedDates.has(dateString)) {

            dayElement.classList.add("is-trained");
        }

        if (dateString === formatDate(new Date())) {

            dayElement.classList.add("is-today");
        }

        const dayLabel = document.createElement("span");

        dayLabel.className = "history-calendar-weekday";

        dayLabel.textContent = day;

        const dateNumber = document.createElement("strong");

        dateNumber.className = "history-calendar-date";

        dateNumber.textContent = date.getDate();

        const status = document.createElement("span");

        status.className = "history-calendar-status";

        status.textContent = trainedDates.has(dateString)
            ? "●"
            : "−";

        dayElement.appendChild(dayLabel);
        dayElement.appendChild(dateNumber);
        dayElement.appendChild(status);

        weeklyCalendar.appendChild(dayElement);
    });
}


// ========================================
// ⑧ 週間サマリー
// ========================================

function renderWeeklySummary() {

    const weeklyRecords = getWeeklyWorkouts();

    const dates = new Set(
        weeklyRecords.map(item => item.workout.date)
    );

    weeklyTrainingDays.textContent =
        `${dates.size}日`;

    weeklyWorkoutCount.textContent =
        `${weeklyRecords.length}件`;

    const weekEnd = addDays(currentWeekStart, 6);

    weekRange.textContent =
        `${formatDate(currentWeekStart)} ～ ${formatDate(weekEnd)}`;

    renderWeeklyCalendar();
}


// ========================================
// ⑨ 表示対象の記録
// ========================================

function getFilteredWorkouts() {

    let records = currentView === "weekly"
        ? getWeeklyWorkouts()
        : getIndexedWorkouts();

    const selectedPart = filterBodyPart.value;

    // 部位で絞り込み
    if (selectedPart !== "all") {

        records = records.filter(item => {

            const part = normalizeBodyPart(
                getWorkoutBodyPart(item.workout)
            );

            return part === selectedPart;
        });
    }

    // 並び替え
    records.sort((a, b) => {

        const comparison =
            a.workout.date.localeCompare(b.workout.date);

        if (sortOrder.value === "oldest") {

            return comparison || a.index - b.index;
        }

        return -comparison || b.index - a.index;
    });

    return records;
}


// ========================================
// ⑩ 記録カード
// ========================================

function createWorkoutCard(item) {

    const workout = item.workout;

    const card = document.createElement("article");

    card.className = "history-workout-card";

    const date = document.createElement("p");

    date.className = "history-workout-date";

    date.textContent = workout.date;

    const bodyPart = document.createElement("span");

    bodyPart.className = "history-workout-part";

    bodyPart.textContent =
        normalizeBodyPart(getWorkoutBodyPart(workout)) ||
        "部位未設定";

    const exercise = document.createElement("h3");

    exercise.className = "history-workout-exercise";

    exercise.textContent =
        workout.exercise || "種目未設定";

    const details = document.createElement("p");

    details.className = "history-workout-details";

    const weight =
        workout.weight !== undefined &&
        workout.weight !== null &&
        workout.weight !== ""
            ? workout.weight
            : "未設定";

    const reps = getWorkoutReps(workout);

    const sets = getWorkoutSets(workout);

    details.textContent =
        `${weight} kg × ${reps}回 × ${sets}セット`;

    const memo = document.createElement("p");

    memo.className = "history-workout-memo";

    const memoText = getWorkoutMemo(workout);

    memo.textContent = memoText
        ? `メモ：${memoText}`
        : "";

    const actions = document.createElement("div");

    actions.className = "history-workout-actions";

    const editButton = document.createElement("button");

    editButton.type = "button";
    editButton.className = "history-card-edit-btn";
    editButton.textContent = "編集";

    editButton.addEventListener("click", () => {
        openEditDialog(item.index);
    });

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "history-card-delete-btn";
    deleteButton.textContent = "削除";

    deleteButton.addEventListener("click", () => {
        deleteWorkout(item.index);
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    card.appendChild(date);
    card.appendChild(bodyPart);
    card.appendChild(exercise);
    card.appendChild(details);

    if (memoText) {
        card.appendChild(memo);
    }

    card.appendChild(actions);

    return card;
}


// ========================================
// ⑪ 記録一覧の描画
// 日付ごとにグループ化
// ========================================

function renderHistory() {

    const records = getFilteredWorkouts();

    historyList.innerHTML = "";

    historyCount.textContent =
        `${records.length}件の記録`;

    historySectionTitle.textContent =
        currentView === "weekly"
            ? "この週の記録"
            : "すべての履歴";

    const isWeekly = currentView === "weekly";

    weeklyHistoryBtn.classList.toggle(
        "is-active",
        isWeekly
    );

    allHistoryBtn.classList.toggle(
        "is-active",
        !isWeekly
    );

    weeklyHistoryBtn.setAttribute(
        "aria-pressed",
        String(isWeekly)
    );

    allHistoryBtn.setAttribute(
        "aria-pressed",
        String(!isWeekly)
    );

    // 記録がない場合
    if (records.length === 0) {

        const empty = document.createElement("p");

        empty.className = "history-empty-message";

        empty.textContent = isWeekly
            ? "この週のトレーニング記録はありません。"
            : "表示できるトレーニング記録はありません。";

        historyList.appendChild(empty);

        loadMoreHistoryBtn.hidden = true;

        return;
    }

    // 表示する記録
    const displayedRecords = isWeekly
        ? records
        : records.slice(0, visibleCount);

    // 日付ごとにまとめる
    const groupedRecords = new Map();

    displayedRecords.forEach(item => {

        const date = item.workout.date;

        if (!groupedRecords.has(date)) {
            groupedRecords.set(date, []);
        }

        groupedRecords.get(date).push(item);
    });

    // 日付ごとに表示
    groupedRecords.forEach((items, date) => {

        // 日付グループ
        const group = document.createElement("section");

        group.className = "history-date-group";

        // 日付見出し
        const heading = document.createElement("div");

        heading.className = "history-date-heading";

        const dateTitle = document.createElement("h3");

        dateTitle.className = "history-date-title";

        const dateObject = parseDate(date);

        const weekdays = [
            "日", "月", "火", "水", "木", "金", "土"
        ];

        const weekday = dateObject
            ? weekdays[dateObject.getDay()]
            : "";

        dateTitle.textContent =
            `📅 ${date}（${weekday}）`;

        const count = document.createElement("span");

        count.className = "history-date-count";

        count.textContent = `${items.length}件`;

        heading.appendChild(dateTitle);
        heading.appendChild(count);

        // その日の記録一覧
        const grid = document.createElement("div");

        grid.className = "history-date-grid";

        items.forEach(item => {

            const card = createWorkoutCard(item);

            // カード内の日付は見出しと重複するため非表示
            const cardDate = card.querySelector(
                ".history-workout-date"
            );

            if (cardDate) {
                cardDate.remove();
            }

            grid.appendChild(card);
        });

        group.appendChild(heading);
        group.appendChild(grid);

        historyList.appendChild(group);
    });

    // もっと見る
    loadMoreHistoryBtn.hidden =
        isWeekly ||
        visibleCount >= records.length;
}
// ========================================
// ⑫ 表示切り替え
// ========================================

function changeView(view) {

    currentView = view;

    visibleCount = PAGE_SIZE;

    renderHistory();
}


weeklyHistoryBtn.addEventListener("click", () => {

    changeView("weekly");
});


allHistoryBtn.addEventListener("click", () => {

    changeView("all");
});


// ========================================
// ⑬ もっと見る
// ========================================

loadMoreHistoryBtn.addEventListener("click", () => {

    visibleCount += PAGE_SIZE;

    renderHistory();
});


// ========================================
// ⑭ 週の切り替え
// ========================================

prevWeekBtn.addEventListener("click", () => {

    currentWeekStart = addDays(currentWeekStart, -7);

    renderWeeklySummary();

    renderHistory();
});


nextWeekBtn.addEventListener("click", () => {

    currentWeekStart = addDays(currentWeekStart, 7);

    renderWeeklySummary();

    renderHistory();
});


currentWeekBtn.addEventListener("click", () => {

    currentWeekStart = getStartOfWeek(new Date());

    renderWeeklySummary();

    renderHistory();
});


// ========================================
// ⑮ フィルター
// ========================================

filterBodyPart.addEventListener("change", () => {

    visibleCount = PAGE_SIZE;

    renderHistory();
});


sortOrder.addEventListener("change", () => {

    visibleCount = PAGE_SIZE;

    renderHistory();
});


// ========================================
// ⑯ 編集
// ========================================

function openEditDialog(index) {

    const workout = workouts[index];

    if (!workout) return;

    editingIndex = index;

    editExerciseName.textContent =
        `${workout.date} / ${workout.exercise || "種目未設定"}`;

    editWeight.value = workout.weight ?? 0;

    editReps.value = getWorkoutReps(workout);

    editSets.value = getWorkoutSets(workout);

    editMemo.value = getWorkoutMemo(workout);

    editDialog.showModal();
}


editForm.addEventListener("submit", event => {

    event.preventDefault();

    if (editingIndex === null) return;

    const workout = workouts[editingIndex];

    if (!workout) return;

    const weight = Number(editWeight.value);
    const reps = Number(editReps.value);
    const sets = Number(editSets.value);

    if (
        !Number.isFinite(weight) ||
        weight < 0 ||
        !Number.isInteger(reps) ||
        reps < 1 ||
        !Number.isInteger(sets) ||
        sets < 1
    ) {
        alert("重量・回数・セット数を確認してください。");
        return;
    }

    // 元の記録を保持して必要な項目だけ変更
    const updatedWorkout = {
        ...workout,
        weight,
        memo: editMemo.value.trim()
    };

    if ("reps" in workout || !("rep" in workout)) {
        updatedWorkout.reps = reps;
    }

    if ("rep" in workout) {
        updatedWorkout.rep = reps;
    }

    if ("sets" in workout || !("set" in workout)) {
        updatedWorkout.sets = sets;
    }

    if ("set" in workout) {
        updatedWorkout.set = sets;
    }

    const previousWorkouts = workouts;

    workouts = workouts.map((item, index) =>
        index === editingIndex
            ? updatedWorkout
            : item
    );

    if (!saveWorkouts()) {
        workouts = previousWorkouts;
        return;
    }

    editDialog.close();

    editingIndex = null;

    renderWeeklySummary();

    renderHistory();
});


cancelEdit.addEventListener("click", () => {

    editDialog.close();

    editingIndex = null;
});


editDialog.addEventListener("close", () => {

    editingIndex = null;
});


// ========================================
// ⑰ 削除
// ========================================

function deleteWorkout(index) {

    const workout = workouts[index];

    if (!workout) return;

    const exerciseName =
        workout.exercise || "このトレーニング";

    const confirmed = confirm(
        `${exerciseName}の記録を削除しますか？\nこの操作は取り消せません。`
    );

    if (!confirmed) return;

    const previousWorkouts = workouts;

    workouts = workouts.filter((_, itemIndex) =>
        itemIndex !== index
    );

    if (!saveWorkouts()) {
        workouts = previousWorkouts;
        return;
    }

    renderWeeklySummary();

    renderHistory();
}


// ========================================
// ⑱ 初期表示
// ========================================

function initializeHistory() {

    workouts = loadWorkouts();

    renderWeeklySummary();

    renderHistory();
}


initializeHistory();