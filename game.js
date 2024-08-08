document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('startingPoints').value = 10;
    document.getElementById('rounds').value = 500;
    document.getElementById('factorT').value = 100;
    document.getElementById('enableLosingStreak').checked = false;
    document.getElementById('losingStreakChance').value = 7.5; // in percentage
    document.getElementById('winningMultiplier').value = 1.45;

    document.getElementById('startGameBtn').addEventListener('click', startGame);
    document.getElementById('toggleTableBtn').addEventListener('click', toggleTable);

    let chartInstance = null;
    let isSimulating = false; // Flag to check if simulation is in progress

    function startGame() {
        if (isSimulating) {
            showNotification('Please wait, there is a cooldown period.');
            return; // Prevent multiple simulations at once
        }
        isSimulating = true;
        showNotification('Simulation in progress...');
        
        // Run the simulation with a cooldown
        simulateGame().then(() => {
            isSimulating = false; // Allow new simulations after cooldown
            hideNotification();
        });
    }

    async function simulateGame() {
        const startingPoints = parseFloat(document.getElementById('startingPoints').value);
        const rounds = parseInt(document.getElementById('rounds').value);
        const factorT = parseFloat(document.getElementById('factorT').value);
        const enableLosingStreak = document.getElementById('enableLosingStreak').checked;
        const losingStreakChance = parseFloat(document.getElementById('losingStreakChance').value) / 100;
        const winningMultiplier = parseFloat(document.getElementById('winningMultiplier').value);

        let points = startingPoints;
        let roundsPlayed = 0;
        const outcomes = [];
        const gameTableBody = document.getElementById('gameTableBody');
        gameTableBody.innerHTML = ''; // Clear previous results

        while (roundsPlayed < rounds) {
            if (points <= 1) break;

            points = roundToTwoDecimals(points - 1);
            roundsPlayed += 1;

            if (enableLosingStreak && Math.random() < losingStreakChance) {
                const losingStreakLength = Math.floor(Math.random() * 11);
                for (let i = 0; i < losingStreakLength; i++) {
                    if (points <= 1) break;
                    points = roundToTwoDecimals(points - 1);
                    roundsPlayed += 1;
                    outcomes.push({ round: roundsPlayed, choice: -1, points: points });
                    gameTableBody.innerHTML += `
                        <tr>
                            <td>${roundsPlayed}</td>
                            <td>-1 (Losing Streak)</td>
                            <td>${points}</td>
                        </tr>`;
                    // Introduce a short delay between updates
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
                continue;
            }

            const cups = [winningMultiplier, winningMultiplier, -1];
            const choice = cups[Math.floor(Math.random() * cups.length)];
            points = roundToTwoDecimals(points + choice);
            outcomes.push({ round: roundsPlayed, choice: choice, points: points });
            gameTableBody.innerHTML += `
                <tr>
                    <td>${roundsPlayed}</td>
                    <td>${choice}</td>
                    <td>${points}</td>
                </tr>`;
            // Introduce a short delay between updates
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        const finalOutput = roundToTwoDecimals(points * factorT);
        document.getElementById('statistics').innerHTML = `
            <p>Starting points: ${startingPoints}</p>
            <p>Rounds played: ${roundsPlayed}</p>
            <p>Final output: ${finalOutput}</p>
        `;

        plotOutcomes(outcomes);

        // Wait for 3 seconds before allowing a new simulation
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    function roundToTwoDecimals(num) {
        return Math.round(num * 100) / 100;
    }

    function plotOutcomes(outcomes) {
        const rounds = outcomes.map(outcome => outcome.round);
        const points = outcomes.map(outcome => outcome.points);

        // Clear the previous chart if it exists
        if (chartInstance !== null) {
            chartInstance.destroy();
        }

        const ctx = document.getElementById('plot').getContext('2d');
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: rounds,
                datasets: [{
                    label: 'Points Over Time',
                    data: points,
                    borderColor: 'blue',
                    fill: false,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Round' } },
                    y: { title: { display: true, text: 'Points' } }
                }
            }
        });
    }

    function showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.remove('hidden');
    }

    function hideNotification() {
        const notification = document.getElementById('notification');
        notification.classList.add('hidden');
    }

    function toggleTable() {
        const tableContainer = document.getElementById('tableContainer');
        tableContainer.classList.toggle('collapsed');
    }
});






