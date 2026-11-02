// =====================================================
// MY WORKOUT LOG
// WORKOUT PLANNER
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // HTML要素を取得
    // =====================================

    const manualMode = document.getElementById("manualMode");
    const historyMode = document.getElementById("historyMode");

    const manualPlanner = document.getElementById("manualPlanner");
    const historyPlanner = document.getElementById("historyPlanner");

    const plannerForm = document.getElementById("plannerForm");

    const historyButton =
        document.getElementById("generateHistoryPlan");

    const plannerResult =
        document.getElementById("plannerResult");

    const resultTitle =
        document.getElementById("plannerResultTitle");

    const resultDescription =
        document.getElementById("plannerResultDescription");

    const exerciseList =
        document.getElementById("plannerExerciseList");


    // =====================================
    // トレーニングメニューデータ
    // =====================================

    const workoutMenus = {

        "胸": {
            gym: [
                { name: "ベンチプレス", reps: "8〜12回", sets: 3 },
                { name: "インクラインダンベルプレス", reps: "10回", sets: 3 },
                { name: "チェストプレス", reps: "12回", sets: 3 },
                { name: "ペックフライ", reps: "12回", sets: 2 }
            ],

            home: [
                { name: "腕立て伏せ", reps: "8〜12回", sets: 3 },
                { name: "膝つき腕立て伏せ", reps: "10回", sets: 3 },
                { name: "ワイドプッシュアップ", reps: "10回", sets: 2 }
            ]
        },

        "背中": {
            gym: [
                { name: "ラットプルダウン", reps: "10回", sets: 3 },
                { name: "シーテッドローイング", reps: "10回", sets: 3 },
                { name: "ワンハンドダンベルロー", reps: "12回", sets: 3 }
            ],

            home: [
                { name: "バックエクステンション", reps: "12回", sets: 3 },
                { name: "リバーススノーエンジェル", reps: "12回", sets: 3 },
                { name: "バードドッグ", reps: "左右10回", sets: 2 }
            ]
        },

        "脚": {
            gym: [
                { name: "スクワット", reps: "10回", sets: 3 },
                { name: "レッグプレス", reps: "12回", sets: 3 },
                { name: "レッグカール", reps: "12回", sets: 3 },
                { name: "カーフレイズ", reps: "15回", sets: 3 }
            ],

            home: [
                { name: "スクワット", reps: "15回", sets: 3 },
                { name: "ランジ", reps: "左右10回", sets: 3 },
                { name: "グルートブリッジ", reps: "15回", sets: 3 }
            ]
        },

        "肩": {
            gym: [
                { name: "ショルダープレス", reps: "10回", sets: 3 },
                { name: "サイドレイズ", reps: "12回", sets: 3 },
                { name: "リアレイズ", reps: "12回", sets: 3 }
            ],

            home: [
                { name: "パイクプッシュアップ", reps: "8回", sets: 3 },
                { name: "アームサークル", reps: "20回", sets: 2 },
                { name: "ウォールプッシュアップ", reps: "12回", sets: 2 }
            ]
        },

        "腕": {
            gym: [
                { name: "ダンベルカール", reps: "12回", sets: 3 },
                { name: "ハンマーカール", reps: "12回", sets: 3 },
                { name: "ケーブルプレスダウン", reps: "12回", sets: 3 }
            ],

            home: [
                { name: "ナロープッシュアップ", reps: "8回", sets: 3 },
                { name: "膝つきナロープッシュアップ", reps: "10回", sets: 2 },
                { name: "プランクショルダータップ", reps: "左右10回", sets: 2 }
            ]
        },

        "腹筋": {
            gym: [
                { name: "ケーブルクランチ", reps: "12回", sets: 3 },
                { name: "レッグレイズ", reps: "12回", sets: 3 },
                { name: "プランク", reps: "30秒", sets: 3 }
            ],

            home: [
                { name: "クランチ", reps: "15回", sets: 3 },
                { name: "レッグレイズ", reps: "12回", sets: 3 },
                { name: "プランク", reps: "30秒", sets: 3 }
            ]
        },

        "お尻": {
            gym: [
                { name: "ヒップスラスト", reps: "12回", sets: 3 },
                { name: "ブルガリアンスクワット", reps: "左右10回", sets: 3 },
                { name: "ヒップアブダクション", reps: "15回", sets: 3 }
            ],

            home: [
                { name: "グルートブリッジ", reps: "15回", sets: 3 },
                { name: "ドンキーキック", reps: "左右12回", sets: 3 },
                { name: "スクワット", reps: "15回", sets: 3 }
            ]
        }

    };


    // =====================================
    // 保存済みの記録を読み込む
    // =====================================

    function loadWorkouts() {

        try {

            const data = JSON.parse(
                localStorage.getItem("workouts") || "[]"
            );

            return Array.isArray(data) ? data : [];

        } catch (error) {

            console.error("履歴の読み込みに失敗:", error);

            return [];

        }

    }


    // =====================================
    // 今日の日付
    // =====================================

    function todayString() {

        const today = new Date();

        const year = today.getFullYear();

        const month =
            String(today.getMonth() + 1).padStart(2, "0");

        const day =
            String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;

    }


    // =====================================
    // 日付の差を計算
    // =====================================

    function daysSince(dateString) {

        const today = new Date(`${todayString()}T00:00:00`);

        const date = new Date(`${dateString}T00:00:00`);

        return Math.floor(
            (today - date) / (1000 * 60 * 60 * 24)
        );

    }


    // =====================================
    // モード切り替え
    // =====================================

    function openMode(mode) {

        manualPlanner.hidden = mode !== "manual";

        historyPlanner.hidden = mode !== "history";

        plannerResult.hidden = true;

        const target =
            mode === "manual"
                ? manualPlanner
                : historyPlanner;

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    manualMode.addEventListener("click", () => {
        openMode("manual");
    });

    historyMode.addEventListener("click", () => {
        openMode("history");
    });


    // =====================================
    // 最近鍛えていない部位を探す
    // =====================================

    function recommendBodyPart(workouts) {

        const bodyParts = Object.keys(workoutMenus);

        const latestDates = {};

        bodyParts.forEach(part => {

            latestDates[part] = null;

        });

        workouts.forEach(workout => {

            const part = workout.bodyPart;

            if (!bodyParts.includes(part)) return;

            if (
                !latestDates[part] ||
                workout.date > latestDates[part]
            ) {

                latestDates[part] = workout.date;

            }

        });

        // 最も長く鍛えていない部位を優先
        bodyParts.sort((a, b) => {

            const dateA = latestDates[a] || "0000-00-00";

            const dateB = latestDates[b] || "0000-00-00";

            return dateA.localeCompare(dateB);

        });

        return {
            part: bodyParts[0],
            latestDate: latestDates[bodyParts[0]]
        };

    }


    // =====================================
    // 時間に合わせてメニューを調整
    // =====================================

    function adjustMenuByTime(menu, minutes) {

        let count;

        if (minutes <= 20) {
            count = 2;
        } else if (minutes <= 45) {
            count = 3;
        } else {
            count = 4;
        }

        return menu.slice(0, count);

    }


    // =====================================
    // 目的に合わせて調整
    // =====================================

    function adjustMenuByGoal(menu, goal) {

        return menu.map(exercise => {

            const item = { ...exercise };

            if (goal === "health") {

                item.sets = Math.min(item.sets, 2);

            } else if (goal === "diet") {

                item.sets = Math.min(item.sets, 3);

            }

            return item;

        });

    }


    // =====================================
    // メニューを画面に表示
    // =====================================

    function showResult(title, description, menu) {

        resultTitle.textContent = title;

        resultDescription.textContent = description;

        exerciseList.replaceChildren();

        menu.forEach((exercise, index) => {

            const card = document.createElement("article");

            card.className = "planner-exercise-card";

            const heading = document.createElement("h3");

            heading.textContent =
                `${index + 1}. ${exercise.name}`;

            const reps = document.createElement("p");

            reps.textContent =
                `💪 回数：${exercise.reps}`;

            const sets = document.createElement("p");

            sets.textContent =
                `🔄 セット数：${exercise.sets}セット`;

            card.append(heading, reps, sets);

            exerciseList.appendChild(card);

        });

        plannerResult.hidden = false;

        plannerResult.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    // =====================================
    // A：自分で条件を選んで作成
    // =====================================

    plannerForm.addEventListener("submit", event => {

        event.preventDefault();

        const goal =
            document.getElementById("plannerGoal").value;

        const place =
            document.getElementById("plannerPlace").value;

        const time =
            Number(document.getElementById("plannerTime").value);

        let bodyPart =
            document.getElementById("plannerBodyPart").value;

        if (!goal || !place || !time || !bodyPart) {

            alert("すべての項目を選択してください。");

            return;

        }

        if (bodyPart === "auto") {

            const workouts = loadWorkouts();

            bodyPart =
                recommendBodyPart(workouts).part;

        }

        const originalMenu =
            workoutMenus[bodyPart][place];

        const timeAdjustedMenu =
            adjustMenuByTime(originalMenu, time);

        const finalMenu =
            adjustMenuByGoal(timeAdjustedMenu, goal);

        const goalLabels = {
            muscle: "筋肉を大きくする",
            diet: "脂肪を減らす",
            health: "運動習慣をつける"
        };

        showResult(
            `💪 今日のおすすめ：${bodyPart}`,
            `${goalLabels[goal]}目的に合わせたメニューです。無理のない範囲で取り組みましょう！`,
            finalMenu
        );

    });


    // =====================================
    // B：履歴から自動提案
    // =====================================

    historyButton.addEventListener("click", () => {

        const fatigue =
            document.getElementById("historyFatigue").value;

        // 疲れている場合は休息を提案
        if (fatigue === "tired") {

            showResult(
                "🌿 今日は休息もおすすめ！",
                "疲れや筋肉痛がある日は、無理に鍛えず回復を優先しましょう。軽い散歩やストレッチもおすすめです。",
                []
            );

            return;

        }

        const workouts = loadWorkouts();

        if (workouts.length === 0) {

            showResult(
                "🌱 まずは筋トレを始めよう！",
                "まだトレーニング履歴がありません。最初は無理のない全身メニューから始めましょう。",
                [
                    {
                        name: "スクワット",
                        reps: "10回",
                        sets: 2
                    },
                    {
                        name: "腕立て伏せ",
                        reps: "5〜10回",
                        sets: 2
                    },
                    {
                        name: "クランチ",
                        reps: "10回",
                        sets: 2
                    }
                ]
            );

            return;

        }

        const recommendation =
            recommendBodyPart(workouts);

        const part = recommendation.part;

        let description =
            `最近のトレーニング履歴を分析し、${part}をおすすめします。`;

        if (recommendation.latestDate) {

            const days =
                daysSince(recommendation.latestDate);

            description +=
                ` ${part}を最後に鍛えたのは${days}日前です。`;

        } else {

            description +=
                ` ${part}の記録はまだありません。`;

        }

        if (fatigue === "normal") {

            description +=
                " 今日は無理のない重量で取り組みましょう。";

        }

        const menu =
            workoutMenus[part].gym;

        showResult(
            `🔥 今日のおすすめ：${part}`,
            description,
            menu
        );

    });

});